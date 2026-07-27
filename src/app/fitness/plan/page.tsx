import { AppShell } from "@/components/layout/AppShell";
import { FitnessPlanOverviewClient } from "@/components/fitness/FitnessPlanOverviewClient";

export default function FitnessPlanPage() {
  return (
    <AppShell title="訓練日程" showBack backHref="/fitness">
      <FitnessPlanOverviewClient />
    </AppShell>
  );
}
