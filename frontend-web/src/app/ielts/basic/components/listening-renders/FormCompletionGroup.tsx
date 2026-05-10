import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote, Check } from 'lucide-react';

// ─── Form / Note Completion ───────────────────────────────────────────────────

export interface FormPoint {
  question_number?: number;
  text: string;
  answer?: string;
  timestamp_seconds?: number;
  explanation?: string;
}

export function FormCompletionGroup({
  heading,
  points,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  audioRef,
  onLocate,
}: {
  heading: string;
  points: FormPoint[];
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

  // Render text with a bordered box input (IELTS ieltsIntensiveExam paper style)
  const renderBoxedText = (point: FormPoint) => {
    const blankRegex = /\b(\d+)\s*\.{3,}|\|G\|/;
    const match = point.text.match(blankRegex);
    const qNum = point.question_number ?? 0;
    const answerText = point.answer ?? "";
    const userAnswer = (answers[qNum] as unknown as string) ?? "";
    const isCorrect = submitted && userAnswer.trim().toLowerCase() === answerText.trim().toLowerCase();

    if (!match || !point.question_number) return <span>{point.text}</span>;

    const splitIdx = point.text.indexOf(match[0]);
    const before = point.text.slice(0, splitIdx).trimEnd();
    const after = point.text.slice(splitIdx + match[0].length).trimStart();

    return (
      <span className="leading-loose">
        {before && <span>{before} </span>}
        <span className={`inline-flex items-center border rounded px-2 py-0.5 mx-0.5 text-[13px] font-medium min-w-[110px] transition-colors ${
          submitted
            ? isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
            : "border-gray-400 bg-white focus-within:border-[#FFC107]"
        }`}>
          <span className={`text-[11px] font-bold mr-1.5 shrink-0 ${
            submitted ? (isCorrect ? "text-green-600" : "text-red-400") : "text-gray-400"
          }`}>{point.question_number}</span>
          {submitted ? (
            <span className={`font-semibold ${
              isCorrect ? "text-green-700" : "text-red-500 line-through"
            }`}>{userAnswer || "—"}</span>
          ) : (
            <input
               type="text"
              value={userAnswer}
              onChange={(e) => onAnswer(qNum, e.target.value)}
              className="outline-none bg-transparent text-gray-800 min-w-[60px] w-full font-medium caret-yellow-500"
            />
          )}
        </span>
        {submitted && !isCorrect && showAnswers && (
          <span className="text-[12px] text-green-600 font-bold mx-1">({answerText})</span>
        )}
        {after && <span> {after}</span>}
      </span>
    );
  };

  return (
    <div className="mb-6">
      {heading && (
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">{heading}</h3>
      )}

      <ul className="space-y-4 pl-1">
        {points.map((point, idx) => {
          const isHeader = !point.question_number;
          return (
            <li
              id={point.question_number ? `question-${point.question_number}` : `heading-${idx}`}
              key={point.question_number || `h-${idx}`}
              className={`flex items-start gap-2.5 text-[14px] ${isHeader ? "mt-6 first:mt-0" : ""}`}
            >
              {!isHeader && (
                <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
              )}
              <div className={`flex-1 leading-loose ${isHeader ? "text-[15px] font-bold text-gray-900" : "text-gray-800"}`}>
                {renderBoxedText(point)}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Action buttons per question */}
      {showAnswers && (
        <div className="mt-3 space-y-2">
          {points.filter(p => !!p.question_number).map((point) => (
            <div key={point.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{point.question_number}</span>
              <button onClick={() => seekTo(point.timestamp_seconds)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button onClick={() => onLocate(point.question_number!)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button
                onClick={() => setShowExplanation(showExplanation === point.question_number ? null : point.question_number!)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
              {showExplanation === point.question_number && (
                <div className="w-full mt-1.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                  {point.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
