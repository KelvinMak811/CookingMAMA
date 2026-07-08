"use client";

import { useMemo } from "react";
import type { CookingRecord, MealPlan } from "@/types";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { CookingRecordCard } from "./CookingRecordCard";
import { PlannedMealCard } from "./PlannedMealCard";
import { formatDate, isSameDay } from "@/lib/utils";

interface CookingTimelineProps {
  filterDate?: Date;
  records?: CookingRecord[];
  plans?: MealPlan[];
  readOnly?: boolean;
}

export function CookingTimeline({
  filterDate,
  records: recordsProp,
  plans: plansProp,
  readOnly = false,
}: CookingTimelineProps) {
  const storeRecords = useCookingLogStore((s) => s.records);
  const storePlans = useMealPlanStore((s) => s.plans);
  const records = recordsProp ?? storeRecords;
  const plans = plansProp ?? storePlans;
  const removeRecord = useCookingLogStore((s) => s.removeRecord);
  const removePlan = useMealPlanStore((s) => s.removePlan);

  const filteredRecords = filterDate
    ? records.filter((r) => isSameDay(r.cookedDate, filterDate))
    : records;

  const filteredPlans = filterDate
    ? plans.filter((p) => isSameDay(p.plannedDate, filterDate))
    : plans;

  type TimelineEntry =
    | { type: "plan"; date: string; plan: (typeof plans)[0] }
    | { type: "record"; date: string; record: (typeof records)[0] };

  const entries = useMemo(() => {
    const list: TimelineEntry[] = [
      ...filteredPlans.map((p) => ({
        type: "plan" as const,
        date: p.plannedDate,
        plan: p,
      })),
      ...filteredRecords.map((r) => ({
        type: "record" as const,
        date: r.cookedDate,
        record: r,
      })),
    ];
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [filteredPlans, filteredRecords]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>();
    entries.forEach((e) => {
      const key = new Date(e.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="fs-1 mb-3">📅</div>
        <h5>未有紀錄</h5>
        <p className="text-secondary small">
          {filterDate
            ? "呢日未有預定或煮食紀錄，試下揀第二日"
            : "去菜式庫預定煮食日子，或者煮完打卡"}
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {grouped.map(([dateKeyVal, dayEntries]) => (
        <section key={dateKeyVal}>
          <h6 className="text-secondary border-start border-primary border-3 ps-2 mb-3">
            {formatDate(dayEntries[0].date)}
          </h6>
          <div className="d-flex flex-column gap-2 ps-2">
            {dayEntries.map((entry) =>
              entry.type === "plan" ? (
                <PlannedMealCard
                  key={entry.plan.id}
                  plan={entry.plan}
                  onRemove={readOnly ? undefined : removePlan}
                />
              ) : (
                <CookingRecordCard
                  key={entry.record.id}
                  record={entry.record}
                  onRemove={readOnly ? undefined : removeRecord}
                />
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
