# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-20T13:45:17.690Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 207 |
| Pass | 207 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 63714 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
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
| — | — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | `modules/subscriptions/tests/subscriptions-webhook.spec.ts` |
| — | — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | `modules/exams/tests/result-callback.spec.ts` |
| — | — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | `modules/exams/tests/result-callback.spec.ts` |
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
| — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_04: sessionId không tồn tại → 404 | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_02: Session đã GRADED → 200, full result shape | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | `modules/results/tests/results.spec.ts` |
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
| — | — | should return completedSentences or empty array if progress not found | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return completedSentences if progress exists in DB | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | should return mapped shadowing progress by lesson ID | `modules/shadowing/tests/shadowing-progress.service.spec.ts` |
| — | — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | `modules/subscriptions/tests/subscriptions.cron.spec.ts` |
| — | — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | `modules/subscriptions/tests/subscriptions.cron.spec.ts` |
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
| — | — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | `modules/auth/tests/jwt-strategy.spec.ts` |
| — | — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | `modules/auth/tests/jwt-strategy.spec.ts` |
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
| — | — | — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 18 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 6 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 7 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 39 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 9 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 7 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 7 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | Pass | 88 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | Pass | 9 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | Pass | 29 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | Pass | 7 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | Pass | 10 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | Pass | 38 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | Pass | 6 | Auto (Jest) | 2026-05-20 |
| — | — | — | getAllSounds - should read from Redis cache if available | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | createSound - should save sound and invalidate cache | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | updateSound - should update sound and invalidate cache | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | deleteSound - should delete sound and invalidate cache | Pass | 29 | Auto (Jest) | 2026-05-20 |
| — | — | — | getUserProgress - should fetch user progress and join with all sounds | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | getUserStats - should compute sound mastery metrics | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | updatePronunciationAttempt - should update details | Pass | 19 | Auto (Jest) | 2026-05-20 |
| — | — | — | saves card with stability > 0 and due > now | Pass | 57 | Auto (Jest) | 2026-05-20 |
| — | — | — | creates a FlashcardReview record | Pass | 22 | Auto (Jest) | 2026-05-20 |
| — | — | — | resets stability to ~0.4 (FSRS Again default) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | schedules due within ~10 minutes for Again on new card | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | scheduledDays(Easy) >= scheduledDays(Good) | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | throws NotFoundException when deck.userId !== caller userId | Pass | 98 | Auto (Jest) | 2026-05-20 |
| — | — | — | throws NotFoundException when card does not exist | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now | Pass | 15 | Auto (Jest) | 2026-05-20 |
| — | — | — | excludes review cards with due > now | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | throws NotFoundException when deck not found or not owned | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 53 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_RES_04: sessionId không tồn tại → 404 | Pass | 55 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Pass | 51 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_02: Session đã GRADED → 200, full result shape | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Pass | 13 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload | Pass | 44 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_02: submit session đã GRADED → 400 "Session already graded" | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_03: submit session thuộc user khác → 403 Access denied | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_05: submit không có token → 401 Unauthorized | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EXAM_06: sessionId không tồn tại → 404 Not Found | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences array and difficulty, or defaults if not found | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences and difficulty from DB when row exists | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | should transition lesson to complete, notify user, and award completion achievements | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return mapped dictation progress by lesson ID | Pass | 15 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences or empty array if progress not found | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return completedSentences if progress exists in DB | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | should return mapped shadowing progress by lesson ID | Pass | 29 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getListeningParts - should retrieve list sorted by part number | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 76 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | getReadingParts - should retrieve list sorted by part number | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 10 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | createWritingSession - should return existing session if already in progress | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | createWritingSession - should create a new session if none is in progress | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | saveWritingDraft - should update draft for an active session | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | createSpeakingSession - should create new session or return in-progress one | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | getStatistics - should aggregate correct scores over sessions | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | creates XpLog with correct fields | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | updates IeltsProfile with new totalXp | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | does not crash when IeltsProfile does not exist | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | sends ACHIEVEMENT notification when level increases | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | does not send notification when level stays the same | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | skips UserAchievement.create when achievement already earned | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | skips XpLog.create entirely | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | still processes achievementKeys even when xp = 0 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | grants achievement and sends notification when not yet earned | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | no-ops when achievement definition is missing in DB | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | Pass | 8 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | sets currentStreak to 1 and lastActiveDate to today | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | sets longestStreak to at least 1 on first activity | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | updates longestStreak when new streak exceeds previous longest | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | does not decrement longestStreak on reset | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | returns profile without calling update when lastActiveDate is today | Pass | 0 | Auto (Jest) | 2026-05-20 |
| — | — | — | does not fire gamification events on same-day no-op | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | passes XP proportional to new streak count (5 * newStreak) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | returns null when profile does not exist | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | returns null and does not throw when Prisma throws | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken } | Pass | 12 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_03_02: refresh token expired → 401 Unauthorized | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully" | Pass | 208 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect" | Pass | 52 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in" | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default" | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token" | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_AUTH_05_04: thiếu field email trong payload → 400 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 12 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Pass | 1 | Auto (Jest) | 2026-05-20 |
| TC01 | Invalid | TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 58 | Auto (Jest) | 2026-05-20 |
| TC01 | Invalid | TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC01 | Invalid | TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 13 | Auto (Jest) | 2026-05-20 |
| TC01 | Invalid | TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 209 | Auto (Jest) | 2026-05-20 |
| TC01 | Valid | TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 80 | Auto (Jest) | 2026-05-20 |
| TC01 | Valid | TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 158 | Auto (Jest) | 2026-05-20 |
| TC01 | Valid | TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 114 | Auto (Jest) | 2026-05-20 |
| TC01 | Valid | TC01_08 | không truyền role → mặc định "STUDENT"; truyền role hợp lệ (TEACHER) → tôn trọng giá trị | Pass | 140 | Auto (Jest) | 2026-05-20 |
| TC01 | Valid | TC01_09 | truyền role ADMIN → 400 (vai trò không được phép tự gán) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC02 | Invalid | TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 160 | Auto (Jest) | 2026-05-20 |
| TC02 | Invalid | TC02_02 | email không tồn tại + password đúng → 401 | Pass | 12 | Auto (Jest) | 2026-05-20 |
| TC02 | Invalid | TC02_03 | cả email và password đều sai → 401 | Pass | 10 | Auto (Jest) | 2026-05-20 |
| TC02 | Invalid | TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 12 | Auto (Jest) | 2026-05-20 |
| TC02 | Valid | TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 110 | Auto (Jest) | 2026-05-20 |
| TC03 | Invalid | TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 54 | Auto (Jest) | 2026-05-20 |
| TC03 | Invalid | TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC03 | Invalid | TC03_03 | type không thuộc enum PostType → 400 | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC03 | Invalid | TC03_04 | không có JWT → 401 | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 6 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 12 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 36 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_10 | like post không tồn tại → 404 Not Found | Pass | 1 | Auto (Jest) | 2026-05-20 |
| TC03 | Valid | TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC05 | Invalid | TC05_01 | không có JWT → 401 | Pass | 19 | Auto (Jest) | 2026-05-20 |
| TC05 | Invalid | TC05_02 | GET /unread-count không có JWT → 401 | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC05 | Invalid | TC05_03 | DELETE /:id không có JWT → 401 | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC05 | Valid | TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 39 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 22 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 6 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_04 | isActive không phải boolean → 400 | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_05 | firstName là số → 400 (IsString) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC06 | Invalid | TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 39 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 16 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 9 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 6 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC06 | Valid | TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 138 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 12 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_04 | không có JWT → 401 | Pass | 14 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 4 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 5 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 59 | Auto (Jest) | 2026-05-20 |
| TC10 | — | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC11 | Invalid | TC11_01 | GET /overview không có JWT → 401 | Pass | 31 | Auto (Jest) | 2026-05-20 |
| TC11 | Invalid | TC11_02 | GET /foundation không có JWT → 401 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC11 | Valid | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC11 | Valid | TC11_04 | GET /foundation → 200, đúng userId | Pass | 3 | Auto (Jest) | 2026-05-20 |
| TC11 | Valid | TC11_05 | GET /basic → 200, đúng userId | Pass | 35 | Auto (Jest) | 2026-05-20 |
| TC11 | Valid | TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-05-20 |
| TC11 | Valid | TC11_07 | GET /intensive → 200, đúng userId | Pass | 4 | Auto (Jest) | 2026-05-20 |

## 4. Chi tiết theo từng file spec

### `../test/edge-cases/pagination.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 18 |
| — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 3 |
| — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 3 |
| — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 6 |
| — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 4 |
| — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 1 |
| — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 5 |
| — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 7 |

### `../test/edge-cases/boundary-values.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 39 |
| — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 8 |
| — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 2 |
| — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 9 |
| — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 7 |
| — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 5 |
| — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 7 |
| — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 5 |

### `modules/subscriptions/tests/subscriptions-webhook.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum) | Pass | 88 |
| — | TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM | Pass | 9 |
| — | TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi | Pass | 2 |
| — | TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit | Pass | 29 |
| — | TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef) | Pass | 7 |

### `modules/exams/tests/result-callback.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK | Pass | 10 |
| — | TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB | Pass | 38 |
| — | TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè | Pass | 4 |
| — | TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request | Pass | 6 |

### `modules/pronunciation/tests/pronunciation.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getAllSounds - should read from Redis cache if available | Pass | 4 |
| — | getAllSounds - should query DB and write to cache if cache is empty | Pass | 2 |
| — | getSoundBySymbol - should return cached sound symbol if exists | Pass | 4 |
| — | getSoundBySymbol - should query DB and cache if cache miss | Pass | 2 |
| — | createSound - should save sound and invalidate cache | Pass | 5 |
| — | updateSound - should update sound and invalidate cache | Pass | 3 |
| — | deleteSound - should delete sound and invalidate cache | Pass | 29 |
| — | getUserProgress - should fetch user progress and join with all sounds | Pass | 3 |
| — | getUserStats - should compute sound mastery metrics | Pass | 3 |
| — | getWordProgress - should fetch example words and evaluate mastery statuses based on attempts | Pass | 5 |
| — | updateProgress - should upsert progress record, invalidate cache and award gamification XP | Pass | 1 |
| — | createPronunciationAttempt - should create progress record in PENDING state | Pass | 1 |
| — | updatePronunciationAttempt - should update details | Pass | 19 |

### `modules/vocab-lab/tests/vocab-lab-fsrs.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | saves card with stability > 0 and due > now | Pass | 57 |
| — | creates a FlashcardReview record | Pass | 22 |
| — | resets stability to ~0.4 (FSRS Again default) | Pass | 2 |
| — | schedules due within ~10 minutes for Again on new card | Pass | 1 |
| — | scheduledDays(Easy) >= scheduledDays(Good) | Pass | 3 |
| — | throws NotFoundException when deck.userId !== caller userId | Pass | 98 |
| — | throws NotFoundException when card does not exist | Pass | 2 |
| — | returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now | Pass | 15 |
| — | excludes review cards with due > now | Pass | 4 |
| — | throws NotFoundException when deck not found or not owned | Pass | 1 |

### `modules/subscriptions/tests/subscriptions.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 3 |
| — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 53 |
| — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 |
| — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 1 |
| — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 |
| — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 |

### `modules/results/tests/results.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 3 |
| — | TC_RES_04: sessionId không tồn tại → 404 | Pass | 55 |
| — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Pass | 8 |
| — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Pass | 51 |
| — | TC_RES_02: Session đã GRADED → 200, full result shape | Pass | 2 |
| — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Pass | 13 |

### `modules/exams/tests/exams-submit.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload | Pass | 44 |
| — | TC_EXAM_02: submit session đã GRADED → 400 "Session already graded" | Pass | 8 |
| — | TC_EXAM_03: submit session thuộc user khác → 403 Access denied | Pass | 2 |
| — | TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED | Pass | 1 |
| — | TC_EXAM_05: submit không có token → 401 Unauthorized | Pass | 1 |
| — | TC_EXAM_06: sessionId không tồn tại → 404 Not Found | Pass | 1 |

### `modules/dictation/tests/dictation-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences array and difficulty, or defaults if not found | Pass | 2 |
| — | should return completedSentences and difficulty from DB when row exists | Pass | 1 |
| — | should create new progress, award sentence XP, but NOT complete lesson if sentences < total | Pass | 0 |
| — | should transition lesson to complete, notify user, and award completion achievements | Pass | 1 |
| — | should NOT trigger completion notifications if lesson was already completed | Pass | 1 |
| — | should return mapped dictation progress by lesson ID | Pass | 15 |

### `modules/shadowing/tests/shadowing-progress.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | should return completedSentences or empty array if progress not found | Pass | 2 |
| — | should return completedSentences if progress exists in DB | Pass | 1 |
| — | should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched | Pass | 0 |
| — | should complete shadowing video and award lesson completion achievements when all sentences matched | Pass | 1 |
| — | should NOT trigger sentence XP if new completion count is not greater than existing count | Pass | 1 |
| — | should return mapped shadowing progress by lesson ID | Pass | 29 |

### `modules/subscriptions/tests/subscriptions.cron.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE | Pass | 0 |
| — | TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade | Pass | 1 |

### `modules/ielts/tests/ielts-advanced.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | getListeningParts - should retrieve list sorted by part number | Pass | 4 |
| — | getListeningPartDetail - should throw NotFoundException when part doesn't exist | Pass | 76 |
| — | submitListeningPart - should evaluate answers correctly across all formats and create session | Pass | 4 |
| — | submitListeningPart - should reward extra high-score XP if score >= 80% | Pass | 3 |
| — | getReadingParts - should retrieve list sorted by part number | Pass | 3 |
| — | getReadingPartDetail - should throw NotFoundException if not exists | Pass | 10 |
| — | submitReadingPart - should evaluate answers correctly and award reading achievements | Pass | 8 |
| — | getWritingPrompts - should return paginated list of prompts with best score mapping | Pass | 1 |
| — | getWritingPromptDetail - should fetch prompt details along with active session and history | Pass | 3 |
| — | createWritingSession - should return existing session if already in progress | Pass | 2 |
| — | createWritingSession - should create a new session if none is in progress | Pass | 1 |
| — | saveWritingDraft - should update draft for an active session | Pass | 1 |
| — | saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist | Pass | 1 |
| — | submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task | Pass | 1 |
| — | createSpeakingSession - should create new session or return in-progress one | Pass | 2 |
| — | submitSpeakingSession - should fail if no audio answers are provided | Pass | 2 |
| — | submitSpeakingSession - should submit speaking answers and publish AI task | Pass | 2 |
| — | getStatistics - should aggregate correct scores over sessions | Pass | 1 |
| — | getHistoryDetail - should retrieve listening session detail and enforce ownership | Pass | 1 |
| — | getHistoryDetail - should throw NotFoundException on wrong ownership | Pass | 2 |

### `modules/gamification/tests/gamification.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | creates XpLog with correct fields | Pass | 2 |
| — | updates IeltsProfile with new totalXp | Pass | 1 |
| — | does not crash when IeltsProfile does not exist | Pass | 2 |
| — | sends ACHIEVEMENT notification when level increases | Pass | 2 |
| — | does not send notification when level stays the same | Pass | 1 |
| — | skips UserAchievement.create when achievement already earned | Pass | 1 |
| — | skips XpLog.create entirely | Pass | 0 |
| — | still processes achievementKeys even when xp = 0 | Pass | 1 |
| — | grants achievement and sends notification when not yet earned | Pass | 5 |
| — | no-ops when achievement definition is missing in DB | Pass | 0 |

### `modules/auth/tests/jwt-strategy.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_JWT_01: payload hợp lệ → validate() trả { id, email, role } | Pass | 0 |
| — | TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException | Pass | 8 |
| — | TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException | Pass | 1 |
| — | TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException) | Pass | 5 |
| — | TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException) | Pass | 0 |

### `modules/ielts/tests/streak.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | sets currentStreak to 1 and lastActiveDate to today | Pass | 2 |
| — | sets longestStreak to at least 1 on first activity | Pass | 1 |
| — | increments currentStreak by 1 when lastActiveDate was yesterday | Pass | 1 |
| — | updates longestStreak when new streak exceeds previous longest | Pass | 1 |
| — | resets currentStreak to 1 when lastActiveDate was 2+ days ago | Pass | 1 |
| — | does not decrement longestStreak on reset | Pass | 3 |
| — | returns profile without calling update when lastActiveDate is today | Pass | 0 |
| — | does not fire gamification events on same-day no-op | Pass | 1 |
| — | calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7 | Pass | 1 |
| — | sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7) | Pass | 1 |
| — | passes XP proportional to new streak count (5 * newStreak) | Pass | 1 |
| — | returns null when profile does not exist | Pass | 1 |
| — | returns null and does not throw when Prisma throws | Pass | 2 |

### `modules/auth/tests/auth-extended.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken } | Pass | 12 |
| — | TC_AUTH_03_02: refresh token expired → 401 Unauthorized | Pass | 4 |
| — | TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized | Pass | 3 |
| — | TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully" | Pass | 208 |
| — | TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect" | Pass | 52 |
| — | TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in" | Pass | 2 |
| — | TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default" | Pass | 3 |
| — | TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường | Pass | 1 |
| — | TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token" | Pass | 4 |
| — | TC_AUTH_05_04: thiếu field email trong payload → 400 | Pass | 1 |

### `../test/security/cross-user-access.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 12 |
| — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 2 |
| — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 1 |
| — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 | Pass | 1 |
| — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 1 |
| — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 1 |
| — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 1 |
| — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Pass | 1 |

### `modules/auth/tests/register.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 58 |
| TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 3 |
| TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 13 |
| TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 209 |
| TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 80 |
| TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 158 |
| TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 114 |
| TC01_08 | không truyền role → mặc định "STUDENT"; truyền role hợp lệ (TEACHER) → tôn trọng giá trị | Pass | 140 |
| TC01_09 | truyền role ADMIN → 400 (vai trò không được phép tự gán) | Pass | 5 |

### `modules/auth/tests/login.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 160 |
| TC02_02 | email không tồn tại + password đúng → 401 | Pass | 12 |
| TC02_03 | cả email và password đều sai → 401 | Pass | 10 |
| TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 12 |
| TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 110 |

### `modules/posts/tests/posts.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 54 |
| TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 3 |
| TC03_03 | type không thuộc enum PostType → 400 | Pass | 5 |
| TC03_04 | không có JWT → 401 | Pass | 5 |
| TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 6 |
| TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 12 |
| TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 2 |
| TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 4 |
| TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 36 |
| TC03_10 | like post không tồn tại → 404 Not Found | Pass | 1 |
| TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 2 |

### `modules/notifications/tests/notifications.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC05_01 | không có JWT → 401 | Pass | 19 |
| TC05_02 | GET /unread-count không có JWT → 401 | Pass | 3 |
| TC05_03 | DELETE /:id không có JWT → 401 | Pass | 4 |
| TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 5 |
| TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 |
| TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 2 |
| TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 2 |
| TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 3 |
| TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 39 |

### `modules/users/tests/update-profile.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 22 |
| TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 6 |
| TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 2 |
| TC06_04 | isActive không phải boolean → 400 | Pass | 4 |
| TC06_05 | firstName là số → 400 (IsString) | Pass | 5 |
| TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 39 |
| TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 16 |
| TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 2 |
| TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 9 |
| TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 6 |
| TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 3 |
| TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 4 |

### `modules/pronunciation/tests/pronunciation.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 138 |
| TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 12 |
| TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 |
| TC10_04 | không có JWT → 401 | Pass | 14 |
| TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 4 |
| TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 5 |
| TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 59 |
| TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 3 |

### `modules/ielts/tests/ielts-statistics.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC11_01 | GET /overview không có JWT → 401 | Pass | 31 |
| TC11_02 | GET /foundation không có JWT → 401 | Pass | 2 |
| TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 2 |
| TC11_04 | GET /foundation → 200, đúng userId | Pass | 3 |
| TC11_05 | GET /basic → 200, đúng userId | Pass | 35 |
| TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 |
| TC11_07 | GET /intensive → 200, đúng userId | Pass | 4 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._