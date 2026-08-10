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
  return (
    <div className="jp-reading-block">
      <div className="jp-ja" lang="ja">
        {ja}
      </div>
      <div className="jp-yomi" lang="ja">
        <span className="jp-yomi-label">讀法</span>
        {reading || ja}
      </div>
      {romaji ? <div className="jp-romaji">{romaji}</div> : null}
    </div>
  );
}

const TOC_ITEMS = [
  { id: "jp-sec-vocab", label: "詞彙" },
  { id: "jp-sec-examples", label: "例句" },
  { id: "jp-sec-tips", label: "解說" },
  { id: "jp-sec-practice", label: "練習" },
  { id: "jp-sec-culture", label: "文化" },
  { id: "jp-sec-checklist", label: "Checklist" },
] as const;

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
  const hasCulture = Boolean(content?.cultureTipsZh?.length);
  const toc = TOC_ITEMS.filter((item) => {
    if (item.id === "jp-sec-culture") return hasCulture;
    if (!content && item.id !== "jp-sec-checklist") return false;
    return true;
  });

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

      {content ? (
        <nav className="jp-lesson-toc mb-3" aria-label="課堂章節">
          <div className="jp-lesson-toc-label">本課目錄</div>
          <div className="jp-lesson-toc-links">
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="jp-lesson-toc-link">
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="jp-lesson-layout">
        <div className="jp-lesson-main">
          {!content ? (
            <section className="planner-output-card mb-3">
              <p className="mb-0 text-secondary">呢課暫時未有學習內容。</p>
            </section>
          ) : (
            <>
              <section id="jp-sec-vocab" className="planner-output-card mb-3">
                <h2 className="h5 fw-bold mb-1">詞彙 · 讀法</h2>
                <p className="small text-secondary mb-3">
                  每個詞都有日文、讀法（かな）
                  {level.id === "beginner" ? "、羅馬字" : ""}
                  ；意思用粵語／繁中。本課共 {content.vocab.length} 項。
                </p>
                <ul className="list-unstyled jp-vocab-list mb-0">
                  {content.vocab.map((item, idx) => (
                    <li
                      key={`${item.ja}-${item.reading}-${idx}`}
                      className="jp-vocab-item"
                    >
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

              <section id="jp-sec-examples" className="planner-output-card mb-3">
                <h2 className="h5 fw-bold mb-3">
                  例句 · 讀法
                  <span className="jp-section-count">{content.examples.length}</span>
                </h2>
                <div className="d-flex flex-column gap-3">
                  {content.examples.map((ex, idx) => (
                    <div key={`${ex.ja}-${idx}`} className="jp-example-card">
                      <ReadingLine ja={ex.ja} reading={ex.reading} />
                      <div className="jp-meaning mt-2">{ex.meaningZh}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="jp-sec-tips" className="planner-output-card mb-3">
                <h2 className="h5 fw-bold mb-2">解說 · 文法筆記</h2>
                <ul className="jp-tip-list mb-0 ps-3">
                  {content.tipsZh.map((tip, idx) => (
                    <li key={`${idx}-${tip.slice(0, 24)}`} className="mb-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="jp-sec-practice" className="planner-output-card mb-3">
                <h2 className="h5 fw-bold mb-2">練習 · 迷你操練</h2>
                <ol className="jp-practice-list mb-0 ps-3">
                  {content.practiceZh.map((p, idx) => (
                    <li key={`${idx}-${p.slice(0, 24)}`} className="mb-2">
                      {p}
                    </li>
                  ))}
                </ol>
              </section>

              {hasCulture ? (
                <section id="jp-sec-culture" className="planner-output-card mb-3">
                  <h2 className="h5 fw-bold mb-2">文化 · 使用小貼士</h2>
                  <ul className="jp-tip-list mb-0 ps-3">
                    {content!.cultureTipsZh!.map((tip, idx) => (
                      <li key={`${idx}-${tip.slice(0, 24)}`} className="mb-2">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}

          <section id="jp-sec-checklist" className="planner-output-card mb-3">
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
        </div>
      </div>
    </AppShell>
  );
}
