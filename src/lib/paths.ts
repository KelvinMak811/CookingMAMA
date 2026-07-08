/** Optional base path for legacy GitHub Pages deploys; empty on Vercel */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function appPath(path: string, trailingSlash = true): string {
  const [pathname, query] = path.split("?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withSlash =
    trailingSlash && !normalized.endsWith("/") ? `${normalized}/` : normalized;
  const suffix = query ? `?${query}` : "";
  return `${BASE_PATH}${withSlash}${suffix}`;
}

export function recipeDetailPath(recipeId: string): string {
  return appPath(`/recipes/${recipeId}`);
}
