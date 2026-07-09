import type { FridgeItem, Recipe } from "@/types";
import { computeFridgeAvailability } from "@/lib/fridgeRecipe";

export interface FridgeRecipeMatch {
  recipe: Recipe;
  totalIngredients: number;
  readyCount: number;
  missingCount: number;
  partialCount: number;
  canCookNow: boolean;
  coverageRatio: number;
}

export function getFridgeRecipeMatches(
  recipeList: Recipe[],
  fridgeItems: FridgeItem[]
): FridgeRecipeMatch[] {
  if (fridgeItems.length === 0) return [];

  return recipeList
    .map((recipe) => {
      const availability = computeFridgeAvailability(recipe.ingredients, fridgeItems);
      const totalIngredients = availability.length;
      const readyCount = availability.filter((entry) => !entry.needToBuy).length;
      const partialCount = availability.filter(
        (entry) => entry.inFridge && entry.needToBuy
      ).length;
      const missingCount = availability.filter((entry) => !entry.inFridge).length;
      const canCookNow = totalIngredients > 0 && readyCount === totalIngredients;
      const coverageRatio = totalIngredients > 0 ? readyCount / totalIngredients : 0;

      return {
        recipe,
        totalIngredients,
        readyCount,
        missingCount,
        partialCount,
        canCookNow,
        coverageRatio,
      };
    })
    .filter((match) => match.readyCount > 0 || match.partialCount > 0)
    .sort((a, b) => {
      if (a.canCookNow !== b.canCookNow) return a.canCookNow ? -1 : 1;
      if (b.coverageRatio !== a.coverageRatio) return b.coverageRatio - a.coverageRatio;
      return a.missingCount - b.missingCount;
    });
}

export function splitFridgeRecipeMatches(matches: FridgeRecipeMatch[]) {
  const readyNow = matches.filter((match) => match.canCookNow);
  const almostReady = matches.filter(
    (match) => !match.canCookNow && match.coverageRatio >= 0.5
  );
  return { readyNow, almostReady };
}
