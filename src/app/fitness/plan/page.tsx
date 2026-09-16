import { AppShell } from "@/components/layout/AppShell";
import { FitnessPlanPageClient } from "@/components/fitness/FitnessPlanPageClient";

export default function FitnessPlanPage() {
  return (
    <AppShell title="訓練日程" showBack backHref="/fitness">
      <FitnessPlanPageClient />
    </AppShell>
  );
}
}
