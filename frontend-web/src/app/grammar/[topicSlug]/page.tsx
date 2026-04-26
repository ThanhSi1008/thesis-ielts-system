import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { grammarBooks } from "../data";
import UnitListClient from "./UnitListClient";
import PageHeader from "@/components/PageHeader";


export default async function BookPage({ params }: { params: { topicSlug: string } }) {
  const { topicSlug } = await params; // topicSlug is 'elementary', 'intermediate', etc.

  const book = grammarBooks.find((b) => b.id === topicSlug);

  if (!book) {
    return notFound();
  }

  return (
    <>
      <PageHeader
        title={book.name}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715179/7f460211-0961-4661-92cd-42f613d4afdd.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Grammar', href: '/grammar' },
          { label: book.level },
        ]}
      />
      <div className="container mx-auto max-w-screen-xl px-4 py-8">

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
