'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { pronunciationApi } from '@/services/learning.api';
import type { PronunciationSound, WordProgress } from '@/types';
import SoundDetailContent from '@/app/ielts/pronunciation/sounds/[symbol]/_components/SoundDetailContent';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

const BACK_HREF = '/pronunciation';

export default function SoundPage() {
  const params = useParams();
  const { user } = useAuth();
  const [sound, setSound] = useState<PronunciationSound | null>(null);
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbol = decodeURIComponent(params.lessonSlug as string);

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
      await fetchWordProgress(sound.id);
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Loading..."
          backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
          breadcrumbs={[
            { label: 'Homepage', href: '/' },
            { label: 'Pronunciation', href: '/pronunciation' },
            { label: symbol },
          ]}
        />
        <div className="container px-6 py-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center h-64">
              <div className="h-6 w-24 bg-slate-200 rounded-full mb-6" />
              <div className="h-24 w-24 bg-slate-200 rounded-full mb-4" />
              <div className="h-6 w-32 bg-slate-200 rounded mb-8" />
              <div className="w-16 h-16 rounded-full bg-slate-200" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64">
              <div className="h-8 w-1/2 bg-slate-200 rounded mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !sound) {
    return (
      <>
        <PageHeader
          title="Sound not found"
          backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
          breadcrumbs={[
            { label: 'Homepage', href: '/' },
            { label: 'Pronunciation', href: '/pronunciation' },
            { label: 'Error' },
          ]}
        />
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Sound not found</h1>
          <Link href={BACK_HREF} className="text-primary hover:underline">
            Back to Pronunciation Chart
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`${sound.symbol}`}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Pronunciation', href: '/pronunciation' },
          { label: sound.symbol },
        ]}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-12">
        <SoundDetailContent
          sound={sound}
          wordProgress={wordProgress}
          onPracticeComplete={handlePracticeComplete}
        />
      </div>
    </>
  );
}
