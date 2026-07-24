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

/** 肉類／蛋白質：用菜名 + 材料名關鍵字配對 */
export const MEAT_FILTERS: IngredientFilterOption<MeatFilterId>[] = [
  { id: "pork", label: "豬肉" },
  { id: "beef", label: "牛肉" },
  { id: "chicken", label: "雞肉" },
  { id: "seafood", label: "海鮮" },
  { id: "egg", label: "蛋" },
  { id: "tofu_veg", label: "豆腐／素" },
];

/** 蔬菜：港式家常常見類別（對齊現有 recipes 材料） */
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

export const MEAT_FILTER_IDS = MEAT_FILTERS.map((f) => f.id);
export const VEG_FILTER_IDS = VEG_FILTERS.map((f) => f.id);

function recipeHaystack(recipe: Recipe): string {
  return [recipe.name, ...recipe.ingredients.map((ing) => ing.name)].join(" ");
}

function hasPork(h: string): boolean {
  return /豬|猪|五花腩|排骨|一字排|臘腸|腊肠|培根|烟肉|煙肉|火腿|火腩|意式香肠|意式香腸|炸吉列豬/.test(
    h
  );
}

function hasBeef(h: string): boolean {
  // 避開 牛油／牛油果／水牛芝士
  const cleaned = h.replace(/牛油果?|水牛/g, "");
  return /牛/.test(cleaned);
}

function hasChicken(h: string): boolean {
  const cleaned = h.replace(/雞蛋|鸡蛋|皮蛋|鹹蛋|咸蛋|蛋黃|生食級雞蛋/g, "");
  return /雞|鸡/.test(cleaned);
}

function hasSeafood(h: string): boolean {
  return /魚(?!膠)|鱼(?!胶)|虾|蝦|蟹|魷|鱿|蜆|蚬|帶子|带子|扇貝|扇贝|青口|龍蝦|龙虾|三文|石斑|鱸|鲈|鲭|鯖|海鮮|海鲜|明太子/.test(
    h
  );
}

function hasEgg(h: string): boolean {
  return (
    /雞蛋|鸡蛋|蛋黃|皮蛋|鹹蛋|咸蛋|生食級雞蛋|蛋液/.test(h) ||
    /炒蛋|蒸蛋|蛋治/.test(h)
  );
}

function hasTofuOrVeggie(h: string): boolean {
  if (/豆腐|腐乳/.test(h)) return true;
  return !hasPork(h) && !hasBeef(h) && !hasChicken(h) && !hasSeafood(h);
}

const MEAT_MATCHERS: Record<MeatFilterId, (h: string) => boolean> = {
  pork: hasPork,
  beef: hasBeef,
  chicken: hasChicken,
  seafood: hasSeafood,
  egg: hasEgg,
  tofu_veg: hasTofuOrVeggie,
};

const VEG_MATCHERS: Record<VegFilterId, (h: string) => boolean> = {
  choy_sum: (h) => /菜心/.test(h),
  water_spinach: (h) => /通菜|水菜|空心菜/.test(h),
  tomato: (h) => /番茄|蕃茄|车厘茄|車厘茄/.test(h),
  onion: (h) => /洋蔥|洋葱|紅蔥頭|红葱头/.test(h),
  eggplant: (h) => /茄子|圓茄子|圆茄子/.test(h),
  broccoli: (h) => /西蘭花|西兰花/.test(h),
  carrot: (h) => /甘筍|甘笋|胡蘿蔔|胡萝卜/.test(h),
  potato: (h) => /薯仔|马铃薯|馬鈴薯|土豆/.test(h),
  mushroom: (h) =>
    /蘑菇|金針菇|金针菇|香菇|冬菇|草菇|雜菌|杂菌|鲜蘑菇|鮮蘑菇|鮮白蘑菇|鲜白蘑菇/.test(
      h
    ),
  pepper: (h) => /青椒|紅椒|红椒|三色椒|青紅椒|青红椒|彩椒/.test(h),
  gai_lan: (h) => /芥蘭|芥兰/.test(h),
  bitter_melon: (h) => /涼瓜|凉瓜|苦瓜/.test(h),
};

export function recipeMatchesMeatFilter(
  recipe: Recipe,
  filterId: MeatFilterId
): boolean {
  return MEAT_MATCHERS[filterId](recipeHaystack(recipe));
}

export function recipeMatchesVegFilter(
  recipe: Recipe,
  filterId: VegFilterId
): boolean {
  return VEG_MATCHERS[filterId](recipeHaystack(recipe));
}

/**
 * 篩選規則：
 * - 同組（多個肉／多個菜）→ OR
 * - 跨組（肉 + 菜）→ AND
 * - 內建同自訂菜式都以材料名／菜名配對
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
