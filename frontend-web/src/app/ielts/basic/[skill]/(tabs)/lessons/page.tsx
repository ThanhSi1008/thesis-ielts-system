import Link from "next/link";

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

  return (
    <div className="flex flex-col gap-4">
      {lessons.map((lesson, idx) => (
        <Link key={lesson.id} href={`/ielts/basic/${params.skill}/lessons/${lesson.id}`}>
          <div className="flex items-center gap-4 p-5 bg-[#F9F9F9] hover:bg-gray-100 transition-colors rounded-2xl cursor-pointer shadow-sm border border-transparent hover:border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF3C2] text-[#E0A800] font-extrabold text-sm shrink-0">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-gray-900 mb-1 leading-none">
                {lesson.title}
              </h3>
              <p className="text-gray-400 text-[13px]">
                Read theory and strategy
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-6 h-6 rounded-full bg-gray-200/60"></div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
