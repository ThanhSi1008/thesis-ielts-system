'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { pronunciationApi } from '@/services/learning.api';
import { useAuth } from '@/contexts/AuthContext';
import type { PronunciationSound, WordProgress } from '@/types';
import SoundDetailContent from './_components/SoundDetailContent';

const BACK_HREF = '/ielts/pronunciation';

export default function IeltsSoundDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [sound, setSound] = useState<PronunciationSound | null>(null);
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbol = decodeURIComponent(params.symbol as string);

  const fetchWordProgress = useCallback(async (soundId: string) => {
    if (!user) return;
    try {
      const data = await pronunciationApi.getWordProgress(soundId);
      setWordProgress(data);
    } catch {
      // Non-critical — silently ignore
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await pronunciationApi.getSound(symbol);
        if (!data) throw new Error('Sound not found');
        setSound(data);

        if (user) {
          await fetchWordProgress(data.id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load sound data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) fetchData();
  }, [symbol, user, fetchWordProgress]);

  const handlePracticeComplete = async (score: number) => {
    if (!user || !sound) return;
    try {
      await pronunciationApi.updateProgress(sound.id, score);
      // Refresh word-level progress badges
      await fetchWordProgress(sound.id);
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  if (loading) {
    return (
      <div className="pb-32 animate-pulse">
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-6 mb-8">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        <div className="px-4 md:px-8 w-full">
          {user && <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mb-8" />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center h-64">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
              <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-64">
              <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Sound not found</h1>
        <Link href={BACK_HREF} className="text-primary hover:underline">
          Back to Pronunciation Chart
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Area */}
      <div className="bg-white dark:bg-slate-950 px-4 md:px-8 pt-6 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity mb-3">
          <Link href="/ielts/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">IELTS</Link>
          <span className="opacity-30">/</span>
          <Link href={BACK_HREF} className="hover:text-slate-900 dark:hover:text-white transition-colors">Pronunciation</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 dark:text-white">{sound.symbol}</span>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <SoundDetailContent
          sound={sound}
          wordProgress={wordProgress}
          onPracticeComplete={handlePracticeComplete}
        />
      </div>
    </div>
  );
}
