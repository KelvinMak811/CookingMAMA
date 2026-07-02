"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { appPath, BASE_PATH } from "@/lib/paths";

interface HardLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/** GitHub Pages 靜態站：強制整頁重新載入，避免 Next 客戶端路由失敗 */
export function HardLink({ href, onClick, children, ...props }: HardLinkProps) {
  const resolved =
    href.startsWith("http") || href.startsWith("#")
      ? href
      : BASE_PATH
        ? appPath(href)
        : href;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target === "_blank") return;
    if (!BASE_PATH) return;
    e.preventDefault();
    window.location.assign(resolved);
  };

  return (
    <a href={resolved} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
