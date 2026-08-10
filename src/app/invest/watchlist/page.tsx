import { AppShell } from "@/components/layout/AppShell";
import { InvestWatchlistClient } from "@/components/invest/InvestWatchlistClient";

export default function InvestWatchlistPage() {
  return (
    <AppShell title="觀察名單" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">紙上練習 · 每帳戶獨立</div>
        <h1 className="h3 fw-bold mb-2">觀察名單同虛擬組合</h1>
        <p className="text-secondary mb-0">
          用示範價記錄買賣，練習倉位同紀律；唔連接券商。
        </p>
      </section>
      <InvestWatchlistClient />
    </AppShell>
  );
}
