"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  chapter: string;
}

interface ProgressResponse {
  id: string;
  lessonId?: string | null;
  listeningExerciseId?: string | null;
  readingExerciseId?: string | null;
  isCompleted: boolean;
}

export default function ClientLessonList({
  lessons,
  skill,
}: {
  lessons: Lesson[];
  skill: string;
}) {
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await api.get<ProgressResponse[]>("/ielts/progress");
        const completedIds = new Set<string>();
        res.data.forEach((p) => {
          if (p.isCompleted && p.lessonId) {
            completedIds.add(p.lessonId);
          }
        });
        setCompletedLessonIds(completedIds);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    }
    fetchProgress();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {lessons.map((lesson, idx) => {
        const isFinished = completedLessonIds.has(lesson.id);

        return (
          <Link key={lesson.id} href={`/ielts/basic/${skill}/lessons/${lesson.id}`}>
            <div className="flex items-center gap-4 p-5 bg-[#F9F9F9] hover:bg-gray-100 transition-colors rounded-2xl cursor-pointer shadow-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF3C2] text-[#E0A800] font-extrabold text-sm shrink-0">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-gray-900 mb-1 leading-none">
                  {lesson.title}
                </h3>
                <p className="text-gray-400 text-[13px]">Read theory and strategy</p>
              </div>
              <div className="ml-auto">
                {isFinished ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200/60"></div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
