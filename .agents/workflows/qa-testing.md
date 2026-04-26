---
description: # QA Testing Workflow — IELTS Master AI Mobile App  > Quy trình kiểm thử & kịch bản test cho ứng dụng luyện thi IELTS (Expo SDK 52)
---

## 1. Phân Tích Edge Cases

### 1.1. Mạng — Network Failures

| Kịch bản | Thời điểm | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **Mất mạng khi gọi API** | Giữa chừng `GET /exams`, `POST /vocab-lab/review` | UI treo vĩnh viễn (spinner quay mãi) hoặc crash nếu truy cập `data.xxx` | TanStack Query `retry: 3` + `ErrorView` component khi `isError === true` |
| **Mất mạng trong lúc Polling AI** | Đang poll `GET /pronunciation/attempts/:id` mỗi 2s | Poll thất bại liên tục, drain battery, không thông báo user | TanStack Query `retry` + timeout tối đa (30 lần × 2s = 60s) + thông báo "Mất kết nối, thử lại?" |
| **Mạng chập chờn (timeout)** | Upload audio pronunciation (file 1-5MB) | Request timeout, server nhận file nhưng client không biết → duplicate upload | `useMutation` với `retry: 0` cho upload + idempotency key + loading indicator |
| **Mạng trở lại sau offline** | User mở app khi đã cache data cũ | Data cũ hiển thị, user không biết | TanStack Query `refetchOnReconnect: true` (mặc định bật) + `@react-native-community/netinfo` listener |
| **Mất mạng khi submit bài thi** | `POST /exams/sessions/:id/submit` với answers JSON lớn | Mất toàn bộ bài làm | Lưu answers vào MMKV trước khi submit, retry khi có mạng |

### 1.2. Phần Cứng — Permission & Device

| Kịch bản | Module liên quan | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **Từ chối quyền Microphone** | `expo-av` (Pronunciation, Speaking) | `Audio.Recording.prepareToRecordAsync()` throw error → crash | Check permission trước khi record, hiển thị dialog giải thích + nút mở Settings |
| **Thu hồi quyền giữa chừng** | User vào Settings thu hồi mic khi app đang record | Recording dừng đột ngột, state không đồng bộ | `try/catch` wrap mọi recording operation + cleanup state trong `finally` |
| **SecureStore không khả dụng** | `expo-secure-store` (JWT tokens) | `getItemAsync` trả `null` hoặc throw trên emulator cũ | Fallback sang MMKV encrypted, wrap `secureTokenStore` qua interface (DIP — `RULES.md` §5) |
| **App bị kill giữa chừng** | Đang giữa phiên thi IELTS | Mất toàn bộ answers chưa submit | Persist session state vào MMKV mỗi khi user trả lời 1 câu |
| **Xoay màn hình** | Mọi screen | State bị reset, scroll position mất | Dùng `useState`/Zustand (không bị reset khi re-render), lock orientation nếu cần |

### 1.3. Dữ Liệu — Malformed/Missing Data

| Kịch bản | Field bị ảnh hưởng | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **JSON `questions` rỗng hoặc null** | `Exam.questions: Json` | `questions.map(...)` → `TypeError: Cannot read properties of null` | Type guard `isExamQuestion()` + fallback `[]` (ref: `SKILL.md` §4.1) |
| **`feedback` field thiếu nested keys** | `Result.feedback.writing.task1.band` | Chained access crash: `undefined.band` | Optional chaining `feedback?.writing?.task1?.band ?? 'N/A'` |
| **`audioUrl` trả về null** | `VocabularyWord.audioUrl`, `PronunciationSound.audioUrl` | Audio player cố load `null` → crash hoặc silent failure | Check `if (!audioUrl)` → ẩn nút play hoặc hiển thị "Audio không khả dụng" |
| **Empty array `sentences`** | `ShadowingVideo.sentences: []` | Shadowing player hiển thị blank, index 0 truy cập undefined | Early return: `if (!sentences.length) return <EmptyState />` |
| **Server trả 500 với body không chuẩn** | Mọi endpoint | `response.json()` parse fail hoặc thiếu `statusCode` field | `apiClient` wrapper catch parse errors, trả generic error message |
| **Flashcard `fieldValues` key mismatch** | `Flashcard.fieldValues: Json` | Render hiển thị `undefined` thay vì nội dung thẻ | Validate keys tồn tại trong `CardType.fields` trước khi render |

---

## 2. Kịch Bản Manual Testing

### 2.1. Luồng Thi IELTS (Happy Path + Edge Cases)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-01 | Mở danh sách đề thi → Chọn 1 đề → Bấm "Bắt đầu thi" → Trả lời lần lượt các câu hỏi → Bấm "Nộp bài" | Hiển thị màn hình "Đang chấm điểm..." với animation, sau 5-30 giây hiển thị kết quả (điểm Reading, Listening, Overall). Nếu có Writing/Speaking → polling cho đến khi status = COMPLETED |
| TC-02 | Đang làm bài thi (đã trả lời 5/20 câu) → **Tắt WiFi** → Tiếp tục trả lời → Bấm "Nộp bài" | App hiển thị thông báo "Mất kết nối mạng. Bài làm đã được lưu tạm, vui lòng kết nối lại để nộp bài". Bật WiFi lại → Bấm "Thử lại" → Nộp thành công |
| TC-03 | Đang làm bài thi → **Nhấn nút Home** (app vào background) → Chờ 5 phút → Mở lại app | App phải giữ nguyên trạng thái bài thi (câu đang làm, answers đã chọn, timer tiếp tục đếm). KHÔNG được reset về màn hình chính |
| TC-04 | Mở kết quả bài thi đã có → Kiểm tra phần "AI Feedback" | Nếu feedback có → hiển thị đầy đủ (Reading, Listening, Writing, Speaking). Nếu feedback = null → hiển thị "Chưa có phản hồi từ AI" thay vì crash |
| TC-05 | Mở đề thi nhưng backend trả về `questions: []` (đề thi rỗng) | Hiển thị `<EmptyState>` với message "Đề thi chưa có câu hỏi". KHÔNG hiển thị blank screen hoặc crash |

### 2.2. Luồng Pronunciation (Native Audio + AI Polling)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-06 | Mở trang Pronunciation → Bấm "Thu âm" lần đầu tiên | App yêu cầu quyền Microphone. User đồng ý → Bắt đầu ghi âm, hiển thị waveform/timer. User từ chối → Hiển thị dialog "Cần quyền Microphone để sử dụng tính năng này" + nút "Mở Cài đặt" |
| TC-07 | Thu âm xong → Bấm "Gửi" → Đợi AI chấm điểm | Hiển thị trạng thái: "Đang gửi..." → "AI đang phân tích..." → "Hoàn tất! Điểm: 85/100". Poll tối đa 60 giây, nếu timeout → hiển thị "Chấm điểm mất quá lâu, vui lòng thử lại" |
| TC-08 | Đang thu âm → **Có cuộc gọi đến** (interrupt audio session) | App phải dừng recording an toàn, lưu trạng thái. Sau cuộc gọi → hiển thị "Phiên ghi âm đã bị gián đoạn, bấm Thu âm để thử lại" |

### 2.3. Luồng Vocab Lab (FSRS Flashcards)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-09 | Mở Vocab Lab → Chọn Deck → Bấm "Học" → Lật thẻ → Bấm "Tốt" (rating=3) | Thẻ tiếp theo hiển thị. Sau khi hết thẻ → Hiển thị thống kê session (Mới: X, Đang học: Y, Ôn tập: Z). Deck list cập nhật số thẻ due |
| TC-10 | Đang review flashcard → **Tắt WiFi** → Bấm rating | Hiển thị thông báo lỗi mạng. Khi có mạng lại → tự động retry hoặc cho user bấm thử lại. KHÔNG mất progress |


---

## 3. Unit Tests (Jest + React Native Testing Library)

### 3.1. Test Type Guard — `isExamQuestion()`

> Ref: `SKILL.md` §4.1 — Type guard cho JSON fields

### 3.2. Test Custom Hook — `useAttemptResult()` (Polling)

> Ref: `SKILL.md` §3.2 — TanStack Query refetchInterval

### 3.3. Test UI Component — `BookCard`

> Ref: `SKILL.md` §2.1 — React.memo list item · `RULES.md` §4 — ISP (primitive props)

### 3.4. Test UI Component — `ScoreCard` (Edge Case: null/undefined)

### 3.5. Test Custom Hook — `useDecks()` (Server State)

> Ref: `SKILL.md` §3.2 — Server State qua TanStack Query

---

## 4. Ma Trận Test Coverage

| Feature | Unit Test | Manual Test | Edge Case |
|:---|:---|:---|:---|
| **Auth (Login/Register)** | Hook `useLogin`, `useRegister` | TC: Login sai password, token hết hạn | SecureStore unavailable, 401 refresh |
| **IELTS Exam** | `isExamQuestion` guard, `useExamDetail` hook | TC-01 → TC-05 | questions=null, feedback=null, offline submit |
| **Pronunciation** | `useAttemptResult` polling hook | TC-06 → TC-08 | Mic denied, polling timeout, audio interrupt |
| **Vocab Lab (FSRS)** | `useDecks` hook, `BookCard` component | TC-09 → TC-10 | Empty deck, offline rating, fieldValues mismatch |
| **Shadowing** | Player hook, sentence navigation | Phát video → lặp câu → dictation | sentences=[], YouTube unavailable |
| **Vocabulary** | `BookCard` component, `useVocabularyBooks` | Duyệt sách → xem unit → nghe audio | audioUrl=null, storyContent quá dài |
| **Grammar** | Theory renderer, exercise handler | Đọc lý thuyết → làm bài tập | theoryContent HTML injection, options=null |

### Ưu Tiên Test

| Ưu tiên | Loại | Lý do |
|:---|:---|:---|
| 🔴 P0 | Type guards cho JSON fields | Crash-prevention — dữ liệu backend có thể thay đổi bất kỳ lúc nào |
| 🔴 P0 | TanStack Query hooks (loading/error states) | Mọi screen phụ thuộc — fail ở đây = app unusable |
| 🟡 P1 | UI components trong danh sách (list items) | Performance-critical — render sai = lag toàn app |
| 🟡 P1 | Storage abstraction | Thay đổi implementation (MMKV ↔ AsyncStorage) phải không break |
| 🔵 P2 | Manual test luồng chính (Happy Path) | Đảm bảo UX đúng kỳ vọng trước khi release |

---

*Mọi test phải pass trước khi merge PR. Thêm test case mới khi phát hiện bug mới (regression testing).*

