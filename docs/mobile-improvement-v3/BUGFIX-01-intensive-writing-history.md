# BUGFIX-01 — Writing/Speaking Intensive không xuất hiện trong Test History

> **Ngày:** 2026-05-25 · **Mức độ:** 🔴 Cao (mất dữ liệu nhìn thấy được — bài đã nộp không hiện)
> **Người báo:** "Vào làm Writing trong IELTS Intensive, ấn nộp (không viết gì), vào Test History không thấy lưu."
> **Phạm vi thực tế:** **TẤT CẢ** bài Writing & Speaking Intensive (không riêng bài rỗng) đều không hiện trong Test History.

---

## 1. Triệu chứng & Tái hiện

1. IELTS Intensive → chọn 1 đề **Writing** (hoặc **Speaking**) → làm bài → **Submit**.
2. Mở **Test History** (segment mới trong màn Intensive, hoặc Drawer → Test History).
3. **Không thấy** phiên vừa nộp. (Listening/Reading thì hiện bình thường.)

> Bài rỗng chỉ là cách người dùng tình cờ chạm bug; bug xảy ra với **mọi** bài W/S Intensive.

---

## 2. Nguyên nhân gốc (Root cause)

**Lệch trạng thái phiên giữa nơi GHI và nơi ĐỌC lịch sử.**

### 2.1 Luồng dữ liệu thực tế

```
Mobile [examId].tsx → submitAndTrack({ examType: 'INTENSIVE' })
   → GradingContext → ieltsExamsApi.submitSession()
      → backend-core ExamsService.submitSession()
           • L/R: chấm đồng bộ → status = "COMPLETED"   ← (exams.service.ts:549)
           • W/S: status = "SUBMITTED", publish RabbitMQ ← (exams.service.ts:572, 616)
                      │
                      ▼
        backend-ai grading_consumer.py
           • _save_result()           → ghi bảng results        (consumer:196–220)
           • _update_session_status(session_id, 'GRADED')        (consumer:92/96 → :229–236)
                                          UPDATE "exam_sessions" SET status='GRADED'
```

⇒ Phiên W/S Intensive kết thúc ở trạng thái **`GRADED`** (do AI consumer ghi thẳng DB), còn L/R ở **`COMPLETED`**.

### 2.2 Nơi đọc lịch sử lại chỉ lấy COMPLETED

```ts
// backend-core/src/modules/exams/exams.service.ts:379–381
async getHistory(userId: string) {
  const sessions = await this.prisma.ieltsIntensiveSession.findMany({
    where: { userId, status: "COMPLETED" },   // ⛔ BỎ SÓT "GRADED"
    ...
```

`GET /exams/history` chỉ trả phiên `COMPLETED` → **phiên W/S (`GRADED`) bị loại** → mobile `TestHistoryContent` (lấy từ `ieltsExamsApi.getHistory()`) không bao giờ nhận được chúng.

> **Bằng chứng đối chiếu:** `gamification.service.ts:209,212` đã coi cả hai là "đã xong": `status: { in: ["COMPLETED", "GRADED"] }`. `getHistory` thì chưa.

### 2.3 Trường hợp bài rỗng

Bài rỗng → grader chạy và thường trả band ~0 → `GRADED` (band 0); nếu grader lỗi → `GRADING_FAILED` (consumer:114). **Cả hai đều ≠ `COMPLETED`** nên đều biến mất khỏi history. Người dùng nộp xong mà "không thấy lưu" là vì vậy.

---

## 3. Vấn đề phụ phát sinh (cần sửa kèm)

| # | Vấn đề | File:dòng | Hệ quả |
|---|---|---|---|
| P-1 | `getHistory` map **thiếu `speakingScore`** (chỉ có `writingScore`) | `exams.service.ts:393–404` | Speaking history không có điểm để hiển thị |
| P-2 | Với W/S, `ieltsIntensiveResult.totalScore` lưu **band (0–9)**, không phải raw 0–40 | `grading_consumer.py:200–220` (`score=overallBand`, `totalScore=score`) | — |
| P-3 | Mobile history card mock luôn `getBand(rawScore)` (giả định raw 0–40) | `TestHistoryContent.tsx:210,234` | Sau khi fix mục 2, Writing band 6.5 sẽ hiển thị sai (`getBand(6.5)`→3.0) |
| P-4 | `ielts-statistics.service.ts:21` cũng lọc `status: "COMPLETED"` | `ielts-statistics.service.ts:21` | Thống kê **bỏ sót** mọi bài W/S Intensive |
| P-5 | `GRADING_FAILED` không hiển thị ở đâu trong history | (filter COMPLETED/GRADED) | Bài chấm lỗi "biến mất", người dùng không biết để retry |
| P-6 | `WritingResultCallbackDto` được import nhưng **không có route callback** (spec ghi "planned — not yet implemented"); AI ghi thẳng DB bằng `psycopg2` | `exams.controller.ts:28`, `exams.service.ts:13`, `tests/result-callback.spec.ts` | Nợ kiến trúc: trái mô tả "HTTP callback" trong CLAUDE.md; dead import |

---

## 4. Cách sửa

### 4.1 [BẮT BUỘC] Backend — `getHistory` nhận cả `GRADED`

```ts
// backend-core/src/modules/exams/exams.service.ts  (getHistory)
const sessions = await this.prisma.ieltsIntensiveSession.findMany({
  where: { userId, status: { in: ["COMPLETED", "GRADED"] } },   // ✅ thêm GRADED
  include: {
    ieltsIntensiveExam: { select: { title: true, type: true, duration: true, difficulty: true } },
    ieltsIntensiveResult: true,
  },
  orderBy: { submittedAt: "desc" },
});

return sessions.map((s) => ({
  id: s.id,
  examId: s.examId,
  examTitle: s.ieltsIntensiveExam.title,
  skill: s.ieltsIntensiveExam.type,
  difficulty: s.ieltsIntensiveExam.difficulty,
  dateTaken: s.submittedAt ?? s.createdAt,
  durationMinutes: s.ieltsIntensiveExam.duration,
  timeTaken: s.timeTaken ?? null,
  rawScore: s.ieltsIntensiveResult?.totalScore ?? 0,
  writingScore: s.ieltsIntensiveResult?.writingScore ?? null,
  speakingScore: s.ieltsIntensiveResult?.speakingScore ?? null,  // ✅ P-1: bổ sung
  status: s.status,                                              // ✅ P-5: để client phân biệt GRADED/GRADING_FAILED
  maxScore: 40,
  practicePart: (s as any).practicePart ?? null,
}));
```

> **Khuyến nghị (P-5):** để bài đang chấm / chấm lỗi cũng hiện (đúng kỳ vọng "đã nộp là phải thấy"), mở rộng filter:
> `status: { in: ["COMPLETED", "GRADED", "GRADING", "GRADING_FAILED"] }` và để client hiển thị nhãn trạng thái tương ứng (Đang chấm… / Chấm lỗi — thử lại). Nếu muốn giữ tối giản, ít nhất phải có `GRADED`.

### 4.2 [BẮT BUỘC] Mobile — band hiển thị theo kỹ năng (P-3)

`TestHistoryContent` đang dùng `getBand(rawScore)` cho mọi mock. Với W/S, điểm đã là band 0–9 → **không** được `getBand()` lại. Áp đúng mẫu đã có ở `intensive/index.tsx` (`AccordionGroup`: `isWS ? scoreVal : rawToReadingBand/rawToListeningBand`).

```tsx
// components/ielts/TestHistoryContent.tsx — trong HistoryCard
const isWS = item.skill === 'WRITING' || item.skill === 'SPEAKING';
const band = isWS
  ? (item.writingScore ?? item.speakingScore ?? item.rawScore ?? 0)   // đã là band 0–9
  : item.skill === 'READING'
    ? rawToReadingBand(item.rawScore ?? 0)
    : rawToListeningBand(item.rawScore ?? 0);                          // L/R: raw 0–40 → band
// dùng `band` cho nhãn "Band x.x" thay vì getBand(rawScore)
```

> Cân nhắc tách `rawToReadingBand` / `rawToListeningBand` (đang ở `intensive/index.tsx`) ra `lib/bandCalculator.ts` để cả `TestHistoryContent` và màn Intensive dùng chung (tránh lệch ngưỡng).

### 4.3 [KHUYẾN NGHỊ] Backend — thống kê cũng tính W/S (P-4)

```ts
// backend-core/src/modules/ielts/ielts-statistics.service.ts:21
where: { status: { in: ["COMPLETED", "GRADED"] }, /* ...các điều kiện khác... */ }
```
Rà thêm các nơi khác lọc `status: "COMPLETED"` cho Intensive (vd `users.service.ts:196`) — nếu cần bao gồm W/S thì thêm `GRADED`.

### 4.4 [TÙY CHỌN] Mobile — chặn / cảnh báo nộp bài rỗng

Trong `[examId].tsx executeSubmit`, với W/S nếu payload rỗng (`!task1?.trim() && !task2?.trim()`, hoặc speaking không có audio) → hiện `ConfirmDialog` "Bạn chưa làm bài, vẫn nộp?" trước khi gọi `submitAndTrack`. Tránh tốn quota chấm AI cho bài trống (lưu ý `submitSession` **tăng usage `AI_WRITING_GRADING`** ở `exams.service.ts:557` ngay cả khi rỗng).

### 4.5 [TÙY CHỌN — dọn nợ] Bỏ DTO/callback chết hoặc hiện thực thật (P-6)

Hoặc xoá `WritingResultCallbackDto` import chết (`exams.controller.ts:28`, `exams.service.ts:13`), hoặc hiện thực route callback `POST /exams/sessions/:id/result-callback` (kèm HMAC như `result-callback.spec.ts` mô tả) để AI gọi qua HTTP thay vì `psycopg2` ghi thẳng DB — đồng bộ với mô tả kiến trúc trong CLAUDE.md.

---

## 5. Kiểm thử

1. **W/S hiện trong history:** nộp 1 Writing + 1 Speaking Intensive (có nội dung) → chờ chấm xong (status `GRADED`) → Test History (mode **Mock**) thấy cả hai, **band đúng** (vd 6.5 hiện 6.5, không phải 3.0).
2. **L/R không hồi quy:** nộp 1 Listening + 1 Reading → vẫn hiện, band raw→IELTS đúng như cũ.
3. **Bài rỗng:** nộp Writing rỗng → (nếu áp 4.1 khuyến nghị) hiện với band 0 hoặc nhãn trạng thái; (nếu áp 4.4) bị hỏi xác nhận trước.
4. **Speaking điểm:** card Speaking hiển thị band từ `speakingScore` (sau P-1).
5. **Mở chi tiết:** bấm item W/S trong history → vào đúng `ieltsIntensiveResult(sessionId)`.
6. **Thống kê (nếu áp 4.3):** số bài W/S được tính vào statistics.
7. `tsc --noEmit` (mobile) + `npm run test` (backend-core, đặc biệt `exams-submit.spec.ts`) sạch.

---

## 6. Tóm tắt thứ tự ưu tiên

| Ưu tiên | Việc | File |
|---|---|---|
| 🔴 1 | `getHistory` thêm `GRADED` (+ `speakingScore`, `status` vào map) | `backend-core/.../exams.service.ts` |
| 🔴 2 | History card band theo kỹ năng (W/S không getBand lại) | `frontend-mobile/components/ielts/TestHistoryContent.tsx` |
| 🟡 3 | Statistics (và nơi khác) thêm `GRADED` | `ielts-statistics.service.ts`, … |
| 🟢 4 | Cảnh báo nộp bài rỗng (tiết kiệm quota AI) | `app/ielts/intensive/[examId].tsx` |
| 🟢 5 | Dọn `WritingResultCallbackDto` chết / hiện thực callback HTTP | `exams.controller.ts`, `exams.service.ts` |

> **Lưu ý:** Web dùng **cùng** endpoint `/exams/history` nên fix 🔴1 ở backend cũng tự sửa cho web (web `HistoryContent` cũng đang bỏ sót W/S Intensive vì lý do y hệt).
