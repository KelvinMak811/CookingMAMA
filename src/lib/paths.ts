/** GitHub Pages 子路徑，build 時由 NEXT_PUBLIC_BASE_PATH 注入 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 產生帶 basePath 嘅站內路徑（預設補 trailing slash） */
export function appPath(path: string, trailingSlash = true): string {
  const [pathname, query] = path.split("?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withSlash =
    trailingSlash && !normalized.endsWith("/") ? `${normalized}/` : normalized;
  const suffix = query ? `?${query}` : "";
  return `${BASE_PATH}${withSlash}${suffix}`;
}

/** 菜式詳情頁（靜態匯出：每道菜預先產生獨立 HTML） */
export function recipeDetailPath(recipeId: string): string {
  return appPath(`/recipes/${recipeId}`);
}
