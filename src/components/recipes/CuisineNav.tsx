"use client";

import { useMemo } from "react";
import { AppLink } from "@/components/layout/AppLink";
import { usePathname, useSearchParams } from "next/navigation";
import Nav from "react-bootstrap/Nav";
import { CUISINE_NAV_ITEMS, isValidCuisine } from "@/lib/cuisineNav";
import type { CuisineFilter } from "@/lib/cuisineNav";
import { getRecipeById, recipes } from "@/data/recipes";
import { useCustomRecipes } from "@/hooks/useCustomRecipes";
import { useFridgeStore } from "@/stores/fridgeStore";
import { getFridgeRecipeMatches } from "@/lib/fridgeRecommendations";

function resolveActiveCuisine(pathname: string): CuisineFilter {
  if (pathname.startsWith("/recipes/fridge")) return "fridge";
  if (pathname === "/" || pathname === "/recipes" || pathname === "/recipes/") return "all";

  const cuisineMatch = pathname.match(/^\/recipes\/cuisine\/([^/]+)/);
  if (cuisineMatch && isValidCuisine(cuisineMatch[1])) return cuisineMatch[1];

  const detailMatch = pathname.match(/^\/recipes\/([^/]+)$/);
  if (
    detailMatch &&
    detailMatch[1] !== "cuisine" &&
    detailMatch[1] !== "detail" &&
    detailMatch[1] !== "fridge"
  ) {
    const recipe = getRecipeById(detailMatch[1]);
    if (recipe) return recipe.cuisine;
  }
  return "all";
}

export function CuisineNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const active = resolveActiveCuisine(pathname);
  const { recipes: customRecipes } = useCustomRecipes();
  const fridgeItems = useFridgeStore((s) => s.items);

  const fridgeReadyCount = useMemo(() => {
    const allRecipes = [...customRecipes, ...recipes];
    return getFridgeRecipeMatches(allRecipes, fridgeItems).filter(
      (match) => match.canCookNow
    ).length;
  }, [customRecipes, fridgeItems]);

  const navItems = useMemo(
    () =>
      CUISINE_NAV_ITEMS.map((item) =>
        item.value === "fridge" ? { ...item, count: fridgeReadyCount } : item
      ),
    [fridgeReadyCount]
  );

  if (!pathname.startsWith("/recipes") && pathname !== "/") return null;

  return (
    <nav className="cuisine-nav-sticky border-bottom py-1 mb-0" aria-label="菜式類別">
      <div className="date-nav-scroll">
        <Nav variant="pills" className="flex-nowrap gap-2">
          {navItems.map((item) => {
            const isActive = active === item.value;
            return (
              <Nav.Item key={item.value}>
                <AppLink
                  href={
                    searchQuery
                      ? `${item.href}?q=${encodeURIComponent(searchQuery)}`
                      : item.href
                  }
                  className={`nav-link rounded-3 d-flex align-items-center gap-1 px-3 ${isActive ? "active" : ""}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span className={`badge rounded-pill ${isActive ? "bg-light text-primary" : "bg-secondary-subtle text-secondary"}`}>
                    {item.count}
                  </span>
                </AppLink>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>
    </nav>
  );
}
