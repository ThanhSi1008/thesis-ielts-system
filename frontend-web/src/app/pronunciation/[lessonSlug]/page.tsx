import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ipaData } from "../data";

export default async function SoundPage({ params }: { params: { lessonSlug: string } }) {
  // lessonSlug is the symbol here, but it might be URL encoded
  const { lessonSlug } = await params;
  const decodedSymbol = decodeURIComponent(lessonSlug);
  
  // Find the sound in all categories
  const allSounds = [...ipaData.monophthongs, ...ipaData.diphthongs, ...ipaData.consonants];
  const sound = allSounds.find(s => s.symbol === decodedSymbol);

  if (!sound) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      
      <Link href="/pronunciation" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Chart
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold">{sound.symbol}:</h2>
        <span className="text-2xl font-bold underline decoration-2">{sound.word}</span>
        
        {/* Audio Button Placeholder */}
        <button className="bg-[#FFC600] rounded-full p-2 ml-auto shadow-sm hover:shadow-md">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
           </svg>
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
           <h3 className="font-bold text-lg mb-4">How to make the sound?</h3>
           <p className="text-lg mb-4">
             /{sound.symbol}/ is a {sound.type}. Look at the diagram. Listen and then say the sound.
             Make your mouth shape match the diagram.
           </p>
           
           {/* Placeholder for Mouth Diagram */}
           <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-400">
                <div className="w-64 h-48 bg-gray-200 mx-auto rounded-lg mb-4 flex items-center justify-center">
                   [Mouth Diagram for {sound.symbol}]
                </div>
                <p>Profile view of mouth position</p>
              </div>
           </div>
        </div>
      </div>

      {/* Practice Words */}
      <div className="mt-12">
         <h3 className="font-bold text-lg mb-6">Sound and spelling</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-full px-6 py-4 flex items-center justify-between">
                 <span className="font-bold text-lg underline decoration-2">{sound.word}</span>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex text-yellow-400 text-sm">
                       {'★'.repeat(3)}
                    </div>
                    <button>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                       </svg>
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
