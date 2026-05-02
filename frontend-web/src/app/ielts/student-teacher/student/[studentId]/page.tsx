"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import StatisticsContent from "@/app/ielts/statistics/StatisticsContent";

export default function TeacherDrilldownPage(props: { params: { studentId: string } }) {
  const { studentId } = props.params;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col">
      {/* Sticky Teacher Mode Header */}
      <div className="bg-white dark:bg-slate-950 sticky top-0 z-10 w-full border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto max-w-screen-xl px-4 py-3 flex items-center gap-4">
          <Link
            href="/ielts/student-teacher"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Teacher Mode: Student Details
          </h1>
        </div>
      </div>

      {/* Full Statistics page reused in teacher mode */}
      <StatisticsContent embedded studentId={studentId} />
    </div>
  );
}
