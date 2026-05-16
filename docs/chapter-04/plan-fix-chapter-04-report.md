# Kế hoạch đề xuất sửa lỗi Chương 4 (Báo cáo vs Code)

Dựa trên kết quả đối chiếu giữa tài liệu báo cáo `04-design.tex` và source code thực tế, dưới đây là kế hoạch chi tiết để khắc phục các điểm sai lệch (mismatch) nhằm đảm bảo tính trung thực và chính xác của luận văn.

## 1. Mục tiêu
- Đồng bộ hóa tài liệu báo cáo (Chương 4) với kiến trúc và code hiện tại của dự án.
- Cập nhật lại các biểu đồ (Class, ERD, Architecture, Flowchart) phản ánh đúng thực trạng hệ thống.
- Chỉnh sửa các mô tả kỹ thuật không còn phù hợp (Supabase, Cloudinary, FSRS).

## 2. Các hạng mục công việc chi tiết

### 2.1. Nhóm 1: Cập nhật Biểu đồ & Sơ đồ (Độ ưu tiên: Cao)

1. **Cập nhật Class Diagram (Hình 4.1)**
   - **Vị trí sửa:** File ảnh `4.1. Class Diagram/*.png` và text mô tả trong `04-design.tex:5-25`.
   - **Hành động:** Vẽ lại sơ đồ lớp để khớp với Prisma Schema hiện hành.
     - Xoá các model không tồn tại: `OtpToken`, `RefreshToken`, `Skill`, `Exercise`, `UserExerciseResult`, `VocabularyItem`, `UserVocabularyCard`, `ExamSectionDraft`.
     - Cập nhật `User`: Bỏ `passwordHash, failedAttempts, lockUntil`.
     - Bổ sung các model trọng tâm hiện có: `Flashcard`, `Deck`, `IeltsIntensiveSession`, `IeltsBasicProgress`.

2. **Cập nhật Entity-Relationship Diagram - ERD (Hình 4.2)**
   - **Vị trí sửa:** File ảnh ERD và text mô tả `04-design.tex:31, 40`.
   - **Hành động:** Điều chỉnh tên các thực thể trong biểu đồ theo đúng tên bảng (`@@map`) đã định nghĩa.
     - Sử dụng danh sách bảng thực tế: `ielts_skills`, `ielts_listening_exercises`, `ielts_practice_*`, `vocabulary_books`, `exams`, `results`, v.v.

3. **Cập nhật Architecture Diagram (Hình 4.3)**
   - **Vị trí sửa:** File ảnh `4.3. Architecture Diagram/architecture-diagram.png` và text `04-design.tex:53`.
   - **Hành động:** Bổ sung module **Cloudinary** vào sơ đồ (phụ trách lưu trữ hình ảnh tải lên), trong khi **GCS** vẫn giữ vai trò lưu trữ Audio.

4. **Cập nhật Sơ đồ Luồng - Flow Chart (Hình 4.4)**
   - **Vị trí sửa:** File ảnh `1-flowchart-web.png`, `2-flowchart-mobile.png` và text mô tả `04-design.tex:66, 77`.
   - **Hành động:**
     - **Web:** Bổ sung các nhánh còn thiếu vào flowchart (Foundation, Vocab Lab, Community, Pricing) hoặc ghi chú rõ đây chỉ là các luồng học tập trọng tâm.
     - **Mobile:** Đổi lại các Tab hiển thị cho đúng với code, bao gồm 5 tabs: `Home`, `Explore`, `IELTS`, `Community`, `Profile`.

### 2.2. Nhóm 2: Chỉnh sửa Mô tả Đặc tả Kỹ thuật (Độ ưu tiên: Trung bình - Cao)

1. **Hạ tầng Cơ sở dữ liệu**
   - **Vị trí sửa:** `04-design.tex:29, 53`.
   - **Hành động:** Sửa mô tả từ "PostgreSQL triển khai trực tiếp trên GCP VM" thành "PostgreSQL triển khai qua **Supabase** (managed database) với PgBouncer pooler".

2. **Thuật toán Spaced Repetition (SR)**
   - **Vị trí sửa:** `04-design.tex:11, 202`.
   - **Hành động:** Xóa tham chiếu đến thuật toán SM-2 (`easeFactor`). Thay vào đó, mô tả thuật toán đang dùng là **FSRS** (qua thư viện `ts-fsrs`) lưu trữ các thông số `stability`, `difficulty`, `due` và `cardState`.

### 2.3. Nhóm 3: Cập nhật Số liệu Kiểm thử (Độ ưu tiên: Thấp)

1. **Kiểm thử Backend (Jest)**
   - **Vị trí sửa:** `04-design.tex:326`.
   - **Hành động:**
     - Đính chính đường dẫn xuất file report thành `backend-core/docs/testing/test-results.md`.
     - Chạy lại lệnh `npm run test:report` ở backend-core. Lấy thời gian chạy thực tế của toàn bộ bộ test (60 test cases) để thay thế cho con số ước chừng "$\leq$5 giây" hiện tại.

## 3. Lộ trình triển khai (Roadmap) đề xuất

- **Giai đoạn 1 (Thiết kế lại biểu đồ):** Hoàn thành vẽ mới lại 4 biểu đồ (Class, ERD, Architecture, Mobile/Web Flow). Thay thế ảnh vào thư mục `thesis-report/figures/`.
- **Giai đoạn 2 (Cập nhật LaTeX):** Dựa vào các biểu đồ mới, tiến hành cập nhật trực tiếp nội dung file `04-design.tex` theo các nhóm hạng mục 2.1 và 2.2.
- **Giai đoạn 3 (Chốt số liệu Testing):** Chạy lại test suite để lấy output report mới nhất. Cập nhật kết quả vào tiểu mục Kiểm thử.
- **Giai đoạn 4 (Review & Build):** Compile lại tài liệu thành file PDF. Đọc rà soát lại văn phong và kiểm tra xem có bị vỡ bố cục/tràn lề khi thêm hình ảnh mới hay không.
