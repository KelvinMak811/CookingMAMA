export interface FoodLogEntry {
  id: string;
  loggedAt: string;
  name: string;
  calories: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  note?: string;
  photoDataUrl?: string;
  source?: "manual" | "photo-ai" | "photo-heuristic";
}

export interface CaloriePeriodStats {
  totalIntake: number;
  entryCount: number;
  avgPerDay: number;
  estimatedExpenditure: number | null;
  netBalance: number | null;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function sumCaloriesForRange(
  entries: FoodLogEntry[],
  start: Date,
  end: Date
): number {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return entries
    .filter((e) => {
      const t = new Date(e.loggedAt).getTime();
      return t >= startMs && t <= endMs;
    })
    .reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
}

export function statsForDay(
  entries: FoodLogEntry[],
  date: Date,
  dailyTdee: number | null
): CaloriePeriodStats {
  const key = dayKey(date.toISOString());
  const dayEntries = entries.filter((e) => dayKey(e.loggedAt) === key);
  const totalIntake = dayEntries.reduce((s, e) => s + e.calories, 0);
  return {
    totalIntake,
    entryCount: dayEntries.length,
    avgPerDay: totalIntake,
    estimatedExpenditure: dailyTdee,
    netBalance: dailyTdee != null ? dailyTdee - totalIntake : null,
  };
}

export function statsForWeek(
  entries: FoodLogEntry[],
  anchor: Date,
  dailyTdee: number | null
): CaloriePeriodStats {
  const start = new Date(anchor);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const totalIntake = sumCaloriesForRange(entries, start, end);
  const days = 7;
  return {
    totalIntake,
    entryCount: entries.filter((e) => {
      const t = new Date(e.loggedAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    }).length,
    avgPerDay: Math.round(totalIntake / days),
    estimatedExpenditure: dailyTdee != null ? dailyTdee * days : null,
    netBalance: dailyTdee != null ? dailyTdee * days - totalIntake : null,
  };
}

export function statsForMonth(
  entries: FoodLogEntry[],
  year: number,
  month: number,
  dailyTdee: number | null
): CaloriePeriodStats {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const totalIntake = sumCaloriesForRange(entries, start, end);
  const daysInMonth = end.getDate();
  return {
    totalIntake,
    entryCount: entries.filter((e) => {
      const t = new Date(e.loggedAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    }).length,
    avgPerDay: Math.round(totalIntake / daysInMonth),
    estimatedExpenditure: dailyTdee != null ? dailyTdee * daysInMonth : null,
    netBalance: dailyTdee != null ? dailyTdee * daysInMonth - totalIntake : null,
  };
}

export function overallAverageDailyIntake(entries: FoodLogEntry[]): number {
  if (!entries.length) return 0;
  const byDay = new Map<string, number>();
  for (const e of entries) {
    const k = dayKey(e.loggedAt);
    byDay.set(k, (byDay.get(k) || 0) + e.calories);
  }
  const totals = [...byDay.values()];
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}
