import { useState, useCallback, useRef } from "react";
import { Flag, Bookmark, FileText, Check, ChevronRight, RotateCcw } from "lucide-react";
import { ListeningExercise, LessonBlock } from "../utils/SharedExerciseTypes";
import { TheoryPopup } from "../ui/TheoryModal";
import { AudioPlayer } from "../ui/AudioPlayer";
import { TranscriptPanel } from "../ui/TranscriptPanel";
import { ListeningQuestionsPanel } from "../ui/ListeningQuestionsPanel";
import { calcScore, getTrackerItems } from "../utils/SharedScoreUtils";
import api from "@/lib/api";

export function ListeningExerciseLayout({
  exercise,
  lessonBlocks,
  onComplete,
  onNext,
}: {
  exercise: ListeningExercise;
  lessonBlocks: LessonBlock[];
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<"traps" | "strategy" | "tips" | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const allTrackerItems = getTrackerItems(exercise.content);
  const score = submitted ? calcScore(exercise.content, answers) : 0;
  const isPerfectScore = submitted && score === allTrackerItems.length;

  const handleLocate = useCallback((qNum: number) => {
    setLocatedQuestion(qNum);
    const target = document.getElementById(`transcript-q-${qNum}`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setLocatedQuestion(null), 3000);
  }, []);

  const handleSubmit = async () => {
    setSubmitted(true);
    const scoreVal = calcScore(exercise.content, answers);
    if (scoreVal === allTrackerItems.length) {
      try {
        await api.post("/ielts/progress/mark-completed", { listeningExerciseId: exercise.id });
        if (onComplete) onComplete();
      } catch (err) {
        console.error("Failed to mark exercise completed", err);
      }
    }
  };
  const modalBlock = activeModal ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available._" } : null;

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] min-h-[600px] relative bg-white rounded-2xl border border-gray-100/50 shadow-sm w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="border-b border-gray-100 px-6 lg:px-10 pt-6 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Listening · Multiple Choice
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{exercise.topic}</h1>
          </div>
          <div className="relative flex items-center gap-2 mt-1">
            <button onClick={() => setActiveModal(activeModal === "traps" ? null : "traps")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "traps" ? "bg-red-200" : "bg-red-50 hover:bg-red-100"}`} title="Common Traps">
              <Flag className="w-4 h-4 text-red-500" />
            </button>
            <button onClick={() => setActiveModal(activeModal === "strategy" ? null : "strategy")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "strategy" ? "bg-yellow-200" : "bg-yellow-50 hover:bg-yellow-100"}`} title="Step-by-Step Strategy">
              <Bookmark className="w-4 h-4 text-yellow-500" />
            </button>
            <button onClick={() => setActiveModal(activeModal === "tips" ? null : "tips")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "tips" ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100"}`} title="Pro-Tips for Test Day">
              <FileText className="w-4 h-4 text-blue-500" />
            </button>
            {modalBlock && <TheoryPopup block={modalBlock as LessonBlock} onClose={() => setActiveModal(null)} />}
          </div>
        </div>

        {exercise.audioUrl && (
          <div className="mt-2">
            <AudioPlayer src={exercise.audioUrl} audioRef={audioRef} />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Questions column */}
        <div className={`overflow-y-auto px-6 lg:px-10 pt-3 pb-24 transition-all duration-300 ${submitted && isPerfectScore ? "w-1/2" : "w-full"}`}>
          <ListeningQuestionsPanel
            exercise={exercise as any}
            answers={answers}
            submitted={submitted}
            showAnswers={isPerfectScore}
            onAnswer={(key, val) => !submitted && setAnswers((prev) => ({ ...prev, [key]: val }))}
            audioRef={audioRef}
            onLocate={handleLocate}
          />
        </div>

        {/* Listening: Transcript on RIGHT after submit - only if perfect score */}
        {submitted && isPerfectScore && exercise.transcript && (
          <div className="w-1/2 overflow-hidden py-3 pr-6 lg:pr-10 border-l border-gray-100">
            <TranscriptPanel transcript={exercise.transcript} locatedQuestion={locatedQuestion} />
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 lg:px-10 py-3 flex items-center justify-between z-10 rounded-b-2xl">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span>Questions</span>
          <div className="flex flex-wrap items-center gap-1 ml-1 max-w-[60vw]">
            {allTrackerItems.map(({ qNum, groupKey }) => {
              const isAnswered = !!answers[groupKey] || !!answers[qNum];
              return (
                <button
                  key={qNum}
                  onClick={() => document.getElementById(`question-${qNum}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="w-7 h-9 flex flex-col items-center justify-between text-[13px] font-bold transition-all pt-1 text-gray-700 hover:bg-gray-50 outline-none focus:outline-none"
                >
                  <div className={`w-4 h-[3px] rounded-full transition-colors ${isAnswered ? "bg-[#4CAF50]" : "bg-gray-200"}`} />
                  <span className="mb-0.5">{qNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {submitted ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#111] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                {score}/{allTrackerItems.length} correct
              </span>
              {!isPerfectScore ? (
                <button
                  onClick={() => { setSubmitted(false); }}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-bold hover:bg-black transition-colors shadow-sm"
                >
                  Retry
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSubmitted(false); setAnswers({}); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${onNext ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#FFC107] text-gray-900 hover:bg-[#E0A800]"}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry
                  </button>
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FFC107] text-gray-900 rounded-lg font-bold hover:bg-[#E0A800] transition-all shadow-sm"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
