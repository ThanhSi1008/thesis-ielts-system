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

  const isOnboarding = pathname === "/ielts/basic/onboarding";
  const isTopLevel = pathname === "/ielts/basic" || pathname === "/ielts/basic/library";
  const isPracticeArea = pathname.includes("/lessons") || pathname.includes("/exercises");

  if (isTopLevel || isPracticeArea) {
    return <>{children}</>;
  }

  if (isOnboarding) {
    return (
      <div className="bg-white font-sans font-medium text-gray-800 h-full overflow-y-auto">
        <main className="w-full min-h-full flex flex-col min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans font-medium text-gray-800 h-full">
      <div className="w-full flex flex-col md:flex-row h-full">
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col h-full overflow-hidden">
          <p className="text-sm leading-tight text-gray-900 mb-6 shrink-0 w-4/5 pt-6 px-6">
            Learn Everything You Need to Know about the IELTS Test
          </p>

          <div className="flex-1 overflow-hidden flex flex-col px-4">
            {pathname.startsWith("/ielts/basic/roadmap") ? (
              <RoadmapSidebar />
            ) : (
              <nav className="flex flex-col gap-2">
                <Link
                  href="/ielts/basic"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname === "/ielts/basic"
                    ? "bg-primary/10 text-gray-900 font-bold"
                    : "text-gray-500 hover:bg-primary/10 hover:text-gray-900 font-medium"
                    }`}
                >
                  <span className="text-[14px]">Roadmap</span>
                </Link>

                <Link
                  href="/ielts/basic/library"
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname.startsWith("/ielts/basic/library") || (pathname.startsWith("/ielts/basic/") && !pathname.startsWith("/ielts/basic/roadmap") && pathname !== "/ielts/basic")
                    ? "bg-primary/10 text-gray-900 font-bold"
                    : "text-gray-500 hover:bg-primary/10 hover:text-gray-900 font-medium"
                    }`}
                >
                  <span className="text-[14px]">Library</span>
                </Link>
              </nav>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
