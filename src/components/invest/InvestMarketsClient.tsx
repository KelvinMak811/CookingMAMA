"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  CATEGORIES,
  RISK_LABELS,
  categoryLabel,
  formatChangePct,
  formatPrice,
  loadMarketSnapshot,
  marketModeBadge,
  type MarketSnapshot,
  type StockCategoryId,
} from "@/lib/investMarket";
import { loadInvestData, type WatchlistItem } from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestMarketsClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [meta, setMeta] = useState<{
    mode: string;
    isDemo: boolean;
    fetchedAt?: string;
    liveCount?: number;
    error?: string;
  }>({ mode: "loading", isDemo: true });
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [category, setCategory] = useState<StockCategoryId | "ALL">("ALL");
  const [market, setMarket] = useState<"ALL" | "HK" | "US">("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await loadMarketSnapshot();
      setSnapshot(result.snapshot);
      setMeta({
        mode: result.mode,
        isDemo: result.isDemo,
        fetchedAt: result.fetchedAt ?? result.snapshot.asOf,
        liveCount: result.liveCount,
        error: result.error,
      });
      setWatchlist(loadInvestData(userKey).watchlist);
    } finally {
      setRefreshing(false);
    }
  }, [userKey]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 90_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const names = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.names.filter((n) => {
      if (market !== "ALL" && n.market !== market) return false;
      if (category !== "ALL" && n.category !== category) return false;
      return true;
    });
  }, [snapshot, market, category]);

  const watchQuotes = useMemo(() => {
    if (!snapshot) return [];
    return watchlist.map((w) => {
      const q = snapshot.names.find((n) => n.id === w.quoteId);
      return { item: w, quote: q };
    });
  }, [snapshot, watchlist]);

  if (!snapshot) {
    return <div className="text-secondary small py-4">載入市場快照中…</div>;
  }

  const badge = marketModeBadge(meta.mode);
  const updatedLabel = meta.fetchedAt
    ? new Date(meta.fetchedAt).toLocaleString("zh-HK")
    : snapshot.asOf;

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
          <div>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
              <h2 className="h5 fw-bold mb-0">港股＋美股市場追蹤</h2>
              <span
                className={`badge text-bg-${
                  meta.isDemo || badge.tone === "warning"
                    ? "warning"
                    : badge.tone === "success"
                      ? "success"
                      : "secondary"
                }`}
              >
                {meta.isDemo ? "示範資料" : badge.text}
              </span>
            </div>
            <p className="small text-secondary mb-0">
              來源：{snapshot.source}
              <br />
              最後更新：{updatedLabel}
              {typeof meta.liveCount === "number" && meta.liveCount > 0
                ? ` · 已更新 ${meta.liveCount} 個報價`
                : ""}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              {refreshing ? "更新中…" : "重新整理"}
            </button>
            <Link href="/invest/simulate" className="btn btn-sm btn-outline-secondary">
              模擬投資
            </Link>
            <Link href="/invest/ideas" className="btn btn-sm btn-outline-primary">
              睇學習想法
            </Link>
          </div>
        </div>
        {meta.error && (
          <div className="alert alert-secondary small mt-3 mb-0">{meta.error}</div>
        )}
        {meta.isDemo && (
          <div className="alert alert-warning small mt-3 mb-0">
            而家顯示「示範資料」。若已設定 <code>FINNHUB_API_KEY</code>{" "}
            會盡量拉即時報價；失敗會自動回退並保持呢個標籤。
          </div>
        )}
      </section>

      <div className="row g-3">
        {snapshot.indices.map((idx) => (
          <div key={idx.id} className="col-12 col-md-6">
            <div className="planner-output-card h-100">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="mode-card-kicker">{idx.market}</div>
                  <h3 className="h6 fw-bold mb-0">{idx.nameZh}</h3>
                  <div className="small text-secondary">{idx.symbol}</div>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{idx.last.toLocaleString()}</div>
                  <div
                    className={
                      idx.changePct >= 0 ? "text-success small" : "text-danger small"
                    }
                  >
                    {formatChangePct(idx.changePct)}
                  </div>
                </div>
              </div>
              <p className="small text-secondary mb-0 mt-2">{idx.trendNoteZh}</p>
            </div>
          </div>
        ))}
      </div>

      {watchQuotes.length > 0 && (
        <section className="planner-section">
          <h2 className="h5 fw-bold mb-2">我的觀察名單報價</h2>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>名稱</th>
                  <th className="text-end">最新</th>
                </tr>
              </thead>
              <tbody>
                {watchQuotes.map(({ item, quote }) => (
                  <tr key={item.quoteId}>
                    <td>
                      <div className="fw-semibold">{item.nameZh}</div>
                      <div className="small text-secondary">
                        {item.market} · {item.symbol}
                      </div>
                    </td>
                    <td className="text-end">
                      {quote ? (
                        <>
                          <div>{formatPrice(quote.last, quote.currency)}</div>
                          <div
                            className={
                              quote.changePct >= 0
                                ? "text-success small"
                                : "text-danger small"
                            }
                          >
                            {formatChangePct(quote.changePct)}
                          </div>
                        </>
                      ) : (
                        <span className="small text-secondary">無報價</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="planner-section">
        <h2 className="h5 fw-bold mb-2">股票分類</h2>
        <p className="small text-secondary mb-3">
          點分類睇風險說明；仙股／低價股特別標示極高風險。
        </p>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            className={`btn btn-sm ${category === "ALL" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setCategory("ALL")}
          >
            全部
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`btn btn-sm ${
                category === c.id ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setCategory(c.id)}
            >
              {c.labelZh}
            </button>
          ))}
        </div>
        {category !== "ALL" && (
          <div className="alert alert-light border small mb-3">
            <strong>{CATEGORIES.find((c) => c.id === category)?.labelZh}</strong>
            <div>{CATEGORIES.find((c) => c.id === category)?.blurbZh}</div>
            <div className="text-danger mt-1">
              風險：{CATEGORIES.find((c) => c.id === category)?.riskNoteZh}
            </div>
          </div>
        )}
        <div className="d-flex gap-2 mb-3">
          {(["ALL", "HK", "US"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`btn btn-sm ${market === m ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setMarket(m)}
            >
              {m === "ALL" ? "港＋美" : m === "HK" ? "港股" : "美股"}
            </button>
          ))}
        </div>
        {names.length === 0 ? (
          <p className="text-secondary small mb-0">呢個篩選暫時冇示範股份。</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>名稱</th>
                  <th>分類</th>
                  <th>風險</th>
                  <th className="text-end">報價</th>
                </tr>
              </thead>
              <tbody>
                {names.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <div className="fw-semibold">{n.nameZh}</div>
                      <div className="small text-secondary">
                        {n.market} · {n.symbol}
                      </div>
                      <div className="small text-secondary">{n.blurbZh}</div>
                    </td>
                    <td>{categoryLabel(n.category)}</td>
                    <td>
                      <span
                        className={
                          n.riskLevel === "very_high" || n.riskLevel === "high"
                            ? "text-danger"
                            : ""
                        }
                      >
                        {RISK_LABELS[n.riskLevel]}
                      </span>
                    </td>
                    <td className="text-end">
                      <div>{formatPrice(n.last, n.currency)}</div>
                      <div
                        className={
                          n.changePct >= 0 ? "text-success small" : "text-danger small"
                        }
                      >
                        {formatChangePct(n.changePct)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
