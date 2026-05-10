# Bug Report: Listening & Reading Không Hiển Thị Nội Dung

**Ngày phân tích**: 2026-05-04  
**Skill bị ảnh hưởng**: Listening, Reading  
**Mức độ**: 🔴 Blocking

---

## 📋 Mô tả vấn đề

Khi user mở một đề thi Listening hoặc Reading trong màn hình Intensive Practice (`/ielts/intensive/[examId]`), nội dung không hiển thị:

- **Listening**: Câu hỏi không hiển thị (màn hình trống hoặc fallback empty), audio player không xuất hiện.
- **Reading**: Passage text trống, câu hỏi không hiển thị trong component `ReadingExamBlock`.

Nguyên nhân gốc rễ là **mismatch giữa tên field trong JSON data (database) và tên field mà UI component đang truy cập**.

---

## 🔍 Data Flow Diagram

### Listening

```
[examId].tsx (ExamPlayerScreen)
  └─ useEffect → loadExam()
       └─ ieltsExamsApi.getExam(examId)          [services/ielts.api.ts L38]
            └─ apiClient.get(`/exams/${id}`)      [services/api-client.ts L101]
                 └─ GET /exams/:id
                      └─ ExamsController.findOne() [exams.controller.ts L69]
                           └─ ExamsService.findOne() [exams.service.ts L357]
                                └─ prisma.exam.findUnique({ where: { id } })
                                     └─ RETURNS: { ..., questions: { parts: [...{ audio_url, question_groups: [...] }] } }
                                        ❌ UI reads: exam.questions.audio_url (wrong level)
                                        ❌ UI reads: part.groups (field tên sai, thực tế là question_groups)
```

**Điểm bị đứt — Listening:**
1. `audio_url` nằm ở `parts[i].audio_url` trong data, nhưng UI đọc `exam?.questions?.audio_url` (level sai)
2. `question_groups` là tên field thực tế, nhưng UI đọc `part.groups || part.content`

### Reading

```
[examId].tsx (ExamPlayerScreen)
  └─ isReading check → render <ReadingExamBlock parts={parts} ... />
       └─ ReadingExamBlock.tsx
            └─ currentPart?.passage       ← ❌ EMPTY (data field là passage_text)
            └─ currentPart?.groups        ← ❌ EMPTY (data field là question_groups)
            └─ currentPart?.content       ← ❌ EMPTY (fallback, cũng không đúng)
```

**Điểm bị đứt — Reading:**
1. `passage_text` là tên field thực tế, nhưng UI đọc `currentPart?.passage`
2. `question_groups` là tên field thực tế, nhưng UI đọc `currentPart?.groups || currentPart?.content`

---

## 🐛 Root Cause Analysis

### Root Cause #1 — Listening: `audio_url` ở sai level

- **File**: `frontend-mobile/app/ielts/intensive/[examId].tsx` dòng **358**
- **Code bị lỗi**:
```typescript
const audioUrl = exam?.questions?.audio_url;
```
- **Nguyên nhân**: Data structure thực tế của Listening exam có `audio_url` ở cấp **part**, không phải cấp `questions`:
```json
{
  "questions": {
    "parts": [
      {
        "part_number": 1,
        "audio_url": "https://res.cloudinary.com/.../audio1.mp3",  // ← đúng vị trí
        "question_groups": [...]
      }
    ]
  }
}
```
- **Tác động**: `audioUrl` luôn là `undefined` → Audio player bar không hiển thị (`{audioUrl && <View...>}` tại dòng 503) → User không nghe được audio.

---

### Root Cause #2 — Listening & Reading: Field name mismatch `groups` vs `question_groups`

- **File 1**: `frontend-mobile/app/ielts/intensive/[examId].tsx` dòng **338** và **565**
- **File 2**: `frontend-mobile/components/ielts/ReadingExamBlock.tsx` dòng **155**

- **Code bị lỗi — [examId].tsx dòng 338** (dùng cho scrollToQuestion):
```typescript
const groups = parts[pi].groups || parts[pi].content || [];
```

- **Code bị lỗi — [examId].tsx dòng 565** (Listening render):
```typescript
const groups = part.groups || part.content || [];
```

- **Code bị lỗi — ReadingExamBlock.tsx dòng 155** (Reading render):
```typescript
{(currentPart?.groups || currentPart?.content || []).map((g: any, gi: number) => 
  renderGroup(g, answers, onChange, gi, activePartIdx)
)}
```

- **Data thực tế** (từ `backend-core/prisma/data/mock-tests.ts`): Tất cả 29 bộ exam data đều dùng `question_groups`:
```json
{
  "part_number": 1,
  "question_groups": [
    { "instructions": "...", "question_type": "Note Completion", "content": [...] }
  ]
}
```

- **Nguyên nhân**: UI fallback `part.groups || part.content` đều trả về `undefined` → array rỗng `[]` → không có gì để render.
- **Tác động**: Toàn bộ câu hỏi không hiển thị cho cả Listening lẫn Reading.

---

### Root Cause #3 — Reading: Field name mismatch `passage` vs `passage_text`

- **File**: `frontend-mobile/app/ielts/intensive/[examId].tsx` dòng **577–580**  
  và `frontend-mobile/components/ielts/ReadingExamBlock.tsx` dòng **137**

- **Code bị lỗi — [examId].tsx dòng 577**:
```typescript
{part.passage && (
  <ScrollView style={styles.passageBox} nestedScrollEnabled>
    <Text style={styles.passageText}>{part.passage}</Text>
  </ScrollView>
)}
```

- **Code bị lỗi — ReadingExamBlock.tsx dòng 137**:
```typescript
<HighlightablePassage text={currentPart?.passage || 'No passage text provided.'} />
```

- **Data thực tế**: Field tên là `passage_text`, không phải `passage`:
```json
{
  "part_number": 1,
  "passage_text": "**The development of the London underground railway**\n...",
  "question_groups": [...]
}
```

- **Nguyên nhân**: `currentPart?.passage` luôn `undefined` → fallback `'No passage text provided.'` hiển thị thay cho nội dung thật.
- **Tác động**: Toàn bộ nội dung bài đọc không hiển thị trong Reading exam.

---

### Root Cause #4 — Listening exam không được seed

- **File**: `backend-core/prisma/seed.ts` dòng **241–261**
- **Code**:
```typescript
// IELTS exams
console.log("🧪 Seeding Cambridge IELTS exams...");
await upsertCambridgeExam({
  title: "Cambridge IELTS 17 - Reading Test 1",
  type: "READING",
  questions: cambridgeIelts17ReadingTest1Questions,
  // ...
});
// ← Không có bất kỳ Listening exam nào được seed!
```

- **Nguyên nhân**: Dù data cho `cambridgeIelts17ListeningTest1Questions` đến `Test4` và `cambridgeIelts13ListeningTest1Questions` được **import** vào seed file, chúng không được `upsertCambridgeExam()` gọi.
- **Tác động**: Catalog Listening có thể trống hoặc chỉ có exam từ lần seed thủ công trước — những exam này có thể có `questions` structure không chuẩn.

---

## 📊 So sánh Listening vs Reading

| Vấn đề | Listening | Reading |
|--------|-----------|---------|
| `audio_url` sai level | ✅ Có | N/A |
| `groups` vs `question_groups` mismatch | ✅ Có | ✅ Có |
| `passage` vs `passage_text` mismatch | N/A | ✅ Có |
| Exam không được seed | ✅ Có (nghiêm trọng hơn) | ❌ (Reading Test 1 được seed) |
| Chia sẻ cùng root cause | ✅ Root Cause #2 chung | ✅ Root Cause #2 chung |

---

## 🔧 Hướng fix đề xuất

### Fix #1 — Sửa `audio_url` level (Listening)

**File cần sửa**: `frontend-mobile/app/ielts/intensive/[examId].tsx`  
**Thay đổi cần làm**:
- Xóa dòng `const audioUrl = exam?.questions?.audio_url;` (dòng 358)
- Thêm logic lấy `audio_url` từ part đang active, hoặc nếu muốn một URL duy nhất thì lấy từ part đầu tiên: `exam?.questions?.parts?.[0]?.audio_url`
- Nếu cần audio per-part thì cần thêm state `activePartIndex` và lấy `parts[activePartIndex].audio_url` thay đổi theo part

### Fix #2 — Sửa `groups` → `question_groups` (Listening & Reading)

**Files cần sửa**:
1. `frontend-mobile/app/ielts/intensive/[examId].tsx` — dòng 338 và 565
2. `frontend-mobile/components/ielts/ReadingExamBlock.tsx` — dòng 155

**Thay đổi cần làm**:
- Thay `part.groups || part.content || []` thành `part.question_groups || part.groups || part.content || []`
- Ưu tiên `question_groups` trước để match với data thực tế, giữ fallback để backward compatible

### Fix #3 — Sửa `passage` → `passage_text` (Reading)

**Files cần sửa**:
1. `frontend-mobile/app/ielts/intensive/[examId].tsx` — dòng 577
2. `frontend-mobile/components/ielts/ReadingExamBlock.tsx` — dòng 137

**Thay đổi cần làm**:
- Thay `part.passage` thành `part.passage_text || part.passage`
- Thay `currentPart?.passage` thành `currentPart?.passage_text || currentPart?.passage`
- Giữ fallback `|| 'No passage text provided.'` để xử lý edge case

### Fix #4 — Seed Listening exams (Backend)

**File cần sửa**: `backend-core/prisma/seed.ts`  
**Thay đổi cần làm**:
- Thêm các lệnh gọi `upsertCambridgeExam()` cho tất cả Listening tests đã được import:
  - `cambridgeIelts17ListeningTest1Questions` → `"Cambridge IELTS 17 - Listening Test 1"`, type `"LISTENING"`
  - `cambridgeIelts17ListeningTest2Questions` → tương tự Test 2, 3, 4
  - `cambridgeIelts13ListeningTest1Questions` → `"Cambridge IELTS 13 - Listening Test 1"`
- Đảm bảo `isPublished: true` và `difficulty: "ADVANCED"`
- Chạy lại `npx prisma db seed` sau khi sửa

---

## ✅ Checklist sau khi fix

- [ ] Listening hiển thị đúng câu hỏi theo từng part
- [ ] Audio player Listening xuất hiện và play được audio per-part
- [ ] Reading hiển thị đúng passage text (HighlightablePassage)
- [ ] Reading hiển thị đúng câu hỏi trong cả hai pane
- [ ] Loading state hiển thị đúng (`ActivityIndicator` khi `loading = true`)
- [ ] Error state hiển thị đúng (khi `exam = null` sau khi load)
- [ ] Listening exam catalog không trống sau khi re-seed
- [ ] Không ảnh hưởng các skill khác (Writing, Speaking)
- [ ] `scrollToQuestion()` hoạt động đúng sau khi fix groups traversal

---

## 📎 Files liên quan

### Frontend Mobile
| File | Vai trò | Vấn đề |
|------|---------|--------|
| `frontend-mobile/app/ielts/intensive/[examId].tsx` | Main exam player screen | Root Cause #1, #2, #3 |
| `frontend-mobile/components/ielts/ReadingExamBlock.tsx` | Reading split-view component | Root Cause #2, #3 |
| `frontend-mobile/services/ielts.api.ts` | API client wrapper | OK — không có lỗi |
| `frontend-mobile/services/api-client.ts` | Base HTTP client | OK — không có lỗi |

### Backend Core
| File | Vai trò | Vấn đề |
|------|---------|--------|
| `backend-core/src/modules/exams/exams.controller.ts` | REST controller | OK — `GET /exams/:id` đúng |
| `backend-core/src/modules/exams/exams.service.ts` | Business logic | OK — `findOne()` trả raw data đúng |
| `backend-core/prisma/seed.ts` | Database seeder | Root Cause #4 — Listening không được seed |
| `backend-core/prisma/data/mock-tests.ts` | Raw exam data (6759 dòng) | Nguồn truth — dùng `question_groups`, `passage_text`, `audio_url` per-part |

---

## 🗺️ Field Name Reference (Source of Truth)

Dựa trên `backend-core/prisma/data/mock-tests.ts`:

### Reading Part structure
```typescript
{
  part_number: number,           // ✅ UI dùng đúng
  part_type: string,
  topic: string,
  passage_text: string,          // ❌ UI đọc là "passage" (SAI)
  questions: string,             // range string "1-13"
  question_groups: [             // ❌ UI đọc là "groups" hoặc "content" (SAI)
    {
      questions: string,
      instructions: string,
      question_type: string,
      content: [...],            // items bên trong group
      items: [...]               // hoặc items
    }
  ]
}
```

### Listening Part structure
```typescript
{
  part_number: number,           // ✅ UI dùng đúng
  part_type: string,
  audio_url: string,             // ❌ UI đọc ở sai level (SAI)
  questions: string,
  topic: string,
  transcript: [...],
  question_groups: [             // ❌ UI đọc là "groups" (SAI)
    {
      questions: string,
      instructions: string,
      question_type: string,
      items: [...]
    }
  ]
}
```
