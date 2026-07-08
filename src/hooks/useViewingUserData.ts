"use client";

import { useEffect, useState } from "react";
import type { AccountId } from "@/lib/accounts";
import type { CookingRecord, MealPlan, ShoppingItem } from "@/types";
import { syncPullAccount } from "@/lib/cloud-sync";
import { STORAGE_KEYS, loadUserPersistState } from "@/lib/storage";
import { migrateShoppingItem } from "@/lib/shoppingUtils";

interface ViewingUserData {
  items: ShoppingItem[];
  records: CookingRecord[];
  plans: MealPlan[];
}

function loadViewingData(userId: AccountId): ViewingUserData {
  const shopping = loadUserPersistState(STORAGE_KEYS.SHOPPING, userId, { items: [] as ShoppingItem[] });
  const cooking = loadUserPersistState(STORAGE_KEYS.COOKING_LOG, userId, { records: [] as CookingRecord[] });
  const meal = loadUserPersistState(STORAGE_KEYS.MEAL_PLAN, userId, { plans: [] as MealPlan[] });

  return {
    items: (shopping.items ?? []).map(migrateShoppingItem),
    records: cooking.records ?? [],
    plans: meal.plans ?? [],
  };
}

/** 讀取指定帳戶資料（先從伺服器同步，再讀 localStorage） */
export function useViewingUserData(viewingUserId: AccountId | null): ViewingUserData {
  const [data, setData] = useState<ViewingUserData>({
    items: [],
    records: [],
    plans: [],
  });

  useEffect(() => {
    if (!viewingUserId) return;
    let cancelled = false;

    const refresh = () => {
      if (!cancelled) setData(loadViewingData(viewingUserId));
    };

    void (async () => {
      await syncPullAccount(viewingUserId);
      refresh();
    })();

    const onStorage = (e: StorageEvent) => {
      if (!e.key?.includes(viewingUserId)) return;
      refresh();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [viewingUserId]);

  return data;
}

export function refreshViewingUserData(userId: AccountId): ViewingUserData {
  return loadViewingData(userId);
}
