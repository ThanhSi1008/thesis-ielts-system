"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";

/* ─── Nav items definition ─── */
interface NavItem {
  key: string;
  label: string;
  shortLabel: string;
  href: string;
  match: (p: string) => boolean;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  shortTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Browse Library",
    shortTitle: "Browse",
    items: [
      {
        key: "shadowing-library",
        label: "Shadowing",
        shortLabel: "Shadow",
        href: "/shadowing-dictation/shadowing",
        match: (p: string) => p === "/shadowing-dictation/shadowing" || p === "/shadowing-dictation",
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
      },
      {
        key: "dictation-library",
        label: "Dictation",
        shortLabel: "Dictate",
        href: "/shadowing-dictation/dictation",
        match: (p: string) => p === "/shadowing-dictation/dictation",
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        ),
      },
    ],
  },
  {
    title: "Your Videos",
    shortTitle: "Yours",
    items: [
      {
        key: "my-shadowing",
        label: "My Shadowing",
        shortLabel: "Shadow",
        href: "/shadowing-dictation/shadowing/my-videos",
        match: (p: string) => p.startsWith("/shadowing-dictation/shadowing/my-videos"),
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
      {
        key: "my-dictation",
        label: "My Dictation",
        shortLabel: "Dictate",
        href: "/shadowing-dictation/dictation/my-videos",
        match: (p: string) => p.startsWith("/shadowing-dictation/dictation/my-videos"),
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
        ),
      },
    ],
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
        {NAV_GROUPS.map((group, gi) => (
          <React.Fragment key={group.title}>
            {/* Section divider */}
            {gi > 0 && !isMini && <div className="my-2 border-t border-gray-100 dark:border-gray-800" />}
            {gi > 0 && isMini && <div className="my-1 w-8 border-t border-gray-200 dark:border-gray-700" />}

            {/* Section title */}
            {!isMini && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.title}
                </span>
              </div>
            )}
            {isMini && (
              <div className="py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.shortTitle}
                </span>
              </div>
            )}

            {/* Items */}
            {group.items.map((item) => {
              const isActive = item.match(pathname);

              if (isMini) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onNavigate}
                    title={`${group.title} — ${item.label}`}
                    className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {item.icon}
                    <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                      {item.shortLabel}
                    </span>
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                      {group.title} — {item.label}
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
                      : "font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
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
      className={`${width} shrink-0 bg-white dark:bg-gray-900 h-full sticky top-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-30`}
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
        className={`fixed top-0 left-0 h-full w-[240px] bg-white dark:bg-gray-900 z-[65] transform transition-transform duration-300 ease-in-out ${
          isOverlayOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header with close button */}
        <div className="h-[56px] flex items-center px-4">
          <button
            onClick={closeOverlay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
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
