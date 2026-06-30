import type { CookingRecord, MealPlan } from "@/types";
import { isSameDay } from "./utils";

/** 產生以 anchor 為中心嘅日期列表 */
export function getDateRange(anchor: Date, daysBefore: number, daysAfter: number): Date[] {
  const dates: Date[] = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(anchor);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateInputValue(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayLabel(date: Date): string {
  const today = new Date();
  if (isSameDay(date, today)) return "今日";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return "昨日";
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);
  if (isSameDay(date, dayBefore)) return "前日";
  return date.toLocaleDateString("zh-HK", { month: "numeric", day: "numeric" });
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString("zh-HK", { weekday: "short" });
}

export function hasRecordOnDate(records: CookingRecord[], date: Date): boolean {
  return records.some((r) => isSameDay(r.cookedDate, date));
}

export function hasPlanOnDate(plans: MealPlan[], date: Date): boolean {
  return plans.some((p) => isSameDay(p.plannedDate, date));
}

export function hasAnyOnDate(
  records: CookingRecord[],
  plans: MealPlan[],
  date: Date
): { hasRecord: boolean; hasPlan: boolean } {
  return {
    hasRecord: hasRecordOnDate(records, date),
    hasPlan: hasPlanOnDate(plans, date),
  };
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
