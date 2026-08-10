import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getEmbeddedSnapshot, type MarketSnapshot } from "@/lib/investMarket";
import {
  FINNHUB_INDEX_SYMBOLS,
  toFinnhubSymbol,
} from "@/lib/investUniverse";

type LiveQuote = { symbol: string; last: number; changePct: number };

const QUOTE_CONCURRENCY = 8;

/**
 * Educational market snapshot endpoint.
 * Demo JSON by default. With FINNHUB_API_KEY, enriches HK+US symbols
 * (best-effort, rate-limit aware). Failures keep snapshot and label 示範資料.
 *
 * Optional: ?ids=0700.HK,AAPL — prioritize enriching these symbols first
 * (simulate holdings refresh) while still returning the full snapshot.
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

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await worker(items[i]);
    }
  }
  const runners = Array.from(
    { length: Math.min(concurrency, Math.max(1, items.length)) },
    () => run()
  );
  await Promise.all(runners);
  return results;
}

function parseFocusIds(raw: string | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function GET(request: NextRequest) {
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

  const focusIds = parseFocusIds(request.nextUrl.searchParams.get("ids"));
  const apiKey = process.env.FINNHUB_API_KEY;

  if (apiKey) {
    const nameEntries = snapshot.names
      .map((n) => {
        const finnhub = toFinnhubSymbol(n.symbol);
        if (!finnhub) return null;
        return { id: n.id, appSymbol: n.symbol, finnhub };
      })
      .filter((x): x is { id: string; appSymbol: string; finnhub: string } => !!x);

    // Prioritize holdings / requested ids, then the rest
    nameEntries.sort((a, b) => {
      const af = focusIds.has(a.id) || focusIds.has(a.appSymbol) ? 0 : 1;
      const bf = focusIds.has(b.id) || focusIds.has(b.appSymbol) ? 0 : 1;
      return af - bf;
    });

    try {
      const nameUpdates = await mapPool(
        nameEntries,
        QUOTE_CONCURRENCY,
        async (entry) => {
          attempted += 1;
          const q = await fetchFinnhubQuote(entry.finnhub, apiKey);
          if (!q) {
            // Retry HK without leading zeros (700.HK vs 0700.HK)
            if (entry.finnhub.endsWith(".HK") && /^0+\d/.test(entry.finnhub)) {
              const alt = entry.finnhub.replace(/^0+/, "");
              const q2 = await fetchFinnhubQuote(alt, apiKey);
              if (q2) return { id: entry.id, appSymbol: entry.appSymbol, ...q2 };
            }
            return null;
          }
          return { id: entry.id, appSymbol: entry.appSymbol, ...q };
        }
      );

      const indexJobs = Object.entries(FINNHUB_INDEX_SYMBOLS).map(
        ([id, finnhubSymbol]) => ({ id, finnhubSymbol })
      );
      const indexUpdates = await mapPool(
        indexJobs,
        QUOTE_CONCURRENCY,
        async ({ id, finnhubSymbol }) => {
          attempted += 1;
          const q = await fetchFinnhubQuote(finnhubSymbol, apiKey);
          return q ? { id, ...q } : null;
        }
      );

      const now = new Date().toISOString();
      let touched = false;
      const byId = new Map(
        nameUpdates
          .filter((x): x is NonNullable<typeof x> => !!x)
          .map((x) => [x.id, x])
      );

      const names = snapshot.names.map((n) => {
        const u = byId.get(n.id);
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
        // HSTECH free-tier proxy is 3033.HK ETF — units differ from index level,
        // so only mark-to-market the daily change %, keep snapshot index level.
        const useProxyLevel = idx.id === "hstech";
        const proxyNote = useProxyLevel
          ? "（日變動以 3033.HK ETF 近似追蹤；指數點位仍為示範基準）"
          : "（部分報價已用 Finnhub 更新）";
        return {
          ...idx,
          last: useProxyLevel ? idx.last : u.last,
          changePct: u.changePct,
          trendNoteZh: idx.trendNoteZh.includes("Finnhub")
            ? idx.trendNoteZh
            : `${idx.trendNoteZh}${proxyNote}`,
        };
      });

      if (touched) {
        snapshot = {
          ...snapshot,
          names,
          indices,
          asOf: now,
          label: "部分即時＋示範／學習用",
          source: `${sourceNote}; partial live via Finnhub (${liveCount}/${attempted} quotes) ${now}`,
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
    hasApiKey: Boolean(apiKey),
    disclaimerZh: "投資有風險，內容僅供學習。唔構成買賣建議。",
    snapshot,
  });
}
