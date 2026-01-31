import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
// import { vocabularyBooks } from "../../data";
import GrammarLessonClient from "./GrammarLessonClient";

// Mock data for topics since we are restructuring
const grammarTopics = [
  { id: "essential-grammar-in-use", title: "Essential Grammar in Use" },
  { id: "english-grammar-in-use", title: "English Grammar in Use" },
  { id: "advanced-grammar-in-use", title: "Advanced Grammar in Use" },
];

export default async function UnitPage({ 
  params 
}: { 
  params: { topicSlug: string; lessonSlug: string } 
}) {
  const { topicSlug, lessonSlug } = await params;
  
  const book = grammarTopics.find((b) => b.id === topicSlug || topicSlug.includes(b.id));

  // Extract unit ID
  const unitId = lessonSlug.replace("unit", "");
  const unitTitle = "Present continuous"; // Hardcoded for demo matching design
  const backLink = `/grammar/${topicSlug}`;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <Link href={backLink} className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Units
      </Link>

      <GrammarLessonClient 
        topicName={book?.title || "Grammar Book"}
        unitId={unitId}
        unitTitle={unitTitle}
      />
    </div>
  );
}
