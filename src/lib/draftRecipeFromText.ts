import type { CuisineType } from "@/types";
import { emptyRecipeDraft, type RecipeDraft } from "@/lib/recipeDraft";
import { parseRecipeText } from "@/lib/parseRecipeText";

const SYSTEM_PROMPT = `你係香港煮食助手。根據用戶貼上嘅 Instagram 貼文／Reels 文字，整理成一份菜式 JSON。
只回傳 JSON，唔好加 markdown。欄位：
{
  "name": string,
  "cuisine": "chinese"|"western"|"japanese"|"italian",
  "description": string,
  "difficulty": 1-5,
  "prepTime": number (分鐘),
  "baseServings": number,
  "ingredients": [{"name": string, "amount": string}],
  "steps": string[]
}
若果資料唔齊，合理推斷並喺 description 註明「請核對」。材料至少 1 項。`;

function coerceCuisine(value: unknown): CuisineType {
  if (value === "western" || value === "japanese" || value === "italian") {
    return value;
  }
  return "chinese";
}

function normalizeAiDraft(raw: unknown, sourceUrl?: string): RecipeDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) return null;

  const ingredients = Array.isArray(data.ingredients)
    ? data.ingredients
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const ingName = typeof row.name === "string" ? row.name.trim() : "";
          if (!ingName) return null;
          const amount =
            typeof row.amount === "string" && row.amount.trim()
              ? row.amount.trim()
              : "適量";
          return { name: ingName, amount };
        })
        .filter((x): x is { name: string; amount: string } => Boolean(x))
    : [];

  const steps = Array.isArray(data.steps)
    ? data.steps
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    : [];

  return emptyRecipeDraft({
    name,
    cuisine: coerceCuisine(data.cuisine),
    description: typeof data.description === "string" ? data.description.trim() : "",
    difficulty: Math.max(1, Math.min(5, Number(data.difficulty) || 1)),
    prepTime: Math.max(0, Number(data.prepTime) || 0),
    baseServings: Math.max(1, Math.min(12, Number(data.baseServings) || 2)),
    ingredients:
      ingredients.length > 0
        ? ingredients
        : [{ name: "（請手動補充材料）", amount: "適量" }],
    steps,
    sourceUrl,
    sourceNote: "由 AI 整理 Instagram 內容，請核對後再儲存",
  });
}

/**
 * 若設定咗 AI Gateway／OpenAI key，用 LLM 整理；否則用規則解析。
 */
export async function draftRecipeFromText(
  text: string,
  options?: { sourceUrl?: string; imageUrl?: string }
): Promise<{ draft: RecipeDraft; mode: "ai" | "heuristic" }> {
  const heuristic = parseRecipeText(text, { sourceUrl: options?.sourceUrl });
  if (options?.imageUrl) heuristic.imageUrl = options.imageUrl;

  const apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";

  if (!apiKey || text.trim().length < 8) {
    return { draft: heuristic, mode: "heuristic" };
  }

  try {
    const baseUrl = process.env.AI_GATEWAY_API_KEY
      ? "https://ai-gateway.vercel.sh/v1"
      : "https://api.openai.com/v1";
    const model = process.env.AI_GATEWAY_API_KEY
      ? process.env.SMARTCOOK_AI_MODEL || "openai/gpt-5.4"
      : process.env.SMARTCOOK_AI_MODEL || "gpt-4.1-mini";

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `來源連結：${options?.sourceUrl || "（無）"}\n\n貼文內容：\n${text.slice(0, 6000)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      return { draft: heuristic, mode: "heuristic" };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { draft: heuristic, mode: "heuristic" };

    const parsed = JSON.parse(content) as unknown;
    const draft = normalizeAiDraft(parsed, options?.sourceUrl);
    if (!draft) return { draft: heuristic, mode: "heuristic" };
    if (options?.imageUrl) draft.imageUrl = options.imageUrl;
    return { draft, mode: "ai" };
  } catch {
    return { draft: heuristic, mode: "heuristic" };
  }
}
