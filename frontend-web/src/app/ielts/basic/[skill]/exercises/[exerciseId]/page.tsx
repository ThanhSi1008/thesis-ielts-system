"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import {
  Exercise,
  LessonBlock,
} from "./_components/utils/SharedExerciseTypes";
import { ReadingExerciseLayout } from "./_components/containers/ReadingExerciseLayout";
import { ListeningExerciseLayout } from "./_components/containers/ListeningExerciseLayout";

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Content Component (Reusable for Roadmap) ──────────────────────────────

export function ExerciseDetailContent({
  exerciseId,
  skill,
  lessonId,
  onComplete,
  onNext,
}: {
  exerciseId: string;
  skill: string;
  lessonId?: string | null;
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const isReading = skill?.toLowerCase() === "reading";
  const isListening = skill?.toLowerCase() === "listening";

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isReading ? "reading-exercises" : "listening-exercises";
        const exRes = await axios.get(`http://localhost:3000/api/v1/ielts/${endpoint}/${exerciseId}`);
        setExercise(exRes.data);

        if (lessonId) {
          const lessonRes = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
          const blocks: LessonBlock[] = Array.isArray(lessonRes.data.content)
            ? lessonRes.data.content.filter((b: LessonBlock) => ["traps", "strategy", "tips"].includes(b.type))
            : [];
          setLessonBlocks(blocks);
        }
      } catch (err) {
        console.error("Failed to fetch exercise:", err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) fetchData();
  }, [exerciseId, lessonId, isReading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 font-medium animate-pulse">
        Loading exercise...
      </div>
    );
  }

  if (!exercise) {
    return <div className="flex items-center justify-center h-full text-red-500 font-bold">Exercise not found.</div>;
  }

  if (isReading) {
    return <ReadingExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  if (isListening) {
    return <ListeningExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  return <div className="p-10 font-medium text-gray-500">Skill type not supported for exercises yet.</div>;
}

export default function ExerciseDetailPage() {
  const { exerciseId, skill } = useParams() as { exerciseId: string; skill: string };
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  return <ExerciseDetailContent exerciseId={exerciseId} skill={skill} lessonId={lessonId} />;
}
