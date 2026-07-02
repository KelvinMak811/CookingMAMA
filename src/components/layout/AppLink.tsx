"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof Link>;

/** 站內連結 — 關閉 prefetch，避免 GitHub Pages 靜態部署導航失敗 */
export function AppLink({ prefetch = false, ...props }: AppLinkProps) {
  return <Link prefetch={prefetch} {...props} />;
}
