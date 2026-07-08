"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/accountStore";

const PUBLIC_PATHS = ["/account"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname === `${p}/`);
}

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void useAccountStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve(useAccountStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      useAccountStore.setState({ hydrated: true });

      const userId = useAccountStore.getState().currentUserId;
      if (!userId && !isPublicPath(pathname)) {
        router.replace("/account/");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}
