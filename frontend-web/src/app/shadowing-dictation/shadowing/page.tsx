'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { shadowingApi, ShadowingVideo } from '@/services/shadowing.api';
import { PlayCircle, Clock, Search, X } from 'lucide-react';
import Link from 'next/link';

type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'completed';

export default function ShadowingLibraryPage() {
  const [lessons, setLessons] = useState<ShadowingVideo[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedLessons, fetchedProgress] = await Promise.all([
          shadowingApi.getLessons(),
          shadowingApi.getAllProgress(),
        ]);
        setLessons(fetchedLessons);
        setProgressMap(fetchedProgress || {});
      } catch (err) {
        console.error('Failed to load shadowing library data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(lessons.map(l => l.category).filter(Boolean)));
    return unique.sort();
  }, [lessons]);

  const getProgressPercent = (lesson: ShadowingVideo) => {
    const completedCount = progressMap[lesson.id]?.length || 0;
    const totalCount = lesson.sentences?.length || 0;
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = !searchQuery ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;

      const pct = getProgressPercent(lesson);
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'not-started' && pct === 0) ||
        (selectedStatus === 'in-progress' && pct > 0 && pct < 100) ||
        (selectedStatus === 'completed' && pct === 100);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [lessons, progressMap, searchQuery, selectedCategory, selectedStatus]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-100 pb-4">
        {/* Category select */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status segmented control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Status</span>
          <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 divide-x divide-gray-200 dark:divide-gray-700">
            {(
              [
                { value: 'all', label: 'All' },
                { value: 'not-started', label: 'Not Started' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ] as { value: StatusFilter; label: string }[]
            ).map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedStatus === opt.value
                  ? 'bg-primary text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        {filteredLessons.length} of {lessons.length} lessons
      </p>

      {/* Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed dark:border-gray-700">
          <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">No lessons found</h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const progressPercent = getProgressPercent(lesson);

            return (
              <div key={lesson.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                {lesson.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[3rem]">{lesson.title}</h3>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lesson.duration}</span>
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-xs font-medium">{lesson.category}</span>
                  </div>

                  {progressPercent > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{progressPercent === 100 ? 'Completed' : 'In Progress'}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center justify-between ${progressPercent > 0 ? 'mt-6' : 'mt-7 pt-4 border-t border-gray-100 dark:border-gray-800'}`}>
                    {progressPercent === 0 && (
                      <span className="text-sm text-gray-400 dark:text-gray-500">Not started</span>
                    )}
                    <Link
                      href={`/shadowing-dictation/shadowing/${lesson.id}`}
                      className={`bg-primary text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ${progressPercent === 0 ? '' : 'ml-auto'}`}
                    >
                      {progressPercent > 0 ? 'Continue' : 'Start'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
