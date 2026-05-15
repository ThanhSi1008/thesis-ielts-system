# Báo cáo unit-test — AuthController & UsersController

> **Ngày viết:** 2026-05-16
> **Phạm vi:** 3 file unit test cho module Auth và Users của `backend-core`.
> **Kết quả:** **25/25 test case PASS** trên Jest 29.7.0.
> **Tham chiếu thesis:** mục 4.6 trong `testing-sample.md` — TC01 (Đăng ký), TC02 (Đăng nhập), TC06 (Cập nhật thông tin cá nhân).

---

## 1. Tổng quan kết quả

| File | Module | TC group | Số test | Pass | Thời gian |
|---|---|---|---:|---:|---:|
| `src/modules/auth/tests/register.spec.ts` | AuthController | TC01 (Đăng ký) | 8 | 8 | 1.99 s |
| `src/modules/auth/tests/login.spec.ts` | AuthController | TC02 (Đăng nhập) | 5 | 5 | 1.39 s |
| `src/modules/users/tests/update-profile.spec.ts` | UsersController | TC06 (Cập nhật profile) | 12 | 12 | 1.30 s |
| **Tổng** | | | **25** | **25** | **≈ 9.86 s** (gồm coverage) |

Chạy bằng lệnh: `npm run test:unit` (alias `jest --coverage`).

---

## 2. Điều chỉnh so với thesis spec

Thesis test plan (`testing-sample.md`) được viết theo feature set lý tưởng. Code hiện thực hiện tại (RegisterDto/LoginDto/UpdateUserDto + AuthService) chưa có một số feature trong plan. Theo hướng dẫn của user, các test case đã được **điều chỉnh để chạy được trên code hiện tại** mà vẫn giữ ID TC (TC01_xx, TC02_xx, TC06_xx) để khớp bảng kiểm thử trong thesis.

### 2.1 Sai lệch đường dẫn

| Mục | Thesis / User yêu cầu | Code thực tế | Quyết định |
|---|---|---|---|
| Đường dẫn file test | `src/auth/tests/…`, `src/user/tests/…` | Codebase đặt module ở `src/modules/auth/`, `src/modules/users/` | Đặt test trong `src/modules/<module>/tests/` theo convention codebase |
| Endpoint update profile | `PATCH /user/profile` | `PATCH /users/me` (controller `UsersController`) | Dùng `PATCH /api/v1/users/me` thực tế |

### 2.2 Sai lệch validator / feature

| Thesis spec | Code hiện tại | Cách adapt |
|---|---|---|
| TC01_01 "username chứa ký tự đặc biệt" | Không có field `username`, chỉ có `firstName/lastName`, không có regex hạn chế ký tự | TC01_01 đổi thành "firstName rỗng → 400 (IsNotEmpty)" |
| TC01_03 "password < 8 ký tự → 400" | `RegisterDto.password: @MinLength(6)` | TC01_03 đổi thành "password < 6 ký tự → 400" |
| TC01_04→08 OTP flow | Không có EmailService/OtpService/isVerified | TC01_04: email trùng (P2002) → 400. TC01_05–08: hash password, tạo Deck Default, default role STUDENT, role tùy chỉnh |
| TC02_04 "password < 8 → 400" | Controller login không bind `@Body() LoginDto` ⇒ ValidationPipe không chạy | TC02_04 đổi thành "thiếu password → 401 (passport-local)" |
| TC06_02→11 phone/address/dob | `UpdateUserDto` không có 3 field này | Điều chỉnh sang các validator có thực: email, role enum, isActive boolean, firstName IsString, forbidNonWhitelisted |
| TC06_12 "no changes detected → 400" | Service không enforce | TC06_12 đổi thành "body rỗng → 200, Prisma nhận data toàn undefined (no-op)" |

---

## 3. Chi tiết từng file test

### 3.1 `register.spec.ts` — TC01 Đăng ký (POST /api/v1/auth/register)

**Setup chung:**

- `TestingModule` import `ConfigModule` (inline config, không đọc `.env`), `ThrottlerModule`, `PassportModule`, `JwtModule` với secret cố định `test-jwt-secret`.
- Provider: `AuthController`, `AuthService`, `LocalStrategy`, `JwtStrategy`, `PrismaService` (mock).
- `ThrottlerGuard` override `canActivate: () => true`.
- `app.setGlobalPrefix('api/v1')` + `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`.

**8 test case (toàn bộ PASS):**

| ID | Mô tả | Cơ chế xác thực |
|---|---|---|
| TC01_01 | `firstName: ''` → 400 | `class-validator @IsNotEmpty()` từ chối trước khi vào service |
| TC01_02 | `email: 'not-an-email'` → 400 với message "Invalid email format" | `@IsEmail({}, { message: 'Invalid email format' })` |
| TC01_03 | `password: 'p12'` (3 ký tự) → 400 "Password must be at least 6 characters" | `@MinLength(6)` |
| TC01_04 | `prisma.user.create` throw `{ code: 'P2002' }` → 400 "Email already exists" | `try/catch` trong `AuthService.register()` |
| TC01_05 | Payload hợp lệ → **201** + body là SafeUser, không có `password` field | NestJS default status cho POST + destructuring `{ password, ...rest }` |
| TC01_06 | Kiểm `prisma.user.create.data.password ≠ 'MySecret123'` và `bcrypt.compare('MySecret123', hashed) === true` | `bcrypt.hash(password, 10)` trong service |
| TC01_07 | Sau khi tạo user, `prisma.deck.create` được gọi với `{ data: { userId, name: 'Default' } }` | Tự động tạo deck Vocab Lab |
| TC01_08 | (a) Không truyền `role` → service set `'STUDENT'`. (b) Truyền `role: 'ADMIN'` → service forward giá trị | `registerDto.role ?? 'STUDENT'` |

### 3.2 `login.spec.ts` — TC02 Đăng nhập (POST /api/v1/auth/login)

**Setup chung:** giống register.spec.ts.

**Chuẩn bị fixture (`beforeEach`):**

- `prismaMock.user.findUnique` được set lại: nếu `where.email === correctEmail` trả về user với `password: hashedPassword`; ngược lại trả `null`.
- `hashedPassword` được hash 1 lần trong `beforeAll` bằng `bcrypt.hash('Password1', 10)`.

**5 test case (toàn bộ PASS):**

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC02_01 | email đúng, password sai → 401 "Invalid credentials" | `bcrypt.compare` trả `false` → `validateUser` trả `null` → LocalStrategy throw `UnauthorizedException` |
| TC02_02 | email không tồn tại → 401 | `findUnique` trả `null` |
| TC02_03 | cả hai sai → 401 | Tổng hợp 2 case trên |
| TC02_04 | payload `{ email }` (thiếu password) → 401 | Passport-local kiểm tra `usernameField`/`passwordField`. Thiếu → fail authentication |
| TC02_05 | đúng cả hai → **201** + body `{ access_token, user }`. JWT verify trả `{ sub, email, role, iat, exp }`. `user` không chứa `password`. | `AuthService.login()` ký JWT bằng `{ email, sub: id, role }` |

> **Lưu ý status code TC02_05:** Code controller không gắn `@HttpCode(200)`, nên NestJS trả mặc định **201** cho `@Post()`. Test kiểm `expect(res.status).toBe(201)`. Nếu muốn 200, cần `@HttpCode(HttpStatus.OK)` trên endpoint login.

### 3.3 `update-profile.spec.ts` — TC06 Update Profile (PATCH /api/v1/users/me)

**Setup chung:**

- `TestingModule` import `ThrottlerModule` (không cần Jwt/Passport vì guard được override).
- Provider: `UsersController`, `UsersService`, `PrismaService` (mock).
- `JwtAuthGuard` được override bằng `fakeJwtGuard` có toggle `guardShouldPass`:
  - `true` ⇒ gán `req.user = { id, email, role }` (mô phỏng JWT hợp lệ).
  - `false` ⇒ throw `UnauthorizedException`.
- `ThrottlerGuard` override luôn pass.

**12 test case (toàn bộ PASS):**

| ID | Mô tả | Cơ chế |
|---|---|---|
| TC06_01 | `guardShouldPass = false` → 401 | `JwtAuthGuard.canActivate()` throw |
| TC06_02 | `email: 'not-an-email'` → 400 "Invalid email format" | `@IsEmail` trên DTO |
| TC06_03 | `role: 'SUPERHERO'` → 400 | `@IsEnum(UserRole)` (STUDENT/TEACHER/ADMIN) |
| TC06_04 | `isActive: 'maybe'` → 400 | `@IsBoolean` |
| TC06_05 | `firstName: 12345` → 400 | `@IsString` |
| TC06_06 | `phone: '0901234567'` (field lạ) → 400 "property phone should not exist" | `forbidNonWhitelisted: true` |
| TC06_07 | `firstName: 'NewName'` → 200, `prisma.user.update` được gọi với `where: { id: TEST_USER_ID }, data.firstName === 'NewName'` | `usersService.update()` |
| TC06_08 | `email: 'new-email@example.com'` → 200 | Cùng cơ chế update |
| TC06_09 | `prisma.user.update` throw P2002 → 400 "Email already in use by another account" | Bắt P2002 trong service |
| TC06_10 | `role: 'TEACHER'` → 200, `data.role === 'TEACHER'` | `UpdateUserDto` cho phép 3 giá trị enum |
| TC06_11 | `isActive: false` → 200, response `isActive === false` | Boolean được forward thẳng |
| TC06_12 | body `{}` → 200, `data` truyền vào Prisma toàn `undefined` (no-op) | Service trải optional fields; thesis "no changes detected → 400" KHÔNG enforce |

---

## 4. Đánh giá độ phủ (coverage)

Sau khi chạy `npm run test:unit`, coverage chỉ tập trung vào 2 module được test (toàn bộ module khác có coverage 0% vì chưa có spec). Coverage tóm tắt cho 2 module trong scope:

| File | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `src/modules/auth/auth.controller.ts` | (xem báo cáo Jest) | — | — | — |
| `src/modules/auth/auth.service.ts` | Register flow covered, googleLogin/changePassword chưa | — | — | — |
| `src/modules/auth/dto/auth.dto.ts` | 100% | 100% | 100% | 100% |
| `src/modules/users/users.controller.ts` | PATCH /me covered, các endpoint khác chưa | — | — | — |
| `src/modules/users/users.service.ts` | update() covered (~26%), các method khác (linkTeacher, getStudentStats…) chưa | — | — | — |
| `src/modules/users/dto/update-user.dto.ts` | 100% | 100% | 100% | 100% |

> **Đề xuất:** Để đạt coverage 80%+ cho hai module này, viết thêm spec cho:
> - `auth.service.ts`: `googleLogin()`, `changePassword()`, `validateUser()` edge cases
> - `users.service.ts`: `findAll()`, `findOne()`, `remove()`, `linkTeacher()`, `getStudentStats()`

---

## 5. Cấu trúc thư mục sau cập nhật

```
backend-core/
├── src/
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── tests/                           ← MỚI
│       │       ├── register.spec.ts            ← MỚI (TC01, 8 test)
│       │       └── login.spec.ts               ← MỚI (TC02, 5 test)
│       └── users/
│           ├── users.controller.ts
│           ├── users.service.ts
│           └── tests/                           ← MỚI
│               └── update-profile.spec.ts      ← MỚI (TC06, 12 test)
├── jest.config.ts                               ← từ lượt trước
├── jest-e2e.json                                ← từ lượt trước
└── .env.test                                    ← từ lượt trước (đã có credential thật)
```

---

## 6. Bảng kiểm thử cho luận văn

Theo đúng format `testing-sample.md` (mục 4.6.2 *Báo cáo kết quả kiểm thử*) — bảng dưới có thể paste thẳng vào chương 4 luận văn.

| Nhóm | Loại | ID | Dữ liệu đầu vào (chính) | Kết quả mong đợi | Trạng thái | Người TH | Ngày |
|---|---|---|---|---|---|---|---|
| TC01 | Invalid | TC01_01 | firstName: `""` | 400 IsNotEmpty | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_02 | email: `"not-an-email"` | 400 "Invalid email format" | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_03 | password: `"p12"` | 400 "Password must be at least 6 characters" | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_04 | email duplicate (P2002) | 400 "Email already exists" | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_05 | email + password + firstName + lastName hợp lệ | 201, SafeUser (no password) | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_06 | password `"MySecret123"` | password trong DB là bcrypt hash | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_07 | sau register | `deck.create({data:{userId, name:'Default'}})` được gọi | Pass | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_08 | role không truyền / role: `"ADMIN"` | role = STUDENT / ADMIN tương ứng | Pass | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_01 | email đúng + password sai | 401 "Invalid credentials" | Pass | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_02 | email không tồn tại | 401 | Pass | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_03 | cả 2 sai | 401 | Pass | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_04 | payload `{ email }` (thiếu password) | 401 | Pass | Auto (Jest) | 2026-05-16 |
| TC02 | Valid | TC02_05 | email + password đúng | 201, body `{ access_token, user }`; JWT chứa `{ sub, email, role }` | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_01 | không có JWT | 401 | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_02 | email: `"not-an-email"` | 400 "Invalid email format" | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_03 | role: `"SUPERHERO"` | 400 IsEnum | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_04 | isActive: `"maybe"` | 400 IsBoolean | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_05 | firstName: `12345` | 400 IsString | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_06 | `{ phone: "0901234567" }` (field lạ) | 400 "should not exist" | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_07 | firstName: `"NewName"` | 200, DB cập nhật | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_08 | email mới hợp lệ | 200 | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_09 | email trùng (P2002) | 400 "Email already in use…" | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_10 | role: `"TEACHER"` | 200, role lưu đúng | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_11 | isActive: `false` | 200, lưu đúng boolean | Pass | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_12 | body `{}` | 200, Prisma nhận data undefined (no-op) | Pass | Auto (Jest) | 2026-05-16 |

---

## 7. Bài học rút ra cho các lần viết test tiếp theo

1. **`prisma generate` là tiền điều kiện**: Test bị fail với `Module '"@prisma/client"' has no exported member 'User'` cho đến khi chạy `npx prisma generate`. Cần thêm vào script CI hoặc `pretest` hook.
2. **Validator vs Service**: Phân biệt rõ lỗi DTO (`@IsEmail`, `@MinLength`, …) sẽ chặn ở ValidationPipe (400) vs lỗi service (chạy đến tận Prisma rồi mới throw, vẫn 400 nhưng message khác). Test cần check cả status code và message.
3. **NestJS default POST status = 201**: Login trả 201 không phải 200, trừ khi gắn `@HttpCode(HttpStatus.OK)`. Nếu thesis yêu cầu 200 cho login, đây là điểm cần fix trong code.
4. **Override guard trong test**: dùng `.overrideGuard(JwtAuthGuard).useValue({ canActivate })` với toggle, tránh phải mock từng strategy / passport setup.
5. **`forbidNonWhitelisted: true`**: Cực kỳ hữu ích — tự động chặn field lạ mà không cần viết thêm validator. Có sẵn trong `main.ts`.
6. **PATCH với body rỗng**: Hiện không trả lỗi. Nếu thesis yêu cầu "no changes detected → 400", cần thêm logic trong `UsersService.update()` (so sánh dữ liệu hiện tại với DTO trước khi gọi Prisma).

---

## 8. Đề xuất tiếp theo

1. **Mở rộng coverage cho AuthService**: viết spec cho `googleLogin()` (mock `OAuth2Client` từ test-setup), `changePassword()` (cả case Google user lẫn local user), `validateUser()` edge case.
2. **Mở rộng coverage cho UsersService**: `findAll/findOne/remove` cơ bản; `linkTeacher` (kiểm self-link), `getStudentStats` (mock đầy đủ relation tree).
3. **Bổ sung script `pretest`**: `"pretest": "prisma generate"` để CI không quên.
4. **Viết e2e test đầu tiên**: sau khi user điền đầy đủ `.env.test` và migrate schema test, viết một e2e bao gồm: register → login → call /users/me, dùng `test/helpers/test-setup.ts` đã chuẩn bị từ session trước.
5. **Cập nhật DTO khớp thesis** (nếu thesis là yêu cầu cuối cùng):
   - `RegisterDto.password`: `@MinLength(8)` thay vì 6.
   - Bind `@Body() LoginDto` trên endpoint login để ValidationPipe chạy.
   - Thêm field `phone`, `address`, `dob` vào User model + UpdateUserDto + Prisma migration nếu chương trình yêu cầu.
   - Tạo `EmailService` + `OtpService` (Resend/Mailgun + Redis TTL 60s) để hoàn thiện luồng OTP TC01_05–08.

---

## 9. Phụ lục — Lệnh chạy

```bash
# Chạy 1 file
cd backend-core && npx jest src/modules/auth/tests/register.spec.ts --no-coverage

# Chạy toàn bộ unit test + coverage
cd backend-core && npm run test:unit

# Chạy 1 module
cd backend-core && npx jest src/modules/auth --no-coverage

# Tiền điều kiện (chạy 1 lần sau khi clone)
cd backend-core && npx prisma generate
```

---

## 10. File đã tạo / cập nhật trong session này

| File | Hành động | Số dòng | Mục đích |
|---|---|---:|---|
| `backend-core/src/modules/auth/tests/register.spec.ts` | **Tạo mới** | ~290 | 8 test TC01 — Register |
| `backend-core/src/modules/auth/tests/login.spec.ts` | **Tạo mới** | ~180 | 5 test TC02 — Login |
| `backend-core/src/modules/users/tests/update-profile.spec.ts` | **Tạo mới** | ~280 | 12 test TC06 — Update profile |
| `docs/testing/02-unit-tests-auth-users.md` | **Tạo mới** | — | Báo cáo này |
