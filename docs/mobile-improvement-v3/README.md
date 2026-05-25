# Mobile Improvement v3 — Kế Hoạch Hiện Thực

> **Branch:** `feature/improve-mobile-v3`
> **Phạm vi:** `frontend-mobile/` (đối chiếu chuẩn với `frontend-web/`)
> **Trọng tâm:** Luồng **làm bài thi** của `ielts/advanced` và `ielts/intensive` trên mobile
> **Ngày lập:** 2026-05-25

---

## 1. Bối Cảnh

Sau các đợt v1 (design system, dark mode, a11y) và v2 (feature parity: statistics, community, vocab-lab, shadowing…), mobile đã có nền tảng tốt cho **luồng làm bài**:

- Bộ hook nền tảng đầy đủ: `useExamSession`, `useExamTimer`, `useAnswerState`, `useExitConfirm`, `useGradingPoll`, `useWritingAutosave`.
- Đã có **full-exam runner** intensive (`app/ielts/intensive/[examId].tsx`) với `PreparationScreen`, countdown + auto-submit, `ExamAnswerSheet`, AI grading overlay.
- `ReadingExamBlock` đã có **split-view resizable** (dọc trên điện thoại, ngang trên tablet) + tra từ điển (`TextWithLookup`).
- `SpeakingExamBlock` rất hoàn chỉnh: máy trạng thái 7 bước, ghi âm `expo-audio` HIGH_QUALITY, đồng hồ chuẩn bị/ghi, waveform metering, upload audio.
- `WritingExamBlock`: tab theo task, đếm từ + progress bar, kéo giãn khung đề/bài.
- Có `GradingContext` toàn cục **đầy đủ** (hỗ trợ `INTENSIVE`/`WRITING`/`SPEAKING`, poll 5s, sống sót khi điều hướng, toast khi xong).

Tuy nhiên, khi đối chiếu **chi tiết từng bước làm bài** với web (vốn mô phỏng sát computer-delivered IELTS), vẫn còn các gap về **tính đúng đắn dữ liệu**, **độ bền khi rời màn hình**, **độ chân thực thi thật**, và **tính nhất quán kiến trúc** (mobile đang có 2–3 hệ render câu hỏi song song trong khi web chỉ có 1).

Tài liệu này tách thành **5 phase**, ưu tiên giá trị người dùng & tính đúng đắn trước, dọn nợ kỹ thuật sau.

---

## 2. Tóm Tắt Gap Analysis

| # | Vấn đề | Bằng chứng (file) | Mức độ | Phase |
|---|---|---|---|---|
| 1 | **Full-exam không khôi phục đáp án/thời gian khi resume.** "Save & Exit" lưu progress nhưng vào lại `[examId]` không nạp `session.answers`, timer đếm lại từ đầu. (Practice runner thì có restore.) | `app/ielts/intensive/[examId].tsx`, `hooks/useExamSession.ts` | 🔴 Cao | P1 |
| 2 | **Intensive W/S dùng poll cục bộ, không dùng `GradingContext`.** Rời màn hình khi đang chấm AI → mất poll (chỉ còn push). Trong khi Advanced Writing đã dùng `GradingContext` (bền). | `[examId].tsx`, `practice/[sessionId].tsx`, `contexts/GradingContext.tsx` | 🔴 Cao | P1 |
| 3 | **Answer-sheet cuộn không chính xác.** `onSelect(n)` chỉ cuộn tới **part** chứa câu, không tới đúng câu; multi-select (`mcm-*`) không map được số câu nên hiển thị sai "đã trả lời"; thiếu cờ "đánh dấu xem lại". | `components/intensive/ExamAnswerSheet.tsx`, `[examId].tsx` (`scrollToQuestion`) | 🔴 Cao | P1 |
| 4 | **Full-exam Writing không autosave.** Chỉ "Save & Exit" thủ công. (Practice autosave 30s; Advanced autosave 5s → không nhất quán, rủi ro mất bài khi crash.) | `[examId].tsx` vs `practice/[sessionId].tsx` vs `hooks/useWritingAutosave.ts` | 🟡 TB | P1 |
| 5 | **Advanced Reading bố cục chật.** Panel passage `maxHeight: 220` + câu hỏi cuộn bên dưới, không split/resize — trong khi intensive đã có `ReadingExamBlock` split tốt và web dùng 2 cột. | `app/ielts/advanced/[skill]/[partId].tsx` | 🔴 Cao | P2 |
| 6 | **Advanced L/R thiếu Answer Palette / điều hướng câu.** Không có bảng số câu để nhảy nhanh; chỉ có "locate" passage. | `app/ielts/advanced/[skill]/[partId].tsx` | 🟡 TB | P2 |
| 7 | **Listening full-exam không chân thực.** Tab theo part + đổi tab phát lại từ đầu (tua được); `ExamAudioPlayer` chỉ có volume (không progress/time, không phát-một-lần liên tục). Web phát liên tục, một lần, auto-advance. | `[examId].tsx`, `components/intensive/ExamAudioPlayer.tsx` | 🟡 TB | P3 |
| 8 | **Listening practice không seek/replay/pause.** Practice intensive dùng chung `ExamAudioPlayer` (chỉ volume) → kém hơn Advanced (vốn dùng `RichAudioPlayer` đầy đủ control). | `practice/[sessionId].tsx`, `components/ielts/RichAudioPlayer.tsx` | 🟡 TB | P3 |
| 9 | **3 hệ render câu hỏi song song.** Intensive `QuestionGroupRenderer`, Advanced `renderGroup` cục bộ + `ielts/*Block`, Basic `ielts/exercise/*`. Web chỉ 1 `AnswerField`. → sửa lỗi/loại câu phải làm nhiều nơi, UI lệch, coverage lệch. | `components/intensive/QuestionGroupRenderer.tsx`, `app/ielts/advanced/[skill]/[partId].tsx`, `components/ielts/exercise/*` | 🟡 TB | P4 |
| 10 | **Polish:** parity chế độ xem lại đáp án, phủ accessibility cho Advanced, audit dark-mode màn thi, memo hoá block câu hỏi (chống giật khi timer tick), test thiết bị thật cho Speaking. | nhiều file | 🟢 Thấp | P5 |

**Quy ước mức độ:** 🔴 Cao = ảnh hưởng tính đúng đắn/độ tin cậy khi làm bài · 🟡 Trung bình = ảnh hưởng trải nghiệm/độ chân thực · 🟢 Thấp = hoàn thiện.

---

## 3. Sơ Đồ Phases

```
P1 ── Intensive: tính đúng đắn & độ bền      (resume · global grading · autosave · answer-sheet)   🔴
P2 ── Advanced: parity luồng làm bài         (reuse split reading · answer palette · locate)        🔴/🟡
P3 ── Audio listening: exam vs practice mode (single-play liên tục · progress · seek practice)      🟡
P4 ── Hợp nhất renderer câu hỏi (refactor)   (1 hệ shared · migrate intensive+advanced · DRY)       🟡
P5 ── Polish & QA                            (review-mode · a11y · perf memo · device test)          🟢
```

**Thứ tự ưu tiên & phụ thuộc:**

- **P1, P2, P3 độc lập** với nhau — có thể làm song song / theo thứ tự giá trị. P1 ưu tiên cao nhất vì là **tính đúng đắn dữ liệu** của phòng thi thật.
- **P2 cố ý "tái dùng" component intensive sẵn có** (`ReadingExamBlock`, `ExamAnswerSheet`) → quick win, **không** chờ refactor P4.
- **P4 (hợp nhất renderer)** là dọn nợ kỹ thuật, nên làm **sau** P1–P3 để DRY hoá những gì vừa chạm; nếu làm sớm sẽ rủi ro và chặn tiến độ.
- **P5** chốt chất lượng trước khi merge.

---

## 4. Đối Chiếu Kiến Trúc Web ↔ Mobile (luồng làm bài)

| Khía cạnh | Web (`frontend-web`) | Mobile (`frontend-mobile`) | Nhận định |
|---|---|---|---|
| Render câu hỏi | **1** `components/AnswerField.tsx` (item-based) + `lib/exam-parser.ts` dùng chung cho cả advanced + intensive | **3** hệ: intensive `QuestionGroupRenderer`, advanced `renderGroup` inline, basic `ielts/exercise/*` | Web DRY; mobile phân mảnh → **P4** |
| Full-exam intensive | `take/[sessionId]/` (4 board L/R/W/S) | `[examId].tsx` (1 màn, switch theo `exam.type`) | Parity về tính năng, lệch về chi tiết |
| Restore khi resume | Có (`page.tsx` nạp `session.answers`, redirect nếu `COMPLETED`) | Full-exam **không** restore; practice **có** | Gap → **P1** |
| Chấm AI bền vững | `GradingContext` toàn cục | Có `GradingContext` nhưng intensive **không** dùng | Gap → **P1** |
| Answer palette | Theo part + lưới câu, cuộn **đúng** `question-{n}`, Prev/Next theo focus | Drawer lưới câu, cuộn tới **part**; chỉ answered/unanswered | Gap → **P1** |
| Reading layout | Split 2 cột resizable (take) / grid 2 cột (advanced) | Intensive: split tốt ✔; Advanced: panel 220px ✖ | Advanced gap → **P2** |
| Listening audio | 1 audio liên tục, **một lần**, auto-advance, không tua | Full-exam: tab/part, tua lại được, chỉ volume | Fidelity gap → **P3** |
| Writing | `WritingTaskBoard` + word count | `WritingExamBlock` tốt; thiếu autosave ở full-exam | Gap nhỏ → **P1** |
| Speaking | `SpeakingTaskBoard` | `SpeakingExamBlock` (7-state, waveform) — **mạnh** | Parity tốt; chỉ cần test thiết bị → **P5** |
| Chuẩn bị trước thi | Trang `start/` riêng | `PreparationScreen` (hướng dẫn thiết bị) — **điểm cộng** | Mobile tốt hơn |
| Thoát giữa chừng | "Protect Session" | `useExitConfirm` Save/Discard + Android back — **điểm cộng** | Mobile tốt hơn |

---

## 5. Cấu Trúc Tài Liệu

| File | Nội dung |
|---|---|
| `README.md` | Tổng quan, gap analysis, sơ đồ phases, đối chiếu kiến trúc (file này) |
| `PHASE-1-intensive-correctness.md` | Tính đúng đắn & độ bền của full-exam intensive |
| `PHASE-2-advanced-parity.md` | Parity luồng làm bài cho advanced (tái dùng component) |
| `PHASE-3-audio-fidelity.md` | Audio listening: tách chế độ exam vs practice |
| `PHASE-4-renderer-unification.md` | Hợp nhất 3 hệ render câu hỏi về 1 |
| `PHASE-5-polish-qa.md` | Review-mode, accessibility, performance, QA, device testing |
| `CHECKLIST.md` | Bảng task tổng hợp theo phase (để tick tiến độ) |
| `WALKTHROUGH.md` | Hướng dẫn kỹ thuật từng bước cho các thay đổi trọng tâm |

---

## 6. Cách Theo Dõi Tiến Độ

- Mỗi task có **mã** (`P1-1`, `P2-3`…) dùng trong `CHECKLIST.md`.
- Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong · `[!]` bị chặn.
- Mỗi phase có **Tiêu chí hoàn thành (DoD)** và **Cách kiểm thử** ở cuối file phase.
- Khuyến nghị: 1 PR / 1 phase (hoặc 1 PR / nhóm task nhỏ trong phase) để dễ review.

---

## 7. Ràng Buộc & Lưu Ý Kỹ Thuật

- **Theming:** mọi surface phải đọc `colors` từ `useTheme()`; không hardcode `COLORS` legacy (trừ giá trị brand bất biến).
- **Design system:** ưu tiên `components/atoms` / `molecules`; validate atom/molecule mới trong `app/_dev/atom-gallery.tsx` (light + dark).
- **Navigation:** dùng `router.replace()` cho redirect (tránh giữ màn thi trong back-stack).
- **Memo hoá block câu hỏi** để timer tick không gây re-render giật (quy ước CLAUDE.md cho IELTS blocks).
- **RabbitMQ/grading TTL 5 phút:** poll ceiling 60 lần × 5s = 5 phút đã khớp; giữ nguyên.
- **Push notifications** đã có — dùng làm cơ chế dự phòng khi user rời màn lúc chấm AI (bổ trợ cho `GradingContext`).
