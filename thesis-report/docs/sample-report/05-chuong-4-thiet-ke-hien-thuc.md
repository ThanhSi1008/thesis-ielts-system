# CHƯƠNG 4: THIẾT KẾ VÀ HIỆN THỰC

### 4.1 Sơ đồ lớp

Hình 4.1 Sơ đồ lớp mà social và cá nhân hóa

Hình 4.2 Sơ đồ lớp phần learning

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 4.2 Sơ đồ cơ sở dữ liệu

#### 4.2.1 Sơ đồ cơ sở dữ liệu có cấu trúc

Hình 4.3 Sơ đồ cơ sở dữ liệu Social có cấu trúc (SQL)

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.4 Sơ đồ cơ sở dữ liệu Learning có cấu trúc (SQL)

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.2.2 Sơ đồ cơ sở dữ liệu không có cấu trúc

Hình 4.5 Sơ đồ cơ sở dữ liệu không có cấu trúc (NoSQL)

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.6 Sơ đồ kiến trúc hệ thống

### 4.3 Sơ đồ kiến trúc phần mềm

Hệ thống Social-Learning được xây dựng theo mô hình Client-Server với các thành phần chính như sau:

- Client (Phía người dùng): Triển khai đa nền tảng gồm Website (sử dụng Next.js) và Mobile App (sử dụng React Native), cho phép truy cập linh hoạt trên cả iOS, Android và trình duyệt web.

- Server (Phía máy chủ): Vận hành trên nền tảng Node.js với framework Express.js, cung cấp RESTful API để xử lý các yêu cầu từ Client.

- Cơ sở dữ liệu (Database): Sử dụng mô hình lai kết hợp Supabase (PostgreSQL) để lưu trữ dữ liệu có cấu trúc (người dùng, bài đăng) và MongoDB cho dữ liệu phi cấu trúc (lịch sử tin nhắn).

- Dịch vụ tích hợp (3rd Party Services):

- AI: Tích hợp Gemini API để sinh bài tập và chấm điểm tự động.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- Giao tiếp thời gian thực: Sử dụng Socket.IO cho tính năng chat/thông báo và ZegoCloud cho gọi video/thoại.

- Lưu trữ: Sử dụng Cloudinary và Supabase Storage để quản lý hình ảnh và video.

### 4.4 Sơ đồ luồng màn hình

#### 4.4.1 Sơ đồ luồng màn hình website

Hình 4.7 Luồng màn hình website

#### 4.4.2 Sơ đồ luồng màn hình mobile

Hình 4.8 Luồng màn hình mobile

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 4.5 Giao diện chương trình

#### 4.5.1 Giao diện trang chủ

Trang chủ Social Learning được thiết kế thân thiện và mang phong cách mạng xã hội, giúp người dùng dễ dàng điều hướng. Khi truy cập, người dùng sẽ thấy ngay các nút Đăng nhập, Đăng ký, cùng hai nút Tham gia ngay và Học thử để khuyến khích trải nghiệm nhanh. Giao diện hỗ trợ chuyển đổi ngôn ngữ Anh – Việt với biểu tượng học tiếng Anh. Bên dưới là phần giới thiệu ngắn gọn các tính năng nổi bật, giúp người dùng hiểu tổng quan về hệ thống.

Hình 4.9 Giao diện trang chủ

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.2 Giao diện người dùng chính

Sau khi đăng nhập thành công vào hệ thống thì sẽ hiển thị ra giao diện người dùng chính (Newsfeed). Bên trái sẽ là nơi điều hướng đến các tính năng chính có trong hệ thống. Bên phải hiển thị điểm số học tập của người dùng, mô tả sơ lượt về cấp độ hiện tại, bài viết đã đăng tải, người theo dõi và đang theo dõi, gợi ý kết bạn dựa theo các tiêu chí phù hợp nhất. Ở giữa, trên cùng sẽ hiển thị chuỗi ngày hoạt động của người dùng và nhắc nhở học tập nếu ngày đó người dùng chưa luyện tập. Ở trung tâm sẽ là newsfeed, nơi đăng tải các bài viết mới nhất của tất cả người dùng.

Hình 4.10 Giao diện người dùng chính

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.3 Giao diện tin nhắn

Ở giao diện này thì người dùng có thể tìm kiếm bạn bè để nhắn tin, trò chuyện hoặc tạo các nhóm chat để hỗ trợ cùng nhau học tập. Tin nhắn sẽ luôn được gửi real-time mà không cần phải load lại trang. Ngoài ra, khi ở 1 trang khác thì vẫn sẽ hiển thị thông báo real-time cho người dùng biết là có người đang nhắn tin.

Hình 4.11 Giao diện tin nhắn khi mới click vào

Khi chọn nhắn tin với 1 người thì sẽ hiển thị xem người đó có online hoặc đã offline được bao lâu. Góc trái trên cùng sẽ là chi tiết cuộc hội thoại và nút “Gọi”, ở nút “Gọi” này nếu người dùng đang offline mà nhấn “Gọi” thì hệ thống sẽ hiển thị không thể gọi còn nếu người nhận đang online thì hệ thống sẽ gửi thông báo real time rằng có người đang gọi. Bên dưới là các tính năng cơ bản như gửi tin nhắn text, voice, gửi file hoặc icon. Ngoài ra còn có thả react tin nhắn, replay tin nhắn, thu hồi, xóa, hiển thị trạng thái người nhận đã xem hay chưa.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.12 Giao diện nhắn tin với bạn bè

Ở giao diện nhóm chat cũng có các chức năng tương tự như nhắn tin cá nhân, nhưng đối với trưởng nhóm thì có thể quản lí như việc thêm, xóa thành viên, đổi trưởng nhóm… Hiển thị trong nhóm có người đang online hay không và ở nút “Gọi” chỉ cần 1 người khác trong nhóm đang online thì sẽ gọi được nếu không có ai online sẽ thông báo không thể gọi.

Hình 4.13 Giao diện nhắn tin nhóm

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.4 Giao diện trang cá nhân

Nơi lưu giữ các thông tin cá nhân của người dùng, có thể xem các bài viết của mình, danh sách người theo dõi và đang theo dõi và cập nhật thông tin cá nhân.

Hình 4.14 Giao diện trang cá nhân của người dùng

#### 4.5.5 Giao diện luyện viết

Đây là bước đầu tiên trong quá trình luyện viết. Người dùng chọn năng lực phù hợp với bản thân và thể loại văn bản muốn luyện viết.

Hình 4.15 Giao diện luyện viết (Chọn Level & Topic)

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Tiếp theo, sau khi chọn được mức năng lực và thể loại phù hợp thì sẽ hiển thị modal để người dùng chọn chế độ tạo bằng AI hoặc có sẵn trên hệ thông. Với chế độ AI thì người dùng bắt buộc phải bỏ ra 2 bông tuyết (điểm thưởng) mới có thể dùng được.

Hình 4.16 Chọn chế độ luyện viết

Khi người dùng chọn “Bắt đầu” thì hệ thống sẽ cho người dùng lựa chọn bài viết dựa trên thể loại đã chọn. Ở đây, nếu người dùng chưa làm 1 bài viết thì bài viết đó sẽ hiển thị nút “Bắt đầu” và chưa có tiến độ hoàn thành và nếu người dùng đã luyện qua nhưng chưa hoàn thành toàn bộ thì sẽ lưu lại tiến độ và sẽ hiển thị thành nút “Tiếp tục”.

Hình 4.17 Danh sách bài viết

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Giao diện luyện viết cung cấp một đoạn văn tiếng Việt để người dùng viết lại bằng tiếng Anh theo hiểu biết của mình. Người dùng có thể dùng nút Gợi ý (tốn điểm thưởng) để nhận định hướng viết. Khi bấm Nộp bài, hệ thống sẽ chấm, đưa ra gợi ý cải thiện và lưu lại lịch sử làm bài nếu chưa hoàn thành.

Hình 4.18 Giao diện trước khi làm bài viết

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Sau khi làm bài xong và nhấn “Nộp bài” hệ thống sẽ kiểm tra đáp án của người dùng và đưa ra kết luận, gợi ý, sửa lỗi cho người dùng. Ngoài ra sẽ chấm điểm dựa vào trình độ ôn luyện (chọn level càng cao điểm càng cao) và số lần làm bài (làm càng nhiều lần số điểm càng ít).

Hình 4.19 Giao diện sau khi làm bài viết

#### 4.5.6 Giao diện luyện nghe

Tương tự như luyện viết, sẽ có các bước chọn trình độ và thể loại muốn học, sau đó chọn chế độ và bài tập muốn nghe. Sau đó hệ thống sẽ tạo ra bài nghe phù hợp với người dùng. Ở giao diện luyện nghe sẽ có các nút play, pause, tiến, lùi 5 giây, tăng, giảm âm lượng, tăng, giảm tốc độ nói. Bên dưới sẽ là đoạn văn tương ứng với bài nghe nhưng bị trống 1 vài chỗ để người dùng có thể nghe và điền vào ô còn thiếu và đặc điểm nổi bật trong đoạn văn bị đục lỗ chính là số lượng dấu nháy (_) tương ứng với số lượng từ cần điền vào. Bên dưới sẽ là các nút “Thoát” nếu

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

người dùng muốn học bài mới, “Gợi ý” sẽ tự động điền vào ô trống nếu người dùng không biết đáp án nhưng phải dùng điểm thưởng để sử dụng, “Kiểm tra” hệ thống sẽ đánh giá từ mà người dùng điền vào là đúng hay sai và cũng sử dụng điểm thưởng để đổi, “Nộp bài” sau khi hoàn thành điền từ nhấn nộp bài và hệ thống sẽ kiểm tra đáp án và đưa ra kết luận. Bên phải là phần thống kê tổng quan về lịch sử làm bài, số lần nộp bài, điểm số cao nhất đạt được, tỷ lệ hoàn thành và 1 đoạn hướng dẫn cách sử dụng.

Hình 4.20 Giao diện luyện nghe

#### 4.5.7 Giao diện luyện nói

Ở luyện nói được chia ra thành 2 loại khác nhau: Luyện nói cá nhân và Luyện nói với AI. Ở luyện nói cá nhân thì có thể chọn bài nghe từ hệ thống hoặc tạo bởi AI còn với loại luyện nói với AI được chia thành 2 loại nhỏ là hội thoại được tạo sẵn ngữ cảnh, người dùng chỉ cần chọn vai trò để nói và trò chuyện theo văn bản được tạo sẵn, loại còn lại là hội thoại real-time, người dùng cũng chọn vai trò để nói nhưng không có văn bản tạo sẵn mà người dùng sẽ trực tiếp trò chuyện trong vai trò được chọn trước đó với AI (đóng vai trò còn lại). Tương tự như luyện nói và luyện viết, phải sử dụng 2 bông tuyết để sử dụng tính năng AI.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.21 Giao diện chọn loại bài nói

Giao diện luyện nói cá nhân cung cấp 10 câu mẫu dựa trên trình độ và chủ đề đã chọn. Người dùng xem tiến độ, nghe mẫu qua nút Nghe mẫu, và bấm Bắt đầu để ghi âm. Danh sách câu giúp theo dõi vị trí hiện tại và yêu cầu hoàn thành từng câu theo thứ tự. Bên dưới hiển thị kết quả so sánh giữa câu nói của người dùng và đáp án, từ đó hệ thống đánh giá đúng sai.

Hình 4.22 Giao diện làm bài luyện nói cá nhân

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Tiếp theo là hội thoại với AI được tạo sẵn ngữ cảnh, trước khi bắt đầu thì hệ thống sẽ cho người dùng lựa chọn vai trò trong cuộc trò chuyện ( ví dụ: người hỏi, người phản hồi…). Sau đó sẽ đến phần luyện nói, người dùng chỉ cần phát âm đúng theo mẫu được cung cấp sẵn và hệ thống sẽ đánh giá phát âm của người dùng và trả về kết quả từ phát âm đúng, sai. Nếu phát âm sai sẽ lưu từ vựng đó vào database để làm dữ liệu tạo ra bộ từ vựng cá nhân. Ngoài ra còn có phần chỉnh tốc độ nói và giọng nói của AI để người dùng có thể nghe được đa dạng nhiều giọng hơn.

Hình 4.23 Giao diện luyện nói với AI (1)

Tiếp theo là hội thoại thời gian thực với AI, trước khi bắt đầu thì hệ thống sẽ cho người dùng lựa chọn vai trò trong cuộc trò chuyện. Sau đó sẽ đến với cuộc hội thoại, ở đây người dùng sẽ đóng vai thành người trong vai trò đã chọn trước đó và AI sẽ là người còn lại và nói theo những gì mình biết. Nếu người dùng không biết trả lời thì sẽ có nút “Gợi ý” để AI sẽ gợi ý câu nói cho người dùng, sau khi người dùng nói xong thì hệ thống sẽ tự động góp ý về câu trả lời của người dùng và cách cải thiện thêm. Về phía AI sẽ có nút nghe lại nếu người dùng muốn nghe lại và nút dịch nghĩa về tiếng việt cho người dùng hiểu được ý nghĩa câu văn đó. Sau khi hoàn thành hết tất cả, hệ thống sẽ tổng hợp lại dữ liệu và đưa ra góp ý chung (Đánh giá cuộc trò chuyện) bao gồm nhận xét chung về từ vựng, ngữ pháp, khả năng giao tiếp, lời khuyên, các từ vựng hữu ích nên học. Ngoài ra còn có phần chỉnh tốc độ nói và giọng nói của AI để người dùng có thể nghe được đa dạng nhiều giọng hơn.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.24 Giao diện luyện nói với AI (2)

#### 4.5.8 Giao diện từ vựng cá nhân

Ở giao diện này, mỗi người dùng sẽ có 1 bộ từ vựng cá nhân của riêng mình không ai không ai. Bộ từ vựng được thiết kế dựa trên khả năng học tập và rèn luyện của mỗi người. Hệ thống sẽ lọc ra các từ vựng dựa trên lỗi sai sau mỗi lần luyện tập của người dùng và khi lỗi của 1 từ đạt đến 5 lần sẽ thông báo cho người dùng biết là có 1 từ vựng mới vừa được thêm vào bộ từ vựng cá nhân. Trong bộ từ vựng sẽ được chia ra thành 3 loại: Tổng quan (là những từ vựng mà người dùng chưa thông thạo hoàn toàn 0-99%); Đã thành thạo (là những từ mà người dùng đã luyện tập thành thạo 100% và đang chờ luyện tập để tốt nghiệp từ vựng); Theo chủ đề (là các từ vựng sẽ được phân chia thành các chủ đề để người dùng có thể lựa chọn học tập tùy ý).

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.25 Giao diện từ vựng cá nhân

Khi click vào 1 trong 3 thẻ bất kì ở Tổng quan sẽ hiển thị ra chi tiết các danh sách từ của người dùng đang ở trong khoảng thông thạo đã chọn. Ở đây, trung tâm sẽ là 1 thẻ từ gồm từ tiếng anh và nghe mẫu ở mặt trước, khi click vào sẽ hiển thị ra mặt sau chứa nghĩa tiếng Việt của từ đó và có các nút để xem các từ tiếp theo trong bộ từ vựng. Bên dưới là thanh tìm kiếm, người dùng có thể nhập hoặc chọn theo chữ cái đầu tiên của mỗi từ. Dưới thanh tìm kiếm là danh sách các từ được hiển thị dưới dạng card, mỗi card sẽ có từ và nghĩa, nghe mẫu, độ thông thạo hiện tại và nút checkbox. Khi click vào nút checkbox sẽ show ra 1 modal hiển thị từ đã chọn để luyện tập (có thể chọn được nhiều từ). Khi nhấn luyện tập sẽ tạo ra bài tập dựa vào các từ đã chọn, ngoài ra khi click trực tiếp vào card sẽ hiển thị ra chi tiết về từ vựng đó.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 4.26 Giao diện từ vựng ở Tổng quan

Khi click trực tiếp vào card thì sẽ hiển thị chi tiết về từ vựng đó. Bao gồm: loại từ, từ đồng nghĩa, trái nghĩa… ngoài ra còn có mô tả và câu ví dụ.

Hình 4.27 Giao diện chi tiết từ vựng

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.9 Giao diện lộ trình học tập

Ở giao diện này, người dùng có thể tạo lộ trình học tập cá nhân dựa vào các đầu vào mà hệ thống sẽ cho người dùng chọn hoặc nhập, ngoài ra còn dựa vào dữ liệu học tập cá nhân của người dùng trên hệ thống để tạo ra 1 lộ trình phù hợp.

Hình 4.28 Giao diện lộ trình học tập

Trong chi tiết lộ trình sẽ hiển thị ra các nội dung cần luyện tập trong mỗi tuần và phải hoàn thành tất cả các mục tiêu của tuần mới được qua tuần tiếp theo.

Hình 4.29 Giao diện chi tiết lộ trình học tập

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.10 Giao diện thanh toán

Hệ thống hỗ trợ các gói học tập nâng cao và điểm thưởng cho người dùng bằng việc thanh toán trực tuyến qua hệ thống. Sau khi hoàn thành sẽ được nhận các ưu đãi học tập tương ứng.

Hình 4.30 Giao diện thanh toán

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.5.11 Giao diện admin

Hệ thống hỗ trợ cho admin quản lí các thông tin tổng quan của người dùng và hỗ trợ trong việc quản lí tài khoản, các bài học mới… Giúp cải thiện và tạo ra các bài tập chất lượng hơn.

Hình 4.31 Giao diện admin

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 4.6 Kiểm thử hệ thống

#### 4.6.1 Danh sách các test-case

Bảng 4.1 Danh sách test case

|ID|Chức<br>năng|Mô tả|Tiền điều<br>kiện|Tình huống test|Kết quả mong<br>muốn|
|---|---|---|---|---|---|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|**_Tình_**<br>**_huống_**<br>**_1:_ **|<br> <br> <br>Thông báo tên tài<br>khoản không hợp<br>lệ.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br> <br>Người dùng nhập tên<br>tài khoản có kí tự<br>đặc biệt.|<br> <br> <br>Người dùng nhập tên<br>tài khoản có kí tự<br>đặc biệt.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|**_Tình_**<br>**_huống_**<br>**_2:_**|<br> <br> <br>Thông báo email<br>không hợp lệ.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br> <br> <br>Người<br>dùng<br>nhập<br>email không đúng<br>định dạng.|<br> <br> <br> <br>Người<br>dùng<br>nhập<br>email không đúng<br>định dạng.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br>**_Tình_**<br>**_huống_**<br>**_3:_**|<br> <br> <br>Thông báo mật<br>khẩu phải ít nhất<br>8 kí tự.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br> <br> <br> <br> <br>Người<br>dùng<br>nhập<br>mật khẩu ít hơn 8 kí<br>tự.|<br> <br> <br> <br> <br> <br>Người<br>dùng<br>nhập<br>mật khẩu ít hơn 8 kí<br>tự.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|**_Tình_**<br>**_huống_**<br>**_4:_**|<br> <br> <br>Chuyển đến trang<br>nhập OTP nhưng<br>không có OTP để<br>xác thực.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br> <br>Người<br>dùng<br>nhập<br>không đúng email<br>mình sở hữu.|<br> <br> <br>Người<br>dùng<br>nhập<br>không đúng email<br>mình sở hữu.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|**_Tình_**<br>**_huống_**<br>**_5:_**|<br> <br> <br>Chuyển đến trang<br>nhập OTP và có<br>thông báo OTP để<br>xác thực.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|<br> <br> <br> <br> <br>Người dùng <br>chưa có tài<br>khoản, đang<br>ở trang Đăng<br>ký.|<br> <br> <br>Người<br>dùng<br>nhập<br>đúng email mình sở<br>hữu.|<br> <br> <br>Người<br>dùng<br>nhập<br>đúng email mình sở<br>hữu.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|Đã xác nhận<br>email thành<br>công và đang<br>ở trang nhập|<br> <br> <br>**_Tình huống 6:_** Nhập<br>sai OTP nhận từ<br>email.|<br> <br>Thông báo OTP<br>không chính xác.|
|TC01|<br>Đăng<br>ký|Người dùng<br>nhập thông<br>tin để đăng<br>kí tài khoản<br>trên<br>hệ<br>thống.|Đã xác nhận<br>email thành<br>công và đang<br>ở trang nhập|<br>**_Tình huống 7:_** Đợi|Thông báo OTP|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|Col3|mã OTP.|sau 60 giây mới nhập<br>OTP.|không hợp lệ.|
|---|---|---|---|---|---|
||||mã OTP.|**_Tình huống 8:_** Nhập<br>đúng OTP nhận từ<br>email.|<br> <br>Thông báo đăng<br>kí thành công và<br>chuyển đến trang<br>đăng nhập.|
|TC02|<br>Đăng<br>nhập|Người dùng<br>nhập email,<br>password để<br>vào<br>hệ<br>thống.|<br> <br> <br> <br>Tài khoản đã<br>tồn tại, đang<br>ở trang Đăng <br>nhập.|**_Tình huống 1:_ **Nhập<br>đúng email, nhập sai<br>mật khẩu.|<br> <br>Thông báo đăng<br>nhập thất bại.|
|TC02|<br>Đăng<br>nhập|Người dùng<br>nhập email,<br>password để<br>vào<br>hệ<br>thống.|<br> <br> <br> <br>Tài khoản đã<br>tồn tại, đang<br>ở trang Đăng <br>nhập.|**_Tình huống 2:_ **Nhập<br>sai email, nhập đúng<br>mật khẩu.|<br> <br>Thông báo đăng<br>nhập thất bại.|
|TC02|<br>Đăng<br>nhập|Người dùng<br>nhập email,<br>password để<br>vào<br>hệ<br>thống.|<br> <br> <br> <br>Tài khoản đã<br>tồn tại, đang<br>ở trang Đăng <br>nhập.|<br> <br> <br>**_Tình huống 3:_ **Nhập<br>sai email, nhập sai<br>mật khẩu.|<br> <br>Thông báo đăng<br>nhập thất bại.|
|TC02|<br>Đăng<br>nhập|Người dùng<br>nhập email,<br>password để<br>vào<br>hệ<br>thống.|<br> <br> <br> <br>Tài khoản đã<br>tồn tại, đang<br>ở trang Đăng <br>nhập.|<br>**_Tình huống 4:_** Nhập<br>đúng<br>email,<br>nhập<br>mật khẩu ít hơn 8 kí<br>tự.|<br> <br> <br>Thông báo mật<br>khẩu phải lớn hơn<br>8 kí tự.|
|TC02|<br>Đăng<br>nhập|Người dùng<br>nhập email,<br>password để<br>vào<br>hệ<br>thống.|<br> <br> <br> <br>Tài khoản đã<br>tồn tại, đang<br>ở trang Đăng <br>nhập.|**_Tình huống 5:_ **Nhập<br>đúng<br>email,<br>nhập<br>đúng mật khẩu..|<br> <br>Thông báo đăng<br>nhập thành công<br>và<br>chuyển<br>đến<br>trang Newsfeed.|
|TC03|<br>Tạo<br>bài<br>viết|Người dùng<br>đăng 1 bài<br>viết lên hệ<br>thống.|<br> <br> <br>Đăng<br>nhập<br>thành<br>công,<br>đang ở trang<br>Newsfeed.|<br> <br> <br>**_Tình huống 1:_** Chọn<br>đăng bài với văn bản<br>và nhập nội dung.|<br> <br>Thông báo đăng<br>bài thành công,<br>bài đăng xuất hiện<br>ngay<br>đầu<br>Newsfeed.<br>Dữ<br>liệu lưu vào bảng|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|Col3|Col4|Col5|posts.|
|---|---|---|---|---|---|
|||||**_Tình huống 2:_** Chọn<br>đăng bài với văn bản<br>và không nhập nội<br>dung.|<br> <br> <br>Thông báo nhập<br>nội<br>dung<br>hoặc<br>chọn file.|
|||||**_Tình huống 3:_** Chọn<br>đăng bài với hình<br>ảnh/video/file<br>và<br>nhập nội dung.|<br> <br> <br>Thông báo đăng<br>bài thành công,<br>file được upload<br>thành công lên<br>storage, bài đăng<br>xuất hiện ngay<br>đầu<br>Newsfeed.<br>Dữ liệu lưu vào<br>bảng posts.|
|||||**_Tình huống 4:_** Chọn<br>đăng bài với hình<br>ảnh/video/file<br>và<br>không<br>nhập<br>nội<br>dung.|<br> <br> <br> <br>Thông báo đăng<br>bài thành công,<br>file được upload<br>thành công lên<br>storage, bài đăng<br>xuất hiện ngay<br>đầu<br>Newsfeed.<br>Dữ liệu lưu vào<br>bảng posts.|
|TC04|<br>Nhắn<br>tin|User A gửi<br>tin nhắn đến<br>User<br>B <br>thành công.|<br> <br> <br>Đăng<br>nhập<br>thành<br>công<br>và đang ở<br>trang<br>Tin<br>nhắn.|<br> <br> <br> <br>User A nhập tin nhắn<br>và nhấn “Gửi”.|<br>Tin nhắn hiện bên<br>phía User A ngay<br>lập tức. User B<br>hiển thị thông báo<br>và tin nhắn ngay<br>lập tức. Dữ liệu|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|Col3|Col4|Col5|được lưu vào<br>bảng messages.|
|---|---|---|---|---|---|
|TC05|<br>Thông<br>báo|Xem thông<br>báo<br>khi<br>người dùng<br>có<br>thông<br>báo mới.|<br> <br> <br> <br>Người dùng <br>đã đăng nhập<br>thành công.|**_Tình huống 1:_** Khi<br>có thông<br>báo từ<br>mạng xã hội, người<br>dùng click vào xem<br>và mở bài đăng.|<br> <br> <br> <br>Xem thông báo<br>thành công, hiển<br>thị trạng thái đã<br>đọc<br>và<br>chuyển<br>đến bài đăng.|
|TC05|<br>Thông<br>báo|Xem thông<br>báo<br>khi<br>người dùng<br>có<br>thông<br>báo mới.|<br> <br> <br> <br>Người dùng <br>đã đăng nhập<br>thành công.|<br>**_Tình huống 2:_** Khi<br>có thông báo học tập<br>“Có từ vựng mới cần<br>ôn”,<br>người<br>dùng<br>click vào xem và<br>chuyển đến trang chi<br>tiết từ vựng.|<br> <br> <br> <br> <br> <br>Xem thành công<br>từ vựng cần ôn,<br>hiển thị trạng thái<br>đã đọc và chuyển<br>đến trang chi tiết<br>từ vựng.|
|TC05|<br>Thông<br>báo|Xem thông<br>báo<br>khi<br>người dùng<br>có<br>thông<br>báo mới.|<br> <br> <br> <br>Người dùng <br>đã đăng nhập<br>thành công.|<br> <br>**_Tình huống 3:_** Khi<br>có thông báo học tập<br>“Đạt được thành tựu<br>mới”<br>hoặc<br>“Lên<br>cấp”,<br>người<br>dùng<br>click vào và hiển thị<br>thông<br>báo<br>chúc<br>mừng.|<br> <br> <br> <br> <br> <br> <br>Xem thông báo<br>thành<br>công<br>và<br>hiển thị trạng thái<br>đã đọc.|
|TC05|<br>Thông<br>báo|Xem thông<br>báo<br>khi<br>người dùng<br>có<br>thông<br>báo mới.|<br> <br> <br> <br>Người dùng <br>đã đăng nhập<br>thành công.|**_Tình huống 4:_** Khi<br>có thông báo học tập<br>“Ôn<br>tập<br>từ<br>cũ”,<br>người dùng click vào<br>và chuyển đến trang<br>làm bài tập.|<br> <br> <br> <br> <br>Xem thông báo<br>thành công, hiển<br>thị trạng thái đã<br>xem và đến trang<br>làm bài.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|TC06|Cập<br>nhật<br>thông<br>tin|Người dùng<br>cập nhật<br>thông tin cá<br>nhân.|Đăng nhập<br>thành công và<br>đang ở trang<br>cá nhân.|Tình huống 1: Nhập<br>biệt danh bất kì và<br>nhấn “Lưu”.|Thông báo<br>cập nhật<br>thành công.|
|---|---|---|---|---|---|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|**_Tình huống 2:_** Nhập<br>số điện thoại không<br>đủ 10 kí tự và nhấn<br>“Lưu”.|<br> <br> <br>Thông báo số<br>điện<br>thoại<br>không hợp lệ.|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|<br>**_Tình huống 3:_** Nhập<br>số điện thoại có chứa<br>số và nhấn “Lưu”.|<br> <br>Thông báo số<br>điện<br>thoại<br>không hợp lệ.|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|<br> <br> <br>**_Tình huống 4:_** Nhập<br>số điện thoại là số và<br>10 kí tự và nhấn<br>“Lưu”.|<br> <br> <br>Thông<br>báo<br>cập<br>nhật<br>thành công.|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|**_Tình huống 5:_** Nhập<br>địa chỉ là chỉ toàn số<br>và nhấn “Lưu”.|<br> <br>Thông<br>báo<br>địa chỉ không<br>hợp lệ.|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|**_Tình huống 6:_** Nhập<br>địa chỉ có kí tự đặc<br>biệt và nhấn “Lưu”.|<br> <br>Thông<br>báo<br>địa chỉ không<br>hợp lệ.|
|TC06|<br>Cập<br>nhật<br>thông<br>tin|Người<br>dùng <br>cập<br>nhật<br>thông tin cá<br>nhân.|<br> <br> <br>Đăng<br>nhập <br>thành công và<br>đang ở trang<br>cá nhân.|**_Tình huống 7:_** Nhập<br>địa chỉ đúng định<br>dạng và nhấn “Lưu”.|<br> <br>Thông<br>báo<br>cập<br>nhật<br>thành công.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|Col3|Col4|Tình huống 8: Nhập<br>tiểu sử bất kì và nhấn<br>“Lưu”.|Thông báo cập<br>nhật thành ông.|
|---|---|---|---|---|---|
|||||**_Tình huống 9:_** Chọn<br>ngày sinh lớn hơn ngày<br>hiện tại và nhấn “Lưu”.|<br> <br>Thông<br>báo<br>ngày<br>sinh<br>không hợp lệ.|
|||||**_Tình huống 10:_** Chọn<br>ngày sinh trong khoảng<br>năm hiện tại – 6 và nhấn<br>“Lưu”.|<br> <br> <br>Thông báo tuổi<br>bạn phải > 6.|
|||||**_Tình huống 11:_** Chọn<br>ngày sinh hợp lệ và nhấn<br>“Lưu”.|<br> <br>Thông báo cập<br>nhật<br>thành<br>công.|
|||||**_Tình huống 12:_** Không<br>nhập gì cả và nhấn<br>“Lưu”.|<br> <br>Thông<br>báo<br>không có thay<br>đổi nào để cập<br>nhật.|
|TC07|<br>Luyện<br>viết (Tạo<br>đề<br>với<br>AI)|<br> <br>Tạo bài<br>luyện<br>viết<br>bằng<br>AI.|<br>Người<br>dùng<br>đã đăng nhập<br>thành công và<br>đang ở trang<br>Luyện viết.|<br> <br> <br> <br>Chọn<br>Level:<br>"Intermediate".<br>Chọn<br>Topic:<br>"Environment".<br>Nhấn nút "Generate AI".<br>|<br> <br> <br> <br>Hệ thống gọi<br>Gemini<br>API<br>thành công.<br>Hiển thị đề bài<br>mới được AI<br>tạo ra đúng chủ<br>đề và trình độ<br>đã chọn.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|TC08|Luyện<br>viết (AI<br>chấm<br>điểm|Chấm<br>điểm bài<br>viết.|Đang ở màn hình<br>làm bài viết.|Nhập nội<br>dung bài<br>làm vào ô<br>text. Nhấn<br>"Nộp bài".|Hệ thống gửi nội dung<br>lên Gemini API để phân<br>tích. Hiển thị điểm số, lỗi<br>sai và lời khuyên chi tiết<br>từ AI. Kết quả lưu vào<br>lịch sử học tập.|
|---|---|---|---|---|---|
|TC09|<br>Luyện<br>nghe<br>(Điền<br>từ)|Chấm<br>điểm<br>luyện<br>nghe.|Đang ở màn hình<br>làm<br>bài<br>luyện<br>nghe.|<br> <br>Nghe<br>và<br>điền từ còn<br>thiếu vào ô<br>trống. Nhấn<br>nút “Nộp”.|<br> <br> <br> <br>Hệ thống so khớp đáp<br>án.<br>Highlight<br>xanh<br>(đúng) hoặc đỏ (sai) tại<br>các ô điền từ.|
|TC10|<br>Luyện<br>nói|Chấm<br>điểm<br>luyện<br>nói.|Đang ở màn hình<br>làm bài luyện nói<br>và đã cấp quyền<br>Microphone.|<br> <br> <br>Nhấn<br>nút<br>Micro<br>và<br>nói một câu<br>tiếng Anh.|<br> <br> <br>Hệ thống ghi nhận giọng<br>nói và chuyển thành văn<br>bản (Speech-to-Text). AI<br>phản hồi lại bằng văn<br>bản và chuyển thành âm<br>thanh (Text-to-Speech).<br>Hiển thị đánh giá phát<br>âm.<br>|
|TC11|<br>Tạo lộ<br>trình<br>học tập|<br>Tạo<br>lộ<br>trình học<br>tập<br>dựa<br>trên các<br>đầu vào.|<br> <br> <br> <br>Đang ở màn hình<br>Lộ trình học tập.|<br>Cung<br>cấp<br>dữ liệu đầu<br>vào đầy đủ<br>và<br>nhấn<br>“Tạo<br>lộ<br>trình”.|<br> <br> <br> <br> <br>Tạo lộ trình mới thành<br>công với đúng các kỹ<br>năng, và topic lesson<br>tương ứng với những lựa<br>chọn ở bước cung cấp dữ<br>liệu.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 4.6.2 Bảng báo cáo kết quả kiểm thử

Bảng 4.2 Báo cáo kết quả kiểm thử

|Test_ca<br>se type|Test_cas<br>e_ID|Dữ liệu đầu<br>vào|Kết quả mong<br>đợi|Trạng<br>thái<br>(Pass/<br>Fail)|Người<br>thực<br>hiện|Ngày thực<br>hiện|
|---|---|---|---|---|---|---|
|**Đăng kí (TC01)**|**Đăng kí (TC01)**|**Đăng kí (TC01)**|**Đăng kí (TC01)**|**Đăng kí (TC01)**|**Đăng kí (TC01)**|**Đăng kí (TC01)**|
|Invalid<br>Partition|TC01_01|User#Name!|Thông báo tên<br>tài<br>khoản<br>không hợp lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC01_02|user_email.co<br>m|Thông<br>báo<br>email<br>không<br>hợp lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC01_03|12345|Thông báo mật<br>khẩu phải có ít<br>nhất 8 kí tự.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC01_04|fake_email@g<br>mail.com|Không<br>nhận<br>được mã OTP<br>(Chờ quá lâu).|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Valid<br>partition|TC01_05|real_email@g<br>mail.com|Chuyển<br>đến<br>trang<br>nhập<br>OTP,<br>nhận<br>được email.|<br> <br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC01_06|OTP: 000000<br>(Sai)|<br>Thông<br>báo<br>OTP<br>không<br>chính xác.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC01_07|OTP: 123456<br>(Sau 60s)|<br>Thông<br>báo<br>OTP<br>không|<br> <br>Pass|Trương<br>Quốc|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|Col3|hợp lệ/hết hạn.|Col5|Bảo|Col7|
|---|---|---|---|---|---|---|
|Valid<br>partition|TC01_08|OTP: 123456<br>(Đúng)|<br>Đăng ký thành<br>công, chuyển<br>về Login.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|**Đăng nhập (TC02)**|
|Invalid<br>Partition|TC02_01|Email<br>đúng,<br>Pass sai|<br>Thông<br>báo<br>đăng nhập thất<br>bại.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC02_02|Email sai, Pass<br>đúng|<br>Thông<br>báo<br>đăng nhập thất<br>bại.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC02_03|Email sai, Pass<br>sai|<br>Thông<br>báo<br>đăng nhập thất<br>bại.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC02_04|Email<br>đúng,<br>Pass < 8 ký tự|<br>Thông báo mật<br>khẩu phải lớn<br>hơn 8 kí tự.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Valid<br>Partition|TC02_05|Email<br>đúng,<br>Pass đúng|<br>Đăng<br>nhập<br>thành<br>công,<br>vào Newsfeed.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Tạo bài viết (TC03)|Col2|Col3|Col4|Col5|Col6|Col7|
|---|---|---|---|---|---|---|
|Valid<br>Partition|TC03_01|Text:<br>"Hello<br>World"|<br>Thông<br>báo<br>“Đã tạo bài<br>viết<br>thành<br>công”.|<br> <br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|Invalid<br>Partition|TC03_02|Text:<br>""<br>(Rỗng)|<br>Thông<br>báo<br>“Vui<br>lòng<br>nhập nội dung<br>hoặc<br>chọn<br>file”.|<br> <br> <br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|Valid<br>Partition|TC03_03|Text:<br>"Ảnh<br>đẹp",<br>File:<br>img.jpg|<br> <br>Upload<br>file<br>thành<br>công,<br>bài đăng hiện<br>lên.|<br> <br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|Valid<br>Partition|TC03_04|Text:""(Rỗng),<br>File:<br>video.mp4|Upload<br>file<br>thành<br>công,<br>bài đăng hiện<br>lên.|<br> <br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|**Nhắn tin (TC04)**|
|Valid<br>Partition|TC04_01|Hero Nguyen<br>202 gửi "Hi"<br>cho<br>HeroNguyen|<br> <br>Hiển thị tin<br>nhắn đã gửi<br>“Hi”.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|**Thông báo (TC05)**|**Thông báo (TC05)**|**Thông báo (TC05)**|**Thông báo (TC05)**|**Thông báo (TC05)**|**Thông báo (TC05)**|**Thông báo (TC05)**|
|Valid<br>Partition|TC05_01|Click<br>thông<br>báo<br>Like/Comment|<br> <br>Chuyển<br>đến<br>bài đăng chi<br>tiết.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|Valid<br>Partition|TC05_02|Click<br>thông<br>báo Từ vựng|<br> <br>Chuyển<br>đến<br>chi<br>tiết<br>từ|<br> <br>Pass|Nguyễn<br>Thanh|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|mới|vựng|Col5|Thuận|Col7|
|---|---|---|---|---|---|---|
||TC05_03|Click<br>thông<br>báo Thành tựu|<br>Hiển thị chúc<br>mừng,<br>đánh<br>dấu đã đọc.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
||TC05_04|Click<br>thông<br>báo Ôn tập|<br>Chuyển<br>đến<br>trang làm bài<br>tập.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|**Cập nhật thông tin (TC06)**|
|Valid<br>Partition|TC06_01|Nickname:<br>"Superman"|Cập nhật thành<br>công.|<br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_02|SĐT:<br>"090123"<br>(thiếu số)|Thông báo số<br>điện<br>thoại<br>không hợp lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_03|SĐT:<br>"090abc"<br>(có<br>chữ)|<br>Thông báo số<br>điện<br>thoại<br>không hợp lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Valid<br>Partition|TC06_04|SĐT:<br>"0901234567"|Cập nhật thành<br>công.|<br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_05|Đ/c: "12345"<br>(toàn số)|<br>Thông báo địa<br>chỉ không hợp<br>lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_06|Đ/c:"@#$%"<br>(ký<br>tự<br>đặc<br>biệt)|<br>Thông báo địa<br>chỉ không hợp<br>lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Valid<br>Partition|TC06_07|Đ/c:<br>"TP.HCM"|Cập nhật thành<br>công.|<br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|TC06_08|Bio: "Yêu màu<br>hồng"|Cập nhật thành<br>công.|Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|---|---|---|---|---|---|---|
|Invalid<br>Partition|TC06_09|DOB:<br>01/01/2030|Thông<br>báo<br>ngày<br>sinh<br>không hợp lệ.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_10|DOB:<br>01/01/2023 (<<br>6 tuổi)|<br>Thông<br>báo<br>tuổi bạn phải ><br>6.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Valid<br>Partition|TC06_11|DOB:<br>01/01/2000|Cập nhật thành<br>công.|<br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|Invalid<br>Partition|TC06_12|Không<br>nhập/sửa gì cả|Thông<br>báo<br>không có thay<br>đổi.|<br> <br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|**Luyện viết AI (TC07)**|
|Valid<br>Partition|TC07_01|Level:<br>Beginer,<br>Topic: Email|Hiển thị đề bài<br>do AI tạo đúng<br>chủ đề.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|**Chấm điểm Viết (TC08)**|
|Valid<br>Partition|TC08_01|Submit<br>nội<br>dung bài làm|<br>Hiển thị điểm,<br>lỗi sai, gợi ý từ<br>AI.|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|
|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|**Luyện nghe (TC09)**|
|Valid<br>Partition|TC09_01|Điền<br>từ<br>và<br>nhấn Nộp|<br>Hiển thị điểm<br>số đạt được và<br>highlight<br>xanh/đỏ<br>cho<br>các ô.|<br> <br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Luyện nói (TC10)|Col2|Col3|Col4|Col5|Col6|Col7|
|---|---|---|---|---|---|---|
|Valid<br>Partition|TC10_01|Ghi âm giọng<br>nói|<br>AI phản hồi<br>(Text+Audio)<br>& đánh giá|<br>Pass|Trương<br>Quốc<br>Bảo|04/12/2025|
|**Lộ trình (TC11)**|**Lộ trình (TC11)**|**Lộ trình (TC11)**|**Lộ trình (TC11)**|**Lộ trình (TC11)**|**Lộ trình (TC11)**|**Lộ trình (TC11)**|
|Valid<br>Partition|TC11_01|Nhập<br>đủ<br>Skills, Topic,<br>Goal…|<br> <br>Tạo lộ trình<br>thành<br>công,<br>lưu vào CSDL|<br> <br>Pass|Nguyễn<br>Thanh<br>Thuận|04/12/2025|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
