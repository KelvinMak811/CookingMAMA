import type { Recipe } from "@/types";

export type MeatFilterId =
  | "pork"
  | "beef"
  | "chicken"
  | "seafood"
  | "egg"
  | "tofu_veg";

export type VegFilterId =
  | "choy_sum"
  | "water_spinach"
  | "tomato"
  | "onion"
  | "eggplant"
  | "broccoli"
  | "carrot"
  | "potato"
  | "mushroom"
  | "pepper"
  | "gai_lan"
  | "bitter_melon";

export interface IngredientFilterOption<T extends string> {
  id: T;
  label: string;
}

/** 肉類／蛋白質：用材料名關鍵字配對（含簡繁同常見寫法） */
export const MEAT_FILTERS: IngredientFilterOption<MeatFilterId>[] = [
  { id: "pork", label: "豬肉" },
  { id: "beef", label: "牛肉" },
  { id: "chicken", label: "雞肉" },
  { id: "seafood", label: "海鮮" },
  { id: "egg", label: "蛋" },
  { id: "tofu_veg", label: "豆腐／素" },
];

/** 蔬菜：港式家常常見類別 */
export const VEG_FILTERS: IngredientFilterOption<VegFilterId>[] = [
  { id: "choy_sum", label: "菜心" },
  { id: "water_spinach", label: "通菜" },
  { id: "tomato", label: "番茄" },
  { id: "onion", label: "洋蔥" },
  { id: "eggplant", label: "茄子" },
  { id: "broccoli", label: "西蘭花" },
  { id: "carrot", label: "甘筍" },
  { id: "potato", label: "薯仔" },
  { id: "mushroom", label: "菇菌" },
  { id: "pepper", label: "椒類" },
  { id: "gai_lan", label: "芥蘭" },
  { id: "bitter_melon", label: "涼瓜" },
];

const MEAT_KEYWORDS: Record<Exclude<MeatFilterId, "tofu_veg">, string[]> = {
  pork: [
    "豬",
    "猪",
    "五花腩",
    "排骨",
    "一字排",
    "臘腸",
    "腊肠",
    "煙肉",
    "烟肉",
    "培根",
    "火腿",
    "火腩",
    "香肠",
    "香腸",
  ],
  beef: ["牛", "肥牛", "和牛"],
  chicken: ["雞", "鸡"],
  seafood: [
    "魚",
    "鱼",
    "蝦",
    "虾",
    "蟹",
    "蜆",
    "魷",
    "鱿",
    "帶子",
    "带子",
    "扇貝",
    "扇贝",
    "三文",
    "鯖",
    "鲭",
    "鱸",
    "鲈",
    "石斑",
    "青口",
    "龍蝦",
    "龙虾",
    "海鮮",
    "海鲜",
  ],
  egg: ["蛋"],
};

const VEG_KEYWORDS: Record<VegFilterId, string[]> = {
  choy_sum: ["菜心"],
  water_spinach: ["通菜", "莧菜", "苋菜"],
  tomato: ["番茄", "車厘茄", "车厘茄", "蕃茄"],
  onion: ["洋蔥", "洋葱", "紅蔥頭", "红葱头"],
  eggplant: ["茄子", "圓茄子", "圆茄子"],
  broccoli: ["西蘭花", "西兰花"],
  carrot: ["甘筍", "甘笋", "胡蘿蔔", "胡萝卜"],
  potato: ["薯仔", "馬鈴薯", "马铃薯", "土豆"],
  mushroom: [
    "蘑菇",
    "金針菇",
    "金针菇",
    "冬菇",
    "香菇",
    "草菇",
    "雜菌",
    "杂菌",
    "鮮白蘑菇",
    "鲜白蘑菇",
  ],
  pepper: ["青椒", "紅椒", "红椒", "三色椒", "青紅椒", "青红椒", "彩椒"],
  gai_lan: ["芥蘭", "芥兰"],
  bitter_melon: ["涼瓜", "凉瓜", "苦瓜"],
};

/** 判斷「豆腐／素」時要排除嘅肉類關鍵字（湯底雞湯都算非素） */
const ANIMAL_PROTEIN_KEYWORDS = [
  ...MEAT_KEYWORDS.pork,
  ...MEAT_KEYWORDS.beef,
  ...MEAT_KEYWORDS.chicken,
  ...MEAT_KEYWORDS.seafood,
  "肉",
];

const TOFU_KEYWORDS = ["豆腐", "腐乳"];

function recipeIngredientText(recipe: Recipe): string {
  return recipe.ingredients.map((ing) => ing.name).join("\n").toLowerCase();
}

function textHasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

export function recipeMatchesMeatFilter(
  recipe: Recipe,
  filterId: MeatFilterId
): boolean {
  const text = recipeIngredientText(recipe);

  if (filterId === "tofu_veg") {
    if (textHasAny(text, TOFU_KEYWORDS)) return true;
    return !textHasAny(text, ANIMAL_PROTEIN_KEYWORDS);
  }

  return textHasAny(text, MEAT_KEYWORDS[filterId]);
}

export function recipeMatchesVegFilter(
  recipe: Recipe,
  filterId: VegFilterId
): boolean {
  return textHasAny(recipeIngredientText(recipe), VEG_KEYWORDS[filterId]);
}

/**
 * 篩選規則：
 * - 同組（多個肉／多個菜）→ OR
 * - 跨組（肉 + 菜）→ AND
 * - 自訂菜式同樣用材料名配對
 */
export function filterRecipesByIngredients(
  recipeList: Recipe[],
  meats: MeatFilterId[],
  vegs: VegFilterId[]
): Recipe[] {
  if (meats.length === 0 && vegs.length === 0) return recipeList;

  return recipeList.filter((recipe) => {
    const meatOk =
      meats.length === 0 ||
      meats.some((id) => recipeMatchesMeatFilter(recipe, id));
    const vegOk =
      vegs.length === 0 ||
      vegs.some((id) => recipeMatchesVegFilter(recipe, id));
    return meatOk && vegOk;
  });
}

export function parseFilterIds<T extends string>(
  raw: string | null,
  validIds: readonly T[]
): T[] {
  if (!raw?.trim()) return [];
  const allowed = new Set<string>(validIds);
  const seen = new Set<T>();
  const result: T[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim() as T;
    if (allowed.has(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

export function serializeFilterIds(ids: string[]): string | null {
  return ids.length > 0 ? ids.join(",") : null;
}

export const MEAT_FILTER_IDS = MEAT_FILTERS.map((f) => f.id);
export const VEG_FILTER_IDS = VEG_FILTERS.map((f) => f.id);
