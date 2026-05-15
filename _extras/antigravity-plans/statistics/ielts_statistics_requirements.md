# IELTS Statistics Page — Requirements & Suggestions

> Rebuild the Statistics page from scratch with per-module analytics across **Foundation**, **IELTS Basic**, **IELTS Advanced**, and **IELTS Intensive**.

---

## Current State Analysis

Your existing `StatisticsContent.tsx` is **938 lines** in a single component — it violates SRP heavily. It mixes data fetching, chart rendering, history tables, and profile display. The rebuild should decompose this into focused sub-components.

### Existing Data Sources (from Prisma schema)

| Module | Models | Key Data |
|:---|:---|:---|
| **Foundation — Vocabulary** | `FoundationVocabBook`, `FoundationVocabUnit`, `FoundationVocabItem`, `FoundationVocabProgress` | Words learned, exercise scores, unit completion |
| **Foundation — Grammar** | `FoundationGrammarBook`, `FoundationGrammarUnit`, `FoundationGrammarProgress` | Grammar units completed, exercise scores |
| **Foundation — Pronunciation** | `FoundationPronunciationSound`, `FoundationPronunciationProgress` | Sounds mastered, practice count, best scores |
| **IELTS Basic** | `IeltsBasicSkill`, `IeltsBasicLesson`, `IeltsBasicProgress` | Per-lesson/exercise completion |
| **IELTS Advanced** | `IeltsAdvancedListeningPart`, `IeltsAdvancedReadingPart`, `IeltsAdvancedWritingSession`, `IeltsAdvancedSpeakingSession` | Score per part, band score, AI feedback |
| **IELTS Intensive** | `Exam`, `ExamSession` (Mock tests via `examsApi`) | Band scores (L/R/W/S), raw scores, time taken |
| **Profile** | `IeltsProfile` (Strictly IELTS-related data only) | Target band, streak, exam date, daily commitment |

---

## Section 1: Profile & Overview Header

> **What it shows:** Identity, high-level IELTS KPIs, exam countdown. (Strictly excludes non-IELTS activities like general Vocab Lab or Dictation)

### Requirements

| # | Requirement | Data Source |
|:--|:---|:---|
| 1.1 | User avatar, name, "IELTS Candidate" badge | `IeltsProfile → User` |
| 1.2 | **Estimated Overall Band** (avg of latest L/R/W/S) | Computed from mock history |
| 1.3 | **Target Band** (editable) | `IeltsProfile.targetBand` |
| 1.4 | **Band Gap Indicator** — visual showing distance from target | Computed: `targetBand - estimatedBand` |
| 1.5 | **Daily Goal** (mins/day) | `IeltsProfile.dailyCommitmentMins` |
| 1.6 | **Exam Countdown** with inline date editor | `IeltsProfile.examDate` |

### UI Suggestion
- Keep the current header layout — it works well
- Add a **radial progress ring** for "Band Gap" showing how close the user is to their target
- Add a **weekly activity heatmap** (7 boxes, Mon–Sun) showing which days had **IELTS-related** activity

---

## Sub-Module Requirements

The detailed requirements and UI concepts for each of the 5 statistics tabs have been moved to dedicated files in the `tabs/` folder. Each tab contains exactly **5 core requirements** and a **Revamped Premium UI Concept**:

1. **[Overview Tab](tabs/01-overview.md)** - High-level KPIs, Band Gap, and Heatmap.
2. **[Foundation Tab](tabs/02-foundation.md)** - Vocabulary, Grammar, and Pronunciation mastery.
3. **[Basic Tab](tabs/03-basic.md)** - Curriculum completion across L/R/W/S.
4. **[Advanced Tab](tabs/04-advanced.md)** - Question type accuracy, AI feedback, and weak spots.
5. **[Intensive Tab](tabs/05-intensive.md)** - Full mock test trends, score distribution, and time management.

---

## Proposed Layout (Top to Bottom)

```text
┌─────────────────────────────────────────────────────┐
│  Glassmorphic Profile Hero (Estimated Band, Gap)    │
├─────────────────────────────────────────────────────┤
│  Tab Navigation: [Overview] [Foundation] [Basic]    │
│                  [Advanced] [Intensive]             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [ Selected Tab Content renders here with fluid   ] │
│  [ entrance animations and dynamic charts         ] │
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
