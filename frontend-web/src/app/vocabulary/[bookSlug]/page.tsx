import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { vocabularyBooks } from "../data";

export default async function BookPage({ params }: { params: { bookSlug: string } }) {
  const { bookSlug } = await params;

  const bookId = parseInt(bookSlug.replace("book", ""));
  const book = vocabularyBooks.find((b) => b.name.includes(`book ${bookId}`));

  if (!book) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      
      {/* Back Navigation */}
      <Link href="/vocabulary" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Books
      </Link>

      {/* Breadcrumb / Back Button */}
      <Link href="/vocabulary" className="text-black font-bold text-3xl mb-8 block hover:opacity-80">
        Vocabulary
      </Link>

      <h2 className="text-xl font-bold mb-8">{book.name}</h2>

      {/* Unit List */}
      <div className="space-y-4">
        {book.units.map((unit) => (
          <Link 
            key={unit.id} 
            href={`/vocabulary/${bookSlug}/unit${unit.id}`}
            className="block group"
          >
            <div className={`
              flex items-center justify-between p-4 rounded-xl transition-all duration-200
              ${unit.id === 1 ? 'bg-[#5B9557] text-white hover:bg-[#4a7a47]' : 'bg-gray-100 text-black hover:bg-gray-200'}
            `}>
              <div className="flex items-center gap-4">
                 {/* Unit Image Thumbnail (Placeholder matching demo style) */}
                 <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-300 relative">
                   <img 
                    src={book.image_link} // Reusing book cover as placeholder since we don't have unit specific images in data
                    alt=""
                    className="w-full h-full object-cover opacity-80"
                   />
                 </div>
                 
                 <span className="font-bold text-lg">
                   Unit {unit.id}: {unit.title}
                 </span>
              </div>
              
              <div className="font-bold text-lg">
                4/4
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
