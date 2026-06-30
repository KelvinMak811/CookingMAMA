"use client";

import { usePathname } from "next/navigation";
import { CuisineNav } from "./CuisineNav";

export function CuisineNavSlot() {
  const pathname = usePathname();
  if (!pathname.startsWith("/recipes")) return null;
  return <CuisineNav />;
}
