import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarApi } from "@/services/learning.api";
import UnitListClient from "./UnitListClient";

export default async function BookPage({ params }: { params: { topicSlug: string } }) {
  const { topicSlug } = await params;

  let book = null;
  try {
    book = await grammarApi.getBook(topicSlug);
  } catch (error) {
    // API throws 404 or fails
  }

  if (!book) {
    return notFound();
  }

  return (
    <>
      <div className="container px-6 py-8">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 opacity-80 mb-2">
            <Link href="/ielts/grammar" className="hover:text-slate-900 transition-colors">Grammar</Link>
            <span className="opacity-30">/</span>
            <span className="text-slate-900">{book.level}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{book.name}</h1>
        </div>

        {/* Unit List */}
        <UnitListClient
          units={book.units}
          topicSlug={topicSlug}
          bookColor={book.color}
          bookLevel={book.level}
        />
      </div>
    </>
  );
}
