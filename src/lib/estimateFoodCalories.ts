export interface FoodEstimateResult {
  name: string;
  calories: number;
  portion: string;
  confidence: "low" | "medium" | "high";
  notes: string;
  mode: "ai" | "heuristic";
  aiError?: string;
}

const SYSTEM = `你是營養估算助手。用戶會提供食物照片（base64）或描述。
只回傳 JSON：
{
  "name": string (繁體中文菜名或食物名),
  "calories": number (整份估算千卡 kcal),
  "portion": string (份量描述),
  "confidence": "low"|"medium"|"high",
  "notes": string (簡短說明假設)
}`;

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("無效 JSON");
  }
}

function heuristicEstimate(): FoodEstimateResult {
  return {
    name: "未能辨識食物",
    calories: 350,
    portion: "約 1 份",
    confidence: "low",
    notes: "未設定支援影像嘅 AI key，請手動輸入菜名同卡路里。",
    mode: "heuristic",
  };
}

type VisionProvider = {
  apiKey: string;
  baseUrl: string;
  model: string;
  label: string;
};

function visionProviders(): VisionProvider[] {
  const list: VisionProvider[] = [];
  const gemini =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (gemini) {
    list.push({
      apiKey: gemini,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-2.0-flash",
      label: "Gemini",
    });
  }
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (openai) {
    list.push({
      apiKey: openai,
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4.1-mini",
      label: "OpenAI",
    });
  }
  return list;
}

async function callVision(
  provider: VisionProvider,
  imageDataUrl: string,
  hint?: string
): Promise<FoodEstimateResult> {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: hint?.trim()
                ? `用戶補充：${hint}\n請估算卡路里。`
                : "請估算照片中食物卡路里。",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${provider.label} ${res.status}: ${raw.slice(0, 200)}`);
  const json = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("無回傳內容");
  const parsed = extractJson(content) as Record<string, unknown>;
  const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
  const conf = parsed.confidence;
  const confidence =
    conf === "high" || conf === "medium" || conf === "low" ? conf : "medium";
  return {
    name: typeof parsed.name === "string" ? parsed.name : "食物",
    calories: calories || 300,
    portion: typeof parsed.portion === "string" ? parsed.portion : "1 份",
    confidence,
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
    mode: "ai",
  };
}

export async function estimateFoodCaloriesFromImage(
  imageDataUrl: string,
  hint?: string
): Promise<FoodEstimateResult> {
  if (!imageDataUrl.startsWith("data:image/")) {
    return { ...heuristicEstimate(), notes: "圖片格式不正確。" };
  }
  const providers = visionProviders();
  if (!providers.length) {
    return {
      ...heuristicEstimate(),
      aiError: "請在伺服器設定 GEMINI_API_KEY 或 OPENAI_API_KEY 以啟用拍照估算。",
    };
  }
  const errors: string[] = [];
  for (const p of providers) {
    try {
      return await callVision(p, imageDataUrl, hint);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return {
    ...heuristicEstimate(),
    aiError: errors.join(" | "),
  };
}
