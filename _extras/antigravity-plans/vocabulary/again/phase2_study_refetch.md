# Phase 2: End-of-Session Refetch (Study Page)

## Goal
When the user reaches the end of their frontend queue (`currentIndex >= cards.length`), do not immediately show the "Congratulations" complete screen. Instead, perform a background fetch to check if any cards (like those failed earlier and set to a 10m interval) have become due again on the backend while the user was studying.

**File**: `frontend-web/src/app/vocab-lab/study/[deckId]/page.tsx`

---

## Step 2.1: Extract `fetchStudyCards`

Currently, `fetchStudyCards` is defined inside a `useEffect` hook. Extract it so we can call it manually.

Move it outside the `useEffect` and wrap in `useCallback` (or just declare as an async function if we don't mind deps):

```typescript
// Add state to track if we are performing an end-of-session refetch
const [isRefetching, setIsRefetching] = useState(false);

const fetchStudyCards = async (isInitial = true) => {
  if (isInitial) setLoading(true);
  else setIsRefetching(true);

  try {
    const data = await vocabLabApi.getStudyCards(deckId);
    
    if (isInitial) {
      setCards(data);
    } else {
      // It's a refetch. Only append cards we haven't seen yet, 
      // or cards that are genuinely due again (Anki style).
      // Since FSRS returns them if due <= now, we can just append them.
      // We should filter out any cards that are already in our current queue
      // to avoid weird duplicates if the backend hasn't synced properly.
      const existingIds = new Set(cards.map(c => c.id));
      const newDueCards = data.filter(c => !existingIds.has(c.id));
      
      if (newDueCards.length > 0) {
        setCards(prev => [...prev, ...newDueCards]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch study cards:', error);
  } finally {
    if (isInitial) setLoading(false);
    else setIsRefetching(false);
  }
};

// Initial load
useEffect(() => {
  if (deckId) fetchStudyCards(true);
}, [deckId]);
```

## Step 2.2: Trigger Refetch when Queue Empty

We need to watch the `currentIndex` and `cards.length`. If they match, it means we just finished the queue.

```typescript
// Refetch when reaching the end of the queue
useEffect(() => {
  // Only trigger if we actually had cards, and we just hit the end
  if (!loading && cards.length > 0 && currentIndex === cards.length && !isRefetching) {
    fetchStudyCards(false);
  }
}, [currentIndex, cards.length, loading, isRefetching]);
```

## Step 2.3: Update UI Logic

Update the rendering logic to show a loading state during refetching instead of the "Complete" screen.

```typescript
// Change the complete logic
const isComplete = !loading && !isRefetching && cards.length > 0 && currentIndex >= cards.length;

// In the JSX, if `isRefetching` is true, show a small spinner:
if (loading || isRefetching) {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
```

## Why This Works
If a user studies for 15 minutes, cards they failed at minute 1 (which had a 10m step) have now legally crossed the FSRS `due` timestamp on the backend. When they finish the frontend queue at minute 15, the frontend asks the backend "Anything else?" and the backend says "Yes, these 3 cards are due again." They are appended, and the study session continues seamlessly.
