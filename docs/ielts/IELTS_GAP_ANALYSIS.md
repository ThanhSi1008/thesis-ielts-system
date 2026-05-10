# IELTS Gap Analysis — Web vs Mobile

> **Generated:** 2026-05-02  
> **Last Updated:** 2026-05-02 (Sprint 1–4 complete — All tasks C1–C5, I1–I9 Done)  
> **Scope:** Full feature-parity comparison between `frontend-web` and `frontend-mobile` IELTS modules  
> **Method:** Static code analysis — tracking progress after implementation  

---

## ✅ Sprint Progress Summary

| Sprint | Tasks | Status |
|---|---|---|
| Phase 1 — Critical Fixes | C1, C2, C3, C4, C5 | ✅ All Done |
| Phase 2 — History & Statistics | I1, I2, I3, I4 | ✅ All Done |
| Phase 3 — Intensive Expansion | I5, I6, I7, I8 | ✅ All Done |
| Phase 4 — Student/Teacher | I9 | ✅ Done |
| Phase 5 — Nice to Have | N1–N9 | 🔲 Not started |

---

## Executive Summary

| Dimension | Web | Mobile |
|---|---|---|
| Total screens / routes | 20+ | 20+ |
| Core exam flow | ✅ Full | ✅ Full |
| Statistics depth | ✅ Rich (charts + teacher mode) | ✅ Full (all 4 skills + volume) |
| Student/Teacher mode | ✅ Full | ✅ Full |
| Advanced statistics (per question type) | ✅ Full | ✅ Full |
| Custom practice builder | ✅ Full | ✅ Full |
| History: delete, search, sort | ✅ Full | ✅ Full |
| Intensive: Writing/Speaking | ✅ Full | ✅ Full |
| History: Practice vs Mock tabs | ✅ Full | ✅ Full |
| Vocabulary module | ✅ Full (books + units) | ❌ Missing |
| Grammar module | ✅ Exists | ❌ Missing |
| Pronunciation (IELTS context) | ✅ Exists | ❌ Missing |

---

## Screen Map

### 1. Dashboard

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Profile card (band, streak) | ✅ | ✅ | ✅ Parity |
| Daily streak tracker | ✅ | ✅ | ✅ Parity |
| Recent mock test history | ✅ | ✅ | ✅ Parity |
| Advanced practice quick stats | ✅ | ✅ | ✅ Parity |
| Band trend chart | ✅ (full trend) | ⚠️ (line chart, simplified) | ⚠️ Partial |
| Submission volume gauge | ✅ | ❌ | ❌ Missing |
| Teacher Mode student list | ✅ | ❌ | ❌ Missing |

---

### 2. Statistics

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Band score trend (line chart) | ✅ | ✅ | ✅ Parity |
| All 4 skills tabs | ✅ | ✅ | ✅ Done — I4 |
| Submission volume bar chart | ✅ | ✅ | ✅ Done — I4 |
| Accuracy per question type | ✅ (via Advanced Stats page) | ✅ | ✅ Done — I3 |
| Teacher mode: view student stats | ✅ | ✅ | ✅ Done — I9 |
| Date range filter | ✅ | ❌ | ❌ Missing |

---

### 3. Test History

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Filter by skill (4 skills) | ✅ | ✅ | ✅ Parity |
| Mock test history list | ✅ | ✅ | ✅ Parity |
| Practice history list (per-part) | ✅ | ✅ | ✅ Done — I2 |
| Search by test name | ✅ | ✅ | ✅ Done — I1 |
| Sort (newest, oldest, score) | ✅ | ✅ | ✅ Done — I1 |
| Part filter pills (Part 1–4) | ✅ | ✅ | ✅ Done — I2 |
| Delete result (long-press) | ✅ (with confirm modal) | ✅ | ✅ Done — I1 |
| Review result link | ✅ | ✅ | ✅ Parity |
| Writing/Speaking history | ✅ | ✅ | ✅ Done — I1/I4 |

---

### 4. Intensive Mock Tests

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Test catalog (Listening, Reading) | ✅ | ✅ | ✅ Parity |
| Writing / Speaking tests | ✅ | ✅ | ✅ Done — I5 |
| Filter by status (taken/not-taken) | ✅ | ✅ | ✅ Done — I6 |
| Search by book name | ✅ | ✅ | ✅ Done — I6 |
| Group collapse/expand (Cambridge books) | ✅ | ✅ | ✅ Done — I8 (accordion + animated chevron) |
| Book cover image | ✅ | ✅ | ✅ Done — I8 (image or text fallback) |
| Progress bar per group | ✅ | ✅ | ✅ Done — I8 |
| Participants count per test | ✅ | ✅ | ✅ Done — I8 (stat pills) |
| Per-part practice mode | ✅ | ✅ | ✅ Parity |
| Custom practice builder | ✅ (full UI) | ✅ | ✅ Done — I7 |

---

### 5. Intensive Exam Player

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Timer with auto-submit | ✅ | ✅ | ✅ Parity |
| MCQ questions | ✅ | ✅ | ✅ Parity |
| Fill-in-blank questions | ✅ | ✅ | ✅ Parity |
| Audio playback (Listening) | ✅ | ✅ | ✅ Parity |
| Reading passage display | ✅ | ✅ | ✅ Parity |
| Writing task input | ✅ | ✅ | ✅ Done — I5 (WritingExamBlock + word count bar) |
| Speaking task | ✅ | ✅ | ✅ Done — I5 (SpeakingExamBlock + per-answer word count) |
| Table completion | ✅ | ⚠️ (partial via FillBlock) | ⚠️ Partial |
| Flow chart | ✅ | ⚠️ (partial via FillBlock) | ⚠️ Partial |
| Diagram labelling | ✅ | ✅ | ✅ Done — C3 (DiagramBlock) |
| Map labelling | ✅ | ✅ | ✅ Done — C3 (MapBlock) |
| Matching (headings, features, endings) | ✅ | ✅ | ✅ Done — C5 (MatchingBlock with left-column items) |
| Summary completion WOC | ✅ | ⚠️ (rendered as text input) | ⚠️ Partial |
| Question navigator panel | ✅ | ❌ | ❌ Missing |
| Progress bar during exam | ✅ | ⚠️ (answer count only) | ⚠️ Partial |

---

### 6. Intensive Result

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Band score display | ✅ | ✅ | ✅ Parity |
| Time taken | ✅ | ✅ | ✅ Parity |
| Raw score | ✅ | ✅ | ✅ Parity |
| Question-by-question review | ✅ | ✅ | ✅ Done — C4 |
| Correct/incorrect answer overlay | ✅ | ✅ | ✅ Done — C4 |
| Retake exam | ✅ | ❌ (only navigate back) | ❌ Missing |
| Share result | ✅ | ❌ | ❌ Missing |
| Pending grading state (Writing/Speaking) | ✅ | ✅ | ✅ Parity |
| Band score display for Writing/Speaking | ✅ | ✅ | ✅ Done — I5 (`Band X.X` format) |

---

### 7. Advanced Practice (Skill Drills)

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Part catalog (Listening, Reading) | ✅ | ✅ | ✅ Parity |
| Audio playback | ✅ | ✅ | ✅ Parity |
| Reading passage | ✅ | ✅ | ✅ Parity |
| MCQ rendering | ✅ | ✅ | ✅ Parity |
| Fill rendering | ✅ | ✅ | ✅ Parity |
| Answer counter | ✅ | ✅ | ✅ Parity |
| Result: percentage score | ✅ | ✅ | ✅ Parity |
| Result: question-type breakdown | ✅ | ✅ | ✅ Parity |
| **Advanced Statistics page** | ✅ | ✅ | ✅ Done — I3 (per-question-type accuracy bars) |
| Advanced history list | ✅ | ⚠️ (detail only, no list) | ⚠️ Partial |
| Reading result: API bug | N/A | 🐛 Bug | 🐛 Bug — C1 still pending |

---

### 8. Basic (IELTS Learning Path)

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Roadmap with step progress | ✅ | ✅ | ✅ Parity |
| Lesson viewer (Markdown + quiz) | ✅ | ✅ | ✅ Parity |
| Exercise player (all types) | ✅ | ✅ | ✅ Parity |
| Writing exercises | ✅ | ✅ | ✅ Parity |
| Score calculation | ✅ | ✅ | ✅ Parity |
| Library: per-skill lessons | ✅ | ✅ | ✅ Parity |
| Library: per-skill exercises | ✅ | ✅ | ✅ Parity |
| Onboarding flow | ✅ | ✅ | ✅ Parity |
| Progress mark-completed | ✅ | ✅ | ✅ Parity |
| Next-step navigation | ✅ | ✅ | ✅ Parity |

---

### 9. Vocabulary Module

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Vocabulary book list | ✅ | ❌ | ❌ Missing |
| Book → Unit drill | ✅ | ❌ | ❌ Missing |
| Flashcard-style practice | ✅ | ❌ | ❌ Missing |
| Progress tracking per unit | ✅ | ❌ | ❌ Missing |

---

### 10. Grammar Module

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Grammar lessons list | ✅ | ❌ (routes to general tab) | ❌ Missing in IELTS context |
| Grammar exercises | ✅ | ❌ | ❌ Missing |

---

### 11. Student / Teacher Mode

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Role switching (Teacher ↔ Student) | ✅ | ✅ | ✅ Done — I9 (tab switcher) |
| Student: link teacher by ID | ✅ | ✅ | ✅ Done — I9 |
| Student: unlink teacher | ✅ | ✅ | ✅ Done — I9 (with Alert confirm) |
| Student: linked teacher list | ✅ | ✅ | ✅ Done — I9 |
| Teacher: copy Teacher ID | ✅ | ✅ | ✅ Done — I9 (Clipboard) |
| Teacher: student list | ✅ | ✅ | ✅ Done — I9 |
| Teacher: student detail stats | ✅ | ✅ | ✅ Done — I9 (`[studentId].tsx`) |
| Student detail: band per skill | ✅ | ✅ | ✅ Done — I9 (StatCards) |
| Student detail: question-type accuracy | ✅ | ✅ | ✅ Done — I9 (AccuracyBar) |
| Student detail: session history | ✅ | ✅ | ✅ Done — I9 (skill filter + SessionRow) |

---

## Prioritized Task Backlog

### 🔴 Critical — Functional Correctness / Core UX

| # | Task | Module | Status |
|---|---|---|---|
| C1 | **Fix Advanced Reading Result bug** | Advanced / Result | ✅ Done — `getReadingHistoryDetail(resultId)` đúng endpoint |
| C2 | **Add Writing/Speaking support to Intensive exam player** | Intensive / Exam Player | ✅ Done — `WritingExamBlock` + `SpeakingExamBlock` |
| C3 | **Add Question-type renderers: Diagram + Map Labelling** | Intensive / Basic Exercise | ✅ Done — `DiagramBlock` + `MapBlock` |
| C4 | **Fix Intensive Result: no question-by-question review** | Intensive / Result | ✅ Done — answer review overlay implemented |
| C5 | **Fix Matching question rendering** | Intensive / Advanced | ✅ Done — `MatchingBlock` with left-column items |

---

### 🟡 Important — Feature Completeness

| # | Task | Module | Status |
|---|---|---|---|
| I1 | **History: Search + Sort + Delete** | Test History | ✅ Done — TextInput search, sort picker, long-press delete |
| I2 | **History: Practice tab with Part filter pills** | Test History | ✅ Done — Mock/Practice split, Part 1–4 chips |
| I3 | **Advanced Statistics screen** | Advanced Practice | ✅ Done — `/ielts/advanced/statistics`, per-question-type bars |
| I4 | **Statistics: All 4 skills + Submission volume** | Statistics | ✅ Done — W+S tabs added, bar chart for submission volume |
| I5 | **Intensive: Writing / Speaking catalog + exam player** | Intensive | ✅ Done — skill tabs + `WritingExamBlock` + `SpeakingExamBlock` |
| I6 | **Intensive: Status filter + search** | Intensive Catalog | ✅ Done — taken/not-taken chips + search bar |
| I7 | **Intensive: Custom Practice Builder** | Intensive | ✅ Done — `/ielts/intensive/custom` with all config options |
| I8 | **Intensive: Group collapse + book cover image** | Intensive Catalog | ✅ Done — `AccordionGroup` component, animated chevron, image/fallback |
| I9 | **Student / Teacher Mode screen** | Student-Teacher | ✅ Done — `/ielts/student-teacher/` + `[studentId].tsx` |

---

### 🟢 Nice to Have — Polish & Parity

| # | Task | Module | Status |
|---|---|---|---|
| N1 | **Vocabulary Module** | Vocabulary | 🔲 Not started |
| N2 | **Grammar Module (IELTS context)** | Grammar | 🔲 Not started |
| N3 | **Intensive Result: Retake & Share** | Intensive / Result | 🔲 Not started |
| N4 | **Dashboard: Submission Volume Gauge** | Dashboard | 🔲 Not started |
| N5 | **Dashboard: Teacher Mode summary** | Dashboard | 🔲 Not started |
| N6 | **Intensive: Question Navigator panel** | Intensive / Exam Player | 🔲 Not started |
| N7 | **Statistics: Date range filter** | Statistics | 🔲 Not started |
| N8 | **Advanced History: Full list screen** | Advanced Practice | 🔲 Not started |
| N9 | **Pronunciation Module (IELTS context)** | Pronunciation | 🔲 Not started |

---

## API Coverage

| Endpoint | Web | Mobile | Status |
|---|---|---|---|
| `GET /ielts/profile` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/streak` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/roadmap` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/statistics` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/advanced/listening-parts` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/advanced/reading-parts` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/advanced/statistics` | ✅ | ✅ | ✅ Done — I3 |
| `GET /ielts/advanced/listening-history/:id` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/advanced/reading-history` | ✅ | ✅ | ✅ Done — C1 (`getReadingHistoryDetail` fixed) |
| `POST /ielts/advanced/submit-listening/:id` | ✅ | ✅ | ✅ Parity |
| `POST /ielts/advanced/submit-reading/:id` | ✅ | ✅ | ✅ Parity |
| `GET /exams/intensive/catalog?skill=` | ✅ | ✅ | ✅ Parity |
| `GET /exams/practice-catalog/:skill` | ✅ | ✅ | ✅ Parity |
| `GET /exams/history` | ✅ | ✅ | ✅ Parity |
| `DELETE /exams/session/:id` | ✅ | ✅ | ✅ Done — I1 |
| `POST /exams/:examId/start` | ✅ | ✅ | ✅ Parity |
| `POST /exams/session/:id/submit` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/vocabulary/books` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/vocabulary/books/:slug/units` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/grammar` | ✅ | ❌ | ❌ Missing |
| `GET /users/my-students` | ✅ | ✅ | ✅ Done — I9 |
| `GET /users/my-teachers` | ✅ | ✅ | ✅ Done — I9 |
| `POST /users/link-teacher` | ✅ | ✅ | ✅ Done — I9 |
| `DELETE /users/unlink-teacher/:id` | ✅ | ✅ | ✅ Done — I9 |
| `GET /users/student/:id/stats` | ✅ | ✅ | ✅ Done — I9 |

---

## Shared Logic Status

| Logic | Web | Mobile | Notes |
|---|---|---|---|
| Band score conversion (Listening) | ✅ | ✅ | Identical thresholds |
| Band score conversion (Reading) | ✅ | ✅ | Correct separate thresholds |
| Score calculation (exercises) | ✅ | ✅ | `calcScore()` accurately ported |
| Total questions count | ✅ | ✅ | `getTotalQuestions()` matches web |
| Writing exercise section save | ✅ | ✅ | `POST /ielts/writing-exercises/:id/save-answer` |
| Progress mark-completed | ✅ | ✅ | `POST /ielts/progress/mark-completed` |
| Band score for Writing/Speaking | ✅ | ✅ | Done — `Band X.X` format in catalog + result |

---

## Recommended Implementation Order

```
Phase 1 — Critical Fixes (C1–C5)       → ✅ All Done
Phase 2 — History + Statistics (I1–I4) → ✅ All Done
Phase 3 — Intensive Expansion (I5–I8)  → ✅ All Done
Phase 4 — Student/Teacher (I9)         → ✅ Done
Phase 5 — Nice to Have (N1–N9)         → 🔲 Not started (ongoing)
```

---

*Last updated: 2026-05-02 — Sprint 1–4 fully complete. All C1–C5 and I1–I9 tasks done. Only N1–N9 (nice-to-have) remain.*
