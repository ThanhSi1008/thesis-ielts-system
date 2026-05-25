# PHASE 2 — Advanced: Parity Luồng Làm Bài

> **Mục tiêu:** Nâng trải nghiệm làm bài Advanced Listening/Reading lên ngang intensive bằng cách **tái dùng** component đã có, không chờ refactor lớn (P4).
> **Mức độ:** 🔴/🟡 — gap UX rõ rệt nhất ở Advanced Reading.
> **Phụ thuộc:** Không bắt buộc P4. Cố ý reuse `ReadingExamBlock` + `ExamAnswerSheet` hiện hữu.

---

## Bối cảnh kỹ thuật

`AdvancedPartScreen` (`app/ielts/advanced/[skill]/[partId].tsx`) là runner luyện Listening/Reading:

- Tải 1 part qua `ieltsAdvancedApi.getListeningPart/getReadingPart`.
- **Listening:** `RichAudioPlayer` (đầy đủ control) + transcript gập (`TranscriptReview`) + "locate" → cuộn transcript tới câu.
- **Reading:** `passagePanel` `maxHeight: 220` + `PassageReview` (locate) + câu hỏi trong `ScrollView` bên dưới. **Không split, không resize.**
- Render câu hỏi qua `renderGroup` **cục bộ** (MCQBlock, FillBlock, `DiagramMapBlock`, `MatchingBlock`, `MCMultipleBlock`, `FormCompletionBlock`).
- **Không** timer, **không** answer palette. Submit → confirm → `submitListening/submitReading` → result.

So với web advanced:
- Reading web: **grid 2 cột** `ReadingPassagePanel | ReadingQuestionsPanel`, locate cuộn tới `passage-q-{n}`.
- Listening web: `<audio controls>` (tua được — practice) + renderer dùng chung với Basic.

Intensive đã có sẵn **`ReadingExamBlock`** (split resizable dọc/ngang, part tabs, `TextWithLookup`) và **`ExamAnswerSheet`** — ta tái dùng cho Advanced.

---

## Danh sách công việc

### P2-1 · Reading Advanced dùng layout split (tái dùng `ReadingExamBlock`) 🔴

**Vấn đề:** Panel passage 220px quá chật để đọc đoạn dài trong khi câu hỏi ở dưới.

**Việc cần làm:**
- Cho Advanced Reading dùng **`ReadingExamBlock`** (đã có split resizable + part tabs + tra từ). Map dữ liệu part advanced (`part.passage`, `part.content`) sang `parts` mà `ReadingExamBlock` kỳ vọng (một "part" = passage hiện tại).
- Truyền `renderGroup` phù hợp (tạm thời dùng `renderGroup` advanced hiện tại; sẽ thống nhất ở P4).
- Giữ tính năng **locate** passage (cuộn passage tới vị trí câu) — `ReadingExamBlock`/`PassageReview` cần nhận `locatedQuestion`.
- Nếu không muốn đổi toàn bộ ngay: tối thiểu nâng `passagePanel` thành **split kéo giãn** (mượn logic `topFlex` + splitter trong `ReadingExamBlock`) hoặc nút chuyển chế độ "Đọc đoạn ⇄ Trả lời".

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `components/ielts/ReadingExamBlock.tsx`, `components/ielts/PassageReview.tsx`

**DoD:** Advanced Reading cho phép kéo chia tỉ lệ đoạn/câu hỏi (phone) hoặc 2 cột (tablet); đọc đoạn dài thoải mái; locate vẫn hoạt động.

---

### P2-2 · Thêm Answer Palette cho Advanced L/R (tái dùng `ExamAnswerSheet`) 🟡

**Vấn đề:** Không có cách nhảy nhanh tới câu / xem tổng quan đã làm.

**Việc cần làm:**
- Thêm nút mở `ExamAnswerSheet` (drawer) ở thanh dưới Advanced L/R, hiển thị `{answered}/{qNumbers.length}`.
- Dùng `extractAllItemsFromPart` + `questionNumbersFromItems` (`lib/exam-parser`) để có danh sách số câu + `answeredSet` (đã dùng sẵn trong màn này để tính header count).
- `onSelect(n)` → cuộn tới câu (sau khi P1-3 có cơ chế cuộn-đúng-câu, tái dùng cùng tiện ích).

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `components/intensive/ExamAnswerSheet.tsx`, `lib/exam-parser.ts`

**DoD:** Mở palette thấy đúng số câu, bấm số → cuộn tới câu; đếm "đã trả lời" đúng.

---

### P2-3 · Locate parity: cuộn cả passage/transcript **và** câu hỏi 🟡

**Vấn đề:** Hiện locate chỉ cuộn passage/transcript tới vị trí; chưa có chiều ngược (từ palette → câu hỏi) thống nhất.

**Việc cần làm:**
- Chuẩn hoá 2 chiều: (a) bấm "locate" trên câu → cuộn passage/transcript tới `passage-q-{n}` (đã có); (b) bấm số câu ở palette → cuộn khung câu hỏi tới câu n (mới, từ P2-2).
- Với Listening, locate vẫn tự mở transcript (`setShowTranscript(true)`) như hiện tại.

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `components/ielts/{PassageReview,TranscriptReview}.tsx`

**DoD:** Hai chiều locate đều mượt, không nhảy sai vị trí.

---

### P2-4 · (Tùy chọn) Chế độ luyện có hẹn giờ "Timed Practice" 🟢

**Vấn đề:** Advanced practice không có timer — phù hợp luyện tự do, nhưng người luyện thi muốn áp lực thời gian thật.

**Việc cần làm:**
- Thêm toggle "Timed" ở màn catalog hoặc đầu part; nếu bật → dùng `useExamTimer` với thời lượng gợi ý theo part (Reading ~20', Listening = độ dài audio + 2'), hiển thị `ExamHeader` countdown; hết giờ → tự submit (tùy chọn).
- Mặc định TẮT để không phá luồng luyện hiện tại.

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `hooks/useExamTimer.ts`, `components/intensive/ExamHeader.tsx`

**DoD:** Bật Timed → có đồng hồ + auto-submit; tắt → hành vi như cũ.

---

### P2-5 · Save & Exit cho Advanced (nhất quán với intensive) 🟢

**Vấn đề:** Advanced không có `useExitConfirm`; thoát giữa chừng mất đáp án đã chọn (chưa submit).

**Việc cần làm:**
- Thêm `useExitConfirm` + (nếu backend hỗ trợ) lưu nháp đáp án advanced; nếu không có endpoint lưu nháp cho L/R, tối thiểu hỏi xác nhận "Thoát sẽ mất đáp án chưa nộp?".

**File:** `app/ielts/advanced/[skill]/[partId].tsx`, `hooks/useExitConfirm.ts`, `services/ielts.api.ts` (kiểm tra endpoint lưu nháp)

**DoD:** Thoát giữa chừng có cảnh báo; nếu có lưu nháp thì khôi phục được.

---

## Tiêu chí hoàn thành Phase 2 (DoD)

- [ ] Advanced Reading có layout split/resize (hoặc 2 cột tablet) — hết cảnh chật 220px.
- [ ] Advanced L/R có Answer Palette nhảy câu + đếm tiến độ.
- [ ] Locate 2 chiều mượt.
- [ ] (Tùy chọn) Timed Practice & Save & Exit.

## Cách kiểm thử

1. Mở 1 Reading part đoạn dài trên phone → kéo splitter → đọc + trả lời.
2. Trên tablet/emulator >600px → kiểm 2 cột.
3. Palette: trả lời rải rác → mở palette → bấm câu chưa làm → cuộn đúng.
4. Locate: bấm "locate" câu 5 → passage cuộn tới đoạn liên quan.
5. (Nếu làm) Timed: bật → đồng hồ chạy → hết giờ auto-submit.
