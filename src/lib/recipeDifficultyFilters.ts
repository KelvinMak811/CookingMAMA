import type { Recipe } from "@/types";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type DifficultySort = "asc" | "desc";

export interface DifficultyFilterOption {
  id: DifficultyLevel;
  label: string;
}

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;

export const DIFFICULTY_FILTERS: DifficultyFilterOption[] = [
  { id: 1, label: "1星" },
  { id: 2, label: "2星" },
  { id: 3, label: "3星" },
  { id: 4, label: "4星" },
  { id: 5, label: "5星" },
];

export function normalizeDifficulty(value: number): DifficultyLevel {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(5, n)) as DifficultyLevel;
}

export function parseDifficultyLevels(raw: string | null): DifficultyLevel[] {
  if (!raw?.trim()) return [];
  const seen = new Set<DifficultyLevel>();
  const result: DifficultyLevel[] = [];
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (!DIFFICULTY_LEVELS.includes(n as DifficultyLevel)) continue;
    const level = n as DifficultyLevel;
    if (!seen.has(level)) {
      seen.add(level);
      result.push(level);
    }
  }
  return result;
}

export function serializeDifficultyLevels(
  levels: DifficultyLevel[]
): string | null {
  return levels.length > 0 ? levels.join(",") : null;
}

export function parseDifficultySort(raw: string | null): DifficultySort | null {
  if (raw === "asc" || raw === "desc") return raw;
  return null;
}

/** 多選星級 → OR（符合任一已選星數） */
export function filterRecipesByDifficulty(
  recipeList: Recipe[],
  levels: DifficultyLevel[]
): Recipe[] {
  if (levels.length === 0) return recipeList;
  const allowed = new Set(levels);
  return recipeList.filter((recipe) =>
    allowed.has(normalizeDifficulty(recipe.difficulty))
  );
}

export function sortRecipesByDifficulty(
  recipeList: Recipe[],
  sort: DifficultySort | null
): Recipe[] {
  if (!sort) return recipeList;
  const factor = sort === "asc" ? 1 : -1;
  return [...recipeList].sort((a, b) => {
    const diff =
      normalizeDifficulty(a.difficulty) - normalizeDifficulty(b.difficulty);
    if (diff !== 0) return diff * factor;
    return a.name.localeCompare(b.name, "zh-Hant");
  });
}
