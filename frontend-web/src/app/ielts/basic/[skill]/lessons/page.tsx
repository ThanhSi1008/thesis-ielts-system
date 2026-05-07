import Link from "next/link";
import ClientLessonList from "./ClientLessonList";

interface FoundationVocabLesson {
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

  let lessons: FoundationVocabLesson[] = [];

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

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8">
      <div className="flex flex-col items-start mb-8 pb-4 border-b border-gray-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <Link href="/ielts/basic/library" className="hover:text-gray-900 transition-colors px-1">Library</Link>
          <span className="opacity-30">/</span>
          <span className="px-1 text-gray-300">{skillCapitalized}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {skillCapitalized} Lessons
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <ClientLessonList lessons={lessons} skill={params.skill} />
      </div>
    </div>
  );
}
