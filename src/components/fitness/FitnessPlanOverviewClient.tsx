"use client";

import { useEffect, useState } from "react";
import { AppLink } from "@/components/layout/AppLink";
import { loadFitnessPlan } from "@/lib/fitnessPlanStorage";
import { useAccountStore } from "@/stores/accountStore";
import { youtubeEmbedUrl } from "@/lib/exerciseMedia";
import { ACTIVITY_OPTIONS } from "@/lib/activityPlans";
import type { EnrichedFitnessPlan } from "@/lib/fitnessPlanEnrich";

export function FitnessPlanOverviewClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [plan, setPlan] = useState<EnrichedFitnessPlan | null>(null);

  useEffect(() => {
    setPlan(loadFitnessPlan(userKey));
  }, [userKey]);

  if (!plan) {
    return (
      <section className="planner-output-card">
        <h2 className="h5 fw-bold mb-2">尚未有訓練日程</h2>
        <p className="small text-secondary mb-3">
          請先到運動計劃頁填寫資料並生成計劃，系統會自動建立時間表同日曆建議。
        </p>
        <AppLink href="/fitness" className="btn btn-primary">
          去生成計劃
        </AppLink>
      </section>
    );
  }

  return (
    <div className="fitness-plan-overview">
      <section className="planner-output-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold mb-1">{plan.displayName} 的訓練日程</h1>
            <p className="small text-secondary mb-0">
              生成於 {new Date(plan.savedAt).toLocaleString("zh-HK")} · {plan.goalLabel}
            </p>
          </div>
          <AppLink href="/fitness" className="btn btn-outline-primary btn-sm">
            調整資料
          </AppLink>
        </div>
        <div className="planner-summary-grid mb-3">
          {plan.cards.map((card) => (
            <div key={card.label} className="planner-stat-card">
              <div className="planner-stat-label">{card.label}</div>
              <div className="planner-stat-value">{card.value}</div>
            </div>
          ))}
        </div>
        {plan.estimatedDailyTdeeKcal ? (
          <p className="small text-secondary mb-0">
            估算每日消耗（TDEE）約 <strong>{plan.estimatedDailyTdeeKcal} kcal</strong>，可喺{" "}
            <AppLink href="/nutrition">飲食紀錄</AppLink> 對照攝取量。
          </p>
        ) : null}
      </section>

      <section className="planner-output-card mb-4">
        <h2 className="h5 fw-bold mb-3">每週日曆建議</h2>
        <div className="fitness-calendar-grid">
          {plan.calendarWeek.map((cell) => (
            <div
              key={cell.weekday}
              className={`fitness-calendar-cell ${
                cell.dayNumber ? "has-session" : "rest"
              }`}
            >
              <div className="fitness-calendar-weekday">{cell.weekday}</div>
              {cell.dayNumber ? (
                <AppLink
                  href={`/fitness/plan/day/${cell.dayNumber}`}
                  className="fitness-calendar-link"
                >
                  <span className="badge text-bg-primary mb-1">Day {cell.dayNumber}</span>
                  <div className="small fw-semibold">{cell.title}</div>
                </AppLink>
              ) : (
                <div className="small text-secondary">{cell.title}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="planner-output-card mb-4">
        <h2 className="h5 fw-bold mb-3">訓練日時間表</h2>
        <div className="planner-week-list">
          {plan.enrichedDays.map((day) => (
            <article key={day.dayNumber} className="planner-day-card">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="planner-day-label">Day {day.dayNumber}</div>
                  <h3 className="h6 fw-bold mb-1">{day.title}</h3>
                  <p className="small text-secondary mb-0">{day.calendarHint}</p>
                </div>
                <AppLink
                  href={`/fitness/plan/day/${day.dayNumber}`}
                  className="btn btn-sm btn-primary"
                >
                  開啟當日
                </AppLink>
              </div>
              <ol className="fitness-schedule-timeline small mb-2">
                {day.schedule.map((slot) => (
                  <li key={`${slot.time}-${slot.label}`}>
                    <span className="fitness-schedule-time">{slot.time}</span>
                    <span>
                      {slot.label} · {slot.durationMin} 分鐘
                    </span>
                  </li>
                ))}
              </ol>
              <p className="small text-secondary mb-0">
                估算消耗約 {day.estimatedBurnKcal} kcal
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="planner-output-card mb-4">
        <h2 className="h5 fw-bold mb-3">按興趣的訓練建議</h2>
        <p className="small text-secondary mb-3">
          根據你揀嘅興趣，一次過顯示不同活動嘅週期建議（可同上面嘅全身計劃配合）。
        </p>
        <div className="row g-3">
          {plan.activitySuggestions.map((suggestion) => {
            const meta = ACTIVITY_OPTIONS.find((o) => o.id === suggestion.id);
            return (
              <div key={suggestion.id} className="col-12 col-md-6">
                <article className="activity-suggestion-card h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-4" aria-hidden>
                      {meta?.emoji || "🏅"}
                    </span>
                    <h3 className="h6 fw-bold mb-0">{suggestion.title}</h3>
                  </div>
                  <p className="small mb-2">{suggestion.summary}</p>
                  <ul className="small text-secondary mb-2">
                    {suggestion.weeklySessions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="small mb-0">
                    <strong>強度：</strong>
                    {suggestion.intensityNote}
                  </p>
                </article>
              </div>
            );
          })}
        </div>
      </section>

      <section className="planner-output-card">
        <h2 className="h5 fw-bold mb-2">參考影片預覽</h2>
        <p className="small text-secondary mb-3">
          每個訓練日頁面會內嵌 YouTube 教學同中文步驟；以下係 Day 1 第一個動作預覽。
        </p>
        {plan.enrichedDays[0]?.exercises[0] ? (
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden border">
            <iframe
              title={plan.enrichedDays[0].exercises[0].media.titleZh}
              src={youtubeEmbedUrl(plan.enrichedDays[0].exercises[0].media.youtubeId)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
