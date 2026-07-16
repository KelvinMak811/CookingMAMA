import type { CuisineType } from "@/types";
import { emptyRecipeDraft, type RecipeDraft } from "@/lib/recipeDraft";

const CUISINE_HINTS: Array<{ cuisine: CuisineType; patterns: RegExp[] }> = [
  { cuisine: "italian", patterns: [/意式|意大利|意粉|pasta|risotto/i] },
  { cuisine: "japanese", patterns: [/日式|日本|丼|味噌|照燒|烏冬|壽司/i] },
  { cuisine: "western", patterns: [/西式|西餐|牛排|沙律|歐式|法式/i] },
  { cuisine: "chinese", patterns: [/中餐|港式|粵|川|客家|茶餐廳|鑊/i] },
];

function detectCuisine(text: string): CuisineType {
  for (const hint of CUISINE_HINTS) {
    if (hint.patterns.some((p) => p.test(text))) return hint.cuisine;
  }
  return "chinese";
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function extractLabeledValue(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[：:\\-]?\\s*(.+?)(?=\\n(?:菜式名稱|菜名|菜系|難度|準備時間|預設人數|簡介|材料|步驟)|$)`,
      "is"
    );
    const match = text.match(re);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function parseIngredientsBlock(block: string): Array<{ name: string; amount: string }> {
  const cleaned = block
    .replace(/^材料[：:\s]*/i, "")
    .replace(/\r/g, "")
    .trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/[、，,\n]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/^\d+[\.\)、]\s*/, "").trim());

  return parts
    .map((part) => {
      const spaced = part.match(/^(.+?)\s+(\S+)$/);
      if (spaced) {
        return { name: spaced[1].trim(), amount: spaced[2].trim() };
      }
      const unit = part.match(
        /^(.+?)(\d+(?:\.\d+)?\s*(?:克|g|kg|毫升|ml|湯匙|茶匙|隻|個|條|片|包|罐|碗|杯|斤|兩|份|粒|瓣|半[個條]|適量|少許).*)$/i
      );
      if (unit) {
        return { name: unit[1].trim(), amount: unit[2].trim() };
      }
      return { name: part, amount: "適量" };
    })
    .filter((ing) => ing.name.length > 0);
}

function parseStepsBlock(block: string): string[] {
  const cleaned = block
    .replace(/^步驟[：:\s]*/i, "")
    .replace(/\r/g, "")
    .trim();
  if (!cleaned) return [];

  const numbered = cleaned
    .split(/(?=\n?\s*\d+[\.\)、]\s*)/)
    .map((s) => s.replace(/^\s*\d+[\.\)、]\s*/, "").trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  return cleaned
    .split(/\n+/)
    .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);
}

function guessName(text: string): string {
  const labeled = extractLabeledValue(text, ["菜式名稱", "菜名", "食譜名稱", "Recipe"]);
  if (labeled) {
    return labeled.split(/\n/)[0].trim().slice(0, 80);
  }

  const firstLine = text
    .split(/\n/)
    .map((l) => l.trim())
    .find(
      (l) =>
        l &&
        !/^https?:\/\//i.test(l) &&
        !/^#/.test(l) &&
        !/\d+\s+likes?/i.test(l) &&
        !/\d+\s+comments?/i.test(l)
    );

  if (!firstLine) return "";

  const cleaned = firstLine
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/gu, "")
    .replace(/#.+$/u, "")
    .trim()
    .slice(0, 80);

  if (!cleaned || cleaned === "&" || cleaned.length < 2) return "";
  return cleaned;
}

function parseDifficulty(text: string): number {
  const stars = text.match(/難度[：:\s]*([★☆]{1,5}|[1-5])/);
  if (!stars) return 1;
  if (/[1-5]/.test(stars[1]) && !stars[1].includes("★")) {
    return clamp(Number(stars[1]), 1, 5);
  }
  return clamp(stars[1].split("").filter((c) => c === "★").length || 1, 1, 5);
}

function parsePrepTime(text: string): number {
  const match = text.match(/(?:準備時間|時間|約)[：:\s]*(\d+)\s*(?:分鐘|分|min)?/i);
  if (match) return clamp(Number(match[1]), 0, 600);
  return 0;
}

function parseServings(text: string): number {
  const match = text.match(/(?:預設人數|人數|份量|幾多人)[：:\s]*(\d+)/);
  if (match) return clamp(Number(match[1]), 1, 12);
  return 2;
}

/**
 * 將 Instagram caption／貼文文字粗略解析成菜式草稿（唔依賴 AI）
 */
export function parseRecipeText(raw: string, options?: { sourceUrl?: string }): RecipeDraft {
  const text = (raw ?? "").replace(/\u00a0/g, " ").trim();
  if (!text) return emptyRecipeDraft({ sourceUrl: options?.sourceUrl });

  const ingredientsMatch = text.match(
    /材料[：:\s]*([\s\S]*?)(?=\n\s*步驟[：:]|\n\s*做法[：:]|\n\s*煮法[：:]|$)/i
  );
  const stepsMatch = text.match(
    /(?:步驟|做法|煮法)[：:\s]*([\s\S]*?)(?=\n\s*#|$)/i
  );

  const ingredients = ingredientsMatch
    ? parseIngredientsBlock(ingredientsMatch[1])
    : [];
  const steps = stepsMatch ? parseStepsBlock(stepsMatch[1]) : [];

  const description =
    extractLabeledValue(text, ["簡介", "介紹", "描述"])?.split(/\n/)[0]?.trim() ??
    "";

  const name = guessName(text);

  // IG 只抽出 truncated metadata、冇真正菜式文字時，唔好亂填菜名
  const looksLikeGarbage =
    !name ||
    /\d+\s+likes?/i.test(name) ||
    name === "&" ||
    name.length < 2;

  return emptyRecipeDraft({
    name: looksLikeGarbage ? "" : name,
    cuisine: detectCuisine(text),
    description: description.slice(0, 200),
    difficulty: parseDifficulty(text),
    prepTime: parsePrepTime(text),
    baseServings: parseServings(text),
    ingredients:
      ingredients.length > 0
        ? ingredients
        : [{ name: "（請手動補充材料）", amount: "適量" }],
    steps,
    sourceUrl: options?.sourceUrl,
    sourceNote: looksLikeGarbage
      ? "Instagram 文字唔齊／被截斷，請手動貼上完整 caption 或材料步驟後再匯入"
      : "由貼文文字自動解析，請核對後再儲存",
  });
}
