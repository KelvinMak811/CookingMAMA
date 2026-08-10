"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  DEFAULT_WATCHLIST_IDS,
  formatChangePct,
  formatPrice,
  loadMarketSnapshot,
  marketModeBadge,
  type MarketQuote,
  type MarketSnapshot,
} from "@/lib/investMarket";
import {
  loadInvestData,
  removeWatchlistItem,
  upsertWatchlistItem,
  type WatchlistItem,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestWatchlistClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [mode, setMode] = useState("loading");
  const [isDemo, setIsDemo] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quoteId, setQuoteId] = useState("");
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await loadMarketSnapshot();
      if (cancelled) return;
      setSnapshot(result.snapshot);
      setMode(result.mode);
      setIsDemo(result.isDemo);
      if (result.snapshot.names[0]) setQuoteId(result.snapshot.names[0].id);
      setWatchlist(loadInvestData(userKey).watchlist);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  const quoteMap = useMemo(() => {
    const map = new Map<string, MarketQuote>();
    snapshot?.names.forEach((n) => map.set(n.id, n));
    return map;
  }, [snapshot]);

  function onAddWatch(id: string) {
    const q = quoteMap.get(id);
    if (!q) return;
    const data = upsertWatchlistItem(userKey, {
      quoteId: q.id,
      symbol: q.symbol,
      nameZh: q.nameZh,
      market: q.market,
      note: note.trim() || undefined,
    });
    setWatchlist(data.watchlist);
    setNote("");
  }

  if (!hydrated || !snapshot) {
    return <div className="text-secondary small py-4">載入觀察名單中…</div>;
  }

  const badge = marketModeBadge(mode);

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
              <h2 className="h5 fw-bold mb-0">觀察名單</h2>
              <span className="badge text-bg-warning">
                {isDemo ? "示範資料" : badge.text}
              </span>
            </div>
            <p className="small text-secondary mb-0">
              追蹤想跟進嘅港／美標的。虛擬買賣請用「模擬投資」頁。每個帳戶獨立同步。
            </p>
          </div>
          <Link href="/invest/simulate" className="btn btn-sm btn-primary">
            去模擬投資
          </Link>
        </div>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">加入觀察</h3>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: "16rem" }}
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
          >
            {snapshot.names.map((n) => (
              <option key={n.id} value={n.id}>
                {n.market} {n.symbol} {n.nameZh}
              </option>
            ))}
          </select>
          <input
            className="form-control form-control-sm"
            style={{ maxWidth: "14rem" }}
            placeholder="備註（可選）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onAddWatch(quoteId)}
          >
            加入名單
          </button>
        </div>
        <div className="mb-3">
          <div className="small text-secondary mb-1">熱門預設（一鍵加入）</div>
          <div className="d-flex flex-wrap gap-1">
            {DEFAULT_WATCHLIST_IDS.map((id) => {
              const q = quoteMap.get(id);
              if (!q) return null;
              const already = watchlist.some((w) => w.quoteId === id);
              return (
                <button
                  key={id}
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={already}
                  onClick={() => onAddWatch(id)}
                >
                  {q.symbol} {already ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>
        {watchlist.length === 0 ? (
          <p className="small text-secondary mb-0">
            未有觀察股份。可撳上面熱門預設，或由清單加入。
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {watchlist.map((w) => {
              const q = quoteMap.get(w.quoteId);
              return (
                <li
                  key={w.quoteId}
                  className="list-group-item px-0 d-flex justify-content-between gap-2"
                >
                  <div>
                    <div className="fw-semibold">{w.nameZh}</div>
                    <div className="small text-secondary">
                      {w.market} · {w.symbol}
                      {q
                        ? ` · ${formatPrice(q.last, q.currency)} · ${formatChangePct(q.changePct)}`
                        : ""}
                    </div>
                    {w.note && (
                      <div className="small text-secondary">{w.note}</div>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <Link
                      href="/invest/simulate"
                      className="btn btn-sm btn-outline-primary"
                    >
                      模擬買賣
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        const data = removeWatchlistItem(userKey, w.quoteId);
                        setWatchlist(data.watchlist);
                      }}
                    >
                      移除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
