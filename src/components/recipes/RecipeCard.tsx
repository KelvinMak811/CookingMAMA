import Badge from "react-bootstrap/Badge";
import type { Recipe } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { AppLink } from "@/components/layout/AppLink";
import { DifficultyStars } from "./DifficultyStars";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <AppLink href={`/recipes/${recipe.id}/`} className="text-decoration-none text-dark h-100 d-block">
      <div
        className={`card h-100 border-0 shadow-sm overflow-hidden ${recipe.isCustom ? "border border-primary-subtle" : ""}`}
      >
        <div className="position-relative recipe-card-img">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="object-fit-cover w-100 h-100"
            loading="lazy"
          />
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 className="card-title mb-0">{recipe.name}</h6>
            <span className="text-end">
              {recipe.isCustom && (
                <Badge bg="primary-subtle" text="primary" className="fw-normal me-1">
                  自訂
                </Badge>
              )}
              <Badge bg="light" text="secondary" className="fw-normal">
                {CUISINE_LABELS[recipe.cuisine]}
              </Badge>
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center small text-secondary">
            <DifficultyStars difficulty={recipe.difficulty} />
            <span>⏱ {recipe.prepTime} 分鐘</span>
          </div>
          {recipe.isCustom && recipe.createdByName && (
            <div className="small text-primary mt-1">👤 {recipe.createdByName} 加入</div>
          )}
        </div>
      </div>
    </AppLink>
  );
}
