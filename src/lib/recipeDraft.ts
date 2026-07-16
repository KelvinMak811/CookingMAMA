import type { CuisineType } from "@/types";

/** Instagram／貼文匯入後嘅菜式草稿（尚未儲存） */
export interface RecipeDraft {
  name: string;
  cuisine: CuisineType;
  description: string;
  difficulty: number;
  prepTime: number;
  baseServings: number;
  imageUrl: string;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  sourceUrl?: string;
  sourceNote?: string;
}

export function emptyRecipeDraft(partial?: Partial<RecipeDraft>): RecipeDraft {
  return {
    name: "",
    cuisine: "chinese",
    description: "",
    difficulty: 1,
    prepTime: 0,
    baseServings: 2,
    imageUrl: "",
    ingredients: [],
    steps: [],
    ...partial,
  };
}
