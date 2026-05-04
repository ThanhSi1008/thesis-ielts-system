"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  key: string;
  label: string;
  href: string;
  match: (p: string) => boolean;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const BookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Content Management",
    items: [
      {
        key: "shadowing",
        label: "Shadowing Lessons",
        href: "/admin/shadowing",
        match: (p) => p.startsWith("/admin/shadowing"),
        icon: <BookIcon />,
      },
      {
        key: "dictation",
        label: "Dictation Lessons",
        href: "/admin/dictation",
        match: (p) => p.startsWith("/admin/dictation"),
        icon: <MicIcon />,
      },
    ],
  },
  {
    title: "IELTS",
    items: [
      {
        key: "ielts-basic",
        label: "Basic",
        href: "/admin/ielts-basic",
        match: (p) => p.startsWith("/admin/ielts-basic"),
        icon: <GraduationIcon />,
        disabled: true,
      },
      {
        key: "ielts-advanced",
        label: "Advanced",
        href: "/admin/ielts-advanced",
        match: (p) => p.startsWith("/admin/ielts-advanced"),
        icon: <GraduationIcon />,
        disabled: true,
      },
      {
        key: "ielts-intensive",
        label: "Intensive",
        href: "/admin/ielts-intensive",
        match: (p) => p.startsWith("/admin/ielts-intensive"),
        icon: <GraduationIcon />,
        disabled: true,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 bg-white dark:bg-gray-900 h-full border-r border-gray-100 dark:border-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Admin</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="p-3 flex flex-col gap-0.5">
        {NAV_GROUPS.map((group, gi) => (
          <React.Fragment key={group.title}>
            {gi > 0 && <div className="my-2 border-t border-gray-100 dark:border-gray-800" />}
            <div className="px-4 pt-3 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.title}
              </span>
            </div>
            {group.items.map((item) => {
              const isActive = item.match(pathname);

              if (item.disabled) {
                return (
                  <div
                    key={item.key}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-colors ${
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

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-[240px] px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
