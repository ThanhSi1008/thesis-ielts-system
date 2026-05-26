# Admin Exam Builder — Kế hoạch tính năng "Tạo đề thi tự động"

> Bộ tài liệu thiết kế & kế hoạch hiện thực cho tính năng **Admin Dashboard tạo đề thi IELTS mới**
> theo mô hình **Hybrid tối giản: Raw Scraper → Gemini cấu trúc hoá → Admin duyệt → Lưu DB**.
>
> Phạm vi: cả **4 kỹ năng** (Listening / Reading / Writing / Speaking) cho **IELTS Intensive** (đề thi trọn vẹn)
> và **IELTS Advanced** (ngân hàng luyện tập theo kỹ năng).

---

## 1. Mục tiêu

Hiện tại, đề thi được nạp vào hệ thống **hoàn toàn thủ công qua seed script** (`prisma/seed.ts`,
`mock-tests.ts` dài 6.758 dòng viết tay, các file JSON biên dịch sẵn). Mỗi đề mới = lập trình viên ngồi gõ
JSON tay rồi chạy seed. Không có cách nào để người quản trị (không phải dev) thêm đề.

Tính năng này biến quy trình đó thành: **Admin dán link / upload PDF → hệ thống tự cào + bóc tách bằng AI →
Admin chỉ việc kiểm duyệt và bấm Lưu.** Mục tiêu xuyên suốt là **tối giản thao tác tay**, đồng thời **không
được làm hỏng cơ chế chấm điểm** đang chạy.

---

## 2. Bốn quyết định đã chốt (nền tảng của toàn bộ kế hoạch)

| # | Quyết định | Phương án đã chốt | Hệ quả thiết kế |
|---|-----------|-------------------|-----------------|
| **D1** | Công cụ cào/trích xuất | **Hybrid tối giản**: Scraper thô (Playwright/BeautifulSoup + PyMuPDF) chỉ làm việc *vật lý* (tải audio/ảnh + lấy `innerText`/text PDF thô) → **Gemini Structured Outputs** cấu trúc hoá → Admin duyệt | Tách bạch 3 giai đoạn; tái dùng Gemini & RabbitMQ sẵn có ở `backend-ai` |
| **D2** | Xử lý media | **Tải về & up lên Cloudinary/GCS**, ghi lại URL mới | Cần bước "media pipeline" trong giai đoạn scrape; tự sở hữu asset, không hotlink |
| **D3** | Kiến trúc API | **Controller admin mới** `/admin/ielts/*` + `RolesGuard`; **khoá CRUD `/exams` cũ** (đang hở quyền) | Vá lỗ hổng bảo mật + khớp pattern `dictation`/`shadowing` |
| **D4** | Mô hình Advanced | **Giữ ngân hàng theo kỹ năng** (Part/Prompt độc lập) | Không đổi cấu trúc bảng live; chỉ thêm bảng staging + cột provenance |

> Các quyết định còn **mở** (chưa chốt) được liệt kê trong [`04-implementation-phases.md`](./04-implementation-phases.md)
> dưới dạng **Approval Gate** ở từng phase — sẽ hỏi ý kiến trước khi code.

---

## 3. Bản đồ tài liệu

| File | Nội dung | Dành cho |
|------|----------|----------|
| [`01-system-analysis.md`](./01-system-analysis.md) | **Phân tích hệ thống hiện tại** — seed nạp dữ liệu 4 kỹ năng thế nào (Intensive & Advanced), mô hình dữ liệu, cơ chế chấm điểm, hạ tầng admin sẵn có, các lỗ hổng/rủi ro | Hiểu "đang có gì" trước khi xây |
| [`02-data-model-and-schema.md`](./02-data-model-and-schema.md) | **Thiết kế Database Schema** — bảng staging `ContentImportJob`, cột provenance bổ sung, và **JSON Contract** (schema Gemini xuất ra = input importer) cho từng kỹ năng, ánh xạ chính xác với grader | Backend / DB |
| [`03-data-flow-and-pipeline.md`](./03-data-flow-and-pipeline.md) | **Luồng dữ liệu end-to-end** — từ lúc dán link/upload PDF → scraper → Gemini → form duyệt → commit vào DB; thiết kế công cụ scrape & pipeline async | Kiến trúc hệ thống |
| [`04-implementation-phases.md`](./04-implementation-phases.md) | **Kế hoạch hiện thực theo phase** — mỗi phase có mục tiêu, task cụ thể, deliverable, và **Approval Gate** (quyết định cần duyệt) | Quản lý tiến độ |

Đọc theo thứ tự `01 → 02 → 03 → 04`.

---

## 4. Thuật ngữ (Glossary)

| Thuật ngữ | Ý nghĩa trong dự án này |
|-----------|--------------------------|
| **IELTS Intensive** | Đề thi **trọn vẹn** (mock test). 1 đề = 1 dòng `IeltsIntensiveExam`, toàn bộ nội dung nằm trong 1 cột `questions` (Json). Map tới bảng SQL `exams`. |
| **IELTS Advanced** | **Ngân hàng luyện tập** chia theo kỹ năng. Mỗi đơn vị là một *Part* (Listening/Reading) hoặc *Prompt* (Writing) hoặc *Part* (Speaking) **độc lập**, không gom thành "đề". |
| **Part** | Một phần luyện tập Advanced (vd Listening Part 1–4, Reading Part 1–3, Speaking Part 1–3). |
| **Prompt** | Một đề bài Writing Advanced (Task 1 hoặc Task 2). |
| **Raw Scraper** | Giai đoạn 1: chỉ làm việc vật lý — tải media + lấy text thô (`innerText` / text PDF). KHÔNG hiểu ngữ nghĩa. |
| **Gemini Structuring** | Giai đoạn 2: Gemini biến text thô → JSON có cấu trúc chặt (Structured Output / `responseSchema`). |
| **ContentImportJob** | Bảng *staging* mới, lưu trạng thái 1 lượt import: text thô, JSON nháp do Gemini sinh, media đã tải, để Admin duyệt trước khi commit. |
| **Answer Key** | Đáp án đúng, **nhúng trực tiếp** (inline) trong JSON theo `question_number`. Grader đọc trực tiếp các trường này — đây là điểm dễ vỡ nhất, xem §1.6 và §2.5. |
| **Provenance** | Thông tin nguồn gốc đề (`source`, `bookNumber`, `testNumber`) để truy vết & chống import trùng. |

---

## 5. Nguồn đề mục tiêu (theo yêu cầu)

- **Cambridge IELTS** (bộ sách, PDF) — copyrighted, dạng in.
- **IELTS Recent Actual Tests** (PDF/web).
- **Forecast Speaking & Writing theo Quý** (web/PDF, có yếu tố thời gian → cần `quarter`/`year`).
- **The Official Cambridge Guide to IELTS** & **IELTS Trainer** (sách, PDF).

> Mỗi kỹ năng lưu thành **file JSON riêng** (theo yêu cầu) — khớp với cách `ielts-advanced-compiled/` đang
> tổ chức (`listening_*.json`, `reading_*.json`, `writing-prompts.json`, `speaking-parts.json`).

---

## 6. Tóm tắt kiến trúc (1 đoạn)

`backend-ai` (Python/FastAPI) **đã có sẵn Gemini** (writing/speaking grader) và **đã tiêu thụ RabbitMQ + HTTP
callback** (luồng chấm điểm). Vì vậy pipeline scrape+Gemini sẽ **tái dùng đúng pattern đó**: thêm queue
`content-extraction-queue` + consumer mới ở `backend-ai` (scrape Python là "sân nhà"), `backend-core` thêm module
`/admin/ielts/import` để tạo job, nhận callback, và commit vào bảng live. `frontend-web` kích hoạt 3 mục sidebar
admin đang để **"Soon"** (`/admin/ielts-basic|advanced|intensive`). Không phát sinh hạ tầng mới — chỉ mở rộng cái đang chạy.
