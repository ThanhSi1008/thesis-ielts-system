"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Headphones, PenTool, Mic, Bookmark, GraduationCap, Dumbbell } from "lucide-react";
import api from "@/lib/api";

interface LibraryStats {
  id: string;
  skill: string;
  lessons: { total: number; completed: number };
  exercises: { total: number; completed: number };
}

const SKILL_THEMES: Record<string, any> = {
  Speaking: {
    bg: "bg-[#FAF7F2]",
    text: "text-danger",
    circleBase: "bg-danger/10",
    fillColor: "#F44336",
    icon: Mic,
  },
  Writing: {
    bg: "bg-[#FAF7F2]",
    text: "text-warning",
    circleBase: "bg-warning/10",
    fillColor: "#FF9800",
    icon: PenTool,
  },
  Reading: {
    bg: "bg-[#FAF7F2]",
    text: "text-info",
    circleBase: "bg-info/10",
    fillColor: "#2196F3",
    icon: BookOpen,
  },
  Listening: {
    bg: "bg-[#FAF7F2]",
    text: "text-success",
    circleBase: "bg-success/10",
    fillColor: "#4CAF50",
    icon: Headphones,
  },
};

const getDefaultTheme = (skillName: string) => SKILL_THEMES[skillName] || SKILL_THEMES["Reading"];

// A circular progress ring component that wraps a Link button
function CircularProgressLink({
  href,
  completed,
  total,
  color,
  baseColor,
  icon: Icon,
  textColor
}: {
  href: string;
  completed: number;
  total: number;
  color: string;
  baseColor: string;
  icon: any;
  textColor: string;
}) {
  const percentage = total === 0 ? 0 : Math.min(100, Math.max(0, (completed / total) * 100));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <Link href={href} className="relative group transition-transform hover:scale-105">
        <svg width="60" height="60" className="transform -rotate-90">
          <circle
            cx="30"
            cy="30"
            r={radius}
            strokeWidth="3"
            stroke="transparent"
            fill="transparent"
            className={baseColor.replace('bg-', 'fill-')}
          />
          {percentage > 0 && (
            <circle
              cx="30"
              cy="30"
              r={radius}
              strokeWidth="3"
              stroke={color}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-colors`} style={{ backgroundColor: `${color}1A` }}>
          <Icon className={`w-5 h-5 ${textColor}`} style={{ color: color }} />
        </div>
      </Link>
      <span className={`text-[13px] font-semibold opacity-70 ${textColor}`}>
        {completed}/{total}
      </span>
    </div>
  );
}

export default function IeltsLibraryPage() {
  const [stats, setStats] = useState<LibraryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<LibraryStats[]>("/ielts/library/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch library stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10 min-h-[500px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium tracking-tight">Loading library...</p>
        </div>
      </div>
    );
  }

  // Pre-fill the 4 default skills if not enough data returned yet
  const displayStats = ["Listening", "Reading", "Writing", "Speaking"].map((skillName) => {
    const existing = stats.find(s => s.skill.toLowerCase() === skillName.toLowerCase());
    return existing || {
      id: skillName.toLowerCase(),
      skill: skillName,
      lessons: { total: 0, completed: 0 },
      exercises: { total: 0, completed: 0 },
    };
  });

  return (
    <div className="flex flex-col items-start gap-8 w-full h-full shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 lg:p-10 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 w-full shrink-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Library
        </h1>
      </div>

      <div className="w-full flex-1 overflow-y-auto pr-2 pb-10 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {displayStats.map((stat) => {
            const theme = getDefaultTheme(stat.skill);
            const Icon = theme.icon;

            return (
              <div
                key={stat.id}
                className={`${theme.bg} rounded-3xl p-8 flex flex-col items-center justify-center transition-transform`}
              >
                <div className={`flex items-center gap-3 mb-8 ${theme.text}`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                  <h2 className="text-xl font-bold tracking-tight">{stat.skill}</h2>
                </div>

                <div className="flex items-center gap-6">
                  <CircularProgressLink
                    href={`/ielts/basic/${stat.skill.toLowerCase()}/lessons`}
                    completed={stat.lessons.completed}
                    total={stat.lessons.total}
                    color={theme.fillColor}
                    baseColor={theme.circleBase}
                    textColor={theme.text}
                    icon={GraduationCap}
                  />

                  <CircularProgressLink
                    href={`/ielts/basic/${stat.skill.toLowerCase()}/exercises`}
                    completed={stat.exercises.completed}
                    total={stat.exercises.total}
                    color={theme.fillColor}
                    baseColor={theme.circleBase}
                    textColor={theme.text}
                    icon={Dumbbell}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#FAF7F2] rounded-3xl p-2 lg:py-4 lg:px-8 flex items-center justify-between border border-gray-100/50">
          <div className="flex items-center gap-3 text-gray-800">
            <Bookmark className="w-6 h-6 stroke-[2]" />
            <h2 className="text-xl font-bold tracking-tight">Bookmarks</h2>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#E5ECEE] border-[2px] border-[#668B98] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#4F6C76]" />
            </div>
            <span className="text-[13px] font-semibold text-gray-500">
              1/1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
