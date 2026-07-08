import type { AccountId } from "@/lib/accounts";
import { ACCOUNTS } from "@/lib/accounts";
import {
  applyPayloadToLocal,
  getLocalPayload,
  getLocalUpdatedAt,
  STORAGE_KEYS,
  storageKeyToSyncKey,
  touchLocalMeta,
  userStorageKey,
} from "@/lib/storage";

const DEBOUNCE_MS = 800;

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let getCurrentUserId: () => AccountId | null = () => null;
let onSyncApplied: (() => void) | null = null;

export function configureCloudSync(options: {
  getCurrentUserId: () => AccountId | null;
  onApplied?: () => void;
}) {
  getCurrentUserId = options.getCurrentUserId;
  onSyncApplied = options.onApplied ?? null;
}

function collectAccountSyncPayload(accountId: AccountId) {
  const data: Record<string, { payload: unknown; updated_at: string }> = {};

  const pairs: [typeof STORAGE_KEYS.SHOPPING | typeof STORAGE_KEYS.COOKING_LOG | typeof STORAGE_KEYS.MEAL_PLAN, string][] = [
    [STORAGE_KEYS.SHOPPING, userStorageKey(STORAGE_KEYS.SHOPPING, accountId)],
    [STORAGE_KEYS.COOKING_LOG, userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId)],
    [STORAGE_KEYS.MEAL_PLAN, userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId)],
  ];

  for (const [syncName, localKey] of pairs) {
    const payload = getLocalPayload(localKey);
    if (!payload) continue;
    const key = storageKeyToSyncKey(syncName);
    if (!key) continue;
    data[key] = {
      payload,
      updated_at: getLocalUpdatedAt(localKey) ?? new Date().toISOString(),
    };
  }

  const customPayload = getLocalPayload(STORAGE_KEYS.CUSTOM_RECIPES);
  const customRecipes = customPayload
    ? {
        payload: customPayload,
        updated_at:
          getLocalUpdatedAt(STORAGE_KEYS.CUSTOM_RECIPES) ?? new Date().toISOString(),
      }
    : null;

  return { account_id: accountId, data, custom_recipes: customRecipes };
}

function applyServerSync(sync: {
  account_id?: string;
  data?: Record<string, { payload?: unknown; updated_at?: string }>;
  custom_recipes?: { payload?: unknown; updated_at?: string } | null;
}): boolean {
  if (!sync?.account_id) return false;
  let changed = false;
  const accountId = sync.account_id;

  const map = {
    shopping: userStorageKey(STORAGE_KEYS.SHOPPING, accountId),
    cooking_log: userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId),
    meal_plan: userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId),
  } as const;

  for (const [key, localKey] of Object.entries(map)) {
    const entry = sync.data?.[key];
    if (!entry?.payload) continue;
    const serverTime = entry.updated_at ? Date.parse(entry.updated_at) : 0;
    const localTime = Date.parse(getLocalUpdatedAt(localKey) ?? "0") || 0;
    if (serverTime >= localTime) {
      applyPayloadToLocal(localKey, entry.payload, entry.updated_at);
      changed = true;
    }
  }

  if (sync.custom_recipes?.payload) {
    const entry = sync.custom_recipes;
    const serverTime = entry.updated_at ? Date.parse(entry.updated_at) : 0;
    const localTime =
      Date.parse(getLocalUpdatedAt(STORAGE_KEYS.CUSTOM_RECIPES) ?? "0") || 0;
    if (serverTime >= localTime) {
      applyPayloadToLocal(STORAGE_KEYS.CUSTOM_RECIPES, entry.payload, entry.updated_at);
      changed = true;
    }
  }

  return changed;
}

async function cloudSyncRequest(accountId: AccountId) {
  const body = collectAccountSyncPayload(accountId);
  const res = await fetch("/api/sync/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    sync?: Parameters<typeof applyServerSync>[0];
  };
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Sync failed");
  }
  return json.sync;
}

export async function syncPullAccount(accountId: AccountId): Promise<boolean> {
  try {
    const sync = await cloudSyncRequest(accountId);
    const changed = sync ? applyServerSync(sync) : false;
    if (changed) onSyncApplied?.();
    return changed;
  } catch {
    return false;
  }
}

export function scheduleCloudSync(): void {
  const accountId = getCurrentUserId();
  if (!accountId) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    cloudSyncRequest(accountId)
      .then((sync) => {
        if (sync && applyServerSync(sync)) onSyncApplied?.();
      })
      .catch(() => {});
  }, DEBOUNCE_MS);
}

export async function syncOnAppLoad(): Promise<void> {
  const accountId = getCurrentUserId();
  if (!accountId) return;
  await syncPullAccount(accountId);
}

export function exportUserBackup(): void {
  const currentUser = getCurrentUserId();
  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    current_user: currentUser,
    accounts: {} as Record<string, Record<string, unknown>>,
    custom_recipes: getLocalPayload(STORAGE_KEYS.CUSTOM_RECIPES),
  };

  for (const accountId of Object.keys(ACCOUNTS)) {
    backup.accounts[accountId] = {
      shopping: getLocalPayload(userStorageKey(STORAGE_KEYS.SHOPPING, accountId)),
      cooking_log: getLocalPayload(userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId)),
      meal_plan: getLocalPayload(userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId)),
    };
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `smartcook-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importUserBackup(file: File): Promise<void> {
  const { ACCOUNTS, isAccountId } = await import("@/lib/accounts");
  const text = await file.text();
  const backup = JSON.parse(text) as {
    accounts?: Record<string, Record<string, unknown>>;
    custom_recipes?: unknown;
    exported_at?: string;
  };

  if (!backup?.accounts) throw new Error("Invalid backup file");

  for (const [accountId, data] of Object.entries(backup.accounts)) {
    if (!isAccountId(accountId) || !data) continue;
    const exportedAt = backup.exported_at ?? new Date().toISOString();
    if (data.shopping) {
      applyPayloadToLocal(
        userStorageKey(STORAGE_KEYS.SHOPPING, accountId),
        data.shopping,
        exportedAt
      );
    }
    if (data.cooking_log) {
      applyPayloadToLocal(
        userStorageKey(STORAGE_KEYS.COOKING_LOG, accountId),
        data.cooking_log,
        exportedAt
      );
    }
    if (data.meal_plan) {
      applyPayloadToLocal(
        userStorageKey(STORAGE_KEYS.MEAL_PLAN, accountId),
        data.meal_plan,
        exportedAt
      );
    }
  }

  if (backup.custom_recipes) {
    applyPayloadToLocal(
      STORAGE_KEYS.CUSTOM_RECIPES,
      backup.custom_recipes,
      backup.exported_at ?? new Date().toISOString()
    );
  }

  scheduleCloudSync();
  onSyncApplied?.();
}
