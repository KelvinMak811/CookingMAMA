import { AppShell } from "@/components/layout/AppShell";
import { InvestHubClient } from "@/components/invest/InvestHubClient";

export default function InvestPage() {
  return (
    <AppShell title="學投資">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">SmartInvest · 學股票投資</div>
        <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-end">
          <div>
            <h1 className="h3 fw-bold mb-2">港股＋美股入門學習模式</h1>
            <p className="text-secondary mb-0">
              完整課堂、實際市場追蹤、模擬投資、學習想法——全部跟 Kelvin／YuetSum
              帳戶分開同步。呢度係教育工具，唔係持牌投資意見。
            </p>
          </div>
          <div className="planner-hero-note">
            <strong>投資有風險，內容僅供學習。</strong>
            無保證回報；示範報價可能過時。
          </div>
        </div>
      </section>
      <InvestHubClient />
    </AppShell>
  );
}
