# Phase 9: Integration & Cleanup

## Objective
Wire the new normalized system into the existing frontend pages, update the frontend API client, and deprecate the old `Exam` JSON approach for IELTS Intensive.

## Prerequisites
- All previous phases (1-8) completed.

## Tasks

### 9.1 Update Frontend API Client
File: `frontend-web/src/services/exams.api.ts`

Add new methods that call the Phase 3 endpoints:
```typescript
// New methods (don't remove old ones yet):
getIntensiveCatalogV2(skill: string): Promise<IntensiveCatalogResponse>
getIntensiveExam(examId: string, mode: 'take' | 'review', sessionId?: string): Promise<IntensiveExamResponse>
createIntensiveSession(examId: string, practicePart?: number): Promise<{ sessionId: string }>
submitIntensiveSession(sessionId: string, answers: Record<string, string>, timeTaken: number): Promise<SubmitResponse>
getIntensiveSession(sessionId: string): Promise<SessionResponse>
getIntensiveAnalytics(skill: string): Promise<AnalyticsResponse>
```

### 9.2 Update TypeScript Types
File: `frontend-web/src/types/` (or wherever types are defined)

Add types for the normalized response shapes:
```typescript
interface IeltsIntensiveExamDetail {
  exam: { id: string; title: string; skill: string; difficulty: string; durationMinutes: number; imageUrl?: string; metadata?: any };
  parts: IeltsIntensivePart[];
}

interface IeltsIntensivePart {
  id: string;
  partNumber: number;
  partType: string;
  topic?: string;
  audioUrl?: string;
  transcript?: TranscriptEntry[];
  passage?: { passageTitle?: string; passageText: string };
  questionGroups: IeltsIntensiveQuestionGroup[];
}

interface IeltsIntensiveQuestionGroup {
  id: string;
  questionType: string;
  questionRange: string;
  instructions: string;
  optionsBox?: { title: string; options: Record<string, string> };
  tableStructure?: { headers: string[] };
  contentStructure?: any[];
  questions: IeltsIntensiveQuestion[];
}

interface IeltsIntensiveQuestion {
  id: string;
  questionNumber: number;
  questionText?: string;
  answer?: string; // Only in review mode
  options?: Record<string, string>;
  prompt?: string;
  timestampSeconds?: number;
  imageUrl?: string;
}
```

### 9.3 Update Take Page
File: `frontend-web/src/app/ielts/intensive/[examId]/take/page.tsx`

Replace the current monolithic question rendering with:
```tsx
// Based on exam.skill, render the appropriate skill layout:
switch (exam.skill) {
  case 'LISTENING':
    return <ListeningExamLayout exam={exam} ... />;
  case 'READING':
    return <ReadingExamLayout exam={exam} ... />;  // Split screen
  case 'WRITING':
    return <WritingExamLayout exam={exam} ... />;
  case 'SPEAKING':
    return <SpeakingExamLayout exam={exam} ... />;
}
```

Each layout uses the corresponding `QuestionGroupRenderer` from Phases 4-7.

### 9.4 Update Result Page
File: `frontend-web/src/app/ielts/intensive/[examId]/result/page.tsx`

- Fetch session + result from new API
- Render questions in `review` mode (showing answers)
- Display `scoreByType` breakdown chart
- For Writing/Speaking: display AI feedback

### 9.5 Update IntensiveContent (Catalog Page)
File: `frontend-web/src/app/ielts/intensive/IntensiveContent.tsx`

- Switch `examsApi.getIntensiveCatalog()` to `examsApi.getIntensiveCatalogV2()`
- Keep the existing UI structure (skill tabs, search, groups, test cards)

### 9.6 Deprecation (Optional — can be done later)
- Mark old `Exam` records with type LISTENING/READING/WRITING/SPEAKING as `isPublished: false`
- Remove Cambridge IELTS 17 data from `backend-core/prisma/seed.ts` (it now lives in JSON files)
- Archive `_extras/seed.ts` (move to `_extras/archived/`)
- Remove old intensive question rendering code from take/result pages

## Validation
- Full flow works: catalog → select test → take → submit → result
- All 4 skills render with their dedicated components
- Score displays correctly with band conversion
- History shows results from new tables
- Old system still works for any non-migrated exams

## Important Notes
- DO NOT delete old `Exam` data until the new system is fully validated
- Keep old API endpoints working — the new endpoints have different paths (`/ielts-intensive/` vs `/exams/`)
- This is a **parallel run** — both old and new systems coexist until confidence is built
