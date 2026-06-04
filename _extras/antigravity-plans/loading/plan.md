# YouTube-Style Top Loading Bar — Implementation Plan

## Overview

Add a thin, animated progress bar directly beneath the navbar (like YouTube's red loading bar) that triggers on **route navigations** and optionally on **long-running API calls**. This gives users instant visual feedback that something is happening.

**Brand color:** `#FFC600` (the app's primary/gold color — used consistently across the app)

---

## Architecture Decision

**Pure custom implementation (no external library).** The app already has `framer-motion` available but for a thin loading bar, raw CSS `@keyframes` + a small React component is lighter, more controllable, and avoids adding another dependency. This approach is what YouTube itself uses.

---

## Codebase Context

> **IMPORTANT:** Read this section carefully — it contains all the structural info you need.

| Item | Detail |
|---|---|
| **Framework** | Next.js 14 (App Router) with React 18 |
| **Styling** | Tailwind CSS 3.4 + globals.css |
| **Root Layout** | `frontend-web/src/app/layout.tsx` — renders `<Navbar />` then `{children}` |
| **Navbar component** | `frontend-web/src/components/Navbar.tsx` (626 lines, `"use client"`) |
| **Navbar height** | Fixed `h-[56px]`, positioned `sticky top-0 z-50` or `absolute w-full` (depends on page) |
| **Navbar visibility** | Returns `null` on `/take/`, `/practice/`, `/start`, `/login`, `/register`, `/ielts/basic/onboarding` |
| **Global CSS** | `frontend-web/src/app/globals.css` — already has custom `@keyframes shimmer` |
| **Primary color** | `#FFC600` (defined in both `globals.css :root` and `tailwind.config.ts`) |
| **Existing pattern** | `ScrollToTop.tsx` — a headless `"use client"` component placed in root layout that watches `usePathname()`. **Follow the same pattern.** |
| **Router** | App uses `next/navigation`'s `useRouter()` for programmatic nav and `<Link>` for declarative nav |

### Key file paths (all relative to `frontend-web/`)

```
src/app/layout.tsx              ← Root layout (place the new component here)
src/app/globals.css             ← Add keyframes here
src/components/Navbar.tsx       ← Reference for z-index & positioning
src/components/ScrollToTop.tsx  ← Pattern to follow for a headless layout component
```

---

## Phase 1 — Core Component & CSS

### Step 1.1: Add CSS keyframes to `globals.css`

**File:** `frontend-web/src/app/globals.css`

Append the following **at the end of the file** (after the existing `.animate-shimmer` block):

```css
/* ── YouTube-style top loading bar ── */
@keyframes nprogress-grow {
  0%   { width: 0%; }
  20%  { width: 30%; }
  50%  { width: 60%; }
  80%  { width: 85%; }
  100% { width: 92%; }
}

@keyframes nprogress-complete {
  0%   { width: 92%; opacity: 1; }
  100% { width: 100%; opacity: 0; }
}

@keyframes nprogress-glow {
  0%   { box-shadow: 0 0 6px rgba(255,198,0,0.6), 0 0 12px rgba(255,198,0,0.3); }
  50%  { box-shadow: 0 0 10px rgba(255,198,0,0.8), 0 0 20px rgba(255,198,0,0.5); }
  100% { box-shadow: 0 0 6px rgba(255,198,0,0.6), 0 0 12px rgba(255,198,0,0.3); }
}
```

### Step 1.2: Create the `NavigationProgress` component

**File:** `frontend-web/src/components/NavigationProgress.tsx` *(new file)*

```tsx
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
```

**Key design decisions explained:**

| Decision | Rationale |
|---|---|
| `position: fixed` + `top: 56` | Sits directly below the navbar. The navbar is `h-[56px]`. Using fixed ensures it's always visible even when scrolling. |
| `z-index: 9999` | Must be above the navbar (`z-50`) and any modals/overlays. |
| `top: 56` or `top: 0` | Dynamically adjusts based on whether the navbar is hidden on the current page. |
| `pointer-events: none` | The bar should never interfere with clicks. |
| `aria-hidden="true"` | It's purely decorative — screen readers should skip it. |
| Gold gradient instead of flat | Matches the brand `#FFC600` but with a subtle shimmer for premium feel. |
| 8s grow animation | Slow enough that fast navigations complete before it reaches the end. YouTube uses a similar slow crawl. |
| Listens to `pathname` + `searchParams` | Catches both path changes AND query-param-only changes (e.g. `?tab=...`). |

---

## Phase 2 — Integration into Root Layout

### Step 2.1: Add the component to `layout.tsx`

**File:** `frontend-web/src/app/layout.tsx`

**Add import** (after line 20, near the other component imports):

```tsx
import NavigationProgress from "@/components/NavigationProgress";
```

**Add the component** inside the `<Suspense>` block, right after `<Navbar />` (after line 60):

```tsx
<NavigationProgress />
```

The final structure around lines 57-66 should look like:

```tsx
<Suspense fallback={null}>
  <IeltsSidebarProvider>
    <ScrollToTop />
    <Navbar />
    <NavigationProgress />
    <Toaster />
    <GlobalVocabFab />
    <GlobalAIChatFab />
    <GlobalUpgradeModal />
    {children}
  </IeltsSidebarProvider>
</Suspense>
```

> **NOTE:** `NavigationProgress` uses `useSearchParams()` which requires being inside a `<Suspense>` boundary. It's already inside one here, so no additional wrapping is needed.

---

## Phase 3 — API Loading Support (Optional Enhancement)

This phase adds the ability to trigger the loading bar from anywhere in the app for long-running API calls (like exam submissions, AI grading, etc).

### Step 3.1: Create a utility helper

**File:** `frontend-web/src/utils/navigationProgress.ts` *(new file)*

```ts
/**
 * Programmatically control the top loading bar.
 *
 * Usage:
 *   import { navigationProgress } from "@/utils/navigationProgress";
 *   navigationProgress.start();
 *   await someApiCall();
 *   navigationProgress.complete();
 */
export const navigationProgress = {
  start: () => window.dispatchEvent(new Event("navigation-progress:start")),
  complete: () => window.dispatchEvent(new Event("navigation-progress:complete")),
};
```

### Step 3.2: Usage example in existing code

For example, in exam submission flows:

```tsx
import { navigationProgress } from "@/utils/navigationProgress";

const handleSubmit = async () => {
  navigationProgress.start();
  try {
    await examsApi.submitSession(sessionId, answers);
    router.push(`/ielts/intensive/${examId}/results/${sessionId}`);
  } finally {
    navigationProgress.complete();
  }
};
```

> **TIP:** The route change itself will also trigger the bar via Phase 1's pathname watcher. The `complete` event in `finally` ensures the bar finishes even if the navigation doesn't happen (e.g. on error).

---

## Testing Checklist

After implementation, verify these scenarios:

- [ ] **Basic nav:** Click any nav link → bar animates gold under navbar → completes on page load
- [ ] **Fast nav:** Quick navigations (cached pages) → bar still briefly flashes (150ms min display)
- [ ] **Slow nav:** Navigate to a heavy page → bar crawls slowly, completes when content loads
- [ ] **Back/forward:** Browser back/forward buttons trigger the bar
- [ ] **Hidden navbar pages:** On `/login`, `/register`, `/take/*` → bar appears at `top: 0`
- [ ] **Dark mode:** Bar is visible on both light and dark backgrounds (gold on dark = ✅)
- [ ] **Mobile:** Bar spans full width on all screen sizes
- [ ] **No flicker:** Refreshing the page does NOT show the bar (only navigations)
- [ ] **Z-index:** Bar appears above all content, sidebars, and dropdowns

---

## Files Changed Summary

| File | Action | Description |
|---|---|---|
| `src/app/globals.css` | **Modified** | Add 3 `@keyframes` at end of file |
| `src/components/NavigationProgress.tsx` | **Created** | The loading bar component (~100 lines) |
| `src/app/layout.tsx` | **Modified** | Import + render `<NavigationProgress />` after `<Navbar />` |
| `src/utils/navigationProgress.ts` | **Created** *(Phase 3)* | Helper to trigger bar from API calls |
