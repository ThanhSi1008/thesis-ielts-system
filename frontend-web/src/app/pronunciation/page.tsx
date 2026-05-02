"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import IpaChart from '@/app/ielts/pronunciation/_components/IpaChart';
import { pronunciationApi } from '@/services/learning.api';
import type { PronunciationData } from '@/types';

export default function PronunciationPage() {
  const [sounds, setSounds] = useState<PronunciationData | null>(null);

  useEffect(() => {
    pronunciationApi.getAllSounds().then(setSounds).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader
        title="Pronunciation"
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Pronunciation' },
        ]}
      />
      <div className="container px-6 py-8">
        {sounds ? (
          <IpaChart sounds={sounds} basePath="/pronunciation" />
        ) : (
          <div className="flex-1 min-w-0 bg-white p-4 md:p-8 animate-pulse">
            <div className="h-8 bg-slate-100 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-4 mb-8">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-xl" />
              ))}
            </div>
            <div className="h-8 bg-slate-100 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-4">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}