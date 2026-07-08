import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CookingRecord } from "@/types";
import { STORAGE_KEYS, createUserScopedStorage } from "@/lib/storage";
import { syncPushNow } from "@/lib/cloud-sync";
import { getCurrentUserIdSync } from "@/stores/accountStore";
import { generateId } from "@/lib/utils";

interface CookingLogState {
  records: CookingRecord[];
  addRecord: (
    recipeId: string,
    recipeName: string,
    rating?: number,
    cookedDate?: Date | string
  ) => void;
  updateRating: (id: string, rating: number) => void;
  removeRecord: (id: string) => void;
  getRecordsByDate: (date: Date) => CookingRecord[];
}

const userStorage = createUserScopedStorage(STORAGE_KEYS.COOKING_LOG, getCurrentUserIdSync);

const storageWithSync = {
  getItem: userStorage.getItem,
  setItem: (name: string, value: string) => {
    userStorage.setItem(name, value);
    void syncPushNow();
  },
  removeItem: userStorage.removeItem,
};

export const useCookingLogStore = create<CookingLogState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (recipeId, recipeName, rating, cookedDate) => {
        const date = cookedDate ? new Date(cookedDate) : new Date();
        const newRecord: CookingRecord = {
          id: generateId(),
          recipeId,
          recipeName,
          cookedDate: date.toISOString(),
          rating,
        };
        set((state) => ({ records: [newRecord, ...state.records] }));
      },

      updateRating: (id, rating) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, rating } : r
          ),
        })),

      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      getRecordsByDate: (date) =>
        get().records.filter((r) => {
          const d = new Date(r.cookedDate);
          return (
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
          );
        }),
    }),
    {
      name: STORAGE_KEYS.COOKING_LOG,
      storage: createJSONStorage(() => storageWithSync),
    }
  )
);

export async function rehydrateCookingLogStore(): Promise<void> {
  await useCookingLogStore.persist.rehydrate();
}
