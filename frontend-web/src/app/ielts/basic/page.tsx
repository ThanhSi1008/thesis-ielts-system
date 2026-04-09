"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type TabType = "Listening" | "Reading" | "Writing" | "Speaking";
type InnerTabType = "Lessons" | "Exercise";

interface Lesson {
  id: string;
  title: string;
  chapter: string;
}

interface Exercise {
  id: string;
  topic: string;
  order: number;
}

export default function IeltsBasicPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Listening");
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTabType>("Lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeInnerTab === "Lessons") {
          const res = await axios.get(
            `http://localhost:3000/api/v1/ielts/skills/${activeTab}/lessons`
          );
          setLessons(res.data);
        } else {
          // fetch exercises (get lessons first, then exercises for each, or a specific endpoint)
          // For simplicity, let's just fetch lessons and assume we have an endpoint for all exercises of a skill.
          // Since we created GET /api/ielts/exercises/:id and GET /api/ielts/lessons/:id/exercises
          // Let's just fetch lessons, then exercises for the first one as an example, or all exercises if we had that endpoint.
          // For the mock, let's fetch lessons and then map through them to get exercises.
          const res = await axios.get(
            `http://localhost:3000/api/v1/ielts/skills/${activeTab}/lessons`
          );
          if (res.data.length > 0) {
             const exRes = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${res.data[0].id}/exercises`);
             setExercises(exRes.data);
          } else {
             setExercises([]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, activeInnerTab]);

  const tabs: { title: TabType; icon: React.ReactNode }[] = [
    {
      title: "Listening",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
      ),
    },
    {
      title: "Reading",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
      ),
    },
    {
      title: "Writing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
      ),
    },
    {
      title: "Speaking",
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
          <button
            key={t.title}
            onClick={() => setActiveTab(t.title)}
            className={`flex items-center gap-2 pb-3 font-bold text-[15px] border-b-2 transition-all px-1 ${
              activeTab === t.title
                ? "border-[#FFC107] text-[#FFC107]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.title}
          </button>
        ))}
      </div>

      {/* Inner Tabs (Lessons / Exercise) */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveInnerTab("Lessons")}
          className={`px-5 py-2 font-bold rounded-lg transition-all ${
            activeInnerTab === "Lessons"
              ? "bg-[#FFC107] text-gray-900"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Lessons
        </button>
        <button
          onClick={() => setActiveInnerTab("Exercise")}
          className={`px-5 py-2 font-bold rounded-lg transition-all ${
            activeInnerTab === "Exercise"
              ? "bg-[#FCF9EA] text-[#FFB300]"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Exercise
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="text-gray-400 py-10 text-center animate-pulse">Loading...</div>
        ) : activeInnerTab === "Lessons" ? (
          <div className="flex flex-col gap-4">
            {lessons.map((lesson, idx) => (
              <Link key={lesson.id} href={`/ielts/basic/lessons/${lesson.id}`}>
                <div className="flex items-center gap-4 p-5 bg-[#F9F9F9] hover:bg-gray-100 transition-colors rounded-2xl cursor-pointer shadow-sm border border-transparent hover:border-gray-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF3C2] text-[#E0A800] font-extrabold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-gray-900 mb-1 leading-none">{lesson.title}</h3>
                    <p className="text-gray-400 text-[13px]">Read theory and strategy</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-6 h-6 rounded-full bg-gray-200/60"></div>
                  </div>
                </div>
              </Link>
            ))}
            {lessons.length === 0 && <p className="text-gray-400">No lessons seeded for this skill.</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
             {exercises.map((ex, idx) => (
              <Link key={ex.id} href={`/ielts/basic/exercises/${ex.id}`}>
                <div className="flex items-center gap-4 p-5 bg-[#F9F9F9] hover:bg-gray-100 transition-colors rounded-2xl cursor-pointer shadow-sm border border-transparent hover:border-gray-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E3F2FD] text-[#2196F3] font-extrabold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-gray-900 mb-1 leading-none">{ex.topic}</h3>
                    <p className="text-gray-400 text-[13px]">Practice multiple choice</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-400 font-medium">
                     Start Practice →
                  </div>
                </div>
              </Link>
            ))}
            {exercises.length === 0 && <p className="text-gray-400">No exercises found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
