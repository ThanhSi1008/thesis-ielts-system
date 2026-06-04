# Phase 3: Polish — Caching, Reading Support, and Edge Cases

## Goal
Handle edge cases, add support for Reading exams (passage text instead of transcript), and ensure robustness.

## Prerequisites
- Phase 1 and Phase 2 completed and working
- The Explain button is functional for Listening questions

---

## Step 1: Support Reading exam explanations

The current `extractTranscriptSnippet` only works for Listening exams (which have a `transcript` array). For Reading exams, we need to extract a passage snippet instead.

**File:** `frontend-web/src/services/explain.api.ts`

**Add this function** after `extractTranscriptSnippet`:

```typescript
/**
 * For Reading exams, extract a snippet from the passage text
 * around the area where the question answer is likely found.
 * 
 * This uses a simple heuristic: search for the correct answer text
 * within the passage and return surrounding sentences.
 */
export function extractPassageSnippet(
  passageText: string,
  correctAnswer: string,
  maxLength: number = 500
): string {
  if (!passageText || !correctAnswer) return passageText?.slice(0, maxLength) ?? "";

  // Clean up markdown bold markers
  const cleanPassage = passageText.replace(/\*\*/g, "");

  // Try to find the answer in the passage
  const answerLower = correctAnswer.toLowerCase().trim();
  const passageLower = cleanPassage.toLowerCase();
  const idx = passageLower.indexOf(answerLower);

  if (idx === -1) {
    // Answer not found directly — return first portion of passage
    return cleanPassage.slice(0, maxLength) + (cleanPassage.length > maxLength ? "..." : "");
  }

  // Extract surrounding context (200 chars before, 300 chars after)
  const start = Math.max(0, idx - 200);
  const end = Math.min(cleanPassage.length, idx + correctAnswer.length + 300);
  let snippet = cleanPassage.slice(start, end);

  if (start > 0) snippet = "..." + snippet;
  if (end < cleanPassage.length) snippet = snippet + "...";

  return snippet;
}
```

---

## Step 2: Use passage snippet for Reading exams in ReviewItemField

**File:** `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx`

Update the import at the top to include the new function:

```typescript
import { getExplanation, extractTranscriptSnippet, extractPassageSnippet, type ExplainContext } from "@/services/explain.api";
```

Then, in the `handleExplain` function inside `ReviewItemField`, **replace the transcript snippet line:**

Find this line:
```typescript
const transcriptSnippet = extractTranscriptSnippet(transcript, qNum);
```

Replace with:
```typescript
    // Get context snippet — transcript for listening, passage for reading
    let transcriptSnippet = "";
    if (examType === "READING") {
      // For reading, we don't have a transcript — use the passage text
      // The passage text isn't directly available here, so we pass it via a new prop
      // For now, we'll leave it empty and rely on the question + answer context
      transcriptSnippet = ""; // Passage context added in Step 3
    } else {
      transcriptSnippet = extractTranscriptSnippet(transcript, qNum);
    }
```

### Step 2b: Add passageText prop to ReviewItemField

To provide passage text for Reading exams, add a `passageText` prop:

In the `ReviewItemField` function signature, add:
```typescript
  passageText?: string;
```

Then update the transcript snippet extraction:
```typescript
    let transcriptSnippet = "";
    if (examType === "READING" && passageText) {
      const correctAnsStr = Array.isArray(correctAns) ? correctAns[0] : String(correctAns ?? "");
      transcriptSnippet = extractPassageSnippet(passageText, correctAnsStr);
    } else {
      transcriptSnippet = extractTranscriptSnippet(transcript, qNum);
    }
```

And where `ReviewItemField` is rendered in `ReviewSection` (around lines 1346-1358), pass the passage text:

```tsx
<ReviewItemField
  key={i}
  item={item}
  userAnswers={userAnswers}
  correctMap={correctMap}
  examId={examId}
  userId={userId}
  noteMap={noteMap}
  onSeek={handleSeek}
  onLocate={handleLocate}
  onNoteReady={handleNoteReady}
  transcript={transcript}
  examType={exam?.type ?? "LISTENING"}
  passageText={(parts[activePartIdx] as any)?.passage_text}
/>
```

---

## Step 3: Handle multi-question items

Some question types (`mc_multi`, `matching_group`, `table_completion`, `summary_completion`) represent multiple questions. The `handleExplain` in `ReviewItemField` uses the single `qNum` passed to `renderActions`, but we should also handle the case where the item has `qns` (multiple question numbers).

In `handleExplain`, **after the `questionText` logic, add this enhancement:**

```typescript
    // For multi-question items, include all question numbers in context
    let questionNumbers: number | number[] = qNum;
    if ("qns" in item && item.qns && item.qns.length > 1) {
      questionNumbers = item.qns;
      // Enhance question text with all answers for multi-question groups
      const allAnswers = item.qns.map(q => {
        const cAns = correctMap.get(String(q));
        const uAns = userAnswers[String(q)];
        return `Q${q}: correct="${cAns ?? ""}", student="${uAns ?? ""}"`;
      }).join("; ");
      questionText += `\n[All answers in this group: ${allAnswers}]`;
    }
```

And update the `ctx` object to use `questionNumbers`:
```typescript
    const ctx: ExplainContext = {
      questionText,
      correctAnswer: Array.isArray(correctAns) ? correctAns.join(" / ") : String(correctAns ?? ""),
      userAnswer: Array.isArray(userAns) ? userAns.join(", ") : String(userAns ?? ""),
      questionType: item.kind,
      transcriptSnippet,
      questionNumber: questionNumbers,
      skill: (examType === "READING" ? "READING" : "LISTENING") as "LISTENING" | "READING",
      options,
    };
```

---

## Step 4: Prevent duplicate API calls

If the user rapidly clicks "Explain" multiple times, we might fire multiple API calls. Add a guard:

In `handleExplain`, at the very beginning:

```typescript
  const handleExplain = async (qNum: number) => {
    // If already loaded, just toggle visibility
    if (explanations[qNum]) {
      setOpenExplainQn(prev => prev === qNum ? null : qNum);
      return;
    }

    // Prevent duplicate calls
    if (loadingExplainQn === qNum) return;

    // ... rest of the function
  };
```

---

## Step 5: Add a subtle entrance animation via CSS

The explanation panel already uses `animate-in` classes. Ensure the global CSS file (`frontend-web/src/app/globals.css`) includes these animations. Check if they exist first — they likely do since the result page already uses `animate-in fade-in slide-in-from-top-2` on the Note panel.

If they're missing, add to `globals.css`:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-top-2 {
  from { transform: translateY(-8px); }
  to { transform: translateY(0); }
}

.animate-in {
  animation-duration: 300ms;
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fade-in;
}

.slide-in-from-top-2 {
  animation-name: slide-in-from-top-2;
}
```

---

## Step 6: Final sanity checks

### Edge cases to test:

1. **Question with no transcript match** — The snippet will be empty. The AI should still explain based on the question text + correct answer. Verify it doesn't crash.

2. **Correct answer** — If the user got the answer right, clicking Explain should still work. The AI will simply confirm why it's correct. No special handling needed since the prompt handles both cases.

3. **Reading exam** — Navigate to a Reading exam result and test the Explain button. It should use passage text context instead of transcript.

4. **API error** — Disconnect from internet and click Explain. The error panel should appear with a "Retry" button.

5. **Long explanation** — The AI might occasionally generate a longer response. The panel should accommodate it without overflow issues.

6. **Multiple explanations open** — Open explanations on question 1 and question 3. Only the most recently clicked one should be open at a time (current behavior via `openExplainQn` state).

---

## Verification

After completing this phase:

1. ✅ Explain works for Listening questions (transcript context)
2. ✅ Explain works for Reading questions (passage context)
3. ✅ Multi-question items (matching, MC multi) include all answers in context
4. ✅ Rapid clicking doesn't cause duplicate API calls
5. ✅ Error state shows with retry button
6. ✅ Cached explanations open/close instantly
7. ✅ The loading skeleton animates smoothly

## File Checklist

| Action | File |
|--------|------|
| ✅ MODIFY | `frontend-web/src/services/explain.api.ts` (add `extractPassageSnippet`) |
| ✅ MODIFY | `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx` (reading support, edge cases) |
| ⚠️ CHECK | `frontend-web/src/app/globals.css` (animation classes — likely already present) |
