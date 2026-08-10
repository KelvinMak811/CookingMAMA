"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { WorkoutPlanView } from "@/components/fitness/WorkoutPlanView";
import { loadFitnessData } from "@/lib/fitnessStorage";
import { useAccountStore } from "@/stores/accountStore";
import type { SavedFitnessPlan } from "@/lib/fitnessStorage";

export function FitnessPlanPageClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const accountId = currentUserId || "guest";
  const [saved, setSaved] = useState<SavedFitnessPlan | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadFitnessData(accountId);
    setSaved(data.savedPlan);
    setHydrated(true);
  }, [accountId]);

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

  return (
    <AppShell title="我的訓練計劃" showBack backHref="/fitness">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">Saved SmartFit Plan</div>
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
          <div>
            <h1 className="h3 fw-bold mb-2">帳戶已儲存嘅訓練計劃</h1>
            <p className="text-secondary mb-0">
              每個動作都附有教學影片連結；登入同一帳戶後可隨時再睇。
            </p>
          </div>
          <Link href="/fitness" className="btn btn-outline-primary">
            更新計劃資料
          </Link>
        </div>
      </section>

      <section className="planner-output-card mb-3">
        <WorkoutPlanView plan={saved.plan} generatedAt={saved.generatedAt} />
      </section>

      {saved.plan.references?.length ? (
        <section className="planner-output-card">
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
    </AppShell>
  );
}
