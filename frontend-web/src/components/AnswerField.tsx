import React from "react";
import { type NormalizedItem } from "@/lib/exam-parser";

export type AnswersState = Record<string, string | string[]>;

export function getPartTitle(part: any) {
  return `Part ${part?.part_number ?? ""}`.trim();
}

export function questionNumbersFromItems(items: NormalizedItem[]) {
  const nums: number[] = [];
  for (const it of items) {
    if ("qns" in it && it.qns) nums.push(...it.qns);
    else if ("qn" in it) nums.push(it.qn);
  }
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

export function AnswerField({
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
                    // Only the FIRST blank is the active input for this question.
                    // Any subsequent blanks belong to adjacent questions — render as static text.
                    idx === 0 ? (
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
                    ) : (
                      <span className="text-[15px] font-mono text-[#b5b5b5] mx-0.5">___</span>
                    )
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
            <div className="mt-8 flex flex-wrap gap-3 justify-center items-center py-4">
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
            <div className="border border-[#d2d2d2] max-w-2xl rounded-[2px] overflow-hidden mb-2">
              {item.heading && (
                <div className="border-b border-[#d2d2d2] p-3.5 font-bold text-[14px] uppercase tracking-wide">
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
