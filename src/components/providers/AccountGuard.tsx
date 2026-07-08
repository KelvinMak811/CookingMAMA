"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccountStore } from "@/stores/accountStore";

const PUBLIC_PATHS = ["/account"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname === `${p}/`);
}

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(useAccountStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      const userId = useAccountStore.getState().currentUserId;
      if (!userId && !isPublicPath(pathname)) {
        window.location.replace("/account/");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return <>{children}</>;
}
