import React, { useState } from 'react';
import { Headphones, MapPin, MessageSquare, StickyNote } from 'lucide-react';
import QuestionNoteSection from '@/components/QuestionNote';

export interface DiagramLabellingOption {
  letter: string;
  text: string;
}

export interface DiagramLabellingItem {
  question_number: number;
  answer: string;
  timestamp_seconds?: number;
  explanation: string;
}

export interface DiagramLabellingGroupType {
  type: "diagram_labelling";
  heading?: string;
  image_url: string;
  options: DiagramLabellingOption[];
  items: DiagramLabellingItem[];
}

export function DiagramLabellingGroup({
  group,
  answers,
  onAnswer,
  submitted,
  showAnswers,
  audioRef,
  onLocate,
}: {
  group: DiagramLabellingGroupType;
  answers: Record<string | number, string>;
  onAnswer: (qNum: number, letter: string) => void;
  submitted: boolean;
  showAnswers: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onLocate: (qNum: number) => void;
}) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [activeNoteQn, setActiveNoteQn] = useState<number | null>(null);

  const seekTo = (ts?: number) => {
    if (!audioRef.current) return;
    if (ts !== undefined) audioRef.current.currentTime = ts;
    audioRef.current.play();
  };

  const allQs = group.items;
  const labels = group.options.map((opt) => opt.letter);

  return (
    <div className="mb-8 font-sans">
      {group.heading && (
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-5">{group.heading}</h3>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start mb-6">
        {/* Map/Diagram Image Section */}
        <div className="bg-white border border-gray-200 p-2 overflow-hidden lg:w-[50%] flex-shrink-0 relative flex items-center justify-center min-h-[250px]">
          <img
            src={group.image_url}
            alt={group.heading || "Diagram"}
            className="max-w-full max-h-[400px] object-contain"
          />
        </div>

        {/* Options Bank & Questions Table Section */}
        <div className="w-full lg:w-[50%] flex flex-col gap-4">
          
          {/* Options Bank */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-[13px] font-bold text-gray-800 mb-3 border-b border-blue-200 pb-2">Options Box</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {group.options.map((opt) => (
                <div key={opt.letter} className="flex gap-2 text-[13.5px]">
                  <span className="font-bold text-blue-800 shrink-0 w-4">{opt.letter}</span>
                  <span className="text-gray-700">{opt.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radio Grid Table */}
          <div className="overflow-x-auto border border-gray-300">
            <table className="w-full text-left border-collapse min-w-[350px] bg-white">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-3 px-3 text-left w-[20%] bg-white">Q.No</th>
                  {labels.map((label) => (
                    <th key={label} className="py-3 px-1 text-center font-bold text-gray-900 text-[14px] border-l border-gray-300 w-10">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {allQs.map((item) => {
                  const qNum = item.question_number;
                  const selected = (answers[qNum] as string) ?? "";
                  const isCorrect = submitted && selected.toUpperCase() === item.answer.toUpperCase();

                  return (
                    <tr key={qNum} className={
                      submitted ? (isCorrect ? "bg-green-50/30" : "bg-red-50/40") : "hover:bg-gray-50/60 transition-colors"
                    }>
                      {/* Number and Correct Answer Display */}
                      <td className="py-3 px-3 align-middle bg-white">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 border rounded-[4px] border-blue-300 text-blue-700 font-bold text-[12px] shrink-0">
                            {qNum}
                          </span>
                          {submitted && !isCorrect && (
                            <span className="font-bold text-green-600 text-[13px]">→ {item.answer}</span>
                          )}
                        </div>
                      </td>

                      {/* Radio Grid */}
                      {labels.map((label) => {
                        const isSelected = selected.toUpperCase() === label.toUpperCase();
                        const isActualAnswer = item.answer.toUpperCase() === label.toUpperCase();

                        let radioClasses = "w-[18px] h-[18px] cursor-pointer disabled:cursor-default ";
                        if (submitted) {
                          if (isActualAnswer) radioClasses += "accent-green-600 ";
                          else if (isSelected && !isCorrect) radioClasses += "accent-red-500 ";
                          else radioClasses += "accent-[#FFC107] ";
                        } else {
                          radioClasses += "accent-[#1E3A8A] hover:accent-[#3B82F6] ";
                        }

                        return (
                          <td key={label} className={`py-3 px-1 text-center border-l border-gray-200 align-middle ${submitted && showAnswers && isActualAnswer && !isSelected ? "bg-green-100/50" : ""}`}>
                            <input
                              type="radio"
                              name={`diagram-q-${qNum}`}
                              value={label}
                              checked={isSelected}
                              onChange={() => onAnswer(qNum, label)}
                              disabled={submitted}
                              className={radioClasses}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Post-submit action buttons */}
      {showAnswers && (
        <div className="mt-6 space-y-2">
          {allQs.map(({ question_number, timestamp_seconds, explanation }) => (
            <div key={question_number} className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 w-6 shrink-0">Q{question_number}</span>
              <button
                onClick={() => seekTo(timestamp_seconds)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" /> Listen from here
              </button>
              <button
                onClick={() => onLocate(question_number)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
               >
                <MapPin className="w-3.5 h-3.5" /> Locate
               </button>
               <button

                 onClick={() => setShowExplanation(showExplanation === question_number ? null : question_number)}

                 className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${

                   showExplanation === question_number ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "text-gray-600 bg-gray-100 hover:bg-gray-200"

                 }`}

               >

                 <MessageSquare className="w-3.5 h-3.5" /> Explain

               </button>
               <button
                  onClick={() => setActiveNoteQn(activeNoteQn === question_number ? null : question_number)}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                    activeNoteQn === question_number ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" /> Note
                </button>
               {showExplanation === question_number && (
                  <div className="w-full mt-1.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[13px] text-blue-900 leading-relaxed">
                    {explanation}
                  </div>
                )}
                {activeNoteQn === question_number && (
                  <QuestionNoteSection questionNumber={question_number} />
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
