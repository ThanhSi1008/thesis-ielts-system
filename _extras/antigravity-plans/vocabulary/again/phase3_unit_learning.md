# Phase 3: Unit Learning "Again" Alignment (Optional)

## Goal
We recently replaced the "Already Know / Add to Flashcard" buttons in the Foundation Unit Learning word list with the 4-button SRS rating grid. If the user presses "Again" (1) here, we might want to mirror the Anki behavior and have the word reappear at the end of the unit word list before they are allowed to proceed to Reading Comprehension.

**File**: `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/UnitLearningClient.tsx` (or `page.tsx` depending on where the words array state is held).

---

## Step 3.1: Locate the Words Array State

In the Unit Learning flow, the parent component (`UnitLearningClient` or `UnitPage`) typically holds the `words` array and passes `currentWord` and `currentWordIndex` to `WordListFlipCard`.

If `WordListFlipCard` triggers `onNextWord` and the word was rated "Again", it currently just advances the index.

## Step 3.2: Pass Rating to `onNextWord`

Change `onNextWord` signature to `onNextWord(rating?: number)`.

In `WordListFlipCard`'s `handleRateAndAdd`:
```typescript
onNextWord(rating); // Pass the rating up to the parent
```

In the Skip handler:
```typescript
onNextWord(); // No rating passed (or pass a specific 'skip' flag)
```

## Step 3.3: Re-append the Word in Parent

In the parent component where `handleNextWord` is defined:

```typescript
// Assuming 'words' is kept in state: const [words, setWords] = useState(initialWords);

const handleNextWord = (rating?: number) => {
  const currentWord = words[currentWordIndex];

  if (rating === 1) { // 1 = Again
    // Push the word to the end of the list
    setWords(prev => [...prev, currentWord]);
    // Note: This automatically increases `totalWords` (words.length)
  }

  setCurrentWordIndex(prev => prev + 1);
};
```

## Why This Works
The progress bar uses `(currentWordIndex / totalWords) * 100`. If you append a word, `totalWords` increases by 1, slightly shrinking the progress bar visually (a classic gamification/SRS cue that you gained more work). The user will encounter the word again at the very end.

> **Note**: Because this is the initial learning phase, you might choose to skip this phase entirely if you prefer the unit flow to be strictly linear (1-pass), leaving the spaced repetition entirely to the Vocab Lab. But if you want strict Anki behavior from the very start, this phase implements it perfectly.
