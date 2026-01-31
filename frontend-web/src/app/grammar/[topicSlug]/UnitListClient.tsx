"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Unit {
    id: number;
    title: string;
}

interface UnitListClientProps {
    units: Unit[];
    topicSlug: string;
    bookColor: string;
    bookLevel: string;
}

export default function UnitListClient({ units, topicSlug, bookColor, bookLevel }: UnitListClientProps) {
    const [progress, setProgress] = useState<Record<string, { theoryCompleted: boolean; exerciseCompleted: boolean }>>({});

    useEffect(() => {
        const allProgress: Record<string, any> = {};
        units.forEach((unit) => {
            const saved = localStorage.getItem(`grammar_progress_${topicSlug}_${unit.id}`);
            if (saved) {
                allProgress[unit.id] = JSON.parse(saved);
            }
        });
        setProgress(allProgress);
    }, [units, topicSlug]);

    return (
        <div className="space-y-4">
            {units.map((unit) => {
                const unitProgress = progress[unit.id] || { theoryCompleted: false, exerciseCompleted: false };
                const completedCount = (unitProgress.theoryCompleted ? 1 : 0) + (unitProgress.exerciseCompleted ? 1 : 0);
                const isCompleted = completedCount === 2;

                return (
                    <Link
                        key={unit.id}
                        href={`/grammar/${topicSlug}/unit${unit.id}`}
                        className="block group"
                    >
                        <div className={`
              flex items-center justify-between p-4 rounded-xl transition-all duration-200
              ${isCompleted ? 'bg-[#4CAF50] text-white hover:bg-[#43a047]' : 'bg-gray-100 text-black hover:bg-gray-200'}
            `}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs text-white font-bold uppercase shrink-0`} style={{ backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : bookColor }}>
                                    {bookLevel.substring(0, 3)}
                                </div>

                                <div>
                                    <span className="font-bold text-lg block">
                                        Unit {unit.id}: {unit.title}
                                    </span>
                                    {isCompleted && (
                                        <span className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`font-bold text-xl ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                {completedCount}/2
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
