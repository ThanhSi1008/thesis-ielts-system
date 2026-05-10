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
  const isVocabularyUnitPage = pathname.match(/^\/ielts\/vocabulary\/[^\/]+\/[^\/]+$/) !== null;
  const isGrammarUnitPage = pathname.match(/^\/ielts\/grammar\/[^\/]+\/[^\/]+$/) !== null;
  const isTakePage = pathname.includes("/take/") || pathname.includes("/practice/") || pathname.endsWith("/start");
  const isNavbarHidden = isTakePage || isOnboarding || pathname === "/login" || pathname === "/register";
  const shouldHideSidebar = isNavbarHidden || isVocabularyUnitPage || isGrammarUnitPage;
  
  useEffect(() => {
    // Enable scrolling on the main body (it was previously hidden)
    document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const heightClass = isNavbarHidden ? "h-screen" : "h-[calc(100vh-56px)]";

  return (
    <div className={`${heightClass} bg-white dark:bg-slate-950 font-sans overflow-hidden`}>
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
