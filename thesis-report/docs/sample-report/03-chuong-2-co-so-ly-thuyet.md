# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT

### 2.1 Ngôn ngữ lập trình sử dụng

#### 2.1.1 Javascript

JavaScript là ngôn ngữ lập trình của web. Phần lớn các trang web sử dụng JavaScript và tất cả các trình duyệt web hiện đại trên máy tính để bàn, máy tính bảng và điện thoại - bao gồm trình thông dịch JavaScript, khiến JavaScript trở thành ngôn ngữ lập trình được triển khai nhiều nhất trong lịch sử. Trong thập kỷ qua, Node.js đã cho phép lập trình JavaScript bên ngoài trình duyệt web và thành công đáng kể của Node có nghĩa là JavaScript hiện cũng là ngôn ngữ lập trình được sử dụng nhiều nhất trong số các nhà phát triển phần mềm [8].

#### 2.1.2 TypeScript

TypeScript là một dự án mã nguồn mở được phát triển bởi Microsoft, nó có thể được coi là một phiên bản nâng cao của Javascript bởi việc bổ sung tùy chọn kiểu tĩnh và lớp hướng đối tượng mà điều này không có ở Javascript. TypeScript có thể sử dụng để phát triển các ứng dụng chạy ở client-side (Angular2) và server-side (NodeJS) [9]. TypeScript sử dụng tất cả các tính năng của của ECMAScript 2015 (ES6) như classes, modules. Không dừng lại ở đó nếu như ECMAScript 2017 ra đời thì mình tin chắc rằng TypeScript cũng sẽ nâng cấp phiên bản của mình lên để sử dụng mọi kỹ thuật mới nhất từ ECMAScript. Thực ra TypeScript không phải ra đời đầu tiên mà trước đây cũng có một số thư viện như CoffeScript và Dart được phát triển bởi Google, tuy nhiên điểm yếu là hai thư viện này sư dụng cú pháp mới hoàn toàn, điều này khác hoàn toàn với TypeScript, vì vậy tuy ra đời sau nhưng TypeScript vẫn đang nhận được sự đón nhận từ các lập trình viên [9].

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 2.2 Các framework phát triển ứng dụng

#### 2.2.1 ReactJS

React.js, thường được gọi là React, là một thư viện JavaScript mã nguồn mở miễn phí. Nó hoạt động tốt nhất để xây dựng giao diện người dùng bằng cách kết hợp các phần mã (thành phần) thành các trang web đầy đủ. Được xây dựng ban đầu bởi Facebook, Meta và cộng đồng mã nguồn mở hiện đang duy trì nó. Một trong những điều tuyệt vời về React là bạn có thể sử dụng nó nhiều hay ít tùy thích! Ví dụ: bạn có thể xây dựng toàn bộ trang web của mình trong React hoặc chỉ sử dụng một thành phần React duy nhất trên một trang. React.js được xây dựng bằng JSX – Sự kết hợp giữa JavaScript và XML. Các thành phần được tạo bằng JSX, sau đó sử dụng JavaScript để hiển thị chúng trên trang web của bạn. Mặc dù React có đường cong học tập dốc đối với một nhà phát triển mới vào nghề, nhưng nó đang nhanh chóng định hình thành một trong những thư viện JavaScript phổ biến và có nhu cầu cao nhất. React được coi là một thư viện JavaScript chứ không phải là một khuôn khổ, trong khi các tùy chọn khác mà chúng ta sẽ xem xét hôm nay được coi là khuôn khổ. Sẽ hữu ích khi coi thư viện là một công cụ mà các nhà phát triển có thể sử dụng trong bất kỳ dự án nào và khuôn khổ là một thiết kế tổng thể [10].

#### 2.2.2 Next.js

Next.js là một mã nguồn mở được phát triển bởi Vercel và được ra mắt vào năm 2016. Next.js cung cấp các ứng dụng web dựa trên React với khả năng tạo trang web tĩnh và server-side rendering giúp nâng cao trải nghiệm người dùng, hiệu suất trang web và tối ưu hoá công cụ tìm kiếm [11]. Với những tính năng mạnh mẽ và linh hoạt, Next.js đã trở thành một trong những công cụ phát triển web được ưa chuộng nhất trong cộng đồng React, đặc biệt là đối với các dự án thương mại điện tử và ứng dụng web quy mô lớn.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 2.2.3 React Native

React Native là một khuôn khổ JavaScript để viết các ứng dụng di động thực sự, hiển thị gốc cho iOS và Android. Nó dựa trên React, thư viện JavaScript của Facebook để xây dựng giao diện người dùng, nhưng thay vì nhắm mục tiêu vào trình duyệt, nó nhắm mục tiêu vào các nền tảng di động. Nói cách khác: các nhà phát triển web hiện có thể viết các ứng dụng di động trông và cảm thấy thực sự "gốc", tất cả đều từ sự thoải mái của một thư viện JavaScript mà chúng ta đã biết và yêu thích. Thêm vào đó, vì hầu hết mã bạn viết có thể được chia sẻ giữa các nền tảng, React Native giúp bạn dễ dàng phát triển đồng thời cho cả Android và iOS. Tương tự như React cho Web, các ứng dụng React Native được viết bằng cách kết hợp JavaScript và đánh dấu giống XML, được gọi là JSX. Sau đó, bên trong, "cầu nối" React Native sẽ gọi các API hiển thị gốc trong Objective-C (cho iOS) hoặc Java (cho Android). Do đó, ứng dụng của bạn sẽ hiển thị bằng các thành phần giao diện người dùng di động thực sự, không phải chế độ xem web và sẽ trông và cảm thấy giống như bất kỳ ứng dụng di động nào khác. React Native cũng hiển thị các giao diện JavaScript cho các API nền tảng, do đó, các ứng dụng React Native của bạn có thể truy cập các tính năng nền tảng như camera điện thoại hoặc vị trí của người dùng. React Native hiện hỗ trợ cả iOS và Android, và có tiềm năng mở rộng sang các nền tảng trong tương lai. Trong cuốn sách này, chúng tôi sẽ đề cập đến cả iOS và Android. Phần lớn mã chúng tôi viết sẽ là đa nền tảng. Và vâng: bạn thực sự có thể sử dụng React Native để xây dựng các ứng dụng di động sẵn sàng cho sản xuất! Một số giai thoại: Facebook, Palantir và TaskRabbit đã sử dụng nó trong sản xuất cho các ứng dụng hướng đến người dùng [12].

#### 2.2.4 Express.js

Express.js là một khung ứng dụng web Node.js tối giản và linh hoạt, cung cấp danh sách các tính năng để xây dựng các ứng dụng web và di động một cách dễ dàng. Nó đơn giản hóa việc phát triển các ứng dụng phía máy chủ bằng cách cung cấp một API dễ sử dụng cho các tiện ích định tuyến, phần mềm trung gian và HTTP [13].

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Được xây dựng trên Node.js để phát triển phía máy chủ nhanh chóng và có thể mở rộng. Đơn giản hóa việc định tuyến và xử lý phần mềm trung gian cho các ứng dụng website. Hỗ trợ xây dựng REST API, ứng dụng thời gian thực và ứng dụng một trang. Cung cấp một cấu trúc nhẹ để phát triển phía máy chủ linh hoạt và hiệu quả.

### 2.3 Các công nghệ và thư viện hỗ trợ

#### 2.3.1 Socket.IO

Socket.IO là một thư viện cho phép giao tiếp theo sự kiện, hai chiều và có độ trễ thấp giữa máy khách và máy chủ. Kết nối Socket.IO có thể được thiết lập bằng nhiều phương thức vận chuyển cấp thấp khác nhau: HTTP long-polling, WebSocket và WebTransport. Socket.IO sẽ tự động chọn tùy chọn khả dụng tốt nhất, tùy thuộc vào: khả năng của trình duyệt và mạng (một số mạng chặn kết nối WebSocket và/hoặc WebTransport) [14].

#### 2.3.2 Cloudinary

Cloudinary là một dịch vụ điện toán đám mây cung cấp giải pháp quản lý tài sản đa phương tiện cho website và ứng dụng di động. Nó giúp tải lên, lưu trữ, quản lý, chỉnh sửa, tối ưu hóa và phân phối hình ảnh, video và các tệp khác một cách hiệu quả, bao gồm cả việc chuyển đổi định dạng và áp dụng các hiệu ứng tự động. Nền tảng này sử dụng mạng lưới phân phối nội dung (CDN) để tối ưu hóa tốc độ tải trang và cung cấp API để dễ dàng tích hợp vào các ứng dụng [15].

#### 2.3.3 ZegoCloud

ZegoCloud là nhà cung cấp dịch vụ truyền thông đám mây cung cấp giải pháp trò chuyện trong ứng dụng mạnh mẽ cho các ứng dụng React Native. Giải pháp trò chuyện React Native của ZegoCloud là một SDK mạnh mẽ cho phép các nhà phát triển thêm các tính năng nhắn tin thời gian thực vào ứng dụng của họ chỉ bằng một vài dòng mã. SDK được thiết kế để dễ sử dụng và tích hợp, đồng thời đi kèm với

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

một loạt các tính năng và tùy chọn tùy chỉnh cho phép các nhà phát triển tạo giao diện trò chuyện phù hợp với giao diện của ứng dụng [16].

#### 2.3.4 Gemini API

API Google Gemini là một công cụ cực kỳ mạnh mẽ mà nhiều nhà phát triển ngày nay có thể sử dụng cho các chương trình, ứng dụng và doanh nghiệp nhỏ. Với khả năng xử lý cả văn bản và hình ảnh đầu vào, API Gemini có thể cung cấp cho người dùng những phản hồi sâu sắc, bao gồm các suy luận thông minh, dựa trên ngữ cảnh [17].

#### 2.3.5 TailwindCSS

Tailwind CSS là một framework CSS "utility-first" (ưu tiên tiện ích) cho phép bạn xây dựng giao diện người dùng (UI) một cách nhanh chóng bằng cách sử dụng các lớp CSS nhỏ, có tên theo chức năng cụ thể (utility classes) thay vì viết CSS thủ công hoặc sử dụng các thành phần thiết kế có sẵn. Thay vì cung cấp các component (thành phần) như các framework truyền thống, Tailwind cung cấp các "khối xây dựng" để bạn tự tạo nên giao diện tùy chỉnh cho riêng mình [18].

#### 2.3.6 Google Cloud Platform

Google Cloud Platform (GCP) là bộ công cụ điện toán đám mây toàn diện cung cấp các giải pháp tiên tiến về lưu trữ, máy học và trí tuệ nhân tạo. Trong khuôn khổ đề tài, nhóm sử dụng Google Cloud Speech-to-Text API như một thành phần công nghệ cốt lõi để hiện thực hóa chức năng Luyện nói (Speaking). API này được tích hợp để xử lý tín hiệu âm thanh từ người dùng, thực hiện chuyển đổi giọng nói thành văn bản (Speech-to-Text) theo thời gian thực với độ chính xác cao. Kết quả văn bản đầu ra đóng vai trò quyết định giúp hệ thống so khớp, phân tích và đánh giá mức độ phát âm chính xác của người học so với nội dung mẫu [19].

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

#### 2.3.7 Sepay

SePay là công ty fintech tiên phong trong lĩnh vực chuyển đổi số thanh toán chuyển khoản ngân hàng. SePay hiện đã kết nối với hơn 19 ngân hàng tại Việt Nam, là đối tác chiến lược của Ngân hàng OCB, KienlongBank, MSB, MBBank, BIDV. Được nhiều đối tác và khách hàng tin tưởng trên cả nước [20]. Sepay là công cụ giúp bạn chia sẻ biến động số dư ngân hàng. Tự xác thực thanh toán cho ứng dụng bán hàng khi khách chuyển khoản. SePay có thể gọi WebHooks/ API đến ứng dụng bán hàng của bạn để xác thực thanh toán. Việc này giúp tự động hóa thanh toán 100% mà không cần nhân sự kiểm tra giao dịch [21]. Và trong dự án này, Sepay đóng vai trò là một webhooks/API thông báo biến động số dư để cập nhật trạng thái thanh toán của hệ thống. Đồng thời, tạo mã QR thanh toán cho các dịch vụ của hệ thống.

Hình 2.1 Mô hình hoạt động của Sepay

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 2.4 Cơ sở dữ liệu

#### 2.4.1 MongoDB

MongoDB là một cơ sở dữ liệu đa năng, nổi bật với sự mạnh mẽ, linh hoạt và khả năng mở rộng vượt trội. Sử dụng mô hình hướng tài liệu, MongoDB cho phép biểu diễn dữ liệu phức tạp một cách trực quan và không yêu cầu lược đồ cố định, giúp đơn giản hóa quá trình phát triển. Khả năng mở rộng theo chiều ngang của MongoDB giúp dễ dàng phân chia dữ liệu trên nhiều máy chủ, đáp ứng nhu cầu xử lý dữ liệu lớn. MongoDB còn cung cấp một loạt tính năng mạnh mẽ như lập chỉ mục, tổng hợp và lưu trữ tệp, đồng thời được tối ưu hóa để đạt hiệu năng cao [22]. Với những ưu điểm này, MongoDB là lựa chọn lý tưởng cho các ứng dụng hiện đại đòi hỏi sự linh hoạt, khả năng mở rộng và tốc độ xử lý nhanh chóng.

#### 2.4.2 Supabase (PostgreSQL)

Supabase là một nền tảng Backend as a Service (BaaS) mã nguồn mở, cung cấp một bộ công cụ để xây dựng ứng dụng nhanh chóng mà không cần tự quản lý máy chủ [23]. Điểm nổi bật của nó là sử dụng PostgreSQL làm cơ sở dữ liệu cốt lõi và cung cấp các tính năng như cơ sở dữ liệu thời gian thực, xác thực người dùng, lưu trữ tệp, và các chức năng không máy chủ (serverless functions). Supabase là một giải pháp thay thế mã nguồn mở cho Firebase. PostgreSQL là một hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy và có hiệu năng cao. Nó hỗ trợ đầy đủ các tính năng quan trọng của một hệ quản trị cơ sở dữ liệu hiện đại, bao gồm giao dịch, truy vấn con, view, khóa ngoại, kiểm soát đồng thời đa phiên bản, và nhiều tính năng nâng cao khác như kiểu dữ liệu do người dùng định nghĩa, kế thừa và quy tắc. PostgreSQL nổi tiếng với sự ổn định, khả năng tương thích cao với chuẩn Structured Query Language, và cộng đồng người dùng lớn mạnh. Hệ thống này hoạt động trên hầu hết các nền tảng UNIX và Windows, đồng thời là một phần mềm mã nguồn mở hoàn toàn miễn phí. PostgreSQL là một lựa chọn tuyệt vời cho các ứng dụng yêu cầu tính toàn vẹn dữ liệu cao, khả năng mở rộng và hiệu năng tốt [24].

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 2.5 Các kiến trúc phần mềm áp dụng

#### 2.5.1 Client-Server

Kiến trúc client-server là một mô hình mạng phân tán, nơi các máy khách (client) gửi yêu cầu dịch vụ đến một máy chủ (server) tập trung để xử lý và nhận lại phản hồi. Máy chủ lưu trữ tài nguyên và xử lý dữ liệu, còn máy khách là các thiết bị đầu cuối như máy tính hoặc điện thoại thực hiện việc truy cập và sử dụng dịch vụ. Mối liên lạc này dựa trên các giao thức mạng như TCP/IP để đảm bảo hai bên có thể giao tiếp hiệu quả.

Hình 2.2 Mô hình Client-Server

#### 2.5.2 RESTful API

RESTful API là một kiểu thiết kế cho các dịch vụ web, cho phép các ứng dụng giao tiếp với nhau bằng cách sử dụng giao thức HTTP để trao đổi dữ liệu. REST (Representational State Transfer) là tên của phong cách kiến trúc này, và nó sử dụng các phương thức HTTP như GET, POST, PUT, DELETE để thực hiện các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) trên các tài nguyên được định danh bằng URL duy nhất. Dữ liệu thường được trao đổi dưới định dạng chuẩn như JSON hoặc XML.

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

Hình 2.3 Các nguyên tắc của RESTful API

#### 2.5.3 Real-time Communication

Real-time Communication (RTC) là một hệ thống cho phép trao đổi dữ liệu, âm thanh và video gần như đồng thời với độ trễ tối thiểu giữa các điểm cuối. Một trong những công nghệ phổ biến nhất cho kiến trúc này là **WebRTC (Web Real-** **Time Communication)**, cho phép kết nối trực tiếp theo mô hình ngang hàng (peer to-peer) giữa các trình duyệt hoặc ứng dụng di động, không cần phần mềm hay plugin trung gian.

Hình 2.4 Phương thức hoạt động của RTC

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### 2.6 Hosting

#### 2.6.1 Digital Ocean

DigitalOcean là một nền tảng điện toán đám mây (IaaS) cung cấp các máy chủ riêng ảo (được gọi là Droplets), được thiết kế tối ưu để giúp các nhà phát triển triển khai và mở rộng ứng dụng web một cách nhanh chóng, hiệu quả. Với ưu điểm vượt trội về hiệu năng nhờ sử dụng ổ cứng SSD tốc độ cao, giao diện quản trị trực quan và chi phí hợp lý, đây là giải pháp hạ tầng lý tưởng cho các dự án phần mềm hiện đại. DigitalOcean được lựa chọn làm môi trường hosting chính để triển khai cả Frontend (Website) và Backend (API Server), đảm bảo hệ thống SocialLearning vận hành ổn định và người dùng có thể truy cập liên tục trên môi trường Internet [25].

_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
