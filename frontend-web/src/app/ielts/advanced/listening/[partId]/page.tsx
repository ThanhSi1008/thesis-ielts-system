"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "@/lib/api";
import { ChevronLeft, Play, Pause, Volume2, SkipBack, SkipForward, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnswerField } from "@/components/AnswerField";
import { extractAllItemsFromPart } from "@/lib/exam-parser";

export default function IeltsAdvancedListeningPractice({ params }: { params: { partId: string } }) {
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // Premium Custom Audio States
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

  useEffect(() => {
    api.get(`/ielts/advanced/listening/${params.partId}`, {
      withCredentials: true
    })
    .then(res => {
      setPart(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.partId]);

  const items = useMemo(() => {
    if (!part) return [];
    const normalizedPart = {
      ...part,
      question_groups: part.question_groups || part.content,
      content: part.question_groups ? part.content : undefined
    };
    return extractAllItemsFromPart(normalizedPart);
  }, [part]);

  // Extract ordered list of question numbers
  const qNumbers = useMemo(() => {
    const nums: number[] = [];
    items.forEach(it => {
      if ("qn" in it && typeof it.qn === "number") {
        nums.push(it.qn);
      } else if ("qns" in it && Array.isArray(it.qns)) {
        nums.push(...it.qns);
      }
    });
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  }, [items]);

  // Track which questions are answered
  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    for (const [k, v] of Object.entries(answers)) {
      if (typeof v === "string" && v.trim() !== "") s.add(parseInt(k));
      else if (Array.isArray(v) && v.length > 0) s.add(parseInt(k));
    }
    return s;
  }, [answers]);

  // Sync audio progress states
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
  }, [loading, part]);

  const handleStartAudio = () => {
    setHasStartedAudio(true);
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.play().catch(err => console.error("Auto-play blocked:", err));
      }
    }, 150);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error(err));
    }
  };

  const skip = (secs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
    }
  };

  const fmtTime = (s: number) => {
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

  const handleLocate = (qNum: number) => {
    setLocatedQuestion(qNum);
    const el = document.getElementById(`question-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async () => {
    setIsConfirmingSubmit(false);
    setSubmitted(true);
    try {
      const res = await api.post(`/ielts/advanced/listening/${params.partId}/submit`, {
         answers
      }) as { data: any };
      
      router.push(`/ielts/advanced/listening/${params.partId}/my-answers/${res.data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 font-bold text-gray-500 dark:text-slate-400 flex justify-center mt-20">Loading Part...</div>;
  if (!part) return <div className="p-10 font-bold text-red-500 flex justify-center mt-20">Part not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-up pb-32">
      {/* Hidden native audio tag */}
      <audio ref={audioRef} src={part.audioUrl} preload="metadata" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ielts/advanced"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500 transition-all shadow-sm"
            title="Back to all listening parts"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              Part {part.partNumber || 1}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1">{part.title}</h1>
          </div>
        </div>

        <div>
          {!submitted ? (
            <button
              onClick={() => setIsConfirmingSubmit(true)}
              className="px-6 py-2.5 bg-primary hover:brightness-105 text-gray-900 text-sm font-black rounded-xl shadow-sm transition-all transform hover:scale-[1.03] uppercase tracking-wider"
            >
              Submit Answers
            </button>
          ) : (
            <Link
              href="/ielts/advanced/statistics"
              className="px-6 py-2.5 bg-gray-900 dark:bg-slate-800 text-white text-sm font-black rounded-xl hover:bg-black dark:hover:bg-slate-700 shadow-sm transition-colors uppercase tracking-wider"
            >
              View Stats
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Custom Premium Audio Player */}
        <div className="p-8 pb-4 border-b border-gray-50 dark:border-slate-850">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col items-center gap-4 relative overflow-hidden shadow-inner group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            
            {/* Header info inside audio panel */}
            <div className="w-full flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Practice Audio Player
              </span>
              {playing && (
                <div className="text-[10px] font-black text-emerald-500 dark:text-emerald-450 flex items-center gap-1.5 uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Playing
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-6 z-10">
              <button 
                onClick={() => skip(-5)} 
                className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-350 transition-colors"
                title="Rewind 5s"
              >
                <SkipBack className="w-4 h-4" /> 5s
              </button>
              <button 
                onClick={togglePlay} 
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 hover:brightness-105 active:scale-95 transition-all duration-200"
                title={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="w-6 h-6 text-gray-900" /> : <Play className="w-6 h-6 text-gray-900 ml-0.5" />}
              </button>
              <button 
                onClick={() => skip(5)} 
                className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-350 transition-colors"
                title="Forward 5s"
              >
                5s <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Audio Time & Timeline */}
            <div className="w-full flex items-center gap-4 z-10">
              <span className="text-xs font-mono text-gray-500 dark:text-slate-400 w-12 text-right">{fmtTime(currentTime)}</span>
              <div 
                onClick={seekTo} 
                className="flex-1 h-2 bg-gray-200 dark:bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group/bar"
              >
                <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-mono text-gray-500 dark:text-slate-400 w-12">{fmtTime(duration)}</span>
              <Volume2 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </div>
          </div>
        </div>

        {/* Questions Panel */}
        <div className="p-8 pt-4 space-y-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mb-8 flex items-center gap-3">
            <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
            Questions Panel
            <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1" />
          </div>

          <div className="space-y-6">
            {items.map((it, idx) => (
              <AnswerField
                key={String(idx)}
                item={it}
                variant="official"
                answers={answers}
                setAnswers={setAnswers}
                focusedQn={locatedQuestion}
                setFocusedQn={setLocatedQuestion}
                submitted={submitted}
                showAnswers={submitted}
                onLocate={handleLocate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Prev/Next Question Buttons */}
      {qNumbers.length > 0 && !submitted && (
        <div className="fixed bottom-24 right-8 md:right-12 flex gap-2 z-30 opacity-90 hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              const idx = locatedQuestion ? qNumbers.indexOf(locatedQuestion) : 0;
              if (idx > 0) {
                const prev = qNumbers[idx - 1];
                handleLocate(prev);
              }
            }}
            disabled={locatedQuestion === qNumbers[0]}
            className="w-12 h-12 bg-white dark:bg-slate-850 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Previous question"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              const idx = locatedQuestion ? qNumbers.indexOf(locatedQuestion) : -1;
              if (idx < qNumbers.length - 1) {
                const next = qNumbers[idx + 1];
                handleLocate(next);
              }
            }}
            disabled={locatedQuestion === qNumbers[qNumbers.length - 1]}
            className="w-12 h-12 bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md active:scale-95 transition-all"
            title="Next question"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Cố định Footbar Bản đồ Câu hỏi ở cuối trang */}
      {!submitted && (
        <footer className="fixed bottom-0 left-0 right-0 h-[64px] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-40 flex items-center px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-wide">
                Part {part.partNumber || 1}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                {answeredSet.size} of {qNumbers.length} answered
              </span>
            </div>

            {/* Scrollable Questions List */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-2 px-1 justify-end custom-scrollbar">
              {qNumbers.map((n) => {
                const isAnswered = answeredSet.has(n);
                const isFocused = locatedQuestion === n;
                return (
                  <button
                    key={n}
                    onClick={() => handleLocate(n)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all shrink-0 border ${
                      isFocused
                        ? "border-[#2181d8] bg-transparent text-gray-900 dark:text-white ring-2 ring-[#2181d8]/20"
                        : isAnswered
                        ? "bg-[#319c28] border-[#319c28] text-white hover:bg-green-700"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </footer>
      )}

      {/* Start Audio Overlay */}
      {!hasStartedAudio && !submitted && (
        <div className="fixed inset-0 z-[150] bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center text-white px-6 animate-fade-in">
          <svg viewBox="0 0 24 24" className="w-20 h-20 mb-6 text-primary fill-current drop-shadow-[0_0_15px_rgba(255,193,7,0.3)]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h3v-8H5v-1a7 7 0 1 1 14 0v1h-3v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z" />
          </svg>
          <div className="text-[20px] font-black text-center max-w-2xl mb-4 leading-normal tracking-tight">
            IELTS LISTENING PRACTICE
          </div>
          <div className="text-sm text-gray-400 text-center max-w-md mb-8 leading-relaxed">
            You will listen to a recording and answer questions. Note that in a real IELTS exam, you can only listen to the audio once.
          </div>
          <button
            onClick={handleStartAudio}
            className="flex items-center gap-3 bg-primary hover:brightness-105 text-gray-900 px-8 py-3.5 rounded-2xl font-black text-base transition-all transform active:scale-95 shadow-lg shadow-yellow-500/10"
          >
            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center pl-0.5">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current"><path d="M8 5v14l11-7z" /></svg>
            </div>
            START PRACTICE
          </button>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {isConfirmingSubmit && (
        <div className="fixed inset-0 z-[160] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">Submit Answers?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to finish and submit your answers? You will not be able to change them afterward.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsConfirmingSubmit(false)}
                className="px-5 py-2 text-sm font-black text-gray-700 dark:text-slate-350 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-black text-white bg-[#ef4444] hover:bg-red-650 rounded-xl shadow-sm transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
