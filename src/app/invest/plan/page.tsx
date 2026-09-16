import { AppShell } from "@/components/layout/AppShell";
import { InvestPlanClient } from "@/components/invest/InvestPlanClient";

export default function InvestPlanPage() {
  return (
    <AppShell title="投資學習日程" showBack backHref="/invest">
      <InvestPlanClient />
    </AppShell>
  );
}
