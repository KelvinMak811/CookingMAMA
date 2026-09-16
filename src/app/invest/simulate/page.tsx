import { AppShell } from "@/components/layout/AppShell";
import { InvestSimulateClient } from "@/components/invest/InvestSimulateClient";

export default function InvestSimulatePage() {
  return (
    <AppShell title="模擬投資" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">模擬／學習用 · 非真實資產</div>
        <h1 className="h3 fw-bold mb-2">模擬投資（紙上組合）</h1>
        <p className="text-secondary mb-0">
          用虛擬現金練習港股／美股買賣、睇持倉盈虧同成交紀錄。報價會盡量用即時資料，失敗則顯示示範資料。投資有風險，內容僅供學習。
        </p>
      </section>
      <InvestSimulateClient />
    </AppShell>
  );
}
