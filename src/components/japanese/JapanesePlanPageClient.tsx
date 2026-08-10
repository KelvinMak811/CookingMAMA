"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { JapaneseScheduleView } from "@/components/japanese/JapaneseScheduleView";
import { findLesson, FOCUS_LABELS } from "@/lib/japaneseCourse";
import {
  loadJapaneseData,
  toggleLessonComplete,
  type SavedJapaneseSchedule,
} from "@/lib/japaneseStorage";
import { useAccountStore } from "@/stores/accountStore";

export function JapanesePlanPageClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const accountId = currentUserId || "guest";
  const [saved, setSaved] = useState<SavedJapaneseSchedule | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadJapaneseData(accountId);
    setSaved(data.savedSchedule);
    setCompletedIds(data.completedLessonIds);
    setHydrated(true);
  }, [accountId]);

  function onToggleLesson(lessonId: string, completed: boolean) {
    const data = toggleLessonComplete(accountId, lessonId, completed);
    setCompletedIds(data.completedLessonIds);
    setSaved(data.savedSchedule);
  }

  if (!hydrated) {
    return (
      <AppShell title="我的日文日程" showBack backHref="/japanese">
        <div className="text-secondary small py-4">載入已儲存日程中…</div>
      </AppShell>
    );
  }

  if (!saved?.schedule) {
    return (
      <AppShell title="我的日文日程" showBack backHref="/japanese">
        <section className="planner-output-card">
          <h1 className="h5 fw-bold mb-2">未有已儲存日程</h1>
          <p className="small text-secondary mb-3">
            去日文學習頁設定程度、每週日數同每日時間，生成後會自動存入帳戶。
          </p>
          <Link href="/japanese" className="btn btn-primary">
            去生成日程
          </Link>
        </section>
      </AppShell>
    );
  }

  const todayBlocks = saved.schedule.weeks[0]?.days.filter((d) => !d.isRest) ?? [];
  const spotlight = todayBlocks[0]?.blocks[0];
  const spotlightLesson = spotlight ? findLesson(spotlight.lessonId) : null;

  return (
    <AppShell title="我的日文日程" showBack backHref="/japanese">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">Saved SmartJP Plan</div>
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
          <div>
            <h1 className="h3 fw-bold mb-2">帳戶已儲存嘅學習日程</h1>
            <p className="text-secondary mb-0">
              跟住每日課表推進；完成後剔低，進度會同步到你嘅帳戶。
            </p>
          </div>
          <Link href="/japanese" className="btn btn-outline-primary">
            更新學習設定
          </Link>
        </div>
      </section>

      {spotlightLesson ? (
        <section className="planner-output-card mb-3">
          <div className="mode-card-kicker mb-1">建議由呢課開始</div>
          <h2 className="h5 fw-bold mb-1">
            {spotlightLesson.lesson.titleZh}{" "}
            <span className="text-secondary fw-normal">
              {spotlightLesson.lesson.titleJa}
            </span>
          </h2>
          <p className="small text-secondary mb-2">
            {spotlightLesson.level.labelZh} · {spotlightLesson.unit.titleZh} ·{" "}
            {FOCUS_LABELS[spotlightLesson.lesson.focus]} ·{" "}
            {spotlightLesson.lesson.minutes} 分鐘
          </p>
          <p className="mb-2">{spotlightLesson.lesson.summaryZh}</p>
          {spotlightLesson.lesson.sampleJa ? (
            <div className="jp-sample mb-2">
              <div className="fw-semibold">{spotlightLesson.lesson.sampleJa}</div>
              {spotlightLesson.lesson.sampleZh ? (
                <div className="small text-secondary">
                  {spotlightLesson.lesson.sampleZh}
                </div>
              ) : null}
            </div>
          ) : null}
          <ul className="small mb-0 ps-3">
            {spotlightLesson.lesson.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="planner-output-card">
        <JapaneseScheduleView
          schedule={saved.schedule}
          completedLessonIds={completedIds}
          onToggleLesson={onToggleLesson}
          generatedAt={saved.generatedAt}
        />
      </section>
    </AppShell>
  );
}
