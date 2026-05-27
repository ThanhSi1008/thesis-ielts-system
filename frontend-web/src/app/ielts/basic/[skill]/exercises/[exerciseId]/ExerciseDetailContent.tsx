"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import {
  Exercise,
  LessonBlock,
} from "./_components/utils/SharedExerciseTypes";
import { ReadingExerciseLayout } from "./_components/containers/ReadingExerciseLayout";
import { ListeningExerciseLayout } from "./_components/containers/ListeningExerciseLayout";
import { WritingClozeLayout } from "./_components/containers/WritingClozeLayout";
import { SpeakingExerciseLayout } from "./_components/containers/SpeakingExerciseLayout";

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
  const isWriting = skill?.toLowerCase() === "writing";
  const isSpeaking = skill?.toLowerCase() === "speaking";

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isReading ? "reading-exercises" : isWriting ? "writing-exercises" : isSpeaking ? "exercises/speaking/detail" : "listening-exercises";
        const exRes = await axios.get(`${API_BASE_URL}/ielts/${endpoint}/${exerciseId}`);
        setExercise(exRes.data);

        if (lessonId) {
          const lessonRes = await axios.get(`${API_BASE_URL}/ielts/lessons/${lessonId}`);
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
  }, [exerciseId, lessonId, isReading, isWriting, isSpeaking]);

  // Lock parent <main> scrollbars to enable independent column scrolls inside layout
  useEffect(() => {
    const mainElements = document.querySelectorAll("main");
    const originalStyles = new Map<Element, string>();
    mainElements.forEach((main) => {
      const htmlMain = main as HTMLElement;
      originalStyles.set(htmlMain, htmlMain.style.overflow);
      htmlMain.style.overflow = "hidden";
    });

    return () => {
      mainElements.forEach((main) => {
        const htmlMain = main as HTMLElement;
        const orig = originalStyles.get(htmlMain);
        if (orig !== undefined) {
          htmlMain.style.overflow = orig;
        }
      });
    };
  }, []);


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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ReadingExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  if (isListening) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ListeningExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  if (isWriting) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <WritingClozeLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  if (isSpeaking) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <SpeakingExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
  }

  return <div className="p-10 font-medium text-gray-500">Skill type not supported for exercises yet.</div>;
}
