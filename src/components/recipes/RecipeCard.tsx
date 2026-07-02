import Badge from "react-bootstrap/Badge";
import type { Recipe } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { recipeDetailPath } from "@/lib/paths";
import { DifficultyStars } from "./DifficultyStars";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const href = recipeDetailPath(recipe.id);

  return (
    <a href={href} className="text-decoration-none text-dark h-100 d-block">
      <div className="card h-100 border-0 shadow-sm overflow-hidden">
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
            <Badge bg="light" text="secondary" className="fw-normal">
              {CUISINE_LABELS[recipe.cuisine]}
            </Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center small text-secondary">
            <DifficultyStars difficulty={recipe.difficulty} />
            <span>⏱ {recipe.prepTime} 分鐘</span>
          </div>
        </div>
      </div>
    </a>
  );
}
