import Badge from "react-bootstrap/Badge";
import type { Recipe } from "@/types";
import { CUISINE_LABELS } from "@/types";
import type { FridgeRecipeMatch } from "@/lib/fridgeRecommendations";
import { AppLink } from "@/components/layout/AppLink";
import { DifficultyStars } from "./DifficultyStars";

interface RecipeCardProps {
  recipe: Recipe;
  fridgeMatch?: FridgeRecipeMatch;
}

export function RecipeCard({ recipe, fridgeMatch }: RecipeCardProps) {
  return (
    <AppLink
      href={`/recipes/${recipe.id}/`}
      className="text-decoration-none text-dark h-100 d-block"
    >
      <div
        className={`recipe-pick-card h-100 ${recipe.isCustom ? "recipe-pick-card--custom" : ""}`}
      >
        <div className="d-flex justify-content-between align-items-start gap-1 mb-1">
          <h6 className="recipe-pick-title mb-0">{recipe.name}</h6>
          <Badge bg="light" text="secondary" className="fw-normal flex-shrink-0">
            {CUISINE_LABELS[recipe.cuisine]}
          </Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center recipe-pick-meta">
          <DifficultyStars difficulty={recipe.difficulty} />
          <span>⏱ {recipe.prepTime}分</span>
        </div>
        {(fridgeMatch || recipe.isCustom) && (
          <div className="d-flex flex-wrap gap-1 mt-1">
            {fridgeMatch?.canCookNow && (
              <Badge bg="success-subtle" text="success" className="fw-normal">
                材料齊
              </Badge>
            )}
            {fridgeMatch && !fridgeMatch.canCookNow && (
              <Badge bg="warning-subtle" text="warning-emphasis" className="fw-normal">
                缺 {fridgeMatch.missingCount + fridgeMatch.partialCount}
              </Badge>
            )}
            {recipe.isCustom && (
              <Badge bg="primary-subtle" text="primary" className="fw-normal">
                自訂
              </Badge>
            )}
          </div>
        )}
      </div>
    </AppLink>
  );
}
