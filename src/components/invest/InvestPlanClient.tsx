"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  FOCUS_LABELS,
  WEEKDAY_LABELS,
  findLesson,
} from "@/lib/investCourse";
import {
  loadInvestData,
  toggleInvestLessonComplete,
  type SavedInvestSchedule,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

export function InvestPlanClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [saved, setSaved] = useState<SavedInvestSchedule | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadInvestData(userKey);
    setSaved(data.schedule);
    setCompleted(data.courseProgress);
    setHydrated(true);
  }, [userKey]);

  if (!hydrated) {
    return <div className="text-secondary small py-4">載入日程中…</div>;
  }

  if (!saved) {
    return (
      <div className="planner-side-stack">
        <InvestDisclaimer />
        <section className="planner-section text-center py-4">
          <p className="mb-3">未有學習日程。去課程頁設定每週時間再生成。</p>
          <Link href="/invest/learn" className="btn btn-primary">
            去設定課程
          </Link>
        </section>
      </div>
    );
  }

  const { schedule } = saved;

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />
      <section className="planner-section">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <h2 className="h5 fw-bold mb-1">我的投資學習日程</h2>
            <p className="small text-secondary mb-0">
              生成於 {new Date(saved.generatedAt).toLocaleString("zh-HK")} · 約{" "}
              {schedule.estimatedWeeks} 週 · 軌道{" "}
              {schedule.preferences.track === "us_basics" ? "美股入門" : "港股入門"}
            </p>
          </div>
          <Link href="/invest/learn" className="btn btn-sm btn-outline-primary">
            修改設定
          </Link>
        </div>
        <ul className="small text-secondary mb-0 mt-2">
          {schedule.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      {schedule.weeks.map((week) => (
        <section key={week.weekNumber} className="planner-section">
          <h3 className="h6 fw-bold mb-3">第 {week.weekNumber} 週</h3>
          <div className="row g-2">
            {week.days.map((day) => (
              <div key={day.weekday} className="col-12 col-md-6 col-xl-4">
                <div
                  className={`border rounded-3 p-2 h-100 ${
                    day.isRest ? "bg-light" : ""
                  }`}
                >
                  <div className="fw-semibold small mb-1">
                    星期{WEEKDAY_LABELS[day.weekday]}
                    {!day.isRest && (
                      <span className="text-secondary"> · {day.totalMinutes} 分鐘</span>
                    )}
                  </div>
                  {day.isRest ? (
                    <div className="small text-secondary">休息／複習日</div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {day.blocks.map((block) => {
                        const done = completed.includes(block.lessonId);
                        const detail = findLesson(block.lessonId);
                        return (
                          <li key={block.lessonId} className="mb-2">
                            <label className="d-flex gap-2 align-items-start small mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input mt-1"
                                checked={done}
                                onChange={(e) => {
                                  const data = toggleInvestLessonComplete(
                                    userKey,
                                    block.lessonId,
                                    e.target.checked
                                  );
                                  setCompleted(data.courseProgress);
                                }}
                              />
                              <span>
                                <Link
                                  href={`/invest/lesson/${block.lessonId}`}
                                  className="fw-semibold d-block text-decoration-none"
                                >
                                  {block.titleZh}
                                </Link>
                                <span className="text-secondary">
                                  {FOCUS_LABELS[block.focus]} · {block.minutes} 分
                                </span>
                                {detail && (
                                  <span className="d-block text-secondary">
                                    {detail.lesson.summaryZh}
                                  </span>
                                )}
                                <Link
                                  href={`/invest/lesson/${block.lessonId}`}
                                  className="d-inline-block mt-1"
                                >
                                  開啟課堂 →
                                </Link>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
