import type { Ingredient } from "@/types";

const FIXED_AMOUNTS = /適量|少許|隨意/;

/** 將材料份量按人數同煮幾多餐倍數調整 */
export function scaleAmount(amount: string, factor: number): string {
  if (factor === 1 || FIXED_AMOUNTS.test(amount)) return amount;

  // 半茶匙、半個 等
  const halfMatch = amount.match(/^半(.+)$/);
  if (halfMatch && factor === 2) return `1${halfMatch[1]}`;
  if (halfMatch) return amount;

  // 數字 + 單位（有空格或冇空格）：300g、4隻、2 湯匙
  const numMatch = amount.match(/^([\d.]+)\s*(.*)$/);
  if (numMatch) {
    const scaled = parseFloat(numMatch[1]) * factor;
    const unit = numMatch[2];
    const formatted = Number.isInteger(scaled)
      ? String(scaled)
      : scaled.toFixed(1).replace(/\.0$/, "");
    return unit ? `${formatted}${unit.startsWith(" ") ? " " : ""}${unit.trim()}` : formatted;
  }

  return amount;
}

export function scaleIngredients(
  ingredients: Ingredient[],
  baseServings: number,
  servings: number,
  mealBatches: number
): Ingredient[] {
  const factor = (servings / baseServings) * mealBatches;
  return ingredients.map((ing) => ({
    ...ing,
    amount: scaleAmount(ing.amount, factor),
  }));
}

export function formatShoppingIngredient(name: string, amount: string): string {
  if (FIXED_AMOUNTS.test(amount)) return name;
  return `${name}（${amount}）`;
}
