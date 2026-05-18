# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-18T11:17:57.193Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 8 |
| Pass | 8 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 1927 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| TC10 | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_04 | không có JWT → 401 | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | `modules/pronunciation/tests/pronunciation.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| TC10 | — | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 11 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 2 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 1 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_04 | không có JWT → 401 | Pass | 6 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 3 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 1 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 1 | Auto (Jest) | 2026-05-18 |
| TC10 | — | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 1 | Auto (Jest) | 2026-05-18 |

## 4. Chi tiết theo từng file spec

### `modules/pronunciation/tests/pronunciation.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 11 |
| TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 2 |
| TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 1 |
| TC10_04 | không có JWT → 401 | Pass | 6 |
| TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 3 |
| TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 1 |
| TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 1 |
| TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._