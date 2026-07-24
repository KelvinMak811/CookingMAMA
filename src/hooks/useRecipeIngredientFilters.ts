"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MEAT_FILTER_IDS,
  VEG_FILTER_IDS,
  parseFilterIds,
  serializeFilterIds,
  type MeatFilterId,
  type VegFilterId,
} from "@/lib/recipeIngredientFilters";

export function useRecipeIngredientFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const meats = useMemo(
    () => parseFilterIds(searchParams.get("m"), MEAT_FILTER_IDS),
    [searchParams]
  );
  const vegs = useMemo(
    () => parseFilterIds(searchParams.get("v"), VEG_FILTER_IDS),
    [searchParams]
  );

  const replaceParams = useCallback(
    (nextMeats: MeatFilterId[], nextVegs: VegFilterId[]) => {
      const params = new URLSearchParams(searchParams.toString());
      const m = serializeFilterIds(nextMeats);
      const v = serializeFilterIds(nextVegs);
      if (m) params.set("m", m);
      else params.delete("m");
      if (v) params.set("v", v);
      else params.delete("v");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleMeat = useCallback(
    (id: MeatFilterId) => {
      const next = meats.includes(id)
        ? meats.filter((item) => item !== id)
        : [...meats, id];
      replaceParams(next, vegs);
    },
    [meats, vegs, replaceParams]
  );

  const toggleVeg = useCallback(
    (id: VegFilterId) => {
      const next = vegs.includes(id)
        ? vegs.filter((item) => item !== id)
        : [...vegs, id];
      replaceParams(meats, next);
    },
    [meats, vegs, replaceParams]
  );

  const clearFilters = useCallback(() => {
    replaceParams([], []);
  }, [replaceParams]);

  const hasFilters = meats.length > 0 || vegs.length > 0;

  return {
    meats,
    vegs,
    hasFilters,
    toggleMeat,
    toggleVeg,
    clearFilters,
  };
}
