"use client";
import React from 'react';
import { ipaData } from './data';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function PronunciationPage() {
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
      <div className='container mx-auto max-w-screen-xl px-4 py-8'>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4">

          {/* VOWELS LABEL (Col 1) */}
          <div className="col-start-1 flex justify-center items-center pt-8">
            <h2 className="text-xl font-bold uppercase -rotate-90 origin-center translate-y-2 text-gray-400 tracking-widest whitespace-nowrap h-max">Vowels</h2>
          </div>

          {/* VOWELS CONTENT (Cols 2-10: 9 cols total) */}
          <div className="col-start-2 col-span-10 grid grid-cols-8 gap-4">
            {/* Headers */}
            <div className="col-span-4 text-center font-bold text-lg text-gray-600 mb-2">Monophthongs</div>
            <div className="col-span-4 text-center font-bold text-lg text-gray-600 mb-2">Diphthongs</div>

            {/* Monophthongs (4 cols) */}
            <div className="col-span-4 grid grid-cols-4 gap-4">
              {ipaData.monophthongs.map((item, idx) => (
                <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                  <div className="w-full aspect-square bg-[#FACC15] hover:bg-[#EAB308] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                    <span className="font-bold text-xl md:text-2xl mb-1">{item.symbol}</span>
                    <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide opacity-80">{item.word}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Diphthongs (4 cols) */}
            <div className="col-span-4 grid grid-cols-4 gap-4 content-start self-start">
              {ipaData.diphthongs.map((item, idx) => (
                <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                  <div className="w-full aspect-square bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                    <span className="font-bold text-xl md:text-2xl mb-1">{item.symbol}</span>
                    <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide opacity-90">{item.word}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CONSONANTS LABEL (Col 1) */}
          <div className="col-start-1 flex justify-center items-center">
            <h2 className="text-xl font-bold uppercase -rotate-90 origin-center translate-y-6 text-gray-400 tracking-widest whitespace-nowrap h-max">Consonants</h2>
          </div>

          {/* CONSONANTS CONTENT (Cols 2-9: 8 cols total) */}
          <div className="col-start-2 col-span-10 grid grid-cols-8 gap-4 mt-8">
            {ipaData.consonants.map((item, idx) => (
              <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                <div className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-1
                  ${item.voiced
                    ? 'bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-800'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200 text-gray-600'
                  }
                `}>
                  <span className="font-bold text-xl md:text-2xl mb-1">{item.symbol}</span>
                  <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide opacity-70">{item.word}</span>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </>
  );
}