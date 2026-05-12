# Phase 1: Backend — New Combined Endpoint

## Goal
Create a single endpoint `POST /vocab-lab/from-foundationVocabWord/with-review` that atomically creates a flashcard from a vocabulary word AND submits an initial FSRS review in one request.

## Why Not Two Separate Calls?
The existing `POST /vocab-lab/from-foundationVocabWord` creates a card as `NEW` (no review). If we then call `POST /vocab-lab/review` separately from the frontend, there's added latency and a failure risk: if the second call fails, the card exists but has no review attached.

---

## Step 1.1: Add DTO

**File**: `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts`

Add a new DTO class after the existing `SubmitReviewDto` (around line 96):

```typescript
export class CreateFlashcardFromVocabWithReviewDto {
  @IsString()
  bookName: string;

  @IsObject()
  word: any;

  @IsInt()
  @Min(1)
  @Max(4)
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
}
```

Also add the import to the controller's import list (Step 1.3).

---

## Step 1.2: Add Service Method

**File**: `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

Add this method **right after** the existing `createFlashcardFromVocabulary` method (which ends around line 1012):

```typescript
/**
 * Creates a flashcard from a vocabulary word and immediately submits
 * an initial FSRS review with the given rating.
 * This gives the card a real SRS schedule from day one.
 */
async createFlashcardFromVocabularyWithReview(
  userId: string,
  bookName: string,
  word: any,
  rating: number,
) {
  // 1. Create the flashcard (reuses existing dedup + card-type logic)
  const flashcard = await this.createFlashcardFromVocabulary(userId, bookName, word);

  // 2. Submit the initial review to set the FSRS schedule
  const reviewed = await this.submitReview(userId, {
    flashcardId: flashcard.id,
    rating,
  });

  return reviewed;
}
```

### How It Works
- `createFlashcardFromVocabulary` (line 926) already handles:
  - Finding or creating the deck named after the book
  - Ensuring the "Essential" card type exists with Word/IPA/Meaning/Example/Image/Audio fields
  - Deduplication via `vocab-{wordId}` tag — if the card already exists, it returns the existing one
  - Building the field values and front/back HTML
- `submitReview` (line 1118) already handles:
  - FSRS scheduling via `ts-fsrs` library
  - Creating a `flashcardReview` audit record
  - Gamification XP events

So the new method is purely compositional — it calls two existing methods in sequence.

---

## Step 1.3: Add Controller Route

**File**: `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts`

### 1.3a: Update the DTO import (line 23-37)

Add `CreateFlashcardFromVocabWithReviewDto` to the import block:

```typescript
import {
  CreateDeckDto,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  SubmitReviewDto,
  CreateFlashcardFromVocabWithReviewDto, // ← ADD THIS
  CreateCardTypeDto,
  RenameCardTypeDto,
  UpdateCardTypeDescriptionDto,
  CreateCardTypeFieldDto,
  UpdateCardTypeFieldDto,
  UpdateCardTemplateDto,
  ImportDeckDto,
  PublishDeckDto,
  BrowseSharedDecksDto,
} from "./dto/vocab-lab.dto";
```

### 1.3b: Add the route handler

Add this **right after** the existing `createFlashcardFromVocabulary` handler (which ends at line 209), and **before** the `@Put("cards/:id")` handler at line 211:

```typescript
@Post("from-foundationVocabWord/with-review")
async createFlashcardFromVocabularyWithReview(
  @Request() req: any,
  @Body() dto: CreateFlashcardFromVocabWithReviewDto,
) {
  if (!dto.bookName || !dto.word || !dto.rating) {
    throw new BadRequestException("bookName, word, and rating are required");
  }
  return this.vocabLabService.createFlashcardFromVocabularyWithReview(
    req.user.id,
    dto.bookName,
    dto.word,
    dto.rating,
  );
}
```

> **IMPORTANT**: This route must come BEFORE any `@Put("cards/:id")` or generic wildcard routes. NestJS matches routes top-to-bottom, so the more specific path `from-foundationVocabWord/with-review` must be declared before shorter patterns.

---

## Step 1.4: Verify

After making changes, the backend dev server (already running via `npm run backend:dev`) should hot-reload. Check the terminal for compilation errors.

Quick smoke test with curl or any HTTP client:

```bash
# Should return 401 without auth token — proves the route exists
curl -X POST http://localhost:3001/vocab-lab/from-foundationVocabWord/with-review \
  -H "Content-Type: application/json" \
  -d '{"bookName":"test","word":{"word":"test"},"rating":3}'
```

Expected: `401 Unauthorized` (not `404 Not Found`).

---

## Files Changed Summary

| File | Change |
|------|--------|
| `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts` | Add `CreateFlashcardFromVocabWithReviewDto` class |
| `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` | Add `createFlashcardFromVocabularyWithReview` method after line ~1012 |
| `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` | Add import + route handler after line ~209 |
