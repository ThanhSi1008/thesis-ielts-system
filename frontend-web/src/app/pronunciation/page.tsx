"use client"; 
import React from 'react';
import { ipaData } from './data';
import Link from 'next/link';

export default function PronunciationPage() {
  return (
    <div className='container mx-auto max-w-screen-xl px-4 py-8'>
      
      <h1 className="text-4xl font-bold mb-12 text-black">Pronunciation</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* VOWELS SECTION */}
        <div className="flex-grow">
           <div className="flex items-center gap-4 mb-8">
             <h2 className="text-xl font-bold uppercase -rotate-90 origin-center translate-y-2 w-4 text-gray-500 tracking-widest hidden md:block">Vowels</h2>
             <div className="flex-1">
                <div className="flex gap-12 mb-4">
                   <h3 className="font-bold text-lg w-full text-center md:text-left md:pl-12">Monophthongs</h3>
                   <h3 className="font-bold text-lg w-full text-center md:pr-12">Diphthongs</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                   {/* Monophthongs Grid */}
                   <div className="grid grid-cols-4 gap-3">
                      {ipaData.monophthongs.map((item, idx) => (
                        <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                          <div className="w-20 h-20 bg-[#FACC15] hover:bg-[#EAB308] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm">
                             <span className="font-bold text-xl mb-1">{item.symbol}</span>
                             <span className="text-xs font-medium">{item.word}</span>
                          </div>
                        </Link>
                      ))}
                   </div>

                   {/* Diphthongs Grid */}
                   <div className="grid grid-cols-4 gap-3">
                      {ipaData.diphthongs.map((item, idx) => (
                        <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                          <div className="w-20 h-20 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm">
                             <span className="font-bold text-xl mb-1">{item.symbol}</span>
                             <span className="text-xs font-medium text-red-100">{item.word}</span>
                          </div>
                        </Link>
                      ))}
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* CONSONANTS SECTION */}
      <div className="mt-8 flex items-start gap-4">
         <h2 className="text-xl font-bold uppercase -rotate-90 origin-center translate-y-12 w-4 text-gray-500 tracking-widest hidden md:block">Consonant</h2>
         
         <div className="grid grid-cols-4 md:grid-cols-8 gap-3 flex-1 pt-6">
            {ipaData.consonants.map((item, idx) => (
              <Link key={idx} href={`/pronunciation/sounds/${encodeURIComponent(item.symbol)}`}>
                <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm
                  ${item.voiced ? 'bg-white border-2 border-gray-200 hover:border-gray-400' : 'bg-gray-100 border border-transparent hover:bg-gray-200'}
                `}>
                   <span className="font-bold text-xl mb-1">{item.symbol}</span>
                   <span className="text-xs font-medium text-gray-600">{item.word}</span>
                </div>
              </Link>
            ))}
         </div>
      </div>

    </div>
  );
}
