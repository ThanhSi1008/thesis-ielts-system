import { PassageSegment } from "../utils/SharedExerciseTypes";

export function ReadingPassagePanel({
  passageWithLocations,
  passage,
  locatedQuestion,
  submitted,
}: {
  passageWithLocations?: PassageSegment[];
  passage?: string;
  locatedQuestion: number | null;
  submitted: boolean;
}) {
  const segments = passageWithLocations;

  // Before submitting: render passage as plain text (no Q markers)
  const plainText = segments
    ? segments.map((seg) => (typeof seg === "string" ? seg : seg.text)).join("")
    : passage ?? "";

  return (
    <div className="h-full overflow-y-auto pr-6 lg:pr-8">
      <h2 className="text-base font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b border-gray-100 z-10">
        Reading Passage
      </h2>
      <div className="text-[14.5px] leading-[1.85] text-gray-800 pb-24">
        {!submitted ? (
          // Plain text — no markers yet
          <p>{plainText}</p>
        ) : segments && segments.length > 0 ? (
          // After submit — show Q location markers
          <p>
            {segments.map((seg, i) => {
              if (typeof seg === "string") {
                return <span key={i}>{seg}</span>;
              }
              const isHighlighted = locatedQuestion === seg.question_number;
              return (
                <mark
                  id={`passage-q-${seg.question_number}`}
                  key={i}
                  className={`rounded-md px-1 py-0.5 mx-0.5 transition-colors duration-500 inline ${
                    isHighlighted
                      ? "bg-[#FFC107] text-gray-900"
                      : "bg-[#FFF9E6] text-gray-800"
                  }`}
                >
                  <span className="bg-gray-800 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-sm mr-1 relative -top-[1px] inline-block">
                    Q{seg.question_number}
                  </span>
                  {seg.text}
                </mark>
              );
            })}
          </p>
        ) : (
          <p>{passage}</p>
        )}
      </div>
    </div>
  );
}
