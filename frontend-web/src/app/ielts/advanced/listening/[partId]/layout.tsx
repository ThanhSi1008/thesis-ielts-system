"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PencilLine, MessageCircleQuestion } from "lucide-react";

export default function IeltsAdvancedListeningLayout({
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
    <div className="h-full overflow-y-auto bg-slate-50 py-6 font-sans text-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex flex-col gap-6 h-full min-h-0">
        
        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200/60 mb-2">
          <Link
            href={`/ielts/advanced/listening/${params.partId}`}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 font-bold text-[14px] transition-all duration-200 ${
              isPractice
                ? "border-primary text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <PencilLine className={`w-4 h-4 ${isPractice ? 'text-primary' : ''}`} />
            Practice
          </Link>
          
          <Link
            href={`/ielts/advanced/listening/${params.partId}/my-answers`}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 font-bold text-[14px] transition-all duration-200 ${
              isMyAnswers
                ? "border-primary text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <MessageCircleQuestion className={`w-4 h-4 ${isMyAnswers ? 'text-primary' : ''}`} />
            My Answers
          </Link>
 
          <Link
            href={`/ielts/advanced/listening/${params.partId}/community`}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 font-bold text-[14px] transition-all duration-200 ${
              isCommunity
                ? "border-primary text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Users className={`w-4 h-4 ${isCommunity ? 'text-primary' : ''}`} />
            Community
          </Link>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
