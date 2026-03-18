"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";

type AnswersState = Record<string, string | string[]>;

type NormalizedItem =
  | {
      kind: "mc_single";
      qn: number;
      prompt: string;
      options: Record<string, string>;
    }
  | {
      kind: "mc_multi";
      qns: number[]; // two questions share one multi-select
      prompt: string;
      options: Record<string, string>;
      maxSelect: number;
    }
  | {
      kind: "matching_group";
      qns: number[];
      prompts: string[];
      options: Record<string, string>;
      heading?: string;
      instructions?: string;
    }
  | {
      kind:
        | "note_completion"
        | "table_completion"
        | "flowchart_completion"
        | "sentence_completion"
        | "short_answer";
      qn: number;
      text: string;
    }
  | {
      kind: "plan_label";
      qn: number;
      imageUrl: string;
      prompt?: string;
    };

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getPartTitle(part: any) {
  return `Part ${part?.part_number ?? ""}`.trim();
}

function extractAllItemsFromPart(part: any): NormalizedItem[] {
  // Based on your seeded JSON for IELTS17 Listening Test 1:
  // - Note Completion: part.content[].subsections[].points[] with question_number + answer
  // - MC: part.question_groups[].items[] with question_number OR question_numbers
  // - Matching: part.question_groups[].items[] with question_number/prompt
  const items: NormalizedItem[] = [];

  // 1) Note completion-like structure: content -> subsections -> points
  if (Array.isArray(part?.content)) {
    for (const block of part.content) {
      const subs = block?.subsections;
      if (Array.isArray(subs)) {
        for (const sub of subs) {
          for (const p of sub?.points ?? []) {
            if (typeof p?.question_number === "number") {
              items.push({
                kind: "note_completion",
                qn: p.question_number,
                text: p.text,
              });
            }
          }
        }
      } else if (Array.isArray(block?.points)) {
        for (const p of block.points) {
          if (typeof p?.question_number === "number") {
            items.push({
              kind: "note_completion",
              qn: p.question_number,
              text: p.text,
            });
          }
        }
      }
    }
  }

  // 2) Grouped questions (MC + matching + other)
  if (Array.isArray(part?.question_groups)) {
    for (const g of part.question_groups) {
      const qt = String(g?.question_type || "").toLowerCase();
      if (qt.includes("multiple choice") && Array.isArray(g?.items)) {
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({
              kind: "mc_single",
              qn: it.question_number,
              prompt: it.question_text || it.question || "",
              options: it.options || {},
            });
          } else if (Array.isArray(it?.question_numbers)) {
            items.push({
              kind: "mc_multi",
              qns: it.question_numbers,
              prompt: it.question_text || it.question || "",
              options: it.options || {},
              maxSelect: 2,
            });
          }
        }
      } else if (qt.includes("matching") && Array.isArray(g?.items)) {
        const options = g?.options_box?.options || {};
        const qns: number[] = [];
        const prompts: string[] = [];
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
             qns.push(it.question_number);
             prompts.push(it.prompt || it.question_text || "");
          }
        }
        if (qns.length > 0) {
          items.push({
            kind: "matching_group",
            qns,
            prompts,
            options,
            heading: g?.options_box?.heading || "",
            instructions: g?.instructions || "",
          });
        }
      } else if (Array.isArray(g?.items)) {
        // Fallback: treat items as short answer if they have question_number + question_text
        for (const it of g.items) {
          if (typeof it?.question_number === "number") {
            items.push({
              kind: "short_answer",
              qn: it.question_number,
              text: it.question_text || it.prompt || it.question || "",
            });
          }
        }
      }
    }
  }

  // Ensure sorted
  return items.sort((a, b) => {
    const an = "qn" in a ? a.qn : a.qns[0];
    const bn = "qn" in b ? b.qn : b.qns[0];
    return an - bn;
  });
}

function questionNumbersFromItems(items: NormalizedItem[]) {
  const nums: number[] = [];
  for (const it of items) {
    if (it.kind === "mc_multi") nums.push(...it.qns);
    else if (it.kind === "matching_group") nums.push(...it.qns);
    else if ("qn" in it) nums.push(it.qn);
  }
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function AnswerField({
  item,
  answers,
  setAnswers,
  focusedQn,
  setFocusedQn,
}: {
  item: NormalizedItem;
  answers: AnswersState;
  setAnswers: (next: AnswersState) => void;
  focusedQn: number | null;
  setFocusedQn: (qn: number) => void;
}) {
  const QnBadge = ({ n, txt, isFocused }: { n: number, txt?: string, isFocused: boolean }) => {
    const display = txt || String(n);
    if (isFocused) {
      return (
        <div className="inline-flex items-center justify-center mr-3 font-bold transition-all border-[1.5px] border-[#2181d8] px-1.5 py-[1px] rounded-[3px] text-[#1a1a1a] bg-[#f0f9ff] text-[15px] leading-relaxed shadow-sm">
          {display}
        </div>
      );
    }
    return (
      <span className="font-bold text-[#1a1a1a] mr-3 text-[15px]">{display}</span>
    );
  };

  // Completion / short answer style input
  if (
    item.kind === "note_completion" ||
    item.kind === "table_completion" ||
    item.kind === "flowchart_completion" ||
    item.kind === "sentence_completion" ||
    item.kind === "short_answer"
  ) {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    
    // Parse the text to split by blanks like '______' or '...'
    const parts = item.text.split(/_+|\.{3,}|\[blank\]/i);

    return (
      <div id={`question-${item.qn}`} className="py-2 flex items-center gap-[6px] flex-wrap text-[#1a1a1a]">
        {parts.length > 1 ? (
          parts.map((p, idx) => (
            <span key={idx} className="flex items-center gap-[6px]">
              <span className="text-[17px] leading-relaxed">{p}</span>
              {idx < parts.length - 1 && (
                <input
                  value={value}
                  onFocus={() => setFocusedQn(item.qn)}
                  onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                  placeholder={String(item.qn)}
                  className={`w-24 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
                    focusedQn === item.qn
                      ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                      : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
                  }`}
                />
              )}
            </span>
          ))
        ) : (
          <>
            <div className="text-[17px] font-medium leading-relaxed">{item.text}</div>
            <input
              value={value}
              onFocus={() => setFocusedQn(item.qn)}
              onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
              placeholder={String(item.qn)}
              className={`w-36 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
                focusedQn === item.qn
                  ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                  : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
              }`}
            />
          </>
        )}
      </div>
    );
  }

  // MC single
  if (item.kind === "mc_single") {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    const isFocused = focusedQn === item.qn;

    return (
      <div id={`question-${item.qn}`} className="py-6 border-b border-[#e2e1df] last:border-0">
        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qn} isFocused={isFocused} />
              {item.prompt}
            </div>
          </div>
          <div className="space-y-[22px] mt-6 ml-2">
            {Object.entries(item.options || {}).map(([k, v]) => (
              <label
                key={k}
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setFocusedQn(item.qn)}
              >
                <div className="pt-[2px] flex-shrink-0">
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                    value === k ? "border-[#2181d8] bg-[#2181d8]" : "border-[#767676] group-hover:border-[#4b4b4b] bg-white"
                  }`}>
                    {value === k && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name={key} 
                    value={k} 
                    checked={value === k} 
                    onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })} 
                    className="hidden" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[#1a1a1a] font-normal text-[16px] leading-[1.4] pr-4">{v}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MC multi (two answers)
  if (item.kind === "mc_multi") {
    const keyA = String(item.qns[0]);
    const keyB = String(item.qns[1]);
    const selected = new Set<string>(
      [
        typeof answers[keyA] === "string" ? (answers[keyA] as string) : "",
        typeof answers[keyB] === "string" ? (answers[keyB] as string) : "",
      ].filter(Boolean)
    );

    const toggle = (opt: string) => {
      const next = new Set(selected);
      if (next.has(opt)) next.delete(opt);
      else {
        if (next.size >= item.maxSelect) return;
        next.add(opt);
      }
      const arr = Array.from(next);
      setAnswers({
        ...answers,
        [keyA]: arr[0] || "",
        [keyB]: arr[1] || "",
      });
    };

    const isFocused = focusedQn === item.qns[0];
    const rangeText = `${item.qns[0]}-${item.qns[item.qns.length - 1]}`;

    return (
      <div id={`question-${item.qns[0]}`} className="py-6 border-b border-[#e2e1df] last:border-0">
        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qns[0]} txt={rangeText} isFocused={isFocused} />
              {item.prompt}
            </div>
          </div>
          <div className="space-y-[22px] mt-6 ml-2">
            {Object.entries(item.options || {}).map(([k, v]) => {
              const active = selected.has(k);
              const disabled = !active && selected.size >= item.maxSelect;
              return (
                <label
                  key={k}
                  className={`flex items-start gap-3 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled || active) {
                      toggle(k);
                      setFocusedQn(item.qns[0]);
                    }
                  }}
                >
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors ${
                      active ? "border-[#2181d8] bg-[#2181d8]" : "border-[#767676] group-hover:border-[#4b4b4b] bg-white"
                    }`}>
                      {active && (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[#1a1a1a] font-normal text-[16px] leading-[1.4] pr-4">{v}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Matching Group (Grid)
  if (item.kind === "matching_group") {
    const letters = Object.keys(item.options || {});

    // For "Question 21 - 23" Let's use hyphen formatting
    const headingQns = item.qns.length > 1 ? `${item.qns[0]} - ${item.qns[item.qns.length - 1]}` : `${item.qns[0]}`;

    return (
      <div id={`question-${item.qns[0]}`} className="py-6 border-b border-[#e2e1df] last:border-0 relative">
        <div className="flex flex-col text-[#1a1a1a]">
          
          <div className="font-bold text-[16px] mb-1">Question {headingQns}</div>
          {(item as any).instructions && <div className="text-[16px] mb-4">{(item as any).instructions}</div>}
          
          {/* Radio Grid */}
          <div className="mb-10 overflow-x-auto custom-scrollbar border border-[#999999] max-w-fit rounded-[2px]">
            <table className="min-w-max border-collapse bg-white">
              <thead>
                <tr className="border-b-[1.5px] border-black">
                  <th className="p-3"></th>
                  {letters.map((letter, i) => (
                    <th key={letter} className={`p-4 w-[72px] text-center font-bold border-l border-[#d2d2d2] ${i === 0 ? 'border-l-[#999999]' : ''}`}>
                      {letter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.qns.map((qNum, rIdx) => {
                  const key = String(qNum);
                  const val = typeof answers[key] === "string" ? answers[key] : "";
                  const prompt = item.prompts[rIdx] || "";
                  
                  return (
                    <tr 
                      key={qNum} 
                      className="border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#f9f9f9] transition-colors"
                      onClick={() => setFocusedQn(qNum)}
                    >
                      <td className="p-3 pl-5 pr-8 font-medium text-[15px] whitespace-nowrap min-w-[200px]">
                        <QnBadge n={qNum} isFocused={focusedQn === qNum} />
                        {prompt}
                      </td>
                      {letters.map((letter, i) => (
                        <td key={letter} className={`p-3 text-center border-l border-[#e5e5e5] ${i === 0 ? 'border-l-[#999999]' : ''}`}>
                          <input 
                            type="radio" 
                            name={`match-${qNum}`} 
                            value={letter}
                            checked={val === letter}
                            onChange={(e) => {
                              setAnswers({ ...answers, [key]: e.target.value });
                              setFocusedQn(qNum);
                            }}
                            className="w-[20px] h-[20px] cursor-pointer accent-[#2181d8]"
                          />
                        </td>
                      ))}
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
      </div>
    );
  }

  // Plan labeling placeholder (image + input)
  if (item.kind === "plan_label") {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    return (
      <div id={`question-${item.qn}`} className="py-6 border-b border-[#e2e1df] last:border-0">
        <div className="flex items-start gap-4">
          <QnBadge n={item.qn} isFocused={focusedQn === item.qn} />
          <div className="flex-1 min-w-0">
            {item.prompt && <div className="text-gray-800 font-medium text-[15px] mb-4">{item.prompt}</div>}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm p-2 mb-4">
              <img src={item.imageUrl} alt="Plan/Map/Diagram" className="w-full h-auto rounded-lg" />
            </div>
            <div className="max-w-sm">
              <input
                value={value}
                onFocus={() => setFocusedQn(item.qn)}
                onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                placeholder="Label"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function IntensiveExamTakePage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;
  const sessionId = params?.sessionId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePartIdx, setActivePartIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [focusedQn, setFocusedQn] = useState<number | null>(null);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    examsApi
      .getExam(examId)
      .then((res) => {
        if (!mounted) return;
        setExam(res);
        // Timer: exam.duration in minutes
        setSecondsLeft(res.duration * 60);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load exam");
        setExam(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [examId]);

  // Countdown
  useEffect(() => {
    if (secondsLeft === null) return;
    if (tickRef.current) window.clearInterval(tickRef.current);

    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return null;
        return Math.max(0, s - 1);
      });
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [secondsLeft]);

  const parts = useMemo(() => (exam?.questions?.parts as any[]) || [], [exam]);
  const activePart = parts[activePartIdx] || null;
  const items = useMemo(() => (activePart ? extractAllItemsFromPart(activePart) : []), [activePart]);
  const qNumbers = useMemo(() => questionNumbersFromItems(items), [items]);

  const [playingAudioIdx, setPlayingAudioIdx] = useState(0);
  const currentPlayingPart = parts[playingAudioIdx];
  const audioSrc = currentPlayingPart?.audioUrl || currentPlayingPart?.audio_url || (exam as any)?.audioUrl || (exam as any)?.audio_url || "";

  const handleStartAudio = () => {
    setHasStartedAudio(true);
    if (audioRef.current && audioSrc) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleAudioEnded = () => {
    if (playingAudioIdx < parts.length - 1) {
      setPlayingAudioIdx(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (hasStartedAudio && audioRef.current && audioSrc) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(console.error);
      }
    }
  }, [audioSrc, hasStartedAudio]);

  const answeredSet = useMemo(() => {
    const set = new Set<number>();
    for (const n of qNumbers) {
      const v = answers[String(n)];
      if (Array.isArray(v)) {
        if (v.filter(Boolean).length > 0) set.add(n);
      } else if (typeof v === "string" && v.trim()) set.add(n);
    }
    return set;
  }, [answers, qNumbers]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await examsApi.submitSession(sessionId, answers);
      router.replace(`/ielts/intensive/${encodeURIComponent(examId)}`);
    } catch (e: any) {
      setSubmitError(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // We assume here that parts array has roughly 4 parts for IELTS Listening.
  // The user wants the layout exactly like the image.
  return (
    <div className="h-screen flex flex-col font-sans bg-[#F3F4F6] overflow-hidden text-[#1A1A1A]">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 14px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 1px solid #e1e1e1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border: 3px solid #f1f1f1; border-radius: 7px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}} />
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        preload="auto" 
        autoPlay={hasStartedAudio}
        onEnded={handleAudioEnded}
        className="hidden" 
      />
      
      {/* Top Bar matching image */}
      <header className="h-[60px] flex-shrink-0 bg-white border-b border-gray-300 flex items-center justify-between px-6 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="text-3xl font-extrabold tracking-tighter text-[#D51025]">IELTS</div>
          <div className="flex flex-col justify-center">
            <div className="text-sm font-bold text-gray-900 leading-tight">Test taker ID</div>
            {hasStartedAudio && (
              <div className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 leading-tight mt-0.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4v16a1 1 0 0 1-1.58.81L7 17H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3l4.92-3.81A1 1 0 0 1 13.5 4zm2.5 4v8a1 1 0 0 0 1 1 6 6 0 0 0 0-10 1 1 0 0 0-1 1zm3-3.61v15.22a1 1 0 0 0 1.5.86 10 10 0 0 0 0-16.94 1 1 0 0 0-1.5.86z"/>
                </svg>
                Audio is playing
              </div>
            )}
          </div>
        </div>

        {/* Right Icons matching image */}
        <div className="flex items-center gap-6 text-gray-700">
          <button className="hover:text-gray-900 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 21c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V3c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 4.36 6 6.92 6 10v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
          </button>
          <button className="hover:text-gray-900 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.5 16a5 5 0 0 1 7 0M12 20h.01"/></svg>
          </button>
          <button className="hover:text-gray-900 transition-colors pl-2">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <button
            onClick={submit}
            disabled={submitting || loading}
            className="ml-2 px-4 py-1.5 text-xs font-bold rounded bg-[#D51025] hover:bg-red-700 text-white transition-colors disabled:opacity-60 uppercase"
          >
            {submitting ? "..." : "Finish"}
          </button>
        </div>
      </header>

      {/* Main Single Pane */}
      <main className="flex-1 min-h-0 bg-white shadow-inner relative flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex justify-center mt-32">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin"></div>
          </div>
        ) : error ? (
          <div className="m-8 bg-red-50 text-red-700 border border-red-100 rounded-lg p-6 w-full max-w-2xl mx-auto h-fit">
            {error}
          </div>
        ) : !exam ? (
          <div className="m-8 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg p-6 w-full max-w-2xl mx-auto h-fit">Exam not found.</div>
        ) : (
          <div id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>
            <div className="w-full max-w-[1200px] bg-white pt-10 px-8 lg:px-12 pb-32" onClick={(e) => e.stopPropagation()}>
              
              {/* Part Instruction Box */}
              <div className="bg-[#f2f1ef] border border-[#e2e1df] rounded py-5 px-6 mb-8 text-[#1a1a1a]">
                <div className="font-bold text-[17px] mb-1">{getPartTitle(activePart)}</div>
                <div className="text-[17px]">
                  Listen and answer questions {qNumbers.length > 0 ? `${qNumbers[0]} - ${qNumbers[qNumbers.length - 1]}` : ""}.
                </div>
              </div>
              
              {/* Group Instructions Placeholder - hidden to rely on individual question prompts/instructions */}

              {submitError && (
                <div className="mb-8 bg-red-50 text-red-700 border border-red-100 rounded p-4 font-medium">
                  {submitError}
                </div>
              )}

              {/* Questions Area */}
              <div className="space-y-6 text-[#1a1a1a] pb-10">
                {items.length === 0 ? (
                  <div className="py-12 border border-gray-200 border-dashed rounded bg-gray-50 text-center text-gray-500">
                    No questions mapped.
                  </div>
                ) : (
                  items.map((it, idx) => (
                    <AnswerField key={`${idx}`} item={it} answers={answers} setAnswers={setAnswers} focusedQn={focusedQn} setFocusedQn={setFocusedQn} />
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* Floating Next/Back Arrows mappings to Question navigation */}
        {!loading && !error && exam && (
          <div className="absolute bottom-6 right-[max(32px,calc(50vw-600px+32px))] flex gap-1 z-10 opacity-90 transition-opacity hover:opacity-100">
            <button
              onClick={() => {
                const idx = focusedQn ? qNumbers.indexOf(focusedQn) : 0;
                if (idx > 0) {
                  const prev = qNumbers[idx - 1];
                  setFocusedQn(prev);
                  document.getElementById(`question-${prev}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              disabled={focusedQn === qNumbers[0]}
              className="w-14 h-14 bg-[#f2f2f2] hover:bg-[#e0e0e0] border border-[#d6d6d6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white stroke-[#7f7f7f] stroke-[2.5] fill-none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
               onClick={() => {
                const idx = focusedQn ? qNumbers.indexOf(focusedQn) : -1;
                if (idx < qNumbers.length - 1) {
                  const next = qNumbers[idx + 1];
                  setFocusedQn(next);
                  document.getElementById(`question-${next}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              disabled={focusedQn === qNumbers[qNumbers.length - 1]}
              className="w-14 h-14 bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white stroke-current stroke-[2.5] fill-none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Ribbon matching spaced Parts view */}
      {!loading && !error && exam && (
        <footer className="h-[60px] flex-shrink-0 bg-[#f8f9fa] border-t border-gray-300 z-20 flex items-center px-4 w-full">
          <div className="flex-1 flex items-center h-full justify-between gap-6 overflow-x-auto custom-scrollbar px-2 sm:px-[10%]">
            {parts.map((p, idx) => {
              const isActiveLocal = idx === activePartIdx;
              const partQNumbers = questionNumbersFromItems(extractAllItemsFromPart(p));
              const answeredLocalCount = partQNumbers.filter(n => answeredSet.has(n)).length;
              const isCompleted = answeredLocalCount === partQNumbers.length && partQNumbers.length > 0;

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col h-full justify-center min-w-max relative gap-1.5 cursor-pointer hover:bg-[#f0f0f0] px-4 transition-colors ${isActiveLocal ? "" : "opacity-80"} pt-1`}
                  onClick={() => {
                    setActivePartIdx(idx);
                    if (partQNumbers.length > 0) setFocusedQn(partQNumbers[0]);
                  }}
                >
                  
                  {isActiveLocal && (
                    <div className="absolute top-0 left-0 w-full flex">
                      <div className="h-[3px] bg-[#dcdcdc] flex-1"></div>
                    </div>
                  )}

                  <div className="flex items-center gap-[6px]">
                    {isCompleted && (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#303030] fill-current mr-[-2px]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                    <span className={`font-bold text-[14px] ${isActiveLocal ? "text-black" : "text-gray-600"} tracking-wide`}>
                      Part {idx + 1}
                    </span>
                    
                    {isActiveLocal ? (
                      <div className="flex items-center gap-[1px] ml-2">
                        {partQNumbers.map((n) => {
                           const answeredLocal = answeredSet.has(n);
                           const isFocused = focusedQn === n;
                           return (
                             <div
                               key={n}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setFocusedQn(n);
                                 document.getElementById(`question-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                               }}
                               className={`w-[24px] h-[24px] flex items-center justify-center text-[12px] font-medium transition-colors cursor-pointer ${
                                 isFocused
                                   ? "bg-white text-black border-[1.5px] border-[#2181d8]"
                                   : "bg-white text-black border border-[#d2d2d2] hover:border-gray-500 hover:bg-gray-50"
                               }`}
                             >
                               {n}
                             </div>
                           );
                        })}
                      </div>
                    ) : (
                      <span className="text-[13px] text-gray-500 font-medium ml-2">
                        {answeredLocalCount} of {partQNumbers.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-16 h-full border-l border-gray-200 flex items-center justify-center bg-[#f2f1ef] cursor-pointer hover:bg-gray-200 transition-colors">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-700 font-extrabold" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          </div>
        </footer>
      )}

      {/* Start Audio Overlay */}
      {!hasStartedAudio && !loading && !error && exam && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center text-white px-6">
          <svg viewBox="0 0 24 24" className="w-[100px] h-[100px] mb-8 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h3v-8H5v-1a7 7 0 1 1 14 0v1h-3v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
          </svg>
          <div className="text-[20px] font-medium text-center max-w-3xl mb-6 leading-relaxed">
            You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
          </div>
          <div className="text-[19px] font-medium mb-8">
            To continue, click Play.
          </div>
          <button
            onClick={handleStartAudio}
            className="flex items-center gap-3 bg-black hover:bg-[#1a1a1a] px-8 py-3.5 rounded-[3px] font-bold text-[18px] text-white transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center pl-0.5">
               <svg viewBox="0 0 24 24" className="w-4 h-4 text-black fill-current"><path d="M8 5v14l11-7z"/></svg>
            </div>
            Play
          </button>
        </div>
      )}

    </div>
  );
}

