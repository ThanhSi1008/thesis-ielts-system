# IELTS Statistics Page — Requirements & Suggestions

> Rebuild the Statistics page from scratch with per-module analytics across **Foundation**, **IELTS Basic**, **IELTS Advanced**, and **IELTS Intensive**.

---

## Current State Analysis

Your existing `StatisticsContent.tsx` is **938 lines** in a single component — it violates SRP heavily. It mixes data fetching, chart rendering, history tables, and profile display. The rebuild should decompose this into focused sub-components.

### Existing Data Sources (from Prisma schema)

| Module | Models | Key Data |
|:---|:---|:---|
| **Foundation** | `IeltsSkill`, `IeltsLesson`, `IeltsBasicProgress` (with `lessonId`) | Lesson completion (boolean) |
| **Foundation — Vocabulary** | External vocab system (Decks, Flashcards, FSRS) | Cards reviewed, retention rate, due cards |
| **Foundation — Grammar** | `IeltsLesson` (skill=Grammar) + `IeltsBasicProgress` | Lessons completed |
| **Foundation — Pronunciation** | `UsageRecord` (feature=`PRONUNCIATION_ATTEMPT`) | Attempts count per period |
| **IELTS Basic** | `IeltsLesson`, `IeltsListeningExercise`, `IeltsReadingExercise`, `IeltsWritingExercise`, `IeltsBasicProgress` | Per-lesson/exercise completion, writing answers |
| **IELTS Advanced** | `IeltsPracticeListeningPart`, `IeltsPracticeSession`, `IeltsPracticeReadingPart`, `IeltsPracticeReadingSession` | Score per part, `scoreData` breakdown by question type |
| **IELTS Intensive** | Mock test history (via `examsApi.getHistory()`) | Band scores (L/R/W/S), raw scores, time taken |
| **Profile** | `IeltsProfile` | Target band, streak, XP, exam date, daily commitment |

---

## Section 1: Profile & Overview Header

> **What it shows:** Identity, high-level KPIs, exam countdown.

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 1.1 | User avatar, name, "IELTS Candidate" badge | `IeltsProfile → User` |
| 1.2 | **Estimated Overall Band** (avg of latest L/R/W/S) | Computed from mock history |
| 1.3 | **Target Band** (editable) | `IeltsProfile.targetBand` |
| 1.4 | **Band Gap Indicator** — visual showing distance from target | Computed: `targetBand - estimatedBand` |
| 1.5 | **Current Streak** + longest streak | `IeltsProfile.currentStreak`, `longestStreak` |
| 1.6 | **Daily Goal** (mins/day) | `IeltsProfile.dailyCommitmentMins` |
| 1.7 | **Exam Countdown** with inline date editor | `IeltsProfile.examDate` |
| 1.8 | **XP & Level** display | `IeltsProfile.totalXp`, `level` |

### UI Suggestion
- Keep the current header layout — it works well
- Add a **radial progress ring** for "Band Gap" showing how close the user is to their target
- Add a **weekly activity heatmap** (7 boxes, Mon–Sun) showing which days had activity

---

## Section 2: Foundation Analytics

> **What it shows:** Progress across Vocabulary, Grammar, and Pronunciation — the pre-IELTS building blocks.

### 2A. Vocabulary Stats

| # | Requirement | Data Source |
|:--|:---|:---|
| 2A.1 | Total cards created across all decks | `Flashcard.count` |
| 2A.2 | Cards by state: New / Learning / Review / Relearning | `Flashcard.cardState` aggregation |
| 2A.3 | **Retention rate** (% of reviews rated Good or Easy) | `FlashcardReview.rating` (3 or 4 = success) |
| 2A.4 | Daily reviews over last 30 days | `FlashcardReview.reviewedAt` grouped by date |
| 2A.5 | Cards due today | `Flashcard.due <= now()` count |

### 2B. Grammar Stats

| # | Requirement | Data Source |
|:--|:---|:---|
| 2B.1 | Total grammar lessons available vs completed | `IeltsLesson` where skill=Grammar + `IeltsBasicProgress` |
| 2B.2 | **Completion %** progress bar | `completed / total * 100` |
| 2B.3 | Quiz scores (if stored in progress) | `IeltsBasicProgress` or lesson quiz JSON |

### 2C. Pronunciation Stats

| # | Requirement | Data Source |
|:--|:---|:---|
| 2C.1 | Total pronunciation attempts this period | `UsageRecord` where feature=`PRONUNCIATION_ATTEMPT` |
| 2C.2 | Pronunciation lesson completion rate | `IeltsBasicProgress` where skill=Pronunciation |

### UI Suggestion
- **3-column card grid** (Vocabulary | Grammar | Pronunciation)
- Each card shows a donut/ring chart with key metric + supporting numbers below
- Vocabulary card could show a small **"card state" stacked bar** (New=gray, Learning=blue, Review=green, Relearning=red)

---

## Section 3: IELTS Basic Progress

> **What it shows:** Lesson & exercise completion across the structured Basic curriculum.

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 3.1 | Per-skill progress (Listening / Reading / Writing / Speaking) | `IeltsBasicProgress` grouped by skill |
| 3.2 | **Lesson completion rate** per skill | Count of `isCompleted=true` / total lessons |
| 3.3 | **Exercise completion rate** per skill | Count of completed exercises (listening/reading/writing) |
| 3.4 | Total lessons completed vs total available | Aggregate across all skills |
| 3.5 | Last activity timestamp per skill | Max `updatedAt` from `IeltsBasicProgress` per skill |

### UI Suggestion
- **4 horizontal progress bars** (one per skill), each showing `X / Y lessons` with percentage
- Use skill-specific colors: Listening=pink, Reading=blue, Writing=amber, Speaking=purple (matches existing badges)
- A small **"Overall Basic Readiness"** percentage at the top

---

## Section 4: IELTS Advanced Drill-Down

> **What it shows:** Performance on individual practice parts with question-type accuracy.

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 4.1 | Total practice sessions completed (Listening + Reading) | `IeltsPracticeSession.count` + `IeltsPracticeReadingSession.count` |
| 4.2 | **Average accuracy** per skill | `totalScore / totalQuestions` across sessions |
| 4.3 | **Question type breakdown** — accuracy per question type | `scoreData` JSON: `{ "form_completion": { correct, total }, ... }` |
| 4.4 | **Weakest question types** — ranked by lowest accuracy | Aggregate `scoreData` across all sessions |
| 4.5 | Score trend over time (line chart) | Sessions sorted by `createdAt` |
| 4.6 | Per-part breakdown table | Group sessions by `partId` → show avg score |

### UI Suggestion
- **Question Type Heatmap**: A grid where rows are question types (form_completion, multiple_choice, matching_headings, etc.) and columns are recent attempts. Color-code cells green→red by accuracy.
- **"Weak Spots" alert card**: Highlight the 2-3 question types with the lowest accuracy with actionable links to practice more.
- Two side-by-side **radar/spider charts** (Listening question types vs Reading question types)

---

## Section 5: IELTS Intensive (Mock Tests) Analytics

> **What it shows:** Full mock test performance — band scores, trends, skill breakdown.

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 5.1 | **Band Score Trend Charts** (one per skill: L/R/W/S) | Mock history filtered by skill, converted to band |
| 5.2 | **Overall band trend** (average of 4 skills per test date) | Computed from aligned mock attempts |
| 5.3 | **Practice Submissions Over Time** (line chart, monthly) | Mock history grouped by month |
| 5.4 | **Submission Volume by Skill** (donut + difficulty bars) | Mock history grouped by skill + difficulty |
| 5.5 | **Best / worst skill** indicator | Compare latest band across L/R/W/S |
| 5.6 | **Time management** — avg time per test, trend | `timeTaken` field from mock history |
| 5.7 | **Score distribution** — histogram of band scores | All historical band scores bucketed |

### UI Suggestion
- Keep the existing **BandScoreChart** component — it's well-built
- Add a **"Skill Radar"** spider chart showing latest L/R/W/S bands vs target band overlay
- Add a **"Score Distribution"** mini histogram (bands 1-9 on x-axis, count on y-axis)

---

## Section 6: Cross-Module Insights

> **What it shows:** Holistic learning analytics that connect the dots between modules.

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 6.1 | **Study Time Heatmap** (GitHub-style, last 12 weeks) | All activity timestamps across modules |
| 6.2 | **Module Balance** — pie chart showing time/activity distribution | Count activities per module |
| 6.3 | **Recent Activity Feed** (last 10 items across all modules) | Merge all history sources, sort by date |
| 6.4 | **Achievement Showcase** — recent unlocked achievements | `UserAchievement` with latest `earnedAt` |
| 6.5 | **Recommendations** — "You haven't practiced Writing in 5 days" | Computed from last activity per skill |

### UI Suggestion
- The **heatmap** should be the visual centerpiece — similar to GitHub contributions
- Recommendations should be **action cards** with CTAs: "Practice Writing Now →"

---

## Proposed Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────┐
│  Profile Header (name, badge, KPIs, exam countdown) │
├─────────────────────────────────────────────────────┤
│  Tab Navigation: [Overview] [Foundation] [Basic]    │
│                  [Advanced] [Intensive]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Overview Tab]                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Estimated │ │  Skill   │ │  Weekly  │            │
│  │   Band    │ │  Radar   │ │ Activity │            │
│  │   Ring    │ │  Chart   │ │ Heatmap  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌─────────────────────────────────────┐            │
│  │   Study Time Heatmap (12 weeks)    │            │
│  └─────────────────────────────────────┘            │
│  ┌─────────────────────────────────────┐            │
│  │     Recent Activity Feed           │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  [Foundation Tab]                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Vocab   │ │ Grammar  │ │ Pronunc. │            │
│  │  Stats   │ │  Stats   │ │  Stats   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  [Basic Tab]                                        │
│  ┌─────────────────────────────────────┐            │
│  │   4× Skill Progress Bars           │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  [Advanced Tab]                                     │
│  ┌──────────┐ ┌──────────────────────┐              │
│  │ Question │ │   Accuracy Trend     │              │
│  │  Type    │ │   (Line Chart)       │              │
│  │ Heatmap  │ │                      │              │
│  └──────────┘ └──────────────────────┘              │
│  ┌─────────────────────────────────────┐            │
│  │   Practice Session History Table   │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  [Intensive Tab]                                    │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Band L   │ │ Band R   │                          │
│  │ Trend    │ │ Trend    │                          │
│  ├──────────┤ ├──────────┤                          │
│  │ Band W   │ │ Band S   │                          │
│  │ Trend    │ │ Trend    │                          │
│  └──────────┘ └──────────┘                          │
│  ┌─────────────────────────────────────┐            │
│  │   Submission Volume + Mock History │            │
│  └─────────────────────────────────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan (Phased)

### Phase 1: Restructure & Profile Header
- [ ] Extract `StatisticsContent` into smaller components following SRP
- [ ] Create `useIeltsStatistics()` hook for data fetching (DIP)
- [ ] Implement tab navigation (Overview / Foundation / Basic / Advanced / Intensive)
- [ ] Rebuild Profile Header section

### Phase 2: Overview Tab
- [ ] Band gap radial ring
- [ ] Skill radar chart (L/R/W/S)
- [ ] Weekly activity heatmap
- [ ] Recent activity feed

### Phase 3: Foundation Tab
- [ ] Vocabulary stats card (card states, retention, reviews/day)
- [ ] Grammar progress card
- [ ] Pronunciation stats card
- [ ] Backend endpoints: `GET /ielts/stats/foundation`

### Phase 4: Basic Tab
- [ ] Per-skill progress bars
- [ ] Overall readiness percentage
- [ ] Backend endpoint: `GET /ielts/stats/basic`

### Phase 5: Advanced Tab
- [ ] Question type accuracy aggregation
- [ ] Weak spots detection
- [ ] Score trend chart
- [ ] Backend endpoint: `GET /ielts/stats/advanced`

### Phase 6: Intensive Tab
- [ ] Migrate existing band score charts
- [ ] Add score distribution histogram
- [ ] Time management analytics
- [ ] Mock test history table

### Phase 7: Cross-Module Insights
- [ ] 12-week study heatmap
- [ ] Module balance chart
- [ ] Smart recommendations engine

---

## Backend API Requirements

| Endpoint | Method | Description |
|:---|:---|:---|
| `GET /ielts/stats/overview` | GET | Aggregated KPIs: estimated band, streak, XP, recent activity |
| `GET /ielts/stats/foundation` | GET | Vocab card states/retention, grammar/pronunciation completion |
| `GET /ielts/stats/basic` | GET | Per-skill lesson/exercise completion rates |
| `GET /ielts/stats/advanced` | GET | Question type accuracy, session history, weak spots |
| `GET /ielts/stats/intensive` | GET | Band trends, submission volume, time analytics |
| `GET /ielts/stats/heatmap` | GET | Daily activity counts for last 90 days |

> [!TIP]
> Consider a single `GET /ielts/stats/all` endpoint that returns everything in one call for the Overview tab, and lazy-load individual tab data on demand.

---

## Design Considerations

- **Dark mode**: All charts must work in both light and dark themes
- **Empty states**: Each section needs a compelling empty state with CTA to start practicing
- **Loading skeletons**: Show placeholder animations while data loads per-tab
- **Responsive**: Cards should stack on mobile, grid on desktop
- **Animations**: Use `animate-in` classes for entrance animations on tab switch
- **Color system**: Maintain existing skill colors (L=pink, R=blue, W=amber, S=purple)
