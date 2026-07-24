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
export type AiProvider = "groq" | "gemini" | "openai" | "ai-gateway" | "none";

export interface DraftRecipeResult {
  draft: RecipeDraft;
  mode: DraftMode;
  hasApiKey: boolean;
  provider: AiProvider;
  model?: string;
  aiError?: string;
}

interface ProviderConfig {
  apiKey: string;
  provider: Exclude<AiProvider, "none">;
  baseUrl: string;
  defaultModel: string;
  label: string;
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

/**
 * 優先用免費方案（Groq / Gemini），再先 OpenAI / Vercel Gateway。
 * 可用 SMARTCOOK_AI_PROVIDER=groq|gemini|openai|ai-gateway 強制指定。
 */
function listProviders(): ProviderConfig[] {
  const groqKey = process.env.GROQ_API_KEY?.trim() || "";
  const geminiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    "";
  const openaiKey = process.env.OPENAI_API_KEY?.trim() || "";
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim() || "";

  const all: ProviderConfig[] = [];

  if (groqKey) {
    all.push({
      apiKey: groqKey,
      provider: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      defaultModel: "llama-3.3-70b-versatile",
      label: "Groq（免費額度）",
    });
  }

  if (geminiKey) {
    all.push({
      apiKey: geminiKey,
      provider: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      defaultModel: "gemini-2.0-flash",
      label: "Google Gemini（免費額度）",
    });
  }

  if (openaiKey) {
    all.push({
      apiKey: openaiKey,
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4.1-mini",
      label: "OpenAI",
    });
  }

  if (gatewayKey) {
    all.push({
      apiKey: gatewayKey,
      provider: "ai-gateway",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      defaultModel: "openai/gpt-4.1-mini",
      label: "Vercel AI Gateway（要綁卡）",
    });
  }

  const forced = process.env.SMARTCOOK_AI_PROVIDER?.trim().toLowerCase();
  if (forced) {
    const match = all.filter((p) => p.provider === forced);
    if (match.length > 0) return match;
  }

  return all;
}

function resolveProvider(): ProviderConfig | null {
  return listProviders()[0] ?? null;
}

async function callChatCompletion(
  provider: ProviderConfig,
  text: string,
  sourceUrl?: string
): Promise<{ content: string; model: string }> {
  const model = process.env.SMARTCOOK_AI_MODEL?.trim() || provider.defaultModel;
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `來源連結：${sourceUrl || "（無）"}\n\n貼文內容：\n${text.slice(0, 6000)}`,
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
      else if (errJson.error && typeof errJson.error === "object" && errJson.error.message) {
        detail = errJson.error.message;
      } else if (errJson.message) detail = errJson.message;
    } catch {
      /* keep detail */
    }
    throw new Error(`${provider.label} 失敗 (${res.status}): ${detail}`);
  }

  const json = JSON.parse(rawText) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.label} 冇回傳內容`);
  return { content, model };
}

/**
 * 若設定咗 AI key，用 LLM 整理；否則用規則解析。
 * 會按優先序嘗試：Groq → Gemini → OpenAI → AI Gateway。
 */
export async function draftRecipeFromText(
  text: string,
  options?: { sourceUrl?: string; imageUrl?: string }
): Promise<DraftRecipeResult> {
  const heuristic = parseRecipeText(text, { sourceUrl: options?.sourceUrl });
  if (options?.imageUrl) heuristic.imageUrl = options.imageUrl;

  const providers = listProviders();

  if (providers.length === 0) {
    return {
      draft: heuristic,
      mode: "heuristic",
      hasApiKey: false,
      provider: "none",
      aiError:
        "伺服器偵測唔到 AI key。建議加免費 GROQ_API_KEY（見 .env.example）。Vercel 加完要 Redeploy；本機要 .env.local 後重開 npm run dev。",
    };
  }

  if (text.trim().length < 8) {
    return {
      draft: heuristic,
      mode: "heuristic",
      hasApiKey: true,
      provider: providers[0].provider,
      aiError: "文字太短，無法用 AI 整理。",
    };
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const { content, model } = await callChatCompletion(
        provider,
        text,
        options?.sourceUrl
      );
      const parsed = extractJsonObject(content);
      const draft = normalizeAiDraft(parsed, options?.sourceUrl);
      if (!draft) {
        errors.push(`${provider.label}: JSON 格式唔啱（缺菜名）`);
        continue;
      }
      if (options?.imageUrl) draft.imageUrl = options.imageUrl;
      return {
        draft,
        mode: "ai",
        hasApiKey: true,
        provider: provider.provider,
        model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  return {
    draft: heuristic,
    mode: "heuristic",
    hasApiKey: true,
    provider: providers[0].provider,
    model: process.env.SMARTCOOK_AI_MODEL?.trim() || providers[0].defaultModel,
    aiError: `${errors.join(" | ")} → 建議改用免費 GROQ_API_KEY（console.groq.com），或綁 Vercel 信用卡。`,
  };
}

export function getAiConfigStatus() {
  const providers = listProviders();
  const primary = providers[0] ?? null;
  return {
    hasApiKey: Boolean(primary),
    provider: primary?.provider ?? "none",
    model: primary
      ? process.env.SMARTCOOK_AI_MODEL?.trim() || primary.defaultModel
      : null,
    availableProviders: providers.map((p) => p.provider),
    tip:
      primary?.provider === "ai-gateway"
        ? "而家優先用 AI Gateway（要綁卡）。想免費可用：加 GROQ_API_KEY，系統會自動優先用 Groq。"
        : primary
          ? `而家用 ${primary.label}`
          : "未設定 AI key；建議加免費 GROQ_API_KEY",
  };
}
