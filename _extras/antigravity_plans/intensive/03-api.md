# Phase 3: Backend API Endpoints

## Objective
Create a new NestJS module `ielts-intensive` with endpoints that serve data from the normalized tables (Phase 1). The old `exams` module remains untouched.

## Prerequisites
- Phase 1 (schema) and Phase 2 (seed) completed.

## Context
- Existing exams module: `backend-core/src/modules/exams/` — DO NOT modify.
- New module location: `backend-core/src/modules/ielts-intensive/`
- Auth guard already exists at `backend-core/src/common/guards/jwt-auth.guard.ts`

## Files to Create

```
backend-core/src/modules/ielts-intensive/
├── ielts-intensive.module.ts
├── ielts-intensive.controller.ts
├── ielts-intensive.service.ts
└── dto/
    └── ielts-intensive.dto.ts
```

## Endpoints

### 1. `GET /ielts-intensive/catalog?skill=LISTENING`
Returns exam groups (by Cambridge book) for the selected skill.
```typescript
// Response shape (same structure as existing getIntensiveCatalog but reading from new tables):
{
  skill: "LISTENING",
  groups: [
    {
      id: "cambridge-17",
      title: "Cambridge IELTS 17",
      imageUrl: "...",
      participantsCount: 42,
      completedCount: 15,
      tests: [
        {
          examId: "uuid",
          testNumber: 1,
          durationMinutes: 40,
          difficulty: "ADVANCED",
          myScore: 35,        // from IeltsIntensiveResult
          participantsCount: 12,
          completedCount: 5
        }
      ]
    }
  ]
}
```

### 2. `GET /ielts-intensive/:examId`
Returns the full normalized exam tree for the take/review page.
```typescript
// Response:
{
  exam: { id, title, skill, difficulty, durationMinutes, imageUrl, metadata },
  parts: [
    {
      id, partNumber, partType, topic, audioUrl, transcript,
      passage: { passageTitle, passageText } | null,
      questionGroups: [
        {
          id, questionType, questionRange, instructions,
          optionsBox, tableStructure, contentStructure,
          questions: [
            { id, questionNumber, questionText, answer: HIDDEN_IN_TAKE_MODE, options, prompt, timestampSeconds }
          ]
        }
      ]
    }
  ]
}
```
**Important:** In `take` mode, the `answer` field must be omitted from the response. In `review` mode (after submission), include answers.

Query param: `?mode=take` (default) or `?mode=review&sessionId=xxx`

### 3. `POST /ielts-intensive/:examId/sessions`
Create a new exam session.
```typescript
// Body:
{ practicePart?: number }

// Response:
{ sessionId: "uuid" }
```

### 4. `PUT /ielts-intensive/sessions/:sessionId/submit`
Submit answers and trigger grading.
```typescript
// Body:
{
  answers: { "1": "litter", "2": "B", ... },
  timeTaken: 1800  // seconds
}

// Response for LISTENING/READING (synchronous grading):
{
  sessionId: "uuid",
  status: "COMPLETED",
  totalScore: 35,
  scoreByType: { "note_completion": { correct: 5, total: 6 }, "mcq_single": { correct: 3, total: 4 } }
}

// Response for WRITING/SPEAKING (async AI grading):
{
  sessionId: "uuid",
  status: "GRADING"
}
```

### 5. `GET /ielts-intensive/sessions/:sessionId`
Get session details + result.
```typescript
// Response:
{
  session: { id, examId, status, answers, timeTaken, practicePart, startedAt, submittedAt },
  result: { totalScore, scoreByType, feedback, gradedAt } | null,
  exam: { ... full exam tree with answers visible ... }
}
```

### 6. `GET /ielts-intensive/history`
Get user's exam history.

### 7. `DELETE /ielts-intensive/sessions/:sessionId`
Delete a session.

## Grading Logic (for Listening/Reading)

Port the grading logic from `exams.service.ts:419-547` but adapted to read from the normalized `IeltsIntensiveQuestion` table instead of walking a JSON tree:

```typescript
async gradeSession(sessionId: string): Promise<IeltsIntensiveResult> {
  const session = await this.prisma.ieltsIntensiveSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: {
        include: {
          parts: {
            include: {
              questionGroups: {
                include: { questions: true }
              }
            }
          }
        }
      }
    }
  });

  const answers = session.answers as Record<string, string>;
  let totalScore = 0;
  const scoreByType: Record<string, { correct: number; total: number }> = {};

  for (const part of session.exam.parts) {
    for (const group of part.questionGroups) {
      const type = group.questionType;
      if (!scoreByType[type]) scoreByType[type] = { correct: 0, total: 0 };

      for (const question of group.questions) {
        scoreByType[type].total++;
        const userAnswer = answers[String(question.questionNumber)];
        if (this.isAnswerCorrect(userAnswer, question.answer)) {
          totalScore++;
          scoreByType[type].correct++;
        }
      }
    }
  }

  // Upsert result
  return this.prisma.ieltsIntensiveResult.upsert({ ... });
}
```

## Steps
1. Create `ielts-intensive.module.ts` — import PrismaService, AiClientService.
2. Create `ielts-intensive.controller.ts` — all 7 endpoints with JwtAuthGuard.
3. Create `ielts-intensive.service.ts` — business logic.
4. Create `dto/ielts-intensive.dto.ts` — request DTOs.
5. Register the module in `app.module.ts`.
6. Test all endpoints with Postman/curl.

## Validation
- `GET /ielts-intensive/catalog?skill=LISTENING` returns Cambridge 17 with 4 tests
- `GET /ielts-intensive/:examId` returns full exam tree with parts/groups/questions
- `POST + PUT submit` flow grades correctly for Listening/Reading
- Answers are hidden in take mode, visible in review mode
