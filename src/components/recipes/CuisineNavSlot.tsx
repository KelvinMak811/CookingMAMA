"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CuisineNav } from "./CuisineNav";

function CuisineNavInner() {
  return <CuisineNav />;
}

export function CuisineNavSlot() {
  const pathname = usePathname();
  if (!pathname.startsWith("/recipes")) return null;
  return (
    <Suspense fallback={null}>
      <CuisineNavInner />
    </Suspense>
  );
}
