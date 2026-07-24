"use client";

import { MEAT_FILTERS, VEG_FILTERS } from "@/lib/recipeIngredientFilters";
import { useRecipeIngredientFilters } from "@/hooks/useRecipeIngredientFilters";

function ChipRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="recipe-filter-row">
      <span className="recipe-filter-row-label">{label}</span>
      <div className="recipe-filter-chips" role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`recipe-filter-chip ${isActive ? "is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RecipeFilterChips() {
  const { meats, vegs, hasFilters, toggleMeat, toggleVeg, clearFilters } =
    useRecipeIngredientFilters();

  return (
    <div className="recipe-filter-bar" aria-label="材料篩選">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <span className="small text-secondary">材料篩選</span>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none p-0 text-secondary"
            onClick={clearFilters}
          >
            清除篩選
          </button>
        )}
      </div>
      <ChipRow
        label="肉／蛋白"
        options={MEAT_FILTERS}
        selected={meats}
        onToggle={(id) => toggleMeat(id as (typeof MEAT_FILTERS)[number]["id"])}
      />
      <ChipRow
        label="蔬菜"
        options={VEG_FILTERS}
        selected={vegs}
        onToggle={(id) => toggleVeg(id as (typeof VEG_FILTERS)[number]["id"])}
      />
    </div>
  );
}
