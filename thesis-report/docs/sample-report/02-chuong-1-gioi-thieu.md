# CHƯƠNG 1: GIỚI THIỆU

### 1.1 Tổng quan

Trong bối cảnh toàn cầu hóa, tiếng Anh ngày càng trở thành ngôn ngữ phổ biến và giữ vai trò quan trọng trong học tập, công việc và giao tiếp quốc tế. Nhu cầu học và rèn luyện tiếng Anh tại Việt Nam cũng như trên thế giới ngày càng gia tăng, đặc biệt với hình thức học trực tuyến thông qua các nền tảng internet. Theo thống kê của Statista (2024), số lượng người dùng các ứng dụng học ngoại ngữ trực tuyến đã vượt hơn 500 triệu, trong đó những nền tảng nổi bật như Duolingo, Memrise hay Elsa Speak được sử dụng rộng rãi [7]. Tuy nhiên, các ứng dụng này còn nhiều hạn chế, chẳng hạn:

- Thiếu yếu tố **tương tác xã hội** khiến người học dễ mất động lực và học tập mang tính cá nhân nhiều hơn là cộng đồng.

- Chưa tận dụng tối đa khả năng của **đa phương tiện** (multimedia) để hỗ trợ kỹ năng nghe và viết.

- Chưa có sự kết hợp giữa yếu tố **mạng xã hội** và **học tập ngôn ngữ**, trong khi các nghiên cứu đã chỉ ra rằng học tập cộng đồng giúp người học duy trì thói quen lâu dài và đạt kết quả tốt hơn (Vygotsky, 1978) [2]. Chính vì vậy, việc **xây dựng một nền tảng mạng xã hội hỗ trợ học tập tiếng** **Anh và giao tiếp đa phương tiện** là cần thiết. Nền tảng này không chỉ mang đến môi trường học tập cộng đồng, mà còn cung cấp các công cụ thực hành tiếng Anh một cách đa dạng và sinh động.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 1.2 Mục tiêu đề tài

Đề tài hướng đến việc xây dựng một nền tảng tích hợp giữa mạng xã hội và công cụ học tập tiếng Anh, nhằm tạo ra môi trường học tập năng động, thực tế và gắn kết cộng đồng. Các mục tiêu cụ thể:

- Xây dựng hệ thống quản lý tài khoản và hồ sơ học tập cá nhân.

- Phát triển các chức năng học tập: luyện viết câu/đoạn văn, luyện nói, quản lý và ôn tập từ vựng.

- Tích hợp các tính năng xã hội: kết bạn, đăng bài, bình luận, chia sẻ, tương tác.

- Cung cấp công cụ giao tiếp đa phương tiện: nhắn tin, gọi thoại, gọi video thời gian thực.

- Xây dựng hệ thống bảng xếp hạng và điểm thưởng để tạo động lực học tập.

- Xây dựng chức năng quản trị hệ thống cho admin: quản lý người dùng, giám sát nội dung và xử lý vi phạm.

### 1.3 Phạm vi đề tài

**Đối tượng sử dụng:** Sinh viên, người đi làm và cá nhân có nhu cầu rèn luyện tiếng Anh ở mức cơ bản đến nâng cao. **Phạm vi chức năng:**

- Bao gồm: quản lý tài khoản, chia sẻ bài học, tương tác mạng xã hội, quản lý từ vựng, nhắn tin - gọi điện, bảng xếp hạng, chức năng quản trị hệ thống.

- Không bao gồm: các khóa học chứng chỉ tiếng Anh (IELTS, TOEIC…), hệ thống chấm điểm chuẩn hóa theo chuẩn quốc tế, hoặc tích hợp trí tuệ nhân tạo nâng cao (ví dụ: đánh giá phát âm chi tiết như trong ứng dụng chuyên biệt).

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 1.4 Mô tả yêu cầu chức năng

Người dùng:

- Quản lý tài khoản: đăng ký, đăng nhập, xác thực, cập nhật thông tin cá nhân.

- Học tập:

- Luyện viết dịch thuật theo chủ đề (câu, đoạn văn)

- Luyện nghe chép chính tả theo chủ đề

- Luyện nói theo câu

- Quản lý từ vựng cá nhân (thêm, xóa, sửa từ vựng)

- Ôn luyện từ vựng (quiz, spaced repetition)

- Mạng xã hội: đăng bài viết, bình luận, thích, chia sẻ, kết nối bạn bè.

- Giao tiếp đa phương tiện: nhắn tin thời gian thực, gọi thoại và video call. Admin:

- Quản lý người dùng: xem danh sách, khóa/mở tài khoản, xử lý báo cáo vi phạm.

- Quản lý hệ thống: giám sát hoạt động, thống kê lượt truy cập và khiếu nại.

- Quản lý học tập: quản lý cá bài tập (luyện viết, luyện nghe, luyện nói), các thành tích.

### 1.5 Các ràng buộc và quy tắc quản lý

- Hệ thống chỉ hỗ trợ nền tảng web và ứng dụng di động (Android).

- Số lượng người dùng giai đoạn đầu dự kiến < 1000.

- Không triển khai AI nâng cao (như chấm điểm phát âm chi tiết).

- Hệ thống phải đảm bảo tính bảo mật: tất cả mật khẩu được mã hóa.

### 1.6 Mô tả yêu cầu phi chức năng

Ngoài các yêu cầu chức năng, hệ thống cần đáp ứng các yêu cầu phi chức năng nhằm đảm bảo tính ổn định, hiệu quả và an toàn khi vận hành:

- Hiệu năng: Thời gian phản hồi < 3 giây cho các thao tác thông thường.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- Bảo mật: Dữ liệu cá nhân được mã hóa, xác thực 2 lớp (2FA). - Khả năng mở rộng: Hệ thống được xây dựng theo kiến trúc client-server.

Khi quy mô người dùng tăng, cần theo dõi tải hệ thống để có kế hoạch nâng cấp hạ tầng kịp thời

- Khả dụng: Đảm bảo thời gian hoạt động tối thiểu 90% trong giai đoạn

vận hành.

- Trải nghiệm người dùng: Giao diện thân thiện, dễ sử dụng.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
