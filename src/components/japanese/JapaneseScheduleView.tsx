"use client";

import Link from "next/link";
import {
  FOCUS_LABELS,
  type GeneratedStudySchedule,
  type ScheduledStudyBlock,
} from "@/lib/japaneseCourse";

function FocusBadge({ focus }: { focus: ScheduledStudyBlock["focus"] }) {
  return <span className="jp-focus-badge">{FOCUS_LABELS[focus]}</span>;
}

export function JapaneseScheduleView({
  schedule,
  completedLessonIds,
  onToggleLesson,
  generatedAt,
}: {
  schedule: GeneratedStudySchedule;
  completedLessonIds: string[];
  onToggleLesson?: (lessonId: string, completed: boolean) => void;
  generatedAt?: string | null;
}) {
  const completedSet = new Set(completedLessonIds);
  const doneInSchedule = schedule.weeks
    .flatMap((w) => w.days.flatMap((d) => d.blocks))
    .filter((b) => completedSet.has(b.lessonId)).length;

  return (
    <div className="jp-schedule">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
        <div>
          <div className="small text-secondary">
            顯示 {schedule.estimatedWeeks} 週 · {schedule.totalLessons} 課
            {generatedAt
              ? ` · 儲存於 ${new Date(generatedAt).toLocaleString("zh-HK")}`
              : null}
          </div>
          <div className="fw-semibold">
            日程內已完成 {doneInSchedule} / {schedule.totalLessons}
          </div>
        </div>
      </div>

      {schedule.notes.length ? (
        <ul className="small text-secondary mb-3 ps-3">
          {schedule.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <div className="d-flex flex-column gap-3">
        {schedule.weeks.map((week) => (
          <section key={week.weekNumber} className="jp-week-card">
            <h3 className="h6 fw-bold mb-2">第 {week.weekNumber} 週</h3>
            <div className="row g-2">
              {week.days.map((day) => (
                <div
                  key={`${week.weekNumber}-${day.weekday}`}
                  className="col-12 col-md-6 col-xl-4"
                >
                  <div
                    className={`jp-day-card ${day.isRest ? "jp-day-rest" : ""}`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>{day.labelZh}</strong>
                      <span className="small text-secondary">
                        {day.isRest ? "休息" : `${day.totalMinutes} 分鐘`}
                      </span>
                    </div>
                    {day.isRest ? (
                      <p className="small text-secondary mb-0">
                        今日休息，溫習舊課都得。
                      </p>
                    ) : (
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {day.blocks.map((block) => {
                          const done = completedSet.has(block.lessonId);
                          return (
                            <li key={block.lessonId} className="jp-block-row">
                              <div className="d-flex gap-2 align-items-start">
                                {onToggleLesson ? (
                                  <input
                                    type="checkbox"
                                    className="form-check-input mt-1"
                                    checked={done}
                                    onChange={(e) =>
                                      onToggleLesson(
                                        block.lessonId,
                                        e.target.checked
                                      )
                                    }
                                    aria-label={`完成 ${block.titleZh}`}
                                  />
                                ) : null}
                                <Link
                                  href={`/japanese/lesson/${block.lessonId}`}
                                  className={`flex-grow-1 text-decoration-none ${
                                    done ? "jp-block-done" : "text-dark"
                                  }`}
                                >
                                  <span className="d-block fw-semibold small">
                                    {block.titleZh}
                                  </span>
                                  <span className="d-block small text-secondary">
                                    {block.titleJa} · {block.minutes} 分
                                  </span>
                                  <FocusBadge focus={block.focus} />
                                  <span className="jp-open-lesson d-block mt-1">
                                    學習內容 →
                                  </span>
                                </Link>
                              </div>
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
    </div>
  );
}
