"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/accountStore";
import {
  FOCUS_LABELS,
  adjacentLessons,
  type InvestQuizItem,
} from "@/lib/investCourse";
import {
  loadInvestData,
  toggleInvestLessonComplete,
} from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

function QuizBlock({ quiz }: { quiz: InvestQuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  if (!quiz.length) {
    return <p className="small text-secondary mb-0">呢一課暫未有小測驗。</p>;
  }

  return (
    <div className="d-flex flex-column gap-3">
      {quiz.map((q, qi) => {
        const picked = answers[qi];
        const show = revealed[qi];
        return (
          <div key={q.questionZh} className="invest-lesson-quiz">
            <div className="fw-semibold small mb-2">
              {qi + 1}. {q.questionZh}
            </div>
            <div className="d-flex flex-column gap-1">
              {q.optionsZh.map((opt, oi) => {
                const isPick = picked === oi;
                const isCorrect = oi === q.answerIndex;
                let cls = "btn btn-sm text-start ";
                if (show && isCorrect) cls += "btn-success";
                else if (show && isPick && !isCorrect) cls += "btn-outline-danger";
                else if (isPick) cls += "btn-primary";
                else cls += "btn-outline-secondary";
                return (
                  <button
                    key={opt}
                    type="button"
                    className={cls}
                    disabled={show}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm px-0 mt-1"
              disabled={picked == null || show}
              onClick={() => setRevealed((prev) => ({ ...prev, [qi]: true }))}
            >
              查看答案
            </button>
            {show && (
              <p className="small text-secondary mb-0">{q.explainZh}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function InvestLessonClient({ lessonId }: { lessonId: string }) {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checkOff, setCheckOff] = useState<Record<string, boolean>>({});

  const nav = useMemo(() => adjacentLessons(lessonId), [lessonId]);

  useEffect(() => {
    const data = loadInvestData(userKey);
    setDone(data.courseProgress.includes(lessonId));
    setHydrated(true);
    setCheckOff({});
  }, [userKey, lessonId]);

  if (!nav) {
    return (
      <div className="planner-side-stack">
        <InvestDisclaimer />
        <section className="planner-section text-center py-4">
          <p className="mb-3">搵唔到呢一課。</p>
          <Link href="/invest/learn" className="btn btn-primary">
            返回課程
          </Link>
        </section>
      </div>
    );
  }

  const { lesson, unit, track, prevId, nextId } = nav;
  const { content } = lesson;

  if (!hydrated) {
    return <div className="text-secondary small py-4">載入課堂中…</div>;
  }

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="mode-card-kicker mb-1">
          {track.labelZh} · {unit.titleZh}
        </div>
        <h2 className="h4 fw-bold mb-2">{lesson.titleZh}</h2>
        <p className="text-secondary small mb-2">
          {FOCUS_LABELS[lesson.focus]} · 約 {lesson.minutes} 分鐘 ·{" "}
          {lesson.summaryZh}
        </p>
        {content.cantoneseTipZh && (
          <div className="invest-lesson-tip">{content.cantoneseTipZh}</div>
        )}
        <div className="d-flex flex-wrap gap-2 mt-3">
          <label className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 mb-0">
            <input
              type="checkbox"
              className="form-check-input m-0"
              checked={done}
              onChange={(e) => {
                const data = toggleInvestLessonComplete(
                  userKey,
                  lessonId,
                  e.target.checked
                );
                setDone(data.courseProgress.includes(lessonId));
              }}
            />
            標記為已完成
          </label>
          <Link href="/invest/learn" className="btn btn-sm btn-outline-secondary">
            課程總覽
          </Link>
          <Link href="/invest/plan" className="btn btn-sm btn-outline-secondary">
            學習日程
          </Link>
        </div>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">概念</h3>
        <ul className="mb-0 ps-3">
          {content.conceptsZh.map((c) => (
            <li key={c} className="mb-2">
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">例子（港／美）</h3>
        <div className="d-flex flex-column gap-3">
          {content.examples.map((ex) => (
            <div key={ex.titleZh} className="invest-lesson-example">
              <div className="d-flex gap-2 align-items-center mb-1">
                <span className="badge text-bg-dark">{ex.market}</span>
                <span className="fw-semibold small">{ex.titleZh}</span>
              </div>
              <p className="small mb-0 text-secondary">{ex.bodyZh}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">風險提示</h3>
        <ul className="mb-0 ps-3">
          {content.riskNotesZh.map((r) => (
            <li key={r} className="mb-2 text-danger-emphasis">
              {r}
            </li>
          ))}
        </ul>
        <p className="small text-secondary mb-0 mt-2">
          投資有風險，內容僅供學習——唔構成買賣建議。
        </p>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">Checklist</h3>
        <ul className="list-unstyled mb-0">
          {lesson.checklist.map((item) => (
            <li key={item} className="mb-2">
              <label className="d-flex gap-2 align-items-start small mb-0">
                <input
                  type="checkbox"
                  className="form-check-input mt-1"
                  checked={!!checkOff[item]}
                  onChange={(e) =>
                    setCheckOff((prev) => ({ ...prev, [item]: e.target.checked }))
                  }
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="planner-section">
        <h3 className="h6 fw-bold mb-2">小測驗</h3>
        <QuizBlock key={lessonId} quiz={content.quiz} />
      </section>

      <section className="planner-section">
        <div className="d-flex justify-content-between gap-2 flex-wrap">
          {prevId ? (
            <Link
              href={`/invest/lesson/${prevId}`}
              className="btn btn-outline-secondary btn-sm"
            >
              ← 上一課
            </Link>
          ) : (
            <span />
          )}
          {nextId ? (
            <Link
              href={`/invest/lesson/${nextId}`}
              className="btn btn-primary btn-sm"
            >
              下一課 →
            </Link>
          ) : (
            <Link href="/invest/simulate" className="btn btn-primary btn-sm">
              去模擬投資 →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
