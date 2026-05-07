"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight, FileCheck, Save, Target, Link, BookOpen } from "lucide-react";
import { LessonBlock } from "../utils/SharedExerciseTypes";
import { TheoryPopup } from "../ui/TheoryModal";
import { authService } from "@/services/auth.service";
import { toast } from "@/components/Toaster";
import api from "@/lib/api";

// Types based on the new JSON structure
type ClozeSegment =
  | { type: "text"; value: string }
  | { type: "blank"; id: string; correctAnswer: string; options: string[] };

type ClozeParagraph = {
  number: number;
  title: string;
  segments: ClozeSegment[];
};

type ClozeModelAnswer = {
  paragraphs: ClozeParagraph[];
};

export function WritingClozeLayout({
  exercise,
  lessonBlocks = [],
  onComplete,
  onNext,
}: {
  exercise: any;
  lessonBlocks?: LessonBlock[];
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSavedAnswers = async () => {
      if (!exercise?.id) return;
      try {
        const token = authService.getToken();
        const res = await axios.get(
          `http://localhost:3000/api/v1/ielts/writing-exercises/${exercise.id}/my-answer`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.answers) {
          setAnswers(res.data.answers);
        }
      } catch (err) {
        console.error("Failed to load saved answers:", err);
      }
    };
    fetchSavedAnswers();
  }, [exercise?.id]);

  const handleSaveProgress = async () => {
    if (!exercise?.id) return;
    setIsSaving(true);
    try {
      const token = authService.getToken();
      await axios.post(
        `http://localhost:3000/api/v1/ielts/writing-exercises/${exercise.id}/save-answer`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await api.post("/ielts/progress/mark-completed", { writingExerciseId: exercise.id });
      toast.success("Progress saved successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to save progress:", err);
      toast.error("Failed to save tracking progress");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowAnswer = async () => {
    setShowAnswer(true);
    try {
      if (exercise?.id) {
        const token = authService.getToken();
        await axios.post(
          `http://localhost:3000/api/v1/ielts/writing-exercises/${exercise.id}/save-answer`,
          { answers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await api.post("/ielts/progress/mark-completed", { writingExerciseId: exercise.id });
      }
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to mark completed", err);
    }
  };

  const handleTryAgain = () => {
    setShowAnswer(false);
    setAnswers({});
  };

  const [activeModal, setActiveModal] = useState<"traps" | "strategy" | "tips" | null>(null);

  const modelAnswer = (exercise?.modelAnswer as ClozeModelAnswer) || { paragraphs: [] };
  const modalBlock = activeModal
    ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available._" }
    : null;

  const topicRaw = exercise?.topic || "Writing Task 1";
  const hasSeparator = topicRaw.includes(" - ");
  const category = hasSeparator ? topicRaw.split(" - ")[0] : "IELTS Writing";
  const subTopic = hasSeparator ? topicRaw.split(" - ").slice(1).join(" - ") : topicRaw;

  // Check answers
  const isCorrect = (blankId: string, correctAnswer: string) => {
    return answers[blankId] === correctAnswer;
  };

  return (
    <div className="flex w-full flex-col bg-[#F9F6F0] overflow-hidden rounded-3xl border border-gray-200 shadow-sm h-[90vh]">
      {/* Header */}
      <div className="flex px-8 py-5 flex-none items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Exercise</span>
            <h1 className="text-[15px] font-bold text-slate-800 tracking-tight">{category}: {subTopic}</h1>
          </div>
        </div>

        {/* Theory Buttons */}
        <div className="relative flex items-center gap-3">
          <button onClick={() => setActiveModal(activeModal === "traps" ? null : "traps")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "traps" ? "bg-green-200" : "bg-green-100 hover:bg-green-200"}`} title="Task Achievement">
            <Target size={18} className="text-green-700" />
          </button>
          <button onClick={() => setActiveModal(activeModal === "strategy" ? null : "strategy")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "strategy" ? "bg-pink-200" : "bg-pink-100 hover:bg-pink-200"}`} title="Grammar & Cohesion">
             <Link size={18} className="text-pink-600" />
          </button>
          <button onClick={() => setActiveModal(activeModal === "tips" ? null : "tips")} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeModal === "tips" ? "bg-yellow-200" : "bg-yellow-100 hover:bg-yellow-200"}`} title="Lexical Resource">
            <BookOpen size={18} className="text-yellow-700" />
          </button>
          {modalBlock && (
            <TheoryPopup 
              block={modalBlock as LessonBlock} 
              onClose={() => setActiveModal(null)} 
              customTheme={
                activeModal === "traps" ? {
                  bg: "bg-green-50",
                  border: "border-green-200",
                  icon: <Target size={20} className="text-green-600" />,
                  text: "text-green-800"
                } : activeModal === "strategy" ? {
                  bg: "bg-pink-50",
                  border: "border-pink-200",
                  icon: <Link size={20} className="text-pink-600" />,
                  text: "text-pink-800"
                } : {
                  bg: "bg-yellow-50",
                  border: "border-yellow-200",
                  icon: <BookOpen size={20} className="text-yellow-600" />,
                  text: "text-yellow-800"
                }
              }
            />
          )}
        </div>
      </div>

      {/* Main Two-Pane Split or Top-Bottom Split */}
      <div className={`flex flex-1 overflow-hidden px-6 py-6 gap-6 ${exercise?.diagramUrl ? "" : "flex-col"}`}>
        {/* Left Pane / Top Pane: Prompt and Image */}
        <div className={`${exercise?.diagramUrl ? "w-[45%] overflow-y-auto" : "w-full flex-none"} bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}>
          <div className="text-[15px] font-medium text-slate-700 leading-relaxed">
            {exercise?.prompt}
          </div>

          {exercise?.diagramUrl && (
            <div className="mt-8 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white p-2">
              <img
                src={exercise.diagramUrl}
                alt="Diagram"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Right Pane Container / Bottom Pane Container: Cloze Paragraphs */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
            {modelAnswer.paragraphs?.map((para, i) => (
              <div key={i} className="bg-[#F5EFE6] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#E5D5C5] text-[#8C7A6B] flex items-center justify-center font-bold text-sm">
                    {para.number}
                  </div>
                  <h3 className="font-bold text-gray-800 text-[16px]">{para.title}:</h3>
                </div>
                
                <div className="text-[16px] leading-[2.5] text-gray-800">
                  {para.segments.map((seg, idx) => {
                    if (seg.type === "text") {
                      return <span key={idx}>{seg.value}</span>;
                    }

                    if (seg.type === "blank") {
                      const selected = answers[seg.id] || "";
                      const answered = !!selected;
                      let selectClasses = "mx-1 px-3 py-1.5 rounded-xl border appearance-none outline-none font-medium text-center inline-block cursor-pointer transition-colors shadow-sm bg-white ";
                      
                      if (showAnswer) {
                         if (isCorrect(seg.id, seg.correctAnswer)) {
                             selectClasses += "border-green-500 text-green-700 bg-green-50";
                         } else {
                             selectClasses += "border-red-500 text-red-700 bg-red-50";
                         }
                      } else {
                         if (answered) {
                             selectClasses += "border-gray-400 text-gray-900 hover:border-gray-500";
                         } else {
                             selectClasses += "border-gray-300 text-gray-500 hover:border-gray-400";
                         }
                      }

                      return (
                        <span key={seg.id} className="relative inline-block">
                          <select
                            value={showAnswer ? seg.correctAnswer : selected}
                            onChange={(e) => setAnswers({ ...answers, [seg.id]: e.target.value })}
                            disabled={showAnswer}
                            className={selectClasses}
                            style={{ minWidth: "120px", paddingRight: "30px" }}
                          >
                            <option value="" disabled>Choose</option>
                            {seg.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 w-full justify-end flex-none">
            {!showAnswer ? (
              <>
                <button
                  onClick={handleSaveProgress}
                  disabled={isSaving}
                  className="px-6 py-2.5 flex items-center justify-center gap-2 text-[14px] bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-sky-100 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Progress"}
                </button>
                <button
                  onClick={handleShowAnswer}
                  className="px-8 py-2.5 text-[14px] bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2"
                >
                  Check Answers
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTryAgain}
                  className="px-8 py-2.5 text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                >
                  Try again
                </button>
                <button
                  onClick={onNext}
                  className="px-8 py-2.5 text-[14px] bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
