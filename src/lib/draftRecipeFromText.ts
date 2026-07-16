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

export type DraftMode = "ai" | "heuristic";

export interface DraftRecipeResult {
  draft: RecipeDraft;
  mode: DraftMode;
  /** 有冇偵測到 AI key（唔會回傳 key 內容） */
  hasApiKey: boolean;
  provider: "ai-gateway" | "openai" | "none";
  model?: string;
  /** AI 失敗原因（方便排查） */
  aiError?: string;
}

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

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI 回傳唔係有效 JSON");
  }
}

function resolveProvider(): {
  apiKey: string;
  provider: "ai-gateway" | "openai" | "none";
  baseUrl: string;
  defaultModel: string;
} {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim() || "";
  const openaiKey = process.env.OPENAI_API_KEY?.trim() || "";

  if (gatewayKey) {
    return {
      apiKey: gatewayKey,
      provider: "ai-gateway",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      // 較穩陣、平、快；可用 SMARTCOOK_AI_MODEL 覆寫
      defaultModel: "openai/gpt-4.1-mini",
    };
  }

  if (openaiKey) {
    return {
      apiKey: openaiKey,
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4.1-mini",
    };
  }

  return {
    apiKey: "",
    provider: "none",
    baseUrl: "",
    defaultModel: "",
  };
}

/**
 * 若設定咗 AI Gateway／OpenAI key，用 LLM 整理；否則用規則解析。
 * AI 失敗時會帶 aiError，方便前端顯示真正原因。
 */
export async function draftRecipeFromText(
  text: string,
  options?: { sourceUrl?: string; imageUrl?: string }
): Promise<DraftRecipeResult> {
  const heuristic = parseRecipeText(text, { sourceUrl: options?.sourceUrl });
  if (options?.imageUrl) heuristic.imageUrl = options.imageUrl;

  const { apiKey, provider, baseUrl, defaultModel } = resolveProvider();

  if (!apiKey || provider === "none") {
    return {
      draft: heuristic,
      mode: "heuristic",
      hasApiKey: false,
      provider: "none",
      aiError:
        "伺服器偵測唔到 AI_GATEWAY_API_KEY / OPENAI_API_KEY。若已喺 Vercel 加咗，請 Redeploy；本機請加 .env.local 後重開 npm run dev。",
    };
  }

  if (text.trim().length < 8) {
    return {
      draft: heuristic,
      mode: "heuristic",
      hasApiKey: true,
      provider,
      aiError: "文字太短，無法用 AI 整理。",
    };
  }

  const model = process.env.SMARTCOOK_AI_MODEL?.trim() || defaultModel;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `來源連結：${options?.sourceUrl || "（無）"}\n\n貼文內容：\n${text.slice(0, 6000)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    const rawText = await res.text();
    if (!res.ok) {
      let detail = rawText.slice(0, 400);
      try {
        const errJson = JSON.parse(rawText) as {
          error?: { message?: string } | string;
          message?: string;
        };
        if (typeof errJson.error === "string") detail = errJson.error;
        else if (errJson.error?.message) detail = errJson.error.message;
        else if (errJson.message) detail = errJson.message;
      } catch {
        /* keep detail */
      }
      return {
        draft: heuristic,
        mode: "heuristic",
        hasApiKey: true,
        provider,
        model,
        aiError: `AI API 失敗 (${res.status}): ${detail}${
          /credit card/i.test(detail)
            ? " → 解法：去 Vercel AI Gateway 綁信用卡解鎖免費額度，或改用 OPENAI_API_KEY（唔經 Gateway）。"
            : ""
        }`,
      };
    }

    const json = JSON.parse(rawText) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return {
        draft: heuristic,
        mode: "heuristic",
        hasApiKey: true,
        provider,
        model,
        aiError: "AI 冇回傳內容",
      };
    }

    const parsed = extractJsonObject(content);
    const draft = normalizeAiDraft(parsed, options?.sourceUrl);
    if (!draft) {
      return {
        draft: heuristic,
        mode: "heuristic",
        hasApiKey: true,
        provider,
        model,
        aiError: "AI JSON 格式唔啱（缺菜名）",
      };
    }
    if (options?.imageUrl) draft.imageUrl = options.imageUrl;
    return {
      draft,
      mode: "ai",
      hasApiKey: true,
      provider,
      model,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      draft: heuristic,
      mode: "heuristic",
      hasApiKey: true,
      provider,
      model,
      aiError: `AI 呼叫出錯: ${message}`,
    };
  }
}

export function getAiConfigStatus() {
  const { apiKey, provider, defaultModel } = resolveProvider();
  return {
    hasApiKey: Boolean(apiKey),
    provider,
    model: process.env.SMARTCOOK_AI_MODEL?.trim() || defaultModel || null,
  };
}
