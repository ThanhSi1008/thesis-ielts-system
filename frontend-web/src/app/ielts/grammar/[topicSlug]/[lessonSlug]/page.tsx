import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarBooks } from "@/app/grammar/data";
import GrammarLessonClient from "./GrammarLessonClient";
import PageHeader from "@/components/PageHeader";

export default async function UnitPage({
  params
}: {
  params: { topicSlug: string; lessonSlug: string }
}) {
  const { topicSlug, lessonSlug } = await params;

  const book = grammarBooks.find((b) => b.id === topicSlug);

  // Extract unit ID
  const unitId = lessonSlug.replace("unit", "");
  const unit = book?.units.find(u => u.id === parseInt(unitId));
  const unitTitle = unit?.title || "Grammar Lesson";
  const backLink = `/ielts/grammar/${topicSlug}`;

  return (
    <>
      <div className="w-full h-[calc(100vh-80px)] flex flex-col px-4 md:px-8 py-6">
        <div className="shrink-0 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex flex-wrap items-center gap-1.5 opacity-80 mb-2">
            <Link href="/ielts/grammar" className="hover:text-slate-900 transition-colors">Grammar</Link>
            <span className="opacity-30">/</span>
            <Link href={`/ielts/grammar/${topicSlug}`} className="hover:text-slate-900 transition-colors">{book?.level || 'Grammar'}</Link>
            <span className="opacity-30">/</span>
            <span className="text-slate-900 truncate max-w-[200px] md:max-w-none">{unitTitle}</span>
          </div>
        </div>

        <GrammarLessonClient
          topicName={book?.name || "Grammar Book"}
          topicSlug={topicSlug}
          unitId={unitId}
          unitTitle={unitTitle}
        />
      </div>
    </>
  );
}
