import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarBooks } from "../data";

export default async function BookPage({ params }: { params: { topicSlug: string } }) {
  const { topicSlug } = await params; // topicSlug is 'elementary', 'intermediate', etc.

  const book = grammarBooks.find((b) => b.id === topicSlug);

  if (!book) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      
      <Link href="/grammar" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Grammar
      </Link>

      {/* Header */}
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{book.name}</h2>

      {/* Unit List */}
      <div className="space-y-4">
        {book.units.map((unit) => (
          <Link 
            key={unit.id} 
            href={`/grammar/${topicSlug}/unit${unit.id}`}
            className="block group"
          >
            <div className={`
              flex items-center justify-between p-4 rounded-xl transition-all duration-200
              ${unit.id === 1 ? 'bg-[#5B9557] text-white hover:bg-[#4a7a47]' : 'bg-gray-100 text-black hover:bg-gray-200'}
            `}>
              <div className="flex items-center gap-4">
                 {/* Placeholder matching grammar-1.png style */}
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs text-white font-bold uppercase shrink-0`} style={{ backgroundColor: book.color }}>
                    {book.level.substring(0, 3)}
                 </div>
                 
                 <span className="font-bold text-lg">
                   Unit {unit.id}: {unit.title}
                 </span>
              </div>
              
              <div className="font-bold text-lg">
                {unit.id}/10
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
