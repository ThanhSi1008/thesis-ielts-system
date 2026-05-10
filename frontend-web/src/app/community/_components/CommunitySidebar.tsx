"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Layers, Lightbulb, Trophy, Medal, User } from "lucide-react";

const NAV_ITEMS = [
  {
    key: "feed",
    label: "Feed",
    shortLabel: "Feed",
    href: "/community",
    match: (p: string, sp: URLSearchParams) => !sp.has("tab") || ["all", "study-tips", "achievements"].includes(sp.get("tab") || ""),
    icon: <Layers className="w-5 h-5 shrink-0" />,
  },
  {
    key: "my-activity",
    label: "My Activity",
    shortLabel: "Activity",
    href: "/community?tab=my-posts",
    match: (p: string, sp: URLSearchParams) => sp.get("tab") === "my-posts",
    icon: <User className="w-5 h-5 shrink-0" />,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    shortLabel: "Rank",
    href: "/community?tab=leaderboard",
    match: (p: string, sp: URLSearchParams) => sp.get("tab") === "leaderboard",
    icon: <Medal className="w-5 h-5 shrink-0" />,
  },
];

function SidebarContent({ isOverlay, onNavigate }: { isOverlay?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mode } = useIeltsSidebar();
  const isMini = mode === "mini" && !isOverlay;

  return (
    <div className={`flex flex-col h-full ${isMini ? "items-center py-2" : "p-3"}`}>
      <nav className={`flex flex-col ${isMini ? "gap-1 items-center w-full" : "gap-1"}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname, searchParams);

          if (isMini) {
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                title={item.label}
                className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                  {item.shortLabel}
                </span>
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 dark:bg-slate-700 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                  {item.label}
                </div>
              </Link>
            );
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                title={item.label}
                className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                  {item.shortLabel}
                </span>
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 dark:bg-slate-700 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                  {item.label}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors ${
                isActive
                  ? "font-semibold bg-primary/10 text-primary"
                  : "font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors ${
                isActive
                  ? "font-semibold bg-primary/10 text-primary"
                  : "font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function CommunitySidebar() {
  const { mode } = useIeltsSidebar();

  if (mode === "hidden") return null;

  const width = mode === "mini" ? "w-[72px]" : "w-[240px]";

  return (
    <aside
      className={`${width} shrink-0 bg-white dark:bg-slate-950 h-full sticky top-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-30`}
    >
      <Suspense fallback={null}>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}

export function CommunitySidebarOverlay() {
  const { isOverlayOpen, closeOverlay } = useIeltsSidebar();
  const { resolvedTheme } = useTheme();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 md:hidden ${
          isOverlayOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeOverlay}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white dark:bg-slate-950 z-[65] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOverlayOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[56px] flex items-center px-4 border-b border-gray-100 dark:border-slate-800">
          <button
            onClick={closeOverlay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-slate-400"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="ml-3" onClick={closeOverlay}>
            <img
              src={resolvedTheme === "dark"
                ? "https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                : "https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              }
              alt="Lexon Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <Suspense fallback={null}>
            <SidebarContent isOverlay onNavigate={closeOverlay} />
          </Suspense>
        </div>
      </aside>
    </>
  );
}
