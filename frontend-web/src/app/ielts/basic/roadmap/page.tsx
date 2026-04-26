"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { LessonDetailContent } from "../[skill]/lessons/[lessonId]/LessonDetailContent";
import { ExerciseDetailContent } from "../[skill]/exercises/[exerciseId]/ExerciseDetailContent";
import { Info } from "lucide-react";
import api from "@/lib/api";
import { RoadmapStep } from "../_components/RoadmapSidebar";

export default function RoadmapDashboard() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const skill = searchParams.get("skill");
  const lessonId = searchParams.get("lessonId");
  const exerciseId = searchParams.get("exerciseId");

  const router = useRouter();

  const handleLessonComplete = () => {
    // Dispatch an event so the sidebar refetches its roadmap locks
    window.dispatchEvent(new Event("roadmap-progress-update"));
  };

  const handleNext = async () => {
    try {
      const res = await api.get<{ steps: RoadmapStep[]; currentStep: number }>("/ielts/roadmap");
      let nextItem = null;
      for (const step of res.data.steps) {
        for (const item of step.items) {
          if (!item.isCompleted && !item.isLocked) {
            nextItem = item;
            break;
          }
        }
        if (nextItem) break;
      }
      
      if (nextItem) {
        let idParam: string;
        if (nextItem.type === 'lesson') {
          idParam = `lessonId=${nextItem.id}`;
        } else {
          idParam = `exerciseId=${nextItem.id}${nextItem.lessonId ? `&lessonId=${nextItem.lessonId}` : ''}`;
        }
        router.push(`/ielts/basic/roadmap?type=${nextItem.type}&skill=${nextItem.skill.toLowerCase()}&${idParam}`);
      }
    } catch (err) {
      console.error("Failed to fetch roadmap for next step", err);
    }
  };

  if (!type || !skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-100/50 flex-1">
        <div className="w-16 h-16 rounded-full bg-[#FFF9E6] flex items-center justify-center mb-6 shadow-sm border border-[#FFF0C2]">
          <Info className="w-8 h-8 text-[#E0A800]" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome to Your Roadmap</h2>
        <p className="text-gray-500 max-w-sm">
          Select a lesson or exercise from the sidebar to begin. 
          You must complete Step 1 before Step 2 unlocks.
        </p>
      </div>
    );
  }

  if (type === "lesson" && lessonId) {
    return (
      <div className="animate-fade-in w-full">
        <LessonDetailContent 
          lessonId={lessonId} 
          skill={skill} 
          onComplete={handleLessonComplete}
          onNext={handleNext}
          onBack={() => {}} // Could be wired to null if we don't want a back button here
        />
      </div>
    );
  }

  if (type === "exercise" && exerciseId) {
    return (
      <div className="animate-fade-in w-full">
        <ExerciseDetailContent 
          exerciseId={exerciseId} 
          skill={skill} 
          lessonId={lessonId} 
          onComplete={handleLessonComplete}
          onNext={handleNext}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-red-500 font-bold p-10">
      Invalid Roadmap Item Selection.
    </div>
  );
}
