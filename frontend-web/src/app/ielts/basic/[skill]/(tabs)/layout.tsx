"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function IeltsSkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  
  // params.skill is the dynamic segment, e.g., 'listening'
  const activeSkill = (params.skill as string)?.toLowerCase() || "listening";
  
  // Check pathname to determine if we are on 'lessons' or 'exercises'
  const activeInnerTab = pathname?.includes("/exercises") ? "exercises" : "lessons";

  const tabs = [
    {
      title: "Listening",
      id: "listening",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
      ),
    },
    {
      title: "Reading",
      id: "reading",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
      ),
    },
    {
      title: "Writing",
      id: "writing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
      ),
    },
    {
      title: "Speaking",
      id: "speaking",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top Main Tabs */}
      <div className="flex gap-8 border-b border-gray-100 px-2 pb-1 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/ielts/basic/${t.id}/${activeInnerTab}`}
            className={`flex items-center gap-2 pb-3 font-bold text-[15px] border-b-2 transition-all px-1 ${
              activeSkill === t.id
                ? "border-[#FFC107] text-[#FFC107]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.title}
          </Link>
        ))}
      </div>

      {/* Inner Tabs (Lessons / Exercise) */}
      <div className="flex gap-4 mb-8">
        <Link
          href={`/ielts/basic/${activeSkill}/lessons`}
          className={`px-5 py-2 font-bold rounded-lg transition-all ${
            activeInnerTab === "lessons"
              ? "bg-[#FFC107] text-gray-900"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Lessons
        </Link>
        <Link
          href={`/ielts/basic/${activeSkill}/exercises`}
          className={`px-5 py-2 font-bold rounded-lg transition-all ${
            activeInnerTab === "exercises"
              ? "bg-[#FCF9EA] text-[#FFB300]"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Exercise
        </Link>
      </div>

      {/* Render the specific page content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );
}
