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

interface MCMultipleQuestion {
  question_numbers: number[];
  text: string;
  options: MCOption[];
  answers: string[];
  num_correct: number;
  explanation: string;
  question_timestamps?: number[];   // optional per-question seek points
}

interface ContentGroup {
  type: string;
  questions: MCQuestion[];
  // For multiple_choice_multiple
  question_numbers?: number[];
  text?: string;
  options?: MCOption[];
  answers?: string[];
  num_correct?: number;
  explanation?: string;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onEnded = () => setPlaying(false);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("ended", onEnded);

    if (el.duration) setDuration(el.duration);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("ended", onEnded);
    };
  }, [audioRef]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-2 pr-5 gap-4">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center shadow-sm hover:bg-[#E0A800] transition-colors shrink-0"
      >
        {playing ? <Pause className="w-4 h-4 text-black fill-black" /> : <Play className="w-4 h-4 text-black fill-black ml-0.5" />}
      </button>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={handleSeek}
        className="flex-1 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#FFC107] hover:bg-gray-200 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#FFC107] [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FFC107] [&::-moz-range-thumb]:border-none"
      />

      <div className="text-[12px] font-semibold text-gray-400 tabular-nums shrink-0">
        <span className="text-gray-700">{formatTime(currentTime)}</span> / {formatTime(duration)}
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
    <div className="h-full overflow-y-auto pl-6 pr-4">
      <h2 className="text-base font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100 z-10">
        Audio Transcript
      </h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-gray-700 pb-24">
        {transcript.map((entry, idx) => {
          const isHighlighted = locatedQuestion !== null && entry.question_number === locatedQuestion;
          return (
            <div id={entry.question_number ? `transcript-q-${entry.question_number}` : undefined} key={idx} className={`flex gap-4 rounded-lg p-2 transition-colors duration-500 -ml-2 ${isHighlighted ? 'bg-[#FFF9E6]' : 'bg-transparent'}`}>
              {entry.speaker && (
                <span className="font-bold text-gray-900 shrink-0 w-28 uppercase text-[11px] tracking-wider text-right mt-1">
                  {entry.speaker}
                </span>
              )}
              <p className="flex-1">
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
    <span>
      {text.slice(0, idx)}
      <mark className="bg-[#FFF3C2] text-gray-900 font-medium rounded-md px-1.5 py-0.5 mx-0.5 leading-relaxed">
        <span className="bg-[#FFC107] text-black text-[10px] font-bold px-1.5 py-[2px] rounded-sm mr-1.5 relative -top-[1px] inline-block">
          Q{qNum}
        </span>
        {highlight}
      </mark>
      {text.slice(idx + highlight.length)}
    </span>
  );
}

// ─── Multiple Choice Multiple (Checkboxes) ───────────────────────────────────

function MCMultipleQuestionItem({
  group,
  selectedLetters,
  onToggle,
  submitted,
  audioRef,
  onLocate,
}: {
  group: MCMultipleQuestion;
  selectedLetters: string[];
  onToggle: (letter: string) => void;
  submitted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const numCorrect = group.num_correct ?? group.answers.length;
  const correctSet = new Set(group.answers.map((a) => a.toUpperCase()));
  const selectedSet = new Set(selectedLetters.map((s) => s.toUpperCase()));
  const allCorrect = submitted && group.answers.every((a) => selectedSet.has(a.toUpperCase())) && selectedLetters.length === group.answers.length;

  // Build a map: question_number → timestamp_seconds (if provided)
  const timestampMap: Record<number, number> = {};
  group.question_numbers?.forEach((n, i) => {
    const ts = group.question_timestamps?.[i];
    if (ts !== undefined) timestampMap[n] = ts;
  });

  const seekTo = (ts?: number) => {
    if (!audioRef.current) return;
    if (ts !== undefined) {
      audioRef.current.currentTime = ts;
    }
    audioRef.current.play();
  };

  const firstQNum = group.question_numbers?.[0];

  return (
    <div className="mb-7">
      {/* Question numbers badge row */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex gap-1 shrink-0 mt-0.5">
          {group.question_numbers?.map((n) => (
            <span key={n} id={`question-${n}`} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${
              submitted
                ? allCorrect ? "text-green-600" : "text-red-500"
                : "text-gray-600"
            }`}>
              {n}
            </span>
          ))}
        </div>
        <p className="text-[14px] font-semibold text-gray-900 leading-snug">{group.text}</p>
      </div>

      <p className="text-[12px] text-gray-400 mb-3 ml-0 font-medium">
        Choose <span className="font-bold text-gray-600">{numCorrect}</span> letters, A–{String.fromCharCode(64 + (group.options?.length ?? 5))}
      </p>

      <div className="space-y-2 ml-2">
        {group.options?.map((opt) => {
          const isSelected = selectedSet.has(opt.letter.toUpperCase());
          const isCorrectAnswer = correctSet.has(opt.letter.toUpperCase());

          let borderColor = "border-gray-300";
          let bgColor = "bg-white";
          let innerContent: React.ReactNode = null;

          if (submitted) {
            if (isCorrectAnswer && isSelected) {
              borderColor = "border-green-500";
              innerContent = <Check className="w-3 h-3 text-green-500" />;
            } else if (isCorrectAnswer && !isSelected) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50";
              innerContent = <Check className="w-3 h-3 text-green-400" />;
            } else if (!isCorrectAnswer && isSelected) {
              borderColor = "border-red-400";
              innerContent = <X className="w-3 h-3 text-red-400" />;
            }
          } else {
            if (isSelected) {
              borderColor = "border-[#FFC107]";
              innerContent = <Check className="w-3 h-3 text-[#FFC107]" />;
            }
          }

          return (
            <button
              key={opt.letter}
              disabled={submitted}
              onClick={() => {
                if (!submitted) {
                  // Enforce max selections
                  if (!isSelected && selectedLetters.length >= numCorrect) return;
                  onToggle(opt.letter);
                }
              }}
              className={`flex items-center gap-3 text-left text-[14px] text-gray-700 w-full outline-none focus:outline-none ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className={`w-[18px] h-[18px] rounded border-2 ${borderColor} ${bgColor} flex items-center justify-center shrink-0 transition-all`}>
                {innerContent}
              </span>
              <span className={
                submitted && isCorrectAnswer ? "font-semibold text-green-700" :
                submitted && isSelected && !isCorrectAnswer ? "text-red-500 line-through" : ""
              }>
                <span className="font-bold mr-1.5">{opt.letter}.</span>{opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post-submit action buttons — one row per question number */}
      {submitted && (
        <div className="ml-2 mt-3 space-y-2">
          {group.question_numbers?.map((qNum) => (
            <div key={qNum} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{qNum}</span>
              <button onClick={() => seekTo(timestampMap[qNum])} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button onClick={() => onLocate(qNum)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
            </div>
          ))}
        </div>
      )}

      {showExplanation && group.explanation && (
        <div className="mt-2 ml-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-[13px] text-blue-800 leading-relaxed">
          {group.explanation}
        </div>
      )}
    </div>
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
      <p className="text-[14px] font-semibold text-gray-900 mb-3 leading-snug flex items-start">
        <span className={`inline-block mr-2 font-bold ${submitted
          ? isCorrect ? "text-green-600" : "text-red-500"
          : "text-gray-900"
          }`}>
          {q.question_number}.
        </span>
        {q.text}
      </p>

      <div className="space-y-2 ml-8">
        {q.options.map((opt) => {
          const isSelected = selected?.toUpperCase() === opt.letter.toUpperCase();
          const isAnswerKey = q.answer?.toUpperCase() === opt.letter.toUpperCase();
          let circleClass = "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ";
          let innerContent = null;

          if (submitted) {
            if (isAnswerKey) {
              circleClass += "border-green-500 bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-green-500" />;
            } else if (isSelected && !isAnswerKey) {
              circleClass += "border-red-400 bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-red-400" />;
            } else {
              circleClass += "border-gray-300 bg-white";
            }
          } else {
            if (isSelected) {
              circleClass += "border-[#FFC107] bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-[#FFC107]" />;
            } else {
              circleClass += "border-gray-300 hover:border-gray-400 bg-white";
            }
          }

          return (
            <button
              key={opt.letter}
              disabled={submitted}
              onClick={() => onSelect(opt.letter)}
              className={`flex items-center gap-2.5 text-left text-[14px] text-gray-700 w-full outline-none focus:outline-none group ${submitted ? "cursor-default" : "cursor-pointer hover:text-gray-900"}`}
            >
              <span className={circleClass}>
                {innerContent}
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

  // All question numbers across all group types (for tracker + score)
  const allTrackerItems: { qNum: number; groupKey: string }[] = exercise?.content?.flatMap((g, gi) => {
    if (g.type === "multiple_choice_multiple") {
      const nums = (g.question_numbers as number[] | undefined) ?? [];
      return nums.map((n) => ({ qNum: n, groupKey: `mcm-${gi}` }));
    }
    const qs = Array.isArray(g.questions) ? (g.questions as MCQuestion[]) : [];
    return qs.map((q) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
  }) ?? [];

  const handleSubmit = () => {
    setSubmitted(true);
    setShowTranscript(true);
  };

  const handleLocate = useCallback((qNum: number) => {
    setLocatedQuestion(qNum);
    const el = document.getElementById(`transcript-q-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
    ? (() => {
        let s = 0;
        exercise?.content?.forEach((g, gi) => {
          if (g.type === "multiple_choice_multiple") {
            const answers_arr = (g.answers as string[] | undefined) ?? [];
            const key = `mcm-${gi}`;
            const raw = (answers[key] as unknown as string) ?? "";
            const selected = raw ? raw.split(",").map((x) => x.toUpperCase()) : [];
            const correct = new Set(answers_arr.map((a) => a.toUpperCase()));
            const isCorrect = selected.length === correct.size && selected.every((s) => correct.has(s));
            if (isCorrect) s++;
          } else {
            const qs = Array.isArray(g.questions) ? (g.questions as MCQuestion[]) : [];
            qs.forEach((q) => {
              if (answers[q.question_number]?.toUpperCase() === q.answer?.toUpperCase()) s++;
            });
          }
        });
        return s;
      })()
    : 0;

  const modalBlock = activeModal
    ? lessonBlocks.find((b) => b.type === activeModal) ?? { type: activeModal, content: "_No content available for this section._" }
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] min-h-[600px] relative bg-white -m-6 lg:-m-10 rounded-2xl">

      {/* ── Header ── */}
      <div className="border-b border-gray-100 px-6 lg:px-10 pt-6 pb-3">
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
        <div className="mt-2">
          <AudioPlayer src={exercise.audioUrl} audioRef={audioRef} />
        </div>
      </div>

      {/* ── Body (split layout after submit) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Questions */}
        <div className={`overflow-y-auto px-6 lg:px-10 pt-3 pb-24 transition-all duration-300 ${showTranscript ? "w-1/2 border-r border-gray-100" : "w-full"}`}>
          {exercise.content.map((group, gi) => {
            // --- multiple_choice_multiple (checkbox multi-answer) ---
            if (group.type === "multiple_choice_multiple") {
              const mcmGroup = group as unknown as MCMultipleQuestion;
              const key = `mcm-${gi}`;
              const rawSelected: string = (answers[key] as unknown as string) ?? "";
              const selectedLetters: string[] = rawSelected ? rawSelected.split(",") : [];

              const handleToggle = (letter: string) => {
                const upper = letter.toUpperCase();
                const next = selectedLetters.includes(upper)
                  ? selectedLetters.filter((l) => l !== upper)
                  : [...selectedLetters, upper];
                setAnswers((prev) => ({ ...prev, [key]: next.join(",") as unknown as string }));
              };

              return (
                <div key={gi}>
                  <MCMultipleQuestionItem
                    group={mcmGroup}
                    selectedLetters={selectedLetters}
                    onToggle={handleToggle}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- standard multiple_choice ---
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
          <div className="w-1/2 overflow-hidden py-3 pr-6 lg:pr-10">
            <TranscriptPanel transcript={exercise.transcript} locatedQuestion={locatedQuestion} />
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 lg:px-10 py-3 flex items-center justify-between z-10 transition-all rounded-b-2xl">
        {/* Question pagination */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span>Questions</span>
          <div className="flex flex-wrap items-center gap-1 ml-1 max-w-[60vw]">
            {allTrackerItems.map(({ qNum, groupKey }) => {
              const isAnswered = !!answers[groupKey] || !!answers[qNum];
              return (
                <button
                  key={qNum}
                  onClick={() => document.getElementById(`question-${qNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="w-7 h-9 flex flex-col items-center justify-between text-[13px] font-bold transition-all pt-1 text-gray-700 hover:bg-gray-50 outline-none focus:outline-none"
                >
                  <div className={`w-4 h-[3px] rounded-full transition-colors ${isAnswered ? 'bg-[#4CAF50]' : 'bg-gray-200'}`} />
                  <span className="mb-0.5">{qNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {submitted ? (
            <span className="text-sm font-bold text-[#111] bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              {score}/{allTrackerItems.length} correct
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
