# Phase 4: Verification & Testing

## Goal
Verify the full flow works end-to-end: card flip → SRS rating → Vocab Lab integration → word progress advancement.

---

## Pre-Requisites
- Backend dev server running (`npm run backend:dev`)
- Frontend dev server running (`npm run ai:dev`)
- A logged-in user account

---

## Test 1: Backend Endpoint Exists

Open any HTTP client (browser dev tools, Postman, curl):

```bash
curl -X POST http://localhost:3001/vocab-lab/from-foundationVocabWord/with-review \
  -H "Content-Type: application/json" \
  -d '{"bookName":"test","word":{"word":"test"},"rating":3}'
```

**Expected**: `401 Unauthorized` (proves route exists and auth guard works).
**Fail**: `404 Not Found` means the route was not registered — check Phase 1.

---

## Test 2: UI Rating Buttons Appear

1. Navigate to any vocabulary unit page, e.g.:
   `http://localhost:3001/ielts/vocabulary/<bookSlug>/<unitSlug>`
2. Click on the flash card to flip it
3. **Verify**: After the flip animation (~300ms), 4 colored buttons should appear in a row:
   - **Again** (red) | **Hard** (orange) | **Good** (blue) | **Easy** (green)
   - Below them: a subtle gray "Already know — skip" link
4. **Verify**: The old "ALREADY KNOW" and "ADD TO MY FLASHCARD" buttons are gone

---

## Test 3: SRS Rating Creates Card in Vocab Lab

1. Flip a card to reveal the meaning
2. Click **"Good"** (blue button)
3. **Verify**: A success toast appears with text like `Added to Vocab Lab as "Good"`
4. **Verify**: The toast includes a "GO TO VOCAB LAB →" link
5. **Verify**: The card automatically advances to the next word
6. Navigate to `/vocab-lab` and check the deck named after the book
7. **Verify**: The word appears as a flashcard in that deck
8. **Verify**: The card state should be `LEARNING` (not `NEW`) since it has been reviewed once

---

## Test 4: "Already Know" Skips Without Adding

1. Flip a card
2. Click **"Already know — skip"**
3. **Verify**: Card advances to next word
4. **Verify**: No toast about Vocab Lab appears
5. **Verify**: The word does NOT appear in any Vocab Lab deck

---

## Test 5: Duplicate Prevention

1. Rate a word with any rating (e.g., "Hard")
2. Navigate back or reload the page
3. Find the same word again
4. **Verify**: The buttons should still be clickable (the `addedWords` set resets on page reload)
5. Click a rating button again
6. **Verify**: The backend should return the existing card (dedup via `vocab-{wordId}` tag) — no duplicate card created

---

## Test 6: Last Word Transition

1. Navigate through words until you reach the last one (e.g., 20/20)
2. Flip the last card
3. Click any rating button
4. **Verify**: After the toast, the view automatically switches to the "Reading Comprehension" tab
5. Also test: Click "Already know — skip" on the last card
6. **Verify**: Text says "Already know — go to reading" and transitions to reading tab

---

## Test 7: Keyboard Shortcuts (if implemented in Phase 3)

1. Flip a card (click or Space/Enter)
2. Press **1** on keyboard
3. **Verify**: Triggers "Again" rating
4. Flip next card, press **4**
5. **Verify**: Triggers "Easy" rating
6. Flip next card, press **Enter**
7. **Verify**: Triggers "Already Know" skip

---

## Test 8: Vocab Lab Badge Update

1. Note the number on the "Vocab Lab" badge in the navbar (the red circle with a number)
2. Rate a word
3. **Verify**: The badge number updates (via the `vocabduechanged` custom event)

---

## Test 9: Mobile Responsiveness

1. Open browser DevTools → toggle device toolbar → select a mobile viewport (e.g., iPhone 14)
2. Navigate to a vocabulary unit
3. Flip a card
4. **Verify**: Rating buttons display in a 2×2 grid (2 columns on mobile, 4 on desktop)
5. **Verify**: "Already know" link is below the grid and fully visible
6. **Verify**: No horizontal scrolling or overflow

---

## Test 10: Dark Mode

1. Toggle dark mode (via the moon icon in the navbar)
2. Flip a card
3. **Verify**: Rating buttons are still legible with proper dark mode colors
4. **Verify**: "Already know" link text color adjusts for dark mode

---

## Edge Cases to Watch For
- **Not logged in**: The rating buttons should gracefully fail (the API will return 401, caught by the error handler)
- **Network error mid-request**: The `isAdding` state should reset, and an error toast should appear
- **Rapidly clicking multiple buttons**: The `isAdding` guard should prevent double submissions

---

## Rollback Plan
If issues are found:
1. Backend: The new endpoint is additive — no existing endpoints were modified. Simply remove the new route handler and service method.
2. Frontend: Revert `page.tsx` to restore the original "Already Know / Add to My Flashcard" buttons. The old `createFlashcardFromVocabulary` API method was not removed.
