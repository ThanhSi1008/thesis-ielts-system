# Phase 3 & 4: Frontend Separation

## 1. Top-Level Routing Separation
Keep the `frontend-web/src/app/shadowing-dictation/` top-level layout.

Create two distinct sub-directories for the isolated pages:
- `frontend-web/src/app/shadowing-dictation/shadowing/`
- `frontend-web/src/app/shadowing-dictation/dictation/`

Instead of placing them in the Global Navbar, keep the top-level route under a single workspace (e.g. `frontend-web/src/app/shadowing-dictation/`). 
Update the local Sidebar within this layout to contain two distinct sections:
- **Shadowing** (Library, My Videos)
- **Dictation** (Library, My Videos)

This keeps the overall top-level navigation clean while still physically separating the routes and components internally (e.g. `/shadowing-dictation/shadowing/library` vs `/shadowing-dictation/dictation/library`).

## 2. API Clients Separation
Split `services/shadowing.api.ts` into:
- `services/shadowing.api.ts` (points to `/api/v1/shadowing/...`)
- `services/dictation.api.ts` (points to `/api/v1/dictation/...`)

## 3. Dictation Module Implementation (`app/dictation/`)
This module will be dedicated solely to Dictation.

### Routes:
- `/shadowing-dictation/dictation/library/`: The system lesson library.
- `/shadowing-dictation/dictation/my-videos/`: User's uploaded videos and folder management.
- `/shadowing-dictation/dictation/[id]/`: The Dictation Practice interface.

### Components (`_components/`):
- `DictationVideoPlayer.tsx`
- `DictationWordGrid.tsx`
- `DictationInput.tsx`
- `DictationPlaybackControls.tsx`
- `DictationTranscriptList.tsx`

### Hooks (`_hooks/`):
- `useDictationLesson.ts`
- `useDictationProgress.ts`
- `useDictationAudio.ts`

## 4. Shadowing Module Implementation (`app/shadowing-dictation/shadowing/`)
This module will be dedicated solely to Shadowing.

### Routes:
- `/shadowing-dictation/shadowing/library/`: The system lesson library.
- `/shadowing-dictation/shadowing/my-videos/`: User's uploaded videos and folder management.
- `/shadowing-dictation/shadowing/[id]/`: The Shadowing Practice interface.

### Components (`_components/`):
- `ShadowingVideoPlayer.tsx`
- `ActiveShadowingSentence.tsx`
- `RecordingControls.tsx`
- `ShadowingPlaybackControls.tsx`
- `ShadowingTranscriptList.tsx`

### Hooks (`_hooks/`):
- `useShadowingLesson.ts`
- `useShadowingProgress.ts`
- `useShadowingAudio.ts`
- `useRecording.ts`

*(Note: While some code like the YouTube IFrame API wrapper `useYouTubePlayer` can theoretically be abstracted to a global `src/hooks/` folder to prevent code duplication, all domain-specific logic, API calls, and layout components must be physically separated and duplicated where necessary to ensure zero tight-coupling between the two features).*
