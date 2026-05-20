# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-20T13:05:08.012Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 16 |
| Pass | 16 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 6301 |

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

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 11 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 18 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 1 | Auto (Jest) | 2026-05-20 |

## 4. Chi tiết theo từng file spec

### `../test/edge-cases/pagination.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_EDGE_01: ?page=0 → default về page 1 (ParseInt không reject) | Pass | 11 |
| — | TC_EDGE_02: ?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min) | Pass | 3 |
| — | TC_EDGE_03: ?limit=10000 → 200 (không có cap maxLimit trong controller) | Pass | 1 |
| — | TC_EDGE_04: ?cursor=not-a-valid-uuid → 200 (notifications không có cursor param) | Pass | 1 |
| — | TC_EDGE_05: (không truyền gì) → 200, DefaultValuePipe: page=1, limit=20 | Pass | 1 |
| — | TC_EDGE_06: ?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1)) | Pass | 1 |
| — | TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404) | Pass | 2 |
| — | TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] } | Pass | 3 |

### `../test/edge-cases/boundary-values.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass) | Pass | 18 |
| — | TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ) | Pass | 2 |
| — | TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100)) | Pass | 1 |
| — | TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject) | Pass | 2 |
| — | TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw | Pass | 2 |
| — | TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation) | Pass | 2 |
| — | TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép) | Pass | 2 |
| — | TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10)) | Pass | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._