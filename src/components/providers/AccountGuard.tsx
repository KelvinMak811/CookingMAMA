"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/accountStore";

const PUBLIC_PATHS = ["/account"];

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAccountStore((s) => s.hydrated);
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve(useAccountStore.persist.rehydrate()).finally(() => {
      if (cancelled) return;
      useAccountStore.setState({ hydrated: true });
      setReady(true);
    });

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      useAccountStore.setState({ hydrated: true });
      setReady(true);
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready && !hydrated) return;
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname === `${p}/`
    );
    if (!currentUserId && !isPublic) {
      router.replace("/account/");
    }
  }, [ready, hydrated, currentUserId, pathname, router]);

  const canRender = ready || hydrated;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname === `${p}/`
  );

  if (!canRender && !isPublic) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 text-secondary">
        載入中…
      </div>
    );
  }

  return <>{children}</>;
}
