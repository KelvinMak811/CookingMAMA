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
  useEffect(() => {
    configureCloudSync({
      getCurrentUserId: () => useAccountStore.getState().currentUserId,
      onApplied: () => {
        void rehydrateAllUserStores();
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve(useAccountStore.persist.rehydrate());
      if (cancelled) return;
      const currentUserId = useAccountStore.getState().currentUserId;
      if (!currentUserId) return;
      try {
        await syncOnAppLoad();
      } catch {
        /* sync optional until database is connected */
      }
      await rehydrateAllUserStores();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <AccountGuard>{children}</AccountGuard>;
}
