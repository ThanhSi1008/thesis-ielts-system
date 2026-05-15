# Phase 6: Final Polish & Gamification

> **Goal**: Integrate the Advanced Writing module into the wider platform ecosystem (gamification, statistics, subscriptions).

---

## 1. Gamification & Achievements

File: `backend-core/src/modules/gamification/gamification.service.ts`

When a user submits an Advanced Writing essay, emit an event. Update the gamification listener to reward XP and unlock achievements.

### New Achievement Keys
Add to DB seed / enum if applicable:
- `ADV_WRITING_FIRST`: "First Draft" (Complete first advanced writing practice)
- `ADV_WRITING_10`: "Consistent Writer" (Complete 10 writing practices)
- `ADV_WRITING_BAND_7`: "Band 7 Writer" (Score 7.0 or higher on any writing task)

### XP Rewards
- Base reward: +50 XP per submission
- High score bonus: +100 XP if band score >= 7.0

---

## 2. Statistics Integration

Update the Statistics dashboard so that Advanced Writing scores contribute to the user's overall IELTS profile.

Files to check:
- `backend-core/src/modules/ielts/ielts-advanced.service.ts` (getStatistics)
- `frontend-web/src/app/ielts/statistics/StatisticsContent.tsx`

**Required Data:**
- Average Band Score for Task 1
- Average Band Score for Task 2
- Total essays written
- Recent score trend (line chart mapping `bandScore` over `createdAt`)

---

## 3. Subscription & Quotas

The system currently uses an `AI_WRITING_GRADING` quota for the Intensive module. Ensure the Advanced module decrements this same quota.

File: `backend-core/src/modules/subscriptions/subscriptions.service.ts`

When a user submits a writing session:
1. Call `subscriptionsService.checkAndRecordUsage(userId, 'AI_WRITING_GRADING')`
2. If it throws a `QuotaExceededException`, catch it in the controller and return a 403.
3. Frontend should catch 403 and display the Premium Upsell modal.

---

## 4. Admin Tools (Optional Bonus)

To continuously expand the prompt library without scraping, add a simple admin script or endpoint that calls Gemini to generate *new* prompts.

```python
# Pseudo-prompt for Gemini to generate new prompts:
"Generate a new IELTS Writing Task 2 prompt about [topic]. Ensure it matches the difficulty and tone of official Cambridge materials. Output as JSON matching schema: { title, prompt, topic, suggestedTime: 40, minimumWords: 250 }"
```

These can be inserted directly into the `ielts_advanced_writing_prompts` table.

---

## 5. Security & Validation

- **Rate Limiting**: Apply strict rate limiting on the `/sessions/:id/submit` endpoint to prevent users from spamming the AI pipeline.
- **Input Validation**: Ensure `essay` text has a maximum character limit (e.g., 5000 chars) to prevent abuse of the Gemini token limit.
- **XSS Protection**: If rendering user essay text back to them, ensure React handles it safely (which it does by default, but verify no `dangerouslySetInnerHTML` is used inappropriately).

---

## Conclusion

This 6-phase plan provides a complete blueprint for the IELTS Advanced Writing module, from data acquisition through the new REST API, all the way to user interface, AI grading, and system integration.
