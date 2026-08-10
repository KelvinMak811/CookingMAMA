"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  FOCUS_LABELS,
  findLesson,
  getAdjacentLessons,
} from "@/lib/japaneseCourse";
import { getLessonStudyContent } from "@/lib/japaneseLessonContent";
import {
  loadJapaneseData,
  toggleLessonComplete,
} from "@/lib/japaneseStorage";
import { useAccountStore } from "@/stores/accountStore";

function ReadingLine({
  ja,
  reading,
  romaji,
}: {
  ja: string;
  reading: string;
  romaji?: string;
}) {
  const showReading = reading && reading !== ja;
  return (
    <div className="jp-reading-block">
      <div className="jp-ja" lang="ja">
        {ja}
      </div>
      {showReading ? (
        <div className="jp-yomi" lang="ja">
          <span className="jp-yomi-label">讀法</span>
          {reading}
        </div>
      ) : (
        <div className="jp-yomi" lang="ja">
          <span className="jp-yomi-label">讀法</span>
          {reading || ja}
        </div>
      )}
      {romaji ? <div className="jp-romaji">{romaji}</div> : null}
    </div>
  );
}

export function JapaneseLessonClient({ lessonId }: { lessonId: string }) {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const accountId = currentUserId || "guest";
  const found = findLesson(lessonId);
  const content = getLessonStudyContent(lessonId);
  const adjacent = getAdjacentLessons(lessonId);

  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadJapaneseData(accountId);
    setCompleted(data.completedLessonIds.includes(lessonId));
    setHydrated(true);
  }, [accountId, lessonId]);

  function onToggle(next: boolean) {
    const data = toggleLessonComplete(accountId, lessonId, next);
    setCompleted(data.completedLessonIds.includes(lessonId));
  }

  if (!found) {
    return (
      <AppShell title="課堂" showBack backHref="/japanese">
        <section className="planner-output-card">
          <h1 className="h5 fw-bold mb-2">搵唔到呢課</h1>
          <p className="small text-secondary mb-3">
            課堂 ID「{lessonId}」唔存在，返去課程大綱再揀。
          </p>
          <Link href="/japanese" className="btn btn-primary">
            返回日文學習
          </Link>
        </section>
      </AppShell>
    );
  }

  const { level, unit, lesson } = found;

  return (
    <AppShell title={lesson.titleZh} showBack backHref="/japanese">
      <section className="planner-hero mb-3">
        <div className="planner-hero-badge">
          SmartJP · {level.labelJa} · {FOCUS_LABELS[lesson.focus]}
        </div>
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
          <div>
            <p className="small text-secondary mb-1">
              {level.labelZh} · {unit.titleZh}（{unit.titleJa}）
            </p>
            <h1 className="h3 fw-bold mb-1">{lesson.titleZh}</h1>
            <p className="mb-0 fs-5" lang="ja">
              {lesson.titleJa}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="small text-secondary">{lesson.minutes} 分鐘</span>
            {hydrated ? (
              <label className="jp-complete-toggle mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={completed}
                  onChange={(e) => onToggle(e.target.checked)}
                />
                <span>標為完成</span>
              </label>
            ) : null}
          </div>
        </div>
        <p className="text-secondary mt-3 mb-0">{lesson.summaryZh}</p>
      </section>

      {!content ? (
        <section className="planner-output-card mb-3">
          <p className="mb-0 text-secondary">呢課暫時未有學習內容。</p>
        </section>
      ) : (
        <>
          <section className="planner-output-card mb-3">
            <h2 className="h5 fw-bold mb-1">詞彙 · 讀法</h2>
            <p className="small text-secondary mb-3">
              每個詞都有日文、讀法（かな），入門課會加羅馬字；意思用粵語／繁中。
            </p>
            <ul className="list-unstyled jp-vocab-list mb-0">
              {content.vocab.map((item) => (
                <li key={`${item.ja}-${item.reading}`} className="jp-vocab-item">
                  <ReadingLine
                    ja={item.ja}
                    reading={item.reading}
                    romaji={item.romaji}
                  />
                  <div className="jp-meaning">{item.meaningZh}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="planner-output-card mb-3">
            <h2 className="h5 fw-bold mb-3">例句 · 讀法</h2>
            <div className="d-flex flex-column gap-3">
              {content.examples.map((ex) => (
                <div key={ex.ja} className="jp-example-card">
                  <ReadingLine ja={ex.ja} reading={ex.reading} />
                  <div className="jp-meaning mt-2">{ex.meaningZh}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="planner-output-card mb-3">
            <h2 className="h5 fw-bold mb-2">解說 · 文法筆記</h2>
            <ul className="mb-0 ps-3">
              {content.tipsZh.map((tip) => (
                <li key={tip} className="mb-2">
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <section className="planner-output-card mb-3">
            <h2 className="h5 fw-bold mb-2">練習</h2>
            <ol className="mb-0 ps-3">
              {content.practiceZh.map((p) => (
                <li key={p} className="mb-2">
                  {p}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <section className="planner-output-card mb-3">
        <h2 className="h6 fw-bold mb-2">今日 checklist</h2>
        <ul className="small mb-0 ps-3">
          {lesson.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <nav className="d-flex flex-wrap gap-2 justify-content-between mb-4">
        {adjacent.prev ? (
          <Link
            href={`/japanese/lesson/${adjacent.prev.id}`}
            className="btn btn-outline-secondary"
          >
            ← {adjacent.prev.titleZh}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/japanese/plan" className="btn btn-outline-primary">
          返回日程
        </Link>
        {adjacent.next ? (
          <Link
            href={`/japanese/lesson/${adjacent.next.id}`}
            className="btn btn-primary"
          >
            {adjacent.next.titleZh} →
          </Link>
        ) : null}
      </nav>
    </AppShell>
  );
}
