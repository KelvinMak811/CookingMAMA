"use client";

import { useMemo } from "react";
import { recipes } from "@/data/recipes";
import { AppLink } from "@/components/layout/AppLink";
import { CalendarUserButtons } from "@/components/history/CalendarUserButtons";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useFridgeStore } from "@/stores/fridgeStore";
import {
  getFridgeRecipeMatches,
  splitFridgeRecipeMatches,
} from "@/lib/fridgeRecommendations";
import { RecipeGrid } from "./RecipeGrid";

export function FridgeRecipeCatalog() {
  const { recipes: customRecipes } = useCustomRecipes();
  const fridgeItems = useFridgeStore((s) => s.items);

  const allRecipes = useMemo(
    () => [...customRecipes, ...recipes],
    [customRecipes]
  );

  const matches = useMemo(
    () => getFridgeRecipeMatches(allRecipes, fridgeItems),
    [allRecipes, fridgeItems]
  );

  const { readyNow, almostReady } = useMemo(
    () => splitFridgeRecipeMatches(matches),
    [matches]
  );

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
        根據你雪櫃現有材料，推薦而家可以煮或者差少少就煮到嘅菜式。
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
