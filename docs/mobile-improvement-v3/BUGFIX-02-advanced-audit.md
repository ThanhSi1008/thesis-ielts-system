# BUGFIX-02 — Advanced Writing crash + Audit (history · review · keyboard)

> **Ngày:** 2026-05-25 · **Phạm vi:** `frontend-mobile` (+ tham chiếu backend-ai)
> **Yêu cầu:** (1) xác nhận BUGFIX-01 đã đúng; (2) kiểm Advanced: lỗi/lưu history/chỗ xem history; (3) Advanced & Intensive có "xem đáp án chi tiết" như web không; (4) bàn phím có che ô nhập không; (5) crash `WritingRubricView … toFixed of undefined`.

---

## 0. Xác nhận BUGFIX-01 ✅ ĐÃ ĐÚNG & HẾT LỖI

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| `getHistory` nhận trạng thái non-COMPLETED | ✅ | `exams.service.ts:381` → `status: { in: ["COMPLETED","GRADED","SUBMITTED","GRADING","GRADING_FAILED"] }` (rộng hơn khuyến nghị — hiện cả bài đang chấm/chấm lỗi) |
| Bổ sung `speakingScore` + `status` vào map | ✅ | `exams.service.ts:402–405` |
| Statistics tính cả W/S | ✅ | `ielts-statistics.service.ts:21` → `status: { in: ["COMPLETED","GRADED"] }` + `ieltsIntensiveResult: { isNot: null }` |

⇒ Writing/Speaking Intensive giờ **sẽ** xuất hiện trong Test History. (Còn 1 lưu ý hiển thị band — xem §4.)

---

## 1. 🔴 CRASH — Advanced Writing Result: `Cannot read property 'toFixed' of undefined`

### 1.1 Nguyên nhân gốc (đã xác minh)

`WritingRubricView` được thiết kế cho **Intensive Writing** (shape 2 task): `feedback = { overall_band, task1: {band, criteria}, task2: {band, criteria} }`, và truy cập `feedback.task2.band.toFixed(1)` (`WritingRubricView.tsx:546,555`) + `data.band` trong `TaskScoreSummary` (`:333`).

Nhưng **Advanced Writing chấm theo 1 task**: `grade_single_writing_task` trả `{ overall_band, criteria }` — **KHÔNG có field `band`** (`backend-ai/app/services/writing_grader.py:265,323–324`).

`normalizedFeedback` ở result screen gói thẳng raw vào `task1`/`task2`:

```ts
// app/ielts/advanced/writing/result/[sessionId].tsx:154–166
const overall_band = session.bandScore ?? rawFeedback.overall_band ?? rawFeedback.band ?? 6.0;
if (prompt?.taskType === 'TASK1') {
  return { overall_band, task1: rawFeedback, task2: null };   // rawFeedback KHÔNG có .band
} else {
  return { overall_band, task1: null, task2: rawFeedback };   // task2 = {overall_band, criteria} → .band = undefined
}
```

⇒ Session **TASK2** → `practicePart=2` → `showTask2=true` (`WritingRubricView.tsx:518`) → `feedback.task2.band.toFixed(1)` với `band === undefined` → **CRASH** (ErrorBoundary nuốt cả màn). TASK1 cũng crash ở `feedback.task1.band` theo cùng cơ chế / hoặc ở `TaskScoreSummary`.

### 1.2 Cách sửa (2 lớp — nên làm cả hai)

**(A) Sửa `normalizedFeedback` → ánh xạ về đúng `TaskFeedback {band, criteria}`** (sửa đúng dữ liệu):

```ts
// app/ielts/advanced/writing/result/[sessionId].tsx
const overall_band = session.bandScore ?? rawFeedback.overall_band ?? rawFeedback.band ?? 6.0;

// raw 1-task → TaskFeedback chuẩn (có .band)
const taskFb = {
  band: rawFeedback.band ?? rawFeedback.overall_band ?? overall_band,
  criteria: rawFeedback.criteria ?? {},
  ...rawFeedback,
};
return prompt?.taskType === 'TASK1'
  ? { overall_band, task1: taskFb, task2: null }
  : { overall_band, task1: null, task2: taskFb };
```

**(B) Phòng thủ trong `WritingRubricView`** (không bao giờ crash dù dữ liệu thiếu):

```ts
// WritingRubricView.tsx
const showTask1 = (!practicePart || practicePart === 1) && !!feedback.task1;   // + kiểm tồn tại
const showTask2 = (!practicePart || practicePart === 2) && !!feedback.task2;
// và mọi nơi: feedback.task1?.band?.toFixed(1) ?? '—'; bandColor(feedback.task2?.band ?? 0)
// TaskScoreSummary: const color = bandColor(data?.band ?? 0); data?.band?.toFixed(1)
```

> Lưu ý: Intensive Writing result **không** bị lỗi này (dùng `grade_writing` trả đủ `{task1,task2}`). Lớp (B) còn giúp chống crash cho mọi shape lạ trong tương lai.

---

## 2. Advanced — Lưu & Hiển thị lịch sử

### 2.1 Có lưu history không? ✅ CÓ (L/R/W) · ⚠️ Speaking KHÔNG hiển thị

- Backend lưu đầy đủ: API `getListeningHistory` / `getReadingHistory` / `getWritingHistory` / `getSpeakingHistory` đều tồn tại (`services/ielts.api.ts:38,53,91,121`).
- Màn hiển thị: `app/ielts/advanced/history/index.tsx` (accordion theo kỹ năng) + vào từ Advanced index (banner "View Practice History" + icon ⏱ header → `ieltsAdvancedHistory`). Per-part history: `advanced/[skill]/[partId]/history.tsx`.

### 2.2 🟡 BUG — Advanced **Speaking** history không bao giờ hiện

`advanced/history/index.tsx` khai báo `SKILLS` gồm cả `SPEAKING` (`:47`) nhưng `load()` chỉ `Promise.all([getListeningHistory, getReadingHistory, getWritingHistory])` — **thiếu `getSpeakingHistory()`** (`:335–338`). ⇒ Mục "Speaking" luôn rỗng ("No Speaking sessions yet") dù có dữ liệu.

**Fix:**
```ts
const [listening, reading, writing, speaking] = await Promise.all([
  ieltsAdvancedApi.getListeningHistory(),
  ieltsAdvancedApi.getReadingHistory(),
  ieltsAdvancedApi.getWritingHistory(),
  ieltsAdvancedApi.getSpeakingHistory(),     // ✅ thêm
]);
const normalizeSpeaking = (Array.isArray(speaking) ? speaking : []).map((s: any) => ({
  id: s.id, skill: 'SPEAKING',
  dateTaken: s.createdAt,
  examTitle: s.part?.title ?? 'Speaking Practice',
  practicePart: s.part?.partNumber ?? null,
  rawScore: s.bandScore ?? null,
}));
setSessions([...normalizeListening, ...normalizeReading, ...normalizeWriting, ...normalizeSpeaking]);
```

### 2.3 Lưu ý — Test History toàn cục (Phase 6) chỉ gộp 1 phần Advanced

`TestHistoryContent.fetchHistory` chỉ gộp `getHistory()` (intensive) + `getWritingHistory()` (advanced writing) — **không** gồm advanced L/R/Speaking. Advanced L/R/S vẫn xem ở `advanced/history`. Đây là chủ ý (mock vs practice), nhưng nếu muốn 1 nơi xem tất cả thì nên gộp đủ 4 advanced API vào `TestHistoryContent` (tùy chọn).

---

## 3. Xem đáp án chi tiết (review) — đối chiếu Web

| Luồng | Mobile | Web | Tình trạng |
|---|---|---|---|
| Intensive L/R | `result/[sessionId].tsx` dùng `renderGroup` (review) + getListening/ReadingBand | per-question my-answers | ✅ Có |
| Intensive Writing/Speaking | `WritingRubricView` / `SpeakingRubricView` (`result/[sessionId].tsx:22–23`) | WritingResultView / SpeakingResultView | ✅ Có |
| Advanced L/R | `advanced/[skill]/[partId]/result/[resultId].tsx` — Tab `score`/`review`, `extractCorrectAnswers`+`isCorrect` từng câu | my-answers | ✅ Có |
| Advanced Writing | `WritingRubricView` | WritingResultView | ⚠️ Có nhưng **đang crash** (§1) → sửa xong là OK |
| Advanced Speaking | `advanced/speaking/result/[sessionId].tsx` + `SpeakingRubricView` (548 dòng) | SpeakingResultView | ✅ Có |

⇒ **Parity review về cơ bản đầy đủ** cho cả Advanced & Intensive (theo từng kỹ năng). Việc duy nhất chặn là crash Advanced Writing ở §1.

---

## 4. 🟡 Hiển thị band W/S trong Test History (hệ quả sau BUGFIX-01)

Sau khi W/S Intensive đã hiện trong history, cần kiểm card hiển thị band:
- `ieltsIntensiveResult.totalScore` của W/S = **band 0–9** (backend-ai ghi `totalScore = overall_band`).
- Nếu `TestHistoryContent` card mock vẫn `getBand(rawScore)` (giả định raw 0–40) → Writing 6.5 hiện sai 3.0.

**Cần xác nhận/sửa** `components/ielts/TestHistoryContent.tsx`: với `skill ∈ {WRITING,SPEAKING}` dùng band trực tiếp (`writingScore ?? speakingScore ?? rawScore`), L/R mới quy đổi `rawTo*Band`. (Mẫu đúng đã có ở `intensive/index.tsx` AccordionGroup.)

---

## 5. 🟡 Bàn phím che ô nhập liệu

### 5.1 Kết quả kiểm tra `KeyboardAvoidingView` (KAV)

| Màn / Component | KAV? | Ô nhập | Nguy cơ che |
|---|---|---|---|
| `intensive/[examId].tsx` (full-exam) | ❌ 0 | — | trực tiếp không có KAV |
| `intensive/practice/[sessionId].tsx` | ✅ 3 | — | OK |
| `advanced/[skill]/[partId].tsx` (L/R) | ❌ 0 | TextInput fill-in | **CÓ** |
| `advanced/writing/[promptId].tsx` | ✅ 3 | essay | OK |
| `components/ielts/WritingExamBlock.tsx` | ✅ 3 | essay | OK (dùng trong full-exam → Writing ổn) |
| `components/ielts/ReadingExamBlock.tsx` | ❌ | TextInput fill-in | **CÓ** |
| `QuestionGroupRenderer` (FillQuestion) | ❌ | TextInput fill-in | **CÓ** (không auto-scroll khi focus) |

### 5.2 Kết luận

- **Writing** (cả Intensive full-exam lẫn Advanced): ổn — `WritingExamBlock` & màn advanced writing đã có KAV (nên xác nhận lại trên thiết bị thật, đặc biệt Android `windowSoftInputMode`).
- **Reading/Listening fill-in (điền từ):** ô `TextInput` ở **Intensive full-exam** và **Advanced L/R** **bị bàn phím che** khi câu nằm thấp — vì `[examId].tsx`, `[skill]/[partId].tsx`, `ReadingExamBlock`, `QuestionGroupRenderer` đều không có KAV/auto-scroll-to-focused.

### 5.3 Fix đề xuất

1. Bọc vùng cuộn câu hỏi bằng `KeyboardAvoidingView` (`behavior={Platform.OS==='ios'?'padding':undefined}`, `keyboardVerticalOffset` = chiều cao header) ở `[examId].tsx` và `[skill]/[partId].tsx`, và/hoặc trong `ReadingExamBlock` (cột câu hỏi).
2. `ScrollView`/`FlatList` đặt `keyboardShouldPersistTaps="handled"` để tap chọn câu khác không bị nuốt.
3. Tốt nhất: `TextInput.onFocus` → cuộn ô vào vùng nhìn thấy (đã có `questionOffsetsRef`/`scrollTo` trong `[examId].tsx` & `ReadingExamBlock:197` — tái dùng để `scrollTo` câu đang focus). Hoặc dùng `react-native-keyboard-aware-scroll-view` cho vùng câu hỏi.
4. Android: kiểm `app.json` → `softwareKeyboardLayoutMode` / `android:windowSoftInputMode=adjustResize`.

---

## 6. Tổng hợp việc cần sửa (ưu tiên)

| # | Mức độ | Việc | File |
|---|---|---|---|
| 1 | 🔴 | Sửa `normalizedFeedback` → `TaskFeedback {band,criteria}` + phòng thủ `?.band` trong `WritingRubricView` | `app/ielts/advanced/writing/result/[sessionId].tsx`, `components/ielts/WritingRubricView.tsx` |
| 2 | 🟡 | Thêm `getSpeakingHistory()` vào Advanced history | `app/ielts/advanced/history/index.tsx` |
| 3 | 🟡 | Band W/S trong Test History theo kỹ năng (không `getBand` band 0–9) | `components/ielts/TestHistoryContent.tsx` |
| 4 | 🟡 | KAV/auto-scroll cho fill-in Reading/Listening (Intensive full-exam + Advanced L/R) | `intensive/[examId].tsx`, `advanced/[skill]/[partId].tsx`, `ReadingExamBlock.tsx` |
| 5 | 🟢 | (tùy chọn) Gộp đủ 4 advanced API vào `TestHistoryContent` để 1 nơi xem tất cả | `TestHistoryContent.tsx` |

---

## 7. Kiểm thử

1. **Crash Writing:** mở result của 1 Advanced Writing **TASK2** (và TASK1) → không crash, hiển thị band + breakdown 4 tiêu chí đúng; mở Intensive Writing result → vẫn OK (không hồi quy).
2. **Advanced history:** làm 1 Speaking practice → vào `/ielts/advanced/history` → mục Speaking hiện đúng phiên + band.
3. **Test History band:** nộp Writing Intensive (band ví dụ 6.5) → Test History hiện đúng 6.5 (không phải 3.0); L/R vẫn đúng.
4. **Bàn phím:** Intensive Reading + Advanced Reading → focus ô điền từ ở **cuối** trang → ô **không** bị bàn phím che (tự cuộn lên); tap câu khác vẫn nhận.
5. **Review parity:** mở review từng câu L/R (đúng/sai/giải thích) + rubric W/S ở cả Advanced & Intensive.
6. `tsc --noEmit` (mobile) sạch.

---

## 8. Trả lời trực tiếp các câu hỏi

- **Advanced có lỗi không?** Có 1 crash nghiêm trọng ở **Advanced Writing result** (§1) + 1 bug Speaking history không hiển thị (§2.2).
- **Có lưu history không / có chỗ xem không?** Có lưu (L/R/W/S đều có API + lưu); có màn xem (`advanced/history` + banner ở Advanced index + per-part history). Riêng **Speaking** chưa được fetch nên không thấy → fix §2.2.
- **Có xem đáp án chi tiết như web không?** Có — đủ cho L/R (từng câu) và W/S (rubric) ở cả Advanced & Intensive; chỉ vướng crash Advanced Writing (§1).
- **Bàn phím che ô nhập?** Writing: ổn. **Reading/Listening điền từ: bị che** ở Intensive full-exam & Advanced L/R → fix §5.
