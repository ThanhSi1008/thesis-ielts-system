# Phase 5: Frontend UI & Components

> **Goal**: Build the UI for the IELTS Advanced Speaking module. Include the catalog view, the text-based speaking practice page with recording, and integrate the existing result view.

> **Depends on**: Phase 3 (Backend API) & Phase 4 (AI Grading format)

---

## 1. Directory Structure

Add to the existing `frontend-web` project:

```
src/app/ielts/advanced/
├── speaking/
│   ├── page.tsx                       // Catalog container
│   ├── SpeakingCatalogContent.tsx     // List of parts + filters
│   └── [partId]/
│       ├── layout.tsx                 // Tabbed layout: Practice / My Answers / Community
│       ├── page.tsx                   // Practice container (reads ?session= param)
│       ├── SpeakingPracticeContent.tsx // Practice UI with recording
│       ├── my-answers/
│       │   └── page.tsx               // Session history for this part
│       ├── community/
│       │   └── page.tsx               // Placeholder
│       └── result/
│           └── [sessionId]/
│               ├── page.tsx
│               └── SpeakingResultContent.tsx
```

---

## 2. Shared Hooks

Create: `src/hooks/useIeltsAdvancedSpeaking.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ── Types ──

interface SpeakingPartSummary {
  id: string;
  partNumber: number;
  partType: string;
  topic: string;
  source: string;
  category: string;
  bookNumber: number | null;
  testNumber: number | null;
  title: string;
  questions: { text: string }[];
  bestScore: number | null;
  lastAttempt: string | null;
}

interface SpeakingPartDetail extends SpeakingPartSummary {
  activeSession: { id: string; createdAt: string } | null;
}

interface SpeakingSession {
  id: string;
  status: string;
  bandScore: number | null;
  timeTaken: number | null;
  feedback: any;
  part: {
    id: string;
    title: string;
    partNumber: number;
    partType: string;
    topic: string;
    questions: { text: string }[];
  };
  createdAt: string;
}

// ── Hooks ──

export function useSpeakingParts(filters: {
  partNumber?: number;
  category?: string;
  topic?: string;
  page: number;
  limit: number;
}) {
  return useQuery({
    queryKey: ["advanced-speaking-parts", filters],
    queryFn: async () => {
      const res = await api.get("/ielts/advanced/speaking/parts", { params: filters });
      return res.data;
    },
  });
}

export function useSpeakingPartDetail(id: string) {
  return useQuery({
    queryKey: ["advanced-speaking-part", id],
    queryFn: async () => {
      const res = await api.get(`/ielts/advanced/speaking/parts/${id}`);
      return res.data as SpeakingPartDetail;
    },
    enabled: !!id,
  });
}

export function useSpeakingSession(id: string) {
  return useQuery({
    queryKey: ["advanced-speaking-session", id],
    queryFn: async () => {
      const res = await api.get(`/ielts/advanced/speaking/sessions/${id}`);
      return res.data as SpeakingSession;
    },
    enabled: !!id,
    // Poll every 3s while grading
    refetchInterval: (query) =>
      query.state.data?.status === "GRADING" ? 3000 : false,
  });
}

export function useSpeakingSessionsByPart(partId: string) {
  return useQuery({
    queryKey: ["advanced-speaking-sessions-by-part", partId],
    queryFn: async () => {
      const res = await api.get(`/ielts/advanced/speaking/parts/${partId}/sessions`);
      return res.data;
    },
    enabled: !!partId,
  });
}

export function useStartSpeakingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partId: string) => {
      const res = await api.post("/ielts/advanced/speaking/sessions", { partId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advanced-speaking-part", data.partId] });
    },
  });
}

export function useSubmitSpeaking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      audioAnswers,
      timeTaken,
    }: {
      sessionId: string;
      audioAnswers: Record<string, string>;
      timeTaken: number;
    }) => {
      const res = await api.post(
        `/ielts/advanced/speaking/sessions/${sessionId}/submit`,
        { audioAnswers, timeTaken },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["advanced-speaking-session", data.id],
      });
    },
  });
}
```

---

## 3. Speaking Catalog View (`SpeakingCatalogContent.tsx`)

This view is integrated into `AdvancedContent.tsx` as the "Speaking" tab.

### Key Components

- **Part Filter Bar**: Tabs for "All" / "Part 1" / "Part 2" / "Part 3"
- **Category Dropdown**: Cambridge Academic, Forecast, etc.
- **Part Grid**: Card layout showing speaking parts

**Card Data Display**:
- Title (e.g., `Cambridge IELTS 20 Test 4 — Part 1`)
- Part badge: `Part 1: Interview` / `Part 2: Cue Card` / `Part 3: Discussion`
- Topic tag (e.g., "Personal Qualities")
- User's `bestScore` or "Not Attempted" badge
- Question count (e.g., "4 questions")
- Source badge (e.g., "Cambridge 20")

**Action**: Clicking a card navigates to `/ielts/advanced/speaking/[partId]`.

### Implementation Notes

- Follow the same pattern as `WritingCatalogContent.tsx` (already built)
- Use the same card design language (rounded corners, hover effects, badges)
- Part type colors: Part 1 = blue, Part 2 = orange/amber, Part 3 = purple

---

## 4. Tabbed Layout (`[partId]/layout.tsx`)

Copy from the existing writing layout (`writing/[promptId]/layout.tsx`) and adapt:

```typescript
"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Mic, History, Users } from "lucide-react";

const TABS = [
  { key: "practice", label: "Practice", icon: Mic, path: "" },
  { key: "my-answers", label: "My Answers", icon: History, path: "/my-answers" },
  { key: "community", label: "Community", icon: Users, path: "/community" },
];

export default function SpeakingPartLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const partId = params.partId as string;

  // Don't show tabs on result pages
  const isResultPage = pathname.includes("/result/");
  if (isResultPage) return <>{children}</>;

  const basePath = `/ielts/advanced/speaking/${partId}`;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6">
        {TABS.map((tab) => {
          const tabPath = `${basePath}${tab.path}`;
          const isActive = pathname === tabPath ||
            (tab.key === "practice" && pathname === basePath);

          return (
            <button
              key={tab.key}
              onClick={() => router.push(tabPath)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
```

---

## 5. Speaking Practice View (`SpeakingPracticeContent.tsx`)

This is the **core component**. It follows the same UX as `SpeakingTaskBoard.tsx` but is **text-based** (no video).

### 5.1. Simplified State Machine

```typescript
type StepState = "IDLE" | "READING" | "THINKING" | "RECORDING" | "RECORDED";
```

State flow:
```
IDLE → (user clicks Start) → READING (show question, 2s) →
  THINKING (countdown: 2s for Part 1/3, 60s for Part 2) →
  RECORDING (mic active, timer running) →
  RECORDED (user stops or max time reached) →
  → Next question or Submit
```

### 5.2. Layout

**Part 1 & 3 (Interview / Discussion):**
```
┌─────────────────────────────────────────────┐
│                                             │
│        Speaking Part 1: Interview           │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │   "What do you think your best        │  │
│  │    personal qualities are? [Why?]"    │  │
│  │                                       │  │
│  │         Question 1 of 4               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ────────── ⏺ Record ──────────            │
│  Timer: 0:00         [Skip] [Next »]        │
│                                             │
└─────────────────────────────────────────────┘
```

**Part 2 (Cue Card):**
```
┌─────────────────────┬───────────────────────┐
│  Cue Card           │  Notes                │
│                     │                       │
│  Describe a time... │  ┌─────────────────┐  │
│  You should say:    │  │ Note here...    │  │
│  • what the news... │  │                 │  │
│  • who you...       │  │                 │  │
│  • what people's... │  └─────────────────┘  │
│  and explain why... │                       │
│                     │  Think time: 0:58     │
├─────────────────────┴───────────────────────┤
│  ────────── ⏺ Record ──────────            │
│  Timer: 0:00              [Skip] [Next »]   │
└─────────────────────────────────────────────┘
```

### 5.3. Recording Logic

Extract the recording logic from the existing `SpeakingTaskBoard.tsx`:

```typescript
// Key pieces to reuse from SpeakingTaskBoard.tsx (lines 211-246):
// - MediaRecorder setup
// - audio chunks collection
// - blob creation on stop
// - cleanup on unmount

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      // Store: answers[questionIndex] = { blob, url }
      setAnswers((prev) => ({ ...prev, [activeQnIdx]: { blob, url } }));
      setStep("RECORDED");
    };

    mediaRecorderRef.current.start();
    setRecordTimeElapsed(0);
    setStep("RECORDING");
  } catch {
    alert("Microphone access is required.");
    setStep("IDLE");
  }
};
```

### 5.4. Think Timer

```typescript
// Part 1 & 3: 2 seconds think time
// Part 2: 60 seconds think time
const THINK_DURATIONS = { 1: 2, 2: 60, 3: 2 } as const;

// Max recording duration
const MAX_RECORD_DURATIONS = { 1: 60, 2: 120, 3: 60 } as const;
```

### 5.5. Overview State (no session)

When no `?session=` param is present, show a **Part Overview** page:
- Part title and topic
- List of questions that will be asked
- Timing info (think time + record time)
- "Start Practice" button (calls `useStartSpeakingSession`)
- "Resume Practice" button (if `activeSession` exists)

This follows the same pattern as `WritingPracticeContent.tsx`.

### 5.6. Submission Flow

When all questions are recorded:

```typescript
const handleSubmit = async () => {
  // Convert audio blobs to base64
  const audioAnswers: Record<string, string> = {};
  for (const [key, { blob }] of Object.entries(answers)) {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    audioAnswers[key] = base64;
  }

  const loadingToastId = toast.loading("Submitting your answers for grading...");

  try {
    await submitSpeaking.mutateAsync({
      sessionId,
      audioAnswers,
      timeTaken: totalElapsedTime,
    });
    toast.update(loadingToastId, "success", "Submitted! Grading in progress...");
    router.push(`/ielts/advanced/speaking/${partId}/result/${sessionId}`);
  } catch (e: any) {
    toast.update(loadingToastId, "error", e?.response?.data?.message || "Failed to submit.");
  }
};
```

> **Toast usage**: Use the custom `toast.loading()` + `toast.update()` pattern (as fixed in the previous session). Do NOT use `toast.success({ id })`.

---

## 6. My Answers Page (`my-answers/page.tsx`)

Copy from the existing `writing/[promptId]/my-answers/page.tsx` and adapt:

- Show list of past sessions for this part
- Each session shows: status badge, band score, time taken, date
- "View Feedback" button → navigates to result page
- "Resume" button → navigates to practice with `?session=` param (for IN_PROGRESS sessions)

Use `useSpeakingSessionsByPart(partId)` hook.

---

## 7. Result View (`SpeakingResultContent.tsx`)

### Reuse Strategy

The existing `SpeakingResultView.tsx` component already handles the speaking feedback shape:
- 4 criteria (Fluency & Coherence, Lexical Resource, Grammar, Pronunciation)
- Band score display
- Strengths / weaknesses / improvement tips
- Mistake annotations

**Check if `SpeakingResultView.tsx` can be used directly** or if it needs an adapter. The feedback shape from `grade_single_speaking_part()` matches the existing shape, so it should work directly.

```tsx
"use client";

import { useParams } from "next/navigation";
import { useSpeakingSession } from "@/hooks/useIeltsAdvancedSpeaking";
import SpeakingResultView from "@/components/SpeakingResultView";

export default function SpeakingResultContent() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { data: session, isLoading } = useSpeakingSession(sessionId);

  if (isLoading) return <LoadingSkeleton />;

  if (session?.status === "GRADING") {
    return <GradingLoadingState message="AI is analyzing your speaking..." />;
  }

  if (session?.status === "GRADING_FAILED") {
    return <GradingErrorState error={session.feedback?.error} />;
  }

  return (
    <SpeakingResultView
      feedback={session.feedback}
      questions={session.part.questions}
      partNumber={session.part.partNumber}
    />
  );
}
```

> If `SpeakingResultView.tsx` requires props that don't match, create a thin adapter (same pattern as `WritingResultContent.tsx`). Check the exact prop types before implementing.

---

## 8. Integrating into Navigation

### 8.1. Update `AdvancedContent.tsx`

Add "Speaking" to the skills tab array:

```typescript
const SKILLS = ["Listening", "Reading", "Writing", "Speaking"];
```

In the render section, add:
```tsx
{skill === "Speaking" && <SpeakingCatalogContent />}
```

### 8.2. Route Registration

The file-based routing in Next.js App Router handles this automatically via the directory structure above.

---

## 9. Component Checklist

- [ ] `useIeltsAdvancedSpeaking.ts` hooks created (6 hooks)
- [ ] `AdvancedContent.tsx` updated to support Speaking tab
- [ ] `SpeakingCatalogContent.tsx` built (grid of parts with Part 1/2/3 filter tabs)
- [ ] `[partId]/layout.tsx` built (Practice / My Answers / Community tabs)
- [ ] `SpeakingPracticeContent.tsx` built:
  - [ ] Overview state (no session) with Start/Resume buttons
  - [ ] Practice state with text-based question display
  - [ ] Recording flow: IDLE → READING → THINKING → RECORDING → RECORDED
  - [ ] Part 2 split layout with cue card + notes area
  - [ ] Question progress indicator ("Question 2 of 4")
  - [ ] Timer display (think time + record time)
  - [ ] Submit flow with base64 audio conversion
- [ ] `my-answers/page.tsx` built (session history list)
- [ ] `community/page.tsx` placeholder built
- [ ] `SpeakingResultContent.tsx` built (integrated with existing `SpeakingResultView`)
- [ ] Result page polling handles `GRADING` status (loading UI)
- [ ] Mobile responsive: Part 2 split becomes stacked on mobile
