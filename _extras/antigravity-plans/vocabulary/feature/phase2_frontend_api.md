# Phase 2: Frontend API — Add New API Method

## Goal
Add a frontend API method that calls the new combined endpoint from Phase 1.

---

## Step 2.1: Add API Method

**File**: `frontend-web/src/services/vocabLab.api.ts`

Add this method inside the `vocabLabApi` object, right after the existing `createFlashcardFromVocabulary` method (around line 101-102):

```typescript
createFlashcardFromVocabularyWithReview: async (payload: {
  bookName: string;
  word: any;
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
}) => {
  const { data } = await api.post<Flashcard>(
    '/vocab-lab/from-foundationVocabWord/with-review',
    payload,
  );
  return data;
},
```

### Context: Where to Insert

The existing code around line 100-103 looks like:

```typescript
createFlashcardFromVocabulary: async (payload: { bookName: string; word: any }) => {
  const { data } = await api.post<Flashcard>('/vocab-lab/from-foundationVocabWord', payload);
  return data;
},
```

Insert the new method **right after** this block (after the closing `},`).

---

## Step 2.2: Verify TypeScript Compilation

After saving, check the terminal running `npm run ai:dev` for any TypeScript errors. The `Flashcard` type is already imported at line 2 of this file, so no additional imports are needed.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `frontend-web/src/services/vocabLab.api.ts` | Add `createFlashcardFromVocabularyWithReview` method (~6 lines, after line 102) |

## Notes
- The existing `createFlashcardFromVocabulary` method should be kept — it's still used by the `GlobalVocabFab` component and other parts of the app.
- The new method follows the same DIP pattern: UI → Hook/Handler → API Client → HTTP.
