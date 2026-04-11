"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoadmapSidebar } from "./_components/RoadmapSidebar";

export default function IeltsBasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[40vh] bg-[#F8F9FB] py-4 font-sans font-medium text-gray-800">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row gap-6">

        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 md:sticky md:top-0 flex flex-col h-[90vh]">
          <p className="text-sm font-semibold leading-tight text-gray-900 mb-6 shrink-0 w-4/5 pt-2">
            Learn Everything You Need to Know about the IELTS Test
          </p>

          <div className="flex-1 overflow-hidden flex flex-col">
            {pathname.startsWith("/ielts/basic/roadmap") ? (
              <RoadmapSidebar />
            ) : (
              <nav className="flex flex-col gap-2">
                <Link
                  href="/ielts/basic"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname === "/ielts/basic"
                    ? "bg-[#FFF9E6] text-gray-900 font-bold relative"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {pathname === "/ielts/basic" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4/5 w-1.5 bg-[#FFC107] rounded-r-md"></div>
                  )}
                  <span className="text-[14px]">Preparation</span>
                </Link>

                <Link
                  href="/ielts/basic/listening/lessons"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname.startsWith("/ielts/basic/") && !pathname.startsWith("/ielts/basic/roadmap") && pathname !== "/ielts/basic"
                    ? "bg-[#FFF9E6] text-gray-900 font-bold relative"
                    : "text-gray-600 hover:bg-gray-50 font-semibold"
                    }`}
                >
                  {pathname.startsWith("/ielts/basic/") && !pathname.startsWith("/ielts/basic/roadmap") && pathname !== "/ielts/basic" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4/5 w-1.5 bg-[#FFC107] rounded-r-md"></div>
                  )}
                  <span className="text-[14px]">Library</span>
                </Link>
              </nav>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden min-h-[700px] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
