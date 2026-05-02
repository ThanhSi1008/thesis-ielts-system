# V3 Plan: Complete Physical Separation — Shadowing vs Dictation

> **Goal**: Rip apart the unified "Shadowing & Dictation" system into two completely independent features with zero shared code, separate DB tables, separate backend modules, and separate frontend routes — while keeping them grouped under a single top-nav tab with sidebar navigation.

---

## Deep Analysis: What Each Feature Actually Does

### Shadowing (Speech Production)
**Core Loop**: Listen → Repeat aloud → Compare your speech to the original.

| Capability | Implementation |
|---|---|
| **Audio playback** | YouTube IFrame API or HTML5 `<audio>` with segment play (audioStart → audioEnd) |
| **Speech recognition** | Web Speech API (`SpeechRecognition`) captures user's spoken words in real-time |
| **Audio recording** | `MediaRecorder` API records user's voice as WebM blob for playback comparison |
| **Word-by-word comparison** | `normalizeWord()` compares spoken words array against sentence words array |
| **Translation/Phonetic overlays** | Toggle Vietnamese translation + phonetic transcription per sentence |
| **Progress tracking** | Array of completed sentence indices, saved to DB via `upsertProgress` |
| **Keyboard shortcuts** | `Enter` (next), `Alt+R` (repeat), `Alt+S` (speed toggle) |

**Shadowing-only components**: `ActiveShadowingSentence`, `RecordingControls`, `ShadowingActionBar`  
**Shadowing-only hooks**: `useRecording` (SpeechRecognition + MediaRecorder)  
**Shadowing-only state**: `isRecording`, `recordedAudioUrl`, `spokenWords`, `showTranslation`, `showPhonetic`

### Dictation (Written Comprehension)
**Core Loop**: Listen → Type what you heard → See which words you got right/wrong.

| Capability | Implementation |
|---|---|
| **Audio playback** | Same YouTube/HTML5 audio segment play |
| **Text input** | `<textarea>` where user types the sentence they heard |
| **Word grid** | Visual grid showing blanks for hidden words, colored by status (correct/incorrect/revealed/pending) |
| **Difficulty system** | 4 levels (Beginner 70% revealed → Expert 0%) controlling how many words are pre-revealed |
| **Word reveal** | Click individual word blanks to reveal, or `Alt+A` to reveal all |
| **Auto-check** | When typed word count matches sentence word count, checks all words automatically |
| **Progress tracking** | Same mechanism as shadowing but with `dictationDifficulty` field |
| **Keyboard shortcuts** | `Enter` (next), `Alt+R` (repeat), `Alt+S` (speed), `Alt+A` (show all), `Alt+M` (difficulty) |

**Dictation-only components**: `WordGrid`, `DictationInput`  
**Dictation-only hooks**: None currently (difficulty logic is inline in page)  
**Dictation-only state**: `userInput`, `sentenceCorrect`, `revealedWords`, `showAllWords`, `difficulty`, `wordStatuses`

### Currently Shared (will be duplicated)

| Item | Type | Used By |
|---|---|---|
| `useLesson` | Hook | Both — fetches lesson from `ShadowingVideo` table |
| `useProgress` | Hook | Both — fetches/saves progress from `ShadowingDictationProgress` |
| `useYouTubePlayer` | Hook | Both — YouTube IFrame lifecycle |
| `useAudioPlayer` | Hook | Both — segment playback |
| `useKeyboardShortcuts` | Hook | Both — keyboard event handler |
| `VideoPlayer` | Component | Both — video/audio display panel |
| `ProgressBar` | Component | Both — top progress indicator |
| `PlaybackControls` | Component | Both — speed selector + repeat + difficulty dropdown |
| `TranscriptList` | Component | Both — scrollable sentence list |
| `SentenceRow` | Component | Both — single transcript row |
| `CompletionScreen` | Component | Both — lesson-complete overlay |
| `ShadowingSidebar` | Component | Both — sidebar navigation |
| `shadowing.api.ts` | API client | Both — all HTTP calls |
| `_constants.ts` | Constants | Both — speed presets, difficulty levels, normalizeWord |
| `ShadowingVideo` | DB Model | Both — same table |
| `ShadowingDictationProgress` | DB Model | Both — differentiated by `type` column |
| `ShadowingFolder` | DB Model | Both — same table |

---

## Inventory of Files to Change

### Database (`backend-core/prisma/`)
- `schema.prisma` — Split 3 models into 6
- `data/shadowing-lessons/` — Duplicate seed data

### Backend (`backend-core/src/modules/`)
- Delete `shadowing/` module entirely
- Create `shadowing/` (new, clean)
- Create `dictation/` (new, clean)

### Frontend API (`frontend-web/src/services/`)
- `shadowing.api.ts` → split into `shadowing.api.ts` + `dictation.api.ts`

### Frontend App (`frontend-web/src/app/shadowing-dictation/`)
- Delete current `_hooks/`, `_components/`, `_constants.ts`, `[id]/`, `page.tsx`, `layout.tsx`
- Create `shadowing/` sub-directory with its own hooks, components, page
- Create `dictation/` sub-directory with its own hooks, components, page  
- Create new shared `layout.tsx` + sidebar with two sections

---

## Execution Phases

| Phase | File | Description |
|---|---|---|
| **1** | `01-database.md` | Split DB models + seed data |
| **2** | `02-backend.md` | Create two independent NestJS modules |
| **3** | `03-frontend-api.md` | Split API client into two |
| **4** | `04-frontend-shadowing.md` | Build `/shadowing` route with its own hooks + components |
| **5** | `05-frontend-dictation.md` | Build `/dictation` route with its own hooks + components |
| **6** | `06-cleanup.md` | Delete old unified code, update sidebar + layout |

> Each phase is designed to be executed **sequentially**. Each phase builds on the previous one. The system should remain functional after each phase via backward-compatible API routes.
