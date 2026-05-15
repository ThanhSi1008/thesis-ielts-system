# Phase 2: File-Based Seed Pipeline

## Objective
Extract the hardcoded IELTS exam data from `_extras/seed.ts` into structured JSON files, then build modular seeders that read those files and populate the new normalized tables from Phase 1.

## Prerequisites
- Phase 1 (schema) must be completed and migrated.

## Context
- Source data: `_extras/seed.ts` (3423 lines) — contains all Cambridge IELTS 17 data for Listening (4 tests), Reading (4 tests), Writing (4 tests), Speaking (2 tests).
- Current seed: `backend-core/prisma/seed.ts` — currently seeds into old `Exam` table.
- The old `Exam` seeding must remain untouched for backward compatibility.

## Directory Structure to Create

```
backend-core/prisma/
├── data/
│   └── ielts-intensive/
│       └── cambridge-17/
│           ├── listening-test-1.json
│           ├── listening-test-2.json
│           ├── listening-test-3.json
│           ├── listening-test-4.json
│           ├── reading-test-1.json
│           ├── reading-test-2.json
│           ├── reading-test-3.json
│           ├── reading-test-4.json
│           ├── writing-test-1.json
│           ├── writing-test-2.json
│           ├── writing-test-3.json
│           ├── writing-test-4.json
│           ├── speaking-test-1.json
│           └── speaking-test-2.json
├── seeders/
│   ├── ielts-intensive.seeder.ts    ← Orchestrator
│   ├── ielts-listening.seeder.ts
│   ├── ielts-reading.seeder.ts
│   ├── ielts-writing.seeder.ts
│   └── ielts-speaking.seeder.ts
└── seed.ts                          ← Add call to seedIeltsIntensive()
```

## JSON File Format

### Listening (`listening-test-1.json`)
```json
{
  "exam": {
    "title": "Cambridge IELTS 17 - Listening Test 1",
    "skill": "LISTENING",
    "difficulty": "ADVANCED",
    "durationMinutes": 40,
    "imageUrl": "https://res.cloudinary.com/dalaaegob/image/upload/v1773843478/cambridge-ielts-17_hnyjmd.png"
  },
  "parts": [
    {
      "partNumber": 1,
      "partType": "Basic Conversation",
      "topic": "Buckworth Conservation Group",
      "audioUrl": "https://res.cloudinary.com/...",
      "transcript": [
        { "speaker": "PETER", "text": "Hello?" },
        { "speaker": "HELEN", "text": "..." }
      ],
      "questionGroups": [
        {
          "questionType": "note_completion",
          "questionRange": "1-5",
          "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          "contentStructure": [
            {
              "heading": "Buckworth Conservation Group",
              "points": [
                { "text": "Static text (no blank)" },
                { "questionNumber": 1, "text": "volunteers


 work with


 


 


a


 








 





1 ......", "answer": "litter", "timestampSeconds": 123 }
              ]
            }
          ],
          "questions": [
            { "questionNumber": 1, "questionText": "...", "answer": "litter", "timestampSeconds": 123 }
          ]
        },
        {
          "questionType": "table_completion",
          "questionRange": "8-10",
          "instructions": "Complete the table below. Write ONE WORD ONLY for each answer.",
          "tableStructure": {
            "headers": ["Date", "Event", "Location", "Help needed"]
          },
          "questions": [
            { "questionNumber": 8, "questionText": "8 ......", "answer": "quiz", "timestampSeconds": 309 }
          ]
        },
        {
          "questionType": "mcq_single",
          "questionRange": "21-26",
          "instructions": "Choose the correct letter, A, B or C.",
          "questions": [
            {
              "questionNumber": 21,
              "questionText": "What problem did both students have?",
              "options": { "A": "making initial contact", "B": "organising transport", "C": "finding a placement" },
              "answer": "A",
              "timestampSeconds": 74
            }
          ]
        },
        {
          "questionType": "matching",
          "questionRange": "27-30",
          "instructions": "Choose FOUR answers from the box...",
          "optionsBox": {
            "title": "Opinions",
            "options": { "A": "Tim found this easier...", "B": "Tim thought this was not..." }
          },
          "questions": [
            { "questionNumber": 27, "prompt": "Medical terminology", "answer": "A", "timestampSeconds": 334 }
          ]
        }
      ]
    }
  ]
}
```

### Reading (`reading-test-1.json`)
Same structure but:
- No `audioUrl` or `transcript` on parts
- Parts have a `passage` field: `{ "passageTitle": "...", "passageText": "..." }`
- `questionType` values from the Reading taxonomy (see `00-overview.md`)

### Writing (`writing-test-1.json`)
```json
{
  "exam": {
    "title": "Cambridge IELTS 17 - Writing Test 1",
    "skill": "WRITING",
    "difficulty": "INTERMEDIATE",
    "durationMinutes": 60,
    "imageUrl": "..."
  },
  "parts": [
    {
      "partNumber": 1,
      "partType": "Task 1",
      "topic": "Map comparison",
      "questionGroups": [
        {
          "questionType": "task_1_visual",
          "questionRange": "1",
          "instructions": "You should spend about 20 minutes on this task.",
          "questions": [
            {
              "questionNumber": 1,
              "questionText": "The maps below show...",
              "answer": "",
              "imageUrl": "https://res.cloudinary.com/...",
              "options": { "minWords": 150, "taskType": "map" }
            }
          ]
        }
      ]
    },
    {
      "partNumber": 2,
      "partType": "Task 2",
      "topic": "Essay",
      "questionGroups": [
        {
          "questionType": "task_2_essay",
          "questionRange": "2",
          "instructions": "You should spend about 40 minutes on this task.",
          "questions": [
            {
              "questionNumber": 2,
              "questionText": "It is important for people to take risks...",
              "answer": "",
              "options": { "minWords": 250 }
            }
          ]
        }
      ]
    }
  ]
}
```

### Speaking (`speaking-test-1.json`)
```json
{
  "exam": {
    "title": "Cambridge IELTS 17 - Speaking Test 1",
    "skill": "SPEAKING",
    "difficulty": "INTERMEDIATE",
    "durationMinutes": 15,
    "imageUrl": "...",
    "metadata": {
      "examiner": {
        "name": "Jim Hopper",
        "role": "IELTS Examiner",
        "avatarUrl": "https://res.cloudinary.com/..."
      }
    }
  },
  "parts": [
    {
      "partNumber": 1,
      "partType": "Part 1: Interview",
      "topic": "History",
      "questionGroups": [
        {
          "questionType": "part_1_interview",
          "questionRange": "1-4",
          "instructions": "The examiner will ask you questions about familiar topics.",
          "questions": [
            {
              "questionNumber": 1,
              "questionText": "What did you study in history lessons?",
              "answer": "",
              "options": { "video": "https://res.cloudinary.com/..." }
            }
          ]
        }
      ]
    }
  ]
}
```

## Seeder Logic

### `ielts-intensive.seeder.ts` (Orchestrator)
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const DATA_DIR = path.join(__dirname, '..', 'data', 'ielts-intensive');

export async function seedIeltsIntensive(prisma: PrismaClient) {
  const books = fs.readdirSync(DATA_DIR).filter(d =>
    fs.statSync(path.join(DATA_DIR, d)).isDirectory()
  );

  for (const book of books) {
    const bookDir = path.join(DATA_DIR, book);
    const files = fs.readdirSync(bookDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(bookDir, file), 'utf-8'));
      await upsertIeltsIntensiveExam(prisma, raw);
    }
  }

  const count = await prisma.ieltsIntensiveExam.count();
  console.log(`  ✅ ${count} IELTS Intensive exams seeded`);
}

async function upsertIeltsIntensiveExam(prisma: PrismaClient, data: any) {
  const { exam, parts } = data;

  // Upsert exam
  const existing = await prisma.ieltsIntensiveExam.findFirst({
    where: { title: exam.title, skill: exam.skill },
  });

  let examRecord;
  if (existing) {
    // Delete cascade will remove old parts/groups/questions
    await prisma.ieltsIntensivePart.deleteMany({ where: { examId: existing.id } });
    examRecord = await prisma.ieltsIntensiveExam.update({
      where: { id: existing.id },
      data: { ...exam, isPublished: true },
    });
  } else {
    examRecord = await prisma.ieltsIntensiveExam.create({
      data: { ...exam, isPublished: true },
    });
  }

  // Create parts
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partRecord = await prisma.ieltsIntensivePart.create({
      data: {
        examId: examRecord.id,
        partNumber: part.partNumber,
        partType: part.partType,
        topic: part.topic || null,
        audioUrl: part.audioUrl || null,
        transcript: part.transcript || null,
        order: i,
      },
    });

    // Create passage if reading
    if (part.passage) {
      await prisma.ieltsIntensivePassage.create({
        data: {
          partId: partRecord.id,
          passageTitle: part.passage.passageTitle || null,
          passageText: part.passage.passageText,
        },
      });
    }

    // Create question groups
    for (let j = 0; j < (part.questionGroups || []).length; j++) {
      const group = part.questionGroups[j];
      const groupRecord = await prisma.ieltsIntensiveQuestionGroup.create({
        data: {
          partId: partRecord.id,
          questionType: group.questionType,
          questionRange: group.questionRange,
          instructions: group.instructions,
          optionsBox: group.optionsBox || null,
          tableStructure: group.tableStructure || null,
          contentStructure: group.contentStructure || null,
          order: j,
        },
      });

      // Create questions
      for (let k = 0; k < (group.questions || []).length; k++) {
        const q = group.questions[k];
        await prisma.ieltsIntensiveQuestion.create({
          data: {
            groupId: groupRecord.id,
            questionNumber: q.questionNumber,
            questionText: q.questionText || null,
            answer: String(q.answer || ''),
            options: q.options || null,
            prompt: q.prompt || null,
            timestampSeconds: q.timestampSeconds || null,
            gradingNote: q.gradingNote || null,
            imageUrl: q.imageUrl || null,
            order: k,
          },
        });
      }
    }
  }
}
```

### Wire into `seed.ts`
At the end of `backend-core/prisma/seed.ts`, add:
```typescript
import { seedIeltsIntensive } from './seeders/ielts-intensive.seeder';

// Inside main():
await seedIeltsIntensive(prisma);
```

## Steps
1. Create `backend-core/prisma/data/ielts-intensive/cambridge-17/` directory.
2. Extract data from `_extras/seed.ts` into 14 JSON files following the formats above.
3. Create `backend-core/prisma/seeders/ielts-intensive.seeder.ts`.
4. Add `seedIeltsIntensive(prisma)` call to `backend-core/prisma/seed.ts`.
5. Run `npm run prisma:seed` from `backend-core` workspace.
6. Verify: all 14 exams seeded with correct part/group/question counts.

## Validation
- Run `npx prisma studio` and check:
  - 14 records in `ielts_intensive_exams`
  - Each listening exam has 4 parts, each reading has 3 parts, each writing has 2 parts, each speaking has 3 parts
  - Question groups have correct `questionType` slugs
  - Questions have correct answers and timestamps
