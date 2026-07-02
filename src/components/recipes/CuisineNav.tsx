"use client";

import { AppLink } from "@/components/layout/AppLink";
import { usePathname, useSearchParams } from "next/navigation";
import Nav from "react-bootstrap/Nav";
import { CUISINE_NAV_ITEMS, isValidCuisine } from "@/lib/cuisineNav";
import type { CuisineFilter } from "@/lib/cuisineNav";
import { getRecipeById } from "@/data/recipes";

function resolveActiveCuisine(
  pathname: string,
  recipeId: string | null
): CuisineFilter {
  if (recipeId) {
    const recipe = getRecipeById(recipeId);
    if (recipe) return recipe.cuisine;
  }

  const cuisineMatch = pathname.match(/^\/recipes\/cuisine\/([^/]+)/);
  if (cuisineMatch && isValidCuisine(cuisineMatch[1])) return cuisineMatch[1];

  const detailMatch = pathname.match(/^\/recipes\/([^/]+)$/);
  if (detailMatch && detailMatch[1] !== "cuisine" && detailMatch[1] !== "detail") {
    const recipe = getRecipeById(detailMatch[1]);
    if (recipe) return recipe.cuisine;
  }
  return "all";
}

export function CuisineNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const recipeId =
    pathname.includes("/recipes/detail") ? searchParams.get("id") : null;
  const active = resolveActiveCuisine(pathname, recipeId);

  if (!pathname.startsWith("/recipes")) return null;

  return (
    <nav className="cuisine-nav-sticky border-bottom py-1 mb-0" aria-label="菜式類別">
      <div className="date-nav-scroll">
        <Nav variant="pills" className="flex-nowrap gap-2">
          {CUISINE_NAV_ITEMS.map((item) => {
            const isActive = active === item.value;
            return (
              <Nav.Item key={item.value}>
                <AppLink
                  href={item.href}
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
