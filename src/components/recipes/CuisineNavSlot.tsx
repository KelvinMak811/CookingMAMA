"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CuisineNav } from "./CuisineNav";
import { RecipeSearchBar } from "./RecipeSearchBar";

function CuisineNavSlotInner() {
  const pathname = usePathname();
  if (!pathname.startsWith("/recipes") && pathname !== "/") return null;

  return (
    <>
      <CuisineNav />
      <RecipeSearchBar />
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
