import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { vocabularyBooks } from "../../data";
import UnitLearningClient from "./UnitLearningClient";

export default async function UnitPage({ 
  params 
}: { 
  params: { bookSlug: string; unitSlug: string } 
}) {
  const { bookSlug, unitSlug } = await params;
  
  const bookId = parseInt(bookSlug.replace("book", ""));
  const unitId = parseInt(unitSlug.replace("unit", ""));
  
  /* Fix: searching with lowercase 'book' match new data structure */
  const book = vocabularyBooks.find((b) => b.name.includes(`book ${bookId}`));
  const unit = book?.units.find((u) => u.id === unitId);

  if (!book || !unit) {
    return notFound();
  }

  // Create back link (fallback to /vocabulary/book1 if slug parsing fails, but params are mostly reliable)
  const bookLink = `/vocabulary/${bookSlug}`;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
       <Link href={bookLink} className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Units
      </Link>

      <UnitLearningClient 
      bookName={book.name}
      unitId={unitId}
      unitTitle={unit.title}
      bookSlug={bookSlug}
    />
    </div>
  );
}
