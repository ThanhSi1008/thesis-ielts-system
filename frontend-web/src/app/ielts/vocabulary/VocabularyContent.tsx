"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vocabularyApi } from '@/services/learning.api';
import type { VocabularyBook } from '@/types';

export default function VocabularyContent({ embedded }: { embedded?: boolean }) {
  const [books, setBooks] = useState<VocabularyBook[]>([]);
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
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto p-4 md:p-6 w-full h-full shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto p-4 md:p-6 w-full h-full shrink-0">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className='flex-1 min-w-0 bg-white dark:bg-slate-950 overflow-y-auto p-3 md:p-5 w-full h-full shrink-0'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/ielts/vocabulary/${book.id}`}
            className="block h-full"
          >
            <div
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              {/* Image Container */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-2xl rounded-b-none overflow-hidden">
                {book.imageUrl && (
                  <img
                    src={book.imageUrl}
                    alt={book.name}
                    className="w-full h-auto block rounded-t-2xl rounded-b-none scale-[1.04] origin-bottom"
                  />
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-grow p-5">
                <h2 className="text-lg font-bold mb-2 text-black dark:text-white line-clamp-2">{book.name}</h2>

                <div className="flex gap-2 items-center mb-6">
                  <img src="https://res.cloudinary.com/dalaaegob/image/upload/v1769774878/dictionary-icon_qxfgms.png" alt="" className="w-5 h-5 opacity-60" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{book.wordCount} words</p>
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
