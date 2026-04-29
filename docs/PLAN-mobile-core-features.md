# Project Plan: Mobile Core Features Implementation

## Overview
Kế hoạch này tập trung vào việc hoàn thiện các module cốt lõi còn thiếu trên ứng dụng Mobile, đảm bảo tính đồng nhất với nền tảng Web nhưng được tối ưu hóa theo phong cách **Mobile-first**. Trọng tâm là tích hợp AI Voice (chấm điểm phát âm) và tái cấu trúc các bảng điều khiển kỹ năng IELTS.

## Project Type: MOBILE

---

## Success Criteria
- [x] Module **Pronunciation** & **Shadowing** hoạt động với AI Scoring đồng nhất với Web.
- [ ] Giao diện **Speaking/Writing Task Boards** được tối ưu cho màn hình dọc (Mobile-first).
- [ ] Tính năng **Vocab Lab** hoàn thiện đầy đủ các bước học tập.
- [ ] **Dictionary Bottom Sheet** hoạt động mượt mà trong toàn bộ ứng dụng.

---

## Tech Stack
- **Audio Recording**: `expo-audio` & `expo-file-system`.
- **AI Integration**: Backend API `/learning/pronunciation/check`.
- **UI Components**: `NativeWind v4`, `React Native Reanimated v4`.
- **UX Patterns**: `Gorhom Bottom Sheet` (hoặc tương đương) cho từ điển.

---

## File Structure Changes
```plaintext
frontend-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── pronunciation.tsx (Update logic)
│   │   └── shadowing.tsx (New screen)
│   ├── ielts/
│   │   ├── [skill]/
│   │   │   └── task-board.tsx (New mobile-first UI)
│   └── vocab-lab/
│       └── index.tsx (Update features)
├── features/
│   ├── voice-ai/ (New: Logic ghi âm & chấm điểm)
│   ├── task-boards/ (New: Mobile-first components)
│   └── vocab-lab/
├── components/
│   ├── ui/
│   │   └── DictionaryBottomSheet.tsx (New)
│   └── voice/
│       └── Waveform.tsx (New)
└── services/
    └── learning.api.ts (New: Đồng bộ với Web)
```

---

## Task Breakdown

### Sprint 1: Voice & Audio Foundation
| Task ID | Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T1.1 | Implement `learning.api.ts` | `mobile-developer` | api-patterns | P0 | None |
| T1.2 | Create `useAudioRecorder` hook | `mobile-developer` | clean-code | P0 | None |
| T1.3 | Build `Waveform` component | `mobile-developer` | mobile-design | P1 | T1.2 |

**INPUT→OUTPUT→VERIFY:**
- **Input**: Thiết lập ghi âm với `expo-audio`.
- **Output**: Một hook có thể ghi âm, lưu file tạm và trả về URI.
- **Verify**: Log được URI file `.m4a` hoặc `.wav` sau khi dừng ghi âm.

---

### ✅ Sprint 2: Pronunciation & Shadowing (AI Integration) — COMPLETED
| Task ID | Name | Agent | Skills | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T2.1 | Integrate AI Scoring for Pronunciation | `mobile-developer` | native-data-fetching | P0 | ✅ Done |
| T2.2 | Implement Shadowing UI with AI Feedback | `mobile-developer` | mobile-design | P0 | ✅ Done |
| T2.3 | Add Haptics & Visual feedback for scores | `mobile-developer` | mobile-design | P1 | ✅ Done |

**INPUT→OUTPUT→VERIFY:**
- **Input**: Gửi file audio lên `/learning/pronunciation/check`.
- **Output**: Nhận kết quả chấm điểm (accuracy, completeness, fluency).
- **Verify**: Hiển thị điểm số và highlight các từ phát âm sai trên màn hình Mobile.

---

### Sprint 3: IELTS Task Boards (Mobile-first Redesign)
| Task ID | Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T3.1 | Design `SpeakingTaskBoard` (Step-by-step) | `mobile-developer` | mobile-design | P0 | None |
| T3.2 | Design `WritingTaskBoard` (Focus mode) | `mobile-developer` | mobile-design | P0 | None |
| T3.3 | Sync Task State with Backend | `mobile-developer` | native-data-fetching | P1 | T3.1, T3.2 |

**INPUT→OUTPUT→VERIFY:**
- **Input**: Dữ liệu đề thi IELTS.
- **Output**: Giao diện chia theo bước (Step 1: Preparation, Step 2: Recording, Step 3: Feedback).
- **Verify**: Người dùng có thể hoàn thành một bài Speaking/Writing mà không cảm thấy chật chội.

---

### Sprint 4: Vocab Lab & Dictionary Polish
| Task ID | Name | Agent | Skills | Priority | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T4.1 | Complete **Vocab Lab** learning flow | `mobile-developer` | clean-code | P1 | None |
| T4.2 | Implement **Dictionary Bottom Sheet** | `mobile-developer` | mobile-design | P0 | None |
| T4.3 | Global trigger for Dictionary (Long press) | `mobile-developer` | mobile-design | P2 | T4.2 |

**INPUT→OUTPUT→VERIFY:**
- **Input**: Một từ vựng bất kỳ trong bài học.
- **Output**: Bottom Sheet hiển thị nghĩa, phiên âm và ví dụ.
- **Verify**: Nhấn giữ hoặc click vào từ vựng bất kỳ, Bottom Sheet hiện lên nửa dưới màn hình.

---

## Phase X: Final Verification

### 🛡️ Security & Performance
- [ ] Kiểm tra quyền truy cập Microphone trên cả iOS và Android.
- [ ] Đảm bảo file audio tạm được xóa sau khi upload thành công.
- [ ] Kiểm tra FPS khi chạy animation Waveform (Target: 60fps).

### 🎨 UI/UX Audit
- [ ] **Purple Ban**: Đảm bảo không có mã màu tím/indigo mặc định.
- [ ] **Touch Targets**: Các nút ghi âm, dừng có kích thước tối thiểu 48x48dp.
- [ ] **Socratic Respect**: Đã sử dụng Bottom Sheet đúng như yêu cầu.

### 🚀 Build & Deployment
- [ ] Toàn bộ API endpoint được cấu hình qua biến môi trường.

## ✅ PHASE X COMPLETE
- Status: ⏳ Pending Implementation
- Date: 30/04/2026
