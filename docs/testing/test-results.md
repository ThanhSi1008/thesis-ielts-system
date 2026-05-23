# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-23T06:18:34.179Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 6 |
| Pass | 6 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 1480 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | `modules/subscriptions/tests/subscriptions.service.spec.ts` |
| — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | `modules/subscriptions/tests/subscriptions.service.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| — | — | — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 2 | Auto (Jest) | 2026-05-23 |
| — | — | — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 5 | Auto (Jest) | 2026-05-23 |
| — | — | — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 | Auto (Jest) | 2026-05-23 |
| — | — | — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 0 | Auto (Jest) | 2026-05-23 |
| — | — | — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 | Auto (Jest) | 2026-05-23 |
| — | — | — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 | Auto (Jest) | 2026-05-23 |

## 4. Chi tiết theo từng file spec

### `modules/subscriptions/tests/subscriptions.service.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| — | TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày | Pass | 2 |
| — | TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used" | Pass | 5 |
| — | TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException | Pass | 1 |
| — | TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi | Pass | 0 |
| — | TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng | Pass | 0 |
| — | TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback | Pass | 1 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._