import type { ShoppingItem } from "@/types";

const AMOUNT_IN_NAME = /^(.+?)（(.+)）$/;

/** 將舊格式「雞蛋（4隻）」遷移為獨立欄位 */
export function migrateShoppingItem(item: ShoppingItem): ShoppingItem {
  if (item.amount !== undefined && item.amount !== "") {
    return item;
  }
  const match = item.ingredientName.match(AMOUNT_IN_NAME);
  if (match) {
    return {
      ...item,
      ingredientName: match[1].trim(),
      amount: match[2].trim(),
    };
  }
  return { ...item, amount: item.amount ?? "" };
}

export function shoppingItemKey(item: Pick<ShoppingItem, "ingredientName" | "amount" | "recipeId">): string {
  return `${item.recipeId ?? "manual"}|${item.ingredientName.toLowerCase()}|${item.amount ?? ""}`;
}

export function formatShoppingSpeech(item: ShoppingItem): string {
  const parts = [item.ingredientName];
  if (item.amount) parts.push(item.amount);
  if (item.recipeName) parts.push(`用於${item.recipeName}`);
  return parts.join("，");
}
