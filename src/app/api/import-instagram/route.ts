import { NextResponse } from "next/server";
import {
  draftRecipeFromText,
  getAiConfigStatus,
} from "@/lib/draftRecipeFromText";
import { extractInstagramPost, isInstagramUrl } from "@/lib/instagramFetch";

export const runtime = "nodejs";

interface ImportBody {
  url?: string;
  text?: string;
}

/** 檢查 AI key 有冇生效（唔會洩露 key） */
export async function GET() {
  return NextResponse.json({
    ok: true,
    ai: getAiConfigStatus(),
    tip: "若 hasApiKey=false：Vercel 請 Redeploy；本機請建 .env.local 後重開 dev server。",
  });
}

export async function POST(request: Request) {
  let body: ImportBody;
  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  let text = typeof body.text === "string" ? body.text.trim() : "";
  let imageUrl: string | undefined;
  let fetchNote: string | undefined;

  if (url) {
    if (!isInstagramUrl(url)) {
      return NextResponse.json(
        { ok: false, error: "請貼上有效嘅 Instagram 連結（post 或 reels）" },
        { status: 400 }
      );
    }

    const extracted = await extractInstagramPost(url);
    if (extracted?.caption) {
      text = text ? `${extracted.caption}\n\n${text}` : extracted.caption;
      imageUrl = extracted.imageUrl;
    } else if (extracted?.imageUrl) {
      imageUrl = extracted.imageUrl;
      fetchNote =
        "已取得貼文圖片，但讀唔到完整文字（IG 經常截斷）。請喺下面貼上完整 caption／材料步驟。";
    } else {
      fetchNote =
        "Instagram 暫時讀唔到呢條貼文內容（常見）。請複製貼文文字貼上再按匯入。";
    }
  }

  if (!text) {
    return NextResponse.json(
      {
        ok: false,
        error: fetchNote || "請貼上 Instagram 連結，或者貼上貼文文字／材料步驟",
        needsCaption: true,
        imageUrl,
        ai: getAiConfigStatus(),
      },
      { status: 422 }
    );
  }

  const result = await draftRecipeFromText(text, {
    sourceUrl: url || undefined,
    imageUrl,
  });

  const noteParts: string[] = [];
  if (fetchNote) noteParts.push(fetchNote);
  if (result.mode === "ai") {
    noteParts.push(`已用 AI 整理成草稿（${result.provider} / ${result.model}），請核對後再儲存。`);
  } else if (result.aiError) {
    noteParts.push(`AI 未成功，已改用文字規則草稿。原因：${result.aiError}`);
  } else {
    noteParts.push("已用文字規則整理成草稿，請核對後再儲存。");
  }

  return NextResponse.json({
    ok: true,
    draft: result.draft,
    mode: result.mode,
    hasApiKey: result.hasApiKey,
    provider: result.provider,
    model: result.model,
    aiError: result.aiError,
    note: noteParts.join(" "),
  });
}
