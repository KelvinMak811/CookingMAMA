import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface SyncRow {
  scope: string;
  data_key: string;
  payload: string;
  updated_at: string;
}

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "smartcook-data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sync-db.json");

let fileCache: SyncRow[] | null = null;

function hasPostgres(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

async function readFileRows(): Promise<SyncRow[]> {
  if (fileCache) return fileCache;
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as SyncRow[];
    fileCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    fileCache = [];
  }
  return fileCache;
}

async function writeFileRows(rows: SyncRow[]): Promise<void> {
  fileCache = rows;
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function ensureSyncTables(): Promise<void> {
  if (!hasPostgres()) return;

  const { sql } = await import("@vercel/postgres");
  await sql`
    CREATE TABLE IF NOT EXISTS user_sync_data (
      scope TEXT NOT NULL,
      data_key TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (scope, data_key)
    )
  `;
}

export async function dbGetRow(
  scope: string,
  dataKey: string
): Promise<{ payload: unknown; updated_at: string } | null> {
  if (hasPostgres()) {
    const { sql } = await import("@vercel/postgres");
    const { rows } = await sql<{ payload: string; updated_at: string }>`
      SELECT payload, updated_at FROM user_sync_data
      WHERE scope = ${scope} AND data_key = ${dataKey}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    let payload: unknown = null;
    try {
      payload = JSON.parse(row.payload);
    } catch {
      payload = null;
    }
    return { payload, updated_at: row.updated_at };
  }

  const all = await readFileRows();
  const row = all.find((r) => r.scope === scope && r.data_key === dataKey);
  if (!row) return null;
  let payload: unknown = null;
  try {
    payload = JSON.parse(row.payload);
  } catch {
    payload = null;
  }
  return { payload, updated_at: row.updated_at };
}

export async function dbSaveRow(
  scope: string,
  dataKey: string,
  payload: unknown,
  updatedAt: string
): Promise<void> {
  const payloadStr = JSON.stringify(payload);

  if (hasPostgres()) {
    const { sql } = await import("@vercel/postgres");
    await sql`
      INSERT INTO user_sync_data (scope, data_key, payload, updated_at)
      VALUES (${scope}, ${dataKey}, ${payloadStr}, ${updatedAt})
      ON CONFLICT (scope, data_key)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at
    `;
    return;
  }

  const all = await readFileRows();
  const idx = all.findIndex((r) => r.scope === scope && r.data_key === dataKey);
  const row: SyncRow = {
    scope,
    data_key: dataKey,
    payload: payloadStr,
    updated_at: updatedAt,
  };
  if (idx >= 0) all[idx] = row;
  else all.push(row);
  await writeFileRows(all);
}
