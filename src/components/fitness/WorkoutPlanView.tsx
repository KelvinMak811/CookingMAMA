"use client";

import type { GeneratedPlan } from "@/lib/workoutPlanner";
import { enrichPlanItem } from "@/lib/workoutPlanner";
import { MovementVideoEmbed } from "@/components/fitness/MovementVideoEmbed";

interface WorkoutPlanViewProps {
  plan: GeneratedPlan;
  generatedAt?: string | null;
  completedAt?: string | null;
  compact?: boolean;
}

function formatGeneratedAt(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("zh-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkoutPlanView({
  plan,
  generatedAt,
  completedAt,
  compact = false,
}: WorkoutPlanViewProps) {
  const savedLabel = formatGeneratedAt(generatedAt);
  const completedLabel = formatGeneratedAt(completedAt);

  return (
    <div className={compact ? undefined : "planner-plan-page"}>
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h2 className="h5 fw-bold mb-1">{plan.displayName} 的 4 星期入門計劃</h2>
          <p className="small text-secondary mb-0">
            以新手安全、穩定習慣同逐步進展為核心。
            {savedLabel ? ` · 儲存於 ${savedLabel}` : ""}
            {completedLabel ? ` · 完成於 ${completedLabel}` : ""}
          </p>
        </div>
        <span
          className={`badge ${completedAt ? "text-bg-success" : "text-bg-primary"}`}
        >
          {completedAt ? `已完成 · ${plan.goalLabel}` : plan.goalLabel}
        </span>
      </div>

      <div className="planner-summary-grid mb-3">
        {plan.cards.map((card) => (
          <div key={card.label} className="planner-stat-card">
            <div className="planner-stat-label">{card.label}</div>
            <div className="planner-stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      <section className="mb-3">
        <h3 className="h6 fw-bold mb-2">分析重點</h3>
        <p className="small mb-2">{plan.focusText}</p>
        {plan.flags.length ? (
          <ul className="small text-secondary mb-0">
            {plan.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        ) : (
          <p className="small text-secondary mb-0">
            目前未見明顯高風險訊號，可由保守強度開始，再觀察恢復與動作品質。
          </p>
        )}
      </section>

      <section className="mb-3">
        <h3 className="h6 fw-bold mb-2">每週訓練安排</h3>
        <div className="planner-week-list">
          {plan.weeklyPlan.map((day, index) => (
            <article key={`${day.title}-${index}`} className="planner-day-card">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="planner-day-label">Day {index + 1}</div>
                  <h4 className="h6 fw-bold mb-1">{day.title}</h4>
                  <p className="small text-secondary mb-0">{day.focus}</p>
                </div>
                <span className="badge text-bg-light">{day.duration}</span>
              </div>
              <ul className="planner-movement-list">
                {day.items.map((rawItem) => {
                  const item = enrichPlanItem(rawItem);
                  return (
                    <li key={`${item.label}-${item.detail}`}>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                      {item.videoUrl ? (
                        <MovementVideoEmbed
                          url={item.videoUrl}
                          title={item.videoTitle}
                          org={item.videoOrg}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="small text-secondary mb-0">{day.coaching}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-3">
        <h3 className="h6 fw-bold mb-2">熱身與安全提醒</h3>
        <ul className="small text-secondary mb-0">
          {plan.warmup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="h6 fw-bold mb-2">4 星期漸進方式</h3>
        <ul className="small text-secondary mb-0">
          {plan.progression.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
