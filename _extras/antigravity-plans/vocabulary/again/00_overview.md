# Feature: Anki-style "Again" Reappearance

## Overview

Implement the Anki-style "Learning Steps" behavior where pressing **"Again"** (rating: 1) ensures the card reappears during the current active learning session, rather than simply ending the session when the initial queue runs out.

We will achieve this through a hybrid approach:
1. **Frontend Queue Re-insertion**: Immediate, guaranteed reappearance within the same UI session without waiting for exact timestamps to expire.
2. **End-of-Session Refetch**: A final safety check with the backend to catch any cards that became due while the user was studying other cards.
3. **Unit Learning Alignment**: Applying the same "Again" re-insertion logic to the newly built Foundation Vocabulary word-list flow.

## Phases

| Phase | File | Description |
|-------|------|-------------|
| 1 | `phase1_study_reinsertion.md` | Implement immediate frontend re-insertion in the Vocab Lab Study page. |
| 2 | `phase2_study_refetch.md` | Implement the end-of-queue refetch polling to catch newly due learning cards. |
| 3 | `phase3_unit_learning.md` | Apply the re-insertion logic to the Foundation Vocabulary unit learning flow. |

## Key Files

- `frontend-web/src/app/vocab-lab/study/[deckId]/page.tsx` — Main SRS study session
- `frontend-web/src/app/ielts/vocabulary/[bookSlug]/[unitSlug]/page.tsx` — Foundation unit learning flow

## Design Principles
- **Predictability**: Users expect a card rated "Again" to stay in their active loop until they prove they know it.
- **Offline/Optimistic First**: Favoring frontend array manipulation (Option 2) prevents the user from being blocked by network latency just to see a card they failed 10 seconds ago.
