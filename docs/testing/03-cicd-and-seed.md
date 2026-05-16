# CI/CD và dữ liệu seed cho môi trường test

> **Ngày viết:** 2026-05-16
> **Phạm vi:** Workflow GitHub Actions chạy unit + e2e test trên Postgres ephemeral; script `seed-test.ts` cấp fixture cho schema test; tích hợp dorny/test-reporter + sticky-pull-request-comment để feedback trên PR.
> **Trạng thái:** Đã chạy thành công local — 60/60 test pass, `junit.xml` + markdown report sinh đúng.

---

## 1. Tổng quan luồng CI/CD

```
git push (main|deploy) ──┐                           PR (main|deploy) ──┐
                          ▼                                                ▼
                   GitHub Actions:  .github/workflows/test.yml
                          ▼
        ┌─────────────────────────────────────────────────┐
        │ Service containers (ephemeral):                 │
        │  · postgres:16-alpine  (port 5432)               │
        │  · redis:7-alpine     (port 6379)                │
        └─────────────────────────────────────────────────┘
                          ▼
           1. checkout + setup-node@v4 (Node 20, npm cache)
                          ▼
           2. npm ci  (root workspace, hoist tới node_modules/)
                          ▼
           3. npx prisma generate
                          ▼
           4. npx prisma migrate deploy  (schema=public trên container)
                          ▼
           5. npm run prisma:seed:test    (fixture idempotent)
                          ▼
           6. npm run test:unit            (jest --coverage)
                          ▼
           7. npm run test:e2e --passWithNoTests   (placeholder)
                          ▼
       ┌──────────────────┴──────────────────┐
       ▼                  ▼                  ▼
  upload-artifact   dorny/test-reporter   sticky-pull-request-comment
   markdown +        check run với        markdown summary
   coverage +        annotations          dán vào PR
   junit.xml
```

---

## 2. File `.github/workflows/test.yml`

### 2.1 Trigger và concurrency

```yaml
on:
  push:
    branches: [main, deploy]
  pull_request:
    branches: [main, deploy]
  workflow_dispatch:

concurrency:
  group: backend-tests-${{ github.ref }}
  cancel-in-progress: true
```

- Chạy khi push lên `main`/`deploy` và mọi PR vào 2 nhánh đó (nhánh `deploy` là nhánh release của repo, khớp với `deploy.yml` đã có sẵn).
- `workflow_dispatch` cho phép chạy thủ công từ tab Actions.
- `concurrency` huỷ run cũ khi có commit mới trên cùng nhánh — tiết kiệm minute.

### 2.2 Permissions (tối thiểu)

```yaml
permissions:
  contents: read         # checkout
  checks: write          # dorny/test-reporter tạo check run
  pull-requests: write   # sticky-pull-request-comment dán comment
```

### 2.3 Service containers

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env: { POSTGRES_USER: test_user, POSTGRES_PASSWORD: test_password, POSTGRES_DB: test_db }
    ports: ['5432:5432']
    options: --health-cmd pg_isready ...
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    options: --health-cmd "redis-cli ping" ...
```

Tại sao service container thay vì Supabase test schema:

| Tiêu chí | Service container | Supabase test schema |
|---|---|---|
| Bảo mật | An toàn — không cần secret thật | Cần secret, dễ rò |
| Tốc độ | Local network ~1ms | Mạng ngoài, latency cao |
| Cô lập | Mỗi run cô lập | Schema dùng chung — race condition khi nhiều PR |
| Chi phí | Miễn phí (trong runner) | Tốn quota Supabase free tier |
| Reset state | Container chết → sạch | Cần truncate thủ công |

→ Service container là chuẩn cho CI; `.env.test` (Supabase) chỉ dùng cho local dev.

### 2.4 Env: phủ trùm `.env.test`

CI export đầy đủ biến môi trường ngay tại job-level `env:` để KHÔNG phụ thuộc vào `.env.test` (file này đã `.gitignore`, không có trong checkout). `setup-e2e.ts` vẫn cố load `.env.test` nhưng `dotenv` im lặng bỏ qua nếu file không tồn tại — `process.env` vẫn giữ giá trị mà workflow đã set.

Tham số quan trọng:

```yaml
DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db?schema=public
DIRECT_URL:   postgresql://test_user:test_password@localhost:5432/test_db?schema=public
JWT_SECRET:   ci-test-jwt-secret-do-not-use-in-prod
NODE_ENV:     test
PAYMENT_PROVIDER: mock
OTEL_SDK_DISABLED: 'true'
```

### 2.5 Các step chính

| Step | Mục đích | Lưu ý |
|---|---|---|
| `checkout@v4` | Clone repo | Không lấy submodule |
| `setup-node@v4` | Node 20 + npm cache | `cache: npm` giảm install time |
| `npm ci` | Cài deps workspace | Chạy ở root vì là npm workspaces |
| `pg_isready` loop | Đợi Postgres sẵn sàng | Tránh race với migrate |
| `prisma generate` | Sinh `@prisma/client` | `pretest` hook cũng đảm bảo, nhưng chạy tường minh để debug rõ ràng |
| `prisma migrate deploy` | Apply migration | KHÔNG dùng `migrate dev` (không tương tác trong CI) |
| `prisma:seed:test` | Đổ fixture | Idempotent — chạy lại OK |
| `test:unit` | Unit test + coverage | Reporter ghi markdown + junit.xml |
| `test:e2e --passWithNoTests` | E2E placeholder | Hiện chưa có `*.e2e-spec.ts`, dùng `continue-on-error: true` |
| `upload-artifact` × 3 | Lưu markdown, coverage, junit.xml | `if: always()` để upload kể cả khi test fail |
| `dorny/test-reporter@v1` | Tạo check run từ JUnit XML | Giới hạn `github.event.pull_request.head.repo.full_name == github.repository` để bỏ qua fork PR (không có quyền write) |
| `marocchino/sticky-pull-request-comment@v2` | Dán markdown report làm PR comment | `header: backend-tests` để comment cũ được cập nhật, không tạo mới |

---

## 3. JUnit XML — `jest-junit` reporter

### 3.1 Cài đặt

```bash
npm install --save-dev --workspace=backend-core jest-junit
```

Phiên bản: `jest-junit@^17.0.0`.

### 3.2 Cấu hình trong `jest.config.ts`

```typescript
reporters: [
  'default',
  ['<rootDir>/../test/reporters/markdown-reporter.js', { /* … */ }],
  [
    'jest-junit',
    {
      outputDirectory: '<rootDir>/..',   // backend-core/
      outputName: 'junit.xml',
      suiteName: 'backend-core unit tests',
      classNameTemplate: '{filepath}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
    },
  ],
]
```

Output sinh ra `backend-core/junit.xml` với schema chuẩn JUnit, ví dụ:

```xml
<testsuites name="backend-core unit tests" tests="60" failures="0" errors="0" time="4.373">
  <testsuite name="NotificationsController (TC05 — Thông báo)" tests="9">
    <testcase classname="src/modules/notifications/tests/notifications.spec.ts"
              name="TC05_01: không có JWT → 401" time="0.018" />
    ...
  </testsuite>
</testsuites>
```

### 3.3 Tại sao cần thêm JUnit XML

| Mục đích | Markdown reporter | jest-junit |
|---|---|---|
| Người đọc (PR review) | ✓ rendered đẹp khi sticky-comment | ✗ XML thô |
| Check annotation trên dòng code fail | ✗ | ✓ dorny đọc được |
| Lưu lịch sử test trên GitHub Checks UI | ✗ | ✓ |
| Tích hợp tool ngoài (SonarQube, Allure) | ✗ | ✓ chuẩn industry |

Cả hai chạy song song, không xung đột.

---

## 4. Seed test — `prisma/seed-test.ts`

### 4.1 Triết lý

- **Idempotent:** mọi entity dùng `upsert` với UUID cố định trong `TEST_IDS`. Re-run không gây `UniqueConstraintViolation`.
- **Tối thiểu nhưng đủ:** phủ các domain mà test thường cần — user (3 role), IELTS exam, foundation vocab content, achievement, pricing plan.
- **An toàn:** guard từ chối chạy nếu `DATABASE_URL` không chứa `?schema=test` HOẶC `localhost/127.0.0.1`. Set `SEED_TEST_FORCE=1` để bypass (không khuyến nghị).

### 4.2 ID cố định (deterministic)

```typescript
export const TEST_IDS = {
  users: {
    admin:      "00000000-0000-0000-0000-000000000001",
    student:    "00000000-0000-0000-0000-000000000002",
    instructor: "00000000-0000-0000-0000-000000000003",
  },
  exams:        { sampleListening: "10000000-…001" },
  vocab:        { book: "20…001", unit: "20…002", item: "20…003" },
  achievements: { firstLogin: "30…001" },
  plans:        { premiumMonthly: "40…001" },
};
```

Test có thể import `TEST_IDS` để reference user/exam/… mà không cần query lại DB:

```typescript
import { TEST_IDS } from '../../../../prisma/seed-test';
const studentId = TEST_IDS.users.student;
```

### 4.3 Fixture cụ thể

| Entity | Số lượng | Ghi chú |
|---|---:|---|
| `User` | 3 | password = `"TestPassword123!"` (bcrypt hash); 3 vai trò ADMIN/STUDENT/INSTRUCTOR |
| `IeltsIntensiveExam` | 1 | LISTENING, INTERMEDIATE, 30 phút, isPublished=true |
| `FoundationVocabBook → Unit → Item` | 1 chuỗi | Word "hello" /həˈloʊ/, dùng cho test vocab module |
| `Achievement` | 1 | key=`TEST_FIRST_LOGIN`, xpReward=10 |
| `PricingPlan` | 1 | PREMIUM monthly $9.99 |

### 4.4 Chạy local và CI

```bash
# Local: phải có .env.test trỏ schema=test
cd backend-core && npm run prisma:seed:test

# CI: workflow đã set DATABASE_URL = localhost service container
# (guard pass nhờ "localhost" trong URL)
```

### 4.5 Mở rộng tương lai

Khi viết e2e test cần thêm fixture (vd: subscription đang active, learning progress), bổ sung function `seed<Domain>()` riêng và gọi từ `main()`. Giữ pattern `upsert` để re-run an toàn.

---

## 5. Scripts mới trong `package.json`

```json
{
  "prisma:seed":      "ts-node prisma/seed.ts",
  "prisma:seed:test": "ts-node prisma/seed-test.ts"
}
```

| Script | Khi dùng | Phạm vi |
|---|---|---|
| `prisma:seed` | Local dev — content thật (Cambridge IELTS, vocab books…) | Schema `public` (development) |
| `prisma:seed:test` | CI + local test runs | Schema `test` (Supabase) hoặc localhost (CI) |

---

## 6. PR feedback — 2 cơ chế bổ trợ

### 6.1 `dorny/test-reporter@v1` (check run)

Đọc `junit.xml`, tạo một GitHub Check Run với:
- ✅/❌ trên từng test
- Annotation gắn vào dòng code khi test fail (nếu stack trace có path)
- Summary number ở PR status

**Giới hạn:** Không hoạt động trên PR từ fork (do GitHub không cho `GITHUB_TOKEN` write quyền cho fork). Điều này đã được handle bằng condition `github.event.pull_request.head.repo.full_name == github.repository`.

### 6.2 `marocchino/sticky-pull-request-comment@v2`

Đọc file `docs/testing/test-results.md` (output của markdown reporter), dán toàn bộ vào PR comment. `header: backend-tests` đảm bảo lần chạy sau **cập nhật** comment cũ thay vì tạo mới — PR không bị spam.

Người review sẽ thấy ngay bảng kết quả 60 test ngay trong PR description area mà không cần download artifact.

---

## 7. Sanity check đã thực hiện

| Check | Kết quả |
|---|---|
| `npm test` (local) | 60/60 PASS, ~4.4 s |
| `backend-core/junit.xml` tồn tại sau test | ✓ 11.9 KB, schema JUnit chuẩn |
| `docs/testing/test-results.md` auto-update | ✓ 21.9 KB, đủ bảng 4.1 + 4.2 |
| `python3 -c "yaml.safe_load(...)"` trên `test.yml` | ✓ valid YAML |
| `tsc --noEmit prisma/seed-test.ts` | ✓ No errors |
| `git check-ignore .env.test` | ✓ ignored |
| `git check-ignore junit.xml` | ✓ ignored (mới thêm vào `.gitignore`) |

---

## 8. Quy trình end-to-end khi mở PR

```
1. Developer push branch → tạo PR vào main
2. GitHub Actions trigger: backend-tests workflow
3. Workflow chạy ~3–5 phút:
   - Postgres + Redis containers start
   - prisma migrate deploy (Postgres trống → tạo 66 bảng)
   - prisma:seed:test (3 users, 1 exam, ...)
   - test:unit  → 60 test PASS, sinh junit.xml + test-results.md + coverage/
   - test:e2e   → 0 test (chưa viết), pass do --passWithNoTests
4. Artifacts uploaded (3 zip files: markdown, coverage, junit-xml)
5. dorny/test-reporter tạo check "Backend Jest Tests" trên PR → xanh ✅
6. sticky-pull-request-comment dán bảng kết quả lên PR comment
7. Người review thấy:
   - Trạng thái CI xanh
   - Bảng 4.1 + 4.2 dạng markdown đẹp trên PR
   - Coverage có thể download từ artifact
```

---

## 9. File đã tạo / cập nhật trong session này

| File | Hành động | Số dòng |
|---|---|---:|
| `.github/workflows/test.yml` | **Tạo mới** | ~140 |
| `backend-core/prisma/seed-test.ts` | **Tạo mới** (idempotent, có safety guard) | ~225 |
| `backend-core/jest.config.ts` | Thêm `jest-junit` reporter | +14 line |
| `backend-core/package.json` | Thêm script `prisma:seed:test` + devDep `jest-junit` | +2 line |
| `.gitignore` (root) | Thêm `junit.xml` và `**/junit.xml` | +2 line |
| `docs/testing/03-cicd-and-seed.md` | **Tạo mới** (báo cáo này) | — |

---

## 10. Bài học kỹ thuật

1. **Service container > remote DB cho CI**: an toàn (không leak secret), nhanh (latency thấp), cô lập (mỗi run sạch).
2. **JUnit XML là format chung**: tích hợp được hầu hết tool CI/CD (dorny, JUnit Viewer, SonarQube). Markdown reporter là tuỳ biến cho thesis nhưng không thay thế được JUnit cho machine-readable.
3. **`sticky-pull-request-comment` + `header`**: pattern cập nhật comment thay vì tạo mới — PR không bị spam khi push nhiều lần.
4. **`pg_isready` loop**: cần đợi Postgres ready trước migrate. GitHub Actions health-check không guarantee container đã accept connection.
5. **Seed an toàn**: guard `?schema=test|localhost` ngăn nhầm chạy seed vào production DB — bài học từ vô số incident "rm -rf /" trong CI.
6. **`continue-on-error: true` vs `--passWithNoTests`**: dùng cả hai cho e2e step để vừa pass khi 0 test, vừa không fail workflow nếu có lỗi cấu hình.
