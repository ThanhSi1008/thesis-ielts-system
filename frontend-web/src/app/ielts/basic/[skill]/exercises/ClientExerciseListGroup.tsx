"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ExerciseSection } from "./_components/ExerciseSection";

interface Exercise {
  id: string;
  topic: string;
  order: number;
  lessonTitle?: string;
  lessonId?: string;
}

interface ProgressResponse {
  id: string;
  lessonId?: string | null;
  listeningExerciseId?: string | null;
  readingExerciseId?: string | null;
  writingExerciseId?: string | null;
  isCompleted: boolean;
}

export default function ClientExerciseListGroup({
  groups,
  skill,
}: {
  groups: { title: string; items: Exercise[] }[];
  skill: string;
}) {
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await api.get<ProgressResponse[]>("/ielts/progress");
        const completedIds = new Set<string>();
        res.data.forEach((p) => {
          if (p.isCompleted) {
            if (p.listeningExerciseId) completedIds.add(p.listeningExerciseId);
            if (p.readingExerciseId) completedIds.add(p.readingExerciseId);
            if (p.writingExerciseId) completedIds.add(p.writingExerciseId);
          }
        });
        setCompletedExerciseIds(completedIds);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    }
    fetchProgress();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, idx) => (
        <ExerciseSection
          key={group.title}
          title={group.title}
          items={group.items}
          skill={skill}
          index={idx}
          completedExerciseIds={completedExerciseIds}
        />
      ))}
    </div>
  );
}
