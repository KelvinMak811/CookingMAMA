export type VideoEmbedProvider = "youtube" | "vimeo" | "generic";

export interface VideoEmbedInfo {
  /** Null when the URL cannot be safely iframed as a video player. */
  embedUrl: string | null;
  provider: VideoEmbedProvider | null;
  canEmbed: boolean;
  originalUrl: string;
}

function youtubeEmbedUrl(videoId: string, listId?: string | null): string {
  const params = new URLSearchParams({ rel: "0" });
  if (listId) params.set("list", listId);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function extractYoutubeId(url: URL): { id: string; list: string | null } | null {
  const host = url.hostname.replace(/^www\./, "");
  const list = url.searchParams.get("list");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { id, list } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? { id, list } : null;
    }
    const embedMatch = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?&#]+)/);
    if (embedMatch?.[1]) return { id: embedMatch[1], list };
  }

  return null;
}

function extractVimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "player.vimeo.com" && parts[0] === "video" && parts[1]) {
      return parts[1];
    }
    const id = parts.find((p) => /^\d+$/.test(p));
    return id ?? null;
  }
  return null;
}

/**
 * Convert a watch / share page URL into an iframe-friendly embed URL when possible.
 * Article pages (NHS guides, CDC, etc.) return canEmbed: false.
 */
export function resolveVideoEmbed(rawUrl: string): VideoEmbedInfo {
  const originalUrl = rawUrl.trim();
  if (!originalUrl) {
    return { embedUrl: null, provider: null, canEmbed: false, originalUrl };
  }

  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return { embedUrl: null, provider: null, canEmbed: false, originalUrl };
  }

  const yt = extractYoutubeId(url);
  if (yt) {
    return {
      embedUrl: youtubeEmbedUrl(yt.id, yt.list),
      provider: "youtube",
      canEmbed: true,
      originalUrl,
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      provider: "vimeo",
      canEmbed: true,
      originalUrl,
    };
  }

  // Direct mp4 / media files already in repo or CDN can play in a video tag via iframe-less UI;
  // treat as non-iframe embed here — callers may still open the URL.
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)) {
    return {
      embedUrl: originalUrl,
      provider: "generic",
      canEmbed: true,
      originalUrl,
    };
  }

  return { embedUrl: null, provider: null, canEmbed: false, originalUrl };
}

export const VIDEO_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
