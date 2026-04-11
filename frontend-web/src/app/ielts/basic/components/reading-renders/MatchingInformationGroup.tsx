import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface MatchingOption {
  letter: string;
  text: string;
}

export interface MatchingQuestion {
  question_number: number;
  text: string;
  answer: string;
  explanation?: any;
}

export interface MatchingInformationGroup {
  type: 'matching_information';
  instruction?: string;
  options: MatchingOption[];
  questions: MatchingQuestion[];
}

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function MatchingInformationGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: MatchingInformationGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, val: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const qNums = group.questions.map(q => q.question_number);
  const optionLetters = group.options.map(o => o.letter);

  return (
    <div className="mb-8 font-sans">
      {/* Header */}
      {qNums.length > 0 && (
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </p>
      )}
      <p className="text-[13px] text-gray-600 mb-6 leading-relaxed">
        {group.instruction || 'Which paragraph contains the following information?'}
      </p>

      {/* Grid Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg mb-8 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-white border-b border-gray-300">
              <th className="p-4 w-12 border-r border-gray-300"></th>
              <th className="p-4 border-r border-gray-300"></th>
              {optionLetters.map(letter => (
                <th key={letter} className="p-4 text-center font-bold text-gray-800 border-r border-gray-300 last:border-r-0 w-12">
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.questions.map((q, idx) => {
              const selected = (answers[q.question_number] ?? '').toUpperCase();
              const isCorrect = submitted && selected === q.answer.toUpperCase();
              
              return (
                <tr key={idx} className={`border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors ${
                  submitted ? (isCorrect ? 'bg-green-50/30' : 'bg-red-50/30') : ''
                }`}>
                  <td className="p-4 border-r border-gray-300 text-center font-bold text-gray-500 bg-gray-50/30">
                    {q.question_number}
                  </td>
                  <td className="p-4 border-r border-gray-300 text-[14px] text-gray-700 leading-snug">
                    <div id={`question-${q.question_number}`}>
                      {q.text}
                    </div>
                  </td>
                  {optionLetters.map(letter => {
                    const isSelected = selected === letter.toUpperCase();
                    const isCorrectCell = submitted && letter.toUpperCase() === q.answer.toUpperCase();
                    
                    return (
                      <td key={letter} className={`p-0 border-r border-gray-300 last:border-r-0 relative ${
                        showAnswers && isCorrectCell ? 'bg-green-400/20' : ''
                      }`}>
                        <label className="flex items-center justify-center w-full h-full p-4 cursor-pointer group">
                          <input
                            type="radio"
                            name={`q-${q.question_number}`}
                            value={letter}
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() => onAnswer(q.question_number, letter)}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? (submitted ? (isCorrect ? 'border-green-600 bg-green-600' : 'border-red-500 bg-red-500') : 'border-[#FFC107] bg-[#FFC107]')
                              : (submitted ? 'border-gray-200' : 'border-gray-300 group-hover:border-gray-400')
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                          </div>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* List of Paragraphs Box */}
      <div className="mb-8 overflow-hidden border border-gray-300 rounded-lg shadow-sm max-w-sm">
        <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
          <h4 className="text-[12px] font-bold text-gray-600 uppercase tracking-widest leading-none">
            List of Paragraphs
          </h4>
        </div>
        <div className="bg-white">
          {group.options.map((opt, idx) => (
            <div key={idx} className="flex border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="w-10 px-4 py-3 flex items-center justify-center border-r border-gray-200 bg-gray-50/30 font-bold text-gray-700 text-[13px]">
                {opt.letter}
              </div>
              <div className="flex-1 px-4 py-3 text-[13.5px] text-gray-700 font-medium">
                {opt.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-submit Action Buttons */}
      {showAnswers && (
        <div className="space-y-3">
          {group.questions.map(q => (
            <div key={q.question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{q.question_number}</span>
              <button 
                onClick={() => onLocate(q.question_number)} 
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm"
              >
                <MapPin className="w-3 h-3" /> Locate
              </button>
              <button 
                onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} 
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm"
              >
                <MessageSquare className="w-3 h-3" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                <StickyNote className="w-3 h-3" /> Note
              </button>
              {showExplanation === q.question_number && (
                <div className="w-full mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed shadow-sm">
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
