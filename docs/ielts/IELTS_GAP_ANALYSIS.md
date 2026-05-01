# IELTS Gap Analysis — Web vs Mobile

> **Generated:** 2026-05-02  
> **Scope:** Full feature-parity comparison between `frontend-web` and `frontend-mobile` IELTS modules  
> **Method:** Static code analysis — NO code modifications made  

---

## Executive Summary

| Dimension | Web | Mobile |
|---|---|---|
| Total screens / routes | 20+ | 14 |
| Core exam flow | ✅ Full | ✅ Full |
| Statistics depth | ✅ Rich (charts + teacher mode) | ⚠️ Basic (band trend only) |
| Vocabulary module | ✅ Full (books + units) | ❌ Missing |
| Grammar module | ✅ Exists | ❌ Missing |
| Pronunciation (IELTS context) | ✅ Exists | ❌ Missing |
| Student/Teacher mode | ✅ Full | ❌ Missing |
| Advanced statistics (per question type) | ✅ Full | ❌ Missing |
| Custom practice builder | ✅ Full | ❌ Missing |
| History: delete, search, sort | ✅ Full | ⚠️ Partial |
| Intensive: Writing/Speaking | ✅ Full | ❌ Missing |
| History: Practice vs Mock tabs | ✅ Full | ⚠️ Partial |

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
| All 4 skills tabs | ✅ | ⚠️ (Listening + Reading only) | ⚠️ Partial |
| Submission volume analytics | ✅ | ❌ | ❌ Missing |
| Accuracy per question type | ✅ (via Advanced Stats page) | ❌ | ❌ Missing |
| Teacher mode: view student stats | ✅ | ❌ | ❌ Missing |
| Date range filter | ✅ | ❌ | ❌ Missing |

---

### 3. Test History

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Filter by skill (4 skills) | ✅ | ✅ | ✅ Parity |
| Mock test history list | ✅ | ✅ | ✅ Parity |
| Practice history list (per-part) | ✅ | ⚠️ (combined, no part filter) | ⚠️ Partial |
| Search by test name | ✅ | ❌ | ❌ Missing |
| Sort (newest, oldest, score) | ✅ | ❌ | ❌ Missing |
| Part filter pills (Part 1–4) | ✅ | ❌ | ❌ Missing |
| Delete result | ✅ (with confirm modal) | ❌ | ❌ Missing |
| Review result link | ✅ | ✅ | ✅ Parity |
| Writing/Speaking history | ✅ | ❌ | ❌ Missing |

---

### 4. Intensive Mock Tests

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Test catalog (Listening, Reading) | ✅ | ✅ | ✅ Parity |
| Writing / Speaking tests | ✅ | ❌ | ❌ Missing |
| Filter by status (taken/not-taken) | ✅ | ❌ | ❌ Missing |
| Search by book name | ✅ | ❌ | ❌ Missing |
| Group collapse/expand (Cambridge books) | ✅ | ❌ (flat list) | ⚠️ Partial |
| Participants count per test | ✅ | ❌ | ❌ Missing |
| Per-part practice mode | ✅ | ✅ | ✅ Parity |
| Custom practice builder | ✅ (full UI) | ❌ | ❌ Missing |
| Book cover image | ✅ | ❌ | ❌ Missing |

---

### 5. Intensive Exam Player

| Feature | Web | Mobile | Status |
|---|---|---|---|
| Timer with auto-submit | ✅ | ✅ | ✅ Parity |
| MCQ questions | ✅ | ✅ | ✅ Parity |
| Fill-in-blank questions | ✅ | ✅ | ✅ Parity |
| Audio playback (Listening) | ✅ | ✅ | ✅ Parity |
| Reading passage display | ✅ | ✅ | ✅ Parity |
| Writing task input | ✅ | ❌ | ❌ Missing |
| Speaking task | ✅ | ❌ | ❌ Missing |
| Table completion | ✅ | ⚠️ (partial via FillBlock) | ⚠️ Partial |
| Flow chart | ✅ | ⚠️ (partial via FillBlock) | ⚠️ Partial |
| Diagram labelling | ✅ | ❌ | ❌ Missing |
| Map labelling | ✅ | ❌ | ❌ Missing |
| Matching (headings, features, sentence endings) | ✅ | ⚠️ (rendered as MCQ) | ⚠️ Partial |
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
| Question-by-question review | ✅ | ❌ | ❌ Missing |
| Correct/incorrect answer overlay | ✅ | ❌ | ❌ Missing |
| Retake exam | ✅ | ❌ (only navigate back) | ❌ Missing |
| Share result | ✅ | ❌ | ❌ Missing |
| Pending grading state (Writing/Speaking) | ✅ | ✅ | ✅ Parity |

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
| **Advanced Statistics page** | ✅ | ❌ | ❌ Missing |
| Advanced history list | ✅ | ⚠️ (detail only, no list) | ⚠️ Partial |
| Reading result: API bug | N/A | 🐛 Bug | 🐛 Bug |

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
| Role switching (Teacher ↔ Student) | ✅ | ❌ (nav item exists, no screen) | ❌ Missing |
| Student list (Teacher view) | ✅ | ❌ | ❌ Missing |
| Student detail: stats, history | ✅ | ❌ | ❌ Missing |

---

## Prioritized Task Backlog

### 🔴 Critical — Functional Correctness / Core UX

| # | Task | Module | Notes |
|---|---|---|---|
| C1 | **Fix Advanced Reading Result bug** | Advanced / Result | `getReadingHistoryDetail` is called as `getReadingHistory()` (list endpoint). Replace with correct detail API call. |
| C2 | **Add Writing/Speaking support to Intensive exam player** | Intensive / Exam Player | Mobile `renderGroup` only handles MCQ + Fill. Writing and Speaking tasks are invisible to mobile users. |
| C3 | **Add Question-type renderers: Diagram + Map Labelling** | Intensive / Basic Exercise | Add `DiagramBlock` + `MapBlock` to `ContentGroupView` and intensive `renderGroup`. |
| C4 | **Fix Intensive Result: no question-by-question review** | Intensive / Result | Core post-exam feedback loop is broken on mobile. Implement answer review overlay. |
| C5 | **Fix Matching question rendering** | Intensive / Advanced | Currently falls through as generic MCQ. Needs a `MatchingBlock` component with left-column items. |

---

### 🟡 Important — Feature Completeness

| # | Task | Module | Notes |
|---|---|---|---|
| I1 | **History: Search + Sort + Delete** | Test History | Add `TextInput` search bar, sort picker, long-press delete with `Alert` confirmation. |
| I2 | **History: Practice tab with Part filter pills** | Test History | Split Mock and Practice history. Add Part 1–4 filter chips. |
| I3 | **Advanced Statistics screen** | Advanced Practice | New screen consuming `/ielts/advanced/statistics`. Render per-question-type accuracy bars. |
| I4 | **Statistics: All 4 skills + Submission volume** | Statistics | Expand to Writing + Speaking. Add submission count bar chart via `react-native-svg`. |
| I5 | **Intensive: Writing / Speaking catalog + exam player** | Intensive | Add Writing/Speaking skill tabs. Implement `WritingExamBlock` + `SpeakingExamBlock`. |
| I6 | **Intensive: Status filter + search** | Intensive Catalog | Add filter chips (taken/not-taken) and a search bar above test list. |
| I7 | **Intensive: Custom Practice Builder** | Intensive | New screen at `/ielts/intensive/custom`. Skill, exam source, part, time limit, auto-submit toggle. |
| I8 | **Intensive: Group collapse + book cover image** | Intensive Catalog | Group tests by Cambridge book with accordion. Show book cover if available. |
| I9 | **Student / Teacher Mode screen** | Student-Teacher | Implement teacher dashboard: student list → student detail stats. |

---

### 🟢 Nice to Have — Polish & Parity

| # | Task | Module | Notes |
|---|---|---|---|
| N1 | **Vocabulary Module** | Vocabulary | Port book → unit → flashcard flow to mobile. |
| N2 | **Grammar Module (IELTS context)** | Grammar | Integrate IELTS grammar within IELTS sidebar navigation. |
| N3 | **Intensive Result: Retake & Share** | Intensive / Result | Retake button + `expo-sharing` for result export. |
| N4 | **Dashboard: Submission Volume Gauge** | Dashboard | Radial or bar gauge for weekly submission count vs target. |
| N5 | **Dashboard: Teacher Mode summary** | Dashboard | Show student activity summary when role is teacher. |
| N6 | **Intensive: Question Navigator panel** | Intensive / Exam Player | Bottom drawer grid with question numbers; tap to scroll. |
| N7 | **Statistics: Date range filter** | Statistics | Last 7 days / 30 days / All time filter for band trend. |
| N8 | **Advanced History: Full list screen** | Advanced Practice | Dedicated session list grouped by skill before navigating to result detail. |
| N9 | **Pronunciation Module (IELTS context)** | Pronunciation | Integrate IELTS pronunciation exercises within IELTS sidebar. |

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
| `GET /ielts/advanced/statistics` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/advanced/listening-history/:id` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/advanced/reading-history` | ✅ | 🐛 | Bug — list called instead of detail |
| `POST /ielts/advanced/submit-listening/:id` | ✅ | ✅ | ✅ Parity |
| `POST /ielts/advanced/submit-reading/:id` | ✅ | ✅ | ✅ Parity |
| `GET /exams/intensive-catalog/:skill` | ✅ | ✅ | ✅ Parity |
| `GET /exams/practice-catalog/:skill` | ✅ | ✅ | ✅ Parity |
| `GET /exams/history` | ✅ | ✅ | ✅ Parity |
| `DELETE /exams/session/:id` | ✅ | ❌ | ❌ Missing |
| `POST /exams/:examId/start` | ✅ | ✅ | ✅ Parity |
| `POST /exams/session/:id/submit` | ✅ | ✅ | ✅ Parity |
| `GET /ielts/vocabulary/books` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/vocabulary/books/:slug/units` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/grammar` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/student-teacher/students` | ✅ | ❌ | ❌ Missing |
| `GET /ielts/student-teacher/students/:id` | ✅ | ❌ | ❌ Missing |

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

---

## Recommended Implementation Order

```
Phase 1 — Critical Fixes (C1–C5)       → 1 week
Phase 2 — History + Statistics (I1–I4) → 1 week  
Phase 3 — Intensive Expansion (I5–I8)  → 2 weeks
Phase 4 — Student/Teacher (I9)         → 1 week
Phase 5 — Nice to Have (N1–N9)         → ongoing
```

---

*This document is generated from source code analysis. Update after each Sprint to track progress.*
