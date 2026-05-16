# Phase 1 — Đối chiếu Chương 4 (Báo cáo vs Code)

**Báo cáo nguồn:** `thesis-report/chapters/04-design.tex` (412 dòng)
**Phạm vi đối chiếu:** code thực tế của `backend-core`, `backend-ai`, `frontend-web`, `frontend-mobile`, `docker-compose.yml`, `.env`, `.github/workflows/`.
**Ngày đối chiếu:** 16/05/2026.
**Quy ước trạng thái:**
- `MISMATCH` — code có triển khai nhưng khác với mô tả trong báo cáo.
- `MISSING_IN_CODE` — báo cáo mô tả một thực thể/luồng nhưng không tìm thấy trong code.
- `MATCH` *(chỉ liệt kê khi cần đối chứng nhanh, không phải mục tiêu chính)*.

---

## 1. Bảng tổng hợp claim — trạng thái

| # | Claim trong báo cáo | Vị trí trong báo cáo | File code | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| 1 | Lớp `User` có các thuộc tính `id, email, passwordHash, role (learner/admin), failedAttempts, lockUntil, createdAt` | §4.1 dòng 9 | `backend-core/prisma/schema.prisma:21-71` | **MISMATCH** | Trường thực tế là `password` (không phải `passwordHash`). Enum `UserRole` có 3 giá trị `STUDENT / INSTRUCTOR / ADMIN` (không phải `learner/admin`). KHÔNG có `failedAttempts`, KHÔNG có `lockUntil`. Có thêm `googleId, avatar, firstName, lastName, isActive, updatedAt`. |
| 2 | Lớp `OtpToken` liên kết 1-nhiều với `User`, lưu mã OTP 6 chữ số và thời gian hết hạn | §4.1 dòng 9 | `backend-core/prisma/schema.prisma` | **MISSING_IN_CODE** | Không tồn tại model `OtpToken` trong schema. Không có flow xác thực OTP nào trong code. |
| 3 | Lớp `RefreshToken` lưu token theo từng phiên đăng nhập, cho phép vô hiệu hoá đơn lẻ | §4.1 dòng 9 | `backend-core/prisma/schema.prisma` | **MISSING_IN_CODE** | Không tồn tại model `RefreshToken` trong schema. JWT hiện chỉ có access token qua `@nestjs/jwt`, không có cơ chế refresh token bền vững trên DB. |
| 4 | Lớp `Skill` phân loại 4 kỹ năng (Listening, Reading, Writing, Speaking) | §4.1 dòng 11 | `backend-core/prisma/schema.prisma:848` | **MISMATCH** | Không có model `Skill` chung. Chỉ có `IeltsBasicSkill` (mapped `ielts_skills`) phục vụ riêng tier Basic. Các kỹ năng L/R/W/S được tách thành các bảng exercise riêng biệt theo tier (Basic/Advanced), không có bảng trung tâm phân loại. |
| 5 | Lớp `Exercise` liên kết với `Skill`, chứa nội dung bài tập (audio URL, passage, writing prompt) | §4.1 dòng 11 | `backend-core/prisma/schema.prisma:884-1166` | **MISMATCH** | Không có model `Exercise` thống nhất. Nội dung bài tập được tách thành: `IeltsBasicListeningExercise`, `IeltsBasicReadingExercise`, `IeltsBasicWritingExercise`, `IeltsBasicSpeakingExercise`, và tương ứng các cặp `IeltsAdvancedListening/Reading/Writing/SpeakingPart` + `Session`. |
| 6 | Lớp `UserExerciseResult` ghi nhận kết quả mỗi lần làm bài | §4.1 dòng 11 | `backend-core/prisma/schema.prisma` | **MISSING_IN_CODE** | Không có model `UserExerciseResult`. Kết quả được phân tán: `IeltsIntensiveResult` (cho mock test), `IeltsBasicProgress` (cho Basic), `IeltsBasicWritingAnswer`, `IeltsAdvancedWritingSession`, `IeltsAdvancedSpeakingSession` (kèm điểm chấm trong cùng bảng session). |
| 7 | Lớp `VocabularyItem` và `UserVocabularyCard` hiện thực Spaced Repetition với `easeFactor` và `nextReview` | §4.1 dòng 11 | `backend-core/prisma/schema.prisma:361-413, 596-639` | **MISMATCH** | Không có model `VocabularyItem` / `UserVocabularyCard`. Thay vào đó: (a) `FoundationVocabItem` (mapped `vocabulary_words`) chỉ lưu nội dung từ vựng, không có SR; (b) `Flashcard` (trong `Deck`) thuộc Vocab Lab dùng thuật toán **FSRS** (qua thư viện `ts-fsrs`) với các trường `stability, difficulty, due, scheduledDays, lapses, reps, lastReview, nextReviewDate, cardState` — **không có `easeFactor`** (đặc trưng của SM-2 cổ điển). |
| 8 | Lớp `ExamSession` và `ExamSectionDraft` quản lý phiên Mock Test với cơ chế **auto-save và khôi phục** | §4.1 dòng 11 | `backend-core/prisma/schema.prisma:118-149` | **MISMATCH + MISSING_IN_CODE** | `ExamSession` đã đổi tên thành `IeltsIntensiveSession` (vẫn `@@map("exam_sessions")`). Model `ExamSectionDraft` **không tồn tại** — không có bảng draft, không có cơ chế auto-save section drafts trên DB. CLAUDE.md cũng xác nhận engine dùng "programmatic Protect Session semantics" thay vì draft DB-side. |
| 9 | PostgreSQL 16 được triển khai **trực tiếp trên GCP VM**, kết nối qua `DATABASE_URL` chuẩn (port 5432) | §4.2 dòng 29 | `backend-core/.env:5-8`, CLAUDE.md | **MISMATCH** | Production thực tế dùng **Supabase managed PostgreSQL** qua PgBouncer: `aws-1-ap-southeast-1.pooler.supabase.com:6543` (pooled) + `:5432` (direct). VM chỉ chạy `backend-core + backend-ai + nginx + alloy`, **không host Postgres**. CLAUDE.md ghi rõ "Database: Supabase". |
| 10 | Nhóm Core & Auth gồm các bảng `users, otp_tokens, refresh_tokens, subscriptions, pricing_plans, payments, notifications` | §4.2 dòng 31 | `backend-core/prisma/schema.prisma` | **MISSING_IN_CODE** (một phần) | Bảng tồn tại: `users, subscriptions, pricing_plans, payments, notifications`. Bảng **không tồn tại**: `otp_tokens`, `refresh_tokens`. |
| 11 | Nhóm Learning gồm các bảng `skills, exercises, exercise_options, user_exercise_results, vocabulary_items, user_vocabulary_cards, exam_papers, exam_sessions, exam_section_drafts, mock_test_results` | §4.2 dòng 40 | `backend-core/prisma/schema.prisma` | **MISMATCH** | Bảng thực tế khác hoàn toàn. Tồn tại: `exam_sessions` (qua IeltsIntensiveSession), `exams` (qua IeltsIntensiveExam), `results` (qua IeltsIntensiveResult). **Không tồn tại** các bảng: `skills` (chỉ có `ielts_skills`), `exercises`, `exercise_options`, `user_exercise_results`, `vocabulary_items` (có `vocabulary_words`), `user_vocabulary_cards`, `exam_papers`, `exam_section_drafts`, `mock_test_results`. |
| 12 | Khoá ngoại `ON DELETE CASCADE` ở các bảng con | §4.2 dòng 40 | `backend-core/prisma/schema.prisma` | MATCH | Khẳng định đúng — hàng loạt quan hệ `onDelete: Cascade` xuất hiện trong schema. |
| 13 | Kiến trúc **Event-driven Modular Monolith** với **18 module nghiệp vụ** trong NestJS | §4.3 dòng 51 | `backend-core/src/app.module.ts:10-29` | MATCH | Đếm chính xác 18 feature module: Auth, Users, Exams, Results, Learning, AiClient, Ielts, Vocabulary, Grammar, Pronunciation, VocabLab, Notes, Shadowing, Dictation, Notifications, Posts, Gamification, Subscriptions. |
| 14 | Backend Core chạy port 3000 sau nginx reverse proxy | §4.3 dòng 53 | `backend-core/src/main.ts`, `docs/deployment/vm-config/nginx/` | MATCH | Đúng — nginx config hiện diện, port 3000 cấu hình mặc định. |
| 15 | FastAPI Worker consume từ `exam-grading-queue` trên RabbitMQ, gọi **Gemini API** để chấm điểm | §4.3 dòng 53 | `backend-ai/app/consumers/grading_consumer.py`, `backend-ai/app/main.py:14-46` | MATCH | `GradingConsumer` được khởi tạo trong lifespan; backend-ai có `writing_grader.py`/`speaking_grader.py` dùng Gemini. |
| 16 | FastAPI callback kết quả về NestJS qua REST | §4.3 dòng 53 | `backend-ai/app/config.py` (`backend_core_url`), CLAUDE.md | MATCH | Phù hợp với mô tả CLAUDE.md "Result delivery is HTTP callback to BACKEND_CORE_URL". |
| 17 | Google Cloud Storage (GCS) lưu trữ **file audio và hình ảnh** bài tập | §4.3 dòng 53 | `backend-core/src/common/storage/storage.service.ts`, `backend-ai/.env:18-19` | **MISMATCH** | GCS chỉ dùng cho audio (qua boto3 trong `backend-ai`). **Ảnh do người dùng/admin upload đi qua Cloudinary** (`storage.service.ts` dùng `cloudinary` v2 SDK; biến `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` trong `backend-core/.env:49-51`). CLAUDE.md xác nhận: "server-uploaded images go through Cloudinary". |
| 18 | Client gồm Next.js (Web) và React Native (Mobile) qua HTTPS | §4.3 dòng 53 | `frontend-web/`, `frontend-mobile/` | MATCH | Stack đúng (Next.js 14 + Expo/React Native 0.81). HTTPS qua nginx + Let's Encrypt theo CLAUDE.md. |
| 19 | Luồng web: Landing → Login/Register → Dashboard → 4 nhánh chính: **Luyện kỹ năng / Từ vựng / Mock Test / Kết quả** + nhánh Admin riêng | §4.4 dòng 66 | `frontend-web/src/app/` | **MISMATCH** | Cấu trúc thực tế phong phú hơn nhiều: `ielts/` (basic/advanced/intensive/dashboard/roadmap/statistics/history/calculator/pronunciation/grammar/vocabulary/student-teacher), `vocabulary/`, `grammar/`, `pronunciation/`, `vocab-lab/`, `lessons/`, `shadowing-dictation/`, `community/`, `pricing/`, `payment/`, `profile/`, `admin/`. **Không có route `results/` top-level** (kết quả nằm trong `ielts/`), cũng **không có route `mock-test/` riêng** (được gom dưới `ielts/intensive`). Mô tả "4 nhánh" oversimplify thực tế. |
| 20 | Mobile dùng **Tab Navigation** với **4 tab chính: Trang chủ / Luyện tập / Từ vựng / Hồ sơ** | §4.4 dòng 77 | `frontend-mobile/app/(tabs)/_layout.tsx:32-50` | **MISMATCH** | Tab thực tế có **5 tab hiển thị**: `Home (Trang chủ) / Explore / IELTS / Community / Profile`. **Không có tab "Luyện tập"** và **không có tab "Từ vựng"** ở tầng tabs. Các màn `vocablab`, `shadowing`, `pronunciation`, `vocabulary`, `more`, `grammar` đều dùng `href: null` (ẩn khỏi thanh tab) — truy cập qua điều hướng nội bộ. |
| 21 | Luồng Mock Test trên mobile là **fullscreen, có thanh điều hướng section cố định phía trên và nút đếm câu đã trả lời phía dưới** | §4.4 dòng 77 | `frontend-mobile/app/ielts/intensive/` | **MISSING_IN_CODE** (chưa xác minh được trong rà soát này) | Cần xem chi tiết các file intensive trên mobile để xác nhận layout — tài liệu CLAUDE.md ghi nhận memory `project_ielts_advanced_plan.md` có 11-gap analysis cho IELTS Advanced mobile, gợi ý rằng phần mobile intensive còn nhiều khoảng trống chưa hiện thực đầy đủ. Cần đối chiếu thêm ở Phase 2 nếu muốn khẳng định. |
| 22 | Trình bày **13 giao diện chính** của hệ thống trên Web | §4.5 dòng 88 | `thesis-report/figures/4.5. Program Interface/images/` (qua `\includegraphics`) | MATCH | Đếm chính xác 13 `\includegraphics` từ §4.5.1 đến §4.5.13. |
| 23 | Bốn giai đoạn tiến triển trên Dashboard: **Foundation / Basic / Advanced / Intensive** | §4.5 dòng 103 | `backend-core/prisma/schema.prisma` (tiền tố model + bảng `ielts_basic_*`, `ielts_advanced_*`, `IeltsIntensive*`, `Foundation*`) | MATCH | Sơ đồ phân tier thể hiện qua hệ thống naming convention models. |
| 24 | Speaking test gửi file âm thanh đi chấm bằng **Whisper + Gemini** | §4.5 dòng 169 | `backend-ai/app/services/transcription_service.py`, `backend-ai/app/services/speaking_grader.py` | MATCH | Khớp CLAUDE.md: faster-whisper (model `base`) cho transcription + Gemini cho rubric scoring. |
| 25 | Writing được chấm theo 4 tiêu chí IELTS (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) | §4.5 dòng 180 | `backend-ai/app/services/writing_grader.py` | MATCH | Là chuẩn IELTS chính thống; backend-ai có grader tương ứng. |
| 26 | Hệ thống dùng Jest 29.7.0 + Supertest cho backend | §4.6 dòng 237 | `backend-core/package.json:74,85,92` | MATCH | `"jest": "^29.7.0"`, `"@types/jest": "^29.5.11"`, `"supertest": "^7.2.2"`. |
| 27 | **60 test case** tổ chức thành **7 file spec**, phủ 7 nhóm chức năng (Đăng ký, Đăng nhập, Đăng bài, Thông báo, Cập nhật thông tin, Luyện phát âm, Thống kê IELTS) | §4.6 dòng 237 | `backend-core/src/modules/**/tests/*.spec.ts` | MATCH | 7 file spec, đếm `it()` lần lượt: `register=8 + login=5 + posts=11 + notifications=9 + update-profile=12 + pronunciation=8 + ielts-statistics=7 = 60`. Mã TC trong báo cáo (TC01, TC02, TC03, TC05, TC06, TC10, TC11) khớp với 7 nhóm thật. |
| 28 | Custom Jest reporter sinh markdown ra `docs/testing/test-results.md` qua `npm test` | §4.6 dòng 326 | `backend-core/test/reporters/markdown-reporter.js`, `backend-core/jest.config.ts:18-21`, `backend-core/docs/testing/test-results.md` | **MISMATCH** (nhẹ) | Custom reporter tồn tại. Tuy nhiên: (a) script `npm test` chạy mặc định **không** kèm reporter — chỉ `npm run test:report` (line 21 `package.json`) hoặc reporter mặc định trong `jest.config.ts` mới sinh markdown. (b) Output thực tế nằm tại `backend-core/docs/testing/test-results.md`, không phải `docs/testing/test-results.md` ở repo root như báo cáo gợi ý. |
| 29 | "Tất cả 60 test case đều đạt **Pass** trong $\leq$5 giây, xác nhận tầng backend hoạt động đúng theo yêu cầu đã đặc tả" | §4.6 dòng 326 | `backend-core/docs/testing/test-results.md` | (chưa kiểm) | Để xác nhận con số 5 giây cần chạy `npm run test:report` và đọc file kết quả mới nhất. Khuyến nghị Phase 2 chạy lại reporter để cập nhật báo cáo. |

---

## 2. Tóm tắt mức độ lệch

### 2.1 Sai lệch nghiêm trọng (cần sửa báo cáo trước khi nộp)

1. **Schema class diagram (§4.1) là phiên bản "lý tưởng hoá" hoặc giai đoạn đầu của hệ thống, không khớp code hiện tại.** Các tên class trong báo cáo (`OtpToken`, `RefreshToken`, `Skill`, `Exercise`, `UserExerciseResult`, `VocabularyItem`, `UserVocabularyCard`, `ExamSectionDraft`) đều **không tồn tại** trong schema. Trường `passwordHash, failedAttempts, lockUntil` trên `User` cũng không có. → Claim #1, #2, #3, #4, #5, #6, #7, #8.
2. **Hạ tầng PostgreSQL (§4.2, §4.3): báo cáo nói "trực tiếp trên GCP VM", thực tế dùng Supabase managed.** → Claim #9, #11.
3. **Tên các bảng ERD (§4.2) là tập danh nghĩa, không khớp `@@map` thật.** → Claim #10, #11.
4. **Lưu trữ media (§4.3): GCS dùng cho audio nhưng ảnh đi qua Cloudinary** — báo cáo bỏ sót Cloudinary. → Claim #17.
5. **Tab mobile (§4.4): mô tả 4 tab "Trang chủ / Luyện tập / Từ vựng / Hồ sơ" trong khi code có 5 tab "Home / Explore / IELTS / Community / Profile".** → Claim #20.

### 2.2 Sai lệch nhẹ / cần làm rõ

6. **Thuật toán Spaced Repetition (§4.1, §4.5.11): báo cáo nói "easeFactor" nhưng Vocab Lab thực tế dùng FSRS (qua `ts-fsrs`), không phải SM-2.** Nên sửa thành "stability/difficulty (FSRS)" để chính xác. → Claim #7.
7. **Sơ đồ luồng web (§4.4.1) oversimplify** — chỉ liệt kê 4 nhánh chính, bỏ sót Foundation, Vocab Lab, Community, Pricing, Profile, Admin tier sub-routes. → Claim #19.
8. **Đường dẫn `docs/testing/test-results.md` (§4.6):** thực ra ở `backend-core/docs/testing/test-results.md`. → Claim #28.

### 2.3 Khớp tốt (không cần sửa)

- Số module NestJS = 18 ✓ (Claim #13)
- Kiến trúc Event-driven + RabbitMQ + FastAPI Worker + Gemini ✓ (Claim #15, #16)
- Jest 29.7.0 + Supertest, 60 test/7 spec, 7 nhóm chức năng ✓ (Claim #26, #27)
- 13 hình UI, 4 giai đoạn Foundation/Basic/Advanced/Intensive, Whisper+Gemini cho Speaking, 4 tiêu chí Writing ✓ (Claim #22, #23, #24, #25)

---

## 3. Khuyến nghị hành động

| Ưu tiên | Hành động | Vị trí cần sửa |
|---|---|---|
| **Cao** | Vẽ lại class diagram §4.1 theo schema hiện tại (User không có `passwordHash/failedAttempts/lockUntil`; bỏ `OtpToken/RefreshToken/Skill/Exercise/UserExerciseResult/VocabularyItem/UserVocabularyCard/ExamSectionDraft`; thêm `Flashcard/Deck/IeltsIntensiveSession/IeltsBasicProgress/...`) | `thesis-report/chapters/04-design.tex:5-25` + ảnh `4.1. Class Diagram/*.png` |
| **Cao** | Sửa mô tả PostgreSQL: đổi "trực tiếp trên GCP VM" → "Supabase managed PostgreSQL (PgBouncer pooler `:6543`, direct `:5432`)" | `04-design.tex:29, 53` |
| **Cao** | Liệt kê đúng tên bảng `@@map` trong ERD: thay `skills/exercises/exercise_options/user_exercise_results/vocabulary_items/user_vocabulary_cards/exam_papers/exam_section_drafts/mock_test_results` bằng danh sách thực: `ielts_skills, ielts_listening_exercises, ielts_reading_exercises, ielts_writing_exercises, ielts_speaking_exercises, ielts_practice_*, ielts_advanced_*, ielts_basic_progress, vocabulary_books, vocabulary_units, vocabulary_words, vocabulary_progress, decks, flashcards, flashcard_reviews, exams, exam_sessions, results, ...` | `04-design.tex:31, 40` + ảnh ERD |
| **Cao** | Bổ sung Cloudinary cho lưu trữ ảnh trong sơ đồ kiến trúc | `04-design.tex:53` + ảnh `4.3. Architecture Diagram/architecture-diagram.png` |
| **Cao** | Cập nhật sơ đồ luồng mobile với 5 tab thật: `Home / Explore / IELTS / Community / Profile` | `04-design.tex:77` + ảnh `4.4. Flow Chart/2-flowchart-mobile.png` |
| **Trung** | Đổi mô tả thuật toán SR: "easeFactor" → "FSRS với stability/difficulty/due/cardState (thư viện `ts-fsrs`)" | `04-design.tex:11, 202` |
| **Trung** | Liệt kê thêm các nhánh chính trên web flowchart (Foundation, Vocab Lab, Community, Pricing) hoặc nói rõ "chỉ trình bày các nhánh trọng tâm" | `04-design.tex:66` + ảnh flowchart web |
| **Thấp** | Đính chính đường dẫn file kết quả test: `backend-core/docs/testing/test-results.md` | `04-design.tex:326` |
| **Thấp** | Chạy lại `npm run test:report` để chốt thời gian tổng test, dán số đo lên báo cáo thay vì gợi ý chung "$\leq$5 giây" | `04-design.tex:326` |

---

## 4. Phụ chú — Bằng chứng từ codebase

- `backend-core/prisma/schema.prisma` có **66 model** (mạch enumerate cho thấy không có model `OtpToken/RefreshToken/Skill/Exercise/UserExerciseResult/VocabularyItem/UserVocabularyCard/ExamSectionDraft`).
- `backend-core/.env:5-8`: `DATABASE_URL` trỏ về `aws-1-ap-southeast-1.pooler.supabase.com:6543` (Supabase) — đối chứng cuối cùng cho claim #9.
- `backend-core/src/app.module.ts:10-29`: import đúng 18 feature module.
- `frontend-mobile/app/(tabs)/_layout.tsx:32-50`: 5 `Tabs.Screen` hiển thị (`index, explore, ielts, community, profile`), các tab khác `href: null`.
- `backend-core/src/common/storage/storage.service.ts`: dùng `cloudinary` v2 — đối chứng cho claim #17.
- `backend-core/package.json:21,85,92`: `"test:report": "jest --silent --reporters=...markdown-reporter.js"`, `jest ^29.7.0`, `supertest ^7.2.2`.
- 7 file spec backend đếm test = `5 + 8 + 7 + 9 + 11 + 8 + 12 = 60` đúng claim #27.
