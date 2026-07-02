"use client";

import { useEffect } from "react";
import { recipeDetailPath } from "@/lib/paths";

interface RecipeLegacyRedirectProps {
  recipeId: string;
}

export function RecipeLegacyRedirect({ recipeId }: RecipeLegacyRedirectProps) {
  useEffect(() => {
    window.location.replace(recipeDetailPath(recipeId));
  }, [recipeId]);

  return (
    <div className="container app-main py-5 text-center text-secondary">
      載入菜式中…
    </div>
  );
}
