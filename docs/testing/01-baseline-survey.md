# Báo cáo khảo sát nền tảng kiểm thử — Backend Core

> **Ngày khảo sát:** 2026-05-16
> **Phạm vi:** `backend-core` (NestJS 10) là trọng tâm; có đối chiếu nhanh sang `backend-ai`, `frontend-web`, `frontend-mobile`.
> **Mục tiêu:** Chuẩn bị nền tảng cho Chương 4 — *Kiểm thử hệ thống* trong báo cáo khóa luận.

---

## 1. Tổng quan kết luận

| Hạng mục | Kết quả |
|---|---|
| Tổng số module nghiệp vụ trong `backend-core/src/modules/` | **18 module** |
| Tổng số controller | **30 file controller** |
| Tổng số service | **34 file service** |
| Tổng số `model` trong `prisma/schema.prisma` | **66 model** (1.465 dòng) |
| Tổng số `enum` trong schema | **14 enum** |
| Số file `*.spec.ts` / `*.test.ts` hiện có | **0 file** (chưa có test) |
| Cấu hình Jest unit test | Đã khai báo inline trong `package.json` |
| Cấu hình Jest e2e (`test/jest-e2e.json`) | **Đã tạo mới trong khảo sát này** |
| Test packages còn thiếu trước khảo sát | `supertest`, `@types/supertest` |
| Test packages sau khảo sát | **Đầy đủ** (đã cài thêm 2 package) |

---

## 2. Cấu trúc backend NestJS (`backend-core/src/`)

### 2.1 Lớp common (cơ sở hạ tầng)

| Module | File chính | Vai trò |
|---|---|---|
| `PrismaModule` | `common/prisma/prisma.module.ts`, `prisma.service.ts` | Bao bọc PrismaClient, đăng ký `@Global()` |
| `RedisModule` | `common/redis/redis.module.ts`, `redis.service.ts` | Kết nối Upstash Redis qua ioredis (TLS) |
| `CacheModule` | `common/cache/cache.module.ts`, `cache-invalidation.service.ts` | Wrapper cache cấp ứng dụng |
| `StorageModule` | `common/storage/storage.module.ts`, `storage.service.ts` | Cloudinary v2 (upload, delete) |

### 2.2 Lớp module nghiệp vụ (`src/modules/`)

Tổng cộng 18 module được khai báo trong `app.module.ts`. Bảng dưới đây liệt kê toàn bộ controller và service của từng module.

#### 2.2.1 `AuthModule` (xác thực)

- Controllers: `auth.controller.ts`
- Services: `auth.service.ts`
- Chức năng: Đăng ký, đăng nhập email/password (bcrypt) và Google OAuth (google-auth-library), phát hành JWT.

#### 2.2.2 `UsersModule`

- Controllers: `users.controller.ts`
- Services: `users.service.ts`
- Chức năng: Quản trị hồ sơ người dùng, vai trò (`STUDENT / INSTRUCTOR / ADMIN`).

#### 2.2.3 `ExamsModule`

- Controllers: `exams.controller.ts`
- Services: `exams.service.ts`
- Chức năng: CRUD đề thi IELTS Intensive (mock test).

#### 2.2.4 `ResultsModule`

- Controllers: `results.controller.ts`
- Services: `results.service.ts`
- Chức năng: Lưu trữ và truy vấn kết quả chấm thi (`IeltsIntensiveResult`).

#### 2.2.5 `LearningModule`

- Controllers: `learning.controller.ts`
- Services: `learning.service.ts`
- Chức năng: Quản lý tài liệu học (`LearningMaterial`) và tiến độ học (`LearningProgress`) — *legacy, đã được thay thế bởi các module Foundation*.

#### 2.2.6 `AiClientModule`

- Controllers: `chat.controller.ts`
- Services: `ai-client.service.ts`
- Chức năng: Phát message lên RabbitMQ tới `backend-ai`; expose chat tutor endpoint.

#### 2.2.7 `IeltsModule` (lớn nhất)

- Controllers: `ielts.controller.ts`, `ielts-advanced.controller.ts`, `ielts-statistics.controller.ts`
- Services: `ielts.service.ts`, `ielts-advanced.service.ts`, `ielts-roadmap.service.ts`, `ielts-statistics.service.ts`, `streak.service.ts`
- Chức năng: Toàn bộ luồng IELTS Foundation/Basic/Advanced, lộ trình học cá nhân hóa, thống kê và streak.

#### 2.2.8 `VocabularyModule`

- Controllers: `foundationVocabWord.controller.ts`
- Services: `foundationVocabWord.service.ts`
- Chức năng: Quản lý từ vựng Foundation (book → unit → item → question).

#### 2.2.9 `GrammarModule`

- Controllers: `grammar.controller.ts`
- Services: `grammar.service.ts`
- Chức năng: Quản lý ngữ pháp Foundation (book → unit → exercise).

#### 2.2.10 `PronunciationModule`

- Controllers: `pronunciation.controller.ts`
- Services: `pronunciation.service.ts`
- Chức năng: Phát âm Foundation (sound → example → progress); kết nối worker chấm IPA ở `backend-ai`.

#### 2.2.11 `VocabLabModule`

- Controllers: `vocab-lab.controller.ts`
- Services: `vocab-lab.service.ts`
- Chức năng: Spaced repetition flashcard sử dụng `ts-fsrs` (deck, flashcard, review).

#### 2.2.12 `NotesModule`

- Controllers: `notes.controller.ts`
- Services: `notes.service.ts`
- Chức năng: Ghi chú câu hỏi (`QuestionNote`).

#### 2.2.13 `ShadowingModule` (đa controller)

- Controllers (6): `admin-shadowing.controller.ts`, `shadowing-folders.controller.ts`, `shadowing-lessons.controller.ts`, `shadowing-progress.controller.ts`, `shadowing-videos.controller.ts`, `shadowing-webhook.controller.ts`
- Services (5): `admin-shadowing.service.ts`, `shadowing-folders.service.ts`, `shadowing-lessons.service.ts`, `shadowing-progress.service.ts`, `shadowing-videos.service.ts`
- Chức năng: Luyện shadowing với video YouTube — folder, lesson, video, tiến độ và webhook callback transcript.

#### 2.2.14 `DictationModule` (đa controller)

- Controllers (6): `admin-dictation.controller.ts`, `dictation-folders.controller.ts`, `dictation-lessons.controller.ts`, `dictation-progress.controller.ts`, `dictation-videos.controller.ts`, `dictation-webhook.controller.ts`
- Services (5): `admin-dictation.service.ts`, `dictation-folders.service.ts`, `dictation-lessons.service.ts`, `dictation-progress.service.ts`, `dictation-videos.service.ts`
- Chức năng: Luyện chép chính tả với video — folder, lesson, video, tiến độ và webhook nhận transcription.

#### 2.2.15 `NotificationsModule`

- Controllers: `notifications.controller.ts`
- Services: `notifications.service.ts`
- Chức năng: Thông báo theo `NotificationType`.

#### 2.2.16 `PostsModule`

- Controllers: `posts.controller.ts`
- Services: `posts.service.ts`
- Chức năng: Cộng đồng — post, comment, like, bookmark theo enum `PostType`.

#### 2.2.17 `GamificationModule`

- Controllers: `gamification.controller.ts`
- Services: `gamification.service.ts`
- Chức năng: Achievement, UserAchievement, XpLog.

#### 2.2.18 `SubscriptionsModule`

- Controllers: `subscriptions.controller.ts`
- Services: `subscriptions.service.ts` (+ `subscriptions.cron.ts` cron 2:00 AM)
- Chức năng: Gói cước (`FREE / PREMIUM / PRO`), thanh toán (`MOCK / VNPAY / STRIPE / MANUAL`), quota tháng, trial 7 ngày, VNPay HMAC-SHA512.

### 2.3 Module hệ thống (`AppModule`)

- `@nestjs/config` — load biến môi trường `.env`
- `@nestjs/schedule` — cron jobs (chủ yếu cho `SubscriptionsModule`)
- `@nestjs/throttler` — rate limit 100 req / 60 s toàn cục
- `@willsoto/nestjs-prometheus` — expose `/metrics`
- OpenTelemetry SDK (`telemetry.ts`) — trace OTLP HTTP về Alloy

---

## 3. Phân tích Prisma schema

File `backend-core/prisma/schema.prisma` — 1.465 dòng, 66 model và 14 enum. Datasource là PostgreSQL với hai URL: `DATABASE_URL` (PgBouncer pooled) và `DIRECT_URL` (dùng cho migration).

### 3.1 Phân loại model theo lĩnh vực (domain)

| Domain | Model |
|---|---|
| **Identity & ACL** | `User`, `IeltsProfile`, `StudentTeacherLink` |
| **IELTS Intensive (mock test)** | `IeltsIntensiveExam`, `IeltsIntensiveSession`, `IeltsIntensiveResult` |
| **Legacy (deprecated)** | `LearningMaterial`, `LearningProgress`, `FoundationVocabLesson`, `FoundationVocabWord`, `Grammar`, `FoundationPronunciationAttempt` |
| **Foundation — Vocabulary** | `FoundationVocabBook`, `FoundationVocabUnit`, `FoundationVocabItem`, `FoundationVocabQuestion`, `FoundationVocabProgress` |
| **Foundation — Grammar** | `FoundationGrammarBook`, `FoundationGrammarUnit`, `FoundationGrammarExercise`, `FoundationGrammarProgress` |
| **Foundation — Pronunciation** | `FoundationPronunciationSound`, `FoundationSoundExample`, `FoundationPronunciationProgress` |
| **VocabLab (SRS flashcard)** | `Deck`, `Flashcard`, `FlashcardReview`, `CardType`, `CardTypeField`, `CardTemplate`, `SharedDeck` |
| **Notes** | `QuestionNote` |
| **Shadowing** | `ShadowingVideo`, `ShadowingFolder`, `ShadowingProgress` |
| **Dictation** | `DictationVideo`, `DictationFolder`, `DictationProgress` |
| **IELTS Basic** | `IeltsBasicSkill`, `IeltsBasicLesson`, `IeltsBasicListeningExercise`, `IeltsBasicReadingExercise`, `IeltsBasicWritingExercise`, `IeltsBasicWritingAnswer`, `IeltsBasicSpeakingExercise`, `IeltsBasicProgress` |
| **IELTS Advanced** | `IeltsAdvancedListeningPart`, `IeltsAdvancedListeningSession`, `IeltsAdvancedReadingPart`, `IeltsAdvancedReadingSession`, `IeltsAdvancedWritingPrompt`, `IeltsAdvancedWritingSession`, `IeltsAdvancedSpeakingPart`, `IeltsAdvancedSpeakingSession` |
| **Notifications** | `Notification` |
| **Gamification** | `Achievement`, `UserAchievement`, `XpLog` |
| **Community** | `Post`, `Comment`, `PostLike`, `PostBookmark` |
| **Subscriptions & Billing** | `Subscription`, `Payment`, `UsageRecord`, `PricingPlan` |

### 3.2 Bảng enum

| Enum | Giá trị |
|---|---|
| `UserRole` | `STUDENT`, `ADMIN`, `INSTRUCTOR` |
| `IeltsIntensiveExamType` | `FULL_TEST`, `READING`, `LISTENING`, `SPEAKING`, `WRITING`, `PRACTICE` |
| `Difficulty` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| `IeltsIntensiveSessionStatus` | `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `GRADED`, `COMPLETED`, `ABANDONED`, `GRADING_FAILED` |
| `MaterialType` | `LESSON`, `VOCABULARY`, `GRAMMAR`, `PRACTICE`, `VIDEO`, `AUDIO` |
| `PronunciationStatus` | (xem `schema.prisma`) |
| `PronunciationMastery` | (xem `schema.prisma`) |
| `CardState` | trạng thái FSRS của thẻ |
| `SubscriptionTier` | `FREE`, `PREMIUM`, `PRO` |
| `SubscriptionStatus` | active / cancelled / expired |
| `PaymentProvider` | `MOCK`, `VNPAY`, `STRIPE`, `MANUAL` |
| `NotificationType` | (xem `schema.prisma`) |
| `PostType` | `GENERAL`, … |

### 3.3 Quan hệ chính

Model `User` là gốc của hầu hết quan hệ một-nhiều và một-một:

| Loại quan hệ | Ví dụ tiêu biểu |
|---|---|
| 1-1 từ `User` | `User ↔ IeltsProfile`, `User ↔ Subscription` |
| 1-N từ `User` | `User → IeltsIntensiveSession`, `User → IeltsIntensiveResult`, `User → Deck`, `User → ShadowingVideo`, `User → DictationVideo`, `User → QuestionNote`, `User → Notification`, `User → Post`, `User → Comment`, `User → XpLog`, `User → UserAchievement`, `User → Payment` (qua `Subscription`) |
| N-N gián tiếp qua bảng trung gian | `User ↔ Post` qua `PostLike`, `PostBookmark` |
| Self-relation (named) | `User ↔ User` qua `StudentTeacherLink` (relation `StudentLinks` / `TeacherLinks`) |

Các chuỗi nesting điển hình (sử dụng cascade `onDelete: Cascade`):

```
IeltsIntensiveExam ─┐
                    ├─ IeltsIntensiveSession ── IeltsIntensiveResult
User ───────────────┘                              │
                                                   └─ (1-1)

FoundationVocabBook → FoundationVocabUnit → FoundationVocabItem → FoundationVocabQuestion
                                                  │
                                                  └── FoundationVocabProgress (← User)

FoundationGrammarBook → FoundationGrammarUnit → FoundationGrammarExercise
                                                       │
                                                       └── FoundationGrammarProgress (← User)

FoundationPronunciationSound → FoundationSoundExample
                              ↓
                              FoundationPronunciationProgress (← User)

IeltsBasicSkill → IeltsBasicLesson
                     ├─ IeltsBasicListeningExercise
                     ├─ IeltsBasicReadingExercise
                     ├─ IeltsBasicWritingExercise ── IeltsBasicWritingAnswer (← User)
                     ├─ IeltsBasicSpeakingExercise
                     └─ IeltsBasicProgress (← User)

IeltsAdvancedListeningPart ── IeltsAdvancedListeningSession (← User)
IeltsAdvancedReadingPart   ── IeltsAdvancedReadingSession   (← User)
IeltsAdvancedWritingPrompt ── IeltsAdvancedWritingSession   (← User)
IeltsAdvancedSpeakingPart  ── IeltsAdvancedSpeakingSession  (← User)

CardType ── CardTypeField
       └─── CardTemplate
Deck ── Flashcard ── FlashcardReview
        │
        └── SharedDeck (← publisher: User)

Post ── Comment
     ├─ PostLike     (← User)
     └─ PostBookmark (← User)

Achievement ── UserAchievement (← User)

Subscription (← User, 1-1)
        └── Payment (1-N)
        └── UsageRecord (1-N)
PricingPlan (catalog)
```

### 3.4 Lưu ý đặc biệt

- **Đặt lại tên (rename)**: ba bảng SQL `exams`, `exam_sessions`, `results` đã được đổi tên model thành `IeltsIntensiveExam` / `IeltsIntensiveSession` / `IeltsIntensiveResult` thông qua `@@map`. Khi viết test cần ánh xạ giữa tên model TypeScript và tên bảng SQL.
- **Cột JSON**: Nhiều bảng dùng cột `Json` cho dữ liệu cấu trúc (câu hỏi đề thi, transcript có speaker label, đáp án nhóm `table/map labelling`). Test cần fixture JSON phong phú.
- **Cascade**: Hầu hết quan hệ tới `User` đều `onDelete: Cascade` — khi viết test cần lưu ý thứ tự xoá để không vi phạm ràng buộc.
- **Legacy**: Các model trong nhóm Legacy không còn được đọc/ghi trong code hiện tại; **không bắt buộc viết test** cho phần này.

---

## 4. Tình trạng test files hiện có

### 4.1 Kết quả tìm kiếm

Lệnh tìm kiếm đã thực hiện (bao trùm cả 4 deployable units, loại trừ `node_modules`, `venv`, `__pycache__`, `.next`, `.expo`, `dist`, `build`):

```bash
find /Users/xis108/Desktop/thesis-ielts-system -type f \
  \( -name "*.spec.ts" -o -name "*.test.ts" \
     -o -name "*.spec.tsx" -o -name "*.test.tsx" \
     -o -name "*.e2e-spec.ts" \
     -o -name "test_*.py" -o -name "*_test.py" \
     -o -name "conftest.py" \) \
  -not -path "*/node_modules/*" -not -path "*/venv/*" \
  -not -path "*/__pycache__/*" -not -path "*/.next/*" \
  -not -path "*/.expo/*" -not -path "*/dist/*" -not -path "*/build/*"
```

### 4.2 Kết quả

| Hạng mục | Số lượng |
|---|---|
| `*.spec.ts` trong `backend-core` | **0** |
| `*.e2e-spec.ts` trong `backend-core` | **0** |
| `*.test.ts` / `*.test.tsx` trong `frontend-web` | **0** |
| `*.test.tsx` trong `frontend-mobile` | **0** |
| `test_*.py` / `*_test.py` / `conftest.py` trong `backend-ai` | **0** |
| Thư mục `__tests__` ngoài dependency | **0** |
| File cấu hình `jest.config.*` | **0** (Jest đã được cấu hình inline trong `package.json`) |
| File `vitest.config.*` / `pytest.ini` / `pyproject.toml` chứa pytest | **0** |

**Kết luận:** Toàn bộ project chưa có bất kỳ file test nghiệp vụ nào. Đây là điểm xuất phát "greenfield" cho công tác kiểm thử.

> **Hệ quả cho luận văn:** Mục 4.6.1 *Danh sách các test-case* và mục 4.6.2 *Báo cáo kết quả kiểm thử* (mẫu trong `testing-sample.md`) cần được xây dựng từ đầu. Hiện tại chỉ có test-case thủ công (manual) — chưa có automated test.

---

## 5. Trạng thái test packages trong `backend-core/package.json`

### 5.1 Trước khảo sát

| Package | Trạng thái | Phiên bản |
|---|---|---|
| `@nestjs/testing` | ✅ Đã có | `^10.3.0` (devDeps) |
| `jest` | ✅ Đã có | `^29.7.0` (devDeps) |
| `ts-jest` | ✅ Đã có | `^29.1.1` (devDeps) |
| `@types/jest` | ✅ Đã có | `^29.5.11` (devDeps) |
| `@prisma/client` | ✅ Đã có | `^5.8.0` (deps) |
| `prisma` (CLI) | ✅ Đã có | `^5.8.0` (devDeps) |
| **`supertest`** | ❌ **THIẾU** | — |
| **`@types/supertest`** | ❌ **THIẾU** | — |

### 5.2 Sau khảo sát (đã cài đặt thêm trong session này)

```bash
npm install --save-dev --workspace=backend-core supertest @types/supertest
# Kết quả: added 15 packages, audited 1540 packages
```

| Package | Phiên bản đã cài |
|---|---|
| `supertest` | `^7.2.2` |
| `@types/supertest` | `^7.2.0` |

### 5.3 Script test có sẵn (`backend-core/package.json`)

```json
"scripts": {
  "test":       "jest",
  "test:watch": "jest --watch",
  "test:cov":   "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e":   "jest --config ./test/jest-e2e.json"
}
```

### 5.4 Cấu hình Jest

#### 5.4.1 Cấu hình unit test (inline trong `package.json`)

```json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

#### 5.4.2 Cấu hình e2e test — **đã tạo mới** tại `backend-core/test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": {
    "^@modules/(.*)$": "<rootDir>/../src/modules/$1",
    "^@common/(.*)$":  "<rootDir>/../src/common/$1",
    "^@config/(.*)$":  "<rootDir>/../src/config/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup-e2e.ts"]
}
```

File `setup-e2e.ts` đã được tạo, cấu hình `jest.setTimeout(30_000)` và import `reflect-metadata`.

---

## 6. Đề xuất bước tiếp theo

### 6.1 Mức ưu tiên cao — viết unit test cho các service trọng yếu

Theo nguyên tắc 20/80 (20% module sinh ra 80% rủi ro), 4 module ứng viên đầu tiên:

1. **`AuthModule`** — Logic JWT, bcrypt, Google OAuth (audience verify), block đổi mật khẩu cho user Google.
2. **`SubscriptionsModule`** — Quota tháng, trial 7 ngày, VNPay HMAC, cron downgrade.
3. **`IeltsModule`** (`ielts-roadmap.service.ts`, `streak.service.ts`) — Thuật toán tạo lộ trình, đếm streak.
4. **`AiClientModule`** — Mock RabbitMQ channel để kiểm thử logic publish.

### 6.2 Mức ưu tiên trung bình — viết e2e test cho luồng nghiệp vụ then chốt

- Đăng ký → OTP → Đăng nhập → Lấy `/users/me`
- Tạo session IELTS Intensive → Nộp bài → Polling kết quả grading
- Thanh toán mock → Nâng cấp tier → Sử dụng quota

### 6.3 Mức ưu tiên thấp — kiểm thử tích hợp `backend-ai`

`backend-ai` chưa có file test Python nào (`pytest` chưa được cài). Nếu cần, có thể bổ sung `pytest` + `pytest-asyncio` + `httpx` để test FastAPI endpoint và consumer.

### 6.4 Tài liệu hóa cho luận văn

- Mục 4.6.1 *Danh sách test-case*: dựng bảng theo mẫu trong `testing-sample.md` (cột `ID / TH / Chức năng / Tiền điều kiện / Tình huống / Kết quả mong muốn`).
- Mục 4.6.2 *Báo cáo kết quả*: bảng `Nhóm / Loại (Valid/Invalid) / ID / Dữ liệu đầu vào / Kết quả mong đợi / Trạng thái / Người TH / Ngày`.
- Tuân thủ `writing-rules.md`: Times New Roman 13pt, dãn dòng 1.3, caption bảng **phía dưới**, đánh số dạng `Bảng 4.x`.

---

## 7. Phụ lục — Thông tin bổ sung

### 7.1 Workspaces npm

```json
// /Users/xis108/Desktop/thesis-ielts-system/package.json
{
  "workspaces": ["backend-core", "frontend-web"]
}
```

Lệnh cài đặt cho từng workspace: `npm install --workspace=<name>`.

### 7.2 Cảnh báo bảo mật phát hiện khi cài đặt

Sau lệnh `npm install`, npm báo: **58 vulnerabilities** (5 low, 13 moderate, 39 high, 1 critical). Đây là cảnh báo có sẵn của repo (không sinh ra từ việc cài thêm `supertest`). Nếu cần khắc phục, chạy:

```bash
npm audit fix         # tự động fix các lỗi không gây breaking change
npm audit fix --force # fix toàn bộ (có thể gây breaking change)
```

Đề xuất chạy `npm audit` ở giai đoạn riêng, không gộp vào phạm vi kiểm thử nghiệp vụ.

### 7.3 File đã thay đổi trong session này

#### Lượt 1 — khảo sát + cài đặt package

| File | Hành động | Mục đích |
|---|---|---|
| `backend-core/package.json` | Thêm 2 devDependencies | `supertest`, `@types/supertest` |
| `package-lock.json` (root) | Tự động cập nhật | Lockfile workspace npm |
| `backend-core/test/setup-e2e.ts` | Tạo mới | Bootstrap test (sau lượt 2 đã update) |
| `docs/testing/01-baseline-survey.md` | Tạo mới | Báo cáo này |

#### Lượt 2 — hoàn thiện scaffolding test (theo yêu cầu chi tiết của user)

| File | Hành động | Mục đích |
|---|---|---|
| `backend-core/jest.config.ts` | **Tạo mới** | Cấu hình Jest unit test (theo spec user) + path alias `@modules/@common/@config` |
| `backend-core/jest-e2e.json` | **Tạo mới** ở root (thay cho `test/jest-e2e.json` đã xoá) | Cấu hình Jest e2e — match `*.e2e-spec.ts` |
| `backend-core/test/jest-e2e.json` | **Xoá** | Đã chuyển ra root để khớp script `--config jest-e2e.json` |
| `backend-core/test/setup-e2e.ts` | **Cập nhật** | Thêm `dotenv.config({ path: '.env.test', override: true })` |
| `backend-core/.env.test` | **Tạo mới** | Biến môi trường test — Supabase `?schema=test`, JWT test secret, mock provider |
| `backend-core/test/helpers/test-setup.ts` | **Tạo mới** (370+ dòng) | Bootstrap NestJS testing module, reset DB, JWT test user, mock factory cho 7 external service |
| `backend-core/package.json` | **Cập nhật** | Bỏ inline `"jest"` block (đã thay bằng `jest.config.ts`); thêm `test:unit`; cập nhật `test:e2e` |
| `.gitignore` (root) | **Cập nhật** | Thêm `.env.test` (bảo vệ credential khi user điền giá trị thật) |

#### Cấu hình Jest mới (`jest.config.ts`)

```typescript
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@common/(.*)$':  '<rootDir>/common/$1',
    '^@config/(.*)$':  '<rootDir>/config/$1',
  },
};
export default config;
```

> **Lưu ý:** spec gốc không liệt kê `moduleNameMapper`, nhưng `tsconfig.json` đang dùng path alias `@modules/*`, `@common/*`, `@config/*`. Không có mapping này, mọi test import qua alias sẽ thất bại. Đã thêm để đảm bảo cấu hình chạy được.

#### Scripts mới trong `package.json`

```json
{
  "test:cov":   "jest --coverage",
  "test:unit":  "jest --coverage",
  "test:e2e":   "NODE_ENV=test jest --config jest-e2e.json"
}
```

> **Cross-platform:** Cú pháp `NODE_ENV=test <cmd>` hoạt động trên macOS/Linux. Nếu nhóm phát triển dùng Windows, cân nhắc thêm `cross-env` (`npm i -D cross-env`) và đổi thành `"cross-env NODE_ENV=test jest --config jest-e2e.json"`.

#### File `.env.test`

- DATABASE_URL dùng `?schema=test` (tham số PgBouncer + pooler của Supabase). Schema `test` **phải tồn tại trên Supabase** trước khi chạy migration vào schema này:
  ```sql
  CREATE SCHEMA IF NOT EXISTS test;
  ```
- Sau đó chạy migration một lần để dựng bảng trên schema test:
  ```bash
  DATABASE_URL="<URL trong .env.test với ?schema=test>" \
    npx prisma migrate deploy --schema prisma/schema.prisma
  ```
- `OTEL_SDK_DISABLED=true` để tránh OpenTelemetry instrumentation gây nhiễu log test.
- `PAYMENT_PROVIDER=mock` để VNPay không bị gọi thật trong test.
- `.env.test` **đã được thêm vào `.gitignore` root** — không commit credential thật.

#### Helper `test/helpers/test-setup.ts` — API tóm tắt

| API | Vai trò |
|---|---|
| `createTestingApp(options?)` | Bootstrap `INestApplication` với `ValidationPipe`, prefix `/api/v1`, mock mặc định cho `AiClientService` + `StorageService`. Trả về `{ app, moduleRef, prisma, jwt }`. |
| `shutdownTestingApp(ctx)` | Đóng app + `prisma.$disconnect()` trong `afterAll`. |
| `resetDatabase(prisma)` | `TRUNCATE … RESTART IDENTITY CASCADE` mọi bảng trong `current_schema()` (tôn trọng `?schema=test`). Bỏ qua `_prisma_migrations`. |
| `createTestUser(prisma, jwt, opts?)` | Tạo user trực tiếp qua Prisma + ký JWT khớp payload thật `{ email, sub, role }`. Trả về `{ id, email, password, token, authHeader: 'Bearer …', role, … }`. |
| `createAdminUser` / `createInstructorUser` | Wrapper với role tương ứng. |
| `createMockAiClientService` | Stub `publishGradingTask`, `publishTranscriptionTask` — không kết nối RabbitMQ. |
| `createMockStorageService` | Stub `uploadFile`/`deleteFile` Cloudinary. |
| `createMockGeminiService` | Stub `generateContent`, `gradeWriting`, `gradeSpeaking`. |
| `createMockEmailService` | Stub `sendOtp`, `verifyOtp`, `sendWelcome`, `sendNotification`. |
| `createMockSttService` | Stub Whisper-style transcription. |
| `createMockTtsService` | Stub TTS trả về `Buffer`. |
| `createMockGoogleOAuthClient` | Stub `verifyIdToken` cho Google OAuth login. |
| `defaultMocks` | Object gom tất cả factory cho tiện truy cập. |

#### Mẫu sử dụng

```typescript
// example: tests/auth.e2e-spec.ts (file ví dụ — chưa tạo)
import * as request from 'supertest';
import {
  createTestingApp,
  shutdownTestingApp,
  resetDatabase,
  createTestUser,
  createMockEmailService,
  createMockGoogleOAuthClient,
  TestContext,
  TestUser,
} from '../test/helpers/test-setup';

describe('AuthController (e2e)', () => {
  let ctx: TestContext;
  let user: TestUser;

  beforeAll(async () => {
    ctx = await createTestingApp({
      overrides: [
        // { provide: EmailService, useValue: createMockEmailService() },
        // { provide: OAuth2Client, useValue: createMockGoogleOAuthClient() },
      ],
    });
  });

  beforeEach(async () => {
    await resetDatabase(ctx.prisma);
    user = await createTestUser(ctx.prisma, ctx.jwt);
  });

  afterAll(() => shutdownTestingApp(ctx));

  it('POST /api/v1/auth/login — trả 200 + access_token khi email/password đúng', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);
    expect(res.body.access_token).toBeDefined();
  });

  it('GET /api/v1/users/me — yêu cầu Authorization header', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', user.authHeader)
      .expect(200);
  });
});
```

#### Kiểm tra sanity đã thực hiện

- [x] `npx jest --showConfig` — `jest.config.ts` load thành công, các giá trị đúng spec.
- [x] `npx jest --listTests` — không lỗi cú pháp, trả về `[]` (chưa có spec, đúng kỳ vọng).
- [x] `NODE_ENV=test npx jest --config jest-e2e.json --listTests` — load `jest-e2e.json` thành công, trả `[]`.
- [x] `npx tsc --noEmit … test/helpers/test-setup.ts` — **TypeScript: No errors found**.
- [x] `git check-ignore -v backend-core/.env.test` — match `.gitignore:32:.env.test`, đã ignored.
- [x] `node -e "JSON.parse(...)"` trên `package.json` — JSON hợp lệ.

#### Việc còn lại trước khi viết spec đầu tiên

1. **Điền credential thật vào `backend-core/.env.test`** — `<PROJECT_REF>`, `<PASSWORD>`, `<REGION>` của Supabase.
2. Trên Supabase, chạy `CREATE SCHEMA IF NOT EXISTS test;` (một lần).
3. Chạy `npx prisma migrate deploy` với `DATABASE_URL` từ `.env.test` để dựng bảng trên schema `test`.
4. Viết spec đầu tiên — đề xuất bắt đầu với `auth.service.spec.ts` (unit) hoặc `auth.e2e-spec.ts` (e2e).
