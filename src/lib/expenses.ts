import type { CookingRecord, ShoppingItem } from "@/types";
import { dateKey } from "@/lib/dateNav";
import { formatCurrency } from "@/lib/utils";

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface DayExpenseGroup {
  dateKey: string;
  label: string;
  items: {
    id: string;
    name: string;
    amount?: string;
    price: number;
    recipeName?: string;
  }[];
  total: number;
}

export interface MonthExpenseStats {
  totalSpend: number;
  mealCount: number;
  avgPerMeal: number;
  avgMealsPerMonth: number;
  avgSpendPerMonth: number;
  dayCount: number;
}

const CHART_COLORS = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#64748b",
];

export function getExpenseDate(item: ShoppingItem): Date {
  if (item.boughtAt) return new Date(item.boughtAt);
  if (item.isBought) return new Date(item.addedAt);
  return new Date(item.addedAt);
}

export function getBoughtItemsWithPrice(items: ShoppingItem[]): ShoppingItem[] {
  return items.filter((item) => item.isBought && item.price > 0);
}

export function filterByMonth<T extends { date: Date }>(
  entries: T[],
  year: number,
  month: number
): T[] {
  return entries.filter(
    (e) => e.date.getFullYear() === year && e.date.getMonth() === month
  );
}

export function groupExpensesByDay(
  items: ShoppingItem[],
  year: number,
  month: number
): DayExpenseGroup[] {
  const map = new Map<string, DayExpenseGroup>();

  for (const item of getBoughtItemsWithPrice(items)) {
    const date = getExpenseDate(item);
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;

    const key = dateKey(date);
    const label = date.toLocaleDateString("zh-HK", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    if (!map.has(key)) {
      map.set(key, { dateKey: key, label, items: [], total: 0 });
    }
    const group = map.get(key)!;
    group.items.push({
      id: item.id,
      name: item.ingredientName,
      amount: item.amount,
      price: item.price,
      recipeName: item.recipeName,
    });
    group.total += item.price;
  }

  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function spendingByRecipe(
  items: ShoppingItem[],
  year: number,
  month: number
): ChartSlice[] {
  const totals = new Map<string, number>();

  for (const item of getBoughtItemsWithPrice(items)) {
    const date = getExpenseDate(item);
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;
    const label = item.recipeName ?? "其他食材";
    totals.set(label, (totals.get(label) ?? 0) + item.price);
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
}

export function monthlyMealChart(
  records: CookingRecord[],
  year: number
): ChartSlice[] {
  const totals = new Map<number, number>();

  for (const record of records) {
    const d = new Date(record.cookedDate);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    totals.set(m, (totals.get(m) ?? 0) + 1);
  }

  return [...totals.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([month, value]) => ({
      label: `${month + 1}月`,
      value,
      color: CHART_COLORS[month % CHART_COLORS.length],
    }));
}

export function computeMonthStats(
  items: ShoppingItem[],
  records: CookingRecord[],
  year: number,
  month: number
): MonthExpenseStats {
  const monthItems = getBoughtItemsWithPrice(items).filter((item) => {
    const d = getExpenseDate(item);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const totalSpend = monthItems.reduce((sum, item) => sum + item.price, 0);

  const mealCount = records.filter((r) => {
    const d = new Date(r.cookedDate);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  const daysWithSpend = new Set(
    monthItems.map((item) => dateKey(getExpenseDate(item)))
  ).size;

  const monthsWithMeals = new Set(
    records.map((r) => {
      const d = new Date(r.cookedDate);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })
  ).size;

  const monthsWithSpend = new Set(
    getBoughtItemsWithPrice(items).map((item) => {
      const d = getExpenseDate(item);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })
  ).size;

  const totalMeals = records.length;
  const totalAllSpend = getBoughtItemsWithPrice(items).reduce(
    (sum, item) => sum + item.price,
    0
  );

  return {
    totalSpend,
    mealCount,
    avgPerMeal: mealCount > 0 ? totalSpend / mealCount : 0,
    avgMealsPerMonth: monthsWithMeals > 0 ? totalMeals / monthsWithMeals : 0,
    avgSpendPerMonth: monthsWithSpend > 0 ? totalAllSpend / monthsWithSpend : 0,
    dayCount: daysWithSpend,
  };
}

export function formatDayTotal(amount: number): string {
  return formatCurrency(amount);
}
