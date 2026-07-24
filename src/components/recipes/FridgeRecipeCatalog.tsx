"use client";

import { Suspense, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { AppLink } from "@/components/layout/AppLink";
import { CalendarUserButtons } from "@/components/history/CalendarUserButtons";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useFridgeStore } from "@/stores/fridgeStore";
import { useRecipeSearchQuery } from "@/hooks/useRecipeSearchQuery";
import { useRecipeIngredientFilters } from "@/hooks/useRecipeIngredientFilters";
import { filterRecipesBySearch } from "@/lib/recipeSearch";
import {
  filterRecipesByIngredients,
  type MeatFilterId,
  type VegFilterId,
} from "@/lib/recipeIngredientFilters";
import {
  getFridgeRecipeMatches,
  splitFridgeRecipeMatches,
  type FridgeRecipeMatch,
} from "@/lib/fridgeRecommendations";
import { RecipeGrid } from "./RecipeGrid";

function filterMatchesByBrowse(
  matches: FridgeRecipeMatch[],
  query: string,
  meats: MeatFilterId[],
  vegs: VegFilterId[]
): FridgeRecipeMatch[] {
  let list = matches.map((match) => match.recipe);
  list = filterRecipesByIngredients(list, meats, vegs);
  list = filterRecipesBySearch(list, query);
  const filteredIds = new Set(list.map((recipe) => recipe.id));
  return matches.filter((match) => filteredIds.has(match.recipe.id));
}

function FridgeRecipeCatalogInner() {
  const { recipes: customRecipes } = useCustomRecipes();
  const fridgeItems = useFridgeStore((s) => s.items);
  const { query } = useRecipeSearchQuery();
  const { meats, vegs, hasFilters } = useRecipeIngredientFilters();
  const isSearching = query.trim().length > 0;
  const isNarrowed = isSearching || hasFilters;

  const allRecipes = useMemo(
    () => [...customRecipes, ...recipes],
    [customRecipes]
  );

  const matches = useMemo(
    () => getFridgeRecipeMatches(allRecipes, fridgeItems),
    [allRecipes, fridgeItems]
  );

  const { readyNow, almostReady } = useMemo(() => {
    const split = splitFridgeRecipeMatches(matches);
    if (!isNarrowed) return split;
    return {
      readyNow: filterMatchesByBrowse(split.readyNow, query, meats, vegs),
      almostReady: filterMatchesByBrowse(split.almostReady, query, meats, vegs),
    };
  }, [matches, query, meats, vegs, isNarrowed]);

  return (
    <div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <p className="small text-secondary mb-2 mb-md-1">煮食日曆</p>
          <CalendarUserButtons />
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <h2 className="h4 fw-bold mb-0">雪櫃推薦</h2>
        <AppLink href="/fridge" className="btn btn-outline-primary btn-sm">
          管理雪櫃
        </AppLink>
      </div>
      <p className="text-secondary small mb-4">
        {isNarrowed
          ? `${isSearching ? `搜尋「${query.trim()}」` : "材料篩選"}${
              hasFilters && isSearching ? " + 篩選" : ""
            }— 材料齊 ${readyNow.length} 款，差少少 ${almostReady.length} 款`
          : "根據你雪櫃現有材料，推薦而家可以煮或者差少少就煮到嘅菜式。"}
      </p>

      {fridgeItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">🧊</div>
          <h5>雪櫃暫時未有材料</h5>
          <p className="text-secondary small mb-3">
            買餸後勾選已購買，或手動加入雪櫃，就會有推薦菜式。
          </p>
          <AppLink href="/fridge" className="btn btn-primary">
            去雪櫃紀錄
          </AppLink>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          暫時搵唔到同雪櫃材料配對嘅菜式，試下加多啲常用材料。
        </div>
      ) : isNarrowed && readyNow.length === 0 && almostReady.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          搵唔到符合條件嘅推薦菜式，試下改關鍵字或清除篩選。
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {readyNow.length > 0 && (
            <section>
              <h3 className="h6 fw-bold text-success mb-2">
                ✅ 材料齊，可以開煮（{readyNow.length}）
              </h3>
              <RecipeGrid
                recipes={readyNow.map((match) => match.recipe)}
                fridgeMatches={readyNow}
              />
            </section>
          )}
          {almostReady.length > 0 && (
            <section>
              <h3 className="h6 fw-bold text-warning mb-2">
                🛒 差少少材料（{almostReady.length}）
              </h3>
              <RecipeGrid
                recipes={almostReady.map((match) => match.recipe)}
                fridgeMatches={almostReady}
              />
            </section>
          )}
          {readyNow.length === 0 && almostReady.length === 0 && (
            <div className="text-center py-5 text-secondary">
              有材料配對，但覆蓋率未夠高。去雪櫃加多啲材料，或者睇下個別菜式缺咩。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FridgeRecipeCatalog() {
  return (
    <Suspense fallback={<div className="text-secondary py-4">載入中…</div>}>
      <FridgeRecipeCatalogInner />
    </Suspense>
  );
}
