"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  RISK_LABELS,
  categoryLabel,
  formatChangePct,
  formatPrice,
  loadMarketSnapshot,
  type MarketSnapshot,
  type StockCategoryId,
} from "@/lib/investMarket";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestMarketsClient() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [meta, setMeta] = useState<{ mode: string; error?: string }>({
    mode: "loading",
  });
  const [category, setCategory] = useState<StockCategoryId | "ALL">("ALL");
  const [market, setMarket] = useState<"ALL" | "HK" | "US">("ALL");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await loadMarketSnapshot();
      if (cancelled) return;
      setSnapshot(result.snapshot);
      setMeta({ mode: result.mode, error: result.error });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const names = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.names.filter((n) => {
      if (market !== "ALL" && n.market !== market) return false;
      if (category !== "ALL" && n.category !== category) return false;
      return true;
    });
  }, [snapshot, market, category]);

  if (!snapshot) {
    return <div className="text-secondary small py-4">載入市場快照中…</div>;
  }

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
          <div>
            <h2 className="h5 fw-bold mb-1">港股＋美股近期走勢（示範）</h2>
            <p className="small text-secondary mb-0">
              來源：{snapshot.source} · 時間戳：{snapshot.asOf} · 標籤：
              <span className="badge text-bg-warning ms-1">{snapshot.label}</span>
            </p>
          </div>
          <Link href="/invest/ideas" className="btn btn-sm btn-outline-primary">
            睇學習想法
          </Link>
        </div>
        {meta.error && (
          <div className="alert alert-secondary small mt-3 mb-0">{meta.error}</div>
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
                  <th className="text-end">示範價</th>
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
