import React, { useState } from 'react';
import { MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface MCOption {
  letter: string;
  text: string;
}

export interface MCQuestion {
  question_number: number;
  text: string;
  options: MCOption[];
  answer: string;
  timestamp_seconds: number;
  explanation: string;
}

export function MCQuestionItem({
  q,
  selected,
  onSelect,
  submitted,
  showAnswers,
  onLocate,
}: {
  q: MCQuestion;
  selected: string | null;
  onSelect: (letter: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const isCorrect = selected?.toUpperCase() === q.answer?.toUpperCase();return (
    <div id={`question-${q.question_number}`} className="mb-7">
      <p className="text-[14px] font-semibold text-gray-900 mb-3 leading-snug flex items-start">
        <span className={`inline-block mr-2 font-bold ${submitted
          ? isCorrect ? "text-green-600" : "text-red-500"
          : "text-gray-900"
          }`}>
          {q.question_number}.
        </span>
        {q.text}
      </p>

      <div className="space-y-2 ml-8">
        {q.options.map((opt) => {
          const isSelected = selected?.toUpperCase() === opt.letter.toUpperCase();
          const isAnswerKey = q.answer?.toUpperCase() === opt.letter.toUpperCase();
          let circleClass = "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ";
          let innerContent = null;

          if (submitted) {
            if (isAnswerKey && showAnswers) {
              circleClass += "border-green-500 bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-green-500" />;
            } else if (isSelected && !isAnswerKey) {
              circleClass += "border-red-400 bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-red-400" />;
            } else if (isSelected && isAnswerKey && !showAnswers) {
               // They got it right, but showAnswers is false. We can show it as green so they know it's correct.
              circleClass += "border-green-500 bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-green-500" />;
            } else {
              circleClass += "border-gray-300 bg-white";
            }
          } else {
            if (isSelected) {
              circleClass += "border-[#FFC107] bg-white";
              innerContent = <div className="w-[10px] h-[10px] rounded-full bg-[#FFC107]" />;
            } else {
              circleClass += "border-gray-300 hover:border-gray-400 bg-white";
            }
          }

          return (
            <button
              key={opt.letter}
              disabled={submitted}
              onClick={() => onSelect(opt.letter)}
              className={`flex items-center gap-2.5 text-left text-[14px] text-gray-700 w-full outline-none focus:outline-none group ${submitted ? "cursor-default" : "cursor-pointer hover:text-gray-900"}`}
            >
              <span className={circleClass}>
                {innerContent}
              </span>
              <span className={
                submitted && isAnswerKey && showAnswers ? "font-semibold text-green-700" :
                  submitted && isSelected && isAnswerKey ? "font-semibold text-green-700" :
                    submitted && isSelected && !isAnswerKey ? "text-red-500 line-through" :
                      ""
              }>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post-submit action buttons */}
      {showAnswers && (
        <div className="ml-8 mt-3 flex flex-wrap gap-2">
          <button onClick={() => onLocate(q.question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <MapPin className="w-3.5 h-3.5" /> Locate
          </button>
          <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Explain
          </button>
          <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
            <StickyNote className="w-3.5 h-3.5" /> Note
          </button>
        </div>
      )}

      {showExplanation && q.explanation && (
        <div className="ml-8 mt-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed space-y-2">
          {typeof q.explanation === "string" ? (
            <p>{q.explanation}</p>
          ) : (
            <>
              {(q.explanation as any).keyword && (
                <p><span className="font-bold">🔑 Keyword:</span> {(q.explanation as any).keyword}</p>
              )}
              {(q.explanation as any).rationale && (
                <p><span className="font-bold">💡 Rationale:</span> {(q.explanation as any).rationale}</p>
              )}
              {(q.explanation as any).distractor_analysis && (
                <p><span className="font-bold">⚠️ Distractor:</span> {(q.explanation as any).distractor_analysis}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
