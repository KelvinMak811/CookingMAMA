import { NextRequest, NextResponse } from "next/server";
import { syncApplyClient, syncFetchAccount } from "@/lib/sync-server";

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account") ?? "";
  try {
    const sync = await syncFetchAccount(account);
    return NextResponse.json({ ok: true, sync });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const accountId =
    body && typeof body === "object" && "account_id" in body
      ? String((body as { account_id: unknown }).account_id)
      : "";

  try {
    const merged = await syncApplyClient(accountId, body as Parameters<typeof syncApplyClient>[1]);
    return NextResponse.json({ ok: true, sync: merged });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
