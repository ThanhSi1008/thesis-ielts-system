# CHƯƠNG 5: KẾT LUẬN

### 5.1 Kết quả đạt được

Sau quá trình nghiên cứu và triển khai, nhóm đã hoàn thành việc xây dựng nền tảng mạng xã hội hỗ trợ học tập tiếng Anh đa phương tiện với các kết quả chi tiết như sau:

#### 5.1.1 Về mặt công nghệ và kiến trúc hệ thống

Triển khai đa nền tảng đồng bộ và vận hành ổn định trên cả hai nền tảng:

- Website: Sử dụng Next.js giúp tối ưu hóa SEO và tốc độ tải trang (Server Side Rendering), mang lại trải nghiệm mượt mà cho người dùng máy tính.

- Mobile App: Ứng dụng React Native đảm bảo tính tương thích cao trên cả hệ điều hành iOS và Android, cho phép người dùng học tập linh hoạt mọi lúc mọi nơi. Ứng dụng Trí tuệ nhân tạo (AI) chuyên sâu:

- Tích hợp thành công Gemini API để xây dựng "trợ lý ảo" thông minh. Hệ thống không chỉ tạo bài tập tự động (Writing, Sepaking, Listening) dựa trên trình độ người học mà còn có khả năng chấm điểm và phản hồi chi tiết cho các bài luận (Writing), (Listening) và bài nói (Speaking).

- Đặc biệt, tính năng Roleplay AI cho phép người dùng thực hành hội thoại theo các ngữ cảnh cụ thể (công sở, du lịch, đời sống…) với phản hồi thời gian thực, giúp cải thiện phản xạ giao tiếp. Hệ thống giao tiếp thời gian thực (Real-time Communication):

- Sử dụng Socket.IO để xây dựng hệ thống nhắn tin (Chat) và thông báo (Notification) tức thì, đảm bảo độ trễ thấp (<100ms) trong việc truyền tải dữ liệu giữa các người dùng.

- Tích hợp ZegoCloud cung cấp giải pháp gọi thoại (Voice Call) và gọi video (Video Call) chất lượng HD ổn định, hỗ trợ đắc lực cho việc luyện tập giao tiếp 1-1 hoặc thảo luận nhóm.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 5.1.2 Về mặt chức năng nghiệp vụ

Hệ sinh thái học tập toàn diện:

- Cung cấp đầy đủ công cụ rèn luyện 3 kỹ năng: Nghe (Listening), Nói (Speaking), Viết (Writing).

- Hệ thống quản lý từ vựng cá nhân thông minh áp dụng phương pháp Lặp lại ngắt quãng (Spaced Repetition), tự động nhắc nhở người dùng ôn tập các từ vựng vào thời điểm vàng để tối ưu hóa khả năng ghi nhớ. Môi trường mạng xã hội gắn kết: Xây dựng thành công các tính năng tương tác xã hội như: Kết bạn, Theo dõi (Follow), Đăng bài chia sẻ kiến thức (Post), Bình luận và Thả cảm xúc. Điều này tạo ra một cộng đồng học tập sôi nổi, giúp người dùng duy trì động lực thông qua việc chia sẻ thành tựu và học hỏi lẫn nhau. Cơ chế Gamification (Trò chơi hóa):

- Hệ thống bảng xếp hạng (Leaderboard) được cập nhật theo thời gian thực dựa trên điểm số học tập.

- Tính năng Chuỗi ngày học (Streak) và hệ thống tiền tệ ảo (Snowflake) khuyến khích người dùng duy trì thói quen học tập hàng ngày để nhận phần thưởng và đổi lấy các tính năng nâng cao. Phân hệ quản trị (Admin Dashboard):

- Cung cấp cái nhìn tổng quan về sức khỏe hệ thống thông qua các biểu đồ thống kê trực quan về lượng người dùng mới, doanh thu, tần suất sử dụng bài tập.

- Các công cụ quản lý nội dung (CMS) và quản lý người dùng hoạt động hiệu quả, giúp admin dễ dàng kiểm duyệt nội dung xấu và xử lý các báo cáo vi phạm.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 5.2 Hạn chế của đồ án

Mặc dù hệ thống đã đáp ứng được các yêu cầu cơ bản và nâng cao, tuy nhiên đề tài vẫn còn tồn tại một số hạn chế nhất định:

- Độ trễ của tính năng AI: Việc tích hợp Gemini API đôi khi gặp độ trễ trong phản hồi (latency) khi tạo bài tập hoặc chấm điểm hội thoại thời gian thực, đặc biệt vào giờ cao điểm, gây ảnh hưởng nhỏ đến trải nghiệm người dùng liền mạch. Ngoài ra vì là dùng mã nguồn mở miễn phí của Google nên lượt request sẽ bị hạn chế.

- Dữ liệu huấn luyện và ngữ cảnh: Mặc dù AI đã hỗ trợ tốt, nhưng các tình huống hội thoại (Roleplay) đôi khi còn mang tính máy móc, chưa thực sự tự nhiên như giao tiếp với người bản xứ trong các ngữ cảnh phức tạp.

- Khả năng chịu tải: Hệ thống hiện tại mới chỉ được kiểm thử ở quy mô nhỏ (dưới 1.000 người dùng theo ràng buộc thiết kế ban đầu). Hiệu năng xử lý realtime của Socket.IO và database khi lượng người dùng đồng thời (CCU) tăng đột biến chưa được kiểm chứng thực tế trên quy mô lớn.

- Tính năng thanh toán: Chức năng thanh toán hiện tại mới chỉ dừng lại ở mức tích hợp cơ bản (Sepay/quét mã QR), chưa tích hợp sâu các cổng thanh toán quốc tế (Visa/Mastercard) để thuận tiện cho người dùng toàn cầu.

- Tính năng luyện viết câu và làm bài kiểm tra điểm đầu vào: Hiện tại do bị giới hạn về thời gian và nhân lực nên chưa thể hoàn thiện các chức năng trên.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 5.3 Hướng phát triển

Dựa trên những kết quả đạt được và các hạn chế nêu trên, nhóm đề xuất các hướng phát triển trong tương lai để hoàn thiện sản phẩm:

- Tối ưu hóa AI và Machine Learning: Tinh chỉnh (Fine-tune) mô hình AI chuyên biệt cho việc dạy tiếng Anh để giảm độ trễ và tăng độ chính xác trong việc chấm lỗi ngữ pháp, phát âm. Ngoài ra còn phát triển tính năng "Voice Cloning" để AI có giọng đọc tự nhiên hơn hoặc mô phỏng giọng của người nổi tiếng, tạo hứng thú cho người học.

- Nâng cấp hạ tầng kỹ thuật: Triển khai kiến trúc Microservices để tách biệt các module (Social, Learning, Notification …) giúp hệ thống dễ dàng mở rộng (Scale-up). Sử dụng Caching (như Redis) để tăng tốc độ tải trang và giảm tải cho Database chính.

- Mở rộng tính năng làm bài kiểm tra và luyện viết câu: Tính năng làm bài kiểm tra là để giúp mỗi người dùng đánh giá mức năng lực hiện tại của bản thân trước khi bước vào sân chơi học tập của hệ thống và sau mỗi 1 khoảng thời gian thì sẽ đánh giá lại mức năng lực hiện tại đã được cải thiện hơn bao nhiêu. Đối với luyện viết câu sẽ giúp người dùng cải thiện kỹ năng luyện viết theo từng câu riêng lẻ.

- Mở rộng tính năng cộng đồng (Gamification): Phát triển thêm tính năng “Phòng học trực tuyến” giữa 2 hoặc nhiều người, tạo cho mọi người không gian để phát triển khả năng giao tiếp, học hỏi cũng như làm quen với nhiều bạn bè quốc tế. Ngoài ra sẽ tổ chức các sự kiện định kì và livestream bài giảng từ giáo viên.

- Thương mại hóa sản phẩm: Hoàn thiện quy trình thanh toán tự động. Phát triển các gói Premium mới với các tính năng nâng cao như: Lộ trình học 1-1 với AI không giới hạn, phân tích sâu các chỉ số tiến bộ, và loại bỏ quảng cáo.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- Phát hành ứng dụng: Đưa ứng dụng lên các kho tải chính thức (Google Play và Apple App Store) để tiếp cận rộng rãi đối tượng người dùng thực tế.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
