# PHASE 4 — Hợp Nhất Renderer Câu Hỏi (Refactor)

> **Mục tiêu:** Gộp 3 hệ render câu hỏi đang song song về **một** hệ shared, ngang mô hình web (`AnswerField`).
> **Mức độ:** 🟡 — dọn nợ kỹ thuật; **làm sau** P1–P3 để DRY hoá những gì vừa chạm.
> **Phụ thuộc:** Nên hoàn tất P1–P3 trước (tránh refactor trên nền đang sửa).

---

## Bối cảnh kỹ thuật — 3 hệ render hiện tại

| Hệ | Nơi định nghĩa | Dùng bởi | Đặc điểm |
|---|---|---|---|
| **A. Intensive** | `components/intensive/QuestionGroupRenderer.tsx` (`renderGroup`, `MCQQuestion`, `FillQuestion`, `SummaryBlankSelector`…) | `[examId].tsx`, `practice/[sessionId].tsx`, `ReadingExamBlock` | group-type based; có summary blank selector |
| **B. Advanced** | `app/ielts/advanced/[skill]/[partId].tsx` (`renderGroup` cục bộ) + `components/ielts/{MCQBlock,FillBlock,DiagramMapBlock,MatchingBlock,MCMultipleBlock,FormCompletionBlock}` | Advanced L/R | group-type based; bộ block riêng |
| **C. Basic** | `components/ielts/exercise/*` (`MCQGroup`, `FillGroup`, `TFNGGroup`, `TableGroupView`, `MapLabellingGroupView`…) | Basic tier | group-view based; phủ nhiều loại nhất |

**Hệ quả:** sửa một loại câu (vd cách tính đáp án matching) phải sửa ≥2 nơi; UI/parsing dễ lệch; coverage khác nhau (A có `SummaryBlankSelector`, B có `FORM_TYPES` gồm `flowchart_completion`, C có `TFNG/Table`…). Web tránh được nhờ **flatten part → items** rồi render qua **một** `AnswerField`.

---

## Chiến lược

> **Không big-bang.** Tạo hệ shared mới, migrate từng flow, xoá dần hệ cũ. Mỗi bước là một PR có thể revert.

### P4-1 · Khảo sát & lập ma trận coverage 🟡

- Liệt kê **mọi `type` câu hỏi** mà 3 hệ xử lý + dữ liệu mẫu (đọc JSON `questions` thực tế từ vài exam/part).
- Lập bảng: loại câu × (A/B/C có hỗ trợ?) × (khác biệt UI/parse). Xác định "super-set" cần hỗ trợ.
- Đối chiếu với web `lib/exam-parser.ts` + `AnswerField.tsx` để mượn mô hình **item-based**.

**Đầu ra:** `docs/mobile-improvement-v3/_coverage-matrix.md` (bảng tham chiếu).

---

### P4-2 · Thiết kế hệ shared `components/ielts/exam/` 🟡

- Mô hình đề xuất (theo web): `lib/exam-parser.ts` flatten `part → items[]` (mỗi item có `type`, `question_number(s)`, payload). Một `QuestionItem` component switch theo `item.type`.
- API thống nhất: `renderItem(item, { answers, setAnswer, mode })` với `mode: 'exam' | 'practice' | 'review'` (review = hiển thị đáp án đúng/giải thích — phục vụ P5).
- Tái dùng block tốt nhất từ A/B/C cho từng loại (vd lấy `DiagramMapBlock` của B, `TableGroupView` của C…), gom về `components/ielts/exam/blocks/`.
- Giữ `ReadingExamBlock` (split) & `ExamAnswerSheet` làm "khung", chỉ thay phần render câu bên trong.

**Đầu ra:** thư mục `components/ielts/exam/` (renderer + blocks + types).

---

### P4-3 · Migrate Intensive sang hệ shared 🟡

- Thay `renderGroup` (hệ A) trong `[examId].tsx` + `practice/[sessionId].tsx` + `ReadingExamBlock` bằng renderer shared.
- Bảo đảm `answeredSet` / cuộn-đúng-câu (P1-3) hoạt động trên item-model mới.
- Regression: so kết quả chấm L/R trước/sau (đáp án không đổi).

---

### P4-4 · Migrate Advanced sang hệ shared 🟡

- Bỏ `renderGroup` cục bộ trong `[skill]/[partId].tsx`; dùng renderer shared + `ReadingExamBlock` (đã reuse ở P2-1).
- Giữ tính năng locate/transcript/passage.

---

### P4-5 · (Tùy chọn) Migrate Basic & xoá hệ cũ 🟢

- Nếu coverage shared đã phủ Basic → migrate `ielts/exercise/*` users; xoá code chết.
- Nếu rủi ro cao → để Basic lại, chỉ hợp nhất A+B (đã đủ cho trọng tâm advanced+intensive).

---

## Tiêu chí hoàn thành Phase 4 (DoD)

- [ ] Ma trận coverage đầy đủ, không loại câu nào bị bỏ sót khi hợp nhất.
- [ ] Intensive + Advanced dùng **chung một** renderer.
- [ ] Đáp án chấm L/R **không đổi** trước/sau refactor (regression pass).
- [ ] Xoá được ít nhất hệ B (advanced inline) — giảm trùng lặp.

## Cách kiểm thử

1. Bộ đề hồi quy: chọn 3–5 exam + 3–5 advanced part phủ mọi loại câu; chụp đáp án/điểm trước refactor, so sau refactor.
2. Snapshot UI mỗi loại câu trong `app/_dev/atom-gallery.tsx` (thêm mục "Exam blocks") ở light + dark.
3. Kiểm `answeredSet`, palette, cuộn-đúng-câu vẫn đúng sau migrate.

## Rủi ro & giảm thiểu

- **Lệch parse JSON giữa các hệ** → P4-1 phải có dữ liệu thật làm chuẩn; viết unit test cho `exam-parser` (số câu, key đáp án).
- **Refactor đụng nhiều màn** → migrate từng flow, mỗi flow 1 PR, giữ hệ cũ tới khi flow mới pass.
