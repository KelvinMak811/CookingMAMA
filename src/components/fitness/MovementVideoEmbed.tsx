"use client";

import { useId, useState } from "react";
import {
  resolveVideoEmbed,
  VIDEO_IFRAME_ALLOW,
} from "@/lib/videoEmbed";

interface MovementVideoEmbedProps {
  url: string;
  title?: string;
  org?: string;
}

export function MovementVideoEmbed({
  url,
  title,
  org,
}: MovementVideoEmbedProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const embed = resolveVideoEmbed(url);
  const labelBits = [
    org ? `（${org}）` : "",
    title ? ` · ${title}` : "",
  ].join("");

  const isDirectMedia =
    embed.canEmbed &&
    embed.provider === "generic" &&
    Boolean(embed.embedUrl);

  return (
    <div className="planner-video">
      <button
        type="button"
        className="planner-video-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? "▼" : "▶"}</span>
        {open ? "收起教學影片" : "睇教學影片"}
        {labelBits}
      </button>

      {open ? (
        <div id={panelId} className="planner-video-panel">
          {embed.canEmbed && embed.embedUrl ? (
            <div className="planner-video-frame">
              {isDirectMedia ? (
                <video
                  className="planner-video-player"
                  src={embed.embedUrl}
                  controls
                  playsInline
                  preload="metadata"
                  title={title || "教學影片"}
                />
              ) : (
                <iframe
                  className="planner-video-player"
                  src={embed.embedUrl}
                  title={title || "教學影片"}
                  allow={VIDEO_IFRAME_ALLOW}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
          ) : (
            <p className="planner-video-fallback small text-secondary mb-2">
              呢個來源係教學頁面，暫時未能喺站內直接播放。你可以喺下方開啟原文參考。
            </p>
          )}
          <a
            className="planner-video-source"
            href={embed.originalUrl}
            target="_blank"
            rel="noreferrer"
          >
            開啟來源頁面
            {org ? `（${org}）` : ""}
          </a>
        </div>
      ) : null}
    </div>
  );
}
