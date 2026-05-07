"use client";

import { useState } from "react";
import { ChevronRight, FileCheck, Target, BookOpen, Volume2, MessageCircle } from "lucide-react";
import { LessonBlock } from "../utils/SharedExerciseTypes";
import { TheoryPopup } from "../ui/TheoryModal";
import { authService } from "@/services/auth.service";
import { toast } from "@/components/Toaster";
import api from "@/lib/api";
import { SpeakingMcqView } from "../views/SpeakingMcqView";

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

export function SpeakingExerciseLayout({
  exercise,
  lessonBlocks = [],
  onComplete,
  onNext,
}: {
  exercise: {
    id: string;
    topic: string;
    partType: number;
    questionType: string;
    instructions?: string;
    prompt: string;
    content?: Record<string, unknown>;
    modelAnswer?: Record<string, unknown>;
  };
  lessonBlocks?: LessonBlock[];
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const isMcq = exercise.questionType === "mcq";
  const modelAnswer = exercise.modelAnswer as ClozeModelAnswer | undefined;

  const getSubBlockIcon = (title: string, className = "w-5 h-5") => {
    const t = title.toLowerCase();
    if (t.includes("fluency")) return <MessageCircle className={className} />;
    if (t.includes("grammar") || t.includes("pronunciation")) return <Volume2 className={className} />;
    if (t.includes("lexical") || t.includes("vocabulary")) return <BookOpen className={className} />;
    return <Target className={className} />;
  };

  const getSubBlockColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("fluency")) return { bg: "bg-blue-100 hover:bg-blue-200", text: "text-blue-600" };
    if (t.includes("grammar") || t.includes("pronunciation")) return { bg: "bg-purple-100 hover:bg-purple-200", text: "text-purple-600" };
    if (t.includes("lexical") || t.includes("vocabulary")) return { bg: "bg-orange-100 hover:bg-orange-200", text: "text-orange-600" };
    return { bg: "bg-green-100 hover:bg-green-200", text: "text-green-600" };
  };

  const activeBlock = lessonBlocks.find((b) => b.title === activeModal);

  const handleSelectAnswer = (blankId: string, value: string) => {
    if (showAnswer) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswers = async () => {
    if (isMcq) return;

    if (!modelAnswer) return;
    let allAnswered = true;
    for (const p of modelAnswer.paragraphs) {
      for (const s of p.segments) {
        if (s.type === "blank" && !answers[s.id]) {
          allAnswered = false;
        }
      }
    }

    if (!allAnswered) {
      toast({
        title: "Incomplete",
        description: "Please fill in all the blanks before checking your answer.",
        variant: "destructive",
      });
      return;
    }

    setShowAnswer(true);
    await markCompleted();
  };

  const markCompleted = async () => {
    setIsCompleting(true);
    try {
      const token = authService.getToken();
      await api.post(
        "/ielts/progress/mark-completed",
        { speakingExerciseId: exercise.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to mark completed:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderSegment = (segment: ClozeSegment) => {
    if (segment.type === "text") {
      return <span key={Math.random()}>{segment.value}</span>;
    }

    const { id, correctAnswer, options } = segment;
    const userAns = answers[id] || "";
    const isCorrect = userAns === correctAnswer;

    let selectClasses = "mx-1 px-3 py-1.5 rounded-xl border appearance-none outline-none font-medium text-center inline-block cursor-pointer transition-colors shadow-sm bg-white ";
    
    if (showAnswer) {
       if (isCorrect) {
           selectClasses += "border-green-500 text-green-700 bg-green-50";
       } else {
           selectClasses += "border-red-500 text-red-700 bg-red-50";
       }
    } else {
       if (userAns) {
           selectClasses += "border-gray-400 text-gray-900 hover:border-gray-500";
       } else {
           selectClasses += "border-gray-300 text-gray-500 hover:border-gray-400";
       }
    }

    return (
      <span key={id} className="relative inline-block group">
        <select
          value={showAnswer ? correctAnswer : userAns}
          onChange={(e) => handleSelectAnswer(id, e.target.value)}
          disabled={showAnswer}
          className={selectClasses}
          style={{ minWidth: "120px" }}
        >
          <option value="" disabled>Choose</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Correction tooltip */}
        {showAnswer && !isCorrect && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 w-max max-w-[200px]">
            <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-normal text-center">
              You answered: <span className="text-red-300 line-through mr-1">{userAns || "nothing"}</span>
              <br/>
              Correct: <span className="font-bold text-green-300">{correctAnswer}</span>
            </div>
            <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        )}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-yellow-700">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{exercise.topic}</h2>
            <p className="text-sm text-gray-500">IELTS Speaking Part {exercise.partType}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          {lessonBlocks.map((b, idx) => {
            const color = getSubBlockColor(b.title || "");
            return (
              <button
                key={idx}
                onClick={() => setActiveModal(activeModal === b.title ? null : (b.title || null))}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  activeModal === b.title ? color.bg.replace("hover:", "") : color.bg
                }`}
                title={b.title}
              >
                {getSubBlockIcon(b.title || "", color.text)}
              </button>
            );
          })}

          {activeBlock && (
            <TheoryPopup
              block={activeBlock}
              onClose={() => setActiveModal(null)}
              customTheme={{
                bg: "bg-white",
                border: "border-gray-200",
                icon: getSubBlockIcon(activeBlock.title || "", getSubBlockColor(activeBlock.title || "").text),
                text: "text-gray-800",
              }}
            />
          )}

          {showAnswer && onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
            >
              Next Exercise
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-4xl space-y-8 pb-20">
          {/* Instructions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Instructions</h3>
            <p className="text-gray-700">{exercise.instructions}</p>
          </div>

          {/* Prompt */}
          <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
            <h3 className="text-sm font-bold text-yellow-800/60 uppercase tracking-wider mb-3">Examiner&apos;s Prompt</h3>
            <div className="text-gray-900 font-medium whitespace-pre-wrap leading-relaxed text-lg">
              {exercise.prompt}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            {isMcq ? (
              <SpeakingMcqView 
                content={exercise.content} 
                onCorrectComplete={markCompleted}
              />
            ) : (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Your Response</h3>
                {modelAnswer?.paragraphs?.map((p, idx) => (
                  <div key={idx} className="space-y-2">
                    {p.title && <h4 className="font-semibold text-gray-700 text-sm">{p.title}</h4>}
                    <div className="text-gray-800 leading-[2.5rem] text-lg">
                      {p.segments.map((s) => renderSegment(s))}
                    </div>
                  </div>
                ))}

                {/* Footer Actions */}
                <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {showAnswer ? "Review your answers and check the corrections." : "Select the best option from the dropdowns."}
                  </div>
                  {!showAnswer && (
                    <button
                      onClick={checkAnswers}
                      disabled={isCompleting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-gray-900 rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-sm disabled:opacity-50"
                    >
                      <FileCheck className="w-5 h-5" />
                      {isCompleting ? "Checking..." : "Check Answers"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
