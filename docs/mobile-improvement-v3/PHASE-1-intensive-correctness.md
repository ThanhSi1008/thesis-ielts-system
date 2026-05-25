# PHASE 1 — Intensive Full-Exam: Tính Đúng Đắn & Độ Bền

> **Mục tiêu:** Phòng thi thật (`app/ielts/intensive/[examId].tsx`) không được mất dữ liệu và phải bền khi điều hướng, ngang chuẩn web take-mode.
> **Mức độ:** 🔴 Cao — đây là tính đúng đắn dữ liệu của bài thi, không phải chỉ UX.
> **Phụ thuộc:** Không. Có thể làm ngay.

---

## Bối cảnh kỹ thuật

`ExamPlayerScreen` (`app/ielts/intensive/[examId].tsx`) là full-exam runner:

- Dùng `useExamSession({ examId, userId, onGradingDone, onGradingError })` → bên trong gọi `ieltsExamsApi.createSession(...)` và `useGradingPoll` (poll **cục bộ**).
- Dùng `useExamTimer(duration, running, handleExpire)` → countdown + auto-submit khi hết giờ.
- Dùng `useAnswerState(exam.type)` cho answers/writing/speaking.
- Dùng `useExitConfirm(...)` cho Save & Exit / Discard.
- `scrollToQuestion(n)` chỉ cuộn tới **part** chứa câu (dùng `partOffsetsRef`).
- `ExamAnswerSheet` hiển thị lưới `1..totalQuestions`, đánh dấu `answered = !!answers[String(n)]`.

So với web `take/[sessionId]/page.tsx`:
- Web nạp lại `session.answers` vào state, redirect nếu `status === 'COMPLETED'`.
- Web `TakeReadingBoard`/`TakeListeningBoard` cuộn **đúng** phần tử `question-{n}` qua `scrollIntoView`.
- Web dùng `GradingContext` (job sống sót khi rời màn).

---

## Danh sách công việc

### P1-1 · Khôi phục đáp án + thời gian khi resume full-exam 🔴

**Vấn đề:** Vào lại `[examId]` sau khi "Save & Exit" không nạp `session.answers`; `useExamTimer` luôn bắt đầu từ `duration * 60`.

**Việc cần làm:**
- Trong `useExamSession`, sau khi có `session`, trả về cờ `isResume` + dữ liệu `session.answers`, `session.timeTaken`, `session.status`.
- Nếu `session.status === 'COMPLETED' | 'GRADED'` → `router.replace(result)` ngay (giống web).
- Trong `ExamPlayerScreen`, thêm `useEffect` hydrate `useAnswerState` từ `session.answers` (theo `exam.type`: WRITING → `setWritingAnswers`, SPEAKING → `setSpeakingAnswers`, còn lại → `setAnswers`). Tham chiếu cách làm sẵn có ở `practice/[sessionId].tsx`.
- Cho `useExamTimer` nhận `initialElapsed = session.timeTaken ?? 0` để countdown tiếp đúng: `remaining = duration*60 - initialElapsed`.

**File:** `hooks/useExamSession.ts`, `hooks/useExamTimer.ts`, `hooks/useTimer.ts`, `app/ielts/intensive/[examId].tsx`

**DoD:** Làm dở 10 câu → Save & Exit → vào lại: thấy đủ 10 đáp án, đồng hồ tiếp tục từ thời điểm rời, không tạo session trùng.

---

### P1-2 · Chuyển Intensive W/S sang `GradingContext` toàn cục 🔴

**Vấn đề:** Intensive Writing/Speaking submit qua `useExamSession.submitSession` → `useGradingPoll` cục bộ; rời màn là dừng poll. `GradingContext.submitAndTrack` đã hỗ trợ `examType: 'INTENSIVE'` nhưng chưa được dùng ở đây.

**Việc cần làm:**
- Trong `executeSubmit` của `[examId].tsx`, với `exam.type ∈ {WRITING, SPEAKING}` → gọi `submitAndTrack({ sessionId, examId, examType: exam.type, answers, timeTaken: elapsed, resultUrl: ROUTES.ieltsIntensiveResult(sessionId) })` thay cho `submitSession`.
- L/R (non-AI) giữ nguyên submit trực tiếp + `SuccessCelebration` → result.
- Khi đang ở trạng thái GRADING, đọc job từ `useGrading().jobs` để hiển thị `AIGradingOverlay` (như web `TakeWritingBoard`/`TakeSpeakingBoard` đọc `activeJob`).
- Xác minh `GradingContext.startPolling` nhánh `INTENSIVE` gọi đúng `ieltsExamsApi.getSession` và đọc đúng field kết quả (`ieltsIntensiveResult.writingScore/speakingScore` hoặc `status === 'GRADED'`).
- "Go back" trong overlay → rời màn nhưng job vẫn chạy nền + toast khi xong (đã có sẵn trong `GradingContext`).

**File:** `app/ielts/intensive/[examId].tsx`, `app/ielts/intensive/practice/[sessionId].tsx`, `contexts/GradingContext.tsx`

**DoD:** Submit Writing/Speaking intensive → rời về dashboard → khi chấm xong nhận toast + mở được result; không phụ thuộc việc đứng yên ở màn thi.

> **Lưu ý:** Sau khi mọi nơi đã dùng `GradingContext`, cân nhắc giữ `useGradingPoll` chỉ cho màn **result** (poll khi mở result mà chưa GRADED) để tránh hai cơ chế song song.

---

### P1-3 · Answer-sheet: cuộn đúng câu + map "đã trả lời" chuẩn + cờ xem lại 🔴

**Vấn đề:**
1. `scrollToQuestion(n)` chỉ cuộn tới part (thô).
2. `ExamAnswerSheet` tính `answered = !!answers[String(n)]` → câu thuộc nhóm multi-select (`mcm-0`) hoặc nhóm dùng key khác số câu sẽ **không** hiển thị đã trả lời.
3. Không có trạng thái "đánh dấu xem lại" (flag) như phòng thi thật.

**Việc cần làm:**
- **Cuộn chính xác:** đo offset **từng câu** (không chỉ part). Cách làm: trong renderer, bọc mỗi câu bằng `View onLayout` ghi `questionOffsetsRef[n] = layout.y` cộng dồn offset của part; `scrollToQuestion` dùng map này. (Tương đương `document.getElementById('question-{n}')` của web.)
- **Map answered chuẩn:** xây `answeredSet: Set<number>` từ `answers` bằng cách dùng `lib/exam-parser` để liệt kê số câu thực + ánh xạ key nhóm (vd `mcm-0` → các số câu của nhóm đó). Truyền `answeredSet` xuống `ExamAnswerSheet` thay vì tự suy ra từ `answers[String(n)]`.
- **Cờ xem lại:** thêm state `flagged: Set<number>`; long-press / nút cờ trên ô; hiển thị 3 trạng thái (answered / unanswered / flagged) + chú thích. (Tham chiếu palette web.)

**File:** `components/intensive/ExamAnswerSheet.tsx`, `app/ielts/intensive/[examId].tsx`, `lib/exam-parser.ts`

**DoD:** Bấm số câu 27 → cuộn đúng câu 27; trả lời 1 câu multi-select → ô tương ứng sáng "đã trả lời"; đánh dấu cờ 1 câu → hiển thị đúng màu cờ và đếm riêng.

---

### P1-4 · Autosave cho Writing trong full-exam 🟡

**Vấn đề:** `[examId].tsx` không autosave (chỉ Save & Exit). Practice autosave 30s, Advanced 5s → không nhất quán, rủi ro mất bài khi app bị kill.

**Việc cần làm:**
- Dùng chung một cơ chế autosave (xem WALKTHROUGH §Autosave): tách hook `useExamAutosave(sessionId, payloadFn, { intervalMs })` hoặc tái dùng `useWritingAutosave` mở rộng để gọi `ieltsExamsApi.saveProgress(sessionId, payload, elapsed)`.
- Áp dụng cho full-exam Writing với debounce ~10s (cân bằng pin/mạng); hiển thị chỉ báo "Đang lưu…/Đã lưu HH:mm" như practice runner.
- Thống nhất chu kỳ giữa practice (30s) và full-exam (đề xuất 10–15s) và advanced (5s) → chọn một hằng số chung `EXAM_AUTOSAVE_MS`.

**File:** `hooks/useWritingAutosave.ts` (mở rộng) hoặc hook mới, `app/ielts/intensive/[examId].tsx`, `constants/`

**DoD:** Đang viết → kill app → mở lại vào session: nội dung mới nhất (trong khoảng debounce) còn nguyên.

---

### P1-5 · Đồng bộ trạng thái khi auto-submit hết giờ 🟡

**Vấn đề:** `handleExpire` gọi `submitSession(payload, duration*60)` rồi redirect cho L/R; cần đảm bảo không double-submit với nút Submit, và đảm bảo dừng audio + khoá thao tác.

**Việc cần làm:**
- Thêm cờ `hasSubmittedRef` chống double-submit (timer expire + người dùng bấm Submit cùng lúc).
- Khi `isTimerWarning` (≤5 phút) hiển thị cảnh báo rõ; khi hết giờ hiện overlay "Đã hết giờ — đang nộp bài tự động".
- Pause audio + disable answer inputs ngay khi bắt đầu submit.

**File:** `app/ielts/intensive/[examId].tsx`, `hooks/useExamTimer.ts`

**DoD:** Để đồng hồ về 0 → bài tự nộp đúng một lần, audio dừng, không cho sửa tiếp.

---

## Tiêu chí hoàn thành Phase 1 (DoD)

- [ ] Resume full-exam khôi phục **đáp án + thời gian** chính xác cho cả 4 kỹ năng.
- [ ] Intensive W/S chấm AI **sống sót** khi rời màn hình (qua `GradingContext`).
- [ ] Answer-sheet cuộn **đúng câu**, "đã trả lời" đúng cho mọi loại câu, có **cờ xem lại**.
- [ ] Full-exam Writing **autosave** + chỉ báo trạng thái lưu.
- [ ] Auto-submit hết giờ an toàn, không double-submit.

## Cách kiểm thử

1. **Resume:** làm dở mỗi kỹ năng → Save & Exit → vào lại kiểm tra đáp án + đồng hồ.
2. **Grading resilience:** submit W/S → thoát app/đi màn khác → chờ toast "AI Score is Ready" → mở result.
3. **Answer-sheet:** test với đề có multiple_choice_multiple + matching để xác nhận map answered.
4. **Autosave:** bật airplane mode giữa chừng để xác nhận xử lý lỗi lưu im lặng (không crash).
5. **Hết giờ:** chỉnh đề duration ngắn (hoặc mock) để chạm mốc auto-submit.
