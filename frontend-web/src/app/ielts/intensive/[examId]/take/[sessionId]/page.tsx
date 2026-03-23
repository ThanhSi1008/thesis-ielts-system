"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { examsApi } from "@/services/exams.api";
import type { ExamDetail } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";

type AnswersState = Record<string, string | string[]>;

import { extractAllItemsFromPart, type NormalizedItem } from "@/lib/exam-parser";

function getPartTitle(part: any) {
  return `Part ${part?.part_number ?? ""}`.trim();
}

function questionNumbersFromItems(items: NormalizedItem[]) {
  const nums: number[] = [];
  for (const it of items) {
    if ("qns" in it && it.qns) nums.push(...it.qns);
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
    item.kind === "flowchart_completion" ||
    item.kind === "sentence_completion" ||
    item.kind === "short_answer"
  ) {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";

    // Parse the text to split by blanks like '______' or '...'
    const parts = (item.text || "").split(/_+|\.{3,}|\[blank\]/i);

    return (
      <div id={`question-${item.qn}`} className="pb-2 pt-1 flex flex-col gap-1 text-[#1a1a1a]">
        {(item as any).qns && (
          <div className="font-bold text-[18px] mb-1 mt-4">
            Questions {(item as any).qns.length > 1 ? `${(item as any).qns[0]} - ${(item as any).qns[(item as any).qns.length - 1]}` : String((item as any).qns[0])}
          </div>
        )}
        {(item as any).instructions && (
          <div className="text-[16px] mb-4 text-[#333333]" dangerouslySetInnerHTML={{
            __html: (item as any).instructions.replace(/(ONE WORD ONLY|NO MORE THAN [A-Z]+ WORDS?( AND\/OR A NUMBER)?)/g, '<span class="font-bold uppercase">$1</span>')
          }} />
        )}


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
                <span key={idx} className="flex items-center gap-[6px]">
                  <span className="text-[17px] leading-relaxed">{p}</span>
                  {idx < parts.length - 1 && (
                    <input
                      value={value}
                      onFocus={() => setFocusedQn(item.qn)}
                      onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                      placeholder={String(item.qn)}
                      className={`w-24 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${focusedQn === item.qn
                        ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                        : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
                        }`}
                    />
                  )}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-[6px] flex-wrap">
                <div className="text-[17px] font-medium leading-relaxed">{item.text}</div>
                <input
                  value={value}
                  onFocus={() => setFocusedQn(item.qn)}
                  onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                  placeholder={String(item.qn)}
                  className={`w-36 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${focusedQn === item.qn
                    ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                    : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
                    }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "table_completion") {
    return (
      <div className="py-4 overflow-x-auto text-[#1a1a1a] w-full">

        {(item as any).title && <div className="font-bold text-[16px] mb-3 text-center text-[#333333] uppercase leading-relaxed">{(item as any).title}</div>}
        <table className="w-full border-collapse border border-[#d1d1d1] text-[15px]">
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
                    const key = String(cell.question_number);
                    const value = typeof answers[key] === "string" ? answers[key] : "";
                    const parts = (cell.text || "").split(/_+|\.{3,}|\[blank\]/i);
                    return (
                      <td key={cIdx} className="border border-[#e2e1df] px-3 py-4 align-middle">
                        <div id={`question-${cell.question_number}`} className="flex items-center gap-[6px] flex-wrap">
                          {parts.length > 1 ? (
                            parts.map((p, idx) => (
                              <span key={idx} className="flex items-center gap-[6px]">
                                {p && <span className="leading-relaxed">{p}</span>}
                                {idx < parts.length - 1 && (
                                  <input
                                    value={value}
                                    onFocus={() => setFocusedQn(cell.question_number!)}
                                    onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                                    placeholder={String(cell.question_number)}
                                    className={`w-28 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${focusedQn === cell.question_number
                                      ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                                      : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
                                      }`}
                                  />
                                )}
                              </span>
                            ))
                          ) : (
                            <>
                              {cell.text && <span className="leading-relaxed">{cell.text}</span>}
                              <input
                                value={value}
                                onFocus={() => setFocusedQn(cell.question_number!)}
                                onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                                placeholder={String(cell.question_number)}
                                className={`w-32 h-[30px] rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${focusedQn === cell.question_number
                                  ? "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                                  : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e]"
                                  }`}
                              />
                            </>
                          )}
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
  if (item.kind === "mc_single") {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    const isFocused = focusedQn === item.qn;

    const isTF = (item as any).isTrueFalse;

    return (
      <div id={`question-${item.qn}`} className="pb-6 pt-1 ">


        {(item as any).instructions && (
          <div className="mb-6">
            <div className="font-bold text-[18px] mb-1 text-[#1a1a1a]">
              Questions {(item as any).qns?.length > 1 ? `${(item as any).qns[0]}-${(item as any).qns[(item as any).qns.length - 1]}` : item.qn}
            </div>
            <div
              className="text-[16px] text-[#333333]"
              dangerouslySetInnerHTML={{
                __html: (item as any).instructions.replace(/(TRUE|FALSE|NOT GIVEN|YES|NO)/g, '<span class="font-bold uppercase">$1</span>')
              }}
            />
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium">
              <QnBadge n={item.qn} isFocused={isFocused} />
              {item.prompt}
            </div>
          </div>
          <div className={`space-y-[16px] mt-6 ${isTF ? "ml-[40px]" : "ml-2"}`}>
            {Object.entries(item.options || {}).map(([k, v]) => (
              <label
                key={k}
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setFocusedQn(item.qn)}
              >
                <div className="pt-[2px] flex-shrink-0">
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${value === k ? "border-[#2181d8] bg-[#2181d8]" : "border-[#767676] group-hover:border-[#4b4b4b] bg-white"
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

    const isFocused = focusedQn === item.qns[0] || focusedQn === item.qns[1];
    const rangeText = `${item.qns[0]} - ${item.qns[item.qns.length - 1]}`;

    return (
      <div id={`question-${item.qns[0]}`} className="pb-6 pt-1 ">


        <div className="mb-6">
          <div className="font-bold text-[18px] mb-1">
            Questions {rangeText}
          </div>
          {(item as any).instructions && (
            <div
              className="text-[16px] text-[#333333]"
              dangerouslySetInnerHTML={{
                __html: (item as any).instructions
                  .split('.')[0]
                  .replace(/letters?,?\s*[A-Z][–-][A-Z]/i, 'correct answers')
                  .replace(/(TWO|THREE|FOUR|FIVE)/g, '<span class="font-bold uppercase">$1</span>')
                  + '.'
              }}
            />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div
              className="text-[#1a1a1a] leading-relaxed text-[16px] font-medium whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: item.prompt.replace(/(TWO|THREE|FOUR|FIVE)/g, '<span class="font-bold uppercase">$1</span>')
              }}
            />
          </div>
          <div className="space-y-[16px] mt-6 ml-1">
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
                    <div className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors ${active ? "border-[#2181d8] bg-[#2181d8]" : "border-[#767676] group-hover:border-[#4b4b4b] bg-white"}`}>
                      {active && (
                        <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
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

  // Summary Completion
  if (item.kind === "summary_completion") {
    // We split the item.text by numeric blanks e.g. "18 [blank]" or just "18" followed by blank
    const textPieces: React.ReactNode[] = [];
    const regex = /(\d+)\s*\[blank\]/g;
    let lastIndex = 0;

    // We will parse the string manually
    const str = item.text || "";
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        textPieces.push(<span key={`text-${lastIndex}`}>{str.substring(lastIndex, match.index)}</span>);
      }
      const qNum = parseInt(match[1]);
      const key = String(qNum);
      const value = typeof answers[key] === "string" ? answers[key] : "";

      const hasOptions = item.options && Object.keys(item.options).length > 0;

      if (hasOptions) {
        const displayVal = item.options![value] || value;
        textPieces.push(
          <span
            key={`drop-${qNum}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedKey = e.dataTransfer.getData("text/plain");
              if (item.options && item.options[draggedKey]) {
                setAnswers({ ...answers, [key]: draggedKey });
                setFocusedQn(qNum);
              }
            }}
            onClick={() => {
              if (value) {
                const newAns = { ...answers };
                delete newAns[key];
                setAnswers(newAns);
              }
              setFocusedQn(qNum);
            }}
            className={`inline-flex items-center justify-center min-w-[100px] h-[32px] px-3 mx-1 text-[15px] font-medium align-middle cursor-pointer transition-colors ${value
              ? "bg-white border border-[#b5b5b5] text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.1)] rounded-[3px]"
              : "bg-[#f8f9fa] border border-dashed border-[#b5b5b5] text-[#a0a0a0] rounded-[3px] hover:bg-[#f0f0f0]"
              } ${focusedQn === qNum && !value ? "border-[#2181d8] ring-[1px] ring-[#2181d8]" : ""}`}
            title={value ? "Click to remove" : ""}
          >
            {value ? displayVal : <span className="font-bold text-[#333333]">{qNum}</span>}
          </span>
        );
      } else {
        textPieces.push(
          <span key={`input-${qNum}`} className="inline-flex items-center gap-1 mx-1 align-middle">
            <span className="text-[12px] font-bold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">{qNum}</span>
            <input
              value={value}
              onFocus={() => setFocusedQn(qNum)}
              onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
              className={`w-32 h-[26px] py-0 px-2 text-[15px] font-bold text-[#1a1a1a] border border-[#b5b5b5] rounded-[3px] shadow-inner focus:outline-none transition-colors ${focusedQn === qNum ? "border-[#2181d8] ring-[1px] ring-[#2181d8] bg-[#f0f9ff]" : "hover:border-[#8e8e8e] bg-white"}`}
            />
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      textPieces.push(<span key={`text-${lastIndex}`}>{str.substring(lastIndex)}</span>);
    }

    const firstQn = item.qns[0];
    const isFocused = item.qns.includes(focusedQn || -1);

    return (
      <div id={`question-${firstQn}`} className="pb-6 pt-1 relative">
        <div className="flex flex-col text-[#1a1a1a]">
          <div className="font-bold text-[18px] mb-1">
            Questions {item.qns.length > 1 ? `${firstQn} - ${item.qns[item.qns.length - 1]}` : String(firstQn)}
          </div>
          {(item as any).instructions && (
            <div
              className="text-[16px] mb-4 text-[#333333]"
              dangerouslySetInnerHTML={{
                __html: (item as any).instructions
                  .replace(/(ONE WORD ONLY|NO MORE THAN [A-Z]+ WORDS?( AND\/OR A NUMBER)?)/g, '<span class="font-bold">$1</span>')
              }}
            />
          )}

          <div className="mb-4 mt-2">
            {item.heading && <div className="font-bold text-[16px] uppercase mb-4 text-center">{item.heading}</div>}
            <div className="text-[16px] leading-[2.1] font-normal text-[#2d2d2d] text-justify whitespace-pre-wrap">
              {textPieces}
            </div>
          </div>

          {item.options && Object.keys(item.options).length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 justify-center items-center py-6 px-4 bg-white">
              {Object.entries(item.options).map(([k, v]) => {
                const isUsed = item.qns.some(q => answers[String(q)] === k);
                return (
                  <div
                    key={k}
                    draggable={!isUsed}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", k);
                    }}
                    className={`px-4 py-1.5 border rounded-[3px] text-[15px] font-medium transition-colors ${isUsed
                      ? "bg-[#f5f5f5] border-[#e0e0e0] text-[#b0b0b0] cursor-not-allowed"
                      : "bg-white border-[#b5b5b5] text-[#1a1a1a] cursor-grab hover:bg-[#f9f9f9] shadow-sm active:cursor-grabbing"
                      }`}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          )}
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
      <div id={`question-${item.qns[0]}`} className="pb-6 pt-1 relative">

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
          {Object.values(item.options || {}).some(v => v.trim() !== "") && (
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
          )}

        </div>
      </div>
    );
  }

  // Plan labeling placeholder (image + input)
  if (item.kind === "plan_label") {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    return (
      <div id={`question-${item.qn}`} className="pb-6 pt-1 ">

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

function getIeltsListeningBand(score: number): number {
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

export default function IntensiveTestTakePage() {
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
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

  const [focusedQn, setFocusedQn] = useState<number | null>(null);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);

  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [leaveCallback, setLeaveCallback] = useState<(() => void) | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const tickRef = useRef<number | null>(null);
  const timeTakenTickRef = useRef<number | null>(null);

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

  // Trap refresh and close tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitting || submitResult || isConfirmingSubmit) return;
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will not be saved.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitting, submitResult, isConfirmingSubmit]);

  // Trap back button
  useEffect(() => {
    if (submitting || submitResult) return;
    // Push trap state
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (submitting || submitResult) return;
      // Re-push state instantly so the URL doesn't actually change
      window.history.pushState(null, "", window.location.href);

      setShowLeaveWarning(true);
      setLeaveCallback(() => () => {
        window.removeEventListener("popstate", handlePopState);
        window.history.go(-2);
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [submitting, submitResult]);

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

  // Active Time Tracker
  useEffect(() => {
    if (!hasStartedAudio || submitting || submitResult) return;

    timeTakenTickRef.current = window.setInterval(() => {
      setTimeTaken((t) => t + 1);
    }, 1000);

    return () => {
      if (timeTakenTickRef.current) window.clearInterval(timeTakenTickRef.current);
      timeTakenTickRef.current = null;
    };
  }, [hasStartedAudio, submitting, submitResult]);

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
      const resp = await examsApi.submitSession(sessionId, answers, timeTaken);
      // Redirect to the dedicated result page
      router.replace(`/ielts/intensive/${encodeURIComponent(examId)}/result/${encodeURIComponent(sessionId)}`);
    } catch (e: any) {
      setSubmitError(e?.message || "Submit failed");
      setSubmitting(false);
    }
  };

  // We assume here that parts array has roughly 4 parts for IELTS Listening.
  // The user wants the layout exactly like the image.
  return (
    <div className="h-screen flex flex-col font-sans bg-[#F3F4F6] overflow-hidden text-[#1A1A1A]">
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
                  <path d="M13.5 4v16a1 1 0 0 1-1.58.81L7 17H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3l4.92-3.81A1 1 0 0 1 13.5 4zm2.5 4v8a1 1 0 0 0 1 1 6 6 0 0 0 0-10 1 1 0 0 0-1 1zm3-3.61v15.22a1 1 0 0 0 1.5.86 10 10 0 0 0 0-16.94 1 1 0 0 0-1.5.86z" />
                </svg>
                Audio is playing
              </div>
            )}
          </div>
        </div>

        {/* Right Icons matching image */}
        <div className="flex items-center gap-6 text-gray-700">
          <button className="hover:text-gray-900 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 21c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V3c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 4.36 6 6.92 6 10v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>
          </button>
          <button className="hover:text-gray-900 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.5 16a5 5 0 0 1 7 0M12 20h.01" /></svg>
          </button>
          <button className="hover:text-gray-900 transition-colors pl-2">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button
            onClick={() => setIsConfirmingSubmit(true)}
            disabled={submitting || loading || submitResult}
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
        ) : exam.type === "READING" ? (
          <div key={activePartIdx} id="main-split-container" className="w-full h-full flex flex-col overflow-hidden relative bg-[#faf9f8]" onClick={() => setFocusedQn(null)}>

            {/* Top Span Banner */}
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
              <div className="w-1/2 h-full overflow-y-auto custom-scrollbar border-r border-[#e2e1df] px-8 py-8 pb-16 bg-[#faf9f8]" onClick={(e) => e.stopPropagation()}>
                {(activePart as any).topic && (
                  <h2 className="text-2xl font-bold mb-6">{(activePart as any).topic}</h2>
                )}
                <div className="text-[#1a1a1a] leading-relaxed text-[16px] space-y-5">
                  {((activePart as any).passage_text || "")
                    .split('\n')
                    .filter((para: string) => {
                      const cleanPara = para.replace(/\*\*/g, '').trim().toLowerCase();
                      const cleanTopic = ((activePart as any).topic || "").trim().toLowerCase();
                      return cleanPara !== cleanTopic && cleanPara.length > 0;
                    })
                    .map((para: string, i: number) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                </div>
              </div>

              {/* Right Pane - Questions */}
              <div id="main-scroll-container" className="w-1/2 h-full flex flex-col items-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={(e) => e.stopPropagation()}>
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
          </div>
        ) : (
          <div key={activePartIdx} id="main-scroll-container" className="w-full flex justify-center custom-scrollbar overflow-y-auto overflow-x-hidden relative" onClick={() => setFocusedQn(null)}>
            <div className="w-full bg-white pt-10 px-6 pb-32" onClick={(e) => e.stopPropagation()}>


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
          <div className="absolute bottom-6 right-[max(12px,calc(50vw-700px+12px))] flex gap-1 z-10 opacity-90 transition-opacity hover:opacity-100">

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
        <footer className="h-[60px] flex-shrink-0 bg-[#f8f9fa] border-t border-gray-300 z-20 flex items-center px-6 w-full">
          <div className="flex-1 flex items-center h-full justify-between gap-6 overflow-x-auto custom-scrollbar">
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
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
                              className={`w-[24px] h-[24px] flex items-center justify-center text-[12px] font-medium transition-colors cursor-pointer ${isFocused
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
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-gray-700 font-extrabold" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          </div>
        </footer>
      )}

      {/* Confirm Submit Overlay */}
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
                  submit();
                }}
                className="px-4 py-2 font-bold text-white bg-[#D51025] rounded hover:bg-red-700 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting / Calculating Score Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center px-4">
          {/* Spinning ring */}
          <div className="relative mb-10">
            <div className="w-24 h-24 rounded-full border-[3px] border-white/10" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-[3px] border-transparent border-t-[#D51025] animate-spin" />
            <div className="absolute inset-[10px] w-[72px] h-[72px] rounded-full border-[2px] border-transparent border-t-white/30 animate-spin" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current opacity-60" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2">
            Calculating your score
          </h2>
          <p className="text-white/50 text-sm font-medium mb-8 text-center max-w-xs">
            Grading your answers and computing your IELTS band score…
          </p>

          {/* Animated step dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Start Audio Overlay */}
      {!hasStartedAudio && !loading && !error && exam && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center text-white px-6">
          <svg viewBox="0 0 24 24" className="w-[100px] h-[100px] mb-8 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h3v-8H5v-1a7 7 0 1 1 14 0v1h-3v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z" />
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
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-black fill-current"><path d="M8 5v14l11-7z" /></svg>
            </div>
            Play
          </button>
        </div>
      )}

      {/* Submit Result Overlay */}
      {submitResult && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-[#111111] px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
            <h2 className="text-2xl font-extrabold mb-2 text-center text-gray-900">Test Completed</h2>
            <div className="text-gray-500 mb-8 text-center font-medium">Your answers have been graded automatically.</div>

            <div className="flex gap-8 mb-8 w-full justify-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-[#D51025]">{submitResult.totalScore}/40</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Raw Score</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-[#D51025]">{getIeltsListeningBand(submitResult.totalScore).toFixed(1)}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Band Score</div>
              </div>
            </div>

            <button
              onClick={() => router.replace(`/ielts/intensive/${encodeURIComponent(examId)}`)}
              className="w-full py-3.5 bg-[#D51025] hover:bg-red-700 text-white rounded-xl font-bold text-[15px] transition-colors shadow-md uppercase tracking-wider"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Leave Warning Modal */}
      <ConfirmModal
        isOpen={showLeaveWarning}
        title="Leave Test?"
        message="Are you sure you want to leave the test? Your progress will not be saved."
        confirmText="Yes, leave"
        cancelText="Cancel"
        isDestructive
        onConfirm={() => {
          setShowLeaveWarning(false);
          leaveCallback?.();
        }}
        onClose={() => setShowLeaveWarning(false)}
      />

    </div>
  );
}

