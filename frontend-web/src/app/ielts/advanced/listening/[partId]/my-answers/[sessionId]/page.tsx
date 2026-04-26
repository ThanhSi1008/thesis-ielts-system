"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "@/lib/api";
import { ChevronLeft, Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import { FormCompletionGroup } from "../../../../../basic/components/listening-renders/FormCompletionGroup";
import { MCQuestionItem } from "../../../../../basic/components/listening-renders/MCQuestionItem";
import { MCMultipleQuestionItem } from "../../../../../basic/components/listening-renders/MCMultipleQuestionItem";
import { MatchingCompletionGroup } from "../../../../../basic/components/listening-renders/MatchingGroup";

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

function AnswerColumn({ partLabel, mapKeys, correctMap, userAnswers }: {
  partLabel: string; mapKeys: string[];
  correctMap: Map<string, any>; userAnswers: Record<string, any>;
}) {
  const rows = [];

  for (const key of mapKeys) {
    const userAns = userAnswers[key];
    const correctAns = correctMap.get(key);
    const correct = correctAns !== undefined ? isCorrect(userAns, correctAns) : null;
    const displayUser = normalizeAnswer(userAns) || "N/A";
    const displayCorrect = normalizeAnswer(correctAns);

    rows.push(
      <div key={key} className="flex items-start gap-3 py-1 group">
        <span className="w-5 text-[13px] font-bold text-slate-400 shrink-0 pt-0.5 text-right">{key}.</span>
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
    <div className="flex-1 min-w-[280px] bg-slate-50/50 rounded-xl p-4 border border-slate-100">
      <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 pl-[32px]">{partLabel}</div>
      <div className="flex flex-col gap-1.5">{rows}</div>
    </div>
  );
}

function AudioPlayer({ audioUrl, audioRef }: { audioUrl: string; audioRef: React.RefObject<HTMLAudioElement> }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    <div className="flex flex-col items-center gap-3 py-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl w-full">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center gap-4">
        <button onClick={() => skip(-5)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          <SkipBack className="w-4 h-4" /> 5s
        </button>
        <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-yellow-400 transition-colors">
          {playing ? <Pause className="w-5 h-5 text-gray-900" /> : <Play className="w-5 h-5 text-gray-900 ml-0.5" />}
        </button>
        <button onClick={() => skip(5)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
          5s <SkipForward className="w-4 h-4" />
        </button>
      </div>
      <div className="w-full flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 w-10 text-right">{fmt(currentTime)}</span>
        <div ref={progressRef} onClick={seekTo} className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-mono text-gray-500 w-10">{fmt(duration)}</span>
        <Volume2 className="w-4 h-4 text-gray-400 ml-1" />
      </div>
    </div>
  );
}

export default function IeltsAdvancedHistoryDetailsPage({ params }: { params: { partId: string; sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);

  const handleLocate = (qNum: number) => {
    setLocatedQuestion(qNum);
    const target = document.getElementById(`transcript-q-${qNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setLocatedQuestion(null);
    }, 3000);
  };

  useEffect(() => {
    api.get(`/ielts/advanced/history/${params.sessionId}`, {
      withCredentials: true
    }).then(res => {
      setSession(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params.sessionId]);

  const correctMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!session?.part?.content) return map;

    const contentArray = session.part.content as any[];
    for (const group of contentArray) {
      const qs = [];
      if (group.points) qs.push(...group.points);
      if (group.questions) qs.push(...group.questions);
      if (group.rows) {
        group.rows.forEach((row: any) => {
          if (row.questions) {
            Object.entries(row.questions).forEach(([k, v]) => {
              qs.push({ question_number: k, ...(v as any) });
            });
          }
        });
      }
      for (const q of qs) {
        if (!q.question_number) continue;
        const qNum = String(q.question_number);
        // Sometimes valid answers are in `acceptable_answers`, fallback to `answer`
        const answer = q.acceptable_answers || q.answer;
        if (answer !== undefined) {
          map.set(qNum, answer);
        }
      }
    }
    return map;
  }, [session]);

  const allQuestionKeys = useMemo(() => {
    const keys = Array.from(correctMap.keys()).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    return keys.map(String);
  }, [correctMap]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!session) return <div className="p-8">Session not found</div>;

  const scoreData = session.scoreData || {};
  const userAnswers = session.answers || {};

  return (
    <div className="flex flex-col animate-fade-up">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link
              href={`/ielts/advanced/listening/${params.partId}/my-answers`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm"
              title="Back to answer history"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Practice Result</h1>
         </div>
      </div>

      <div className="bg-white border text-left border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-0 rounded-3xl overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-lg">Score Report</h3>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          {/* Big Score Box */}
          <div className="bg-[#EBF3FF] border border-blue-100 rounded-xl p-6 flex flex-col items-center justify-center shrink-0 w-48">
            <span className="text-blue-500 font-bold text-sm mb-1">Marks</span>
            <div className="text-4xl font-black text-blue-500">
              {session.totalScore} <span className="text-2xl text-blue-300">/ {session.totalQuestions}</span>
            </div>
          </div>

          {/* Score Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-gray-500 font-bold">Question type</th>
                  <th className="pb-3 text-gray-500 font-bold text-center">Total</th>
                  <th className="pb-3 text-gray-500 font-bold text-center">Attempted</th>
                  <th className="pb-3 text-gray-500 font-bold text-center">Correct</th>
                  <th className="pb-3 text-gray-500 font-bold text-right">Marks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scoreData).map(([type, stats]: [string, any]) => (
                  <tr key={type} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-bold text-gray-800 capitalize">{type.replace('_', ' ')}</td>
                    <td className="py-4 text-gray-600 font-medium text-center">{stats.total}</td>
                    <td className="py-4 text-gray-600 font-medium text-center">{stats.total}</td>
                    <td className="py-4 text-gray-600 font-medium text-center">{stats.correct}</td>
                    <td className="py-4 text-gray-800 font-extrabold text-right">{stats.correct}/{stats.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Answer Sheet Card */}
      {allQuestionKeys.length > 0 && (
        <div className="bg-white border text-left border-gray-100 shadow-sm p-0 rounded-2xl overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-lg">Answer Sheet</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-6">
              {Array.from({ length: Math.ceil(allQuestionKeys.length / 5) }).map((_, i) => {
                const chunk = allQuestionKeys.slice(i * 5, (i + 1) * 5);
                const first = chunk[0];
                const last = chunk[chunk.length - 1];
                return (
                  <AnswerColumn
                    key={i}
                    partLabel={`QUESTIONS ${first}-${last}`}
                    mapKeys={chunk}
                    correctMap={correctMap}
                    userAnswers={userAnswers}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border text-left border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-0 rounded-3xl overflow-hidden mt-8 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">Explanation</h3>
        </div>
        {session.part?.audioUrl && (
          <div className="p-6 pb-2 border-b border-gray-100">
            <AudioPlayer audioUrl={session.part.audioUrl} audioRef={audioRef} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100 max-h-[800px]">
          {/* Left side: Questions */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-white shrink-[2] lg:min-w-[50%] custom-scrollbar">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Question Review</div>
            <div className="space-y-8">
              {session.part?.content?.map((group: any, idx: number) => {
                if (group.type === 'form_completion' || group.type === 'note_completion' || (!group.type && group.points)) {
                  return (
                    <FormCompletionGroup
                      key={idx}
                      heading={group.heading}
                      points={group.points}
                      answers={session.answers || {}}
                      onAnswer={() => { }}
                      submitted={true}
                      showAnswers={true}
                      audioRef={audioRef}
                      onLocate={handleLocate}
                    />
                  );
                }

                if (group.type === 'multiple_choice_multiple') {
                  const key = `mcm-${idx}`;
                  const rawSelected = session.answers?.[key] || "";
                  const selectedLetters = rawSelected ? rawSelected.split(",") : [];

                  return (
                    <MCMultipleQuestionItem
                      key={idx}
                      group={group}
                      selectedLetters={selectedLetters}
                      onToggle={() => { }}
                      submitted={true}
                      showAnswers={true}
                      audioRef={audioRef}
                      onLocate={handleLocate}
                    />
                  );
                }

                if (group.type === 'matching') {
                  return (
                    <MatchingCompletionGroup
                      key={idx}
                      group={group}
                      answers={session.answers || {}}
                      onAnswer={() => { }}
                      submitted={true}
                      showAnswers={true}
                      audioRef={audioRef}
                      onLocate={handleLocate}
                    />
                  );
                }

                if (group.type === 'multiple_choice') {
                  return (
                    <div key={idx} className="space-y-4">
                      {group.heading && <h3 className="text-[15px] font-extrabold text-gray-900 mb-2">{group.heading}</h3>}
                      {group.questions?.map((q: any) => (
                        <MCQuestionItem
                          key={q.question_number}
                          q={q}
                          selected={session.answers?.[q.question_number] || ""}
                          onSelect={() => { }}
                          submitted={true}
                          showAnswers={true}
                          audioRef={audioRef}
                          onLocate={handleLocate}
                        />
                      ))}
                    </div>
                  );
                }

                return <div key={idx} className="text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">Review for {group.type} coming soon.</div>;
              })}
            </div>
          </div>

          {/* Right side: Transcript */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-gray-50/30">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audio Transcript</div>
            {!session.part?.transcript || session.part.transcript.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Transcript not available for this part.</p>
            ) : (
              <div className="space-y-4 pr-2">
                {session.part.transcript.map((line: any, idx: number) => {
                  const hasQ = line.question_number != null || (line.question_markers && line.question_markers.length > 0);
                  const isLocated = locatedQuestion !== null && (
                    line.question_number === locatedQuestion ||
                    (line.question_markers && line.question_markers.some((m: any) => m.question_number === locatedQuestion))
                  );

                  // Find the primary question number to use as ID for scrolling
                  const primaryQNum = line.question_number || (line.question_markers && line.question_markers.length > 0 ? line.question_markers[0].question_number : undefined);

                  return (
                    <div
                      key={idx}
                      id={primaryQNum ? `transcript-q-${primaryQNum}` : undefined}
                      className={`flex flex-col transition-all duration-500 rounded-2xl ${isLocated
                          ? "bg-gray-50 p-4 -mx-4 ring-1 ring-gray-100/50"
                          : "bg-transparent p-0"
                        }`}
                    >
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 select-none">
                        {line.speaker}
                      </span>
                      <p className={`transition-colors text-sm leading-relaxed ${isLocated ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                        {hasQ ? (
                          <span>
                            {(() => {
                              const markers = line.question_markers || [{ question_number: line.question_number, highlight_text: line.highlight_text }];
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
                                          <mark key={`${marker.question_number}-${index}-${pi}`} className="bg-[#FFF9E6] text-gray-900 px-1.5 py-0.5 rounded-[4px] font-semibold not-italic" style={{ textDecorationColor: '#FFC107' }}>
                                            {marker.question_number && (
                                              <span className="inline-flex items-center justify-center bg-gray-900 text-white text-[9px] font-extrabold px-[5px] py-[2px] rounded-[3px] mr-1.5 tracking-wider align-middle select-none">
                                                Q{marker.question_number}
                                              </span>
                                            )}
                                            {part}
                                          </mark>
                                        );
                                      } else {
                                        if (part) nextElements.push(part);
                                      }
                                    });
                                  } else {
                                    nextElements.push(el);
                                  }
                                });
                                resultElements = nextElements;
                              });

                              return resultElements;
                            })()}
                          </span>
                        ) : (
                          <span>{line.text}</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
