import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote } from 'lucide-react';

export interface MatchingItem {
  id: number;
  text: string;
}

export interface MatchingOption {
  letter: string;
  text: string;
}

export interface MatchingQuestion {
  letter: string;
  timestamp_seconds?: number;
  explanation: string;
}

export interface MatchingGroup {
  type: "matching";
  heading?: string;
  description?: string;
  items: MatchingItem[];
  options: MatchingOption[];
  answers: Record<string, MatchingQuestion>;
}

export function MatchingCompletionGroup({
  group,
  answers,
  onAnswer,
  submitted,
  audioRef,
  onLocate,
}: {
  group: MatchingGroup;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, letter: string) => void;
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

  const allQs = Object.entries(group.answers).map(([k, v]) => ({ qNum: Number(k), ...v }));

  return (
    <div className="mb-8">
      {group.heading && (
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">{group.heading}</h3>
      )}
      
      {/* Options box */}
      <div className="mb-6 bg-gray-50/60 border border-gray-200 rounded-xl p-4 lg:p-5">
        <ul className="space-y-2.5">
          {group.options.map((opt) => (
            <li key={opt.letter} className="flex items-start text-[14px]">
              <span className="font-bold text-gray-700 w-8 shrink-0">{opt.letter}</span>
              <span className="text-gray-600 leading-relaxed">{opt.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Questions list */}
      <div className="space-y-3 mb-6 max-w-2xl">
        {group.items.map((item) => {
          const qNum = item.id;
          const qData = allQs.find(q => q.qNum === qNum);
          const selected = (answers[qNum] as string) ?? "";
          const isCorrect = submitted && qData && selected.toUpperCase() === qData.letter.toUpperCase();

          return (
            <div key={qNum} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              submitted ? (isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200") : "bg-white border-gray-200 focus-within:border-gray-400"
            }`}>
              <div className="flex-1 text-[14px] text-gray-800 font-medium">
                {item.text}
              </div>

              {submitted ? (
                <div className={`flex items-center font-bold text-[14px] px-3 py-1 rounded-md ${isCorrect ? "text-green-700 bg-green-100/50" : "text-red-600 bg-red-100/50"}`}>
                  <span className={!isCorrect ? "line-through opacity-70" : ""}>{selected || "—"}</span>
                  {!isCorrect && qData && (
                    <span className="ml-2 text-green-600">→ {qData.letter}</span>
                  )}
                </div>
              ) : (
                <select
                  value={selected}
                  onChange={(e) => onAnswer(qNum, e.target.value)}
                  className="outline-none bg-gray-50 border border-gray-200 text-gray-800 text-[13px] font-bold px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-[#FFC107] focus:border-[#FFC107]"
                >
                  <option value="">–</option>
                  {group.options.map((opt) => (
                    <option key={opt.letter} value={opt.letter}>
                      {opt.letter}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {/* Post-submit action buttons */}
      {submitted && (
        <div className="mt-4 space-y-2">
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
