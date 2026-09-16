"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MEAT_FILTERS, VEG_FILTERS } from "@/lib/recipeIngredientFilters";
import { DIFFICULTY_FILTERS } from "@/lib/recipeDifficultyFilters";
import { useRecipeIngredientFilters } from "@/hooks/useRecipeIngredientFilters";
import { useRecipeDifficultyFilter } from "@/hooks/useRecipeDifficultyFilter";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    meats,
    vegs,
    hasFilters: hasIngredientFilters,
    toggleMeat,
    toggleVeg,
  } = useRecipeIngredientFilters();
  const {
    levels,
    sort,
    hasFilters: hasDifficultyFilters,
    toggleLevel,
    clearLevels,
    setSort,
  } = useRecipeDifficultyFilter();

  const hasFilters = hasIngredientFilters || hasDifficultyFilters;

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("m");
    params.delete("v");
    params.delete("d");
    params.delete("ds");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <div className="recipe-filter-bar" aria-label="菜式篩選">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <span className="small text-secondary">材料篩選</span>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none p-0 text-secondary"
            onClick={clearAllFilters}
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

      <div className="d-flex align-items-center justify-content-between gap-2 mb-1 mt-2">
        <span className="small text-secondary">難度篩選</span>
      </div>
      <div className="recipe-filter-row">
        <span className="recipe-filter-row-label">星級</span>
        <div className="recipe-filter-chips" role="group" aria-label="難度星級">
          <button
            type="button"
            className={`recipe-filter-chip ${levels.length === 0 ? "is-active" : ""}`}
            aria-pressed={levels.length === 0}
            onClick={clearLevels}
          >
            全部
          </button>
          {DIFFICULTY_FILTERS.map((option) => {
            const isActive = levels.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                className={`recipe-filter-chip ${isActive ? "is-active" : ""}`}
                aria-pressed={isActive}
                onClick={() => toggleLevel(option.id)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="recipe-filter-row">
        <span className="recipe-filter-row-label">排序</span>
        <div className="recipe-filter-chips" role="group" aria-label="難度排序">
          <button
            type="button"
            className={`recipe-filter-chip ${sort === null ? "is-active" : ""}`}
            aria-pressed={sort === null}
            onClick={() => setSort(null)}
          >
            預設
          </button>
          <button
            type="button"
            className={`recipe-filter-chip ${sort === "asc" ? "is-active" : ""}`}
            aria-pressed={sort === "asc"}
            onClick={() => setSort(sort === "asc" ? null : "asc")}
          >
            易→難
          </button>
          <button
            type="button"
            className={`recipe-filter-chip ${sort === "desc" ? "is-active" : ""}`}
            aria-pressed={sort === "desc"}
            onClick={() => setSort(sort === "desc" ? null : "desc")}
          >
            難→易
          </button>
        </div>
      </div>
    </div>
  );
}
