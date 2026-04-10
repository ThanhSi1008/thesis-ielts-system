import Link from "next/link";

interface Exercise {
  id: string;
  topic: string;
  order: number;
  lessonTitle?: string;
  lessonId?: string;
}

export default async function ExercisesPage({
  params,
}: {
  params: { skill: string };
}) {
  const isListening = params.skill.toLowerCase() === "listening";
  const isReading = params.skill.toLowerCase() === "reading";
  const skillCapitalized =
    params.skill.charAt(0).toUpperCase() + params.skill.slice(1).toLowerCase();

  let exercises: Exercise[] = [];

  try {
    // 1. Fetch lessons for the skill to get lesson IDs
    const lessonsRes = await fetch(
      `http://localhost:3000/api/v1/ielts/skills/${skillCapitalized}/lessons`,
      { cache: "no-store" }
    );

    if (lessonsRes.ok) {
      const allLessons = await lessonsRes.json();

      if (allLessons.length > 0 && (isListening || isReading)) {
        const endpoint = isListening ? "listening-exercises" : "reading-exercises";

        // 2. Fetch exercises for each lesson
        const exPromises = allLessons.map(async (l: any) => {
          try {
            const exRes = await fetch(
              `http://localhost:3000/api/v1/ielts/lessons/${l.id}/${endpoint}`,
              { cache: "no-store" }
            );
            if (exRes.ok) {
              const exData = await exRes.json();
              return exData.map((ex: Exercise) => ({
                ...ex,
                lessonTitle: l.title,
                lessonId: l.id,
              }));
            }
          } catch (e) {
            console.error(`Failed to fetch exercises for lesson ${l.id}`, e);
          }
          return [];
        });

        const exResults = await Promise.all(exPromises);
        exercises = exResults.flat();
      }
    }
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
  }

  if (exercises.length === 0) {
    return (
      <p className="text-gray-400 py-4 text-center">
        No exercises found for this skill.
      </p>
    );
  }

  const toTypeLabel = (title: string) =>
    (title || "Other").replace(/^Chapter\s+\d+\s*[-–]\s*/i, "").trim() || "Other";

  const groups: { title: string; items: Exercise[] }[] = [];
  for (const ex of exercises) {
    const groupTitle = toTypeLabel(ex.lessonTitle || "Other");
    const existing = groups.find((g) => g.title === groupTitle);
    if (existing) {
      existing.items.push(ex);
    } else {
      groups.push({ title: groupTitle, items: [ex] });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-1 bg-[#FFC107] rounded-full shrink-0" />
            <h3 className="text-[14px] font-extrabold text-gray-800 tracking-wide">
              {group.title}
            </h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {group.items.length} exercise{group.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {group.items.map((ex, idx) => (
              <Link
                key={ex.id}
                href={`/ielts/basic/exercises/${ex.id}${
                  ex.lessonId ? `?lessonId=${ex.lessonId}` : ""
                }`}
              >
                <div className="flex items-center gap-4 px-5 py-3.5 bg-[#F9F9F9] hover:bg-[#FFF9E6] hover:border-[#FFC107]/30 transition-all rounded-xl cursor-pointer border border-transparent">
                  <span className="w-6 h-6 rounded-full bg-[#FFF3C2] text-[#A07000] font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">
                      {ex.topic}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0 group-hover:text-[#FFC107]">
                    Start →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
