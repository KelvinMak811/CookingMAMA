import { JAPANESE_COURSE } from "@/lib/japaneseCourse";
import { JapaneseLessonClient } from "@/components/japanese/JapaneseLessonClient";

interface JapaneseLessonPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return JAPANESE_COURSE.flatMap((level) =>
    level.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({ id: lesson.id }))
    )
  );
}

export default async function JapaneseLessonPage({
  params,
}: JapaneseLessonPageProps) {
  const { id } = await params;
  return <JapaneseLessonClient lessonId={id} />;
}
