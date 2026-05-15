# Implementation Plan: Total Removal of Vocabulary Exercises

This plan outlines the steps to completely remove the "Exercise" feature from the IELTS Vocabulary module across the entire stack.

## Phase 1: Database & Schema Cleanup

### 1.1 Update `schema.prisma`
- Remove the `FoundationVocabExercise` model.
- Remove the `exercises` relation in `FoundationVocabUnit`.
- Remove the `exerciseScore` field in `FoundationVocabProgress`.
- **Action**: Run `npx prisma migrate dev --name remove_vocab_exercises`.

### 1.2 Update Seeder Data
- Update `backend-core/prisma/data/vocabulary.ts` to exclude the `exercises` array from all unit objects.
- Update `backend-core/prisma/seed.ts` to stop trying to seed exercises.

## Phase 2: Backend Refactoring

### 2.1 Update Transformation Script
- Modify `_extras/transform-vocabulary.mjs` to stop parsing exercises and remove them from the output JSON.

### 2.2 Cleanup `VocabularyService`
- Remove `submitExercise` method.
- Update `getUnitWithContent` to remove `exercises` from the Prisma `include` block.
- Update `getUserProgress` to stop returning `exerciseScore`.

### 2.3 Cleanup Controller & DTOs
- Remove the `@Post('submit-exercise')` endpoint in `foundationVocabWord.controller.ts`.
- Delete exercise-related DTOs if they are no longer used.

## Phase 3: Frontend UI Cleanup

### 3.1 Refactor `UnitLearningClient.tsx`
- Remove the "Exercise" tab from the sidebar/navigation.
- Remove the `exercises` state and any logic related to rendering or submitting exercises.
- Adjust the layout to only show "Lesson" and "Reading Comprehension".

### 3.2 Update Progress & Statistics
- Remove exercise score displays from the vocabulary unit list and dashboard stats.
- Update the "Unit Completed" logic to only depend on word learning and reading comprehension.

## Phase 4: Verification
- Verify that seeding still works without exercises.
- Verify that the Vocabulary Unit page loads correctly and shows only the Word list and Reading sections.
- Confirm that no exercise-related network calls are made.
