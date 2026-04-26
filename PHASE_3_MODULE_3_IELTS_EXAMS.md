# Phase 3 - Module 3: Dữ liệu phức tạp IELTS Exams

## 1. Mục Tiêu Module (Goal)
- Hiển thị danh sách đề thi IELTS chuyên sâu.
- Triển khai màn hình làm bài thi với JSON cực lớn và phức tạp.
- Xử lý mượt mà UI bài thi Reading (Chia nửa màn hình hiển thị đoạn văn hoặc dùng tab) và Listening.

## 2. UI Components (NativeWind v4)
- `features/ielts/components/ExamCard.tsx`: Thẻ đề thi (Dùng interface segregation, chỉ truyền prop nguyên thuỷ, không truyền nguyên object JSON).
- `features/ielts/components/PassageViewer.tsx`: Giao diện đọc đoạn văn Reading, hỗ trợ highlight, scrollable. **UX/UI Đột phá**: Thay vì chia đôi màn hình gây khó đọc trên điện thoại, Passage sẽ chiếm toàn màn hình. Danh sách câu hỏi sẽ được đặt trong một **Bottom Sheet** (khuyến nghị dùng thư viện `@gorhom/bottom-sheet`). Người dùng vuốt lên để xem/chọn câu hỏi, vuốt xuống để trả lại không gian cho bài đọc.
- `features/ielts/components/QuestionTypes/MultipleChoice.tsx`: UI loại câu hỏi trắc nghiệm.
- `features/ielts/components/QuestionTypes/FillBlank.tsx`: UI loại câu điền từ.
- `features/ielts/components/ExamTimer.tsx`: Đồng hồ đếm ngược bài thi.

## 3. Hooks / Data Fetching (TanStack Query / Zustand)
- `features/ielts/hooks/useExams.ts`: Lấy danh sách đề thi (phân trang).
- `features/ielts/hooks/useExamDetail.ts`: `useQuery` để lấy full JSON bài thi. Yêu cầu có hàm type guard `isExamQuestion` parsing `unknown` để đảm bảo Type Safety.
- `features/ielts/stores/useExamSessionStore.ts`: Dùng Zustand (Client state) để lưu câu trả lời (Answers map). **Bắt buộc dùng middleware `persist` kết hợp `react-native-mmkv`** để lưu offline tức thời (autosave) mọi đáp án vừa chọn, tránh mất bài khi lỡ vuốt tắt app.
  - **Logic Đồng hồ (Timer)**: Tuyệt đối KHÔNG dùng `setInterval` đếm ngược chay (vì HĐH iOS/Android sẽ đóng băng JS khi app vào background làm sai lệch giờ). Phải tính toán thời gian dựa trên công thức `TargetEndTime - Date.now()`.
- `features/ielts/hooks/useSubmitExam.ts`: Mutation để nộp JSON answers lên backend chấm điểm.

## 4. Cấu trúc Routing (Expo Router `app/`)
- `app/(tabs)/exams/index.tsx`: Dashboard đề thi, lọc theo Skill.
- `app/(tabs)/exams/[examId].tsx`: Màn hình Intro của bài thi (Mô tả, độ dài, quy tắc).
- `app/(tabs)/exams/session/[sessionId].tsx`: Màn hình làm bài thì chính thức.

## 5. Acceptance Criteria (Tiêu chí nghiệm thu)
- Danh sách câu hỏi dài (VD: 40 câu Reading) BẮT BUỘC dùng `FlashList` kèm `estimatedItemSize`, cuộn cực êm ở 60fps mà không rớt frame.
- **Tối ưu Re-render Tuyệt đối**: Khi người dùng tick một câu hỏi trắc nghiệm, các câu hỏi khác TUYỆT ĐỐI không được re-render. Component `MultipleChoice` hoặc `FillBlank` chỉ được phép dùng Selector của Zustand để "lắng nghe" duy nhất `id` của chính nó. Bắt buộc wrap component câu hỏi bằng `React.memo` với hàm so sánh `propsAreEqual` tùy chỉnh.
- Dữ liệu câu trả lời phải được autosave xuống MMKV liên tục, không mất đi khi xoay màn hình hay app bị tắt đột ngột (kill app).
- Trải nghiệm Reading mượt mà, trực quan với mô hình Passage full-screen kết hợp câu hỏi trong Bottom Sheet kéo vuốt tự nhiên.
