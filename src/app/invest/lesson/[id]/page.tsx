import { AppShell } from "@/components/layout/AppShell";
import { InvestLessonClient } from "@/components/invest/InvestLessonClient";
import { findLesson } from "@/lib/investCourse";

export default async function InvestLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = findLesson(id);
  const title = found?.lesson.titleZh ?? "投資課堂";

  return (
    <AppShell title={title} showBack backHref="/invest/learn">
      <section className="planner-hero mb-4">
        <div className="planner-hero-badge">SmartInvest · 課堂詳情</div>
        <h1 className="h3 fw-bold mb-2">{title}</h1>
        <p className="text-secondary mb-0">
          概念、港美例子、風險提示、checklist 同小測驗。投資有風險，內容僅供學習。
        </p>
      </section>
      <InvestLessonClient lessonId={id} />
    </AppShell>
  );
}
