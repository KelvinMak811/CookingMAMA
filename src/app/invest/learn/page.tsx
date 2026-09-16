import { AppShell } from "@/components/layout/AppShell";
import { InvestLearnClient } from "@/components/invest/InvestLearnClient";

export default function InvestLearnPage() {
  return (
    <AppShell title="投資課程" showBack backHref="/invest">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">港股入門 · 美股入門</div>
        <h1 className="h3 fw-bold mb-2">新手課程同完整課堂</h1>
        <p className="text-secondary mb-0">
          由市場結構、落盤、費用意識到風險框架；每課有概念、例子、風險同小測驗。完成後可生成每週學習日程。
        </p>
      </section>
      <InvestLearnClient />
    </AppShell>
  );
}
