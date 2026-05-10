# Mobile Application Pages

This document lists all the pages (routes) available in the `frontend-mobile` application, organized by module. These routes are based on the Expo Router structure in `frontend-mobile/app`.

## Core & Authentication
- `/app/index.tsx` -> Initial entry point (usually redirects to login or home)
- `/app/(auth)/login.tsx` -> Login Page
- `/app/(auth)/register.tsx` -> Registration Page
- `/app/exams.tsx` -> List of Exams or Exam selector
- `/app/results.tsx` -> General results or scores

## Main Tabs Navigation (`(tabs)`)
These pages are accessible via the bottom tab bar.
- `/app/(tabs)/index.tsx` -> Home Tab / Dashboard
- `/app/(tabs)/grammar.tsx` -> Grammar Hub Tab
- `/app/(tabs)/ielts.tsx` -> IELTS Hub Tab
- `/app/(tabs)/vocablab.tsx` -> Vocab Lab Tab
- `/app/(tabs)/profile.tsx` -> User Profile Tab
- `/app/(tabs)/vocabulary.tsx` -> Vocabulary Tab
- `/app/(tabs)/shadowing.tsx` -> Shadowing Tab
- `/app/(tabs)/notification.tsx` -> Notifications
- `/app/(tabs)/more.tsx` -> More / Settings
- `/app/(tabs)/pronunciation/index.tsx` -> Pronunciation Hub
- `/app/(tabs)/pronunciation/[symbol].tsx` -> Specific sound practice

## Vocab Lab
- `/app/vocab-lab/index.tsx` -> Vocab Lab Dashboard
- `/app/vocab-lab/[deckId].tsx` -> View cards in a specific deck
- `/app/vocab-lab/study/[deckId].tsx` -> Study session for a specific deck

## Shadowing
- `/app/shadowing/index.tsx` -> Shadowing lessons list
- `/app/shadowing/[lessonId]/[mode].tsx` -> Shadowing practice interface

## Grammar
- `/app/grammar/[bookSlug].tsx` -> Book overview
- `/app/grammar/[bookSlug]/[unitId].tsx` -> Specific unit/lesson

## Vocabulary
- `/app/vocabulary/[bookId].tsx` -> Book overview
- `/app/vocabulary/[bookId]/[unitId].tsx` -> Specific unit

## IELTS
- `/app/ielts/dashboard.tsx` -> IELTS Dashboard
- `/app/ielts/statistics.tsx` -> IELTS Statistics
- `/app/ielts/history.tsx` -> Exam History
- `/app/ielts/roadmap.tsx` -> Learning Roadmap
- `/app/ielts/onboarding.tsx` -> Onboarding for IELTS

### IELTS Intensive
- `/app/ielts/intensive/index.tsx` -> List of full tests
- `/app/ielts/intensive/[examId].tsx` -> Exam detail
- `/app/ielts/intensive/custom.tsx` -> Custom test creation
- `/app/ielts/intensive/result/[sessionId].tsx` -> Test result

### IELTS Advanced
- `/app/ielts/advanced/index.tsx` -> Advanced practice hub
- `/app/ielts/advanced/statistics.tsx` -> Advanced statistics
- `/app/ielts/advanced/history/index.tsx` -> Practice history
- `/app/ielts/advanced/[skill]/[partId].tsx` -> Specific part practice
- `/app/ielts/advanced/[skill]/[partId]/history.tsx` -> Part practice history
- `/app/ielts/advanced/[skill]/[partId]/result/[resultId].tsx` -> Result for specific part

### IELTS Basic
- `/app/ielts/basic/lesson/[lessonId].tsx` -> Specific lesson
- `/app/ielts/basic/exercise/[exerciseId].tsx` -> Specific exercise
- `/app/ielts/basic/library/[skill]/lessons.tsx` -> Lessons library
- `/app/ielts/basic/library/[skill]/exercises.tsx` -> Exercises library

### IELTS Grammar, Pronunciation & Student-Teacher
- `/app/ielts/grammar/index.tsx` -> IELTS Grammar hub
- `/app/ielts/grammar/[bookSlug].tsx` -> Book overview
- `/app/ielts/grammar/[bookSlug]/[unitId].tsx` -> Specific unit
- `/app/ielts/pronunciation/index.tsx` -> Pronunciation hub
- `/app/ielts/pronunciation/[symbol].tsx` -> Specific sound
- `/app/ielts/student-teacher/index.tsx` -> Student-Teacher hub
- `/app/ielts/student-teacher/[studentId].tsx` -> Specific student progress

## Student-Teacher (General)
- `/app/student-teacher/index.tsx` -> General hub
- `/app/student-teacher/[studentId].tsx` -> Specific student progress

## Missing Pages (Compared to Web)
The following pages exist on the Web version but are currently missing on Mobile. This list serves as a gap analysis for further development.

### Core & Community
- `/pricing` -> Web: `frontend-web/src/app/pricing/page.tsx` (Pricing Plans)
- `/community` -> Web: `frontend-web/src/app/community/page.tsx` (General Community Hub)

### Vocab Lab
- `/vocab-lab/community` -> Web: `frontend-web/src/app/vocab-lab/community/page.tsx` (Community shared decks)

### Shadowing & Dictation
- **Dictation Module** (Missing entirely):
  - `/shadowing-dictation/dictation` -> Web: `frontend-web/src/app/shadowing-dictation/dictation/page.tsx`
  - `/shadowing-dictation/dictation/[id]` -> Web: `frontend-web/src/app/shadowing-dictation/dictation/[id]/page.tsx`
  - `/shadowing-dictation/dictation/my-videos` -> Web: `frontend-web/src/app/shadowing-dictation/dictation/my-videos/page.tsx`
- **My Videos (Shadowing)**:
  - `/shadowing-dictation/shadowing/my-videos` -> Web: `frontend-web/src/app/shadowing-dictation/shadowing/my-videos/page.tsx`

### IELTS
- `/ielts/calculator` -> Web: `frontend-web/src/app/ielts/calculator/page.tsx` (Score Calculator)
- **IELTS Vocabulary** (Missing entirely as a module within IELTS):
  - `/ielts/vocabulary` -> Web: `frontend-web/src/app/ielts/vocabulary/page.tsx`
  - `/ielts/vocabulary/[bookSlug]` -> Web: `frontend-web/src/app/ielts/vocabulary/[bookSlug]/page.tsx`
  - `/ielts/vocabulary/[bookSlug]/[unitSlug]` -> Web: `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/page.tsx`
- **IELTS Advanced Community**:
  - `/ielts/advanced/speaking/[partId]/community` -> Web: `frontend-web/src/app/ielts/advanced/speaking/[partId]/community/page.tsx`
  - `/ielts/advanced/writing/[promptId]/community` -> Web: `frontend-web/src/app/ielts/advanced/writing/[promptId]/community/page.tsx`

### General English Learning
- **Lessons Module**:
  - `/lessons` -> Web: `frontend-web/src/app/lessons/page.tsx`
  - `/lessons/[id]` -> Web: `frontend-web/src/app/lessons/[id]/page.tsx`

### Payment & Admin
- `/payment/vnpay-return` -> Web: `frontend-web/src/app/payment/vnpay-return/page.tsx` (VNPay Callback)
- `/admin` and all sub-routes -> Web: `frontend-web/src/app/admin/...` (Admin Panel)
