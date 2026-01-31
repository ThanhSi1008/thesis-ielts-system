import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarBooks } from "../data";
import UnitListClient from "./UnitListClient";


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
      <UnitListClient
        units={book.units}
        topicSlug={topicSlug}
        bookColor={book.color}
        bookLevel={book.level}
      />
    </div>
  );
}
