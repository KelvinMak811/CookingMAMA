import { dbGetRow, dbSaveRow, ensureSyncTables } from "@/lib/db";

export const SYNC_VALID_ACCOUNTS = ["kelvin", "yuetsum"] as const;
export type AccountId = (typeof SYNC_VALID_ACCOUNTS)[number];

export const SYNC_USER_KEYS = ["shopping", "cooking_log", "meal_plan"] as const;
export type SyncUserKey = (typeof SYNC_USER_KEYS)[number];

export const SYNC_SHARED_CUSTOM = "custom_recipes";

export interface SyncEntry {
  payload: unknown;
  updated_at: string;
  source?: "client" | "server";
}

export interface SyncPayload {
  account_id: string;
  data: Partial<Record<SyncUserKey, SyncEntry | null>>;
  custom_recipes: SyncEntry | null;
}

function validateAccount(accountId: string): asserts accountId is AccountId {
  if (!SYNC_VALID_ACCOUNTS.includes(accountId as AccountId)) {
    throw new Error("Invalid account");
  }
}

function parseTime(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

async function mergeRow(
  scope: string,
  dataKey: string,
  clientPayload: unknown | null,
  clientUpdatedAt: string | null
): Promise<SyncEntry | null> {
  const server = await dbGetRow(scope, dataKey);
  const serverTime = server ? parseTime(server.updated_at) : 0;
  const clientTime = parseTime(clientUpdatedAt);

  if (
    clientPayload !== null &&
    clientUpdatedAt !== null &&
    clientTime >= serverTime
  ) {
    await dbSaveRow(scope, dataKey, clientPayload, clientUpdatedAt);
    return { payload: clientPayload, updated_at: clientUpdatedAt, source: "client" };
  }

  if (server !== null) {
    return {
      payload: server.payload,
      updated_at: server.updated_at,
      source: "server",
    };
  }

  return null;
}

export async function syncFetchAccount(accountId: string): Promise<SyncPayload> {
  await ensureSyncTables();
  validateAccount(accountId);

  const out: SyncPayload = {
    account_id: accountId,
    data: {},
    custom_recipes: null,
  };

  for (const key of SYNC_USER_KEYS) {
    const row = await dbGetRow(accountId, key);
    if (row) {
      out.data[key] = { payload: row.payload, updated_at: row.updated_at };
    }
  }

  const shared = await dbGetRow("shared", SYNC_SHARED_CUSTOM);
  if (shared) {
    out.custom_recipes = { payload: shared.payload, updated_at: shared.updated_at };
  }

  return out;
}

export async function syncApplyClient(
  accountId: string,
  body: {
    data?: Record<string, { payload?: unknown; updated_at?: string }>;
    custom_recipes?: { payload?: unknown; updated_at?: string } | null;
  }
): Promise<SyncPayload> {
  await ensureSyncTables();
  validateAccount(accountId);

  const merged: SyncPayload = {
    account_id: accountId,
    data: {},
    custom_recipes: null,
  };

  const clientData = body.data;
  if (clientData && typeof clientData === "object") {
    for (const key of SYNC_USER_KEYS) {
      const entry = clientData[key];
      if (!entry || typeof entry !== "object") continue;
      const payload = entry.payload;
      const updatedAt =
        typeof entry.updated_at === "string" ? entry.updated_at : null;
      if (payload === undefined || updatedAt === null) continue;
      merged.data[key] = await mergeRow(accountId, key, payload, updatedAt);
    }
  }

  if (body.custom_recipes && typeof body.custom_recipes === "object") {
    const entry = body.custom_recipes;
    const payload = entry.payload;
    const updatedAt =
      typeof entry.updated_at === "string" ? entry.updated_at : null;
    if (payload !== undefined && updatedAt !== null) {
      merged.custom_recipes = await mergeRow(
        "shared",
        SYNC_SHARED_CUSTOM,
        payload,
        updatedAt
      );
    }
  }

  return merged;
}
