"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import { notesApi, type QuestionNote } from "@/services/notes.api";
import { Calendar, Clock, ChevronDown, ChevronUp, Play, Pause, Volume2, SkipBack, SkipForward, Headphones, MapPin, Lightbulb, StickyNote } from "lucide-react";
import { extractAllItemsFromPart, type NormalizedItem } from "@/lib/exam-parser";
// ─────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Band score helpers
// ─────────────────────────────────────────────────────────────
function getIeltsBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

function getIeltsReadingBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}


function bandColor(band: number) {
  if (band >= 8.0) return { shield: "#22c55e", shieldDark: "#16a34a", bg: "bg-green-50", text: "text-green-700" };
  if (band >= 6.5) return { shield: "#3b82f6", shieldDark: "#1d4ed8", bg: "bg-blue-50", text: "text-blue-700" };
  if (band >= 5.0) return { shield: "#f59e0b", shieldDark: "#d97706", bg: "bg-amber-50", text: "text-amber-700" };
  return { shield: "#ef4444", shieldDark: "#b91c1c", bg: "bg-red-50", text: "text-red-700" };
}

// ─────────────────────────────────────────────────────────────
// Extract correct answers
// ─────────────────────────────────────────────────────────────
function extractCorrectAnswers(obj: any, map: Map<string, any>) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractCorrectAnswers(x, map));
  } else {
    if ("question_number" in obj && "answer" in obj) {
      map.set(String(obj.question_number), obj.answer);
    } else if ("question_numbers" in obj && "answer" in obj) {
      let ans = obj.answer;
      if (typeof ans === "string" && ans.includes(",")) {
        ans = ans.split(",").map(s => s.trim());
      }
      for (const n of obj.question_numbers as number[]) {
        map.set(String(n), ans);
      }
    } else {
      Object.values(obj).forEach((v) => extractCorrectAnswers(v, map));
    }
  }
}

// Extract timestamps per question number
function extractTimestamps(obj: any, map: Map<string, number>) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractTimestamps(x, map));
  } else {
    if ("question_number" in obj && "timestamp_seconds" in obj) {
      map.set(String(obj.question_number), obj.timestamp_seconds);
    } else if ("question_numbers" in obj && "timestamp_seconds" in obj) {
      for (const n of (obj.question_numbers as number[])) {
        map.set(String(n), obj.timestamp_seconds);
      }
    } else {
      Object.values(obj).forEach((v) => extractTimestamps(v, map));
    }
  }
}

function normalizeAnswer(a: any): string {
  if (!a) return "";
  if (Array.isArray(a)) return a.filter(Boolean).join(", ");
  return String(a);
}

function isCorrect(user: any, correct: any): boolean {
  const un = normalizeAnswer(user).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!un) return false;
  const arr = Array.isArray(correct) ? correct : [String(correct)];
  for (const c of arr) {
    const variants: string[] = [];
    const parts = String(c).split("/").map((p) => p.trim());
    for (const p of parts) {
      const m = p.match(/^(.*?)\((.*?)\)(.*)$/);
      if (m) {
        variants.push((m[1] + m[3]).trim());
        variants.push((m[1] + m[2] + m[3]).trim());
      } else {
        variants.push(p);
      }
    }
    for (const v of variants) {
      if (un === v.toLowerCase().replace(/[^a-z0-9]/g, "")) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────
function Breadcrumbs() {
  const items = [
    { label: "Homepage", href: "/" },
    { label: "IELTS", href: "/ielts" },
    { label: "Intensive IELTS", href: "/ielts/intensive" },
    { label: "Test History", href: "/ielts/history" },
    { label: "Result" },
  ];
  return (
    <nav className="text-sm font-semibold text-gray-700 flex items-center flex-wrap gap-2">
      {items.map((it, idx) => {
        const last = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-2">
            {last ? (
              <span className="text-primary">{it.label}</span>
            ) : (
              <Link href={it.href!} className="hover:text-gray-900 transition-colors">{it.label}</Link>
            )}
            {!last && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
          </span>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Band Score Badge
// ─────────────────────────────────────────────────────────────
function BandShield({ band, rawScore, maxScore, color }: { band: number; rawScore: number; maxScore: number; color: ReturnType<typeof bandColor> }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[160px] h-[160px] flex flex-col items-center justify-center shrink-0">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          {/* Base Hexagon */}
          <polygon fill={color.shield} points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
          {/* Subtle 3D Left-Side Highlight */}
          <polygon fill="white" fillOpacity="0.15" points="50,5 11,27.5 11,72.5 50,95 50,5" />
          {/* Inner Decorative Hexagon */}
          <polygon fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinejoin="round" points="50,14 81,32 81,68 50,86 19,68 19,32" />
        </svg>
        <span className="relative z-10 text-[54px] font-black text-white leading-none tracking-tighter drop-shadow-md mt-1.5">
          {band.toFixed(1)}
        </span>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text} border border-current border-opacity-10 opacity-70`}>
        {rawScore} / {maxScore}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Answer Sheet Column
// ─────────────────────────────────────────────────────────────
function AnswerColumn({ partLabel, range, correctMap, userAnswers }: {
  partLabel: string; range: [number, number];
  correctMap: Map<string, any>; userAnswers: Record<string, any>;
}) {
  const rows = [];
  for (let n = range[0]; n <= range[1]; n++) {
    const key = String(n);
    const userAns = userAnswers[key];
    const correctAns = correctMap.get(key);
    const correct = correctAns !== undefined ? isCorrect(userAns, correctAns) : null;
    const displayUser = normalizeAnswer(userAns) || "—";
    const displayCorrect = normalizeAnswer(correctAns);

    rows.push(
      <div key={n} className="flex items-start gap-3 py-1 group">
        <span className="w-5 text-[13px] font-bold text-slate-400 shrink-0 pt-0.5 text-right">{n}.</span>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {correct === true ? (
            <span className="text-[14px] font-bold text-emerald-600">
              {displayUser}
            </span>
          ) : correct === null ? (
            <span className="text-[14px] font-medium text-slate-500">
              {displayUser}
            </span>
          ) : (
            <>
              <span className="text-[14px] font-bold text-[#ef4444] line-through decoration-[#ef4444]/60 decoration-2">
                {displayUser}
              </span>
              <div className="relative inline-flex items-center bg-[#ef4444] text-white text-[13px] font-bold px-2.5 py-0.5 rounded-[4px] ml-1">
                <div className="absolute -left-[4px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[5px] border-r-[#ef4444]"></div>
                {displayCorrect}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 pl-[32px]">{partLabel}</div>
      <div className="flex flex-col gap-1.5">{rows}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Audio Player
// ─────────────────────────────────────────────────────────────
function AudioPlayer({ audioUrl, audioRef }: { audioUrl: string; audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const skip = (secs: number) => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + secs);
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = frac * duration;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl">
      <audio ref={audioRef as React.RefObject<HTMLAudioElement>} src={audioUrl} preload="metadata" />

      {/* Controls row */}
      <div className="flex items-center gap-4">
        <button onClick={() => skip(-5)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          <SkipBack className="w-4 h-4" /> 5s
        </button>
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-yellow-400 transition-colors"
        >
          {playing ? <Pause className="w-5 h-5 text-gray-900" /> : <Play className="w-5 h-5 text-gray-900 ml-0.5" />}
        </button>
        <button onClick={() => skip(5)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          5s <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress + time */}
      <div className="w-full flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 w-10 text-right">{fmt(currentTime)}</span>
        <div
          ref={progressRef}
          onClick={seekTo}
          className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
        >
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-mono text-gray-500 w-10">{fmt(duration)}</span>
        <Volume2 className="w-4 h-4 text-gray-400 ml-1" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Part tab icons
// ─────────────────────────────────────────────────────────────
const PartIcons = [
  // P1: two people
  <svg key="p1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <circle cx="9" cy="7" r="3" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="18" cy="7" r="2.5" /><path d="M22 21v-1.5a3.5 3.5 0 0 0-2-3.18" />
  </svg>,
  // P2: single person lecturing
  <svg key="p2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <circle cx="12" cy="7" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" />
  </svg>,
  // P3: chat bubbles
  <svg key="p3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>,
  // P4: presentation board
  <svg key="p4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M3 4h18v12H3z" /><path d="M12 16v4M8 20h8" />
  </svg>,
];

// ─────────────────────────────────────────────────────────────
// NoteEditor – per-question note with save
// ─────────────────────────────────────────────────────────────
function NoteEditor({
  questionNumber, examId, userId, initialNote,
  onSaved,
}: {
  questionNumber: number; examId: string; userId: string;
  initialNote?: QuestionNote; onSaved: (note: QuestionNote) => void;
}) {
  const [text, setText] = useState(initialNote?.noteText ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const saved = await notesApi.upsertNote(userId, examId, questionNumber, text.trim());
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 border border-amber-200 rounded-xl overflow-hidden bg-amber-50">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add your note here…"
        rows={3}
        className="w-full px-3 py-2 bg-transparent text-sm text-gray-700 resize-none outline-none placeholder-amber-300"
      />
      <div className="flex justify-end px-3 py-1.5 border-t border-amber-200">
        <button
          onClick={save}
          disabled={saving || !text.trim()}
          className="text-xs font-bold px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Question Review Item — renders one question answer with per-question actions
// ─────────────────────────────────────────────────────────────
function QnBadge({ n, txt }: { n: number; txt?: string }) {
  const display = txt || String(n);
  return <span className="font-bold text-[#1a1a1a] mr-3 text-[15px]">{display}</span>;
}



function ReviewActions({
  qNum, timestamp, onSeek, onLocate, onNoteToggle, hasNote, isNoteOpen
}: {
  qNum: number; timestamp?: number;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteToggle: () => void; hasNote: boolean; isNoteOpen: boolean;
}) {
  const btnClass = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdfaf0] hover:bg-[#fff7d9] text-[13px] font-semibold text-[#1a1a1a] shadow-sm border border-[#faeeb1] transition-colors focus:outline-none focus:ring-1 focus:ring-[#f6c604]";
  const activeBtnClass = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faeeb1] text-[13px] font-semibold text-[#1a1a1a] shadow-md border border-[#f6c604] transition-colors focus:outline-none";
  
  return (
    <div className="flex gap-2.5 flex-wrap mt-5">
      {timestamp !== undefined && (
        <button onClick={() => onSeek(timestamp)} className={btnClass}>
          <Headphones strokeWidth={2.5} className="w-[15px] h-[15px]" /> Listen from here
        </button>
      )}
      <button onClick={() => onLocate(qNum)} className={btnClass}>
        <MapPin strokeWidth={2.5} className="w-[15px] h-[15px]" /> Locate
      </button>
      <button disabled className={`${btnClass} opacity-60 cursor-not-allowed`} title="AI Explanation coming soon">
        <Lightbulb strokeWidth={2.5} className="w-[15px] h-[15px]" /> Explain
      </button>
      <button onClick={onNoteToggle} className={isNoteOpen ? activeBtnClass : (hasNote ? btnClass.replace('bg-[#fdfaf0]', 'bg-[#faeeb1]') : btnClass)}>
        <StickyNote strokeWidth={2.5} className="w-[15px] h-[15px]" /> Note{hasNote ? "" : ""}
      </button>
    </div>
  );
}

function ReviewItemField({
  item, userAnswers, correctMap, examId, userId, noteMap, onSeek, onLocate, onNoteReady
}: {
  item: NormalizedItem; userAnswers: Record<string, any>; correctMap: Map<string, any>;
  examId: string; userId: string; noteMap: Map<number, QuestionNote>;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteReady: (note: QuestionNote) => void;
}) {
  const [openNoteQn, setOpenNoteQn] = useState<number | null>(null);
  const toggleNote = (q: number) => setOpenNoteQn(p => p === q ? null : q);

  // Helper to render the actions bar below a question group
  const renderActions = (qNum: number, overrideTimestamp?: number) => {
    const ts = overrideTimestamp !== undefined ? overrideTimestamp : item.timestamp;
    return (
      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <ReviewActions 
          qNum={qNum} 
          timestamp={ts} 
          onSeek={onSeek} 
          onLocate={onLocate} 
          onNoteToggle={() => toggleNote(qNum)} 
          hasNote={noteMap.has(qNum)} 
          isNoteOpen={openNoteQn === qNum} 
        />
        {openNoteQn === qNum && (
          <div className="mt-3">
            <NoteEditor questionNumber={qNum} examId={examId} userId={userId} initialNote={noteMap.get(qNum)} onSaved={onNoteReady} />
          </div>
        )}
      </div>
    );
  };

  const QnBadge = ({ n, txt }: { n: number, txt?: string }) => {
    const display = txt || String(n);
    return <span className="font-bold text-[#1a1a1a] mr-3 text-[15px]">{display}</span>;
  };

  // Completion / short answer style
  if (
    item.kind === "note_completion" ||
    item.kind === "flowchart_completion" ||
    item.kind === "sentence_completion" ||
    item.kind === "short_answer"
  ) {
    const key = String(item.qn);
    const userAns = normalizeAnswer(userAnswers[key]);
    const correctAns = normalizeAnswer(correctMap.get(key));
    const isCorr = correctMap.has(key) ? isCorrect(userAns, correctAns) : null;
    const parts = (item.text || "").split(/_+|\.{3,}|\[blank\]/i);

    const renderInputBox = () => {
      if (isCorr === true) {
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#f0fdf4] border border-[#16a34a] text-[#16a34a] font-bold text-[15px] shadow-sm">
            <span>{userAns || "—"}</span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1.5 bg-[#fef2f2] border border-[#ef4444] rounded-[3px] px-2 py-0.5 shadow-sm">
          <span className="text-[#ef4444] font-bold text-[15px] line-through decoration-[#ef4444]/60 decoration-2">{userAns || "—"}</span>
          <span className="text-gray-400 font-medium text-[13px]">→</span>
          <span className="text-[#16a34a] font-bold text-[14px] bg-[#f0fdf4] px-1.5 rounded-[2px] border border-[#16a34a]/30">{correctAns}</span>
        </div>
      );
    };

    return (
      <div id={`review-question-${item.qn}`} className="py-2 text-[#1a1a1a] hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded">
        
        {(item as any).heading && <div className="font-bold text-[16px] uppercase mt-2 mb-2">{(item as any).heading}</div>}
        {(item as any).subheading && <div className="font-semibold text-[15px] mt-1 mb-2">{(item as any).subheading}</div>}

        {((item as any).precedingText || []).map((txt: string, i: number) => (
          <div key={`pre-${i}`} className="flex gap-[8px] items-start mb-1">
            <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0"></span>
            <span className="text-[17px] leading-relaxed">{txt}</span>
          </div>
        ))}

        <div className="flex items-start gap-[8px]">
          <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0"></span>
          <div className="flex items-center gap-[6px] flex-wrap flex-1">
            {parts.length > 1 ? (
              parts.map((p, idx) => (
                <span key={idx} className="flex items-center gap-[6px] flex-wrap leading-[2]">
                  <span className="text-[17px] leading-relaxed">{p}</span>
                  {idx < parts.length - 1 && renderInputBox()}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-[6px] flex-wrap leading-relaxed">
                <div className="text-[17px] font-medium leading-relaxed">{item.text}</div>
                {renderInputBox()}
              </div>
            )}
          </div>
        </div>
        {renderActions(item.qn)}
      </div>
    );
  }

  // Table completion
  if (item.kind === "table_completion") {
    return (
      <div id={`review-table-${item.qns[0]}`} className="py-4 text-[#1a1a1a] hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded overflow-x-auto w-full">
        
        {(item as any).title && <div className="font-bold text-[16px] mb-3 text-center text-[#333333] uppercase leading-relaxed">{(item as any).title}</div>}
        <table className="w-full border-collapse border border-[#d1d1d1] text-[15px] mb-2">
          {item.headers && item.headers.length > 0 && (
            <thead>
              <tr className="bg-[#e8e8e8]">
                {item.headers.map((h, i) => (
                  <th key={i} className="border border-[#d1d1d1] px-3 py-3 text-left text-[14px] font-bold text-[#1a1a1a] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {item.rows.map((row, rIdx) => (
              <tr key={rIdx} className="bg-white border-t border-[#d1d1d1]">
                {row.map((cell, cIdx) => {
                  if (typeof cell.question_number === "number") {
                    const qn = cell.question_number;
                    const key = String(qn);
                    const userAns = normalizeAnswer(userAnswers[key]);
                    const correctAns = normalizeAnswer(correctMap.get(key));
                    const isCorr = correctMap.has(key) ? isCorrect(userAns, correctAns) : null;
                    const parts = (cell.text || "").split(/_+|\.{3,}|\[blank\]/i);

                    const renderInputBox = () => {
                      if (isCorr === true) {
                        return (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#f0fdf4] border border-[#16a34a] text-[#16a34a] font-bold text-[15px] shadow-sm">
                            <span>{userAns || "—"}</span>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          </div>
                        );
                      }
                      return (
                        <div className="inline-flex items-center gap-1.5 bg-[#fef2f2] border border-[#ef4444] rounded-[3px] px-2 py-0.5 shadow-sm">
                          <span className="text-[#ef4444] font-bold text-[15px] line-through decoration-[#ef4444]/60 decoration-2">{userAns || "—"}</span>
                          <span className="text-gray-400 font-medium text-[13px]">→</span>
                          <span className="text-[#16a34a] font-bold text-[14px] bg-[#f0fdf4] px-1.5 rounded-[2px] border border-[#16a34a]/30">{correctAns}</span>
                        </div>
                      );
                    };

                    return (
                      <td key={cIdx} className="border border-[#e2e1df] px-3 py-4 align-middle">
                        <div id={`review-question-${qn}`} className="flex items-center gap-[6px] flex-wrap leading-[2]">
                          {parts.length > 1 ? (
                            parts.map((p, idx) => (
                              <span key={idx} className="flex items-center gap-[6px] flex-wrap leading-[2]">
                                {p && <span className="leading-relaxed">{p}</span>}
                                {idx < parts.length - 1 && renderInputBox()}
                              </span>
                            ))
                          ) : (
                            <>
                              {cell.text && <span className="leading-relaxed">{cell.text}</span>}
                              {renderInputBox()}
                            </>
                          )}
                        </div>
                        <div className="mt-2">
                          {renderActions(qn, cell.timestamp)}
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={cIdx} className="border border-[#e2e1df] px-3 py-4 align-middle">
                      <span className="leading-relaxed whitespace-pre-wrap">{cell.text}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // MC single

  if (item.kind === "mc_single") {
    const key = String(item.qn);
    const userAns = normalizeAnswer(userAnswers[key]);
    const correctAns = normalizeAnswer(correctMap.get(key));

    return (
      <div id={`review-question-${item.qn}`} className="py-6 hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded">
        
        <div className="flex flex-col">
          <div className="flex items-start min-w-0 mb-6">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qn} />
              {item.prompt}
            </div>
          </div>
          <div className="space-y-[22px] ml-2">
            {Object.entries(item.options || {}).map(([k, v]) => {
              const strK = String(k);
              const checked = strK === userAns;
              const isCorrectOpt = strK === correctAns;
              
              let ringColor = "border-[#767676] bg-white text-transparent";
              let textColor = "text-[#1a1a1a]";
              let itemOpacity = "opacity-90";
              let icon = null;

              if (isCorrectOpt) {
                ringColor = "border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]";
                textColor = "text-[#16a34a] font-semibold";
                itemOpacity = "opacity-100";
                icon = <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current ml-auto shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
              } else if (checked && !isCorrectOpt) {
                ringColor = "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";
                textColor = "text-[#ef4444] font-medium line-through decoration-[#ef4444]/40";
                itemOpacity = "opacity-100";
                icon = <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current ml-auto shrink-0"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
              }

              return (
                <div key={k} className={`flex items-start gap-3 ${itemOpacity}`}>
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${ringColor} ${isCorrectOpt || checked ? 'border-[2px]' : ''}`}>
                       {checked && <div className="w-[6px] h-[6px] rounded-full bg-current" />}
                    </div>
                  </div>
                  <div className={`min-w-0 flex-1 flex items-start gap-2 ${textColor}`}>
                    <div className="text-[16px] leading-[1.4]">{v}</div>
                    {icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {renderActions(item.qn)}
      </div>
    );
  }

  // MC multi (two answers)
  if (item.kind === "mc_multi") {
    const keyA = String(item.qns[0]);
    const keyB = String(item.qns[1]);

    const normSelection = (val: any) => {
      if (typeof val === "string") return val.trim().toUpperCase();
      if (Array.isArray(val)) return val.map(v => String(v).trim().toUpperCase());
      return "";
    };

    const selA = normSelection(userAnswers[keyA]);
    const selB = normSelection(userAnswers[keyB]);
    const selected = new Set<string>([selA, selB].flat().filter(Boolean));
    
    const corrA = normSelection(correctMap.get(keyA));
    const corrB = normSelection(correctMap.get(keyB));
    
    const correctsArray: string[] = [];
    [corrA, corrB].flat().filter(Boolean).forEach(c => {
      // if correct is "A, B" from a fallback we split it
      if (c.includes(",")) c.split(",").forEach((x: string) => correctsArray.push(x.trim()));
      else correctsArray.push(c);
    });
    const corrects = new Set<string>(correctsArray);

    const rangeText = `${item.qns[0]}-${item.qns[item.qns.length - 1]}`;

    return (
      <div id={`review-question-${item.qns[0]}`} className="py-6 hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded">
        
        <div className="flex flex-col">
          <div className="flex items-start min-w-0 mb-6">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qns[0]} txt={rangeText} />
              {item.prompt}
            </div>
          </div>
          <div className="space-y-[22px] ml-2">
            {Object.entries(item.options || {}).map(([k, v]) => {
              const strK = String(k).toUpperCase();
              const active = selected.has(strK);
              const isCorrectOpt = corrects.has(strK);

              let ringColor = "border-[#767676] bg-white text-transparent";
              let textColor = "text-[#1a1a1a]";
              let itemOpacity = "opacity-90";
              let icon = null;

              if (isCorrectOpt) {
                ringColor = "border-[#16a34a] bg-[#16a34a] text-white";
                textColor = "text-[#16a34a] font-semibold";
                itemOpacity = "opacity-100";
                icon = <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-[#16a34a] fill-current ml-auto shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
              } else if (active && !isCorrectOpt) {
                ringColor = "border-[#ef4444] bg-[#ef4444] text-white";
                textColor = "text-[#ef4444] font-medium line-through decoration-[#ef4444]/40";
                itemOpacity = "opacity-100";
                icon = <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-[#ef4444] fill-current ml-auto shrink-0"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;
              }

              return (
                <div key={k} className={`flex items-start gap-3 ${itemOpacity}`}>
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors ${ringColor}`}>
                      {(active || isCorrectOpt) && (
                         <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M20 6 9 17l-5-5" />
                         </svg>
                      )}
                    </div>
                  </div>
                  <div className={`min-w-0 flex-1 flex items-start gap-2 ${textColor}`}>
                    <div className="text-[16px] leading-[1.4]">{v}</div>
                    {icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {renderActions(item.qns[0])}
      </div>
    );
  }

  // Matching Group (Grid)
  if (item.kind === "matching_group") {
    const letters = Object.keys(item.options || {});
    const headingQns = item.qns.length > 1 ? `${item.qns[0]} - ${item.qns[item.qns.length - 1]}` : `${item.qns[0]}`;

    return (
      <div id={`review-question-${item.qns[0]}`} className="py-6 hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded relative">
            
        <div className="flex flex-col text-[#1a1a1a]">
          
          <div className="font-bold text-[16px] mb-1">Question {headingQns}</div>
          {(item as any).instructions && <div className="text-[16px] mb-4">{(item as any).instructions}</div>}
          
          {/* Radio Grid (Read-only) */}
          <div className="mb-6 overflow-x-auto custom-scrollbar border border-[#999999] max-w-fit rounded-[2px]">
            <table className="min-w-max border-collapse bg-white">
              <thead>
                <tr className="border-b-[1.5px] border-black">
                  <th className="p-3"></th>
                  {letters.map((letter, i) => (
                    <th key={letter} className={`p-4 w-[60px] text-center font-bold border-l border-[#d2d2d2] ${i === 0 ? 'border-l-[#999999]' : ''}`}>
                      {letter}
                    </th>
                  ))}
                  <th className="p-3 w-[80px] text-center font-bold border-l border-[#999999] bg-[#f9fafb]">Result</th>
                </tr>
              </thead>
              <tbody>
                {item.qns.map((qNum, rIdx) => {
                  const key = String(qNum);
                  const userAns = typeof userAnswers[key] === "string" ? userAnswers[key] : "";
                  const correctAns = typeof correctMap.get(key) === "string" ? correctMap.get(key) : "";
                  const prompt = item.prompts[rIdx] || "";
                  
                  return (
                    <tr key={qNum} className="border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#f9f9f9] transition-colors">
                      <td className="p-3 pl-5 pr-8 font-medium text-[15px] whitespace-nowrap min-w-[200px]">
                        <QnBadge n={qNum} />
                        {prompt}
                      </td>
                      {letters.map((letter, i) => {
                        const isUserChoice = userAns === letter;
                        const isCorrectChoice = correctAns === letter;
                        
                        let bgColor = "bg-white";
                        let textColor = "text-transparent";
                        if (isCorrectChoice) {
                          bgColor = "bg-[#dcfce7]"; 
                        } else if (isUserChoice && !isCorrectChoice) {
                          bgColor = "bg-[#fee2e2]";
                        }

                        if (isUserChoice) textColor = isCorrectChoice ? "text-[#16a34a]" : "text-[#ef4444]";
                        else if (isCorrectChoice) textColor = "text-[#16a34a]"; // show correct answer checkmark faintly if wanted? we'll just show actual selection

                        return (
                          <td key={letter} className={`p-3 text-center border-l border-[#e5e5e5] ${i === 0 ? 'border-l-[#999999]' : ''} ${bgColor}`}>
                            {isUserChoice || isCorrectChoice ? (
                              <div className="w-[18px] h-[18px] mx-auto rounded-full border-[2px] flex items-center justify-center border-current">
                                {isUserChoice && <div className="w-[6px] h-[6px] rounded-full bg-current" />}
                              </div>
                            ) : (
                              <div className="w-[18px] h-[18px] mx-auto rounded-full border-[1.5px] border-[#d4d4d4]" />
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center border-l bg-[#f9fafb] border-[#999999] font-bold">
                        {userAns === correctAns ? (
                          <div className="text-[#16a34a] flex items-center justify-center gap-1">
                            {userAns} <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[#ef4444] line-through decoration-2 text-sm">{userAns || "-"}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-[#16a34a]">{correctAns}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Options Table */}
          <div className="border border-[#d2d2d2] max-w-2xl bg-white rounded-[2px] overflow-hidden mb-2">
            {item.heading && (
              <div className="bg-[#fcfcfc] border-b border-[#d2d2d2] p-3.5 font-bold text-[14px] uppercase tracking-wide">
                {item.heading}
              </div>
            )}
            <table className="w-full border-collapse">
              <tbody>
                {Object.entries(item.options || {}).map(([k, v]) => (
                  <tr key={k} className="border-b border-[#e5e5e5] last:border-0 hover:bg-[#f9f9f9] transition-colors">
                    <td className="p-3.5 w-[56px] font-bold text-[16px] border-r border-[#d2d2d2] text-center">{k}</td>
                    <td className="p-3.5 text-[15px]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
        {renderActions(item.qns[0])}
      </div>
    );
  }

  // Plan labeling placeholder (image + input)
  if (item.kind === "plan_label") {
    const key = String(item.qn);
    const userAns = typeof userAnswers[key] === "string" ? userAnswers[key] : "";
    const correctAns = typeof correctMap.get(key) === "string" ? correctMap.get(key) : "";
    const isCorr = userAns.toLowerCase().trim() === correctAns.toLowerCase().trim();

    return (
      <div id={`review-question-${item.qn}`} className="py-6 hover:bg-slate-50/50 transition-colors p-2 -mx-2 rounded">
        
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-4">
              <QnBadge n={item.qn} />
              <div className="text-gray-800 font-medium text-[16px]">{item.prompt}</div>
            </div>
            
            <div className="max-w-sm mb-4">
               {isCorr ? (
                 <div className="flex items-center gap-2 px-3 py-2 bg-[#f0fdf4] border border-[#16a34a] rounded shadow-sm text-[#16a34a] font-bold">
                   <span>{userAns || "—"}</span>
                   <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current ml-auto"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 px-3 py-2 bg-[#fef2f2] border border-[#ef4444] rounded shadow-sm text-[#ef4444] font-medium line-through">
                     <span>{userAns || "—"}</span>
                     <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current ml-auto"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-2 bg-[#f0fdf4] border border-[#16a34a] rounded shadow-sm text-[#16a34a] font-bold">
                     Correct: {correctAns}
                   </div>
                 </div>
               )}
            </div>
          </div>
          <div className="w-full lg:w-[320px] shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm p-2">
            <img src={item.imageUrl} alt="Plan/Map/Diagram" className="w-full h-auto rounded-lg" />
          </div>
        </div>
        {renderActions(item.qn)}
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// Review & Explanation Section
// ─────────────────────────────────────────────────────────────
function ReviewSection({
  exam, correctMap, userAnswers, examId, userId,
}: {
  exam: any; correctMap: Map<string, any>; userAnswers: Record<string, any>; examId: string; userId: string;
}) {
  const [open, setOpen] = useState(true);
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [notes, setNotes] = useState<QuestionNote[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const parts: any[] = exam?.questions?.parts ?? [];
  const activePart = parts[activePartIdx];
  const audioUrl: string = activePart?.audio_url ?? "";
  const transcript: any[] = activePart?.transcript ?? [];
  const partItems = useMemo(() => extractAllItemsFromPart(activePart), [activePart]);

  // Load notes for this exam
  useEffect(() => {
    if (!userId) return;
    notesApi.getExamNotes(userId, examId)
      .then(setNotes)
      .catch(() => { });
  }, [examId, userId]);

  // Seek audio
  const handleSeek = useCallback((t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      audioRef.current.play();
    }
  }, []);

  // Locate = scroll transcript pane to that question's line
  const handleLocate = useCallback((qNum: number) => {
    const el = transcriptRefs.current[qNum];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleNoteReady = useCallback((note: QuestionNote) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.questionNumber === note.questionNumber);
      if (idx >= 0) { const ns = [...prev]; ns[idx] = note; return ns; }
      return [...prev, note];
    });
  }, []);

  const noteMap = useMemo(() => {
    const m = new Map<number, QuestionNote>();
    notes.forEach((n) => m.set(n.questionNumber, n));
    return m;
  }, [notes]);

  const partTypeLabels = ["Basic Conversation", "Short Monologue", "Academic Discussion", "Academic Lecture"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-6 py-4 text-left transition-colors"
      >
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        <span className="font-extrabold text-gray-900">Review &amp; Explanation</span>
      </button>

      {open && (
        <div>
          {/* Part Tabs */}
          <div className="flex px-6 gap-8 overflow-x-auto">
            {parts.map((p: any, i: number) => {
              const active = i === activePartIdx;
              const label = p.part_type ?? partTypeLabels[i] ?? `Part ${i + 1}`;
              return (
                <button
                  key={i}
                  onClick={() => { setActivePartIdx(i); if (audioRef.current) { audioRef.current.pause(); } }}
                  className={`flex flex-col items-center gap-1 py-3 text-sm font-semibold shrink-0 border-b-[3px] transition-colors ${active
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {PartIcons[i]}
                    <span>Part {i + 1}</span>
                  </div>
                  <span className={`text-xs font-normal ${active ? "text-primary" : "text-gray-400"}`}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="px-6 pt-5 pb-2">
              <AudioPlayer audioUrl={audioUrl} audioRef={audioRef} />
            </div>
          )}

          {/* Split panel */}
          <div className="flex divide-x divide-gray-100" style={{ minHeight: 400, maxHeight: 600 }}>
            {/* Left: Question Review */}
            <div key={`left-${activePartIdx}`} className="flex-1 overflow-y-auto px-8 py-4 bg-white shrink-[2] min-w-[50%] custom-scrollbar">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Question Review</div>

              {partItems.map((item, i) => (
                <ReviewItemField
                  key={i}
                  item={item}
                  userAnswers={userAnswers}
                  correctMap={correctMap}
                  examId={examId}
                  userId={userId}
                  noteMap={noteMap}
                  onSeek={handleSeek}
                  onLocate={handleLocate}
                  onNoteReady={handleNoteReady}
                />
              ))}
            </div>

            {/* Right: Transcript or Passage */}
            <div key={`right-${activePartIdx}`} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {exam?.type === "READING" ? (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Reading Passage</div>
                  <div className="text-[15px] text-[#1a1a1a] leading-relaxed space-y-5 pb-20">
                    {((parts[activePartIdx] as any)?.passage_text || "Passage text not available.")
                      .split('\n')
                      .filter((para: string) => {
                        const cleanPara = para.replace(/\*\*/g, '').trim().toLowerCase();
                        const cleanTopic = ((parts[activePartIdx] as any)?.topic || "").trim().toLowerCase();
                        return cleanPara !== cleanTopic && cleanPara.length > 0;
                      })
                      .map((para: string, i: number) => (
                        <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>
                  {transcript.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>
                  ) : (
                    <div className="space-y-3">

                  {transcript.map((line: any, idx: number) => {
                    const hasQ = line.question_number != null;
                    return (
                      <div
                        key={idx}
                        ref={(el) => { if (hasQ) transcriptRefs.current[line.question_number] = el; }}
                        className={`text-sm leading-relaxed ${hasQ ? "scroll-mt-4" : ""}`}
                      >
                        <span className="font-bold text-gray-500 mr-2 text-xs uppercase tracking-wide">{line.speaker}:</span>
                        {hasQ ? (
                          <span>
                            {(() => {
                              // Use the explicit question_markers (if multiple questions on this line) or the single highlight_text
                              const markers = line.question_markers || [{ question_number: line.question_number, highlight_text: line.highlight_text }];

                              // We need to highlight all markers in the text.
                              // To easily handle overlapping or sequential markers without complex regex, 
                              // a robust method is splitting by each highlight_text iteratively or 
                              // escaping them and building a combined regex.
                              // For simplicity and avoiding nested highlights breaking, let's replace them sequentially
                              // with a placeholder, then split and map.

                              let resultElements: React.ReactNode[] = [line.text];

                              markers.forEach((marker: any) => {
                                if (!marker.highlight_text) return;

                                const nextElements: React.ReactNode[] = [];
                                const escaped = String(marker.highlight_text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                const re = new RegExp(`(${escaped})`, "i");

                                resultElements.forEach((el, index) => {
                                  if (typeof el === "string") {
                                    const parts = el.split(re);
                                    parts.forEach((part, pi) => {
                                      if (re.test(part)) {
                                        nextElements.push(
                                          <mark key={`${marker.question_number}-${index}-${pi}`} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-semibold">
                                            {part}
                                            <sup className="ml-0.5 text-[10px] font-bold text-amber-600">Q{marker.question_number}</sup>
                                          </mark>
                                        );
                                      } else {
                                        if (part) nextElements.push(part);
                                      }
                                    });
                                  } else {
                                    nextElements.push(el); // already a React node (e.g., previous mark)
                                  }
                                });
                                resultElements = nextElements;
                              });

                              return resultElements;
                            })()}
                          </span>
                        ) : (
                          <span className="text-gray-700">{line.text}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function IeltsResultPage() {
  const params = useParams();
  const examId = params?.examId as string;
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resultOpen, setResultOpen] = useState(true);
  const [answerSheetOpen, setAnswerSheetOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    window.scrollTo(0, 0);
    setLoading(true);
    examsApi
      .getSession(sessionId)
      .then((s) => { if (mounted) setSession(s); })
      .catch((e: any) => { if (mounted) setError(e?.message || "Failed to load result"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [sessionId]);

  const exam = session?.exam;
  const result = session?.result;
  const userAnswers: Record<string, any> = session?.answers || {};

  const correctMap = useMemo(() => {
    const map = new Map<string, any>();
    if (exam?.questions) extractCorrectAnswers(exam.questions, map);
    return map;
  }, [exam]);

  const rawScore = result?.totalScore ?? 0;
  const maxScore = correctMap.size > 0 ? correctMap.size : 40;
  const band = exam?.type === "READING" ? getIeltsReadingBand(rawScore) : getIeltsBand(rawScore);
  const color = bandColor(band);

  const parts = useMemo(() => {
    const ps: Array<{ label: string; partRange: [number, number] }> = [];
    if (exam?.questions?.parts) {
      (exam.questions.parts as any[]).forEach((p, i) => {
        const partLabel = `Part ${i + 1}: Q${i * 10 + 1}–${(i + 1) * 10}`;
        ps.push({ label: partLabel, partRange: [i * 10 + 1, (i + 1) * 10] });
      });
    } else {
      for (let i = 0; i < 4; i++) {
        ps.push({ label: `Part ${i + 1}: Q${i * 10 + 1}–${(i + 1) * 10}`, partRange: [i * 10 + 1, (i + 1) * 10] });
      }
    }
    return ps;
  }, [exam]);

  const examTitle = exam?.title ?? "Test";
  const shortTitle = examTitle.replace("Cambridge IELTS ", "Cambridge ");

  const submittedAt = session?.submittedAt ? new Date(session.submittedAt) : null;
  const startedAt = session?.startedAt ? new Date(session.startedAt) : null;
  const timeTakenSecs = session?.timeTaken ?? (submittedAt && startedAt ? Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000) : null);
  const totalSecs = (exam?.duration ?? 0) * 60;

  function fmtTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto max-w-screen-xl px-4 py-8 space-y-6">
        <Breadcrumbs />

        {/* ── Result Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => setResultOpen(!resultOpen)} className="w-full flex items-center gap-2 px-6 py-4 text-left transition-colors">
            {resultOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            <span className="font-extrabold text-gray-900">Result</span>
          </button>

          {resultOpen && (
            <div className="px-8 pb-8 pt-2">
              {loading ? (
                <div className="flex gap-10 animate-pulse">
                  <div className="w-24 h-32 bg-gray-200 rounded-xl" />
                  <div className="flex flex-col gap-3 pt-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-6 w-56 bg-gray-200 rounded" />
                    <div className="h-8 w-44 bg-gray-200 rounded-full" />
                    <div className="h-8 w-36 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4">{error}</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10 py-4">
                  <BandShield band={band} rawScore={rawScore} maxScore={maxScore} color={color} />
                  <div className="flex flex-col items-center sm:items-start gap-4 sm:ml-6">
                    <div className="text-center sm:text-left flex flex-col">
                      <div className="text-base text-slate-500 font-medium pb-2">
                        {[session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(" ") || "Student"}
                      </div>
                      <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 tracking-tight leading-tight">
                        {shortTitle}
                      </h1>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-2">
                      {submittedAt && (
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-50 shrink-0">
                            <Calendar className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Completed</span>
                            <span className="text-sm font-semibold text-slate-700">{submittedAt.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      )}
                      {timeTakenSecs !== null && (
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-50 shrink-0">
                            <Clock className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Time Taken</span>
                            <span className="text-sm font-semibold text-slate-700">{fmtTime(timeTakenSecs)} <span className="text-slate-400 font-medium">/ {fmtTime(totalSecs)}</span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Answer Sheet Card ── */}
        {!loading && !error && session && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setAnswerSheetOpen(!answerSheetOpen)} className="w-full flex items-center gap-2 px-6 py-4 text-left transition-colors">
              {answerSheetOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              <span className="font-extrabold text-gray-900">Answer sheet</span>
            </button>
            {answerSheetOpen && (
              <div className="px-8 pb-6 pt-2">
                <div className="flex flex-wrap gap-8">
                  {parts.map((p) => (
                    <AnswerColumn
                      key={p.label}
                      partLabel={p.label}
                      range={p.partRange}
                      correctMap={correctMap}
                      userAnswers={userAnswers}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Review & Explanation Card ── */}
        {!loading && !error && session && exam?.questions?.parts && (
          <ReviewSection
            exam={exam}
            correctMap={correctMap}
            userAnswers={userAnswers}
            examId={examId}
            userId={session?.user?.id ?? ""}
          />
        )}

        {/* ── Actions ── */}
        {!loading && !error && (
          <div className="flex gap-4">
            <Link
              href={`/ielts/intensive/${encodeURIComponent(examId)}`}
              className="px-6 py-3 bg-primary hover:bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Try Again
            </Link>
            <Link
              href="/ielts/intensive"
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
            >
              Back to Mock Tests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
