"use client";

import React, { useEffect } from "react";
import { CommunitySidebar, CommunitySidebarOverlay } from "./_components/CommunitySidebar";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Enable scrolling on the main body
    document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] bg-white dark:bg-[#0a0a0a] font-sans overflow-hidden">
      <CommunitySidebarOverlay />

      <div className="flex h-full">
        <CommunitySidebar />

        <main className="flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ease-in-out overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
