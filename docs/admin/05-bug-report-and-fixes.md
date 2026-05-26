# 05 — Báo cáo lỗi & Hướng dẫn fix chi tiết

> Kết quả **verify implementation** (commit `58fab9c`) của tính năng Admin Exam Builder.
> Mỗi lỗi gồm: **Vị trí · Triệu chứng/Nguyên nhân · Tác động · Cách fix từng bước · Cách kiểm chứng**.
>
> **Đã verify:** `tsc --noEmit` backend-core **PASS (exit 0)**; schema/migration khớp [`02`](./02-data-model-and-schema.md);
> khoá CRUD `/exams` đúng; golden test chấm điểm (`admin-ielts.e2e-spec.ts:493-522`) là thật.
> **Chưa chạy:** e2e suite (cần Postgres), backend-ai (cần venv/Playwright), build frontend, runtime của shape `full_test`.

---

## Tổng quan

| ID | Mức | Khu vực | Một dòng | Trạng thái |
|----|-----|---------|----------|-----------|
| [BUG-01](#bug-01) | 🔴 Cao | callback auth | HMAC `/extracted` lệch giữa Python ↔ Node → 401 với nội dung non-ASCII | Chưa fix |
| [BUG-02](#bug-02) | 🔴 Cao | bảo mật | `CALLBACK_SECRET` có default public, không fail-closed | Chưa fix |
| [BUG-03](#bug-03) | 🟠 Vừa | cron/recovery | Không ghi `SCRAPING/EXTRACTING`/`processingStartedAt` → cron không recover job kẹt `PENDING` | Chưa fix |
| [BUG-04](#bug-04) | 🟠 Vừa | commit group | `commitGroup` lệch rule đã duyệt + per-job commit job nhóm tạo đề lẻ ngoài ý muốn | Chưa fix |
| [BUG-05](#bug-05) | 🟠 Vừa | grader safety | Nhánh merge FULL_TEST bỏ qua `assertGraderCompatible` | Chưa fix |
| [BUG-06](#bug-06) | 🟠 Vừa | tích hợp | Shape `questions` FULL_TEST chưa chứng minh player/grader tiêu thụ được | Chưa fix |
| [BUG-07](#bug-07) | 🟠 Vừa | grader safety | `assertGraderCompatible` chưa phủ `matching`/`table_completion` | Chưa fix |
| [BUG-08](#bug-08) | 🟡 Thấp | dedup | W/S không chống trùng khi `engnovateSlug = null` | Chưa fix |
| [BUG-09](#bug-09) | 🟡 Thấp | runtime | Simulated fallback sinh đề giả khi Gemini key lỗi (rò vào prod) | Chưa fix |
| [BUG-10](#bug-10) | 🟡 Thấp | dọn dẹp | Param `isPublished` thừa; verb `discard-skill`/`abandon` lệch docs | Chưa fix |

**Thứ tự fix đề xuất:** BUG-01 → BUG-02 (chặn pipeline & bảo mật) → BUG-05 → BUG-07 (lưới an toàn chấm điểm R3) → BUG-04 → BUG-03 → BUG-08 → BUG-06 (điều tra) → BUG-09 → BUG-10.

---

<a name="bug-01"></a>
## BUG-01 🔴 — HMAC callback `/extracted` không khớp giữa backend-ai và backend-core

**Vị trí:** `backend-core/src/modules/admin-ielts/controllers/admin-ielts-import.controller.ts` (route `extracted()`, ~L78-90)
· `backend-ai/app/consumers/content_extraction_consumer.py` (`process_message`, đoạn ký webhook).

**Nguyên nhân gốc:**
- **Python** ký đúng bytes nó gửi: `json.dumps(payload, separators=(',',':'))` — mặc định `ensure_ascii=True` ⇒ ký tự non-ASCII thành `\uXXXX`.
- **Node** lại ký `JSON.stringify(body)` trên **DTO đã được parse + validate**, KHÔNG phải bytes thô nhận được. `JSON.stringify` xuất non-ASCII thành **ký tự UTF-8 nguyên bản**, và số `1.0`→`1`.

⇒ Với bất kỳ payload chứa non-ASCII (gần như **mọi** passage/transcript IELTS thật: dấu `–`, `'`, `"`, `é`…), hai chuỗi khác nhau → `signature !== computed` → **401 Unauthorized** → job **không bao giờ** sang `AWAITING_REVIEW`.

**Tác động:** Pipeline tự động **vỡ end-to-end** với dữ liệu thật. e2e không test route này (không có `createHmac`/`callback-signature` trong spec) nên CI vẫn xanh → lỗi bị che.

**Cách fix (ký trên RAW BODY, không ký lại DTO):**

1. `backend-core/src/main.ts` — bắt raw buffer khi parse JSON (sửa dòng `app.use(json({ limit: "50mb" }))`):
   ```ts
   app.use(
     json({
       limit: "50mb",
       verify: (req: any, _res, buf: Buffer) => {
         req.rawBody = buf; // giữ nguyên bytes thô để xác thực HMAC
       },
     }),
   );
   ```
2. `admin-ielts-import.controller.ts` — xác thực HMAC trên `req.rawBody`:
   ```ts
   import { Req } from "@nestjs/common";
   // ...
   @Post(":id/extracted")
   extracted(
     @Param("id") id: string,
     @Headers("x-callback-signature") signature: string,
     @Req() req: any,
     @Body() body: CallbackExtractedDto,
   ) {
     const secret = this.configService.get<string>("CALLBACK_SECRET"); // xem BUG-02
     const raw: Buffer = req.rawBody ?? Buffer.from(JSON.stringify(body));
     const computed = createHmac("sha256", secret).update(raw).digest("hex");
     // so sánh an toàn theo thời gian:
     const ok =
       signature &&
       computed.length === signature.length &&
       timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
     if (!ok) throw new UnauthorizedException("Invalid callback signature");
     return this.importService.saveExtractedContent(id, body);
   }
   ```
   (`import { timingSafeEqual } from "crypto";`)
3. Python giữ nguyên (đã ký đúng bytes nó gửi qua `data=payload_str`). Không cần đổi.

**Kiểm chứng:**
- Viết e2e mới: POST `/admin/ielts/import/:id/extracted` với body chứa ký tự non-ASCII (vd `"café – test 'quote'"`), header `x-callback-signature` = HMAC mô phỏng Python (`json.dumps(..., separators=(',',':'))` rồi hash). Phải trả **200** và job → `AWAITING_REVIEW`.
- Test ngược: chữ ký sai → **401**.

---

<a name="bug-02"></a>
## BUG-02 🔴 — `CALLBACK_SECRET` có default công khai, không fail-closed

**Vị trí:** `admin-ielts-import.controller.ts` (`getOrDefault("CALLBACK_SECRET", "test-callback-secret-value-for-ci")`)
· `content_extraction_consumer.py` (`os.getenv("CALLBACK_SECRET", "test-callback-secret-value-for-ci")`).

**Nguyên nhân:** Cả hai phía fallback về cùng một secret hard-code **công khai trong source**. Nếu prod quên set env → ai biết secret này đều **giả mạo callback**, ghi `structuredJson` tuỳ ý vào job.

**Tác động:** Lỗ hổng giả mạo webhook ở production.

**Cách fix:**
1. Backend-core: bỏ default, fail-closed ngoài môi trường test:
   ```ts
   const secret = this.configService.get<string>("CALLBACK_SECRET");
   if (!secret) {
     if (this.configService.get("NODE_ENV") === "production")
       throw new Error("CALLBACK_SECRET is required in production");
     // chỉ cho phép giá trị test khi KHÔNG phải production
   }
   ```
   Hoặc validate sớm lúc bootstrap (khuyến nghị: dùng `@nestjs/config` validationSchema `Joi.string().required()` cho prod).
2. Python: tương tự — nếu `ENV=production` và thiếu `CALLBACK_SECRET` → raise lúc khởi động consumer.
3. Đặt cùng một secret mạnh (≥32 bytes random) ở env hai service trên VM/CI.

**Kiểm chứng:** Bỏ env `CALLBACK_SECRET` + `NODE_ENV=production` → app phải **từ chối khởi động** (hoặc route trả 500 rõ ràng), không im lặng dùng default.

---

<a name="bug-03"></a>
## BUG-03 🟠 — Recovery job "stuck" gần như vô hiệu (thiếu chuyển trạng thái & `processingStartedAt`)

**Vị trí:** `import-cron.service.ts` (`handleStuckJobs`, quét `status IN (SCRAPING, EXTRACTING)`, ~L31-45)
· `content-import.service.ts` (tạo job = `PENDING`, **không** set `processingStartedAt`) · `content_extraction_consumer.py` (**không** cập nhật status khi bắt đầu xử lý).

**Nguyên nhân:** Trong xử lý thường, job đi `PENDING → (worker) → AWAITING_REVIEW/FAILED`. **Không có code nào ghi `SCRAPING`/`EXTRACTING` hay `processingStartedAt`.** Cron lại chỉ quét `SCRAPING/EXTRACTING` ⇒ worker chết để job kẹt ở **`PENDING`** mãi mà cron **không đụng tới**. Field `processingStartedAt` là field chết.

**Tác động:** R8 (chống zombie) chỉ hoạt động cho job thuộc group (nhờ Group-TTL quét `PENDING` sau 7 ngày). Job **lẻ** kẹt `PENDING` không bao giờ được recover.

**Cách fix (chọn 1 trong 2, khuyến nghị A):**

- **A. Đơn giản & đủ:** set mốc thời gian lúc đẩy queue + cho cron quét cả `PENDING`.
  1. `content-import.service.ts` khi tạo & publish: `processingStartedAt: new Date()` (hoặc set khi publish thành công).
  2. `import-cron.service.ts`: thêm `PENDING` vào danh sách quét stuck:
     ```ts
     status: { in: [ContentImportStatus.PENDING, ContentImportStatus.SCRAPING, ContentImportStatus.EXTRACTING] },
     ```
     (giữ nhánh fallback `processingStartedAt: null → updatedAt < threshold`).
- **B. Chính xác hơn:** consumer `backend-ai` POST cập nhật status `SCRAPING`→`EXTRACTING` + `processingStartedAt` về backend-core (thêm 1 endpoint `PATCH :id/status` có HMAC như BUG-01). Tốn thêm HTTP round-trip nhưng phản ánh đúng vòng đời.

**Kiểm chứng:** Tạo job, ép `processingStartedAt`/`updatedAt` về quá khứ > timeout, chạy `handleStuckJobs()` → job `PENDING` phải chuyển `FAILED` + có audit log `RECOVER_TIMEOUT`. (Mở rộng test sẵn có ở `admin-ielts.e2e-spec.ts:~685`.)

---

<a name="bug-04"></a>
## BUG-04 🟠 — `commitGroup` lệch rule đã duyệt + per-job commit job-nhóm tạo đề lẻ ngoài ý muốn

**Vị trí:** `ielts-content-commit.service.ts` — `commitGroup()` (gate `activeStates` chỉ gồm `PENDING/SCRAPING/EXTRACTING`, ~L445-460; `reviewableJobs` nhận cả `AWAITING_REVIEW`) và `commit()` (nhánh INTENSIVE tạo `IeltsIntensiveExam` **bất kể** `job.groupId`).

**Nguyên nhân & lệch chuẩn:**
1. Rule đã duyệt ([`02` §2.3](./02-data-model-and-schema.md)): commit group khi **mọi job `COMMITTED` hoặc `DISCARDED`**; ❌ block nếu còn `…/AWAITING_REVIEW/FAILED`. Thực tế: chỉ block `PENDING/SCRAPING/EXTRACTING`, **tự commit luôn job `AWAITING_REVIEW`** và **lặng lẽ bỏ job `FAILED`** (FULL_TEST âm thầm thành 3 đề lẻ nếu 1 skill fail).
2. `commit()` không kiểm `groupId`: nếu admin lỡ per-job commit một skill thuộc group FULL_TEST → tạo ngay 1 **đề single-skill độc lập**; sau đó `commitGroup` lại tạo đề FULL_TEST ⇒ **dư đề + trùng nội dung**.

**Tác động:** Hành vi commit nhóm khó lường; mất bước duyệt từng kỹ năng; job lỗi bị nuốt; có thể sinh đề thừa.

**Cách fix:**
1. **Chặn FAILED:** thêm `FAILED` vào điều kiện block của `commitGroup` (buộc admin Retry hoặc Discard tường minh trước khi gom):
   ```ts
   const blocking = [PENDING, SCRAPING, EXTRACTING, FAILED];
   if (jobs.some(j => blocking.includes(j.status)))
     throw new ConflictException("Group còn job chưa xử lý/đang lỗi — Retry hoặc Discard trước khi commit.");
   ```
2. **Khoá per-job commit cho job thuộc group:** thêm cờ nội bộ:
   ```ts
   async commit(jobId, overwrite=false, isPublished=false, userId?, _fromGroup=false) {
     // ...
     if (job.groupId && !_fromGroup)
       throw new ConflictException("Job thuộc FULL_TEST group — dùng endpoint group commit.");
   ```
   `commitGroup` gọi nhánh 1–3 skill bằng `this.commit(j.id, true, isPublished, userId, /*_fromGroup*/ true)`.
3. **Đồng bộ tài liệu:** vì impl finalize `AWAITING_REVIEW` ngay tại group-commit (không yêu cầu per-job COMMITTED trước), cập nhật rule ở [`02` §2.3](./02-data-model-and-schema.md) & [`03` §3.6](./03-data-flow-and-pipeline.md) thành: *"block nếu còn `PENDING/SCRAPING/EXTRACTING/FAILED`; `AWAITING_REVIEW` được finalize tại group-commit; `DISCARDED` bị bỏ qua."* (Kèm BUG-05 để nội dung `AWAITING_REVIEW` vẫn được validate trước khi gom.)

**Kiểm chứng:** Group 4 job, để 1 job `FAILED` → group-commit phải **409**. Per-job commit một job có `groupId` → **409**. Sau khi Discard job lỗi (còn 3 `AWAITING_REVIEW`) → group-commit tạo **3 đề single-skill**.

---

<a name="bug-05"></a>
## BUG-05 🟠 — Nhánh merge FULL_TEST bỏ qua `assertGraderCompatible`

**Vị trí:** `ielts-content-commit.service.ts` — nhánh `reviewableJobs.length === 4` trong `commitGroup()` (~L470-520) ghi thẳng `mergedQuestions` mà không gọi `assertGraderCompatible`.

**Nguyên nhân:** `commit()` đơn lẻ có gọi `assertGraderCompatible` (L~160), nhưng nhánh merge 4-skill tạo `IeltsIntensiveExam` trực tiếp từ `structuredJson` của từng job, **không** kiểm tra.

**Tác động:** Đáp án L/R lỗi (thiếu `answer`, sai `type`, lệch ngoặc/`/`) **lọt vào đề FULL_TEST** → chấm sai/chấm 0 ngầm (đúng rủi ro R3 mà Phase 7 phải chặn).

**Cách fix:** Trước khi merge, assert từng job (đặc biệt L/R):
```ts
for (const j of [listeningJob, readingJob, writingJob, speakingJob]) {
  this.assertGraderCompatible(j.structuredJson, j.skill, ContentImportTargetSystem.INTENSIVE);
}
```

**Kiểm chứng:** e2e: group 4 job với 1 job Reading thiếu `answer` → group-commit phải **422**, không tạo đề.

---

<a name="bug-06"></a>
## BUG-06 🟠 — Shape `questions` của FULL_TEST chưa chứng minh player/grader tiêu thụ được

**Vị trí:** `ielts-content-commit.service.ts` (`mergedQuestions = { type: "full_test", listening, reading, writing, speaking }`).

**Nguyên nhân:** Đây là blob **mới**. e2e chỉ assert **tạo ra** (`admin-ielts.e2e-spec.ts:~354`), không assert exam-player frontend + `exams.service.submitSession`/grader **phục vụ & chấm** được nó. Grader Intensive (`extractCorrectAnswers`) đệ quy nên *có thể* tìm thấy đáp án lồng dưới `listening/reading`, nhưng exam runner & UI hiện tại viết cho shape **đơn-kỹ-năng**.

**Tác động:** Có thể tạo được đề FULL_TEST nhưng **không thi/chấm được** (rủi ro tích hợp downstream).

**Cách fix (điều tra trước, rồi sửa):**
1. Viết e2e: tạo FULL_TEST → student tạo session → submit → assert có `IeltsIntensiveResult` với điểm L/R đúng.
2. Nếu fail: hoặc (a) đổi `mergedQuestions` về shape mà player/`submitSession` đã hiểu (gói theo `parts`/`sections` giống đề đơn), hoặc (b) bổ sung nhánh xử lý `type === "full_test"` trong `exams.service` + exam player.
3. Chốt **JSON Contract cho FULL_TEST** trong [`02` §2.5](./02-data-model-and-schema.md) (hiện đang để trống shape gộp).

**Kiểm chứng:** e2e submit→score FULL_TEST PASS; thử thủ công trên web/mobile player.

---

<a name="bug-07"></a>
## BUG-07 🟠 — `assertGraderCompatible` chưa phủ `matching` / `table_completion`

**Vị trí:** `ielts-content-commit.service.ts` — `assertGraderCompatible()` (~L26-150).

**Nguyên nhân:** Hàm trích đáp án theo node có `question_number`/`question_numbers` (giống grader **Intensive**). Nhưng:
- `matching*`: đáp án ở `group.answers[itemId]`, `items` chỉ có `{id, text}` (không `question_number`).
- `table_completion`: đáp án ở `rows[].questions[qNum].answer`.

⇒ Các node này **không được bắt** → part chỉ-matching có thể bị **reject nhầm** (`ansMap.size === 0`) hoặc đáp án matching/table **không được validate** (lọt lỗi). Đây chính là cách grader **Advanced** (`submitListeningPart`/`submitReadingPart`) duyệt `content[]`.

**Tác động:** Lưới an toàn R3 còn lỗ cho Advanced L/R dạng matching/table — phổ biến trong Listening.

**Cách fix:** Bổ sung nhánh trong bộ trích đệ quy, phản chiếu đúng grader Advanced:
```ts
// matching: group.answers là map {itemId|index: letter|{letter}}
if (typeof obj.type === "string" && obj.type.startsWith("matching") && obj.answers && typeof obj.answers === "object") {
  for (const [k, v] of Object.entries(obj.answers)) {
    ansMap.set(`match:${k}`, (v as any)?.letter ?? v);
  }
}
// table_completion: rows[].questions[qNum] = { answer }
if (Array.isArray(obj.rows)) {
  for (const row of obj.rows) {
    if (row?.questions) for (const [qn, cell] of Object.entries(row.questions))
      ansMap.set(String(qn), (cell as any)?.answer);
  }
}
```
Đồng thời whitelist `type` cho các node matching dù không có `question_number`.

**Kiểm chứng:** Unit test `assertGraderCompatible` với fixture matching-only và table_completion (lấy từ `ielts-advanced-compiled/`): phải PASS khi đủ đáp án, FAIL khi thiếu.

---

<a name="bug-08"></a>
## BUG-08 🟡 — W/S không chống trùng khi `engnovateSlug = null`

**Vị trí:** `ielts-content-commit.service.ts` — nhánh `WRITING`/`SPEAKING` (`if (engnovateSlug) { findUnique… }`, ~L300, ~L360).

**Nguyên nhân:** Khi import từ Cambridge/Forecast, `engnovateSlug` null → bỏ qua kiểm trùng hoàn toàn → **tạo trùng** prompt/part. Lệch chiến lược [`02` §2.4 / 2G](./02-data-model-and-schema.md) (ưu tiên composite key).

**Cách fix:** Fallback composite khi slug null:
```ts
let existing = engnovateSlug
  ? await tx.ieltsAdvancedWritingPrompt.findUnique({ where: { engnovateSlug } })
  : await tx.ieltsAdvancedWritingPrompt.findFirst({ where: { source, bookNumber, testNumber, taskType: data.taskType } });
```
(Speaking: composite `(source, bookNumber, testNumber, partNumber)`.)

**Kiểm chứng:** Commit 2 lần cùng W/S Cambridge (slug null) với `overwrite=false` → lần 2 phải **409**.

---

<a name="bug-09"></a>
## BUG-09 🟡 — Simulated fallback sinh "đề giả" khi Gemini key lỗi

**Vị trí:** `content_extraction_consumer.py` — nhánh `if "API key not valid" … : payload = { structuredJson: <giả> }`.

**Nguyên nhân:** Để test pass khi không có key, consumer fabricate `structuredJson` giả. Ở prod cấu hình sai key → job vẫn `AWAITING_REVIEW` với **nội dung bịa**, admin có thể commit nhầm.

**Cách fix:** Gate sau cờ env, mặc định tắt:
```python
if os.getenv("ALLOW_SIMULATED_EXTRACTION", "false").lower() == "true":
    payload = { ...simulated... }
else:
    payload = { "error": f"Extraction failed: {e}" }  # → job FAILED, admin biết
```
Chỉ bật `ALLOW_SIMULATED_EXTRACTION=true` trong CI/test.

**Kiểm chứng:** Không set cờ + key sai → job phải sang `FAILED` (không `AWAITING_REVIEW`).

---

<a name="bug-10"></a>
## BUG-10 🟡 — Dọn dẹp: param `isPublished` thừa & verb lệch docs

**Vị trí:** `ielts-content-commit.service.ts` (`commit(..., isPublished=false, ...)` nhận nhưng **luôn** ghi `isPublished:false`) · `admin-ielts-import.controller.ts` (`@Delete(":id/discard-skill")`, `@Delete("group/:groupId/abandon")` trong khi docs ghi `POST`).

**Cách fix:**
1. Bỏ param `isPublished` khỏi `commit()`/`commitGroup()` (theo 2D luôn false), hoặc đổi tên `_unusedIsPublished` + comment để khỏi gây hiểu nhầm.
2. Thống nhất verb: hoặc đổi route sang `POST` (đúng [`04` Phase 2.3](./04-implementation-phases.md)), hoặc cập nhật docs sang `DELETE`. (Khuyến nghị `POST` vì là hành động đổi trạng thái, không idempotent thuần.)

**Kiểm chứng:** lint/build PASS; docs ↔ code khớp verb.

---

## Phụ lục — Lệnh kiểm chứng nhanh

```bash
# Typecheck backend-core (đã PASS)
cd backend-core && npx tsc --noEmit

# Chạy e2e (cần Postgres test) — XÁC NHẬN trước khi tin "tests pass"
cd backend-core && npm run test:e2e -- admin-ielts

# Smoke test HMAC sau khi fix BUG-01 (mô phỏng chữ ký Python)
node -e 'const c=require("crypto");const b=JSON.stringify({structuredJson:{t:"café – x"}});console.log(c.createHmac("sha256","S").update(b).digest("hex"))'
```

> Sau khi fix, cập nhật trạng thái ở bảng Tổng quan và tick lại checkbox tương ứng trong [`04`](./04-implementation-phases.md).
