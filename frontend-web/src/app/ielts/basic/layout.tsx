"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function IeltsBasicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-8 font-sans font-medium text-gray-800">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row gap-6">

        {/* Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0 bg-white rounded-2xl p-6 shadow-sm min-h-[600px] border border-gray-100/50">
          <p className="text-sm font-semibold leading-tight text-gray-900 mb-8 w-4/5 pt-2">
            Learn Everything You Need to Know about the IELTS Test
          </p>

          <div className="mb-4">
            <h4 className="text-[13px] font-bold text-gray-900 mb-2 px-4 uppercase tracking-wider">
              Preparation
            </h4>
            <nav className="flex flex-col gap-1 mt-3">
              <Link
                href="/ielts/basic"
                className={`group flex items-center px-4 py-3 rounded-xl transition-all ${pathname.startsWith("/ielts/basic")
                  ? "bg-[#FCF9EA] text-gray-900 font-bold relative"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {/* Yellow active bar indicator */}
                {pathname.startsWith("/ielts/basic") && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4/5 w-1.5 bg-[#FFC107] rounded-r-md"></div>
                )}
                <span className="text-[14px]">Library</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden min-h-[700px] p-2">
          {children}
        </main>
      </div>
    </div>
  );
}
