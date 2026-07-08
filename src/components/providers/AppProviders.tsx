"use client";

import { useEffect } from "react";
import {
  configureCloudSync,
  syncOnAppLoad,
} from "@/lib/cloud-sync";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";
import { useAccountStore } from "@/stores/accountStore";
import { AccountGuard } from "@/components/providers/AccountGuard";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrated = useAccountStore((s) => s.hydrated);
  const currentUserId = useAccountStore((s) => s.currentUserId);

  useEffect(() => {
    configureCloudSync({
      getCurrentUserId: () => useAccountStore.getState().currentUserId,
      onApplied: () => {
        void rehydrateAllUserStores();
      },
    });
  }, []);

  useEffect(() => {
    if (!hydrated || !currentUserId) return;
    void (async () => {
      try {
        await syncOnAppLoad();
      } catch {
        /* sync optional until database is connected */
      }
      await rehydrateAllUserStores();
    })();
  }, [hydrated, currentUserId]);

  return <AccountGuard>{children}</AccountGuard>;
}
