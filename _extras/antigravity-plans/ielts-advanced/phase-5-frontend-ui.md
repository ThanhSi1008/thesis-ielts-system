# Phase 5: Frontend UI & Components

> **Goal**: Build the UI for the IELTS Advanced Writing module. Include the catalog view, the split-pane practice editor, and integrate the existing result view.

> **Depends on**: Phase 3 (Backend API) & Phase 4 (AI Grading format)

---

## 1. Directory Structure

Add to the existing `frontend-web` project:

```
src/app/ielts/advanced/
├── writing/
│   ├── page.tsx                  // Catalog container
│   ├── WritingCatalogContent.tsx // List of prompts + filters
│   └── [promptId]/
│       ├── page.tsx              // Editor container
│       ├── WritingPracticeContent.tsx // Practice UI
│       └── result/
│           └── [sessionId]/
│               ├── page.tsx
│               └── WritingResultContent.tsx // Result view
```

---

## 2. Shared Hooks

Create a new hooks file: `src/hooks/useIeltsAdvancedWriting.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ... Type definitions for Prompt, Session, etc.

export function useWritingPrompts(filters: { taskType?: string, subType?: string, category?: string, page: number, limit: number }) {
  return useQuery({
    queryKey: ["advanced-writing-prompts", filters],
    queryFn: async () => {
      const res = await api.get("/ielts/advanced/writing/prompts", { params: filters });
      return res.data;
    },
  });
}

export function useWritingPromptDetail(id: string) {
  return useQuery({
    queryKey: ["advanced-writing-prompt", id],
    queryFn: async () => {
      const res = await api.get(`/ielts/advanced/writing/prompts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useWritingSession(id: string) {
  return useQuery({
    queryKey: ["advanced-writing-session", id],
    queryFn: async () => {
      const res = await api.get(`/ielts/advanced/writing/sessions/${id}`);
      return res.data;
    },
    enabled: !!id,
    // Poll every 3 seconds if status is GRADING
    refetchInterval: (query) => (query.state.data?.status === 'GRADING' ? 3000 : false),
  });
}

export function useStartWritingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: string) => {
      const res = await api.post("/ielts/advanced/writing/sessions", { promptId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advanced-writing-prompt", data.promptId] });
    },
  });
}

export function useSubmitWriting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, essay, timeTaken }: { sessionId: string, essay: string, timeTaken: number }) => {
      const res = await api.post(`/ielts/advanced/writing/sessions/${sessionId}/submit`, { essay, timeTaken });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advanced-writing-session", data.id] });
    },
  });
}
```

---

## 3. Writing Catalog View (`WritingCatalogContent.tsx`)

This view should be integrated into `AdvancedContent.tsx` as the "Writing" tab.

### Key Components

- **Filter Bar**: Selectors for Task Type (Task 1 / Task 2) and Category (Cambridge, Recent Actual, etc.).
- **Prompt Grid**: Display prompts using a card layout.

**Card Data Display**:
- Title (`Cambridge 13...`)
- Task type badge (e.g. `Task 1: Bar Chart`)
- `imageUrl` preview (if Task 1)
- User's `bestScore` or "Not Attempted"
- `activeSession` indicator (if user has an in-progress draft)

**Action**:
Clicking a card navigates to `/ielts/advanced/writing/[promptId]`.

---

## 4. Practice Editor View (`WritingPracticeContent.tsx`)

This is the core workspace for writing. Use a **split-screen layout** on desktop.

### Layout Details

**Left Pane (Prompt Context):**
- Prompt instructions (text).
- Expandable/zoomable Image (for Task 1) — use `next/image` or a standard `<img>` with full-screen preview capability.
- Suggested time and minimum word limits.

**Right Pane (Editor):**
- A large, auto-expanding `<textarea>` (or a rich text editor without formatting toolbar if preferred).
- **Header Tools**:
  - Live Countdown Timer.
  - Live Word Count (color codes: red = under limit, green = good).
- **Footer**:
  - "Submit for Grading" button.
  - "Saving..." indicator (debounce auto-save using the `/draft` endpoint).

**State Management (DIP Compliance):**
Do *not* put API calls inside the editor UI component.

```typescript
// Bouncer Pattern for Editor Logic
const [text, setText] = useState(initialDraft || "");

// Debounced auto-save
useEffect(() => {
  const timer = setTimeout(() => {
    if (text !== initialDraft) {
      saveDraftMutation.mutate({ sessionId, draftEssay: text });
    }
  }, 3000);
  return () => clearTimeout(timer);
}, [text]);

// Word counting utility
const wordCount = useMemo(() => text.trim().split(/\s+/).filter(w => w.length > 0).length, [text]);
```

---

## 5. Result View Integration

Route: `/ielts/advanced/writing/[promptId]/result/[sessionId]`

We need to reuse the existing `WritingResultView.tsx` from the Intensive module, but adapt it for single-task viewing.

### Challenge

The existing `WritingResultView` expects feedback for *both* Task 1 and Task 2:
```json
{
  "task1": { "band": 6, "criteria": {...} },
  "task2": { "band": 7, "criteria": {...} }
}
```

Our new API returns a flat structure:
```json
{
  "overall_band": 6.5,
  "criteria": {...},
  "mistakes": [...]
}
```

### Solution: Wrapper Component

Instead of heavily modifying `WritingResultView.tsx` and risking breaking the Intensive module, create a small adapter component:

`src/app/ielts/advanced/writing/[promptId]/result/[sessionId]/WritingResultContent.tsx`

```tsx
import WritingResultView from "@/components/WritingResultView";
// ... imports

export default function WritingResultContent({ session }) {
  const { feedback, prompt } = session;

  // Adapt the single-task feedback into the shape WritingResultView expects
  const adaptedFeedback = useMemo(() => {
    if (!feedback) return null;

    // Create a dummy structure where the active task holds the real data
    const isTask1 = prompt.taskType === "TASK_1";
    
    return {
      overall_band: session.bandScore,
      task1: isTask1 ? feedback : null,
      task2: !isTask1 ? feedback : null,
    };
  }, [feedback, prompt]);

  if (session.status === "GRADING") {
    return <GradingLoadingState />;
  }

  if (session.status === "GRADING_FAILED") {
    return <GradingErrorState error={feedback?.error} />;
  }

  return (
    <div className="w-full">
      {/* 
        Pass the adapted feedback. 
        You might need to pass an initial active tab state to WritingResultView 
        so it defaults to the correct task tab.
      */}
      <WritingResultView 
        feedback={adaptedFeedback}
        defaultTab={prompt.taskType === "TASK_1" ? "task1" : "task2"}
        // Pass original essays
        task1Essay={prompt.taskType === "TASK_1" ? session.essay : ""}
        task2Essay={prompt.taskType === "TASK_2" ? session.essay : ""}
      />
    </div>
  );
}
```

> **Minor change to `WritingResultView`**: You may need to edit `WritingResultView.tsx` slightly to accept a `defaultTab` prop if it doesn't already have one, or to hide the tab switcher if only one task is present.

---

## 6. Integrating into Navigation

Update `src/app/ielts/advanced/AdvancedContent.tsx`:

1. Add "Writing" to the `SKILLS` array tabs.
2. In the render section for `skill === "Writing"`, render the new `<WritingCatalogContent />` component.
3. Update `IeltsSidebar.tsx` if it has specific links to sub-modules.

---

## 7. Component Checklist

- [ ] `useIeltsAdvancedWriting.ts` hooks created
- [ ] `AdvancedContent.tsx` updated to support Writing tab
- [ ] `WritingCatalogContent.tsx` built (grid of prompts)
- [ ] `WritingPracticeContent.tsx` built (split pane, timer, editor)
- [ ] Auto-save debounce logic working
- [ ] Submit flow transitions user to Result page
- [ ] Result page polling logic handles `GRADING` status (loading UI)
- [ ] `WritingResultContent.tsx` adapter accurately renders feedback
- [ ] Mobile responsive: split pane becomes stacked (prompt on top, editor below)
