@testing-sample.md @thesis-report/docs/writing-rules.md @04-chuong-3-phan-tich.md

# Phase 1 — Báo cáo vs Code

@writing-rules.md
Trong chapter 4 @thesis-report/chapters/04-design.tex báo cáo có mô tả chức năng/kỹ thuật, hãy:

1. Trích xuất các CLAIM kỹ thuật

2. Đối chiếu từng claim với code thực tế và phân loại:
   - MATCH : code implement đúng như mô tả
   - MISMATCH : code khác với mô tả (ghi rõ khác ở điểm nào)
   - MISSING_IN_CODE : báo cáo mô tả nhưng code chưa có
   - MISSING_IN_REPORT : code đã làm nhưng báo cáo không đề cập

3. Output dạng bảng:
   | Claim | Vị trí trong báo cáo | File code | Trạng thái | Ghi chú |

Báo cáo: [attach file]
Schema Prisma: [paste nội dung schema.prisma]
Controllers: [paste hoặc @src/]
Test cases: [paste testing-sample.md]

# Phase 2 — Đồng bộ giữa các Chapter

Dùng review mode.

Kiểm tra 4 loại mâu thuẫn nội bộ sau trong báo cáo:

A. Số liệu/con số không nhất quán

- Số lượng chức năng được đề cập ở chương này vs chương khác
- Số lượng bảng DB, API endpoint, màn hình UI

B. Tên gọi không thống nhất

- Cùng một khái niệm nhưng gọi khác tên ở các chương
- Ví dụ: "người dùng" vs "user" vs "học viên"

C. Mô tả logic mâu thuẫn

- Luồng xử lý mô tả ở chương 2 khác với chương 4
- Diagram/hình vẽ không khớp với mô tả text

D. Tổng kết/kết luận không phản ánh đúng nội dung các chương

Output: liệt kê từng mâu thuẫn với vị trí cụ thể
Format: "Chương X (trang Y) ↔ Chương A (trang B): [mô tả mâu thuẫn]"

Báo cáo kết quả xong, dừng lại và hỏi tôi trước khi sang Phase 3.

# Phase 3 — Gợi ý sửa

Dựa trên kết quả Phase 1 và Phase 2, với mỗi vấn đề phát hiện hãy đề xuất:

- Sửa báo cáo (nếu code đúng) → gợi ý đoạn văn thay thế
- Sửa code (nếu báo cáo đúng) → gợi ý cách implement
- Sửa cả hai → giải thích lý do

Phân loại mức độ ưu tiên:
[CRITICAL] Ảnh hưởng đến tính đúng đắn của khoá luận
[MAJOR] Người đọc sẽ nhận ra sự không nhất quán
[MINOR] Nhỏ, có thể sửa sau

Sắp xếp danh sách theo thứ tự: CRITICAL trước, MINOR sau.

Báo cáo kết quả xong, dừng lại và hỏi tôi trước khi sang Phase 4.

# Phase 4 — Kiểm tra trích dẫn hiện có

Dùng citation-check mode.

Với mỗi trích dẫn trong báo cáo, kiểm tra:

A. Định dạng

- Có đúng chuẩn APA 7.0 không
- Trích dẫn trong text [Tên, Năm] có khớp với danh mục References không
- Có trích dẫn trong text nhưng không có trong References không (và ngược lại)

B. Tính xác thực

- Tên tác giả, năm, tên công trình có hợp lý không
- Claim được trích dẫn có phù hợp với nội dung nguồn không
- Đánh dấu [CẦN XÁC MINH] với những trích dẫn không thể verify qua web

C. Output dạng bảng:
| STT | Trích dẫn gốc | Vấn đề | Mức độ | Gợi ý sửa |

Không bịa nguồn. Nếu không verify được thì ghi rõ [KHÔNG THỂ XÁC MINH].

Báo cáo kết quả xong, dừng lại và hỏi tôi trước khi sang Phase 5.

# Phase 5 — Tìm thêm trích dẫn

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
