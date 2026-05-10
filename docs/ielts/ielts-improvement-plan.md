# Kế Hoạch Cải Thiện IELTS Mobile (Đồng Bộ Với Web)

Dựa trên việc đối chiếu source code giữa nền tảng Web (`frontend-web/src/app/ielts`) và Mobile (`frontend-mobile/app/ielts`), dưới đây là phân tích chi tiết về những tính năng còn thiếu hoặc chưa hoàn thiện trên Mobile so với Web, kèm theo kế hoạch triển khai.

## 1. IELTS Basic (Lý Thuyết & Luyện Tập Cơ Bản)
**Tình trạng hiện tại:**
- **Web:** Đã triển khai rất chi tiết với các layout riêng biệt cho từng kỹ năng (`ReadingExerciseLayout`, `ListeningExerciseLayout`, `WritingExerciseLayout`), có `TheoryModal` để xem lý thuyết ngay trong lúc làm bài. Có đầy đủ `DiagnosticQuiz` trong phần onboarding. Hệ thống render câu hỏi (renders) rất đa dạng.
- **Mobile:** Đã có khá nhiều component render câu hỏi (`MapLabelling`, `FlowChart`, `Matching`, `TFNG`, v.v.), tuy nhiên giao diện bài tập vẫn dùng chung một layout đơn giản (`[exerciseId].tsx`).
- **Cần làm:**
  - [ ] Bổ sung `TheoryModal` (dạng Bottom Sheet hoặc Modal trên Mobile) để học viên có thể xem lý thuyết khi làm bài.
  - [ ] Cấu trúc lại giao diện bài tập để có Layout tối ưu riêng cho từng kỹ năng (đặc biệt là Reading cần chia đôi màn hình / tab để xem bài đọc và câu hỏi).
  - [ ] Kiểm tra và hoàn thiện `DiagnosticQuiz` trong Onboarding.

## 2. IELTS Intensive (Thi Thử - Mock Tests)
**Tình trạng hiện tại:**
- **Web:** Hỗ trợ đầy đủ 4 kỹ năng (Reading, Listening, Writing, Speaking). Điểm đặc biệt là Web chia rõ 2 chế độ: **Take Mode** (thi thật, tính thời gian) và **Practice Mode** (luyện tập, có feedback ngay). Có các Board riêng cho từng kỹ năng (ví dụ: `TakeReadingBoard`, `PracticeListeningBoard`).
- **Mobile:** Hiện tại chỉ gom chung vào file `[examId].tsx` với chức năng tính giờ và render MCQ đơn giản. Chưa phân biệt chế độ Practice/Take và chưa hỗ trợ tốt Writing/Speaking.
- **Cần làm:**
  - [ ] Refactor `[examId].tsx` thành kiến trúc đa màn hình giống Web.
  - [ ] Xây dựng màn hình Start Exam (`[examId]/start.tsx`) để chọn kỹ năng và chế độ thi.
  - [ ] Xây dựng `Practice Mode` (hiện đáp án/giải thích ngay khi chọn) và `Take Mode` (thi thật).
  - [ ] Phát triển Board riêng cho Writing (text input lớn, tự động lưu nháp) và Speaking (ghi âm giọng nói).

## 3. IELTS Advanced (Luyện Tập Chuyên Sâu)
**Tình trạng hiện tại:**
- **Web:** Chia rõ `listening` và `reading`, đồng thời có tính năng `my-answers` để học viên xem lại lịch sử các câu trả lời chi tiết.
- **Mobile:** Đã có file động `[skill]/[partId].tsx` và xem kết quả `result/[resultId].tsx` nhưng chưa có tính năng `my-answers` chi tiết.
- **Cần làm:**
  - [ ] Bổ sung tính năng review `my-answers` để học viên xem lại chi tiết đúng/sai cho từng part.

## 4. Student & Teacher (Theo Dõi Tiến Độ)
**Tình trạng hiện tại:**
- **Web:** Có dashboard riêng cho giáo viên/học viên (`StudentTeacherContent.tsx`) và trang xem chi tiết từng học sinh (`student/[studentId]`).
- **Mobile:** Đã có folder `student-teacher`, nhưng cần đảm bảo UI/UX hiển thị biểu đồ, danh sách học sinh thân thiện với thiết bị di động.
- **Cần làm:**
  - [ ] Audit lại màn hình Student/Teacher trên Mobile, bổ sung biểu đồ thống kê (dùng `react-native-chart-kit` hoặc tương tự).
  - [ ] Đảm bảo tính năng xem chi tiết học viên hoạt động mượt mà.

## Ưu Tiên Triển Khai (Priority List)
1. **P0 (Cao nhất):** Nâng cấp **IELTS Intensive**, tách biệt Practice Mode và Take Mode, vì đây là tính năng cốt lõi của việc luyện đề.
2. **P1:** Nâng cấp UX cho **IELTS Basic**, thêm `TheoryModal` và tối ưu Reading Layout (chia tab Bài đọc / Câu hỏi).
3. **P2:** Hoàn thiện `my-answers` cho IELTS Advanced.
4. **P3:** Tối ưu biểu đồ và giao diện cho phân hệ Student/Teacher.
