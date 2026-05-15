# 4.6 Kiểm thử hệ thống

## 4.6.1 Danh sách các test-case

### Bảng 4.1 — Danh sách test case

| ID | TH | Chức năng | Tiền điều kiện | Tình huống test | Kết quả mong muốn |
|----|----|-----------|----------------|-----------------|-------------------|
| TC01 | 1 | Đăng ký | Chưa có tài khoản, ở trang Đăng ký | Nhập tên tài khoản có ký tự đặc biệt | Thông báo tên tài khoản không hợp lệ |
| TC01 | 2 | Đăng ký | Chưa có tài khoản, ở trang Đăng ký | Nhập email sai định dạng | Thông báo email không hợp lệ |
| TC01 | 3 | Đăng ký | Chưa có tài khoản, ở trang Đăng ký | Nhập mật khẩu ít hơn 8 ký tự | Thông báo mật khẩu phải ít nhất 8 ký tự |
| TC01 | 4 | Đăng ký | Chưa có tài khoản, ở trang Đăng ký | Nhập email không thuộc sở hữu người dùng | Chuyển trang OTP nhưng không nhận được OTP |
| TC01 | 5 | Đăng ký | Chưa có tài khoản, ở trang Đăng ký | Nhập email đúng, thuộc sở hữu người dùng | Chuyển trang OTP và nhận được OTP qua email |
| TC01 | 6 | Đăng ký | Đã xác nhận email, ở trang nhập OTP | Nhập sai OTP | Thông báo OTP không chính xác |
| TC01 | 7 | Đăng ký | Đã xác nhận email, ở trang nhập OTP | Đợi sau 60 giây mới nhập OTP | Thông báo OTP không hợp lệ / hết hạn |
| TC01 | 8 | Đăng ký | Đã xác nhận email, ở trang nhập OTP | Nhập đúng OTP | Đăng ký thành công, chuyển trang Đăng nhập |
| TC02 | 1 | Đăng nhập | Tài khoản tồn tại, ở trang Đăng nhập | Email đúng, mật khẩu sai | Thông báo đăng nhập thất bại |
| TC02 | 2 | Đăng nhập | Tài khoản tồn tại, ở trang Đăng nhập | Email sai, mật khẩu đúng | Thông báo đăng nhập thất bại |
| TC02 | 3 | Đăng nhập | Tài khoản tồn tại, ở trang Đăng nhập | Email sai, mật khẩu sai | Thông báo đăng nhập thất bại |
| TC02 | 4 | Đăng nhập | Tài khoản tồn tại, ở trang Đăng nhập | Email đúng, mật khẩu < 8 ký tự | Thông báo mật khẩu phải lớn hơn 8 ký tự |
| TC02 | 5 | Đăng nhập | Tài khoản tồn tại, ở trang Đăng nhập | Email và mật khẩu đúng | Đăng nhập thành công, chuyển Newsfeed |
| TC03 | 1 | Tạo bài viết | Đăng nhập, ở Newsfeed | Đăng bài văn bản có nội dung | Đăng thành công, bài hiện đầu Newsfeed, lưu bảng `posts` |
| TC03 | 2 | Tạo bài viết | Đăng nhập, ở Newsfeed | Đăng bài văn bản không nhập nội dung | Thông báo nhập nội dung hoặc chọn file |
| TC03 | 3 | Tạo bài viết | Đăng nhập, ở Newsfeed | Đăng bài kèm ảnh/video/file và có nội dung | Upload storage thành công, bài hiện Newsfeed, lưu `posts` |
| TC03 | 4 | Tạo bài viết | Đăng nhập, ở Newsfeed | Đăng bài kèm media, không nhập nội dung | Upload thành công, bài hiện Newsfeed, lưu `posts` |
| TC04 | 1 | Nhắn tin | Đăng nhập, ở trang Tin nhắn | User A nhập tin nhắn và nhấn Gửi | Tin hiện ngay cho A và B, lưu bảng `messages` |
| TC05 | 1 | Thông báo | Đã đăng nhập | Click thông báo MXH (like/comment) | Đánh dấu đã đọc, chuyển bài đăng |
| TC05 | 2 | Thông báo | Đã đăng nhập | Click thông báo "Có từ vựng mới cần ôn" | Đánh dấu đã đọc, chuyển chi tiết từ vựng |
| TC05 | 3 | Thông báo | Đã đăng nhập | Click thông báo thành tựu / lên cấp | Hiển thị chúc mừng, đánh dấu đã đọc |
| TC05 | 4 | Thông báo | Đã đăng nhập | Click thông báo "Ôn tập từ cũ" | Đánh dấu đã xem, chuyển trang làm bài |
| TC06 | 1 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Nhập biệt danh bất kỳ, nhấn Lưu | Cập nhật thành công |
| TC06 | 2 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | SĐT không đủ 10 ký tự | Thông báo SĐT không hợp lệ |
| TC06 | 3 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | SĐT chứa ký tự chữ | Thông báo SĐT không hợp lệ |
| TC06 | 4 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | SĐT 10 chữ số hợp lệ | Cập nhật thành công |
| TC06 | 5 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Địa chỉ chỉ toàn số | Thông báo địa chỉ không hợp lệ |
| TC06 | 6 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Địa chỉ có ký tự đặc biệt | Thông báo địa chỉ không hợp lệ |
| TC06 | 7 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Địa chỉ đúng định dạng | Cập nhật thành công |
| TC06 | 8 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Nhập tiểu sử bất kỳ | Cập nhật thành công |
| TC06 | 9 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Ngày sinh lớn hơn ngày hiện tại | Thông báo ngày sinh không hợp lệ |
| TC06 | 10 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Ngày sinh cho tuổi ≤ 6 | Thông báo tuổi phải > 6 |
| TC06 | 11 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Ngày sinh hợp lệ | Cập nhật thành công |
| TC06 | 12 | Cập nhật thông tin | Đăng nhập, ở trang cá nhân | Không thay đổi gì, nhấn Lưu | Thông báo không có thay đổi để cập nhật |
| TC07 | 1 | Luyện viết (AI) | Đăng nhập, ở Luyện viết | Level Intermediate, Topic Environment, Generate AI | Gọi Gemini API, hiển thị đề đúng level/topic |
| TC08 | 1 | Luyện viết (chấm AI) | Ở màn hình làm bài | Nhập bài, nhấn Nộp bài | AI chấm điểm, gợi ý, lưu lịch sử học tập |
| TC09 | 1 | Luyện nghe | Ở màn hình luyện nghe | Điền từ thiếu, nhấn Nộp | So khớp đáp án, highlight xanh/đỏ |
| TC10 | 1 | Luyện nói | Ở màn hình luyện nói, đã cấp Micro | Ghi âm câu tiếng Anh | STT → AI phản hồi TTS, đánh giá phát âm |
| TC11 | 1 | Lộ trình học tập | Ở màn hình Lộ trình học tập | Nhập đủ dữ liệu, nhấn Tạo lộ trình | Tạo lộ trình đúng kỹ năng và topic lesson |

---

## Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Dữ liệu đầu vào | Kết quả mong đợi | Trạng thái | Người TH | Ngày |
|------|------|----|-----------------|------------------|------------|----------|------|
| TC01 | Invalid | TC01_01 | `User#Name!` | Tên tài khoản không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Invalid | TC01_02 | `user_email.com` | Email không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Invalid | TC01_03 | `12345` | Mật khẩu phải ≥ 8 ký tự | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Invalid | TC01_04 | `fake_email@gmail.com` | Không nhận OTP (chờ quá lâu) | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Valid | TC01_05 | `real_email@gmail.com` | Chuyển trang OTP, nhận email | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Invalid | TC01_06 | OTP: `000000` (sai) | OTP không chính xác | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Invalid | TC01_07 | OTP sau 60s | OTP không hợp lệ / hết hạn | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC01 | Valid | TC01_08 | OTP đúng | Đăng ký thành công → Login | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC02 | Invalid | TC02_01 | Email đúng, pass sai | Đăng nhập thất bại | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC02 | Invalid | TC02_02 | Email sai, pass đúng | Đăng nhập thất bại | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC02 | Invalid | TC02_03 | Email sai, pass sai | Đăng nhập thất bại | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC02 | Invalid | TC02_04 | Email đúng, pass < 8 ký tự | Mật khẩu phải > 8 ký tự | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC02 | Valid | TC02_05 | Email và pass đúng | Đăng nhập thành công → Newsfeed | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC03 | Valid | TC03_01 | Text: "Hello World" | Tạo bài viết thành công | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC03 | Invalid | TC03_02 | Text rỗng | Vui lòng nhập nội dung hoặc chọn file | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC03 | Valid | TC03_03 | Text + `img.jpg` | Upload file, bài hiện lên | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC03 | Valid | TC03_04 | Text rỗng + `video.mp4` | Upload file, bài hiện lên | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC04 | Valid | TC04_01 | Hero Nguyen 202 gửi "Hi" | Tin nhắn hiển thị "Hi" | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC05 | Valid | TC05_01 | Click thông báo Like/Comment | Chuyển bài đăng chi tiết | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC05 | Valid | TC05_02 | Click thông báo từ vựng mới | Chuyển chi tiết từ vựng | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC05 | Valid | TC05_03 | Click thông báo thành tựu | Chúc mừng, đánh dấu đã đọc | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC05 | Valid | TC05_04 | Click thông báo ôn tập | Chuyển trang làm bài tập | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC06 | Valid | TC06_01 | Nickname: "Superman" | Cập nhật thành công | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_02 | SĐT: `090123` (thiếu số) | SĐT không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_03 | SĐT: `090abc` (có chữ) | SĐT không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Valid | TC06_04 | SĐT: `0901234567` | Cập nhật thành công | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_05 | Đ/c: `12345` (toàn số) | Địa chỉ không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_06 | Đ/c: `@#$%` | Địa chỉ không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Valid | TC06_07 | Đ/c: `TP.HCM` | Cập nhật thành công | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Valid | TC06_08 | Bio: "Yêu màu hồng" | Cập nhật thành công | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_09 | DOB: 01/01/2030 | Ngày sinh không hợp lệ | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_10 | DOB: 01/01/2023 (< 6 tuổi) | Tuổi phải > 6 | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Valid | TC06_11 | DOB: 01/01/2000 | Cập nhật thành công | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC06 | Invalid | TC06_12 | Không nhập/sửa gì | Không có thay đổi | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC07 | Valid | TC07_01 | Level Beginner, Topic Email | AI tạo đề đúng chủ đề | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC08 | Valid | TC08_01 | Nộp bài làm | Hiển thị điểm, lỗi, gợi ý AI | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC09 | Valid | TC09_01 | Điền từ và Nộp | Điểm + highlight xanh/đỏ | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
| TC10 | Valid | TC10_01 | Ghi âm giọng nói | AI phản hồi Text+Audio, đánh giá | Pass | Trương Quốc Bảo | 04/12/2025 |
| TC11 | Valid | TC11_01 | Nhập đủ Skills, Topic, Goal… | Tạo lộ trình, lưu CSDL | Pass | Nguyễn Thanh Thuận | 04/12/2025 |
