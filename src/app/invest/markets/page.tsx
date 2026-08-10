import { AppShell } from "@/components/layout/AppShell";
import { InvestMarketsClient } from "@/components/invest/InvestMarketsClient";

export default function InvestMarketsPage() {
  return (
    <AppShell title="市場概覽" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">示範／學習用快照</div>
        <h1 className="h3 fw-bold mb-2">港股＋美股近期走勢</h1>
        <p className="text-secondary mb-0">
          指數同代表性股份附來源時間戳；可按科技、金融、ETF、仙股等分類瀏覽。
        </p>
      </section>
      <InvestMarketsClient />
    </AppShell>
  );
}
