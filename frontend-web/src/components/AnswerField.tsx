import React, { useState } from "react";
import { type NormalizedItem } from "@/lib/exam-parser";
import { MapPin, MessageSquare, StickyNote } from "lucide-react";

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

export function parseTextAndBlanks(text: string): string[] {
  if (!text) return [""];

  // 1. Detect and preserve leading dots
  const leadingMatch = text.match(/^(\s*\.{3,}\s*)/);
  const leading = leadingMatch ? leadingMatch[1] : "";

  // 2. Detect and preserve trailing dots
  const trailingMatch = text.match(/(\s*\.{3,}\s*)$/);
  const trailing = trailingMatch && (!leadingMatch || text.length > leadingMatch[1].length)
    ? trailingMatch[1]
    : "";

  // 3. Strip them for safe splitting
  let middle = text;
  if (leading) middle = middle.substring(leading.length);
  if (trailing) middle = middle.substring(0, middle.length - trailing.length);

  // 4. Split by blanks
  const parts = middle.split(/_+|\.{3,}|\[blank\]/i);

  // 5. Re-attach leading/trailing dots to the first and last parts
  if (parts.length > 0) {
    parts[0] = leading + parts[0];
    parts[parts.length - 1] = parts[parts.length - 1] + trailing;
  }

  return parts;
}

function getExplanationText(exp: any): string {
  if (!exp) return "";
  if (typeof exp === "string") return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function AnswerField({
  item,
  answers,
  setAnswers,
  focusedQn,
  setFocusedQn,
  variant = "official",
  submitted = false,
  showAnswers = false,
  correctAnswers = {},
  onLocate,
}: {
  item: NormalizedItem;
  answers: AnswersState;
  setAnswers: (next: AnswersState) => void;
  focusedQn: number | null;
  setFocusedQn: (qn: number) => void;
  variant?: "official" | "modern";
  submitted?: boolean;
  showAnswers?: boolean;
  correctAnswers?: Record<string, string>;
  onLocate?: (qn: number) => void;
}) {
  const [showExps, setShowExps] = useState<Record<number, boolean>>({});

  const getCorrectAnswer = (qNum: number): string => {
    if (correctAnswers && correctAnswers[String(qNum)]) {
      return String(correctAnswers[String(qNum)]);
    }
    if ("qn" in item && item.qn === qNum) {
      return String((item as any).answer || (item as any).correct_answer || "");
    }
    if ("questions" in item && Array.isArray(item.questions)) {
      const qObj = item.questions.find((q: any) => q.question_number === qNum);
      if (qObj) return String(qObj.answer || qObj.correct_answer || "");
    }
    if ("acceptable_answers" in item && item.acceptable_answers) {
      return String((item as any).answer || "");
    }
    return "";
  };

  const checkIsCorrect = (qNum: number, userVal: string | string[]): boolean => {
    const correctVal = getCorrectAnswer(qNum);
    if (!correctVal) return false;

    const userStr = typeof userVal === "string" ? userVal : (userVal?.[0] || "");
    const cleanUser = userStr.trim().toLowerCase();
    const cleanCorrect = correctVal.trim().toLowerCase();

    let acceptableList = [cleanCorrect];
    if ("questions" in item && Array.isArray(item.questions)) {
      const qObj = item.questions.find((q: any) => q.question_number === qNum);
      if (qObj?.acceptable_answers) {
        acceptableList = qObj.acceptable_answers.map((a: any) => String(a).trim().toLowerCase());
      }
    } else if ("acceptable_answers" in item && Array.isArray((item as any).acceptable_answers)) {
      acceptableList = (item as any).acceptable_answers.map((a: any) => String(a).trim().toLowerCase());
    }

    return acceptableList.includes(cleanUser);
  };

  const textThemeClass = variant === "modern" ? "text-gray-900 dark:text-slate-100" : "text-[#1a1a1a]";
  const subTextThemeClass = variant === "modern" ? "text-gray-500 dark:text-slate-400" : "text-[#333333]";

  const QnBadge = ({ n, txt, isFocused }: { n: number; txt?: string; isFocused: boolean }) => {
    const display = txt || String(n);
    const isCorrect = checkIsCorrect(n, answers[String(n)] || "");

    const baseClass = "inline-flex items-center justify-center mr-3 font-bold px-1.5 py-[1px] rounded-[3px] text-[15px] leading-relaxed shadow-sm transition-all";
    let statusClass = "text-[#1a1a1a] bg-[#f0f9ff] border-[#2181d8] border-[1.5px]";

    if (submitted) {
      statusClass = isCorrect
        ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400 border-[1.5px]"
        : "border-red-300 bg-red-50 text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400 border-[1.5px]";
    } else if (!isFocused) {
      statusClass = variant === "modern"
        ? "text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 border"
        : "text-[#1a1a1a] bg-transparent border-transparent";
    } else {
      statusClass = variant === "modern"
        ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500 border-[1.5px]"
        : "text-[#1a1a1a] bg-[#f0f9ff] border-[#2181d8] border-[1.5px]";
    }

    return (
      <button
        disabled={!onLocate}
        onClick={(e) => {
          e.stopPropagation();
          if (onLocate) onLocate(n);
        }}
        type="button"
        className={`${baseClass} ${statusClass} ${onLocate ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
        title={onLocate ? "Nhấp để định vị trong bài đọc" : ""}
      >
        {display}
      </button>
    );
  };

  const ActionButtons = ({ qNum, explanation }: { qNum: number; explanation?: any }) => {
    if (!showAnswers) return null;
    const realExp = explanation || (item as any).explanation;
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {onLocate && (
          <button
            onClick={() => onLocate(qNum)}
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5" /> Định vị
          </button>
        )}
        {realExp && (
          <button
            onClick={() => setShowExps((prev) => ({ ...prev, [qNum]: !prev[qNum] }))}
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Giải thích
          </button>
        )}
        {showExps[qNum] && (
          <div className="w-full mt-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 text-[13px] text-blue-900 dark:text-blue-300 leading-relaxed shadow-inner animate-in fade-in duration-200">
            {getExplanationText(realExp)}
          </div>
        )}
      </div>
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
    const isCorrect = checkIsCorrect(item.qn, value);
    const correctVal = getCorrectAnswer(item.qn);

    const parts = parseTextAndBlanks(item.text || "");

    const renderInput = () => {
      if (submitted) {
        return (
          <>
            <span
              className={`inline-flex items-center mx-1.5 px-2.5 py-0.5 rounded-[4px] border text-[15px] font-bold transition-colors ${
                isCorrect
                  ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              <span className="text-[11px] font-bold mr-1.5 text-gray-400">{item.qn}</span>
              {value || "—"}
            </span>
            {!isCorrect && showAnswers && correctVal && (
              <span className="text-green-600 font-bold ml-1 text-sm">({correctVal})</span>
            )}
          </>
        );
      }

      return (
        <input
          value={value}
          disabled={submitted}
          onFocus={() => setFocusedQn(item.qn)}
          onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
          placeholder={String(item.qn)}
          className={`inline-block mx-1.5 w-24 h-[30px] align-middle rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
            focusedQn === item.qn
              ? variant === "modern"
                ? "border-amber-400 ring-[1.5px] ring-amber-400/20 bg-[#fffdf5] dark:bg-slate-900"
                : "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
              : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e] dark:bg-slate-900 dark:border-slate-800"
          }`}
        />
      );
    };

    const renderSingleInput = () => {
      if (submitted) {
        return (
          <>
            <span
              className={`inline-flex items-center mx-1.5 px-3 py-1 rounded-[4px] border text-[15px] font-bold transition-colors ${
                isCorrect
                  ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              {value || "—"}
            </span>
            {!isCorrect && showAnswers && correctVal && (
              <span className="text-green-600 font-bold ml-1 text-sm">({correctVal})</span>
            )}
          </>
        );
      }

      return (
        <input
          value={value}
          disabled={submitted}
          onFocus={() => setFocusedQn(item.qn)}
          onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
          placeholder={String(item.qn)}
          className={`inline-block mx-1.5 w-36 h-[30px] align-middle rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
            focusedQn === item.qn
              ? variant === "modern"
                ? "border-amber-400 ring-[1.5px] ring-amber-400/20 bg-[#fffdf5] dark:bg-slate-900"
                : "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
              : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e] dark:bg-slate-900 dark:border-slate-800"
          }`}
        />
      );
    };

    return (
      <div id={`question-${item.qn}`} className={`pb-2 pt-1 flex flex-col gap-1 ${textThemeClass}`}>
        {(item as any).qns && (
          <div className="font-bold text-[18px] mb-1 mt-4">
            Questions {(item as any).qns.length > 1 ? `${(item as any).qns[0]} - ${(item as any).qns[(item as any).qns.length - 1]}` : String((item as any).qns[0])}
          </div>
        )}
        {(item as any).instructions && (
          <div
            className={`text-[16px] mb-4 ${subTextThemeClass}`}
            dangerouslySetInnerHTML={{
              __html: (item as any).instructions.replace(
                /(ONE WORD ONLY|NO MORE THAN [A-Z]+ WORDS?( AND\/OR A NUMBER)?)/g,
                '<span class="font-bold uppercase">$1</span>'
              ),
            }}
          />
        )}

        {(item as any).heading && <div className="font-bold text-[16px] uppercase mt-2 mb-2">{(item as any).heading}</div>}
        {(item as any).subheading && <div className="font-semibold text-[15px] mt-1 mb-2">{(item as any).subheading}</div>}

        {((item as any).precedingText || []).map((txt: string, i: number) => (
          <div key={`pre-${i}`} className="flex gap-[8px] items-start mb-1">
            <span className={`mt-[10px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${variant === "modern" ? "bg-gray-400" : "bg-[#1a1a1a]"}`}></span>
            <span className="text-[17px] leading-relaxed">{txt}</span>
          </div>
        ))}

        <div className="flex items-start gap-[8px]">
          <span className={`mt-[10px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${variant === "modern" ? "bg-gray-400" : "bg-[#1a1a1a]"}`}></span>
          <div className="text-[17px] leading-[2.1] flex-1">
            {parts.length > 1 ? (
              parts.map((p, idx) => (
                <React.Fragment key={idx}>
                  <span>{p}</span>
                  {idx < parts.length - 1 && (
                    idx === 0 ? renderInput() : <span className="text-[15px] font-mono text-[#b5b5b5] mx-1 align-middle">___</span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="inline">
                <span className="font-medium">{item.text}</span>
                {renderSingleInput()}
              </span>
            )}
          </div>
        </div>
        <ActionButtons qNum={item.qn} />
      </div>
    );
  }

  if (item.kind === "table_completion") {
    return (
      <div className={`py-4 overflow-x-auto w-full ${textThemeClass}`}>
        {(item as any).title && <div className={`font-bold text-[16px] mb-3 text-center uppercase leading-relaxed ${subTextThemeClass}`}>{(item as any).title}</div>}
        <table className={`w-full border-collapse border text-[15px] ${variant === "modern" ? "border-gray-200 dark:border-slate-800" : "border-[#d1d1d1]"}`}>
          {item.headers && item.headers.length > 0 && (
            <thead>
              <tr className={variant === "modern" ? "bg-gray-50 dark:bg-slate-800" : "bg-[#e8e8e8]"}>
                {item.headers.map((h, i) => (
                  <th
                    key={i}
                    className={`border px-3 py-3 text-left text-[14px] font-bold uppercase tracking-wide ${
                      variant === "modern" ? "border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200" : "border-[#d1d1d1] text-[#1a1a1a]"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {item.rows.map((row, rIdx) => (
              <tr key={rIdx} className={`border-t ${variant === "modern" ? "bg-transparent border-gray-200 dark:border-slate-800" : "bg-white border-[#d1d1d1]"}`}>
                {row.map((cell, cIdx) => {
                  if (typeof cell.question_number === "number") {
                    const key = String(cell.question_number);
                    const value = typeof answers[key] === "string" ? answers[key] : "";
                    const parts = parseTextAndBlanks(cell.text || "");
                    const isCorrect = checkIsCorrect(cell.question_number, value);
                    const correctVal = getCorrectAnswer(cell.question_number);

                    return (
                      <td key={cIdx} className={`border px-3 py-4 align-middle ${variant === "modern" ? "border-gray-200 dark:border-slate-800" : "border-[#e2e1df]"}`}>
                        <div id={`question-${cell.question_number}`} className="text-[15px] leading-[1.8]">
                          {parts.length > 1 ? (
                            parts.map((p, idx) => (
                              <React.Fragment key={idx}>
                                {p && <span className="leading-relaxed">{p}</span>}
                                {idx < parts.length - 1 && (
                                  submitted ? (
                                    <>
                                      <span
                                        className={`inline-flex items-center mx-1 px-2 py-0.5 rounded-[4px] border text-[14px] font-bold ${
                                          isCorrect
                                            ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                            : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                        }`}
                                      >
                                        <span className="text-[10px] font-bold mr-1 text-gray-400">{cell.question_number}</span>
                                        {value || "—"}
                                      </span>
                                      {!isCorrect && showAnswers && correctVal && (
                                        <span className="text-green-600 font-bold ml-1 text-xs">({correctVal})</span>
                                      )}
                                    </>
                                  ) : (
                                    <input
                                      value={value}
                                      disabled={submitted}
                                      onFocus={() => setFocusedQn(cell.question_number!)}
                                      onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                                      placeholder={String(cell.question_number)}
                                      className={`inline-block mx-1 w-28 h-[30px] align-middle rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
                                        focusedQn === cell.question_number
                                          ? variant === "modern"
                                            ? "border-amber-400 ring-[1.5px] ring-amber-400/20 bg-white"
                                            : "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                                          : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e] dark:bg-slate-900 dark:border-slate-800"
                                      }`}
                                    />
                                  )
                                )}
                              </React.Fragment>
                            ))
                          ) : (
                            <span className="inline">
                              {cell.text && <span className="leading-relaxed">{cell.text}</span>}
                              {submitted ? (
                                <>
                                  <span
                                    className={`inline-flex items-center mx-1 px-3 py-0.5 rounded-[4px] border text-[14px] font-bold ${
                                      isCorrect
                                        ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                        : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                    }`}
                                  >
                                    {value || "—"}
                                  </span>
                                  {!isCorrect && showAnswers && correctVal && (
                                    <span className="text-green-600 font-bold ml-1 text-xs">({correctVal})</span>
                                  )}
                                </>
                              ) : (
                                <input
                                  value={value}
                                  disabled={submitted}
                                  onFocus={() => setFocusedQn(cell.question_number!)}
                                  onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                                  placeholder={String(cell.question_number)}
                                  className={`inline-block mx-1 w-32 h-[30px] align-middle rounded-[3px] border px-2 text-center text-[15px] font-bold shadow-inner focus:outline-none transition-colors ${
                                    focusedQn === cell.question_number
                                      ? variant === "modern"
                                        ? "border-amber-400 ring-[1.5px] ring-amber-400/20 bg-white"
                                        : "border-[#2181d8] ring-[1.5px] ring-[#2181d8] bg-[#f0f9ff]"
                                      : "border-[#b5b5b5] bg-white hover:border-[#8e8e8e] dark:bg-slate-900 dark:border-slate-800"
                                  }`}
                                />
                              )}
                            </span>
                          )}
                          <ActionButtons qNum={cell.question_number} />
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={cIdx} className={`border px-3 py-4 align-middle ${variant === "modern" ? "border-gray-200 dark:border-slate-800" : "border-[#e2e1df]"}`}>
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

    const correctVal = getCorrectAnswer(item.qn);
    const isCorrect = checkIsCorrect(item.qn, value);

    return (
      <div id={`question-${item.qn}`} className={`pb-6 pt-1 ${textThemeClass}`}>
        {(item as any).instructions && (
          <div className="mb-6">
            <div className="font-bold text-[18px] mb-1">
              Questions {(item as any).qns?.length > 1 ? `${(item as any).qns[0]}-${(item as any).qns[(item as any).qns.length - 1]}` : item.qn}
            </div>
            <div
              className={`text-[16px] ${subTextThemeClass}`}
              dangerouslySetInnerHTML={{
                __html: (item as any).instructions.replace(/(TRUE|FALSE|NOT GIVEN|YES|NO)/g, '<span class="font-bold uppercase">$1</span>'),
              }}
            />
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div className="leading-relaxed text-[16px] font-medium flex-1">
              <QnBadge n={item.qn} isFocused={isFocused} />
              {item.prompt}
            </div>
          </div>
          <div className={`space-y-[16px] mt-6 ${isTF ? "ml-[40px]" : "ml-2"}`}>
            {Object.entries(item.options || {}).map(([k, v]) => {
              const isSelected = value === k;
              const isAnswerKey = correctVal.toUpperCase() === k.toUpperCase();

              let circleClass = "w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ";
              let innerContent = null;
              let optionTextClass = "font-normal";

              if (submitted) {
                if (isAnswerKey && showAnswers) {
                  circleClass += "border-green-500 bg-green-500";
                  innerContent = <div className="w-[6px] h-[6px] rounded-full bg-white" />;
                  optionTextClass = "text-green-700 font-bold dark:text-green-400";
                } else if (isSelected && !isAnswerKey) {
                  circleClass += "border-red-400 bg-red-400";
                  innerContent = <div className="w-[6px] h-[6px] rounded-full bg-white" />;
                  optionTextClass = "text-red-500 line-through dark:text-red-400";
                } else if (isSelected && isAnswerKey) {
                  circleClass += "border-green-500 bg-green-500";
                  innerContent = <div className="w-[6px] h-[6px] rounded-full bg-white" />;
                  optionTextClass = "text-green-700 font-bold dark:text-green-400";
                } else {
                  circleClass += "border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 opacity-60";
                  optionTextClass = "text-gray-400 dark:text-slate-600";
                }
              } else {
                if (isSelected) {
                  circleClass += variant === "modern" ? "border-amber-400 bg-amber-400" : "border-[#2181d8] bg-[#2181d8]";
                  innerContent = <div className="w-[6px] h-[6px] rounded-full bg-white" />;
                  optionTextClass = variant === "modern" ? "text-amber-700 font-semibold dark:text-amber-400" : "text-[#2181d8] font-bold";
                } else {
                  circleClass += variant === "modern" ? "border-gray-300 hover:border-amber-400 bg-white dark:bg-slate-900 dark:border-slate-800" : "border-[#767676] hover:border-[#4b4b4b] bg-white";
                }
              }

              return (
                <label
                  key={k}
                  className={`flex items-start gap-3 ${submitted ? "cursor-default" : "cursor-pointer group"}`}
                  onClick={() => !submitted && setFocusedQn(item.qn)}
                >
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={circleClass}>{innerContent}</div>
                    <input
                      type="radio"
                      name={key}
                      value={k}
                      disabled={submitted}
                      checked={isSelected}
                      onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                      className="hidden"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[16px] leading-[1.4] pr-4 ${optionTextClass}`}>{v}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <ActionButtons qNum={item.qn} />
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
      if (submitted) return;
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

    const correctA = getCorrectAnswer(item.qns[0]);
    const correctB = getCorrectAnswer(item.qns[1]);
    const correctSet = new Set([correctA.toUpperCase(), correctB.toUpperCase()].filter(Boolean));

    return (
      <div id={`question-${item.qns[0]}`} className={`pb-6 pt-1 ${textThemeClass}`}>
        <div className="mb-6">
          <div className="font-bold text-[18px] mb-1">Questions {rangeText}</div>
          {(item as any).instructions && (
            <div
              className={`text-[16px] ${subTextThemeClass}`}
              dangerouslySetInnerHTML={{
                __html:
                  (item as any).instructions
                    .split(".")[0]
                    .replace(/letters?,?\s*[A-Z][–-][A-Z]/i, "correct answers")
                    .replace(/(TWO|THREE|FOUR|FIVE)/g, '<span class="font-bold uppercase">$1</span>') + ".",
              }}
            />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-start min-w-0">
            <div
              className="leading-relaxed text-[16px] font-medium whitespace-pre-line flex-1"
              dangerouslySetInnerHTML={{
                __html: item.prompt.replace(/(TWO|THREE|FOUR|FIVE)/g, '<span class="font-bold uppercase">$1</span>'),
              }}
            />
          </div>
          <div className="space-y-[16px] mt-6 ml-1">
            {Object.entries(item.options || {}).map(([k, v]) => {
              const active = selected.has(k);
              const isAnswerKey = correctSet.has(k.toUpperCase());
              const disabled = (!active && selected.size >= item.maxSelect) || submitted;

              let checkboxClass = "w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors ";
              let innerContent = null;
              let optionTextClass = "font-normal";

              if (submitted) {
                if (isAnswerKey && showAnswers) {
                  checkboxClass += "border-green-500 bg-green-500";
                  innerContent = (
                    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  );
                  optionTextClass = "text-green-700 font-bold dark:text-green-400";
                } else if (active && !isAnswerKey) {
                  checkboxClass += "border-red-400 bg-red-400";
                  innerContent = (
                    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  );
                  optionTextClass = "text-red-500 line-through dark:text-red-400";
                } else if (active && isAnswerKey) {
                  checkboxClass += "border-green-500 bg-green-500";
                  innerContent = (
                    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  );
                  optionTextClass = "text-green-700 font-bold dark:text-green-400";
                } else {
                  checkboxClass += "border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 opacity-60";
                  optionTextClass = "text-gray-400 dark:text-slate-600";
                }
              } else {
                if (active) {
                  checkboxClass += variant === "modern" ? "border-amber-400 bg-amber-400" : "border-[#2181d8] bg-[#2181d8]";
                  innerContent = (
                    <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white stroke-current stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  );
                  optionTextClass = variant === "modern" ? "text-amber-700 font-semibold dark:text-amber-400" : "text-[#2181d8] font-bold";
                } else {
                  checkboxClass += variant === "modern" ? "border-gray-300 hover:border-amber-400 bg-white dark:bg-slate-900 dark:border-slate-800" : "border-[#767676] group-hover:border-[#4b4b4b] bg-white";
                }
              }

              return (
                <label
                  key={k}
                  className={`flex items-start gap-3 ${disabled && !submitted ? "opacity-50 cursor-not-allowed" : submitted ? "cursor-default" : "cursor-pointer group"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled || active) {
                      toggle(k);
                      setFocusedQn(item.qns[0]);
                    }
                  }}
                >
                  <div className="pt-[2px] flex-shrink-0">
                    <div className={checkboxClass}>{innerContent}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[16px] leading-[1.4] pr-4 ${optionTextClass}`}>{v}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        {item.qns.map((q) => (
          <ActionButtons key={q} qNum={q} />
        ))}
      </div>
    );
  }

  // Summary Completion
  if (item.kind === "summary_completion") {
    const textPieces: React.ReactNode[] = [];
    const regex = /(\d+)\s*\[blank\]/g;
    let lastIndex = 0;

    const str = item.text || "";
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        textPieces.push(<span key={`text-${lastIndex}`}>{str.substring(lastIndex, match.index)}</span>);
      }
      const qNum = parseInt(match[1]);
      const key = String(qNum);
      const value = typeof answers[key] === "string" ? answers[key] : "";
      const isCorrect = checkIsCorrect(qNum, value);
      const correctVal = getCorrectAnswer(qNum);

      const hasOptions = item.options && Object.keys(item.options).length > 0;

      if (hasOptions) {
        const displayVal = item.options![value] || value;
        textPieces.push(
          submitted ? (
            <span
              key={`drop-${qNum}`}
              className={`inline-flex items-center justify-center min-w-[100px] h-[32px] px-3 mx-1 text-[15px] font-medium align-middle border rounded-[3px] ${
                isCorrect
                  ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              {displayVal || "—"}
              {!isCorrect && showAnswers && correctVal && (
                <span className="text-green-600 font-bold ml-1.5 text-xs">({(item.options && item.options[correctVal]) || correctVal})</span>
              )}
            </span>
          ) : (
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
              className={`inline-flex items-center justify-center min-w-[100px] h-[32px] px-3 mx-1 text-[15px] font-medium align-middle cursor-pointer transition-colors ${
                value
                  ? "bg-white border border-[#b5b5b5] text-[#1a1a1a] shadow-[0_1px_3px_rgba(0,0,0,0.1)] rounded-[3px] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                  : "bg-[#f8f9fa] border border-dashed border-[#b5b5b5] text-[#a0a0a0] rounded-[3px] hover:bg-[#f0f0f0] dark:bg-slate-850 dark:border-slate-800"
              } ${focusedQn === qNum && !value ? "border-[#2181d8] ring-[1px] ring-[#2181d8]" : ""}`}
              title={value ? "Nhấp để xóa" : ""}
            >
              {value ? displayVal : <span className="font-bold text-[#333333] dark:text-slate-400">{qNum}</span>}
            </span>
          )
        );
      } else {
        textPieces.push(
          submitted ? (
            <span
              key={`input-${qNum}`}
              className={`inline-flex items-center gap-1 mx-1 align-middle px-2 py-0.5 rounded-[4px] border text-[14px] font-bold ${
                isCorrect
                  ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                  : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              <span className="text-[10px] font-bold mr-1 text-gray-400">{qNum}</span>
              {value || "—"}
              {!isCorrect && showAnswers && correctVal && (
                <span className="text-green-600 font-bold ml-1 text-xs">({correctVal})</span>
              )}
            </span>
          ) : (
            <span key={`input-${qNum}`} className="inline-flex items-center gap-1 mx-1 align-middle">
              <span className="text-[12px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-full px-1.5 py-0.5">{qNum}</span>
              <input
                value={value}
                disabled={submitted}
                onFocus={() => setFocusedQn(qNum)}
                onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                className={`w-32 h-[26px] py-0 px-2 text-[15px] font-bold text-[#1a1a1a] border border-[#b5b5b5] rounded-[3px] shadow-inner focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 ${
                  focusedQn === qNum ? "border-[#2181d8] ring-[1px] ring-[#2181d8] bg-[#f0f9ff]" : "hover:border-[#8e8e8e] bg-white"
                }`}
              />
            </span>
          )
        );
      }

      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      textPieces.push(<span key={`text-${lastIndex}`}>{str.substring(lastIndex)}</span>);
    }

    const firstQn = item.qns[0];

    return (
      <div id={`question-${firstQn}`} className={`pb-6 pt-1 relative ${textThemeClass}`}>
        <div className="flex flex-col">
          <div className="font-bold text-[18px] mb-1">
            Questions {item.qns.length > 1 ? `${firstQn} - ${item.qns[item.qns.length - 1]}` : String(firstQn)}
          </div>
          {(item as any).instructions && (
            <div
              className={`text-[16px] mb-4 ${subTextThemeClass}`}
              dangerouslySetInnerHTML={{
                __html: (item as any).instructions.replace(
                  /(ONE WORD ONLY|NO MORE THAN [A-Z]+ WORDS?( AND\/OR A NUMBER)?)/g,
                  '<span class="font-bold">$1</span>'
                ),
              }}
            />
          )}

          <div className="mb-4 mt-2">
            {item.heading && <div className="font-bold text-[16px] uppercase mb-4 text-center">{item.heading}</div>}
            <div className="text-[16px] leading-[2.1] font-normal text-justify whitespace-pre-wrap">
              {textPieces}
            </div>
          </div>

          {item.options && Object.keys(item.options).length > 0 && !submitted && (
            <div className="mt-8 flex flex-wrap gap-3 justify-center items-center py-4">
              {Object.entries(item.options || {}).map(([k, v]) => {
                const isUsed = item.qns.some((q) => answers[String(q)] === k);
                return (
                  <div
                    key={k}
                    draggable={!isUsed}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", k);
                    }}
                    className={`px-4 py-1.5 border rounded-[3px] text-[15px] font-medium transition-colors ${
                      isUsed
                        ? "bg-[#f5f5f5] border-[#e0e0e0] text-[#b0b0b0] cursor-not-allowed dark:bg-slate-800 dark:border-slate-900"
                        : "bg-white border-[#b5b5b5] text-[#1a1a1a] cursor-grab hover:bg-[#f9f9f9] shadow-sm active:cursor-grabbing dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    }`}
                  >
                    <span className="font-bold mr-1.5">{k}.</span>{v}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {item.qns.map((q) => (
          <ActionButtons key={q} qNum={q} />
        ))}
      </div>
    );
  }

  // Matching Group (Grid)
  if (item.kind === "matching_group") {
    const letters = Object.keys(item.options || {});
    const headingQns = item.qns.length > 1 ? `${item.qns[0]} - ${item.qns[item.qns.length - 1]}` : `${item.qns[0]}`;

    return (
      <div id={`question-${item.qns[0]}`} className={`pb-6 pt-1 relative ${textThemeClass}`}>
        <div className="flex flex-col">
          <div className="font-bold text-[16px] mb-1">Question {headingQns}</div>
          {(item as any).instructions && <div className={`text-[16px] mb-4 ${subTextThemeClass}`}>{(item as any).instructions}</div>}

          {/* Radio Grid */}
          <div className={`mb-10 overflow-x-auto custom-scrollbar border max-w-fit rounded-[2px] ${variant === "modern" ? "border-gray-200 dark:border-slate-850" : "border-[#999999]"}`}>
            <table className="min-w-max border-collapse bg-white dark:bg-slate-900">
              <thead>
                <tr className={variant === "modern" ? "border-b-2 border-gray-100 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-850/50" : "border-b-[1.5px] border-black"}>
                  <th className="p-3"></th>
                  {letters.map((letter, i) => (
                    <th key={letter} className={`p-4 w-[72px] text-center font-bold border-l ${variant === "modern" ? "border-gray-100 dark:border-slate-850" : "border-[#d2d2d2] border-l-[#999999]"}`}>
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
                  const correctVal = getCorrectAnswer(qNum);
                  const isCorrect = checkIsCorrect(qNum, val);

                  return (
                    <tr
                      key={qNum}
                      className={`border-b transition-colors ${variant === "modern" ? "border-gray-100 dark:border-slate-850 hover:bg-gray-50/50 dark:hover:bg-slate-850/50" : "border-[#e5e5e5] hover:bg-[#f9f9f9]"}`}
                      onClick={() => !submitted && setFocusedQn(qNum)}
                    >
                      <td className="p-3 pl-5 pr-8 font-medium text-[15px] whitespace-nowrap min-w-[200px]">
                        <QnBadge n={qNum} isFocused={focusedQn === qNum} />
                        {prompt}
                      </td>
                      {letters.map((letter, i) => {
                        const isSelected = val === letter;
                        const isAnswerKey = correctVal.toUpperCase() === letter.toUpperCase();

                        let radioClass = "w-[20px] h-[20px] cursor-pointer accent-[#2181d8]";
                        if (submitted) {
                          radioClass = "w-[20px] h-[20px] cursor-default";
                        }

                        let tdColor = "";
                        if (submitted && showAnswers) {
                          if (isAnswerKey) tdColor = "bg-green-50/50 dark:bg-green-950/10";
                          else if (isSelected) tdColor = "bg-red-50/50 dark:bg-red-950/10";
                        }

                        return (
                          <td key={letter} className={`p-3 text-center border-l ${tdColor} ${variant === "modern" ? "border-gray-100 dark:border-slate-850" : "border-[#e5e5e5]"}`}>
                            <input
                              type="radio"
                              name={`match-${qNum}`}
                              value={letter}
                              disabled={submitted}
                              checked={isSelected}
                              onChange={(e) => {
                                setAnswers({ ...answers, [key]: e.target.value });
                                setFocusedQn(qNum);
                              }}
                              className={radioClass}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Options Table */}
          {Object.values(item.options || {}).some((v) => v.trim() !== "") && (
            <div className={`border max-w-2xl rounded-[2px] overflow-hidden mb-2 ${variant === "modern" ? "border-gray-200 dark:border-slate-800" : "border-[#d2d2d2]"}`}>
              {item.heading && (
                <div className={`p-3.5 font-bold text-[14px] uppercase tracking-wide border-b ${variant === "modern" ? "border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700" : "border-[#d2d2d2] bg-[#f8f9fa]"}`}>
                  {item.heading}
                </div>
              )}
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(item.options || {}).map(([k, v]) => (
                    <tr key={k} className={`border-b last:border-0 hover:bg-[#f9f9f9] dark:hover:bg-slate-850 transition-colors ${variant === "modern" ? "border-gray-150 dark:border-slate-800" : "border-[#e5e5e5]"}`}>
                      <td className={`p-3.5 w-[56px] font-bold text-[16px] border-r text-center ${variant === "modern" ? "border-gray-200 dark:border-slate-800" : "border-[#d2d2d2]"}`}>{k}</td>
                      <td className="p-3.5 text-[15px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {item.qns.map((q) => (
          <ActionButtons key={q} qNum={q} />
        ))}
      </div>
    );
  }

  // Map / plan / diagram labelling: group header + image (once, on the first item) + a
  // labelled input per question.
  if (item.kind === "plan_label") {
    const key = String(item.qn);
    const value = typeof answers[key] === "string" ? (answers[key] as string) : "";
    const planQns = (item as any).qns as number[] | undefined;
    const isCorrect = checkIsCorrect(item.qn, value);
    const correctVal = getCorrectAnswer(item.qn);

    return (
      <div id={`question-${item.qn}`} className={`pb-6 pt-1 ${textThemeClass}`}>
        {planQns && (
          <div className="text-[18px] font-bold mb-1">
            Questions {planQns.length > 1 ? `${planQns[0]} - ${planQns[planQns.length - 1]}` : String(planQns[0])}
          </div>
        )}
        {(item as any).instructions && (
          <div className={`text-[15px] mb-3 ${subTextThemeClass}`}>{(item as any).instructions}</div>
        )}
        {(item as any).heading && (
          <div className="font-bold text-[16px] uppercase mb-2">{(item as any).heading}</div>
        )}
        {item.imageUrl && (
          <div className={`rounded-xl overflow-hidden border p-2 mb-4 bg-white dark:bg-slate-900 ${variant === "modern" ? "border-gray-200 dark:border-slate-800 shadow-sm" : "border-gray-200"}`}>
            <img src={item.imageUrl} alt="Plan/Map/Diagram" className="w-full h-auto rounded-lg" />
          </div>
        )}
        <div className="flex items-start gap-4">
          <QnBadge n={item.qn} isFocused={focusedQn === item.qn} />
          <div className="flex-1 min-w-0">
            {item.prompt && <div className={`font-medium text-[15px] mb-2 ${subTextThemeClass}`}>{item.prompt}</div>}
            <div className="max-w-sm">
              {submitted ? (
                <>
                  <span
                    className={`inline-flex items-center px-4 py-2.5 rounded-md border text-[15px] font-medium transition-colors ${
                      isCorrect
                        ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                        : "border-red-300 bg-red-50 text-red-500 line-through dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                    }`}
                  >
                    {value || "—"}
                  </span>
                  {!isCorrect && showAnswers && correctVal && (
                    <span className="text-green-600 font-bold ml-2 text-sm">({correctVal})</span>
                  )}
                </>
              ) : (
                <input
                  value={value}
                  disabled={submitted}
                  onFocus={() => setFocusedQn(item.qn)}
                  onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                  placeholder="Nhãn"
                  className={`w-full rounded-md border px-4 py-2.5 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none shadow-sm font-medium ${
                    focusedQn === item.qn
                      ? variant === "modern"
                        ? "border-amber-400 ring-2 ring-amber-400/20"
                        : "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-300 dark:border-slate-800"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
        <ActionButtons qNum={item.qn} />
      </div>
    );
  }

  return null;
}
