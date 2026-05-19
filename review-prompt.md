# Bộ Prompt Review Báo Cáo Khóa Luận

Dưới đây là các câu prompt mẫu được thiết kế chuẩn nhất. Bạn có thể sử dụng để nhờ AI rà soát báo cáo khóa luận một cách sắc bén, sâu sát và không bỏ sót lỗi.

## 🌟 1. Siêu Prompt Tổng Hợp (Technical Audit + Academic Review)

_Đây là câu prompt mạnh nhất, giúp AI đối chiếu độ khớp giữa chữ viết trong báo cáo và code thực tế, đồng thời bắt lỗi văn phong._

**Prompt:**

> Hãy đóng vai là một Giảng viên phản biện (Reviewer) khó tính và một Kỹ sư phần mềm cấp cao (Senior Engineer). Nhiệm vụ của bạn là đọc kỹ chương báo cáo khóa luận (LaTeX) dưới đây và rà soát nó dựa trên các tiêu chí cực kỳ khắt khe sau:
>
> **1. Tính nhất quán kỹ thuật (Technical Integrity):**
>
> - Đối chiếu mọi 'claim' (tuyên bố) về tính năng, thuật toán, công nghệ, thông số hiệu năng với mã nguồn thực tế của dự án.
> - Phát hiện ngay lập tức các tính năng 'ảo' (chưa được code nhưng được viết trong báo cáo) hoặc sự sai lệch về phiên bản (ví dụ: mô tả dùng dịch vụ Cloud nhưng thực tế đang chạy Local).
>
> **2. Tính logic và xuyên suốt (Logical Flow):**
>
> - Kiểm tra xem nội dung của chương này có mâu thuẫn với các chương trước không (ví dụ: Chương 1 nói dùng thuật toán A, nhưng Chương 3 lại mô tả luồng của thuật toán B).
>
> **3. Văn phong học thuật (Academic Tone):**
>
> - Bắt lỗi chính tả, dấu câu, lỗi diễn đạt lủng củng hoặc sử dụng từ ngữ quá 'bình dân' (informal).
> - Đảm bảo cách xưng hô và trình bày chuẩn kỹ thuật (đúng cú pháp thuật ngữ IT, hoa/thường chuẩn xác).
>
> **YÊU CẦU ĐẦU RA:**
>
> - Chỉ review, tuyệt đối không tự ý sửa đổi file.
> - Báo cáo dưới dạng danh sách (Bullet points), chia làm 2 phần: [Lỗi sai lệch kỹ thuật nghiêm trọng] và [Lỗi văn phong/trình bày]. Kèm theo trích dẫn dòng/câu bị lỗi để tôi tự kiểm chứng.

---

## 🔍 2. Prompt Chuyên Biệt (Chỉ dùng để đối chiếu Use-case và Sơ đồ)

_Rất hữu ích khi cần kiểm tra các Chương Phân tích & Thiết kế hệ thống (thường là Chương 3, 4)._

**Prompt:**

> Tôi đang viết Chương Phân tích & Thiết kế hệ thống cho báo cáo khóa luận. Dưới đây là nội dung mô tả các Use-case và sơ đồ kiến trúc (định dạng text/LaTeX). Hãy đọc và đối chiếu với mã nguồn/logic hiện tại của dự án. Trả lời cho tôi 3 câu hỏi sau:
>
> 1. Có Use-case nào đang mô tả những luồng xử lý không hề tồn tại trong API/Backend hiện tại không?
> 2. Các con số giới hạn (quota limits, rate limits, timeouts) được viết trong text có khớp chính xác 100% với file cấu hình hằng số (constants/envs) trong code không?
> 3. Các thực thể (Entities) nhắc đến trong báo cáo có khớp với sơ đồ ERD (Prisma schema) hiện tại không? Có trường dữ liệu nào bịa thêm không?

---

## 📝 3. Prompt Chuyên Biệt (Rà soát Lỗi định dạng và LaTeX)

_Dành riêng cho giai đoạn cuối cùng trước khi in ấn để đảm bảo đúng chuẩn form._

**Prompt:**

> Hãy đóng vai là Biên tập viên (Editor) rà soát định dạng LaTeX chuẩn IEEE. Dựa vào nội dung mã LaTeX dưới đây, hãy kiểm tra và chỉ ra các lỗi sau:
>
> 1. Lỗi trích dẫn: Đã dùng đúng lệnh `\cite{}` chưa? Dấu chấm câu đặt trước hay sau `\cite{}` có nhất quán không?
> 2. Lỗi bảng biểu và hình ảnh: Bảng đã dùng đúng `longtable` chưa? Kích thước `\linewidth` có bị tràn lề không? Các bảng/hình có thiếu caption hoặc label không?
> 3. Từ viết tắt: Các từ khóa công nghệ (API, RESTful, AI, JWT, PostgreSQL) đã được viết hoa chuẩn chỉnh chưa? Có từ nào bị viết sai chính tả chuyên ngành không?
>
> Chỉ liệt kê danh sách lỗi (chỉ rõ dòng nào) và đề xuất mã LaTeX thay thế.

---

💡 **Mẹo sử dụng:** Khi dùng các prompt này với AI (đặc biệt là các Agent có khả năng đọc codebase), hãy luôn đính kèm câu lệnh: _"Hãy tự động dùng tool tìm kiếm trong thư mục `backend-core` và `backend-ai` để xác thực lại thông tin trước khi trả lời"_. Điều này sẽ ép AI phải "đào" mã nguồn thay vì chỉ đoán mò dựa trên văn bản!

# Tìm thêm trích dẫn

Dùng lit-review mode.

Dựa trên các claim kỹ thuật chưa có trích dẫn trong báo cáo,
tìm tài liệu phù hợp theo 3 nhóm sau.
Ưu tiên bài báo khoa học, sau đó mới đến official documentation.
Ưu tiên tài liệu từ 2020 đến nay.

Nhóm 1 — Công nghệ nền tảng:

- NestJS architecture / Node.js backend framework
- Prisma ORM / Database abstraction layer
- React Native mobile development
- PostgreSQL / Supabase

Nhóm 2 — Tính năng AI:

- AI-based writing assessment (IELTS writing scoring)
- Speech-to-Text / Text-to-Speech trong language learning
- Large Language Model ứng dụng trong giáo dục
- Gemini API / LLM API integration

Nhóm 3 — Domain IELTS:

- IELTS test format và scoring criteria
- E-learning / mobile learning effectiveness
- Adaptive learning systems

Với mỗi tài liệu tìm được, cung cấp:

1. Citation đầy đủ theo APA 7.0
2. Tóm tắt 2-3 câu nội dung phù hợp với báo cáo
3. Gợi ý nên đặt ở chương/mục nào
4. Đánh dấu [VERIFIED] nếu đã xác minh qua Semantic Scholar hoặc DOI

Không bịa tài liệu. Nếu không tìm được thì ghi rõ "Không tìm thấy nguồn phù hợp".
