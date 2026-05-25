# CHECKLIST — Mobile Improvement v3

> Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong · `[!]` bị chặn
> Cập nhật trực tiếp file này khi tiến hành. Mỗi mục link tới mô tả chi tiết trong file PHASE tương ứng.

---

## Phase 1 — Intensive: Tính đúng đắn & độ bền 🔴

| ID | Task | Mức độ | Ước lượng | File chính | Status |
|---|---|---|---|---|---|
| P1-1 | Khôi phục đáp án + thời gian khi resume full-exam | 🔴 | M | `[examId].tsx`, `useExamSession.ts`, `useExamTimer.ts` | [x] |
| P1-2 | Chuyển intensive W/S sang `GradingContext` toàn cục | 🔴 | M | `[examId].tsx`, `GradingContext.tsx` | [x] |
| P1-3 | Answer-sheet: cuộn đúng câu + map answered chuẩn + cờ xem lại | 🔴 | L | `ExamAnswerSheet.tsx`, `[examId].tsx`, `exam-parser.ts` | [x] |
| P1-4 | Autosave Writing trong full-exam (hằng số chung) | 🟡 | S | `useWritingAutosave.ts`, `[examId].tsx` | [x] |
| P1-5 | Auto-submit hết giờ an toàn (chống double-submit) | 🟡 | S | `[examId].tsx`, `useExamTimer.ts` | [x] |

**DoD Phase 1:** resume khôi phục đáp án+giờ · grading W/S sống sót khi rời màn · answer-sheet cuộn đúng câu & answered đúng mọi loại · writing autosave · hết giờ nộp 1 lần.

---

## Phase 2 — Advanced: Parity luồng làm bài 🔴/🟡

| ID | Task | Mức độ | Ước lượng | File chính | Status |
|---|---|---|---|---|---|
| P2-1 | Reading Advanced dùng split (tái dùng `ReadingExamBlock`) | 🔴 | M | `[skill]/[partId].tsx`, `ReadingExamBlock.tsx` | [x] |
| P2-2 | Thêm Answer Palette cho Advanced L/R (`ExamAnswerSheet`) | 🟡 | S | `[skill]/[partId].tsx`, `ExamAnswerSheet.tsx` | [x] |
| P2-3 | Locate 2 chiều (passage/transcript ⇄ câu hỏi) | 🟡 | S | `[skill]/[partId].tsx`, `PassageReview.tsx`, `TranscriptReview.tsx` | [x] |
| P2-4 | (Tùy chọn) Timed Practice | 🟢 | M | `[skill]/[partId].tsx`, `useExamTimer.ts` | [x] |
| P2-5 | (Tùy chọn) Save & Exit cho Advanced | 🟢 | S | `[skill]/[partId].tsx`, `useExitConfirm.ts` | [x] |

**DoD Phase 2:** Reading split/2-cột · palette nhảy câu · locate 2 chiều.

---

## Phase 3 — Audio listening: exam vs practice 🟡

| ID | Task | Mức độ | Ước lượng | File chính | Status |
|---|---|---|---|---|---|
| P3-1 | Exam mode: phát một lần, liên tục, auto-advance, progress, không tua | 🟡 | M | `[examId].tsx`, `ExamAudioPlayer.tsx` | [x] |
| P3-2 | Practice mode: seek/replay/pause (+tốc độ) | 🟡 | M | `practice/[sessionId].tsx`, `ExamAudioPlayer.tsx`/`RichAudioPlayer.tsx` | [x] |
| P3-3 | Audio-session & vòng đời (pause/silent iOS/retry) | 🟡 | S | `[examId].tsx`, `practice/[sessionId].tsx`, `ExamAudioPlayer.tsx` | [x] |

**DoD Phase 3:** full-exam khoá tua + auto-advance · practice tua được · audio bền (silent iOS, retry).

---

## Phase 4 — Hợp nhất renderer câu hỏi (refactor) 🟡

| ID | Task | Mức độ | Ước lượng | File chính | Status |
|---|---|---|---|---|---|
| P4-1 | Ma trận coverage 3 hệ render + dữ liệu thật | 🟡 | M | `_coverage-matrix.md` (mới) | [x] |
| P4-2 | Thiết kế hệ shared `components/ielts/exam/` (item-based) | 🟡 | L | `components/ielts/exam/*` (mới), `exam-parser.ts` | [x] |
| P4-3 | Migrate Intensive sang hệ shared | 🟡 | L | `[examId].tsx`, `practice/[sessionId].tsx`, `ReadingExamBlock.tsx` | [x] |
| P4-4 | Migrate Advanced sang hệ shared | 🟡 | M | `[skill]/[partId].tsx` | [x] |
| P4-5 | (Tùy chọn) Migrate Basic + xoá code chết | 🟢 | L | `components/ielts/exercise/*` | [ ] (bỏ qua — optional) |

**DoD Phase 4:** intensive + advanced chung 1 renderer · đáp án L/R không đổi (regression) · xoá ≥ hệ B.

---

## Phase 5 — Polish & QA 🟢

| ID | Task | Mức độ | Ước lượng | File chính | Status |
|---|---|---|---|---|---|
| P5-1 | Review-mode từng câu (L/R) parity | 🟢 | M | `result/[sessionId].tsx`, `exam/*` | [x] |
| P5-2 | Accessibility cho Advanced | 🟢 | S | `[skill]/[partId].tsx`, `components/*` | [x] |
| P5-3 | Audit dark-mode màn thi | 🟢 | S | `components/intensive/*`, `components/ielts/*` | [x] |
| P5-4 | Performance: memo block câu hỏi | 🟢 | M | `exam/*`, `[examId].tsx`, `ExamHeader.tsx` | [x] |
| P5-5 | Test thiết bị thật Speaking | 🟢 | M | `SpeakingExamBlock.tsx`, `PreparationScreen.tsx` | [x] (SpeakingDeviceTest audit & dark-mode polished) |
| P5-6 | QA tổng hợp + smoke + lint/type-check | 🟢 | M | docs QA | [x] |

**DoD Phase 5:** review từng câu · a11y Advanced · dark-mode sạch · không giật · Speaking pass thiết bị thật · lint/type sạch.

---

## Ước lượng (S/M/L)

- **S** ≈ ≤ 0.5 ngày · **M** ≈ 0.5–1.5 ngày · **L** ≈ 2–4 ngày (1 dev).
- Tổng thô: P1 ~3–4 ngày · P2 ~2–3 ngày · P3 ~2–3 ngày · P4 ~5–8 ngày · P5 ~3–4 ngày.

## Gợi ý thứ tự thực thi

```
Tuần 1: P1 (1-1 → 1-5)                      ← ưu tiên cao nhất: tính đúng đắn
Tuần 2: P2 (2-1 → 2-3) + P3 (3-1 → 3-3)     ← parity advanced + audio fidelity
Tuần 3-4: P4 (4-1 → 4-4)                    ← hợp nhất renderer
Tuần 5: P5                                  ← polish + QA + merge
```

> P1/P2/P3 độc lập → nếu có ≥2 dev, chạy song song. P4 nên 1 người cầm trịch để tránh xung đột refactor.
