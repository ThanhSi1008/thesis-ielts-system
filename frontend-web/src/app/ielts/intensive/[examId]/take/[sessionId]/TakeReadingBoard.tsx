"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { type ExamDetail } from "@/types";
import { type AnswersState, AnswerField, getPartTitle, questionNumbersFromItems } from "@/components/AnswerField";
import { extractAllItemsFromPart } from "@/lib/ieltsIntensiveExam-parser";
import { getIeltsReadingBand } from "@/lib/bands";

interface TakeReadingBoardProps {
  ieltsIntensiveExam: ExamDetail;
  sessionInfo: any;
  submitAndTrack: (data: any) => Promise<any>;
  submitting: boolean;
  submitResult: any;
  submitError: string | null;
  answers: AnswersState;
  setAnswers: (a: AnswersState) => void;
  formatTime: (sec: number) => string;
  secondsLeft: number;
}

export default function TakeReadingBoard({
  ieltsIntensiveExam,
  sessionInfo,
  submitAndTrack,
  submitting,
  submitResult,
  submitError,
  answers,
  setAnswers,
  formatTime,
  secondsLeft,
}: TakeReadingBoardProps) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [focusedQn, setFocusedQn] = useState<number | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const searchParams = useSearchParams();
  const autoSubmit = searchParams ? searchParams.get("autoSubmit") !== "false" : true;

  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const parts = useMemo(() => {
    return (ieltsIntensiveExam?.questions?.parts as any[]) || [];
  }, [ieltsIntensiveExam]);

  const activePart = parts[activePartIdx] || null;
  const items = useMemo(() => (activePart ? extractAllItemsFromPart(activePart) : []), [activePart]);
  const qNumbers = useMemo(() => questionNumbersFromItems(items), [items]);

  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    for (const [k, v] of Object.entries(answers)) {
      if (typeof v === "string" && v.trim() !== "") s.add(parseInt(k));
      else if (Array.isArray(v) && v.length > 0) s.add(parseInt(k));
    }
    return s;
  }, [answers]);



  useEffect(() => {
    if (autoSubmit && !submitting && !submitResult && secondsLeft === 0 && !isConfirmingSubmit) {
      handleFinalSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, submitting, submitResult, isConfirmingSubmit, autoSubmit]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const container = document.getElementById("main-split-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        // Compute percentage width from the container's left
        let newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        // Constrain width between 20% and 80%
        newWidth = Math.max(20, Math.min(newWidth, 80));
        setLeftPaneWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleFinalSubmit = () => {
    const timeTaken = (ieltsIntensiveExam.duration * 60) - secondsLeft;
    submitAndTrack({
      sessionId: sessionInfo.id,
      examId: ieltsIntensiveExam.id,
      examType: "READING",
      answers,
      timeTaken,
      resultUrl: `/ielts/intensive/${ieltsIntensiveExam.id}/ieltsIntensiveResult/${sessionInfo.id}`,
    });
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-[#F3F4F6] overflow-hidden text-[#1A1A1A]">
      <header className="h-[60px] flex-shrink-0 bg-white border-b border-gray-300 flex items-center justify-between px-6 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <div className="text-3xl font-extrabold tracking-tighter text-[#D51025]">IELTS</div>
          <div className="flex flex-col justify-center">
            <div className="text-sm font-bold text-gray-900 leading-tight">Test taker ID<span className="text-[#1a1a1a] ml-1"></span></div>
            <div className={`text-[13px] mt-0.5 leading-tight ${(secondsLeft !== null && secondsLeft < 600) ? 'text-red-600 animate-pulse font-bold' : 'text-gray-600 font-medium'}`}>
              {secondsLeft !== null ? formatTime(secondsLeft) : '--:--'}  minutes remaining
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-700">
          <button className="hover:text-black transition-colors" title="Connection status">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-black">
              <path d="M1 9l2 2c5-4 13-4 18 0l2-2C16.9 3.9 7.1 3.9 1 9zm8 8l3 4 3-4c-1.7-2.2-4.3-2.2-6 0zm-4-4l2 2c2.5-2.2 6.5-2.2 9 0l2-2C14.3 9.4 9.7 9.4 5 13z" />
            </svg>
          </button>
          <button className="hover:text-black transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="hover:text-black transition-colors pl-2 mr-2">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <button
            onClick={() => setIsConfirmingSubmit(true)}
            disabled={submitting || submitResult}
            className="ml-2 px-4 py-1.5 text-[13px] font-black rounded bg-[#D51025] hover:bg-red-700 text-white transition-all active:scale-95 disabled:opacity-60 uppercase"
          >
            {submitting ? "..." : "FINISH"}
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-[#f5f5f5] relative overflow-hidden">
        <div key={activePartIdx} id="main-split-container" className="w-full h-full flex flex-col overflow-hidden relative" onClick={() => setFocusedQn(null)}>
          <div className="w-full px-4 py-2">
            <div className="bg-[#f2f1ef] border border-[#e2e1df] rounded py-3 px-4 text-[#1a1a1a]">
              <div className="font-bold text-[17px] mb-1">{getPartTitle(activePart)}</div>
              <div className="text-[16px]">
                Read the text and answer questions {qNumbers.length > 0 ? `${qNumbers[0]}–${qNumbers[qNumbers.length - 1]}` : ""}.
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-row overflow-hidden w-full">
            {/* Left Pane - Passage */}
            <div
              style={{ width: `${leftPaneWidth}%` }}
              className="flex-shrink-0 h-full overflow-y-auto custom-scrollbar px-8 py-8 pb-16 bg-[#faf9f8]"
              onClick={(e) => e.stopPropagation()}
            >
              {(activePart as any)?.topic && (
                <h2 className="text-2xl font-bold mb-6">{(activePart as any).topic}</h2>
              )}
              <div className="text-[#1a1a1a] leading-relaxed text-[16px] space-y-5">
                {((activePart as any)?.passage_text || "")
                  .split('\n')
                  .filter((para: string) => {
                    const cleanPara = para.replace(/\*\*/g, '').trim().toLowerCase();
                    const cleanTopic = ((activePart as any)?.topic || "").trim().toLowerCase();
                    return cleanPara !== cleanTopic && cleanPara.length > 0;
                  })
                  .map((para: string, i: number) => {
                    let textForTake = para.replace(/\s*(?:\*)?\((Q\d+[^)]*)\)(?:\*)?/g, '');
                    textForTake = textForTake.replace(/\*\*\`(.*?)\`\*\*/g, '$1');
                    textForTake = textForTake.replace(/(^)?\*\*(.*?)\*\*/g, (match, isStart, content) => {
                      if (isStart !== undefined && content.trim().length === 1 && /[A-Za-z]/.test(content.trim())) {
                        return `**${content}**`;
                      }
                      return content;
                    });

                    let htmlContent = textForTake.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    htmlContent = htmlContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                    const matchBold = htmlContent.match(/^<strong>\s*([A-Za-z])\s*<\/strong>[\s\.]*(.*)/);
                    if (matchBold) {
                      return (
                        <div key={i} className="mb-1">
                          <div className="font-bold text-[17px] mb-2">{matchBold[1].toUpperCase()}</div>
                          <p dangerouslySetInnerHTML={{ __html: matchBold[2] }} />
                        </div>
                      );
                    }
                    return <p key={i} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                  })}
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="w-1.5 cursor-col-resize bg-[#d8d8d8] hover:bg-[#2181d8] active:bg-[#1a65a9] transition-colors flex-shrink-0 z-50 relative flex justify-center items-center group"
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            >
              <div className="absolute w-[22px] h-[22px] bg-[#f8f9fa] border-[1.5px] border-[#666666] group-hover:border-[#2181d8] text-[#555555] group-hover:text-[#2181d8] flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
                  <polyline points="9 16 5 12 9 8" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="15 16 19 12 15 8" />
                </svg>
              </div>
            </div>

            {/* Right Pane - Questions */}
            <div
              style={{ flex: 1 }}
              id="main-scroll-container"
              className="h-full flex flex-col items-center custom-scrollbar overflow-y-auto overflow-x-hidden relative min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full bg-[#faf9f8] pt-4 px-8 pr- pb-16">
                {submitError && (
                  <div className="mb-8 bg-red-50 text-red-700 border border-red-100 rounded p-4 font-medium">
                    {submitError}
                  </div>
                )}
                <div className="space-y-6 text-[#1a1a1a] pb-10">
                  {items.length === 0 ? (
                    <div className="py-12 border border-gray-200 border-dashed rounded bg-gray-50 text-center text-gray-500">
                      No questions mapped.
                    </div>
                  ) : (
                    items.map((it, idx) => (
                      <AnswerField key={String(idx)} item={it} answers={answers} setAnswers={setAnswers} focusedQn={focusedQn} setFocusedQn={setFocusedQn} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 hidden md:flex gap-1 z-10 opacity-90 transition-opacity hover:opacity-100">
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
              className="w-14 h-14 bg-[#f2f2f2] hover:bg-[#e0e0e0] border border-[#d6d6d6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow"
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
              className="w-14 h-14 bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white stroke-current stroke-[2.5] fill-none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>
      </main>

      <footer className="h-[60px] flex-shrink-0 bg-[#f8f9fa] z-20 flex items-center px-6 w-full shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex-1 flex items-center h-full justify-between gap-6 overflow-x-auto custom-scrollbar">
          {parts.map((p, idx) => {
            const isActiveLocal = idx === activePartIdx;
            const partQNumbers = questionNumbersFromItems(extractAllItemsFromPart(p));
            const answeredLocalCount = partQNumbers.filter(n => answeredSet.has(n)).length;
            const isCompleted = answeredLocalCount === partQNumbers.length && partQNumbers.length > 0;
            return (
              <div
                key={idx}
                className={`flex h-full items-center min-w-max relative cursor-pointer hover:bg-[#f0f0f0] px-4 transition-colors ${isActiveLocal ? "" : "opacity-80"}`}
                onClick={() => {
                  setActivePartIdx(idx);
                  if (partQNumbers.length > 0) setFocusedQn(partQNumbers[0]);
                }}
              >
                {isActiveLocal ? (
                  <div className="flex items-center h-full">
                    <div className="relative h-full flex items-center pr-3">
                      <div className={`absolute top-0 left-0 right-3 h-[3px] ${isCompleted ? 'bg-[#319c28]' : 'bg-[#dcdcdc]'}`} />
                      <span className="font-bold text-[14px] text-black tracking-wide">Part {idx + 1}</span>
                    </div>
                    <div className="flex items-center h-full gap-1">
                      {partQNumbers.map((n) => {
                        const answeredLocal = answeredSet.has(n);
                        const isFocused = focusedQn === n;
                        return (
                          <div key={n} className="relative h-full flex items-center justify-center w-[26px]">
                            <div className={`absolute top-0 left-0 w-full h-[3px] ${answeredLocal ? 'bg-[#319c28]' : 'bg-[#dcdcdc]'}`} />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusedQn(n);
                                document.getElementById(`question-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className={`w-[24px] h-[24px] flex items-center justify-center text-[13.5px] transition-colors cursor-pointer ${isFocused
                                ? "bg-transparent text-black font-bold border-[1.5px] border-[#2181d8]"
                                : "bg-transparent hover:bg-[#e2e2e2]"
                                }`}
                            >
                              {n}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-[6px]">
                    {isCompleted && (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#303030] fill-current mr-[-2px]">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                    <span className="font-medium text-[15px] text-[#1a1a1a]">Part {idx + 1}</span>
                    <span className="text-[14px] text-gray-500 font-normal ml-3 tracking-wide">{answeredLocalCount} of {partQNumbers.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          onClick={() => setIsConfirmingSubmit(true)}
          className="w-16 h-full border-l border-gray-200 flex items-center justify-center bg-[#f2f1ef] cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-700 font-extrabold" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </footer>

      {isConfirmingSubmit && !submitting && !submitResult && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
              <p className="text-gray-600">Are you sure you want to finish and submit the test? You will not be able to change your answers afterward.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmingSubmit(false)}
                className="px-4 py-2 font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsConfirmingSubmit(false);
                  handleFinalSubmit();
                }}
                className="px-4 py-2 font-bold text-white bg-[#D51025] rounded hover:bg-red-700 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitting Overlay ── */}
      {submitting && !submitResult && !submitError && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center px-4">
          <div className="relative mb-10">
            <div className="w-24 h-24 rounded-full border-[3px] border-white/10" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-[3px] border-transparent border-t-[#D51025] animate-spin" />
            <div className="absolute inset-[10px] w-[72px] h-[72px] rounded-full border-[2px] border-transparent border-t-white/30 animate-spin" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current opacity-60">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
            Submitting your test…
          </h2>
          <p className="text-white/50 text-sm font-medium mb-2 text-center max-w-xs">
            Sending your answers…
          </p>
          <div className="flex items-center gap-2 mb-10">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
