# Kế hoạch viết báo cáo khoá luận: Hệ thống IELTS (Web + Mobile)

> **Cập nhật lần cuối:** 2026-05-08  
> **LaTeX file chính:** `/Users/xis108/Desktop/thesis-report/main.tex`  
> **Bài mẫu tham chiếu:** `Sample-report.md` (Social Learning platform)  
> **Lưu ý:** `main.tex` hiện có nội dung TOEIC cũ (Spring Boot) → **cần viết lại toàn bộ nội dung cho IELTS (NestJS)**. Cấu trúc LaTeX và preamble giữ nguyên.  
> **Nhóm:** 2 người → dùng xưng hô **"chúng em"** toàn bài; cần có **2 tên** trên bìa và footer.

---

## Mục lục nội bộ

1. [Phân tích bài mẫu](#1-phân-tích-bài-mẫu)
   - 1.1 Cấu trúc tổng thể
   - 1.2 Nội dung từng chương
   - 1.3 Quy ước trình bày
   - 1.4 Ngôn ngữ & văn phong
   - 1.5 Điểm mạnh & điểm cần cải thiện
2. [Outline đề xuất cho dự án IELTS](#2-outline-đề-xuất-cho-dự-án-ielts)
3. [Checklist nội dung từng chương](#3-checklist-nội-dung-từng-chương)
4. [Thứ tự ưu tiên viết](#4-thứ-tự-ưu-tiên-viết)
5. [Ước tính khối lượng](#5-ước-tính-khối-lượng)
6. [Lưu ý LaTeX đặc thù](#6-lưu-ý-latex-đặc-thù)
7. [Trạng thái tổng quan từng phần](#7-trạng-thái-tổng-quan-từng-phần)

---

## 1. Phân tích bài mẫu

### 1.1 Cấu trúc tổng thể (theo thứ tự xuất hiện)

```
[Bìa tiếng Việt]
[Bìa tiếng Anh]
[Abstract (EN)]
[Lời cảm ơn]
[Nhận xét GVHD]
[Nhận xét GVPB 1]
[Nhận xét GVPB 2]
[Mục lục]
[Danh mục hình ảnh]        ← 31 hình
[Danh mục bảng biểu]       ← 13 bảng
[Danh mục từ viết tắt]     ← 33 từ
[Lời mở đầu]               ← ~1 trang
CHƯƠNG 1: GIỚI THIỆU       ← ~5 trang
  1.1 Tổng quan
  1.2 Mục tiêu đề tài
  1.3 Phạm vi đề tài
  1.4 Mô tả yêu cầu chức năng
  1.5 Các ràng buộc và quy tắc quản lý
  1.6 Mô tả yêu cầu phi chức năng
CHƯƠNG 2: CƠ SỞ LÝ THUYẾT  ← ~15 trang
  2.1 Ngôn ngữ lập trình
  2.2 Frameworks
  2.3 Công nghệ & thư viện
  2.4 Cơ sở dữ liệu
  2.5 Kiến trúc phần mềm
  2.6 Hosting
CHƯƠNG 3: PHÂN TÍCH         ← ~65 trang
  3.1 Quy trình nghiệp vụ
  3.2 Use-case tổng quát
  3.3 Danh sách tác nhân và mô tả
  3.4 Danh sách tình huống hoạt động chính (29 UC)
  3.5 Đặc tả các yêu cầu chức năng (9 UC được đặc tả chi tiết)
       Mỗi UC gồm: Bảng mô tả → Activity diagram → Sequence diagram(s) → Mô tả kỹ thuật chi tiết
CHƯƠNG 4: THIẾT KẾ VÀ HIỆN THỰC  ← ~40 trang
  4.1 Sơ đồ lớp
  4.2 Sơ đồ cơ sở dữ liệu (SQL + NoSQL)
  4.3 Sơ đồ kiến trúc phần mềm
  4.4 Sơ đồ luồng màn hình (web + mobile)
  4.5 Giao diện chương trình (11 màn hình)
  4.6 Kiểm thử hệ thống (danh sách TC + bảng kết quả)
CHƯƠNG 5: KẾT LUẬN          ← ~8 trang
  5.1 Kết quả đạt được (công nghệ + chức năng)
  5.2 Hạn chế của đồ án
  5.3 Hướng phát triển
[Tài liệu tham khảo] ← 25 tài liệu, phân loại VN/EN/Internet
[Phụ lục]
  - Phụ lục 1: Kế hoạch thực hiện (bảng 15 tuần)
  - Phụ lục 2: Nhật ký thực hiện
  - Phụ lục 3: Kế hoạch khởi nghiệp
  - Phụ lục 4: Kết quả kiểm tra đạo văn
```

---

### 1.2 Nội dung từng chương

| Chương | Mục đích | Ước tính trang | Đặc điểm nổi bật |
|--------|----------|---------------|-----------------|
| Lời mở đầu | Bối cảnh vĩ mô → dẫn dắt vào đề tài | 1 trang | Câu mở đề cập xu hướng công nghệ (IR 4.0), kết bằng tên đề tài in đậm |
| Chương 1 | Giới thiệu tổng quan đề tài, mục tiêu, phạm vi | ~5 trang | Gạch đầu dòng, viết ngắn gọn. Phi chức năng: hiệu năng/bảo mật/khả năng mở rộng |
| Chương 2 | Lý thuyết nền, justification cho từng công nghệ | ~15 trang | Mỗi công nghệ ~0.5-1 trang; kèm hình minh họa (mô hình/luồng hoạt động) |
| Chương 3 | Phân tích nghiệp vụ sâu, đặc tả UC | ~65 trang | Phần dài nhất. Mỗi UC đặc tả: Bảng 2-cột (Actor/Hệ thống) + Activity + Sequence + Mô tả kỹ thuật ~1 trang |
| Chương 4 | Thiết kế + hiện thực + kiểm thử | ~40 trang | Nhiều hình giao diện thực tế (screenshot). Bảng test case + kết quả (Pass/Fail) |
| Chương 5 | Tổng kết, tự đánh giá, đề xuất | ~8 trang | Chia rõ: Về công nghệ / Về chức năng. Thành thật về hạn chế |

---

### 1.3 Quy ước trình bày

- **Hình ảnh:** Caption dạng `Hình X.Y Mô tả hình`; đánh số liên tục theo chương; chèn bằng `\includegraphics` + `\caption` + `\label`
- **Bảng biểu:** Caption dạng `Bảng X.Y Mô tả bảng`; bảng UC dùng 2 cột (Actor | Hệ thống) với `tabularx`; có `\hline` mọi dòng
- **Đặc tả UC:** Pattern cố định: `\subsubsection{Mô tả use case}` → table → `\subsubsection{Activity diagram}` → figure → `\subsubsection{Sequence diagram}` → figure(s) → `\subsubsection{Mô tả chi tiết}`
- **Trích dẫn:** Theo chuẩn IEEE `[n]`, phân nhóm: Tài liệu Tiếng Việt / Tiếng Anh / Internet
- **Header/Footer:** Đã được định nghĩa 2 style: `frontmatter` (roman page num) và `mainstyle` (arabic)
- **Dòng kẻ:** Trang nhận xét GVHD/GVPB dùng `\dotline` (dấu chấm)
- **Gạch đầu dòng:** Dùng `\begin{itemize}` hoặc `\begin{description}` (cho các mục có tiêu đề đậm)

---

### 1.4 Ngôn ngữ & văn phong

- **Xưng hô:** "chúng em" (đây là nhóm 2 người); nhất quán toàn bài
- **Văn phong:** Học thuật – formal, câu dài, dùng nhiều mệnh đề phụ
- **Mô tả kỹ thuật:** Đi sâu vào cơ chế xử lý (flow backend, thuật toán, lý do chọn kỹ thuật cụ thể); không chỉ nêu "dùng X" mà giải thích "tại sao chọn X" và "X hoạt động như thế nào"
- **Trích dẫn lý thuyết:** Phần Tổng quan dẫn số liệu (Statista 2024 – 500 triệu người dùng app học ngoại ngữ) + trích dẫn nghiên cứu học thuật (Vygotsky 1978)
- **Câu mở đầu chương:** Thường bắt đầu bằng ngữ cảnh rộng → thu hẹp vào vấn đề cụ thể
- **Mô tả chi tiết UC:** Dùng "Cụ thể, ...", "Điểm kỹ thuật quan trọng nhất là...", "Tại đây, hệ thống sẽ..."

---

### 1.5 Điểm mạnh & điểm cần cải thiện

**Điểm mạnh học hỏi:**
- ✅ Mô tả kỹ thuật (section 3.5.x.4) cực kỳ chi tiết – giải thích flow Backend từng bước, lý do chọn công nghệ
- ✅ Bảng UC 2-cột Actor/Hệ thống rõ ràng, có cả Alternative Flow
- ✅ Kết hợp hình ảnh giao diện thực tế (screenshot) trong chương 4
- ✅ Phụ lục Kế hoạch khởi nghiệp thể hiện tư duy sản phẩm thực tế
- ✅ Phân tích kết quả kiểm thử có bảng Pass/Fail cụ thể với dữ liệu đầu vào rõ ràng

**Điểm có thể cải thiện (nên làm tốt hơn):**
- ⚡ Chương 2 của mẫu khá mô tả chung; nên **liên kết rõ hơn** giữa lý thuyết và cách áp dụng vào dự án cụ thể
- ⚡ Nên có bảng **so sánh các giải pháp thay thế** (vd: tại sao chọn NestJS thay vì Express.js thuần?)
- ⚡ Phần kiểm thử chỉ có blackbox testing; nên bổ sung **kiểm thử hiệu năng** (response time, load test) cho hệ thống IELTS
- ⚡ Số lượng tài liệu tham khảo đủ (~25) nhưng nên có thêm **tài liệu về IELTS/language assessment** nếu làm hệ thống luyện thi

---

## 2. Outline đề xuất cho dự án IELTS

```
[Bìa tiếng Việt]    ← Cập nhật tên đề tài + tên SV
[Bìa tiếng Anh]
[Abstract (EN)]     ← Sửa lại theo dự án IELTS
[Lời cảm ơn]
[Nhận xét GVHD / GVPB 1 / GVPB 2]
[Mục lục tự động]
[Danh mục hình ảnh tự động]
[Danh mục bảng biểu tự động]
[Danh mục từ viết tắt]

LỜI MỞ ĐẦU
  → Bối cảnh toàn cầu hóa + nhu cầu IELTS tại Việt Nam
  → Hạn chế nền tảng hiện có (Cambly, ELSA Speak, British Council...)
  → Lý do thực hiện đề tài

CHƯƠNG 1: GIỚI THIỆU
  1.1 Tổng quan
      → Số liệu: người thi IELTS tăng trưởng hàng năm
      → Hạn chế: thiếu nền tảng tích hợp đủ 4 kỹ năng + AI scoring
  1.2 Mục tiêu đề tài
      → 4 kỹ năng (L/R/W/S) + Mock Test
      → AI scoring cho Speaking & Writing
      → Multi-platform: Web + Mobile
  1.3 Phạm vi đề tài
      → Đối tượng: người học IELTS từ band 4.0 → 7.5+
      → Không bao gồm: dạy kèm trực tiếp, chứng chỉ thực
  1.4 Mô tả yêu cầu chức năng
      → Người học: quản lý tài khoản, luyện 4 kỹ năng, mock test, xem tiến độ
      → Admin: quản lý nội dung đề thi, người dùng, thống kê
  1.5 Các ràng buộc và quy tắc quản lý
  1.6 Mô tả yêu cầu phi chức năng

CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
  2.1 Ngôn ngữ lập trình
      → TypeScript (lý do: type-safe, scale tốt cho Microservices)
  2.2 Frameworks
      2.2.1 NestJS (Backend)        ← Điểm khác biệt so với mẫu
      2.2.2 Next.js (Web Frontend)
      2.2.3 React Native (Mobile)
  2.3 Công nghệ & thư viện
      2.3.1 Prisma ORM              ← Mới so với mẫu
      2.3.2 Gemini API (AI scoring)
      2.3.3 Google Cloud Speech-to-Text (Speaking)
      2.3.4 WebSocket/Socket.IO (real-time)
      2.3.5 JWT Authentication
      2.3.6 TailwindCSS
  2.4 Cơ sở dữ liệu
      2.4.1 PostgreSQL (via Supabase)
      2.4.2 [Redis nếu có cache] hoặc bỏ qua
  2.5 Kiến trúc phần mềm
      2.5.1 Microservices Architecture ← Đặc thù của dự án này
      2.5.2 RESTful API
      2.5.3 Client-Server
  2.6 Hosting & DevOps
      → Supabase (BaaS), Vercel/DigitalOcean

CHƯƠNG 3: PHÂN TÍCH
  3.1 Quy trình nghiệp vụ
      3.1.1 Nghiệp vụ Người học
            → Quản lý tài khoản & Hồ sơ
            → Kiểm tra đầu vào (Placement Test)
            → Luyện Vocabulary & Grammar (nền tảng)
            → Luyện Listening (Dictation/Fill-in-blank)
            → Luyện Reading (comprehension)
            → Luyện Writing (Task 1 + Task 2, AI scoring)
            → Luyện Speaking (Shadowing/AI conversation)
            → Mock Test (Full IELTS simulation)
            → Theo dõi tiến độ & thống kê
      3.1.2 Nghiệp vụ Người quản lý
            → Quản lý nội dung (đề thi, bài học)
            → Quản lý học viên
            → Thống kê báo cáo

  3.2 Use-case tổng quát (hình sơ đồ)

  3.3 Danh sách tác nhân (Bảng)
      → Người học (Learner)
      → Người quản lý (Admin/Manager)

  3.4 Danh sách tình huống hoạt động chính (Bảng tất cả UC)
      UC01: Đăng ký tài khoản
      UC02: Đăng nhập
      UC03: Làm bài kiểm tra đầu vào
      UC04: Học từ vựng (Vocabulary unit)
      UC05: Ôn từ vựng (Flashcard + Spaced Repetition)
      UC06: Học ngữ pháp (Grammar unit)
      UC07: Luyện phát âm (Pronunciation)
      UC08: Luyện Listening (Dictation)
      UC09: Luyện Reading (Comprehension)
      UC10: Luyện Writing (Task 1 – Graph/Chart)
      UC11: Luyện Writing (Task 2 – Essay)
      UC12: Luyện Speaking (Shadowing)
      UC13: Luyện Speaking (AI Conversation)
      UC14: Thi thử IELTS (Mock Test – Full/Part)
      UC15: Xem kết quả & phân tích lỗi
      UC16: Đặt mục tiêu học tập
      UC17: Xem tiến độ học tập
      UC18: Quản lý nội dung học tập (Admin)
      UC19: Quản lý đề thi (Admin)
      UC20: Quản lý học viên (Admin)
      UC21: Xem thống kê báo cáo (Admin)

  3.5 Đặc tả các yêu cầu chức năng
      → Chọn 6-8 UC quan trọng nhất để đặc tả đầy đủ:
         - UC01 (Đăng ký)
         - UC02 (Đăng nhập + bảo mật brute-force)
         - UC08 (Luyện Listening)
         - UC10 hoặc UC11 (Luyện Writing + AI scoring)
         - UC12 hoặc UC13 (Luyện Speaking)
         - UC14 (Mock Test)
         - UC04/UC05 (Vocabulary + Spaced Repetition)
         - UC18 (Admin – quản lý nội dung)
      → Mỗi UC: Bảng mô tả + Activity diagram + Sequence diagram + Mô tả kỹ thuật

CHƯƠNG 4: THIẾT KẾ VÀ HIỆN THỰC
  4.1 Sơ đồ lớp
      → Phân nhóm: Learning module / User module / Admin module
  4.2 Sơ đồ cơ sở dữ liệu
      4.2.1 Sơ đồ SQL (PostgreSQL/Supabase) – ERD
      4.2.2 [Nếu có NoSQL – có thể bỏ qua nếu toàn SQL]
  4.3 Sơ đồ kiến trúc phần mềm (Microservices)
  4.4 Sơ đồ luồng màn hình
      4.4.1 Website (Next.js)
      4.4.2 Mobile (React Native)
  4.5 Giao diện chương trình
      4.5.1 Trang chủ / Landing page
      4.5.2 Dashboard người học
      4.5.3 Giao diện Listening
      4.5.4 Giao diện Reading
      4.5.5 Giao diện Writing + phản hồi AI
      4.5.6 Giao diện Speaking + AI conversation
      4.5.7 Giao diện Mock Test
      4.5.8 Giao diện kết quả & phân tích
      4.5.9 Giao diện từ vựng / Flashcard
      4.5.10 Giao diện Admin
  4.6 Kiểm thử hệ thống
      4.6.1 Danh sách test case (bảng)
      4.6.2 Bảng báo cáo kết quả kiểm thử (Pass/Fail)

CHƯƠNG 5: KẾT LUẬN
  5.1 Kết quả đạt được
      5.1.1 Về mặt công nghệ và kiến trúc
      5.1.2 Về mặt chức năng nghiệp vụ
  5.2 Hạn chế của đồ án
  5.3 Hướng phát triển

[Tài liệu tham khảo]
[Phụ lục]
  - Kế hoạch thực hiện
  - Nhật ký thực hiện
  - Kế hoạch khởi nghiệp (nếu yêu cầu)
  - Kết quả kiểm tra đạo văn
```

---

## 3. Checklist nội dung từng chương

### Phần mở đầu & bìa

- [ ] **Bìa VN:** Cập nhật tên đề tài tiếng Việt, tên SV, lớp, ngày
- [ ] **Bìa EN:** Tên đề tài tiếng Anh
- [ ] **Abstract:** Viết lại cho hệ thống IELTS (~200-250 từ, EN)
  - Bối cảnh → Vấn đề hiện tại → Giải pháp đề xuất → Tech stack → Kết quả → Keywords
- [ ] **Lời cảm ơn:** Cập nhật tên SV, ngày
- [ ] **Trang nhận xét:** Giữ nguyên template (đã OK trong main.tex)
- [ ] **Từ viết tắt:** Cập nhật danh sách cho dự án IELTS (thêm IELTS, NestJS, ORM, JWT, TTS, STT...)

---

### Lời mở đầu

- [ ] Đoạn 1: Bối cảnh toàn cầu hóa + nhu cầu tiếng Anh/IELTS (dẫn số liệu)
- [ ] Đoạn 2: Hạn chế các nền tảng hiện có
- [ ] Đoạn 3: Tên đề tài in đậm + lý do thực hiện

---

### Chương 1: Giới thiệu

- [ ] **1.1 Tổng quan:** Số liệu thí sinh IELTS toàn cầu + VN; hạn chế nền tảng hiện có
- [ ] **1.2 Mục tiêu:** Gạch đầu dòng 4-6 mục tiêu cụ thể (luyện 4 kỹ năng, AI scoring, multi-platform...)
- [ ] **1.3 Phạm vi:** Đối tượng dùng; phạm vi chức năng (bao gồm/không bao gồm)
- [ ] **1.4 Yêu cầu chức năng:** Phân theo: Người học / Admin
- [ ] **1.5 Ràng buộc:** Platform hỗ trợ (Web + Android/iOS), số user giai đoạn đầu, giới hạn AI API
- [ ] **1.6 Yêu cầu phi chức năng:** Hiệu năng (<3s), Bảo mật (JWT/2FA), Khả năng mở rộng (Microservices), Khả dụng (90%+)

---

### Chương 2: Cơ sở lý thuyết

- [ ] **2.1 TypeScript:** Định nghĩa + lý do chọn cho Microservices
- [ ] **2.2.1 NestJS:** Giới thiệu + kiến trúc module + tại sao chọn NestJS thay vì Express thuần
- [ ] **2.2.2 Next.js:** Giới thiệu + SSR/SSG + SEO lợi ích
- [ ] **2.2.3 React Native:** Giới thiệu + cross-platform + code sharing với React
- [ ] **2.3.1 Prisma ORM:** Giới thiệu + type-safe queries + migration
- [ ] **2.3.2 Gemini API:** Giới thiệu + khả năng multimodal + dùng cho AI scoring
- [ ] **2.3.3 Google Cloud Speech-to-Text:** Giới thiệu + real-time STT + dùng cho Speaking
- [ ] **2.3.4 Socket.IO / WebSocket:** Giới thiệu + real-time communication pattern
- [ ] **2.3.5 TailwindCSS:** Utility-first + tốc độ phát triển
- [ ] **2.4.1 PostgreSQL/Supabase:** RDBMS + BaaS + Auth + Storage
- [ ] **2.5.1 Microservices:** Định nghĩa + ưu điểm + khác gì Client-Server monolithic
- [ ] **2.5.2 RESTful API:** Nguyên tắc REST
- [ ] **2.5.3 Real-time Communication:** WebRTC/WebSocket
- [ ] **2.6 Hosting:** Supabase + Vercel/DigitalOcean
- [ ] **Hình minh họa chương 2:** ≥4 hình (kiến trúc Microservices, Prisma flow, Gemini API flow, Supabase model)

---

### Chương 3: Phân tích

- [ ] **3.1 Quy trình nghiệp vụ** – Mô tả dạng văn xuôi chi tiết (~3-4 trang)
  - [ ] Mục 3.1.1: Nghiệp vụ Người học (đăng ký → kiểm tra đầu vào → học từng kỹ năng → mock test)
  - [ ] Mục 3.1.2: Nghiệp vụ Người quản lý (quản lý nội dung, học viên, thống kê)
- [ ] **3.2 Use-case tổng quát** – 1 hình sơ đồ UC + đoạn mô tả ngắn
- [ ] **3.3 Danh sách tác nhân** – Bảng 2 cột (Tác nhân | Mô tả)
- [ ] **3.4 Danh sách tình huống hoạt động** – Bảng 3 cột (ID | Tên UC | Mô tả ngắn) cho ~20 UC
- [ ] **3.5 Đặc tả UC** – Chọn 6-8 UC, mỗi UC bao gồm:
  - [ ] **UC01 Đăng ký:** Bảng + Activity + Sequence + Kỹ thuật (OTP, Bcrypt, Supabase Auth)
  - [ ] **UC02 Đăng nhập:** Bảng + Activity + Sequence + Kỹ thuật (JWT, brute-force protection)
  - [ ] **UC08 Luyện Listening:** Bảng + Activity + Sequence(s) + Kỹ thuật (audio player, gap-fill, string matching)
  - [ ] **UC10/11 Luyện Writing:** Bảng + Activity + Sequence(s) + Kỹ thuật (Prompt Engineering, Gemini scoring)
  - [ ] **UC12/13 Luyện Speaking:** Bảng + Activity + Sequence(s) + Kỹ thuật (STT, AI feedback)
  - [ ] **UC14 Mock Test:** Bảng + Activity + Sequence + Kỹ thuật (timer, scoring, IELTS band conversion)
  - [ ] **UC04/05 Từ vựng:** Bảng + Activity + Sequence + Kỹ thuật (Spaced Repetition algorithm)
  - [ ] **UC18 Admin – Quản lý nội dung:** Bảng + Activity + Sequence

---

### Chương 4: Thiết kế và hiện thực

- [ ] **4.1 Sơ đồ lớp:** ≥2 hình (User/Auth module + Learning module)
- [ ] **4.2.1 Sơ đồ ERD SQL:** Hình sơ đồ cơ sở dữ liệu quan hệ (PostgreSQL)
- [ ] **4.2.2 Sơ đồ NoSQL** (nếu có Redis/MongoDB): Hình mô tả cấu trúc document
- [ ] **4.3 Sơ đồ kiến trúc:** Hình tổng thể Microservices (NestJS services + Gateway + Supabase + External APIs)
- [ ] **4.4.1 Luồng màn hình Web:** Hình flow diagram
- [ ] **4.4.2 Luồng màn hình Mobile:** Hình flow diagram
- [ ] **4.5 Giao diện chương trình:** ≥10 screenshot với mô tả
  - [ ] 4.5.1 Landing/Trang chủ
  - [ ] 4.5.2 Dashboard người học
  - [ ] 4.5.3 Giao diện Listening
  - [ ] 4.5.4 Giao diện Reading
  - [ ] 4.5.5 Giao diện Writing (đề bài + ô soạn thảo)
  - [ ] 4.5.6 Giao diện phản hồi AI cho Writing
  - [ ] 4.5.7 Giao diện Speaking
  - [ ] 4.5.8 Giao diện Mock Test
  - [ ] 4.5.9 Giao diện kết quả / tiến độ
  - [ ] 4.5.10 Giao diện Admin
- [ ] **4.6.1 Danh sách test case:** Bảng với cột: ID | Chức năng | Mô tả | Tiền điều kiện | Tình huống | Kết quả mong muốn
  - [ ] TC01: Đăng ký (≥5 tình huống)
  - [ ] TC02: Đăng nhập (≥5 tình huống)
  - [ ] TC03: Luyện Listening (≥3 tình huống)
  - [ ] TC04: Luyện Writing + AI scoring (≥2 tình huống)
  - [ ] TC05: Luyện Speaking (≥2 tình huống)
  - [ ] TC06: Mock Test (≥3 tình huống)
  - [ ] TC07: Admin – Tạo nội dung (≥2 tình huống)
- [ ] **4.6.2 Bảng kết quả kiểm thử:** Cột: Type | TC_ID | Dữ liệu vào | Kết quả mong đợi | Pass/Fail | Người thực hiện | Ngày

---

### Chương 5: Kết luận

- [ ] **5.1.1 Về công nghệ & kiến trúc:**
  - Multi-platform (Web + Mobile)
  - Microservices architecture
  - AI integration (Gemini + GCP STT)
  - Real-time với Socket.IO
- [ ] **5.1.2 Về chức năng nghiệp vụ:**
  - 4 kỹ năng IELTS + Mock Test
  - AI scoring cho Writing & Speaking
  - Placement test + adaptive learning
  - Admin dashboard
- [ ] **5.2 Hạn chế:** AI latency, scale testing, thiếu Reading speaking band prediction, chưa có collaborative features
- [ ] **5.3 Hướng phát triển:** Fine-tune AI model, mobile offline mode, IELTS community features, payment integration

---

### Tài liệu tham khảo

- [ ] ≥5 tài liệu học thuật về IELTS / language assessment / e-learning
- [ ] ≥5 tài liệu kỹ thuật (NestJS, Next.js, React Native, Prisma, Supabase)
- [ ] ≥5 tài liệu về AI/ML trong giáo dục (Gemini API, Speech-to-Text)
- [ ] ≥3 tài liệu thống kê số liệu thị trường IELTS
- [ ] Phân loại rõ: Tiếng Việt / Tiếng Anh / Internet
- [ ] File `references.bib` với đầy đủ entries và keyword (viet/english/internet)

---

### Phụ lục

- [ ] **Phụ lục 1:** Bảng kế hoạch thực hiện (bảng tuần × công việc × giai đoạn)
- [ ] **Phụ lục 2:** Nhật ký thực hiện (bảng tuần × từ ngày × đến ngày × tóm tắt × nhận xét GVHD)
- [ ] **Phụ lục 3:** Kế hoạch khởi nghiệp (nếu nhà trường yêu cầu)
- [ ] **Phụ lục 4:** Kết quả kiểm tra đạo văn (screenshot từ tool như Turnitin/iThenticate)

---

## 4. Thứ tự ưu tiên viết

Dựa trên trạng thái hiện tại của `main.tex`:

### Ưu tiên 1 — Nền tảng đã có, cần hoàn thiện
> *Phần này đã có skeleton/cấu trúc trong main.tex, chỉ cần điền nội dung*

1. **Chương 3, mục 3.1 (Quy trình nghiệp vụ)** — Đã có nội dung tốt trong main.tex (TOEIC system), cần **viết lại cho IELTS** theo cùng cấu trúc
2. **Header/Footer** — Đã setup nhưng đang để tên cũ "Hệ thống luyện thi TOEIC" và "Lai Thanh Sĩ / Phạm Đức Tài" → **Cập nhật ngay** tên mới
3. **Từ viết tắt** — Đã có bảng cơ bản, cần bổ sung các từ mới (NestJS, ORM, STT, TTS...)

### Ưu tiên 2 — Viết mới nhưng logic rõ ràng
> *Nội dung có thể viết ngay khi biết rõ hệ thống*

4. **Chương 1** — 6 sections ngắn, nên viết sớm vì định hướng toàn bài
5. **Chương 2** — Lý thuyết cơ sở, viết 1 lần, ít sửa
6. **Lời mở đầu** — Ngắn (~1 trang), viết sau khi xong chương 1
7. **Abstract** — Viết sau khi có nội dung chương 1 + 5

### Ưu tiên 3 — Cần có hình ảnh/sơ đồ trước
> *Phụ thuộc vào việc vẽ sơ đồ xong*

8. **Chương 3, mục 3.2-3.4** — Cần sơ đồ Use-case
9. **Chương 3, mục 3.5** — Cần Activity + Sequence diagrams cho từng UC
10. **Chương 4, mục 4.1-4.4** — Cần sơ đồ lớp, ERD, kiến trúc, luồng màn hình

### Ưu tiên 4 — Cần hệ thống chạy được
> *Phụ thuộc vào việc hệ thống đã deploy/có screenshot*

11. **Chương 4, mục 4.5** — Cần screenshot giao diện thực tế
12. **Chương 4, mục 4.6** — Cần thực hiện kiểm thử và ghi kết quả
13. **Chương 5** — Viết sau cùng, sau khi có đầy đủ kết quả

### Ưu tiên 5 — Cuối cùng
14. **Tài liệu tham khảo** (`references.bib`) — Bổ sung dần trong quá trình viết
15. **Phụ lục** — Sau khi hoàn thiện tất cả

---

## 5. Ước tính khối lượng

| Phần | Ước tính trang | Ước tính số hình | Ước tính số bảng | Ghi chú |
|------|---------------|-----------------|-----------------|---------|
| Lời mở đầu | 1 | 0 | 0 | |
| Chương 1 | 5-6 | 0 | 0 | Gạch đầu dòng là chủ yếu |
| Chương 2 | 14-18 | 4-6 | 0-2 | 1 hình/công nghệ chính |
| Chương 3 | 60-75 | 20-30 | 10-15 | Phần dài nhất; mỗi UC có ~3-4 hình |
| Chương 4 | 35-45 | 15-20 | 2-4 | Nhiều screenshot |
| Chương 5 | 6-8 | 0 | 0 | |
| Tài liệu TK | 3-4 | 0 | 0 | ~25 tài liệu |
| Phụ lục | 8-12 | 1-2 | 4-6 | Bảng kế hoạch + nhật ký |
| **Tổng** | **~130-160 trang** | **~40-60 hình** | **~18-27 bảng** | |

**Mục tiêu phấn đấu:** 120-150 trang (phù hợp tiêu chuẩn khoá luận tốt nghiệp ĐH)

---

## 6. Lưu ý LaTeX đặc thù

### Cấu trúc file đã có (cần giữ nguyên)
```latex
% Header styles đã OK:
\fancypagestyle{frontmatter}{...}  % Roman numeral pages
\fancypagestyle{mainstyle}{...}    % Arabic pages

% Biblatex đã cấu hình:
\usepackage[backend=biber, style=ieee, ...]{biblatex}
\addbibresource{references.bib}   % ← Cần tạo file này!
```

### Các chỉnh sửa cần làm ngay trong main.tex

1. **Cập nhật header/footer** — Sửa tên đề tài và tên sinh viên:
   ```latex
   % Tìm và sửa:
   \fancyhead[R]{\small \textit{Hệ thống luyện thi TOEIC}}  →  tên mới
   \fancyhead[R]{\small \textit{Hệ thống luyện thi TOEIC...}}  →  tên mới
   % Tên sinh viên trong footer: Lai Thanh Sĩ / Phạm Đức Tài  →  tên của bạn
   ```

2. **Tạo file `references.bib`** — Đặt cùng thư mục với main.tex
   ```bibtex
   @misc{ielts-stats,
     title = {IELTS Test Statistics},
     author = {{British Council}},
     year = {2024},
     url = {https://www.ielts.org/...},
     keywords = {internet}
   }
   ```

3. **Cấu trúc đặc tả UC** — Dùng pattern đã có trong main.tex:
   ```latex
   \subsection{Tên use case}
   \subsubsection{Mô tả use case}
   \begin{table}[!ht]
     \centering
     \renewcommand{\arraystretch}{1.1}
     \begin{tabularx}{\linewidth}{|X|X|}
       ...
     \end{tabularx}
     \caption{Đặc tả Use-case Tên UC}
     \label{tab:ucXX_spec}
   \end{table}
   
   \subsubsection{Sơ đồ activity}
   \begin{figure}[H]
     \centering
     \includegraphics[width=0.8\linewidth]{ten-file.png}
     \caption{Đặc tả activity Tên UC}
     \label{fig:activity-XX}
   \end{figure}
   ```

4. **Thứ tự biên dịch** — Dùng XeLaTeX + Biber:
   ```
   xelatex main.tex
   biber main
   xelatex main.tex
   xelatex main.tex
   ```

5. **Hình ảnh** — Đặt tất cả trong thư mục gốc cùng với main.tex (hoặc tạo subfolder `images/` và dùng `\graphicspath{{images/}}`)

6. **Bảng dài** — Nếu bảng UC quá dài (>1 trang), dùng `longtable` thay vì `tabularx`:
   ```latex
   \usepackage{longtable}
   ```

7. **Tránh warning "Overfull hbox"** — Đã có `\begin{sloppypar}` trong abstract; dùng `\begin{sloppypar}` cho các đoạn văn dài nếu cần

8. **Caption styling** — Kiểm tra caption của hình và bảng phải nhất quán; nếu muốn canh giữa caption:
   ```latex
   \usepackage[justification=centering]{caption}
   ```

9. **Khoảng cách dòng** — Đã có `\onehalfspacing`; không thay đổi

10. **Vietnamese font** — `Times New Roman` đã được set; đảm bảo font cài đặt trên máy

---

## 7. Trạng thái tổng quan từng phần

| Phần | Trạng thái | Ghi chú |
|------|-----------|---------|
| Bìa VN | Chưa bắt đầu | Template có, cần điền tên đề tài + SV |
| Bìa EN | Chưa bắt đầu | Template có |
| Abstract | Chưa bắt đầu | Abstract TOEIC đã có – cần viết lại cho IELTS |
| Lời cảm ơn | Chưa bắt đầu | Template có, cần điền tên + ngày |
| Nhận xét GVHD/PB | Đang làm | Template đã đúng, chờ ký |
| Mục lục tự động | Đang làm | Cần compile để generate |
| Danh mục hình | Đang làm | Cần compile để generate |
| Danh mục bảng | Đang làm | Cần compile để generate |
| Từ viết tắt | Đang làm | Có cơ bản, cần bổ sung |
| Lời mở đầu | Chưa bắt đầu | Chỉ có placeholder "Nội dung lời mở đầu..." |
| **Chương 1** | **Chưa bắt đầu** | Skeleton có, chưa có nội dung |
| **Chương 2** | **Chưa bắt đầu** | Skeleton có, chưa có nội dung |
| Ch3 – 3.1 Nghiệp vụ | Đang làm | Nội dung TOEIC chi tiết → cần viết lại IELTS |
| Ch3 – 3.2 Use-case | Đang làm | Có cấu trúc + 1 hình placeholder |
| Ch3 – 3.3 Tác nhân | Chưa bắt đầu | Chỉ có section heading |
| Ch3 – 3.4 Tình huống | Chưa bắt đầu | |
| Ch3 – 3.5 Đặc tả UC | Đang làm | UC01 (Học từ vựng) và UC02 (Ôn từ vựng) đã có đặc tả tốt → cần bổ sung UC còn lại |
| **Chương 4** | **Chưa bắt đầu** | Skeleton có |
| **Chương 5** | **Chưa bắt đầu** | Skeleton có |
| Tài liệu tham khảo | Chưa bắt đầu | Setup biblatex OK nhưng **`references.bib` chưa tồn tại** |
| Phụ lục | Chưa bắt đầu | |

---

> **Ghi chú quan trọng:** File `references.bib` chưa được tạo → khi compile sẽ có lỗi. Cần tạo file này trước khi compile lần đầu.
