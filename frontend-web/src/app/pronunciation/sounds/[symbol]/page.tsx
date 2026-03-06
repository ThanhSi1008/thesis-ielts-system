'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { pronunciationApi } from '@/services/learning.api';
import { useAuth } from '@/contexts/AuthContext';
import { PronunciationRecorder } from '@/components/pronunciation/PronunciationRecorder';
import type { PronunciationSound } from '@/types';
import PageHeader from '@/components/PageHeader';

export default function SoundDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [sound, setSound] = useState<PronunciationSound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decode the symbol from the URL (e.g., %2F -> /)
  const symbol = decodeURIComponent(params.symbol as string);

  useEffect(() => {
    const fetchSound = async () => {
      try {
        setLoading(true);
        // For now, we might not have a backend endpoint that returns example words perfectly structured
        // So we might fetch the sound metadata.
        // If the backend doesn't exist yet, we can mock it here for the UI demo.
        try {
          const data = await pronunciationApi.getSound(symbol);
          if (data) setSound(data);
          else throw new Error('Sound not found');
        } catch (apiErr) {
          // Fallback mock data if API fails or returns nothing (for development)
          console.warn("API failed, using mock data", apiErr);
          setSound({
            id: 'mock-id',
            symbol: symbol,
            name: 'Long Vowel',
            type: 'monophthong',
            description: 'Open your mouth wide and stretch your lips.',
            exampleWords: ['see', 'tree', 'me'], // We assume backend returns this now or we mock it
            videoUrl: '',
            audioUrl: ''
          } as any);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchSound();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !sound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Sound not found</h1>
        <Link href="/pronunciation" className="text-blue-600 hover:underline">
          Back to Chart
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHeader
        title={`${sound.symbol} · ${sound.name}`}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Pronunciation', href: '/pronunciation' },
          { label: sound.symbol },
        ]}
      />

      <div className="max-w-4xl mx-auto p-6 md:p-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Demonstration Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
              How to pronounce
            </h2>

            <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200 mb-6 relative overflow-hidden group cursor-pointer">
              {/* Placeholder for video */}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="absolute bottom-4 text-gray-500 text-sm font-medium">Video Demonstration</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Tip</h3>
              <p className="text-blue-700 leading-relaxed">
                {sound.description || "Focus on the position of your tongue and the shape of your lips. Listen carefully to the examples and try to mimic the sound exactly."}
              </p>
            </div>
          </div>

          {/* Practice Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
              Practice Words
            </h2>

            <div className="space-y-6">
              {/* Check if we have example words, otherwise map some defaults */}
              {(((sound as any).exampleWords) || ['example', 'test', 'demo']).map((word: string, idx: number) => (
                <div key={idx} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{word}</h3>
                    <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  </div>

                  {user ? (
                    <PronunciationRecorder
                      userId={user.id}
                      targetWord={word}
                    />
                  ) : (
                    <div className="bg-gray-50 p-4 rounded text-center text-sm text-gray-500">
                      Log in to practice pronunciation
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
