"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PencilLine, MessageCircleQuestion } from "lucide-react";

export default function IeltsAdvancedWritingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { promptId: string };
}) {
  const pathname = usePathname();

  const isMyAnswers = pathname.includes("/my-answers");
  const isCommunity = pathname.includes("/community");
  // result page should not show the tabs
  const isResult = pathname.includes("/result/");
  const isPractice = !isMyAnswers && !isCommunity && !isResult;

  if (isResult) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white py-6 font-sans font-medium text-gray-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col gap-4 h-full">

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-2 shrink-0">
          <Link
            href={`/ielts/advanced/writing/${params.promptId}`}
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
            href={`/ielts/advanced/writing/${params.promptId}/my-answers`}
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
            href={`/ielts/advanced/writing/${params.promptId}/community`}
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
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
