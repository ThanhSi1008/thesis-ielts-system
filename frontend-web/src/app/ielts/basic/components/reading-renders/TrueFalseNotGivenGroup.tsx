import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface TFNGQuestion {
  question_number: number;
  text: string;
  answer: string;
  explanation?: any; // Can be string or structured object
}

export interface TFNGGroup {
  type: "true_false_not_given" | "yes_no_not_given";
  questions: TFNGQuestion[];
  instruction?: string;
}

export function TrueFalseNotGivenGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  onLocate,
}: {
  group: TFNGGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, letter: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const options = group.type === "yes_no_not_given" 
    ? ["YES", "NO", "NOT GIVEN"]
    : ["TRUE", "FALSE", "NOT GIVEN"];

  const getExplanationText = (exp: any) => {
    if (!exp) return "";
    if (typeof exp === 'string') return exp;
    return exp.rationale || JSON.stringify(exp);
  };

  return (
    <div className="mb-8">
      {/* Title / Instruction block */}
      <div className="mb-4">
        {group.questions && group.questions.length > 0 && (
          <p className="text-[13px] font-bold text-gray-900 mb-0.5">
            Questions {Math.min(...group.questions.map(q => q.question_number))}–{Math.max(...group.questions.map(q => q.question_number))}
          </p>
        )}
        <p className="text-[13px] text-gray-600 mb-2 leading-relaxed">
          {group.instruction || `Choose ${options[0]} if the statement agrees with the information given in the text, choose ${options[1]} if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.`}
        </p>
      </div>

      <div className="space-y-6">
        {group.questions?.map((q) => {
          const selected = answers[q.question_number]?.toUpperCase() || null;
          const isCorrect = selected === q.answer.toUpperCase();

          return (
            <div id={`question-${q.question_number}`} key={q.question_number} className="flex flex-col">
              {/* Question Text with Number Box */}
              <div className="flex items-start gap-3 mb-3">
                <span className={`inline-flex min-w-[24px] px-1.5 h-6 items-center justify-center rounded text-[12px] font-bold border shrink-0 mt-0.5 ${
                  submitted
                    ? isCorrect ? "border-green-300 text-green-700 bg-green-50" : "border-red-300 text-red-600 bg-red-50"
                    : "border-blue-200 text-blue-700 bg-blue-50"
                }`}>
                  {q.question_number}
                </span>
                <p className="text-[14px] font-medium text-gray-800 leading-snug pt-1">
                  {q.text}
                </p>
              </div>

              {/* Radio Options */}
              <div className="flex flex-col gap-2 ml-9">
                {options.map((opt) => {
                  const isSelected = selected === opt;
                  const isAnswerKey = q.answer.toUpperCase() === opt;
                  
                  let circleClass = "w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-all bg-white ";
                  let innerContent = null;
                  let textColorClass = "text-gray-700";

                  if (submitted) {
                    if (isAnswerKey && showAnswers) {
                      circleClass += "border-green-500 shadow-sm";
                      innerContent = <div className="w-[8px] h-[8px] rounded-full bg-green-500" />;
                      textColorClass = "text-green-700 font-bold";
                    } else if (isSelected && !isAnswerKey) {
                      circleClass += "border-red-400";
                      innerContent = <div className="w-[8px] h-[8px] rounded-full bg-red-400" />;
                      textColorClass = "text-red-500 line-through";
                    } else if (isSelected && isAnswerKey && !showAnswers) {
                      circleClass += "border-green-500 shadow-sm";
                      innerContent = <div className="w-[8px] h-[8px] rounded-full bg-green-500" />;
                      textColorClass = "text-green-700 font-bold";
                    } else {
                      circleClass += "border-gray-300 opacity-50";
                      textColorClass = "text-gray-400";
                    }
                  } else {
                    if (isSelected) {
                      circleClass += "border-blue-500 shadow-sm";
                      innerContent = <div className="w-[8px] h-[8px] rounded-full bg-blue-500" />;
                      textColorClass = "text-blue-700 font-bold";
                    } else {
                      circleClass += "border-gray-300 hover:border-blue-400";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      disabled={submitted}
                      onClick={() => onAnswer(q.question_number, opt)}
                      className={`flex items-center gap-2 text-[12px] uppercase tracking-wide outline-none focus:outline-none transition-colors ${
                        submitted ? "cursor-default" : "cursor-pointer hover:text-gray-900"
                      } ${textColorClass}`}
                    >
                      <span className={circleClass}>{innerContent}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Post-submit action buttons */}
              {showAnswers && (
                <div className="ml-9 mt-3 flex flex-wrap gap-2">
                  <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                    <MapPin className="w-3 h-3" /> Locate
                  </button>
                  <button onClick={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                    <MessageSquare className="w-3 h-3" /> Explain
                  </button>
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md transition-colors shadow-sm">
                    <StickyNote className="w-3 h-3" /> Note
                  </button>
                </div>
              )}

              {/* Explanation Dropdown */}
              {showExplanation === q.question_number && (
                <div className="ml-9 mt-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed shadow-inner">
                  {getExplanationText(q.explanation)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
