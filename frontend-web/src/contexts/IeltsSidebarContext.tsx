"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
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

// Reads searchParams and notifies parent — renders nothing, must be inside <Suspense>
function SearchParamsSyncer({ onSync }: { onSync: (isRoadmapPractice: boolean) => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const isRoadmap = pathname === "/ielts/basic/roadmap";
    const hasParams = searchParams.has("lessonId") || searchParams.has("exerciseId");
    onSync(isRoadmap && hasParams);
  }, [searchParams, pathname, onSync]);

  return null;
}

export function IeltsSidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isRoadmapPractice, setIsRoadmapPractice] = useState(false);
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
  const isCommunityPage = pathname === "/community" || pathname.startsWith("/community/");
  const isShadowingPage = pathname.startsWith("/shadowing-dictation");
  const isProfilePage = pathname.startsWith("/profile");

  let mode: SidebarMode;
  if (!isIeltsPage && !isShadowingPage && !isVocabLabPage && !isProfilePage && !isCommunityPage) {
    mode = "hidden";
  } else if (isSpecificPractice) {
    mode = "hidden";
  } else {
    mode = userPref;
  }

  const toggleSidebar = useCallback(() => {
    if (mode === "hidden") {
      setIsOverlayOpen((prev) => !prev);
    } else {
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
      {/* SearchParamsSyncer renders null — Suspense required by Next.js for useSearchParams */}
      <Suspense fallback={null}>
        <SearchParamsSyncer onSync={setIsRoadmapPractice} />
      </Suspense>
      {children}
    </IeltsSidebarContext.Provider>
  );
}
