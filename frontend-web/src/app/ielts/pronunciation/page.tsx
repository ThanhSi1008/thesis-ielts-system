"use client";

import React, { useEffect, useState } from "react";
import { pronunciationApi } from "@/services/learning.api";
import { useAuth } from "@/contexts/AuthContext";
import IpaChart from "./_components/IpaChart";
import ProgressSummary from "./_components/ProgressSummary";
import type { PronunciationData, SoundProgress, PronunciationStats } from "@/types";

export default function IeltsPronunciationPage() {
  const { user } = useAuth();
  const [sounds, setSounds] = useState<PronunciationData | null>(null);
  const [progress, setProgress] = useState<SoundProgress[] | null>(null);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const soundsData = await pronunciationApi.getAllSounds();
        setSounds(soundsData);

        if (user) {
          const [progressData, statsData] = await Promise.all([
            pronunciationApi.getProgress(),
            pronunciationApi.getStats(),
          ]);
          setProgress(progressData);
          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to fetch pronunciation data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !sounds) {
    return (
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 p-4 md:p-8 animate-pulse">
        {user && (
          <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl w-full mb-8" />
        )}
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-4 mb-8">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 p-4 md:p-8 pb-32">
      {/* Empty State for new users */}
      {user && stats?.overallMastery === 0 && (
        <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/30 to-indigo-50 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50 rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Welcome to IPA Mastery!</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tap any sound to learn how to pronounce it. Practice with example words and
            track your progress as you master all 44 English sounds.
          </p>
        </div>
      )}

      {/* Progress Summary (only if logged in) */}
      {user && stats && stats.overallMastery > 0 && <ProgressSummary stats={stats} />}

      {/* IPA Chart */}
      <IpaChart
        sounds={sounds}
        progress={progress ?? undefined}
        basePath="/ielts/pronunciation"
      />
    </div>
  );
}
