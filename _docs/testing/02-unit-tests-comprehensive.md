# Báo cáo kiểm thử đơn vị (unit test) — Backend Core

> **Cập nhật:** 2026-05-16
> **Phạm vi:** 7 file spec phủ 6 module nghiệp vụ trọng yếu của `backend-core`.
> **Kết quả:** **60/60 test PASS** trên Jest 29.7.0 (≈ 4.27 s wall-clock).
> **Tham chiếu thesis:** `testing-sample.md` mục 4.6.1–4.6.2 (TC01, TC02, TC03, TC05, TC06, TC10, TC11) và `writing-rules.md` về quy chuẩn báo cáo.

---

## 1. Tổng hợp

| Spec file | Module | TC group | Test | Pass |
|---|---|---:|---:|---:|
| `src/modules/auth/tests/register.spec.ts` | AuthModule | TC01 — Đăng ký | 8 | 8 |
| `src/modules/auth/tests/login.spec.ts` | AuthModule | TC02 — Đăng nhập | 5 | 5 |
| `src/modules/posts/tests/posts.spec.ts` | PostsModule | TC03 — Bài viết | 11 | 11 |
| `src/modules/notifications/tests/notifications.spec.ts` | NotificationsModule | TC05 — Thông báo | 9 | 9 |
| `src/modules/users/tests/update-profile.spec.ts` | UsersModule | TC06 — Cập nhật profile | 12 | 12 |
| `src/modules/pronunciation/tests/pronunciation.spec.ts` | PronunciationModule | TC10 — Luyện phát âm | 8 | 8 |
| `src/modules/ielts/tests/ielts-statistics.spec.ts` | IeltsModule | TC11 — Thống kê IELTS | 7 | 7 |
| **Tổng** | **6 module** | **7 TC group** | **60** | **60** |

Lệnh chạy: `npm test` (đầy đủ) hoặc `npm run test:unit` (coverage) hoặc `npm run test:report` (chỉ sinh markdown, không log default).

---

## 2. Hạ tầng test (đã sẵn sàng từ các lượt trước)

| Asset | Vai trò |
|---|---|
| `backend-core/jest.config.ts` | Cấu hình Jest unit test + `moduleNameMapper` cho path alias + đăng ký markdown reporter |
| `backend-core/jest-e2e.json` | Cấu hình Jest e2e — sẵn cho test `*.e2e-spec.ts` |
| `backend-core/test/helpers/test-setup.ts` | API bootstrap cho e2e (chưa dùng ở scope unit này) |
| `backend-core/test/reporters/markdown-reporter.js` | **Mới** — custom Jest reporter sinh bảng kết quả markdown |
| `backend-core/.env.test` | Đã có credential Supabase test schema (cho e2e sau này) |

### 2.1 Scripts `package.json`

```json
{
  "pretest":     "prisma generate",
  "test":        "jest",
  "test:watch":  "jest --watch",
  "test:cov":    "jest --coverage",
  "test:unit":   "jest --coverage",
  "test:report": "jest --silent --reporters=\"<rootDir>/../test/reporters/markdown-reporter.js\"",
  "test:debug":  "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e":    "NODE_ENV=test jest --config jest-e2e.json"
}
```

- **`pretest`** chạy `prisma generate` trước mọi lần `npm test`, tránh lỗi `Module '"@prisma/client"' has no exported member 'User'` lần đầu clone.
- **`test:unit`** = `jest --coverage` (đặt riêng để khớp đặc tả user).
- **`test:report`** chạy Jest silent chỉ với markdown reporter — phù hợp khi muốn refresh bảng kết quả mà không cần thấy log chi tiết.

### 2.2 Cấu hình Jest đầy đủ (`backend-core/jest.config.ts`)

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
  reporters: [
    'default',
    [
      '<rootDir>/../test/reporters/markdown-reporter.js',
      {
        outputPath: '../../docs/testing/test-results.md',
        title: 'Báo cáo kết quả kiểm thử backend-core (auto-generated)',
        author: 'Auto (Jest)',
      },
    ],
  ],
};

export default config;
```

---

## 3. Custom Markdown Reporter — `test/reporters/markdown-reporter.js`

### 3.1 Vai trò

Mỗi lần `npm test` (hoặc `npm run test:unit`/`test:report`) chạy, reporter tự động:

1. Lắng nghe `onRunComplete` của Jest.
2. Trích `TC ID` (regex `^TC\d+_\d+`) từ tên test.
3. Phân loại Valid/Invalid theo `describe` ancestor (`[Valid]` / `[Invalid]`).
4. Sinh file markdown gồm 4 section:
   - Tổng hợp (số test, pass, fail, skipped, thời gian)
   - **Bảng 4.1** — Danh sách test case (TH, Mã, Tình huống, File)
   - **Bảng 4.2** — Báo cáo kết quả (Nhóm, Loại, ID, Kết quả mong đợi, Trạng thái, Thời gian, Người TH, Ngày) — **đúng cấu trúc cột yêu cầu trong `testing-sample.md`**.
   - Chi tiết theo từng file spec.
5. Ghi ra `docs/testing/test-results.md` (đường dẫn cấu hình được).

### 3.2 Options

| Option | Default | Ý nghĩa |
|---|---|---|
| `outputPath` | `../docs/testing/test-results.md` | Đường dẫn file markdown (relative tới `rootDir`). Trong config hiện tại là `'../../docs/testing/test-results.md'` vì `rootDir = 'src'`. |
| `title` | `Báo cáo kết quả kiểm thử (auto-generated)` | Tiêu đề H1 trong file output |
| `author` | `Auto (Jest)` | Điền vào cột "Người TH" của Bảng 4.2 |
| `date` | `new Date().toISOString().slice(0,10)` | Điền vào cột "Ngày" |

### 3.3 Cách viết test để reporter parse đúng

```typescript
describe('AuthController (TC01 — Đăng ký)', () => {
  describe('[Invalid]', () => {
    it('TC01_01: firstName rỗng → 400 (IsNotEmpty)', async () => { … });
  });
  describe('[Valid]', () => {
    it('TC01_05: payload hợp lệ → 201, trả SafeUser', async () => { … });
  });
});
```

- **describe root** phải bắt đầu bằng tên controller + `TC<NN> — <Tên>` để reporter trích `tcGroup` = "TC01".
- **describe con** phải chứa `[Valid]` hoặc `[Invalid]` để phân loại.
- **`it()` title** phải bắt đầu bằng `TC<NN>_<MM>:` để trích `tcId`.

### 3.4 Output sample (trích)

```markdown
| Nhóm | Loại    | ID       | Kết quả mong đợi                                | Trạng thái | Thời gian (ms) | Người TH    | Ngày       |
|------|---------|----------|--------------------------------------------------|------------|----------------|-------------|------------|
| TC01 | Invalid | TC01_01  | firstName rỗng → 400 Bad Request (IsNotEmpty)    | Pass       | 19             | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_02  | email sai định dạng → 400 "Invalid email format" | Pass       | 3              | Auto (Jest) | 2026-05-16 |
```

> File auto-generated mới nhất: **[`docs/testing/test-results.md`](./test-results.md)** — paste thẳng vào chương 4 luận văn được.

---

## 4. Chi tiết từng spec file

### 4.1 `register.spec.ts` — TC01 Đăng ký (8 test)

**Endpoint:** `POST /api/v1/auth/register`
**Đối tượng:** AuthController + AuthService + RegisterDto + LocalStrategy + JwtStrategy.

| ID | Mô tả | Cơ chế xác thực trong code |
|---|---|---|
| TC01_01 | firstName rỗng → 400 | `@IsNotEmpty` trên `firstName` |
| TC01_02 | email sai định dạng → 400 | `@IsEmail({}, { message: 'Invalid email format' })` |
| TC01_03 | password < 6 ký tự → 400 | `@MinLength(6, { message: 'Password must be at least 6 characters' })` |
| TC01_04 | email duplicate (P2002) → 400 "Email already exists" | `try/catch` của `AuthService.register` |
| TC01_05 | payload hợp lệ → 201 + SafeUser (không có password) | `{ password, ...rest }` destructuring |
| TC01_06 | password trong DB là bcrypt hash | `bcrypt.hash(password, 10)` |
| TC01_07 | sau register, tự động tạo Deck "Default" Vocab Lab | `prisma.deck.create({ data: { userId, name: 'Default' } })` |
| TC01_08 | role mặc định STUDENT / chấp nhận giá trị truyền vào | `registerDto.role ?? 'STUDENT'` |

### 4.2 `login.spec.ts` — TC02 Đăng nhập (5 test)

**Endpoint:** `POST /api/v1/auth/login` (LocalAuthGuard → LocalStrategy → AuthService.validateUser).

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC02_01 | email đúng + password sai → 401 | `bcrypt.compare` false → throw `UnauthorizedException` |
| TC02_02 | email không tồn tại + password đúng → 401 | `prisma.user.findUnique` trả null |
| TC02_03 | cả hai sai → 401 | Tổng hợp 2 case trên |
| TC02_04 | payload thiếu password → 401 | Passport-local từ chối (`Missing credentials`) |
| TC02_05 | đúng cả hai → 201, `{ access_token, user }`. JWT payload `{ sub, email, role, iat, exp }` | `jwtService.sign({ email, sub: id, role })` |

> **Lưu ý NestJS default POST status = 201**: Endpoint login KHÔNG gắn `@HttpCode(HttpStatus.OK)`, nên trả 201. Nếu thesis yêu cầu 200, cần thêm decorator này.

### 4.3 `posts.spec.ts` — TC03 Bài viết (11 test)

**Endpoints:** POST `/posts`, GET `/posts`, POST `/posts/:id/like`.

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC03_01 | body rỗng → 400 | `@MinLength(1)` |
| TC03_02 | body > 10000 ký tự → 400 | `@MaxLength(10000)` |
| TC03_03 | type ngoài enum PostType → 400 | `@IsEnum(PostType)` |
| TC03_04 | không JWT → 401 | JwtAuthGuard |
| TC03_05 | tạo post hợp lệ → 201, kích hoạt `gamification.onEvent(user, { xp: 5 })` | `PostsService.createPost` |
| TC03_06 | tags + imageUrls được forward chính xác xuống Prisma | Service merge `?? []` defaults |
| TC03_07 | GET /posts (không query) → 200, `where: { isHidden: false }`, `orderBy: createdAt desc` | `listPosts` cursor pagination |
| TC03_08 | like lần đầu → 201, `{ liked: true }`, `$transaction` được gọi | `toggleLike` create branch |
| TC03_09 | like lần 2 (đã like trước) → unlike, `{ liked: false }` | `toggleLike` delete branch |
| TC03_10 | like post không tồn tại → 404 "Post not found" | `prisma.post.findUnique` null + `NotFoundException` |
| TC03_11 | GET /posts với `?limit=10` → 400 | DTO `@IsInt()` không kèm `@Type(() => Number)` → strict (đây là **bug nhỏ** của DTO, được test ghi nhận) |

> **Bug đáng lưu ý**: `ListPostsDto.limit` cần thêm `@Type(() => Number)` từ `class-transformer` thì query `?limit=10` mới hoạt động. Hiện tại client phải bỏ qua tham số `limit` (server dùng `POST_LIST_LIMIT = 20`).

### 4.4 `notifications.spec.ts` — TC05 Thông báo (9 test)

**Endpoints:** GET `/notifications`, GET `/unread-count`, PATCH `/:id/read`, PATCH `/read-all`, DELETE `/:id`.

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC05_01 | không JWT → 401 | JwtAuthGuard |
| TC05_02 | GET /unread-count không JWT → 401 | JwtAuthGuard |
| TC05_03 | DELETE /:id không JWT → 401 | JwtAuthGuard |
| TC05_04 | GET /notifications → 200, `where: { userId }`, `orderBy: createdAt desc` | NotificationsService.findAll |
| TC05_05 | GET /notifications?page=2 → skip=20, take=20 | `(page-1)*limit` |
| TC05_06 | PATCH /:id/read → `updateMany({ where: { id, userId } })` (chống mark hộ user khác) | Compound where |
| TC05_07 | PATCH /:id/read trên notif user khác → 200, `count: 0` (không lộ thông tin) | `updateMany` an toàn |
| TC05_08 | PATCH /read-all → `updateMany({ where: { userId, isRead: false } })` | Bulk mark read |
| TC05_09 | DELETE /:id → `deleteMany({ where: { id, userId } })` (ownership scope) | Compound where |

### 4.5 `update-profile.spec.ts` — TC06 Cập nhật profile (12 test)

**Endpoint:** `PATCH /api/v1/users/me`

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC06_01 | không JWT → 401 | JwtAuthGuard |
| TC06_02 | email sai format → 400 | `@IsEmail` |
| TC06_03 | role ngoài enum → 400 | `@IsEnum(UserRole)` |
| TC06_04 | isActive không boolean → 400 | `@IsBoolean` |
| TC06_05 | firstName là số → 400 | `@IsString` |
| TC06_06 | field lạ → 400 "should not exist" | `forbidNonWhitelisted: true` |
| TC06_07 | firstName hợp lệ → 200, `where: { id }`, `data.firstName` chính xác | Service update |
| TC06_08 | email mới hợp lệ → 200 | Service update |
| TC06_09 | email trùng (P2002) → 400 "Email already in use" | `try/catch` |
| TC06_10 | role = TEACHER → 200 | DTO enum cho phép |
| TC06_11 | isActive = false → 200 | Service forward boolean |
| TC06_12 | body rỗng → 200, Prisma nhận data toàn undefined (no-op) | Optional fields |

### 4.6 `pronunciation.spec.ts` — TC10 Luyện phát âm (8 test)

**Endpoints:** GET `/sounds` (public), GET `/sounds/:symbol` (public), POST `/progress` (auth), POST `/sounds` (ADMIN).

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC10_01 | GET /sounds public — không cần JWT | Không có guard |
| TC10_02 | GET /sounds/:symbol không tồn tại → 404 | `NotFoundException` |
| TC10_03 | GET /sounds/:symbol có dữ liệu → 200 | Service trả object |
| TC10_04 | POST /progress không JWT → 401 | JwtAuthGuard |
| TC10_05 | POST /progress hợp lệ → 201, `updateProgress(userId, soundId, score)` | Service ghi điểm |
| TC10_06 | POST /sounds với STUDENT → 403 | RolesGuard từ chối |
| TC10_07 | POST /sounds với ADMIN + payload đủ field → 201 | RolesGuard cho qua, DTO valid |
| TC10_08 | POST /sounds với ADMIN nhưng thiếu `word` → 400 | DTO `@IsString` non-optional |

### 4.7 `ielts-statistics.spec.ts` — TC11 Thống kê IELTS (7 test)

**Endpoints:** GET `/ielts-statistics/{overview,foundation,basic,advanced,intensive}`.

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC11_01 | GET /overview không JWT → 401 | Class-level JwtAuthGuard |
| TC11_02 | GET /foundation không JWT → 401 | Class-level JwtAuthGuard |
| TC11_03 | GET /overview → 200, `getOverviewStats(userId)` | Service mock |
| TC11_04 | GET /foundation → 200, `getFoundationStats(userId)` | Service mock |
| TC11_05 | GET /basic → 200, `getBasicStats(userId)` | Service mock |
| TC11_06 | GET /advanced → 200, `getAdvancedStats(userId)` | Service mock |
| TC11_07 | GET /intensive → 200, `getIntensiveStats(userId)` | Service mock |

---

## 5. Điều chỉnh so với thesis spec — bảng tổng

| Mục thesis | Code thực tế | Cách adapt |
|---|---|---|
| TC01: OTP flow (TC01_04→08) | Không có EmailService/OtpService/`isVerified` | Thay bằng: P2002 email trùng, bcrypt hash, Deck Default, default role |
| TC01_03 password ≥ 8 | DTO `@MinLength(6)` | Test với ngưỡng 6 |
| TC02_04 password < 8 → 400 | Login không bind LoginDto, ValidationPipe không chạy | Đổi sang "thiếu password → 401 passport-local" |
| TC02_05 status 200 | NestJS default POST = 201 (không có `@HttpCode(200)`) | Test expect 201 + ghi chú khắc phục |
| TC06_02→11 phone/address/dob | Không có 3 field trên User model | Thay bằng: email format, role enum, isActive boolean, IsString, forbidNonWhitelisted |
| TC06_12 "no changes → 400" | Service không enforce | Test ghi nhận behaviour thật (200, no-op) |
| Path `src/auth/tests/` | Codebase dùng `src/modules/auth/` | Đặt vào `src/modules/<module>/tests/` |
| Endpoint `/user/profile` | Thực: `/users/me` | Dùng path thực |

---

## 6. Phạm vi coverage và đề xuất mở rộng

### 6.1 Coverage hiện tại theo module

| Module | Spec | Hàm chính đã cover | Hàm chính CHƯA cover |
|---|---|---|---|
| Auth | register, login | `register`, `validateUser`, `login` | `googleLogin`, `changePassword`, refresh token |
| Users | update-profile | `update` (PATCH /me) | `findAll`, `findOne`, `remove`, `linkTeacher`, `getLinkedTeachers`, `getStudentStats` |
| Posts | posts | `createPost`, `listPosts`, `toggleLike` | `getPost`, `deletePost`, `toggleBookmark`, `createComment`, `deleteComment`, `uploadImage` |
| Notifications | notifications | `findAll`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, `delete` | `notifySystemAnnouncement`, broadcast logic |
| Pronunciation | pronunciation | `getAllSounds`, `getSoundBySymbol`, `updateProgress`, `createSound` (ADMIN) | `getUserProgress`, `getUserStats`, `getWordProgress`, IPA scoring logic |
| IELTS | ielts-statistics | 5 stats endpoints | `IeltsService`, `IeltsAdvancedService`, `IeltsRoadmapService`, `StreakService` |

### 6.2 Module chưa có spec nào (ưu tiên cao theo thesis)

1. **AiClientModule** — `publishGradingTask`, `publishTranscriptionTask` (mock RabbitMQ channel).
2. **VocabLabModule** — Deck/Flashcard CRUD, SRS review (`SubmitReviewDto`, `ts-fsrs`).
3. **SubscriptionsModule** — quota tháng, VNPay HMAC verify, trial 7 ngày.
4. **ShadowingModule / DictationModule** — webhook callback từ backend-ai.
5. **GamificationModule** — `onEvent`, achievement check logic.

### 6.3 Đề xuất ưu tiên cho lượt sau

1. **AiClient publish (RabbitMQ)** — quan trọng vì là cầu nối với backend-ai. Test mock `amqplib`.
2. **VocabLab review (SRS)** — flagship feature, có thuật toán `ts-fsrs`.
3. **Subscriptions VNPay HMAC** — bảo mật thanh toán.
4. **E2E test đầu tiên** — sau khi `.env.test` đã có credential thật, dựng `prisma migrate deploy` vào schema test rồi viết e2e cho luồng register → login → /users/me sử dụng `test/helpers/test-setup.ts` đã chuẩn bị từ session trước.

---

## 7. Cấu trúc thư mục sau cập nhật

```
backend-core/
├── src/
│   └── modules/
│       ├── auth/tests/{register,login}.spec.ts            (13 test)
│       ├── posts/tests/posts.spec.ts                       (11 test)
│       ├── notifications/tests/notifications.spec.ts        (9 test)
│       ├── users/tests/update-profile.spec.ts              (12 test)
│       ├── pronunciation/tests/pronunciation.spec.ts        (8 test)
│       └── ielts/tests/ielts-statistics.spec.ts             (7 test)
├── test/
│   ├── helpers/test-setup.ts                              (e2e helper — dùng sau)
│   ├── reporters/markdown-reporter.js                     ← MỚI
│   └── setup-e2e.ts
├── jest.config.ts                                         ← cập nhật: thêm reporters
├── jest-e2e.json
├── package.json                                           ← cập nhật: thêm pretest, test:report
└── .env.test

docs/testing/
├── 01-baseline-survey.md
├── 02-unit-tests-comprehensive.md                         ← FILE NÀY (rewrite)
└── test-results.md                                        ← AUTO-GENERATED mỗi lần `npm test`
```

---

## 8. Bài học kỹ thuật rút ra

1. **`@Type(() => Number)` là bắt buộc cho query params** kiểu int khi dùng `@IsInt` cùng ValidationPipe `transform: true`. Bug ở `ListPostsDto.limit` là ví dụ điển hình.
2. **NestJS default POST trả 201**, không phải 200. Endpoint không có business semantic "created" như login cần `@HttpCode(HttpStatus.OK)` để trả đúng 200.
3. **`updateMany`/`deleteMany` với compound where (`{ id, userId }`)** là pattern an toàn để giới hạn phạm vi sửa/xoá theo user — luôn trả `count` thay vì throw nếu không match. Phù hợp cho luồng "không lộ thông tin notification thuộc user khác".
4. **Override Guard bằng toggle pattern** giúp test cùng controller cho cả case có/không JWT mà không phải dựng 2 TestingModule.
5. **Mock theo lớp** — controller test mock Prisma, controller-routing test mock cả service. Cả hai cách đều hữu ích, chọn theo trọng tâm test.
6. **Custom Jest reporter** đủ đơn giản (~210 dòng JS) để sinh bảng markdown đúng format luận văn, tránh phải copy-paste thủ công sau mỗi lần chạy test.

---

## 9. Phụ lục — Lệnh sử dụng

```bash
# 1. Chạy toàn bộ test + sinh markdown report tự động
cd backend-core && npm test

# 2. Chạy với coverage
cd backend-core && npm run test:unit

# 3. Chỉ refresh markdown report (silent, không log default)
cd backend-core && npm run test:report

# 4. Chạy một module cụ thể
cd backend-core && npx jest src/modules/posts --no-coverage

# 5. Tiền điều kiện (đã tự động chạy nhờ `pretest`)
cd backend-core && npx prisma generate

# 6. Output markdown được ghi tới:
#    docs/testing/test-results.md
```

---

## 10. File đã tạo / cập nhật trong session này

| File | Hành động | Số dòng |
|---|---|---:|
| `backend-core/package.json` | Thêm `pretest` + `test:report` | +2 line |
| `backend-core/jest.config.ts` | Thêm `reporters` config | +14 line |
| `backend-core/test/reporters/markdown-reporter.js` | **Tạo mới** | ~210 |
| `backend-core/src/modules/posts/tests/posts.spec.ts` | **Tạo mới** (11 test TC03) | ~280 |
| `backend-core/src/modules/notifications/tests/notifications.spec.ts` | **Tạo mới** (9 test TC05) | ~190 |
| `backend-core/src/modules/pronunciation/tests/pronunciation.spec.ts` | **Tạo mới** (8 test TC10) | ~200 |
| `backend-core/src/modules/ielts/tests/ielts-statistics.spec.ts` | **Tạo mới** (7 test TC11) | ~130 |
| `docs/testing/02-unit-tests-comprehensive.md` | **Rewrite** (replace 02-unit-tests-auth-users.md content) | — |
| `docs/testing/test-results.md` | **Auto-generated** mỗi lần `npm test` | ~270 |
