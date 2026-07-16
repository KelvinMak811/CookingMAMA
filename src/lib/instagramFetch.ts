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

/**
 * IG og:description 常見格式：
 * "150 likes, 0 comments - username on July 14, 2026: \"實際 caption...\""
 */
export function cleanInstagramCaption(raw: string): string {
  let text = decodeHtmlEntities(raw).trim();
  if (!text) return "";

  const quoted = text.match(
    /\d+\s+likes?,\s*\d+\s+comments?\s*-\s*.+?:\s*[“"']([\s\S]*?)[”"']\s*$/i
  );
  if (quoted?.[1]) {
    text = quoted[1].trim();
  } else {
    text = text
      .replace(/^\d+\s+likes?,\s*\d+\s+comments?\s*-\s*[^:]+:\s*/i, "")
      .replace(/^["“]|["”]$/g, "")
      .trim();
  }

  // 太短／只係 truncated 符號，當冇 caption
  if (!text || text === "&" || text.length < 3) return "";
  return text;
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

      const rawCaption =
        pickMeta(html, "og:description") ||
        pickMeta(html, "description") ||
        "";
      const caption = cleanInstagramCaption(rawCaption);
      const imageUrl = pickMeta(html, "og:image") || undefined;
      const title = pickMeta(html, "og:title") || undefined;

      if (caption || imageUrl) {
        return {
          caption,
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
