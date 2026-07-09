"use client";

import { useState } from "react";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import type { Ingredient, IngredientAvailability, Recipe } from "@/types";
import { useShoppingStore } from "@/stores/shoppingStore";

interface AddToShoppingButtonProps {
  recipe: Recipe;
  scaledIngredients: Ingredient[];
  servings: number;
  mealBatches: number;
  availability?: IngredientAvailability[];
  useFridgeCalc?: boolean;
}

export function AddToShoppingButton({
  recipe,
  scaledIngredients,
  servings,
  mealBatches,
  availability,
  useFridgeCalc = false,
}: AddToShoppingButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const items = useShoppingStore((s) => s.items);
  const addIngredientsFromRecipe = useShoppingStore((s) => s.addIngredientsFromRecipe);

  const handleClick = () => {
    const ingredientsToAdd = useFridgeCalc && availability
      ? availability
          .filter((entry) => entry.needToBuy)
          .map((entry) => ({
            name: entry.ingredient.name,
            amount: entry.needAmount || entry.ingredient.amount,
          }))
      : scaledIngredients;

    const added = addIngredientsFromRecipe(
      ingredientsToAdd,
      recipe.id,
      recipe.name,
      items
    );

    if (added > 0) {
      setMessage(
        useFridgeCalc
          ? `已加入 ${added} 樣需購買材料到買餸清單（${servings}人×${mealBatches}餐）`
          : `已加入 ${added} 樣材料到買餸清單（${servings}人×${mealBatches}餐）`
      );
    } else if (useFridgeCalc && ingredientsToAdd.length === 0) {
      setMessage("雪櫃材料已足夠，無需購買");
    } else {
      setMessage("所有材料已經喺買餸清單入面");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <Button variant="primary" size="lg" className="w-100" onClick={handleClick}>
        🛒 一鍵加入買餸清單
      </Button>
      {message && (
        <Alert variant="success" className="mt-2 mb-0 py-2 small text-center">
          {message}
        </Alert>
      )}
    </div>
  );
}
