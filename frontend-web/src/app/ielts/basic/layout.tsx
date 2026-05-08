"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { RoadmapSidebar } from "./_components/RoadmapSidebar";

export default function IeltsBasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isOnboarding = pathname === "/ielts/basic/onboarding";
  const isTopLevel = pathname === "/ielts/basic" || pathname === "/ielts/basic/library";
  const isPracticeArea = pathname.includes("/lessons") || pathname.includes("/exercises");

  if (isTopLevel || isPracticeArea) {
    return <>{children}</>;
  }

  if (isOnboarding) {
    return (
      <div className="bg-white dark:bg-slate-950 font-sans font-medium text-gray-800 dark:text-gray-200 h-full overflow-y-auto transition-colors duration-300">
        <main className="w-full min-h-full flex flex-col min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans font-medium text-gray-800 dark:text-gray-200 h-full bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
          <p className="text-sm leading-tight text-gray-900 dark:text-gray-100 mb-6 shrink-0 w-4/5 pt-6 px-6 opacity-70">
            Learn Everything You Need to Know about the IELTS Test
          </p>

          <div className="flex-1 overflow-hidden flex flex-col px-4">
            {pathname.startsWith("/ielts/basic/roadmap") ? (
              <Suspense fallback={null}>
                <RoadmapSidebar />
              </Suspense>
            ) : (
              <nav className="flex flex-col gap-2">
                <Link
                  href="/ielts/basic"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname === "/ielts/basic"
                    ? "bg-primary/10 text-gray-900 dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-gray-900 dark:hover:text-white font-medium"
                    }`}
                >
                  <span className="text-[14px]">Roadmap</span>
                </Link>

                <Link
                  href="/ielts/basic/library"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname.startsWith("/ielts/basic/library") || (pathname.startsWith("/ielts/basic/") && !pathname.startsWith("/ielts/basic/roadmap") && pathname !== "/ielts/basic")
                    ? "bg-primary/10 text-gray-900 dark:text-white font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-gray-900 dark:hover:text-white font-medium"
                    }`}
                >
                  <span className="text-[14px]">Library</span>
                </Link>
              </nav>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-white dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
