import type { Recipe } from "@/types";
import { CUISINE_LABELS } from "@/types";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function recipeHaystack(recipe: Recipe): string {
  return [
    recipe.name,
    recipe.description,
    CUISINE_LABELS[recipe.cuisine],
    ...recipe.ingredients.map((ing) => ing.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterRecipesBySearch(recipes: Recipe[], query: string): Recipe[] {
  const trimmed = normalize(query);
  if (!trimmed) return recipes;

  const terms = trimmed.split(/\s+/).filter(Boolean);

  return recipes.filter((recipe) => {
    const haystack = recipeHaystack(recipe);
    return terms.every((term) => haystack.includes(term));
  });
}
