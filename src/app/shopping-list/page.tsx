"use client";

import { useEffect } from "react";
import type { AccountId } from "@/lib/accounts";
import { AppShell } from "@/components/layout/AppShell";
import { UserToggle } from "@/components/account/UserToggle";
import { AddShoppingItemForm } from "@/components/shopping/AddShoppingItemForm";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { ShoppingTotal } from "@/components/shopping/ShoppingTotal";
import { ReadUnboughtButton } from "@/components/shopping/ReadUnboughtButton";
import { useViewingUserData } from "@/hooks/useViewingUserData";
import { useAccountStore } from "@/stores/accountStore";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";

export default function ShoppingListPage() {
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

  const displayItems = readOnly ? viewingData.items : undefined;

  return (
    <AppShell title="買餸清單">
      {currentUserId && (
        <UserToggle
          viewingUserId={activeViewId}
          onChange={(id) => setViewingUser(id)}
        />
      )}
      <div className="d-flex flex-column gap-4">
        {!readOnly && <AddShoppingItemForm />}
        {!readOnly && <ReadUnboughtButton />}
        <ShoppingList items={displayItems} readOnly={readOnly} />
        <ShoppingTotal items={displayItems} />
      </div>
    </AppShell>
  );
}
