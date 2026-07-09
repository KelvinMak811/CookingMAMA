"use client";

import { useEffect } from "react";
import type { AccountId } from "@/lib/accounts";
import { AppShell } from "@/components/layout/AppShell";
import { UserToggle } from "@/components/account/UserToggle";
import { AddFridgeItemForm } from "@/components/fridge/AddFridgeItemForm";
import { FridgeList } from "@/components/fridge/FridgeList";
import { useViewingUserData } from "@/hooks/useViewingUserData";
import { useAccountStore } from "@/stores/accountStore";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";

export default function FridgePage() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const viewingUserId = useAccountStore((s) => s.viewingUserId);
  const setViewingUser = useAccountStore((s) => s.setViewingUser);
  const canEdit = useAccountStore((s) => s.canEditViewingUser);

  const activeViewId = (viewingUserId ?? currentUserId) as AccountId;
  const viewingData = useViewingUserData(activeViewId);
  const readOnly = !canEdit();

  useEffect(() => {
    if (currentUserId && viewingUserId === currentUserId) {
      void rehydrateAllUserStores();
    }
  }, [currentUserId, viewingUserId]);

  const displayItems = readOnly ? viewingData.fridgeItems : undefined;

  return (
    <AppShell title="雪櫃紀錄">
      {currentUserId && (
        <UserToggle
          viewingUserId={activeViewId}
          onChange={(id) => setViewingUser(id)}
        />
      )}
      <div className="d-flex flex-column gap-4">
        {!readOnly && <AddFridgeItemForm />}
        <FridgeList items={displayItems} readOnly={readOnly} />
      </div>
    </AppShell>
  );
}
