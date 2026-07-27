import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS, createUserScopedStorage } from "@/lib/storage";
import { getCurrentUserIdSync } from "@/stores/accountStore";
import { generateId } from "@/lib/utils";
import type { FoodLogEntry } from "@/lib/nutritionStats";

interface NutritionState {
  entries: FoodLogEntry[];
  addEntry: (entry: Omit<FoodLogEntry, "id">) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, patch: Partial<FoodLogEntry>) => void;
}

const userStorage = createUserScopedStorage(
  STORAGE_KEYS.NUTRITION,
  getCurrentUserIdSync
);

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => {
        const row: FoodLogEntry = { ...entry, id: generateId() };
        set((s) => ({ entries: [row, ...s.entries] }));
      },
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
    }),
    {
      name: STORAGE_KEYS.NUTRITION,
      storage: createJSONStorage(() => userStorage),
    }
  )
);
