"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

type ProgressState = "idle" | "loading" | "complete";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ProgressState>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef(pathname);

  // Determine if navbar is hidden on this page
  const navbarHidden =
    pathname.includes("/take/") ||
    pathname.includes("/practice/") ||
    pathname.endsWith("/start") ||
    pathname === "/ielts/basic/onboarding" ||
    pathname === "/login" ||
    pathname === "/register";

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Skip on first mount — only trigger on actual navigation
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    cleanup();

    // Start loading
    setState("loading");

    // When pathname changes, the new page has loaded → complete the bar
    // Small delay so the "grow" animation is visible before snapping to 100%
    const minDisplayTime = setTimeout(() => {
      setState("complete");

      // After the completion animation finishes, reset to idle
      timeoutRef.current = setTimeout(() => {
        setState("idle");
      }, 400); // matches nprogress-complete duration
    }, 150);

    return () => {
      clearTimeout(minDisplayTime);
      cleanup();
    };
  }, [pathname, searchParams, cleanup]);

  // Also listen for manual triggers (for API loading — Phase 3)
  useEffect(() => {
    const handleStart = () => {
      cleanup();
      setState("loading");
    };
    const handleComplete = () => {
      setState("complete");
      timeoutRef.current = setTimeout(() => setState("idle"), 400);
    };

    window.addEventListener("navigation-progress:start", handleStart);
    window.addEventListener("navigation-progress:complete", handleComplete);

    return () => {
      window.removeEventListener("navigation-progress:start", handleStart);
      window.removeEventListener("navigation-progress:complete", handleComplete);
      cleanup();
    };
  }, [cleanup]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: navbarHidden ? 0 : 56, // 56px = navbar h-[56px]
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999, // above everything including navbar (z-50 = 50)
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          background:
            "linear-gradient(90deg, #FFC600 0%, #FFD84D 40%, #FFC600 100%)",
          borderRadius: "0 2px 2px 0",
          animation:
            state === "loading"
              ? "nprogress-grow 8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, nprogress-glow 1.5s ease-in-out infinite"
              : "nprogress-complete 0.4s ease-out forwards",
        }}
      />
    </div>
  );
}
