"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { AppShell } from "@/components/layout/AppShell";
import { UserToggle } from "@/components/account/UserToggle";
import { CookingCalendar } from "@/components/history/CookingCalendar";
import { CookingTimeline } from "@/components/history/CookingTimeline";
import { DateQuickNav } from "@/components/history/DateQuickNav";
import { isAccountId, type AccountId } from "@/lib/accounts";
import { syncPullAccount } from "@/lib/cloud-sync";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";
import { useViewingUserData } from "@/hooks/useViewingUserData";
import { useAccountStore } from "@/stores/accountStore";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import { useMealPlanStore } from "@/stores/mealPlanStore";

type ViewMode = "calendar" | "timeline";

export function HistoryPageClient() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentUserId = useAccountStore((s) => s.currentUserId);
  const viewingUserId = useAccountStore((s) => s.viewingUserId);
  const setViewingUser = useAccountStore((s) => s.setViewingUser);
  const canEdit = useAccountStore((s) => s.canEditViewingUser);

  useEffect(() => {
    const user = searchParams.get("user");
    if (user && isAccountId(user)) {
      setViewingUser(user);
    }
  }, [searchParams, setViewingUser]);

  const activeViewId = (viewingUserId ?? currentUserId) as AccountId;

  useEffect(() => {
    if (!activeViewId) return;
    let cancelled = false;
    void (async () => {
      const changed = await syncPullAccount(activeViewId);
      if (cancelled) return;
      if (changed && currentUserId && activeViewId === currentUserId) {
        await rehydrateAllUserStores();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeViewId, currentUserId]);

  const viewingData = useViewingUserData(activeViewId);
  const readOnly = !canEdit();

  const storeRecords = useCookingLogStore((s) => s.records);
  const storePlans = useMealPlanStore((s) => s.plans);
  const records = readOnly ? viewingData.records : storeRecords;
  const plans = readOnly ? viewingData.plans : storePlans;

  return (
    <AppShell title="煮食日曆">
      {currentUserId && (
        <UserToggle
          viewingUserId={activeViewId}
          onChange={(id) => setViewingUser(id)}
        />
      )}
      <p className="text-secondary small mb-3">
        撳日子查看預定煮食（藍點）同已完成（綠點）。可切換日曆或時間軸檢視。
      </p>

      <DateQuickNav
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        records={records}
        plans={plans}
      />

      <ButtonGroup className="w-100 mb-4">
        {(
          [
            { value: "calendar", label: "📅 日曆" },
            { value: "timeline", label: "📋 時間軸" },
          ] as const
        ).map((opt) => (
          <ToggleButton
            key={opt.value}
            id={`view-${opt.value}`}
            type="radio"
            variant="outline-primary"
            name="view"
            value={opt.value}
            checked={view === opt.value}
            onChange={() => setView(opt.value)}
            className="flex-fill"
          >
            {opt.label}
          </ToggleButton>
        ))}
      </ButtonGroup>

      {view === "calendar" ? (
        <CookingCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          records={records}
          plans={plans}
          readOnly={readOnly}
        />
      ) : (
        <CookingTimeline
          filterDate={selectedDate}
          records={records}
          plans={plans}
          readOnly={readOnly}
        />
      )}
    </AppShell>
  );
}
