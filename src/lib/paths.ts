/** GitHub Pages 子路徑，build 時由 NEXT_PUBLIC_BASE_PATH 注入 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 產生帶 basePath 嘅站內路徑（預設補 trailing slash） */
export function appPath(path: string, trailingSlash = true): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const suffix =
    trailingSlash && !normalized.endsWith("/") ? `${normalized}/` : normalized;
  return `${BASE_PATH}${suffix}`;
}
