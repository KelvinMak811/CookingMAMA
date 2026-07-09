import type { FridgeItem, Ingredient, IngredientAvailability } from "@/types";
import {
  mergeAmountStrings,
  normalizeIngredientName,
  subtractAmounts,
} from "@/lib/ingredientAmount";

function fridgeAmountForName(
  ingredientName: string,
  fridgeItems: FridgeItem[]
): string {
  const key = normalizeIngredientName(ingredientName);
  const amounts = fridgeItems
    .filter((item) => normalizeIngredientName(item.ingredientName) === key)
    .map((item) => item.amount)
    .filter(Boolean);
  return mergeAmountStrings(amounts);
}

export function computeFridgeAvailability(
  ingredients: Ingredient[],
  fridgeItems: FridgeItem[]
): IngredientAvailability[] {
  return ingredients.map((ingredient) => {
    const fridgeAmount = fridgeAmountForName(ingredient.name, fridgeItems);

    if (!fridgeAmount) {
      return {
        ingredient,
        inFridge: false,
        needToBuy: true,
        needAmount: ingredient.amount,
        displayAmount: ingredient.amount,
      };
    }

    const { need, hasEnough, unitMismatch } = subtractAmounts(
      ingredient.amount,
      fridgeAmount
    );

    if (hasEnough) {
      return {
        ingredient,
        inFridge: true,
        needToBuy: false,
        fridgeAmount,
        displayAmount: ingredient.amount,
      };
    }

    return {
      ingredient,
      inFridge: true,
      needToBuy: true,
      needAmount: need,
      fridgeAmount,
      unitMismatch,
      displayAmount: need || ingredient.amount,
    };
  });
}
