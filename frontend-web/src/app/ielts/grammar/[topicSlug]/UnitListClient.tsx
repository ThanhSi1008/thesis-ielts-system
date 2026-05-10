"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { grammarApi } from "@/services/learning.api";

interface Unit {
    id: string;
    title: string;
    order: number;
}

interface UnitListClientProps {
    units: Unit[];
    topicSlug: string;
    bookColor: string;
    bookLevel: string;
}

const INTERMEDIATE_GROUPS = [
    { title: "Present and past", range: [1, 6] },
    { title: "Present perfect and past", range: [7, 18] },
    { title: "Future", range: [19, 25] },
    { title: "Modals", range: [26, 37] },
    { title: "If and wish", range: [38, 41] },
    { title: "Passive", range: [42, 46] },
    { title: "Reported speech", range: [47, 48] },
    { title: "Questions and auxiliary verbs", range: [49, 52] },
    { title: "-ing and to...", range: [53, 68] },
    { title: "Articles and nouns", range: [69, 81] },
    { title: "Pronouns and determiners", range: [82, 91] },
    { title: "Relative clauses", range: [92, 97] },
    { title: "Adjectives and adverbs", range: [98, 112] },
    { title: "Conjunctions and prepositions", range: [113, 120] },
    { title: "Prepositions", range: [121, 136] },
    { title: "Phrasal verbs", range: [137, 145] },
];

function getGroupTitle(unitOrder: number, slug: string): string {
    if (slug === 'intermediate') {
        const group = INTERMEDIATE_GROUPS.find(g => unitOrder >= g.range[0] && unitOrder <= g.range[1]);
        if (group) return group.title;
    }
    const start = Math.floor((unitOrder - 1) / 10) * 10 + 1;
    return `Units ${start}-${start + 9}`;
}

export default function UnitListClient({ units, topicSlug, bookColor, bookLevel }: UnitListClientProps) {
    const [progress, setProgress] = useState<Record<number, { theoryCompleted: boolean; exerciseCompleted: boolean }>>({});
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const groupedData = React.useMemo(() => {
        const groupsMap = new Map<string, Unit[]>();
        const orderedTitles: string[] = [];

        units.forEach(unit => {
            const title = getGroupTitle(unit.order, topicSlug);
            if (!groupsMap.has(title)) {
                groupsMap.set(title, []);
                orderedTitles.push(title);
            }
            groupsMap.get(title)!.push(unit);
        });

        return orderedTitles.map(title => ({
            title,
            units: groupsMap.get(title)!
        }));
    }, [units, topicSlug]);

    useEffect(() => {
        if (groupedData.length > 0 && !expandedGroup) {
            setExpandedGroup(groupedData[0].title);
        }
    }, [groupedData]);

    useEffect(() => {
        grammarApi.getProgress(topicSlug).then(progressList => {
            if (progressList) {
                const allProgress: Record<number, any> = {};
                progressList.forEach(p => {
                    allProgress[p.unitOrder] = {
                        theoryCompleted: p.theoryCompleted,
                        exerciseCompleted: p.isCompleted,
                    };
                });
                setProgress(allProgress);
            }
        }).catch(console.error);
    }, [topicSlug]);

    return (
        <div className="space-y-4">
            {groupedData.map((group) => {
                const isExpanded = expandedGroup === group.title;

                // Calculate group progress
                let completedInGroup = 0;
                group.units.forEach(unit => {
                    const up = progress[unit.order];
                    if (up && up.theoryCompleted && up.exerciseCompleted) completedInGroup++;
                });
                const totalInGroup = group.units.length;

                return (
                    <div key={group.title} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {/* Group Header */}
                        <button
                            onClick={() => setExpandedGroup(isExpanded ? null : group.title)}
                            className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-black"
                                    style={{ backgroundColor: '#FFC600' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{group.title}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{totalInGroup} Units</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 hidden md:block">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(completedInGroup / totalInGroup) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 w-12 text-right">
                                    {completedInGroup}/{totalInGroup}
                                </span>
                            </div>
                        </button>

                        {/* Group Content */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
                                {group.units.map((unit) => {
                                    const unitProgress = progress[unit.order] || { theoryCompleted: false, exerciseCompleted: false };
                                    const completedCount = (unitProgress.theoryCompleted ? 1 : 0) + (unitProgress.exerciseCompleted ? 1 : 0);
                                    const isCompleted = completedCount === 2;

                                    return (
                                        <Link
                                            key={unit.id}
                                            href={`/ielts/grammar/${topicSlug}/unit${unit.order}`}
                                            className="block group"
                                        >
                                            <div className={`
                                                flex items-center justify-between p-3 px-4 rounded-xl transition-all duration-200
                                                ${isCompleted ? 'bg-success text-white hover:bg-success/90 shadow-sm' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-black dark:text-white hover:border-gray-300 dark:hover:border-gray-500 shadow-sm'}
                                            `}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${isCompleted ? 'text-white' : 'text-black'}`} style={{ backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : '#FFC600' }}>
                                                        {unit.order}
                                                    </div>

                                                    <div>
                                                        <span className={`font-bold text-base block ${isCompleted ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                                            {unit.title}
                                                        </span>
                                                        {isCompleted && (
                                                            <span className="text-[10px] font-medium opacity-90 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`font-bold text-sm ${isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {completedCount}/2
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
