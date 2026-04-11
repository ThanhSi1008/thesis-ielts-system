"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import api from "@/lib/api";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft,
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
  type: "traps" | "strategy" | "tips" | "section" | "overview" | string;
  title?: string;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
}

interface Lesson {
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

  // Note: the q.answer in actual DB can be 'A' or the full text.
  const isCorrect = q.options.some((opt, i) => {
    const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
    const isThisCorrect = opt === q.answer || letter === q.answer;
    const isThisSelected = selected === opt || selected === letter;
    return isThisSelected && isThisCorrect;
  });

  return (
    <div className="bg-white rounded-2xl p-2 sm:p-5 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-[15px] sm:text-[17px] leading-relaxed flex items-start">
          <span className="text-gray-300 mr-3 mt-0.5 select-none">{index + 1}.</span>
          <span className="flex-1 tracking-tight"><ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown></span>
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
          const isThisCorrect = opt === q.answer || letter === q.answer;
          const isThisSelected = selected === opt || selected === letter;

          let style = "bg-gray-50 text-gray-700 hover:bg-gray-100";
          if (submitted && isThisCorrect) {
            style = "bg-green-100/50 text-green-900 ring-1 ring-green-200";
          } else if (submitted && isThisSelected && !isThisCorrect) {
            style = "bg-red-50 text-red-900 ring-1 ring-red-200";
          } else if (submitted) {
            style = "bg-transparent text-gray-400 cursor-not-allowed";
          } else if (isThisSelected) {
            style = "bg-[#FFC600]/10 text-gray-900 ring-1 ring-[#FFC600]/60";
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onSelect(letter)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[14px] transition-all text-left ${style}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${isThisSelected && !submitted ? "bg-primary/30 text-gray-900 shadow-sm" : "bg-white border shadow-sm text-gray-500"}`}>
                {letter}
              </span>
              <span className="flex-1 font-medium">{opt.replace(/^([A-D])[.)]\s*/, "")}</span>
              {submitted && isThisCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
              {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Actions and Hint/Answer rendering */}
      {!submitted && (
        <div className="flex items-center gap-4 mt-5">
          {q.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? "Hide hint" : "Show hint"}
            </button>
          )}
          {!selected && (
            <button
              onClick={onShowAnswer}
              className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider ml-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              Show answer
            </button>
          )}
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
          <div className="prose prose-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown></div>
        </div>
      )}
    </div>
  );
}

function LessonQuiz({ questions, onCompletion, onNext }: { questions: QuizQuestion[], onCompletion?: () => void, onNext?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const passed = score === questions.length;

  useEffect(() => {
    if (submitted && passed && onCompletion) {
      onCompletion();
    }
  }, [submitted, passed, onCompletion]);

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

      {/* Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between bg-white border border-gray-200 px-5 py-3.5 rounded-2xl shadow-lg mt-2 mx-auto w-full md:max-w-2xl">
        <div className="text-[14px] font-bold text-gray-400">
          {Object.keys(answers).length} / {questions.length} Answered
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FFC107] text-gray-900 rounded-xl font-bold hover:bg-[#E0A800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
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

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Content Component (Reusable for Roadmap) ──────────────────────────────

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
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLessonCompletion = async () => {
    try {
      await api.post("/ielts/progress/mark-completed", { lessonId });
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to mark lesson completed", err);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 animate-pulse font-medium">
        Loading lesson...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 font-bold">
        Lesson not found.
      </div>
    );
  }

  const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;

  return (
    <div className="flex flex-col bg-white -m-6 lg:-m-10 rounded-2xl">
      {/* Sticky Header */}
      <div className="border-b border-gray-100 px-6 lg:px-12 pt-6 pb-4 bg-white shrink-0 flex flex-col items-center text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          {lesson.skill?.name} · {lesson.chapter}
        </p>
        <h1 className="text-2xl font-extrabold text-[#111] tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Content — flows naturally, parent layout scrolls */}
      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Theory Blocks */}
          {Array.isArray(lesson.content) &&
            lesson.content.map((block, idx) => {
              const cfg = blockConfig[block.type] ?? blockConfig.section;
              const isSection = block.type === "section" || !blockConfig[block.type];

              return (
                <div
                  key={idx}
                  className={`rounded-xl ${cfg.bg} ${cfg.border} ${isSection ? "pt-2 pb-4" : "p-6"}`}
                >
                  <div className={`flex items-start gap-2.5 ${isSection ? "mb-1" : "mb-3"}`}>
                    {cfg.icon}
                    <h3 className={`font-bold text-gray-900 tracking-tight ${isSection ? "text-[20px] md:text-[22px] mb-2" : "text-[14px] uppercase text-gray-700 tracking-wider"}`}>
                      {block.title || cfg.label}
                    </h3>
                  </div>
                  <div className={`prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed ${!isSection ? "pl-7" : ""}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

          {/* Quiz Section */}
          {hasQuiz && (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-[18px] font-extrabold text-gray-900">
                  Check Your Understanding
                </h2>
              </div>
              <LessonQuiz questions={lesson.quiz!.slice(0, 4)} onCompletion={handleLessonCompletion} onNext={onNext} />
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </div>

    </div>
  );
}

export default function LessonDetailPage() {
  const { lessonId, skill } = useParams() as { lessonId: string; skill: string };
  const router = useRouter();

  return (
    <LessonDetailContent
      lessonId={lessonId}
      skill={skill}
      onBack={() => router.back()}
    />
  );
}
