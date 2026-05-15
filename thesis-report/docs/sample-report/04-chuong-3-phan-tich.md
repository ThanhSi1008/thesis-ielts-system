# CHƯƠNG 3: PHÂN TÍCH

### 3.1 Quy trình nghiệp vụ

Quy trình nghiệp vụ của hệ thống Social-Learning được xây dựng xoay quanh nhu cầu học tập và giao tiếp của người dùng. Thay vì chỉ đơn thuần học cá nhân, nền tảng tạo ra một không gian cộng đồng, nơi mọi người có thể vừa rèn luyện tiếng Anh, vừa kết nối, chia sẻ và hỗ trợ lẫn nhau. Cụ thể, quy trình hoạt động có thể hình dung như sau:

- **Bắt đầu từ tài khoản cá nhân:** Người dùng trước tiên cần đăng ký tài khoản thông qua email và xác thực tài khoản dựa trên mã OTP mà hệ thống đã gửi về email và sau khi xác thực thành công mới có thể tham gia hệ thống. Sau khi có tài khoản, người dùng có thể đăng nhập để tham gia vào cộng đồng và trong quá trình đăng nhập nếu người dùng nhập mật khẩu sai quá 5 lần thì hệ thống sẽ tự động khóa đăng nhập của tài khoản đó trong vòng 15 phút và nếu đăng nhập thành công thì người dùng có thể chính thức tham gia cộng đồng học tập. Ở trang cá nhân, người dùng có thể xem được cấp độ hiện tại được xét dựa trên điểm số học tập của mỗi người, danh sách các bài đăng của mình, số người theo dõi và đang theo dõi, có thể chỉnh sửa thông tin cá nhân như biệt danh, số điện thoại, địa chỉ… Ngoài ra còn có thể xem được tiến độ học bao gồm tổng số bài học đã học, điểm số trung bình, chuỗi ngày học, kỹ năng giỏi nhất, lịch sử hoạt động, điểm số mỗi kỹ năng được thống kê theo dạng biểu đồ để người dùng có thể so sánh trực quan về kỹ năng của mình và cuối cùng là thành tích khi người dùng học tập đạt điểm số nhất định thì hệ thống sẽ cấp cho danh hiệu và điểm thưởng.

- **Kết nối xã hội:** Khi đã có hồ sơ, người dùng có thể tìm kiếm bạn bè, gửi lời mời kết nối và theo dõi lẫn nhau, hệ thống cũng hỗ trợ tính năng gợi ý bạn bè dựa trên 1 số tiêu chí để giúp người học có thể nhanh tiến bộ hơn như là chỉ gợi ý các bạn bè có level bằng hoặc cao hơn và có bạn chung.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Người dùng cũng có thể đăng bài viết, chia sẻ hình ảnh, video hoặc tài liệu học tập lên cộng đồng. Các bài viết được đăng tải real-time sau đó sẽ được kiểm duyệt bởi admin để đảm bảo nội dung phù hợp. Ngoài ra, người dùng có thể bình luận, thích và thông báo sẽ được gửi real-time đến chủ nhân của bài đăng đó hoặc chia sẻ sang các nền tảng khác. Bên cạnh đó, người dùng còn có thể nhắn tin, gọi video trực tuyến với các bạn bè mình theo dõi hoặc đang theo dõi. Hệ thống cung cấp tính năng nhắn tin cá nhân và nhóm chat. Đặc biệt là có thể gọi điện trực tuyến với một hoặc nhiều người cùng 1 lúc giúp tăng tính tương tác xã hội nhiều hơn.

- **Hoạt động học tập:** Trên nền tảng này, người học có thể luyện kỹ năng viết. Cụ thể thì khi bắt đầu luyện tập hệ thống sẽ cho người dùng chọn trình độ ôn luyện (Cơ bản, Trung Cấp, Nâng cao) sau đó chọn thể loại bài muốn luyện viết và hệ thống sẽ cho người dùng chọn tạo bài viết bằng AI ( phải dùng 2 điểm thưởng để sử dụng tính năng này ) và tạo ra bài viết cho người dùng phù hợp với trình độ và thể loại mà người dùng đã chọn để người dùng làm bài và lưu trữ bài vừa tạo vào hệ thống ( mỗi người dùng sẽ có danh sách lưu trữ riêng ). Ngoài tạo bài bằng AI thì hệ thống cũng hỗ trợ 1 số bài tập viết có sẵn ( không tốn điểm thưởng ) và sẽ hiển thị các bài viết mà trước đó người dùng đã chọn tính năng tạo bằng AI để người dùng có thể ôn luyện tiếp tục, tức là khi người dùng đang trong quá trình luyện mà chưa hoàn thành bài viết thì có thể nộp bài và hệ thống sẽ lưu lại lịch sử bài làm đó để những lần sau khi người dùng vào học thì có thể tiếp tục phần bài tập còn đang luyện. Ở phần làm bài viết thì hệ thống sẽ cho 1 đoạn văn mẫu bằng tiếng việt và nhiệm vụ của người học là viết lại bài mẫu bằng tiếng anh, hệ thống sẽ hỗ trợ nút gợi ý cho người dùng nên viết như thế nào (dùng 2 điểm thưởng để sử dụng tính năng này), nếu dùng tính năng này thì sẽ bị trừ điểm vào điểm thực hành của người dùng. Khi người dùng muốn nộp bài nếu đã hoàn thành hoặc chưa thì hệ thống sẽ nhờ AI chấm điểm dựa vào bài mẫu tiếng việt và bài làm hiện tại của người dùng để cho ra kết quả chính xác nhất bao gồm điểm số (dựa vào

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

level bài tập mà người dùng chọn lần lược “Người mới bắt đầu”, “Trung cấp”, “Nâng cao” tương ứng với số điểm là 10, 20, 30. Ngoài ra, nếu đúng hoàn toàn trong lần nộp đầu tiên thì nhân 3 số điểm, đúng trong lần thứ 2 thì nhân 2 số điểm, mỗi lần sai cộng 2 điểm và tối đa 10 điểm cộng khi làm sai. Với điểm thưởng bông tuyết, tương ứng là 1, 2, 3 và cũng nhân điểm số như điểm, nếu sai thì không cộng điểm bông tuyết), độ chính xác, gợi ý, nhận xét tổng quan và sau đó hệ thống sẽ lưu kết quả và bài làm đó vào lịch sử làm bài của người dùng. Và đối với các lỗi sai chính tả từ vựng trong bài thì hệ thống sẽ lưu vào phần lỗi từ vựng của người dùng để hỗ trợ trong việc tạo bộ từ vựng cá nhân. Tiếp theo là luyện nghe thông qua bài tập nghe chép chính tả (điền từ vào ô trống), khi bắt đầu người dùng cũng sẽ chọn trình độ và thể loại, chế độ tạo bằng AI hoặc từ hệ thống có sẵn tương tự như luyện viết. Đối với chế độ tạo bằng AI sẽ tạo ra script, file audio và văn bản, sau đó lưu vào hệ thống cho người dùng có thể ôn luyện lại tương tự giống với luyện viết. Ở giao diện luyện nghe, hệ thống sẽ cho người dùng nghe bài nói (có thể tăng giảm tốc độ giọng nói, tua bài nghe) và điền từ còn thiếu vào chỗ trống trong văn bản với số lượng khoảng trắng trong mỗi ô trống bằng với số lượng kí tự của từ cần điền. Ngoài ra, hệ thống còn hỗ trợ nút gợi ý (dùng 2 điểm thưởng để sử dụng) khi sử dụng hệ thống sẽ cho 1 đáp án đúng bất kì trong bài nghe, nút kiểm tra ( dùng 1 điểm thưởng để sử dụng) để xem từ mình vừa ghi là đúng hay sai và nút nộp bài nếu người dùng đã hoàn thành tất cả hoặc chưa hoàn thành thì sẽ lưu lại lịch sử làm bài và hệ thống sẽ chấm điểm dựa trên số từ đúng, từ sai (điểm cộng và điểm thưởng bông tuyết tương ứng như bài tập luyện viết) và cho ra tiến độ hoàn thành của bài nghe đó. Và với các từ sai thì hệ thống cũng sẽ ghi nhận lại và lưu vào lỗi người dùng để hỗ trợ trong việc tạo bộ từ vựng cá nhân. Ở tính năng luyện nói người dùng cũng sẽ chọn trình độ và thể loại muốn nói giống với luyện nghe và luyện viết nhưng ở đây được phân thành 2

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

loại luyện nói là luyện nói cá nhân và luyện nói với AI. Đối với luyện nói cá nhân sẽ có 2 chế độ là tạo bài bằng AI (dùng 2 điểm thưởng để sử dụng) và bài có sẵn trên hệ thống. Với dạng bài tập này thì người dùng phải hoàn thành 10 câu nói mẫu để hoàn thành bài học (10 điểm cho mỗi bài hoàn thành) và phải phát âm chính xác hoàn toàn mới được qua 1 câu nếu phát âm sai thì sẽ phải nói lại và với các từ sai sẽ được hệ thống lưu vào lỗi người dùng để tạo bộ từ vựng cá nhân. Với phần luyện nói cùng AI sẽ có 2 chế độ là AI và thời gian thực (với thời gian thực bắt buộc người dùng phải có tài khoản Premium mới được sử dụng). Đầu tiên là với chế độ AI, khi người dùng chọn chế độ này thì AI sẽ tạo cho người dùng danh sách ngữ cảnh cuộc hội thoại đã được tạo sẵn nội dung và câu nói, người dùng chỉ việc chọn bài và chọn vai trò (1 trong 2 người ở ngữ cảnh đã được tạo) để bắt đầu luyện nói. Vì là ngữ cảnh tạo sẵn nên nhiệm vụ của người dùng chỉ việc nói theo văn bản đã được tạo sẵn và 1 câu chỉ cần phát âm đúng từ 80% trở lên sẽ được qua câu tiếp theo, giúp người dùng thoải mái trong việc phát âm. Đối với các từ phát âm sai cũng sẽ được hệ thống ghi nhận và lưu vào lỗi người dùng để tạo ra bộ từ vựng cá nhân. Ngoài ra hệ thống còn hỗ trợ tính năng đổi giọng nói của AI (Nam-Nữ, US-UK) và tăng giảm tốc độ nói giúp người dùng trải nghiệm và nghe với nhiều giọng khác nhau để tăng khả năng thích ứng âm từ. Với luyện nói thời gian thực thì hệ thống cũng sẽ tạo ra danh sách các bối cảnh để người dùng nhập vai, người dùng chọn bối cảnh và vai trò để luyện sau đó bắt đầu trò chuyện với AI (đang là vai trò còn lại). Ở đây người dùng phải tự nói theo những gì mình hiểu, biết được và AI sẽ hỗ trợ trong việc kiểm tra câu nói của người dùng sau mỗi lần nói và đưa ra phương án cũng như gợi ý cho câu nói được tốt hơn. Nếu người dùng không biết hỏi hoặc trả lời như thế nào thì hệ thống cũng hỗ trợ gợi ý cho người dùng, có nút dịch nghĩa câu nói của đối phương nếu người dùng không hiểu. Sau khi hoàn thành thì AI sẽ tổng hợp lại cuộc hội thoại và cho ra nhận xét tổng quan về cấu trúc câu, khả năng phát âm, các từ vựng mới trong bài nói cần học …

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Và cuộc hội thoại chỉ có 5 lượt nói nếu người dùng muốn học thêm phải dùng điểm thưởng để mua lượt (mỗi lượt 1 điểm thưởng, tối đa 10 lượt mua). Ngoài ra cũng giống với chế độ AI, hệ thống cũng hỗ trợ tính năng đổi giọng nói của AI (Nam-Nữ, US-UK) và tăng giảm tốc độ nói giúp người dùng trải nghiệm và nghe với nhiều giọng khác nhau để tăng khả năng thích ứng âm từ. Như đã nói ở phần ôn luyện 3 kỹ năng trên thì hệ thống sẽ hỗ trợ cá nhân hóa từ vựng dựa trên lỗi người dùng. Khi người dùng ôn luyện và phát hiện có từ vựng sai sẽ lập tức thêm từ đó vào lỗi của người dùng, nếu 1 từ đạt đúng 5 lỗi sẽ tự động thêm từ vựng đó vào bộ từ vựng cá nhân và thông báo real-time cho người dùng biết có từ mới cần ôn luyện. Đối với mỗi từ vựng cá nhân hệ thống sẽ nhờ AI tạo ra các từ đồng nghĩa, trái nghĩa, biến thể của từ đó… và có cả khái niệm về từ đó cũng như là 1 câu ví dụ cho người dùng hiểu nghĩa rõ ràng hơn. Trong mỗi từ sẽ có độ thành thạo và độ thành thạo sẽ có các móc từ 0-100. Để có được điểm thành thạo của từ đó thì trong quá trình luyện tập nếu gặp lại từ vựng mà người dùng có trong danh sách từ vựng cá nhân thì sẽ được tăng 5 điểm thông thạo nếu người dùng luyện đúng từ đó tức là không sai từ vựng đó và sẽ trừ đi 3 nếu sai. Ngoài ra hệ thống cũng hỗ trợ ôn luyện từ vựng theo từ hoặc danh sách từ, nghĩa là trong bộ từ vựng của người dùng có thể chọn ra các từ muốn ôn luyện để ưu tiên khả năng thành thạo và hệ thống sẽ tạo ra bài tập dựa trên danh sách từ vựng mà người dùng đã chọn với các dạng bài tập như: chọn nghĩa đúng, ghép từ thành câu, luyện phát âm, chọn cặp từ, điền từ còn thiếu vào câu, ghép các chữ cái thành từ. Khi người dùng hoàn thành luyện từ vựng sẽ được tăng 5 điểm thông thạo với các từ đã chọn để ôn luyện và sẽ không tăng nếu luyện tập thất bại (trong quá trình làm bài nếu sai quá 3 lần sẽ thất bại). Khi độ thông thạo của 1 từ đạt mức 100 thì người dùng sẽ phải luyện tập từ vựng đó để chuyển sang trạng thái ẩn khỏi danh sách từ. Nếu luyện tập thành công, từ đó sẽ được ẩn khỏi bộ từ vựng cá nhân và hệ thống sẽ cài đặt mặc định là 7 ngày kể từ lúc từ được ẩn và

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

sẽ hiển thị lại cho người dùng ôn luyện 1 lần nữa để tốt nghiệp từ vựng tức là xóa từ vựng đó ra khỏi bộ từ vựng cá nhân và nếu luyện tập thất bại, từ đó sẽ hiển thị lại trong bộ từ vựng cá nhân và điểm thông thạo của từ đó sẽ là mức 70. Ngoài ra, hệ thống còn phân loại từ vựng dựa trên chủ đề của từ, các từ cần ôn gấp, các từ đang tiến bộ, sắp thành thạo và đã thành thạo. Nền tảng còn hỗ trợ tạo lộ trình học tập cho người dùng giúp tự cá nhân hóa lộ trình học tập theo nhu cầu. Ở chức năng này người dùng sẽ phải cung cấp cho hệ thống các đầu vào như tên lộ trình, kỹ năng cần học, mục tiêu học tiếng Anh, lĩnh vực áp dụng (ngành nghề), lượng thời gian mà người dùng có thể học tiếng Anh trong 1 ngày. Sau đó, hệ thống sẽ tổng hợp và truy vấn thêm thành tích học tập, điểm trung bình các kỹ năng của người dùng trên hệ thống tổng hợp thành nhiều đầu vào. Từ đó AI sẽ tạo ra lộ trình phù hợp với yêu cầu của người dùng với đầu ra là chuỗi tuần học tập phù hợp cho người dùng, các bài học cần học trong mỗi tuần (lấy từ các loại bài tập có sẵn của hệ thống) và bắt buộc phải hoàn thành lộ trình của mỗi tuần mới được qua tuần kế tiếp.

- **Đánh giá và động lực học tập:** Sau mỗi hoạt động học tập của người dùng, hệ thống sẽ tự động chấm điểm và lưu kết quả, với kết quả có được sẽ được phân tích và thống kê cho mỗi cá nhân. Người dùng còn được xếp hạng theo cộng đồng và các thành viên có thành tích nổi bật sẽ được công bố trên bảng xếp hạng tạo động lực học tập liên tục.

- **Quản trị hệ thống:** Về phía quản trị viên có thể xem được thống kê số người dùng đã tạo tài khoản trong 30 ngày, số người dùng hoạt động mỗi ngày, xem ngày và giờ có lượng người tham gia học nhiều nhất. Có thể quản lí tài khoản của người dùng bao gồm thăng quyền thành admin, khóa tài khoản vi phạm cộng đồng… Tạo các bài tập mới cho người dùng hoặc chỉnh sửa. Xem và xóa các bài đăng nếu vi phạm tiêu chuẩn cộng đồng. Thống kê từ vựng mà các người dùng mắc lỗi nhiều nhất để hỗ trợ trong việc tạo bài tập mới…

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Với quy trình này, người dùng không chỉ tham gia học tập tiếng Anh một cách chủ động mà còn được gắn kết trong một cộng đồng học tập trực tuyến, mang lại sự hứng thú và hiệu quả cao hơn so với việc học cá nhân.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 3.2 Use-case tổng quát

Hình 3.1 Mô hình Use-case tổng quát của SocialLearning

Hệ thống được xây dựng với hai tác nhân chính là Người dùng (User) và Quản trị viên (Admin). Đối với Người dùng: Hệ thống cung cấp các chức năng cốt lõi xoay quanh việc học tập và tương tác xã hội. Người dùng có thể đăng ký/đăng nhập, quản lý hồ sơ cá nhân, tham gia các hoạt động luyện tập kỹ năng tiếng Anh (viết, nghe, nói, từ vựng), đồng thời kết nối với cộng đồng thông qua việc đăng bài, kết bạn và giao tiếp đa phương tiện (nhắn tin, gọi video). Đối với Quản trị viên: Hệ thống cung cấp các công cụ để giám sát và quản lý toàn bộ hoạt động. Quản trị viên có quyền quản lý tài khoản người dùng (xem danh sách, khóa/mở tài khoản), xử lý các báo cáo vi phạm và theo dõi các số liệu thống kê về hoạt động của hệ thống để đảm bảo nền tảng vận hành ổn định và an toàn.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 3.3 Danh sách tác nhân và mô tả

|Col1|Bảng 3.1 Danh sách các tác nhân|
|---|---|
|**Tác nhân**|**Mô tả**|
|Người dùng|Là đối tượng sử dụng chính của hệ thống, bao gồm sinh viên, người đi<br>làm và bất kỳ ai có nhu cầu rèn luyện tiếng Anh. Họ có thể quản lý tài<br>khoản cá nhân, tham gia vào các hoạt động học tập như luyện viết,<br>luyện nghe, quản lý từ vựng, đồng thời tương tác với cộng đồng qua<br>các tính năng mạng xã hội và giao tiếp đa phương tiện (nhắn tin, gọi<br>thoại, gọi video).|
|Quản trị viên|Là người có vai trò giám sát và quản lý toàn bộ hệ thống. Quản trị<br>viên có quyền xem danh sách người dùng, khóa hoặc mở tài khoản<br>người dùng, tạo bài tập mới cũng như theo dõi các thống kê về hoạt<br>động của hệ thống để đảm bảo nền tảng vận hành ổn định.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 3.4 Danh sách các tình huống hoạt động chính

Bảng 3.2 Danh sách các use case

|ID|Tên use-case|Mô tả|
|---|---|---|
|UC01|Đăng kí|Người dùng đăng kí và xác thực thông qua email<br>cá nhân để tạo tài khoản.|
|UC02|Đăng nhập|Dùng tài khoản đã đăng kí để đăng nhập vào hệ<br>thống.|
|UC03|Tạo bài đăng|Người dùng có thể đăng tải các bài viết, tài liệu<br>hoặc hình ảnh, video chia sẻ cho mọi người biết.|
|UC04|Nhắn tin|Có thể trò chuyện cá nhân hoặc nhóm.|
|UC05|Xem thông báo|Nhận thông báo real-time khi có tin nhắn mới,<br>bình luận mới hoặc thông tin về việc học tiếng<br>Anh.|
|UC06|Luyện viết đoạn|Người dùng chọn trình độ và thể loại muốn học,<br>sau đó hệ thống sẽ tạo ra 1 bài văn bằng tiếng<br>Việt và người học sẽ viết lại bằng tiếng Anh.<br>Nếu trong quá trình làm bài, người học không<br>thể học hết thì vẫn có thể lưu lại kết quả và quay<br>lại làm tiếp. Đặc biệt, điểm chấm sẽ dựa vào AI<br>và đưa ra gợi ý cho người học.|
|UC07|Luyện nghe|Người dùng chọn trình độ và thể loại muốn<br>nghe, sau đó hệ thống sẽ tạo ra 1 audio phù hợp<br>với thể loại người học chọn và 1 đoạn văn bản<br>của audio đó nhưng bị khuyết vài thông tin. Mục<br>tiêu của người học là nghe và điền thông tin vào<br>những chỗ còn khuyết đó. Điểm số sẽ dựa trên<br>số từ người dùng điền đúng|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|UC08|Luyện nói|Người dùng chọn trình độ và thể loại muốn nói,<br>sau đó hệ thống sẽ cho người dùng chọn luyện<br>nói cá nhân hoặc hội thoại với AI. Nếu người<br>dùng chọn luyện nói cá nhân, hệ thống sẽ tạo ra<br>10 câu văn mẫu cho người dùng nói và phải phát<br>âm đúng chính xác hoàn toàn mới được hoàn<br>thành. Ở phần hội thoại với AI được chia thành 2<br>loại. Loại đầu tiên là người dùng sẽ chọn vai trò<br>là người hỏi hoặc trả lời sau đó sẽ hội thoại qua<br>lại với AI mỗi bên 5 câu và chỉ cần phát âm<br>đúng hơn 80% là được phép qua câu tiếp theo.<br>Loại thứ 2 là trò chuyện trực tiếp với AI dựa<br>theo chủ đề mà người dùng chọn và sau đó chọn<br>vai trò trong cuộc hội thoại, ở đây người dùng có<br>thể tự do phát âm theo kiến thức mình có và AI<br>sẽ có gợi ý, đưa ra nhận xét sau mỗi câu nói và<br>tổng kết đưa ra lời khuyên cho người dùng.|
|---|---|---|
|UC09|Xem từ vựng cá nhân|Trong quá trình học thì hệ thống sẽ tạo ra bộ từ<br>vựng dựa trên thông tin học tập cá nhân. Các từ<br>vựng này là các từ người học sai trong quá trình<br>học, hệ thống sẽ ghi nhận và tạo bộ từ vựng. Bộ<br>từ vựng này được chia theo độ thành thạo và thể<br>loại.|
|UC10|Luyện tập từ vựng|Khi có từ vựng mới được thêm vào bộ từ vựng<br>thì luôn mặc định độ thông thạo là 0 và phần<br>luyện tập từ vựng này sẽ được AI tạo ra các dạng<br>bài tập dựa trên các từ vựng đó, nếu hoàn thành<br>thì độ thông thạo sẽ được tăng 5%. Ngoài ra, khi<br>luyện viết, nghe, nói nếu gặp lại từ vựng có|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|Col1|Col2|trong bộ từ vựng cá nhân nếu bạn không bị sai từ<br>đó thì hệ thống vẫn sẽ cập nhật điểm thông thạo<br>cho từ vựng nó, nếu sai thì sẽ trừ đi 3%.|
|---|---|---|
|UC11|Tiến trình học tập|Hệ thống sẽ thống kê tổng số bài học mà người<br>dùng đã học, trung bình điểm, chuỗi ngày học,<br>lịch sử hoạt động, biểu đồ thống kê kỹ năng. Từ<br>đó người dùng có thể xem và nên ưu tiên kỹ<br>năng nào cần cải thiện. Ngoài ra còn có thành<br>tích đạt được của mỗi cá nhân người học.|
|UC12|Lộ trình học tập|Hệ thống sẽ nhận input từ người học nhập và dữ<br>liệu học tập của người học trên hệ thống cùng<br>với các loại bài tập của hệ thống, sau đó sẽ tạo<br>một lộ trình phù hợp với yêu cầu đã đặt ra.<br>Người học có thể theo dỗi và học theo lộ trình đã<br>tạo.|
|UC13|Quên mật khẩu|Khi người dùng có tài khoản trên hệ thống<br>nhưng quên mật khẩu thì người dùng có thể lấy<br>lại mật khẩu thông qua email. Khi nhập email<br>xác nhận, hệ thống sẽ gửi mã OTP về email<br>người dùng, nếu nhập chính xác thì sẽ được cấp<br>mật khẩu mới.|
|UC14|Xem bài đăng|Xem các bài đăng của những người dùng khác<br>và có thể tương tác với họ thông qua like,<br>comment, share.|
|UC15|Bình luận bài đăng|Người dùng bình luận bài đăng của mình hoặc<br>người dùng khác để tạo tương tác|
|UC16|Cập nhật bài đăng|Sau khi đăng bài nếu có sai sót hoặc cần cập<br>nhật thêm thì người dùng có thể chỉnh sửa bài<br>đăng|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|UC17|Tìm kiếm người dùng|Người dùng nhập tên hoặc nickname của người<br>khác để tìm kiếm thông tin của họ|
|---|---|---|
|UC18|Xem gợi ý bạn bè|Hệ thống sẽ hiển thị ra các người dùng có các<br>yêu cầu phù hợp với các tiêu chí như: có cùng<br>level trở lên, có bạn chung thì sẽ hiển thị cho<br>người dùng để có thể thêm được nhiều bạn bè<br>mới.|
|UC19|Xem thông tin cá nhân|Người dùng có thể xem thông tin cá nhân người<br>theo dõi và các bài đăng đã đăng tải trên hệ<br>thống.|
|UC20|Cập nhật thông tin cá<br>nhân|Cập nhật lại thông tin người dùng như<br>nickname, số điện thoại, địa chỉ…|
|UC21|Xem bảng xếp hạng|Xem danh sách các người dùng đạt điểm cao<br>nhất trên hệ thống.|
|UC22|Cập nhật chuỗi ngày học|Hệ thống có tính năng tính chuỗi ngày học của<br>người dùng, bắt buộc người dùng phải học thì<br>mới được tính là 1 ngày hoạt động. Nếu người<br>dùng không học từ 1-3 ngày thì vẫn có thể giữ<br>lại chuỗi học bằng cách bỏ điểm thưởng để giữ<br>chuỗi học, nếu không sẽ bị trả về 0 và nếu người<br>dùng nghỉ quá 3 ngày hệ thống bắt buộc cập nhật<br>chuỗi về 0.|
|UC23|Chuyển đổi ngôn ngữ|Hệ thống hỗ trỡ tính năng chuyển đổi ngôn ngữ<br>Việt-Anh và ngược lại để người dùng có thể trải<br>nghiệm và dễ tiếp thu 1 cách chủ động|
|UC24|Xem thống kê tổng quan|Hệ thống sẽ có 1 trang web thống kê riêng biệt<br>cho admin để quản lí cũng như xem các thông<br>tin mới nhất như người dùng mới đăng kí, người<br>dùng mới hoạt động, tỉ lệ tương tác…|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|UC25|Quản lí người dùng|Xem chi tiết về người dùng như các bài đăng,<br>thành tích đạt được, chuỗi ngày học, các từ vựng<br>thành thạo…|
|---|---|---|
|UC26|Quản lí nội dung|Admin có thể tạo ra các bài tập mới cho người<br>dùng, xóa hoặc chỉnh sửa các bài tập cũ|
|UC27|Quản lí mạng xã hội|Xem chi tiết 1 bài đăng, lượt thích, bình luận, ai<br>là người bình luận, có thể xóa bình luận hoặc bài<br>viết nếu vi phạm tiêu chuẩn cộng đồng.|
|UC28|Quản lí từ vựng|Hệ thống sẽ thống kê ra từ vựng nào mà các<br>người dùng học sai nhiều nhất và tổng số người<br>dùng sai từ vựng đó ngoài ra còn thống kê được<br>thể loại mà người dùng cần ôn tập, từ đó có thể<br>tạo ra các bài tập mới để người dùng học.|
|UC29|Quản lí thành tích|Admin có thể tạo ra các thành tích mới để người<br>dùng có động lực học tập. Ngoài ra còn có thể<br>cập nhật hoặc xem số lượng người học đã đạt<br>được thành tích đó.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 3.5 Đặc tả các yêu cầu chức năng

#### 3.5.1 UC01_Đăng kí

**3.5.1.1** **Mô tả use-case**

|Bảng 3.3 Đặc tả chức năng đăng kí tài khoản|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC01|**Mã use-case:** UC01|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đang ở giao diện đăng kí tài khoản|**Tiền điều kiện (Precondition):**Đang ở giao diện đăng kí tài khoản|
|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì lưu thông tin tài khoản<br>người dung vào hệ thống|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì lưu thông tin tài khoản<br>người dung vào hệ thống|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Nhập thông tin||
||2. Kiểm tra ràng buộc input|
||3. Xác nhận thành công. Chuyển sang trang nhập mã OTP|
|4. Nhập OTP nhận<br>được từ email|<br>|
||5. Kiểm tra OTP|
||6. Thông báo đăng kí tài khoản thành công. Quay về trang<br>đăng nhập. Kết thúc use-case|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
||2.1 Hiển thị lỗi ràng buộc. Quay lại bước 1|
||5.1 Hiển thị lỗi rang buộc. Quay lại bước 4|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.1.2** **Activity diagram**

Hình 3.2 Đặc tả activity đăng kí

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.1.3** **Sequence diagram**

Hình 3.3 Sơ đồ trình tự đăng kí

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.1.4** **Mô tả chi tiết** Đối với chức năng đăng ký, nhóm em không chỉ đơn thuần là lưu thông tin người dùng vào cơ sở dữ liệu mà tập trung xây dựng một quy trình xác thực bảo mật chặt chẽ. Cụ thể, luồng xử lý bắt đầu ngay từ giao diện, nơi hệ thống sẽ kiểm tra định dạng email và độ mạnh mật khẩu để lọc bỏ các yêu cầu không hợp lệ trước khi gửi về server. Ở phía Backend, điểm kỹ thuật quan trọng nhất là bọn em tuyệt đối không lưu mật khẩu dưới dạng văn bản thuần. Thay vào đó, Controller sẽ chuyển tiếp yêu cầu sang dịch vụ Supabase Auth. Tại đây, mật khẩu được tự động mã hóa một chiều bằng thuật toán Bcrypt và lưu trong bảng định danh riêng biệt của hệ thống, giúp bảo vệ tài khoản ngay cả khi cơ sở dữ liệu bị lộ. Quy trình chỉ hoàn tất khi người dùng vượt qua bước xác thực kép bằng mã OTP gửi về email. Ngay lúc xác thực thành công, hệ thống sẽ thực hiện đồng bộ dữ liệu: vừa kích hoạt tài khoản định danh, vừa khởi tạo hồ sơ học tập trong bảng nghiệp vụ users. Hai bảng dữ liệu này được liên kết chặt chẽ với nhau thông qua khóa chính UUID, đảm bảo sự nhất quán giữa thông tin đăng nhập và thành tích học tập của người dùng.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.2 UC02_Đăng nhập

**3.5.2.1** **Mô tả use-case**

|Bảng 3.4 Đặc tả chức năng đăng nhập|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC02|**Mã use-case:** UC02|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đang ở giao diện đăng nhập|**Tiền điều kiện (Precondition):**Đang ở giao diện đăng nhập|
|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì chuyển sang giao diện<br>chính|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì chuyển sang giao diện<br>chính|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Nhập thông tin||
||2. Kiểm tra ràng buộc input|
||3. Kiểm tra mật khẩu|
||4. Thông báo đăng nhập thành công. Chuyển sang giao diện<br>chính|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
||2.1 Hiển thị lỗi rang buộc. Quay lại bước 1|
||3.1 Mật khẩu không đúng. Vui lòng nhập lại|
|3.2. Nhập lại mật<br>khẩu|<br>|
||3.3 Mật khẩu không đúng (>=5 lần). Khóa đăng nhập 15<br>phút.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.2.2** **Activity diagram**

Hình 3.4 Đặc tả activity đăng nhập

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.2.3** **Sequence diagram**

Hình 3.5 Sơ đồ trình tự đăng nhập

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.2.4** **Mô tả chi tiết** Đối với chức năng đăng nhập, bên cạnh việc xác thực danh tính thông thường, nhóm em đặc biệt chú trọng đến cơ chế bảo mật để ngăn chặn các cuộc tấn công dò mật khẩu (Brute-force). Quy trình kỹ thuật được xử lý chặt chẽ qua ba tầng kiểm tra. Đầu tiên, trước khi thực hiện bất kỳ thao tác kiểm tra mật khẩu nào, hệ thống sẽ truy vấn vào bảng theo dõi đăng nhập (loginAttempts) để xem trạng thái của tài khoản. Nếu phát hiện tài khoản đang có thời gian khóa (locked_until) lớn hơn thời gian hiện tại, Server sẽ lập tức từ chối yêu cầu và trả về thông báo thời gian chờ còn lại mà không cần xử lý tiếp. Chỉ khi tài khoản ở trạng thái 'sạch' hoặc đã hết thời gian khóa, hệ thống mới chuyển tiếp thông tin sang Supabase Auth để đối chiếu mật khẩu đã mã hóa. Tại đây, luồng xử lý sẽ rẽ nhánh tùy theo kết quả trả về:

- **Nếu đăng nhập thất bại (Sai mật khẩu):** Hệ thống không chỉ đơn thuần báo lỗi mà sẽ thực hiện một 'write operation' xuống cơ sở dữ liệu để tăng biến đếm số lần sai. Logic tại đây được cài đặt là nếu số lần sai chạm ngưỡng 5 lần, hệ thống sẽ tự động cập nhật trường locked_until thành thời điểm hiện tại cộng thêm 15 phút, tạm thời vô hiệu hóa quyền truy cập của tài khoản đó.

- **Nếu đăng nhập thành công:** Hệ thống sẽ thực hiện dọn dẹp dữ liệu bằng cách xóa bỏ lịch sử đăng nhập sai trong bảng loginAttempts để reset bộ đếm về 0. Cuối cùng, Server sẽ cấp phát Access Token (JWT) kèm theo thông tin phân quyền (Role) để người dùng có thể truy cập vào các tài nguyên của hệ thống. Cách hiện thực này đảm bảo rằng hệ thống vừa bảo vệ được người dùng khỏi việc bị dò mật khẩu, vừa duy trì hiệu năng cao nhờ việc ngăn chặn sớm các request spam ngay từ bước kiểm tra đầu tiên.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.3 UC03_Tạo bài đăng

**3.5.3.1** **Mô tả use-case**

|Bảng 3.5 Đặc tả chức năng tạo bài đăng|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC03|**Mã use-case:** UC03|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và đang ở<br>modal tạo bài đăng|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và đang ở<br>modal tạo bài đăng|
|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì lưu thông tin bài đăng vào<br>CSDL|**Hậu điều kiện (Postcondition):**Thực hiện thành công thì lưu thông tin bài đăng vào<br>CSDL|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Chọn đăng bài với<br>hình ảnh, video hoặc<br>chỉ với văn bản|<br> <br>|
||2. Hiển thị form nhập nội dung bài đăng|
|3. Nhập nội dung bài<br>đăng|<br>|
||4. Kiểm tra ràng buộc input|
|5. Chọn chia sẻ||
||6. Thông báo đăng bài thành công. Kết thúc use-case|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
||4.1. Hiển thị lỗi ràng buộc. Quay lại bước 4|
|5.1 Chọn hủy. Kết<br>thúc use-case|<br>|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.3.2** **Activity diagram**

Hình 3.6 Đặc tả activity tạo bài đăng

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.3.3** **Sequence diagram**

Hình 3.7 Sơ đồ trình tự tạo bài đăng

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.3.4** **Mô tả chi tiết** Ở chức năng tạo bài đăng, hệ thống hỗ trợ người dùng chia sẻ nội dung đa phương tiện bao gồm văn bản, hình ảnh, video và các định dạng tài liệu (PDF, Word, Excel). Để tối ưu hóa hiệu năng, toàn bộ tệp tin media được lưu trữ trực tiếp thông qua Supabase Storage thay vì sử dụng dịch vụ lưu trữ phân tán của bên thứ ba. Giải pháp này giúp giảm độ trễ, đồng bộ hóa dữ liệu nhanh chóng với cơ chế hoạt động cụ thể như sau:

- **Bước 1: Tiếp nhận và Xử lý đầu vào:** Khi người dùng chọn tệp tin từ thiết bị, ứng dụng (Frontend) sẽ tiến hành kiểm tra định dạng, kích thước và chuyển đổi dữ liệu sang dạng Base64 để chuẩn bị truyền tải.

- **Bước 2: Xác thực và Upload an toàn:** Dữ liệu được gửi đến Backend sau đó gọi đến Supabase Storage API kèm theo mã xác thực người dùng. Tại đây, hệ thống tự động kiểm tra quyền truy cập (thông qua các Policy bảo mật) để đảm bảo chỉ người dùng hợp lệ mới được phép tải dữ liệu lên hệ thống.

- **Bước 3: Lưu trữ và Định danh:** Sau khi xác thực thành công, tệp tin được lưu vào các Bucket (kho chứa) tương ứng. Supabase sẽ trả về một đường dẫn định danh duy nhất (Public URL hoặc Private Path) cho tệp tin đó.

- **Bước 4: Đồng bộ cơ sở dữ liệu:** Đường dẫn định danh nhận được từ Storage sẽ được lưu vào bản ghi bài viết trong cơ sở dữ liệu (Database). Khi hiển thị bài viết, hệ thống chỉ cần gọi đường dẫn này để tải nội dung media, giúp giảm tải dung lượng lưu trữ cho Database chính.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.4 UC04_Nhắn tin

**3.5.4.1** **Mô tả use-case**

|Bảng 3.6 Đặc tả chức năng nhắn tin|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC04|**Mã use-case:** UC04|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và đã xác định<br>được đối tượng nhắn tin|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và đã xác định<br>được đối tượng nhắn tin|
|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công, đối tượng nhận được<br>tin nhắn và thông tin tin nhắn được lưu vào cơ sở dữ liệu|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công, đối tượng nhận được<br>tin nhắn và thông tin tin nhắn được lưu vào cơ sở dữ liệu|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Người dùng chọn<br>đối tượng muốn nhắn<br>tin|<br> <br>|
||2. Hiển thị hộp chat giữa người dùng và đối tượng muốn<br>nhắn.|
|3. Người dùng Soạn<br>tin nhắn hoặc chọn<br>ảnh hoặc chọn video.|<br> <br>|
|4. Người dùng nhấn<br>Gửi|<br>|
||5. Hệ thống hiển thị thông tin lên thanh chat của người dùng|
||6. Hệ thống lưu vào cơ sở dữ liệu.|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
||5.1. Hệ thống kiểm tra và phát hiện bị ngắt kết nối. Hiển thị<br>thông báo “Không thể gửi tin nhắn” và quay lại bước 4.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.4.2** **Activity diagram**

Hình 3.8 Đặc tả activity nhắn tin

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.4.3** **Sequence diagram**

Hình 3.9 Sơ đồ trình tự nhắn tin

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.4.4** **Mô tả chi tiết** Chuyển sang chức năng nhắn tin, đây là tính năng đòi hỏi tính tương tác tức thời (Real-time) cao nhất trong hệ thống. Để giải quyết bài toán độ trễ thấp mà không cần người dùng phải tải lại trang, nhóm em đã xây dựng một kiến trúc giao tiếp dựa trên sự kiện (Event-driven) sử dụng thư viện Socket.IO kết hợp với cơ sở dữ liệu MongoDB. Quy trình kỹ thuật được nhóm em xử lý qua các bước cụ thể như sau:

- Đầu tiên là cơ chế thiết lập kết nối (Handshake): Ngay khi người dùng truy cập vào ứng dụng, Client sẽ khởi tạo một kết nối WebSocket bền vững đến Server. Tại đây, Server sẽ thực hiện ánh xạ (Map) giữa UserID của người dùng và SocketID của phiên làm việc hiện tại, lưu vào bộ nhớ tạm để biết chính xác cần gửi tin nhắn đến đâu.

- Khi một tin nhắn được gửi đi, hệ thống không đẩy ngay qua Socket mà thực hiện một quy trình xử lý dữ liệu cẩn thận để đảm bảo tính toàn vẹn:

- Đối với tin nhắn chứa File/Hình ảnh: Trước hết, hệ thống sẽ upload các file này lên dịch vụ lưu trữ đám mây Cloudinary. Sau khi Cloudinary trả về đường dẫn (URL) an toàn, Server mới đóng gói URL này cùng với nội dung tin nhắn để xử lý tiếp.

- Lưu trữ bền vững (Persistence): Tiếp theo, toàn bộ nội dung hội thoại được lưu trữ vào MongoDB. Nhóm em chọn MongoDB thay vì SQL cho phần này vì cấu trúc linh hoạt của NoSQL rất phù hợp để lưu trữ lịch sử chat với khối lượng lớn và cấu trúc dữ liệu đa dạng (text, image, video…). Chỉ khi dữ liệu đã được lưu thành công vào cơ sở dữ liệu (đảm bảo không bị mất tin nhắn), Server mới thực hiện bước cuối cùng là phát tán tin nhắn (Broadcasting). Hệ thống sử dụng phương thức socket.to(roomID).emit để bắn sự kiện new_message đến chính xác người nhận hoặc nhóm chat. Nhờ vậy, phía người nhận sẽ hiển thị tin nhắn ngay lập tức gần như đồng thời, tạo cảm giác mượt mà và liền mạch trong quá trình giao tiếp.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.5 UC06_Luyện viết đoạn

**3.5.5.1** **Mô tả use-case**

|Bảng 3.7 Đặc tả chức năng luyện viết đoạn|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC06|**Mã use-case:** UC06|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Người dùng đã đăng nhập vào hệ thống và đang ở<br>modal chọn chức năng luyện viết|**Tiền điều kiện (Precondition):**Người dùng đã đăng nhập vào hệ thống và đang ở<br>modal chọn chức năng luyện viết|
|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Người dùng chọn<br>chức năng luyện viết|<br>|
||2. Hệ thống hiển thị các lựa chọn về level và loại văn bản|
|3. Người dùng chọn<br>level và loại văn bản<br>muốn ôn luyện.|<br> <br>|
||4. Hệ thống hiển thị modal lựa chọn: “Generate AI” và “Tiếp<br>tục”|
|5. Người dùng chọn<br>“Generate AI”|<br>|
||6. Hệ thống dùng AI tạo bài tập và chuyển người dùng đến<br>trang làm bài tập với đề đó.|
|7. Người dùng chọn<br>một bài tập cụ thể<br>trong danh sách.|<br> <br>|
||8. Hệ thống chuyển đến trang làm bài tập viết tương ứng với<br>bài đã chọn.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|9. Người dùng nhập<br>nội dung bài tập theo<br>yêu cầu|Col2|
|---|---|
|10. Người dùng chọn<br>nộp bài tập|<br>|
||11. Hệ thống gọi AI đánh giá bài nộp và tính điểm cộng cho<br>người dùng|
||12. Hệ thống hiển thị thông tin phản hồi đánh giá từ AI và<br>thông tin điểm cộng|
||13. Hệ thống tự động kiểm tra từ vựng sai. Nếu một từ vựng<br>bị sai 5 lần, hệ thống tự động thêm từ đó vào bộ từ vựng cá<br>nhân và gửi thông báo cho người dùng (UC05).|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
|5.1 Người dùng chọn<br>“Tiếp tục”|<br>|
||5.2 Hệ thống chuyển đến trang danh sách bài tập viết có sẵn<br>tương ứng với Level và loại văn bản đã chọn.|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.5.2** **Activity diagram**

Hình 3.10 Đặc tả activity luyện viết đoạn

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.5.3** **Sequence diagram**

Hình 3.11 Sơ đồ trình tự chọn bài tập luyện viết từ hệ thống

Hình 3.12 Sơ đồ trình tự chọn tạo bài tập luyện viết bằng AI

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 3.13 Sơ đồ trình tự làm bài tập luyện viết

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.5.4** **Mô tả chi tiết** Đến với chức năng luyện viết, đây là phân hệ thể hiện rõ nhất việc ứng dụng Trí tuệ nhân tạo vào quy trình học tập cá nhân hóa. Thay vì chỉ so sánh chuỗi ký tự đơn thuần như các hệ thống cũ, nhóm em đã xây dựng một quy trình xử lý thông minh kết hợp giữa dữ liệu tĩnh và Generative AI. Quy trình kỹ thuật bắt đầu ngay từ khâu tạo đề bài. Hệ thống cung cấp hai luồng xử lý song song:

- Nếu người dùng chọn bài tập có sẵn, Server đơn giản là truy vấn từ cơ sở dữ liệu SQL dựa trên Level và Topic đã chọn.

- Tuy nhiên, điểm nhấn kỹ thuật nằm ở chế độ 'Generate AI'. Khi người dùng chọn chế độ này, Backend sẽ không gửi yêu cầu tạo văn bản tự do mà sử dụng kỹ thuật Prompt Engineering có cấu trúc. Cụ thể, hệ thống sẽ chèn các tham số như trình độ (Level) và chủ đề (Topic) vào một mẫu Prompt cố định, yêu cầu Gemini API trả về kết quả dưới định dạng chuẩn JSON. Việc ép kiểu JSON này giúp hệ thống dễ dàng bóc tách dữ liệu (Title, Content, Keywords) để hiển thị lên giao diện mà không cần xử lý chuỗi thủ công phức tạp. Giai đoạn quan trọng nhất là Chấm điểm và Phản hồi. Khi người dùng nhấn 'Nộp bài', hệ thống sẽ đóng gói toàn bộ bài làm của người dùng cùng với đề bài gốc để gửi sang Gemini API. Tại đây, nhóm em yêu cầu AI thực hiện đồng thời ba nhiệm vụ: chấm điểm trên thang 100, chỉ ra các lỗi ngữ pháp/từ vựng cụ thể, và đưa ra phiên bản viết lại tự nhiên hơn (điểm final = 50% điểm accuracy + 30% điểm ngữ pháp + 20% từ vựng). Sau khi nhận phản hồi từ AI, Server không chỉ lưu kết quả mà còn kích hoạt một Logic nghiệp vụ tự động để quản lý từ vựng. Hệ thống sẽ quét qua danh sách các từ vựng mà người dùng sử dụng sai. Nếu phát hiện một từ vựng bị sai tích lũy quá 5 lần trong quá trình học, hệ thống sẽ tự động thêm từ đó vào Bộ từ vựng cá nhân (Personal Vocabulary) và kích hoạt cơ chế nhắc nhở ôn tập. Cách hiện thực này giúp tạo ra một vòng lặp học tập khép kín: từ Luyện tập → Đánh giá → Cải thiện lỗ hổng kiến thức.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.6 UC07_Luyện nghe

**3.5.6.1** **Mô tả use-case**

|Bảng 3.8 Đặc tả chức năng luyện nghe|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC07|**Mã use-case:** UC07|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Người dùng đã đăng nhập vào hệ thống và đang ở<br>modal chọn chức năng luyện nghe|**Tiền điều kiện (Precondition):**Người dùng đã đăng nhập vào hệ thống và đang ở<br>modal chọn chức năng luyện nghe|
|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu.|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu.|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Người dùng chọn<br>chức năng luyện nghe|<br>|
||2. Hệ thống hiển thị các lựa chọn về level và chủ đề|
|3. Người dùng chọn<br>level và chủ đề muốn<br>ôn luyện|<br> <br>|
||4. Hệ thống hiển thị lựa chọn: “Generate AI” và “Tiếp tục”|
|5a. Người dùng chọn<br>“Generate AI”|<br>|
||6a. Hệ thống dùng AI tạo bài tập và chuyển người dùng đến<br>trang làm bài tập nghe với đề đó.|
|5b. Người dùng chọn<br>“Tiếp tục”|<br>|
||6b. Hệ thống chuyển đến trang danh sách bài tập nghe có sẵn<br>tương ứng với Level và Chủ đề đã chọn.|
|7. Người dùng chọn<br>một bài tập cụ thể|<br> <br>|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|trong danh sách.|Col2|
|---|---|
||8. Hệ thống chuyển đến trang làm bài tập nghe tương ứng với<br>bài đã chọn.|
|9. Người dùng nhập<br>nội dung bài tập theo<br>yêu cầu|<br> <br>|
|10. Người dùng chọn<br>nộp bài tập|<br>|
||11. Hệ thống kiểm tra bài tập và tính điểm cộng|
||12. Hệ thống hiển thị kết quả làm bài tập|
||13. Hệ thống tự động kiểm tra từ vựng sai. Nếu một từ vựng<br>bị sai 5 lần, hệ thống tự động thêm từ đó vào bộ từ vựng cá<br>nhân và gửi thông báo cho người dùng (UC05).|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.6.2** **Acticity diagram**

Hình 3.14 Đặc tả activity luyện nghe

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.6.3** **Sequence diagram**

Hình 3.15 Sơ đồ trình tự chọn bài tập luyện nghe từ hệ thống

Hình 3.16 Sơ đồ trình tự chọn tạo bài tập luyện nghe bằng AI

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 3.18 Sơ đồ trình tự làm bài tập luyện nghe

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.6.4** **Mô tả chi tiết** Chuyển sang chức năng Luyện nghe, thay vì chỉ phát lại các file âm thanh có sẵn một cách thụ động, nhóm em đã xây dựng một cơ chế tạo bài tập 'điền từ vào chỗ trống' (Gap-fill) động, dựa trên ngữ cảnh thực tế mà người dùng lựa chọn. Quy trình kỹ thuật được thực hiện qua các bước phối hợp chặt chẽ giữa AI và thuật toán xử lý chuỗi như sau:

- Đầu tiên là khâu Sinh nội dung đa phương tiện: Khi người dùng chọn chủ đề (ví dụ: 'Du lịch') và trình độ, Server sẽ gửi một Prompt chi tiết đến Gemini API. Yêu cầu ở đây không chỉ là tạo ra một đoạn hội thoại, mà AI phải trả về dữ liệu có cấu trúc JSON bao gồm: nội dung văn bản đầy đủ (Full Script), danh sách các từ khóa quan trọng (Keywords) để đục lỗ, và file âm thanh (hoặc text để chuyển thành audio). Đối với phần Audio, hệ thống tích hợp dịch vụ Text-to-Speech để chuyển đổi đoạn văn bản AI vừa tạo thành giọng đọc tự nhiên, giúp người dùng được nghe ngữ điệu chuẩn xác.

- Tiếp theo là Logic xử lý đục lỗ (Masking Logic): Trước khi trả dữ liệu về cho Client, Backend sẽ thực hiện một thuật toán xử lý chuỗi. Hệ thống dựa vào danh sách 'Keywords' mà AI đề xuất để thay thế các từ này trong đoạn văn gốc bằng các ký tự đặc biệt (placeholder). Việc xử lý này đảm bảo rằng Client chỉ nhận được đoạn văn bản đã bị che, ngăn chặn hoàn toàn việc người dùng có thể 'soi' code để xem trước đáp án.

- Cuối cùng là quy trình Đồng bộ và Chấm điểm:

- Trên giao diện, hệ thống sử dụng trình phát Audio HTML5 tiêu chuẩn nhưng được đồng bộ hóa với văn bản.

- Khi người dùng điền từ và nhấn 'Nộp bài', Server sẽ thực hiện so khớp chuỗi (String Matching) giữa đáp án người dùng gửi lên và từ khóa gốc. Thuật toán so khớp được thiết lập để bỏ qua các lỗi nhỏ về viết hoa/thường (Case-insensitive) hoặc khoảng trắng thừa (Trim) để đánh giá công bằng nhất.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- Đặc biệt, tương tự như phần Luyện viết, hệ thống cũng kích hoạt Cơ chế theo dõi từ vựng sai. Nếu người dùng nghe sai một từ vựng quá 5 lần, hệ thống sẽ tự động định danh đó là 'từ khó' và đẩy vào cơ sở dữ liệu Từ vựng cá nhân, giúp người dùng có kế hoạch ôn tập lại sau này.

#### 3.5.7 UC08_Luyện nói

**3.5.7.1** **Mô tả use-case**

|Bảng 3.9 Đặc tả chức năng luyện nói|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC08|**Mã use-case:** UC08|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Người dùng đăng nhập thành công và đang ở trang<br>luyện nói|**Tiền điều kiện (Precondition):**Người dùng đăng nhập thành công và đang ở trang<br>luyện nói|
|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu.|**Hậu điều kiện (Postcondition):**Sau khi thực hiện thành công lưu thông tin làm bài<br>của người dùng vào cơ sở dữ liệu.|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1.Người dùng chọn<br>level và topic muốn<br>ôn luyện|<br> <br>|
||2. Hệ thống hiển thị lựa chọn “Luyện nói cá nhân” hoặc<br>“Luyện nói với AI”|
|3a. Chọn “Luyện nói<br>cá nhân”|<br>|
||4a. Đến trang luyện nói và hiển thị bài tập ôn luyện|
|3b. Chọn “Luyện nói<br>với AI”|<br>|
||4b. Đến trang luyện nói và hiển thị chọn role A hoặc B|
|5a. Người dùng hoàn||

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|thành học nói 10 câu|Col2|
|---|---|
|5b. Chọn role và bắt<br>đầu luyện nói|<br>|
||6. Thông báo hoàn thành và cộng điểm cho người học vào cơ<br>sở dữ liệu.|
||7. Hệ thống tự động kiểm tra từ vựng sai. Nếu một từ vựng bị<br>sai 5 lần, hệ thống tự động thêm từ đó vào bộ từ vựng cá<br>nhân và gửi thông báo cho người dùng (UC05).|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.7.2** **Acticity diagram**

Hình 3.19 Đặc tả activity luyện nói

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.7.3** **Sequence diagram**

Hình 3.20 Sơ đồ trình tự chọn chế độ luyện nói solo với bài tập hệ thống

Hình 3.21 Sơ đồ trình tự chọn chế độ luyện nói solo với bài tập AI tạo

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 3.22 Sơ đồ trình tự chọn chế độ bài tập luyện nói hội thoại với AI

Hình 3.23 Sơ đồ trình tự làm bài tập ở chế độ (solo với hệ thống, solo với AI, hội

thoại với AI)

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 3.24 Sơ đồ trình tự luyện nói hội thoại real-time với AI

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.7.4** **Mô tả chi tiết** Chức năng Luyện nói là một trong những phân hệ phức tạp nhất của hệ thống, đòi hỏi sự tích hợp chặt chẽ giữa xử lý âm thanh thời gian thực và Trí tuệ nhân tạo. Thay vì chỉ ghi âm và lưu trữ đơn thuần, nhóm em đã xây dựng một cơ chế đánh giá phát âm tự động (Automated Pronunciation Assessment) kết hợp với phản hồi ngữ cảnh. Quy trình xử lý được chia thành các luồng kỹ thuật chuyên biệt như sau:

- **Xử lý Tín hiệu âm thanh:**

- Khi người dùng thực hiện ghi âm, Client (Next.js/React Native) sẽ thu thập tín hiệu giọng nói và đóng gói dưới dạng Blob/Base64.

- Dữ liệu này được truyền tải lên Server và gọi đến Google Cloud Speech-to-Text API. Tại đây, mô hình học sâu (Deep Learning) của Google sẽ chuyển đổi giọng nói thành văn bản (Transcript) kèm theo độ tin cậy (Confidence Score). Đây là cơ sở dữ liệu gốc để hệ thống so sánh.

- **Cơ chế Luyện nói Cá nhân:**

- Ở chế độ này, hệ thống yêu cầu độ chính xác tuyệt đối để rèn luyện kỹ năng phát âm chuẩn.

- Thuật toán so khớp chuỗi (String Comparison Algorithm) sẽ so sánh văn bản người dùng vừa nói với câu mẫu. Chỉ khi độ trùng khớp đạt 100% (người dùng phát âm rõ ràng, đúng từng từ), hệ thống mới cho phép mở khóa câu tiếp theo. Điều này buộc người học phải kiên nhẫn và chỉnh sửa từng lỗi nhỏ trong phát âm.

- **Cơ chế Luyện nói với AI:**

- Đây là tính năng điểm nhấn, chia làm 2 dạng: `o` **Roleplay:** Hệ thống sử dụng Prompt Engineering để ép Gemini AI đóng vai một nhân vật cụ thể (ví dụ: Nhân viên bán hàng, Lễ tân). Người dùng chọn vai còn lại. Để đảm bảo hội thoại trôi chảy, ngưỡng chấp nhận phát âm được hạ xuống mức >80%, giúp người dùng tự tin hơn trong giao tiếp phản xạ.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

`o` **Real-time Conversation:** Hệ thống thiết lập một phiên làm việc ngữ cảnh dài (Long-context Session). Mỗi câu nói của người dùng được AI phân tích để đưa ra 3 lớp phản hồi:

- _Reply:_ Câu trả lời tiếp nối câu chuyện.

- _Correction:_ Sửa lỗi ngữ pháp/từ vựng trong câu nói vừa rồi của người dùng.

- _Suggestion:_ Gợi ý cách diễn đạt tự nhiên hơn (Native-like).

- Đặc biệt, hệ thống tích hợp Text-to-Speech (TTS) để chuyển phản hồi của AI thành giọng nói (có thể tùy chỉnh giọng Nam/Nữ, Anh/Mỹ), tạo cảm giác như đang trò chuyện với người thật.

- **Vòng lặp cải thiện:** Tương tự các kỹ năng khác, nếu hệ thống phát hiện người dùng phát âm sai một từ cụ thể quá 5 lần (dựa trên kết quả so khớp), từ đó sẽ tự động được gán nhãn "Cần ôn tập" và đẩy vào kho Từ vựng cá nhân.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.8 UC10_Học từ vựng

**3.5.8.1** **Mô tả use-case**

|Bảng 3.10 Đặc tả chức năng học từ vựng|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC11|**Mã use-case:** UC11|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đăng nhập thành công, có được bộ từ vựng của<br>riêng mình và đang ở trang từ vựng cá nhân|**Tiền điều kiện (Precondition):**Đăng nhập thành công, có được bộ từ vựng của<br>riêng mình và đang ở trang từ vựng cá nhân|
|**Hậu điều kiện (Postcondition):**Học thành công và trình độ thông thạo với từ vựng<br>được tang lên|**Hậu điều kiện (Postcondition):**Học thành công và trình độ thông thạo với từ vựng<br>được tang lên|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Người dùng chọn<br>danh sách từ cần<br>luyện tập hoặc luyện<br>tập tất cả|<br> <br> <br>|
||2. Hệ thống sẽ tạo bài tập dựa trên danh sách từ|
|3. Người dùng làm<br>bài tập|<br>|
||4. Hoàn thành và được cộng điểm thông thạo|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
||4.1 Không hoàn thành, điểm không được cộng|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.8.2** **Activity diagram**

Hình 3.25 Đặc tả activity học từ vựng

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.8.3** **Sequence diagram**

Hình 3.26 Sơ đồ trình tự học từ vựng

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.8.4** **Mô tả chi tiết** Khác với các ứng dụng thông thường nơi người dùng phải tự nhập từ vựng thủ công, chức năng Học từ vựng trong hệ thống SocialLearning hoạt động như một "Lưới lọc thông minh", tự động thu thập và cá nhân hóa lộ trình học dựa trên sai sót thực tế của người dùng. Quy trình kỹ thuật và Logic nghiệp vụ được thiết kế như sau:

- **Cơ chế Thu thập thụ động:**

- Module Từ vựng hoạt động ngầm (Background Service) liên kết chặt chẽ với 3 module Luyện Viết, Nghe và Nói.

- Hệ thống duy trì một bộ đếm lỗi (Error Counter) cho từng từ vựng trong cơ sở dữ liệu. Khi bộ đếm của một từ chạm ngưỡng >= 5, Trigger hệ thống sẽ kích hoạt, tự động sao chép từ đó vào bảng PersonalVocab của người dùng.

- Ngay lập tức, một tiến trình gọi AI (Gemini API) sẽ chạy để làm giàu dữ liệu (Data Enrichment): Tự động sinh ra định nghĩa, ví dụ minh họa, từ đồng nghĩa/trái nghĩa cho từ đó để người dùng có đầy đủ tư liệu học tập.

- **Thuật toán Lặp lại ngắt quãng:**

- Mỗi từ vựng cá nhân sở hữu một chỉ số Độ thành thạo (Mastery Score) chạy từ 0 đến 100.

- Hệ thống áp dụng cơ chế thưởng/phạt điểm động: `o` **Thưởng:** Nếu người dùng làm đúng bài tập liên quan đến từ đó, độ thành thạo tăng +5%. `o` **Phạt:** Nếu làm sai (trong bài tập từ vựng hoặc gặp lại trong bài viết/nghe/nói), độ thành thạo bị trừ -3%. Cơ chế này mô phỏng quá trình quên tự nhiên của não bộ.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- **Cơ chế "Tốt nghiệp" Từ vựng:**

- Khi một từ đạt 100% Mastery, nó không bị xóa ngay mà chuyển sang trạng thái "Archived" (Lưu trữ tạm thời).

- Hệ thống thiết lập một Cron Job (Tác vụ định kỳ): Sau đúng 7 ngày, từ này sẽ "tái xuất" và yêu cầu người dùng kiểm tra lại một lần cuối. `o` Nếu Nhớ (Đúng): Từ vựng chính thức bị xóa khỏi danh sách cần học (Tốt nghiệp). `o` Nếu Quên (Sai): Từ vựng quay lại danh sách học với độ thành thạo bị reset về mức 70%.

- Cách tiếp cận này đảm bảo kiến thức được đưa vào trí nhớ dài hạn thay vì học vẹt.

- **Sinh bài tập Động:** Thay vì lưu trữ ngân hàng câu hỏi cố định, hệ thống sử dụng AI để sinh bài tập trắc nghiệm, điền từ, ghép thẻ... theo thời gian thực (Real-time Generation) dựa trên danh sách từ vựng cần ôn của người dùng, đảm bảo bài học không bao giờ bị trùng lặp.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 3.5.9 UC12_Tạo lộ trình học tập

**3.5.9.1** **Mô tả use-case**

|Bảng 3.11 Đặt tả chức năng tạo lộ trình học tập|Col2|
|---|---|
|**Đặc tả use-case**|**Đặc tả use-case**|
|**Mã use-case:** UC12|**Mã use-case:** UC12|
|**Actor:** Người dùng|**Actor:** Người dùng|
|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và chọn chức<br>năng tạo lộ trình học tập|**Tiền điều kiện (Precondition):**Đăng nhập thành công vào hệ thống và chọn chức<br>năng tạo lộ trình học tập|
|**Hậu điều kiện (Postcondition):**Sau khi hoàn thành use-case lộ trình mới sẽ được<br>tạo và lưu vào CSDL|**Hậu điều kiện (Postcondition):**Sau khi hoàn thành use-case lộ trình mới sẽ được<br>tạo và lưu vào CSDL|
|**Luồng sự kiện chính (Basic flow)**|**Luồng sự kiện chính (Basic flow)**|
|**Actor**|**Hệ thống**|
|1. Người dùng chọn<br>tạo lộ trình mới|<br>|
||2. Hệ thống hiển thị modal nhập tên lộ trình học|
|3. Người dùng nhập<br>tên lộ trình học|<br>|
|4. Người dùng nhấn<br>nút “Next”|<br>|
||5. Hệ thống hiển thị modal chọn kỹ năng muốn cải<br>thiện(“Writing, Listening, Speaking)|
|6. Người dùng chọn<br>kỹ năng cần cải thiện|<br>|
|7. Người dùng nhấn<br>nút “Next”|<br>|
||8. Hệ thống hiển thị modal chọn mục tiêu sử dụng tiếng Anh<br>hoặc nhập mục tiêu khác|
|9. Người dùng chọn<br>mục tiêu|<br>|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|10. Người dùng nhấn<br>nút “Next”|Col2|
|---|---|
||11. Hệ thống hiển thị modal chọn lĩnh vực áp dụng hoặc nhập<br>lĩnh vực|
|12 Người dùng chọn<br>lĩnh vực|<br>|
|13. Người dùng nhấn<br>nút “Next”|<br>|
||14. Hệ thống hiển thị modal chọn lượng thời gian bỏ ra để<br>học tiếng Anh hoặc nhập vào lượng thời gian|
|15 Người dùng chọn<br>lượng thời gian|<br>|
|16. Người dùng chọn<br>nút “Tạo lộ trình”|<br>|
||17. Hệ thống nhận dữ liệu, truy vấn dữ liệu học tập hệ thống<br>của người dùng.|
||18. Hệ thống gọi prompt AI tạo lộ trình và lưu kết quả lộ<br>trình vào CSDL.|
||19. Hệ thống hiển thị lộ trình đã tạo|
|**Luồng sự kiện thay thế (Alternative flow)**|**Luồng sự kiện thay thế (Alternative flow)**|
|4.1 Người nhấn vào<br>nút “Back”|<br>|
||4.2 Hệ thống quay về bước 2|
|7.1 Người nhấn vào<br>nút “Back”|<br>|
||7.2 Hệ thống quay về bước 5|
|9.1 Người dùng nhập<br>mục tiêu|<br>|
|10.1 Người nhấn vào||

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

|nút “Back”|Col2|
|---|---|
||10.2 Hệ thống quay về bước 8|
|12.1<br>Người<br>dùng<br>nhập lĩnh vực|<br>|
|13.1 Người nhấn vào<br>nút “Back”|<br>|
||13.2 Hệ thống quay về bước 11|
|15.1<br>Người<br>dùng<br>nhập lượng thời gian|<br>|
|16.1 Người nhấn vào<br>nút “Back”|<br>|
||16.2 Hệ thống quay về bước 14|

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.9.2** **Activity diagram**

Hình 3.27 Đặc tả activity lộ trình học tập

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.9.3** **Sequence diagram**

Hình 3.28 Sơ đồ trình tự lộ trình học tập

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

**3.5.9.4** **Mô tả chi tiết** Chức năng Lộ trình học tập, đây được xem là 'người dẫn đường' thông minh của hệ thống. Thay vì cung cấp một giáo trình tĩnh cho tất cả mọi người, nhóm em xây dựng một cơ chế tạo lộ trình động dựa trên dữ liệu thực tế của từng cá nhân.

Hình 3.29 Sơ đồ luồng tạo lộ trình cá nhân

Quy trình kỹ thuật được thực hiện qua các bước xử lý dữ liệu như sau:

- Bước đầu tiên là **Tổng hợp ngữ cảnh (Context Aggregation):** Khi người dùng yêu cầu tạo lộ trình mới, Backend không chỉ nhận các tham số đầu vào từ giao diện (như mục tiêu, thời gian rảnh, lĩnh vực quan tâm) mà còn tự động truy vấn ngược vào cơ sở dữ liệu để lấy Hồ sơ năng lực hiện tại của người dùng. Hệ thống sẽ tổng hợp điểm số các kỹ năng (Writing, Speaking, Listening) và lịch sử các bài đã học để tạo thành một bộ dữ liệu ngữ cảnh đầy đủ nhất

- Tiếp theo là bước **Generative AI** với cấu trúc phân cấp: Toàn bộ ngữ cảnh trên được đưa vào một Prompt chuyên biệt gửi sang Gemini API. Tại đây, nhóm em yêu cầu AI đóng vai trò một chuyên gia giáo dục để thiết kế lộ trình chi tiết theo từng tuần. Thách thức kỹ thuật ở đây là dữ liệu trả về phải đảm bảo cấu trúc phân tầng (Hierarchy) chặt chẽ: Một Lộ trình (Roadmap) chứa nhiều Tuần (Weeks), và mỗi Tuần chứa nhiều Bài học (Lessons) cụ thể. Do đó, nhóm em bắt buộc AI phản hồi dưới dạng JSON Nested Object chuẩn xác để hệ thống có thể đọc hiểu.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

- Cuối cùng là kỹ thuật Lưu trữ dữ liệu quan hệ (Relational Persistence): Khi nhận được dữ liệu JSON từ AI, Server sẽ thực hiện quy trình lưu trữ phức tạp vào PostgreSQL. Vì cấu trúc dữ liệu có tính phân cấp (Cha Con), nhóm em sử dụng cơ chế Database Transaction (Giao dịch) để đảm bảo tính toàn vẹn dữ liệu. Hệ thống sẽ lần lượt insert dữ liệu vào bảng roadmap trước, lấy ID trả về để insert vào bảng weekRoadMap, và tiếp tục dùng ID của tuần để insert vào bảng lessonRoadmap. Việc sử dụng Transaction đảm bảo rằng nếu có bất kỳ lỗi nào xảy ra ở khâu lưu bài học, toàn bộ lộ trình sẽ được rollback (hoàn tác) để tránh dữ liệu rác.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
