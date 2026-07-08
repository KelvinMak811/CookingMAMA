import type { Recipe } from "@/types";
import {
  isBrowser,
  loadZustandState,
  saveZustandState,
  STORAGE_KEYS,
} from "@/lib/storage";

type CustomRecipesState = {
  recipes: Recipe[];
};

const DEFAULT_CUSTOM_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Cooking_pot_stew_%28Unsplash%29.jpg/640px-Cooking_pot_stew_%28Unsplash%29.jpg";

function toSafeInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeRecipe(raw: unknown): Recipe | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Partial<Recipe>;
  if (!obj.id || !obj.name) return null;

  const cuisine = ["chinese", "western", "japanese", "italian"].includes(
    String(obj.cuisine)
  )
    ? (obj.cuisine as Recipe["cuisine"])
    : "chinese";

  const ingredients = Array.isArray(obj.ingredients)
    ? obj.ingredients
        .map((ing, index) => {
          if (!ing || typeof ing !== "object") return null;
          const item = ing as { id?: string; name?: string; amount?: string };
          if (!item.name) return null;
          return {
            id: item.id ?? `custom-ing-${index}`,
            name: String(item.name),
            amount: item.amount ? String(item.amount) : "適量",
          };
        })
        .filter((ing): ing is NonNullable<typeof ing> => Boolean(ing))
    : [];

  if (ingredients.length === 0) return null;

  const steps = Array.isArray(obj.steps)
    ? obj.steps.map((s) => String(s).trim()).filter(Boolean)
    : [];

  return {
    id: String(obj.id),
    name: String(obj.name),
    cuisine,
    baseServings: Math.max(1, Math.min(12, toSafeInt(obj.baseServings, 2))),
    description: String(obj.description ?? ""),
    difficulty: Math.max(1, Math.min(5, toSafeInt(obj.difficulty, 1))),
    prepTime: Math.max(0, toSafeInt(obj.prepTime, 0)),
    imageUrl: String(obj.imageUrl ?? "") || DEFAULT_CUSTOM_IMAGE,
    ingredients,
    steps,
    isCustom: true,
    createdBy: obj.createdBy ? String(obj.createdBy) : undefined,
    createdByName: obj.createdByName ? String(obj.createdByName) : undefined,
    createdAt: obj.createdAt ? String(obj.createdAt) : undefined,
    updatedAt: obj.updatedAt ? String(obj.updatedAt) : undefined,
  };
}

export function generateCustomRecipeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getCustomRecipes(): Recipe[] {
  if (!isBrowser()) return [];
  const state = loadZustandState<CustomRecipesState>(
    STORAGE_KEYS.CUSTOM_RECIPES,
    { recipes: [] }
  );
  if (!Array.isArray(state.recipes)) return [];
  return state.recipes
    .map(normalizeRecipe)
    .filter((recipe): recipe is Recipe => Boolean(recipe))
    .sort((a, b) => {
      const at = Date.parse(a.updatedAt ?? a.createdAt ?? "0");
      const bt = Date.parse(b.updatedAt ?? b.createdAt ?? "0");
      return bt - at;
    });
}

export function getCustomRecipeById(id: string): Recipe | null {
  return getCustomRecipes().find((recipe) => recipe.id === id) ?? null;
}

export function upsertCustomRecipe(
  recipe: Recipe,
  currentUserId: string
): boolean {
  if (!isBrowser()) return false;
  const list = getCustomRecipes();
  const idx = list.findIndex((item) => item.id === recipe.id);
  if (idx >= 0 && list[idx].createdBy !== currentUserId) return false;
  const next = [...list];
  if (idx >= 0) next[idx] = recipe;
  else next.unshift(recipe);
  saveZustandState(STORAGE_KEYS.CUSTOM_RECIPES, { recipes: next });
  return true;
}

export function deleteCustomRecipe(
  recipeId: string,
  currentUserId: string
): boolean {
  if (!isBrowser()) return false;
  const list = getCustomRecipes();
  const recipe = list.find((item) => item.id === recipeId);
  if (!recipe || recipe.createdBy !== currentUserId) return false;
  const next = list.filter((item) => item.id !== recipeId);
  saveZustandState(STORAGE_KEYS.CUSTOM_RECIPES, { recipes: next });
  return true;
}
