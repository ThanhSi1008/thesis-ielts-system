import { TranscriptEntry } from "../utils/SharedExerciseTypes";

function SpeakerAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-slate-100 text-slate-700 border-slate-200",
  ];
  // Stable color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] border shadow-sm shrink-0 transition-transform hover:scale-105 ${colorClass}`} title={name}>
      {initial}
    </div>
  );
}

function HighlightedText({ text, highlight, qNum }: { text: string; highlight?: string; qNum?: number }) {
  if (!highlight) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-amber-100/80 text-amber-900 rounded-md px-1.5 py-0.5 font-medium not-italic inline-flex items-center gap-2 border border-amber-200/50 shadow-sm mx-0.5">
            {qNum && (
              <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm leading-none shrink-0 tracking-tight uppercase">
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
      <div className="sticky top-0 bg-white/80 backdrop-blur-md pb-4 pt-2 z-10 border-b border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            Audio Transcript
          </h2>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-indigo-300" />
            <div className="w-2 h-2 rounded-full bg-indigo-100" />
          </div>
        </div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Review Session</p>
      </div>

      <div className="space-y-6 text-[14.5px] leading-[1.8] text-gray-700 pb-32">
        {transcript.map((entry, idx) => {
          const isLocated = locatedQuestion !== null && entry.question_number === locatedQuestion;
          return (
            <div
              id={entry.question_number ? `transcript-q-${entry.question_number}` : undefined}
              key={idx}
              className={`flex gap-5 transition-all duration-700 group ${
                isLocated 
                  ? "bg-indigo-50/50 ring-1 ring-indigo-100 p-4 -mx-4 rounded-2xl shadow-sm" 
                  : "bg-transparent p-0"
              }`}
            >
              {entry.speaker ? (
                <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                  <SpeakerAvatar name={entry.speaker} />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center">
                    {entry.speaker}
                  </span>
                </div>
              ) : (
                <div className="w-10 shrink-0" />
              )}
              
              <p className={`flex-1 pt-0.5 transition-colors ${isLocated ? "text-indigo-950 font-medium" : "text-gray-700"}`}>
                <HighlightedText text={entry.text} highlight={entry.highlight_text} qNum={entry.question_number} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
