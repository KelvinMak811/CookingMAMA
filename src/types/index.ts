export type CuisineType = "chinese" | "western" | "japanese" | "italian";

export const CUISINE_LABELS: Record<CuisineType, string> = {
  chinese: "中餐",
  western: "西餐",
  japanese: "日式",
  italian: "意式",
};

// 菜式模型
export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: CuisineType;
  baseServings: number;
  difficulty: number;
  prepTime: number;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  isCustom?: boolean;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 食材模型
export interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

// 買餸清單項目模型
export interface ShoppingItem {
  id: string;
  ingredientName: string;
  amount?: string;
  recipeId?: string;
  recipeName?: string;
  isBought: boolean;
  price: number;
  addedAt: string;
  /** 標記已購買嘅日期（用於開支紀錄） */
  boughtAt?: string;
}

// 煮食紀錄模型（已完成）
export interface CookingRecord {
  id: string;
  recipeId: string;
  recipeName: string;
  cookedDate: string;
  rating?: number;
}

// 煮食預定模型（計劃中）
export interface MealPlan {
  id: string;
  recipeId: string;
  recipeName: string;
  plannedDate: string;
  servings: number;
  mealBatches: number;
  createdAt: string;
}
