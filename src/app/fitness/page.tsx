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
              支援綜合健身、游泳、足球同羽毛球。填好資料後會生成 4 星期入門計劃、BMI 走勢，
              並儲存到你嘅帳戶；計劃頁會顯示你嘅個人資料依據，每個動作都附有可喺站內播放嘅教學影片。
              完成一階段後可以標記並訂製下一步。
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
