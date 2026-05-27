"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminShadowingApi, adminDictationApi, adminIeltsIntensiveApi, adminIeltsAdvancedApi } from "@/services/admin.api";

interface StatCard {
  label: string;
  count: number;
  href: string;
  color: string;
  icon: React.ReactNode;
}

function StatCardItem({ label, count, href, color, icon }: StatCard) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [shadowingCount, setShadowingCount] = useState<number | null>(null);
  const [dictationCount, setDictationCount] = useState<number | null>(null);
  const [intensiveCount, setIntensiveCount] = useState<number | null>(null);
  const [advancedCount, setAdvancedCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch Shadowing & Dictation counts
    adminShadowingApi.getAll()
      .then(lessons => setShadowingCount(lessons.length))
      .catch(() => setShadowingCount(0));
    adminDictationApi.getAll()
      .then(lessons => setDictationCount(lessons.length))
      .catch(() => setDictationCount(0));

    // Fetch IELTS Intensive count
    adminIeltsIntensiveApi.getAll()
      .then(exams => setIntensiveCount(exams.length))
      .catch(() => setIntensiveCount(0));

    // Fetch IELTS Advanced count (combine all 4 skills parts)
    Promise.all([
      adminIeltsAdvancedApi.getListening().catch(() => []),
      adminIeltsAdvancedApi.getReading().catch(() => []),
      adminIeltsAdvancedApi.getWriting().catch(() => []),
      adminIeltsAdvancedApi.getSpeaking().catch(() => [])
    ])
      .then(([listening, reading, writing, speaking]) => {
        setAdvancedCount(listening.length + reading.length + writing.length + speaking.length);
      })
      .catch(() => setAdvancedCount(0));
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage learning content, practice materials, and AI staging queues.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCardItem
          label="Shadowing Lessons"
          count={shadowingCount ?? 0}
          href="/admin/shadowing"
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />
        <StatCardItem
          label="Dictation Lessons"
          count={dictationCount ?? 0}
          href="/admin/dictation"
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
        />
        <StatCardItem
          label="IELTS Intensive Exams"
          count={intensiveCount ?? 0}
          href="/admin/ielts-intensive"
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          }
        />
        <StatCardItem
          label="IELTS Advanced Parts"
          count={advancedCount ?? 0}
          href="/admin/ielts-advanced"
          color="bg-green-50 dark:bg-green-900/20 text-green-600"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/ielts-intensive"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity animate-fade-in"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Import Intensive Exam
          </Link>
          <Link
            href="/admin/ielts-advanced"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Import Advanced Part
          </Link>
        </div>
      </div>
    </div>
  );
}
