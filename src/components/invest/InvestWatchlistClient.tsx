"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  formatPrice,
  loadMarketSnapshot,
  type MarketQuote,
  type MarketSnapshot,
} from "@/lib/investMarket";
import {
  loadInvestData,
  recordPaperTrade,
  removeWatchlistItem,
  resetPaperPortfolio,
  upsertWatchlistItem,
  type PaperPortfolio,
  type WatchlistItem,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestWatchlistClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [quoteId, setQuoteId] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState(10);
  const [hydrated, setHydrated] = useState(false);

  function refresh() {
    const data = loadInvestData(userKey);
    setWatchlist(data.watchlist);
    setPortfolio(data.paperPortfolio);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await loadMarketSnapshot();
      if (cancelled) return;
      setSnapshot(result.snapshot);
      if (result.snapshot.names[0]) setQuoteId(result.snapshot.names[0].id);
      refresh();
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  const quoteMap = useMemo(() => {
    const map = new Map<string, MarketQuote>();
    snapshot?.names.forEach((n) => map.set(n.id, n));
    return map;
  }, [snapshot]);

  const selected = quoteMap.get(quoteId);

  function onAddWatch(id: string) {
    const q = quoteMap.get(id);
    if (!q) return;
    const data = upsertWatchlistItem(userKey, {
      quoteId: q.id,
      symbol: q.symbol,
      nameZh: q.nameZh,
      market: q.market,
    });
    setWatchlist(data.watchlist);
  }

  function onTrade(event: FormEvent) {
    event.preventDefault();
    if (!selected || shares <= 0) return;
    const data = recordPaperTrade(userKey, {
      quoteId: selected.id,
      symbol: selected.symbol,
      nameZh: selected.nameZh,
      side,
      shares,
      price: selected.last,
      currency: selected.currency,
      note: "紙上練習（示範價）",
    });
    setPortfolio(data.paperPortfolio);
  }

  if (!hydrated || !portfolio || !snapshot) {
    return <div className="text-secondary small py-4">載入紙上組合中…</div>;
  }

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <h2 className="h5 fw-bold mb-1">觀察名單＋紙上組合</h2>
            <p className="small text-secondary mb-0">
              虛擬現金練習；每個帳戶獨立。示範價來自 {snapshot.asOf} 快照。
            </p>
          </div>
          <Link href="/invest/ideas" className="btn btn-sm btn-outline-primary">
            由想法加入
          </Link>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-6">
            <div className="planner-output-card">
              <div className="small text-secondary">紙上 HKD 現金</div>
              <div className="h5 fw-bold mb-0">
                {portfolio.cashHkd.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="planner-output-card">
              <div className="small text-secondary">紙上 USD 現金</div>
              <div className="h5 fw-bold mb-0">
                {portfolio.cashUsd.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mt-3"
          onClick={() => {
            const data = resetPaperPortfolio(userKey);
            setPortfolio(data.paperPortfolio);
          }}
        >
          重設紙上現金／清空交易
        </button>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">觀察名單</h3>
        <div className="d-flex flex-wrap gap-2 mb-3">
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
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onAddWatch(quoteId)}
          >
            加入名單
          </button>
        </div>
        {watchlist.length === 0 ? (
          <p className="small text-secondary mb-0">未有觀察股份。</p>
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
                        ? ` · ${formatPrice(q.last, q.currency)}（示範）`
                        : ""}
                    </div>
                    {w.note && (
                      <div className="small text-secondary">{w.note}</div>
                    )}
                  </div>
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
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">紙上買賣（練習）</h3>
        <form className="row g-2 align-items-end" onSubmit={onTrade}>
          <div className="col-12 col-md-4">
            <label className="form-label small">股份</label>
            <select
              className="form-select form-select-sm"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
            >
              {snapshot.names.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.symbol} {n.nameZh}
                </option>
              ))}
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
            <label className="form-label small">示範價</label>
            <div className="form-control form-control-sm bg-light">
              {selected
                ? formatPrice(selected.last, selected.currency)
                : "—"}
            </div>
          </div>
          <div className="col-12 col-md-2">
            <button type="submit" className="btn btn-sm btn-primary w-100">
              記錄
            </button>
          </div>
        </form>
        <p className="small text-secondary mt-2 mb-3">
          記錄只用示範價，唔連接任何券商。賣出唔強制檢查持倉（簡化練習）。
        </p>
        {portfolio.trades.length === 0 ? (
          <p className="small text-secondary mb-0">未有交易紀錄。</p>
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
                {portfolio.trades.slice(0, 30).map((t) => (
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
