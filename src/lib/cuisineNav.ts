import type { CuisineType } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { recipes, getRecipesByCuisine } from "@/data/recipes";

export type CuisineFilter = CuisineType | "all";

export interface CuisineNavItem {
  value: CuisineFilter;
  href: string;
  label: string;
  icon: string;
  count: number;
}

export const CUISINE_NAV_ITEMS: CuisineNavItem[] = [
  {
    value: "all",
    href: "/recipes",
    label: "全部",
    icon: "📖",
    count: recipes.length,
  },
  {
    value: "chinese",
    href: "/recipes/cuisine/chinese",
    label: CUISINE_LABELS.chinese,
    icon: "🥢",
    count: getRecipesByCuisine("chinese").length,
  },
  {
    value: "western",
    href: "/recipes/cuisine/western",
    label: CUISINE_LABELS.western,
    icon: "🍽️",
    count: getRecipesByCuisine("western").length,
  },
  {
    value: "japanese",
    href: "/recipes/cuisine/japanese",
    label: CUISINE_LABELS.japanese,
    icon: "🍱",
    count: getRecipesByCuisine("japanese").length,
  },
  {
    value: "italian",
    href: "/recipes/cuisine/italian",
    label: CUISINE_LABELS.italian,
    icon: "🍝",
    count: getRecipesByCuisine("italian").length,
  },
];

export function isValidCuisine(value: string): value is CuisineType {
  return ["chinese", "western", "japanese", "italian"].includes(value);
}

export function getActiveCuisineFromPath(pathname: string): CuisineFilter {
  const match = pathname.match(/^\/recipes\/cuisine\/([^/]+)/);
  if (match && isValidCuisine(match[1])) return match[1];
  if (pathname === "/recipes" || pathname.startsWith("/recipes/")) return "all";
  return "all";
}
