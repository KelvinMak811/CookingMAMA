import { AppShell } from "@/components/layout/AppShell";
import { FitnessDayClient } from "@/components/fitness/FitnessDayClient";

export default function FitnessDayPage() {
  return (
    <AppShell title="訓練日" showBack backHref="/fitness/plan">
      <FitnessDayClient />
    </AppShell>
  );
}
