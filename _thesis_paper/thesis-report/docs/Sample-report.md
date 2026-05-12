## **BỘ CÔNG THƯƠNG** **TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM** **KHOA CÔNG NGHỆ THÔNG TIN** **TRƯƠNG QUỐC BẢO** **NGUYỄN THANH THUẬN**

# **XÂY DỰNG NỀN TẢNG MẠNG XÃ HỘI HỖ TRỢ** **HỌC TẬP TIẾNG ANH VÀ GIAO TIẾP ĐA** **PHƯƠNG TIỆN**

### **Ngành: Kỹ Thuật Phần Mềm** **Giảng viên hướng dẫn: ThS. Nguyễn Thị Hoàng Khánh**

**TP. HỒ CHÍ MINH, THÁNG 12 NĂM 2025**
## **MINISTRY OF INDUSTRY AND TRADE** **INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY** **FACULTY OF INFORMATION TECHNOLOGY**


## **TRUONG QUOC BAO** **NGUYEN THANH THUAN**

# **BUILDING A SOCIAL NETWORK PLATFORM TO** **SUPPORT ENGLISH LEARNING AND** **MULTIMEDIA COMMUNICATION**

### **Major: Software Engineering** **Instructor: MSc. Nguyen Thi Hoang Khanh**

**HO CHI MINH CITY, DEC 2025**


## **BUIDING A SOCIAL NETWORK PLATFORM TO** **SUPPORT ENGLISH LEARNING AND MULTIMEDIA** **COMMUNICATION**

### **ABSTRACT**

In the context of the growing prevalence of online learning, integrating social


elements into foreign language learning environments has become an inevitable


trend. However, most existing English learning platforms still lack meaningful


learner interaction, fail to leverage multimedia effectively, and provide limited


personalization in learning pathways. This thesis introduces Social-Learning, an


English-learning social network platform developed using a Client-Server


architecture. The platform seamlessly combines learning features (listening, writing,


and speaking practice, personalized vocabulary building, and learning path


recommendations) with social networking functionalities (posting, commenting,


making friends) and multimedia communication tools (messaging, voice calls, video


calls). The system is built with Next.js, Node.js, Express.js, React Native, Supabase,


and MongoDB, and notably integrates Gemini API for AI-driven feedback and


Socket.IO/ZegoCloud for real-time communication. Experimental results


demonstrate that the platform operates stably, successfully creating a dynamic,


interactive, and accessible learning environment. In conclusion, the project not only


enhances learner motivation and community engagement but also validates the


practical application of artificial intelligence in personalizing English learning


content.


**Keywords:** Social Learning, English Learning, Multimedia Communication, React


Native, Next.js, AI Integration, Gemini API, Real-time Communication.


_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **LỜI CẢM ƠN**


Khóa luận tốt nghiệp không chỉ là cột mốc khép lại chặng đường đại học mà


còn là bước đệm quan trọng để chúng em vững tin bước vào môi trường làm việc


thực tế. Để hoàn thành đề tài này, bên cạnh sự nỗ lực và tâm huyết của cả nhóm,


chúng em đã nhận được sự động viên và hỗ trợ to lớn từ nhiều nguồn kiến thức quý


báu.


Lời tri ân sâu sắc nhất, chúng em xin trân trọng gửi đến ThS. Nguyễn Thị


Hoàng Khánh. Trong suốt thời gian thực hiện đề tài, Cô đã luôn tận tình định


hướng, chỉ bảo và chia sẻ những kinh nghiệm thực tiễn vô cùng giá trị. Sự hướng


dẫn sát sao của Cô chính là kim chỉ nam giúp chúng em khắc phục những thiếu sót


và hoàn thiện sản phẩm một cách tốt nhất.


Chúng em cũng xin gửi lời cảm ơn chân thành đến Quý Thầy Cô trường Đại


học Công nghiệp TP.HCM. Những kiến thức nền tảng và kỹ năng mềm mà Thầy Cô


truyền đạt trong suốt 4 năm qua chính là hành trang vững chắc để chúng em thực


hiện đồ án này cũng như phát triển sự nghiệp trong tương lai.


Cuối cùng, chúng em xin cảm ơn Ban Giám hiệu nhà trường đã luôn tạo điều


kiện thuận lợi về cơ sở vật chất và môi trường học tập, giúp sinh viên phát huy tối


đa năng lực của mình.


Chúng em xin chân thành cảm ơn!


TP. Hồ Chí Minh, ngày 06 tháng 12 năm 2025


**Sinh viên thực hiện**


Trương Quốc Bảo


Nguyễn Thanh Thuận






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN**


………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………


TP. Hồ Chí Minh, ngày … tháng … năm 20…


**GIẢNG VIÊN HƯỚNG DẪN**
_(Ký và ghi rõ họ tên)_






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **NHẬN XÉT CỦA GIẢNG VIÊN PHẢN BIỆN 1**


………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………


TP. Hồ Chí Minh, ngày … tháng … năm 20…


**GIẢNG VIÊN PHẢN BIỆN 1**
_(Ký và ghi rõ họ tên)_






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **NHẬN XÉT CỦA GIẢNG VIÊN PHẢN BIỆN 2**


………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………
………………………………………………………………………………………


TP. Hồ Chí Minh, ngày … tháng … năm 20…


**GIẢNG VIÊN PHẢN BIỆN 2**
_(Ký và ghi rõ họ tên)_






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **MỤC LỤC**


LỜI CẢM ƠN ............................................................................................................. i


MỤC LỤC ................................................................................................................... v


DANH MỤC CÁC HÌNH ẢNH ............................................................................. viii


DANH MỤC CÁC BẢNG BIỂU ............................................................................. xi


DANH MỤC CÁC TỪ VIẾT TẮT ......................................................................... xii


LỜI MỞ ĐẦU ............................................................................................................. 1


CHƯƠNG 1 : GIỚI THIỆU ........................................................................................ 2


1.1 Tổng quan ......................................................................................................... 2

1.2 Mục tiêu đề tài .................................................................................................. 3

1.3 Phạm vi đề tài ................................................................................................... 3

1.4 Mô tả yêu cầu chức năng .................................................................................. 4

1.5 Các ràng buộc và quy tắc quản lý ..................................................................... 4

1.6 Mô tả yêu cầu phi chức năng ............................................................................ 4
CHƯƠNG 2 : CƠ SỞ LÝ THUYẾT .......................................................................... 6


2.1 Ngôn ngữ lập trình sử dụng .............................................................................. 6

2.1.1 Javascript ................................................................................................... 6

2.1.2 TypeScript ................................................................................................. 6

2.2 Các framework phát triển ứng dụng ................................................................. 7

2.2.1 ReactJS ...................................................................................................... 7

2.2.2 Next.js ........................................................................................................ 7

2.2.3 React Native .............................................................................................. 8

2.2.4 Express.js ................................................................................................... 8

2.3 Các công nghệ và thư viện hỗ trợ ..................................................................... 9

2.3.1 Socket.IO ................................................................................................... 9

2.3.2 Cloudinary ................................................................................................. 9

2.3.3 ZegoCloud ................................................................................................. 9

2.3.4 Gemini API .............................................................................................. 10

2.3.5 TailwindCSS ........................................................................................... 10

2.3.6 Google Cloud Platform ........................................................................... 10

2.3.7 Sepay ....................................................................................................... 11






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


2.4 Cơ sở dữ liệu ................................................................................................... 12

2.4.1 MongoDB ................................................................................................ 12

2.4.2 Supabase (PostgreSQL) ........................................................................... 12

2.5 Các kiến trúc phần mềm áp dụng ................................................................... 13

2.5.1 Client-Server............................................................................................ 13

2.5.2 RESTful API ........................................................................................... 13

2.5.3 Real-time Communication ...................................................................... 14

2.6 Hosting ............................................................................................................ 15

2.6.1 Digital Ocean ........................................................................................... 15
CHƯƠNG 3 : PHÂN TÍCH ...................................................................................... 16


3.1 Quy trình nghiệp vụ ........................................................................................ 16

3.2 Use-case tổng quát .......................................................................................... 23

3.3 Danh sách tác nhân và mô tả .......................................................................... 24

3.4 Danh sách các tình huống hoạt động chính .................................................... 25

3.5 Đặc tả các yêu cầu chức năng ......................................................................... 30

3.5.1 UC01_Đăng kí ......................................................................................... 30

3.5.2 UC02_Đăng nhập .................................................................................... 34

3.5.3 UC03_Tạo bài đăng ................................................................................. 38

3.5.4 UC04_Nhắn tin ........................................................................................ 42

3.5.5 UC06_Luyện viết đoạn ........................................................................... 46

3.5.6 UC07_Luyện nghe .................................................................................. 52

3.5.7 UC08_Luyện nói ..................................................................................... 59

3.5.8 UC10_Học từ vựng ................................................................................. 67

3.5.9 UC12_Tạo lộ trình học tập ...................................................................... 72
CHƯƠNG 4 : THIẾT KẾ VÀ HIỆN THỰC ............................................................ 79


4.1 Sơ đồ lớp ......................................................................................................... 79

4.2 Sơ đồ cơ sở dữ liệu ......................................................................................... 80

4.2.1 Sơ đồ cơ sở dữ liệu có cấu trúc ............................................................... 80

4.2.2 Sơ đồ cơ sở dữ liệu không có cấu trúc .................................................... 82

4.3 Sơ đồ kiến trúc phần mềm .............................................................................. 83

4.4 Sơ đồ luồng màn hình ..................................................................................... 84

4.4.1 Sơ đồ luồng màn hình website ................................................................ 84






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


4.4.2 Sơ đồ luồng màn hình mobile ................................................................. 84

4.5 Giao diện chương trình ................................................................................... 85

4.5.1 Giao diện trang chủ ................................................................................. 85

4.5.2 Giao diện người dùng chính .................................................................... 86

4.5.3 Giao diện tin nhắn ................................................................................... 87

4.5.4 Giao diện trang cá nhân ........................................................................... 89

4.5.5 Giao diện luyện viết ................................................................................ 89

4.5.6 Giao diện luyện nghe ............................................................................... 92

4.5.7 Giao diện luyện nói ................................................................................. 93

4.5.8 Giao diện từ vựng cá nhân ....................................................................... 96

4.5.9 Giao diện lộ trình học tập ........................................................................ 99

4.5.10 Giao diện thanh toán ............................................................................ 100

4.5.11 Giao diện admin .................................................................................. 101

4.6 Kiểm thử hệ thống ........................................................................................ 102

4.6.1 Danh sách các test-case ......................................................................... 102

4.6.2 Bảng báo cáo kết quả kiểm thử ............................................................. 109
CHƯƠNG 5 : KẾT LUẬN ..................................................................................... 115


5.1 Kết quả đạt được ........................................................................................... 115

5.1.1 Về mặt công nghệ và kiến trúc hệ thống ............................................... 115

5.1.2 Về mặt chức năng nghiệp vụ ................................................................. 116

5.2 Hạn chế của đồ án ......................................................................................... 117

5.3 Hướng phát triển ........................................................................................... 118
TÀI LIỆU THAM KHẢO ....................................................................................... 120


PHỤ LỤC ................................................................................................................ 122






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **DANH MỤC CÁC HÌNH ẢNH**


Hình 2.1 Mô hình hoạt động của Sepay .................................................................... 11


Hình 2.2 Mô hình Client-Server............................................................................... 13


Hình 2.3 Các nguyên tắc của RESTful API .............................................................. 14


Hình 2.4 Phương thức hoạt động của RTC ............................................................... 14


Hình 3.1 Mô hình Use-case tổng quát của SocialLearning....................................... 23


Hình 3.2 Đặc tả activity đăng kí................................................................................ 31


Hình 3.3 Sơ đồ trình tự đăng kí ................................................................................. 32


Hình 3.4 Đặc tả activity đăng nhập ........................................................................... 35


Hình 3.5 Sơ đồ trình tự đăng nhập ............................................................................ 36


Hình 3.6 Đặc tả activity tạo bài đăng ........................................................................ 39


Hình 3.7 Sơ đồ trình tự tạo bài đăng ......................................................................... 40


Hình 3.8 Đặc tả activity nhắn tin .............................................................................. 43


Hình 3.9 Sơ đồ trình tự nhắn tin ................................................................................ 44


Hình 3.10 Đặc tả activity luyện viết đoạn ................................................................. 48


Hình 3.11 Sơ đồ trình tự chọn bài tập luyện viết từ hệ thống ................................... 49


Hình 3.12 Sơ đồ trình tự chọn tạo bài tập luyện viết bằng AI .................................. 49


Hình 3.13 Sơ đồ trình tự làm bài tập luyện viết ........................................................ 50


Hình 3.14 Đặc tả activity luyện nghe ........................................................................ 54


Hình 3.15 Sơ đồ trình tự chọn bài tập luyện nghe từ hệ thống ................................. 55


Hình 3.16 Sơ đồ trình tự chọn tạo bài tập luyện nghe bằng AI ................................ 55


Hình 3.17 Sơ đồ tuần tự hiển thị giao diện bài làm luyện nghe ................................ 56


Hình 3.18 Sơ đồ trình tự làm bài tập luyện nghe ...................................................... 57


Hình 3.19 Đặc tả activity luyện nói .......................................................................... 61


Hình 3.20 Sơ đồ trình tự chọn chế độ luyện nói solo với bài tập hệ thống............... 62


Hình 3.21 Sơ đồ trình tự chọn chế độ luyện nói solo với bài tập AI tạo .................. 62






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 3.22 Sơ đồ trình tự chọn chế độ bài tập luyện nói hội thoại với AI ................. 63


Hình 3.23 Sơ đồ trình tự làm bài tập ở chế độ (solo với hệ thống, solo với AI, hội


thoại với AI) .............................................................................................................. 63


Hình 3.24 Sơ đồ trình tự luyện nói hội thoại real-time với AI ................................. 64


Hình 3.25 Đặc tả activity học từ vựng ...................................................................... 68


Hình 3.26 Sơ đồ trình tự học từ vựng ....................................................................... 69


Hình 3.27 Đặc tả activity lộ trình học tập ................................................................. 75


Hình 3.28 Sơ đồ trình tự lộ trình học tập .................................................................. 76


Hình 3.29 Sơ đồ luồng tạo lộ trình cá nhân ............................................................. 77


Hình 4.1 Sơ đồ lớp mà social và cá nhân hóa ........................................................... 79


Hình 4.2 Sơ đồ lớp phần learning ............................................................................. 79


Hình 4.3 Sơ đồ cơ sở dữ liệu Social có cấu trúc (SQL) ............................................ 80


Hình 4.4 Sơ đồ cơ sở dữ liệu Learning có cấu trúc (SQL) ....................................... 81


Hình 4.5 Sơ đồ cơ sở dữ liệu không có cấu trúc (NoSQL) ....................................... 82


Hình 4.6 Sơ đồ kiến trúc hệ thống ............................................................................ 83


Hình 4.7 Luồng màn hình website ............................................................................ 84


Hình 4.8 Luồng màn hình mobile ............................................................................. 84


Hình 4.9 Giao diện trang chủ .................................................................................... 85


Hình 4.10 Giao diện người dùng chính ..................................................................... 86


Hình 4.11 Giao diện tin nhắn khi mới click vào ....................................................... 87


Hình 4.12 Giao diện nhắn tin với bạn bè .................................................................. 88


Hình 4.13 Giao diện nhắn tin nhóm .......................................................................... 88


Hình 4.14 Giao diện trang cá nhân của người dùng ................................................. 89


Hình 4.15 Giao diện luyện viết (Chọn Level & Topic) ............................................ 89


Hình 4.16 Chọn chế độ luyện viết ............................................................................. 90


Hình 4.17 Danh sách bài viết .................................................................................... 90






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.18 Giao diện trước khi làm bài viết............................................................... 91


Hình 4.19 Giao diện sau khi làm bài viết .................................................................. 92


Hình 4.20 Giao diện luyện nghe ............................................................................... 93


Hình 4.21 Giao diện chọn loại bài nói ...................................................................... 94


Hình 4.22 Giao diện làm bài luyện nói cá nhân ........................................................ 94


Hình 4.23 Giao diện luyện nói với AI (1) ................................................................. 95


Hình 4.24 Giao diện luyện nói với AI (2) ................................................................. 96


Hình 4.25 Giao diện từ vựng cá nhân ....................................................................... 97


Hình 4.26 Giao diện từ vựng ở Tổng quan ............................................................... 98


Hình 4.27 Giao diện chi tiết từ vựng ......................................................................... 98


Hình 4.28 Giao diện lộ trình học tập ......................................................................... 99


Hình 4.29 Giao diện chi tiết lộ trình học tập ............................................................. 99


Hình 4.30 Giao diện thanh toán .............................................................................. 100


Hình 4.31 Giao diện admin ..................................................................................... 101






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **DANH MỤC CÁC BẢNG BIỂU**


Bảng 3.1 Danh sách các tác nhân .............................................................................. 24


Bảng 3.2 Danh sách các use case .............................................................................. 25


Bảng 3.3 Đặc tả chức năng đăng kí tài khoản ........................................................... 30


Bảng 3.4 Đặc tả chức năng đăng nhập ...................................................................... 34


Bảng 3.5 Đặc tả chức năng tạo bài đăng ................................................................... 38


Bảng 3.6 Đặc tả chức năng nhắn tin ......................................................................... 42


Bảng 3.7 Đặc tả chức năng luyện viết đoạn .............................................................. 46


Bảng 3.8 Đặc tả chức năng luyện nghe ..................................................................... 52


Bảng 3.9 Đặc tả chức năng luyện nói ....................................................................... 59


Bảng 3.10 Đặc tả chức năng học từ vựng ................................................................. 67


Bảng 3.11 Đặt tả chức năng tạo lộ trình học tập ....................................................... 72


Bảng 4.1 Danh sách test case .................................................................................. 102


Bảng 4.2 Báo cáo kết quả kiểm thử ........................................................................ 109






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **DANH MỤC CÁC TỪ VIẾT TẮT**


|STT|Ký hiệu chữ viết tắt|Chữ viết đầy đủ|
|---|---|---|
|1|2FA|Two-Factor Authentication|
|2|AI|Artificial Intelligence|
|3|API|Application Programming Interface|
|4|BaaS|Backend as a Service|
|5|CCU|Concurrent Users|
|6|CDN|Content Delivery Network|
|7|CMS|Content Management System|
|8|CRUD|Create, Read, Update, Delete|
|9|CSDL|Cơ sở dữ liệu (Database)|
|10|CSS|Cascading Style Sheets|
|11|EFL|English as a Foreign Language|
|12|ESL|English as a Second Language|
|13|GCP|Google Cloud Platform|
|14|HTML|HyperText Markup Language|
|15|HTTP|Hypertext Transfer Protocol|
|16|IaaS|Infrastructure as a Service|
|17|IELTS|International English Language Testing System|
|18|JSON|JavaScript Object Notation|
|19|JSX|JavaScript XML|
|20|OTP|One Time Password|
|21|REST|Representational State Transfer|
|22|RTC|Real-time Communication|
|23|SDGs|Sustainable Development Goals|
|24|SDK|Software Development Kit|
|25|SEO|Search Engine Optimization|
|26|SQL|Structured Query Language|
|27|TCP/IP|Transmission Control Protocol/Internet Protocol|
|28|TOEIC|Test of English for International|
|29|UC|Use Case|
|30|UI|User Interface|
|31|URL|Uniform Resource Locator|
|32|WebRTC|Web Real-Time Communication|
|33|XML|Extensible Markup Language|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **LỜI MỞ ĐẦU**


Trong bối cảnh Cách mạng công nghiệp 4.0, ứng dụng công nghệ số kết hợp


mạng xã hội trong giáo dục ngoại ngữ đã trở thành xu hướng tất yếu giúp người học


tiếp cận kiến thức linh hoạt. Mặc dù các nền tảng phổ biến (Facebook, Youtube, …)


đã chứng minh hiệu quả trong việc duy trì động lực và tăng cường tương tác, đặc


biệt trong giai đoạn dịch COVID-19, nhưng chúng vẫn bộc lộ hạn chế về tính xao


nhãng và thiếu định hướng học thuật chuyên sâu. Nhận thấy sự thiếu hụt các giải


pháp chuyên biệt tại Việt Nam, đề tài **“Xây dựng nền tảng mạng xã hội hỗ trợ**


**học tập tiếng Anh và giao tiếp đa phương tiện”** được thực hiện nhằm khắc phục


các bất cập trên. Nghiên cứu không chỉ đóng góp về mặt khoa học thông qua việc


làm phong phú lý thuyết giáo dục dựa trên công nghệ và mô hình học tập lai


(Blended Learning), mà còn mang lại ý nghĩa thực tiễn sâu sắc: cung cấp một công


cụ miễn phí, tối ưu hóa tương tác thầy - trò, xóa bỏ rào cản địa lý và đáp ứng nhu


cầu nhân lực chất lượng cao trong thời kỳ hội nhập.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **CHƯƠNG 1: GIỚI THIỆU**


**1.1** **Tổng quan**


Trong bối cảnh toàn cầu hóa, tiếng Anh ngày càng trở thành ngôn ngữ phổ


biến và giữ vai trò quan trọng trong học tập, công việc và giao tiếp quốc tế. Nhu cầu


học và rèn luyện tiếng Anh tại Việt Nam cũng như trên thế giới ngày càng gia tăng,


đặc biệt với hình thức học trực tuyến thông qua các nền tảng internet. Theo thống kê


của Statista (2024), số lượng người dùng các ứng dụng học ngoại ngữ trực tuyến đã


vượt hơn 500 triệu, trong đó những nền tảng nổi bật như Duolingo, Memrise hay


Elsa Speak được sử dụng rộng rãi [7].


Tuy nhiên, các ứng dụng này còn nhiều hạn chế, chẳng hạn:


    - Thiếu yếu tố **tương tác xã hội** khiến người học dễ mất động lực và học


tập mang tính cá nhân nhiều hơn là cộng đồng.


    - Chưa tận dụng tối đa khả năng của **đa phương tiện** (multimedia) để hỗ trợ


kỹ năng nghe và viết.


    - Chưa có sự kết hợp giữa yếu tố **mạng xã hội** và **học tập ngôn ngữ**, trong


khi các nghiên cứu đã chỉ ra rằng học tập cộng đồng giúp người học duy


trì thói quen lâu dài và đạt kết quả tốt hơn (Vygotsky, 1978) [2].


Chính vì vậy, việc **xây dựng một nền tảng mạng xã hội hỗ trợ học tập tiếng**


**Anh và giao tiếp đa phương tiện** là cần thiết. Nền tảng này không chỉ mang đến


môi trường học tập cộng đồng, mà còn cung cấp các công cụ thực hành tiếng Anh


một cách đa dạng và sinh động.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**1.2** **Mục tiêu đề tài**


Đề tài hướng đến việc xây dựng một nền tảng tích hợp giữa mạng xã hội và


công cụ học tập tiếng Anh, nhằm tạo ra môi trường học tập năng động, thực tế và


gắn kết cộng đồng.


Các mục tiêu cụ thể:


    - Xây dựng hệ thống quản lý tài khoản và hồ sơ học tập cá nhân.


    - Phát triển các chức năng học tập: luyện viết câu/đoạn văn, luyện nói, quản


lý và ôn tập từ vựng.


    - Tích hợp các tính năng xã hội: kết bạn, đăng bài, bình luận, chia sẻ, tương


tác.


    - Cung cấp công cụ giao tiếp đa phương tiện: nhắn tin, gọi thoại, gọi video


thời gian thực.


    - Xây dựng hệ thống bảng xếp hạng và điểm thưởng để tạo động lực học


tập.


    - Xây dựng chức năng quản trị hệ thống cho admin: quản lý người dùng,


giám sát nội dung và xử lý vi phạm.


**1.3** **Phạm vi đề tài**


**Đối tượng sử dụng:** Sinh viên, người đi làm và cá nhân có nhu cầu rèn luyện


tiếng Anh ở mức cơ bản đến nâng cao.


**Phạm vi chức năng:**


    - Bao gồm: quản lý tài khoản, chia sẻ bài học, tương tác mạng xã hội, quản


lý từ vựng, nhắn tin - gọi điện, bảng xếp hạng, chức năng quản trị hệ


thống.


    - Không bao gồm: các khóa học chứng chỉ tiếng Anh (IELTS, TOEIC…),


hệ thống chấm điểm chuẩn hóa theo chuẩn quốc tế, hoặc tích hợp trí tuệ


nhân tạo nâng cao (ví dụ: đánh giá phát âm chi tiết như trong ứng dụng


chuyên biệt).






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**1.4** **Mô tả yêu cầu chức năng**


Người dùng:


    - Quản lý tài khoản: đăng ký, đăng nhập, xác thực, cập nhật thông tin cá


nhân.


    - Học tập:

     - Luyện viết dịch thuật theo chủ đề (câu, đoạn văn)

     - Luyện nghe chép chính tả theo chủ đề

     - Luyện nói theo câu

     - Quản lý từ vựng cá nhân (thêm, xóa, sửa từ vựng)

     - Ôn luyện từ vựng (quiz, spaced repetition)


    - Mạng xã hội: đăng bài viết, bình luận, thích, chia sẻ, kết nối bạn bè.


    - Giao tiếp đa phương tiện: nhắn tin thời gian thực, gọi thoại và video call.


Admin:


    - Quản lý người dùng: xem danh sách, khóa/mở tài khoản, xử lý báo cáo vi


phạm.


    - Quản lý hệ thống: giám sát hoạt động, thống kê lượt truy cập và khiếu nại.


    - Quản lý học tập: quản lý cá bài tập (luyện viết, luyện nghe, luyện nói), các


thành tích.


**1.5** **Các ràng buộc và quy tắc quản lý**


    - Hệ thống chỉ hỗ trợ nền tảng web và ứng dụng di động (Android).


    - Số lượng người dùng giai đoạn đầu dự kiến < 1000.


    - Không triển khai AI nâng cao (như chấm điểm phát âm chi tiết).


    - Hệ thống phải đảm bảo tính bảo mật: tất cả mật khẩu được mã hóa.


**1.6** **Mô tả yêu cầu phi chức năng**


Ngoài các yêu cầu chức năng, hệ thống cần đáp ứng các yêu cầu phi chức


năng nhằm đảm bảo tính ổn định, hiệu quả và an toàn khi vận hành:
## - Hiệu năng: Thời gian phản hồi < 3 giây cho các thao tác thông thường.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## - Bảo mật: Dữ liệu cá nhân được mã hóa, xác thực 2 lớp (2FA). - Khả năng mở rộng: Hệ thống được xây dựng theo kiến trúc client-server.


Khi quy mô người dùng tăng, cần theo dõi tải hệ thống để có kế hoạch


nâng cấp hạ tầng kịp thời
## - Khả dụng: Đảm bảo thời gian hoạt động tối thiểu 90% trong giai đoạn


vận hành.
## - Trải nghiệm người dùng: Giao diện thân thiện, dễ sử dụng.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **CHƯƠNG 2: CƠ SỞ LÝ THUYẾT**


**2.1** **Ngôn ngữ lập trình sử dụng**


_**2.1.1**_ _**Javascript**_


JavaScript là ngôn ngữ lập trình của web. Phần lớn các trang web sử dụng


JavaScript và tất cả các trình duyệt web hiện đại trên máy tính để bàn, máy tính

bảng và điện thoại - bao gồm trình thông dịch JavaScript, khiến JavaScript trở


thành ngôn ngữ lập trình được triển khai nhiều nhất trong lịch sử. Trong thập kỷ


qua, Node.js đã cho phép lập trình JavaScript bên ngoài trình duyệt web và thành


công đáng kể của Node có nghĩa là JavaScript hiện cũng là ngôn ngữ lập trình được


sử dụng nhiều nhất trong số các nhà phát triển phần mềm [8].


_**2.1.2**_ _**TypeScript**_


TypeScript là một dự án mã nguồn mở được phát triển bởi Microsoft, nó có


thể được coi là một phiên bản nâng cao của Javascript bởi việc bổ sung tùy chọn


kiểu tĩnh và lớp hướng đối tượng mà điều này không có ở Javascript. TypeScript có


thể sử dụng để phát triển các ứng dụng chạy ở client-side (Angular2) và server-side


(NodeJS) [9].


TypeScript sử dụng tất cả các tính năng của của ECMAScript 2015 (ES6) như


classes, modules. Không dừng lại ở đó nếu như ECMAScript 2017 ra đời thì mình


tin chắc rằng TypeScript cũng sẽ nâng cấp phiên bản của mình lên để sử dụng mọi


kỹ thuật mới nhất từ ECMAScript. Thực ra TypeScript không phải ra đời đầu tiên


mà trước đây cũng có một số thư viện như CoffeScript và Dart được phát triển bởi


Google, tuy nhiên điểm yếu là hai thư viện này sư dụng cú pháp mới hoàn toàn,


điều này khác hoàn toàn với TypeScript, vì vậy tuy ra đời sau nhưng TypeScript


vẫn đang nhận được sự đón nhận từ các lập trình viên [9].






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**2.2** **Các framework phát triển ứng dụng**


_**2.2.1**_ _**ReactJS**_


React.js, thường được gọi là React, là một thư viện JavaScript mã nguồn mở


miễn phí. Nó hoạt động tốt nhất để xây dựng giao diện người dùng bằng cách kết


hợp các phần mã (thành phần) thành các trang web đầy đủ. Được xây dựng ban đầu


bởi Facebook, Meta và cộng đồng mã nguồn mở hiện đang duy trì nó. Một trong


những điều tuyệt vời về React là bạn có thể sử dụng nó nhiều hay ít tùy thích! Ví


dụ: bạn có thể xây dựng toàn bộ trang web của mình trong React hoặc chỉ sử dụng


một thành phần React duy nhất trên một trang. React.js được xây dựng bằng JSX –


Sự kết hợp giữa JavaScript và XML. Các thành phần được tạo bằng JSX, sau đó sử


dụng JavaScript để hiển thị chúng trên trang web của bạn. Mặc dù React có đường


cong học tập dốc đối với một nhà phát triển mới vào nghề, nhưng nó đang nhanh


chóng định hình thành một trong những thư viện JavaScript phổ biến và có nhu cầu


cao nhất. React được coi là một thư viện JavaScript chứ không phải là một khuôn


khổ, trong khi các tùy chọn khác mà chúng ta sẽ xem xét hôm nay được coi là


khuôn khổ. Sẽ hữu ích khi coi thư viện là một công cụ mà các nhà phát triển có thể


sử dụng trong bất kỳ dự án nào và khuôn khổ là một thiết kế tổng thể [10].


_**2.2.2**_ _**Next.js**_


Next.js là một mã nguồn mở được phát triển bởi Vercel và được ra mắt vào


năm 2016. Next.js cung cấp các ứng dụng web dựa trên React với khả năng tạo


trang web tĩnh và server-side rendering giúp nâng cao trải nghiệm người dùng, hiệu


suất trang web và tối ưu hoá công cụ tìm kiếm [11]. Với những tính năng mạnh mẽ


và linh hoạt, Next.js đã trở thành một trong những công cụ phát triển web được ưa


chuộng nhất trong cộng đồng React, đặc biệt là đối với các dự án thương mại điện


tử và ứng dụng web quy mô lớn.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**2.2.3**_ _**React Native**_


React Native là một khuôn khổ JavaScript để viết các ứng dụng di động thực


sự, hiển thị gốc cho iOS và Android. Nó dựa trên React, thư viện JavaScript của


Facebook để xây dựng giao diện người dùng, nhưng thay vì nhắm mục tiêu vào


trình duyệt, nó nhắm mục tiêu vào các nền tảng di động. Nói cách khác: các nhà


phát triển web hiện có thể viết các ứng dụng di động trông và cảm thấy thực sự


"gốc", tất cả đều từ sự thoải mái của một thư viện JavaScript mà chúng ta đã biết và


yêu thích. Thêm vào đó, vì hầu hết mã bạn viết có thể được chia sẻ giữa các nền


tảng, React Native giúp bạn dễ dàng phát triển đồng thời cho cả Android và iOS.


Tương tự như React cho Web, các ứng dụng React Native được viết bằng cách kết


hợp JavaScript và đánh dấu giống XML, được gọi là JSX. Sau đó, bên trong, "cầu


nối" React Native sẽ gọi các API hiển thị gốc trong Objective-C (cho iOS) hoặc


Java (cho Android). Do đó, ứng dụng của bạn sẽ hiển thị bằng các thành phần giao


diện người dùng di động thực sự, không phải chế độ xem web và sẽ trông và cảm


thấy giống như bất kỳ ứng dụng di động nào khác. React Native cũng hiển thị các


giao diện JavaScript cho các API nền tảng, do đó, các ứng dụng React Native của


bạn có thể truy cập các tính năng nền tảng như camera điện thoại hoặc vị trí của


người dùng. React Native hiện hỗ trợ cả iOS và Android, và có tiềm năng mở rộng


sang các nền tảng trong tương lai. Trong cuốn sách này, chúng tôi sẽ đề cập đến cả


iOS và Android. Phần lớn mã chúng tôi viết sẽ là đa nền tảng. Và vâng: bạn thực sự


có thể sử dụng React Native để xây dựng các ứng dụng di động sẵn sàng cho sản


xuất! Một số giai thoại: Facebook, Palantir và TaskRabbit đã sử dụng nó trong sản


xuất cho các ứng dụng hướng đến người dùng [12].


_**2.2.4**_ _**Express.js**_


Express.js là một khung ứng dụng web Node.js tối giản và linh hoạt, cung cấp


danh sách các tính năng để xây dựng các ứng dụng web và di động một cách dễ


dàng. Nó đơn giản hóa việc phát triển các ứng dụng phía máy chủ bằng cách cung


cấp một API dễ sử dụng cho các tiện ích định tuyến, phần mềm trung gian và HTTP


[13].






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Được xây dựng trên Node.js để phát triển phía máy chủ nhanh chóng và có thể


mở rộng.


Đơn giản hóa việc định tuyến và xử lý phần mềm trung gian cho các ứng dụng


website.


Hỗ trợ xây dựng REST API, ứng dụng thời gian thực và ứng dụng một trang.


Cung cấp một cấu trúc nhẹ để phát triển phía máy chủ linh hoạt và hiệu quả.


**2.3** **Các công nghệ và thư viện hỗ trợ**


_**2.3.1**_ _**Socket.IO**_


Socket.IO là một thư viện cho phép giao tiếp theo sự kiện, hai chiều và có độ


trễ thấp giữa máy khách và máy chủ. Kết nối Socket.IO có thể được thiết lập bằng


nhiều phương thức vận chuyển cấp thấp khác nhau: HTTP long-polling, WebSocket


và WebTransport. Socket.IO sẽ tự động chọn tùy chọn khả dụng tốt nhất, tùy thuộc


vào: khả năng của trình duyệt và mạng (một số mạng chặn kết nối WebSocket


và/hoặc WebTransport) [14].


_**2.3.2**_ _**Cloudinary**_


Cloudinary là một dịch vụ điện toán đám mây cung cấp giải pháp quản lý tài


sản đa phương tiện cho website và ứng dụng di động. Nó giúp tải lên, lưu trữ, quản


lý, chỉnh sửa, tối ưu hóa và phân phối hình ảnh, video và các tệp khác một cách hiệu


quả, bao gồm cả việc chuyển đổi định dạng và áp dụng các hiệu ứng tự động. Nền


tảng này sử dụng mạng lưới phân phối nội dung (CDN) để tối ưu hóa tốc độ tải


trang và cung cấp API để dễ dàng tích hợp vào các ứng dụng [15].


_**2.3.3**_ _**ZegoCloud**_


ZegoCloud là nhà cung cấp dịch vụ truyền thông đám mây cung cấp giải pháp


trò chuyện trong ứng dụng mạnh mẽ cho các ứng dụng React Native. Giải pháp trò


chuyện React Native của ZegoCloud là một SDK mạnh mẽ cho phép các nhà phát


triển thêm các tính năng nhắn tin thời gian thực vào ứng dụng của họ chỉ bằng một


vài dòng mã. SDK được thiết kế để dễ sử dụng và tích hợp, đồng thời đi kèm với






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


một loạt các tính năng và tùy chọn tùy chỉnh cho phép các nhà phát triển tạo giao


diện trò chuyện phù hợp với giao diện của ứng dụng [16].


_**2.3.4**_ _**Gemini API**_


API Google Gemini là một công cụ cực kỳ mạnh mẽ mà nhiều nhà phát triển


ngày nay có thể sử dụng cho các chương trình, ứng dụng và doanh nghiệp nhỏ. Với


khả năng xử lý cả văn bản và hình ảnh đầu vào, API Gemini có thể cung cấp cho


người dùng những phản hồi sâu sắc, bao gồm các suy luận thông minh, dựa trên


ngữ cảnh [17].


_**2.3.5**_ _**TailwindCSS**_


Tailwind CSS là một framework CSS "utility-first" (ưu tiên tiện ích) cho phép


bạn xây dựng giao diện người dùng (UI) một cách nhanh chóng bằng cách sử dụng


các lớp CSS nhỏ, có tên theo chức năng cụ thể (utility classes) thay vì viết CSS thủ


công hoặc sử dụng các thành phần thiết kế có sẵn. Thay vì cung cấp các component


(thành phần) như các framework truyền thống, Tailwind cung cấp các "khối xây


dựng" để bạn tự tạo nên giao diện tùy chỉnh cho riêng mình [18].


_**2.3.6**_ _**Google Cloud Platform**_


Google Cloud Platform (GCP) là bộ công cụ điện toán đám mây toàn diện


cung cấp các giải pháp tiên tiến về lưu trữ, máy học và trí tuệ nhân tạo. Trong


khuôn khổ đề tài, nhóm sử dụng Google Cloud Speech-to-Text API như một thành


phần công nghệ cốt lõi để hiện thực hóa chức năng Luyện nói (Speaking). API này


được tích hợp để xử lý tín hiệu âm thanh từ người dùng, thực hiện chuyển đổi giọng


nói thành văn bản (Speech-to-Text) theo thời gian thực với độ chính xác cao. Kết


quả văn bản đầu ra đóng vai trò quyết định giúp hệ thống so khớp, phân tích và


đánh giá mức độ phát âm chính xác của người học so với nội dung mẫu [19].






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**2.3.7**_ _**Sepay**_


SePay là công ty fintech tiên phong trong lĩnh vực chuyển đổi số thanh toán


chuyển khoản ngân hàng. SePay hiện đã kết nối với hơn 19 ngân hàng tại Việt Nam,


là đối tác chiến lược của Ngân hàng OCB, KienlongBank, MSB, MBBank, BIDV.


Được nhiều đối tác và khách hàng tin tưởng trên cả nước [20].


Sepay là công cụ giúp bạn chia sẻ biến động số dư ngân hàng. Tự xác thực


thanh toán cho ứng dụng bán hàng khi khách chuyển khoản. SePay có thể gọi


WebHooks/ API đến ứng dụng bán hàng của bạn để xác thực thanh toán. Việc này


giúp tự động hóa thanh toán 100% mà không cần nhân sự kiểm tra giao dịch [21].


Và trong dự án này, Sepay đóng vai trò là một webhooks/API thông báo biến động


số dư để cập nhật trạng thái thanh toán của hệ thống. Đồng thời, tạo mã QR thanh


toán cho các dịch vụ của hệ thống.


Hình 2.1 Mô hình hoạt động của Sepay






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**2.4** **Cơ sở dữ liệu**


_**2.4.1**_ _**MongoDB**_


MongoDB là một cơ sở dữ liệu đa năng, nổi bật với sự mạnh mẽ, linh hoạt và


khả năng mở rộng vượt trội. Sử dụng mô hình hướng tài liệu, MongoDB cho phép


biểu diễn dữ liệu phức tạp một cách trực quan và không yêu cầu lược đồ cố định,


giúp đơn giản hóa quá trình phát triển. Khả năng mở rộng theo chiều ngang của


MongoDB giúp dễ dàng phân chia dữ liệu trên nhiều máy chủ, đáp ứng nhu cầu xử


lý dữ liệu lớn. MongoDB còn cung cấp một loạt tính năng mạnh mẽ như lập chỉ


mục, tổng hợp và lưu trữ tệp, đồng thời được tối ưu hóa để đạt hiệu năng cao [22].


Với những ưu điểm này, MongoDB là lựa chọn lý tưởng cho các ứng dụng hiện đại


đòi hỏi sự linh hoạt, khả năng mở rộng và tốc độ xử lý nhanh chóng.


_**2.4.2**_ _**Supabase (PostgreSQL)**_


Supabase là một nền tảng Backend as a Service (BaaS) mã nguồn mở, cung


cấp một bộ công cụ để xây dựng ứng dụng nhanh chóng mà không cần tự quản lý


máy chủ [23]. Điểm nổi bật của nó là sử dụng PostgreSQL làm cơ sở dữ liệu cốt lõi


và cung cấp các tính năng như cơ sở dữ liệu thời gian thực, xác thực người dùng,


lưu trữ tệp, và các chức năng không máy chủ (serverless functions). Supabase là


một giải pháp thay thế mã nguồn mở cho Firebase.


PostgreSQL là một hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy và


có hiệu năng cao. Nó hỗ trợ đầy đủ các tính năng quan trọng của một hệ quản trị cơ


sở dữ liệu hiện đại, bao gồm giao dịch, truy vấn con, view, khóa ngoại, kiểm soát


đồng thời đa phiên bản, và nhiều tính năng nâng cao khác như kiểu dữ liệu do người


dùng định nghĩa, kế thừa và quy tắc. PostgreSQL nổi tiếng với sự ổn định, khả năng


tương thích cao với chuẩn Structured Query Language, và cộng đồng người dùng


lớn mạnh. Hệ thống này hoạt động trên hầu hết các nền tảng UNIX và Windows,


đồng thời là một phần mềm mã nguồn mở hoàn toàn miễn phí. PostgreSQL là một


lựa chọn tuyệt vời cho các ứng dụng yêu cầu tính toàn vẹn dữ liệu cao, khả năng mở


rộng và hiệu năng tốt [24].






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**2.5** **Các kiến trúc phần mềm áp dụng**


_**2.5.1**_ _**Client-Server**_


Kiến trúc client-server là một mô hình mạng phân tán, nơi các máy khách


(client) gửi yêu cầu dịch vụ đến một máy chủ (server) tập trung để xử lý và nhận lại


phản hồi. Máy chủ lưu trữ tài nguyên và xử lý dữ liệu, còn máy khách là các thiết bị


đầu cuối như máy tính hoặc điện thoại thực hiện việc truy cập và sử dụng dịch vụ.


Mối liên lạc này dựa trên các giao thức mạng như TCP/IP để đảm bảo hai bên có


thể giao tiếp hiệu quả.


Hình 2.2 Mô hình Client-Server

_**2.5.2**_ _**RESTful API**_


RESTful API là một kiểu thiết kế cho các dịch vụ web, cho phép các ứng dụng


giao tiếp với nhau bằng cách sử dụng giao thức HTTP để trao đổi dữ liệu. REST


(Representational State Transfer) là tên của phong cách kiến trúc này, và nó sử dụng


các phương thức HTTP như GET, POST, PUT, DELETE để thực hiện các thao tác


CRUD (Tạo, Đọc, Cập nhật, Xóa) trên các tài nguyên được định danh bằng URL


duy nhất. Dữ liệu thường được trao đổi dưới định dạng chuẩn như JSON hoặc


XML.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 2.3 Các nguyên tắc của RESTful API

_**2.5.3**_ _**Real-time Communication**_


Real-time Communication (RTC) là một hệ thống cho phép trao đổi dữ liệu,


âm thanh và video gần như đồng thời với độ trễ tối thiểu giữa các điểm cuối. Một


trong những công nghệ phổ biến nhất cho kiến trúc này là **WebRTC (Web Real-**


**Time Communication)**, cho phép kết nối trực tiếp theo mô hình ngang hàng (peer

to-peer) giữa các trình duyệt hoặc ứng dụng di động, không cần phần mềm hay


plugin trung gian.


Hình 2.4 Phương thức hoạt động của RTC






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**2.6** **Hosting**


_**2.6.1**_ _**Digital Ocean**_


DigitalOcean là một nền tảng điện toán đám mây (IaaS) cung cấp các máy chủ


riêng ảo (được gọi là Droplets), được thiết kế tối ưu để giúp các nhà phát triển triển


khai và mở rộng ứng dụng web một cách nhanh chóng, hiệu quả. Với ưu điểm vượt


trội về hiệu năng nhờ sử dụng ổ cứng SSD tốc độ cao, giao diện quản trị trực quan


và chi phí hợp lý, đây là giải pháp hạ tầng lý tưởng cho các dự án phần mềm hiện


đại. DigitalOcean được lựa chọn làm môi trường hosting chính để triển khai cả


Frontend (Website) và Backend (API Server), đảm bảo hệ thống SocialLearning


vận hành ổn định và người dùng có thể truy cập liên tục trên môi trường Internet


[25].






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **CHƯƠNG 3: PHÂN TÍCH**


**3.1** **Quy trình nghiệp vụ**


Quy trình nghiệp vụ của hệ thống Social-Learning được xây dựng xoay quanh


nhu cầu học tập và giao tiếp của người dùng. Thay vì chỉ đơn thuần học cá nhân,


nền tảng tạo ra một không gian cộng đồng, nơi mọi người có thể vừa rèn luyện tiếng


Anh, vừa kết nối, chia sẻ và hỗ trợ lẫn nhau.


Cụ thể, quy trình hoạt động có thể hình dung như sau:


    - **Bắt đầu từ tài khoản cá nhân:** Người dùng trước tiên cần đăng ký tài


khoản thông qua email và xác thực tài khoản dựa trên mã OTP mà hệ


thống đã gửi về email và sau khi xác thực thành công mới có thể tham gia


hệ thống. Sau khi có tài khoản, người dùng có thể đăng nhập để tham gia


vào cộng đồng và trong quá trình đăng nhập nếu người dùng nhập mật


khẩu sai quá 5 lần thì hệ thống sẽ tự động khóa đăng nhập của tài khoản


đó trong vòng 15 phút và nếu đăng nhập thành công thì người dùng có thể


chính thức tham gia cộng đồng học tập. Ở trang cá nhân, người dùng có


thể xem được cấp độ hiện tại được xét dựa trên điểm số học tập của mỗi


người, danh sách các bài đăng của mình, số người theo dõi và đang theo


dõi, có thể chỉnh sửa thông tin cá nhân như biệt danh, số điện thoại, địa


chỉ… Ngoài ra còn có thể xem được tiến độ học bao gồm tổng số bài học


đã học, điểm số trung bình, chuỗi ngày học, kỹ năng giỏi nhất, lịch sử hoạt


động, điểm số mỗi kỹ năng được thống kê theo dạng biểu đồ để người


dùng có thể so sánh trực quan về kỹ năng của mình và cuối cùng là thành


tích khi người dùng học tập đạt điểm số nhất định thì hệ thống sẽ cấp cho


danh hiệu và điểm thưởng.


    - **Kết nối xã hội:** Khi đã có hồ sơ, người dùng có thể tìm kiếm bạn bè, gửi


lời mời kết nối và theo dõi lẫn nhau, hệ thống cũng hỗ trợ tính năng gợi ý


bạn bè dựa trên 1 số tiêu chí để giúp người học có thể nhanh tiến bộ hơn


như là chỉ gợi ý các bạn bè có level bằng hoặc cao hơn và có bạn chung.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Người dùng cũng có thể đăng bài viết, chia sẻ hình ảnh, video hoặc tài liệu


học tập lên cộng đồng. Các bài viết được đăng tải real-time sau đó sẽ được


kiểm duyệt bởi admin để đảm bảo nội dung phù hợp. Ngoài ra, người


dùng có thể bình luận, thích và thông báo sẽ được gửi real-time đến chủ


nhân của bài đăng đó hoặc chia sẻ sang các nền tảng khác. Bên cạnh đó,


người dùng còn có thể nhắn tin, gọi video trực tuyến với các bạn bè mình


theo dõi hoặc đang theo dõi. Hệ thống cung cấp tính năng nhắn tin cá nhân


và nhóm chat. Đặc biệt là có thể gọi điện trực tuyến với một hoặc nhiều


người cùng 1 lúc giúp tăng tính tương tác xã hội nhiều hơn.


    - **Hoạt động học tập:** Trên nền tảng này, người học có thể luyện kỹ năng


viết. Cụ thể thì khi bắt đầu luyện tập hệ thống sẽ cho người dùng chọn


trình độ ôn luyện (Cơ bản, Trung Cấp, Nâng cao) sau đó chọn thể loại bài


muốn luyện viết và hệ thống sẽ cho người dùng chọn tạo bài viết bằng AI


( phải dùng 2 điểm thưởng để sử dụng tính năng này ) và tạo ra bài viết


cho người dùng phù hợp với trình độ và thể loại mà người dùng đã chọn


để người dùng làm bài và lưu trữ bài vừa tạo vào hệ thống ( mỗi người


dùng sẽ có danh sách lưu trữ riêng ). Ngoài tạo bài bằng AI thì hệ thống


cũng hỗ trợ 1 số bài tập viết có sẵn ( không tốn điểm thưởng ) và sẽ hiển


thị các bài viết mà trước đó người dùng đã chọn tính năng tạo bằng AI để


người dùng có thể ôn luyện tiếp tục, tức là khi người dùng đang trong quá


trình luyện mà chưa hoàn thành bài viết thì có thể nộp bài và hệ thống sẽ


lưu lại lịch sử bài làm đó để những lần sau khi người dùng vào học thì có


thể tiếp tục phần bài tập còn đang luyện. Ở phần làm bài viết thì hệ thống


sẽ cho 1 đoạn văn mẫu bằng tiếng việt và nhiệm vụ của người học là viết


lại bài mẫu bằng tiếng anh, hệ thống sẽ hỗ trợ nút gợi ý cho người dùng


nên viết như thế nào (dùng 2 điểm thưởng để sử dụng tính năng này), nếu


dùng tính năng này thì sẽ bị trừ điểm vào điểm thực hành của người dùng.


Khi người dùng muốn nộp bài nếu đã hoàn thành hoặc chưa thì hệ thống


sẽ nhờ AI chấm điểm dựa vào bài mẫu tiếng việt và bài làm hiện tại của


người dùng để cho ra kết quả chính xác nhất bao gồm điểm số (dựa vào






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


level bài tập mà người dùng chọn lần lược “Người mới bắt đầu”, “Trung


cấp”, “Nâng cao” tương ứng với số điểm là 10, 20, 30. Ngoài ra, nếu đúng


hoàn toàn trong lần nộp đầu tiên thì nhân 3 số điểm, đúng trong lần thứ 2


thì nhân 2 số điểm, mỗi lần sai cộng 2 điểm và tối đa 10 điểm cộng khi


làm sai. Với điểm thưởng bông tuyết, tương ứng là 1, 2, 3 và cũng nhân


điểm số như điểm, nếu sai thì không cộng điểm bông tuyết), độ chính xác,


gợi ý, nhận xét tổng quan và sau đó hệ thống sẽ lưu kết quả và bài làm đó


vào lịch sử làm bài của người dùng. Và đối với các lỗi sai chính tả từ vựng


trong bài thì hệ thống sẽ lưu vào phần lỗi từ vựng của người dùng để hỗ


trợ trong việc tạo bộ từ vựng cá nhân.


Tiếp theo là luyện nghe thông qua bài tập nghe chép chính tả (điền từ vào


ô trống), khi bắt đầu người dùng cũng sẽ chọn trình độ và thể loại, chế độ


tạo bằng AI hoặc từ hệ thống có sẵn tương tự như luyện viết. Đối với chế


độ tạo bằng AI sẽ tạo ra script, file audio và văn bản, sau đó lưu vào hệ


thống cho người dùng có thể ôn luyện lại tương tự giống với luyện viết. Ở


giao diện luyện nghe, hệ thống sẽ cho người dùng nghe bài nói (có thể


tăng giảm tốc độ giọng nói, tua bài nghe) và điền từ còn thiếu vào chỗ


trống trong văn bản với số lượng khoảng trắng trong mỗi ô trống bằng với


số lượng kí tự của từ cần điền. Ngoài ra, hệ thống còn hỗ trợ nút gợi ý


(dùng 2 điểm thưởng để sử dụng) khi sử dụng hệ thống sẽ cho 1 đáp án


đúng bất kì trong bài nghe, nút kiểm tra ( dùng 1 điểm thưởng để sử dụng)


để xem từ mình vừa ghi là đúng hay sai và nút nộp bài nếu người dùng đã


hoàn thành tất cả hoặc chưa hoàn thành thì sẽ lưu lại lịch sử làm bài và hệ


thống sẽ chấm điểm dựa trên số từ đúng, từ sai (điểm cộng và điểm


thưởng bông tuyết tương ứng như bài tập luyện viết) và cho ra tiến độ


hoàn thành của bài nghe đó. Và với các từ sai thì hệ thống cũng sẽ ghi


nhận lại và lưu vào lỗi người dùng để hỗ trợ trong việc tạo bộ từ vựng cá


nhân.


Ở tính năng luyện nói người dùng cũng sẽ chọn trình độ và thể loại muốn


nói giống với luyện nghe và luyện viết nhưng ở đây được phân thành 2






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


loại luyện nói là luyện nói cá nhân và luyện nói với AI. Đối với luyện nói


cá nhân sẽ có 2 chế độ là tạo bài bằng AI (dùng 2 điểm thưởng để sử


dụng) và bài có sẵn trên hệ thống. Với dạng bài tập này thì người dùng


phải hoàn thành 10 câu nói mẫu để hoàn thành bài học (10 điểm cho mỗi


bài hoàn thành) và phải phát âm chính xác hoàn toàn mới được qua 1 câu


nếu phát âm sai thì sẽ phải nói lại và với các từ sai sẽ được hệ thống lưu


vào lỗi người dùng để tạo bộ từ vựng cá nhân. Với phần luyện nói cùng AI


sẽ có 2 chế độ là AI và thời gian thực (với thời gian thực bắt buộc người


dùng phải có tài khoản Premium mới được sử dụng). Đầu tiên là với chế


độ AI, khi người dùng chọn chế độ này thì AI sẽ tạo cho người dùng danh


sách ngữ cảnh cuộc hội thoại đã được tạo sẵn nội dung và câu nói, người


dùng chỉ việc chọn bài và chọn vai trò (1 trong 2 người ở ngữ cảnh đã


được tạo) để bắt đầu luyện nói. Vì là ngữ cảnh tạo sẵn nên nhiệm vụ của


người dùng chỉ việc nói theo văn bản đã được tạo sẵn và 1 câu chỉ cần


phát âm đúng từ 80% trở lên sẽ được qua câu tiếp theo, giúp người dùng


thoải mái trong việc phát âm. Đối với các từ phát âm sai cũng sẽ được hệ


thống ghi nhận và lưu vào lỗi người dùng để tạo ra bộ từ vựng cá nhân.


Ngoài ra hệ thống còn hỗ trợ tính năng đổi giọng nói của AI (Nam-Nữ,


US-UK) và tăng giảm tốc độ nói giúp người dùng trải nghiệm và nghe với


nhiều giọng khác nhau để tăng khả năng thích ứng âm từ. Với luyện nói


thời gian thực thì hệ thống cũng sẽ tạo ra danh sách các bối cảnh để người


dùng nhập vai, người dùng chọn bối cảnh và vai trò để luyện sau đó bắt


đầu trò chuyện với AI (đang là vai trò còn lại). Ở đây người dùng phải tự


nói theo những gì mình hiểu, biết được và AI sẽ hỗ trợ trong việc kiểm tra


câu nói của người dùng sau mỗi lần nói và đưa ra phương án cũng như gợi


ý cho câu nói được tốt hơn. Nếu người dùng không biết hỏi hoặc trả lời


như thế nào thì hệ thống cũng hỗ trợ gợi ý cho người dùng, có nút dịch


nghĩa câu nói của đối phương nếu người dùng không hiểu. Sau khi hoàn


thành thì AI sẽ tổng hợp lại cuộc hội thoại và cho ra nhận xét tổng quan về


cấu trúc câu, khả năng phát âm, các từ vựng mới trong bài nói cần học …






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Và cuộc hội thoại chỉ có 5 lượt nói nếu người dùng muốn học thêm phải


dùng điểm thưởng để mua lượt (mỗi lượt 1 điểm thưởng, tối đa 10 lượt


mua). Ngoài ra cũng giống với chế độ AI, hệ thống cũng hỗ trợ tính năng


đổi giọng nói của AI (Nam-Nữ, US-UK) và tăng giảm tốc độ nói giúp


người dùng trải nghiệm và nghe với nhiều giọng khác nhau để tăng khả


năng thích ứng âm từ.


Như đã nói ở phần ôn luyện 3 kỹ năng trên thì hệ thống sẽ hỗ trợ cá nhân


hóa từ vựng dựa trên lỗi người dùng. Khi người dùng ôn luyện và phát


hiện có từ vựng sai sẽ lập tức thêm từ đó vào lỗi của người dùng, nếu 1 từ


đạt đúng 5 lỗi sẽ tự động thêm từ vựng đó vào bộ từ vựng cá nhân và


thông báo real-time cho người dùng biết có từ mới cần ôn luyện. Đối với


mỗi từ vựng cá nhân hệ thống sẽ nhờ AI tạo ra các từ đồng nghĩa, trái


nghĩa, biến thể của từ đó… và có cả khái niệm về từ đó cũng như là 1 câu


ví dụ cho người dùng hiểu nghĩa rõ ràng hơn. Trong mỗi từ sẽ có độ thành


thạo và độ thành thạo sẽ có các móc từ 0-100. Để có được điểm thành thạo


của từ đó thì trong quá trình luyện tập nếu gặp lại từ vựng mà người dùng


có trong danh sách từ vựng cá nhân thì sẽ được tăng 5 điểm thông thạo


nếu người dùng luyện đúng từ đó tức là không sai từ vựng đó và sẽ trừ đi


3 nếu sai. Ngoài ra hệ thống cũng hỗ trợ ôn luyện từ vựng theo từ hoặc


danh sách từ, nghĩa là trong bộ từ vựng của người dùng có thể chọn ra các


từ muốn ôn luyện để ưu tiên khả năng thành thạo và hệ thống sẽ tạo ra bài


tập dựa trên danh sách từ vựng mà người dùng đã chọn với các dạng bài


tập như: chọn nghĩa đúng, ghép từ thành câu, luyện phát âm, chọn cặp từ,


điền từ còn thiếu vào câu, ghép các chữ cái thành từ. Khi người dùng hoàn


thành luyện từ vựng sẽ được tăng 5 điểm thông thạo với các từ đã chọn để


ôn luyện và sẽ không tăng nếu luyện tập thất bại (trong quá trình làm bài


nếu sai quá 3 lần sẽ thất bại). Khi độ thông thạo của 1 từ đạt mức 100 thì


người dùng sẽ phải luyện tập từ vựng đó để chuyển sang trạng thái ẩn khỏi


danh sách từ. Nếu luyện tập thành công, từ đó sẽ được ẩn khỏi bộ từ vựng


cá nhân và hệ thống sẽ cài đặt mặc định là 7 ngày kể từ lúc từ được ẩn và






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


sẽ hiển thị lại cho người dùng ôn luyện 1 lần nữa để tốt nghiệp từ vựng tức


là xóa từ vựng đó ra khỏi bộ từ vựng cá nhân và nếu luyện tập thất bại, từ


đó sẽ hiển thị lại trong bộ từ vựng cá nhân và điểm thông thạo của từ đó sẽ


là mức 70. Ngoài ra, hệ thống còn phân loại từ vựng dựa trên chủ đề của


từ, các từ cần ôn gấp, các từ đang tiến bộ, sắp thành thạo và đã thành thạo.


Nền tảng còn hỗ trợ tạo lộ trình học tập cho người dùng giúp tự cá nhân


hóa lộ trình học tập theo nhu cầu. Ở chức năng này người dùng sẽ phải


cung cấp cho hệ thống các đầu vào như tên lộ trình, kỹ năng cần học, mục


tiêu học tiếng Anh, lĩnh vực áp dụng (ngành nghề), lượng thời gian mà


người dùng có thể học tiếng Anh trong 1 ngày. Sau đó, hệ thống sẽ tổng


hợp và truy vấn thêm thành tích học tập, điểm trung bình các kỹ năng của


người dùng trên hệ thống tổng hợp thành nhiều đầu vào. Từ đó AI sẽ tạo


ra lộ trình phù hợp với yêu cầu của người dùng với đầu ra là chuỗi tuần


học tập phù hợp cho người dùng, các bài học cần học trong mỗi tuần (lấy


từ các loại bài tập có sẵn của hệ thống) và bắt buộc phải hoàn thành lộ


trình của mỗi tuần mới được qua tuần kế tiếp.


    - **Đánh giá và động lực học tập:** Sau mỗi hoạt động học tập của người


dùng, hệ thống sẽ tự động chấm điểm và lưu kết quả, với kết quả có được


sẽ được phân tích và thống kê cho mỗi cá nhân. Người dùng còn được xếp


hạng theo cộng đồng và các thành viên có thành tích nổi bật sẽ được công


bố trên bảng xếp hạng tạo động lực học tập liên tục.


    - **Quản trị hệ thống:** Về phía quản trị viên có thể xem được thống kê số


người dùng đã tạo tài khoản trong 30 ngày, số người dùng hoạt động mỗi


ngày, xem ngày và giờ có lượng người tham gia học nhiều nhất. Có thể


quản lí tài khoản của người dùng bao gồm thăng quyền thành admin, khóa


tài khoản vi phạm cộng đồng… Tạo các bài tập mới cho người dùng hoặc


chỉnh sửa. Xem và xóa các bài đăng nếu vi phạm tiêu chuẩn cộng đồng.


Thống kê từ vựng mà các người dùng mắc lỗi nhiều nhất để hỗ trợ trong


việc tạo bài tập mới…






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Với quy trình này, người dùng không chỉ tham gia học tập tiếng Anh một cách


chủ động mà còn được gắn kết trong một cộng đồng học tập trực tuyến, mang lại sự


hứng thú và hiệu quả cao hơn so với việc học cá nhân.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**3.2** **Use-case tổng quát**


Hình 3.1 Mô hình Use-case tổng quát của SocialLearning

Hệ thống được xây dựng với hai tác nhân chính là Người dùng (User) và Quản


trị viên (Admin).


Đối với Người dùng: Hệ thống cung cấp các chức năng cốt lõi xoay quanh


việc học tập và tương tác xã hội. Người dùng có thể đăng ký/đăng nhập, quản lý hồ


sơ cá nhân, tham gia các hoạt động luyện tập kỹ năng tiếng Anh (viết, nghe, nói, từ


vựng), đồng thời kết nối với cộng đồng thông qua việc đăng bài, kết bạn và giao


tiếp đa phương tiện (nhắn tin, gọi video).


Đối với Quản trị viên: Hệ thống cung cấp các công cụ để giám sát và quản lý toàn


bộ hoạt động. Quản trị viên có quyền quản lý tài khoản người dùng (xem danh sách,


khóa/mở tài khoản), xử lý các báo cáo vi phạm và theo dõi các số liệu thống kê về


hoạt động của hệ thống để đảm bảo nền tảng vận hành ổn định và an toàn.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**3.3** **Danh sách tác nhân và mô tả**






|Col1|Bảng 3.1 Danh sách các tác nhân|
|---|---|
|**Tác nhân**|**Mô tả**|
|Người dùng|Là đối tượng sử dụng chính của hệ thống, bao gồm sinh viên, người đi<br>làm và bất kỳ ai có nhu cầu rèn luyện tiếng Anh. Họ có thể quản lý tài<br>khoản cá nhân, tham gia vào các hoạt động học tập như luyện viết,<br>luyện nghe, quản lý từ vựng, đồng thời tương tác với cộng đồng qua<br>các tính năng mạng xã hội và giao tiếp đa phương tiện (nhắn tin, gọi<br>thoại, gọi video).|
|Quản trị viên|Là người có vai trò giám sát và quản lý toàn bộ hệ thống. Quản trị<br>viên có quyền xem danh sách người dùng, khóa hoặc mở tài khoản<br>người dùng, tạo bài tập mới cũng như theo dõi các thống kê về hoạt<br>động của hệ thống để đảm bảo nền tảng vận hành ổn định.|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**3.4** **Danh sách các tình huống hoạt động chính**


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


**3.5** **Đặc tả các yêu cầu chức năng**


_**3.5.1**_ _**UC01_Đăng kí**_


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


**3.5.1.4** **Mô tả chi tiết**


Đối với chức năng đăng ký, nhóm em không chỉ đơn thuần là lưu thông tin


người dùng vào cơ sở dữ liệu mà tập trung xây dựng một quy trình xác thực bảo


mật chặt chẽ.


Cụ thể, luồng xử lý bắt đầu ngay từ giao diện, nơi hệ thống sẽ kiểm tra định


dạng email và độ mạnh mật khẩu để lọc bỏ các yêu cầu không hợp lệ trước khi gửi


về server. Ở phía Backend, điểm kỹ thuật quan trọng nhất là bọn em tuyệt đối


không lưu mật khẩu dưới dạng văn bản thuần. Thay vào đó, Controller sẽ chuyển


tiếp yêu cầu sang dịch vụ Supabase Auth. Tại đây, mật khẩu được tự động mã hóa


một chiều bằng thuật toán Bcrypt và lưu trong bảng định danh riêng biệt của hệ


thống, giúp bảo vệ tài khoản ngay cả khi cơ sở dữ liệu bị lộ.


Quy trình chỉ hoàn tất khi người dùng vượt qua bước xác thực kép bằng mã


OTP gửi về email. Ngay lúc xác thực thành công, hệ thống sẽ thực hiện đồng bộ dữ


liệu: vừa kích hoạt tài khoản định danh, vừa khởi tạo hồ sơ học tập trong bảng


nghiệp vụ users. Hai bảng dữ liệu này được liên kết chặt chẽ với nhau thông qua


khóa chính UUID, đảm bảo sự nhất quán giữa thông tin đăng nhập và thành tích học


tập của người dùng.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.2**_ _**UC02_Đăng nhập**_


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


**3.5.2.4** **Mô tả chi tiết**


Đối với chức năng đăng nhập, bên cạnh việc xác thực danh tính thông thường,


nhóm em đặc biệt chú trọng đến cơ chế bảo mật để ngăn chặn các cuộc tấn công dò


mật khẩu (Brute-force). Quy trình kỹ thuật được xử lý chặt chẽ qua ba tầng kiểm


tra.


Đầu tiên, trước khi thực hiện bất kỳ thao tác kiểm tra mật khẩu nào, hệ thống


sẽ truy vấn vào bảng theo dõi đăng nhập (loginAttempts) để xem trạng thái của tài


khoản. Nếu phát hiện tài khoản đang có thời gian khóa (locked_until) lớn hơn thời


gian hiện tại, Server sẽ lập tức từ chối yêu cầu và trả về thông báo thời gian chờ còn


lại mà không cần xử lý tiếp.


Chỉ khi tài khoản ở trạng thái 'sạch' hoặc đã hết thời gian khóa, hệ thống mới


chuyển tiếp thông tin sang Supabase Auth để đối chiếu mật khẩu đã mã hóa. Tại


đây, luồng xử lý sẽ rẽ nhánh tùy theo kết quả trả về:


    - **Nếu đăng nhập thất bại (Sai mật khẩu):** Hệ thống không chỉ đơn thuần


báo lỗi mà sẽ thực hiện một 'write operation' xuống cơ sở dữ liệu để tăng


biến đếm số lần sai. Logic tại đây được cài đặt là nếu số lần sai chạm


ngưỡng 5 lần, hệ thống sẽ tự động cập nhật trường locked_until thành thời


điểm hiện tại cộng thêm 15 phút, tạm thời vô hiệu hóa quyền truy cập của


tài khoản đó.


    - **Nếu đăng nhập thành công:** Hệ thống sẽ thực hiện dọn dẹp dữ liệu bằng


cách xóa bỏ lịch sử đăng nhập sai trong bảng loginAttempts để reset bộ


đếm về 0. Cuối cùng, Server sẽ cấp phát Access Token (JWT) kèm theo


thông tin phân quyền (Role) để người dùng có thể truy cập vào các tài


nguyên của hệ thống.


Cách hiện thực này đảm bảo rằng hệ thống vừa bảo vệ được người dùng khỏi


việc bị dò mật khẩu, vừa duy trì hiệu năng cao nhờ việc ngăn chặn sớm các request


spam ngay từ bước kiểm tra đầu tiên.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.3**_ _**UC03_Tạo bài đăng**_


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


**3.5.3.4** **Mô tả chi tiết**


Ở chức năng tạo bài đăng, hệ thống hỗ trợ người dùng chia sẻ nội dung đa


phương tiện bao gồm văn bản, hình ảnh, video và các định dạng tài liệu (PDF,


Word, Excel). Để tối ưu hóa hiệu năng, toàn bộ tệp tin media được lưu trữ trực tiếp


thông qua Supabase Storage thay vì sử dụng dịch vụ lưu trữ phân tán của bên thứ


ba. Giải pháp này giúp giảm độ trễ, đồng bộ hóa dữ liệu nhanh chóng với cơ chế


hoạt động cụ thể như sau:


    - **Bước 1: Tiếp nhận và Xử lý đầu vào:** Khi người dùng chọn tệp tin từ


thiết bị, ứng dụng (Frontend) sẽ tiến hành kiểm tra định dạng, kích thước


và chuyển đổi dữ liệu sang dạng Base64 để chuẩn bị truyền tải.


    - **Bước 2: Xác thực và Upload an toàn:** Dữ liệu được gửi đến Backend sau


đó gọi đến Supabase Storage API kèm theo mã xác thực người dùng. Tại


đây, hệ thống tự động kiểm tra quyền truy cập (thông qua các Policy bảo


mật) để đảm bảo chỉ người dùng hợp lệ mới được phép tải dữ liệu lên hệ


thống.


    - **Bước 3: Lưu trữ và Định danh:** Sau khi xác thực thành công, tệp tin


được lưu vào các Bucket (kho chứa) tương ứng. Supabase sẽ trả về một


đường dẫn định danh duy nhất (Public URL hoặc Private Path) cho tệp tin


đó.


    - **Bước 4: Đồng bộ cơ sở dữ liệu:** Đường dẫn định danh nhận được từ


Storage sẽ được lưu vào bản ghi bài viết trong cơ sở dữ liệu (Database).


Khi hiển thị bài viết, hệ thống chỉ cần gọi đường dẫn này để tải nội dung


media, giúp giảm tải dung lượng lưu trữ cho Database chính.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.4**_ _**UC04_Nhắn tin**_


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


**3.5.4.4** **Mô tả chi tiết**


Chuyển sang chức năng nhắn tin, đây là tính năng đòi hỏi tính tương tác tức


thời (Real-time) cao nhất trong hệ thống. Để giải quyết bài toán độ trễ thấp mà


không cần người dùng phải tải lại trang, nhóm em đã xây dựng một kiến trúc giao


tiếp dựa trên sự kiện (Event-driven) sử dụng thư viện Socket.IO kết hợp với cơ sở


dữ liệu MongoDB.


Quy trình kỹ thuật được nhóm em xử lý qua các bước cụ thể như sau:


    - Đầu tiên là cơ chế thiết lập kết nối (Handshake): Ngay khi người dùng


truy cập vào ứng dụng, Client sẽ khởi tạo một kết nối WebSocket bền


vững đến Server. Tại đây, Server sẽ thực hiện ánh xạ (Map) giữa UserID


của người dùng và SocketID của phiên làm việc hiện tại, lưu vào bộ nhớ


tạm để biết chính xác cần gửi tin nhắn đến đâu.


    - Khi một tin nhắn được gửi đi, hệ thống không đẩy ngay qua Socket mà


thực hiện một quy trình xử lý dữ liệu cẩn thận để đảm bảo tính toàn vẹn:

     - Đối với tin nhắn chứa File/Hình ảnh: Trước hết, hệ thống sẽ upload


các file này lên dịch vụ lưu trữ đám mây Cloudinary. Sau khi


Cloudinary trả về đường dẫn (URL) an toàn, Server mới đóng gói


URL này cùng với nội dung tin nhắn để xử lý tiếp.

     - Lưu trữ bền vững (Persistence): Tiếp theo, toàn bộ nội dung hội thoại


được lưu trữ vào MongoDB. Nhóm em chọn MongoDB thay vì SQL


cho phần này vì cấu trúc linh hoạt của NoSQL rất phù hợp để lưu trữ


lịch sử chat với khối lượng lớn và cấu trúc dữ liệu đa dạng (text,


image, video…).


Chỉ khi dữ liệu đã được lưu thành công vào cơ sở dữ liệu (đảm bảo không bị


mất tin nhắn), Server mới thực hiện bước cuối cùng là phát tán tin nhắn


(Broadcasting). Hệ thống sử dụng phương thức socket.to(roomID).emit để bắn sự


kiện new_message đến chính xác người nhận hoặc nhóm chat. Nhờ vậy, phía người


nhận sẽ hiển thị tin nhắn ngay lập tức gần như đồng thời, tạo cảm giác mượt mà và


liền mạch trong quá trình giao tiếp.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.5**_ _**UC06_Luyện viết đoạn**_


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


**3.5.5.4** **Mô tả chi tiết**


Đến với chức năng luyện viết, đây là phân hệ thể hiện rõ nhất việc ứng dụng


Trí tuệ nhân tạo vào quy trình học tập cá nhân hóa. Thay vì chỉ so sánh chuỗi ký tự


đơn thuần như các hệ thống cũ, nhóm em đã xây dựng một quy trình xử lý thông


minh kết hợp giữa dữ liệu tĩnh và Generative AI.


Quy trình kỹ thuật bắt đầu ngay từ khâu tạo đề bài. Hệ thống cung cấp hai


luồng xử lý song song:


    - Nếu người dùng chọn bài tập có sẵn, Server đơn giản là truy vấn từ cơ sở


dữ liệu SQL dựa trên Level và Topic đã chọn.


    - Tuy nhiên, điểm nhấn kỹ thuật nằm ở chế độ 'Generate AI'. Khi người


dùng chọn chế độ này, Backend sẽ không gửi yêu cầu tạo văn bản tự do


mà sử dụng kỹ thuật Prompt Engineering có cấu trúc. Cụ thể, hệ thống sẽ


chèn các tham số như trình độ (Level) và chủ đề (Topic) vào một mẫu


Prompt cố định, yêu cầu Gemini API trả về kết quả dưới định dạng chuẩn


JSON. Việc ép kiểu JSON này giúp hệ thống dễ dàng bóc tách dữ liệu


(Title, Content, Keywords) để hiển thị lên giao diện mà không cần xử lý


chuỗi thủ công phức tạp.


Giai đoạn quan trọng nhất là Chấm điểm và Phản hồi. Khi người dùng nhấn


'Nộp bài', hệ thống sẽ đóng gói toàn bộ bài làm của người dùng cùng với đề bài gốc


để gửi sang Gemini API. Tại đây, nhóm em yêu cầu AI thực hiện đồng thời ba


nhiệm vụ: chấm điểm trên thang 100, chỉ ra các lỗi ngữ pháp/từ vựng cụ thể, và đưa


ra phiên bản viết lại tự nhiên hơn (điểm final = 50% điểm accuracy + 30% điểm


ngữ pháp + 20% từ vựng).


Sau khi nhận phản hồi từ AI, Server không chỉ lưu kết quả mà còn kích hoạt


một Logic nghiệp vụ tự động để quản lý từ vựng. Hệ thống sẽ quét qua danh sách


các từ vựng mà người dùng sử dụng sai. Nếu phát hiện một từ vựng bị sai tích lũy


quá 5 lần trong quá trình học, hệ thống sẽ tự động thêm từ đó vào Bộ từ vựng cá


nhân (Personal Vocabulary) và kích hoạt cơ chế nhắc nhở ôn tập. Cách hiện thực

này giúp tạo ra một vòng lặp học tập khép kín: từ Luyện tập → Đánh giá → Cải


thiện lỗ hổng kiến thức.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.6**_ _**UC07_Luyện nghe**_


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


**3.5.6.4** **Mô tả chi tiết**


Chuyển sang chức năng Luyện nghe, thay vì chỉ phát lại các file âm thanh có


sẵn một cách thụ động, nhóm em đã xây dựng một cơ chế tạo bài tập 'điền từ vào


chỗ trống' (Gap-fill) động, dựa trên ngữ cảnh thực tế mà người dùng lựa chọn.


Quy trình kỹ thuật được thực hiện qua các bước phối hợp chặt chẽ giữa AI và


thuật toán xử lý chuỗi như sau:


    - Đầu tiên là khâu Sinh nội dung đa phương tiện: Khi người dùng chọn chủ


đề (ví dụ: 'Du lịch') và trình độ, Server sẽ gửi một Prompt chi tiết đến


Gemini API. Yêu cầu ở đây không chỉ là tạo ra một đoạn hội thoại, mà AI


phải trả về dữ liệu có cấu trúc JSON bao gồm: nội dung văn bản đầy đủ


(Full Script), danh sách các từ khóa quan trọng (Keywords) để đục lỗ, và


file âm thanh (hoặc text để chuyển thành audio). Đối với phần Audio, hệ


thống tích hợp dịch vụ Text-to-Speech để chuyển đổi đoạn văn bản AI vừa


tạo thành giọng đọc tự nhiên, giúp người dùng được nghe ngữ điệu chuẩn


xác.


    - Tiếp theo là Logic xử lý đục lỗ (Masking Logic): Trước khi trả dữ liệu về


cho Client, Backend sẽ thực hiện một thuật toán xử lý chuỗi. Hệ thống dựa


vào danh sách 'Keywords' mà AI đề xuất để thay thế các từ này trong đoạn


văn gốc bằng các ký tự đặc biệt (placeholder). Việc xử lý này đảm bảo


rằng Client chỉ nhận được đoạn văn bản đã bị che, ngăn chặn hoàn toàn


việc người dùng có thể 'soi' code để xem trước đáp án.


    - Cuối cùng là quy trình Đồng bộ và Chấm điểm:

     - Trên giao diện, hệ thống sử dụng trình phát Audio HTML5 tiêu chuẩn


nhưng được đồng bộ hóa với văn bản.

     - Khi người dùng điền từ và nhấn 'Nộp bài', Server sẽ thực hiện so khớp


chuỗi (String Matching) giữa đáp án người dùng gửi lên và từ khóa


gốc. Thuật toán so khớp được thiết lập để bỏ qua các lỗi nhỏ về viết


hoa/thường (Case-insensitive) hoặc khoảng trắng thừa (Trim) để đánh


giá công bằng nhất.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


     - Đặc biệt, tương tự như phần Luyện viết, hệ thống cũng kích hoạt Cơ


chế theo dõi từ vựng sai. Nếu người dùng nghe sai một từ vựng quá 5


lần, hệ thống sẽ tự động định danh đó là 'từ khó' và đẩy vào cơ sở dữ


liệu Từ vựng cá nhân, giúp người dùng có kế hoạch ôn tập lại sau này.


_**3.5.7**_ _**UC08_Luyện nói**_


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


**3.5.7.4** **Mô tả chi tiết**


Chức năng Luyện nói là một trong những phân hệ phức tạp nhất của hệ thống,


đòi hỏi sự tích hợp chặt chẽ giữa xử lý âm thanh thời gian thực và Trí tuệ nhân tạo.


Thay vì chỉ ghi âm và lưu trữ đơn thuần, nhóm em đã xây dựng một cơ chế đánh giá


phát âm tự động (Automated Pronunciation Assessment) kết hợp với phản hồi ngữ


cảnh.


Quy trình xử lý được chia thành các luồng kỹ thuật chuyên biệt như sau:


    - **Xử lý Tín hiệu âm thanh:**

     - Khi người dùng thực hiện ghi âm, Client (Next.js/React Native) sẽ thu


thập tín hiệu giọng nói và đóng gói dưới dạng Blob/Base64.

     - Dữ liệu này được truyền tải lên Server và gọi đến Google Cloud


Speech-to-Text API. Tại đây, mô hình học sâu (Deep Learning) của


Google sẽ chuyển đổi giọng nói thành văn bản (Transcript) kèm theo


độ tin cậy (Confidence Score). Đây là cơ sở dữ liệu gốc để hệ thống so


sánh.


    - **Cơ chế Luyện nói Cá nhân:**

     - Ở chế độ này, hệ thống yêu cầu độ chính xác tuyệt đối để rèn luyện kỹ


năng phát âm chuẩn.

     - Thuật toán so khớp chuỗi (String Comparison Algorithm) sẽ so sánh


văn bản người dùng vừa nói với câu mẫu. Chỉ khi độ trùng khớp đạt


100% (người dùng phát âm rõ ràng, đúng từng từ), hệ thống mới cho


phép mở khóa câu tiếp theo. Điều này buộc người học phải kiên nhẫn


và chỉnh sửa từng lỗi nhỏ trong phát âm.


    - **Cơ chế Luyện nói với AI:**

     - Đây là tính năng điểm nhấn, chia làm 2 dạng:


`o` **Roleplay:** Hệ thống sử dụng Prompt Engineering để ép Gemini


AI đóng vai một nhân vật cụ thể (ví dụ: Nhân viên bán hàng, Lễ


tân). Người dùng chọn vai còn lại. Để đảm bảo hội thoại trôi chảy,


ngưỡng chấp nhận phát âm được hạ xuống mức >80%, giúp người


dùng tự tin hơn trong giao tiếp phản xạ.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


`o` **Real-time Conversation:** Hệ thống thiết lập một phiên làm việc


ngữ cảnh dài (Long-context Session). Mỗi câu nói của người dùng


được AI phân tích để đưa ra 3 lớp phản hồi:


          - _Reply:_ Câu trả lời tiếp nối câu chuyện.


          - _Correction:_ Sửa lỗi ngữ pháp/từ vựng trong câu nói vừa rồi


của người dùng.


          - _Suggestion:_ Gợi ý cách diễn đạt tự nhiên hơn (Native-like).

     - Đặc biệt, hệ thống tích hợp Text-to-Speech (TTS) để chuyển phản hồi


của AI thành giọng nói (có thể tùy chỉnh giọng Nam/Nữ, Anh/Mỹ),


tạo cảm giác như đang trò chuyện với người thật.


    - **Vòng lặp cải thiện:** Tương tự các kỹ năng khác, nếu hệ thống phát hiện


người dùng phát âm sai một từ cụ thể quá 5 lần (dựa trên kết quả so khớp),


từ đó sẽ tự động được gán nhãn "Cần ôn tập" và đẩy vào kho Từ vựng cá


nhân.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.8**_ _**UC10_Học từ vựng**_


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


**3.5.8.4** **Mô tả chi tiết**


Khác với các ứng dụng thông thường nơi người dùng phải tự nhập từ vựng thủ


công, chức năng Học từ vựng trong hệ thống SocialLearning hoạt động như một


"Lưới lọc thông minh", tự động thu thập và cá nhân hóa lộ trình học dựa trên sai sót


thực tế của người dùng.


Quy trình kỹ thuật và Logic nghiệp vụ được thiết kế như sau:


    - **Cơ chế Thu thập thụ động:**

     - Module Từ vựng hoạt động ngầm (Background Service) liên kết chặt


chẽ với 3 module Luyện Viết, Nghe và Nói.

     - Hệ thống duy trì một bộ đếm lỗi (Error Counter) cho từng từ vựng


trong cơ sở dữ liệu. Khi bộ đếm của một từ chạm ngưỡng >= 5,


Trigger hệ thống sẽ kích hoạt, tự động sao chép từ đó vào bảng


PersonalVocab của người dùng.

     - Ngay lập tức, một tiến trình gọi AI (Gemini API) sẽ chạy để làm giàu


dữ liệu (Data Enrichment): Tự động sinh ra định nghĩa, ví dụ minh


họa, từ đồng nghĩa/trái nghĩa cho từ đó để người dùng có đầy đủ tư


liệu học tập.


    - **Thuật toán Lặp lại ngắt quãng:**

     - Mỗi từ vựng cá nhân sở hữu một chỉ số Độ thành thạo (Mastery


Score) chạy từ 0 đến 100.

     - Hệ thống áp dụng cơ chế thưởng/phạt điểm động:


`o` **Thưởng:** Nếu người dùng làm đúng bài tập liên quan đến từ đó,


độ thành thạo tăng +5%.


`o` **Phạt:** Nếu làm sai (trong bài tập từ vựng hoặc gặp lại trong bài


viết/nghe/nói), độ thành thạo bị trừ -3%. Cơ chế này mô phỏng


quá trình quên tự nhiên của não bộ.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


    - **Cơ chế "Tốt nghiệp" Từ vựng:**

     - Khi một từ đạt 100% Mastery, nó không bị xóa ngay mà chuyển sang


trạng thái "Archived" (Lưu trữ tạm thời).

     - Hệ thống thiết lập một Cron Job (Tác vụ định kỳ): Sau đúng 7 ngày,


từ này sẽ "tái xuất" và yêu cầu người dùng kiểm tra lại một lần cuối.


`o` Nếu Nhớ (Đúng): Từ vựng chính thức bị xóa khỏi danh sách cần


học (Tốt nghiệp).


`o` Nếu Quên (Sai): Từ vựng quay lại danh sách học với độ thành


thạo bị reset về mức 70%.

     - Cách tiếp cận này đảm bảo kiến thức được đưa vào trí nhớ dài hạn


thay vì học vẹt.


    - **Sinh bài tập Động:** Thay vì lưu trữ ngân hàng câu hỏi cố định, hệ thống


sử dụng AI để sinh bài tập trắc nghiệm, điền từ, ghép thẻ... theo thời gian


thực (Real-time Generation) dựa trên danh sách từ vựng cần ôn của người


dùng, đảm bảo bài học không bao giờ bị trùng lặp.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**3.5.9**_ _**UC12_Tạo lộ trình học tập**_


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


**3.5.9.4** **Mô tả chi tiết**


Chức năng Lộ trình học tập, đây được xem là 'người dẫn đường' thông minh


của hệ thống. Thay vì cung cấp một giáo trình tĩnh cho tất cả mọi người, nhóm em


xây dựng một cơ chế tạo lộ trình động dựa trên dữ liệu thực tế của từng cá nhân.


Hình 3.29 Sơ đồ luồng tạo lộ trình cá nhân

Quy trình kỹ thuật được thực hiện qua các bước xử lý dữ liệu như sau:


    - Bước đầu tiên là **Tổng hợp ngữ cảnh (Context Aggregation):** Khi người


dùng yêu cầu tạo lộ trình mới, Backend không chỉ nhận các tham số đầu


vào từ giao diện (như mục tiêu, thời gian rảnh, lĩnh vực quan tâm) mà còn


tự động truy vấn ngược vào cơ sở dữ liệu để lấy Hồ sơ năng lực hiện tại


của người dùng. Hệ thống sẽ tổng hợp điểm số các kỹ năng (Writing,


Speaking, Listening) và lịch sử các bài đã học để tạo thành một bộ dữ liệu


ngữ cảnh đầy đủ nhất


    - Tiếp theo là bước **Generative AI** với cấu trúc phân cấp: Toàn bộ ngữ cảnh


trên được đưa vào một Prompt chuyên biệt gửi sang Gemini API. Tại đây,


nhóm em yêu cầu AI đóng vai trò một chuyên gia giáo dục để thiết kế lộ


trình chi tiết theo từng tuần. Thách thức kỹ thuật ở đây là dữ liệu trả về


phải đảm bảo cấu trúc phân tầng (Hierarchy) chặt chẽ: Một Lộ trình


(Roadmap) chứa nhiều Tuần (Weeks), và mỗi Tuần chứa nhiều Bài học


(Lessons) cụ thể. Do đó, nhóm em bắt buộc AI phản hồi dưới dạng JSON


Nested Object chuẩn xác để hệ thống có thể đọc hiểu.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


    - Cuối cùng là kỹ thuật Lưu trữ dữ liệu quan hệ (Relational Persistence):


Khi nhận được dữ liệu JSON từ AI, Server sẽ thực hiện quy trình lưu trữ


phức tạp vào PostgreSQL. Vì cấu trúc dữ liệu có tính phân cấp (Cha 

Con), nhóm em sử dụng cơ chế Database Transaction (Giao dịch) để đảm


bảo tính toàn vẹn dữ liệu. Hệ thống sẽ lần lượt insert dữ liệu vào bảng


roadmap trước, lấy ID trả về để insert vào bảng weekRoadMap, và tiếp tục


dùng ID của tuần để insert vào bảng lessonRoadmap. Việc sử dụng


Transaction đảm bảo rằng nếu có bất kỳ lỗi nào xảy ra ở khâu lưu bài học,


toàn bộ lộ trình sẽ được rollback (hoàn tác) để tránh dữ liệu rác.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **CHƯƠNG 4: THIẾT KẾ VÀ HIỆN THỰC**


**4.1** **Sơ đồ lớp**


Hình 4.1 Sơ đồ lớp mà social và cá nhân hóa


Hình 4.2 Sơ đồ lớp phần learning






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**4.2** **Sơ đồ cơ sở dữ liệu**


_**4.2.1**_ _**Sơ đồ cơ sở dữ liệu có cấu trúc**_


Hình 4.3 Sơ đồ cơ sở dữ liệu Social có cấu trúc (SQL)






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.4 Sơ đồ cơ sở dữ liệu Learning có cấu trúc (SQL)






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.2.2**_ _**Sơ đồ cơ sở dữ liệu không có cấu trúc**_


Hình 4.5 Sơ đồ cơ sở dữ liệu không có cấu trúc (NoSQL)






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.6 Sơ đồ kiến trúc hệ thống


**4.3** **Sơ đồ kiến trúc phần mềm**


Hệ thống Social-Learning được xây dựng theo mô hình Client-Server với các


thành phần chính như sau:


    - Client (Phía người dùng): Triển khai đa nền tảng gồm Website (sử dụng


Next.js) và Mobile App (sử dụng React Native), cho phép truy cập linh


hoạt trên cả iOS, Android và trình duyệt web.


    - Server (Phía máy chủ): Vận hành trên nền tảng Node.js với framework


Express.js, cung cấp RESTful API để xử lý các yêu cầu từ Client.


    - Cơ sở dữ liệu (Database): Sử dụng mô hình lai kết hợp Supabase


(PostgreSQL) để lưu trữ dữ liệu có cấu trúc (người dùng, bài đăng) và


MongoDB cho dữ liệu phi cấu trúc (lịch sử tin nhắn).


    - Dịch vụ tích hợp (3rd Party Services):

     - AI: Tích hợp Gemini API để sinh bài tập và chấm điểm tự động.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


     - Giao tiếp thời gian thực: Sử dụng Socket.IO cho tính năng chat/thông


báo và ZegoCloud cho gọi video/thoại.

     - Lưu trữ: Sử dụng Cloudinary và Supabase Storage để quản lý hình ảnh


và video.


**4.4** **Sơ đồ luồng màn hình**


_**4.4.1**_ _**Sơ đồ luồng màn hình website**_


Hình 4.7 Luồng màn hình website


_**4.4.2**_ _**Sơ đồ luồng màn hình mobile**_


Hình 4.8 Luồng màn hình mobile






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**4.5** **Giao diện chương trình**


_**4.5.1**_ _**Giao diện trang chủ**_


Trang chủ Social Learning được thiết kế thân thiện và mang phong cách mạng


xã hội, giúp người dùng dễ dàng điều hướng. Khi truy cập, người dùng sẽ thấy ngay


các nút Đăng nhập, Đăng ký, cùng hai nút Tham gia ngay và Học thử để khuyến


khích trải nghiệm nhanh. Giao diện hỗ trợ chuyển đổi ngôn ngữ Anh – Việt với biểu


tượng học tiếng Anh. Bên dưới là phần giới thiệu ngắn gọn các tính năng nổi bật,


giúp người dùng hiểu tổng quan về hệ thống.


Hình 4.9 Giao diện trang chủ






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.2**_ _**Giao diện người dùng chính**_


Sau khi đăng nhập thành công vào hệ thống thì sẽ hiển thị ra giao diện người


dùng chính (Newsfeed). Bên trái sẽ là nơi điều hướng đến các tính năng chính có


trong hệ thống. Bên phải hiển thị điểm số học tập của người dùng, mô tả sơ lượt về


cấp độ hiện tại, bài viết đã đăng tải, người theo dõi và đang theo dõi, gợi ý kết bạn


dựa theo các tiêu chí phù hợp nhất. Ở giữa, trên cùng sẽ hiển thị chuỗi ngày hoạt


động của người dùng và nhắc nhở học tập nếu ngày đó người dùng chưa luyện tập.


Ở trung tâm sẽ là newsfeed, nơi đăng tải các bài viết mới nhất của tất cả người


dùng.


Hình 4.10 Giao diện người dùng chính






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.3**_ _**Giao diện tin nhắn**_


Ở giao diện này thì người dùng có thể tìm kiếm bạn bè để nhắn tin, trò chuyện


hoặc tạo các nhóm chat để hỗ trợ cùng nhau học tập. Tin nhắn sẽ luôn được gửi


real-time mà không cần phải load lại trang. Ngoài ra, khi ở 1 trang khác thì vẫn sẽ


hiển thị thông báo real-time cho người dùng biết là có người đang nhắn tin.


Hình 4.11 Giao diện tin nhắn khi mới click vào


Khi chọn nhắn tin với 1 người thì sẽ hiển thị xem người đó có online hoặc đã


offline được bao lâu. Góc trái trên cùng sẽ là chi tiết cuộc hội thoại và nút “Gọi”, ở


nút “Gọi” này nếu người dùng đang offline mà nhấn “Gọi” thì hệ thống sẽ hiển thị


không thể gọi còn nếu người nhận đang online thì hệ thống sẽ gửi thông báo real

time rằng có người đang gọi. Bên dưới là các tính năng cơ bản như gửi tin nhắn


text, voice, gửi file hoặc icon. Ngoài ra còn có thả react tin nhắn, replay tin nhắn,


thu hồi, xóa, hiển thị trạng thái người nhận đã xem hay chưa.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.12 Giao diện nhắn tin với bạn bè


Ở giao diện nhóm chat cũng có các chức năng tương tự như nhắn tin cá nhân,


nhưng đối với trưởng nhóm thì có thể quản lí như việc thêm, xóa thành viên, đổi


trưởng nhóm… Hiển thị trong nhóm có người đang online hay không và ở nút


“Gọi” chỉ cần 1 người khác trong nhóm đang online thì sẽ gọi được nếu không có ai


online sẽ thông báo không thể gọi.


Hình 4.13 Giao diện nhắn tin nhóm






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.4**_ _**Giao diện trang cá nhân**_


Nơi lưu giữ các thông tin cá nhân của người dùng, có thể xem các bài viết của


mình, danh sách người theo dõi và đang theo dõi và cập nhật thông tin cá nhân.


Hình 4.14 Giao diện trang cá nhân của người dùng


_**4.5.5**_ _**Giao diện luyện viết**_


Đây là bước đầu tiên trong quá trình luyện viết. Người dùng chọn năng lực


phù hợp với bản thân và thể loại văn bản muốn luyện viết.


Hình 4.15 Giao diện luyện viết (Chọn Level & Topic)






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Tiếp theo, sau khi chọn được mức năng lực và thể loại phù hợp thì sẽ hiển thị


modal để người dùng chọn chế độ tạo bằng AI hoặc có sẵn trên hệ thông. Với chế


độ AI thì người dùng bắt buộc phải bỏ ra 2 bông tuyết (điểm thưởng) mới có thể


dùng được.


Hình 4.16 Chọn chế độ luyện viết


Khi người dùng chọn “Bắt đầu” thì hệ thống sẽ cho người dùng lựa chọn bài


viết dựa trên thể loại đã chọn. Ở đây, nếu người dùng chưa làm 1 bài viết thì bài viết


đó sẽ hiển thị nút “Bắt đầu” và chưa có tiến độ hoàn thành và nếu người dùng đã


luyện qua nhưng chưa hoàn thành toàn bộ thì sẽ lưu lại tiến độ và sẽ hiển thị thành


nút “Tiếp tục”.


Hình 4.17 Danh sách bài viết






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Giao diện luyện viết cung cấp một đoạn văn tiếng Việt để người dùng viết lại


bằng tiếng Anh theo hiểu biết của mình. Người dùng có thể dùng nút Gợi ý (tốn


điểm thưởng) để nhận định hướng viết. Khi bấm Nộp bài, hệ thống sẽ chấm, đưa ra


gợi ý cải thiện và lưu lại lịch sử làm bài nếu chưa hoàn thành.


Hình 4.18 Giao diện trước khi làm bài viết






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Sau khi làm bài xong và nhấn “Nộp bài” hệ thống sẽ kiểm tra đáp án của


người dùng và đưa ra kết luận, gợi ý, sửa lỗi cho người dùng. Ngoài ra sẽ chấm


điểm dựa vào trình độ ôn luyện (chọn level càng cao điểm càng cao) và số lần làm


bài (làm càng nhiều lần số điểm càng ít).


Hình 4.19 Giao diện sau khi làm bài viết


_**4.5.6**_ _**Giao diện luyện nghe**_


Tương tự như luyện viết, sẽ có các bước chọn trình độ và thể loại muốn học,


sau đó chọn chế độ và bài tập muốn nghe. Sau đó hệ thống sẽ tạo ra bài nghe phù


hợp với người dùng. Ở giao diện luyện nghe sẽ có các nút play, pause, tiến, lùi 5


giây, tăng, giảm âm lượng, tăng, giảm tốc độ nói. Bên dưới sẽ là đoạn văn tương


ứng với bài nghe nhưng bị trống 1 vài chỗ để người dùng có thể nghe và điền vào ô


còn thiếu và đặc điểm nổi bật trong đoạn văn bị đục lỗ chính là số lượng dấu nháy


(_) tương ứng với số lượng từ cần điền vào. Bên dưới sẽ là các nút “Thoát” nếu






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


người dùng muốn học bài mới, “Gợi ý” sẽ tự động điền vào ô trống nếu người dùng


không biết đáp án nhưng phải dùng điểm thưởng để sử dụng, “Kiểm tra” hệ thống


sẽ đánh giá từ mà người dùng điền vào là đúng hay sai và cũng sử dụng điểm


thưởng để đổi, “Nộp bài” sau khi hoàn thành điền từ nhấn nộp bài và hệ thống sẽ


kiểm tra đáp án và đưa ra kết luận. Bên phải là phần thống kê tổng quan về lịch sử


làm bài, số lần nộp bài, điểm số cao nhất đạt được, tỷ lệ hoàn thành và 1 đoạn


hướng dẫn cách sử dụng.


Hình 4.20 Giao diện luyện nghe


_**4.5.7**_ _**Giao diện luyện nói**_


Ở luyện nói được chia ra thành 2 loại khác nhau: Luyện nói cá nhân và Luyện


nói với AI. Ở luyện nói cá nhân thì có thể chọn bài nghe từ hệ thống hoặc tạo bởi AI


còn với loại luyện nói với AI được chia thành 2 loại nhỏ là hội thoại được tạo sẵn


ngữ cảnh, người dùng chỉ cần chọn vai trò để nói và trò chuyện theo văn bản được


tạo sẵn, loại còn lại là hội thoại real-time, người dùng cũng chọn vai trò để nói


nhưng không có văn bản tạo sẵn mà người dùng sẽ trực tiếp trò chuyện trong vai trò


được chọn trước đó với AI (đóng vai trò còn lại). Tương tự như luyện nói và luyện


viết, phải sử dụng 2 bông tuyết để sử dụng tính năng AI.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.21 Giao diện chọn loại bài nói


Giao diện luyện nói cá nhân cung cấp 10 câu mẫu dựa trên trình độ và chủ đề


đã chọn. Người dùng xem tiến độ, nghe mẫu qua nút Nghe mẫu, và bấm Bắt đầu để


ghi âm. Danh sách câu giúp theo dõi vị trí hiện tại và yêu cầu hoàn thành từng câu


theo thứ tự. Bên dưới hiển thị kết quả so sánh giữa câu nói của người dùng và đáp


án, từ đó hệ thống đánh giá đúng sai.


Hình 4.22 Giao diện làm bài luyện nói cá nhân






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Tiếp theo là hội thoại với AI được tạo sẵn ngữ cảnh, trước khi bắt đầu thì hệ


thống sẽ cho người dùng lựa chọn vai trò trong cuộc trò chuyện ( ví dụ: người hỏi,


người phản hồi…). Sau đó sẽ đến phần luyện nói, người dùng chỉ cần phát âm đúng


theo mẫu được cung cấp sẵn và hệ thống sẽ đánh giá phát âm của người dùng và trả


về kết quả từ phát âm đúng, sai. Nếu phát âm sai sẽ lưu từ vựng đó vào database để


làm dữ liệu tạo ra bộ từ vựng cá nhân. Ngoài ra còn có phần chỉnh tốc độ nói và


giọng nói của AI để người dùng có thể nghe được đa dạng nhiều giọng hơn.


Hình 4.23 Giao diện luyện nói với AI (1)


Tiếp theo là hội thoại thời gian thực với AI, trước khi bắt đầu thì hệ thống sẽ


cho người dùng lựa chọn vai trò trong cuộc trò chuyện. Sau đó sẽ đến với cuộc hội


thoại, ở đây người dùng sẽ đóng vai thành người trong vai trò đã chọn trước đó và


AI sẽ là người còn lại và nói theo những gì mình biết. Nếu người dùng không biết


trả lời thì sẽ có nút “Gợi ý” để AI sẽ gợi ý câu nói cho người dùng, sau khi người


dùng nói xong thì hệ thống sẽ tự động góp ý về câu trả lời của người dùng và cách


cải thiện thêm. Về phía AI sẽ có nút nghe lại nếu người dùng muốn nghe lại và nút


dịch nghĩa về tiếng việt cho người dùng hiểu được ý nghĩa câu văn đó. Sau khi hoàn


thành hết tất cả, hệ thống sẽ tổng hợp lại dữ liệu và đưa ra góp ý chung (Đánh giá


cuộc trò chuyện) bao gồm nhận xét chung về từ vựng, ngữ pháp, khả năng giao tiếp,


lời khuyên, các từ vựng hữu ích nên học. Ngoài ra còn có phần chỉnh tốc độ nói và


giọng nói của AI để người dùng có thể nghe được đa dạng nhiều giọng hơn.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.24 Giao diện luyện nói với AI (2)


_**4.5.8**_ _**Giao diện từ vựng cá nhân**_


Ở giao diện này, mỗi người dùng sẽ có 1 bộ từ vựng cá nhân của riêng mình


không ai không ai. Bộ từ vựng được thiết kế dựa trên khả năng học tập và rèn luyện


của mỗi người. Hệ thống sẽ lọc ra các từ vựng dựa trên lỗi sai sau mỗi lần luyện tập


của người dùng và khi lỗi của 1 từ đạt đến 5 lần sẽ thông báo cho người dùng biết là


có 1 từ vựng mới vừa được thêm vào bộ từ vựng cá nhân. Trong bộ từ vựng sẽ được


chia ra thành 3 loại: Tổng quan (là những từ vựng mà người dùng chưa thông thạo


hoàn toàn 0-99%); Đã thành thạo (là những từ mà người dùng đã luyện tập thành


thạo 100% và đang chờ luyện tập để tốt nghiệp từ vựng); Theo chủ đề (là các từ


vựng sẽ được phân chia thành các chủ đề để người dùng có thể lựa chọn học tập tùy


ý).






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.25 Giao diện từ vựng cá nhân


Khi click vào 1 trong 3 thẻ bất kì ở Tổng quan sẽ hiển thị ra chi tiết các danh


sách từ của người dùng đang ở trong khoảng thông thạo đã chọn. Ở đây, trung tâm


sẽ là 1 thẻ từ gồm từ tiếng anh và nghe mẫu ở mặt trước, khi click vào sẽ hiển thị ra


mặt sau chứa nghĩa tiếng Việt của từ đó và có các nút để xem các từ tiếp theo trong


bộ từ vựng. Bên dưới là thanh tìm kiếm, người dùng có thể nhập hoặc chọn theo


chữ cái đầu tiên của mỗi từ. Dưới thanh tìm kiếm là danh sách các từ được hiển thị


dưới dạng card, mỗi card sẽ có từ và nghĩa, nghe mẫu, độ thông thạo hiện tại và nút


checkbox. Khi click vào nút checkbox sẽ show ra 1 modal hiển thị từ đã chọn để


luyện tập (có thể chọn được nhiều từ). Khi nhấn luyện tập sẽ tạo ra bài tập dựa vào


các từ đã chọn, ngoài ra khi click trực tiếp vào card sẽ hiển thị ra chi tiết về từ vựng


đó.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


Hình 4.26 Giao diện từ vựng ở Tổng quan


Khi click trực tiếp vào card thì sẽ hiển thị chi tiết về từ vựng đó. Bao gồm: loại


từ, từ đồng nghĩa, trái nghĩa… ngoài ra còn có mô tả và câu ví dụ.


Hình 4.27 Giao diện chi tiết từ vựng






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.9**_ _**Giao diện lộ trình học tập**_


Ở giao diện này, người dùng có thể tạo lộ trình học tập cá nhân dựa vào các


đầu vào mà hệ thống sẽ cho người dùng chọn hoặc nhập, ngoài ra còn dựa vào dữ


liệu học tập cá nhân của người dùng trên hệ thống để tạo ra 1 lộ trình phù hợp.


Hình 4.28 Giao diện lộ trình học tập


Trong chi tiết lộ trình sẽ hiển thị ra các nội dung cần luyện tập trong mỗi tuần


và phải hoàn thành tất cả các mục tiêu của tuần mới được qua tuần tiếp theo.


Hình 4.29 Giao diện chi tiết lộ trình học tập






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.10**_ _**Giao diện thanh toán**_


Hệ thống hỗ trợ các gói học tập nâng cao và điểm thưởng cho người dùng


bằng việc thanh toán trực tuyến qua hệ thống. Sau khi hoàn thành sẽ được nhận các


ưu đãi học tập tương ứng.


Hình 4.30 Giao diện thanh toán






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**4.5.11**_ _**Giao diện admin**_


Hệ thống hỗ trợ cho admin quản lí các thông tin tổng quan của người dùng và


hỗ trợ trong việc quản lí tài khoản, các bài học mới… Giúp cải thiện và tạo ra các


bài tập chất lượng hơn.


Hình 4.31 Giao diện admin






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**4.6** **Kiểm thử hệ thống**


_**4.6.1**_ _**Danh sách các test-case**_


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


_**4.6.2**_ _**Bảng báo cáo kết quả kiểm thử**_


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

## **CHƯƠNG 5: KẾT LUẬN**


**5.1** **Kết quả đạt được**


Sau quá trình nghiên cứu và triển khai, nhóm đã hoàn thành việc xây dựng nền


tảng mạng xã hội hỗ trợ học tập tiếng Anh đa phương tiện với các kết quả chi tiết


như sau:


_**5.1.1**_ _**Về mặt công nghệ và kiến trúc hệ thống**_


Triển khai đa nền tảng đồng bộ và vận hành ổn định trên cả hai nền tảng:


    - Website: Sử dụng Next.js giúp tối ưu hóa SEO và tốc độ tải trang (Server

Side Rendering), mang lại trải nghiệm mượt mà cho người dùng máy tính.


    - Mobile App: Ứng dụng React Native đảm bảo tính tương thích cao trên cả


hệ điều hành iOS và Android, cho phép người dùng học tập linh hoạt mọi


lúc mọi nơi.


Ứng dụng Trí tuệ nhân tạo (AI) chuyên sâu:


    - Tích hợp thành công Gemini API để xây dựng "trợ lý ảo" thông minh. Hệ


thống không chỉ tạo bài tập tự động (Writing, Sepaking, Listening) dựa


trên trình độ người học mà còn có khả năng chấm điểm và phản hồi chi


tiết cho các bài luận (Writing), (Listening) và bài nói (Speaking).


    - Đặc biệt, tính năng Roleplay AI cho phép người dùng thực hành hội thoại


theo các ngữ cảnh cụ thể (công sở, du lịch, đời sống…) với phản hồi thời


gian thực, giúp cải thiện phản xạ giao tiếp.


Hệ thống giao tiếp thời gian thực (Real-time Communication):


    - Sử dụng Socket.IO để xây dựng hệ thống nhắn tin (Chat) và thông báo


(Notification) tức thì, đảm bảo độ trễ thấp (<100ms) trong việc truyền tải


dữ liệu giữa các người dùng.


    - Tích hợp ZegoCloud cung cấp giải pháp gọi thoại (Voice Call) và gọi


video (Video Call) chất lượng HD ổn định, hỗ trợ đắc lực cho việc luyện


tập giao tiếp 1-1 hoặc thảo luận nhóm.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


_**5.1.2**_ _**Về mặt chức năng nghiệp vụ**_


Hệ sinh thái học tập toàn diện:


    - Cung cấp đầy đủ công cụ rèn luyện 3 kỹ năng: Nghe (Listening), Nói


(Speaking), Viết (Writing).


    - Hệ thống quản lý từ vựng cá nhân thông minh áp dụng phương pháp Lặp


lại ngắt quãng (Spaced Repetition), tự động nhắc nhở người dùng ôn tập


các từ vựng vào thời điểm vàng để tối ưu hóa khả năng ghi nhớ.


Môi trường mạng xã hội gắn kết: Xây dựng thành công các tính năng tương


tác xã hội như: Kết bạn, Theo dõi (Follow), Đăng bài chia sẻ kiến thức (Post), Bình


luận và Thả cảm xúc. Điều này tạo ra một cộng đồng học tập sôi nổi, giúp người


dùng duy trì động lực thông qua việc chia sẻ thành tựu và học hỏi lẫn nhau.


Cơ chế Gamification (Trò chơi hóa):


    - Hệ thống bảng xếp hạng (Leaderboard) được cập nhật theo thời gian thực


dựa trên điểm số học tập.


    - Tính năng Chuỗi ngày học (Streak) và hệ thống tiền tệ ảo (Snowflake)


khuyến khích người dùng duy trì thói quen học tập hàng ngày để nhận


phần thưởng và đổi lấy các tính năng nâng cao.


Phân hệ quản trị (Admin Dashboard):


    - Cung cấp cái nhìn tổng quan về sức khỏe hệ thống thông qua các biểu đồ


thống kê trực quan về lượng người dùng mới, doanh thu, tần suất sử dụng


bài tập.


    - Các công cụ quản lý nội dung (CMS) và quản lý người dùng hoạt động


hiệu quả, giúp admin dễ dàng kiểm duyệt nội dung xấu và xử lý các báo


cáo vi phạm.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**5.2** **Hạn chế của đồ án**


Mặc dù hệ thống đã đáp ứng được các yêu cầu cơ bản và nâng cao, tuy nhiên


đề tài vẫn còn tồn tại một số hạn chế nhất định:


    - Độ trễ của tính năng AI: Việc tích hợp Gemini API đôi khi gặp độ trễ


trong phản hồi (latency) khi tạo bài tập hoặc chấm điểm hội thoại thời gian


thực, đặc biệt vào giờ cao điểm, gây ảnh hưởng nhỏ đến trải nghiệm người


dùng liền mạch. Ngoài ra vì là dùng mã nguồn mở miễn phí của Google


nên lượt request sẽ bị hạn chế.


    - Dữ liệu huấn luyện và ngữ cảnh: Mặc dù AI đã hỗ trợ tốt, nhưng các tình


huống hội thoại (Roleplay) đôi khi còn mang tính máy móc, chưa thực sự


tự nhiên như giao tiếp với người bản xứ trong các ngữ cảnh phức tạp.


    - Khả năng chịu tải: Hệ thống hiện tại mới chỉ được kiểm thử ở quy mô nhỏ


(dưới 1.000 người dùng theo ràng buộc thiết kế ban đầu). Hiệu năng xử lý


realtime của Socket.IO và database khi lượng người dùng đồng thời


(CCU) tăng đột biến chưa được kiểm chứng thực tế trên quy mô lớn.


    - Tính năng thanh toán: Chức năng thanh toán hiện tại mới chỉ dừng lại ở


mức tích hợp cơ bản (Sepay/quét mã QR), chưa tích hợp sâu các cổng


thanh toán quốc tế (Visa/Mastercard) để thuận tiện cho người dùng toàn


cầu.


    - Tính năng luyện viết câu và làm bài kiểm tra điểm đầu vào: Hiện tại do bị


giới hạn về thời gian và nhân lực nên chưa thể hoàn thiện các chức năng


trên.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**5.3** **Hướng phát triển**


Dựa trên những kết quả đạt được và các hạn chế nêu trên, nhóm đề xuất các


hướng phát triển trong tương lai để hoàn thiện sản phẩm:


    - Tối ưu hóa AI và Machine Learning: Tinh chỉnh (Fine-tune) mô hình AI


chuyên biệt cho việc dạy tiếng Anh để giảm độ trễ và tăng độ chính xác


trong việc chấm lỗi ngữ pháp, phát âm. Ngoài ra còn phát triển tính năng


"Voice Cloning" để AI có giọng đọc tự nhiên hơn hoặc mô phỏng giọng


của người nổi tiếng, tạo hứng thú cho người học.


    - Nâng cấp hạ tầng kỹ thuật: Triển khai kiến trúc Microservices để tách biệt


các module (Social, Learning, Notification …) giúp hệ thống dễ dàng mở


rộng (Scale-up). Sử dụng Caching (như Redis) để tăng tốc độ tải trang và


giảm tải cho Database chính.


    - Mở rộng tính năng làm bài kiểm tra và luyện viết câu: Tính năng làm bài


kiểm tra là để giúp mỗi người dùng đánh giá mức năng lực hiện tại của


bản thân trước khi bước vào sân chơi học tập của hệ thống và sau mỗi 1


khoảng thời gian thì sẽ đánh giá lại mức năng lực hiện tại đã được cải


thiện hơn bao nhiêu. Đối với luyện viết câu sẽ giúp người dùng cải thiện


kỹ năng luyện viết theo từng câu riêng lẻ.


    - Mở rộng tính năng cộng đồng (Gamification): Phát triển thêm tính năng


“Phòng học trực tuyến” giữa 2 hoặc nhiều người, tạo cho mọi người


không gian để phát triển khả năng giao tiếp, học hỏi cũng như làm quen


với nhiều bạn bè quốc tế. Ngoài ra sẽ tổ chức các sự kiện định kì và


livestream bài giảng từ giáo viên.


    - Thương mại hóa sản phẩm: Hoàn thiện quy trình thanh toán tự động. Phát


triển các gói Premium mới với các tính năng nâng cao như: Lộ trình học


1-1 với AI không giới hạn, phân tích sâu các chỉ số tiến bộ, và loại bỏ


quảng cáo.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


    - Phát hành ứng dụng: Đưa ứng dụng lên các kho tải chính thức (Google


Play và Apple App Store) để tiếp cận rộng rãi đối tượng người dùng thực


tế.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **TÀI LIỆU THAM KHẢO**


**Tài liệu tiếng Việt**


[1]. T. H. Luyen, T. T. M. Duc, and B. T. H. Thai, Mạng xã hội với sinh viên.


Hanoi : VNU Publishing House, 2015.


**Tài liệu Tiếng Anh**


[2]. Vygotsky, L. S. (1978). _Mind in Society: The Development of Higher_


_Psychological Processes_ . Harvard University Press.


[3]. M.-N. Lamy and K. Zourou, Social Networking for Language Education.


Palgrave Macmillan, 2012.


[4]. Information Resources Management Association, Social Media in


Education: Breakthroughs in Research and Practice. IGI Global, 2018.


[5]. R. C. Martin, _Clean Architecture: A Craftsman's Guide to Software_


_Structure and Design_ . Prentice Hall, 2017.


[6]. P. Kuchana, Software Architecture Design Patterns in Java. Boca Raton,


FL : Auerbach Publications, 2004.


**Các tài liệu từ Internet**


[7]. Statista. (2024). Number of language learning app users worldwide from


[2015 to 2024. Available: https://www.statista.com](https://www.statista.com/)


[8]. David Flanagan. Javascript: The Definitive Guide, 7 th Edition. O’Reilly Media


Inc, 2020.


[9]. TypeScript for JavaScript Programmers. Available:


[https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)


[10]. [What is React.js. Available: https://legacy.reactjs.org/docs/getting-started.html](https://legacy.reactjs.org/docs/getting-started.html)


[11]. M. Riva, Real-World Next.js: Build scalable, high-performance, and


modern web applications using Next.js, the React framework for production. Packt


Publishing Ltd, 2022.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


[12]. O’Reilly Media, Inc. (2020) Chapter 1: What Is React Native? [Online].


[Available: https://www.oreilly.com/library/view/learning-react- native/](https://www.oreilly.com/library/view/learning-react-%20native/9781491929049/ch01.html)


[13]. GeeksforGeeks, Express.js Tutorial, (Update 2025), Available:


[https://www.geeksforgeeks.org/node-js/express-js/](https://www.geeksforgeeks.org/node-js/express-js/)


[14]. Socket.IO, Inc. (2025) Introduction | Socket.IO. Available:


[https://socket.io/docs/v4/](https://socket.io/docs/v4/)


[15]. Cloudinary Assets product overview. Available:


[https://cloudinary.com/documentation](https://cloudinary.com/documentation)


[16]. Hafiz Azam. (2023) ZegoCloud Introduction. Available:


[https://medium.com/@sp20-bse-110/zegocloud-introduction-704adaa4f600](https://medium.com/@sp20-bse-110/zegocloud-introduction-704adaa4f600)


[17]. What is Google Gemini API and How to Use it? Available:


[https://apidog.com/blog/google-gemini-api/](https://apidog.com/blog/google-gemini-api/)


[18]. [Getting started with tailwind CSS. Available : https://v2.tailwindcss.com/docs](https://v2.tailwindcss.com/docs)


[19]. [Google Cloud overview. Available : https://docs.cloud.google.com/docs](https://docs.cloud.google.com/docs)


[20]. [Giới thiệu về Sepay. Available : https://sepay.vn/gioi-thieu.html](https://sepay.vn/gioi-thieu.html)


[21]. [Sepay là gì ? Available : https://docs.sepay.vn/](https://docs.sepay.vn/)


[22]. Bradshaw, S., Brazil, E., & Chodorow, K. (2019). MongoDB: the definitive


guide: powerful and scalable data storage. O'Reilly Media.


[23]. [Supabase Overview. Available : https://supabase.com/docs](https://supabase.com/docs)


[24]. R. Stones and N. Matthew, _Beginning Databases with PostgreSQL: From_


_Novice to Professional_, 2nd ed. Berkeley, CA: Apress, 2005.


[25]. DigitalOcean. (2024). The DigitalOcean Cloud Platform. Available:


[https://www.digitalocean.com](https://www.digitalocean.com/)






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

## **PHỤ LỤC**


Phụ lục 1. Kế hoạch thực hiện đề tài


Phụ lục 2. Nhật ký thực hiện


Phụ lục 3. Kế hoạch khởi nghiệp


Phụ lục 4. Kết quả kiểm tra đạo văn






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **KẾ HOẠCH THỰC HIỆN**










|Tuần|Thời Gian|Công việc|Giai đoạn|
|---|---|---|---|
|Tuần 1|11.08.2025<br>- <br>16.08.2025<br>|**FE:**<br>- Khởi tạo dự án Web (Next.js +<br>Tailwind CSS).<br>- Khởi tạo dự án Mobile (React<br>Native + NativeWind).<br>- Setup cấu trúc thư mục UI.<br>**BE:**<br>- Khởi tạo backend Node.js +<br>Express.<br>- Tạo repo GitHub<br>- Thiết kế sơ đồ kiến trúc hệ thống, vẽ<br>ERD DB.<br>- Document:<br>- Lập kế hoạch 15 tuần<br>- Xem các website tương tự để hiểu rõ<br>nghiệp vụ<br>- Tài liệu báo cáo<br>- Chương 1: Lý do chọn đề tài, Mục<br>tiêu, Phạm vi, Phương pháp.<br>- Thu thập tài liệu tham khảo.|Phân tích,<br>thiết kế và<br>thu thập<br>yêu cầu|
|Tuần 2|18.08.2025<br>- <br>23.08.2025<br>|**FE:**<br>- Tạo layout chính (Header, Footer,<br>Navigation).<br>- Thiết kế wireframe UI các màn hình<br>chính.|Thực hiện|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_








|Col1|Col2|BE:<br>- Thiết lập kết nối MongoDB +<br>Supabase.<br>- Cấu high Docker, GitHub Actions.<br>- Hoàn thiện thiết kế CSDL.<br>- Document:<br>- Hoàn thiện Chương 1.<br>- Bắt đầu Chương 2: Tổng quan công<br>nghệ.|Col4|
|---|---|---|---|
|Tuần 3|25.08.2025<br>- <br>30.08.2025<br>|**FE:**<br>- Form đăng ký, đăng nhập, quên mật<br>khẩu (Web + Mobile).<br>**BE:**<br>- API Đăng ký, Đăng nhập (JWT).<br>- Middleware xác thực.<br>- Validate dữ liệu đầu vào.<br>- Document:<br>- Chương 2: Mô tả chi tiết công nghệ<br>frontend/backend, database, socket.|**FE:**<br>- Form đăng ký, đăng nhập, quên mật<br>khẩu (Web + Mobile).<br>**BE:**<br>- API Đăng ký, Đăng nhập (JWT).<br>- Middleware xác thực.<br>- Validate dữ liệu đầu vào.<br>- Document:<br>- Chương 2: Mô tả chi tiết công nghệ<br>frontend/backend, database, socket.|
|Tuần 4|01.09.2025<br>- <br>06.09.2025<br>|**FE:**<br>- Trang chỉnh sửa hồ sơ, đổi mật<br>khẩu, cài đặt quyền riêng tư.<br>**BE:**<br>- API cập nhật hồ sơ, đổi mật khẩu,|**FE:**<br>- Trang chỉnh sửa hồ sơ, đổi mật<br>khẩu, cài đặt quyền riêng tư.<br>**BE:**<br>- API cập nhật hồ sơ, đổi mật khẩu,|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_








|Col1|Col2|quyền riêng tư.<br>- Document:<br>- Hoàn thiện Chương 2.<br>- Bắt đầu Chương 3: Yêu cầu hệ<br>thống.|Col4|
|---|---|---|---|
|Tuần 5|08.09.2025<br>- <br>13.09.2025<br>|**FE:**<br>- Màn hình newsfeed, hiển thị bài<br>viết.<br>**BE:**<br>- API đăng bài (text, ảnh, video).<br>- Upload ảnh/video Cloudinary.<br>- API lấy danh sách bài viết<br>- Document:<br>- Chương 3: Yêu cầu chức năng & phi<br>chức năng.|**FE:**<br>- Màn hình newsfeed, hiển thị bài<br>viết.<br>**BE:**<br>- API đăng bài (text, ảnh, video).<br>- Upload ảnh/video Cloudinary.<br>- API lấy danh sách bài viết<br>- Document:<br>- Chương 3: Yêu cầu chức năng & phi<br>chức năng.|
|Tuần 6|15.09.2025<br>- <br>20.09.2025<br>|**FE:**<br>- UI bình luận, like realtime.<br>**BE:**<br>- API like, bình luận realtime<br>(Socket.io).<br>- API xóa bài viết.<br>- Document:<br>- Chương 3: Use case, biểu đồ hoạt<br>động.|**FE:**<br>- UI bình luận, like realtime.<br>**BE:**<br>- API like, bình luận realtime<br>(Socket.io).<br>- API xóa bài viết.<br>- Document:<br>- Chương 3: Use case, biểu đồ hoạt<br>động.|




_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_








|Tuần 7|22.09.2025<br>-<br>27.09.2025|FE:<br>- UI chat 1-1, danh sách cuộc trò<br>chuyện.<br>BE:<br>- API chat 1-1, group (Socket.io).<br>- API tạo phòng chat, quản lý thành<br>viên.<br>- Document:<br>- Chương 3: Sơ đồ kiến trúc hệ thống,<br>thiết kế CSDL.|Col4|
|---|---|---|---|
|Tuần 8|29.09.2025<br>- <br>04.10.2025<br>|**FE:**<br>- UI chat nhóm, gửi ảnh/file.<br>**BE:**<br>- Xử lý gửi ảnh/file trong chat.<br>- Tối ưu socket cho chat realtime.<br>- Document:<br>- Hoàn thiện Chương 3.<br>- Bắt đầu Chương 4: Xây dựng hệ<br>thống – Frontend.|**FE:**<br>- UI chat nhóm, gửi ảnh/file.<br>**BE:**<br>- Xử lý gửi ảnh/file trong chat.<br>- Tối ưu socket cho chat realtime.<br>- Document:<br>- Hoàn thiện Chương 3.<br>- Bắt đầu Chương 4: Xây dựng hệ<br>thống – Frontend.|
|Tuần 9|06.10.2025<br>- <br>11.10.2025<br>|**FE:**<br>- UI gọi video (bật/tắt mic/camera).<br>**BE:**|**FE:**<br>- UI gọi video (bật/tắt mic/camera).<br>**BE:**|




_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_








|Col1|Col2|- Tích hợp WebRTC cho video call 1-<br>1 & nhóm.<br>- Document:<br>- Chương 4: Xây dựng hệ thống –<br>Backend (Auth, User, Social).|Col4|
|---|---|---|---|
|Tuần 10|13.10.2025<br>- <br>18.10.2025<br>|**FE:**<br>- UI luyện viết câu, đoạn văn.<br>- UI flashcard từ vựng.<br>**BE:**<br>- API luyện viết câu/đoạn, custom từ<br>vựng.<br>- API lưu kết quả học tập.<br>- Document:<br>- Chương 4: Tích hợp API Learning.|**FE:**<br>- UI luyện viết câu, đoạn văn.<br>- UI flashcard từ vựng.<br>**BE:**<br>- API luyện viết câu/đoạn, custom từ<br>vựng.<br>- API lưu kết quả học tập.<br>- Document:<br>- Chương 4: Tích hợp API Learning.|
|Tuần 11|20.10.2025<br>- <br>25.10.2025<br>|**FE:**<br>- UI bảng xếp hạng (Leaderboard).<br>**BE:**<br>- API leaderboard, tính điểm, huy<br>hiệu, chuỗi ngày học.<br>- Document:<br>- Chương 5: Kế hoạch test & kịch bản<br>test.|**FE:**<br>- UI bảng xếp hạng (Leaderboard).<br>**BE:**<br>- API leaderboard, tính điểm, huy<br>hiệu, chuỗi ngày học.<br>- Document:<br>- Chương 5: Kế hoạch test & kịch bản<br>test.|




_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_










|Tuần 12|27.10.2025<br>-<br>01.11.2025|FE:<br>- Hoàn thiện UI Learning.<br>- BE:<br>- Test & tối ưu module Learning.<br>- Document:<br>- Chương 5: Phân tích kết quả kiểm<br>thử.|Col4|
|---|---|---|---|
|Tuần 13|03.11.2025<br>- <br>08.11.2025<br>|**FE:**<br>- UI chat với chatbot, highlight lỗi sai.<br>**BE:**<br>- Tích hợp AI Chatbot (OpenAI API).<br>- Document:<br>- Hoàn thiện Chương 5.|**FE:**<br>- UI chat với chatbot, highlight lỗi sai.<br>**BE:**<br>- Tích hợp AI Chatbot (OpenAI API).<br>- Document:<br>- Hoàn thiện Chương 5.|
|Tuần 14|10.11.2025<br>– <br>15.11.2025<br>|**FE:**<br>- Kiểm thử toàn bộ chức năng<br>Frontend.<br>- Ghi nhận lỗi UI/UX.<br>**BE:**<br>- Kiểm thử API, bảo mật, hiệu năng.<br>- Sửa lỗi backend.<br>- Document:<br>- Chương 6: Kết luận & hướng phát<br>triển.<br>- Hoàn thiện các chương 1–5 dựa trên|Kiểm thử|




_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_










|Col1|Col2|kết quả test.|Col4|
|---|---|---|---|
|Tuần 15|17.11.2025<br>- <br>22.11.2025<br>|**FE:**<br>- Sửa UI/UX lần cuối.<br>- Chuẩn bị bản demo.<br>**BE:**<br>- Sửa bug còn tồn đọng.<br>- Deploy backend chính thức.<br>- Document:<br>- Hoàn thiện báo cáo cuối cùng,<br>format, làm slide bảo vệ, tập dượt<br>thuyết trình.|Triển khai|




_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **NHẬT KÝ THỰC HIỆN**






































|Tuần|Từ ngày|Đến ngày|Tóm tắt công việc thực<br>hiện|Nhận xét<br>của GVHD|
|---|---|---|---|---|
|**Tuần 1**|04/08/2025|09/08/2025|Nộp phiếu đăng ký KLTN|Hoàn thành|
|**Tuần 1**|04/08/2025|09/08/2025|Lập kế hoạch thực hiện 15<br>tuần|Hoàn thành|
|**Tuần 1**|04/08/2025|09/08/2025|Khảo sát thực tế, thu thập và<br>viết nghiệp vụ đề tài|Hoàn thành|
|**Tuần 2**|09/08/2025|13/08/2025|Thiết kế mô hình Use case|Hoàn thành|
|**Tuần 2**|09/08/2025|13/08/2025|Thiết kế mô hình lớp|Hoàn thành|
|**Tuần 2**|09/08/2025|13/08/2025|Thiết kế các UI|Hoàn thành|
|**Tuần 2**|09/08/2025|13/08/2025|Viết cuốn báo cáo|Hoàn thành|
|**Tuần 3**|13/08/2025|20/08/2025|Thiết kế các UI (tt)|Hoàn thành|
|**Tuần 3**|13/08/2025|20/08/2025|API Đăng ký, Đăng nhập<br>(JWT).|Hoàn thành|
|**Tuần 3**|13/08/2025|20/08/2025|Middleware xác thực.|Hoàn thành|
|**Tuần 3**|13/08/2025|20/08/2025|Validate dữ liệu đầu vào.|Hoàn thành|
|**Tuần 3**|13/08/2025|20/08/2025|Đề xuất hướng viết bài báo<br>NCKH|Hoàn thành|
|**Tuần 4**|20/08/2025|27/08/2025|Thiết kế các UI (tt)|Hoàn thành|
|**Tuần 4**|20/08/2025|27/08/2025|Social, chat, post, comment|Hoàn thành|
|**Tuần 4**|20/08/2025|27/08/2025|Viết cuốn báo cáo|Hoàn thành|
|**Tuần 4**|20/08/2025|27/08/2025|Demo chức năng luyện viết|Hoàn thành|
|**Tuần 5**|27/08/2025|03/09/2025|Minh họa chức năng luyện<br>từ vựng|Hoàn thành|
|**Tuần 6**|03/09/2025|10/09/2025|Tìm hiểu luyện viết|Hoàn thành|
|**Tuần 6**|03/09/2025|10/09/2025|Hoàn thiện UI|Hoàn thành|
|**Tuần 6**|03/09/2025|10/09/2025|Viết file bài báo|Hoàn thành|
|**Tuần 7**|10/09/2025|17/09/2025|Nghe chép chính tải|Hoàn thành|
|**Tuần 7**|10/09/2025|17/09/2025|Luyện nói|Hoàn thành|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_
























|Tuần 8|17/09/2025|26/09/2025|Cá nhân hóa người dùng|Hoàn thành|
|---|---|---|---|---|
|**Tuần 8**|17/09/2025|26/09/2025|Làm mobile app|Hoàn thành|
|**Tuần 9**|26/09/2025|03/10/2025|Hiện thực UI (web + mobile<br>app)|Hoàn thành|
|**Tuần 9**|26/09/2025|03/10/2025|Đa ngôn ngữ|Hoàn thành|
|**Tuần 9**|26/09/2025|03/10/2025|Luyện đọc|Hoàn thành|
|**Tuần 10**|03/10/2025|09/10/2025|Học từ vựng|Hoàn thành|
|**Tuần 10**|03/10/2025|09/10/2025|Tính điểm luyện tập|Hoàn thành|
|**Tuần 10**|03/10/2025|09/10/2025|Luyện nghe|Hoàn thành|
|**Tuần 10**|03/10/2025|09/10/2025|Thanh toán mua tài khoản<br>Premium|Hoàn thành|
|**Tuần 10**|03/10/2025|09/10/2025|Luyện nói với AI|Hoàn thành|
|**Tuần 11**|09/10/2025|05/12/2025|Admin|Hoàn thành|
|**Tuần 11**|09/10/2025|05/12/2025|Mobile app|Hoàn thành|
|**Tuần 11**|09/10/2025|05/12/2025|Bảng xếp|Hoàn thành|
|**Tuần 11**|09/10/2025|05/12/2025|Thống kê|Hoàn thành|
|**Tuần 12**|17/10/2025|24/10/2025|Viết cuốn báo cáo|Hoàn thành|
|**Tuần 12**|17/10/2025|24/10/2025|Bài báo|Hoàn thành|
|**Tuần 13**|24/10/2025|02/11/2025|Deploy|Hoàn thành|
|**Tuần 13**|24/10/2025|02/11/2025|Bài báo|Hoàn thành|
|**Tuần 13**|24/10/2025|02/11/2025|Thành tích|Hoàn thành|
|**Tuần 14**|02/11/2025|16/11/2025|Admin|Hoàn thành|
|**Tuần 14**|02/11/2025|16/11/2025|Mobie App|Hoàn thành|
|**Tuần 14**|02/11/2025|16/11/2025|Kiểm thử|Hoàn thành|
|**Tuần 15**|16/11/2025|24/11/2025|Đăng nhập không quá 5 lần|Hoàn thành|
|**Tuần 15**|16/11/2025|24/11/2025|Luyện nói với ChatGPT|Hoàn thành|
|...|...|...|…|…|






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **KẾ HOẠCH KHỞI NGHIỆP**


**Tên dự án:** Social-Learning - Nền tảng mạng xã hội hỗ trợ học tập tiếng Anh và


giao tiếp đa phương tiện.


**1.** **Tổng quan dự án**


**Mục tiêu:** Xây dựng hệ sinh thái kết hợp giữa mạng xã hội và công cụ học tập


tiếng Anh (Nghe, Nói, Viết) tích hợp AI (Gemini) và giao tiếp thời gian thực


(ZegoCloud, Socket.IO).


**Thị trường mục tiêu:** Sinh viên, người đi làm và cá nhân có nhu cầu rèn


luyện tiếng Anh tại Việt Nam.


**Thời gian thực hiện:** 15 tuần (Từ 11/08/2025 đến 22/11/2025).


**Vốn đầu tư dự kiến:** 2 tỷ VNĐ (Vốn tự có và kêu gọi đầu tư).


**2.** **Cơ cấu tổ chức và Nhân sự**


Dự án được vận hành với mô hình tinh gọn, bao gồm các vai trò chủ chốt:


    - **Chủ dự án/Quản lý dự án (PM):** Nguyễn Thanh Thuận – Chịu trách


nhiệm quản lý tổng thể, lập trình Backend và AI.


    - **Thành viên phát triển (Developer):** Trương Quốc Bảo – Phụ trách phát


triển Mobile App và Frontend Website.


    - **Cố vấn chuyên môn:** ThS. Nguyễn Thị Hoàng Khánh – Định hướng


chiến lược và giám sát chất lượng.


    - **Nhà đầu tư:** Ông Lâm Phong (Giám đốc TQ Club) – Cung cấp nguồn lực


tài chính.


**3.** **Kế hoạch triển khai (WBS)**


Dự án được chia thành các giai đoạn chính để đảm bảo tiến độ và chất lượng:


1) **Giai đoạn Khởi động & Lập kế hoạch:** Thiết lập dự án, môi trường phát


triển (Node.js, Next.js), phân tích nghiệp vụ và Use-case.


2) **Giai đoạn Phân tích & Thiết kế:** Thiết kế kiến trúc hệ thống (Client

Server), thiết kế CSDL (PostgreSQL, MongoDB) và UI/UX cho


Web/Mobile.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


3) **Giai đoạn Phát triển (Core & Social):** Xây dựng module xác thực (JWT,


OTP), mạng xã hội (Newsfeed, CRUD bài viết), tích hợp Cloudinary.


4) **Giai đoạn Phát triển (Giao tiếp & Real-time):** Xây dựng hệ thống Chat


(Socket.IO) và Video Call (ZegoCloud).


5) **Giai đoạn Phát triển (Học tập & AI):** Tích hợp Gemini API cho luyện


viết/nghe, Google Cloud Speech-to-Text cho luyện nói, và hệ thống từ


vựng (Spaced Repetition).


6) **Giai đoạn Gamification & Quản trị:** Xây dựng bảng xếp hạng, tích hợp


thanh toán Sepay và Admin Dashboard.


7) **Giai đoạn Kiểm thử & Đóng gói:** Unit Test, Integration Test, kiểm thử


hiệu năng và triển khai lên Digital Ocean/Vercel.


**4.** **Quản lý tài chính**


**Chi phí nhân sự:** Dự kiến chi trả lương cho đội ngũ phát triển và cố vấn


chuyên môn khoảng 45.000.000 VNĐ/tháng.


**Chi phí tài nguyên & Hạ tầng:** Tổng chi phí ước tính khoảng 2.800.000


VNĐ cho các dịch vụ: Server Digital Ocean, API ZegoCloud/Gemini, tên miền và


tài khoản Developer.


**5.** **Quản lý chất lượng**


**Kiểm soát mã nguồn:** Sử dụng GitHub, quy trình Code Review chéo và tuân


thủ chuẩn ESLint.


**Kiểm thử:** Thực hiện đầy đủ các cấp độ từ Unit Testing (Jest/Mocha),


Integration Testing (API, Socket.IO) đến System Testing (Luồng nghiệp vụ trọn


vẹn).


**Tiêu chí nghiệm thu:** Hệ thống phải hoàn thành 100% tính năng cốt lõi, chịu


tải được 50-100 CCU và hoạt động ổn định trên Android/Web.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_


**6.** **Kết thúc dự án**


Dự án được nghiệm thu vào ngày 19/12/2025 với sự tham gia của Ban quản lý


dự án và Nhà đầu tư. Sản phẩm bàn giao bao gồm: Mã nguồn hệ thống, Tài liệu


hướng dẫn sử dụng và Nền tảng đã được triển khai thành công trên máy chủ.






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_

### **KẾT QUẢ KIỂM TRA ĐẠO VĂN**






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_






_Khóa luận tốt nghiệp ngành Kỹ thuật phần mềm_ _Social Learning_






