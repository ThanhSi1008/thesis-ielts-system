"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";

/* ─── Nav items definition ─── */
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    href: "/ielts/dashboard",
    match: (p: string) => p === "/ielts/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "foundation",
    label: "Foundation",
    shortLabel: "Found.",
    href: "#",
    isAccordion: true,
    match: (p: string) => p.startsWith("/ielts/vocabulary") || p.startsWith("/ielts/grammar") || p.startsWith("/ielts/pronunciation"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    children: [
      { key: "vocabulary", label: "Vocabulary", href: "/ielts/vocabulary", match: (p: string) => p.startsWith("/ielts/vocabulary") },
      { key: "grammar", label: "Grammar", href: "/ielts/grammar", match: (p: string) => p.startsWith("/ielts/grammar") },
      { key: "pronunciation", label: "Pronunciation", href: "/ielts/pronunciation", match: (p: string) => p.startsWith("/ielts/pronunciation") },
    ],
  },
  {
    key: "basic",
    label: "IELTS Basic",
    shortLabel: "Basic",
    href: "/ielts/basic",
    match: (p: string) => p === "/ielts/basic" || p.startsWith("/ielts/basic/library"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    key: "advanced",
    label: "IELTS Advanced",
    shortLabel: "Adv.",
    href: "/ielts/advanced",
    match: (p: string) => p.startsWith("/ielts/advanced"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: "intensive",
    label: "IELTS Intensive",
    shortLabel: "Intens.",
    href: "/ielts/intensive",
    match: (p: string) => p === "/ielts/intensive",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    key: "roadmap",
    label: "Roadmap",
    shortLabel: "Road.",
    href: "/ielts/roadmap",
    match: (p: string) => p === "/ielts/roadmap" || p.startsWith("/ielts/basic/roadmap"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 20l-5-5 5-5" />
        <path d="M4 15h11a4 4 0 0 0 4-4v-1" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Test History",
    shortLabel: "History",
    href: "/ielts/history",
    match: (p: string) => p.startsWith("/ielts/history"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    key: "statistics",
    label: "Statistics",
    shortLabel: "Stats",
    href: "/ielts/statistics",
    match: (p: string) => p.startsWith("/ielts/statistics"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: "student-teacher",
    label: "Student/Teacher",
    shortLabel: "S/T",
    href: "/ielts/student-teacher",
    match: (p: string) => p.startsWith("/ielts/student-teacher"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

/* ─── Sidebar inner content (shared between inline & overlay) ─── */
function SidebarContent({ isOverlay, onNavigate }: { isOverlay?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { mode } = useIeltsSidebar();
  const isMini = mode === "mini" && !isOverlay;

  const [foundationOpen, setFoundationOpen] = useState(false);
  const isFoundationActive = NAV_ITEMS.find((n) => n.key === "foundation")!.match(pathname);

  useEffect(() => {
    if (isFoundationActive) setFoundationOpen(true);
  }, [isFoundationActive]);

  return (
    <div className={`flex flex-col h-full ${isMini ? "items-center py-2" : "p-3"}`}>
      <nav className={`flex flex-col ${isMini ? "gap-1 items-center w-full" : "gap-0.5"}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);

          /* ── Mini mode ── */
          if (isMini) {
            if (item.isAccordion) {
              // In mini mode, foundation → link to vocabulary
              return (
                <Link
                  key={item.key}
                  href="/ielts/vocabulary"
                  onClick={onNavigate}
                  title={item.label}
                  className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {item.icon}
                <span className="text-[14px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                    {item.shortLabel}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
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
                title={item.label}
                className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                  {item.shortLabel}
                </span>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                  {item.label}
                </div>
              </Link>
            );
          }

          /* ── Expanded / Overlay mode ── */
          if (item.isAccordion) {
            return (
              <div key={item.key} className="space-y-0.5">
                <button
                  onClick={() => setFoundationOpen((o) => !o)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors hover:bg-gray-50 ${
                    isActive ? "text-primary" : "text-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${foundationOpen ? "" : "-rotate-90"}`}
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {foundationOpen && (
                  <div className="pl-3 space-y-0.5 ml-6">
                    {item.children!.map((child) => {
                      const childActive = child.match(pathname);
                      return (
                        <Link
                          key={child.key}
                          href={child.href}
                          onClick={onNavigate}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                            childActive
                              ? "font-semibold bg-primary/10 text-primary"
                              : "font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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

/* ─── Main exported component ─── */
export function IeltsSidebar() {
  const { mode } = useIeltsSidebar();

  if (mode === "hidden") return null;

  const width = mode === "mini" ? "w-[72px]" : "w-[240px]";

  return (
    <aside
      className={`${width} shrink-0 bg-white h-full sticky top-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-30`}
    >
      <SidebarContent />
    </aside>
  );
}

/* ─── Overlay drawer (for practice pages) ─── */
export function IeltsSidebarOverlay() {
  const { isOverlayOpen, closeOverlay } = useIeltsSidebar();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isOverlayOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeOverlay}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white z-[65] transform transition-transform duration-300 ease-in-out ${
          isOverlayOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header with close button */}
        <div className="h-[56px] flex items-center px-4">
          <button
            onClick={closeOverlay}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="ml-3" onClick={closeOverlay}>
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              alt="Lexon Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Nav content */}
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <SidebarContent isOverlay onNavigate={closeOverlay} />
        </div>
      </aside>
    </>
  );
}
