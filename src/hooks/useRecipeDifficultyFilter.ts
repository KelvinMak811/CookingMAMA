"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseDifficultyLevels,
  parseDifficultySort,
  serializeDifficultyLevels,
  type DifficultyLevel,
  type DifficultySort,
} from "@/lib/recipeDifficultyFilters";

export function useRecipeDifficultyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const levels = useMemo(
    () => parseDifficultyLevels(searchParams.get("d")),
    [searchParams]
  );
  const sort = useMemo(
    () => parseDifficultySort(searchParams.get("ds")),
    [searchParams]
  );

  const replaceParams = useCallback(
    (nextLevels: DifficultyLevel[], nextSort: DifficultySort | null) => {
      const params = new URLSearchParams(searchParams.toString());
      const d = serializeDifficultyLevels(nextLevels);
      if (d) params.set("d", d);
      else params.delete("d");
      if (nextSort) params.set("ds", nextSort);
      else params.delete("ds");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleLevel = useCallback(
    (level: DifficultyLevel) => {
      const next = levels.includes(level)
        ? levels.filter((item) => item !== level)
        : [...levels, level].sort((a, b) => a - b);
      replaceParams(next, sort);
    },
    [levels, sort, replaceParams]
  );

  const clearLevels = useCallback(() => {
    replaceParams([], sort);
  }, [sort, replaceParams]);

  const setSort = useCallback(
    (next: DifficultySort | null) => {
      replaceParams(levels, next);
    },
    [levels, replaceParams]
  );

  const clearFilters = useCallback(() => {
    replaceParams([], null);
  }, [replaceParams]);

  const hasFilters = levels.length > 0 || sort !== null;

  return {
    levels,
    sort,
    hasFilters,
    toggleLevel,
    clearLevels,
    setSort,
    clearFilters,
  };
}
