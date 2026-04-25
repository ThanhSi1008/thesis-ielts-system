"use client";

import { useParams, useRouter } from "next/navigation";
import { LessonDetailContent } from "./LessonDetailContent";

export default function LessonDetailPage() {
  const { lessonId, skill } = useParams() as { lessonId: string; skill: string };
  const router = useRouter();

  return (
    <LessonDetailContent
      lessonId={lessonId}
      skill={skill}
      onBack={() => router.back()}
    />
  );
}
