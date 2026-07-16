/**
 * 嘗試從公開 Instagram 連結抽出 caption／縮圖。
 * IG 經常封鎖爬蟲，失敗時會回傳 null，由前端請用戶貼文字。
 */

export interface InstagramExtractResult {
  caption: string;
  imageUrl?: string;
  title?: string;
}

function isInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /(^|\.)instagram\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\\u0026/g, "&")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"');
}

function pickMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  return decodeHtmlEntities(html.match(re)?.[1] ?? html.match(re2)?.[1] ?? "") || null;
}

export async function extractInstagramPost(
  url: string
): Promise<InstagramExtractResult | null> {
  if (!isInstagramUrl(url)) return null;

  const controllers = [url, url.replace(/\/$/, "") + "/embed/captioned/"];

  for (const target of controllers) {
    try {
      const res = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SmartCookBot/1.0; +https://localhost)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();

      const caption =
        pickMeta(html, "og:description") ||
        pickMeta(html, "description") ||
        "";
      const imageUrl = pickMeta(html, "og:image") || undefined;
      const title = pickMeta(html, "og:title") || undefined;

      if (caption || imageUrl) {
        return {
          caption: caption.trim(),
          imageUrl,
          title: title?.trim(),
        };
      }
    } catch {
      /* try next */
    }
  }

  return null;
}

export { isInstagramUrl };
