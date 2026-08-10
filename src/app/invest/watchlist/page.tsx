import { AppShell } from "@/components/layout/AppShell";
import { InvestWatchlistClient } from "@/components/invest/InvestWatchlistClient";

export default function InvestWatchlistPage() {
  return (
    <AppShell title="觀察名單" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">觀察 · 每帳戶獨立</div>
        <h1 className="h3 fw-bold mb-2">觀察名單</h1>
        <p className="text-secondary mb-0">
          追蹤想跟進嘅標的報價；虛擬買賣請去「模擬投資」。投資有風險，內容僅供學習。
        </p>
      </section>
      <InvestWatchlistClient />
    </AppShell>
  );
}
