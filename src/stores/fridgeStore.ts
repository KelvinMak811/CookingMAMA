import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FridgeItem } from "@/types";
import { STORAGE_KEYS, createUserScopedStorage } from "@/lib/storage";
import { scheduleCloudSync } from "@/lib/cloud-sync";
import { getCurrentUserIdSync } from "@/stores/accountStore";
import { generateId } from "@/lib/utils";
import { mergeAmountStrings } from "@/lib/ingredientAmount";
import { normalizeIngredientName } from "@/lib/ingredientAmount";

interface FridgeState {
  items: FridgeItem[];
  addFromPurchase: (ingredientName: string, amount?: string) => void;
  addManual: (ingredientName: string, amount: string) => void;
  updateAmount: (id: string, amount: string) => void;
  removeItem: (id: string) => void;
  getItems: () => FridgeItem[];
}

function mergeIntoItems(
  items: FridgeItem[],
  ingredientName: string,
  amount: string,
  source: FridgeItem["source"]
): FridgeItem[] {
  const trimmedName = ingredientName.trim();
  const trimmedAmount = amount.trim() || "適量";
  if (!trimmedName) return items;

  const key = normalizeIngredientName(trimmedName);
  const existing = items.find(
    (item) => normalizeIngredientName(item.ingredientName) === key
  );

  if (!existing) {
    return [
      {
        id: generateId(),
        ingredientName: trimmedName,
        amount: trimmedAmount,
        updatedAt: new Date().toISOString(),
        source,
      },
      ...items,
    ];
  }

  return items.map((item) => {
    if (item.id !== existing.id) return item;
    return {
      ...item,
      amount: mergeAmountStrings([item.amount, trimmedAmount]),
      updatedAt: new Date().toISOString(),
      source: item.source ?? source,
    };
  });
}

const userStorage = createUserScopedStorage(STORAGE_KEYS.FRIDGE, getCurrentUserIdSync);

const storageWithSync = {
  getItem: userStorage.getItem,
  setItem: (name: string, value: string) => {
    userStorage.setItem(name, value);
    scheduleCloudSync();
  },
  removeItem: userStorage.removeItem,
};

export const useFridgeStore = create<FridgeState>()(
  persist(
    (set, get) => ({
      items: [],

      addFromPurchase: (ingredientName, amount) => {
        set((state) => ({
          items: mergeIntoItems(
            state.items,
            ingredientName,
            amount ?? "適量",
            "shopping"
          ),
        }));
      },

      addManual: (ingredientName, amount) => {
        set((state) => ({
          items: mergeIntoItems(state.items, ingredientName, amount, "manual"),
        }));
      },

      updateAmount: (id, amount) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, amount: amount.trim(), updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      getItems: () => get().items,
    }),
    {
      name: STORAGE_KEYS.FRIDGE,
      storage: createJSONStorage(() => storageWithSync),
    }
  )
);

export async function rehydrateFridgeStore(): Promise<void> {
  await useFridgeStore.persist.rehydrate();
}
