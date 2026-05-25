# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-25T06:19:28.174Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 45 |
| Pass | 45 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 6872 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| — | — | sets currentStreak to 1 and lastActiveDate to today | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | sets longestStreak to at least 1 on first activity | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | increments currentStreak by 1 when lastActiveDate was yesterday | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | updates longestStreak when new streak exceeds previous longest | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | does not decrement longestStreak on reset | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns profile without calling update when lastActiveDate is today | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | does not fire gamification events on same-day no-op | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | passes XP proportional to new streak count (5 * newStreak) | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns null when profile does not exist | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns null and does not throw when Prisma throws | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns default values if profile does not exist | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns streak unmodified if lastActiveDate is null | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns streak unmodified if lastActiveDate is within 1 day (today) | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns streak unmodified if lastActiveDate is within 1 day (yesterday) | `modules/ielts/tests/streak.service.spec.ts` |
| — | — | returns currentStreak = 0 if lastActiveDate is more than 1 day ago | `modules/ielts/tests/streak.service.spec.ts` |
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
| TC11 | TC11_01 | GET /overview không có JWT → 401 | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_02 | GET /foundation không có JWT → 401 | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_04 | GET /foundation → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_05 | GET /basic → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_06 | GET /advanced → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_07 | GET /intensive → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | sets currentStreak to 1 and lastActiveDate to today | Pass | 7 | Auto (Jest) | 2026-05-25 |
| — | — | — | sets longestStreak to at least 1 on first activity | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | updates longestStreak when new streak exceeds previous longest | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | does not decrement longestStreak on reset | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns profile without calling update when lastActiveDate is today | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | does not fire gamification events on same-day no-op | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 2 | Auto (Jest) | 2026-05-25 |
| — | — | — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | passes XP proportional to new streak count (5 * newStreak) | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns null when profile does not exist | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns null and does not throw when Prisma throws | Pass | 2 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns default values if profile does not exist | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns streak unmodified if lastActiveDate is null | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns streak unmodified if lastActiveDate is within 1 day (today) | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns streak unmodified if lastActiveDate is within 1 day (yesterday) | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | returns currentStreak = 0 if lastActiveDate is more than 1 day ago | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | getListeningParts - should retrieve list sorted by part number | Pass | 6 | Auto (Jest) | 2026-05-25 |
| — | — | — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 11 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 2 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | getReadingParts - should retrieve list sorted by part number | Pass | 4 | Auto (Jest) | 2026-05-25 |
| — | — | — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 2 | Auto (Jest) | 2026-05-25 |
| — | — | — | createWritingSession - should return existing session if already in progress | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | createWritingSession - should create a new session if none is in progress | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | saveWritingDraft - should update draft for an active session | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | createSpeakingSession - should create new session or return in-progress one | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | getStatistics - should aggregate correct scores over sessions | Pass | 1 | Auto (Jest) | 2026-05-25 |
| — | — | — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 0 | Auto (Jest) | 2026-05-25 |
| — | — | — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 1 | Auto (Jest) | 2026-05-25 |
| TC11 | Invalid | TC11_01 | GET /overview không có JWT → 401 | Pass | 15 | Auto (Jest) | 2026-05-25 |
| TC11 | Invalid | TC11_02 | GET /foundation không có JWT → 401 | Pass | 2 | Auto (Jest) | 2026-05-25 |
| TC11 | Valid | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 2 | Auto (Jest) | 2026-05-25 |
| TC11 | Valid | TC11_04 | GET /foundation → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-05-25 |
| TC11 | Valid | TC11_05 | GET /basic → 200, đúng userId | Pass | 1 | Auto (Jest) | 2026-05-25 |
| TC11 | Valid | TC11_06 | GET /advanced → 200, đúng userId | Pass | 1 | Auto (Jest) | 2026-05-25 |
| TC11 | Valid | TC11_07 | GET /intensive → 200, đúng userId | Pass | 1 | Auto (Jest) | 2026-05-25 |

## 4. Chi tiết theo từng file spec

### `modules/ielts/tests/streak.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | sets currentStreak to 1 and lastActiveDate to today | Pass | 7 |
| — | sets longestStreak to at least 1 on first activity | Pass | 1 |
| — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 |
| — | updates longestStreak when new streak exceeds previous longest | Pass | 1 |
| — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 1 |
| — | does not decrement longestStreak on reset | Pass | 1 |
| — | returns profile without calling update when lastActiveDate is today | Pass | 1 |
| — | does not fire gamification events on same-day no-op | Pass | 0 |
| — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 2 |
| — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 0 |
| — | passes XP proportional to new streak count (5 * newStreak) | Pass | 0 |
| — | returns null when profile does not exist | Pass | 1 |
| — | returns null and does not throw when Prisma throws | Pass | 2 |
| — | returns default values if profile does not exist | Pass | 1 |
| — | returns streak unmodified if lastActiveDate is null | Pass | 1 |
| — | returns streak unmodified if lastActiveDate is within 1 day (today) | Pass | 0 |
| — | returns streak unmodified if lastActiveDate is within 1 day (yesterday) | Pass | 1 |
| — | returns currentStreak = 0 if lastActiveDate is more than 1 day ago | Pass | 0 |

### `modules/ielts/tests/ielts-advanced.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getListeningParts - should retrieve list sorted by part number | Pass | 6 |
| — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 11 |
| — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 2 |
| — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 |
| — | getReadingParts - should retrieve list sorted by part number | Pass | 4 |
| — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 1 |
| — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 |
| — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 0 |
| — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 2 |
| — | createWritingSession - should return existing session if already in progress | Pass | 1 |
| — | createWritingSession - should create a new session if none is in progress | Pass | 0 |
| — | saveWritingDraft - should update draft for an active session | Pass | 1 |
| — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 |
| — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 0 |
| — | createSpeakingSession - should create new session or return in-progress one | Pass | 1 |
| — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 1 |
| — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 0 |
| — | getStatistics - should aggregate correct scores over sessions | Pass | 1 |
| — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 0 |
| — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 1 |

### `modules/ielts/tests/ielts-statistics.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC11_01 | GET /overview không có JWT → 401 | Pass | 15 |
| TC11_02 | GET /foundation không có JWT → 401 | Pass | 2 |
| TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 2 |
| TC11_04 | GET /foundation → 200, đúng userId | Pass | 2 |
| TC11_05 | GET /basic → 200, đúng userId | Pass | 1 |
| TC11_06 | GET /advanced → 200, đúng userId | Pass | 1 |
| TC11_07 | GET /intensive → 200, đúng userId | Pass | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._