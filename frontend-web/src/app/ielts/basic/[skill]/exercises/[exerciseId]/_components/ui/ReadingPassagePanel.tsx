import { PassageSegment } from "../utils/SharedExerciseTypes";

export function ReadingPassagePanel({
  passageWithLocations,
  passage,
  locatedQuestion,
  showAnswers,
}: {
  passageWithLocations?: PassageSegment[];
  passage?: string;
  locatedQuestion: number | null;
  showAnswers: boolean;
}) {
  const segments = passageWithLocations;

  // Before submitting: render passage as plain text (no Q markers)
  const plainText = Array.isArray(segments) && segments.length > 0
    ? segments.map((seg) => (typeof seg === "string" ? seg : seg.text)).join("")
    : passage ?? "";

  // Helper to detect section label
  const getSectionLabel = (text: string) => {
    const match = text.match(/^([A-Z])\s+/);
    return match ? match[1] : null;
  };

  const cleanText = (text: string) => {
    return text.replace(/^([A-Z])\s+/, "");
  };

  const renderContent = (content: string, qNum?: number, isHighlighted?: boolean) => {
    return (
      <mark className={`transition-all duration-300 bg-transparent ${isHighlighted
        ? "bg-[#FFF9E6] text-gray-900 rounded-[4px] px-1 shadow-[0_0_0_2px_#FFF9E6]"
        : (qNum !== undefined ? "text-gray-800" : "text-gray-800")
        }`}
      >
        {qNum !== undefined && (
          <span className={`inline-flex items-center justify-center text-[9px] font-extrabold px-[5px] py-[2px] rounded-[3px] mx-1 tracking-wider align-middle select-none transition-colors ${isHighlighted ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
            }`}>
            Q{qNum}
          </span>
        )}
        <span className={`${isHighlighted ? "font-bold" : "font-normal"}`}>
          {cleanText(content)}
        </span>
      </mark>
    );
  };

  // Grouping logic for submitted state with segments
  const groupedSections: Array<{ label: string | null; segments: PassageSegment[] }> = [];
  if (Array.isArray(segments)) {
    segments.forEach((seg) => {
      const text = typeof seg === "string" ? seg : seg.text;
      const label = getSectionLabel(text);
      if (label || groupedSections.length === 0) {
        groupedSections.push({ label, segments: [seg] });
      } else {
        groupedSections[groupedSections.length - 1].segments.push(seg);
      }
    });
  }

  return (
    <div className="h-full overflow-y-auto pr-6 lg:pr-8 scroll-smooth custom-scrollbar">
      <div className="top-0 bg-white/95 backdrop-blur-md pb-4 pt-1 z-10 border-b border-gray-100 mb-8 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Passage
        </h2>
        {showAnswers && (
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Answers Revealed</span>
          </div>
        )}
      </div>

      <div className="text-[15px] leading-[1.9] text-gray-800 pb-32 whitespace-pre-wrap antialiased">
        {!showAnswers ? (
          <div className="space-y-8">
            {(plainText || "").split('\n\n').map((para, pi) => {
              const label = getSectionLabel(para);
              return (
                <div key={pi} className="flex flex-col group">
                  {label && (
                    <div className="flex items-center gap-3 mb-2 mt-4 first:mt-0">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white font-black text-lg tracking-tight shadow-sm">
                        {label}
                      </span>
                      <div className="h-[1px] flex-1 bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                    </div>
                  )}
                  <p className="pl-0 border-l-0 border-gray-100 group-hover:border-indigo-400 transition-all duration-500">
                    {cleanText(para)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : groupedSections.length > 0 ? (
          <div className="space-y-6">
            {groupedSections.map((sec, si) => (
              <div key={si} className="flex flex-col group">
                {sec.label && (
                  <div className="flex items-center gap-3 mb-2 mt-4 first:mt-0">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-lg tracking-tight shadow-lg ring-4 ring-indigo-50">
                      {sec.label}
                    </span>
                    <div className="h-[1px] flex-1 bg-indigo-100" />
                  </div>
                )}
                <div className="pl-0">
                  {sec.segments.map((seg, i) => {
                    if (typeof seg === "string") {
                      return <span key={i} className="whitespace-pre-wrap">{cleanText(seg)}</span>;
                    }
                    const isHighlighted = locatedQuestion === seg.question_number;
                    return (
                      <span key={i} id={`passage-q-${seg.question_number}`} className="inline">
                        {renderContent(seg.text, seg.question_number, isHighlighted)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {(passage || "").split('\n\n').map((para, pi) => {
              const label = getSectionLabel(para);
              return (
                <div key={pi} className="flex flex-col">
                  {label && (
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white font-black text-lg tracking-tight shadow-sm mb-2 mt-4 first:mt-0">
                      {label}
                    </span>
                  )}
                  <p>{cleanText(para)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
