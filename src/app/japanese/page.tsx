import { AppShell } from "@/components/layout/AppShell";
import { JapanesePlannerClient } from "@/components/japanese/JapanesePlannerClient";

export default function JapanesePage() {
  return (
    <AppShell title="日文學習">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">SmartJP · 日文學習</div>
        <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-end">
          <div>
            <h1 className="h3 fw-bold mb-2">由零基礎到 JLPT N1 嘅完整課程</h1>
            <p className="text-secondary mb-0">
              揀好程度、每週可學日數同每日時間，系統會排出學習日程；每課都有詞彙、讀法、例句同練習。
              介面用廣東話，課堂日文保留原文。進度會儲存到你嘅帳戶。
            </p>
          </div>
          <div className="planner-hero-note">
            <strong>提示：</strong> 課程係結構化溫習路線圖，唔係正式 JLPT 試題；建議配搭教科書、Anki
            或真題一齊用。
          </div>
        </div>
      </section>
      <JapanesePlannerClient />
    </AppShell>
  );
}
