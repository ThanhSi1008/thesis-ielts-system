# 01 — Phân tích hệ thống hiện tại

> Mục tiêu: hiểu **chính xác** cách hệ thống đang nạp đề thi cho cả 4 kỹ năng (Intensive & Advanced), cơ chế
> chấm điểm, và hạ tầng admin sẵn có — làm nền cho thiết kế import. Mọi nhận định dưới đây đều dẫn chiếu file thật.

---

## 1.1. Hai hệ thống nội dung song song

Đây là điểm quan trọng nhất phải nắm: **Intensive và Advanced là hai mô hình dữ liệu hoàn toàn khác nhau.**

| | **IELTS Intensive** | **IELTS Advanced** |
|---|---|---|
| Bản chất | Đề thi **trọn vẹn** (mock test) | **Ngân hàng** luyện tập theo kỹ năng |
| Đơn vị lưu | 1 dòng = 1 đề, mọi thứ trong cột `questions` Json | Nhiều bảng "Part/Prompt" độc lập, mỗi dòng 1 phần |
| Bảng SQL | `exams` (`IeltsIntensiveExam`) | `ielts_practice_*`, `ielts_advanced_*` |
| Có "đề" gộp 4 kỹ năng? | Có (type=`FULL_TEST`) hoặc đơn kỹ năng | **Không** — các Part rời rạc |
| Nguồn seed | `mock-tests.ts` + object inline trong `seed.ts` | File JSON trong `ielts-advanced-compiled/` |
| Chấm L/R | `exams.service.ts` → `extractCorrectAnswers` đệ quy | `ielts-advanced.service.ts` → duyệt `content[]` theo `type` |
| Chấm W/S | Gemini (RabbitMQ async) | Gemini (RabbitMQ async) |

> Hệ quả cho import: **một file JSON không "dùng chung" được** giữa hai hệ thống. Cần 2 nhánh commit khác nhau
> (xem §2.5 và §3.6). Quyết định **D4 (giữ ngân hàng)** giữ nguyên sự phân tách này để tránh đổi schema lớn.

---

## 1.2. IELTS Intensive — chi tiết

### Mô hình (`prisma/schema.prisma:81`)

```prisma
model IeltsIntensiveExam {
  id          String   @id @default(uuid())
  title       String
  description String?
  imageUrl    String?
  duration    Int                       // phút
  type        IeltsIntensiveExamType    // FULL_TEST | READING | LISTENING | SPEAKING | WRITING | PRACTICE
  difficulty  Difficulty                // BEGINNER | INTERMEDIATE | ADVANCED
  isPublished Boolean  @default(false)
  questions   Json                      // ⬅ TOÀN BỘ nội dung đề nằm ở đây
  ...
  @@map("exams")
}
```

**Toàn bộ nội dung đề (text, đáp án, audio URL, ảnh, video) nằm gọn trong cột `questions`.** Cấu trúc của
`questions` **khác nhau theo `type`**:

#### a) Reading (`questions` shape — từ `mock-tests.ts:3`)

```
{
  test_title, section: "Reading",
  parts: [{
    part_number, part_type, topic,
    passage_text,                  // markdown, có nhúng đáp án inline kiểu **`population`** *(Q1)*
    questions: "1–13",
    question_groups: [{
      questions, instructions, question_type,   // vd "Note Completion", "True/False/Not Given"
      content: [{ heading, points: [{ question_number, text, answer }] }],   // completion
      items:   [{ question_number, question_text, answer }]                  // TFNG / MC
    }]
  }]
}
```

#### b) Listening — tương tự Reading nhưng có `audio_url` + `transcript`, group theo `question_groups`.

#### c) Writing (`questions` shape — inline trong `seed.ts`)

```
{ type: "writing",
  tasks: [{ task_number, task_type, time_advice, prompt, image_url, min_words, instruction? }] }
```
→ **Không có answer key** (chấm bằng AI).

#### d) Speaking (`questions` shape — inline trong `seed.ts`)

```
{ type: "speaking",
  examiner: { name, role, avatarUrl },
  parts: [{ part_number, part_type, topic,
            questions: [{ text, video }],     // Part 1 & 3
            cue_card, video, video2 }] }       // Part 2
}
```
→ **Không có answer key**. Cần **video examiner** (media-heavy).

### Cách seed nạp Intensive (`prisma/seed.ts`)

- Hàm idempotent `upsertCambridgeExam({ title, type, difficulty, durationMinutes, imageUrl, questions, isPublished })`:
  tìm theo `(title, type)` → có thì `update`, chưa thì `create`. Đây chính là khuôn mẫu "tạo đề" mà importer sẽ tái dùng.
- Reading/Listening: `questions` lấy từ hằng số export trong `mock-tests.ts`
  (vd `cambridgeIelts17ReadingTest1Questions`).
- Writing/Speaking: object viết **inline** thẳng trong `seed.ts`.

### Cơ chế chấm điểm Intensive (`backend-core/src/modules/exams/exams.service.ts`)

- `extractCorrectAnswers(obj, ansMap)` — **đệ quy** toàn bộ `questions`, tìm node có `correct_answer` hoặc
  `answer`, gắn theo `question_number` / `question_numbers`.
- `parseIELTSAnswer(correct)` — tách đáp án nhiều biến thể: dấu `/` (đáp án thay thế) và `(...)` (phần tuỳ chọn);
  normalize về `[a-z0-9]`.
- `isAnswerCorrect(userAns, correctAns)` — so khớp sau normalize.

> ⚠️ **Ràng buộc cứng cho importer:** JSON đề Reading/Listening **bắt buộc** nhúng `answer`/`correct_answer` đúng
> theo từng `question_number`, nếu không grader sẽ **âm thầm chấm 0 điểm**. Đây là rủi ro #1 (xem §1.6).

---

## 1.3. IELTS Advanced — chi tiết

### Bốn bảng ngân hàng (mỗi kỹ năng 1 bảng "Part/Prompt")

| Kỹ năng | Model (schema.prisma) | Trường nội dung chính | Đáp án |
|---|---|---|---|
| Listening | `IeltsAdvancedListeningPart:894` | `audioUrl`, `transcript` Json, `content` Json, `questionTypes` String[] | inline trong `content[]` |
| Reading | `IeltsAdvancedReadingPart:927` | `passage` Text, `passageWithLocations` Json, `content` Json, `questionTypes` String[] | inline trong `content[]` |
| Writing | `IeltsAdvancedWritingPrompt:961` | `taskType`, `subType`, `source`, `category`, `bookNumber?`, `testNumber?`, `prompt`, `imageUrl?`, `minimumWords`, `suggestedTime`, `difficulty`, `engnovateSlug?` **@unique**, `isPublished` | — (AI chấm) |
| Speaking | `IeltsAdvancedSpeakingPart:1008` | `partNumber`, `partType`, `topic`, `source`, `category`, `bookNumber?`, `testNumber?`, `questions` Json, `engnovateSlug?`, `isPublished` — **@@unique([engnovateSlug, partNumber])** | — (AI chấm) |

**Quan sát then chốt:** Writing/Speaking Advanced **đã có sẵn** các cột provenance (`source`, `category`,
`bookNumber`, `testNumber`, `engnovateSlug`) và `isPublished`. Còn **Listening/Reading Part thì CHƯA có** các cột
này → cần bổ sung khi import (xem §2.4).

### Cách seed nạp Advanced (`prisma/seeders/ielts-advanced.seeder.ts`)

Đây chính là **tiền thân của tính năng import** — nó đã đọc file JSON theo từng kỹ năng:

- `seedIeltsAdvanced()`:
  - Listening: lặp qua 4 file `listening_*.json`, `JSON.parse(...)[0]` → `prisma.ieltsAdvancedListeningPart.create`.
  - Reading: lặp qua 3 file `reading_*.json`; tự suy ra `questionTypes` bằng `content.map(c => c.type)`.
  - `seedWritingPrompts()`: đọc `writing-prompts.json` (mảng) → tạo từng prompt.
  - `seedSpeakingParts()`: đọc `speaking-parts.json` (mảng) → có **validation** (`validPartTypes`,
    `isValidQuestions`) và **xử lý trùng** `P2002` (do `@@unique`).

> Seeder này cho thấy 2 thứ ta sẽ tái dùng: (1) **đọc JSON theo kỹ năng → map → prisma.create**, và (2)
> **logic validate + chống trùng**. Importer thực chất là "seeder có UI + nguồn động".

### Hình dạng JSON biên dịch sẵn (`prisma/data/ielts-advanced-compiled/`)

- `listening_*.json` = `[{ topic, instructions, audio_url, transcript: [{speaker,text}],
  content: [{ type, question_numbers, text, num_correct, options, answers, explanation, question_timestamps }] }]`
- `reading_*.json` = `[{ title, passage, passage_with_locations: [str|{question_number,text}],
  content: [{ type, topic, instruction, questions|points|items|notes|rows }] }]`
- `writing-prompts.json` = `[{ taskType, subType, source, category, bookNumber, testNumber, title, prompt,
  imageUrl, minimumWords, suggestedTime, difficulty, engnovateSlug }]`
- `speaking-parts.json` = `[{ engnovateSlug, partNumber, partType, topic, source, category, bookNumber,
  testNumber, title, questions: [{text}] }]`

### Cơ chế chấm Advanced (`ielts-advanced.service.ts`)

`submitListeningPart` / `submitReadingPart` **duyệt mảng `content[]`**, xử lý theo `group.type`:

- `points` (form/note completion), `questions` (short answer, MC) → đọc `q.answer` / `q.acceptable_answers`.
- `matching` → đọc `group.answers[item.id]` (`.letter` hoặc giá trị trực tiếp).
- `multiple_choice_multiple` → `group.question_numbers` + `group.answers[i]`.
- `rows` (table completion) → `row.questions[k]`.

→ Build `scoreData` theo từng `type` rồi lưu `IeltsAdvancedListeningSession`.

> ⚠️ **Ràng buộc cứng:** Gemini phải xuất `content[]` đúng theo **taxonomy `type`** mà grader nhận diện, và đặt
> đáp án đúng "ngăn" (`points`/`questions`/`items`/`rows`/`answers`). Bảng taxonomy đầy đủ ở §2.5.

---

## 1.4. Hạ tầng Admin sẵn có (đã dựng một phần)

### Frontend (`frontend-web/src/app/admin/`)

- `AdminGuard.tsx` — chặn truy cập nếu `user.role !== "ADMIN"` (redirect `/`).
- `_components/AdminSidebar.tsx` — **đã có sẵn 3 mục bị `disabled: true` + nhãn "Soon"**:
  `/admin/ielts-basic`, `/admin/ielts-advanced`, `/admin/ielts-intensive`. → Tính năng này chính là phần "Soon" đó.
- Mẫu CRUD chuẩn (theo `dictation`/`shadowing`): mỗi feature gồm
  `page.tsx` (list) · `new/page.tsx` (tạo) · `[id]/edit/page.tsx` (sửa) · `_components/*Form.tsx` · `_hooks/use*`.
- `services/admin.api.ts` — `adminShadowingApi`, `adminDictationApi` với `getAll/getById/create/update/delete` +
  **`importYoutube`** (endpoint "import từ nguồn ngoài" — analog gần nhất với JSON import của ta).

### Backend (mẫu admin theo `dictation`)

- `dictation/controllers/admin-dictation.controller.ts`:
  `@Controller("admin/dictation/lessons")` + `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles("ADMIN")`,
  có route `@Post("import")`.
- `RolesGuard` (`common/guards/roles.guard.ts`) + `@Roles(...)` (`common/decorators/roles.decorator.ts`) — đã hoạt động.

### Tiền lệ scraper (`prisma/scripts/extract-reading.ts`)

Đã có script biến `mock-tests.ts` → JSON `ielts-advanced-compiled/` (parse markdown, tách
`passage_with_locations`, map question groups). Chứng minh pipeline "compile → JSON" đã tồn tại; ta sẽ tổng quát hoá nó.

---

## 1.5. Lỗ hổng & rủi ro (phải xử lý trong kế hoạch)

| # | Vấn đề | Bằng chứng | Hướng xử lý |
|---|--------|-----------|-------------|
| **R1** | **CRUD đề CHƯA chặn quyền admin** | `exams.controller.ts`: `@Post()/@Patch(:id)/@Delete(:id)` chỉ có `@UseGuards(JwtAuthGuard, ThrottlerGuard)` — **bất kỳ user đăng nhập** nào cũng tạo/sửa/xoá được đề | **D3**: tạo controller admin mới + khoá/loại bỏ CRUD cũ |
| **R2** | **Không có endpoint admin cho Advanced** | `ielts-advanced.controller.ts` toàn route user-facing (read/submit/history) | Thêm `/admin/ielts/advanced/*` |
| **R3** | **Answer-key dễ vỡ ngầm** | Grader đọc `answer`/`correct_answer` theo `question_number`; sai cấu trúc → chấm 0 mà không lỗi | §2.5 contract + §Phase 7 golden tests |
| **R4** | **Media nặng & bản quyền** | Listening cần audio, Speaking cần video examiner, Writing/map cần ảnh; nguồn là CDN ngoài (vd `proxis.sgp1.cdn.digitaloceanspaces`) | **D2**: tải về up Cloudinary/GCS |
| **R5** | **Import trùng** | `@@unique(engnovateSlug, partNumber)` ở Speaking; Listening/Reading **không có** khoá tự nhiên | §2.4 composite key + check trùng theo `(source, bookNumber, testNumber, skill, partNumber)` ở tầng service (ưu tiên) thay vì `engnovateSlug`. Giữ `engnovateSlug` như metadata — không gỡ constraint cũ để tránh breaking change, nhưng không dùng làm primary dedup key cho nguồn không phải Engnovate. PostgreSQL cho phép multi-null trong cột UNIQUE nên không có lỗi P2002 khi slug là null. |
| **R6** | **Chi phí & độ trễ Gemini** | Bóc tách 1 đề full = nhiều ngàn token; cần async, retry, theo dõi cost | §3.4 reuse RabbitMQ + **chiến lược chi phí 03 §3.8** (model tiering, không echo verbatim, caching, batch) |
| **R7** | **Khác biệt schema W/S vs L/R** | W/S đã có provenance + `isPublished`; L/R Part thì chưa | §2.4 migration additive |
| **R8** | **Job xử lý bị "stuck"** | Worker crash giữa chừng để job mắc kẹt ở `SCRAPING`/`EXTRACTING` mãi mà không chuyển sang `FAILED` | Phase 8.9: cron detect timeout + auto-recover; `processingStartedAt` field để tính elapsed time |
| **R9** | **`question_timestamps` không thể sinh tự động** | Gemini chỉ nhận transcript text, không nghe audio → không thể sinh mốc thời gian giây/phút | §2.5: cho phép `null`, admin điền tay qua editor UI (Phase 6.4); không block commit/publish |

---

## 1.6. Kết luận phân tích

1. **Tái dùng tối đa**: seeder Advanced (đọc JSON→create), `upsertCambridgeExam` (idempotent), Gemini ở
   `backend-ai`, RabbitMQ+callback, mẫu admin `dictation`, và 3 mục sidebar "Soon".
2. **Hai nhánh commit** bắt buộc khác nhau: Intensive (gộp `questions` blob) vs Advanced (ghi từng Part/Prompt).
3. **Điểm sống còn về đúng đắn** là **answer-key contract** (R3) — phải có test bảo chứng grader (Phase 7).
4. **Schema thay đổi tối thiểu**: thêm 1 bảng staging + vài cột provenance; **không** đổi bảng live (giữ `@@map`).

→ Chi tiết schema ở [`02-data-model-and-schema.md`](./02-data-model-and-schema.md).
