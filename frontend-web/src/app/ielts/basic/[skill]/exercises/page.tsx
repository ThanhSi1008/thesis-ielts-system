import Link from "next/link";
import ClientExerciseListGroup from "./ClientExerciseListGroup";

export default async function ExercisesPage({
  params,
}: {
  params: { skill: string };
}) {
  const isListening = params.skill.toLowerCase() === "listening";
  const isReading = params.skill.toLowerCase() === "reading";
  const isWriting = params.skill.toLowerCase() === "writing";
  const isSpeaking = params.skill.toLowerCase() === "speaking";
  const skillCapitalized =
    params.skill.charAt(0).toUpperCase() + params.skill.slice(1).toLowerCase();

  let exercises: any[] = [];

  try {
    // 1. Fetch lessons for the skill to get foundationVocabLesson IDs
    const lessonsRes = await fetch(
      `http://localhost:3000/api/v1/ielts/skills/${skillCapitalized}/lessons`,
      { cache: "no-store" }
    );

    if (lessonsRes.ok) {
      const allLessons = await lessonsRes.json();

      if (allLessons.length > 0 && (isListening || isReading || isWriting || isSpeaking)) {
        const endpoint = isListening ? "listening-exercises" : isWriting ? "writing-exercises" : isSpeaking ? "exercises/speaking" : "reading-exercises";

        // 2. Fetch exercises for each foundationVocabLesson
        const exPromises = allLessons.map(async (l: any) => {
          try {
            const url = isSpeaking 
              ? `http://localhost:3000/api/v1/ielts/${endpoint}/${l.id}`
              : `http://localhost:3000/api/v1/ielts/lessons/${l.id}/${endpoint}`;
            const exRes = await fetch(url, { cache: "no-store" });
            if (exRes.ok) {
              const exData = await exRes.json();
              return exData.map((ex: any) => ({
                ...ex,
                lessonTitle: l.title,
                lessonId: l.id,
              }));
            }
          } catch (e) {
            console.error(`Failed to fetch exercises for foundationVocabLesson ${l.id}`, e);
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
    (title || "Other").replace(/^(Task \d+\s*[-–]\s*)?Chapter\s+\d+\s*[-–]\s*/i, "").trim() || "Other";

  const groups: { title: string; items: any[] }[] = [];
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
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
      <div className="flex flex-col items-start mb-8 pb-4 border-b border-gray-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <Link href="/ielts/basic/library" className="hover:text-gray-900 transition-colors px-1">Library</Link>
          <span className="opacity-30">/</span>
          <span className="px-1 text-gray-300">{skillCapitalized}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {skillCapitalized} Exercises
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <ClientExerciseListGroup groups={groups} skill={params.skill} />
      </div>
    </div>
  );
}
