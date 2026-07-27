import { AppShell } from "@/components/layout/AppShell";
import { FitnessPlannerClient } from "@/components/fitness/FitnessPlannerClient";

export default function FitnessPage() {
  return (
    <AppShell title="運動計劃">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">SmartFit for Beginners</div>
        <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-end">
          <div>
            <h1 className="h3 fw-bold mb-2">按你身體狀況製定新手訓練計劃</h1>
            <p className="text-secondary mb-0">
              呢頁會以初學者、安全、可持續為原則，根據你輸入嘅身體資料、生活節奏、傷患、設備同目標，
              生成一份可立即開始嘅 4 星期入門訓練建議。
            </p>
          </div>
          <div className="planner-hero-note">
            <strong>重要：</strong> 呢份內容屬一般健身教育資訊；如你有心臟病、高血壓、近期手術、懷孕、
            持續痛症或其他慢性病，開始前請先問醫生或物理治療師。
          </div>
        </div>
      </section>
      <FitnessPlannerClient />
    </AppShell>
  );
}
