import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote, Check, X } from 'lucide-react';
import { MCOption } from './MCQuestionItem';

export interface MCMultipleQuestion {
  question_numbers: number[];
  text: string;
  options: MCOption[];
  answers: string[];
  num_correct: number;
  explanation: string;
  question_timestamps?: number[];   // optional per-question seek points
}

export function MCMultipleQuestionItem({
  group,
  selectedLetters,
  onToggle,
  submitted,
  audioRef,
  onLocate,
}: {
  group: MCMultipleQuestion;
  selectedLetters: string[];
  onToggle: (letter: string) => void;
  submitted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const numCorrect = group.num_correct ?? group.answers.length;
  const correctSet = new Set(group.answers.map((a) => a.toUpperCase()));
  const selectedSet = new Set(selectedLetters.map((s) => s.toUpperCase()));
  const allCorrect = submitted && group.answers.every((a) => selectedSet.has(a.toUpperCase())) && selectedLetters.length === group.answers.length;

  // Build a map: question_number → timestamp_seconds (if provided)
  const timestampMap: Record<number, number> = {};
  group.question_numbers?.forEach((n, i) => {
    const ts = group.question_timestamps?.[i];
    if (ts !== undefined) timestampMap[n] = ts;
  });

  const seekTo = (ts?: number) => {
    if (!audioRef.current) return;
    if (ts !== undefined) {
      audioRef.current.currentTime = ts;
    }
    audioRef.current.play();
  };

  const firstQNum = group.question_numbers?.[0];

  return (
    <div className="mb-7">
      {/* Question numbers badge row */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex gap-1 shrink-0 mt-0.5">
          {group.question_numbers?.map((n) => (
            <span key={n} id={`question-${n}`} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${
              submitted
                ? allCorrect ? "text-green-600" : "text-red-500"
                : "text-gray-600"
            }`}>
              {n}
            </span>
          ))}
        </div>
        <p className="text-[14px] font-semibold text-gray-900 leading-snug">{group.text}</p>
      </div>

      <p className="text-[12px] text-gray-400 mb-3 ml-0 font-medium">
        Choose <span className="font-bold text-gray-600">{numCorrect}</span> letters, A–{String.fromCharCode(64 + (group.options?.length ?? 5))}
      </p>

      <div className="space-y-2 ml-2">
        {group.options?.map((opt) => {
          const isSelected = selectedSet.has(opt.letter.toUpperCase());
          const isCorrectAnswer = correctSet.has(opt.letter.toUpperCase());

          let borderColor = "border-gray-300";
          let bgColor = "bg-white";
          let innerContent: React.ReactNode = null;

          if (submitted) {
            if (isCorrectAnswer && isSelected) {
              borderColor = "border-green-500";
              innerContent = <Check className="w-3 h-3 text-green-500" />;
            } else if (isCorrectAnswer && !isSelected) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50";
              innerContent = <Check className="w-3 h-3 text-green-400" />;
            } else if (!isCorrectAnswer && isSelected) {
              borderColor = "border-red-400";
              innerContent = <X className="w-3 h-3 text-red-400" />;
            }
          } else {
            if (isSelected) {
              borderColor = "border-[#FFC107]";
              innerContent = <Check className="w-3 h-3 text-[#FFC107]" />;
            }
          }

          return (
            <button
              key={opt.letter}
              disabled={submitted}
              onClick={() => {
                if (!submitted) {
                  // Enforce max selections
                  if (!isSelected && selectedLetters.length >= numCorrect) return;
                  onToggle(opt.letter);
                }
              }}
              className={`flex items-center gap-3 text-left text-[14px] text-gray-700 w-full outline-none focus:outline-none ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className={`w-[18px] h-[18px] rounded border-2 ${borderColor} ${bgColor} flex items-center justify-center shrink-0 transition-all`}>
                {innerContent}
              </span>
              <span className={
                submitted && isCorrectAnswer ? "font-semibold text-green-700" :
                submitted && isSelected && !isCorrectAnswer ? "text-red-500 line-through" : ""
              }>
                <span className="font-bold mr-1.5">{opt.letter}.</span>{opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Post-submit action buttons — one row per question number */}
      {submitted && (
        <div className="ml-2 mt-3 space-y-2">
          {group.question_numbers?.map((qNum) => (
            <div key={qNum} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{qNum}</span>
              <button onClick={() => onLocate(qNum)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button onClick={() => setShowExplanation(!showExplanation)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
            </div>
          ))}
        </div>
      )}

      {showExplanation && group.explanation && (
        <div className="mt-2 ml-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-[13px] text-blue-800 leading-relaxed">
          {group.explanation}
        </div>
      )}
    </div>
  );
}
