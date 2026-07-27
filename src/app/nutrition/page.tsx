import { AppShell } from "@/components/layout/AppShell";
import { NutritionClient } from "@/components/nutrition/NutritionClient";

export default function NutritionPage() {
  return (
    <AppShell title="飲食與卡路里" showBack backHref="/fitness/plan">
      <section className="planner-hero mb-4">
        <span className="planner-hero-badge">SmartFit Nutrition</span>
        <h1 className="h4 fw-bold mb-2">記錄每日飲食</h1>
        <p className="small text-secondary mb-0">
          手動或拍照記低卡路里，對照每日、每週、每月攝取同估算消耗。
        </p>
      </section>
      <NutritionClient />
    </AppShell>
  );
}
