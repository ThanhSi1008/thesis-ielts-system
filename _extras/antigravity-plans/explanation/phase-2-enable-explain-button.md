# Phase 2: Enable the Explain Button and Render Inline Explanations

## Goal
Wire the disabled "Explain" button to call `getExplanation()` from Phase 1, then render the AI response in a styled collapsible panel below each question. This is the main functional phase.

## Prerequisites
- Phase 1 completed (file `frontend-web/src/services/explain.api.ts` exists)
- Read the result page: `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx`
  - `ReviewActions` component: lines 423-451
  - `ReviewItemField` component: lines 453-1049
  - `ReviewSection` component: lines 1054-1530 (particularly lines 1076 for transcript data)

---

## Step 1: Add the import for the explain service

**File:** `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx`

At the top of the file, around **line 12** (after the existing imports), add:

```typescript
import { getExplanation, extractTranscriptSnippet, type ExplainContext } from "@/services/explain.api";
```

---

## Step 2: Add new props to ReviewActions

The `ReviewActions` component (lines 423-451) needs new props for the explain feature.

**Replace the `ReviewActions` function signature and body** (lines 423-451) with:

```typescript
function ReviewActions({
  qNum, timestamp, onSeek, onLocate, onNoteToggle, hasNote, isNoteOpen,
  onExplain, isExplaining, hasExplanation, isExplanationOpen,
}: {
  qNum: number; timestamp?: number;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteToggle: () => void; hasNote: boolean; isNoteOpen: boolean;
  onExplain: () => void; isExplaining: boolean; hasExplanation: boolean; isExplanationOpen: boolean;
}) {
  const btnClass = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdfaf0] hover:bg-[#fff7d9] text-[13px] font-semibold text-[#1a1a1a] shadow-sm border border-[#faeeb1] transition-colors focus:outline-none focus:ring-1 focus:ring-[#f6c604]";
  const activeBtnClass = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faeeb1] text-[13px] font-semibold text-[#1a1a1a] shadow-md border border-[#f6c604] transition-colors focus:outline-none";

  return (
    <div className="flex gap-2.5 flex-wrap mt-5">
      {timestamp !== undefined && (
        <button onClick={() => onSeek(timestamp)} className={btnClass}>
          <Headphones strokeWidth={2.5} className="w-[15px] h-[15px]" /> Listen from here
        </button>
      )}
      <button onClick={() => onLocate(qNum)} className={btnClass}>
        <MapPin strokeWidth={2.5} className="w-[15px] h-[15px]" /> Locate
      </button>
      <button
        onClick={onExplain}
        disabled={isExplaining}
        className={isExplanationOpen ? activeBtnClass : (hasExplanation ? btnClass.replace('bg-[#fdfaf0]', 'bg-[#e8f4fd]') : btnClass)}
      >
        {isExplaining ? (
          <>
            <svg className="w-[15px] h-[15px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
            </svg>
            Thinking…
          </>
        ) : (
          <>
            <Lightbulb strokeWidth={2.5} className="w-[15px] h-[15px]" /> Explain
          </>
        )}
      </button>
      <button onClick={onNoteToggle} className={isNoteOpen ? activeBtnClass : (hasNote ? btnClass.replace('bg-[#fdfaf0]', 'bg-[#faeeb1]') : btnClass)}>
        <StickyNote strokeWidth={2.5} className="w-[15px] h-[15px]" /> Note{hasNote ? "" : ""}
      </button>
    </div>
  );
}
```

### Key changes from original:
- **Removed** `disabled` and `cursor-not-allowed` from the Explain button
- **Added** 4 new props: `onExplain`, `isExplaining`, `hasExplanation`, `isExplanationOpen`
- **Added** loading spinner state when `isExplaining` is true
- **Added** active styling when explanation is open
- **Added** blue-tinted bg when explanation has been loaded but panel is closed

---

## Step 3: Add explain state and handlers to ReviewItemField

The `ReviewItemField` component (lines 453-1049) manages per-question UI. We need to add state for explanations.

### 3a: Add new props to ReviewItemField

**Replace the function signature** (lines 453-460) with:

```typescript
function ReviewItemField({
  item, userAnswers, correctMap, examId, userId, noteMap, onSeek, onLocate, onNoteReady,
  transcript, examType,
}: {
  item: NormalizedItem; userAnswers: Record<string, any>; correctMap: Map<string, any>;
  examId: string; userId: string; noteMap: Map<number, QuestionNote>;
  onSeek: (t: number) => void; onLocate: (qNum: number) => void;
  onNoteReady: (note: QuestionNote) => void;
  transcript: any[];
  examType: string;
}) {
```

### 3b: Add explanation state

Right after line 461 (`const [openNoteQn, setOpenNoteQn] = ...`), add:

```typescript
  const [openNoteQn, setOpenNoteQn] = useState<number | null>(null);
  const toggleNote = (q: number) => setOpenNoteQn(p => p === q ? null : q);

  // ── Explanation state ──
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplainQn, setLoadingExplainQn] = useState<number | null>(null);
  const [openExplainQn, setOpenExplainQn] = useState<number | null>(null);
  const [explainError, setExplainError] = useState<number | null>(null);

  const handleExplain = async (qNum: number) => {
    // If already loaded, just toggle visibility
    if (explanations[qNum]) {
      setOpenExplainQn(prev => prev === qNum ? null : qNum);
      return;
    }

    // Build context for this question
    const key = String(qNum);
    const userAns = userAnswers[key];
    const correctAns = correctMap.get(key);

    // Get question text from item
    let questionText = "";
    let options: Record<string, string> | undefined;
    if ("prompt" in item) questionText = item.prompt || "";
    else if ("text" in item) questionText = item.text || "";
    if ("options" in item && item.options) options = item.options;

    // Get transcript snippet
    const transcriptSnippet = extractTranscriptSnippet(transcript, qNum);

    const ctx: ExplainContext = {
      questionText,
      correctAnswer: Array.isArray(correctAns) ? correctAns.join(" / ") : String(correctAns ?? ""),
      userAnswer: Array.isArray(userAns) ? userAns.join(", ") : String(userAns ?? ""),
      questionType: item.kind,
      transcriptSnippet,
      questionNumber: qNum,
      skill: (examType === "READING" ? "READING" : "LISTENING") as "LISTENING" | "READING",
      options,
    };

    setLoadingExplainQn(qNum);
    setExplainError(null);
    setOpenExplainQn(qNum);

    try {
      const explanation = await getExplanation(ctx);
      setExplanations(prev => ({ ...prev, [qNum]: explanation }));
    } catch (err) {
      console.error("[Explain] Failed to get explanation:", err);
      setExplainError(qNum);
    } finally {
      setLoadingExplainQn(null);
    }
  };
```

> **Important:** Remove the duplicate `const toggleNote = ...` line if it already exists on the next line (line 462 in original).

### 3c: Update the renderActions helper

Find the `renderActions` helper inside `ReviewItemField` (lines 465-485). **Replace it** with:

```typescript
  // Helper to render the actions bar below a question group
  const renderActions = (qNum: number, overrideTimestamp?: number) => {
    const ts = overrideTimestamp !== undefined ? overrideTimestamp : item.timestamp;
    return (
      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <ReviewActions
          qNum={qNum}
          timestamp={ts}
          onSeek={onSeek}
          onLocate={onLocate}
          onNoteToggle={() => toggleNote(qNum)}
          hasNote={noteMap.has(qNum)}
          isNoteOpen={openNoteQn === qNum}
          onExplain={() => handleExplain(qNum)}
          isExplaining={loadingExplainQn === qNum}
          hasExplanation={!!explanations[qNum]}
          isExplanationOpen={openExplainQn === qNum}
        />

        {/* Explanation panel */}
        {openExplainQn === qNum && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {loadingExplainQn === qNum ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-3">
                  <Lightbulb className="w-4 h-4" />
                  <span>Generating explanation…</span>
                </div>
                <div className="space-y-2.5">
                  <div className="h-3 bg-blue-100 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-blue-100 rounded-full w-5/6 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="h-3 bg-blue-100 rounded-full w-4/6 animate-pulse" style={{ animationDelay: "300ms" }} />
                  <div className="h-3 bg-blue-100 rounded-full w-3/4 animate-pulse" style={{ animationDelay: "450ms" }} />
                </div>
              </div>
            ) : explainError === qNum ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
                <p className="font-semibold mb-1">Failed to generate explanation</p>
                <p className="text-red-500">Please check your internet connection and try again.</p>
                <button
                  onClick={() => handleExplain(qNum)}
                  className="mt-2 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : explanations[qNum] ? (
              <ExplanationPanel text={explanations[qNum]} />
            ) : null}
          </div>
        )}

        {openNoteQn === qNum && (
          <div className="mt-3">
            <NoteEditor questionNumber={qNum} examId={examId} userId={userId} initialNote={noteMap.get(qNum)} onSaved={onNoteReady} />
          </div>
        )}
      </div>
    );
  };
```

---

## Step 4: Create the ExplanationPanel component

Add this component **above** the `ReviewActions` component (around line 420). This renders the AI's markdown response in a styled panel.

```typescript
// ─────────────────────────────────────────────────────────────
// Explanation Panel — renders AI explanation with basic markdown
// ─────────────────────────────────────────────────────────────
function ExplanationPanel({ text }: { text: string }) {
  // Basic markdown rendering: bold, line breaks, numbered lists, bullet points
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, idx) => {
      const trimmed = line.trim();

      // Empty line → spacing
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Numbered list: "1. ..." or "2. ..."
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2 mt-1.5">
            <span className="text-blue-400 font-bold shrink-0">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} />
          </div>
        );
      }

      // Bullet: "- ..." or "* ..."
      const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        return (
          <div key={idx} className="flex gap-2 mt-1">
            <span className="text-blue-400 mt-1 shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: boldify(bulletMatch[1]) }} />
          </div>
        );
      }

      // H3/H4 headers: "### ..." or "#### ..."
      if (trimmed.startsWith("###")) {
        return <p key={idx} className="font-bold text-[13px] text-blue-800 mt-3 mb-1 uppercase tracking-wide">{trimmed.replace(/^#+\s*/, "")}</p>;
      }

      // Default paragraph with bold support
      return <p key={idx} className="mt-1" dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />;
    });
  };

  // Convert **text** to <strong>text</strong>
  const boldify = (s: string) =>
    s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-blue-900">$1</strong>')
     .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
     .replace(/"([^"]+)"/g, '<span class="text-blue-800 font-medium">"$1"</span>');

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-4 text-[13px] text-blue-900 leading-relaxed shadow-sm">
      <div className="flex items-center gap-2 text-blue-700 font-bold text-[13px] mb-3 pb-2 border-b border-blue-200/60">
        <Lightbulb className="w-4 h-4 text-blue-500" />
        <span>AI Explanation</span>
      </div>
      <div className="space-y-0.5">
        {renderMarkdown(text)}
      </div>
    </div>
  );
}
```

---

## Step 5: Pass transcript and examType to ReviewItemField

In the `ReviewSection` component, find where `ReviewItemField` is rendered (around **lines 1346-1358**):

```tsx
{partItems.map((item, i) => (
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
  />
))}
```

**Add the two new props:**

```tsx
{partItems.map((item, i) => (
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
  />
))}
```

Note: `transcript` is already defined on line 1076 of `ReviewSection`: `const transcript: any[] = activePart?.transcript ?? [];`
And `exam` is already a prop of `ReviewSection`.

---

## Verification

After completing this phase:

1. The app compiles without errors (`npm run web:dev` shows no errors)
2. On the intensive result page, the "Explain" button is **no longer disabled**
3. Clicking "Explain" on any question shows a loading skeleton
4. After ~2-3 seconds, an AI explanation appears in a blue panel
5. Clicking "Explain" again collapses the panel
6. Clicking "Explain" a third time re-opens the panel **instantly** (cached)
7. The loading and error states display correctly
8. The Note button still works independently of the Explain button

## File Checklist

| Action | File |
|--------|------|
| ✅ MODIFY | `frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx` |
| ✅ (no change) | `frontend-web/src/services/explain.api.ts` (from Phase 1) |
