# Phase 6: Cleanup — Delete Old Code & Wire Up Sidebar

## Step 6.1: Update Sidebar Navigation

The `ShadowingSidebar.tsx` currently has 2 items:
- Library → `/shadowing-dictation`
- My Videos → `/shadowing-dictation/my-videos`

Replace with **4 items** grouped into 2 sections:

```ts
const NAV_SECTIONS = [
  {
    title: 'Shadowing',
    items: [
      { key: 'shadowing-library', label: 'Library', href: '/shadowing-dictation/shadowing', match: (p) => p === '/shadowing-dictation/shadowing' },
      { key: 'shadowing-videos', label: 'My Videos', href: '/shadowing-dictation/shadowing/my-videos', match: (p) => p.startsWith('/shadowing-dictation/shadowing/my-videos') },
    ],
  },
  {
    title: 'Dictation',
    items: [
      { key: 'dictation-library', label: 'Library', href: '/shadowing-dictation/dictation', match: (p) => p === '/shadowing-dictation/dictation' },
      { key: 'dictation-videos', label: 'My Videos', href: '/shadowing-dictation/dictation/my-videos', match: (p) => p.startsWith('/shadowing-dictation/dictation/my-videos') },
    ],
  },
];
```

### Sidebar Visual Design
```
┌──────────────────────┐
│  SHADOWING           │  ← Section header (small caps, gray)
│  📚 Library          │  ← Active = primary color
│  🎬 My Videos        │
│                      │
│  DICTATION           │  ← Section header
│  📚 Library          │
│  🎬 My Videos        │
└──────────────────────┘
```

In mini mode, show icons only with tooltips. Section headers collapse to a thin divider line.

## Step 6.2: Update Layout

Update `frontend-web/src/app/shadowing-dictation/layout.tsx`:
- Rename the sidebar import to the new grouped sidebar component
- Default route `/shadowing-dictation` should redirect to `/shadowing-dictation/shadowing` (or show a landing page with both options)

```tsx
export const metadata: Metadata = {
  title: 'Shadowing & Dictation | TOEIC Master AI',
  description: 'Practice English through shadowing and dictation exercises',
};

export default function ShadowingDictationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-white">
      <ShadowingSidebarOverlay />
      <ShadowingSidebar />
      <main className="flex-1 h-full overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
```

## Step 6.3: Create Landing Page (Optional)

`frontend-web/src/app/shadowing-dictation/page.tsx` can either:
- **Option A**: Redirect to `/shadowing-dictation/shadowing` automatically
- **Option B**: Show a split landing page with two cards: "Start Shadowing" and "Start Dictation"

Recommended: **Option A** for simplicity. Use Next.js `redirect()`:
```tsx
import { redirect } from 'next/navigation';
export default function ShadowingDictationPage() {
  redirect('/shadowing-dictation/shadowing');
}
```

## Step 6.4: Delete Old Unified Files

After both new modules are fully functional, delete:

### Frontend — Old shared hooks (replaced by per-module copies)
- `frontend-web/src/app/shadowing-dictation/_hooks/useLesson.ts`
- `frontend-web/src/app/shadowing-dictation/_hooks/useProgress.ts`
- `frontend-web/src/app/shadowing-dictation/_hooks/useYouTubePlayer.ts`
- `frontend-web/src/app/shadowing-dictation/_hooks/useAudioPlayer.ts`
- `frontend-web/src/app/shadowing-dictation/_hooks/useRecording.ts`
- `frontend-web/src/app/shadowing-dictation/_hooks/useKeyboardShortcuts.ts`

### Frontend — Old shared components (replaced by per-module copies)
- `frontend-web/src/app/shadowing-dictation/_components/ActiveShadowingSentence.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/CompletionScreen.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/DictationInput.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/PlaybackControls.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/ProgressBar.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/RecordingControls.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/SentenceRow.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/ShadowingActionBar.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/TranscriptList.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/VideoPlayer.tsx`
- `frontend-web/src/app/shadowing-dictation/_components/WordGrid.tsx`

### Frontend — Old constants
- `frontend-web/src/app/shadowing-dictation/_constants.ts`

### Frontend — Old practice pages
- `frontend-web/src/app/shadowing-dictation/[id]/shadowing/page.tsx`
- `frontend-web/src/app/shadowing-dictation/[id]/dictation/page.tsx`

### Frontend — Old my-videos page
- `frontend-web/src/app/shadowing-dictation/my-videos/page.tsx`

### Backend — Old unified module
- `backend-core/src/modules/shadowing/` (entire old directory, after new modules are confirmed working)

### Database — Old unified model
- Remove `ShadowingDictationProgress` from `schema.prisma`
- Drop `shadowing_dictation_progress` table after data migration is confirmed

## Step 6.5: Update Global Nav Header

The top navigation currently shows "SHADOWING & DICTATION". Keep it as-is — the sidebar handles the internal split. No header changes needed.

## Step 6.6: Update `parseSrt.ts`

`frontend-web/src/utils/parseSrt.ts` imports `ShadowingSentence` from `@/services/shadowing.api`. After the split, decide:
- If used by both modules: move `ShadowingSentence` type to a shared types file `@/types/sentence.ts`
- If used by only one: update the import path accordingly

---

## Final File Count Comparison

| Layer | Before (unified) | After (separated) |
|---|---|---|
| **DB Models** | 3 | 6 (3 + 3) |
| **Backend Services** | 4 | 8 (4 + 4) |
| **Backend Controllers** | 4 | 8 (4 + 4) |
| **Backend DTOs** | 3 | 6 (3 + 3) |
| **Backend Modules** | 1 | 2 |
| **Frontend API** | 1 | 2 |
| **Frontend Hooks** | 6 (shared) | 12 (6 + 6) |
| **Frontend Components** | 12 (shared) | ~18 (9 + 9) |
| **Frontend Pages** | 4 | 6 (3 + 3) |
| **Frontend Constants** | 1 | 2 |

**Total**: ~38 files → ~68 files. More files, but each is smaller, focused, and independently modifiable.

---

## Verification Checklist

After all phases are complete, verify:

- [ ] `/shadowing-dictation/shadowing` loads library with only "Shadow" buttons
- [ ] `/shadowing-dictation/dictation` loads library with only "Dictate" buttons  
- [ ] Shadowing practice page works: play → record → compare → mark done → next
- [ ] Dictation practice page works: play → type → word grid updates → auto-check → next
- [ ] Difficulty selector only appears in dictation (not shadowing)
- [ ] Translation/phonetic toggles only appear in shadowing (not dictation)
- [ ] Recording controls only appear in shadowing (not dictation)
- [ ] Progress saves independently: completing shadowing lessons doesn't affect dictation progress
- [ ] User videos are managed independently per module
- [ ] Sidebar shows 2 sections with 2 items each
- [ ] Old `/shadowing-dictation/[id]/shadowing` and `/shadowing-dictation/[id]/dictation` routes are dead
- [ ] Backend old `/shadowing/progress` endpoint is removed
- [ ] No TypeScript compilation errors (`tsc --noEmit`)
- [ ] No orphaned imports referencing deleted files
