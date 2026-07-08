"use client";

import type { CuisineType } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { recipes } from "@/data/recipes";
import { AppLink } from "@/components/layout/AppLink";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { RecipeGrid } from "./RecipeGrid";

interface RecipeCatalogProps {
  cuisine?: CuisineType | "all";
}

const CUISINE_HINTS: Record<CuisineType | "all", string> = {
  all: "全部用易潔鑊／平底鑊就得，唔使焗爐同氣炸鍋。乾身餸、炒粉麵飯為主，唔包湯飯。",
  chinese: "港式家常、茶餐廳小炒，鑊氣十足又易整，唔包湯飯。",
  western: "西式一鑊過，早餐午餐晚餐都啱。",
  japanese: "日式丼飯、咖喱同炒麵，簡單好味。",
  italian: "意粉同燉菜，易潔鑊就煮到意式風味。",
};

export function RecipeCatalog({ cuisine = "all" }: RecipeCatalogProps) {
  const { recipes: customRecipes } = useCustomRecipes();
  const allRecipes = [...customRecipes, ...recipes];
  const filtered =
    cuisine === "all"
      ? allRecipes
      : allRecipes.filter((recipe) => recipe.cuisine === cuisine);
  const title = cuisine === "all" ? "全部菜式" : CUISINE_LABELS[cuisine];

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <h2 className="h4 fw-bold mb-0">{title}</h2>
        <AppLink href="/add-recipe/" className="btn btn-outline-primary btn-sm">
          + 加入菜式
        </AppLink>
      </div>
      <p className="text-secondary small mb-4">
        {CUISINE_HINTS[cuisine]} 共 {filtered.length} 款。
      </p>
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-secondary">呢個分類暫時冇菜式</div>
      ) : (
        <RecipeGrid recipes={filtered} />
      )}
    </div>
  );
}
