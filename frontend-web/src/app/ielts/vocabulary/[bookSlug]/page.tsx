"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { vocabularyApi } from "@/services/learning.api";
import type { VocabularyBookWithUnits, VocabularyBookProgress, VocabularyUnitProgress } from "@/types";

export default function BookPage() {
  const params = useParams();
  const bookId = params?.bookSlug as string;

  const [book, setBook] = useState<VocabularyBookWithUnits | null>(null);
  const [progress, setProgress] = useState<Map<string, VocabularyUnitProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch book data
        const bookData = await vocabularyApi.getBook(bookId);
        setBook(bookData);

        // Try to fetch progress (may fail if not logged in)
        try {
          const progressData = await vocabularyApi.getProgress(bookId);
          const progressMap = new Map<string, VocabularyUnitProgress>();
          progressData.units.forEach(u => progressMap.set(u.id, u));
          setProgress(progressMap);
        } catch {
          // User not logged in or no progress, ignore
        }
      } catch (err: any) {
        setError(err.message || "Failed to load book");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  useEffect(() => {
    if (book && !expandedGroup) {
      setExpandedGroup(`Units 1-${Math.min(10, book.units.length)}`);
    }
  }, [book, expandedGroup]);

  if (loading) {
    return (
      <div className="w-full p-4 py-8">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="w-full p-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error || "Book not found"}
        </div>
      </div>
    );
  }

  // Group units by 10s
  const groupedUnits = [];
  for (let i = 0; i < book.units.length; i += 10) {
    const chunk = book.units.slice(i, i + 10);
    groupedUnits.push({
      title: `Units ${i + 1}-${i + chunk.length}`,
      units: chunk
    });
  }

  // Use a state for the expanded group, default to first group
  // We have to move this up to a hook. Wait, this component is already a Client Component.
  // We can just add a state at the top.

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto p-2 w-full h-full shrink-0">
      <div className="w-full">
        <nav className="text-[10px] text-gray-300 mb-8 flex items-center space-x-2 uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity">
          <Link href="/ielts/vocabulary" className="hover:text-gray-500 transition-colors">
            Vocabulary
          </Link>
          <span>/</span>
          <span className="text-gray-400">{book.name}</span>
        </nav>

        {/* Grouped Unit List */}
        <div className="space-y-4">
          {groupedUnits.map((group) => {
            const isExpanded = expandedGroup === group.title;

            // Calculate group progress
            let completedInGroup = 0;
            group.units.forEach(unit => {
              const up = progress.get(unit.id);
              if (up?.isCompleted) completedInGroup++;
            });
            const totalInGroup = group.units.length;

            return (
              <div key={group.title} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.title)}
                  className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black bg-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{group.title}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{totalInGroup} Units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 hidden md:block">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(completedInGroup / totalInGroup) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-12 text-right">
                      {completedInGroup}/{totalInGroup}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
                    {group.units.map((unit) => {
                      const unitProgress = progress.get(unit.id);
                      const isCompleted = unitProgress?.isCompleted || false;
                      const wordsLearned = unitProgress?.wordsLearned || 0;
                      const totalWords = unitProgress?.totalWords || 20;
                      const hasReading = unitProgress?.questionScore !== null && unitProgress?.questionScore !== undefined;

                      return (
                        <Link
                          key={unit.id}
                          href={`/ielts/vocabulary/${bookId}/${unit.id}`}
                          className="block group"
                        >
                          <div
                            className={`
                            flex items-center justify-between p-3 px-4 rounded-xl transition-all duration-200
                            ${isCompleted
                                ? "bg-primary text-black hover:opacity-90 shadow-sm"
                                : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-black dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm"
                              }
                          `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 ${isCompleted ? 'bg-black/10 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                {unit.order}
                              </div>

                              <div>
                                <span className={`font-bold text-base block ${isCompleted ? 'text-black' : 'text-gray-800 dark:text-gray-200'}`}>
                                  {unit.title}
                                </span>
                                {isCompleted && (
                                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider flex items-center gap-1 mt-0.5 text-black">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`flex flex-col items-end gap-1 text-xs font-bold ${isCompleted ? 'text-black/80' : 'text-gray-400 dark:text-gray-500'}`}>
                              <span>Words: {wordsLearned}/{totalWords}</span>
                              <span className="flex items-center gap-1">
                                Reading: {hasReading ? '✓ Done' : 'Pending'}
                              </span>
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
      </div>
    </div>
  );
}
