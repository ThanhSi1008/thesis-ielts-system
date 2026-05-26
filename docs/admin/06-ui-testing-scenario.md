# 06 — Kịch bản kiểm thử toàn diện trên UI (Manual UI Testing Scenario)

Tài liệu này hướng dẫn chi tiết cách chạy thử nghiệm thực tế (end-to-end) tính năng **Admin Exam Builder** và **Sequential FULL_TEST Player** trực tiếp trên giao diện trình duyệt Web (UI).

---

## 🛠️ Chuẩn bị môi trường (Prerequisites)

Hãy chắc chắn rằng các thành phần sau đang hoạt động bình thường trên máy của bạn:

### 1. Khởi động Cơ sở hạ tầng (Docker)
Mở Terminal tại thư mục gốc dự án (`thesis-ielts-system`) và chạy:
```bash
docker compose up -d
```
Xác nhận Postgres, Redis, RabbitMQ và MinIO đều đang ở trạng thái `healthy` (`docker ps`).

### 2. Nạp dữ liệu nền (Seed DB)
Để đảm bảo cơ sở dữ liệu có sẵn tài khoản Admin, các cấu hình quota, gói Premium mẫu và các đề thi sẵn có:
```bash
cd backend-core
npm run prisma:seed
```

### 3. Khởi chạy các service chạy local
*   **Terminal 1 — Backend Core (NestJS):**
    ```bash
    cd backend-core
    npm run dev
    ```
    *Cổng mặc định: `http://localhost:3000`*

*   **Terminal 2 — Backend AI (Python FastAPI):**
    ```bash
    cd backend-ai
    # Kích hoạt môi trường venv của bạn
    source venv/bin/activate
    # Cài đặt dependencies (nếu là lần đầu)
    pip install -r requirements.txt
    # Chạy uvicorn server
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    *Cổng mặc định: `http://localhost:8000`*

*   **Terminal 3 — Frontend Web (Next.js):**
    ```bash
    cd frontend-web
    npm run dev
    ```
    *Giao diện người dùng sẽ chạy tại: `http://localhost:3001`*

---

## 📋 Kịch bản 1: Nhập đề & Hàng đợi Staging (Admin Flow)

Mục tiêu: Đăng nhập quyền Admin, import đề thi 4 kỹ năng (`FULL_TEST`) từ file PDF hoặc Web URL và theo dõi quá trình cào/AI cấu trúc hóa bất đồng bộ.

### Bước 1: Đăng nhập tài khoản Admin
1. Mở trình duyệt, truy cập `http://localhost:3001/login`.
2. Đăng nhập bằng tài khoản mẫu:
    *   **Email:** `admin@example.com`
    *   **Password:** `123456`
3. Xác nhận bạn được điều hướng vào giao diện **Admin Dashboard**.

### Bước 2: Truy cập khu vực Staging Queue
1. Trên Sidebar bên trái, click vào mục **IELTS Intensive** (dưới nhóm Admin).
2. Xác nhận giao diện hiển thị danh sách các đề thi Intensive hiện tại và một bảng hàng đợi Staging ở góc dưới có tên: **Hàng đợi nhập đề (Import Queue)**.

### Bước 3: Thực hiện Import đề FULL_TEST
1. Tại giao diện IELTS Intensive, nhấn nút **"Nhập đề mới" (New Import)** ở phía trên bên phải.
2. Một Drawer (bảng trượt) xuất hiện. Thực hiện thiết lập các trường nhập liệu chính xác như giao diện hiển thị:
    *   **Target Skill * (Kỹ năng mục tiêu):** Chọn `FULL_TEST (Cả 4 kỹ năng)`.
    *   **Source Type (Loại nguồn):** Chọn `PDF File Drop` (mặc định sẽ hiển thị khung upload PDF kéo thả).
    *   **Source Publisher (Nhà xuất bản):** Chọn `Cambridge IELTS`.
    *   **Book Number (Số sách):** Nhập `18`.
    *   **Test Number (Số đề):** Nhập `1`.
3. Kéo và thả một file PDF đề thi IELTS chuẩn vào khu vực nét đứt `Drag or drop PDF file here` (hoặc click nút **Select PDF** để chọn file từ máy tính).
4. Nhấn nút màu vàng **"Submit Import"** ở góc dưới cùng bên phải để bắt đầu quá trình cào dữ liệu và AI bóc tách.

### Bước 4: Theo dõi luồng xử lý bất đồng bộ
1. Xác nhận Drawer đóng lại và **4 dòng JobStaging** (Listening, Reading, Writing, Speaking) mới được thêm vào **Hàng đợi nhập đề** với cùng một mã `Group ID`.
2. Theo dõi cột **Trạng thái (Status)** chuyển màu sinh động:
    *   `PENDING` (Đang chờ) $\rightarrow$ `SCRAPING` (Đang cào dữ liệu PDF/Media) $\rightarrow$ `EXTRACTING` (Đội AI đang bóc tách cấu trúc bằng Gemini) $\rightarrow$ `AWAITING_REVIEW` (Đang chờ duyệt).
3. *Thời gian xử lý dự kiến: 1–2 phút cho cả nhóm 4 kỹ năng.*

---

## 📋 Kịch bản 2: Kiểm duyệt & Commit đề (Editorial Flow)

Mục tiêu: Chỉnh sửa dữ liệu AI bóc tách (Visual Form & JSON Tab), điền timestamps cho Listening, chạy bộ kiểm tra tương thích chấm điểm (Grader-Compatibility) và commit đề vào bảng live.

### Bước 1: Mở Trình duyệt Duyệt đề (Review Editor)
1. Khi dòng job của kỹ năng **Listening** chuyển sang màu xanh lá `AWAITING_REVIEW`, nhấn nút **"Duyệt" (Review)** ở cột hành động.
2. Một Modal kiểm duyệt toàn màn hình xuất hiện với hiệu ứng kính mờ (backdrop-blur).

### Bước 2: Chỉnh sửa Visual Form & JSON Code
1. Nhấp qua lại giữa tab **"Trực quan" (Visual Form)** và tab **"Mã nguồn" (JSON)**.
2. Thay đổi một câu hỏi bất kỳ ở tab Trực quan (ví dụ: đổi text tiêu đề Part 1).
3. Chuyển sang tab JSON, xác nhận thay đổi đó đã được đồng bộ lập tức dưới dạng code.
4. Thử cố tình xóa trường `"answer"` của một câu hỏi ở tab JSON, sau đó nhấn **"Lưu"**. Xác nhận hệ thống hiển thị **Cảnh báo lỗi Grader (422 Unprocessable Entity)** do thiếu đáp án chấm điểm, ngăn chặn ghi đè đề lỗi vào DB.

### Bước 3: Điền câu hỏi và Timestamps (Listening)
1. Tại tab Trực quan của đề Listening, xác nhận có trình phát Audio tích hợp.
2. Nhấn nút Play để nghe file âm thanh đã được Media Pipeline tự động tải và lưu trữ.
3. Điền mốc thời gian mẫu (ví dụ: `01:25`, `03:40`) vào ô **Timestamps** của các câu hỏi (giúp học viên xem lại phân đoạn âm thanh sau khi thi).

### Bước 4: Lưu nháp & Duyệt các kỹ năng còn lại
1. Nhấn nút **"Lưu nháp" (Save Draft)**. Xác nhận modal đóng lại, trạng thái job vẫn là `AWAITING_REVIEW` nhưng thay đổi của bạn đã được lưu giữ.
2. Duyệt qua các job **Reading**, **Writing**, **Speaking** của cùng nhóm:
    *   Xác nhận đề Reading hiển thị Passages và ô câu hỏi dạng cột đôi (split pane) cân đối.
    *   Xác nhận đề Writing hiển thị đề bài Task 1, Task 2 và ảnh biểu đồ được trích xuất sắc nét.

### Bước 5: Thực hiện Group Commit (Tạo đề FULL_TEST)
1. Click nút **"Gom & Commit Group" (Commit Group)** ở đầu hàng đợi.
2. Hệ thống sẽ tự động gọi API chạy lưới an toàn `assertGraderCompatible` cho toàn bộ 4 kỹ năng.
3. Xác nhận:
    *   Cả 4 job staging chuyển sang trạng thái màu xám đen `COMMITTED`.
    *   Một đề thi trọn vẹn mới xuất hiện ở danh sách bảng Live phía trên với tiêu đề: `Cambridge IELTS 18 - Test 1` và nhãn loại đề là `FULL_TEST`.

---

## 📋 Kịch bản 3: Thi thử Sequential FULL_TEST (Student Flow)

Mục tiêu: Đăng nhập tài khoản Học viên, thực hiện làm bài tuần tự cả 4 kỹ năng trên giao diện chuẩn IELTS, lưu tiến độ bất đồng bộ, thử nghiệm tính năng tự động khôi phục bài thi khi ngắt kết nối (auto-resume).

### Bước 1: Đăng nhập tài khoản học viên (Student)
1. Truy cập `http://localhost:3001/login`.
2. Đăng nhập bằng tài khoản học viên (hoặc đăng ký tài khoản mới):
    *   **Email:** `student@example.com` (hoặc email học viên bất kỳ)
    *   **Password:** `123456`
3. Đi đến trang danh sách đề Intensive: `http://localhost:3001/ielts/intensive`.

### Bước 2: Bắt đầu bài thi FULL_TEST
1. Tìm đề `Cambridge IELTS 18 - Test 1` vừa được Admin commit ở Kịch bản 2.
2. Nhấn nút **"Bắt đầu thi" (Take Exam)**.
3. Xác nhận giao diện người dùng chuyển sang chế độ làm bài **Listening** với:
    *   Trình phát âm thanh chạy ổn định.
    *   Đồng hồ đếm ngược của phần thi Listening được thiết lập chính xác (40 phút).
    *   Nhãn tiêu đề hiển thị: `Cambridge IELTS 18 - Test 1 - Listening`.

### Bước 3: Làm bài Listening & Chuyển tiếp Reading
1. Nhập một vài đáp án mẫu vào các ô trả lời.
2. Nhấn nút **"Tiếp tục phần Reading" (Next Section)** ở góc trên bên phải (hoặc chờ đồng hồ đếm ngược về 0).
3. Xác nhận:
    *   Màn hình chuyển tiếp mượt mà sang **Reading Board** mà không cần reload trang.
    *   Đồng hồ đếm ngược được reset chính xác về 60 phút của Reading.
    *   Tiêu đề tự động cập nhật: `Cambridge IELTS 18 - Test 1 - Reading`.
    *   Xác nhận các đáp án Listening đã làm trước đó được tự động đẩy lên server để lưu tiến độ tạm thời (`saveSessionProgress`).

### Bước 4: Kiểm thử tính năng khôi phục bài thi (Auto-Resume)
1. Đang ở phần thi Reading, hãy nhập 1 vài đáp án (ví dụ câu 1 chọn `A`, câu 2 điền `false`).
2. **Giả lập sự cố:** Hãy F5 (Refresh) lại trình duyệt hoặc tắt tab đi và mở lại link làm bài thi đó.
3. Xác nhận:
    *   Hệ thống tự động phân tích các đáp án đã lưu trên máy chủ và đưa bạn quay trở lại **Reading Board** thay vì bắt đầu lại từ đầu ở Listening!
    *   Các đáp án đã chọn trước đó (Listening và Reading) được phục hồi nguyên vẹn trên màn hình.

### Bước 5: Làm bài Writing & Speaking
1. Nhấn chuyển tiếp đến **Writing Board** (60 phút): Nhập bài viết luận mẫu cho Task 1 và Task 2.
2. Nhấn chuyển tiếp đến **Speaking Board** (15 phút):
    *   Hệ thống yêu cầu quyền truy cập Micro của trình duyệt.
    *   Nhấn Record để ghi âm câu trả lời mẫu cho các Part của Speaking.
    *   Xác nhận có sóng ghi âm trực quan sinh động khi bạn nói.

---

## 📋 Kịch bản 4: Chấm điểm AI & Hợp nhất kết quả (Grading Flow)

Mục tiêu: Gửi bài thi, theo dõi hiệu ứng tính điểm thời gian thực, xem kết quả tổng hợp chi tiết (Điểm L/R thô và Đánh giá chi tiết bằng AI của W/S).

### Bước 1: Nộp bài thi (Finish Exam)
1. Tại phần thi Speaking, nhấn nút **"Hoàn thành bài thi" (Finish & Submit)**.
2. Xác nhận một thông báo xác nhận (modal) xuất hiện yêu cầu bạn đồng ý nộp bài.
3. Nhấp chọn **"Nộp bài thi" (Yes, Submit)**.

### Bước 2: Hiệu ứng chờ chấm điểm AI (AI Grading Overlay)
1. Xác nhận màn hình chuyển sang giao diện chờ chấm điểm cao cấp (Backdrop kính mờ tối màu):
    *   Spinner quay hoạt động động lập.
    *   Hiển thị dòng chữ: `Calculating your score… Our AI examiner is grading your responses. This may take a minute.`
2. Phía dưới nền, RabbitMQ gửi tác vụ chấm điểm sang Python AI worker. Worker gọi Whisper để transcribe audio nói của học viên, sau đó gửi bài viết + văn bản nói của học viên lên Gemini để chấm điểm theo 4 tiêu chí IELTS.

### Bước 3: Xem kết quả thi hợp nhất (Merged Result View)
1. Khi AI chấm điểm xong (khoảng 30-45 giây), trang web sẽ tự động chuyển hướng bạn sang giao diện kết quả: `http://localhost:3001/ielts/intensive/[examId]/result/[sessionId]`.
2. Xác nhận các khối điểm được hiển thị phân tách trực quan:
    *   **Listening Score:** Hiển thị điểm số thô chính xác (ví dụ: `38 / 40`).
    *   **Reading Score:** Hiển thị điểm số thô chính xác (ví dụ: `36 / 40`).
    *   **Writing Band:** Hiển thị Band điểm AI chấm (ví dụ: `7.5`). Click xem chi tiết để đọc đánh giá chi tiết theo 4 tiêu chuẩn (Task Response, Coherence, Lexical Resource, Grammar).
    *   **Speaking Band:** Hiển thị Band điểm AI chấm (ví dụ: `7.0`). Click xem chi tiết để nghe lại audio đã ghi âm kèm văn bản AI tự động bóc và đánh giá sửa lỗi phát âm, từ vựng.
3. Xác nhận điểm số Listening và Reading **không bị ghi đè** bởi điểm chấm của AI và feedback của cả Writing & Speaking được hợp nhất hoàn hảo dưới dạng tab/khối trong cùng một kết quả thi.

---

Chúc bạn có một buổi thử nghiệm giao diện thực tế thật thành công để chuẩn bị tốt nhất cho buổi bảo vệ luận văn của mình!
