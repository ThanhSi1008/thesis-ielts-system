# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-06-02T00:18:41.036Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 255 |
| Pass | 255 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 60562 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
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
| — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | creates XpLog with correct fields | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | updates IeltsProfile with new totalXp | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | does not crash when IeltsProfile does not exist | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | sends ACHIEVEMENT notification when level increases | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | does not send notification when level stays the same | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | skips UserAchievement.create when achievement already earned | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | skips XpLog.create entirely | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | still processes achievementKeys even when xp = 0 | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | grants achievement and sends notification when not yet earned | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | no-ops when achievement definition is missing in DB | `modules/gamification/tests/gamification.service.spec.ts` |
| — | — | saves card with stability > 0 and due > now | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | creates a FlashcardReview record | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | resets stability to ~0.4 (FSRS Again default) | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | schedules due within ~10 minutes for Again on new card | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | scheduledDays(Easy) >= scheduledDays(Good) | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | throws NotFoundException when deck.userId !== caller userId | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | throws NotFoundException when card does not exist | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | excludes review cards with due > now | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | throws NotFoundException when deck not found or not owned | `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts` |
| — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_04: sessionId không tồn tại → 404 | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_02: Session đã GRADED → 200, full result shape | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | `modules/results/tests/results.spec.ts` |
| — | — | findAll — returns list of safe users | `modules/users/tests/users.service.spec.ts` |
| — | — | findOne — returns user when found | `modules/users/tests/users.service.spec.ts` |
| — | — | findOne — returns null when not found | `modules/users/tests/users.service.spec.ts` |
| — | — | update — successfully updates and returns user | `modules/users/tests/users.service.spec.ts` |
| — | — | update — throws BadRequestException on P2002 duplicate key constraint | `modules/users/tests/users.service.spec.ts` |
| — | — | update — rethrows other errors | `modules/users/tests/users.service.spec.ts` |
| — | — | remove — deletes the user and returns success message | `modules/users/tests/users.service.spec.ts` |
| — | — | linkTeacher — throws error if teacher does not exist | `modules/users/tests/users.service.spec.ts` |
| — | — | linkTeacher — throws error if student attempts to link to themselves | `modules/users/tests/users.service.spec.ts` |
| — | — | linkTeacher — upserts link successfully | `modules/users/tests/users.service.spec.ts` |
| — | — | getLinkedTeachers — returns all active links for student | `modules/users/tests/users.service.spec.ts` |
| — | — | getLinkedStudents — returns all active links for teacher | `modules/users/tests/users.service.spec.ts` |
| — | — | unlinkTeacher — removes the student-teacher link | `modules/users/tests/users.service.spec.ts` |
| — | — | throws error if teacher and student are not linked | `modules/users/tests/users.service.spec.ts` |
| — | — | throws error if link is not active | `modules/users/tests/users.service.spec.ts` |
| — | — | successfully queries and maps stats when linked | `modules/users/tests/users.service.spec.ts` |
| — | — | updateAvatar — updates avatar url | `modules/users/tests/users.service.spec.ts` |
| — | — | addPushToken — upserts push token registration | `modules/users/tests/users.service.spec.ts` |
| — | — | removePushToken — deletes token records | `modules/users/tests/users.service.spec.ts` |
| — | — | getRecentActivity — creates profile if missing | `modules/users/tests/users.service.spec.ts` |
| — | — | getRecentActivity — handles race condition on profile creation | `modules/users/tests/users.service.spec.ts` |
| — | — | getRecentActivity — lists and calculates today study minutes correctly | `modules/users/tests/users.service.spec.ts` |
| — | — | getRecentActivity — provides smart recommendations when activities are missing | `modules/users/tests/users.service.spec.ts` |
| — | — | getRecommended — returns the smart recommendations directly | `modules/users/tests/users.service.spec.ts` |
| — | — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | `../test/edge-cases/pagination.spec.ts` |
| — | — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | `../test/edge-cases/boundary-values.spec.ts` |
| — | — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | `../test/edge-cases/boundary-values.spec.ts` |
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
| — | — | TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken } | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_03_02: refresh token expired → 401 Unauthorized | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully" | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect" | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in" | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default" | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token" | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_AUTH_05_04: thiếu field email trong payload → 400 | `modules/auth/tests/auth-extended.spec.ts` |
| — | — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | `modules/exams/tests/result-callback.spec.ts` |
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
| — | — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | should call service.getExamNotes with queries | `modules/notes/tests/notes.controller.spec.ts` |
| — | — | should call service.upsertNote with dto data | `modules/notes/tests/notes.controller.spec.ts` |
| — | — | should call service.deleteNote with param id and request user id | `modules/notes/tests/notes.controller.spec.ts` |
| — | — | should return completedSentences or empty array if progress not found | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return completedSentences if progress exists in DB | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return mapped shadowing progress by lesson ID | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should compile and resolve NotesModule dependencies | `modules/notes/tests/notes.module.spec.ts` |
| — | — | should call $connect on onModuleInit | `common/prisma/tests/prisma.service.spec.ts` |
| — | — | should call $disconnect on onModuleDestroy | `common/prisma/tests/prisma.service.spec.ts` |
| — | — | should fetch exam notes ordered by questionNumber asc | `modules/notes/tests/notes.service.spec.ts` |
| — | — | should upsert a note successfully | `modules/notes/tests/notes.service.spec.ts` |
| — | — | should throw NotFoundException if note to delete does not exist | `modules/notes/tests/notes.service.spec.ts` |
| — | — | should delete the note if it exists | `modules/notes/tests/notes.service.spec.ts` |
| — | — | TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | TC_EXAM_02: submit session đã GRADED → 400 "Session already graded" | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | TC_EXAM_03: submit session thuộc user khác → 403 Access denied | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | TC_EXAM_05: submit không có token → 401 Unauthorized | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | TC_EXAM_06: sessionId không tồn tại → 404 Not Found | `modules/exams/tests/exams-submit.spec.ts` |
| — | — | should return completedSentences array and difficulty, or defaults if not found | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should return completedSentences and difficulty from DB when row exists | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should transition lesson to complete, notify user, and award completion achievements | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should NOT trigger completion notifications if lesson was already completed | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | should return mapped dictation progress by lesson ID | `modules/dictation/tests/dictation-progress.service.spec.ts` |
| — | — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | `modules/subscriptions/tests/subscriptions.cron.spec.ts` |
| — | — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | `modules/subscriptions/tests/subscriptions.cron.spec.ts` |
| — | — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | should allow access (return true) if no required roles are specified | `common/guards/tests/roles.guard.spec.ts` |
| — | — | should allow access (return true) if required roles list is empty | `common/guards/tests/roles.guard.spec.ts` |
| — | — | should throw ForbiddenException if user is not present in request | `common/guards/tests/roles.guard.spec.ts` |
| — | — | should throw ForbiddenException if user role does not match required roles | `common/guards/tests/roles.guard.spec.ts` |
| — | — | should allow access (return true) if user role matches required roles | `common/guards/tests/roles.guard.spec.ts` |
| — | — | should return the correct health status and fallback environment to development | `app.service.spec.ts` |
| — | — | should return the environment set in NODE_ENV | `app.service.spec.ts` |
| — | — | should return root metadata | `app.controller.spec.ts` |
| — | — | should call appService.getHealth | `app.controller.spec.ts` |
| TC01 | TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_02 | email sai định dạng → 400 "Invalid email format" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_08 | không truyền role → mặc định "STUDENT"; truyền role hợp lệ (TEACHER) → tôn trọng giá trị | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_09 | truyền role ADMIN → 400 (vai trò không được phép tự gán) | `modules/auth/tests/register.spec.ts` |
| TC02 | TC02_01 | email đúng + password sai → 401 "Invalid credentials" | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_02 | email không tồn tại + password đúng → 401 | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_03 | cả email và password đều sai → 401 | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_04 | payload thiếu password → 401 (passport-local từ chối) | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | `modules/auth/tests/login.spec.ts` |
| TC03 | TC03_01 | body rỗng → 400 (MinLength 1) | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_02 | body quá dài (> 10000 ký tự) → 400 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_03 | type không thuộc enum PostType → 400 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_04 | không có JWT → 401 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_09 | like trên post đã like → unlike, trả { liked: false } | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_10 | like post không tồn tại → 404 Not Found | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | `modules/posts/tests/posts.spec.ts` |
| TC05 | TC05_01 | không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_02 | GET /unread-count không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_03 | DELETE /:id không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_09 | DELETE /:id → 200, xoá notification thuộc user | `modules/notifications/tests/notifications.spec.ts` |
| TC06 | TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_02 | email sai định dạng → 400 "Invalid email format" | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_04 | isActive không phải boolean → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_05 | firstName là số → 400 (IsString) | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_08 | cập nhật email mới hợp lệ → 200 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | `modules/users/tests/update-profile.spec.ts` |
| TC10 | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_04 | không có JWT → 401 | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | `modules/pronunciation/tests/pronunciation.spec.ts` |
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
| — | — | — | getAllSounds - should read from Redis cache if available | Pass | 8 | Auto (Jest) | 2026-06-02 |
| — | — | — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | createSound - should save sound and invalidate cache | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | updateSound - should update sound and invalidate cache | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | deleteSound - should delete sound and invalidate cache | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | getUserProgress - should fetch user progress and join with all sounds | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | getUserStats - should compute sound mastery metrics | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | updatePronunciationAttempt - should update details | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 23 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | creates XpLog with correct fields | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | updates IeltsProfile with new totalXp | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | does not crash when IeltsProfile does not exist | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | sends ACHIEVEMENT notification when level increases | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | does not send notification when level stays the same | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | skips UserAchievement.create when achievement already earned | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | skips XpLog.create entirely | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | still processes achievementKeys even when xp = 0 | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | — | — | grants achievement and sends notification when not yet earned | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | no-ops when achievement definition is missing in DB | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | saves card with stability > 0 and due > now | Pass | 14 | Auto (Jest) | 2026-06-02 |
| — | — | — | creates a FlashcardReview record | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | resets stability to ~0.4 (FSRS Again default) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | schedules due within ~10 minutes for Again on new card | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | scheduledDays(Easy) >= scheduledDays(Good) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | throws NotFoundException when deck.userId !== caller userId | Pass | 53 | Auto (Jest) | 2026-06-02 |
| — | — | — | throws NotFoundException when card does not exist | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | excludes review cards with due > now | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | — | — | throws NotFoundException when deck not found or not owned | Pass | 11 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 28 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_RES_04: sessionId không tồn tại → 404 | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | Valid | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Pass | 19 | Auto (Jest) | 2026-06-02 |
| — | Valid | — | TC_RES_02: Session đã GRADED → 200, full result shape | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | Valid | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | findAll — returns list of safe users | Pass | 15 | Auto (Jest) | 2026-06-02 |
| — | — | — | findOne — returns user when found | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | findOne — returns null when not found | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | update — successfully updates and returns user | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | update — throws BadRequestException on P2002 duplicate key constraint | Pass | 31 | Auto (Jest) | 2026-06-02 |
| — | — | — | update — rethrows other errors | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | remove — deletes the user and returns success message | Pass | 8 | Auto (Jest) | 2026-06-02 |
| — | — | — | linkTeacher — throws error if teacher does not exist | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | linkTeacher — throws error if student attempts to link to themselves | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | linkTeacher — upserts link successfully | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | getLinkedTeachers — returns all active links for student | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getLinkedStudents — returns all active links for teacher | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | unlinkTeacher — removes the student-teacher link | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | throws error if teacher and student are not linked | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | throws error if link is not active | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | successfully queries and maps stats when linked | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | updateAvatar — updates avatar url | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | addPushToken — upserts push token registration | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | removePushToken — deletes token records | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | — | — | getRecentActivity — creates profile if missing | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | getRecentActivity — handles race condition on profile creation | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | getRecentActivity — lists and calculates today study minutes correctly | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | getRecentActivity — provides smart recommendations when activities are missing | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | getRecommended — returns the smart recommendations directly | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 54 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 41 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 10 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 10 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 101 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 29 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 9 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | getListeningParts - should retrieve list sorted by part number | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 22 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getReadingParts - should retrieve list sorted by part number | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | createWritingSession - should return existing session if already in progress | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | createWritingSession - should create a new session if none is in progress | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | saveWritingDraft - should update draft for an active session | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | createSpeakingSession - should create new session or return in-progress one | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getStatistics - should aggregate correct scores over sessions | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken } | Pass | 98 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_03_02: refresh token expired → 401 Unauthorized | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully" | Pass | 209 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect" | Pass | 89 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in" | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default" | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token" | Pass | 8 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_AUTH_05_04: thiếu field email trong payload → 400 | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 20 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 8 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 7 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | Pass | 19 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | sets currentStreak to 1 and lastActiveDate to today | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | sets longestStreak to at least 1 on first activity | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | updates longestStreak when new streak exceeds previous longest | Pass | 11 | Auto (Jest) | 2026-06-02 |
| — | — | — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | does not decrement longestStreak on reset | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns profile without calling update when lastActiveDate is today | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | does not fire gamification events on same-day no-op | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | passes XP proportional to new streak count (5 * newStreak) | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns null when profile does not exist | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns null and does not throw when Prisma throws | Pass | 9 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns default values if profile does not exist | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns streak unmodified if lastActiveDate is null | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns streak unmodified if lastActiveDate is within 1 day (today) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns streak unmodified if lastActiveDate is within 1 day (yesterday) | Pass | 8 | Auto (Jest) | 2026-06-02 |
| — | — | — | returns currentStreak = 0 if lastActiveDate is more than 1 day ago | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call service.getExamNotes with queries | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call service.upsertNote with dto data | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call service.deleteNote with param id and request user id | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return completedSentences or empty array if progress not found | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return completedSentences if progress exists in DB | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return mapped shadowing progress by lesson ID | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should compile and resolve NotesModule dependencies | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call $connect on onModuleInit | Pass | 30 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call $disconnect on onModuleDestroy | Pass | 9 | Auto (Jest) | 2026-06-02 |
| — | — | — | should fetch exam notes ordered by questionNumber asc | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | should upsert a note successfully | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should throw NotFoundException if note to delete does not exist | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | should delete the note if it exists | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload | Pass | 44 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_02: submit session đã GRADED → 400 "Session already graded" | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_03: submit session thuộc user khác → 403 Access denied | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED | Pass | 4 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_05: submit không có token → 401 Unauthorized | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_EXAM_06: sessionId không tồn tại → 404 Not Found | Pass | 2 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return completedSentences array and difficulty, or defaults if not found | Pass | 3 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return completedSentences and difficulty from DB when row exists | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should transition lesson to complete, notify user, and award completion achievements | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return mapped dictation progress by lesson ID | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | Pass | 6 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should allow access (return true) if no required roles are specified | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should allow access (return true) if required roles list is empty | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should throw ForbiddenException if user is not present in request | Pass | 5 | Auto (Jest) | 2026-06-02 |
| — | — | — | should throw ForbiddenException if user role does not match required roles | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should allow access (return true) if user role matches required roles | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return the correct health status and fallback environment to development | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return the environment set in NODE_ENV | Pass | 0 | Auto (Jest) | 2026-06-02 |
| — | — | — | should return root metadata | Pass | 1 | Auto (Jest) | 2026-06-02 |
| — | — | — | should call appService.getHealth | Pass | 1 | Auto (Jest) | 2026-06-02 |
| TC01 | Invalid | TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 88 | Auto (Jest) | 2026-06-02 |
| TC01 | Invalid | TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 9 | Auto (Jest) | 2026-06-02 |
| TC01 | Invalid | TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC01 | Invalid | TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 78 | Auto (Jest) | 2026-06-02 |
| TC01 | Valid | TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 59 | Auto (Jest) | 2026-06-02 |
| TC01 | Valid | TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 143 | Auto (Jest) | 2026-06-02 |
| TC01 | Valid | TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 92 | Auto (Jest) | 2026-06-02 |
| TC01 | Valid | TC01_08 | không truyền role → mặc định "STUDENT"; truyền role hợp lệ (TEACHER) → tôn trọng giá trị | Pass | 176 | Auto (Jest) | 2026-06-02 |
| TC01 | Valid | TC01_09 | truyền role ADMIN → 400 (vai trò không được phép tự gán) | Pass | 7 | Auto (Jest) | 2026-06-02 |
| TC02 | Invalid | TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 72 | Auto (Jest) | 2026-06-02 |
| TC02 | Invalid | TC02_02 | email không tồn tại + password đúng → 401 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC02 | Invalid | TC02_03 | cả email và password đều sai → 401 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC02 | Invalid | TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC02 | Valid | TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 75 | Auto (Jest) | 2026-06-02 |
| TC03 | Invalid | TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 20 | Auto (Jest) | 2026-06-02 |
| TC03 | Invalid | TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 16 | Auto (Jest) | 2026-06-02 |
| TC03 | Invalid | TC03_03 | type không thuộc enum PostType → 400 | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC03 | Invalid | TC03_04 | không có JWT → 401 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 9 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_10 | like post không tồn tại → 404 Not Found | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC03 | Valid | TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC05 | Invalid | TC05_01 | không có JWT → 401 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC05 | Invalid | TC05_02 | GET /unread-count không có JWT → 401 | Pass | 1 | Auto (Jest) | 2026-06-02 |
| TC05 | Invalid | TC05_03 | DELETE /:id không có JWT → 401 | Pass | 1 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 1 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 1 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC05 | Valid | TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 12 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_04 | isActive không phải boolean → 400 | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_05 | firstName là số → 400 (IsString) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC06 | Invalid | TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 20 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 11 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC06 | Valid | TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 18 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_04 | không có JWT → 401 | Pass | 8 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC10 | — | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 4 | Auto (Jest) | 2026-06-02 |
| TC11 | Invalid | TC11_01 | GET /overview không có JWT → 401 | Pass | 12 | Auto (Jest) | 2026-06-02 |
| TC11 | Invalid | TC11_02 | GET /foundation không có JWT → 401 | Pass | 5 | Auto (Jest) | 2026-06-02 |
| TC11 | Valid | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC11 | Valid | TC11_04 | GET /foundation → 200, đúng userId | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC11 | Valid | TC11_05 | GET /basic → 200, đúng userId | Pass | 3 | Auto (Jest) | 2026-06-02 |
| TC11 | Valid | TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-06-02 |
| TC11 | Valid | TC11_07 | GET /intensive → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-06-02 |

## 4. Chi tiết theo từng file spec

### `modules/pronunciation/tests/pronunciation.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getAllSounds - should read from Redis cache if available | Pass | 8 |
| — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 2 |
| — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 1 |
| — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 2 |
| — | createSound - should save sound and invalidate cache | Pass | 3 |
| — | updateSound - should update sound and invalidate cache | Pass | 3 |
| — | deleteSound - should delete sound and invalidate cache | Pass | 2 |
| — | getUserProgress - should fetch user progress and join with all sounds | Pass | 4 |
| — | getUserStats - should compute sound mastery metrics | Pass | 4 |
| — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 3 |
| — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 2 |
| — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 |
| — | updatePronunciationAttempt - should update details | Pass | 2 |

### `modules/subscriptions/tests/subscriptions.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 6 |
| — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 23 |
| — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 |
| — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 1 |
| — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 |
| — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 |

### `modules/gamification/tests/gamification.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | creates XpLog with correct fields | Pass | 3 |
| — | updates IeltsProfile with new totalXp | Pass | 2 |
| — | does not crash when IeltsProfile does not exist | Pass | 2 |
| — | sends ACHIEVEMENT notification when level increases | Pass | 1 |
| — | does not send notification when level stays the same | Pass | 5 |
| — | skips UserAchievement.create when achievement already earned | Pass | 1 |
| — | skips XpLog.create entirely | Pass | 4 |
| — | still processes achievementKeys even when xp = 0 | Pass | 7 |
| — | grants achievement and sends notification when not yet earned | Pass | 1 |
| — | no-ops when achievement definition is missing in DB | Pass | 1 |

### `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | saves card with stability > 0 and due > now | Pass | 14 |
| — | creates a FlashcardReview record | Pass | 2 |
| — | resets stability to ~0.4 (FSRS Again default) | Pass | 3 |
| — | schedules due within ~10 minutes for Again on new card | Pass | 1 |
| — | scheduledDays(Easy) >= scheduledDays(Good) | Pass | 3 |
| — | throws NotFoundException when deck.userId !== caller userId | Pass | 53 |
| — | throws NotFoundException when card does not exist | Pass | 5 |
| — | returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now | Pass | 4 |
| — | excludes review cards with due > now | Pass | 7 |
| — | throws NotFoundException when deck not found or not owned | Pass | 11 |

### `modules/results/tests/results.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 28 |
| — | TC_RES_04: sessionId không tồn tại → 404 | Pass | 5 |
| — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Pass | 4 |
| — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Pass | 19 |
| — | TC_RES_02: Session đã GRADED → 200, full result shape | Pass | 7 |
| — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Pass | 3 |

### `modules/users/tests/users.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | findAll — returns list of safe users | Pass | 15 |
| — | findOne — returns user when found | Pass | 4 |
| — | findOne — returns null when not found | Pass | 2 |
| — | update — successfully updates and returns user | Pass | 3 |
| — | update — throws BadRequestException on P2002 duplicate key constraint | Pass | 31 |
| — | update — rethrows other errors | Pass | 3 |
| — | remove — deletes the user and returns success message | Pass | 8 |
| — | linkTeacher — throws error if teacher does not exist | Pass | 0 |
| — | linkTeacher — throws error if student attempts to link to themselves | Pass | 2 |
| — | linkTeacher — upserts link successfully | Pass | 0 |
| — | getLinkedTeachers — returns all active links for student | Pass | 1 |
| — | getLinkedStudents — returns all active links for teacher | Pass | 1 |
| — | unlinkTeacher — removes the student-teacher link | Pass | 0 |
| — | throws error if teacher and student are not linked | Pass | 1 |
| — | throws error if link is not active | Pass | 1 |
| — | successfully queries and maps stats when linked | Pass | 2 |
| — | updateAvatar — updates avatar url | Pass | 3 |
| — | addPushToken — upserts push token registration | Pass | 3 |
| — | removePushToken — deletes token records | Pass | 7 |
| — | getRecentActivity — creates profile if missing | Pass | 4 |
| — | getRecentActivity — handles race condition on profile creation | Pass | 2 |
| — | getRecentActivity — lists and calculates today study minutes correctly | Pass | 3 |
| — | getRecentActivity — provides smart recommendations when activities are missing | Pass | 6 |
| — | getRecommended — returns the smart recommendations directly | Pass | 2 |

### `../test/edge-cases/pagination.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 54 |
| — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 4 |
| — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 41 |
| — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 10 |
| — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 2 |
| — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 6 |
| — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 5 |
| — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 10 |

### `../test/edge-cases/boundary-values.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 101 |
| — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 29 |
| — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 2 |
| — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 9 |
| — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 7 |
| — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 2 |
| — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 2 |
| — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 3 |

### `modules/ielts/tests/ielts-advanced.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getListeningParts - should retrieve list sorted by part number | Pass | 2 |
| — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 22 |
| — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 2 |
| — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 1 |
| — | getReadingParts - should retrieve list sorted by part number | Pass | 2 |
| — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 1 |
| — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 1 |
| — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 |
| — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 1 |
| — | createWritingSession - should return existing session if already in progress | Pass | 0 |
| — | createWritingSession - should create a new session if none is in progress | Pass | 6 |
| — | saveWritingDraft - should update draft for an active session | Pass | 1 |
| — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 5 |
| — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 4 |
| — | createSpeakingSession - should create new session or return in-progress one | Pass | 0 |
| — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 2 |
| — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 1 |
| — | getStatistics - should aggregate correct scores over sessions | Pass | 1 |
| — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 0 |
| — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 3 |

### `modules/auth/tests/auth-extended.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken } | Pass | 98 |
| — | TC_AUTH_03_02: refresh token expired → 401 Unauthorized | Pass | 3 |
| — | TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized | Pass | 2 |
| — | TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully" | Pass | 209 |
| — | TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect" | Pass | 89 |
| — | TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in" | Pass | 5 |
| — | TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default" | Pass | 5 |
| — | TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường | Pass | 3 |
| — | TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token" | Pass | 8 |
| — | TC_AUTH_05_04: thiếu field email trong payload → 400 | Pass | 4 |

### `../test/security/cross-user-access.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 20 |
| — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 8 |
| — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 1 |
| — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 | Pass | 2 |
| — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 2 |
| — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 7 |
| — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 2 |
| — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Pass | 1 |

### `modules/exams/tests/result-callback.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | Pass | 19 |
| — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | Pass | 2 |
| — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | Pass | 2 |
| — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | Pass | 4 |

### `modules/ielts/tests/streak.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | sets currentStreak to 1 and lastActiveDate to today | Pass | 3 |
| — | sets longestStreak to at least 1 on first activity | Pass | 1 |
| — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 |
| — | updates longestStreak when new streak exceeds previous longest | Pass | 11 |
| — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 3 |
| — | does not decrement longestStreak on reset | Pass | 1 |
| — | returns profile without calling update when lastActiveDate is today | Pass | 2 |
| — | does not fire gamification events on same-day no-op | Pass | 0 |
| — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 2 |
| — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 2 |
| — | passes XP proportional to new streak count (5 * newStreak) | Pass | 1 |
| — | returns null when profile does not exist | Pass | 4 |
| — | returns null and does not throw when Prisma throws | Pass | 9 |
| — | returns default values if profile does not exist | Pass | 2 |
| — | returns streak unmodified if lastActiveDate is null | Pass | 1 |
| — | returns streak unmodified if lastActiveDate is within 1 day (today) | Pass | 3 |
| — | returns streak unmodified if lastActiveDate is within 1 day (yesterday) | Pass | 8 |
| — | returns currentStreak = 0 if lastActiveDate is more than 1 day ago | Pass | 4 |

### `modules/subscriptions/tests/subscriptions-webhook.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | Pass | 3 |
| — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | Pass | 3 |
| — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | Pass | 2 |
| — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | Pass | 2 |
| — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | Pass | 2 |

### `modules/notes/tests/notes.controller.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should call service.getExamNotes with queries | Pass | 1 |
| — | should call service.upsertNote with dto data | Pass | 2 |
| — | should call service.deleteNote with param id and request user id | Pass | 1 |

### `modules/shadowing/tests/shadowing-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences or empty array if progress not found | Pass | 3 |
| — | should return completedSentences if progress exists in DB | Pass | 1 |
| — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 1 |
| — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 0 |
| — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 |
| — | should return mapped shadowing progress by lesson ID | Pass | 0 |

### `modules/notes/tests/notes.module.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should compile and resolve NotesModule dependencies | Pass | 4 |

### `common/prisma/tests/prisma.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should call $connect on onModuleInit | Pass | 30 |
| — | should call $disconnect on onModuleDestroy | Pass | 9 |

### `modules/notes/tests/notes.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should fetch exam notes ordered by questionNumber asc | Pass | 5 |
| — | should upsert a note successfully | Pass | 1 |
| — | should throw NotFoundException if note to delete does not exist | Pass | 6 |
| — | should delete the note if it exists | Pass | 6 |

### `modules/exams/tests/exams-submit.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload | Pass | 44 |
| — | TC_EXAM_02: submit session đã GRADED → 400 "Session already graded" | Pass | 5 |
| — | TC_EXAM_03: submit session thuộc user khác → 403 Access denied | Pass | 5 |
| — | TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED | Pass | 4 |
| — | TC_EXAM_05: submit không có token → 401 Unauthorized | Pass | 3 |
| — | TC_EXAM_06: sessionId không tồn tại → 404 Not Found | Pass | 2 |

### `modules/dictation/tests/dictation-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences array and difficulty, or defaults if not found | Pass | 3 |
| — | should return completedSentences and difficulty from DB when row exists | Pass | 1 |
| — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 1 |
| — | should transition lesson to complete, notify user, and award completion achievements | Pass | 0 |
| — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 |
| — | should return mapped dictation progress by lesson ID | Pass | 1 |

### `modules/subscriptions/tests/subscriptions.cron.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | Pass | 1 |
| — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | Pass | 0 |

### `modules/auth/tests/jwt-strategy.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | Pass | 1 |
| — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | Pass | 6 |
| — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | Pass | 1 |
| — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 |
| — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 |

### `common/guards/tests/roles.guard.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should allow access (return true) if no required roles are specified | Pass | 0 |
| — | should allow access (return true) if required roles list is empty | Pass | 0 |
| — | should throw ForbiddenException if user is not present in request | Pass | 5 |
| — | should throw ForbiddenException if user role does not match required roles | Pass | 0 |
| — | should allow access (return true) if user role matches required roles | Pass | 0 |

### `app.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return the correct health status and fallback environment to development | Pass | 1 |
| — | should return the environment set in NODE_ENV | Pass | 0 |

### `app.controller.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return root metadata | Pass | 1 |
| — | should call appService.getHealth | Pass | 1 |

### `modules/auth/tests/register.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 88 |
| TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 9 |
| TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 2 |
| TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 78 |
| TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 59 |
| TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 143 |
| TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 92 |
| TC01_08 | không truyền role → mặc định "STUDENT"; truyền role hợp lệ (TEACHER) → tôn trọng giá trị | Pass | 176 |
| TC01_09 | truyền role ADMIN → 400 (vai trò không được phép tự gán) | Pass | 7 |

### `modules/auth/tests/login.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 72 |
| TC02_02 | email không tồn tại + password đúng → 401 | Pass | 2 |
| TC02_03 | cả email và password đều sai → 401 | Pass | 2 |
| TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 3 |
| TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 75 |

### `modules/posts/tests/posts.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 20 |
| TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 16 |
| TC03_03 | type không thuộc enum PostType → 400 | Pass | 4 |
| TC03_04 | không có JWT → 401 | Pass | 2 |
| TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 4 |
| TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 9 |
| TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 5 |
| TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 5 |
| TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 3 |
| TC03_10 | like post không tồn tại → 404 Not Found | Pass | 2 |
| TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 5 |

### `modules/notifications/tests/notifications.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC05_01 | không có JWT → 401 | Pass | 2 |
| TC05_02 | GET /unread-count không có JWT → 401 | Pass | 1 |
| TC05_03 | DELETE /:id không có JWT → 401 | Pass | 1 |
| TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 4 |
| TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 |
| TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 1 |
| TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 1 |
| TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 2 |
| TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 3 |

### `modules/users/tests/update-profile.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 12 |
| TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 4 |
| TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 4 |
| TC06_04 | isActive không phải boolean → 400 | Pass | 3 |
| TC06_05 | firstName là số → 400 (IsString) | Pass | 3 |
| TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 20 |
| TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 5 |
| TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 11 |
| TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 4 |
| TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 3 |
| TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 3 |
| TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 3 |

### `modules/pronunciation/tests/pronunciation.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 18 |
| TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 5 |
| TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 |
| TC10_04 | không có JWT → 401 | Pass | 8 |
| TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 3 |
| TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 3 |
| TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 3 |
| TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 4 |

### `modules/ielts/tests/ielts-statistics.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC11_01 | GET /overview không có JWT → 401 | Pass | 12 |
| TC11_02 | GET /foundation không có JWT → 401 | Pass | 5 |
| TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 3 |
| TC11_04 | GET /foundation → 200, đúng userId | Pass | 3 |
| TC11_05 | GET /basic → 200, đúng userId | Pass | 3 |
| TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 |
| TC11_07 | GET /intensive → 200, đúng userId | Pass | 2 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._