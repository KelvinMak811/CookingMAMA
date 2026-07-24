"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CuisineNav } from "./CuisineNav";
import { RecipeSearchBar } from "./RecipeSearchBar";
import { RecipeIngredientFilterBar } from "./RecipeIngredientFilterBar";

function CuisineNavSlotInner() {
  const pathname = usePathname();
  if (!pathname.startsWith("/recipes") && pathname !== "/") return null;

  return (
    <>
      <CuisineNav />
      <div className="recipe-browse-tools">
        <RecipeSearchBar />
        <RecipeIngredientFilterBar />
      </div>
    </>
  );
}

export function CuisineNavSlot() {
  return (
    <Suspense fallback={null}>
      <CuisineNavSlotInner />
    </Suspense>
  );
}
