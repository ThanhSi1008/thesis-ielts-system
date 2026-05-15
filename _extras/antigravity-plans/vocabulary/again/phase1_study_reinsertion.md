# Phase 1: Frontend Queue Re-insertion (Study Page)

## Goal
When a user presses "Again" (rating 1) in the Vocab Lab study page, the card should be pushed to the end of the React `cards` array so they are guaranteed to see it again before the session ends.

**File**: `frontend-web/src/app/vocab-lab/study/[deckId]/page.tsx`

---

## Step 1.1: Update `handleRating`

Locate the `handleRating` function (around line 129). Update the logic to inspect the `rating` and append the card if it's an "Again" rating.

### Current Logic
```typescript
const handleRating = async (rating: number) => {
  if (!currentCard || isSubmitting) return;
  setIsSubmitting(true);

  try {
    await vocabLabApi.submitReview({
      flashcardId: currentCard.id,
      rating,
    });

    // Notify the Header badge to refresh
    window.dispatchEvent(new CustomEvent('vocabduechanged'));

    // Move to next card
    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  } catch (error) {
    // ...
```

### New Logic
```typescript
const handleRating = async (rating: number) => {
  if (!currentCard || isSubmitting) return;
  setIsSubmitting(true);

  try {
    await vocabLabApi.submitReview({
      flashcardId: currentCard.id,
      rating,
    });

    window.dispatchEvent(new CustomEvent('vocabduechanged'));

    // --- NEW LOGIC: Anki "Again" Re-insertion ---
    // If the user pressed "Again" (1), push the card to the end of the queue
    if (rating === 1) {
      setCards(prevCards => [...prevCards, currentCard]);
    }

    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  } catch (error) {
    console.error('Failed to submit review:', error);
    alert('Failed to save review. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

## Why This Works
React state update `setCards` appends the `currentCard` to the end of the array. The `isComplete` check (`currentIndex >= cards.length`) will now automatically evaluate against the new, larger array length. The user will continue until they eventually hit "Good" or "Easy" for every card that they previously failed.
