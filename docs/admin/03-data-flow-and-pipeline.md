# 03 — Luồng dữ liệu & Pipeline (Data Flow)

> Trả lời trực tiếp yêu cầu: *"thể hiện rõ luồng đi của dữ liệu từ lúc tôi dán link/upload PDF cho đến khi lưu
> cấu trúc hoàn chỉnh vào DB"*. Theo **D1** (Hybrid tối giản), **D2** (media về Cloudinary/GCS), **D3** (API admin mới).

---

## 3.1. Toàn cảnh end-to-end

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ADMIN (frontend-web /admin/ielts-intensive | /admin/ielts-advanced)                   │
│  ① Dán URL  hoặc  Upload PDF   +  chọn: targetSystem, skill, source/book/test/quarter   │
└───────────────┬────────────────────────────────────────────────────────────────────────┘
                │  POST /admin/ielts/import        (tạo ContentImportJob, status=PENDING)
                ▼
┌──────────────────────────────  backend-core (NestJS)  ─────────────────────────────────┐
│  ContentImportService.create() → lưu job → publish RabbitMQ `content-extraction-queue`  │
└───────────────┬────────────────────────────────────────────────────────────────────────┘
                │  AMQP (durable, giống exam-grading-queue)
                ▼
┌──────────────────────────────  backend-ai (FastAPI/Python)  ───────────────────────────┐
│  ContentExtractionConsumer.handle(job):                                                 │
│                                                                                          │
│  ── Stage 1: RAW EXTRACTOR ───────────────────────────────────  status=SCRAPING         │
│   • WEB_URL  → Playwright mở trang → lấy `innerText` (text sạch)  + thu thập media URLs   │
│   • PDF_UPLOAD → PyMuPDF/pdfplumber → text thô từng trang + trích ảnh nhúng              │
│   • MEDIA PIPELINE (D2): tải mp3/ảnh/video → upload Cloudinary/GCS → map originalUrl→stored│
│                                                                                          │
│  ── Stage 2: GEMINI STRUCTURING ──────────────────────────────  status=EXTRACTING       │
│   • chọn responseSchema theo `skill` (xem 02 §2.5)                                        │
│   • Gemini(rawText, schema) → JSON có cấu trúc (đáp án inline)                            │
│   • chèn `storedUrl` vào đúng slot media (audioUrl/imageUrl/video/...)                    │
│                                                                                          │
│  → HTTP callback POST {BACKEND_CORE_URL}/admin/ielts/import/:id/extracted               │
│     body = { structuredJson, mediaAssets, geminiModel, tokensUsed }                      │
└───────────────┬────────────────────────────────────────────────────────────────────────┘
                │  HTTP (giống callback chấm điểm hiện tại)
                ▼
┌──────────────────────────────  backend-core  ──────────────────────────────────────────┐
│  cập nhật job: structuredJson + mediaAssets, status=AWAITING_REVIEW                      │
└───────────────┬────────────────────────────────────────────────────────────────────────┘
                │  (frontend poll GET /admin/ielts/import/:id  — giống useGradingPoll)
                ▼
┌──────────────────────────────  ADMIN REVIEW (frontend-web)  ───────────────────────────┐
│  ② Form pre-filled từ structuredJson → editor theo kỹ năng                               │
│     • sửa câu hỏi/đáp án/mapping, nghe thử audio, xem ảnh đã up                          │
│     • validate client-side (đúng JSON Contract) + cảnh báo grader-compat                  │
│  ③ Bấm "Lưu vào hệ thống" → POST /admin/ielts/import/:id/commit { editedJson, isPublished}│
└───────────────┬────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────  backend-core: COMMIT  ──────────────────────────────────┐
│  validate lại server-side (zod/class-validator) + check trùng provenance                 │
│  ┌─ targetSystem=INTENSIVE → upsert IeltsIntensiveExam (questions = blob đã ráp)         │
│  └─ targetSystem=ADVANCED  → create IeltsAdvancedXxxPart/Prompt (ghi vào ngân hàng)      │
│  set committedEntityId, status=COMMITTED                                                 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Tóm tắt 5 bước người dùng thấy:** dán link/PDF → (chờ AI) → form đầy sẵn → sửa & nghe/xem thử → bấm Lưu.

---

## 3.2. Stage 1 — Raw Extractor (chỉ làm việc vật lý)

**Nơi chạy:** `backend-ai` (Python) — đây là "sân nhà" của scraping (Playwright/BeautifulSoup/PyMuPDF có hệ sinh
thái Python tốt nhất) và service này **đã sẵn** kết nối GCS (`storage_service.py`, boto3) + RabbitMQ.

| Input | Công cụ | Output |
|-------|---------|--------|
| `WEB_URL` | **Playwright** (render JS) → `page.inner_text("body")`; thu `<audio src>`, `<img src>`, `<video src>` | text sạch + danh sách media URL |
| `PDF_UPLOAD` | **PyMuPDF (fitz)** / **pdfplumber** → text từng trang; `page.get_images()` lấy ảnh nhúng | text thô + ảnh |

**Media pipeline (D2):** với mỗi media URL/ảnh nhúng:
1. tải về buffer (httpx/requests);
2. upload lên **Cloudinary** (ảnh/CDN) hoặc **GCS** (audio/video lớn) — tái dùng `storage_service.py`;
3. ghi `{ originalUrl, storedUrl, kind: audio|image|video }` vào `mediaAssets`.

> Nguyên tắc D1: Stage 1 **tuyệt đối không cố hiểu ngữ nghĩa** (không regex bóc câu hỏi). Việc đó để Gemini làm —
> giúp scraper **bền** trước thay đổi layout nguồn.

---

## 3.3. Stage 2 — Gemini Structuring (cấu trúc hoá)

**Nơi chạy:** `backend-ai` — tái dùng client Gemini sẵn có (như `writing_grader.py` / `speaking_grader.py`).

- **Structured Outputs:** bật `response_mime_type="application/json"` + `response_schema` = schema kỹ năng tương ứng
  (định nghĩa ở 02 §2.5). Ép Gemini trả đúng khuôn, **giảm mạnh lỗi định dạng**.
- **Prompt khung:** *"Bạn là bộ trích xuất đề IELTS. Từ TEXT THÔ sau, hãy điền vào schema. Với Listening/Reading
  PHẢI điền `answer` cho từng `question_number`. Không bịa nội dung không có trong text."*
- **Chèn media:** sau khi có JSON, ánh xạ `mediaAssets.storedUrl` vào đúng slot (theo thứ tự xuất hiện / heuristic
  tên file). Nếu thiếu → để `null` (admin bổ sung).
- **Chia nhỏ (chunking):** đề full quá dài → tách theo Part rồi ghép, tránh vượt context & giảm chi phí.
- **Telemetry:** lưu `geminiModel`, `tokensUsed` để theo dõi chi phí (R6).

---

## 3.4. Vận chuyển bất đồng bộ (tái dùng hạ tầng chấm điểm)

Scrape + Gemini là tác vụ **dài** (giây→phút) → **không** chạy đồng bộ trong HTTP request. Tái dùng đúng pattern
chấm điểm đang chạy:

| Thành phần chấm điểm (đang có) | Bản sao cho import |
|-------------------------------|--------------------|
| Queue `exam-grading-queue` (durable, TTL, DLQ) | **`content-extraction-queue`** (durable, TTL dài hơn, DLQ `content-extraction-dlq`) |
| `GradingConsumer` | **`ContentExtractionConsumer`** |
| HTTP callback `BACKEND_CORE_URL` ghi `IeltsIntensiveResult` | callback `/admin/ielts/import/:id/extracted` ghi `structuredJson` |
| `useGradingPoll` (mobile/web poll tới terminal state) | poll `GET /admin/ielts/import/:id` tới `AWAITING_REVIEW`/`FAILED` |

> Không thêm broker/queue tech mới — chỉ thêm 1 queue + 1 consumer. Đồng nhất với "Async AI Grading Flow" trong CLAUDE.md.

---

## 3.5. Stage 3 — Admin Review (kiểm duyệt)

- Frontend `/admin/ielts-intensive/import/:id` (và `/admin/ielts-advanced/...`) **đổ `structuredJson` vào form**.
- **Editor theo kỹ năng** (tái dùng tinh thần `DictationSentenceEditor`/`SentenceEditor`):
  - L/R: bảng câu hỏi theo group `type`, ô đáp án sửa được, nút nghe audio / xem `passage_with_locations`.
  - W: prompt + ảnh đã up (preview), chọn `taskType/subType`.
  - S: danh sách câu hỏi theo part; slot video examiner (upload bổ sung nếu nguồn thiếu).
- **Validation 2 lớp:**
  - *Client*: schema (zod) đúng JSON Contract → chặn lưu khi thiếu `answer`, sai `type`, lệch số câu.
  - *Server*: class-validator + **grader-compat check** (xem Phase 7) trước khi ghi live.
- **Commit:** `POST .../commit { editedJson, isPublished }`.

---

## 3.6. Logic Commit (2 nhánh)

```
commit(job, editedJson, isPublished):
  validate(editedJson, schemaOf(job.skill))           # ném lỗi nếu sai contract
  assertGraderCompatible(editedJson)                  # Phase 7: mọi question_number có answer (L/R)
  dup = findDuplicateByProvenance(job)                # chống import trùng (02 §2.4)
  if dup and not job.overwrite: return Conflict(dup)

  if job.targetSystem == INTENSIVE:
     exam = upsertIeltsIntensiveExam({                # tái dùng tinh thần upsertCambridgeExam()
        title, type: skill, difficulty, duration,
        questions: assembleIntensiveBlob(editedJson),  # ráp về shape §1.2 theo type
        imageUrl, isPublished, source, bookNumber, testNumber, importJobId: job.id })
     committedEntityId = exam.id

  else: # ADVANCED → ghi vào ngân hàng theo kỹ năng
     switch job.skill:
        LISTENING: create IeltsAdvancedListeningPart({ ...editedJson, isPublished, provenance, importJobId })
        READING:   create IeltsAdvancedReadingPart({ ...editedJson, ... })
        WRITING:   upsert  IeltsAdvancedWritingPrompt by engnovateSlug
        SPEAKING:  upsert  IeltsAdvancedSpeakingPart  by (engnovateSlug, partNumber)   # tránh P2002
     committedEntityId = created.id

  job.update({ status: COMMITTED, committedEntityId })
```

- **Idempotency:** W/S dùng `upsert` theo slug (đã có `@@unique`); Intensive dùng `upsert` theo
  `(title,type)` như seed; L/R kiểm trùng theo provenance rồi cho admin chọn *ghi đè / tạo bản mới*.
- **Transaction:** commit ghi nhiều bảng (vd media + part) → bọc `prisma.$transaction()` (quy ước repo).

### Commit group `FULL_TEST` (hybrid: per-job Discard + per-group Abandon)

Một group `FULL_TEST` = 4 job cùng `groupId`. **Phân biệt 2 mức commit:**
- **Per-job commit** (`POST /import/:id/commit`): với job thuộc group (`groupId != null`) chỉ validate +
  `assertGraderCompatible` + set job `COMMITTED` — **KHÔNG** tạo `IeltsIntensiveExam` ngay (job lẻ `groupId == null`
  vẫn tạo bản ghi live như pseudocode trên).
- **Group commit** (`POST /import/group/:groupId/commit`): nơi thực sự sinh `IeltsIntensiveExam`, chỉ chạy khi group đã "đóng".

```
commitGroup(groupId, isPublished):
  jobs = ContentImportJob.where({ groupId })

  # Gate — giữ tinh thần "commit = không còn job dang dở"
  if jobs.any(j => j.status in [PENDING, SCRAPING, EXTRACTING, AWAITING_REVIEW, FAILED]):
     return 409 Conflict("Group còn job chưa xử lý xong")

  committed = jobs.filter(j => j.status == COMMITTED)     # bỏ qua DISCARDED
  if committed.isEmpty: return 422("Mọi job đều DISCARDED — không có gì để tạo")

  skills = committed.map(j => j.skill)
  if skills.length == 4:
     create IeltsIntensiveExam({ type: FULL_TEST, questions: mergeFourSkills(committed), ... })
  else:
     # 1–3 skill COMMITTED → mỗi skill 1 đề single-skill RIÊNG LẺ
     for j in committed:
        create IeltsIntensiveExam({ type: j.skill, questions: assembleIntensiveBlob(j), ... })
```

- **2–3 skill ⇒ nhiều đề single-skill**, **không** phải 1 đề tổng hợp → tránh thêm enum `type` mới, tái dùng
  trọn vẹn luồng single-skill (`LISTENING/READING/WRITING/SPEAKING` đã có trong `IeltsIntensiveExamType`).
- **2 action mở khoá:** `discard-skill` (DISCARD 1 job → nếu phần còn lại đều `COMMITTED` thì gate pass, group
  commit được); `abandon` (DISCARD toàn bộ → group không sinh đề nào).
- **Group TTL chống "zombie":** job `FAILED/PENDING` quá `groupExpiresAt` (createdAt + 7 ngày) bị cron Phase 8.9
  auto-`DISCARD`, nhờ đó group dở dang cuối cùng vẫn đóng được thay vì kẹt mãi.

---

## 3.7. Lỗi & phục hồi

| Tình huống | Xử lý |
|-----------|-------|
| Scrape lỗi (trang chặn bot, PDF ảnh scan) | `status=FAILED` + `error`; admin đổi nguồn / dùng PDF text-layer |
| Gemini trả JSON sai schema | Structured Output hạn chế; nếu vẫn lỗi → retry 1 lần, sau đó `FAILED`, giữ `rawText` để chạy lại |
| Media tải lỗi | slot media = `null`, ghi cảnh báo; không chặn cả job |
| Callback rớt | message vẫn trong queue (durable) + DLQ; có thể re-publish từ `rawText` |
| Cải tiến prompt/schema | re-extract từ `rawText` **không cần scrape lại** (tiết kiệm) |
| Đề trùng khi commit | trả `409 Conflict` kèm `committedEntityId` cũ; admin chọn ghi đè/bỏ |

---

## 3.8. Chiến lược Chi phí & Độ trễ (Cost & Latency Strategy)

> Bối cảnh: đây là **công cụ admin dùng không thường xuyên** (tổng cộng vài chục–vài trăm đề), không phải API
> user-facing realtime. Vì pipeline **đã async** (queue + poll — §3.4), admin **không bị block** → độ trễ vài phút/đề
> hoàn toàn chấp nhận được. Do đó trọng tâm tối ưu là **chi phí token + chống lãng phí**, không phải tốc độ.

**Quy mô thực tế:** 1 đề Reading full (3 passage ~2.700 từ + ~40 câu) ≈ **6–10k token input, 3–6k output**. Với
model rẻ, chi phí cỡ **vài cent/đề**; rủi ro thật nằm ở **chọn model đắt, echo nội dung thừa, retry mù, re-run**
chứ không phải "đắt vốn".

### Bảy đòn bẩy (theo thứ tự tác động)

| # | Đòn bẩy | Cách làm | Lợi ích |
|---|---------|----------|---------|
| 1 | **Phân tầng model** | Flash mặc định; chỉ leo **Pro** khi Flash *fail validate*; W/S có thể Flash-Lite | Cắt ~10–20× chi phí — đòn lớn nhất |
| 2 | **Không echo verbatim** ⭐ | passage/transcript đã có trong `rawText` (Stage 1) → chỉ bắt Gemini trích **structure + answers**, importer ghép passage/transcript vào | Cắt ~½ output token L/R |
| 3 | **Context caching** | cache phần **tĩnh** (system prompt + JSON schema + few-shot) — giống hệt mọi call | Giảm mạnh input token lặp |
| 4 | **Cache theo hash** | key = `hash(rawText + schemaVersion + model)`; trùng → trả kết quả cũ | Re-extract trùng = **0 token** |
| 5 | **Retry có mục tiêu** | Structured Output giảm JSON hỏng; lỗi → retry **1 lần**, chỉ gửi lại **group hỏng** kèm thông báo lỗi | Không đốt token retry cả đề |
| 6 | **Batch Mode** | import hàng loạt (cả bộ Cambridge) không gấp → chạy batch async (thường ~−50% giá) | Giảm giá khi nạp backlog |
| 7 | **Lối rẻ + trần** | W/S thử regex/heuristic trước, fail mới gọi Gemini; đặt **trần token/job**; log `tokensUsed` theo kỹ năng | Chặn input bệnh lý, đo điểm tốn |

### Cấu hình mặc định khuyến nghị

> **Flash mặc định → Pro fallback khi fail validate · không echo passage/transcript · cache schema/prompt tĩnh +
> cache theo hash `rawText` · retry targeted 1 lần · Batch Mode cho import bulk · trần token/job + metrics.**

Với combo này, tổng chi phí của tính năng cho phạm vi luận văn gần như không đáng kể, và độ trễ đã được kiến trúc
async hấp thụ. Telemetry (`ContentImportJob.geminiModel`/`tokensUsed`) cho biết chỗ nào tốn để tối ưu tiếp.

> ⚠️ Tên model/giá Gemini thay đổi theo thời gian (kiến thức tới 01/2026) — **xác nhận lại pricing & model hiện
> hành** trước khi chốt (xem **Approval Gate 4a** ở [`04`](./04-implementation-phases.md)). Chiến lược trên là
> *capability-based* nên ổn định bất kể đổi tên/giá.

---

→ Kế hoạch hiện thực theo phase ở [`04-implementation-phases.md`](./04-implementation-phases.md).
