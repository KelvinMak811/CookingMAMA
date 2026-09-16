"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  CATEGORIES,
  categoryLabel,
  formatChangePct,
  formatPrice,
  loadMarketSnapshot,
  marketModeBadge,
  type MarketQuote,
  type MarketSnapshot,
  type StockCategoryId,
} from "@/lib/investMarket";
import {
  computeHoldings,
  loadInvestData,
  markHoldingsToMarket,
  resetPaperPortfolio,
  tryRecordPaperTrade,
  type PaperPortfolio,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

const POLL_MS = 90_000;

function groupNamesForPicker(names: MarketQuote[]) {
  const byMarket: Record<"HK" | "US", MarketQuote[]> = { HK: [], US: [] };
  for (const n of names) {
    byMarket[n.market].push(n);
  }
  const order: StockCategoryId[] = [
    "etf",
    "bluechip",
    "tech",
    "finance",
    "consumer",
    "healthcare",
    "energy",
    "penny",
  ];
  function byCategory(list: MarketQuote[]) {
    const map = new Map<StockCategoryId, MarketQuote[]>();
    for (const n of list) {
      const arr = map.get(n.category) ?? [];
      arr.push(n);
      map.set(n.category, arr);
    }
    return order
      .filter((id) => map.has(id))
      .map((id) => ({
        category: id,
        label: categoryLabel(id),
        items: map.get(id)!,
      }));
  }
  return {
    HK: byCategory(byMarket.HK),
    US: byCategory(byMarket.US),
  };
}

export function InvestSimulateClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [mode, setMode] = useState("loading");
  const [isDemo, setIsDemo] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState<number | undefined>();
  const [attempted, setAttempted] = useState<number | undefined>();
  const [hasApiKey, setHasApiKey] = useState<boolean | undefined>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [quoteId, setQuoteId] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshLocal = useCallback(() => {
    const data = loadInvestData(userKey);
    setPortfolio(data.paperPortfolio);
    return data.paperPortfolio;
  }, [userKey]);

  const loadQuotes = useCallback(async () => {
    setRefreshing(true);
    try {
      const paper = loadInvestData(userKey).paperPortfolio;
      const heldIds = computeHoldings(paper.trades).map((h) => h.quoteId);
      const result = await loadMarketSnapshot({
        prioritizeIds: heldIds,
      });
      setSnapshot(result.snapshot);
      setMode(result.mode);
      setIsDemo(result.isDemo);
      setFetchedAt(result.fetchedAt ?? result.snapshot.asOf);
      setLiveCount(result.liveCount);
      setAttempted(result.attempted);
      setHasApiKey(result.hasApiKey);
      setLoadError(result.error ?? null);
      setQuoteId((current) => current || result.snapshot.names[0]?.id || "");
    } finally {
      setRefreshing(false);
    }
  }, [userKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadQuotes();
      if (cancelled) return;
      refreshLocal();
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userKey, loadQuotes, refreshLocal]);

  // Auto-refresh quotes so holdings MTM tracks the market API
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      void loadQuotes();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [hydrated, loadQuotes]);

  const quoteMap = useMemo(() => {
    const map = new Map<string, MarketQuote>();
    snapshot?.names.forEach((n) => map.set(n.id, n));
    return map;
  }, [snapshot]);

  const pickerGroups = useMemo(
    () => (snapshot ? groupNamesForPicker(snapshot.names) : { HK: [], US: [] }),
    [snapshot]
  );

  const selected = quoteMap.get(quoteId);

  const marked = useMemo(() => {
    if (!portfolio || !snapshot) return [];
    const holdings = computeHoldings(portfolio.trades);
    return markHoldingsToMarket(
      holdings,
      snapshot.names.map((n) => ({ id: n.id, last: n.last }))
    ).map((h) => {
      const q = quoteMap.get(h.quoteId);
      return { ...h, changePct: q?.changePct ?? null };
    });
  }, [portfolio, snapshot, quoteMap]);

  const totals = useMemo(() => {
    let hkdMv = 0;
    let usdMv = 0;
    let hkdPnl = 0;
    let usdPnl = 0;
    for (const h of marked) {
      if (h.marketValue == null || h.unrealizedPnl == null) continue;
      if (h.currency === "HKD") {
        hkdMv += h.marketValue;
        hkdPnl += h.unrealizedPnl;
      } else {
        usdMv += h.marketValue;
        usdPnl += h.unrealizedPnl;
      }
    }
    return { hkdMv, usdMv, hkdPnl, usdPnl };
  }, [marked]);

  function onTrade(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!selected || shares <= 0) return;
    const result = tryRecordPaperTrade(userKey, {
      quoteId: selected.id,
      symbol: selected.symbol,
      nameZh: selected.nameZh,
      side,
      shares,
      price: selected.last,
      currency: selected.currency,
      note: "模擬／學習用",
    });
    setPortfolio(result.data.paperPortfolio);
    if (!result.ok) setError(result.error);
  }

  if (!hydrated || !portfolio || !snapshot) {
    return <div className="text-secondary small py-4">載入模擬投資中…</div>;
  }

  const badge = marketModeBadge(mode);
  const equityHkd = portfolio.cashHkd + totals.hkdMv;
  const equityUsd = portfolio.cashUsd + totals.usdMv;
  const quoteStatusLabel = isDemo ? "示範資料" : badge.text;

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
          <div>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
              <h2 className="h5 fw-bold mb-0">模擬投資</h2>
              <span className="badge text-bg-warning">模擬／學習用</span>
              <span
                className={`badge text-bg-${
                  isDemo
                    ? "warning"
                    : badge.tone === "success"
                      ? "success"
                      : "secondary"
                }`}
              >
                {quoteStatusLabel}
              </span>
            </div>
            <p className="small text-secondary mb-0">
              虛擬現金買賣港／美標的；買入後持倉按「實際市場」同一報價 API
              標記市值同未實現盈虧。成本按成交均價保存，唔連接券商。
              <br />
              報價更新：
              {fetchedAt ? new Date(fetchedAt).toLocaleString("zh-HK") : "—"}
              {typeof liveCount === "number" && liveCount > 0
                ? ` · 已更新 ${liveCount}${
                    typeof attempted === "number" ? `/${attempted}` : ""
                  } 個報價`
                : ""}
              {" · "}約每 {POLL_MS / 1000} 秒自動刷新
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={refreshing}
              onClick={() => void loadQuotes()}
            >
              {refreshing ? "更新中…" : "更新報價"}
            </button>
            <Link href="/invest/markets" className="btn btn-sm btn-outline-secondary">
              實際市場
            </Link>
            <Link href="/invest/watchlist" className="btn btn-sm btn-outline-secondary">
              觀察名單
            </Link>
          </div>
        </div>
        {loadError && (
          <div className="alert alert-secondary small mt-3 mb-0">{loadError}</div>
        )}
        {isDemo && (
          <div className="alert alert-warning small mt-3 mb-0">
            而家用示範／快照價做標記市值。設定伺服器環境變數{" "}
            <code>FINNHUB_API_KEY</code>{" "}
            之後，模擬持倉會跟市場頁同一條 Finnhub 報價更新；API
            失敗會清楚回退示範價。
            {hasApiKey === false
              ? "（目前偵測到未設定 API key。）"
              : hasApiKey === true
                ? "（已偵測到 API key，但今次未成功更新報價。）"
                : ""}
          </div>
        )}
        {!isDemo && (
          <div className="alert alert-success small mt-3 mb-0">
            持倉現價／未實現盈虧正跟市場報價標記（部分即時）。教育用途，唔構成買賣建議。
          </div>
        )}
      </section>

      <div className="row g-3">
        <div className="col-6 col-md-3">
          <div className="planner-output-card h-100">
            <div className="small text-secondary">虛擬 HKD 現金</div>
            <div className="h5 fw-bold mb-0">
              {portfolio.cashHkd.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="planner-output-card h-100">
            <div className="small text-secondary">虛擬 USD 現金</div>
            <div className="h5 fw-bold mb-0">
              {portfolio.cashUsd.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="planner-output-card h-100">
            <div className="small text-secondary">HKD 權益（約）</div>
            <div className="h5 fw-bold mb-0">
              {equityHkd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div
              className={`small ${
                totals.hkdPnl >= 0 ? "text-success" : "text-danger"
              }`}
            >
              未實現 {totals.hkdPnl >= 0 ? "+" : ""}
              {totals.hkdPnl.toFixed(0)}
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="planner-output-card h-100">
            <div className="small text-secondary">USD 權益（約）</div>
            <div className="h5 fw-bold mb-0">
              {equityUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div
              className={`small ${
                totals.usdPnl >= 0 ? "text-success" : "text-danger"
              }`}
            >
              未實現 {totals.usdPnl >= 0 ? "+" : ""}
              {totals.usdPnl.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      <section className="planner-section">
        <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
          <h3 className="h6 fw-bold mb-0">下單（模擬）</h3>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              const data = resetPaperPortfolio(userKey);
              setPortfolio(data.paperPortfolio);
              setError(null);
            }}
          >
            重設虛擬組合
          </button>
        </div>
        <form className="row g-2 align-items-end" onSubmit={onTrade}>
          <div className="col-12 col-md-4">
            <label className="form-label small">標的</label>
            <select
              className="form-select form-select-sm"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
            >
              {(["HK", "US"] as const).map((mkt) =>
                pickerGroups[mkt].map((group) => (
                  <optgroup
                    key={`${mkt}-${group.category}`}
                    label={`${mkt === "HK" ? "港股" : "美股"} · ${group.label}`}
                  >
                    {group.items.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.symbol} {n.nameZh}（{formatChangePct(n.changePct)}）
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label small">方向</label>
            <select
              className="form-select form-select-sm"
              value={side}
              onChange={(e) => setSide(e.target.value as "buy" | "sell")}
            >
              <option value="buy">買入</option>
              <option value="sell">賣出</option>
            </select>
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label small">股數</label>
            <input
              type="number"
              min={1}
              className="form-control form-control-sm"
              value={shares}
              onChange={(e) => setShares(Number(e.target.value) || 1)}
            />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label small">成交價（跟市）</label>
            <div className="form-control form-control-sm bg-light">
              {selected ? formatPrice(selected.last, selected.currency) : "—"}
            </div>
          </div>
          <div className="col-12 col-md-2">
            <button type="submit" className="btn btn-sm btn-primary w-100">
              模擬成交
            </button>
          </div>
        </form>
        {selected && (
          <p className="small text-secondary mt-2 mb-0">
            {selected.nameZh} · 最新{" "}
            {formatPrice(selected.last, selected.currency)} · 變動{" "}
            <span
              className={
                selected.changePct >= 0 ? "text-success" : "text-danger"
              }
            >
              {formatChangePct(selected.changePct)}
            </span>{" "}
            · {CATEGORIES.find((c) => c.id === selected.category)?.labelZh} ·
            標籤：模擬／學習用
          </p>
        )}
        {error && (
          <div className="alert alert-warning small mt-2 mb-0">{error}</div>
        )}
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">持倉（按最新市場報價標記）</h3>
        {marked.length === 0 ? (
          <p className="small text-secondary mb-0">
            未有持倉。買入後會用最新報價顯示現價同未實現盈虧。
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>股份</th>
                  <th className="text-end">股數</th>
                  <th className="text-end">成本</th>
                  <th className="text-end">現價</th>
                  <th className="text-end">日變動</th>
                  <th className="text-end">未實現</th>
                </tr>
              </thead>
              <tbody>
                {marked.map((h) => (
                  <tr key={h.quoteId}>
                    <td>
                      <div className="fw-semibold">{h.nameZh}</div>
                      <div className="small text-secondary">{h.symbol}</div>
                    </td>
                    <td className="text-end">{h.shares}</td>
                    <td className="text-end small">
                      {formatPrice(h.avgCost, h.currency)}
                    </td>
                    <td className="text-end small">
                      {h.last != null ? formatPrice(h.last, h.currency) : "—"}
                    </td>
                    <td
                      className={`text-end small ${
                        (h.changePct ?? 0) >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {h.changePct == null
                        ? "—"
                        : formatChangePct(h.changePct)}
                    </td>
                    <td
                      className={`text-end small ${
                        (h.unrealizedPnl ?? 0) >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {h.unrealizedPnl == null
                        ? "—"
                        : `${h.unrealizedPnl >= 0 ? "+" : ""}${h.unrealizedPnl.toFixed(2)}${
                            h.unrealizedPnlPct != null
                              ? ` (${formatChangePct(h.unrealizedPnlPct)})`
                              : ""
                          }`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">成交紀錄</h3>
        {portfolio.trades.length === 0 ? (
          <p className="small text-secondary mb-0">未有模擬交易。</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>時間</th>
                  <th>方向</th>
                  <th>股份</th>
                  <th className="text-end">股數×價</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.trades.slice(0, 40).map((t) => (
                  <tr key={t.id}>
                    <td className="small">
                      {new Date(t.at).toLocaleString("zh-HK")}
                    </td>
                    <td>{t.side === "buy" ? "買" : "賣"}</td>
                    <td>
                      {t.nameZh}
                      <div className="small text-secondary">{t.symbol}</div>
                    </td>
                    <td className="text-end small">
                      {t.shares} × {formatPrice(t.price, t.currency)}
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
