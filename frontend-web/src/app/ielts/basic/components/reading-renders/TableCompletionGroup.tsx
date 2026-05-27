import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

// ─── Table Completion (Reading) ───────────────────────────────────────────────

export interface TableQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
  question_text?: string;
}

export interface TableCell {
  text: string;
  question_number?: number;
}

export type TableRow = TableCell[];

export interface TableGroup {
  type: "table";
  headers?: string[];
  rows?: TableRow[];
  questions?: TableQuestion[];
  items?: TableQuestion[];
  instruction?: string;
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function TableCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: TableGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  // Normalize questions array from either group.questions or group.items
  const rawQuestions = group.questions || group.items || [];
  const questionsList = (Array.isArray(rawQuestions) ? rawQuestions : []) as TableQuestion[];
  const qMap = Object.fromEntries(questionsList.map(q => [q.question_number, q]));

  const checkAnswer = (q: TableQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const renderBlankInput = (qNum: number) => {
    const q = qMap[qNum];
    if (!q) return null;
    const userAnswer = String(answers[qNum] || '');
    const isCorrect = checkAnswer(q, userAnswer);

    return (
      <span
        id={`question-${qNum}`}
        className={`inline-flex items-center border rounded px-2 py-0.5 mx-1 w-24 transition-colors ${
          submitted
            ? isCorrect
              ? 'border-green-400 bg-green-50'
              : 'border-red-300 bg-red-50'
            : 'border-gray-400 bg-white focus-within:border-[#FFC107]'
        }`}
      >
        <span className={`text-[11px] font-bold mr-1.5 shrink-0 ${
          submitted ? (isCorrect ? 'text-green-600' : 'text-red-400') : 'text-gray-400'
        }`}>
          {qNum}
        </span>
        {submitted ? (
          <>
            <span className={`text-[13px] font-semibold ${isCorrect ? 'text-green-700' : 'text-red-500 line-through'}`}>
              {userAnswer || '—'}
            </span>
            {!isCorrect && showAnswers && (
              <span className="ml-1.5 text-[12px] text-green-600 font-bold">({q.answer})</span>
            )}
          </>
        ) : (
          <input
            type="text"
            value={userAnswer}
            onChange={e => onAnswer(qNum, e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="outline-none bg-transparent text-[13px] text-gray-800 min-w-[80px] w-full font-medium caret-yellow-500"
          />
        )}
      </span>
    );
  };

  // Render a cell's text, swapping out any blank indicators for our React input box
  const renderCellText = (text: string) => {
    const blankRegex = /_+|\[blank\]/gi;
    const hasBlank = blankRegex.test(text);

    // If there's an inline blank, we look for the number before it or try to deduce
    // the question number from the cell text. Typically text contains something like "4 [blank]"
    const numMatch = text.match(/(\d+)\s*(?:_+|\[blank\])/i);
    const qNum = numMatch ? Number(numMatch[1]) : null;

    if (hasBlank && qNum) {
      const parts = text.split(/(\d+)\s*(?:_+|\[blank\])/gi);
      // Ensure we replace correctly
      return (
        <span className="whitespace-normal">
          {parts.map((part, pi) => {
            if (part === String(qNum)) {
              return <React.Fragment key={pi}>{renderBlankInput(qNum)}</React.Fragment>;
            }
            return <span key={pi}>{part}</span>;
          })}
        </span>
      );
    }

    return <span>{text}</span>;
  };

  // 1. Tabular format: render standard HTML table
  if (Array.isArray(group.headers) && Array.isArray(group.rows) && group.rows.length > 0) {
    return (
      <div className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-[13px] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                {group.headers.map((h, hi) => (
                  <th key={hi} className="border border-gray-300 px-3 py-2.5 text-left font-bold text-gray-800 text-[13px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50/50 align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-3 py-3 text-gray-700 leading-relaxed whitespace-normal">
                      {cell.question_number ? (
                        <div className="whitespace-normal">
                          <span className="mr-1">{cell.text}</span>
                          {renderBlankInput(cell.question_number)}
                        </div>
                      ) : (
                        renderCellText(cell.text)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explain/Locate panel */}
        {showAnswers && (
          <div className="mt-4 space-y-2">
            {questionsList.map(q => (
              <div key={q.question_number} className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
                <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                  <MapPin className="w-3 h-3" /> Locate
                </button>
                <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                  <MessageSquare className="w-3 h-3" /> Explain
                </button>
                {showExplanation === q.question_number && (
                  <div className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                    {getExplanationText(q.explanation)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Flat/Sentence format: render clean vertical sentences
  return (
    <div className="mb-8">
      <div className="space-y-4">
        {questionsList.map((q) => {
          const userAnswer = String(answers[q.question_number] || '');
          const isCorrect = checkAnswer(q, userAnswer);
          const text = q.question_text || '';
          const blankRegex = /_+|\[blank\]/gi;
          const hasBlank = blankRegex.test(text);

          if (hasBlank) {
            const parts = text.split(blankRegex);
            return (
              <div key={q.question_number} className="text-[14px] text-gray-800 leading-relaxed pl-1 py-1.5 whitespace-normal">
                <span className="mr-2 font-bold text-gray-500">{q.question_number}.</span>
                {parts.map((part, pi) => (
                  <React.Fragment key={pi}>
                    <span>{part}</span>
                    {pi < parts.length - 1 && renderBlankInput(q.question_number)}
                  </React.Fragment>
                ))}
              </div>
            );
          }

          // Fallback to "Question Label: [Input Box]"
          return (
            <div key={q.question_number} className="text-[14px] text-gray-800 leading-relaxed pl-1 py-1.5 whitespace-normal">
              <span className="mr-2 font-bold text-gray-500">{q.question_number}.</span>
              <span className="mr-2">{text}</span>
              {renderBlankInput(q.question_number)}
            </div>
          );
        })}
      </div>

      {/* Post-submit actions */}
      {showAnswers && (
        <div className="mt-4 space-y-2">
          {questionsList.map(q => (
            <div key={q.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
              <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-505 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                <MapPin className="w-3 h-3" /> Locate
              </button>
              <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-505 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                <MessageSquare className="w-3 h-3" /> Explain
              </button>
              {showExplanation === q.question_number && (
                <div className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                  {getExplanationText(q.explanation)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
