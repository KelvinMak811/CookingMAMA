"use client";

import { useCallback, useEffect, useState } from "react";
import type { Recipe } from "@/types";
import { getCustomRecipes } from "@/lib/customRecipes";
import { STORAGE_KEYS } from "@/lib/storage";

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const refresh = useCallback(() => {
    setRecipes(getCustomRecipes());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.CUSTOM_RECIPES) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return { recipes, refresh };
}
