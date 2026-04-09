"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Flag, Bookmark, FileText, ChevronLeft, ChevronRight, Check, Headphones, MapPin, MessageSquare, StickyNote, Play, Pause, AlertCircle, Lightbulb, Info, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FormPoint, FormCompletionGroup } from "../components/renderers/FormCompletionGroup";
import { TableGroup, TableCompletionGroup } from "../components/renderers/TableCompletionGroup";
import { FlowChartGroup, FlowChartCompletionGroup } from "../components/renderers/FlowChartCompletionGroup";
import { MCOption, MCQuestion, MCQuestionItem } from "../components/renderers/MCQuestionItem";
import { MCMultipleQuestion, MCMultipleQuestionItem } from "../components/renderers/MCMultipleQuestionItem";
import { SummaryGroup, SummaryCompletionGroup } from "../components/renderers/SummaryCompletionGroup";
import { MatchingGroup, MatchingCompletionGroup } from "../components/renderers/MatchingGroup";
import { MapLabellingGroupType, MapLabellingGroup } from "../components/renderers/MapLabellingGroup";
import { DiagramLabellingGroupType, DiagramLabellingGroup } from "../components/renderers/DiagramLabellingGroup";
import { ShortAnswerGroupType, ShortAnswerGroup } from "../components/renderers/ShortAnswerGroup";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TranscriptEntry {
  speaker: string;
  text: string;
  question_number?: number;
  highlight_text?: string;
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
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
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
    if (!g.type && Array.isArray((g as any).points)) {
      // form_completion group
      return ((g as any).points as FormPoint[]).map((p) => ({ qNum: p.question_number, groupKey: String(p.question_number) }));
    }
    if (g.type === "table") {
      // table completion — extract question numbers from rows[].questions
      const rows = (g as unknown as TableGroup).rows;
      return rows.flatMap((row) =>
        Object.keys(row.questions).map((k) => ({ qNum: Number(k), groupKey: k }))
      );
    }
    if (g.type === "flow_chart") {
      const fc = g as unknown as FlowChartGroup;
      return fc.steps
        .filter((s) => s.question)
        .map((s) => ({ qNum: s.question!.question_number, groupKey: String(s.question!.question_number) }));
    }
    if (g.type === "summary_completion") {
      const sg = g as unknown as SummaryGroup;
      return Object.keys(sg.questions).map(k => ({ qNum: Number(k), groupKey: k }));
    }
    if (g.type === "matching") {
      const mg = g as unknown as MatchingGroup;
      return mg.items.map(i => ({ qNum: i.id, groupKey: String(i.id) }));
    }
    if (g.type === "map_labelling" || g.type === "plan_labelling") {
      const ml = g as unknown as MapLabellingGroupType;
      if (ml.items) return ml.items.map(i => ({ qNum: i.question_number, groupKey: String(i.question_number) }));
      const qs = (g as any).questions || [];
      return qs.map((q: any) => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
    }
    if (g.type === "diagram_labelling") {
      const dg = g as unknown as DiagramLabellingGroupType;
      return dg.items.map(i => ({ qNum: i.question_number, groupKey: String(i.question_number) }));
    }
    if (g.type === "short_answer") {
      const qs = (g as unknown as ShortAnswerGroupType).questions;
      return qs.map(q => ({ qNum: q.question_number, groupKey: String(q.question_number) }));
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
        } else if (g.type === "table") {
          const rows = (g as unknown as TableGroup).rows;
          rows.forEach((row) => {
            Object.entries(row.questions).forEach(([k, qData]) => {
              const userAns = (answers[Number(k)] as unknown as string ?? "").trim().toLowerCase();
              if (userAns === qData.answer.trim().toLowerCase()) s++;
            });
          });
        } else if (g.type === "flow_chart") {
          const fc = g as unknown as FlowChartGroup;
          fc.steps.filter((step) => step.question).forEach((step) => {
            const q = step.question! as unknown as { question_number: number, letter_answer?: string, text_answer?: string };
            const userAns = (answers[q.question_number] as string ?? "");
            if (q.letter_answer && userAns.toUpperCase() === q.letter_answer.toUpperCase()) s++;
            else if (!q.letter_answer && q.text_answer && userAns.trim().toLowerCase() === q.text_answer.trim().toLowerCase()) s++;
          });
        } else if (!g.type && Array.isArray((g as any).points)) {
          ((g as any).points as FormPoint[]).forEach((p) => {
            const userAns = (answers[p.question_number] as unknown as string ?? "").trim().toLowerCase();
            if (userAns === p.answer.trim().toLowerCase()) s++;
          });
        } else if (g.type === "summary_completion") {
          const sg = g as unknown as SummaryGroup;
          Object.entries(sg.questions).forEach(([k, qData]) => {
            const userAns = (answers[Number(k)] as unknown as string ?? "").trim().toLowerCase();
            const acceptable = qData.acceptable_answers ? qData.acceptable_answers.map(a => a.toLowerCase().trim()) : [qData.primary_answer.toLowerCase().trim()];
            if (acceptable.includes(userAns)) s++;
          });
        } else if (g.type === "matching") {
          const mg = g as unknown as MatchingGroup;
          Object.entries(mg.answers).forEach(([k, qData]) => {
            const userAns = (answers[Number(k)] as string ?? "").toUpperCase();
            if (userAns === qData.letter.toUpperCase()) s++;
          });
        } else if (g.type === "map_labelling" || g.type === "plan_labelling") {
          const ml = g as unknown as MapLabellingGroupType;
          if (ml.items) {
            ml.items.forEach((item) => {
              const userAns = (answers[item.question_number] as string ?? "").toUpperCase();
              if (userAns === item.answer.toUpperCase()) s++;
            });
          } else if ((g as any).questions) {
            (g as any).questions.forEach((q: any) => {
              const userAns = (answers[q.question_number] as string ?? "").trim().toLowerCase();
              const acceptable = q.acceptable_answers ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim()) : [q.answer.toLowerCase().trim()];
              if (acceptable.includes(userAns)) s++;
            });
          }
        } else if (g.type === "diagram_labelling") {
          const dg = g as unknown as DiagramLabellingGroupType;
          dg.items.forEach((item) => {
            const userAns = (answers[item.question_number] as string ?? "").toUpperCase();
            if (userAns === item.answer.toUpperCase()) s++;
          });
        } else if (g.type === "short_answer") {
          const sg = g as unknown as ShortAnswerGroupType;
          sg.questions.forEach((q) => {
            const userAns = (answers[q.question_number] as string ?? "").trim().toLowerCase();
            const acceptable = q.acceptable_answers
              ? q.acceptable_answers.map(a => a.toLowerCase().trim())
              : [q.answer.toLowerCase().trim()];
            if (acceptable.includes(userAns)) s++;
          });
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
            // --- form / note completion ---
            if (!group.type && Array.isArray((group as any).points)) {
              const pts = (group as any).points as FormPoint[];
              const heading = (group as any).heading as string ?? "";
              return (
                <div key={gi}>
                  <FormCompletionGroup
                    heading={heading}
                    points={pts}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- flow chart completion ---
            if (group.type === "flow_chart") {
              const fc = group as unknown as FlowChartGroup;
              return (
                <div key={gi}>
                  <FlowChartCompletionGroup
                    group={fc}
                    answers={answers}
                    onAnswer={(qNum, letter) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: letter }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- table completion ---
            if (group.type === "table") {
              const tg = group as unknown as TableGroup;
              return (
                <div key={gi}>
                  <TableCompletionGroup
                    group={tg}
                    answers={answers as Record<number, string>}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val as unknown as string }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- summary completion ---
            if (group.type === "summary_completion") {
              const sg = group as unknown as SummaryGroup;
              return (
                <div key={gi}>
                  <SummaryCompletionGroup
                    group={sg}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- matching ---
            if (group.type === "matching") {
              const mg = group as unknown as MatchingGroup;
              return (
                <div key={gi}>
                  <MatchingCompletionGroup
                    group={mg}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- map/plan labelling ---
            if (group.type === "map_labelling" || group.type === "plan_labelling") {
              const ml = group as unknown as MapLabellingGroupType;
              return (
                <div key={gi}>
                  <MapLabellingGroup
                    group={ml}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- diagram labelling ---
            if (group.type === "diagram_labelling") {
              const dg = group as unknown as DiagramLabellingGroupType;
              return (
                <div key={gi}>
                  <DiagramLabellingGroup
                    group={dg}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

            // --- short answer ---
            if (group.type === "short_answer") {
              const sg = group as unknown as ShortAnswerGroupType;
              return (
                <div key={gi}>
                  <ShortAnswerGroup
                    group={sg}
                    answers={answers}
                    onAnswer={(qNum, val) => !submitted && setAnswers((prev) => ({ ...prev, [qNum]: val }))}
                    submitted={submitted}
                    audioRef={audioRef}
                    onLocate={handleLocate}
                  />
                </div>
              );
            }

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
