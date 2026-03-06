'use client';

import { useState, useEffect } from 'react';
import { lessonService } from '@/services/lesson.service';
import type { Lesson } from '@/types';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ADVANCED: 'bg-red-100 text-red-800 border-red-200',
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const data = await lessonService.getLessons();
      setLessons(data);
    } catch (err: any) {
      setError('Failed to load lessons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = filter === 'ALL'
    ? lessons
    : lessons.filter(l => l.difficulty === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Lessons"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Lessons' },
        ]}
      />

      {/* Filters */}
      <div className="container mx-auto max-w-screen-xl px-4 py-6">
        <div className="bg-secondary rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex gap-3 flex-wrap">
            {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-5 py-2.5 rounded-2xl font-semibold transition-all ${filter === level
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="block bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 flex-1 line-clamp-2">
                    {lesson.title}
                  </h2>
                  <span className="text-sm font-bold text-gray-400 ml-2">
                    #{lesson.order}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[lesson.difficulty]
                      }`}
                  >
                    {lesson.difficulty}
                  </span>

                  <button className="bg-primary text-white font-bold py-2 px-5 rounded-2xl hover:opacity-90 transition-opacity">
                    START LEARNING
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No lessons found for this difficulty level</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{lessons.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {lessons.filter(l => l.difficulty === 'BEGINNER').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">
                {lessons.filter(l => l.difficulty === 'INTERMEDIATE').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Intermediate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-danger">
                {lessons.filter(l => l.difficulty === 'ADVANCED').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Advanced</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
