"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAccountStore } from "@/stores/accountStore";

const PUBLIC_PATHS = ["/account"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname === `${p}/`);
}

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    void Promise.resolve(useAccountStore.persist.rehydrate()).then(() => {
      useAccountStore.setState({ hydrated: true });
      const userId = useAccountStore.getState().currentUserId;
      if (!userId && !isPublicPath(pathname)) {
        window.location.replace("/account/");
      }
    });
  }, [pathname]);

  return <>{children}</>;
}
