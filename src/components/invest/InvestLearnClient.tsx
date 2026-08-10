"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccountName } from "@/lib/accounts";
import { useAccountStore } from "@/stores/accountStore";
import {
  DEFAULT_INVEST_PREFERENCES,
  FOCUS_LABELS,
  INVEST_COURSE,
  SAMPLE_INVEST_PREFERENCES,
  WEEKDAY_LABELS,
  countLessons,
  trackProgress,
  type InvestTrackId,
} from "@/lib/investCourse";
import {
  loadInvestData,
  saveInvestScheduleForAccount,
  toggleInvestLessonComplete,
  type InvestPreferences,
  type SavedInvestSchedule,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

function toggleWeekday(current: number[], day: number): number[] {
  if (current.includes(day)) {
    const next = current.filter((d) => d !== day);
    return next.length ? next : current;
  }
  return [...current, day].sort((a, b) => a - b);
}

function toPrefs(partial: Partial<InvestPreferences>): InvestPreferences {
  return {
    nickname: partial.nickname ?? "",
    defaultTrack: partial.defaultTrack ?? "hk_basics",
    daysPerWeek: partial.daysPerWeek ?? DEFAULT_INVEST_PREFERENCES.daysPerWeek,
    minutesPerDay:
      partial.minutesPerDay ?? DEFAULT_INVEST_PREFERENCES.minutesPerDay,
    weeklyDays: partial.weeklyDays ?? DEFAULT_INVEST_PREFERENCES.weeklyDays,
    paperCapitalHkd:
      partial.paperCapitalHkd ?? DEFAULT_INVEST_PREFERENCES.paperCapital,
    paperCapitalUsd: partial.paperCapitalUsd ?? 10000,
    riskPctPerIdea:
      partial.riskPctPerIdea ?? DEFAULT_INVEST_PREFERENCES.riskPctPerIdea,
    showPennyWarning: partial.showPennyWarning !== false,
  };
}

export function InvestLearnClient() {
  const router = useRouter();
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const fallbackName = currentUserId ? getAccountName(currentUserId) : "你";

  const [prefs, setPrefs] = useState<InvestPreferences>(toPrefs({}));
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedInvestSchedule | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTrack, setActiveTrack] = useState<InvestTrackId>("hk_basics");

  useEffect(() => {
    const data = loadInvestData(userKey);
    if (data.preferences) {
      setPrefs(toPrefs(data.preferences));
      setActiveTrack(data.preferences.defaultTrack);
    } else {
      setPrefs(toPrefs({ nickname: fallbackName }));
    }
    setCompletedIds(data.courseProgress);
    setSaved(data.schedule);
    setHydrated(true);
  }, [userKey, fallbackName]);

  const progress = useMemo(
    () => trackProgress(activeTrack, completedIds),
    [activeTrack, completedIds]
  );

  function updateField<K extends keyof InvestPreferences>(
    key: K,
    value: InvestPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function persist(nextPrefs: InvestPreferences, nextCompleted = completedIds) {
    const data = saveInvestScheduleForAccount(userKey, nextPrefs, nextCompleted);
    setPrefs(data.preferences ?? nextPrefs);
    setCompletedIds(data.courseProgress);
    setSaved(data.schedule);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      ...prefs,
      daysPerWeek: prefs.weeklyDays.length || prefs.daysPerWeek,
    };
    persist(next);
    router.push("/invest/plan");
  }

  if (!hydrated) {
    return <div className="text-secondary small py-4">載入投資課程中…</div>;
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <InvestDisclaimer />
      </div>
      <div className="col-12 col-xl-7">
        <form className="planner-form" onSubmit={onSubmit}>
          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">1. 學習設定</h2>
              <p className="small text-secondary mb-0">
                揀港股或美股軌道，設定每週日數同每日時間。
              </p>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">稱呼</label>
                <input
                  className="form-control"
                  value={prefs.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label">主修軌道</label>
                <select
                  className="form-select"
                  value={prefs.defaultTrack}
                  onChange={(e) => {
                    const track = e.target.value as InvestTrackId;
                    updateField("defaultTrack", track);
                    setActiveTrack(track);
                  }}
                >
                  {INVEST_COURSE.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.labelZh}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">每日分鐘</label>
                <input
                  type="number"
                  min={15}
                  max={120}
                  className="form-control"
                  value={prefs.minutesPerDay}
                  onChange={(e) =>
                    updateField("minutesPerDay", Number(e.target.value) || 25)
                  }
                />
              </div>
              <div className="col-6">
                <label className="form-label">每筆紙上風險 %</label>
                <input
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="form-control"
                  value={prefs.riskPctPerIdea}
                  onChange={(e) =>
                    updateField("riskPctPerIdea", Number(e.target.value) || 1)
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label">每週學習日</label>
                <div className="chip-check-grid">
                  {WEEKDAY_LABELS.map((label, day) => (
                    <label key={label} className="chip-check">
                      <input
                        type="checkbox"
                        checked={prefs.weeklyDays.includes(day)}
                        onChange={() =>
                          updateField(
                            "weeklyDays",
                            toggleWeekday(prefs.weeklyDays, day)
                          )
                        }
                      />
                      <span>週{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button type="submit" className="btn btn-primary">
                生成並查看日程
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  persist(
                    toPrefs({
                      ...SAMPLE_INVEST_PREFERENCES,
                      nickname: prefs.nickname || SAMPLE_INVEST_PREFERENCES.nickname,
                      defaultTrack: SAMPLE_INVEST_PREFERENCES.track,
                      paperCapitalHkd: SAMPLE_INVEST_PREFERENCES.paperCapital,
                    })
                  )
                }
              >
                載入範例設定
              </button>
              {saved && (
                <Link href="/invest/plan" className="btn btn-outline-primary">
                  睇已存日程
                </Link>
              )}
            </div>
          </section>
        </form>
      </div>

      <div className="col-12 col-xl-5">
        <div className="planner-side-stack">
          <section className="planner-output-card">
            <h2 className="h6 fw-bold mb-2">課程進度</h2>
            <p className="small text-secondary mb-2">
              全課程 {countLessons()} 課 · 目前軌道進度 {progress.done}/
              {progress.total}（{progress.pct}%）
            </p>
            <div className="d-flex gap-2 mb-3">
              {INVEST_COURSE.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`btn btn-sm ${
                    activeTrack === t.id ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setActiveTrack(t.id)}
                >
                  {t.labelZh}
                </button>
              ))}
            </div>
          </section>

          {INVEST_COURSE.filter((t) => t.id === activeTrack).map((track) => (
            <section key={track.id} className="planner-section">
              <h3 className="h6 fw-bold mb-1">{track.labelZh}</h3>
              <p className="small text-secondary mb-3">{track.blurbZh}</p>
              {track.units.map((unit) => (
                <div key={unit.id} className="mb-3">
                  <div className="fw-semibold small mb-2">{unit.titleZh}</div>
                  <ul className="list-unstyled mb-0">
                    {unit.lessons.map((lesson) => {
                      const done = completedIds.includes(lesson.id);
                      return (
                        <li
                          key={lesson.id}
                          className="border-bottom py-2 d-flex gap-2 align-items-start"
                        >
                          <input
                            type="checkbox"
                            className="form-check-input mt-1"
                            checked={done}
                            onChange={(e) => {
                              const data = toggleInvestLessonComplete(
                                userKey,
                                lesson.id,
                                e.target.checked
                              );
                              setCompletedIds(data.courseProgress);
                            }}
                          />
                          <div>
                            <div className="fw-semibold small">{lesson.titleZh}</div>
                            <div className="text-secondary" style={{ fontSize: "0.8rem" }}>
                              {FOCUS_LABELS[lesson.focus]} · {lesson.minutes} 分鐘
                            </div>
                            <p className="small mb-1 mt-1">{lesson.summaryZh}</p>
                            <ul className="small text-secondary mb-0 ps-3">
                              {lesson.checklist.map((c) => (
                                <li key={c}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
