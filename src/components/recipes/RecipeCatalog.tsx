"use client";

import { Suspense, useMemo } from "react";
import type { CuisineType } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { recipes } from "@/data/recipes";
import { AppLink } from "@/components/layout/AppLink";
import { CalendarUserButtons } from "@/components/history/CalendarUserButtons";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useRecipeSearchQuery } from "@/hooks/useRecipeSearchQuery";
import { filterRecipesBySearch } from "@/lib/recipeSearch";
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

function RecipeCatalogInner({ cuisine = "all" }: RecipeCatalogProps) {
  const { recipes: customRecipes } = useCustomRecipes();
  const { query } = useRecipeSearchQuery();
  const allRecipes = useMemo(
    () => [...customRecipes, ...recipes],
    [customRecipes]
  );
  const filtered = useMemo(
    () =>
      cuisine === "all"
        ? allRecipes
        : allRecipes.filter((recipe) => recipe.cuisine === cuisine),
    [allRecipes, cuisine]
  );
  const displayed = useMemo(
    () => filterRecipesBySearch(filtered, query),
    [filtered, query]
  );
  const title = cuisine === "all" ? "全部菜式" : CUISINE_LABELS[cuisine];
  const isSearching = query.trim().length > 0;

  return (
    <div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <p className="small text-secondary mb-2 mb-md-1">煮食日曆</p>
          <CalendarUserButtons />
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <h2 className="h4 fw-bold mb-0">{title}</h2>
        <AppLink href="/add-recipe/" className="btn btn-outline-primary btn-sm">
          + 加入菜式
        </AppLink>
      </div>
      <p className="text-secondary small mb-4">
        {isSearching ? (
          <>
            搜尋「{query.trim()}」— 搵到 {displayed.length} 款
            {cuisine !== "all" ? `（${CUISINE_LABELS[cuisine]}）` : ""}
          </>
        ) : (
          <>
            {CUISINE_HINTS[cuisine]} 共 {filtered.length} 款。
          </>
        )}
      </p>
      {displayed.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          {isSearching
            ? `搵唔到「${query.trim()}」相關菜式，試下其他關鍵字。`
            : "呢個分類暫時冇菜式"}
        </div>
      ) : (
        <RecipeGrid recipes={displayed} />
      )}
    </div>
  );
}

export function RecipeCatalog(props: RecipeCatalogProps) {
  return (
    <Suspense fallback={<div className="text-secondary py-4">載入中…</div>}>
      <RecipeCatalogInner {...props} />
    </Suspense>
  );
}
