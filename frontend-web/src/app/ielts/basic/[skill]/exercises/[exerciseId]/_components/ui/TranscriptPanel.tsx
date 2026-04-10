import { TranscriptEntry } from "../utils/SharedExerciseTypes";

export function TranscriptPanel({ transcript, locatedQuestion }: { transcript: TranscriptEntry[]; locatedQuestion: number | null }) {
  return (
    <div className="h-full overflow-y-auto pl-6 pr-4">
      <h2 className="text-base font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100 z-10">
        Audio Transcript
      </h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-gray-700 pb-24">
        {transcript.map((entry, idx) => {
          const isHighlighted = locatedQuestion !== null && entry.question_number === locatedQuestion;
          return (
            <div
              id={entry.question_number ? `transcript-q-${entry.question_number}` : undefined}
              key={idx}
              className={`flex gap-4 rounded-lg p-2 transition-colors duration-500 -ml-2 ${isHighlighted ? "bg-[#FFF9E6]" : "bg-transparent"}`}
            >
              {entry.speaker && (
                <span className="font-bold text-gray-900 shrink-0 w-28 uppercase text-[11px] tracking-wider text-right mt-1">
                  {entry.speaker}
                </span>
              )}
              <p className="flex-1">{entry.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
