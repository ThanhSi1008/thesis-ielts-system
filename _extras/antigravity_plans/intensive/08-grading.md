# Phase 8: Grading Integration & Analytics

## Objective
Update the grading system to use normalized tables and add per-question-type analytics.

## Prerequisites
- Phases 1-3 (schema, seed, API) completed.
- Frontend components (Phases 4-7) at least partially working.

## Tasks

### 8.1 Update Listening/Reading Grading
The grading logic in Phase 3 API already reads from normalized `IeltsIntensiveQuestion` table. Ensure:
- Multi-answer questions (MCQ multi) are graded correctly — each correct letter = 1 point
- "IN EITHER ORDER" answers work (already handled by `gradingNote`)
- Case-insensitive matching for text answers
- Alternate answers handled: "floor" / "floors", "19 / nineteen"
- `scoreByType` is computed per `questionType` slug and stored in `IeltsIntensiveResult.scoreByType`

### 8.2 Update Writing/Speaking AI Grading
- The existing AI grading flow uses RabbitMQ (`AiClientService.publishGradingTask`)
- Add a new queue/consumer for the normalized tables, or reuse the existing one with a new `source: "intensive"` flag
- The callback endpoint updates `IeltsIntensiveResult` instead of `Result`
- Store AI feedback JSON in `IeltsIntensiveResult.feedback`

### 8.3 Per-Question-Type Analytics API
New endpoint: `GET /ielts-intensive/analytics`
```typescript
// Response:
{
  skill: "LISTENING",
  totalSessions: 12,
  averageBand: 6.5,
  typeBreakdown: [
    { type: "note_completion", totalQuestions: 48, correctAnswers: 35, accuracy: 0.729 },
    { type: "mcq_single", totalQuestions: 24, correctAnswers: 20, accuracy: 0.833 },
    { type: "matching", totalQuestions: 18, correctAnswers: 10, accuracy: 0.556 },
    ...
  ],
  weakestTypes: ["matching", "table_completion"],
  strongestTypes: ["mcq_single", "note_completion"]
}
```

### 8.4 Score-to-Band Conversion
Use the official IELTS band score conversion:
```typescript
// Listening band (out of 40)
function listeningBand(score: number): number { ... }

// Reading band (out of 40) — slightly different scale from Listening
function readingBand(score: number): number { ... }
```
These already exist in `IntensiveContent.tsx` (lines 21-37 and 182-199). Port them to the backend service.

## Validation
- Listening/Reading: submitting a test gives correct total score
- `scoreByType` shows per-type breakdown in the result
- Analytics endpoint returns meaningful data after a few test completions
- Writing/Speaking: AI grading callback updates the correct result table
