"use client";

import React from "react";
import StatisticsContent from "@/app/ielts/statistics/StatisticsContent";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <StatisticsContent embedded hideCharts={true} />
      <div className="px-4 sm:px-8 max-w-6xl w-full mx-auto pb-8 -mt-6">
        <Link href="/ielts/statistics" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-slate-800 text-white font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-slate-700 transition-all shadow-sm">
          VIEW PROGRESS
        </Link>
      </div>
    </div>
  );
}
