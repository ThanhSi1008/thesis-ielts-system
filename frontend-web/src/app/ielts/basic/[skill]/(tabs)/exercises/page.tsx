import Link from "next/link";
import ClientExerciseListGroup from "./ClientExerciseListGroup";

export default async function ExercisesPage({
  params,
}: {
  params: { skill: string };
}) {
  const isListening = params.skill.toLowerCase() === "listening";
  const isReading = params.skill.toLowerCase() === "reading";
  const skillCapitalized =
    params.skill.charAt(0).toUpperCase() + params.skill.slice(1).toLowerCase();

  let exercises: any[] = [];

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
              return exData.map((ex: any) => ({
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

  return <ClientExerciseListGroup groups={groups} skill={params.skill} />;
}
