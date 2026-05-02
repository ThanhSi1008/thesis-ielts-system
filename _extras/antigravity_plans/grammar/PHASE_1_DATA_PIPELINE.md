# Phase 1: Data Pipeline — Generate & Seed Grammar Content

## Objective

Populate the database with **complete theory + exercise content** for all 3 Cambridge Grammar in Use books. The current seed file (`backend-core/prisma/data/grammar.ts`) has only unit titles — no `theoryContent` and no exercises.

## Current State

### Prisma Models (already exist — no schema changes needed)

```prisma
model GrammarBook {
  id        String   @id @default(uuid())
  slug      String   @unique           // "elementary", "intermediate", "advanced"
  name      String
  author    String
  level     String                     // "Elementary", "Intermediate", "Advanced"
  imageUrl  String
  color     String                     // Hex color for UI
  unitCount Int
  units     GrammarUnit[]
  @@map("grammar_books")
}

model GrammarUnit {
  id            String   @id @default(uuid())
  bookId        String
  title         String
  order         Int
  theoryContent String?  @db.Text      // HTML content — CURRENTLY NULL
  book          GrammarBook @relation(...)
  exercises     GrammarExercise[]
  @@map("grammar_units")
}

model GrammarExercise {
  id       String @id @default(uuid())
  unitId   String
  section  String                      // "1.1", "1.2", etc.
  question String @db.Text
  type     String                      // "fill_blank", "match", "multiple_choice", "rewrite"
  options  Json?                       // Varies by type (verb list, match pairs, choices)
  answer   String @db.Text             // Correct answer(s) — JSON string
  order    Int    @default(0)
  unit     GrammarUnit @relation(...)
  @@map("grammar_exercises")
}
```

### Current Seed Data (`backend-core/prisma/data/grammar.ts`)

Only has unit titles and metadata. No `theoryContent`, no exercises:

```ts
export const grammarBooks = [
  {
    slug: "elementary",
    name: "Essential Grammar in Use",
    // ...metadata...
    units: [
      { title: "am/is/are", order: 1 },
      // ...10 total (should be 115)
    ],
  },
  // ...intermediate (5 of 145), advanced (3 of 105)
];
```

### Reference: What Populated Content Looks Like

The frontend has ONE fully populated unit in `frontend-web/src/app/grammar/data.ts` (intermediate unit 1). This shows the exact target format:

- **Theory**: Rich HTML with sections A/B/C, example situations, grammar tables, highlighted forms, warning boxes
- **Exercises**: Array of objects with `fill_blank` items (label + answer) and `match` items (left + right pairs)

---

## Content Generation Strategy

Since the Cambridge book content is copyrighted, we use **LLM-based generation** to create original content that teaches the same grammar topics. The strategy is a 2-step pipeline:

### Why NOT Scrape Third-Party Sites

| Source | Problem |
|--------|---------|
| **perfect-english-grammar.com** | Exercises are JS-rendered interactive widgets (not in static HTML). Theory pages lose formatting/tables when scraped. Content is behind membership. |
| **grammar-quizzes.com** | Complex nested HTML structures. No consistent format. Inconsistent answer keys. |
| **Cambridge official** | All content is paywalled behind Cambridge One platform. |
| **Kaggle/HuggingFace datasets** | Grammar error correction datasets — wrong format entirely (not fill-blank exercises). |

### Why LLM Generation Works Here

1. **Grammar rules are factual** — "Present Continuous = am/is/are + -ing" is not copyrightable; it's linguistic fact.
2. **Exercises are formulaic** — Fill-blank exercises follow a predictable pattern. LLMs excel at this.
3. **We have a perfect reference** — The existing `intermediateUnitContent["1"]` in `data.ts` provides an exact template the LLM can follow for structure, HTML styling, and exercise format.
4. **Quality control is easy** — Grammar exercises have objective correct answers. We can validate them programmatically.

---

## Step 1: Create the LLM Generation Script

**File:** `backend-core/prisma/scripts/generate-grammar-content.mjs`

This script calls the Gemini API (free tier, already used by the project) to generate content for each unit.

### Prerequisites

The project already has a Gemini API key in `backend-ai/.env` (used for pronunciation analysis). Use the same key.

### Script Architecture

```
┌──────────────────┐
│  Unit Title List  │  (from data.ts — 145 intermediate titles)
└────────┬─────────┘
         │
    For each unit:
         │
    ┌────▼────────────────────────┐
    │  Call Gemini API             │
    │  Prompt: "Generate theory   │
    │  HTML + exercises JSON for  │
    │  grammar topic: {title}"    │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │  Validate response          │
    │  - Parse JSON               │
    │  - Check HTML tags closed   │
    │  - Verify exercise answers  │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │  Write to grammar-data/     │
    │  intermediate/unit-1.json   │
    └─────────────────────────────┘

After all units generated:
    ┌─────────────────────────────┐
    │  Assemble into grammar.ts   │
    │  (complete seed file)       │
    └─────────────────────────────┘
```

### The Prompt Template

This is the critical piece. The prompt must produce content matching the exact frontend format.

```js
const THEORY_PROMPT = (unitNumber, title, level) => `
You are creating educational English grammar content for a learning platform.

Generate a grammar theory lesson for:
- Book: "${level} English Grammar"
- Unit ${unitNumber}: "${title}"

FORMAT REQUIREMENTS:
Return a JSON object with exactly this structure:
{
  "theory": "<HTML string>",
  "exercises": [<exercise objects>]
}

THEORY HTML REQUIREMENTS:
- Wrap everything in: <div class="space-y-6 text-gray-800">...</div>
- Use <section> tags for each main section (A, B, C, D)
- Section headings: <h3 class="text-xl font-bold mb-4 text-blue-800">A. [Title]</h3>
- Example boxes: <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">...</div>
- Grammar formation tables: <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">...</div>
- Example sentences with highlights: <strong>verb form</strong> and wrong usage <span class="text-red-400 text-sm">(not wrong form)</span>
- Correct usage: <span class="text-green-500 font-bold">✓</span>
- Warning notes: <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-6">...</div>
- Verb/keyword chips: <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">word</span>
- Include 8-12 example sentences showing correct usage
- Include 2-3 common mistakes with corrections
- Aim for 400-600 words of explanation

EXERCISE REQUIREMENTS:
Generate exactly 4 exercises:

Exercise 1 (fill_blank with verb bank):
{
  "id": "${unitNumber}.1",
  "question": "Description of what to do",
  "verbs": ["verb1", "verb2", ...],  // 6-8 verbs
  "items": [
    { "label": "1. She ________ a book.", "answer": "is reading", "isExample": true, "value": "She's reading a book." },
    { "label": "2. He ________ ...", "answer": "correct form" },
    // 6 items total: 1 example + 5 to answer
  ]
}

Exercise 2 (match):
{
  "id": "${unitNumber}.2",
  "question": "Match the sentences on the left with the correct endings on the right.",
  "matches": [
    { "left": "1. It's raining.", "right": "c. Take an umbrella.", "isExample": true },
    { "left": "2. She's tired.", "right": "a. She should rest." },
    // 8 pairs total: 1 example + 7 to answer
  ]
}

Exercise 3 (fill_blank - write questions):
{
  "id": "${unitNumber}.3",
  "question": "Write questions using the given words.",
  "items": [
    { "label": "1. what / happen? → What's happening?", "isExample": true, "value": "What's happening?" },
    { "label": "2. why / you / cry?", "answer": "Why are you crying?" },
    // 8 items total: 1 example + 7 to answer
  ]
}

Exercise 4 (fill_blank - put verb in correct form):
{
  "id": "${unitNumber}.4",
  "question": "Put the verb into the correct form, positive or negative.",
  "items": [
    { "label": "1. I ________ (try) to work.", "answer": "am trying", "isExample": true, "value": "I'm trying" },
    { "label": "2. It ________ (rain) any more.", "answer": "isn't raining" },
    // 14 items total: 1 example + 13 to answer
  ]
}

IMPORTANT:
- All answers must be grammatically correct
- Examples (isExample: true) show the answer; practice items do NOT
- Use natural, everyday English sentences
- Return ONLY valid JSON, no markdown code fences
`;
```

### Script Implementation

```js
// backend-core/prisma/scripts/generate-grammar-content.mjs

import fs from 'fs';
import path from 'path';

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_KEY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const OUTPUT_DIR = path.join(process.cwd(), 'prisma/data/grammar-generated');
const DELAY_MS = 2000; // Rate limiting between API calls

// Unit titles from the existing data.ts (frontend-web/src/app/grammar/data.ts)
// Import or paste the full list here
const INTERMEDIATE_UNITS = [
  { order: 1, title: "Present continuous (I am doing)" },
  { order: 2, title: "Present simple (I do)" },
  // ... all 145 units from data.ts
];

async function generateUnit(unit, level) {
  const prompt = THEORY_PROMPT(unit.order, unit.title, level);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    console.error(`❌ API error for unit ${unit.order}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error(`❌ Empty response for unit ${unit.order}`);
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    return validateAndClean(parsed, unit);
  } catch (e) {
    console.error(`❌ Invalid JSON for unit ${unit.order}: ${e.message}`);
    // Try to extract JSON from markdown fences
    const match = text.match(/```json?\s*([\s\S]*?)```/);
    if (match) {
      try { return validateAndClean(JSON.parse(match[1]), unit); } catch {}
    }
    return null;
  }
}

function validateAndClean(data, unit) {
  if (!data.theory || typeof data.theory !== 'string') {
    console.warn(`⚠️ Unit ${unit.order}: Missing or invalid theory`);
    return null;
  }
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
    console.warn(`⚠️ Unit ${unit.order}: Missing exercises`);
    return null;
  }

  // Validate each exercise has answers
  for (const ex of data.exercises) {
    if (ex.items) {
      const nonExamples = ex.items.filter(i => !i.isExample);
      if (nonExamples.some(i => !i.answer)) {
        console.warn(`⚠️ Unit ${unit.order}, Ex ${ex.id}: Missing answers`);
      }
    }
    if (ex.matches) {
      if (ex.matches.length < 4) {
        console.warn(`⚠️ Unit ${unit.order}, Ex ${ex.id}: Too few matches`);
      }
    }
  }

  return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const bookSlug = 'intermediate';
  const units = INTERMEDIATE_UNITS;
  const results = [];

  for (const unit of units) {
    const outputFile = path.join(OUTPUT_DIR, `${bookSlug}-unit-${unit.order}.json`);

    // Skip if already generated
    if (fs.existsSync(outputFile)) {
      console.log(`⏭️ Unit ${unit.order} already exists, skipping`);
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      results.push({ ...unit, ...existing });
      continue;
    }

    console.log(`🔄 Generating unit ${unit.order}: ${unit.title}...`);
    const content = await generateUnit(unit, 'Intermediate');

    if (content) {
      fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
      results.push({ ...unit, ...content });
      console.log(`✅ Unit ${unit.order} saved`);
    } else {
      console.error(`❌ Unit ${unit.order} failed — will retry next run`);
    }

    await sleep(DELAY_MS);
  }

  // Assemble into final seed format
  const seedData = {
    slug: bookSlug,
    name: "English Grammar in Use",
    author: "Raymond Murphy",
    level: "Intermediate",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    color: "#3B82F6",
    unitCount: 145,
    units: results.map(u => ({
      title: u.title,
      order: u.order,
      theoryContent: u.theory || null,
      exercises: (u.exercises || []).map((ex, idx) => ({
        section: ex.id || `${u.order}.${idx + 1}`,
        question: ex.question,
        type: ex.matches ? 'match' : 'fill_blank',
        options: ex.verbs ? JSON.stringify({ verbs: ex.verbs }) : null,
        items: JSON.stringify(ex.items || ex.matches || []),
        order: idx + 1,
      })),
    })),
  };

  const outputPath = path.join(process.cwd(), `prisma/data/grammar-${bookSlug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`\n📦 Assembled seed data: ${outputPath}`);
  console.log(`   ${results.length}/${units.length} units generated`);
}

main().catch(console.error);
```

### Running the Script

```bash
cd backend-core

# Set API key (same one used in backend-ai)
set GEMINI_API_KEY=your_key_here

# Generate intermediate book (takes ~5 min for 145 units at 2s/unit)
node prisma/scripts/generate-grammar-content.mjs
```

The script is **resumable**: it skips units that already have a JSON file, so you can stop and restart without losing progress.

### Rate Limiting & Cost

| Parameter | Value |
|-----------|-------|
| Model | `gemini-2.0-flash` (free tier: 15 RPM, 1500 req/day) |
| Delay | 2000ms between calls |
| Units | 145 (intermediate) |
| Time | ~5 minutes per book |
| Cost | **$0** (free tier) |
| Tokens/unit | ~3000 output tokens |

For all 3 books (145 + 115 + 105 = 365 units), total generation time is ~12 minutes.

---

## Step 2: Update the Seed Data File

**File:** `backend-core/prisma/data/grammar.ts`

After generation, update `grammar.ts` to import from the generated JSON files:

```ts
import intermediateData from './grammar-intermediate.json';
import elementaryData from './grammar-elementary.json';
import advancedData from './grammar-advanced.json';

export const grammarBooks = [
  elementaryData,
  intermediateData,
  advancedData,
];
```

Or alternatively, inline the entire content directly (may be a very large file — potentially 500KB+). The JSON import approach is cleaner.

> **Note:** If using JSON imports, ensure `tsconfig.json` has `"resolveJsonModule": true` (already set in the project).

---

## Step 3: Update the Seeder to Handle Exercises

**File:** `backend-core/prisma/seed.ts` (around lines 195-225)

The seeder already handles grammar books and units. Extend it to also seed exercises.

### Current Seeder Logic (simplified)

```ts
for (const book of grammarBooks) {
  const existing = await prisma.grammarBook.findUnique({ where: { slug: book.slug } });
  if (existing) {
    await prisma.grammarBook.update({ where: { slug: book.slug }, data: { ...bookMetadata } });
  } else {
    await prisma.grammarBook.create({ data: { ...bookMetadata } });
  }
  // Units are created/updated but exercises are NOT handled
}
```

### Required Changes

Add exercise seeding inside the unit upsert loop:

```ts
for (const unitData of book.units) {
  const unit = await prisma.grammarUnit.upsert({
    where: {
      // Use a composite lookup — findFirst by bookId+order, then upsert
      id: existingUnit?.id || 'new-unit-placeholder',
    },
    create: {
      bookId: createdBook.id,
      title: unitData.title,
      order: unitData.order,
      theoryContent: unitData.theoryContent || null,
    },
    update: {
      title: unitData.title,
      theoryContent: unitData.theoryContent || null,
    },
  });

  // Seed exercises — clear old and re-create
  if (unitData.exercises?.length) {
    await prisma.grammarExercise.deleteMany({ where: { unitId: unit.id } });

    for (const ex of unitData.exercises) {
      await prisma.grammarExercise.create({
        data: {
          unitId: unit.id,
          section: ex.section,
          question: ex.question,
          type: ex.type,
          options: ex.options ? (typeof ex.options === 'string' ? JSON.parse(ex.options) : ex.options) : undefined,
          answer: typeof ex.items === 'string' ? ex.items : JSON.stringify(ex.items),
          order: ex.order || 0,
        },
      });
    }
    console.log(`   📝 Seeded ${unitData.exercises.length} exercises for Unit ${unitData.order}`);
  }
}
```

---

## Step 4: Run the Seed

```bash
cd backend-core
npx prisma db seed
```

---

## Step 5: Quality Verification Script (Optional)

**File:** `backend-core/prisma/scripts/verify-grammar-content.mjs`

A quick script to verify the generated content is valid:

```js
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'prisma/data/grammar-generated');
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

let totalUnits = 0;
let totalExercises = 0;
let issues = [];

for (const file of files) {
  totalUnits++;
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));

  // Check theory
  if (!data.theory || data.theory.length < 200) {
    issues.push(`${file}: Theory too short (${data.theory?.length || 0} chars)`);
  }
  if (!data.theory?.includes('<div')) {
    issues.push(`${file}: Theory is not HTML`);
  }

  // Check exercises
  if (!data.exercises || data.exercises.length < 2) {
    issues.push(`${file}: Too few exercises (${data.exercises?.length || 0})`);
  }
  for (const ex of (data.exercises || [])) {
    totalExercises++;
    const items = ex.items || ex.matches || [];
    const answerable = items.filter(i => !i.isExample);
    if (answerable.length === 0) {
      issues.push(`${file}, Ex ${ex.id}: No answerable items`);
    }
    const missingAnswers = answerable.filter(i => !i.answer && !i.right);
    if (missingAnswers.length > 0) {
      issues.push(`${file}, Ex ${ex.id}: ${missingAnswers.length} items without answers`);
    }
  }
}

console.log(`\n📊 Verification Summary`);
console.log(`   Units: ${totalUnits}`);
console.log(`   Exercises: ${totalExercises}`);
console.log(`   Issues: ${issues.length}`);
if (issues.length > 0) {
  console.log(`\n⚠️ Issues found:`);
  issues.forEach(i => console.log(`   - ${i}`));
}
```

---

## Verification Checklist

- [ ] Generation script runs without errors
- [ ] Each generated JSON file has non-empty `theory` (HTML, 200+ chars)
- [ ] Each generated JSON file has 2-4 exercises
- [ ] Each exercise has at least 5 answerable items with correct answers
- [ ] `grammar_books` table has 3 rows with correct metadata after seeding
- [ ] `grammar_units` table has units with non-null `theoryContent`
- [ ] `grammar_exercises` table has exercises linked to units
- [ ] Each exercise has valid `type`, `question`, `options` (JSON), and `answer` (JSON string)
- [ ] API endpoint `GET /grammar/units/:id` returns unit with content and exercises
- [ ] Redis cache is invalidated after seeding

## Files to Create/Modify

| File | Action |
|------|--------|
| `backend-core/prisma/scripts/generate-grammar-content.mjs` | **CREATE** — LLM content generation script |
| `backend-core/prisma/scripts/verify-grammar-content.mjs` | **CREATE** — Content verification script |
| `backend-core/prisma/data/grammar-generated/` | **CREATE** — Directory for per-unit JSON files |
| `backend-core/prisma/data/grammar-intermediate.json` | **CREATE** — Assembled seed data for intermediate book |
| `backend-core/prisma/data/grammar.ts` | **MODIFY** — Import from generated JSON instead of hardcoded titles |
| `backend-core/prisma/seed.ts` | **MODIFY** — Add exercise seeding logic |

## Execution Order

1. Copy all 145 intermediate unit titles from `frontend-web/src/app/grammar/data.ts` into the script's `INTERMEDIATE_UNITS` array
2. Set the Gemini API key
3. Run the generation script — takes ~5 minutes
4. Run the verification script — should report 0 issues
5. Update `grammar.ts` to import the generated JSON
6. Update the seeder to handle exercises
7. Run `npx prisma db seed`
8. Verify with `GET /grammar/units/:id`

## Priority Note

Start with the **Intermediate book** since it already has 1 fully populated unit as reference in `frontend-web/src/app/grammar/data.ts` (unit 1: Present Continuous). The LLM prompt is calibrated to match that exact format. Elementary and Advanced can use the same script with their respective title lists.
