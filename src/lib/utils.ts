export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatCurrency(amount: number): string {
  return `HK$${amount.toFixed(2)}`;
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
