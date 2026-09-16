"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { WorkoutPlanView } from "@/components/fitness/WorkoutPlanView";
import { ProfileSummarySection } from "@/components/fitness/ProfileSummarySection";
import {
  completeCurrentPlan,
  loadFitnessData,
  type PlanHistoryEntry,
  type SavedFitnessPlan,
} from "@/lib/fitnessStorage";
import { useAccountStore } from "@/stores/accountStore";
import type { WorkoutProfile } from "@/lib/workoutPlanner";

function formatDateTime(iso?: string | null): string | null {
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

export function FitnessPlanPageClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const accountId = currentUserId || "guest";
  const [saved, setSaved] = useState<SavedFitnessPlan | null>(null);
  const [profile, setProfile] = useState<WorkoutProfile | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanHistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const data = loadFitnessData(accountId);
    setSaved(data.savedPlan);
    setProfile(data.profile);
    setPlanHistory(data.planHistory ?? []);
    setHydrated(true);
  }, [accountId]);

  function handleComplete() {
    if (!saved?.plan || saved.completedAt || completing) return;
    const ok = window.confirm(
      "確認將而家呢份計劃標記為已完成？之後可以訂製下一階段訓練。"
    );
    if (!ok) return;
    setCompleting(true);
    const next = completeCurrentPlan(accountId);
    setSaved(next.savedPlan);
    setProfile(next.profile);
    setPlanHistory(next.planHistory ?? []);
    setCompleting(false);
  }

  if (!hydrated) {
    return (
      <AppShell title="我的訓練計劃" showBack backHref="/fitness">
        <div className="text-secondary small py-4">載入已儲存計劃中…</div>
      </AppShell>
    );
  }

  if (!saved?.plan) {
    return (
      <AppShell title="我的訓練計劃" showBack backHref="/fitness">
        <section className="planner-output-card">
          <h1 className="h5 fw-bold mb-2">未有已儲存計劃</h1>
          <p className="small text-secondary mb-3">
            去運動頁填好身體資料並生成計劃後，系統會自動存入你嘅帳戶，下次可喺呢頁直接打開。
          </p>
          <Link href="/fitness" className="btn btn-primary">
            去生成計劃
          </Link>
        </section>
      </AppShell>
    );
  }

  const isCompleted = Boolean(saved.completedAt);
  const completedLabel = formatDateTime(saved.completedAt);

  return (
    <AppShell title="我的訓練計劃" showBack backHref="/fitness">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">
          {isCompleted ? "Completed SmartFit Plan" : "Saved SmartFit Plan"}
        </div>
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
          <div>
            <h1 className="h3 fw-bold mb-2">
              {isCompleted ? "已完成嘅訓練計劃" : "帳戶已儲存嘅訓練計劃"}
            </h1>
            <p className="text-secondary mb-0">
              {isCompleted
                ? `恭喜完成呢一階段${completedLabel ? `（${completedLabel}）` : ""}。可以訂製下一步，或者返去修改資料。`
                : "每個動作都附有可喺站內播放嘅教學影片；登入同一帳戶後可隨時再睇。完成後可標記並進入下一階段。"}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {isCompleted ? (
              <Link href="/fitness?next=1" className="btn btn-primary">
                下一步：訂製新計劃
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleComplete}
                disabled={completing}
              >
                {completing ? "處理中…" : "標記為已完成"}
              </button>
            )}
            <Link
              href={isCompleted ? "/fitness?next=1" : "/fitness"}
              className="btn btn-outline-primary"
            >
              {isCompleted ? "調整下一階段資料" : "更新計劃資料"}
            </Link>
          </div>
        </div>
      </section>

      {isCompleted ? (
        <section className="planner-next-banner mb-3">
          <div>
            <h2 className="h6 fw-bold mb-1">準備好下一階段未？</h2>
            <p className="small text-secondary mb-0">
              系統會用你而家嘅資料預填表單，你可以改目標、日數、時間、運動類型同強度，再生成新建議。
            </p>
          </div>
          <Link href="/fitness?next=1" className="btn btn-primary">
            去訂製下一步
          </Link>
        </section>
      ) : null}

      <ProfileSummarySection profile={profile} />

      <section className="planner-output-card mb-3">
        <WorkoutPlanView
          plan={saved.plan}
          generatedAt={saved.generatedAt}
          completedAt={saved.completedAt}
        />
      </section>

      {saved.plan.references?.length ? (
        <section className="planner-output-card mb-3">
          <h2 className="h5 fw-bold mb-2">參考來源</h2>
          <div className="reference-list small">
            {saved.plan.references.map((source) => (
              <a
                key={source.url}
                className="reference-card text-decoration-none"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="reference-org">{source.org}</div>
                    <div className="reference-title">{source.title}</div>
                    <div className="reference-note">{source.note}</div>
                  </div>
                  <span className="reference-arrow">↗</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {planHistory.length > 1 || (planHistory.length === 1 && !isCompleted) ? (
        <section className="planner-output-card">
          <h2 className="h5 fw-bold mb-2">過往已完成計劃</h2>
          <ul className="small text-secondary mb-0 planner-history-list">
            {planHistory
              .slice()
              .reverse()
              .filter((entry) =>
                isCompleted
                  ? entry.completedAt !== saved.completedAt
                  : true
              )
              .map((entry) => (
                <li key={`${entry.generatedAt}-${entry.completedAt}`}>
                  <strong>{entry.plan.goalLabel}</strong>
                  {" · 完成於 "}
                  {formatDateTime(entry.completedAt) || entry.completedAt}
                </li>
              ))}
          </ul>
        </section>
      ) : planHistory.length === 1 && isCompleted ? (
        <section className="planner-output-card">
          <h2 className="h5 fw-bold mb-2">計劃紀錄</h2>
          <p className="small text-secondary mb-0">
            呢份計劃已記入帳戶歷史（合共 {planHistory.length}{" "}
            份已完成），雲端同步時會一齊保存。
          </p>
        </section>
      ) : null}
    </AppShell>
  );
}
