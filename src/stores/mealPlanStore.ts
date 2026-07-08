import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MealPlan } from "@/types";
import { STORAGE_KEYS, createUserScopedStorage } from "@/lib/storage";
import { syncPushNow } from "@/lib/cloud-sync";
import { getCurrentUserIdSync } from "@/stores/accountStore";
import { generateId } from "@/lib/utils";
import { isSameDay } from "@/lib/utils";

interface MealPlanState {
  plans: MealPlan[];
  addPlan: (
    recipeId: string,
    recipeName: string,
    plannedDate: Date | string,
    servings?: number,
    mealBatches?: number
  ) => void;
  removePlan: (id: string) => void;
  getPlansByDate: (date: Date) => MealPlan[];
  getPlansByRecipe: (recipeId: string) => MealPlan[];
  hasPlanOnDate: (recipeId: string, date: Date) => boolean;
}

const userStorage = createUserScopedStorage(STORAGE_KEYS.MEAL_PLAN, getCurrentUserIdSync);

const storageWithSync = {
  getItem: userStorage.getItem,
  setItem: (name: string, value: string) => {
    userStorage.setItem(name, value);
    void syncPushNow();
  },
  removeItem: userStorage.removeItem,
};

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      plans: [],

      addPlan: (recipeId, recipeName, plannedDate, servings = 2, mealBatches = 1) => {
        const date = new Date(plannedDate);
        date.setHours(12, 0, 0, 0);
        const newPlan: MealPlan = {
          id: generateId(),
          recipeId,
          recipeName,
          plannedDate: date.toISOString(),
          servings,
          mealBatches,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ plans: [newPlan, ...state.plans] }));
      },

      removePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        })),

      getPlansByDate: (date) =>
        get().plans.filter((p) => isSameDay(p.plannedDate, date)),

      getPlansByRecipe: (recipeId) =>
        get().plans.filter((p) => p.recipeId === recipeId),

      hasPlanOnDate: (recipeId, date) =>
        get().plans.some(
          (p) => p.recipeId === recipeId && isSameDay(p.plannedDate, date)
        ),
    }),
    {
      name: STORAGE_KEYS.MEAL_PLAN,
      storage: createJSONStorage(() => storageWithSync),
    }
  )
);

export async function rehydrateMealPlanStore(): Promise<void> {
  await useMealPlanStore.persist.rehydrate();
}
