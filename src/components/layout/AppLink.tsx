"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { appPath, BASE_PATH } from "@/lib/paths";

type AppLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: AppLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null) {
    const path = href.pathname ?? "/";
    const query = href.search ?? "";
    const hash = href.hash ?? "";
    return `${path}${query}${hash}`;
  }
  return "/";
}

/** 站內連結 — GitHub Pages 用整頁導航，避免靜態匯出客戶端路由失敗 */
export function AppLink({ prefetch = false, href, onClick, ...props }: AppLinkProps) {
  if (!BASE_PATH) {
    return <Link prefetch={prefetch} href={href} onClick={onClick} {...props} />;
  }

  const path = resolveHref(href);
  const resolved = path.startsWith("http") ? path : appPath(path);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e as never);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target === "_blank") return;
    e.preventDefault();
    window.location.assign(resolved);
  };

  const { children, className, ...rest } = props;

  return (
    <a href={resolved} onClick={handleClick} className={className} {...(rest as object)}>
      {children}
    </a>
  );
}
