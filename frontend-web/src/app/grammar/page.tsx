"use client"; 

import React from 'react';
import { grammarBooks } from './data';
import Link from 'next/link';

export default function GrammarPage() {
  return (
    <div className='container mx-auto max-w-screen-xl px-4 py-8'>
      
      <h1 className="text-4xl font-bold mb-12 text-black">Grammar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {grammarBooks.map((book, index) => (
          <Link 
            key={index}
            href={`/grammar/${book.id}`}
            className="block h-full group"
          >
            <div 
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              {/* Colored Header mimicking book cover */}
              <div 
                className="w-full aspect-[3/4] p-8 flex flex-col justify-between text-white relative"
                style={{ backgroundColor: book.color }}
              >
                  {/* Mimic Cambridge Book Cover Design */}
                  <div>
                    <div className="text-xs uppercase mb-4 tracking-widest opacity-80">Cambridge</div>
                    <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
                      {book.name.split(" in Use")[0]}<br/>
                      <span className="text-4xl">in Use</span>
                    </h2>
                    <p className="mt-4 text-sm opacity-90 line-clamp-3">A self-study reference and practice book for {book.level.toLowerCase()} learners of English</p>
                  </div>

                  <div>
                     <div className="text-right font-bold text-lg mb-1">{book.author}</div>
                     <div className="bg-black/20 rounded px-2 py-1 inline-block text-xs uppercase self-start">
                        {book.level}
                     </div>
                  </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-1 text-black">{book.level}</h3>
                  
                  <div className="flex gap-2 items-center mb-6">
                    <img src="https://res.cloudinary.com/dalaaegob/image/upload/v1769774878/dictionary-icon_qxfgms.png" alt="" className="w-5 h-5 opacity-60" />
                    <p className="text-gray-500 font-medium text-sm">{book.unit_count} units</p>
                  </div>
                  
                  <button className="mt-auto w-full bg-[#FACC15] text-black font-bold py-3 px-4 rounded-xl uppercase tracking-wide hover:opacity-90 transition-opacity">
                      START LEARNING
                  </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
