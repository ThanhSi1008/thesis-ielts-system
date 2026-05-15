# IELTS Pronunciation Module — Redesign Overview

## Objective

Redesign `/ielts/pronunciation` from a bare IPA chart + placeholder detail page into a **complete IPA mastery tool** with rich per-sound content, practice recording, and persistent user progress tracking.

---

## Current State (What Exists)

### Database (`schema.prisma`)
- `PronunciationSound` — basic model: `symbol`, `type`, `word`, `description`, `imageUrl`, `audioUrl`, `voiced`, `order`
- `PronunciationAttempt` — records user recording attempts with AI scoring (already working)
- **No** example-words table, **no** per-sound progress tracking, **no** tips/phonetic-guidance fields

### Backend (`backend-core/src/modules/pronunciation/`)
- `GET /pronunciation/sounds` — returns all sounds grouped by type (cached)
- `GET /pronunciation/sounds/:symbol` — returns single sound
- CRUD admin endpoints for sounds
- **No** progress endpoints, **no** example-word endpoints

### Seed Data (`prisma/data/pronunciation.ts`)
- 44 sounds (12 monophthongs, 8 diphthongs, 24 consonants) — symbols + example word only
- **No** descriptions, audio URLs, mouth diagrams, or example word lists

### Frontend
- `PronunciationContent.tsx` — IPA chart grid (shared between `/pronunciation` and `/ielts/pronunciation`)
- `/ielts/pronunciation/sounds/[symbol]/page.tsx` — detail page with mock data fallback, uses `PronunciationRecorder`
- `PronunciationRecorder.tsx` — mic recording → backend AI scoring → poll result → show score
- Frontend `data.ts` duplicates the same 44 sounds as the seed file (hardcoded)

---

## Design Inspiration (Research)

| App | Key Takeaway for Our Design |
|:---|:---|
| **LearnEnglish Sounds Right** (British Council) | Clean phonemic chart as the hub; tap → hear sound + see example words |
| **ELSA Speak** | Per-phoneme AI feedback, progress pentagon chart, daily streaks |
| **Sounds (Macmillan)** | Interactive chart → drills → games; toggleable British/American |
| **Say It** | Visual waveform + IPA + syllable blocks shown simultaneously |
| **BoldVoice** | Video coaching per sound; score-per-phoneme breakdown |

### Core Features We Will Implement
1. **Rich Sound Detail Page** — description, mouth-position tip, audio playback, 5+ example words with audio
2. **Practice Recording** — per-word recording with AI feedback (already exists, needs better integration)
3. **Per-Sound Progress Tracking** — mastery status per sound per user (new, practicing, mastered)
4. **IPA Chart Progress Overlay** — chart shows mastery state (color-coded: gray/yellow/green)
5. **Overall Pronunciation Dashboard** — summary stats: sounds mastered, practice streak, weak sounds

---

## Phase Breakdown

| Phase | Scope | Deliverables |
|:---|:---|:---|
| **Phase 1** | Database Schema & Seed Data | Prisma migration, enriched seed file with 44 sounds + example words + descriptions |
| **Phase 2** | Backend API | Progress endpoints, example-words endpoint, seed runner |
| **Phase 3** | Frontend — IPA Chart Redesign | Progress overlay on chart, fetch from API instead of hardcoded data |
| **Phase 4** | Frontend — Sound Detail Page | Rich layout with audio, tips, example words, integrated recorder |
| **Phase 5** | Frontend — Progress Dashboard & Polish | Stats summary, mastery indicators, animations |

---

## Architecture Principles

- **SRP**: Sound data fetching in hooks, UI in components, business logic in utils
- **DIP**: All API calls through `pronunciationApi` service abstraction
- **OCP**: Sound detail page uses composable section components (expandable for future quiz modes)
- **ISP**: Chart component receives only `{ symbol, type, word, mastery }`, not full sound objects
- **No hardcoded data on frontend**: IPA chart reads from API (cached), seed file is the source of truth

---

## File Map (Expected Final State)

```
backend-core/
  prisma/
    schema.prisma              # Updated: PronunciationSound + SoundExampleWord + PronunciationProgress
    data/pronunciation.ts      # Enriched: 44 sounds with descriptions, tips, example words
    seeders/pronunciation.seed.ts  # New: dedicated seeder
  src/modules/pronunciation/
    pronunciation.service.ts   # Updated: progress CRUD, example words
    pronunciation.controller.ts # Updated: progress endpoints

frontend-web/
  src/
    services/learning.api.ts   # Updated: progress API methods
    types/index.ts             # Updated: new interfaces
    app/ielts/pronunciation/
      page.tsx                 # Updated: fetch from API with progress overlay
      sounds/[symbol]/page.tsx # Redesigned: rich detail page
      _components/
        IpaChart.tsx           # New: extracted chart with progress colors
        SoundDetailContent.tsx # New: main detail layout
        ExampleWordCard.tsx    # New: word + audio + recorder
        ProgressSummary.tsx    # New: mastery dashboard
    app/pronunciation/
      PronunciationContent.tsx # Updated: uses IpaChart component
      data.ts                  # Deprecated: replaced by API
```
