"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Flag, Bookmark, FileText, ChevronLeft, ChevronRight, Check, Headphones, MapPin, MessageSquare, StickyNote, Play, Pause, AlertCircle, Lightbulb, Info, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TranscriptEntry {
  speaker: string;
  text: string;
  question_number?: number;
  highlight_text?: string;
}

interface MCOption {
  letter: string;
  text: string;
}

interface MCQuestion {
  question_number: number;
  text: string;
  options: MCOption[];
  answer: string;
  timestamp_seconds: number;
  explanation: string;
}

interface ContentGroup {
  type: string;
  questions: MCQuestion[];
  // For table/map/other types - stored as-is for now
  [key: string]: unknown;
}

interface Exercise {
  id: string;
  topic: string;
  instructions?: string;
  audioUrl: string;
  transcript: TranscriptEntry[];
  content: ContentGroup[];
}

interface LessonBlock {
  type: "traps" | "strategy" | "tips" | "section" | "overview" | string;
  title?: string;
  content: string;
}

// ─── Theory Modal ─────────────────────────────────────────────────────────────

function TheoryPopup({ block, onClose }: { block: LessonBlock; onClose: () => void }) {
  const config = {
    traps: {
      bg: "bg-[#FFF0F0]",
      border: "border-[#FFE1E1]",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      default: "The Common Traps",
    },
    strategy: {
      bg: "bg-[#FFF9E6]",
      border: "border-[#FFF0C2]",
      icon: <Lightbulb className="w-5 h-5 text-[#E0A800]" />,
      default: "The Step-by-Step Strategy",
    },
    tips: {
      bg: "bg-[#F0F7FF]",
      border: "border-[#DCEBFF]",
      icon: <Info className="w-5 h-5 text-[#3B82F6]" />,
      default: "Pro-Tips for Test Day",
    },
  } as Record<string, { bg: string; border: string; icon: React.ReactNode; default: string }>;

  const c = config[block.type] ?? config.tips;

  return (
    <div
      className={`absolute top-[48px] right-0 z-50 w-[550px] max-w-[90vw] max-h-[70vh] overflow-y-auto rounded-2xl border ${c.bg} ${c.border} p-6 shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {c.icon}
          <h3 className="font-bold text-[15px] text-gray-900">
            {block.title || c.default}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm prose-gray max-w-none text-gray-800 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
      </div>
    </div>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function AudioPlayer({ src, audioRef }: { src: string; audioRef: React.RefObject<HTMLAudioElement> }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime / (el.duration || 1));
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => { el.removeEventListener("timeupdate", onTime); el.removeEventListener("ended", onEnded); };
  }, [audioRef]);

  const bars = Array.from({ length: 80 }, (_, i) => i);

  return (
    <div className="flex items-center p-2 gap-4">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center shadow-md hover:bg-[#E0A800] transition-colors shrink-0"
      >
        {playing ? <Pause className="w-4 h-4 text-black fill-black" /> : <Play className="w-4 h-4 text-black fill-black ml-0.5" />}
      </button>

      {/* Waveform bars */}
      <div className="flex-1 flex items-center justify-between h-8 overflow-hidden pr-3">
        {bars.map((i) => {
          const filled = progress > 0 && i / bars.length < progress;
          const heights = [3, 5, 8, 6, 10, 7, 12, 9, 6, 11, 8, 5, 9, 7, 13, 6, 8, 10, 5, 9, 7, 11, 6, 8, 10, 5, 7, 9, 6, 8, 5, 4];
          const h = heights[i % heights.length];
          return (
            <div
              key={i}
              className={`w-[3px] rounded-full transition-all ${filled ? "bg-[#FFC107]" : playing ? "bg-[#FFC107]" : "bg-[#FFD97D]"}`}
              style={{
                height: `${h * 2}px`,
                animation: playing ? `waveform 0.8s ease-in-out infinite` : "none",
                animationDelay: playing ? `${(i % 8) * 0.1}s` : `${(i * 0.05) % 1}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Transcript Panel ─────────────────────────────────────────────────────────

function TranscriptPanel({
  transcript,
  locatedQuestion,
}: {
  transcript: TranscriptEntry[];
  locatedQuestion: number | null;
}) {
  return (
    <div className="h-full overflow-y-auto pl-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100">
        Audio Transcript
      </h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-gray-700 pb-8">
        {transcript.map((entry, idx) => {
          const isHighlighted = locatedQuestion !== null && entry.question_number === locatedQuestion;
          return (
            <div key={idx} className="flex gap-2">
              {entry.speaker && (
                <span className="font-bold text-gray-900 shrink-0 min-w-[3.5rem] uppercase text-xs mt-0.5">
                  {entry.speaker}:
                </span>
              )}
              <p className={isHighlighted ? "bg-yellow-100 rounded px-1" : ""}>
                {entry.highlight_text && entry.question_number ? (
                  renderTranscriptWithHighlight(entry.text, entry.highlight_text, entry.question_number)
                ) : (
                  entry.text
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderTranscriptWithHighlight(text: string, highlight: string, qNum: number) {
  const idx = text.indexOf(highlight);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="inline-flex items-center gap-1">
        <span className="bg-[#FFC107] text-black text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
          Q{qNum}
        </span>
        <span className="bg-yellow-100 text-gray-900 font-medium rounded px-0.5">{highlight}</span>
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

// ─── Multiple Choice Question ─────────────────────────────────────────────────

function MCQuestionItem({
  q,
  selected,
  onSelect,
  submitted,
  audioRef,
  onLocate,
}: {
  q: MCQuestion;
  selected: string | null;
  onSelect: (letter: string) => void;
  submitted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const isCorrect = selected?.toUpperCase() === q.answer?.toUpperCase();

  const seekTo = () => {
    if (audioRef.current && q.timestamp_seconds) {
      audioRef.current.currentTime = q.timestamp_seconds;
      audioRef.current.play();
    }
  };

  return (
    <div id={`question-${q.question_number}`} className="mb-7">
      <p className="text-[14px] font-semibold text-gray-900 mb-3 leading-snug">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded mr-2 text-xs font-bold border ${submitted
          ? isCorrect ? "bg-green-500 text-white border-green-500" : "bg-red-400 text-white border-red-400"
          : "bg-white text-gray-700 border-gray-300"
          }`}>
          {q.question_number}
        </span>
        {q.text}
      </p>

      <div className="space-y-2 ml-8">
        {q.options.map((opt) => {
          const isSelected = selected?.toUpperCase() === opt.letter.toUpperCase();
          const isAnswerKey = q.answer?.toUpperCase() === opt.letter.toUpperCase();

          let circleClass = "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ";
          if (submitted) {
            if (isAnswerKey) circleClass += "bg-green-500 border-green-500";
            else if (isSelected && !isAnswerKey) circleClass += "bg-red-400 border-red-400";
            else circleClass += "border-gray-300";
          } else {
            circleClass += isSelected ? "border-[#FFC107] bg-[#FFC107]" : "border-gray-300 hover:border-gray-400";
          }

          return (
            <button
              key={opt.letter}
              disabled={submitted}
              onClick={() => onSelect(opt.letter)}
              className={`flex items-center gap-2.5 text-left text-[13px] text-gray-700 w-full group ${submitted ? "cursor-default" : "cursor-pointer hover:text-gray-900"}`}
            >
              <span className={circleClass}>
                {submitted && isAnswerKey && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className={
                submitted && isAnswerKey ? "font-semibold text-green-700" :
                  submitted && isSelected && !isAnswerKey ? "text-red-500 line-through" :
                    ""
              }>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post-submit action buttons */}
      {submitted && (
        <div className="ml-8 mt-3 flex flex-wrap gap-2">
          <button onClick={seekTo} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <Headphones className="w-3.5 h-3.5" /> Listen from here
          </button>
          <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <MapPin className="w-3.5 h-3.5" /> Locate
          </button>
          <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Explain
          </button>
          <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <StickyNote className="w-3.5 h-3.5" /> Note
          </button>
        </div>
      )}

      {showExplanation && (
        <div className="ml-8 mt-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
          {q.explanation}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ListeningExercisePage() {
  const { exerciseId } = useParams();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<"traps" | "strategy" | "tips" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const exRes = await axios.get(`http://localhost:3000/api/v1/ielts/listening-exercises/${exerciseId}`);
        setExercise(exRes.data);

        // Fetch lesson theory blocks for the popups
        if (lessonId) {
          const lessonRes = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
          const blocks: LessonBlock[] = Array.isArray(lessonRes.data.content)
            ? lessonRes.data.content.filter((b: LessonBlock) =>
              ["traps", "strategy", "tips"].includes(b.type)
            )
            : [];
          setLessonBlocks(blocks);
        }
      } catch (err) {
        console.error("Failed to fetch exercise:", err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) fetchData();
  }, [exerciseId, lessonId]);


  const allQuestions = exercise?.content?.flatMap((g) =>
    Array.isArray(g.questions) ? (g.questions as MCQuestion[]) : []
  ) ?? [];

  const handleSubmit = () => {
    setSubmitted(true);
    setShowTranscript(true);
  };

  const handleLocate = useCallback((qNum: number) => {
    setLocatedQuestion(qNum);
    setTimeout(() => setLocatedQuestion(null), 3000);
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 font-medium animate-pulse">
        Loading exercise...
      </div>
    );
  }

  if (!exercise) {
    return <div className="flex items-center justify-center h-full text-red-500 font-bold">Exercise not found.</div>;
  }

  const score = submitted
    ? allQuestions.filter((q) => answers[q.question_number]?.toUpperCase() === q.answer?.toUpperCase()).length
    : 0;

  const modalBlock = activeModal
    ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available for this section._" }
    : null;

  return (
    <div className="flex flex-col h-full relative bg-white">

      {/* ── Header ── */}
      <div className="border-b border-gray-100 px-6 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{exercise.topic}</h1>
          </div>
          <div className="relative flex items-center gap-2 mt-1">
            <button
              onClick={() => setActiveModal(activeModal === "traps" ? null : "traps")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "traps" ? "bg-red-200" : "bg-red-50 hover:bg-red-100"}`}
              title="Common Traps"
            >
              <Flag className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={() => setActiveModal(activeModal === "strategy" ? null : "strategy")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "strategy" ? "bg-yellow-200" : "bg-yellow-50 hover:bg-yellow-100"}`}
              title="Step-by-Step Strategy"
            >
              <Bookmark className="w-4 h-4 text-yellow-500" />
            </button>
            <button
              onClick={() => setActiveModal(activeModal === "tips" ? null : "tips")}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModal === "tips" ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100"}`}
              title="Pro-Tips for Test Day"
            >
              <FileText className="w-4 h-4 text-blue-500" />
            </button>

            {/* ── Theory Popup ── */}
            {modalBlock && (
              <TheoryPopup block={modalBlock} onClose={() => setActiveModal(null)} />
            )}
          </div>
        </div>

        {/* Audio player */}
        <div className="mt-4">
          <AudioPlayer src={exercise.audioUrl} audioRef={audioRef} />
        </div>
      </div>

      {/* ── Body (split layout after submit) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Questions */}
        <div className={`overflow-y-auto px-6 py-5 pb-24 transition-all duration-300 ${showTranscript ? "w-1/2 border-r border-gray-100" : "w-full"}`}>
          {exercise.content.map((group, gi) => {
            const questions = (Array.isArray(group.questions) ? group.questions : []) as MCQuestion[];
            const qNums = questions.map((q) => q.question_number);
            const rangeLabel = qNums.length > 0
              ? `Questions ${Math.min(...qNums)}–${Math.max(...qNums)}`
              : `Part ${gi + 1}`;

            return (
              <div key={gi}>
                <p className="text-[13px] font-bold text-gray-900 mb-0.5">{rangeLabel}</p>
                <p className="text-[13px] text-gray-500 mb-5">
                  {exercise.instructions || (group as any).instruction || "Choose the correct letter."}
                </p>

                {group.type === "multiple_choice" ? (
                  questions.map((q) => (
                    <div id={`question-${q.question_number}`} key={q.question_number}>
                      <MCQuestionItem
                        q={q}
                        selected={answers[q.question_number] ?? null}
                        onSelect={(letter) => !submitted && setAnswers((prev) => ({ ...prev, [q.question_number]: letter }))}
                        submitted={submitted}
                        audioRef={audioRef}
                        onLocate={handleLocate}
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-500">
                    [{group.type}] renderer coming soon.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Transcript */}
        {showTranscript && exercise.transcript && (
          <div className="w-1/2 overflow-hidden py-5">
            <TranscriptPanel transcript={exercise.transcript} locatedQuestion={locatedQuestion} />
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-10 transition-all">
        {/* Question pagination */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span>Questions</span>
          <div className="flex flex-wrap items-center gap-1 ml-1 max-w-[60vw]">
            {allQuestions.map((q) => {
              const isAnswered = !!answers[q.question_number];
              return (
                <button
                  key={q.question_number}
                  onClick={() => document.getElementById(`question-${q.question_number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${isAnswered
                    ? "bg-[#111] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {q.question_number}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {submitted ? (
            <span className="text-sm font-bold text-[#111] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              {score}/{allQuestions.length} correct
            </span>
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
