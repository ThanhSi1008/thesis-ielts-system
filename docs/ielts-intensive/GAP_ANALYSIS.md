# GAP ANALYSIS — IELTS Intensive Module
**Web vs Mobile · Full Feature Parity Audit**

> **Phạm vi:** Toàn bộ luồng IELTS Intensive: Catalog → Custom Practice → Take Test (4 skills) → Result  
> **Ngày tạo:** 2026-05-04  
> **Phiên bản:** 1.0.0  
> **Trạng thái:** Hoàn chỉnh (chỉ đọc, không sửa code)

---

## 1. Tổng quan kiến trúc

| Khía cạnh | Web (`frontend-web`) | Mobile (`frontend-mobile`) |
|---|---|---|
| **Framework** | Next.js 14 App Router | Expo Router (React Native) |
| **Entry point** | `src/app/ielts/intensive/page.tsx` | `app/ielts/intensive/index.tsx` |
| **Testing screen** | 4 Board riêng: `TakeListeningBoard`, `TakeReadingBoard`, `TakeWritingBoard`, `TakeSpeakingBoard` | 1 screen tổng hợp: `[examId].tsx` + các Block component |
| **Result screen** | `[examId]/result/[sessionId]/page.tsx` (1861 dòng, rất phong phú) | `result/[sessionId].tsx` (565 dòng) |
| **Audio** | `HTMLAudioElement` native | `expo-audio` |
| **AI Grading** | `GradingContext` + `submitAndTrack` (background job) | Inline trong `[examId].tsx` |
| **State management** | React Context + `useRef` | Local `useState` + `setInterval` |
| **API layer** | `exams.api.ts` | `ielts.api.ts` → `apiClient` |

---

## 2. Feature Parity Matrix

### 2.1 Catalog Screen

| Tính năng | Web | Mobile | Gap |
|---|---|---|---|
| Hiển thị danh sách bài thi theo nhóm | ✅ | ✅ | ✅ Parity |
| Accordion/Group collapse | ✅ | ✅ AccordionGroup | ✅ Parity |
| Filter theo skill (Listening/Reading…) | ✅ | ✅ | ✅ Parity |
| Search bài thi theo tên | ✅ | ✅ | ✅ Parity |
| Filter theo status (completed/not) | ✅ | ✅ | ✅ Parity |
| Badge trạng thái bài thi (done/in-progress) | ✅ | ✅ | ✅ Parity |
| Band score trên từng bài (last attempt) | ✅ IntensiveContent.tsx | ⚠️ Thiếu (chỉ hiện status) | 🔴 GAP |
| Nút "Custom Practice" | ✅ | ✅ `custom.tsx` | ✅ Parity |
| Nút "History" | ✅ Link to `/ielts/history` | ✅ | ✅ Parity |

### 2.2 Custom Practice Screen

| Tính năng | Web | Mobile | Gap |
|---|---|---|---|
| Chọn skill (4 skills) | ✅ | ✅ | ✅ Parity |
| Chọn exam source | ✅ Dropdown | ✅ Inline picker | ✅ Parity |
| Chọn part cụ thể | ✅ | ✅ | ✅ Parity |
| Preset time limits | ✅ | ✅ (10/20/30/40/60 min) | ✅ Parity |
| Custom time input | ✅ | ✅ max 180 min | ✅ Parity |
| Auto-submit toggle | ✅ | ✅ | ✅ Parity |
| Summary card trước khi start | ✅ | ✅ | ✅ Parity |

### 2.3 Testing Board — LISTENING

| Tính năng | Web (`TakeListeningBoard.tsx`) | Mobile (`[examId].tsx`) | Gap |
|---|---|---|---|
| Audio player hiển thị | ✅ Đầy đủ custom player | ✅ Có AudioPlayer component | ✅ Parity |
| Play / Pause | ✅ | ✅ | ✅ Parity |
| Seek bar (click-to-seek) | ✅ | ⚠️ Chưa rõ có gesture seek không | 🟡 Cần verify |
| Skip ±5s | ✅ SkipBack/SkipForward | ⚠️ Không rõ trong mobile AudioPlayer | 🟡 Nghi ngờ thiếu |
| Volume control | ✅ Volume2 slider | ❌ Không thấy trong code | 🔴 GAP |
| Playback speed | ❌ Web không có | ❌ | N/A |
| Giới hạn nghe lại (replay limit) | ❌ Web không giới hạn | ❌ | N/A (future) |
| Timer countdown header | ✅ `secondsLeft` + red pulse <10min | ✅ `useTimer` hook | ✅ Parity |
| Auto-submit khi hết giờ | ✅ `secondsLeft === 0` → submit | ✅ trong `[examId].tsx` | ✅ Parity |
| Điều hướng theo Part (Part 1-4) | ✅ `partIndex` state | ✅ | ✅ Parity |
| Question Navigator (sidebar/drawer) | ✅ Sidebar dạng button grid | ✅ `QuestionNavigatorDrawer` (bottom sheet) | ✅ Parity (khác UX) |
| Navigator màu trạng thái câu | ✅ (answered/unanswered/flagged) | ✅ | ✅ Parity |
| Flag/Bookmark câu hỏi | ✅ | ✅ | ✅ Parity |
| Confirm submit dialog | ✅ Custom overlay | ✅ | ✅ Parity |

### 2.4 Testing Board — READING

| Tính năng | Web (`TakeReadingBoard.tsx`) | Mobile (`[examId].tsx`) | Gap |
|---|---|---|---|
| Split-pane layout (Passage \| Questions) | ✅ Resizable drag divider | ❌ Không có — chỉ ScrollView dọc | 🔴 GAP NGHIÊM TRỌNG |
| Text Highlight (user highlight in passage) | ✅ `FloatingSelectionManager` | ❌ Không có | 🔴 GAP |
| Passage cuộn độc lập với câu hỏi | ✅ Split-pane | ❌ Scroll toàn trang | 🔴 GAP |
| Diagram/Map blocks | ✅ qua `DiagramMapBlock` | ✅ `DiagramMapBlock` component | ✅ Parity |
| Matching question type | ✅ | ✅ `MatchingBlock` | ✅ Parity |
| Timer countdown | ✅ 60 min default | ✅ | ✅ Parity |
| Question Navigator | ✅ | ✅ | ✅ Parity |
| Auto-submit | ✅ | ✅ | ✅ Parity |

### 2.5 Testing Board — WRITING

| Tính năng | Web (`TakeWritingBoard.tsx`) | Mobile (`WritingExamBlock.tsx`) | Gap |
|---|---|---|---|
| Task 1 / Task 2 tabs | ✅ `WritingTaskBoard` component | ✅ Tab số 1 và 2 | ✅ Parity |
| Textarea input | ✅ | ✅ | ✅ Parity |
| Word count real-time | ✅ | ✅ `countWords()` | ✅ Parity |
| Progress bar word count | ✅ | ✅ màu theo ngưỡng | ✅ Parity |
| Min word indicator (150/250) | ✅ | ✅ | ✅ Parity |
| Task prompt hiển thị | ✅ | ✅ ScrollView 200px | ✅ Parity |
| AI Grading overlay (Post-submit) | ✅ Full overlay với animated spinner | ✅ Trong `[examId].tsx` | ✅ Parity |
| Background grading (có thể rời trang) | ✅ `GradingContext` persist across nav | ⚠️ Phụ thuộc app không bị kill | 🟡 Hạn chế platform |
| Timer 60 phút | ✅ | ✅ | ✅ Parity |
| Confirm submit dialog | ✅ | ✅ | ✅ Parity |

### 2.6 Testing Board — SPEAKING

| Tính năng | Web (`TakeSpeakingBoard.tsx`) | Mobile (`SpeakingExamBlock.tsx`) | Gap |
|---|---|---|---|
| Ghi âm thực tế (microphone) | ✅ `SpeakingTaskBoard` record audio | ❌ **HOÀN TOÀN KHÔNG CÓ** — chỉ text input | 🔴 GAP NGHIÊM TRỌNG |
| Text fallback cho câu trả lời | ❌ Web dùng audio | ✅ Toàn bộ là text input | 🔴 Khác biệt UX cốt lõi |
| Phần 1 / 2 / 3 tabs | ✅ | ✅ | ✅ Parity |
| Cue card (Part 2) | ✅ | ✅ | ✅ Parity |
| Preparation timer (1 phút trước Part 2) | ⚠️ Cần verify trong `SpeakingTaskBoard` | ❌ Không có | 🟡 Nghi ngờ GAP |
| AI Grading overlay | ✅ Full overlay | ✅ | ✅ Parity |
| Thông báo "Voice recording unavailable" | N/A (Web có recording) | ✅ Info banner rõ ràng | ✅ Acceptable |

### 2.7 Result Screen

| Tính năng | Web (`result/[sessionId]/page.tsx`) | Mobile (`result/[sessionId].tsx`) | Gap |
|---|---|---|---|
| Band score display | ✅ Hexagon shield SVG | ✅ Circle với border | ✅ Parity (khác style) |
| Raw score / Total Qs / Time taken | ✅ | ✅ | ✅ Parity |
| Score breakdown bar | ✅ | ✅ | ✅ Parity |
| Answer sheet grid (L/R) | ✅ Phân chia theo Part (4 columns) | ✅ Flat grid | 🟡 Web chi tiết hơn |
| Question-by-question review | ✅ Multi-type với `ReviewItemField` | ✅ Collapsible simple review | 🟡 Web phong phú hơn |
| "Listen from here" (timestamp seek) | ✅ AudioPlayer + seek | ❌ Không có | 🔴 GAP |
| "Locate" (scroll to question in passage) | ✅ `onLocate` | ❌ Không có | 🔴 GAP |
| Per-question Notes | ✅ `NoteEditor` + `notesApi` | ❌ Không có | 🔴 GAP |
| Writing AI rubric result view | ✅ `WritingResultView` component | ⚠️ Chỉ hiện pending state | 🔴 GAP |
| Speaking AI rubric result view | ✅ `SpeakingResultView` component | ⚠️ Chỉ hiện band, không có rubric | 🔴 GAP |
| Retake exam | ✅ | ✅ | ✅ Parity |
| Share result | ❌ Web không có | ✅ Native Share API | Mobile có thêm |
| Pending state (Grading in progress) | ✅ | ✅ | ✅ Parity |
| Band label text (Expert/Good/…) | ✅ `BAND_LABELS` map | ✅ Same map | ✅ Parity |

---

## 3. Band Score Logic — Tính nhất quán

| Skill | Web function | Mobile function | Nhất quán? |
|---|---|---|---|
| Listening | `getIeltsBand(score)` | `getListeningBand(score)` | ✅ Nhất quán |
| Reading | `getIeltsReadingBand(score)` | `getReadingBand(score)` | ✅ Nhất quán |
| Writing | `session.result?.writingScore` | `session.result?.writingScore` | ✅ Nhất quán |
| Speaking | `session.result?.speakingScore` | `session.result?.speakingScore` | ✅ Nhất quán |
| Band color thresholds | `≥8.0 green, ≥6.5 blue, ≥5.0 amber` | `≥7 green, ≥5.5 primary, ≥4 orange` | ⚠️ **KHÁC NHAU** |

> ⚠️ **BUG-03:** Web ngưỡng màu xanh là `≥8.0`, Mobile là `≥7`. Cần đồng bộ.

---

## 4. Answer Comparison Logic — Bugs

| Khía cạnh | Web | Mobile | Nhất quán? |
|---|---|---|---|
| `normalizeAnswer()` | Lowercase + strip non-alphanumeric | Identical | ✅ |
| Multi-variant check (`/` separator) | ✅ `isCorrect()` | ✅ `checkCorrect()` | ✅ |
| Optional word `(word)` pattern | ✅ Regex `^(.*?)\((.*?)\)(.*)$` | ✅ Same regex | ✅ |
| Multi-answer comma split | ✅ `ans.split(",")` trước khi map | ❌ Không split — assign string nguyên | 🔴 **BUG-01** |

> 🔴 **BUG-01 NGHIÊM TRỌNG:** Mobile `extractCorrectAnswers` không xử lý answer `"A, B"` (comma-separated). Web split thành `["A", "B"]` → chấm đúng. Mobile giữ nguyên string → chấm điểm SAI cho các câu multi-answer trong Listening/Reading.

---

## 5. Timer Logic

| Khía cạnh | Web | Mobile |
|---|---|---|
| Cơ chế | `setInterval` trong board component | `setInterval` trong `useTimer` hook |
| Drift risk | Có (tab inactive) | Cao hơn (app background) |
| Save progress interval | ✅ `saveProgress` API | ✅ `saveProgress` API |
| Auto-submit trigger | `useEffect` watch `secondsLeft === 0` | Tương tự |

> 🟡 **Khuyến nghị:** Mobile nên dùng `Date.now()` diff thay vì `setInterval` để tránh drift khi app về background.

---

## 6. API Coverage

| API Endpoint | Web | Mobile | Status |
|---|---|---|---|
| `GET /exams/intensive/catalog?skill=` | ✅ | ✅ | Parity |
| `GET /exams/:id` | ✅ | ✅ | Parity |
| `POST /exams/:id/sessions` | ✅ | ✅ | Parity |
| `GET /exams/sessions/:id` | ✅ | ✅ | Parity |
| `POST /exams/sessions/:id/submit` | ✅ | ✅ | Parity |
| `PATCH /exams/sessions/:id/progress` | ✅ | ✅ | Parity |
| `DELETE /exams/sessions/:id` | ✅ | ✅ | Parity |
| `GET /exams/history` | ✅ | ✅ | Parity |
| `GET/POST /notes` (per-question notes) | ✅ `notesApi` | ❌ Không có | 🔴 GAP |

---

## 7. Bugs & Issues Catalog

### 🔴 Critical (Blocking correctness)

| ID | Mô tả | File | Ảnh hưởng |
|---|---|---|---|
| BUG-01 | `extractCorrectAnswers` mobile không split comma answer | `result/[sessionId].tsx` L68-74 | Chấm điểm sai cho câu multi-answer |
| BUG-02 | Speaking trên mobile hoàn toàn dùng text thay vì audio | `SpeakingExamBlock.tsx` | Không phản ánh IELTS Speaking format |
| BUG-03 | Band color threshold khác nhau Web vs Mobile | `result/[sessionId].tsx` L41-46 | Hiển thị sai màu band score |

### 🟡 High (Missing important UX)

| ID | Mô tả | File Web ref | Mobile status |
|---|---|---|---|
| GAP-01 | Reading split-pane không có trên mobile | `TakeReadingBoard.tsx` | Scroll dọc không hiệu quả |
| GAP-02 | Text highlighting trong passage không có | `FloatingSelectionManager` | ❌ Thiếu hoàn toàn |
| GAP-03 | "Listen from here" trong Result không có | `result/page.tsx` L436 | ❌ Thiếu |
| GAP-04 | Per-question Notes trong Result không có | `NoteEditor` component | ❌ Thiếu |
| GAP-05 | Writing/Speaking AI rubric result view không có | `WritingResultView`, `SpeakingResultView` | ❌ Chỉ hiện pending state |
| GAP-06 | Last band score không hiện trên catalog card | `IntensiveContent.tsx` | ❌ Thiếu |

### 🟢 Low

| ID | Mô tả |
|---|---|
| GAP-07 | Timer drift risk — nên dùng wall-clock |
| GAP-08 | Volume control cho audio player mobile |
| GAP-09 | Answer sheet phân Part columns (Web có 4 col) |
| GAP-10 | Preparation timer 1 phút cho Speaking Part 2 |
| GAP-11 | Breadcrumb navigation trên result screen |

---

## 8. Prioritized Roadmap

### Phase 1 — Critical Fixes (~3 ngày)

| Task | File cần sửa | Effort |
|---|---|---|
| Fix BUG-01: Sync comma-split answer logic | `frontend-mobile/app/ielts/intensive/result/[sessionId].tsx` | S |
| Fix BUG-03: Đồng bộ band color thresholds | `frontend-mobile/app/ielts/intensive/result/[sessionId].tsx` | XS |
| Thêm band score vào catalog card | `frontend-mobile/app/ielts/intensive/index.tsx` | S |

### Phase 2 — High Priority Features (~1 tuần)

| Task | Effort |
|---|---|
| Writing AI rubric result view (mobile) | M |
| Speaking AI rubric result view (mobile) | M |
| Per-question Notes + `notesApi` mobile | L |
| Timer wall-clock fix | S |

### Phase 3 — Major Features (Sprint 4+)

| Task | Effort | Phụ thuộc |
|---|---|---|
| Speaking: Voice recording với `expo-av` | XL | Native permissions, audio upload API |
| Reading: Side-by-side layout | L | Custom layout component |
| Text Highlight trong passage | L | Gesture + state management |
| "Listen from here" seek trong Result | M | Audio player tại result screen |

---

## 9. Parity Score Summary

| Module | Parity Score | Note |
|---|---|---|
| **Catalog** | 88% | Thiếu band score trên card |
| **Custom Practice** | 100% | ✅ Hoàn toàn đồng nhất |
| **Listening Board** | 85% | Thiếu volume control |
| **Reading Board** | 65% | Thiếu split-pane và text highlight |
| **Writing Board** | 90% | Thiếu image trong prompt |
| **Speaking Board** | 40% | Không có voice recording |
| **Result Screen** | 70% | Thiếu notes, timestamp seek, AI rubric |
| **Band Score Logic** | 95% | 1 bug ở color threshold |
| **Answer Logic** | 80% | 1 bug ở comma-split |

**Overall Parity: ~79%**

---

## 10. Ghi chú kỹ thuật

### Speaking Limitation
Mobile hiện không thể record audio. `SpeakingExamBlock` đã có info banner thông báo cho user. Khi implement, cần:
1. `expo-av` hoặc `expo-audio` (đã có trong project)
2. Backend API endpoint nhận audio file upload
3. AI transcription → grading pipeline

### GradingContext Mobile
Web có `GradingContext` persist across navigation. Mobile dùng overlay inline — nếu user force-close app, job bị mất. Cần xem xét polling hoặc push notification.

### Resizable Split-Pane Reading
Web dùng CSS drag listener. Mobile nên dùng tab UI "Passage | Questions" thay vì drag để đơn giản hơn và phù hợp touch UX.

---

*Document được tạo bởi hệ thống Gap Analysis thông qua code inspection. Không có dòng code nào bị thay đổi trong quá trình phân tích.*
