import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote, Check } from 'lucide-react';

// ─── Flow Chart Completion ────────────────────────────────────────────────────

export interface FlowChartQuestion {
  question_number: number;
  letter_answer: string;
  text_answer: string;
  timestamp_seconds?: number;
  explanation: string;
}

export interface FlowChartStep {
  text: string;
  question?: FlowChartQuestion;
}

export interface FlowChartOption {
  letter: string;
  text: string;
}

export interface FlowChartGroup {
  type: "flow_chart";
  heading?: string;
  options?: FlowChartOption[];
  steps: FlowChartStep[];
}

export function FlowChartCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  audioRef,
  onLocate,
}: {
  group: FlowChartGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, letter: string) => void;
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

  const allQs = group.steps.filter((s) => s.question).map((s) => s.question!);

  // Pick which letters have already been used
  const usedLetters = Object.values(
    Object.fromEntries(allQs.map((q) => [q.question_number, answers[q.question_number] ?? ""]))
  ).filter(Boolean);

  // Render a step text with an inline letter selector where the blank is
  const renderStepText = (step: FlowChartStep) => {
    if (!step.question) {
      return <span>{step.text}</span>;
    }

    const { question_number, letter_answer, text_answer } = step.question;
    const blankRegex = /\b(\d+)\s*\.{3,}/;
    const match = step.text.match(blankRegex);
    const selected = (answers[question_number] as string) ?? "";
    
    const isCorrect = submitted && (
      (letter_answer && selected.toUpperCase() === letter_answer.toUpperCase()) ||
      (!letter_answer && text_answer && selected.trim().toLowerCase() === text_answer.trim().toLowerCase())
    );
    const selectedOption = group.options?.find((o) => o.letter.toUpperCase() === selected.toUpperCase());

    if (!match) return <span>{step.text}</span>;

    const splitIdx = step.text.indexOf(match[0]);
    const before = step.text.slice(0, splitIdx).trimEnd();
    const after = step.text.slice(splitIdx + match[0].length).trimStart();

    return (
      <span className="leading-loose">
        {before && <span>{before} </span>}
        {submitted ? (
          <span className={`inline-flex items-center gap-1 border rounded px-2 py-0.5 mx-0.5 font-medium text-[12px] ${
            isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
          }`}>
            <span className={`text-[10px] font-bold mr-0.5 ${isCorrect ? "text-green-600" : "text-red-400"}`}>{question_number}</span>
            <span className={`font-bold ${isCorrect ? "text-green-700" : "text-red-500"}`}>{selected || "—"}</span>
            {selectedOption && <span className={`text-[11px] ${isCorrect ? "text-green-600" : "text-red-500 line-through"}`}>({selectedOption.text})</span>}
            {!isCorrect && <span className="text-green-600 font-bold text-[11px]">→ {letter_answer || text_answer} {letter_answer && text_answer ? `(${text_answer})` : ''}</span>}
          </span>
        ) : (
          <span className={`inline-flex items-center border rounded px-1.5 py-0.5 mx-0.5 min-w-[70px] border-gray-400 bg-white focus-within:border-[#FFC107] transition-colors`}>
            <span className="text-[10px] font-bold text-gray-400 mr-1 shrink-0">{question_number}</span>
            {group.options && group.options.length > 0 ? (
              <select
                value={selected}
                onChange={(e) => onAnswer(question_number, e.target.value)}
                className="outline-none bg-transparent text-gray-800 text-[12px] font-semibold flex-1 cursor-pointer w-full"
              >
                <option value="">–</option>
                {group.options.map((opt) => (
                  <option key={opt.letter} value={opt.letter} disabled={usedLetters.includes(opt.letter) && selected !== opt.letter}>
                    {opt.letter} – {opt.text}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selected}
                onChange={(e) => onAnswer(question_number, e.target.value)}
                className="outline-none bg-transparent text-gray-800 min-w-[60px] w-full font-medium caret-yellow-500 text-[12px]"
              />
            )}
          </span>
        )}
        {after && <span> {after}</span>}
      </span>
    );
  };

  return (
    <div className="mb-6">
      {/* Options word bank */}
      {group.options && group.options.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mr-1">Options:</span>
          {group.options.map((opt) => {
            const isUsed = usedLetters.includes(opt.letter) && !submitted;
            const isCorrectAns = submitted && allQs.some((q) => q.letter_answer === opt.letter);
            return (
              <span
                key={opt.letter}
                className={`inline-flex items-center gap-1 border rounded px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                  submitted
                    ? isCorrectAns ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-400"
                    : isUsed ? "border-yellow-300 bg-yellow-50 text-yellow-700" : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                <span className="font-bold">{opt.letter}</span>
                <span className="text-gray-400">·</span>
                {opt.text}
              </span>
            );
          })}
        </div>
      )}

      {/* Flow steps */}
      <div className="flex flex-col items-center gap-0 max-w-md">
        {group.steps.map((step, si) => (
          <div key={si} className="flex flex-col items-center w-full">
            {/* Step box */}
            <div className={`w-full border-2 rounded-lg px-4 py-3 text-[13px] text-gray-800 leading-loose text-center transition-colors ${
              step.question ? "border-gray-400" : "border-gray-300 bg-gray-50/60"
            }`}>
              {renderStepText(step)}
            </div>
            {/* Arrow down (not after the last step) */}
            {si < group.steps.length - 1 && (
              <div className="flex flex-col items-center my-1">
                <div className="w-0.5 h-4 bg-gray-400" />
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post-submit action buttons */}
      {showAnswers && (
        <div className="mt-4 space-y-2">
          {allQs.map(({ question_number, timestamp_seconds, explanation }) => (
            <div key={question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{question_number}</span>
              <button onClick={() => seekTo(timestamp_seconds)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button onClick={() => onLocate(question_number)} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <MapPin className="w-3.5 h-3.5" /> Locate
              </button>
              <button
                onClick={() => setShowExplanation(showExplanation === question_number ? null : question_number)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Explain
              </button>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
              {showExplanation === question_number && (
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
