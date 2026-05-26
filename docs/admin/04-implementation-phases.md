# 04 — Kế hoạch hiện thực theo Phase

> Mỗi phase gồm: **Mục tiêu · Task cụ thể · Deliverable · Approval Gate** (quyết định cần bạn duyệt trước khi code).
> Quy ước: 🔵 backend-core (NestJS) · 🟢 backend-ai (Python) · 🟣 frontend-web (Next.js) · 🗄️ Prisma/DB.

---

## Lộ trình & phụ thuộc

```
Phase 0 (chuẩn bị)
   └─> Phase 1 (DB schema)
          └─> Phase 2 (Admin API + khoá CRUD cũ)
                 └─> Phase 7 (golden tests — xác nhận commit path đúng) ← CHUYỂN LÊN ĐÂY
                        ├─> Phase 6 (UI duyệt)
                        └─> Phase 3 (Raw extractor) ─> Phase 4 (Gemini) ─> Phase 5 (async wiring)
                                                                               └─> Phase 8 (hardening)
```

### 🎯 Lát cắt MVP đề xuất (giảm rủi ro cho luận văn)
> **Lát cắt MVP đề xuất:** **Phase 1 → 2 → 7 → 6(lite: dán JSON tay)**. Phase 7 (golden tests) phải làm
> ngay sau Phase 2 — đây là *acceptance criteria* của commit path, không phải afterthought. Khi đường
> "JSON → validate → commit → chấm đúng" đã chắc và có test bảo chứng, mới làm UI (Phase 6) rồi tự động
> hoá (Phase 3→4→5). Phase 7 sau Phase 6 = rủi ro refactor khi đã build xong UI.

---

## Phase 0 — Chuẩn bị & khoá nền tảng

**Mục tiêu:** chốt phạm vi kỹ thuật, xác minh giả định trước khi đụng code.

**Task**
- [ ] 0.1 Rà soát ai đang gọi `POST/PATCH/DELETE /exams` (web/mobile/seed) để biết tác động khi khoá (R1/D3).
- [ ] 0.2 Xác nhận quyền truy cập GCS/Cloudinary từ `backend-ai` (đã có `storage_service.py` — kiểm tra scope ghi).
- [ ] 0.3 Xác nhận Playwright chạy được trong container `backend-ai` (cap 10GB RAM/3CPU) — cần cài Chromium.
- [ ] 0.4 Thu thập 1–2 nguồn mẫu cho mỗi loại (1 URL web + 1 PDF) để test xuyên suốt.

**Deliverable:** ghi chú khả thi + danh sách nguồn mẫu.

> **🚦 Approval Gate 0:**
> - (a) Có còn client nào **ngoài admin** cần tạo/sửa đề qua `/exams` không? Nếu không → khoá hẳn; nếu có → giữ + bọc guard.
> - (b) Chấp nhận thêm Chromium (~300MB) vào image `backend-ai` không, hay scraper tách thành **service/worker riêng**?

---

## Phase 1 — DB Schema & Migration

**Mục tiêu:** thêm bảng staging + provenance, **không phá vỡ** dữ liệu/đọc hiện tại.

**Task**
- [ ] 1.1 🗄️ Thêm `ContentImportJob` + 4 enum (02 §2.3); thêm quan hệ `importJobs` vào `User`.
- [ ] 1.2 🗄️ Thêm cột provenance additive (02 §2.4): `IeltsIntensiveExam` (+source/book/test/quarter/year/importJobId),
      `IeltsAdvancedListeningPart` & `ReadingPart` (+source/book/test/isPublished/importJobId), `importJobId` cho W/S.
- [ ] 1.3 🗄️ `prisma migrate dev` + `prisma generate`; **giữ mọi `@@map`**.
- [ ] 1.4 🗄️ Script backfill provenance cho dữ liệu seed cũ (suy từ `title` "Cambridge IELTS 17 - Reading Test 1").
- [ ] 1.5 🔵 Cập nhật CLAUDE.md (đếm model: 62 → +1) nếu cần.

**Deliverable:** migration chạy được trên DB hiện tại; client TS có type mới.

> **🚦 Approval Gate 1:**
> - (a) Có đặt `@@unique` **cứng** cho L/R theo `(source,bookNumber,testNumber,partNumber)` không (rủi ro nếu dữ liệu cũ trùng/null), hay chỉ check trùng ở tầng service?
> - (b) Cần `quarter`/`year` cho nguồn **Forecast** — đặt trên `IeltsIntensiveExam` & W/S Advanced ổn chứ?
> - (c) **FULL_TEST = 4 job/group (hybrid Discard + Abandon)?** Kế hoạch: 4 job riêng cùng `groupId`; commit group
>   khi **mọi job `COMMITTED` hoặc `DISCARDED`**; `discard-skill` bỏ 1 kỹ năng, `abandon` bỏ cả group; nếu chỉ còn
>   2–3 skill `COMMITTED` → tạo **nhiều đề single-skill riêng lẻ** (không phải 1 đề tổng hợp). Xác nhận hướng này +
>   **Group TTL 7 ngày** trước khi tạo schema/UI (chi tiết 02 §2.3, 03 §3.6).

---

## Phase 2 — Admin API (backend-core) + khoá CRUD cũ

**Mục tiêu:** dựng khung API admin theo **D3**, vá lỗ hổng R1, mở CRUD/list thủ công cho cả Intensive & Advanced.

**Task**
- [ ] 2.1 🔵 Tạo module `admin-ielts/` với 2 controller:
      `@Controller("admin/ielts/intensive")` và `@Controller("admin/ielts/advanced")`,
      `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles("ADMIN")` (mẫu `admin-dictation.controller.ts`).
- [ ] 2.2 🔵 Endpoint quản trị cơ bản (chưa cần AI): `GET /` (list + filter), `GET /:id`, `POST /` (tạo từ JSON),
      `PATCH /:id`, `DELETE /:id`, `PATCH /:id/publish`.
- [ ] 2.3 🔵 Endpoint import: `POST /admin/ielts/import` (tạo job), `GET /admin/ielts/import/:id`,
      `GET /admin/ielts/import` (hàng đợi), `POST /admin/ielts/import/:id/extracted` (callback AI),
      `POST /admin/ielts/import/:id/commit`, `DELETE /admin/ielts/import/:id` (discard),
      `POST /admin/ielts/import/:id/retry` — re-queue job `FAILED`: nếu `rawText` đã có → bỏ qua Stage 1,
      chỉ re-run Gemini (tiết kiệm scrape); nếu `rawText` chưa có → re-run từ đầu. Reset status về `PENDING`.
      `POST /admin/ielts/import/:jobId/discard-skill` — DISCARD 1 job trong group (admin chủ động bỏ kỹ năng đó);
      nếu các job còn lại đều `COMMITTED` → group tự unlock để commit. (Biến thể group-aware của `DELETE :id`.)
      `POST /admin/ielts/import/group/:groupId/abandon` — DISCARD **toàn bộ** job trong group (bỏ cả FULL_TEST).
      `POST /admin/ielts/import/group/:groupId/commit` — commit group khi mọi job đã `COMMITTED`/`DISCARDED` (03 §3.6).
- [ ] 2.4 🔵 `ContentImportService` + `IeltsContentCommitService` (logic commit 2 nhánh — 03 §3.6) + DTO
      class-validator. **`CommitService` bắt buộc gọi `assertGraderCompatible(structuredJson, skill)` trước
      khi ghi bảng live — trả HTTP 422 nếu JSON không đạt; không để lọt JSON hỏng vào DB dù admin đã
      sửa tay ở editor.** (Xem Phase 7.1 cho spec đầy đủ của hàm này.)
- [ ] 2.5 🔵 **Khoá CRUD cũ:** gỡ/bọc `@Post()/@Patch(:id)/@Delete(:id)` trong `exams.controller.ts`
      (thêm `RolesGuard` hoặc chuyển hẳn sang module admin). Giữ các route đọc user-facing.
- [ ] 2.6 🟣 `admin.api.ts`: thêm `adminIeltsIntensiveApi`, `adminIeltsAdvancedApi`, `ieltsImportApi`.

**Deliverable:** Admin có thể **dán JSON tay → commit → đề xuất hiện** (chưa cần scraper). Đây là xương sống MVP.

> **🚦 Approval Gate 2:**
> - (a) Khoá CRUD `/exams` = **xoá route** hay **giữ + thêm `@Roles("ADMIN")`**? (phụ thuộc Gate 0a)
> - (b) Chỉ `ADMIN` được tạo đề, hay cho cả `INSTRUCTOR`? (RolesGuard hỗ trợ nhiều role)

---

## Phase 3 — Raw Extractor (backend-ai)

**Mục tiêu:** Stage 1 — chỉ việc vật lý: text thô + media về kho ta (D1, D2).

**Task**
- [ ] 3.1 🟢 `services/scrape_service.py`: `WEB_URL` → Playwright `inner_text` + thu media URLs.
- [ ] 3.2 🟢 `services/pdf_service.py`: `PDF_UPLOAD` → PyMuPDF/pdfplumber text + xử lý ảnh.
      **Lưu ý quan trọng:** PDF từ sách Cambridge thường nhúng chart/biểu đồ dưới dạng **vector (PDF
      operators)**, không phải raster image — `fitz.Page.get_images()` sẽ không tìm thấy. Giải pháp:
      rasterize toàn trang (`page.get_pixmap(dpi=150)`) → crop vùng chứa chart (xác định bằng bounding
      box hoặc Gemini Vision) → lưu PNG → đưa vào `media_pipeline.py`. Cần thiết cho Writing Task 1
      Academic (bắt buộc có ảnh biểu đồ/map).
- [ ] 3.3 🟢 `services/media_pipeline.py`: tải media → upload Cloudinary/GCS (tái dùng `storage_service.py`) →
      trả `[{originalUrl, storedUrl, kind}]`.
- [ ] 3.4 🟢 Chuẩn hoá output Stage 1: `{ rawText, mediaAssets }`.
- [ ] 3.5 🟢 Thêm Chromium vào Dockerfile/requirements (hoặc tách worker — theo Gate 0b).

**Deliverable:** hàm `extract_raw(job)` chạy độc lập (CLI test) cho cả URL & PDF.

> **🚦 Approval Gate 3:**
> - (a) **Nguồn web nào hỗ trợ trước?** (engnovate — đã có dấu vết slug? hay ieltsonlinetests/khác?) Cần selector riêng mỗi site.
> - (b) **Pháp lý/bản quyền**: phạm vi luận văn dùng nội dung Cambridge ở mức nào (chỉ demo nội bộ?), có cần ghi nguồn/giới hạn publish?
> - (c) PDF scan (ảnh) có cần **OCR** (Tesseract) không, hay chỉ nhận PDF có text-layer?

---

## Phase 4 — Gemini Structuring (backend-ai)

**Mục tiêu:** Stage 2 — text thô → JSON đúng JSON Contract (02 §2.5), đáp án inline.

**Task**
- [ ] 4.1 🟢 `prompts/extraction/` — schema + prompt cho từng kỹ năng (L/R/W/S), bật `response_schema` (Structured Output).
- [ ] 4.2 🟢 `services/extraction_service.py`: chọn schema theo `skill`, gọi Gemini, chèn `storedUrl` vào slot media.
- [ ] 4.3 🟢 Chunking cho đề dài (tách theo Part rồi ghép); ghi `tokensUsed`, `geminiModel`.
- [ ] 4.4 🟢 Hậu kiểm: đảm bảo mỗi `question_number` (L/R) có `answer`; đánh dấu thiếu để admin chú ý.
- [ ] 4.5 🟢 **Phân tầng model** (đòn cắt chi phí lớn nhất): Flash mặc định → Pro fallback khi *fail validate*; W/S cân nhắc Flash-Lite. (03 §3.8 #1)
- [ ] 4.6 🟢 **Không echo verbatim**: chỉ trích structure + answers; passage/transcript ghép từ `rawText` (Stage 1) → cắt ~½ output token. (03 §3.8 #2)
- [ ] 4.7 🟢 **Context caching** phần tĩnh (prompt + schema) + **cache theo hash** `rawText+schema+model` để bỏ call trùng. (03 §3.8 #3,#4)
- [ ] 4.8 🟢 Retry **targeted 1 lần** (chỉ gửi lại group hỏng), không retry cả đề. (03 §3.8 #5)

**Deliverable:** `structuredJson` hợp lệ cho ≥1 đề mỗi kỹ năng từ nguồn mẫu, kèm `tokensUsed` đo được.

> 💰 Toàn bộ chiến lược chi phí/độ trễ: xem [`03` §3.8 — Cost & Latency Strategy](./03-data-flow-and-pipeline.md).

> **🚦 Approval Gate 4:**
> - **(a) Model Gemini & ngân sách** — *Khuyến nghị:* **Flash mặc định, Pro chỉ fallback khi Flash fail validate** (bóc tách là tác vụ "phiên dịch theo schema", không cần reasoning sâu → rẻ ~10–20×). Cần bạn chốt: (i) đồng ý tiering này? (ii) **trần token/đề** tối đa là bao nhiêu? (iii) bật **Batch Mode** cho import hàng loạt không? → chi tiết 03 §3.8.
> - (b) Trường `explanation` (giải thích đáp án) sinh **tiếng Anh hay tiếng Việt**?
> - (c) Khi nguồn thiếu đáp án (vd Forecast chỉ có đề) → để trống cho admin, hay cho Gemini **suy luận** đáp án?

---

## Phase 5 — Async Wiring (RabbitMQ + callback)

**Mục tiêu:** nối Stage 1+2 vào vòng đời job qua hạ tầng async sẵn có (03 §3.4).

**Task**
- [ ] 5.1 🔵 `ai-client`: assert queue `content-extraction-queue` (durable, DLQ), publish job khi `POST /import`.
- [ ] 5.2 🟢 `ContentExtractionConsumer`: nhận job → `extract_raw` → `structuredJson` → HTTP callback `/extracted`.
- [ ] 5.3 🔵 Handler callback: lưu `structuredJson`/`mediaAssets`, set `AWAITING_REVIEW`/`FAILED`.
- [ ] 5.4 🔵 Cập nhật `status` xuyên suốt (PENDING→SCRAPING→EXTRACTING→AWAITING_REVIEW).
- [ ] 5.5 🟢 Retry + DLQ + giới hạn đồng thời (Playwright nặng RAM, theo cap container).

**Deliverable:** dán link/PDF ở Phase 6 → vài phút sau job tự sang `AWAITING_REVIEW`.

> **🚦 Approval Gate 5:**
> - (a) TTL message & số lần retry cho `content-extraction-queue`? (grading đang TTL 5')
> - (b) Giới hạn **số job chạy song song** bao nhiêu để không vượt RAM `backend-ai`?
> - (c) **Cơ chế auth cho callback `backend-ai → backend-core`?** Endpoint
>   `POST /admin/ielts/import/:id/extracted` sẽ bị `JwtAuthGuard` chặn vì không có Bearer token của user.
>   Hai lựa chọn: (i) **Internal service token** — shared secret trong env, header `X-Internal-Token`,
>   backend-core whitelist header này để bypass JWT; (ii) **GCP Service Account JWT** — phức tạp hơn nhưng
>   production-grade. Cần chốt trước khi code Phase 5. Tham khảo cách grading callback đang xử lý vấn đề
>   tương tự để đảm bảo nhất quán.

---

## Phase 6 — Admin Review UI (frontend-web)

**Mục tiêu:** kích hoạt 3 mục sidebar "Soon"; form duyệt pre-filled; commit.

**Task**
- [ ] 6.1 🟣 Bật mục sidebar `/admin/ielts-intensive`, `/admin/ielts-advanced` (gỡ `disabled` trong `AdminSidebar.tsx`).
- [ ] 6.2 🟣 Trang list + "New Import" (chọn targetSystem/skill/source, dán URL hoặc upload PDF).
- [ ] 6.3 🟣 Màn chờ (poll `GET /import/:id` — tinh thần `useGradingPoll`) → khi `AWAITING_REVIEW` mở editor.
- [ ] 6.4 🟣 **Editor theo kỹ năng** (tái dùng tinh thần `SentenceEditor`): L/R (bảng câu hỏi + ô đáp án + nghe audio;
      **với Listening, thêm input mm:ss cho `question_timestamps` mỗi câu** — admin nghe audio và điền mốc thời gian;
      hiển thị badge cảnh báo nếu timestamps còn null nhưng **không block commit/publish**),
      W (prompt + ảnh preview), S (câu hỏi/part + slot video).
- [ ] 6.5 🟣 Validate client (zod theo JSON Contract) + nút "Lưu" gọi `/commit`.
- [ ] 6.6 🟣 Cập nhật dashboard `admin/page.tsx`: thêm StatCard số đề Intensive/Advanced + Quick Action "Import đề".

**Deliverable:** luồng đầy đủ end-to-end qua UI.

> **🚦 Approval Gate 6:**
> - (a) **MVP editor**: làm editor giàu (bảng theo type) ngay, hay tạm **textarea JSON + validate** cho nhanh rồi nâng cấp sau?
> - (b) Cho phép **lưu nháp** (re-edit nhiều lần) hay duyệt 1 lần là commit?

---

## Phase 7 — Grader-Compatibility & Golden Tests (sống còn)

**Mục tiêu:** bảo chứng nội dung import **chấm đúng** — vá rủi ro R3 (chấm 0 ngầm).

**Task**
- [ ] 7.1 🔵 `assertGraderCompatible(json, skill)`: với L/R, mọi `question_number` phải có `answer` ở đúng "ngăn" theo
      taxonomy (02 §2.5); `type` phải thuộc whitelist; số câu khớp `questions`.
      Ngoài whitelist `type` và check `answer` đúng ngăn, **bổ sung test cases đặc biệt cho dạng gap-filling**
      (form/note/sentence completion): xác nhận `parseIELTSAnswer` nhận diện đúng các format đáp án mà Gemini
      có thể sinh ra: `"answer/alternate"` (dấu `/`), `"colo(u)r"` (ký tự tuỳ chọn trong ngoặc), và chuỗi
      thuần có khoảng trắng. Đây là dạng câu phổ biến nhất trong IELTS L/R và cũng là dạng dễ bị Gemini
      format lệch nhất.
- [ ] 7.2 🔵 **Golden tests**: lấy vài đề từ `mock-tests.ts`/`ielts-advanced-compiled/` (đã biết đáp án) làm fixture →
      chạy qua `extractCorrectAnswers`/`submitReadingPart` → assert chấm đúng full mark khi nộp đáp án chuẩn.
- [ ] 7.3 🔵 Test commit 2 nhánh (Intensive blob ráp đúng shape §1.2; Advanced ghi đúng bank).
- [ ] 7.4 🔵 Test chống trùng provenance (409 Conflict).

**Deliverable:** test suite xanh chứng minh "import → chấm" không lệch.

> **🚦 Approval Gate 7:** chọn bộ đề "golden" nào làm chuẩn regression (đề Cambridge 17 đang seed là ứng viên tốt)?

---

## Phase 8 — Hardening & Vận hành

**Mục tiêu:** an toàn, tiết kiệm, dễ vận hành lâu dài.

**Task**
- [ ] 8.1 🔵 Audit log thao tác admin (ai import/commit/xoá đề, khi nào).
- [ ] 8.2 🔵 Rate-limit + cost guard cho `/import` (chặn lạm dụng Gemini — R6).
- [ ] 8.3 🔵 Re-extract từ `rawText` (không scrape lại) khi nâng prompt/schema.
- [ ] 8.4 🔵 Rollback: `DELETE` đề đã commit + dọn media mồ côi (Cloudinary/GCS).
- [ ] 8.5 🗄️ Chính sách lưu PDF gốc/`rawText` (dung lượng + bản quyền).
- [ ] 8.6 🟢/🔵 Metrics: số job, tỉ lệ FAILED, token/đề (Prometheus `/metrics` sẵn có).
- [ ] 8.7 🟢 **Batch Mode** cho import hàng loạt (cả bộ Cambridge) khi không gấp — giảm ~50% chi phí. (03 §3.8 #6)
- [ ] 8.9 🔵 **Phát hiện & recover stuck job:** NestJS `@Cron` định kỳ (mỗi 5 phút) tìm job có
      `status IN (SCRAPING, EXTRACTING)` và `processingStartedAt < NOW() - timeout` (mặc định 10 phút) →
      set `status = FAILED`, `error = "Processing timeout — worker may have crashed"`. Admin thấy job này
      trong queue và có thể bấm Retry (xem endpoint Retry ở Phase 2.3). Timeout cấu hình qua env `IMPORT_JOB_TIMEOUT_SECONDS`.
      **Kiêm luôn Group TTL (chống "zombie"):** job nào trong group có `groupExpiresAt < NOW()` mà vẫn `FAILED/PENDING`
      → auto-`DISCARD` + ghi log để admin biết; nhờ đó group FULL_TEST dở dang cuối cùng vẫn "đóng" được để commit/bỏ.

> **🚦 Approval Gate 8:**
> - (a) Giữ PDF gốc & `rawText` bao lâu (bản quyền + dung lượng)?
> - (b) Xoá đề có **xoá media** đã up không, hay giữ lại (có thể dùng chung)?

---

## Bảng tổng hợp quyết định

### Đã chốt (xem README §2)
`D1` Hybrid tối giản · `D2` media→Cloudinary/GCS · `D3` controller admin mới + khoá CRUD cũ · `D4` giữ ngân hàng Advanced.

### Đang mở (sẽ hỏi đúng thời điểm theo Approval Gate)
| Gate | Quyết định chờ duyệt |
|------|----------------------|
| 0a/2a | Khoá hẳn hay bọc guard cho `/exams` cũ (tuỳ còn client nào dùng) |
| 0b/3a | Chromium chung image hay worker riêng; nguồn web hỗ trợ trước |
| 1a | `@@unique` cứng cho L/R hay chỉ check service |
| 2b | Quyền tạo đề: chỉ ADMIN hay cả INSTRUCTOR |
| 3b/3c | Phạm vi bản quyền nội dung; có OCR cho PDF scan không |
| 4a/4b/4c | **Model tiering** (khuyến nghị Flash → Pro fallback) + **trần token/đề** + **Batch Mode** — chi tiết 03 §3.8; ngôn ngữ explanation; có cho AI suy luận đáp án khi nguồn thiếu |
| 5a/5b | TTL/retry & số job song song |
| 6a/6b | Mức độ editor MVP; có lưu nháp không |
| 7 | Bộ đề golden chuẩn |
| 8a/8b | Lưu trữ PDF/rawText & dọn media khi xoá |

---

## Ước lượng tương đối (không phải cam kết)

| Phase | Khối lượng | Ghi chú |
|-------|-----------|---------|
| 1 | Nhỏ | thuần migration additive |
| 2 | Vừa | nhiều endpoint nhưng theo mẫu sẵn |
| 3 | Vừa–lớn | Playwright/PDF/media + hạ tầng container |
| 4 | Vừa | schema + prompt + chunking |
| 5 | Nhỏ–vừa | sao chép pattern grading |
| 6 | Lớn | editor 4 kỹ năng là phần UI nặng nhất |
| 7 | Vừa | nhưng **không được bỏ** (chặn vỡ chấm điểm) |
| 8 | Nhỏ–vừa | làm dần |

> Khuyến nghị bắt đầu: **Phase 1 → 2** (xương sống + vá bảo mật), rồi **Phase 7 sớm** cùng Phase 6-lite để chốt
> đường commit đúng, sau đó mới tự động hoá 3→4→5.
