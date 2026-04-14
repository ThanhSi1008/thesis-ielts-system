import { TranscriptEntry } from "../utils/SharedExerciseTypes";

function HighlightedText({ text, highlight, qNum }: { text: string; highlight?: string; qNum?: number }) {
  if (!highlight) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-[#FFF9E6] text-gray-900 px-1.5 py-0.5 rounded-[4px] font-semibold not-italic" style={{ textDecorationColor: '#FFC107' }}>
            {qNum && (
              <span className="inline-flex items-center justify-center bg-gray-900 text-white text-[9px] font-extrabold px-[5px] py-[2px] rounded-[3px] mr-1.5 tracking-wider align-middle select-none">
                Q{qNum}
              </span>
            )}
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function TranscriptPanel({ transcript, locatedQuestion }: { transcript: TranscriptEntry[]; locatedQuestion: number | null }) {
  return (
    <div className="h-full overflow-y-auto pl-6 pr-4 scroll-smooth">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md pb-4 pt-1 z-10 border-b border-gray-100 mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Transcript
        </h2>
      </div>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-700 pb-32">
        {transcript.map((entry, idx) => {
          const isLocated = locatedQuestion !== null && entry.question_number === locatedQuestion;
          return (
            <div
              id={entry.question_number ? `transcript-q-${entry.question_number}` : undefined}
              key={idx}
              className={`flex flex-col transition-all duration-500 rounded-2xl ${
                isLocated 
                  ? "bg-gray-50 p-4 -mx-4 ring-1 ring-gray-100/50" 
                  : "bg-transparent p-0"
              }`}
            >
              {entry.speaker && (
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 select-none">
                  {entry.speaker}
                </span>
              )}
              
              <p className={`transition-colors ${isLocated ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                <HighlightedText text={entry.text} highlight={entry.highlight_text} qNum={entry.question_number} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
