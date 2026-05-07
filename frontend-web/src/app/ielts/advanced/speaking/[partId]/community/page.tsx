"use client";

import { Users } from "lucide-react";

export default function SpeakingCommunityPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 mx-4">
      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mx-auto">
        <Users className="w-7 h-7 text-gray-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Community Speaking Answers Coming Soon</h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm">
        Soon you&apos;ll be able to compare your speaking performance with other learners here.
      </p>
    </div>
  );
}
