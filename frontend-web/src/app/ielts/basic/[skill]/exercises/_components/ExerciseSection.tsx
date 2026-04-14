"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Exercise {
  id: string;
  topic: string;
  order: number;
  lessonTitle?: string;
  lessonId?: string;
}

export function ExerciseSection({
  title,
  items,
  skill,
  index,
  completedExerciseIds,
}: {
  title: string;
  items: Exercise[];
  skill: string;
  index: number;
  completedExerciseIds?: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col p-4 rounded-lg bg-gray-50/50">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer group select-none py-1"
      >
        <div className="w-5 h-5 rounded-full bg-[#FFF3C2] text-[#A07000] font-bold text-xs flex items-center justify-center shrink-0">{index + 1}</div>
        <h3 className="text-[14px] font-extrabold text-gray-800 tracking-wide group-hover:text-[#FFC107] transition-colors">
          {title}
        </h3>
        <div className={`ml-auto transition-transform duration-300 transform ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#FFC107]" />
        </div>
      </div>

      {/* List Container with transition */}
      <div className={`flex flex-col mt-4 gap-2 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[3000px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0 pointer-events-none"
        }`}>
        {items.map((ex) => {
          const isFinished = completedExerciseIds?.has(ex.id) || false;

          return (
            <Link
              key={ex.id}
              href={`/ielts/basic/${skill}/exercises/${ex.id}${ex.lessonId ? `?lessonId=${ex.lessonId}` : ""
                }`}
            >
              <div className="flex items-center gap-4 px-5 py-3.5 bg-[#F9F9F9] hover:bg-[#FFF9E6] hover:border-[#FFC107]/30 transition-all rounded-xl cursor-pointer border border-transparent group">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 truncate leading-none">
                    {ex.topic}
                  </p>
                </div>
                {isFinished ? (
                  <span className="text-xs text-green-500 font-bold shrink-0 transition-colors flex items-center gap-1">
                    Completed ✓
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium shrink-0 group-hover:text-[#FFC107] transition-colors">
                    Start →
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
