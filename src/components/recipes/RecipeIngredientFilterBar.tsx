"use client";

import { MEAT_FILTERS, VEG_FILTERS } from "@/lib/recipeIngredientFilters";
import { useRecipeIngredientFilters } from "@/hooks/useRecipeIngredientFilters";

export function RecipeIngredientFilterBar() {
  const { meats, vegs, hasFilters, toggleMeat, toggleVeg, clearFilters } =
    useRecipeIngredientFilters();

  return (
    <div className="recipe-filter-bar" aria-label="材料篩選">
      <div className="recipe-filter-row">
        <span className="recipe-filter-label">肉類</span>
        <div className="recipe-filter-chips">
          {MEAT_FILTERS.map((filter) => {
            const active = meats.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                className={`recipe-filter-chip ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => toggleMeat(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="recipe-filter-row">
        <span className="recipe-filter-label">蔬菜</span>
        <div className="recipe-filter-chips">
          {VEG_FILTERS.map((filter) => {
            const active = vegs.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                className={`recipe-filter-chip ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => toggleVeg(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      {hasFilters && (
        <div className="recipe-filter-actions">
          <button
            type="button"
            className="btn btn-link btn-sm text-secondary text-decoration-none px-0"
            onClick={clearFilters}
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
}
