import { AppShell } from "@/components/layout/AppShell";
import { InvestIdeasClient } from "@/components/invest/InvestIdeasClient";

export default function InvestIdeasPage() {
  return (
    <AppShell title="學習想法" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">透明規則引擎 · 非投資建議</div>
        <h1 className="h3 fw-bold mb-2">邊隻適合練習？點計倉？點複盤？</h1>
        <p className="text-secondary mb-0">
          每個想法包含論點、風險、學習入場區概念、紙上比重同離場清單——清楚標示示範用途。
        </p>
      </section>
      <InvestIdeasClient />
    </AppShell>
  );
}
