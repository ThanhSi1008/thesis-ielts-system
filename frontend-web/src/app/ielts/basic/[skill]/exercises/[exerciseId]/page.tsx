"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ExerciseDetailContent } from "./ExerciseDetailContent";

export default function ExerciseDetailPage() {
  const { exerciseId, skill } = useParams() as { exerciseId: string; skill: string };
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  return <ExerciseDetailContent exerciseId={exerciseId} skill={skill} lessonId={lessonId} />;
}
