"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";

/* ─── Nav items definition ─── */
const NAV_ITEMS = [
  {
    key: "library",
    label: "Library",
    shortLabel: "Lib",
    href: "/shadowing-dictation",
    match: (p: string) => p === "/shadowing-dictation",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: "my-videos",
    label: "My Videos",
    shortLabel: "Videos",
    href: "/shadowing-dictation/my-videos",
    match: (p: string) => p.startsWith("/shadowing-dictation/my-videos"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
];

/* ─── Sidebar inner content (shared between inline & overlay) ─── */
function SidebarContent({ isOverlay, onNavigate }: { isOverlay?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { mode } = useIeltsSidebar();
  const isMini = mode === "mini" && !isOverlay;

  return (
    <div className={`flex flex-col h-full ${isMini ? "items-center py-2" : "p-3"}`}>
      <nav className={`flex flex-col ${isMini ? "gap-1 items-center w-full" : "gap-0.5"}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);

          /* ── Mini mode ── */
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
export function ShadowingSidebar() {
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
export function ShadowingSidebarOverlay() {
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
