/**
 * 數據持久化層 — 目前使用 localStorage，
 * 日後可替換為 Supabase / REST API 而無需改動業務邏輯。
 */

export const STORAGE_KEYS = {
  SHOPPING: "smartcook_shopping",
  COOKING_LOG: "smartcook_cooking_log",
  MEAL_PLAN: "smartcook_meal_plan",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export async function fetchData<T>(key: StorageKey, fallback: T): Promise<T> {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveData<T>(key: StorageKey, data: T): Promise<void> {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
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
