"use client";

import { useSearchParams } from "next/navigation";
import { appPath } from "@/lib/paths";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";

export function RecipeDetailPageClient() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id");

  if (!recipeId) {
    return (
      <div className="container app-main py-5 text-center text-secondary">
        <p className="mb-3">搵唔到菜式，請由菜式庫重新揀選。</p>
        <a href={appPath("/recipes")} className="btn btn-primary">
          返回菜式庫
        </a>
      </div>
    );
  }

  return <RecipeDetailView recipeId={recipeId} />;
}
