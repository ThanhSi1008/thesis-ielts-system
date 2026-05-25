# PHASE 5 — Polish, Review-mode, Accessibility, Performance & QA

> **Mục tiêu:** Hoàn thiện chất lượng luồng làm bài trước khi merge.
> **Mức độ:** 🟢 — sau khi P1–P4 ổn định.

---

## Danh sách công việc

### P5-1 · Parity chế độ "Xem lại đáp án" (review-mode) 🟢

**Bối cảnh:** Web hiển thị đáp án đúng + giải thích ngay sau submit (`showAnswers={submitted}`) và trang `my-answers/[sessionId]`. Mobile có result screen lớn (`intensive/result/[sessionId].tsx`, 1311 dòng) nhưng cần đảm bảo **review từng câu** (đáp án của user vs đáp án đúng + giải thích) cho L/R ngang web.

**Việc cần làm:**
- Thêm `mode='review'` cho renderer shared (P4-2): hiển thị đáp án user, đáp án đúng, đúng/sai, giải thích/hint.
- Đảm bảo intensive + advanced result đều vào được review từng câu.

**File:** `components/ielts/exam/*`, `app/ielts/intensive/result/[sessionId].tsx`, `app/ielts/advanced/[skill]/[partId]/result/[resultId].tsx`

---

### P5-2 · Phủ Accessibility cho Advanced (ngang Intensive) 🟢

**Bối cảnh:** `[examId].tsx` đã có `accessibilityRole`, `accessibilityLabel`, `allowFontScaling`; Advanced thì chưa.

**Việc cần làm:**
- Bổ sung `accessibilityRole/Label/State` cho nút, tab, option, palette ở Advanced + audio controls.
- Bảo đảm `allowFontScaling` không vỡ layout câu hỏi (test cỡ chữ lớn).
- Tham chiếu `docs/mobile-improvement/a11y-audit-walkthrough.md` (v1) để giữ chuẩn.

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `components/ielts/*`, `components/intensive/*`

---

### P5-3 · Audit Dark-mode trên màn thi 🟢

**Việc cần làm:**
- Rà mọi màu hardcode trong luồng thi (vd `'#FFF9C4'`, `'#EEF2FF'`, `'#C7D2FE'` trong `ExamAudioPlayer`/`[examId]`/practice) → đảm bảo có nhánh `isDark`.
- Kiểm tương phản chữ trên nền vàng/xanh nhạt ở dark.
- Validate trong `app/_dev/atom-gallery.tsx`.

**File:** `components/intensive/*`, `components/ielts/*`, `app/ielts/intensive/*`, `app/ielts/advanced/*`

---

### P5-4 · Performance: memo hoá block câu hỏi (chống giật khi timer tick) 🟢

**Bối cảnh:** Quy ước CLAUDE.md: IELTS blocks phải `React.memo` để tránh re-render do timer interval (web đã làm). Mobile full-exam timer tick mỗi giây + autosave có thể gây re-render toàn cây câu hỏi.

**Việc cần làm:**
- `React.memo` cho các block câu hỏi (so sánh `answers[key]` liên quan), tách timer display ra component lá để tick không re-render câu hỏi.
- Dùng `useCallback` cho `setAnswer`/`onChange` (một phần đã có) để props ổn định.
- Đo bằng `react-devtools`/`Perf Monitor` trên đề Reading dài.

**File:** `components/ielts/exam/*` (sau P4), `app/ielts/intensive/[examId].tsx`, `components/intensive/ExamHeader.tsx`

---

### P5-5 · Test thiết bị thật cho Speaking 🟢

**Bối cảnh:** `SpeakingExamBlock` ghi âm + upload (`expo-audio`, `requestRecordingPermissionsAsync`, `uploadSpeakingAudio`). Cần kiểm trên iOS + Android thật.

**Việc cần làm:**
- Test: xin quyền mic, ghi đủ thời lượng, dừng & upload, mạng yếu (retry upload), từ chối quyền (thông báo rõ), nền/khoá máy giữa chừng ghi.
- Kiểm `SpeakingDeviceTest` chạy trước khi vào part speaking (gợi ý: bắt buộc test mic ở `PreparationScreen` cho exam speaking).

**File:** `components/ielts/SpeakingExamBlock.tsx`, `components/SpeakingDeviceTest` (mobile), `components/intensive/PreparationScreen.tsx`

---

### P5-6 · QA tổng hợp & smoke test 🟢

**Việc cần làm:**
- Viết kịch bản smoke test cho 4 kỹ năng × (full-exam + practice + advanced) — tham chiếu `docs/mobile-improvement/qa-smoke-test.md` (v1).
- E2E tối thiểu: tạo session → làm → submit → kết quả; resume; grading resilience.
- `npm run lint` + `tsc --noEmit` sạch.

**File:** docs QA + (tùy chọn) test script.

---

## Tiêu chí hoàn thành Phase 5 (DoD)

- [ ] Review từng câu cho L/R ở cả intensive + advanced.
- [ ] Accessibility Advanced ngang Intensive; cỡ chữ lớn không vỡ.
- [ ] Không còn màu hardcode phá dark-mode trong luồng thi.
- [ ] Cuộn/làm bài mượt khi timer tick (không giật).
- [ ] Speaking pass test thiết bị thật iOS + Android.
- [ ] Lint + type-check sạch; smoke test pass.
