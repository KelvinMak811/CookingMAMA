"use client";

import { useMemo, useState } from "react";
import {
  FOCUS_LABELS,
  JAPANESE_COURSE,
  levelProgress,
  type JapaneseLevelId,
  type JapaneseLesson,
} from "@/lib/japaneseCourse";

function LessonCard({
  lesson,
  completed,
  onToggle,
}: {
  lesson: JapaneseLesson;
  completed: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`jp-lesson-card ${completed ? "jp-lesson-done" : ""}`}>
      <div className="d-flex gap-2 align-items-start">
        <input
          type="checkbox"
          className="form-check-input mt-1"
          checked={completed}
          onChange={(e) => onToggle(lesson.id, e.target.checked)}
          aria-label={`完成 ${lesson.titleZh}`}
        />
        <div className="flex-grow-1">
          <button
            type="button"
            className="btn btn-link text-decoration-none text-start p-0 w-100"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="d-flex justify-content-between gap-2">
              <div>
                <div className="fw-semibold text-dark">{lesson.titleZh}</div>
                <div className="small text-secondary">{lesson.titleJa}</div>
              </div>
              <div className="text-end small text-secondary text-nowrap">
                <div>{FOCUS_LABELS[lesson.focus]}</div>
                <div>{lesson.minutes} 分</div>
              </div>
            </div>
          </button>
          {open ? (
            <div className="mt-2 small">
              <p className="mb-2 text-secondary">{lesson.summaryZh}</p>
              {lesson.sampleJa ? (
                <div className="jp-sample mb-2">
                  <div className="fw-semibold">{lesson.sampleJa}</div>
                  {lesson.sampleZh ? (
                    <div className="text-secondary">{lesson.sampleZh}</div>
                  ) : null}
                </div>
              ) : null}
              <div className="fw-semibold mb-1">今日 checklist</div>
              <ul className="mb-0 ps-3">
                {lesson.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function JapaneseCourseView({
  completedLessonIds,
  currentLevel,
  onToggleLesson,
}: {
  completedLessonIds: string[];
  currentLevel: JapaneseLevelId;
  onToggleLesson: (lessonId: string, completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<JapaneseLevelId | null>(currentLevel);
  const completedSet = useMemo(
    () => new Set(completedLessonIds),
    [completedLessonIds]
  );

  return (
    <div className="d-flex flex-column gap-3">
      {JAPANESE_COURSE.map((level) => {
        const progress = levelProgress(level.id, completedLessonIds);
        const isOpen = expanded === level.id;
        return (
          <section key={level.id} className="planner-section">
            <button
              type="button"
              className="btn btn-link text-decoration-none text-start p-0 w-100"
              onClick={() => setExpanded(isOpen ? null : level.id)}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="mode-card-kicker mb-1">
                    {level.labelJa} · {level.labelZh}
                  </div>
                  <h3 className="h6 fw-bold text-dark mb-1">{level.labelZh}</h3>
                  <p className="small text-secondary mb-0">{level.blurbZh}</p>
                </div>
                <div className="text-end small">
                  <div className="fw-semibold text-dark">
                    {progress.done}/{progress.total}
                  </div>
                  <div className="text-secondary">{progress.pct}%</div>
                </div>
              </div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{ width: `${progress.pct}%` }}
                  aria-valuenow={progress.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </button>

            {isOpen ? (
              <div className="mt-3 d-flex flex-column gap-3">
                {level.units.map((unit) => (
                  <div key={unit.id}>
                    <div className="fw-semibold mb-2">
                      {unit.titleZh}{" "}
                      <span className="text-secondary fw-normal small">
                        {unit.titleJa}
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {unit.lessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          completed={completedSet.has(lesson.id)}
                          onToggle={onToggleLesson}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
