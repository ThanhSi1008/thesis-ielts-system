import Link from "next/link";
import ClientLessonList from "./ClientLessonList";

interface Lesson {
  id: string;
  title: string;
  chapter: string;
}

export default async function LessonsPage({
  params,
}: {
  params: { skill: string };
}) {
  const skillCapitalized =
    params.skill.charAt(0).toUpperCase() + params.skill.slice(1).toLowerCase();

  let lessons: Lesson[] = [];

  try {
    const res = await fetch(
      `http://localhost:3000/api/v1/ielts/skills/${skillCapitalized}/lessons`,
      { cache: "no-store" } // Ensure fresh data during dev
    );
    if (res.ok) {
      lessons = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
  }

  if (lessons.length === 0) {
    return (
      <p className="text-gray-400 py-4 text-center">
        No lessons seeded for this skill.
      </p>
    );
  }

  return <ClientLessonList lessons={lessons} skill={params.skill} />;
}
