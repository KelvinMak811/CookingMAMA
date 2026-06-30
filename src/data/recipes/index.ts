import type { Recipe } from "@/types";
import { chineseRecipes } from "./chinese";
import { westernRecipes } from "./western";
import { japaneseRecipes } from "./japanese";
import { italianRecipes } from "./italian";
import { getRecipeImageUrl } from "./images";

const rawRecipes: Recipe[] = [
  ...chineseRecipes,
  ...westernRecipes,
  ...japaneseRecipes,
  ...italianRecipes,
];

export const recipes: Recipe[] = rawRecipes.map((recipe) => ({
  ...recipe,
  imageUrl: getRecipeImageUrl(recipe.id),
}));

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function getRecipesByCuisine(cuisine: Recipe["cuisine"]): Recipe[] {
  return recipes.filter((r) => r.cuisine === cuisine);
}
