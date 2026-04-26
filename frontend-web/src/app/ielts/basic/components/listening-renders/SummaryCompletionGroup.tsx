import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface SummaryQuestion {
  primary_answer: string;
  acceptable_answers?: string[];
  timestamp_seconds?: number;
  explanation: string;
}

export interface SummaryGroup {
  type: "summary_completion";
  heading?: string;
  text: string;
  questions: Record<string, SummaryQuestion>;
}

export function SummaryCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  audioRef,
  onLocate,
}: {
  group: SummaryGroup;
  answers: Record<string | number, string>;
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

  const allQs: (SummaryQuestion & { qNum: number })[] = Object.entries(group.questions).map(([k, q]) => ({ qNum: Number(k), ...q }));

  // Render text containing blanks like "5 {{5}}"
  const renderText = (rawText: string) => {
    // Strip redundant leading statement numbers (e.g., "14 Tom..." -> "Tom...")
    const text = rawText.replace(/(^|\n)\d+\s+/g, '$1');
    const blankRegex = /\b(\d+)\s*\{\{\1\}\}|\{\{(\d+)\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blankRegex.exec(text)) !== null) {
      const qNumStr = match[1] || match[2];
      const qNum = Number(qNumStr);
      const qData = allQs.find((q) => q.qNum === qNum);
      const userAnswer = (answers[qNum] as string) ?? "";
      
      let isCorrect = false;
      if (qData) {
        const acceptable = qData.acceptable_answers ? qData.acceptable_answers.map(a => a.toLowerCase().trim()) : [qData.primary_answer.toLowerCase().trim()];
        isCorrect = submitted && acceptable.includes(userAnswer.trim().toLowerCase());
      }

      if (match.index > lastIndex) {
        parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      parts.push(
        <span key={`box-${qNum}`} className={`inline-flex items-center border rounded px-1.5 py-0.5 mx-0.5 text-[13px] font-medium min-w-[100px] transition-colors ${
          submitted
            ? isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
            : "border-gray-400 bg-white focus-within:border-[#FFC107]"
        }`}>
          <span className={`text-[11px] font-bold mr-1 shrink-0 ${
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
              className="outline-none bg-transparent text-gray-800 min-w-[60px] w-full font-medium caret-yellow-500"
            />
          )}
        </span>
      );

      if (submitted && !isCorrect && qData) {
        parts.push(
          <span key={`ans-${qNum}`} className="text-[12px] text-green-600 font-bold mx-0.5">({qData.primary_answer})</span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`end-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div className="mb-6">
      {group.heading && (
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">{group.heading}</h3>
      )}

      <div className="text-[14px] leading-loose text-gray-800 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
        {renderText(group.text)}
      </div>

      {showAnswers && (
        <div className="mt-5 space-y-2">
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
