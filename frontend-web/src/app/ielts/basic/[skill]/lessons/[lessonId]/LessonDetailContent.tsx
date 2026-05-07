"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import api from "@/lib/api";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ExerciseExampleBlock } from "./ExerciseExampleBlock";
import FloatingSelectionManager from "@/components/FloatingSelectionManager";
import {
  AlertCircle,
  Lightbulb,
  Info,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonBlock {
  type: "traps" | "strategy" | "tips" | "section" | "overview" | "example" | string;
  title?: string;
  content?: string;
  // Example block fields
  exerciseType?: "listening" | "reading";
  exerciseId?: string;
  groupIndex?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
}

interface FoundationVocabLesson {
  id: string;
  title: string;
  chapter: string;
  content: LessonBlock[];
  quiz?: QuizQuestion[];
  skill: { name: string };
}

// ─── Block style config ───────────────────────────────────────────────────────

const blockConfig: Record<
  string,
  { bg: string; border: string; icon: React.ReactNode; label: string }
> = {
  traps: {
    bg: "bg-[#FFF0F0]",
    border: "border border-[#FFD6D6]",
    icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    label: "Common Traps",
  },
  strategy: {
    bg: "bg-[#FFF9E6]",
    border: "border border-[#FFF0C2]",
    icon: <Lightbulb className="w-5 h-5 text-[#E0A800] shrink-0 mt-0.5" />,
    label: "Step-by-Step Strategy",
  },
  tips: {
    bg: "bg-[#F0F7FF]",
    border: "border border-[#C8DFFF]",
    icon: <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />,
    label: "Pro-Tips for Test Day",
  },
  overview: {
    bg: "bg-[#F6F6F6]",
    border: "border border-transparent",
    icon: <BookOpen className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />,
    label: "Overview",
  },
  section: {
    bg: "bg-transparent",
    border: "border-none",
    icon: null,
    label: "",
  },
};

// ─── Quiz Component ───────────────────────────────────────────────────────────

function LessonQuizQuestion({
  q,
  index,
  selected,
  onSelect,
  submitted,
  onShowAnswer,
}: {
  q: QuizQuestion;
  index: number;
  selected: string | null;
  onSelect: (val: string) => void;
  submitted: boolean;
  onShowAnswer: () => void;
}) {
  const [showHint, setShowHint] = useState(false);

  const isCorrect = q.options.some((opt, i) => {
    const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
    const isThisCorrect = opt === q.answer || letter === q.answer;
    const isThisSelected = selected === opt || selected === letter;
    return isThisSelected && isThisCorrect;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-[16px] sm:text-[17px] leading-relaxed flex items-start">
          <span className="text-gray-300 mr-4 font-black text-xl select-none">{index + 1}.</span>
          <span className="flex-1 tracking-tight mt-0.5"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{q.question}</ReactMarkdown></span>
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
          const isThisCorrect = opt === q.answer || letter === q.answer;
          const isThisSelected = selected === opt || selected === letter;

          let style = "bg-[#F8F9FA] text-gray-700 hover:bg-gray-100/80 border border-transparent";
          if (submitted && isThisCorrect) {
            style = "bg-[#E6F4EA] text-green-900 border border-[#CEEAD6]";
          } else if (submitted && isThisSelected && !isThisCorrect) {
            style = "bg-[#FCE8E6] text-red-900 border border-[#FAD2CF]";
          } else if (submitted) {
            style = "bg-transparent text-gray-400 cursor-not-allowed border border-transparent";
          } else if (isThisSelected) {
            style = "bg-[#FFF9E6] text-gray-900 border border-[#FFC107]/50";
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onSelect(letter)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[14px] transition-all text-left ${style}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 shadow-sm ${isThisSelected && !submitted ? "bg-white text-gray-900 ring-1 ring-gray-200" : "bg-white text-gray-500 ring-1 ring-gray-100"}`}>
                {letter}
              </span>
              <span className="flex-1 font-semibold text-[14.5px]">{opt.replace(/^([A-D])[.)]\s*/, "")}</span>
              {submitted && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
              {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between w-full mt-6 pt-5 border-t border-gray-50 border-dashed">
          {q.hint ? (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? "Hide hint" : "Show hint"}
            </button>
          ) : <div />}

          {!selected ? (
            <button
              onClick={onShowAnswer}
              className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              <Eye className="w-3.5 h-3.5" />
              Show answer
            </button>
          ) : <div />}
        </div>
      )}

      {showHint && q.hint && !submitted && (
        <p className="mt-4 text-[13px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 leading-relaxed">
          💡 {q.hint}
        </p>
      )}

      {submitted && q.explanation && (
        <div className={`mt-4 p-4 rounded-xl text-[13px] leading-relaxed shadow-sm flex items-start gap-3 ${isCorrect ? "bg-green-50 border border-green-100 text-green-800" : "bg-red-50 border border-red-100 text-red-800"}`}>
          <span className="font-bold shrink-0">{isCorrect ? "✅ Correct!" : "❌ Incorrect."}</span>
          <div className="prose prose-sm"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{q.explanation}</ReactMarkdown></div>
        </div>
      )}
    </div>
  );
}

function LessonQuiz({ questions, onCompletion, onNext }: { questions: QuizQuestion[], onCompletion?: () => void, onNext?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const onCompletionRef = useRef(onCompletion);
  useEffect(() => { onCompletionRef.current = onCompletion; });

  const score = useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      const selected = answers[idx];
      if (!selected) return acc;

      const isCorrect = q.options.some((opt, i) => {
        const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
        return (opt === q.answer || letter === q.answer) && (selected === opt || selected === letter);
      });
      return acc + (isCorrect ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const passed = questions.length > 0 && score === questions.length;

  useEffect(() => {
    if (submitted && passed) {
      onCompletionRef.current?.();
    }
  }, [submitted, passed]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {questions.map((q, idx) => (
        <LessonQuizQuestion
          key={idx}
          index={idx}
          q={q}
          selected={answers[idx] || null}
          onSelect={(val) => setAnswers(prev => ({ ...prev, [idx]: val }))}
          submitted={submitted}
          onShowAnswer={() => {
            setAnswers(prev => ({ ...prev, [idx]: q.answer }));
          }}
        />
      ))}

      <div className="sticky bottom-6 z-20 flex items-center justify-between bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] mt-4 mx-auto w-full md:max-w-2xl">
        <div className="text-[14px] font-extrabold text-gray-400 tracking-tight">
          {Object.keys(answers).length} / {questions.length} Answered
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FFD54F] text-gray-900 rounded-xl font-bold hover:bg-[#FFC107] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 opacity-70" />
            Submit Answers
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-[16px] font-extrabold leading-none ${passed ? "text-green-500" : "text-[#FFC107]"}`}>
                {score} / {questions.length} Correct
              </div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {passed ? "Perfect Score!" : "Keep Trying"}
              </div>
            </div>

            <button
              onClick={handleRestart}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-colors ${onNext && passed ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#FFC107] text-gray-900 hover:bg-[#E0A800]"}`}
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>

            {onNext && passed && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FFC107] rounded-xl font-bold text-gray-900 hover:bg-[#E0A800] transition-colors"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LessonDetailContent({
  lessonId,
  skill,
  onBack,
  onComplete,
  onNext
}: {
  lessonId: string;
  skill: string;
  onBack?: () => void;
  onComplete?: () => void;
  onNext?: () => void;
}) {
  const router = useRouter();
  const [foundationVocabLesson, setLesson] = useState<FoundationVocabLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  const handleLessonCompletion = async () => {
    try {
      await api.post("/ielts/progress/mark-completed", { lessonId });
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to mark foundationVocabLesson completed", err);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error("Failed to fetch foundationVocabLesson:", err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const tocItems = useMemo(() => {
    if (!foundationVocabLesson?.content || !Array.isArray(foundationVocabLesson.content)) return [];
    return foundationVocabLesson.content.map((block, idx) => {
      const cfg = blockConfig[block.type] ?? blockConfig.section;
      const title = block.title || cfg.label;
      return { title, id: `foundationVocabLesson-block-${idx}`, type: block.type };
    }).filter(item => item.title);
  }, [foundationVocabLesson]);

  const hasQuiz = Array.isArray(foundationVocabLesson?.quiz) && (foundationVocabLesson?.quiz?.length || 0) > 0;

  useEffect(() => {
    if (tocItems.length === 0 && !hasQuiz) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    tocItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    if (hasQuiz) {
      const el = document.getElementById("foundationVocabLesson-quiz-section");
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [tocItems, hasQuiz, foundationVocabLesson]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 animate-pulse font-medium">
        Loading foundationVocabLesson...
      </div>
    );
  }

  if (!foundationVocabLesson) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 font-bold">
        FoundationVocabLesson not found.
      </div>
    );
  }

  return (
    <FloatingSelectionManager>
      <div className="flex flex-col lg:flex-row w-full items-stretch relative min-h-[700px]">
        <div className="flex-1 flex flex-col w-full min-w-0 bg-white">
          <div className="px-6 lg:px-12 pt-10 pb-6 bg-white shrink-0 flex flex-col items-center text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <Link href="/ielts/basic/library" className="hover:text-gray-900 transition-colors px-1">Library</Link>
              <span className="opacity-30">/</span>
              <Link href={`/ielts/basic/${skill?.toLowerCase() || 'listening'}/lessons`} className="hover:text-gray-900 transition-colors px-1">{foundationVocabLesson.skill?.name || skill}</Link>
              <span className="opacity-30">/</span>
              <span className="px-1 text-gray-300">{foundationVocabLesson.chapter}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111] tracking-tight">
              {foundationVocabLesson.title}
            </h1>
          </div>
          <div className="px-6 lg:px-12 py-8 flex-1">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">
              {Array.isArray(foundationVocabLesson.content) &&
                foundationVocabLesson.content.map((block, idx) => {
                  if (block.type === "example" && block.exerciseId && block.exerciseType) {
                    return (
                      <ExerciseExampleBlock
                        key={idx}
                        id={`foundationVocabLesson-block-${idx}`}
                        title={block.title}
                        exerciseType={block.exerciseType}
                        exerciseId={block.exerciseId}
                        groupIndex={block.groupIndex ?? 0}
                      />
                    );
                  }
                  const cfg = blockConfig[block.type] ?? blockConfig.section;
                  const isSection = block.type === "section" || !blockConfig[block.type];

                  return (
                    <div
                      key={idx}
                      id={`foundationVocabLesson-block-${idx}`}
                      className={`rounded-xl ${cfg.bg} ${cfg.border} ${isSection ? "pt-2 pb-4" : "p-6"}`}
                    >
                      <div className={`flex items-start gap-2.5 ${isSection ? "mb-1" : "mb-3"}`}>
                        {cfg.icon}
                        <h3 className={`font-bold text-gray-900 tracking-tight ${isSection ? "text-[20px] md:text-[22px] mb-2" : "text-[14px] uppercase text-gray-700 tracking-wider"}`}>
                          {block.title || cfg.label}
                        </h3>
                      </div>
                      <div className={`prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed ${!isSection ? "pl-7" : ""}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {block.content ?? ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                })}
              {hasQuiz && (
                <div id="foundationVocabLesson-quiz-section" className="mt-4">
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-[18px] font-extrabold text-gray-900">
                      Check Your Understanding
                    </h2>
                  </div>
                  <LessonQuiz key={foundationVocabLesson.id} questions={foundationVocabLesson.quiz!.slice(0, 4)} onCompletion={handleLessonCompletion} onNext={onNext} />
                </div>
              )}
              <div className="h-4" />
            </div>
          </div>
        </div>
        {tocItems.length > 0 && (
          <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-6 self-start max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
            <h3 className="text-[11px] font-extrabold text-gray-400 mb-4 tracking-widest uppercase px-2">Table of contents</h3>
            <div className="flex flex-col relative border-l border-gray-200 ml-2">
              {tocItems.map((item, idx) => {
                const isMainHeading = true;
                const isActive = activeId === item.id;
                return (
                  <div key={idx} className="relative flex items-center">
                    <button
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`text-left transition-all py-1.5 border-l-[2px] -ml-[1px] block w-full
                      ${isActive
                          ? 'border-gray-900 text-gray-900 font-extrabold'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium'
                        }
                      ${isMainHeading ? 'pl-4 text-[13.5px]' : 'pl-6 text-[12.5px]'}
                    `}
                    >
                      {item.title}
                    </button>
                  </div>
                );
              })}
              {hasQuiz && (
                <div className="relative flex items-center mt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById("foundationVocabLesson-quiz-section");
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`text-left transition-all py-1.5 border-l-[2px] -ml-[1px] block w-full pl-4 text-[13.5px] ${activeId === "foundationVocabLesson-quiz-section"
                        ? 'border-gray-900 text-gray-900 font-extrabold'
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium'
                      }`}
                  >
                    Check Your Understanding
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </FloatingSelectionManager>
  );
}
