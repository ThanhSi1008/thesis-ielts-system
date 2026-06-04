import { useState, useCallback } from "react";
import { ChevronLeft, Info, Bookmark, RefreshCcw, FileText, CheckCircle2, RotateCcw, ChevronRight, Flag, Check } from "lucide-react";
import { ReadingExercise, LessonBlock } from "../utils/SharedExerciseTypes";
import { TheoryPopup } from "../ui/TheoryModal";
import { ReadingPassagePanel } from "../ui/ReadingPassagePanel";
import { ReadingQuestionsPanel } from "../ui/ReadingQuestionsPanel";
import { calcScore, getTrackerItems } from "../utils/SharedScoreUtils";
import api from "@/lib/api";
import FloatingSelectionManager from "@/components/FloatingSelectionManager";

export function ReadingExerciseLayout({
  exercise,
  lessonBlocks,
  onComplete,
  onNext,
}: {
  exercise: ReadingExercise;
  lessonBlocks: LessonBlock[];
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<"traps" | "strategy" | "tips" | null>(null);

  const allTrackerItems = getTrackerItems(exercise.content);
  const score = submitted ? calcScore(exercise.content, answers) : 0;
  const isPerfectScore = submitted && score === allTrackerItems.length;
  const showAnswers = submitted && isPerfectScore;

  const handleLocate = useCallback((qNum: number) => {
    setLocatedQuestion(qNum);
    const target = document.getElementById(`passage-q-${qNum}`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setLocatedQuestion(null), 3000);
  }, []);

  const handleSubmit = async () => {
    setSubmitted(true);
    const scoreVal = calcScore(exercise.content, answers);
    if (scoreVal === allTrackerItems.length) {
      try {
        await api.post("/ielts/progress/mark-completed", { readingExerciseId: exercise.id });
        if (onComplete) onComplete();
      } catch (err) {
        console.error("Failed to mark exercise completed", err);
      }
    }
  };

  const modalBlock = activeModal ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available._" } : null;

  const typeLabels: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    multiple_choice_multiple: "Multiple Choice (Multiple)",
    true_false_not_given: "True/False/Not Given",
    yes_no_not_given: "Yes/No/Not Given",
    note_completion: "Note Completion",
    summary_completion: "Summary Completion",
    flowchart_completion: "Flowchart Completion",
    diagram_completion: "Diagram Completion",
    matching_headings: "Matching Headings",
    matching_information: "Matching Information",
    matching_features: "Matching Features",
    matching_sentence_endings: "Matching Sentence Endings",
    short_answer: "Short Answer",
  };

  const exerciseTypes = Array.from(
    new Set(exercise.content.map((g) => typeLabels[g.type] || g.type.replace(/_/g, " ")))
  );
  const breadcrumb = `Reading · ${exerciseTypes.join(" & ")}`;

  return (
    <FloatingSelectionManager>
    <div className="flex flex-col h-[calc(100vh-90px)] min-h-[600px] relative bg-white dark:bg-slate-950 rounded-2xl border border-gray-100/50 dark:border-gray-800 shadow-sm w-full overflow-hidden transition-colors duration-300">
      {/* ── Header ── */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-6 lg:px-10 pt-6 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              {breadcrumb}
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{exercise.topic}</h1>
          </div>
          <div className="relative flex items-center gap-2 mt-1">
            <button onClick={() => setActiveModal(activeModal === "traps" ? null : "traps")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "traps" ? "bg-red-200 dark:bg-red-900/40" : "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"}`} title="Common Traps">
              <Flag className="w-4 h-4 text-red-500" />
            </button>
            <button onClick={() => setActiveModal(activeModal === "strategy" ? null : "strategy")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "strategy" ? "bg-yellow-200 dark:bg-yellow-900/40" : "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"}`} title="Step-by-Step Strategy">
              <Bookmark className="w-4 h-4 text-yellow-500" />
            </button>
            <button onClick={() => setActiveModal(activeModal === "tips" ? null : "tips")} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "tips" ? "bg-blue-200 dark:bg-blue-900/40" : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"}`} title="Pro-Tips for Test Day">
              <FileText className="w-4 h-4 text-blue-500" />
            </button>
            {modalBlock && <TheoryPopup block={modalBlock as LessonBlock} onClose={() => setActiveModal(null)} />}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Reading: Passage always on LEFT */}
        <div className="w-1/2 overflow-hidden py-3 pl-6 lg:pl-10 border-r border-gray-100 dark:border-gray-800">
          <ReadingPassagePanel
            passageWithLocations={exercise.passageWithLocations}
            passage={exercise.passage}
            locatedQuestion={locatedQuestion}
            showAnswers={showAnswers}
          />
        </div>

        {/* Questions column on RIGHT */}
        <div className="w-1/2 overflow-y-auto px-6 lg:px-10 pt-3 pb-24 transition-all duration-300">
          <ReadingQuestionsPanel
            exercise={exercise as any}
            answers={answers}
            submitted={submitted}
            showAnswers={showAnswers}
            onAnswer={(key, val) => !submitted && setAnswers((prev) => ({ ...prev, [key]: val }))}
            onLocate={handleLocate}
          />
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 pl-6 lg:pl-10 pr-24 lg:pr-28 py-3 flex items-center justify-between z-10 rounded-b-2xl transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span>Questions</span>
          <div className="flex flex-wrap items-center gap-1 ml-1 max-w-[60vw]">
            {allTrackerItems.map(({ qNum, groupKey }) => {
              const isAnswered = !!answers[groupKey] || !!answers[qNum];
              return (
                <button
                  key={qNum}
                  onClick={() => document.getElementById(`question-${qNum}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="w-7 h-9 flex flex-col items-center justify-between text-[13px] font-bold transition-all pt-1 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 outline-none focus:outline-none"
                >
                  <div className={`w-4 h-[3px] rounded-full transition-colors ${isAnswered ? "bg-[#4CAF50]" : "bg-gray-200 dark:bg-gray-700"}`} />
                  <span className="mb-0.5">{qNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {submitted ? (
            <div className="flex items-center gap-3">
              <span className="text-[14.5px] font-extrabold text-[#0F172A] dark:text-white bg-white dark:bg-gray-800 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm leading-none whitespace-nowrap tracking-wide">
                {score}/{allTrackerItems.length} correct
              </span>
              {!isPerfectScore ? (
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-primary text-white dark:text-gray-900 text-[14.5px] font-bold hover:bg-[#1E293B] dark:hover:bg-yellow-400 transition-colors shadow-sm leading-none flex items-center justify-center tracking-wide"
                >
                  Retry
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSubmitted(false); setAnswers({}); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F8F9FA] dark:bg-gray-800 text-[#0F172A] dark:text-white text-[14.5px] font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm leading-none tracking-wide"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={2.5}/>
                    Retry
                  </button>
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC107] text-[#0F172A] text-[14.5px] font-bold hover:bg-[#E0A800] transition-colors shadow-sm leading-none tracking-wide"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4" strokeWidth={2.5}/>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-primary text-white dark:text-gray-900 text-[14.5px] font-bold hover:bg-black dark:hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md leading-none flex items-center justify-center tracking-wide gap-2"
            >
              <Check className="w-[18px] h-[18px]" strokeWidth={3} />
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </div>
    </FloatingSelectionManager>
  );
}
