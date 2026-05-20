# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-20T13:20:16.699Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 45 |
| Pass | 45 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 8985 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| — | — | should return completedSentences or empty array if progress not found | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return completedSentences if progress exists in DB | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return mapped shadowing progress by lesson ID | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return completedSentences array and difficulty, or defaults if not found | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should return completedSentences and difficulty from DB when row exists | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should transition lesson to complete, notify user, and award completion achievements | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should NOT trigger completion notifications if lesson was already completed | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should return mapped dictation progress by lesson ID | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | getAllSounds - should read from Redis cache if available | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getAllSounds - should query DB and write to cache if cache is empty | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getSoundBySymbol - should return cached sound symbol if exists | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getSoundBySymbol - should query DB and cache if cache miss | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | createSound - should save sound and invalidate cache | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | updateSound - should update sound and invalidate cache | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | deleteSound - should delete sound and invalidate cache | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getUserProgress - should fetch user progress and join with all sounds | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getUserStats - should compute sound mastery metrics | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | createPronunciationAttempt - should create progress record in PENDING state | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | updatePronunciationAttempt - should update details | `modules/pronunciation/tests/pronunciation.service.spec.ts` |
| — | — | getListeningParts - should retrieve list sorted by part number | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitListeningPart - should evaluate answers correctly across all formats and create session | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitListeningPart - should reward extra high-score XP if score >= 80% | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getReadingParts - should retrieve list sorted by part number | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getReadingPartDetail - should throw NotFoundException if not exists | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitReadingPart - should evaluate answers correctly and award reading achievements | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getWritingPrompts - should return paginated list of prompts with best score mapping | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getWritingPromptDetail - should fetch prompt details along with active session and history | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | createWritingSession - should return existing session if already in progress | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | createWritingSession - should create a new session if none is in progress | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | saveWritingDraft - should update draft for an active session | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | createSpeakingSession - should create new session or return in-progress one | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitSpeakingSession - should fail if no audio answers are provided | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | submitSpeakingSession - should submit speaking answers and publish AI task | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getStatistics - should aggregate correct scores over sessions | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getHistoryDetail - should retrieve listening session detail and enforce ownership | `modules/ielts/tests/ielts-advanced.service.spec.ts` |
| — | — | getHistoryDetail - should throw NotFoundException on wrong ownership | `modules/ielts/tests/ielts-advanced.service.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | should return completedSentences or empty array if progress not found | Pass | 9 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences if progress exists in DB | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return mapped shadowing progress by lesson ID | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences array and difficulty, or defaults if not found | Pass | 10 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences and difficulty from DB when row exists | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should transition lesson to complete, notify user, and award completion achievements | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return mapped dictation progress by lesson ID | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getAllSounds - should read from Redis cache if available | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | — | — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createSound - should save sound and invalidate cache | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | updateSound - should update sound and invalidate cache | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | deleteSound - should delete sound and invalidate cache | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | getUserProgress - should fetch user progress and join with all sounds | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getUserStats - should compute sound mastery metrics | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | updatePronunciationAttempt - should update details | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getListeningParts - should retrieve list sorted by part number | Pass | 10 | Auto (Jest) | 2026-05-20 |
| — | — | — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 13 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getReadingParts - should retrieve list sorted by part number | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createWritingSession - should return existing session if already in progress | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createWritingSession - should create a new session if none is in progress | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | saveWritingDraft - should update draft for an active session | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createSpeakingSession - should create new session or return in-progress one | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | getStatistics - should aggregate correct scores over sessions | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 1 | Auto (Jest) | 2026-05-20 |

## 4. Chi tiết theo từng file spec

### `modules/shadowing/tests/shadowing-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences or empty array if progress not found | Pass | 9 |
| — | should return completedSentences if progress exists in DB | Pass | 2 |
| — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 1 |
| — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 1 |
| — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 |
| — | should return mapped shadowing progress by lesson ID | Pass | 1 |

### `modules/dictation/tests/dictation-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences array and difficulty, or defaults if not found | Pass | 10 |
| — | should return completedSentences and difficulty from DB when row exists | Pass | 1 |
| — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 1 |
| — | should transition lesson to complete, notify user, and award completion achievements | Pass | 1 |
| — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 |
| — | should return mapped dictation progress by lesson ID | Pass | 1 |

### `modules/pronunciation/tests/pronunciation.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getAllSounds - should read from Redis cache if available | Pass | 8 |
| — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 1 |
| — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 1 |
| — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 1 |
| — | createSound - should save sound and invalidate cache | Pass | 1 |
| — | updateSound - should update sound and invalidate cache | Pass | 1 |
| — | deleteSound - should delete sound and invalidate cache | Pass | 2 |
| — | getUserProgress - should fetch user progress and join with all sounds | Pass | 1 |
| — | getUserStats - should compute sound mastery metrics | Pass | 1 |
| — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 1 |
| — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 2 |
| — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 |
| — | updatePronunciationAttempt - should update details | Pass | 1 |

### `modules/ielts/tests/ielts-advanced.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getListeningParts - should retrieve list sorted by part number | Pass | 10 |
| — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 13 |
| — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 1 |
| — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 |
| — | getReadingParts - should retrieve list sorted by part number | Pass | 1 |
| — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 0 |
| — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 |
| — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 |
| — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 1 |
| — | createWritingSession - should return existing session if already in progress | Pass | 1 |
| — | createWritingSession - should create a new session if none is in progress | Pass | 0 |
| — | saveWritingDraft - should update draft for an active session | Pass | 1 |
| — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 |
| — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 1 |
| — | createSpeakingSession - should create new session or return in-progress one | Pass | 0 |
| — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 1 |
| — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 0 |
| — | getStatistics - should aggregate correct scores over sessions | Pass | 2 |
| — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 1 |
| — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._