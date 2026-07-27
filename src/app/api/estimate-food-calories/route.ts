import { NextResponse } from "next/server";
import { estimateFoodCaloriesFromImage } from "@/lib/estimateFoodCalories";

export const runtime = "nodejs";

interface Body {
  imageDataUrl?: string;
  hint?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const imageDataUrl =
    typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";
  if (!imageDataUrl || imageDataUrl.length > 6_000_000) {
    return NextResponse.json(
      { ok: false, error: "請提供有效食物照片（檔案過大請壓縮）" },
      { status: 400 }
    );
  }
  const result = await estimateFoodCaloriesFromImage(
    imageDataUrl,
    typeof body.hint === "string" ? body.hint : undefined
  );
  return NextResponse.json({ ok: true, result });
}
