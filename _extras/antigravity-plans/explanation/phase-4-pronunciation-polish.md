# Pronunciation Scoring & UI Refinement Plan

This plan details the steps required to synchronize the frontend UI with the newly updated backend scoring algorithm, ensuring users are no longer confused by irrelevant metrics like "Confidence".

## Phase 1: Clean Up the Frontend UI (Hide Confidence)
Since the `backend-ai` server has been updated to remove the Whisper Confidence penalty (now weighting 70% Phoneme + 30% Text), the frontend must be updated so it doesn't mislead the user.

**Target File:** `frontend-web/src/app/ielts/pronunciation/sounds/[symbol]/_components/SoundDetailContent.tsx` (and `PronunciationRecorder.tsx` if applicable).
**Actions:**
1. Locate the JSX block rendering the three sub-score pillars: `PHONEME`, `CONFIDENCE`, and `TEXT`.
2. Remove the `CONFIDENCE` stat entirely from the UI display.
3. Center the remaining two stats (`PHONEME` and `TEXT MATCH`) so they look balanced within the card.
4. *Optional:* Rename "TEXT" to "WORD MATCH" in the UI, as it's easier for English learners to understand.

## Phase 2: Improve the Text Match Logic (Homophones)
Currently, Text Match uses raw spelling (Levenshtein distance). This means if a user practices the word "red" but the AI transcribes "read", the Text Match score will drop, even though the pronunciation is 100% correct. 

**Target File:** `backend-ai/app/services/pronunciation_service.py`
**Actions:**
1. Inside `analyze_pronunciation`, before calculating `Levenshtein.distance(t_norm, r_norm)`, add a dictionary of common English homophones.
2. If `t_norm` and `r_norm` are known homophones (e.g., `{"red": "read", "two": "to", "there": "their"}`), automatically set `text_score = 100.0`.
3. This ensures users are never penalized for saying the right sounds when English spelling is ambiguous.

## Phase 3: Enhanced Visual Feedback (Highlighting Mistakes)
The backend already returns a detailed `words_feedback` array containing `targetIPA` and `spokenIPA`. 

**Target File:** `frontend-web/src/app/ielts/pronunciation/sounds/[symbol]/_components/SoundDetailContent.tsx`
**Actions:**
1. Instead of just displaying the target IPA (e.g., `/ r ɛ d /`), implement a diff-checker UI.
2. If the user's `overallScore` is low, display their `spokenIPA` directly below the `targetIPA`, highlighting the exact phonemes that didn't match in red.
3. This turns the module from a simple "grading" tool into an actual "teaching" tool.
