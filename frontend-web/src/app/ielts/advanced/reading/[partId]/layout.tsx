"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PencilLine, MessageCircleQuestion } from "lucide-react";

export default function IeltsAdvancedReadingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { partId: string };
}) {
  const pathname = usePathname();

  const isMyAnswers = pathname.includes("/my-answers");
  const isCommunity = pathname.includes("/community");
  const isPractice = !isMyAnswers && !isCommunity;

  return (
    <div className="h-full max-h-screen bg-white py-4 font-sans font-medium text-gray-800 flex flex-col overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-8 flex flex-col gap-4 h-full min-h-0 flex-1 overflow-hidden">
        
        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-2 shrink-0">
          <Link
            href={`/ielts/advanced/reading/${params.partId}`}
            className={`flex items-center gap-2 px-1 py-2 border-b-2 font-bold text-[15px] transition-colors ${
              isPractice
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <PencilLine className="w-4 h-4" />
            Practice
          </Link>
          
          <Link
            href={`/ielts/advanced/reading/${params.partId}/my-answers`}
            className={`flex items-center gap-2 px-1 py-2 border-b-2 font-bold text-[15px] transition-colors ${
              isMyAnswers
                ? "border-[#FF2A6D] text-[#FF2A6D]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircleQuestion className="w-4 h-4" />
            My Answers
          </Link>

          <Link
            href={`/ielts/advanced/reading/${params.partId}/community`}
            className={`flex items-center gap-2 px-1 py-2 border-b-2 font-bold text-[15px] transition-colors ${
              isCommunity
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Community
          </Link>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
