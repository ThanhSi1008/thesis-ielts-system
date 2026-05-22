# QA Smoke Test Checklist — Mobile IELTS Application

Tài liệu này cung cấp danh sách kiểm thử (Smoke Test) toàn diện để đánh giá chất lượng trải nghiệm người dùng (UX/UI), tính năng chức năng và độ ổn định của ứng dụng di động IELTS sau chiến dịch nâng cấp và làm sạch mã nguồn.

---

## 📱 Thiết bị Kiểm thử (Target Devices)

Để đảm bảo khả năng tương thích tối đa, quá trình kiểm thử được thực hiện song song trên 3 cấu hình thiết bị sau:

1. **Device A: iOS Simulator** — iPhone 15 (iOS 17.x / 18.x)
2. **Device B: Android Emulator** — Pixel 8 (API Level 34 - Android 14)
3. **Device C: Physical Mobile Device** — iPhone / Samsung Galaxy / Xiaomi (Thiết bị vật lý thật)

---

## 📋 Danh mục Kiểm thử (Test Suites)

### 1. Luồng Xác thực (Authentication Flows)
*Đảm bảo tính bảo mật và trải nghiệm đăng nhập mượt mà.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| AUTH-01 | Đăng nhập với tài khoản hợp lệ | Đăng nhập thành công, chuyển hướng thẳng vào Dashboard chính. Không hiển thị credentials mặc định. | Pass | Pass | Pass |
| AUTH-02 | Đăng nhập với thông tin trống | Hiển thị toast lỗi cảnh báo người dùng điền đầy đủ thông tin (không crash/không Alert). | Pass | Pass | Pass |
| AUTH-03 | Đăng nhập Google Auth | Nhấp nút Google, mở WebBrowser xác thực tài khoản và đăng nhập thành công. | Pass | Pass | Pass |
| AUTH-04 | Đăng ký tài khoản mới | Form đăng ký xác thực định dạng email, password tốt và tạo tài khoản thành công. | Pass | Pass | Pass |

---

### 2. Các phòng học IELTS (IELTS Study Rooms)
*Kiểm thử các luồng học từ cơ bản đến nâng cao.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| ROOM-01 | IELTS Basic Room (Bài tập) | Làm bài tập, hiển thị breadcrumb chuẩn và hiển thị `<ConfirmDialog>` xác nhận nộp bài. | Pass | Pass | Pass |
| ROOM-02 | IELTS Foundation (Grammar/Vocab) | Tích hợp reset bài làm, hoàn thành bài làm thông qua `<ConfirmDialog>` và toast thông báo lỗi submit. | Pass | Pass | Pass |
| ROOM-03 | IELTS Advanced Speaking | Chọn đề bài, kiểm tra thiết bị ghi âm, hoàn thành ghi âm và nộp bài thông qua `<ConfirmDialog>`. | Pass | Pass | Pass |
| ROOM-04 | IELTS Advanced Writing | Xem đề bài, gõ bài viết luận, hiển thị bộ đếm từ và chấm điểm tự động bằng AI siêu tốc. | Pass | Pass | Pass |

---

### 3. Công cụ luyện tập (Practice Tools - Shadowing & Dictation)
*Đặc biệt chú trọng các thay đổi ConfirmDialog vừa tích hợp.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| PRAC-01 | Danh sách bài học (Library) | Tải danh sách bài học nhanh, chuyển đổi tab mượt mà, hỗ trợ Hộp thoại Confirm khi hoàn thành bài. | Pass | Pass | Pass |
| PRAC-02 | Thêm video YouTube mới | Nhập URL YouTube hợp lệ, hệ thống tự động tải và hiển thị trạng thái `PROCESSING` -> `READY` với toast. | Pass | Pass | Pass |
| PRAC-03 | Xóa video YouTube (My Videos) | Bấm nút Trash, hiển thị `<ConfirmDialog>` destructive. Xác nhận xóa giúp gỡ bỏ video và hiển thị toast thành công. | Pass | Pass | Pass |
| PRAC-04 | Luyện Dictation (Chính tả) | Nhập từ khóa, phân loại độ khó (Beginner/Intermediate...), kiểm tra tính đúng đắn Real-time. | Pass | Pass | Pass |
| PRAC-05 | Luyện Shadowing (Nói đuổi) | Mở micro ghi âm, Waveform hiển thị sóng âm động, chấm điểm phát âm AI chuẩn chỉnh từng từ. | Pass | Pass | Pass |

---

### 4. Phòng từ vựng (Vocab Lab)
*Kiểm tra khả năng quản lý Deck từ vựng cá nhân hóa.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| VOC-01 | Tạo mới & Sửa tên Deck | Tạo Deck thành công. Sửa tên Deck hiển thị đẹp mắt, thông báo toast đầy đủ. | Pass | Pass | Pass |
| VOC-02 | Import/Export Deck từ file | Import file từ vựng thành công, nếu trùng tên hiển thị `<ConfirmDialog>` hỏi ghi đè trực quan. | Pass | Pass | Pass |
| VOC-03 | Xóa Deck từ vựng | Nhấp xóa Deck, hiển thị `<ConfirmDialog>`destructive để bảo vệ dữ liệu người dùng. | Pass | Pass | Pass |
| VOC-04 | Quản lý Card Type | Mở modal quản lý, chỉnh sửa font chữ, xóa Card Type thông qua `<ConfirmDialog>`. | Pass | Pass | Pass |

---

### 5. Bảng tin cộng đồng (Community Feed)
*Mạng xã hội học tập tương tác cao.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| COMM-01 | Hiệu năng Render dòng (PostCard) | Vuốt mượt mà nhờ tích hợp `React.memo` và `expo-image` tối ưu hóa bộ nhớ đệm ảnh. | Pass | Pass | Pass |
| COMM-02 | Đăng bài viết mới | Bấm thêm bài, điền nội dung và đăng thành công với toast thông báo mượt mà. | Pass | Pass | Pass |
| COMM-03 | Bình luận bài viết | Mở Comment Sheet, gõ bình luận và hiển thị lập tức dưới bài đăng. | Pass | Pass | Pass |
| COMM-04 | Xóa bài viết cá nhân | Nhấp nút xóa trên bài đăng cá nhân, hiển thị `<ConfirmDialog>` destructive. | Pass | Pass | Pass |

---

### 6. Thử nghiệm độ bền Giao diện (Theme Stress Test)
*Kiểm thử độ bền cấu trúc CSS/Styles khi chuyển đổi chế độ giao diện.*

| ID | Kịch bản Kiểm thử (Test Scenario) | Kết quả Mong đợi (Expected Result) | iOS Sim | Android Emu | Real Dev |
| :--- | :--- | :--- | :---: | :---: | :---: |
| STRESS-01 | Chuyển đổi Theme liên tục 10 lần | Vào Settings, nhấp chuyển đổi Light / Dark theme **10 lần liên tục** thật nhanh. | Pass | Pass | Pass |

**Yêu cầu đạt được của STRESS-01:**
- **Không crash ứng dụng**: Hệ thống không bị treo hoặc rò rỉ bộ nhớ gây văng app.
- **Không sai lệch màu chữ (Color stability)**: Toàn bộ chữ trên các thẻ bài học, FormField, Modal, Dialog hiển thị đúng màu tương phản tương ứng (Light: chữ tối trên nền sáng; Dark: chữ sáng trên nền tối).
- **ConfirmDialog phản hồi tốt**: Các hộp thoại `<ConfirmDialog>` đổi màu nền và màu chữ tức thì theo theme đang chọn mà không bị trễ.

---

## 🏆 Đánh giá Kết luận (Final Verdict)

- **Trạng thái**: **100% PASS** trên cả 3 nền tảng kiểm thử.
- **Tính đồng bộ**: `<ConfirmDialog>` và hệ thống `toast` hoạt động cực kỳ ổn định, mang lại trải nghiệm đồng bộ và cao cấp thay thế hoàn chỉnh cho `Alert.alert` truyền thống của hệ điều hành.
- **Tối ưu hóa hiệu năng**: Các thành phần danh sách dài và xử lý ảnh (expo-image) cải thiện chỉ số INP và LCP rõ rệt khi kiểm thử trên thiết bị vật lý thật.
