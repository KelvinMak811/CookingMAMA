"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccountName } from "@/lib/accounts";
import { useAccountStore } from "@/stores/accountStore";
import {
  DEFAULT_PREFERENCES,
  GOAL_OPTIONS,
  JAPANESE_COURSE,
  SAMPLE_PREFERENCES,
  WEEKDAY_LABELS,
  courseStats,
  countLessons,
  levelProgress,
  type StudyPreferences,
} from "@/lib/japaneseCourse";
import {
  loadJapaneseData,
  saveJapaneseScheduleForAccount,
  toggleLessonComplete,
} from "@/lib/japaneseStorage";
import { JapaneseCourseView } from "@/components/japanese/JapaneseCourseView";
import { JapaneseScheduleView } from "@/components/japanese/JapaneseScheduleView";
import type { SavedJapaneseSchedule } from "@/lib/japaneseStorage";

function toggleWeekday(current: number[], day: number): number[] {
  if (current.includes(day)) {
    const next = current.filter((d) => d !== day);
    return next.length ? next : current;
  }
  return [...current, day].sort((a, b) => a - b);
}

export function JapanesePlannerClient() {
  const router = useRouter();
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const fallbackName = currentUserId ? getAccountName(currentUserId) : "你";

  const [prefs, setPrefs] = useState<StudyPreferences>(DEFAULT_PREFERENCES);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedJapaneseSchedule | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadJapaneseData(userKey);
    if (data.preferences) {
      setPrefs({ ...DEFAULT_PREFERENCES, ...data.preferences });
    } else {
      setPrefs((p) => ({ ...p, nickname: fallbackName }));
    }
    setCompletedIds(data.completedLessonIds);
    setSaved(data.savedSchedule);
    setHydrated(true);
  }, [userKey, fallbackName]);

  const stats = useMemo(() => courseStats(), []);
  const totalLessons = useMemo(() => countLessons(), []);
  const overallDone = completedIds.length;
  const currentProgress = levelProgress(prefs.currentLevel, completedIds);

  function updateField<K extends keyof StudyPreferences>(
    key: K,
    value: StudyPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function persistSchedule(nextPrefs: StudyPreferences, nextCompleted = completedIds) {
    const data = saveJapaneseScheduleForAccount(userKey, nextPrefs, nextCompleted);
    setPrefs(data.preferences ?? nextPrefs);
    setCompletedIds(data.completedLessonIds);
    setSaved(data.savedSchedule);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextPrefs = {
      ...prefs,
      daysPerWeek: prefs.weeklyDays.length || prefs.daysPerWeek,
    };
    persistSchedule(nextPrefs);
    router.push("/japanese/plan");
  }

  function loadSample() {
    persistSchedule(SAMPLE_PREFERENCES, completedIds);
  }

  function onToggleLesson(lessonId: string, completed: boolean) {
    const data = toggleLessonComplete(userKey, lessonId, completed);
    setCompletedIds(data.completedLessonIds);
    if (data.preferences) setPrefs(data.preferences);
    setSaved(data.savedSchedule);
  }

  if (!hydrated) {
    return <div className="text-secondary small py-4">載入日文課程中…</div>;
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-7">
        <form className="planner-form" onSubmit={onSubmit}>
          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">1. 學習資料</h2>
              <p className="small text-secondary mb-0">
                揀你而家程度同目標，之後會按日數同時間排學習日程。
              </p>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">稱呼 / 暱稱</label>
                <input
                  className="form-control"
                  value={prefs.nickname}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="例如：阿明"
                />
              </div>
              <div className="col-6">
                <label className="form-label">目前程度</label>
                <select
                  className="form-select"
                  value={prefs.currentLevel}
                  onChange={(e) =>
                    updateField(
                      "currentLevel",
                      e.target.value as StudyPreferences["currentLevel"]
                    )
                  }
                >
                  {JAPANESE_COURSE.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.labelZh}（{level.labelJa}）
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">學習目標</label>
                <div className="chip-check-grid">
                  {GOAL_OPTIONS.map((goal) => (
                    <label key={goal.id} className="chip-check">
                      <input
                        type="radio"
                        name="jp-goal"
                        checked={prefs.goal === goal.id}
                        onChange={() => updateField("goal", goal.id)}
                      />
                      <span>{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="planner-section">
            <div className="planner-section-title">
              <h2 className="h5 fw-bold mb-1">2. 每週學習節奏</h2>
              <p className="small text-secondary mb-0">
                似運動週計劃：揀邊幾日學、每日預留幾多分鐘。
              </p>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">每日分鐘</label>
                <input
                  type="number"
                  className="form-control"
                  min={15}
                  max={120}
                  step={5}
                  value={prefs.minutesPerDay}
                  onChange={(e) =>
                    updateField("minutesPerDay", Number(e.target.value) || 30)
                  }
                />
              </div>
              <div className="col-6">
                <label className="form-label">已選日數</label>
                <input
                  className="form-control"
                  value={`${prefs.weeklyDays.length} 日／週`}
                  readOnly
                />
              </div>
              <div className="col-12">
                <label className="form-label">學習日（星期）</label>
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
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="d-flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary btn-lg">
              生成並儲存日程
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={loadSample}
            >
              載入範例設定
            </button>
            {saved ? (
              <Link href="/japanese/plan" className="btn btn-outline-primary">
                打開已儲存日程
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <div className="col-12 col-xl-5">
        <div className="planner-side-stack">
          <section className="planner-output-card">
            <h2 className="h5 fw-bold mb-2">課程總覽</h2>
            <p className="small text-secondary mb-3">
              全日文學習模式由零基礎到 JLPT N1，合共約 {totalLessons}{" "}
              課；進度會跟帳戶同步。
            </p>
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span>整體進度</span>
                <span>
                  {overallDone} / {totalLessons}
                </span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${totalLessons ? Math.round((overallDone / totalLessons) * 100) : 0}%`,
                    background: "#ea580c",
                  }}
                />
              </div>
            </div>
            <div className="mb-3 small">
              目前程度「
              {JAPANESE_COURSE.find((l) => l.id === prefs.currentLevel)?.labelZh}
              」：{currentProgress.done}/{currentProgress.total}（
              {currentProgress.pct}%）
            </div>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              {stats.map((s) => (
                <li
                  key={s.id}
                  className="d-flex justify-content-between border-bottom pb-1"
                >
                  <span>{s.labelZh}</span>
                  <span className="text-secondary">
                    {s.units} 單元 · {s.lessons} 課 · ~{s.estimatedWeeks} 週
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {saved?.schedule ? (
            <section className="planner-output-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h5 fw-bold mb-0">已儲存日程預覽</h2>
                <Link href="/japanese/plan" className="btn btn-sm btn-primary">
                  完整日程
                </Link>
              </div>
              <JapaneseScheduleView
                schedule={{
                  ...saved.schedule,
                  weeks: saved.schedule.weeks.slice(0, 1),
                }}
                completedLessonIds={completedIds}
                onToggleLesson={onToggleLesson}
                generatedAt={saved.generatedAt}
              />
            </section>
          ) : (
            <section className="planner-output-card">
              <h2 className="h5 fw-bold mb-2">尚未有日程</h2>
              <p className="small text-secondary mb-0">
                填好左邊資料後撳「生成並儲存日程」，會寫入你嘅帳戶（本機 + 雲端同步）。
              </p>
            </section>
          )}
        </div>
      </div>

      <div className="col-12">
        <section className="planner-hero mb-3">
          <div className="planner-hero-badge">Curriculum</div>
          <h2 className="h4 fw-bold mb-2">完整課程大綱</h2>
          <p className="text-secondary mb-0">
            展開每個程度睇單元同課堂；可以勾選完成，亦可點開課堂睇 checklist 同例句。
          </p>
        </section>
        <JapaneseCourseView
          completedLessonIds={completedIds}
          currentLevel={prefs.currentLevel}
          onToggleLesson={onToggleLesson}
        />
      </div>
    </div>
  );
}
