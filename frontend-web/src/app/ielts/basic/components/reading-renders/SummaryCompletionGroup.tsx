import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface SummaryQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
}

export interface SummaryCompletionGroup {
  type: 'summary_completion';
  instruction?: string;
  summary: string;
  questions: SummaryQuestion[];
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function SummaryCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: SummaryCompletionGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const qMap = Object.fromEntries(group.questions.map(q => [q.question_number, q]));

  const checkAnswer = (q: SummaryQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const renderSummaryText = (text: string) => {
    const blankRegex = /\{\{(\d+)\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blankRegex.exec(text)) !== null) {
      const qNum = Number(match[1]);
      const q = qMap[qNum];
      const userAnswer = (answers[qNum] as string) ?? "";
      const isCorrect = submitted && q && checkAnswer(q, userAnswer);

      if (match.index > lastIndex) {
        parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      parts.push(
        <span key={`box-${qNum}`} className={`inline-flex items-center border rounded px-1.5 py-0.5 mx-0.5 min-w-[100px] transition-colors ${
          submitted
            ? isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
            : "border-gray-400 bg-white focus-within:border-[#FFC107]"
        }`}>
          <span className={`text-[10px] font-bold mr-1 shrink-0 ${
            submitted ? (isCorrect ? "text-green-600" : "text-red-400") : "text-gray-400"
          }`}>{qNum}</span>
          {submitted ? (
            <>
              <span className={`text-[13px] font-semibold ${isCorrect ? "text-green-700" : "text-red-500 line-through"}`}>
                {userAnswer || "—"}
              </span>
              {!isCorrect && q && showAnswers && (
                <span className="ml-1 text-[11px] text-green-600 font-bold">({q.answer})</span>
              )}
            </>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onAnswer(qNum, e.target.value)}
              className="outline-none bg-transparent text-[13px] text-gray-800 min-w-[60px] w-full font-medium caret-yellow-500"
            />
          )}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`end-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  const qNums = group.questions.map(q => q.question_number);

  return (
    <div className="mb-8">
       {/* Header */}
       {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
        {group.instruction || 'Complete the summary below.'}
      </p>

      {/* Summary Box */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-[14.5px] leading-[1.8] text-gray-800 shadow-sm">
        {renderSummaryText(group.summary)}
      </div>

      {/* Post-submit action buttons */}
      {showAnswers && (
        <div className="mt-4 space-y-2">
          {group.questions.map(q => (
            <div key={q.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
              <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                <MapPin className="w-3 h-3" /> Locate
              </button>
              <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                <MessageSquare className="w-3 h-3" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                <StickyNote className="w-3 h-3" /> Note
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
