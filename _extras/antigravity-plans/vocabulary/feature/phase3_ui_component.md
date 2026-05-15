# Phase 3: UI — Replace Buttons with SRS Rating Panel

## Goal
Replace the two buttons ("Already Know" / "Add to My Flashcard") in the `WordListFlipCard` component with a 4-button SRS rating panel (Again/Hard/Good/Easy) and a subtle "Already Know" skip link.

**File**: `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/page.tsx`

---

## Step 3.1: Add SRS Rating Constants

At the top of the file (after the imports, before the `ScoreModal` component — around line 13), add:

```typescript
// ============================================================
// SRS RATING CONSTANTS
// ============================================================

const SRS_RATINGS = [
  { rating: 1, label: 'Again', interval: '<10m', bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', keyBg: 'bg-red-100', keyHoverBg: 'group-hover:bg-red-200' },
  { rating: 2, label: 'Hard',  interval: '1d',   bgColor: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200', keyBg: 'bg-orange-100', keyHoverBg: 'group-hover:bg-orange-200' },
  { rating: 3, label: 'Good',  interval: '3d',   bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200', keyBg: 'bg-blue-100', keyHoverBg: 'group-hover:bg-blue-200' },
  { rating: 4, label: 'Easy',  interval: '5d',   bgColor: 'bg-green-50', hoverBg: 'hover:bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', keyBg: 'bg-green-100', keyHoverBg: 'group-hover:bg-green-200' },
] as const;
```

---

## Step 3.2: Replace `handleAddToFlashcard` Handler

In the `WordListFlipCard` component (starts at line 90), **replace** the existing `handleAddToFlashcard` method (lines 123-151) with a new `handleRateAndAdd` method:

### Remove this (lines 123-151):
```typescript
const handleAddToFlashcard = async (e: React.MouseEvent) => {
  e.stopPropagation();
  if (addedWords.has(currentWord.id)) return;
  // ... entire existing method
};
```

### Replace with:
```typescript
const handleRateAndAdd = async (rating: number) => {
  if (addedWords.has(currentWord.id) || isAdding) return;

  setIsAdding(true);
  try {
    await vocabLabApi.createFlashcardFromVocabularyWithReview({
      bookName,
      word: currentWord,
      rating,
    });
    setAddedWords(prev => new Set(prev).add(currentWord.id));
    window.dispatchEvent(new CustomEvent('vocabduechanged'));

    const ratingLabel = SRS_RATINGS.find(r => r.rating === rating)?.label ?? '';
    toast.success(
      <div className="flex flex-col gap-1">
        <span>Added to Vocab Lab as &quot;{ratingLabel}&quot;</span>
        <Link href="/vocab-lab" className="text-blue-500 hover:text-blue-600 hover:underline text-xs font-bold mt-1 inline-block">
          GO TO VOCAB LAB →
        </Link>
      </div>,
      5000
    );
    onNextWord();
  } catch (err) {
    console.error("Failed to add flashcard:", err);
    toast.error("Failed to add flashcard.");
  } finally {
    setIsAdding(false);
  }
};
```

---

## Step 3.3: Replace the Button JSX

**Replace** the entire `{showButtons && (...)}` block (lines 263-299) with the new SRS rating panel:

### Remove this (lines 263-299):
```tsx
{showButtons && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in duration-300">
    <button className="..." onClick={(e) => { e.stopPropagation(); onNextWord(); }}>
      {currentWordIndex < totalWords - 1 ? "ALREADY KNOW" : "GO TO READING"}
    </button>
    <button className="..." onClick={handleAddToFlashcard} disabled={...}>
      {isAdding ? "ADDING..." : addedWords.has(currentWord.id) ? "ADDED TO FLASHCARDS" : "ADD TO MY FLASHCARD"}
    </button>
  </div>
)}
```

### Replace with:
```tsx
{showButtons && (
  <div className="mt-8 animate-in fade-in duration-300">
    {/* SRS Rating Buttons */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {SRS_RATINGS.map((srs) => (
        <button
          key={srs.rating}
          onClick={(e) => { e.stopPropagation(); handleRateAndAdd(srs.rating); }}
          disabled={isAdding || addedWords.has(currentWord.id)}
          className={`group flex flex-col items-center justify-center py-3 rounded-xl border transition-colors disabled:opacity-50 ${srs.bgColor} ${srs.hoverBg} ${srs.textColor} ${srs.borderColor}`}
        >
          <span className="font-bold text-sm mb-0.5">{srs.label}</span>
          <div className="flex items-center text-[10px] opacity-70">
            <span>{srs.interval}</span>
            <span className={`ml-1.5 px-1 py-px rounded hidden sm:block ${srs.keyBg} ${srs.keyHoverBg}`}>{srs.rating}</span>
          </div>
        </button>
      ))}
    </div>

    {/* Already Know — Skip (subtle secondary action) */}
    <div className="flex justify-center mt-4">
      <button
        onClick={(e) => { e.stopPropagation(); onNextWord(); }}
        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {currentWordIndex < totalWords - 1 ? "Already know — skip" : "Already know — go to reading"}
      </button>
    </div>
  </div>
)}
```

---

## Step 3.4: Add Keyboard Shortcuts (Optional Enhancement)

Add a `useEffect` inside `WordListFlipCard` (after the existing `useEffect` at line 96-99) for keyboard handling:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showButtons || isAdding) return;

    switch (e.key) {
      case '1': e.preventDefault(); handleRateAndAdd(1); break;
      case '2': e.preventDefault(); handleRateAndAdd(2); break;
      case '3': e.preventDefault(); handleRateAndAdd(3); break;
      case '4': e.preventDefault(); handleRateAndAdd(4); break;
      case 'Enter':
        e.preventDefault();
        onNextWord(); // Skip = "Already Know"
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showButtons, isAdding, currentWord.id]);
```

> Note: The `handleRateAndAdd` and `onNextWord` in the dependency array may cause ESLint warnings. Wrap them in `useCallback` if needed, or suppress with `// eslint-disable-next-line`.

---

## Visual Result

After the card flip animation, users will see:

```
┌──────────┬──────────┬──────────┬──────────┐
│  Again   │   Hard   │   Good   │   Easy   │
│  <10m 1  │   1d  2  │   3d  3  │   5d  4  │
└──────────┴──────────┴──────────┴──────────┘
           ✓ Already know — skip
```

- The 4 colored buttons are the **primary action** (adds to Vocab Lab with SRS)
- The "Already know" link is **secondary** (just advances, no Vocab Lab entry)
- This matches the Vocab Lab study page styling exactly (see `frontend-web/src/app/vocab-lab/study/[deckId]/page.tsx` lines 444-492)

---

## Files Changed Summary

| File | Change |
|------|--------|
| `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/page.tsx` | Add `SRS_RATINGS` constant, replace `handleAddToFlashcard` with `handleRateAndAdd`, replace button JSX, optionally add keyboard shortcuts |

## What NOT to Change
- The flip card UI (front/back sides) — unchanged
- The progress bar — unchanged
- The `handleSpeakWord` method — unchanged
- The `UnitLearningClient` parent component — unchanged
- The `handleNextWord` parent handler — unchanged (it already updates word progress)
