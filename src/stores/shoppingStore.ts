import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShoppingItem } from "@/types";
import { STORAGE_KEYS, createLocalStorageAdapter } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { migrateShoppingItem, shoppingItemKey } from "@/lib/shoppingUtils";

interface ShoppingState {
  items: ShoppingItem[];
  addItem: (name: string, amount?: string) => void;
  addIngredientsFromRecipe: (
    ingredients: { name: string; amount: string }[],
    recipeId: string,
    recipeName: string,
    existingItems: ShoppingItem[]
  ) => number;
  toggleBought: (id: string) => void;
  updatePrice: (id: string, price: number) => void;
  removeItem: (id: string) => void;
  getUnboughtItems: () => ShoppingItem[];
  getBoughtTotal: () => number;
}

function normalizeItems(items: ShoppingItem[]): ShoppingItem[] {
  return items.map(migrateShoppingItem);
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (name, amount) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const newItem: ShoppingItem = {
          id: generateId(),
          ingredientName: trimmed,
          amount: amount?.trim() || undefined,
          isBought: false,
          price: 0,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
      },

      addIngredientsFromRecipe: (ingredients, recipeId, recipeName, existingItems) => {
        const existing = new Set(
          normalizeItems(existingItems).map((i) => shoppingItemKey(i))
        );
        const toAdd = ingredients.filter(
          (ing) =>
            !existing.has(
              shoppingItemKey({
                ingredientName: ing.name,
                amount: ing.amount,
                recipeId,
              })
            )
        );
        const newItems: ShoppingItem[] = toAdd.map((ing) => ({
          id: generateId(),
          ingredientName: ing.name,
          amount: ing.amount,
          recipeId,
          recipeName,
          isBought: false,
          price: 0,
          addedAt: new Date().toISOString(),
        }));
        if (newItems.length > 0) {
          set((state) => ({
            items: [...newItems, ...normalizeItems(state.items)],
          }));
        }
        return newItems.length;
      },

      toggleBought: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const nextBought = !item.isBought;
            return {
              ...item,
              isBought: nextBought,
              boughtAt: nextBought ? new Date().toISOString() : undefined,
            };
          }),
        })),

      updatePrice: (id, price) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, price: Math.max(0, price) } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      getUnboughtItems: () => normalizeItems(get().items).filter((item) => !item.isBought),

      getBoughtTotal: () =>
        normalizeItems(get().items)
          .filter((item) => item.isBought)
          .reduce((sum, item) => sum + item.price, 0),
    }),
    {
      name: STORAGE_KEYS.SHOPPING,
      storage: createJSONStorage(() => createLocalStorageAdapter()),
      merge: (persisted, current) => {
        const state = persisted as ShoppingState | undefined;
        if (state?.items) {
          state.items = normalizeItems(state.items);
        }
        return { ...current, ...state };
      },
    }
  )
);
