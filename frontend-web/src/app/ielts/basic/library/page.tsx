"use client";

import React from "react";
import LibraryContent from "../_components/LibraryContent";

export default function IeltsLibraryPage() {
  return (
    <div className="flex flex-col items-start gap-8 w-full h-full shrink-0 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100/50 dark:border-gray-800 p-6 lg:p-10 overflow-hidden">
      <LibraryContent />
    </div>
  );
}
