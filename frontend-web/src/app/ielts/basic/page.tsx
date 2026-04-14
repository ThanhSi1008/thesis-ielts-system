"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Trash2, CheckCircle2, Lock, BookOpen, Headphones, PenTool, Mic, Check, Play } from "lucide-react";
import { RoadmapStep, RoadmapItem } from "./_components/RoadmapSidebar";

export default function IeltsBasicPreparationPage() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get<{ steps: RoadmapStep[]; currentStep: number }>("/ielts/roadmap");
      setSteps(res.data.steps);
      setCurrentStep(res.data.currentStep);
    } catch (err) {
      console.error("Failed to fetch roadmap", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleResetProgress = async () => {
    if (!window.confirm("DEV: Are you sure you want to completely wipe all your IELTS Basic progress?")) return;
    setResetting(true);
    try {
      await api.post("/ielts/progress/reset");
      alert("Progress successfully reset!");
      fetchRoadmap();
    } catch (err) {
      console.error(err);
      alert("Failed to reset progress");
    } finally {
      setResetting(false);
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "Listening": return <Headphones className="w-5 h-5" />;
      case "Reading": return <BookOpen className="w-5 h-5" />;
      case "Writing": return <PenTool className="w-5 h-5" />;
      case "Speaking": return <Mic className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const handleItemClick = (item: RoadmapItem) => {
    if (item.isLocked) return;

    // Determine the precise URL for the roadmap viewer
    const idParam = item.type === 'lesson' ? `lessonId=${item.id}` : `exerciseId=${item.id}${item.lessonId ? `&lessonId=${item.lessonId}` : ''}`;
    const url = `/ielts/basic/roadmap?type=${item.type}&skill=${item.skill.toLowerCase()}&${idParam}`;
    router.push(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10 mt-20 w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#FFC107] animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  const totalLessons = steps.reduce((acc, step) => acc + step.items.filter(i => i.type === 'lesson').length, 0);
  const completedLessons = steps.reduce((acc, step) => acc + step.items.filter(i => i.type === 'lesson' && i.isCompleted).length, 0);
  const totalExercises = steps.reduce((acc, step) => acc + step.items.filter(i => i.type === 'exercise').length, 0);
  const completedExercises = steps.reduce((acc, step) => acc + step.items.filter(i => i.type === 'exercise' && i.isCompleted).length, 0);

  const lessonsLeft = totalLessons - completedLessons;
  const exercisesLeft = totalExercises - completedExercises;

  // Find next item
  let nextItem: RoadmapItem | null = null;
  for (const step of steps) {
    for (const item of step.items) {
      if (!item.isCompleted && !item.isLocked) {
        nextItem = item;
        break;
      }
    }
    if (nextItem) break;
  }

  return (
    <div className="flex flex-col items-start gap-8 w-full h-full shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100/50 p-2 lg:p-4 overflow-hidden">

      {/* Summary Section */}
      <div className="bg-[#FAF7F2] p-6 lg:p-8 rounded-3xl border border-gray-100 flex flex-col w-full">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">IELTS Basic Mastery Roadmap</h2>

        <div className="flex flex-wrap items-center gap-5 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-gray-400">Lessons left</span>
            <span className="text-[12px] font-bold text-gray-500">{lessonsLeft}</span>
            <span className="text-[12px] text-gray-300">/ {totalLessons}</span>
          </div>
          <span className="text-gray-200 text-[12px]">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-gray-400">Exercises left</span>
            <span className="text-[12px] font-bold text-gray-500">{exercisesLeft}</span>
            <span className="text-[12px] text-gray-300">/ {totalExercises}</span>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed max-w-[90%] text-[14px] font-medium">
          This section is designed to build your fundamental English skills for the IELTS exam.
          You will work through structured daily lessons and exercises covering Listening and Reading
          to establish a strong baseline before moving on to advanced strategies. Complete the tasks in sequential order to unlock the next steps.
        </p>
      </div>

      {/* Roadmap List */}
      <div className="flex flex-col w-full">
        {steps.map((step) => {
          const isActiveStep = currentStep === step.step;
          const isCompletedStep = step.isCompleted;

          return (
            <div key={step.step} className="flex flex-col mb-8 md:pl-2">
              {/* Step Header */}
              <div className={`flex items-center justify-between py-3 px-2 border-b-2 border-gray-100 mb-6 ${step.isLocked ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-extrabold ${isActiveStep ? "text-[#FFC107]" : (isCompletedStep ? "text-green-600" : "text-gray-900")}`}>
                    Day {step.step}
                  </h3>
                  {isCompletedStep && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {step.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Step Items */}
              <div className="ml-5 border-l-[3px] border-[#EEEEEE] pl-7 py-2 flex flex-col gap-6 relative">
                {step.items.map((item) => {
                  const isNextItem = nextItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col gap-2 ${item.isLocked ? "opacity-50" : ""}`}
                    >
                      {/* Dot indicator */}
                      {item.isCompleted ? (
                        <div className="absolute -left-[41.5px] top-4 w-[20px] h-[20px] rounded-full bg-green-500 border-[3px] border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                        </div>
                      ) : (
                        <div className={`absolute -left-[36.5px] top-4 w-3.5 h-3.5 rounded-full border-[3px] border-white
                          ${isNextItem ? "bg-[#FFC107] w-4 h-4 -left-[38px]" : (item.isLocked ? "bg-gray-200" : "bg-[#D6D6D6]")}
                        `} />
                      )}

                      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isNextItem ? "bg-[#FFF9E6] border-[#FFC107]/40 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"}`}>
                        <div className="flex items-start gap-4">
                          <div className={`mt-0.5 shrink-0 flex items-center justify-center p-2.5 rounded-xl ${isNextItem ? "bg-[#FFF0C2] text-[#E0A800]" : (item.isCompleted ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400")}`}>
                            {item.isLocked ? <Lock className="w-5 h-5 text-gray-300" /> : getSkillIcon(item.skill)}
                          </div>
                          <div className="flex flex-col justify-center py-0.5">
                            <p className={`text-[14px] leading-tight ${isNextItem ? "text-gray-900 font-extrabold" : "text-gray-800 font-bold"}`}>
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">
                              {item.skill} · {item.type === 'lesson' ? "Theory" : "Practice"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          {isNextItem && (
                            <button
                              onClick={() => handleItemClick(item)}
                              className="flex items-center gap-2 bg-[#FFC107] text-gray-900 text-[14px] font-extrabold py-2.5 px-6 rounded-xl hover:bg-[#FFB300] transition-colors shadow-sm"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              Resume
                            </button>
                          )}
                          {item.isCompleted && (
                            <button
                              onClick={() => handleItemClick(item)}
                              className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-600 text-[13px] font-bold py-2 px-5 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEV Tool */}
      <div className="mt-16 p-6 border-2 border-red-100 bg-red-50/50 rounded-xl w-full max-w-sm">
        <h3 className="text-red-800 font-bold mb-1 text-sm uppercase tracking-wider">Developer Tools</h3>
        <p className="text-gray-500 text-[13px] mb-4">
          Wipe all progress tracking records to test the initial locked state of the roadmap step sequences from scratch.
        </p>
        <button
          onClick={handleResetProgress}
          disabled={resetting}
          className="flex items-center gap-2 text-sm font-bold text-red-600 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {resetting ? "Resetting..." : "Reset All Progress"}
        </button>
      </div>
    </div>
  );
}
