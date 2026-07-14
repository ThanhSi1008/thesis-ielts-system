import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface SentenceEndingOption {
  id: string;
  text: string;
}

export interface SentenceEndingQuestion {
  question_number: number;
  text: string;
  answer: string;
  explanation?: any;
}

export interface MatchingSentenceEndingsGroup {
  type: 'matching_sentence_endings';
  instruction?: string;
  options: SentenceEndingOption[];
  questions: SentenceEndingQuestion[];
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function MatchingSentenceEndingsGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: MatchingSentenceEndingsGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions = group.questions || [];
  let options = group.options || [];
  if (options.length === 0 && (group as any).options_box?.options) {
    const boxOpts = (group as any).options_box.options;
    options = Object.entries(boxOpts).map(([letter, text]) => ({
      id: letter,
      text: String(text),
    }));
  }

  const usedIds = questions
    .map(q => (answers[q.question_number] ?? '').toUpperCase())
    .filter(Boolean);

  const qNums = questions.map(q => q.question_number);

  return (
    <div className="mb-8">
      {/* Header */}
      {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">
        {group.instruction || 'Complete each sentence with the correct ending.'}
      </p>

      {/* Sentence starter + dropdown rows */}
      <div className="space-y-4 mb-6">
        {questions.map(q => {
          const selected = (answers[q.question_number] ?? '').toUpperCase();
          const isCorrect = submitted && selected === q.answer.toUpperCase();
          const selectedOption = options.find(o => o.id.toUpperCase() === selected);

          return (
            <div id={`question-${q.question_number}`} key={q.question_number}>
              {/* Sentence starter box */}
              <div className={`border rounded-lg px-4 py-3 transition-colors ${
                submitted
                  ? isCorrect ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`inline-flex min-w-[24px] px-1.5 h-6 items-center justify-center rounded text-[12px] font-bold border shrink-0 mt-0.5 ${
                    submitted
                      ? isCorrect ? 'border-green-300 text-green-700 bg-green-100' : 'border-red-300 text-red-600 bg-red-100'
                      : 'border-blue-200 text-blue-700 bg-blue-50'
                  }`}>
                    {q.question_number}
                  </span>
                  <p className="text-[14px] font-medium text-gray-800 leading-snug pt-0.5">
                    {q.text || (q as any).question_text}
                  </p>
                </div>

                {/* Selector / answer display */}
                <div className="mt-3 ml-9">
                  {submitted ? (
                    <div className="flex flex-wrap items-baseline gap-2">
                      {/* Selected answer */}
                      <span className={`inline-flex items-center gap-1.5 border rounded px-2.5 py-1 text-[13px] font-semibold ${
                        isCorrect ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-600 line-through'
                      }`}>
                        <span className="font-bold">{selected || '—'}</span>
                        {selectedOption && <span className="font-normal">· {selectedOption.text}</span>}
                      </span>
                      {/* Correct answer if wrong */}
                      {!isCorrect && showAnswers && (
                        <span className="inline-flex items-center gap-1.5 border border-green-400 bg-green-50 text-green-800 rounded px-2.5 py-1 text-[13px] font-semibold">
                          <span className="font-bold">{q.answer}</span>
                          <span className="font-normal">· {options.find(o => o.id === q.answer)?.text}</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <select
                      value={answers[q.question_number] ?? ''}
                      onChange={e => onAnswer(q.question_number, e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-[13px] text-gray-800 bg-white outline-none focus:border-[#FFC107] transition-colors cursor-pointer w-full max-w-xs"
                    >
                      <option value="">— Select an ending —</option>
                      {options.map(opt => (
                        <option
                          key={opt.id}
                          value={opt.id}
                          disabled={usedIds.includes(opt.id) && answers[q.question_number] !== opt.id}
                        >
                          {opt.id} · {opt.text}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Post-submit action buttons */}
              {showAnswers && (
                <div className="mt-2 flex flex-wrap gap-2 ml-9">
                  <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                    <MapPin className="w-3 h-3" /> Locate
                  </button>
                  <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                    <MessageSquare className="w-3 h-3" /> Explain
                  </button>
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors">
                    <StickyNote className="w-3 h-3" /> Note
                  </button>
                  {showExplanation === q.question_number && (
                    <div className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                      {getExplanationText(q.explanation)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Options bank */}
      {options.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Options</p>
          <div className="space-y-2">
            {options.map(opt => {
              const isUsed = usedIds.includes(opt.id.toUpperCase()) && !submitted;
              const isCorrectAns = showAnswers && questions.some(q => q.answer.toUpperCase() === opt.id.toUpperCase());
              return (
                <div key={opt.id} className={`flex items-baseline gap-2 text-[13px] transition-colors ${
                  submitted
                    ? isCorrectAns ? 'text-green-700 font-semibold' : 'text-gray-400'
                    : isUsed ? 'text-yellow-600' : 'text-gray-700'
                }`}>
                  <span className="font-bold shrink-0 w-4">{opt.id}</span>
                  <span>{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
