"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  RISK_LABELS,
  buildEducationalIdeas,
  calcPositionSize,
  categoryLabel,
  formatPrice,
  loadMarketSnapshot,
  type InvestIdea,
  type MarketSnapshot,
} from "@/lib/investMarket";
import {
  loadInvestData,
  toggleSavedIdea,
  upsertWatchlistItem,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestIdeasClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [focus, setFocus] = useState<"ALL" | "HK" | "US">("ALL");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [riskPct, setRiskPct] = useState(1);
  const [capital, setCapital] = useState(100000);
  const [selected, setSelected] = useState<InvestIdea | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await loadMarketSnapshot();
      if (cancelled) return;
      setSnapshot(result.snapshot);
      const data = loadInvestData(userKey);
      setSavedIds(data.savedIdeas);
      if (data.preferences) {
        setRiskPct(data.preferences.riskPctPerIdea);
        setCapital(
          focus === "US"
            ? data.preferences.paperCapitalUsd
            : data.preferences.paperCapitalHkd
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userKey, focus]);

  const ideas = useMemo(() => {
    if (!snapshot) return [];
    return buildEducationalIdeas(snapshot, focus);
  }, [snapshot, focus]);

  useEffect(() => {
    if (ideas.length && !selected) setSelected(ideas[0]);
  }, [ideas, selected]);

  const size = useMemo(() => {
    if (!selected || selected.suggestedPaperWeightPct <= 0) return null;
    const mid =
      (selected.learningEntryZone.low + selected.learningEntryZone.high) / 2 || 1;
    return calcPositionSize({
      paperCapital: capital,
      riskPctOfCapital: riskPct,
      entryPrice: mid,
      stopDistancePct: selected.riskLevel === "low" ? 5 : 8,
    });
  }, [selected, capital, riskPct]);

  if (!snapshot) {
    return <div className="text-secondary small py-4">載入學習想法中…</div>;
  }

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <h2 className="h5 fw-bold mb-1">示範／學習用想法引擎</h2>
        <p className="small text-secondary mb-2">
          規則引擎按分類同風險等級產生<strong>練習用</strong>論點，並附來源時間戳{" "}
          {snapshot.asOf}（{snapshot.label}）。唔係「必勝貼士」，亦無保證回報。
        </p>
        <div className="d-flex flex-wrap gap-2">
          {(["ALL", "HK", "US"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`btn btn-sm ${focus === m ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => {
                setFocus(m);
                setSelected(null);
              }}
            >
              {m === "ALL" ? "全部" : m === "HK" ? "港股" : "美股"}
            </button>
          ))}
          <Link href="/invest/simulate" className="btn btn-sm btn-outline-primary">
            去模擬投資
          </Link>
        </div>
      </section>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="planner-side-stack">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                type="button"
                className={`planner-output-card text-start w-100 border ${
                  selected?.id === idea.id ? "border-primary" : ""
                }`}
                onClick={() => setSelected(idea)}
              >
                <div className="d-flex justify-content-between gap-2">
                  <div>
                    <div className="fw-bold">{idea.nameZh}</div>
                    <div className="small text-secondary">
                      {idea.market} · {idea.symbol} · {categoryLabel(idea.category)}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      idea.riskLevel === "very_high"
                        ? "text-bg-danger"
                        : "text-bg-secondary"
                    }`}
                  >
                    {RISK_LABELS[idea.riskLevel]}
                  </span>
                </div>
                <p className="small mb-0 mt-2 text-secondary text-truncate-2">
                  {idea.thesisZh}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-7">
          {selected && (
            <section className="planner-section">
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                <div>
                  <h3 className="h5 fw-bold mb-0">{selected.nameZh}</h3>
                  <div className="small text-secondary">
                    {selected.symbol} · 紙上建議比重約 {selected.suggestedPaperWeightPct}%
                    {selected.isDemo ? " · 示範" : ""}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      const saved = !savedIds.includes(selected.id);
                      const data = toggleSavedIdea(userKey, selected.id, saved);
                      setSavedIds(data.savedIdeas);
                    }}
                  >
                    {savedIds.includes(selected.id) ? "已收藏" : "收藏想法"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      upsertWatchlistItem(userKey, {
                        quoteId: selected.quoteId,
                        symbol: selected.symbol,
                        nameZh: selected.nameZh,
                        market: selected.market,
                        note: "由學習想法加入",
                      });
                    }}
                  >
                    加入觀察名單
                  </button>
                </div>
              </div>

              <h4 className="h6 fw-bold">學習論點</h4>
              <p>{selected.thesisZh}</p>

              <h4 className="h6 fw-bold">點解呢個分類</h4>
              <p className="small">{selected.whyCategoryZh}</p>

              <h4 className="h6 fw-bold">學習入場區（概念）</h4>
              <p className="small">
                {selected.suggestedPaperWeightPct <= 0 ? (
                  selected.learningEntryZone.noteZh
                ) : (
                  <>
                    約{" "}
                    {formatPrice(
                      selected.learningEntryZone.low,
                      selected.market === "HK" ? "HKD" : "USD"
                    )}{" "}
                    –{" "}
                    {formatPrice(
                      selected.learningEntryZone.high,
                      selected.market === "HK" ? "HKD" : "USD"
                    )}
                    。{selected.learningEntryZone.noteZh}
                  </>
                )}
              </p>

              <h4 className="h6 fw-bold">風險分析</h4>
              <ul className="small">
                {selected.riskAnalysisZh.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              <h4 className="h6 fw-bold">離場／複盤清單</h4>
              <ul className="small">
                {selected.exitReviewChecklist.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>

              <div className="border rounded-3 p-3 bg-light mt-3">
                <h4 className="h6 fw-bold mb-2">新手倉位計算器（紙上）</h4>
                <div className="row g-2 align-items-end">
                  <div className="col-6">
                    <label className="form-label small">紙上本金</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={capital}
                      onChange={(e) => setCapital(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">每筆風險 %</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      step={0.5}
                      min={0.5}
                      max={5}
                      value={riskPct}
                      onChange={(e) => setRiskPct(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>
                {size ? (
                  <div className="small mt-2 mb-0">
                    <div>
                      風險金額約 {size.riskAmount.toFixed(0)} · 約可買 {size.shares}{" "}
                      股 · 名義金額 {size.notional.toFixed(0)}（佔本金約{" "}
                      {size.weightPct.toFixed(1)}%）
                    </div>
                    <ul className="mb-0 mt-1">
                      {size.notesZh.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="small text-secondary mb-0 mt-2">
                    呢個想法建議紙上比重為 0（例如仙股反例）——只觀察，唔練習買入。
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
