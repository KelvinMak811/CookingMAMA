/**
 * 數據持久化層 — localStorage + 雲端同步（/api/sync）
 */

export const STORAGE_KEY_CURRENT_USER = "smartcook_current_user";
export const SYNC_META_SUFFIX = "_cloud_meta";

export const STORAGE_KEYS = {
  SHOPPING: "smartcook_shopping",
  COOKING_LOG: "smartcook_cooking_log",
  MEAL_PLAN: "smartcook_meal_plan",
  CUSTOM_RECIPES: "smartcook_custom_recipes",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const LEGACY_KEYS = { ...STORAGE_KEYS };

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function userStorageKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`;
}

export function storageKeyToSyncKey(
  localKey: string
): "shopping" | "cooking_log" | "meal_plan" | "custom_recipes" | null {
  if (localKey === STORAGE_KEYS.SHOPPING) return "shopping";
  if (localKey === STORAGE_KEYS.COOKING_LOG) return "cooking_log";
  if (localKey === STORAGE_KEYS.MEAL_PLAN) return "meal_plan";
  if (localKey === STORAGE_KEYS.CUSTOM_RECIPES) return "custom_recipes";
  return null;
}

export function getLocalPayload(localKey: string): unknown | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(localKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getLocalUpdatedAt(localKey: string): string | null {
  if (!isBrowser()) return null;
  const metaRaw = localStorage.getItem(localKey + SYNC_META_SUFFIX);
  if (metaRaw) {
    try {
      const meta = JSON.parse(metaRaw) as { updated_at?: string };
      if (meta.updated_at) return meta.updated_at;
    } catch {
      /* ignore */
    }
  }
  return getLocalPayload(localKey) ? new Date().toISOString() : null;
}

export function touchLocalMeta(localKey: string): string {
  const updatedAt = new Date().toISOString();
  if (!isBrowser()) return updatedAt;
  localStorage.setItem(
    localKey + SYNC_META_SUFFIX,
    JSON.stringify({ updated_at: updatedAt })
  );
  return updatedAt;
}

export function applyPayloadToLocal(
  localKey: string,
  payload: unknown,
  updatedAt?: string
): void {
  if (!isBrowser() || !payload || typeof payload !== "object") return;
  localStorage.setItem(localKey, JSON.stringify(payload));
  localStorage.setItem(
    localKey + SYNC_META_SUFFIX,
    JSON.stringify({ updated_at: updatedAt ?? new Date().toISOString() })
  );
}

export function loadZustandState<T>(key: string, fallback: T): T {
  const payload = getLocalPayload(key);
  if (!payload || typeof payload !== "object") return fallback;
  const parsed = payload as { state?: T };
  if (parsed.state !== undefined) return parsed.state;
  return payload as T;
}

export function saveZustandState<T>(key: string, state: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify({ state, version: 0 }));
  touchLocalMeta(key);
}

export function migrateLegacyData(targetUserId: string): void {
  if (!isBrowser() || !targetUserId) return;
  const pairs: [string, string, object][] = [
    [LEGACY_KEYS.SHOPPING, STORAGE_KEYS.SHOPPING, { items: [] }],
    [LEGACY_KEYS.COOKING_LOG, STORAGE_KEYS.COOKING_LOG, { records: [] }],
    [LEGACY_KEYS.MEAL_PLAN, STORAGE_KEYS.MEAL_PLAN, { plans: [] }],
  ];
  for (const [legacyKey, baseKey, fallback] of pairs) {
    const userKey = userStorageKey(baseKey, targetUserId);
    if (localStorage.getItem(userKey)) continue;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) continue;
    localStorage.setItem(userKey, legacyRaw);
    localStorage.removeItem(legacyKey);
  }
}

/** 讀取指定用戶嘅 Zustand persist 狀態（用於只讀檢視） */
export function loadUserPersistState<T>(
  baseKey: StorageKey,
  userId: string,
  fallback: T
): T {
  return loadZustandState(userStorageKey(baseKey, userId), fallback);
}

export function createUserScopedStorage(baseKey: StorageKey, getUserId: () => string | null) {
  return {
    getItem: (): string | null => {
      if (!isBrowser()) return null;
      const userId = getUserId();
      if (!userId) return null;
      return localStorage.getItem(userStorageKey(baseKey, userId));
    },
    setItem: (_name: string, value: string): void => {
      if (!isBrowser()) return;
      const userId = getUserId();
      if (!userId) return;
      const key = userStorageKey(baseKey, userId);
      localStorage.setItem(key, value);
      touchLocalMeta(key);
    },
    removeItem: (): void => {
      if (!isBrowser()) return;
      const userId = getUserId();
      if (!userId) return;
      localStorage.removeItem(userStorageKey(baseKey, userId));
    },
  };
}

export function createLocalStorageAdapter() {
  return {
    getItem: (name: string): string | null => {
      if (!isBrowser()) return null;
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
      if (!isBrowser()) return;
      localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
      if (!isBrowser()) return;
      localStorage.removeItem(name);
    },
  };
}
