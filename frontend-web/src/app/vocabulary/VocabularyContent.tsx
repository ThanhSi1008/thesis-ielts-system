"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vocabularyApi } from '@/services/learning.api';
import type { FoundationVocabBook } from '@/types';

export default function VocabularyContent({ embedded }: { embedded?: boolean }) {
  const [books, setBooks] = useState<FoundationVocabBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await vocabularyApi.getBooks();
        setBooks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load vocabulary books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-w-0 bg-white overflow-y-auto p-6 md:p-8 w-full h-full shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-w-0 bg-white overflow-y-auto p-6 md:p-8 w-full h-full shrink-0">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className='flex-1 min-w-0 bg-white overflow-y-auto p-6 md:p-8 w-full h-full shrink-0'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/vocabulary/${book.id}`}
            className="block h-full"
          >
            <div
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full p-4"
            >
              {/* Image Container */}
              <div className="w-full aspect-[2/1] relative mb-4 rounded-xl overflow-hidden bg-gray-100">
                {book.imageUrl && (
                  <img
                    src={book.imageUrl}
                    alt={book.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-grow">
                <h2 className="text-lg font-bold mb-2 text-black line-clamp-2">{book.name}</h2>

                <div className="flex gap-2 items-center mb-6">
                  <img src="https://res.cloudinary.com/dalaaegob/image/upload/v1769774878/dictionary-icon_qxfgms.png" alt="" className="w-5 h-5 opacity-60" />
                  <p className="text-gray-500 font-medium text-sm">{book.wordCount} words</p>
                </div>

                <button className="mt-auto w-full bg-[#FFC600] text-black font-bold py-3 px-4 rounded-xl uppercase tracking-wide hover:opacity-90 transition-opacity">
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
