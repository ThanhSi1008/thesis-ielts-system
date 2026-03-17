import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarBooks } from "../../data";
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
  const backLink = `/grammar/${topicSlug}`;

  return (
    <>
      <PageHeader
        title={unitTitle}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715179/7f460211-0961-4661-92cd-42f613d4afdd.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Grammar', href: '/grammar' },
          { label: book?.level || 'Grammar', href: `/grammar/${topicSlug}` },
          { label: unitTitle },
        ]}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">

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
