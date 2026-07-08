"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/accountStore";

const PUBLIC_PATHS = ["/account"];

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAccountStore((s) => s.hydrated);
  const currentUserId = useAccountStore((s) => s.currentUserId);

  useEffect(() => {
    if (!hydrated) return;
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname === `${p}/`
    );
    if (!currentUserId && !isPublic) {
      router.replace("/account/");
    }
  }, [hydrated, currentUserId, pathname, router]);

  if (!hydrated) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 text-secondary">
        載入中…
      </div>
    );
  }

  return <>{children}</>;
}
