'use client';

import { useState, useEffect } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { VocabLabStats } from '@/types';
import { SummaryCards } from './stats/SummaryCards';
import { ReviewActivityChart } from './stats/ReviewActivityChart';
import { CardCountsPie, MaturityDonut } from './stats/DonutCharts';
import { ForecastChart } from './stats/ForecastChart';
import { HourlyActivityChart } from './stats/HourlyActivityChart';
import { BarChart3 } from 'lucide-react';

const RANGE_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '1yr', value: 365 },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SkeletonBlock({ h = 'h-48' }: { h?: string }) {
  return <div className={`${h} bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse`} />;
}

export function StatsTab({ isActive }: { isActive: boolean }) {
  const [stats, setStats] = useState<VocabLabStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    if (!isActive) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await vocabLabApi.getStats(range);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isActive, range]);

  // Empty state (no cards at all)
  if (!loading && stats && stats.totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="mb-4 text-gray-400">
          <BarChart3 className="w-16 h-16" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No data yet</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">Add some flashcards and start studying to see your statistics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Time Range Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Statistics</h2>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                range === opt.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ① Summary KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonBlock key={i} h="h-24" />)}
        </div>
      ) : stats ? (
        <SummaryCards stats={stats} />
      ) : null}

      {/* ② Review Activity */}
      {loading ? <SkeletonBlock h="h-56" /> : stats ? <ReviewActivityChart stats={stats} /> : null}

      {/* ③+④ Card State Donuts side by side */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBlock h="h-72" />
          <SkeletonBlock h="h-72" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardCountsPie stats={stats} />
          <MaturityDonut stats={stats} />
        </div>
      ) : null}

      {/* ⑤ Streak & Average mini-stats row */}
      {!loading && stats?.streakData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Current Streak" value={`${stats.streakData.currentStreak}d`} />
          <StatCard label="Longest Streak" value={`${stats.streakData.longestStreak}d`} />
          <StatCard label="Total Review Days" value={stats.streakData.totalReviewDays} />
          <StatCard label="All-time Reviews" value={stats.streakData.totalReviews.toLocaleString()} />
        </div>
      )}

      {!loading && stats?.averages && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Retention Rate" value={`${stats.averages.retentionRatePercent}%`} sub="Good + Easy answers" />
          <StatCard label="Avg Interval" value={`${stats.averages.averageInterval}d`} sub="Review cards" />
          <StatCard label="Avg Lapses" value={stats.averages.averageLapses} sub="Per card" />
          <StatCard label="Avg Ease" value={`${stats.averages.averageEasePercent}%`} sub="Answer quality" />
        </div>
      )}

      {/* ⑥ Forecast */}
      {loading ? <SkeletonBlock h="h-48" /> : stats ? <ForecastChart stats={stats} /> : null}

      {/* ⑦ Hourly Activity */}
      {loading ? <SkeletonBlock h="h-40" /> : stats ? <HourlyActivityChart stats={stats} /> : null}
    </div>
  );
}
