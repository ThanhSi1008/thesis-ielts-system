import Link from "next/link";
import ClientExerciseListGroup from "./ClientExerciseListGroup";
import { API_BASE_URL } from "@/constants";
import { Exercise } from "./[exerciseId]/_components/utils/SharedExerciseTypes";

type ExerciseWithLesson = Exercise & {
  lessonTitle: string;
  lessonId: string;
  order: number;
};

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

  let exercises: ExerciseWithLesson[] = [];

  try {
    // 1. Fetch lessons for the skill to get foundationVocabLesson IDs
    const lessonsRes = await fetch(
      `${API_BASE_URL}/ielts/skills/${skillCapitalized}/lessons`,
      { cache: "no-store" }
    );

    if (lessonsRes.ok) {
      const allLessons = await lessonsRes.json();

      if (allLessons.length > 0 && (isListening || isReading || isWriting || isSpeaking)) {
        const endpoint = isListening ? "listening-exercises" : isWriting ? "writing-exercises" : isSpeaking ? "exercises/speaking" : "reading-exercises";

        // 2. Fetch exercises for each foundationVocabLesson
        const exPromises = allLessons.map(async (l: { id: string; title: string }) => {
          try {
            const url = isSpeaking 
              ? `${API_BASE_URL}/ielts/${endpoint}/${l.id}`
              : `${API_BASE_URL}/ielts/lessons/${l.id}/${endpoint}`;
            const exRes = await fetch(url, { cache: "no-store" });
            if (exRes.ok) {
              const exData = await exRes.json();
              return exData.map((ex: Record<string, unknown>) => ({
                ...ex,
                lessonTitle: l.title,
                lessonId: l.id,
                order: (ex.order as number) || 0,
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

  const groups: { title: string; items: ExerciseWithLesson[] }[] = [];
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:p-8 transition-colors">
      <div className="flex flex-col items-start mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <Link href="/ielts/basic/library" className="hover:text-gray-900 dark:hover:text-white transition-colors px-1">Library</Link>
          <span className="opacity-30">/</span>
          <span className="px-1 text-gray-300 dark:text-gray-700">{skillCapitalized}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {skillCapitalized} Exercises
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <ClientExerciseListGroup groups={groups} skill={params.skill} />
      </div>
    </div>
  );
}
