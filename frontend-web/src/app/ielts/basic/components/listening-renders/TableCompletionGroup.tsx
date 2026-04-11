import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote, Check } from 'lucide-react';

// ─── Table Completion ─────────────────────────────────────────────────────────

export interface TableQuestion {
  answer: string;
  timestamp_seconds?: number;
  explanation: string;
}

export interface TableRow {
  questions: Record<string, TableQuestion>;
  [key: string]: string | string[] | Record<string, TableQuestion>;
}

export interface TableGroup {
  type: "table";
  headers: string[];
  rows: TableRow[];
}

export function TableCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  audioRef,
  onLocate,
}: {
  group: TableGroup;
  answers: Record<number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const seekTo = (ts?: number) => {
    if (!audioRef.current) return;
    if (ts !== undefined) audioRef.current.currentTime = ts;
    audioRef.current.play();
  };

  // Collect all questions across rows for the action buttons
  const allQs: (TableQuestion & { qNum: number })[] = group.rows.flatMap((row) =>
    Object.entries(row.questions).map(([k, q]) => ({ qNum: Number(k), ...q }))
  );

  // Render a single cell value — may be a plain string, array, or contain blanks
  const renderCellText = (text: string) => {
    const blankRegex = /\b(\d+)\s*\.{3,}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blankRegex.exec(text)) !== null) {
      const qNum = Number(match[1]);
      const qData = allQs.find((q) => q.qNum === qNum);
      const userAnswer = (answers[qNum] as unknown as string) ?? "";
      const isCorrect = submitted && userAnswer.trim().toLowerCase() === (qData?.answer ?? "").trim().toLowerCase();

      if (match.index > lastIndex) {
        parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      parts.push(
        <span key={`box-${qNum}`} className={`inline-flex items-center border rounded px-1.5 py-0.5 mx-0.5 text-[12px] font-medium min-w-[90px] transition-colors ${
          submitted
            ? isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
            : "border-gray-400 bg-white focus-within:border-[#FFC107]"
        }`}>
          <span className={`text-[10px] font-bold mr-1 shrink-0 ${
            submitted ? (isCorrect ? "text-green-600" : "text-red-400") : "text-gray-400"
          }`}>{qNum}</span>
          {submitted ? (
            <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-500 line-through"}`}>
              {userAnswer || "—"}
            </span>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onAnswer(qNum, e.target.value)}
              className="outline-none bg-transparent text-gray-800 min-w-[50px] w-full font-medium caret-yellow-500 text-[12px]"
            />
          )}
        </span>
      );

      if (submitted && !isCorrect && qData && showAnswers) {
        parts.push(
          <span key={`ans-${qNum}`} className="text-[11px] text-green-600 font-bold mx-0.5">({qData.answer})</span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`end-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  const renderCell = (value: string | string[] | Record<string, TableQuestion>) => {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-1">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-[6px] w-1 h-1 rounded-full bg-gray-400 shrink-0" />
              <span>{renderCellText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (typeof value === "string") return renderCellText(value);
    return null;
  };

  return (
    <div className="mb-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-[13px]">
          {/* Header row */}
          <thead>
            <tr>
              {group.headers.map((h) => (
                <th
                  key={h}
                  className="border border-gray-300 px-3 py-2.5 text-left font-bold text-gray-900 bg-gray-50 text-[13px]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row, ri) => (
              <tr key={ri} className="align-top">
                {group.headers.map((h) => {
                  const val = row[h];
                  return (
                    <td
                      key={h}
                      className="border border-gray-300 px-3 py-3 text-gray-700 leading-relaxed"
                    >
                      {val !== undefined
                        ? renderCell(val as string | string[])
                        : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-question action buttons after submit */}
      {showAnswers && (
        <div className="mt-4 space-y-2">
          {allQs.map(({ qNum, timestamp_seconds, explanation }) => (
            <div key={qNum} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{qNum}</span>
              <button onClick={() => seekTo(timestamp_seconds)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button onClick={() => onLocate(qNum)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button
                onClick={() => setShowExplanation(showExplanation === qNum ? null : qNum)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
              {showExplanation === qNum && (
                <div className="w-full mt-1.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                  {explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
