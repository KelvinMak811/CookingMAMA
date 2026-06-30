"use client";

import { useState } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { AppShell } from "@/components/layout/AppShell";
import { CookingCalendar } from "@/components/history/CookingCalendar";
import { CookingTimeline } from "@/components/history/CookingTimeline";
import { DateQuickNav } from "@/components/history/DateQuickNav";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import { useMealPlanStore } from "@/stores/mealPlanStore";

type ViewMode = "calendar" | "timeline";

export default function HistoryPage() {
  const [view, setView] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const records = useCookingLogStore((s) => s.records);
  const plans = useMealPlanStore((s) => s.plans);

  return (
    <AppShell title="煮食紀錄">
      <p className="text-secondary small mb-3">
        藍點係預定煮食，綠點係已完成。撳日子快速查看。
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
        />
      ) : (
        <CookingTimeline filterDate={selectedDate} />
      )}
    </AppShell>
  );
}
