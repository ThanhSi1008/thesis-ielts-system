# Stage 5 — Frontend Web (Next.js)

> **Location:** `frontend-web/src/`
> **Framework:** Next.js 14 (App Router)
> **Port:** 3001
> **Styling:** Tailwind CSS, primary color `#FFC600`

---

## Page Routes (App Router)

```
src/app/
├── page.tsx                           → /              (Landing/Dashboard)
├── login/page.tsx                     → /login
├── register/page.tsx                  → /register
│
├── ielts/                             → /ielts          (IELTS Hub)
│   ├── layout.tsx                     → Sidebar layout for all /ielts/* pages
│   ├── dashboard/page.tsx             → /ielts/dashboard
│   ├── roadmap/page.tsx               → /ielts/roadmap
│   ├── statistics/page.tsx            → /ielts/statistics
│   ├── history/page.tsx               → /ielts/history
│   ├── calculator/page.tsx            → /ielts/calculator
│   ├── student-teacher/page.tsx       → /ielts/student-teacher
│   │
│   ├── basic/page.tsx                 → /ielts/basic     (Basic IELTS lessons)
│   ├── advanced/page.tsx              → /ielts/advanced
│   ├── intensive/                     → /ielts/intensive  (Practice with real exams)
│   │   ├── IntensiveContent.tsx       → Catalog + session management
│   │   └── [examId]/                  → Individual exam session
│   │       ├── page.tsx               → Exam-taking interface
│   │       └── result/[sessionId]/    → Result review
│   │
│   ├── vocabulary/                    → /ielts/vocabulary (4000 Essential Words)
│   │   └── [bookSlug]/[unitSlug]/     → Unit learning page (split-pane reading)
│   │
│   ├── grammar/                       → /ielts/grammar
│   │   ├── [topicSlug]/               → Topic unit list
│   │   └── [topicSlug]/[lessonSlug]/  → Lesson content
│   │
│   └── pronunciation/                 → /ielts/pronunciation
│       └── sounds/[symbol]/           → Sound detail + practice
│
├── pronunciation/                     → /pronunciation (Foundation module)
│   └── [lessonSlug]/                  → Foundation sound practice
│
├── grammar/page.tsx                   → /grammar (Foundation grammar)
│
├── shadowing-dictation/               → /shadowing-dictation
│   └── [videoId]/                     → Video practice interface
│
├── vocab-lab/                         → /vocab-lab (SRS Flashcards)
│   ├── page.tsx                       → Main page with sidebar tabs
│   └── components/
│       ├── DecksTab.tsx               → Deck management
│       ├── AddCardTab.tsx             → Card creation form
│       ├── BrowseTab.tsx              → Card browser (3-panel layout)
│       ├── StatsTab.tsx               → Analytics dashboard
│       └── browse/                    → Sub-components for browse
│           ├── useBrowseCards.ts       → Business logic hook
│           ├── BrowseFilterSidebar.tsx
│           ├── BrowseCardList.tsx
│           ├── BrowseCardEditor.tsx
│           └── EditorToolbar.tsx
│
└── lessons/                           → /lessons (deprecated, redirects)
```

## API Services (`src/services/`)

| File | Purpose | Key Methods |
|------|---------|-------------|
| `auth.service.ts` | Login, register, token management | `login()`, `register()`, `getMe()` |
| `exams.api.ts` | Exam CRUD, sessions | `getExams()`, `startSession()`, `submitSession()` |
| `learning.api.ts` | Vocabulary, grammar, pronunciation APIs | `getBooks()`, `getUnitDetail()`, `getPronunciationSounds()`, `submitPronunciation()` |
| `lesson.service.ts` | Lesson data fetching | `getLessons()` |
| `notes.api.ts` | Question notes CRUD | `getNotes()`, `createNote()` |
| `shadowing.api.ts` | Shadowing/dictation APIs | `getVideos()`, `getDictationProgress()`, `submitDictation()` |
| `vocabLab.api.ts` | Vocab Lab flashcard APIs | `getDecks()`, `browseCards()`, `submitReview()`, `getStats()` |

### API Client Pattern

```typescript
// src/services/vocabLab.api.ts
import api from '@/config/api';  // axios instance with baseURL + auth interceptor

export const vocabLabApi = {
  getDecks: async () => {
    const { data } = await api.get<DeckWithCounts[]>('/vocab-lab/decks');
    return data;
  },
  // ...
};
```

**Base API config** (`src/config/api.ts`): Axios instance with `baseURL`, automatic token injection, response interceptors.

## Shared Components (`src/components/`)

| Component | Purpose | Used In |
|-----------|---------|---------|
| `Header.tsx` | Global navigation with module links, notification bell, vocab-lab badge | All pages via layout.tsx |
| `Footer.tsx` | Global footer | All pages |
| `ConfirmModal.tsx` | Reusable confirmation dialog | Delete actions |
| `Toaster.tsx` | Toast notification system | Everywhere |
| `Tooltip.tsx` | Hover tooltip | Various buttons |
| `PageHeader.tsx` | Page title + breadcrumb bar | Multiple pages |
| `GlobalAIChatFab.tsx` | Floating AI chat button (bottom-right) | All pages |
| `GlobalVocabFab.tsx` | Floating "Add to Vocab Lab" FAB | Vocabulary pages |
| `AddCardModal.tsx` | Modal for creating flashcards from any page | Triggered by selection |
| `DictionaryPopup.tsx` | Popup dictionary on text selection | Reading pages |
| `FloatingSelectionManager.tsx` | Manages text selection → dictionary/vocab actions | Reading pages |
| `SpeakingTaskBoard.tsx` | IELTS Speaking test UI | Speaking exam pages |
| `WritingTaskBoard.tsx` | IELTS Writing test UI | Writing exam pages |
| `SpeakingResultView.tsx` | AI-graded speaking results | Result pages |
| `WritingResultView.tsx` | AI-graded writing results | Result pages |
| `AnswerField.tsx` | Reusable answer input component | Exam pages |

## State Management

### Zustand Stores (`src/stores/`)

```typescript
// Auth store — manages user session
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

### Auth Hook (`src/hooks/useAuth.ts`)
Wraps zustand store + auto-loads user on mount. Use this in components, not the store directly.

## Types (`src/types/index.ts`)

Key interfaces:
- `Flashcard`, `DeckWithCounts`, `CardType`, `CardTypeField`, `CardTemplate` — Vocab Lab
- `VocabLabStats` — Enhanced stats with 7 sections (cardCounts, reviewActivity, streakData, etc.)
- `VocabularyBook`, `VocabularyUnit`, `VocabularyWord` — 4000 Words
- `GrammarTopic`, `GrammarLesson` — Grammar
- `PronunciationSound`, `PronunciationAttempt` — Pronunciation
- `ShadowingVideo`, `ShadowingSubtitle` — Shadowing
- `Exam`, `ExamSession` — Exams

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#FFC600` | Buttons, accents, active states |
| Primary hover | `#e6b300` | Button hover |
| Background | White / `gray-50` | Page backgrounds |
| Card borders | `gray-100` / `gray-200` | Panel borders |
| Text primary | `gray-900` | Headings, body |
| Text secondary | `gray-500` / `gray-400` | Labels, metadata |
| New state | `#3B82F6` (blue-500) | New cards, new items |
| Learning state | `#EF4444` (red-500) | Learning/active |
| Review state | `#10B981` (green-500) | Mastered/review |
| Destructive | `red-50` + `red-600` | Delete buttons |

## Layout Patterns

### IELTS Module (sidebar layout)
```
┌──────────────────────────────────────────────────┐
│  Header (global nav)                              │
├──────────┬───────────────────────────────────────┤
│  Sidebar │  Main Content                         │
│  (IELTS  │  (page-specific)                      │
│   nav)   │                                        │
│          │                                        │
└──────────┴───────────────────────────────────────┘
```

### Vocab Lab (sidebar tabs)
```
┌──────────────────────────────────────────────────┐
│  Header                                           │
├──────────┬───────────────────────────────────────┤
│  Sidebar │  Decks | Add | Browse | Stats          │
│  (tab    │  (content area changes per tab)         │
│   nav)   │                                        │
└──────────┴───────────────────────────────────────┘
```
