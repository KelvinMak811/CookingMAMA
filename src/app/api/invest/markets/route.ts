import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getEmbeddedSnapshot, type MarketSnapshot } from "@/lib/investMarket";

type LiveQuote = { symbol: string; last: number; changePct: number };

/**
 * Educational market snapshot endpoint.
 * Demo JSON by default. With FINNHUB_API_KEY, enriches HK+US demo symbols
 * (best-effort). Failures keep snapshot and label 示範資料.
 */
async function fetchFinnhubQuote(
  symbol: string,
  apiKey: string
): Promise<LiveQuote | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return null;
    const q = (await res.json()) as { c?: number; dp?: number; pc?: number };
    if (typeof q.c !== "number" || q.c <= 0) return null;
    let changePct = typeof q.dp === "number" ? q.dp : 0;
    if (
      (changePct === 0 || Number.isNaN(changePct)) &&
      typeof q.pc === "number" &&
      q.pc > 0
    ) {
      changePct = ((q.c - q.pc) / q.pc) * 100;
    }
    return { symbol, last: q.c, changePct };
  } catch {
    return null;
  }
}

export async function GET() {
  const embedded = getEmbeddedSnapshot();
  let snapshot: MarketSnapshot = embedded;
  let mode: "demo_json" | "embedded" | "live_partial" = "embedded";
  let sourceNote = embedded.source;
  let liveCount = 0;
  let attempted = 0;

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "invest-market-snapshot.json"
    );
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as MarketSnapshot;
    if (parsed?.names && parsed?.indices) {
      snapshot = parsed;
      mode = "demo_json";
      sourceNote = parsed.source;
    }
  } catch {
    /* keep embedded */
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (apiKey) {
    // Finnhub-friendly symbols already used in our demo universe
    const nameSymbols = snapshot.names
      .map((n) => n.symbol)
      .filter((s) => s && !s.startsWith("DEMO"));
    // Indices: Finnhub often uses ^GSPC / ^NDX; HSI may fail on free tier
    const indexSymbolMap: Record<string, string> = {
      spx: "^GSPC",
      ndx: "^NDX",
      hsi: "^HSI",
    };

    try {
      const nameJobs = nameSymbols.map(async (symbol) => {
        attempted += 1;
        return fetchFinnhubQuote(symbol, apiKey);
      });
      const indexJobs = Object.entries(indexSymbolMap).map(
        async ([id, finnhubSymbol]) => {
          attempted += 1;
          const q = await fetchFinnhubQuote(finnhubSymbol, apiKey);
          return q ? { id, ...q } : null;
        }
      );

      const [nameUpdates, indexUpdates] = await Promise.all([
        Promise.all(nameJobs),
        Promise.all(indexJobs),
      ]);

      const now = new Date().toISOString();
      let touched = false;

      const names = snapshot.names.map((n) => {
        const u = nameUpdates.find((x) => x && x.symbol === n.symbol);
        if (!u) return n;
        touched = true;
        liveCount += 1;
        return { ...n, last: u.last, changePct: u.changePct };
      });

      const indices = snapshot.indices.map((idx) => {
        const u = indexUpdates.find((x) => x && x.id === idx.id);
        if (!u) return idx;
        touched = true;
        liveCount += 1;
        return {
          ...idx,
          last: u.last,
          changePct: u.changePct,
          trendNoteZh: `${idx.trendNoteZh}（部分報價已用 Finnhub 更新）`,
        };
      });

      if (touched) {
        snapshot = {
          ...snapshot,
          names,
          indices,
          asOf: now,
          label: "部分即時＋示範／學習用",
          source: `${sourceNote}; partial live via Finnhub (${liveCount} quotes) ${now}`,
        };
        mode = "live_partial";
      }
    } catch {
      /* keep demo */
    }
  }

  const isDemo = mode !== "live_partial";

  return NextResponse.json({
    ok: true,
    mode,
    isDemo,
    liveCount,
    attempted,
    fetchedAt: new Date().toISOString(),
    disclaimerZh: "投資有風險，內容僅供學習。唔構成買賣建議。",
    snapshot,
  });
}
