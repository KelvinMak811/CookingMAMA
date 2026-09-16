import { AppShell } from "@/components/layout/AppShell";
import { InvestMarketsClient } from "@/components/invest/InvestMarketsClient";

export default function InvestMarketsPage() {
  return (
    <AppShell title="市場概覽" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">市場追蹤 · 學習用途</div>
        <h1 className="h3 fw-bold mb-2">港股＋美股市場追蹤</h1>
        <p className="text-secondary mb-0">
          指數、代表性股份同觀察名單報價。有 API key 會盡量即時，否則標示「示範資料」。投資有風險，內容僅供學習。
        </p>
      </section>
      <InvestMarketsClient />
    </AppShell>
  );
}
