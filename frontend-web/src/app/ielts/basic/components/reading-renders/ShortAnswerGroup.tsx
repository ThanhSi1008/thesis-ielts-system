import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface ShortAnswerQuestion {
  question_number: number;
  text: string;
  answer: string;
  acceptable_answers?: string[];
  explanation?: any;
}

export interface ShortAnswerGroup {
  type: 'short_answer';
  instruction?: string;
  questions: ShortAnswerQuestion[];
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function ShortAnswerGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: ShortAnswerGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const checkAnswer = (q: ShortAnswerQuestion, userAns: string) => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map(a => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const qNums = group.questions.map(q => q.question_number);

  return (
    <div className="mb-8 font-sans">
      {/* Header */}
      {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-6 leading-relaxed">
        {group.instruction || 'Answer the questions below.'}
      </p>

      {/* Questions List */}
      <div className="space-y-6 mb-8">
        {group.questions.map(q => {
          const userAnswer = (answers[q.question_number] as string) ?? "";
          const isCorrect = submitted && checkAnswer(q, userAnswer);

          return (
            <div key={q.question_number} id={`question-${q.question_number}`} className="flex flex-col gap-3">
              <div className="flex gap-4">
                <span className={`flex items-center justify-center min-w-[32px] h-8 rounded-lg font-bold text-[14px] border shrink-0 ${
                  submitted
                    ? (isCorrect ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-600')
                    : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  {q.question_number}
                </span>
                <div className="flex-1 pt-1">
                  <p className="text-[15px] font-medium text-gray-800 leading-relaxed mb-4">
                    {q.text}
                  </p>

                  <div className="max-w-md">
                    {submitted ? (
                      <div className="flex flex-col gap-2">
                        <div className={`px-4 py-2.5 rounded-lg border text-[14px] font-semibold ${
                          isCorrect ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-200 text-red-600 line-through'
                        }`}>
                          {userAnswer || '—'}
                        </div>
                        {!isCorrect && showAnswers && (
                          <div className="flex items-center gap-2 text-[13px] text-green-700 font-bold bg-green-50/50 px-3 py-1.5 rounded-md border border-green-100">
                            <span>Correct answer:</span>
                            <span>{q.answer}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => onAnswer(q.question_number, e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]/20 text-[14px] text-gray-800 transition-all placeholder:text-gray-400"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {showAnswers && (
                <div className="flex flex-wrap gap-2 ml-[48px]">
                  <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                    <MapPin className="w-3.5 h-3.5" /> Locate
                  </button>
                  <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" /> Explain
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                    <StickyNote className="w-3.5 h-3.5" /> Note
                  </button>
                  {showExplanation === q.question_number && (
                    <div className="w-full mt-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13.5px] text-blue-900 leading-relaxed shadow-sm">
                      {getExplanationText(q.explanation)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
