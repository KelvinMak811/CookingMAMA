"use client";

import { useMemo } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import type { CookingRecord, MealPlan } from "@/types";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { DaySchedulePanel } from "./DaySchedulePanel";
import { isSameDay } from "@/lib/utils";
import { dateKey } from "@/lib/dateNav";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

interface CookingCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  records?: CookingRecord[];
  plans?: MealPlan[];
  readOnly?: boolean;
}

export function CookingCalendar({
  selectedDate,
  onSelectDate,
  records: recordsProp,
  plans: plansProp,
  readOnly = false,
}: CookingCalendarProps) {
  const today = new Date();
  const viewDate = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate]
  );

  const storeRecords = useCookingLogStore((s) => s.records);
  const storePlans = useMealPlanStore((s) => s.plans);
  const records = recordsProp ?? storeRecords;
  const plans = plansProp ?? storePlans;
  const removeRecord = useCookingLogStore((s) => s.removeRecord);
  const removePlan = useMealPlanStore((s) => s.removePlan);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month]);

  const selectedPlans = plans.filter((p) => isSameDay(p.plannedDate, selectedDate));
  const selectedRecords = records.filter((r) => isSameDay(r.cookedDate, selectedDate));

  const datesWithRecords = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(dateKey(new Date(r.cookedDate))));
    return set;
  }, [records]);

  const datesWithPlans = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => set.add(dateKey(new Date(p.plannedDate))));
    return set;
  }, [plans]);

  const prevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    onSelectDate(d);
  };

  const nextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    onSelectDate(d);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <Button variant="light" size="sm" onClick={prevMonth} aria-label="上個月">
              ‹
            </Button>
            <h5 className="mb-0 fw-bold">
              {year}年{month + 1}月
            </h5>
            <Button variant="light" size="sm" onClick={nextMonth} aria-label="下個月">
              ›
            </Button>
          </div>

          <div className="d-flex justify-content-center gap-3 small text-secondary mb-3">
            <span>
              <span className="d-inline-block rounded-circle bg-info me-1" style={{ width: 8, height: 8 }} />
              預定
            </span>
            <span>
              <span className="d-inline-block rounded-circle bg-success me-1" style={{ width: 8, height: 8 }} />
              已完成
            </span>
          </div>

          <div className="row g-1 text-center small text-secondary mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="col">
                {d}
              </div>
            ))}
          </div>

          <div className="row g-1">
            {calendarDays.map((day, i) => {
              if (!day)
                return (
                  <div
                    key={`empty-${i}`}
                    className="col"
                    style={{ flex: "0 0 14.28%", maxWidth: "14.28%" }}
                  />
                );
              const key = dateKey(day);
              const hasRecord = datesWithRecords.has(key);
              const hasPlan = datesWithPlans.has(key);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={key}
                  className="col"
                  style={{ flex: "0 0 14.28%", maxWidth: "14.28%" }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectDate(day)}
                    className={`btn w-100 p-2 rounded-3 position-relative ${isSelected ? "btn-primary" : isToday ? "btn-warning-subtle" : "btn-light"}`}
                  >
                    {day.getDate()}
                    {(hasPlan || hasRecord) && (
                      <span className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-1 mb-1">
                        {hasPlan && (
                          <span
                            className={`rounded-circle ${isSelected ? "bg-white" : "bg-info"}`}
                            style={{ width: 5, height: 5 }}
                          />
                        )}
                        {hasRecord && (
                          <span
                            className={`rounded-circle ${isSelected ? "bg-white" : "bg-success"}`}
                            style={{ width: 5, height: 5 }}
                          />
                        )}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <DaySchedulePanel
        selectedDate={selectedDate}
        plans={selectedPlans}
        records={selectedRecords}
        onRemovePlan={readOnly ? undefined : removePlan}
        onRemoveRecord={readOnly ? undefined : removeRecord}
      />
    </div>
  );
}
