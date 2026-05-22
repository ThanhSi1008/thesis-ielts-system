"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { vocabularyApi } from "@/services/learning.api";
import type { VocabularyBookWithUnits, VocabularyBookProgress, VocabularyUnitProgress } from "@/types";
import PageHeader from "@/components/PageHeader";

export default function BookPage() {
  const params = useParams();
  const bookId = params?.bookSlug as string;

  const [book, setBook] = useState<VocabularyBookWithUnits | null>(null);
  const [progress, setProgress] = useState<Map<string, VocabularyUnitProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch book data
        const bookData = await vocabularyApi.getBook(bookId);
        setBook(bookData);

        // Try to fetch progress (may fail if not logged in)
        try {
          const progressData = await vocabularyApi.getProgress(bookId);
          const progressMap = new Map<string, VocabularyUnitProgress>();
          progressData.units.forEach(u => progressMap.set(u.id, u));
          setProgress(progressMap);
        } catch {
          // User not logged in or no progress, ignore
        }
      } catch (err: any) {
        setError(err.message || "Failed to load book");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error || "Book not found"}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={book.name}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772802169/8a8ef998-37c5-4f7a-ba32-06af3d4e35b2.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Vocabulary', href: '/vocabulary' },
          { label: book.name },
        ]}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">

        <h2 className="text-xl font-bold mb-8">{book.name}</h2>

        {/* Unit List */}
        <div className="space-y-4">
          {book.units.map((unit, index) => {
            const unitProgress = progress.get(unit.id);
            const isCompleted = unitProgress?.isCompleted || false;
            const completedSections =
              (unitProgress?.wordsLearned ? 1 : 0) +
              (unitProgress?.questionScore !== undefined && unitProgress?.questionScore !== null ? 1 : 0) +
              (isCompleted ? 1 : 0);

            return (
              <Link
                key={unit.id}
                href={`/vocabulary/${bookId}/${unit.id}`}
                className="block group"
              >
                <div
                  className={`
                  flex items-center justify-between p-4 rounded-xl transition-all duration-200
                  ${isCompleted
                      ? "bg-[#5B9557] text-white hover:bg-[#4a7a47]"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                    }
                `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-300 relative flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">
                        {index + 1}
                      </span>
                    </div>

                    <span className="font-bold text-lg">
                      Unit {unit.order}: {unit.title}
                    </span>
                  </div>

                  <div className="font-bold text-lg">
                    {completedSections}/3
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
