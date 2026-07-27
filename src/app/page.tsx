import { AppShell } from "@/components/layout/AppShell";
import { AppLink } from "@/components/layout/AppLink";

export default function Home() {
  return (
    <AppShell title="SmartCook + SmartFit">
      <section className="mode-hero mb-4">
        <span className="mode-hero-badge">SmartCook + SmartFit</span>
        <h1 className="display-6 fw-bold mb-3">今日想照顧自己邊一面？</h1>
        <p className="lead text-secondary mb-4">
          同一個 CookingMAMA 框架，延伸到煮食同運動。你可以繼續揀菜式、記錄買餸，
          亦可以根據身體質素、可用時間、器材、傷患同目標，生成一份新手友善訓練計劃。
        </p>
        <div className="mode-hero-actions">
          <AppLink href="/recipes" className="btn btn-primary btn-lg">
            去煮野食
          </AppLink>
          <AppLink href="/fitness" className="btn btn-outline-primary btn-lg">
            去做運動
          </AppLink>
        </div>
      </section>

      <section className="row g-3">
        <div className="col-12 col-md-6">
          <AppLink
            href="/recipes"
            className="mode-card text-decoration-none text-dark d-block h-100"
          >
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="mode-card-kicker">Cooking</div>
                <h2 className="h4 fw-bold mb-2">SmartCook 菜式模式</h2>
              </div>
              <div className="mode-card-icon" aria-hidden="true">
                🍳
              </div>
            </div>
            <p className="text-secondary mb-3">
              進入現有菜式庫、買餸清單、煮食日曆同自訂食譜流程，照舊管理每日飲食。
            </p>
            <ul className="mode-feature-list mb-0">
              <li>按菜系搵餸</li>
              <li>肉類／蔬菜篩選</li>
              <li>安排煮食日程</li>
            </ul>
          </AppLink>
        </div>

        <div className="col-12 col-md-6">
          <AppLink
            href="/fitness"
            className="mode-card text-decoration-none text-dark d-block h-100"
          >
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="mode-card-kicker">Fitness</div>
                <h2 className="h4 fw-bold mb-2">SmartFit 運動模式</h2>
              </div>
              <div className="mode-card-icon" aria-hidden="true">
                🏃
              </div>
            </div>
            <p className="text-secondary mb-3">
              填得越詳細，分析越準。系統會按你嘅目標、體能、時間、睡眠、壓力、器材同傷患，整理出一份新手訓練週計劃。
            </p>
            <ul className="mode-feature-list mb-0">
              <li>超詳細身體資料表</li>
              <li>新手安全漸進編排</li>
              <li>附官方動作參考來源</li>
            </ul>
          </AppLink>
        </div>
      </section>
    </AppShell>
  );
}
