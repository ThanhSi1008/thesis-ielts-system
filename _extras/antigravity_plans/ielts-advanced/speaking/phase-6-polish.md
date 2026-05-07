# Phase 6: Polish, Statistics & Gamification

> **Goal**: Integrate speaking results into the statistics dashboard, add gamification triggers, and polish edge cases.

> **Depends on**: Phase 5 (Frontend UI working end-to-end)

---

## 1. Statistics Dashboard Integration

File: `frontend-web/src/app/ielts/statistics/StatisticsContent.tsx`

### 1.1. Speaking Data Already Partially Supported

The existing statistics page already handles `skill === "SPEAKING"` in several places (see lines ~144, ~205, ~310, ~587, ~891). However, it currently only reads from `IeltsIntensive` sessions. Update the data fetching to **also include** `IeltsAdvancedSpeaking` sessions.

### 1.2. Backend: Add Advanced Speaking to History Endpoint

File: `backend-core/src/modules/ielts/ielts-advanced.service.ts`

Ensure `getSpeakingHistory` returns data shaped for the statistics page. The statistics page expects entries with:

```typescript
{
  id: string;
  skill: "SPEAKING";
  title: string;
  writingScore?: number;   // used for band-based scoring
  rawScore?: number;
  createdAt: string;
}
```

Add a method to `IeltsAdvancedService`:

```typescript
async getSpeakingStatsForUser(userId: string) {
  const sessions = await this.prisma.ieltsAdvancedSpeakingSession.findMany({
    where: { userId, status: 'GRADED' },
    include: {
      part: { select: { title: true, partNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((s) => ({
    id: s.id,
    skill: 'SPEAKING' as const,
    title: s.part.title,
    writingScore: s.bandScore,  // Band score (re-used field name for chart compat)
    rawScore: null,
    createdAt: s.createdAt.toISOString(),
    source: 'advanced',
  }));
}
```

### 1.3. Frontend: Merge Data Sources

In `StatisticsContent.tsx`, when fetching history data, merge results from both Intensive and Advanced:

```typescript
// Existing: fetch intensive sessions
// New: also fetch advanced speaking sessions
// Merge into a single array for the Speaking chart/table
```

> The exact merge point depends on how the current `StatisticsContent.tsx` fetches its data (likely via a single `GET /ielts/statistics/history` endpoint). If so, update that endpoint to also include Advanced Speaking sessions.

---

## 2. Gamification Integration

File: `backend-core/src/modules/gamification/gamification.service.ts`

### 2.1. Achievement Keys

Add these constants:

```typescript
const ADVANCED_SPEAKING_ACHIEVEMENTS = {
  ADV_SPEAKING_FIRST: "adv_speaking_first",           // First speaking submission
  ADV_SPEAKING_10: "adv_speaking_10",                 // 10 speaking parts completed
  ADV_SPEAKING_ALL_PARTS: "adv_speaking_all_parts",   // Completed Part 1, 2, and 3
  ADV_SPEAKING_BAND_7: "adv_speaking_band_7",         // Achieved band 7.0+
};
```

### 2.2. Trigger Points

In `ielts-advanced.service.ts`, after a session is graded, emit gamification events:

```typescript
// In submitSpeakingSession (or a listener for GRADED status):
await this.gamificationService.checkAchievement(userId, 'ADV_SPEAKING_FIRST');
await this.gamificationService.addXP(userId, 20); // +20 XP per submission

if (bandScore >= 7.0) {
  await this.gamificationService.checkAchievement(userId, 'ADV_SPEAKING_BAND_7');
  await this.gamificationService.addXP(userId, 50); // bonus XP
}
```

> **Note**: Check the existing gamification trigger pattern in `ielts-advanced.service.ts` (likely already done for writing). Follow the same pattern.

### 2.3. Streak Counting

Ensure speaking practice sessions count toward the daily study streak. Check how writing sessions are tracked and replicate.

---

## 3. Edge Case Handling

### 3.1. Microphone Permission Denied

When `navigator.mediaDevices.getUserMedia` is rejected, show a helpful error UI (not just `alert()`):

```tsx
const [micError, setMicError] = useState(false);

// In startRecording catch block:
catch (err) {
  setMicError(true);
}

// Render:
{micError && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
    <h3 className="font-semibold text-red-700">Microphone Access Required</h3>
    <p className="text-sm text-red-600 mt-1">
      Please allow microphone access in your browser settings to take the speaking test.
    </p>
    <button onClick={() => setMicError(false)} className="...">Try Again</button>
  </div>
)}
```

### 3.2. Empty Audio (User Skips All Questions)

If the user clicks "Skip" for every question and submits, the `audioAnswers` object will be empty. Handle this:

```typescript
// In submitSpeakingSession service method:
const hasAudio = Object.values(audioAnswers).some(v => v && v.length > 0);
if (!hasAudio) {
  throw new BadRequestException('Please record at least one response before submitting.');
}
```

### 3.3. Browser Compatibility

`MediaRecorder` API is supported in all modern browsers but may have issues with:
- Safari (older versions) — limited codec support
- Firefox — different default mime types

Add a compatibility check:

```typescript
const checkBrowserSupport = () => {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  if (!window.MediaRecorder) return false;
  return true;
};
```

### 3.4. Large Audio Payloads

Base64-encoded audio for 4 questions (each ~60s) can be ~15-20MB. Ensure:
- Backend `body-parser` limit is sufficient (check `main.ts` for `json({ limit: '...' })`)
- RabbitMQ message size limit is adequate
- Frontend shows upload progress or a loading state during submission

### 3.5. Session Timeout / Navigation Away

If the user navigates away mid-practice:
- The `IN_PROGRESS` session persists in DB
- When they return, `activeSession` is detected → "Resume Practice" button shown
- Audio recordings are NOT persisted (only in-memory) — user must re-record

---

## 4. UX Polish

### 4.1. Audio Playback After Recording

After a question is recorded, show a small audio player so the user can review before moving on:

```tsx
{step === "RECORDED" && answers[activeQnIdx] && (
  <audio
    src={answers[activeQnIdx].url}
    controls
    className="w-full max-w-[400px] mt-3"
  />
)}
```

### 4.2. Question Navigation

Allow users to go back to previous questions (unlike the strict sequential flow in Intensive):

```tsx
<div className="flex gap-2">
  {questions.map((_, idx) => (
    <button
      key={idx}
      onClick={() => goToQuestion(idx)}
      className={`w-8 h-8 rounded-full text-sm font-medium ${
        idx === activeQnIdx ? "bg-primary text-white" :
        answers[idx] ? "bg-green-100 text-green-700" :
        "bg-slate-100 text-slate-500"
      }`}
    >
      {idx + 1}
    </button>
  ))}
</div>
```

### 4.3. Part Type Indicators

Use distinct visual treatments for each part type:

| Part | Color | Icon | Label |
|------|-------|------|-------|
| Part 1 | Blue (`#3b82f6`) | `MessageCircle` | Interview |
| Part 2 | Amber (`#f59e0b`) | `CreditCard` / `FileText` | Cue Card |
| Part 3 | Purple (`#8b5cf6`) | `MessagesSquare` | Discussion |

### 4.4. Loading States

- Skeleton loading for catalog page
- Pulse animation during "GRADING" status on result page
- Smooth transitions between question steps (use CSS `transition` or `framer-motion`)

---

## 5. Responsive Design

### 5.1. Part 2 Layout

On desktop: side-by-side (cue card left, notes right)
On mobile: stacked (cue card on top, notes below)

```css
/* Handled by flex-col md:flex-row in the existing SpeakingTaskBoard pattern */
```

### 5.2. Catalog Grid

- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

---

## 6. Files Modified

| File | Change |
|------|--------|
| `frontend-web/src/app/ielts/statistics/StatisticsContent.tsx` | Merge advanced speaking sessions into charts/history |
| `backend-core/src/modules/ielts/ielts-advanced.service.ts` | Add `getSpeakingStatsForUser` + gamification triggers |
| `backend-core/src/modules/ielts/ielts-advanced.controller.ts` | Add stats endpoint (if needed) |
| `frontend-web/src/app/ielts/advanced/speaking/SpeakingCatalogContent.tsx` | Add part-type color/icon system |
| `frontend-web/src/app/ielts/advanced/speaking/[partId]/SpeakingPracticeContent.tsx` | Add polish: audio playback, question nav, error states |

---

## 7. Final Checklist

- [ ] Statistics page shows Advanced Speaking band scores alongside Intensive data
- [ ] Speaking progress chart renders correctly with band score data points
- [ ] Gamification achievements trigger on first submission
- [ ] XP is awarded (+20 per submission, +50 bonus for band 7+)
- [ ] Daily streak counts speaking practice
- [ ] Microphone error shows helpful UI (not `alert()`)
- [ ] Empty submission is rejected with user-friendly message
- [ ] Audio playback works after recording each question
- [ ] Part 2 layout is responsive (stacked on mobile)
- [ ] Catalog grid is responsive (3/2/1 columns)
- [ ] Loading skeletons appear during data fetch
- [ ] Grading status page polls and auto-updates when GRADED
- [ ] Browser compatibility check prevents cryptic errors
