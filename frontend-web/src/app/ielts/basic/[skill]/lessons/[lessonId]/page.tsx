"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
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
    border: "border-[#FFD6D6]",
    icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    label: "Common Traps",
  },
  strategy: {
    bg: "bg-[#FFF9E6]",
    border: "border-[#FFF0C2]",
    icon: <Lightbulb className="w-5 h-5 text-[#E0A800] shrink-0 mt-0.5" />,
    label: "Step-by-Step Strategy",
  },
  tips: {
    bg: "bg-[#F0F7FF]",
    border: "border-[#C8DFFF]",
    icon: <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />,
    label: "Pro-Tips for Test Day",
  },
  overview: {
    bg: "bg-[#F6F6F6]",
    border: "border-[#E8E8E8]",
    icon: <BookOpen className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />,
    label: "Overview",
  },
  section: {
    bg: "bg-white",
    border: "border-gray-100",
    icon: <BookOpen className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />,
    label: "Section",
  },
};

// ─── Quiz Component ───────────────────────────────────────────────────────────

function LessonQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const isCorrect = selected !== null && selected === q.answer;
  const isWrong = selected !== null && selected !== q.answer;
  const answered = selected !== null;

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowHint(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div className="flex flex-col items-center gap-4 py-10 px-6 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold ${
            passed ? "bg-green-100 text-green-600" : "bg-red-50 text-red-500"
          }`}
        >
          {pct}%
        </div>
        <h3 className="text-xl font-extrabold text-gray-900">
          {passed ? "Great job! 🎉" : "Keep practising! 💪"}
        </h3>
        <p className="text-gray-500 text-[14px]">
          You got <strong>{score}</strong> out of <strong>{questions.length}</strong> correct.
        </p>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FFC107] rounded-xl font-bold text-gray-900 hover:bg-[#E0A800] transition-colors mt-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFC107] rounded-full transition-all duration-500"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-[12px] font-bold text-gray-400 shrink-0">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-[#FAFAFA] border border-gray-100 rounded-2xl p-5">
        <p className="font-bold text-[15px] text-gray-900 leading-snug mb-4">
          {q.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const letter = opt.match(/^([A-D])\./)?.[1] ?? String.fromCharCode(65 + i);
            const isThisCorrect = opt === q.answer || letter === q.answer;
            const isThisSelected = selected === opt || selected === letter;

            let style =
              "border border-gray-200 bg-white text-gray-700 hover:border-[#FFC107] hover:bg-[#FFFDF0]";
            if (answered && isThisCorrect) {
              style = "border border-green-400 bg-green-50 text-green-800";
            } else if (answered && isThisSelected && !isThisCorrect) {
              style = "border border-red-300 bg-red-50 text-red-700";
            } else if (answered) {
              style = "border border-gray-100 bg-white text-gray-400 cursor-not-allowed";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt.match(/^[A-D]\./)?.[0]?.replace(".", "") ?? opt)}
                disabled={answered}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all text-left ${style}`}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-extrabold shrink-0">
                  {letter}
                </span>
                <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, "")}</span>
                {answered && isThisCorrect && (
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                )}
                {answered && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hint toggle */}
        {q.hint && !answered && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className="flex items-center gap-1.5 mt-4 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {showHint && q.hint && (
          <p className="mt-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            💡 {q.hint}
          </p>
        )}

        {/* Explanation after answer */}
        {answered && q.explanation && (
          <div
            className={`mt-4 p-3 rounded-xl text-[13px] leading-relaxed ${
              isCorrect
                ? "bg-green-50 border border-green-100 text-green-800"
                : "bg-red-50 border border-red-100 text-red-800"
            }`}
          >
            <span className="font-bold mr-1">{isCorrect ? "✅ Correct!" : "❌ Incorrect."}</span>
            {q.explanation}
          </div>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="self-end flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white font-bold rounded-xl text-[14px] hover:bg-black transition-colors"
        >
          {current + 1 >= questions.length ? "See Results" : "Next Question"}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonDetailPage() {
  const { lessonId, skill } = useParams() as { lessonId: string; skill: string };
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="sticky top-0 z-20 border-b border-gray-100 px-6 lg:px-12 pt-6 pb-4 flex items-start gap-4 bg-white shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0 mt-1"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            {lesson.skill?.name} · {lesson.chapter}
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Content — flows naturally, parent layout scrolls */}
      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Theory Blocks */}
          {Array.isArray(lesson.content) &&
            lesson.content.map((block, idx) => {
              const cfg = blockConfig[block.type] ?? blockConfig.section;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-6`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {cfg.icon}
                    <h3 className="font-extrabold text-[15px] text-gray-900 leading-tight">
                      {block.title || cfg.label}
                    </h3>
                  </div>
                  <div className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed pl-8">
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
                <div className="h-6 w-1 bg-[#FFC107] rounded-full" />
                <h2 className="text-[18px] font-extrabold text-gray-900">
                  Check Your Understanding
                </h2>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {lesson.quiz!.length} question{lesson.quiz!.length !== 1 ? "s" : ""}
                </span>
              </div>
              <LessonQuiz questions={lesson.quiz!} />
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="sticky bottom-0 z-20 border-t border-gray-100 px-6 lg:px-12 py-4 flex items-center justify-between bg-white shrink-0">
        <p className="text-[13px] text-gray-400 font-medium">
          {hasQuiz
            ? "Complete the quiz above, then try the exercises!"
            : "Review complete · Now try the exercises!"}
        </p>
        <button
          onClick={() => router.push(`/ielts/basic/${skill}/exercises`)}
          className="px-5 py-2 bg-[#FFC107] text-gray-900 font-bold rounded-xl text-[14px] hover:bg-[#E0A800] transition-colors"
        >
          Go to Exercises →
        </button>
      </div>
    </div>
  );
}
