import { rehydrateCookingLogStore } from "@/stores/cookingLogStore";
import { rehydrateFridgeStore } from "@/stores/fridgeStore";
import { rehydrateMealPlanStore } from "@/stores/mealPlanStore";
import { rehydrateShoppingStore } from "@/stores/shoppingStore";

export async function rehydrateAllUserStores(): Promise<void> {
  await Promise.all([
    rehydrateShoppingStore(),
    rehydrateMealPlanStore(),
    rehydrateCookingLogStore(),
    rehydrateFridgeStore(),
  ]);
}
