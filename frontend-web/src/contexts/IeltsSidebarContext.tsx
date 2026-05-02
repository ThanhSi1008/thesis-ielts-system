"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type SidebarMode = "expanded" | "mini" | "hidden";

interface IeltsSidebarContextValue {
  mode: SidebarMode;
  isOverlayOpen: boolean;
  toggleSidebar: () => void;
  closeOverlay: () => void;
}

const IeltsSidebarContext = createContext<IeltsSidebarContextValue>({
  mode: "expanded",
  isOverlayOpen: false,
  toggleSidebar: () => {},
  closeOverlay: () => {},
});

export function useIeltsSidebar() {
  return useContext(IeltsSidebarContext);
}

const LS_KEY = "ielts-sidebar-pref";

export function IeltsSidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine if we're on a "practice" page where sidebar should be hidden
  const isRoadmapPractice =
    pathname === "/ielts/basic/roadmap" &&
    (searchParams.has("lessonId") || searchParams.has("exerciseId"));

  const isSpecificPractice =
    !!pathname.match(/\/ielts\/advanced\/(reading|listening)\/.+/) ||
    !!pathname.match(/\/ielts\/intensive\/.+/) ||
    !!pathname.match(/\/ielts\/basic\/[^/]+\/lessons\/.+/) ||
    !!pathname.match(/\/ielts\/basic\/[^/]+\/exercises\/.+/) ||
    !!pathname.match(/\/shadowing-dictation\/(shadowing|dictation)\/(?!my-videos).+/) ||
    !!pathname.match(/\/vocab-lab\/study\/.+/) ||
    isRoadmapPractice;

  const isIeltsPage = pathname === "/ielts" || pathname.startsWith("/ielts/");
  const isVocabLabPage = pathname === "/vocab-lab" || pathname.startsWith("/vocab-lab/");

  // User preference for browsing pages (expanded vs mini)
  const [userPref, setUserPref] = useState<"expanded" | "mini">("expanded");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored === "mini" || stored === "expanded") {
        setUserPref(stored);
      }
    } catch {}
  }, []);

  // Close overlay on route change
  useEffect(() => {
    setIsOverlayOpen(false);
  }, [pathname]);

  // Compute the effective mode
  let mode: SidebarMode;
  const isShadowingPage = pathname.startsWith("/shadowing-dictation");
  if (!isIeltsPage && !isShadowingPage && !isVocabLabPage) {
    mode = "hidden";
  } else if (isSpecificPractice) {
    mode = "hidden";
  } else {
    mode = userPref;
  }

  const toggleSidebar = useCallback(() => {
    if (mode === "hidden") {
      // On practice/hidden pages, toggle the overlay drawer
      setIsOverlayOpen((prev) => !prev);
    } else {
      // On browsing pages, toggle expanded ↔ mini
      setUserPref((prev) => {
        const next = prev === "expanded" ? "mini" : "expanded";
        try { localStorage.setItem(LS_KEY, next); } catch {}
        return next;
      });
    }
  }, [mode]);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  return (
    <IeltsSidebarContext.Provider value={{ mode, isOverlayOpen, toggleSidebar, closeOverlay }}>
      {children}
    </IeltsSidebarContext.Provider>
  );
}
