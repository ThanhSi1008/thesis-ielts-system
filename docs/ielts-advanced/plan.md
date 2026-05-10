# IELTS Advanced — Mobile Gap Analysis & Implementation Plan

> **Date:** 2026-05-07  
> **Branch:** `feat/mobile-ielts-v2`  
> **Scope:** `frontend-mobile/` only — no changes to `frontend-web/` or any backend.  
> **Status:** ✅ All phases complete (10/11 features implemented; 1 skipped — backend prerequisite)

---

## Context

The IELTS Advanced module provides targeted, part-by-part practice for all four IELTS skills (Listening, Reading, Writing, Speaking). The web app has a mature, feature-rich implementation. The mobile app covers the happy-path exam flow but was missing several critical review and analysis features that learners rely on to actually improve their scores.

This plan documents every gap, the ordered implementation, and the final delivery state.

---

## 1. Feature Comparison Table

| Feature | Web | Mobile | Status |
|---|---|---|---|
| **Hub Screen** — skill tabs (Listening, Reading, Writing, Speaking) | ✅ Full (4 tabs, Writing/Speaking labelled "coming soon") | ✅ Full (Listening + Reading tabs) | Parity |
| **Hub Screen** — part cards with score badge | ✅ Shows `myScore / totalQuestions` per part | ⏭ Skipped — backend prerequisite | Backend gap |
| **Hub Screen** — filter parts by question type | ✅ `?questionType=` query param filter | ✅ Horizontal chip filter, client-side | ✅ Implemented |
| **Practice Player** — audio playback | ✅ Full custom player: seekbar, skip ±5s, time display | ✅ `RichAudioPlayer` with seekbar, skip ±5s, time display | ✅ Implemented |
| **Practice Player** — MCQ (single answer) | ✅ `MCQuestionItem` component | ✅ Inline MCQ rendering | Parity |
| **Practice Player** — MCQ (multiple answer) | ✅ `MCMultipleQuestionItem` with checkboxes | ✅ `MCMultipleBlock` with checkboxes + selection limit | ✅ Implemented |
| **Practice Player** — form / note completion | ✅ `FormCompletionGroup` with bordered text fields | ✅ `FormCompletionBlock` with bordered card layout | ✅ Implemented |
| **Practice Player** — matching | ✅ `MatchingCompletionGroup` | ✅ `MatchingBlock` component | Parity |
| **Practice Player** — diagram/map labelling | ✅ Standard web inputs | ✅ `DiagramMapBlock` component | Parity |
| **Practice Player** — "Locate in passage/transcript" | ✅ Click question → scroll + highlight in passage or transcript | ✅ Locate icon on each question; collapsible transcript / passage panel | ✅ Implemented |
| **Submit flow** — confirmation alert | ✅ | ✅ | Parity |
| **Post-submit result** — score percentage | ✅ `Score X / Y` box | ✅ Circular percentage display | Parity |
| **Post-submit result** — breakdown by question type | ✅ Table with correct / total / attempted per type | ✅ Progress bars per type | Parity |
| **Post-submit result** — per-question answer review | ✅ Full answer sheet with user vs correct, color-coded | ✅ `AnswerSheet` component, Score + Review tabs | ✅ Implemented |
| **Post-submit result** — transcript with highlighted answers (Listening) | ✅ Transcript panel with question markers, locate + highlight | ✅ `TranscriptReview` with 3-second highlight on locate | ✅ Implemented |
| **Post-submit result** — passage with highlighted answers (Reading) | ✅ Full passage with highlighted location markers | ✅ `PassageReview` with paragraph highlighting on locate | ✅ Implemented |
| **Post-submit result** — audio replay on result page | ✅ Custom audio player on result page | ✅ `RichAudioPlayer` on Review tab | ✅ Implemented |
| **Per-part history** — list of all attempts for a specific part | ✅ `/listening/[partId]/my-answers` page | ✅ `/ielts/advanced/{skill}/{partId}/history` screen | ✅ Implemented |
| **Per-part history** — part-level tab nav (Practice / My Answers) | ✅ Tab bar in each part layout | ✅ Clock icon in part header → history screen | ✅ Implemented |
| **Global history** — all sessions across all parts | ✅ (reached via sidebar) | ✅ `/ielts/advanced/history` screen | Parity |
| **History** — search filter | ✅ (via sidebar page) | ✅ Search bar in history screen | Parity |
| **Statistics screen** — accuracy by question type | ✅ Full bar chart per question type, per skill | ✅ `/ielts/advanced/statistics` screen with skill tabs | ✅ Implemented |
| **Statistics screen** — skill filter tabs | ✅ (Listening active; Reading/Writing/Speaking placeholders) | ✅ Listening/Reading active; Writing/Speaking show coming-soon | ✅ Implemented |
| **Writing Advanced** | 🚧 Coming soon (both platforms) | 🚧 Coming soon | On-par (future) |
| **Speaking Advanced** | 🚧 Coming soon (both platforms) | 🚧 Coming soon | On-par (future) |
| **Community tab** | 🚧 Placeholder only | 🚧 Not planned | On-par (future) |

---

## 2. Gap Analysis

All gaps resolved or documented below.

### GAP-01 · Detailed Per-Question Answer Review ✅ Resolved
`AnswerSheet.tsx` renders a per-question table (user answer vs correct answer, color-coded). Correct answers are extracted client-side from `result.part.content` using `extractCorrectAnswers()`, mirroring backend grading logic. The result screen now has a **Score** tab (existing content + quick-locate chip grid) and a **Review** tab (answer sheet + transcript/passage + audio player).

### GAP-02 · Listening Transcript with Question Highlights on Result Page ✅ Resolved
`TranscriptReview.tsx` renders the transcript with `question_markers` badges. Tapping a question chip in the Score tab switches to the Review tab and calls `setLocatedQuestion(n)`, which triggers `scrollTo` + a 3-second background highlight in `TranscriptReview`. `RichAudioPlayer` is mounted on the Review tab for audio replay.

### GAP-03 · Reading Passage with Highlighted Answers on Result Page ✅ Resolved
`PassageReview.tsx` splits the passage by double-newline paragraphs, renders `passageWithLocations` badges per paragraph, and scroll-highlights the relevant paragraph on locate. Wired to the same `locatedQuestion` state as the answer sheet.

### GAP-04 · Rich Audio Player in Practice Screen ✅ Resolved
`RichAudioPlayer.tsx` replaces the old play/pause banner. Uses `useAudioPlayer` + `useAudioPlayerStatus` from `expo-audio` and `@react-native-community/slider` (already installed). Controls: play/pause, skip ±5 s, seekbar, `mm:ss / mm:ss` display.

### GAP-05 · Statistics Screen ✅ Resolved
`app/ielts/advanced/statistics.tsx` calls `ieltsAdvancedApi.getStatistics()` (previously defined but never called). Shows an overall accuracy circle, sorted per-type breakdown bars, and skill tabs. Writing/Speaking tabs display a graceful coming-soon state. Accessible via the chart icon in the hub header.

### GAP-06 · Per-Part My-Answers History ✅ Resolved
`app/ielts/advanced/[skill]/[partId]/history.tsx` fetches sessions filtered by `partId` (new `getListeningHistoryByPart` / `getReadingHistoryByPart` API methods). Accessible via the clock icon added to the part screen header. Each session card shows date, score badge, and navigates to the result screen.

### GAP-07 · Multiple-Answer MCQ Question Type ✅ Resolved
`MCMultipleBlock.tsx` renders checkbox options, enforces the `numRequired` selection limit, shows a progress indicator (`x / n selected`), and stores answers under `answers['mcm-{groupIdx}']` (matching backend key format exactly).

### GAP-08 · FormCompletionGroup Layout ✅ Resolved
`FormCompletionBlock.tsx` renders `form_completion`, `note_completion`, and `flowchart_completion` groups with a bordered card, type badge, optional heading, and a row-per-question layout (Q-number badge + label + underlined `TextInput`). Section-header rows (no `question_number`) are rendered as bold dividers.

### GAP-09 · Hub Score Badge per Part ⏭ Skipped — Backend Prerequisite
The `GET /ielts/advanced/listening` and `/reading` listing endpoints only `select` `id`, `title`, `partNumber`, `questionTypes`, `createdAt`. No per-part score summary is returned. Implementing this requires the backend to JOIN or aggregate the last session score per part. No frontend-only workaround is feasible without extra API calls per card, which would be a performance regression. This feature is documented here for the next backend sprint.

### GAP-10 · Locate-in-Passage/Transcript in Practice Screen ✅ Resolved
Each `MCQBlock` and `FillBlock` in the practice screen now has a `⊙` locate icon. Tapping it calls `handleLocate(qNum)`, which:
- Sets `locatedQuestion` state (with a 30 ms reset to re-trigger the child effect)
- For listening: auto-expands the collapsible transcript panel and passes `locatedQuestion` to `TranscriptReview`
- For reading: passes `locatedQuestion` to `PassageReview` (the passage panel is always visible)

### GAP-11 · Question Type Filter on Hub ✅ Resolved
A horizontal chip row appears below the skill tabs. Available types are derived from the already-loaded parts (client-side — instant, no extra API call). "All" clears the filter. Tapping a type chip on any part card also sets the filter. An active-filter badge with a dismiss button appears in the list when a filter is active.

---

## 3. Implementation Plan (Priority Order)

### Phase 1 — Critical (Blocks core learning loop)

| # | Feature | Complexity |
|---|---|---|
| 1 | ✅ Per-question answer review on Result screen | Medium |
| 2 | ✅ Listening transcript + audio replay on Result screen | High |
| 3 | ✅ Reading passage display on Result screen | Medium |
| 4 | ✅ Rich audio player in Practice screen | Medium |

### Phase 2 — High Impact

| # | Feature | Complexity |
|---|---|---|
| 5 | ✅ Statistics screen | Medium |
| 6 | ✅ Multiple-answer MCQ question type | Low |
| 7 | ✅ FormCompletionGroup layout | Low |

### Phase 3 — Polish & Completeness

| # | Feature | Complexity |
|---|---|---|
| 8 | ✅ Per-part My-Answers history tab | Medium |
| 9 | ⏭ Hub score badge per part — **skipped: backend prerequisite** (listing endpoint does not return score data) | Low |
| 10 | ✅ Locate-in-passage/transcript in practice screen | Medium |
| 11 | ✅ Question type filter on hub | Low |

---

## 4. Files Delivered

### New utilities
| File | Purpose |
|---|---|
| `utils/answerNormalization.ts` | `normalizeAnswer()`, `isCorrect()` — case-insensitive, punctuation-stripped, optional-parenthesis, slash-alternative answer matching |
| `constants/ieltsQuestionTypes.ts` | `QUESTION_TYPE_LABELS` map + `getQuestionTypeLabel()` helper |

### New components
| File | Purpose |
|---|---|
| `components/ielts/RichAudioPlayer.tsx` | Full audio player: play/pause, skip ±5 s, seekbar, `mm:ss / mm:ss` display |
| `components/ielts/AnswerSheet.tsx` | Per-question answer review table with green/red color coding |
| `components/ielts/TranscriptReview.tsx` | Scrollable transcript with `question_markers` badges and locate-scroll + 3 s highlight |
| `components/ielts/PassageReview.tsx` | Passage split by paragraph with `passageWithLocations` badges and locate-scroll + 3 s highlight |
| `components/ielts/MCMultipleBlock.tsx` | Checkbox multi-answer MCQ with selection-limit enforcement |
| `components/ielts/FormCompletionBlock.tsx` | Bordered form/note/flowchart completion card layout |

### New screens
| File | Route |
|---|---|
| `app/ielts/advanced/statistics.tsx` | `/ielts/advanced/statistics` |
| `app/ielts/advanced/[skill]/[partId]/history.tsx` | `/ielts/advanced/{skill}/{partId}/history` |

### Modified screens & services
| File | Changes |
|---|---|
| `app/ielts/advanced/[skill]/[partId]/result/[resultId].tsx` | Full rewrite: Score + Review tabs, `AnswerSheet`, `TranscriptReview` / `PassageReview`, `RichAudioPlayer`, locate-from-score-tab |
| `app/ielts/advanced/[skill]/[partId].tsx` | `RichAudioPlayer`, `MCMultipleBlock`, `FormCompletionBlock`, locate buttons on questions, collapsible transcript, `PassageReview` for reading, "My Answers" clock icon in header |
| `app/ielts/advanced/index.tsx` | Statistics icon in header, horizontal question-type chip filter, active-filter badge, chip tap on part card sets filter |
| `services/ielts.api.ts` | `getListeningParts(questionType?)`, `getReadingParts(questionType?)`, `getListeningHistoryByPart(partId)`, `getReadingHistoryByPart(partId)` |

---

## 5. API Coverage (Final)

| Endpoint | Backend | Web | Mobile |
|---|---|---|---|
| `GET /ielts/advanced/listening` | ✅ | ✅ | ✅ (supports `?questionType=`) |
| `GET /ielts/advanced/listening/:id` | ✅ | ✅ | ✅ |
| `POST /ielts/advanced/listening/:id/submit` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/history` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/history?partId=` | ✅ | ✅ | ✅ (`getListeningHistoryByPart`) |
| `GET /ielts/advanced/history/:id` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/reading` | ✅ | ✅ | ✅ (supports `?questionType=`) |
| `GET /ielts/advanced/reading/:id` | ✅ | ✅ | ✅ |
| `POST /ielts/advanced/reading/:id/submit` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/reading/history` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/reading/history?partId=` | ✅ | ✅ | ✅ (`getReadingHistoryByPart`) |
| `GET /ielts/advanced/reading/history/:id` | ✅ | ✅ | ✅ |
| `GET /ielts/advanced/statistics` | ✅ | ✅ | ✅ (statistics screen) |

**No new backend endpoints were required.** All data was available through existing API routes.

---

## 6. Verification Checklist

### Phase 1
- [ ] Submit a Listening practice part → result screen shows per-question table: user answer vs correct answer, green/red coded
- [ ] Listening result screen shows the transcript; tapping a question chip scrolls to its marker in the transcript and highlights it for 3 seconds
- [ ] Listening result screen has audio player that can seek and replay the clip
- [ ] Submit a Reading practice part → result screen shows full passage; tapping a question chip scrolls to its location in the passage
- [ ] Edge cases: unanswered questions show `—`; slash-separated alternative answers grade as correct

### Phase 2
- [ ] Statistics screen reachable from hub → shows overall accuracy circle + breakdown bars for Listening
- [ ] Writing/Speaking tabs on statistics screen show coming-soon state
- [ ] `multiple_choice_multiple` questions render checkboxes; selecting A and C stores `"A,C"`; unchosen options are disabled once limit is reached
- [ ] `form_completion` groups render with bordered card, Q-number badges, and underlined inputs

### Phase 3
- [ ] Inside a practice part screen, tapping the clock icon navigates to the per-part history list for that part
- [ ] Per-part history list shows session date, score badge, and "View Details" link
- [ ] Tapping a locate icon (⊙) on a question during practice: for listening, expands transcript and scrolls to the question's marker; for reading, scrolls the passage panel to the relevant paragraph
- [ ] Hub shows question-type chip filter row; selecting a chip filters the part list instantly; tapping a type chip on a part card also sets the filter
- [ ] "All" chip and the active-filter dismiss button both clear the filter

### Skipped
- ⏭ Hub score badge per part: requires backend to include last-session score in the part listing response. No frontend action until backend sprint delivers this.
