"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronRight, Check } from "lucide-react";
import { ListeningQuestionsPanel } from "../[skill]/exercises/[exerciseId]/_components/ui/ListeningQuestionsPanel";
import { AudioPlayer } from "../[skill]/exercises/[exerciseId]/_components/ui/AudioPlayer";
import { ReadingPassagePanel } from "../[skill]/exercises/[exerciseId]/_components/ui/ReadingPassagePanel";
import { ReadingQuestionsPanel } from "../[skill]/exercises/[exerciseId]/_components/ui/ReadingQuestionsPanel";
import { calcScore, getTrackerItems } from "../[skill]/exercises/[exerciseId]/_components/utils/SharedScoreUtils";
import { writingClozeData } from "./writingClozeData";

interface Scores {
  listening: number;
  reading: number;
  writing: number;
  overall: number;
}

export function DiagnosticQuiz({
  onComplete,
  isSubmitting,
}: {
  onComplete: (scores: Scores) => void;
  isSubmitting: boolean;
}) {
  const [stage, setStage] = useState<"listening" | "reading" | "writing" | "finish">("listening");
  const [exercises, setExercises] = useState<{ listening: any; reading: any } | null>(null);
  const [loading, setLoading] = useState(true);

  // Scores
  const [scores, setScores] = useState<Scores>({ listening: 0, reading: 0, writing: 0, overall: 0 });

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/v1/ielts/placement-exercises");
        setExercises(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-400 font-medium animate-pulse">
        Loading Placement Test...
      </div>
    );
  }

  const handleNext = (skill: "listening" | "reading" | "writing", score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    setScores((prev) => {
      const updated = { ...prev, [skill]: percentage };
      if (skill === "writing") {
        updated.overall = Math.round((updated.listening + updated.reading + updated.writing) / 3);
        setStage("finish");
      } else if (skill === "listening") {
        setStage("reading");
      } else if (skill === "reading") {
        setStage("writing");
      }
      return updated;
    });
  };

  const steps = ["listening", "reading", "writing", "finish"];
  const currentIndex = steps.indexOf(stage);

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between relative px-10 mb-4">
        <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gray-200 -z-10 -translate-y-1/2" />
        {["Listening", "Reading", "Writing", "Finish"].map((label, idx) => {
          const isActive = idx === currentIndex;
          const isDone = idx < currentIndex;
          return (
            <div key={label} className="flex flex-col items-center bg-white px-2 z-10 w-20">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors mb-1.5 ${
                  isDone
                    ? "bg-[#FFC107] border-[#FFC107] text-white"
                    : isActive
                    ? "bg-white border-[#FFC107] text-[#FFC107]"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 font-bold" strokeWidth={3} /> : <span className="font-bold text-xs">{idx + 1}</span>}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isActive || isDone ? "text-[#FFC107]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl w-full min-h-[500px] overflow-hidden flex flex-col">
        {stage === "listening" && exercises?.listening && (
          <ListeningStage exercise={exercises.listening} onNext={(s, t) => handleNext("listening", s, t)} />
        )}
        {stage === "reading" && exercises?.reading && (
          <ReadingStage exercise={exercises.reading} onNext={(s, t) => handleNext("reading", s, t)} />
        )}
        {stage === "writing" && <WritingStage onNext={(s, t) => handleNext("writing", s, t)} />}
        {stage === "finish" && <FinishStage scores={scores} onFinish={() => onComplete(scores)} isSubmitting={isSubmitting} />}
      </div>
    </div>
  );
}

// ── Listening Stage ─────────────────────────────────────────────────────────
function ListeningStage({ exercise, onNext }: { exercise: any; onNext: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const total = getTrackerItems(exercise.content).length;
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col h-full flex-1 relative overflow-hidden">
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{exercise.topic}</h2>
        {exercise.audioUrl && <AudioPlayer src={exercise.audioUrl} audioRef={audioRef} />}
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <ListeningQuestionsPanel
          exercise={exercise}
          answers={answers}
          submitted={false}
          showAnswers={false}
          onAnswer={(k, v) => setAnswers(p => ({ ...p, [k]: v }))}
          audioRef={audioRef}
          onLocate={() => {}}
        />
      </div>
      <div className="absolute bottom-0 right-0 p-4 w-full bg-white border-t border-gray-100 flex justify-end">
         <button
            onClick={() => onNext(calcScore(exercise.content, answers), total)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC107] text-gray-900 text-[14.5px] font-bold hover:bg-[#E0A800] transition-colors shadow-sm"
          >
            Submit & Next <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
}

// ── Reading Stage ─────────────────────────────────────────────────────────
function ReadingStage({ exercise, onNext }: { exercise: any; onNext: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const total = getTrackerItems(exercise.content).length;

  return (
    <div className="flex w-full h-[500px] relative">
      <div className="w-1/2 border-r border-gray-100 p-4 overflow-y-auto">
        <ReadingPassagePanel passage={exercise.passage} passageWithLocations={exercise.passageWithLocations} locatedQuestion={null} showAnswers={false} />
      </div>
      <div className="w-1/2 p-4 overflow-y-auto pb-20">
        <ReadingQuestionsPanel
           exercise={exercise}
           answers={answers}
           submitted={false}
           showAnswers={false}
           onAnswer={(k, v) => setAnswers(p => ({ ...p, [k]: v }))}
           onLocate={() => {}}
        />
      </div>
      <div className="absolute bottom-0 right-0 p-4 w-full bg-white border-t border-gray-100 flex justify-end z-10">
         <button
            onClick={() => onNext(calcScore(exercise.content, answers), total)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC107] text-gray-900 text-[14.5px] font-bold hover:bg-[#E0A800] transition-colors shadow-sm"
          >
            Submit & Next <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
}

// ── Writing Stage ─────────────────────────────────────────────────────────
function WritingStage({ onNext }: { onNext: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const processParagraph = () => {
    return writingClozeData.paragraph.map((part, i) => {
      if (part.type === "text") {
        return <span key={i} className="leading-loose">{part.content}</span>;
      }
      if (part.type === "blank") {
        return (
          <select
            key={i}
            value={answers[part.id!] || ""}
            onChange={(e) => setAnswers(p => ({ ...p, [part.id!]: e.target.value }))}
            className="mx-1 px-2 py-1 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFC107] font-medium text-gray-900 min-w-[120px] text-center"
          >
            <option value="" disabled>---</option>
            {part.options!.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      return null;
    });
  };

  const handleComplete = () => {
    let score = 0;
    writingClozeData.paragraph.forEach(p => {
      if (p.type === "blank") {
        const correctOpt = p.options![p.correct!];
        if (answers[p.id!] === correctOpt) score++;
      }
    });
    onNext(score, writingClozeData.totalBlanks);
  };

  return (
    <div className="flex flex-col h-full flex-1 relative overflow-hidden p-6 md:p-8">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Writing Vocabulary Check</h2>
      <p className="text-gray-500 mb-6 font-medium">{writingClozeData.instructions}</p>
      
      <div className="text-lg text-slate-800 bg-[#F8F9FA] p-6 rounded-xl border border-gray-100 shadow-sm">
        {processParagraph()}
      </div>

      <div className="absolute bottom-0 right-0 p-3 w-full bg-white border-t border-gray-100 flex justify-end">
         <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC107] text-gray-900 text-[14.5px] font-bold hover:bg-[#E0A800] transition-colors shadow-sm"
          >
            Submit & Next <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
}

// ── Finish Stage ─────────────────────────────────────────────────────────
function FinishStage({ scores, onFinish, isSubmitting }: { scores: Scores; onFinish: () => void; isSubmitting: boolean }) {
  const getQuality = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "text-green-600", desc: "You'll skip lessons and most exercises." };
    if (score >= 70) return { text: "Good", color: "text-blue-600", desc: "You'll do 1 exercise per lesson." };
    if (score >= 50) return { text: "Needs Work", color: "text-[#FFC107]", desc: "You'll do half exercises per lesson." };
    return { text: "Beginner", color: "text-red-500", desc: "You'll do all lessons and exercises." };
  };

  return (
    <div className="flex flex-col h-full flex-1 items-center justify-center p-6 text-center">
      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
        <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Diagnostic Complete!</h2>
      <p className="text-sm text-gray-500 mb-8">We've personalized your roadmap based on your results.</p>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5 mx-auto">
        {[
          { label: "Listening", score: scores.listening },
          { label: "Reading", score: scores.reading },
          { label: "Writing", score: scores.writing }
        ].map(s => {
          const q = getQuality(s.score);
          return (
            <div key={s.label} className="flex items-center gap-4 text-left">
              <span className="w-20 text-sm font-semibold text-gray-700">{s.label}</span>
              <div className="flex-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${q.color.replace('text-', 'bg-')}`} style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-gray-500 font-medium">{q.desc}</p>
              </div>
              <div className="w-16 text-right">
                <span className={`text-sm font-semibold ${q.color}`}>{s.score}%</span>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{q.text}</span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onFinish}
        disabled={isSubmitting}
        className="mt-8 flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-4 py-2.5 rounded-lg bg-[#FFC107] text-gray-900 text-sm font-medium hover:bg-[#E0A800] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Generating Roadmap..." : "Continue to My Roadmap"} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
