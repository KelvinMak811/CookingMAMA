"use client";

import type { CookingRecord, MealPlan } from "@/types";
import { CookingRecordCard } from "./CookingRecordCard";
import { PlannedMealCard } from "./PlannedMealCard";

interface DaySchedulePanelProps {
  selectedDate: Date;
  plans: MealPlan[];
  records: CookingRecord[];
  onRemovePlan?: (id: string) => void;
  onRemoveRecord?: (id: string) => void;
}

export function DaySchedulePanel({
  selectedDate,
  plans,
  records,
  onRemovePlan,
  onRemoveRecord,
}: DaySchedulePanelProps) {
  const dateLabel = selectedDate.toLocaleDateString("zh-HK", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const isEmpty = plans.length === 0 && records.length === 0;

  return (
    <div>
      <h6 className="text-secondary mb-3">{dateLabel}</h6>

      {isEmpty ? (
        <p className="text-center text-secondary py-4 small">
          呢日未有預定或者煮食紀錄
        </p>
      ) : (
        <div className="d-flex flex-column gap-4">
          {plans.length > 0 && (
            <section>
              <h6 className="small fw-semibold text-info mb-2">
                📋 預定煮食（{plans.length}）
              </h6>
              <div className="d-flex flex-column gap-2">
                {plans.map((plan) => (
                  <PlannedMealCard
                    key={plan.id}
                    plan={plan}
                    onRemove={onRemovePlan}
                  />
                ))}
              </div>
            </section>
          )}

          {records.length > 0 && (
            <section>
              <h6 className="small fw-semibold text-success mb-2">
                ✅ 已完成（{records.length}）
              </h6>
              <div className="d-flex flex-column gap-2">
                {records.map((record) => (
                  <CookingRecordCard
                    key={record.id}
                    record={record}
                    onRemove={onRemoveRecord}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
