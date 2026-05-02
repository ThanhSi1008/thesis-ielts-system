"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { IeltsSidebar, IeltsSidebarOverlay } from "./_components/IeltsSidebar";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";

export default function IeltsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useIeltsSidebar();
  const pathname = usePathname();
  const isOnboarding = pathname === "/ielts/basic/onboarding";
  
  // Hide sidebar on the vocabulary unit learning page (which has 2 dynamic segments after vocabulary)
  const isVocabularyUnitPage = pathname.match(/^\/ielts\/vocabulary\/[^\/]+\/[^\/]+$/) !== null;
  // Hide sidebar on the grammar unit learning page
  const isGrammarUnitPage = pathname.match(/^\/ielts\/grammar\/[^\/]+\/[^\/]+$/) !== null;
  const shouldHideSidebar = isOnboarding || isVocabularyUnitPage || isGrammarUnitPage;

  useEffect(() => {
    // Enable scrolling on the main body (it was previously hidden)
    document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Overlay drawer — always mounted (visibility controlled internally) */}
      <IeltsSidebarOverlay />

      <div className="flex h-full">
        {/* Inline sidebar (expanded or mini) */}
        {!shouldHideSidebar && <IeltsSidebar />}

        {/* Main content area — flex container with default vertical scrolling */}
        <main className="flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ease-in-out overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
