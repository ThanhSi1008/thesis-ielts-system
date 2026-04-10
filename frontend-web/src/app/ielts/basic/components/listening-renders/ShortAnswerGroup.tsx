import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface ShortAnswerQuestion {
  question_number: number;
  question_text: string;
  answer: string;
  acceptable_answers?: string[];
  timestamp_seconds?: number;
  explanation: string;
}

export interface ShortAnswerGroupType {
  type: "short_answer";
  heading?: string;
  questions: ShortAnswerQuestion[];
}

export function ShortAnswerGroup({
  group,
  answers,
  onAnswer,
  submitted,
  audioRef,
  onLocate,
}: {
  group: ShortAnswerGroupType;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const seekTo = (ts?: number) => {
    if (!audioRef.current) return;
    if (ts !== undefined) audioRef.current.currentTime = ts;
    audioRef.current.play();
  };

  const checkAnswer = (q: ShortAnswerQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  return (
    <div className="mb-6">
      {group.heading && (
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">{group.heading}</h3>
      )}

      <ul className="space-y-4 pl-1">
        {group.questions.map((q) => {
          const qNum = q.question_number;
          const userAnswer = String(answers[qNum] || '');
          const isCorrect = submitted ? checkAnswer(q, userAnswer) : false;

          return (
            <li
              id={`question-${qNum}`}
              key={qNum}
              className="flex items-start gap-2.5 text-[14px] text-gray-800"
            >
              {/* Bullet */}
              <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />

              {/* Question text + boxed answer on next line */}
              <div className="flex-1">
                <div className="leading-relaxed mb-1">{q.question_text}</div>

                <div className="flex items-center gap-1.5">
                  {/* Boxed answer input — same style as FormCompletionGroup */}
                  <span className={`inline-flex items-center border rounded px-2 py-0.5 text-[13px] font-medium min-w-[160px] transition-colors ${
                    submitted
                      ? isCorrect
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-400 bg-white focus-within:border-[#FFC107]'
                  }`}>
                    <span className={`text-[11px] font-bold mr-1.5 shrink-0 ${
                      submitted ? (isCorrect ? 'text-green-600' : 'text-red-400') : 'text-gray-400'
                    }`}>
                      {qNum}
                    </span>
                    {submitted ? (
                      <span className={`font-semibold ${
                        isCorrect ? 'text-green-700' : 'text-red-500 line-through'
                      }`}>
                        {userAnswer || '—'}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => onAnswer(qNum, e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                        className="outline-none bg-transparent text-gray-800 min-w-[100px] w-full font-medium caret-yellow-500"
                      />
                    )}
                  </span>

                  {/* Correct answer shown inline if wrong */}
                  {submitted && !isCorrect && (
                    <span className="text-[12px] text-green-600 font-bold">({q.answer})</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Post-submit action buttons */}
      {submitted && (
        <div className="mt-3 space-y-2">
          {group.questions.map((q) => (
            <div key={q.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
              <button
                onClick={() => seekTo(q.timestamp_seconds)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button
                onClick={() => onLocate(q.question_number)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button
                onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
              {showExplanation === q.question_number && (
                <div className="w-full mt-1.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
