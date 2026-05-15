# IELTS Statistics: Master Implementation Plan

This document outlines a phased, step-by-step implementation plan for the revamped IELTS Statistics page. It is designed to be executed by an AI agent sequentially. Ensure each phase is fully working, typed, and tested before moving to the next.

## Phase 1: Architecture & Data Layer Foundation
**Goal:** Set up the backend endpoints, data aggregation logic, and frontend API hooks so the UI components have clean data to consume.

1. **Backend Route Setup:** Create a new controller `IeltsStatisticsController` in the NestJS backend with 5 specific endpoints:
   - `GET /ielts-statistics/overview`
   - `GET /ielts-statistics/foundation`
   - `GET /ielts-statistics/basic`
   - `GET /ielts-statistics/advanced`
   - `GET /ielts-statistics/intensive`
2. **DTO & Types:** Define strict TypeScript interfaces for the responses of these 5 endpoints in the shared `types/index.ts` file.
3. **Data Aggregation Services:** Implement the aggregation logic in `IeltsStatisticsService` using Prisma to query the exact models specified in the requirements (e.g., `FoundationVocabProgress`, `IeltsAdvancedWritingSession`, etc.). **Crucial:** Ensure only IELTS-related data is queried.
4. **Frontend API Client:** Add a `statisticsApi.ts` service in the frontend to call these endpoints.
5. **Base Layout & Routing:** Refactor `StatisticsContent.tsx` to use a modern Tab Bar navigation system (Overview, Foundation, Basic, Advanced, Intensive). Render empty placeholder components for each tab.

---

## Phase 2: Overview Tab (The Glassmorphic Dashboard)
**Goal:** Implement the high-level dashboard with premium visual aesthetics.

1. **Hero Section:** Build the glassmorphic container with a dark/light mode compatible blurred background.
2. **Band Gap Radial Ring:** Implement an animated, glowing SVG circle progress indicator. Map the user's `targetBand` vs `estimatedBand`. Add the red-to-green transition logic based on proximity to the target.
3. **Exam Countdown:** Build the countdown timer and readiness score display.
4. **Activity Heatmap:** Build the 7-day pill-shaped grid. Map the activity intensity to a color scale opacity. Implement the floating glass tooltip for hover states.
5. **Activity Feed:** Create a vertical, chronological timeline component for the latest completed lessons/mocks.

---

## Phase 3: Foundation Tab (3D Liquid Cards)
**Goal:** Implement the interactive, 3D flipping cards for Foundation progress.

1. **Grid Layout:** Create a responsive CSS grid for the Vocab, Grammar, and Pronunciation cards.
2. **Liquid Progress Animations:** Implement an SVG wave or liquid fill animation component.
3. **Card Fronts:** Map `wordsLearned`, `unitsCompleted`, and `soundsMastered` data to the liquid progress components inside the cards.
4. **Flip Interaction:** Add CSS 3D transforms (`preserve-3d`, `backface-visibility`) to the cards. Trigger the flip on hover or click.
5. **Card Backs:** Render detailed metrics on the back of the cards (e.g., weakest grammar rules, most mispronounced sounds, combined average quiz score).

---

## Phase 4: Basic Tab (Neon Expandable Bars)
**Goal:** Build the sleek curriculum progress trackers.

1. **Progress Bars:** Create the four thick horizontal bars for L/R/W/S using specific brand colors (Pink, Blue, Amber, Purple). Add a continuous CSS shimmer animation to the filled portion.
2. **Readiness Badge:** Implement the metallic-styled overall readiness badge that visually upgrades (Bronze -> Silver -> Gold) based on aggregate progress.
3. **Accordion State Logic:** Implement the state management to allow only one skill bar to expand at a time.
4. **Micro-Timelines:** Inside the expanded accordion, build a cascading slide-in timeline of the user's most recently completed lessons for that specific skill.

---

## Phase 5: Advanced Tab (Diagnostic Radar)
**Goal:** Implement the high-tech analytical radar and weak spot alerts.

1. **Radar Spider Chart:** Integrate a charting library (like Recharts or Chart.js) to build a polygon radar chart overlaying Listening vs Reading question-type accuracy. Add center-out load animations.
2. **Score Trend Area Chart:** Build the smooth bezier-curved area chart for the last 10 sessions. Implement the soft vertical gradient fill and magnetic hover tooltips.
3. **Weak Spot Alerts:** Create premium warning cards (pulsating red/amber border animations) highlighting the bottom 3 question types. Add the glowing "Practice This Now" CTA button.
4. **AI Feedback Summaries:** Build clean, readable list views for the aggregated Writing penalties and Speaking fluency issues.

---

## Phase 6: Intensive Tab (Cinematic Analytics)
**Goal:** Implement the dark-themed mock test analytics console.

1. **Master Trend Chart:** Build the primary multi-line chart for overall and individual band scores. Ensure the tooltips snap to points smoothly and show exact breakdowns.
2. **3D Score Distribution:** Implement a bar chart using 3D cylinder/box styling to represent the frequency of achieved band scores. Add staggered rising animations on load.
3. **Time Management Gauge:** Build a semi-circular speedometer component. Map the average `timeTaken` to the gauge. Set the color zones (Green = optimal, Amber/Red = too slow) based on standard IELTS time limits.
4. **Best vs Worst Gap:** Implement a visual comparison component highlighting the delta between the user's strongest and weakest skills.

---

## Final Review & Polish
- Ensure all charts and UI components respond correctly to both Light and Dark mode themes.
- Verify that loading skeletons are implemented for all tabs while data fetches.
- Confirm strict SRP (Single Responsibility Principle) is maintained across all new React components.
