# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-20T12:51:19.049Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 8 |
| Pass | 6 |
| Fail | 2 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 1269 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| — | — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 [SECURITY GAP — hiện trả 200] | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | `../test/security/cross-user-access.spec.ts` |
| — | — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | `../test/security/cross-user-access.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 11 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 4 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 [SECURITY GAP — hiện trả 200] | Fail | 3 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 1 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Fail | 1 | Auto (Jest) | 2026-05-20 |

## 4. Chi tiết theo từng file spec

### `../test/security/cross-user-access.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 11 |
| — | TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404 | Pass | 3 |
| — | TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404 | Pass | 4 |
| — | TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 [SECURITY GAP — hiện trả 200] | Fail | 3 |
| — | TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404 | Pass | 2 |
| — | TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403 | Pass | 2 |
| — | TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404 | Pass | 1 |
| — | TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403] | Fail | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._