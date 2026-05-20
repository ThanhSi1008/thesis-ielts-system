# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-20T12:30:31.956Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 6 |
| Pass | 1 |
| Fail | 5 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 1767 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_04: sessionId không tồn tại → 404 | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_02: Session đã GRADED → 200, full result shape | `modules/results/tests/results.spec.ts` |
| — | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | `modules/results/tests/results.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 9 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_RES_04: sessionId không tồn tại → 404 | Fail | 2 | Auto (Jest) | 2026-05-20 |
| — | — | — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Fail | 1 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Fail | 2 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_02: Session đã GRADED → 200, full result shape | Fail | 2 | Auto (Jest) | 2026-05-20 |
| — | Valid | — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Fail | 1 | Auto (Jest) | 2026-05-20 |

## 4. Chi tiết theo từng file spec

### `modules/results/tests/results.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_RES_05: Không có JWT token → 401 Unauthorized | Pass | 9 |
| — | TC_RES_04: sessionId không tồn tại → 404 | Fail | 2 |
| — | TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence) | Fail | 1 |
| — | TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null } | Fail | 2 |
| — | TC_RES_02: Session đã GRADED → 200, full result shape | Fail | 2 |
| — | TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string } | Fail | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._