"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ContentBlock {
  type: "markdown" | "strategy" | "warning" | "info";
  content: string;
}

interface Lesson {
  id: string;
  skillId: string;
  chapter: string | null;
  title: string;
  content: ContentBlock[];
}

export default function TheoryPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/ielts/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  if (loading) {
    return <div className="p-10 flex justify-center text-gray-500 animate-pulse font-medium">Loading Theory...</div>;
  }

  if (!lesson) {
    return <div className="p-10 text-center text-red-500 font-bold">Lesson not found.</div>;
  }

  // Helper to render formatting
  const renderContent = (content: string) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} className="space-y-3 whitespace-pre-wrap" />;
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold transition-colors text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {lesson.chapter && <span className="text-[#FFC107] block text-base font-bold tracking-widest uppercase mb-1">{lesson.chapter}</span>}
          {lesson.title}
        </h1>
      </div>

      {/* Content Blocks */}
      <div className="flex-1 overflow-y-auto space-y-6 text-gray-700 leading-relaxed text-[15px]">
        {Array.isArray(lesson.content) ? lesson.content.map((block, idx) => {
          switch (block.type) {
            case "markdown":
              return (
                <div key={idx} className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600">
                  {renderContent(block.content)}
                </div>
              );
            case "strategy":
              return (
                <div key={idx} className="relative bg-[#FFFBEA] border-l-4 border-[#FFC107] rounded-r-xl p-5 my-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-[#E0A800]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">Strategy Highlight</h3>
                  </div>
                  <div className="text-gray-800 font-medium">{renderContent(block.content)}</div>
                </div>
              );
            case "warning":
              return (
                <div key={idx} className="relative bg-[#FEF2F2] border-l-4 border-red-500 rounded-r-xl p-5 my-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">Common Trap</h3>
                  </div>
                  <div className="text-gray-800 font-medium">{renderContent(block.content)}</div>
                </div>
              );
            case "info":
              return (
                <div key={idx} className="relative bg-[#F0F9FF] border-l-4 border-blue-400 rounded-r-xl p-5 my-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">Helpful Info</h3>
                  </div>
                  <div className="text-gray-800 font-medium">{renderContent(block.content)}</div>
                </div>
              );
            default:
              return <div key={idx}>{renderContent(block.content)}</div>;
          }
        }) : (
          <div className="prose max-w-none">{renderContent(JSON.stringify(lesson.content))}</div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-4 pb-2 flex justify-end">
        <Link 
          href={`/ielts/basic`} 
          className="bg-[#212121] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors flex items-center gap-2"
        >
          Next: Practice Exercise
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
