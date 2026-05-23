# Phase 4 — IELTS Intensive: Practice Mode

**Ưu tiên:** 🟡 Trung bình  
**Ước tính:** 4–5 ngày  
**Phụ thuộc:** Không có

---

## Vấn Đề Hiện Tại

### Web có 2 luồng thi Intensive riêng biệt

**Mock Exam (Full Test):**
```
/exams/intensive/[examId]/take/[sessionId]/
→ TakeListeningBoard + TakeReadingBoard + TakeWritingBoard + TakeSpeakingBoard
→ Làm tất cả 4 kỹ năng liên tục
```

**Practice Mode (Từng kỹ năng):**
```
/exams/intensive/practice-catalog?skill=listening
→ GET /exams/intensive/practice-catalog  (danh sách bài theo kỹ năng)
→ /exams/intensive/[examId]/practice/[sessionId]/
→ PracticeListeningBoard | PracticeReadingBoard | PracticeWritingBoard | PracticeSpeakingBoard
→ Chỉ làm 1 kỹ năng, có hints, không tính thời gian nghiêm ngặt
```

### Mobile hiện tại

Mobile có `custom.tsx` cho phép user chọn kỹ năng (part) muốn luyện trước khi tạo session. `createSession` API đã hỗ trợ `practicePart`. Nhưng:

1. **`getPracticeCatalog` chưa có trong `ieltsExamsApi`** → không thể browse practice catalog riêng.
2. **Không có màn hình practice session riêng** với UX tối ưu cho practice mode (hints visible, không tính giờ nghiêm khắc, etc.).
3. **Mobile dùng chung `[examId].tsx`** cho cả mock và practice → UX bị lẫn lộn.

### Phân tích `custom.tsx` hiện tại

`custom.tsx` cho phép:
- Chọn kỹ năng (Listening / Reading / Writing / Speaking)
- Chọn số lượng questions
- → Tạo session với `practicePart`

Nhưng sau khi tạo session → navigate đến `[examId].tsx` chung. Cần **tách luồng** để practice session có UX riêng.

---

## Mục Tiêu Phase 4

1. Thêm `getPracticeCatalog` vào `ieltsExamsApi`.
2. Cải thiện `custom.tsx` để có Practice Catalog browse đúng chuẩn.
3. Tạo màn hình Practice Session riêng biệt với UX phù hợp practice mode.

---

## Task Chi Tiết

### Task 4.1 — Khai Báo Types

**File:** `frontend-mobile/types/index.ts`

```typescript
export interface PracticeExamItem {
  id: string;
  title: string;
  description?: string;
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  partNumber: number; // 1, 2, 3 (cho speaking) hoặc part index
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questionCount: number;
  estimatedMinutes: number;
  tags?: string[];
  isNew?: boolean;
  completedCount?: number; // số lần user đã làm
}

export interface PracticeCatalogResponse {
  listening: PracticeExamItem[];
  reading: PracticeExamItem[];
  writing: PracticeExamItem[];
  speaking: PracticeExamItem[];
}
```

**Subtasks:**
- [ ] Thêm 2 interfaces vào `types/index.ts`

---

### Task 4.2 — Thêm `getPracticeCatalog` Vào Service

**File:** `frontend-mobile/services/ielts.api.ts`

Thêm vào `ieltsExamsApi`:

```typescript
getPracticeCatalog: async (skill?: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'): Promise<PracticeCatalogResponse> => {
  const url = skill
    ? `/exams/intensive/practice-catalog?skill=${skill}`
    : '/exams/intensive/practice-catalog';
  return apiClient.get<PracticeCatalogResponse>(url);
},
```

**Subtasks:**
- [ ] Thêm method vào `ieltsExamsApi`
- [ ] Import types đúng

---

### Task 4.3 — Refactor `custom.tsx` Thành Practice Catalog Screen

**File hiện tại:** `frontend-mobile/app/ielts/intensive/custom.tsx`

**Cải thiện:**

```
PracticeCustomScreen (custom.tsx)
├── Header: "Luyện Tập Từng Kỹ Năng"
├── Skill Tabs: [Listening] [Reading] [Writing] [Speaking]
├── PracticeExamList — FlatList theo skill đang active
│   ├── PracticeExamCard × N
│   │   ├── Title + part info
│   │   ├── Question count + Est. time
│   │   ├── Difficulty badge
│   │   ├── "Đã làm X lần" (nếu completedCount > 0)
│   │   └── Button "Luyện ngay"
│   └── EmptyState
└── Loading Skeleton
```

**Thay thế:** Bỏ form chọn skill/questionCount thủ công → browse catalog thực từ API, chọn bài cụ thể.

**Subtasks:**
- [ ] Thêm skill tab navigation (giữ nguyên tab pill style như Advanced)
- [ ] Fetch `getPracticeCatalog()` khi mount
- [ ] Implement `PracticeExamCard` component
- [ ] `DifficultyBadge` sub-component
- [ ] Skeleton loading state
- [ ] Khi chọn bài → tạo session `createSession(examId, userId, partNumber)` → navigate tới Practice Session screen (Task 4.4)

---

### Task 4.4 — Màn Hình Practice Session

**File mới:** `frontend-mobile/app/ielts/intensive/practice/[sessionId].tsx`

Practice session khác mock exam ở:
- **Hints visible** — gợi ý trả lời có thể hiện
- **Timer relaxed** — đồng hồ chạy nhưng không hard-cutoff
- **Single skill** — chỉ có 1 board (không navigate giữa 4 skill)
- **Submit sau mỗi part** — không cần hoàn thành toàn bộ exam

Cấu trúc screen:

```
PracticeSessionScreen
├── Header
│   ├── Back (confirm dialog nếu đang làm)
│   ├── Title: "{skill} Practice — Part {partNumber}"
│   ├── Timer (casual, không countdown)
│   └── Progress indicator (câu/tổng)
├── Content Area (theo skill)
│   ├── [LISTENING] PracticeListeningContent
│   ├── [READING]   PracticeReadingContent
│   ├── [WRITING]   PracticeWritingContent
│   └── [SPEAKING]  PracticeSpeakingContent
└── Bottom Bar
    ├── "Lưu & Thoát" (save progress, navigate back)
    └── "Nộp Bài" (submit session)
```

**Subtasks:**
- [ ] Tạo route file `app/ielts/intensive/practice/[sessionId].tsx`
- [ ] Fetch session data: `ieltsExamsApi.getSession(sessionId)`
- [ ] Determine skill từ session data (`practicePart`)
- [ ] Implement `PracticeListeningContent` component (tương tự `ExamAudioPlayer` + question renderer)
- [ ] Implement `PracticeReadingContent` component (Reading passage + questions)
- [ ] Implement `PracticeWritingContent` component (prompt + text input với autosave)
- [ ] Implement `PracticeSpeakingContent` component (record button per question)
- [ ] Timer: `useTimer` hook (count-up), không auto-submit khi hết giờ
- [ ] "Lưu & Thoát": `saveProgress()` → navigate back với confirm dialog
- [ ] "Nộp Bài": `submitSession()` → navigate to result screen
- [ ] Auto-save writing draft mỗi 30s (dùng `useWritingAutosave` hook)

---

### Task 4.5 — Reuse Component từ Intensive Exam Hiện Tại

Intensive exam hiện tại (`[examId].tsx`) đã có:
- `ExamHeader` component
- `ExamAnswerSheet` component
- `QuestionGroupRenderer` component
- `ExamAudioPlayer` component
- `PreparationScreen` component
- `AIGradingOverlay` component

Practice session **tái dùng** các component trên, chỉ thay đổi:
- Header title style (practice vs mock)
- Timer behavior (relaxed vs strict)
- Submit flow (single skill vs multi-skill)
- Result navigate destination

**Subtasks:**
- [ ] Kiểm tra `components/intensive/` để xác định component nào dùng chung được
- [ ] Tạo `PracticeHeader` component mới hoặc pass `mode="practice"` vào `ExamHeader`
- [ ] Tạo `PracticeSubmitBar` bottom bar

---

### Task 4.6 — Practice Result Screen

**File mới:** `frontend-mobile/app/ielts/intensive/practice/result/[sessionId].tsx`

Sau khi submit practice session → hiển thị kết quả chỉ cho kỹ năng đó:

```
PracticeResultScreen
├── Header: "Kết Quả Luyện Tập"
├── Score Card
│   ├── Band score (nếu đã graded)
│   ├── Correct/Total (Listening/Reading)
│   └── "Đang chấm..." nếu AI chưa xong (Writing/Speaking)
├── Answer Review
│   └── Mỗi câu: đáp án của user vs đáp án đúng
├── Time Taken info
└── Bottom actions
    ├── "Luyện lại" → tạo session mới cùng examId
    └── "Xem Catalog" → back to practice catalog
```

**Subtasks:**
- [ ] Tạo route `practice/result/[sessionId].tsx`
- [ ] Poll grading status cho W/S (dùng `useGradingPoll` hook hiện có)
- [ ] `AnswerReviewList` component (dùng lại `PassageReview` / `TranscriptReview` từ `components/ielts/`)
- [ ] "Luyện lại" button

---

### Task 4.7 — Navigate Từ History Screen

**File:** `frontend-mobile/app/ielts/history.tsx`

Hiện tại `history.tsx` phân biệt `mode: 'mock' | 'practice'` và filter theo `practicePart`. Khi user tap vào history item của practice session → navigate tới `practice/result/[sessionId]` (Task 4.6), không phải `intensive/result/[sessionId]`.

**Subtasks:**
- [ ] Kiểm tra navigate logic trong `history.tsx` cho practice items
- [ ] Update navigation: `practicePart !== null` → route tới `practice/result/[sessionId]`

---

## User Flow

```
Intensive Hub (intensive/index.tsx)
├── "Thi Thử Mock Exam" → intensive/[examId].tsx (giữ nguyên)
└── "Luyện Tập Kỹ Năng" → intensive/custom.tsx (cải thiện)
                               └── [Chọn bài từ Practice Catalog]
                                     └── createSession(examId, userId, partNumber)
                                           └── intensive/practice/[sessionId].tsx
                                                 └── [Submit]
                                                       └── intensive/practice/result/[sessionId].tsx
```

---

## Acceptance Criteria

- [ ] `custom.tsx` hiển thị Practice Catalog thực từ API (không phải form thủ công).
- [ ] 4 skill tabs filter đúng bài theo kỹ năng.
- [ ] Chọn bài → tạo session → navigate đến Practice Session screen.
- [ ] Practice Session screen chỉ hiển thị 1 skill (không phải 4 skill như mock exam).
- [ ] Timer relaxed (count-up, không cutoff).
- [ ] Submit → navigate Practice Result screen.
- [ ] Practice Result hiển thị band score (hoặc polling grading cho W/S).
- [ ] History screen navigate đúng về Practice Result (không về Intensive Result).
- [ ] Dark mode đúng.
- [ ] Skeleton/loading cho catalog và session.

---

## Files Tạo Mới

```
frontend-mobile/app/ielts/intensive/practice/[sessionId].tsx
frontend-mobile/app/ielts/intensive/practice/result/[sessionId].tsx
frontend-mobile/components/intensive/PracticeHeader.tsx (optional, hoặc reuse ExamHeader)
frontend-mobile/components/intensive/PracticeSubmitBar.tsx
frontend-mobile/components/intensive/practice/PracticeListeningContent.tsx
frontend-mobile/components/intensive/practice/PracticeReadingContent.tsx
frontend-mobile/components/intensive/practice/PracticeWritingContent.tsx
frontend-mobile/components/intensive/practice/PracticeSpeakingContent.tsx
```

## Files Sửa

```
frontend-mobile/types/index.ts                       — thêm PracticeExamItem, PracticeCatalogResponse
frontend-mobile/services/ielts.api.ts                — thêm getPracticeCatalog
frontend-mobile/app/ielts/intensive/custom.tsx        — refactor thành catalog browse
frontend-mobile/app/ielts/history.tsx                — fix navigate cho practice items
```

---

## Rủi Ro & Lưu Ý

- **Backend `/exams/intensive/practice-catalog`**: Cần verify endpoint tồn tại và trả đúng format. Nếu chưa có → cần backend team expose trước Phase 4.
- **Audio recording Speaking Practice**: `expo-speech-recognition` cần permission. Reuse flow từ Advanced Speaking (đã implement).
- **Autosave Writing**: Dùng lại `useWritingAutosave` hook hiện có, chỉ thay `saveWritingDraft` bằng `saveProgress` của exam API.
- **Grading poll**: Writing/Speaking practice session cũng cần grading qua RabbitMQ → reuse `useGradingPoll` hook.
