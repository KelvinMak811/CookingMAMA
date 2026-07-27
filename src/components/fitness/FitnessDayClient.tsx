"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLink } from "@/components/layout/AppLink";
import { getEnrichedDay, loadFitnessPlan } from "@/lib/fitnessPlanStorage";
import { youtubeEmbedUrl } from "@/lib/exerciseMedia";
import { useAccountStore } from "@/stores/accountStore";
import type { EnrichedPlanDay } from "@/lib/fitnessPlanEnrich";

export function FitnessDayClient() {
  const params = useParams();
  const dayParam = params?.day;
  const dayNumber = Number(Array.isArray(dayParam) ? dayParam[0] : dayParam);
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [day, setDay] = useState<EnrichedPlanDay | null>(null);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    const plan = loadFitnessPlan(userKey);
    if (!plan || !Number.isFinite(dayNumber)) {
      setDay(null);
      return;
    }
    setPlanName(plan.displayName);
    setDay(getEnrichedDay(plan, dayNumber));
  }, [userKey, dayNumber]);

  if (!day) {
    return (
      <section className="planner-output-card">
        <p className="mb-3">搵唔到呢一日嘅訓練內容。</p>
        <AppLink href="/fitness/plan" className="btn btn-primary">
          返回日程
        </AppLink>
      </section>
    );
  }

  return (
    <div className="fitness-day-page">
      <p className="small text-secondary mb-2">
        <AppLink href="/fitness/plan">← 返回 {planName} 的日程</AppLink>
      </p>
      <header className="planner-output-card mb-4">
        <div className="planner-day-label mb-1">Day {day.dayNumber}</div>
        <h1 className="h4 fw-bold mb-1">{day.title}</h1>
        <p className="text-secondary mb-2">{day.focus}</p>
        <p className="small mb-2">{day.calendarHint}</p>
        <span className="badge text-bg-light">{day.duration}</span>
        <span className="badge text-bg-secondary ms-2">
          約 {day.estimatedBurnKcal} kcal
        </span>
      </header>

      <section className="planner-output-card mb-4">
        <h2 className="h5 fw-bold mb-3">今日時間表</h2>
        <ol className="fitness-schedule-timeline">
          {day.schedule.map((slot) => (
            <li key={`${slot.time}-${slot.label}`}>
              <span className="fitness-schedule-time">{slot.time}</span>
              <div>
                <div className="fw-semibold">{slot.label}</div>
                <div className="small text-secondary">{slot.durationMin} 分鐘</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="small text-secondary mt-3 mb-0">{day.coaching}</p>
      </section>

      {day.exercises.map((exercise, index) => (
        <section key={`${exercise.label}-${index}`} className="planner-output-card mb-4">
          <h2 className="h5 fw-bold mb-2">
            {exercise.label}
            <span className="text-secondary fw-normal small ms-2">{exercise.detail}</span>
          </h2>
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden border mb-3">
            <iframe
              title={exercise.media.titleZh}
              src={youtubeEmbedUrl(exercise.media.youtubeId)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 className="h6 fw-bold mb-2">{exercise.media.titleZh} · 中文步驟</h3>
          <ol className="small mb-0">
            {exercise.media.stepsZh.map((step) => (
              <li key={step} className="mb-1">
                {step}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="d-flex flex-wrap gap-2">
        {day.dayNumber > 1 ? (
          <AppLink
            href={`/fitness/plan/day/${day.dayNumber - 1}`}
            className="btn btn-outline-secondary"
          >
            上一日
          </AppLink>
        ) : null}
        <AppLink href="/fitness/plan" className="btn btn-outline-primary">
          週曆總覽
        </AppLink>
        <AppLink
          href={`/fitness/plan/day/${day.dayNumber + 1}`}
          className="btn btn-outline-secondary"
        >
          下一日
        </AppLink>
      </div>
    </div>
  );
}
