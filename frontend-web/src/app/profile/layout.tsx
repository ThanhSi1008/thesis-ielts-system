"use client";

import React, { useEffect } from "react";
import { ProfileSidebar, ProfileSidebarOverlay } from "./_components/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Overlay drawer — always mounted (visibility controlled internally) */}
      <ProfileSidebarOverlay />

      <div className="flex h-full">
        {/* Inline sidebar (expanded or mini) */}
        <ProfileSidebar />

        {/* Main content area — flex container with default vertical scrolling */}
        <main className="flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
