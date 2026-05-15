# Implementation Plan: Fixing Vocabulary Exercise Ingestion

This plan outlines the steps required to fix the incomplete ingestion of vocabulary exercises from the 4000 Essential English Words series. Currently, units are missing ~5-10 questions due to parsing limitations in the transformation script.

## Phase 1: Enhancement of `transform-vocabulary.mjs`

### 1.1 Support Multiple Answer Indices
The current regex `/answer-index=['"](\d+)['"]/` only captures single digits. Many exercises use `answer-index="0,1"`.
- **Change**: Update the regex to capture any non-quote character and split by comma.
- **Goal**: Prevent skipping "Circle two words" style questions.

### 1.2 Handle Empty Question Text
The script currently skips questions if `stripHtml(content.replace(/<ul[\s\S]*<\/ul>/, ''))` is empty.
- **Change**: If question text is empty, provide a fallback based on the instruction (e.g., "Choose the better sentence for the context").
- **Goal**: Capture all 10 questions in "Exercise 2" blocks which often have no specific question prompt other than the choice comparison.

### 1.3 Fix Fill-Blank (Char) Detection
Ensure that the `answer-the-questions-section-char` regex is robust across all 6 books.
- **Goal**: Verify that Unit 8/10 fill-blank exercises are fully captured.

## Phase 2: Data Transformation

### 2.1 Run Transformation Script
Execute the script to regenerate the static seeder data.
```bash
node _extras/transform-vocabulary.mjs
```

### 2.2 Verify `vocabulary.ts`
Manually inspect `backend-core/prisma/data/vocabulary.ts` for Unit 1.
- **Success Criteria**: `exercises` array length should be **20**.

## Phase 3: Database Seeding & Verification

### 3.1 Update Database
Run the Prisma seeder.
```bash
cd backend-core
npx prisma db seed
```

### 3.2 Frontend Verification
1. Open the browser to `Unit 1`.
2. Navigate to the `Exercise` tab.
3. Confirm that the list now scrolls to **Question 20**.
4. Confirm that different question types (matching, choice, comparison) render correctly.

## Phase 4: Regression Check
Check Unit 2 and Unit 3 to ensure they also show the full question count (20 per unit).
