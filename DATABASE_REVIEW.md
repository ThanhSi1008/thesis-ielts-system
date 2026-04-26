# Database Schema Review — TOEIC Master AI

> **Phạm vi đánh giá**: Prisma Schema (`backend-core/prisma/schema.prisma`), seed scripts, migration history, và cách sử dụng schema trong service layer.
>
> **Tổng quan**: Schema gồm **42 models**, **7 enums**, **16 migrations**, phục vụ cho một hệ thống luyện thi IELTS/TOEIC đa kỹ năng (Listening, Reading, Writing, Speaking, Vocabulary, Grammar, Pronunciation, Shadowing, Flashcards).

---

## 1. Các vấn đề về chuẩn hóa (Normalization Issues)

### 1.1. Lạm dụng kiểu dữ liệu `Json` cho dữ liệu có cấu trúc

Đây là vấn đề nghiêm trọng nhất của toàn bộ schema. Có ít nhất **14 trường `Json`** lưu trữ dữ liệu mà lẽ ra nên được chuẩn hóa thành các bảng riêng biệt:

| Model | Trường Json | Dữ liệu thực tế bên trong |
|-------|------------|---------------------------|
| `Exam` | `questions` | Toàn bộ cấu trúc câu hỏi, đáp án, options, audio URL — trung tâm nghiệp vụ |
| `ExamSession` | `answers` | Câu trả lời của user cho từng câu hỏi |
| `Result` | `feedback` | Phản hồi AI chi tiết theo từng câu |
| `LearningMaterial` | `content` | Nội dung bài học có cấu trúc |
| `IeltsLesson` | `content`, `quiz` | Lý thuyết và câu hỏi quiz — dữ liệu cốt lõi |
| `IeltsListeningExercise` | `transcript`, `content` | Transcript và nhóm câu hỏi |
| `IeltsReadingExercise` | `passageWithLocations`, `content` | Bài đọc annotated và nhóm câu hỏi |
| `IeltsWritingExercise` | `modelAnswer` | Bài mẫu có cấu trúc (intro, overview, body1, body2) |
| `ShadowingVideo` | `sentences` | Mảng câu với timestamp, phiên âm, dịch thuật |
| `IeltsPracticeListeningPart` | `transcript`, `content` | Transcript và cấu trúc câu hỏi |
| `IeltsPracticeReadingPart` | `passageWithLocations`, `content` | Tương tự |
| `IeltsPracticeSession` | `answers`, `scoreData` | Câu trả lời và điểm chi tiết |

**Hệ quả tiêu cực**:

- **Không thể truy vấn (Query)**: Không thể viết SQL để thống kê "câu hỏi nào có tỷ lệ sai cao nhất", "loại câu hỏi nào user yếu nhất" — những insight cực kỳ quan trọng cho một hệ thống học tập thông minh.
- **Không có ràng buộc toàn vẹn (Referential Integrity)**: Nếu một audio URL trong JSON bị xóa khỏi storage, database hoàn toàn không biết — dẫn đến broken links âm thầm.
- **Khó bảo trì (Migration)**: Khi cấu trúc JSON thay đổi (ví dụ thêm trường `explanation` vào câu hỏi), phải viết script tùy chỉnh để migrate hàng ngàn JSON blobs thay vì chạy `ALTER TABLE`.
- **Phình bộ nhớ (Memory Bloat)**: Mỗi lần load 1 `Exam`, toàn bộ 200 câu hỏi cùng audio URLs được load lên RAM dù chỉ cần hiển thị tiêu đề.

**Khuyến nghị**: Tách `Exam.questions` thành model `Question` riêng biệt với các trường: `examId`, `partNumber`, `questionNumber`, `type` (enum), `prompt`, `options` (Json — chấp nhận ở mức này vì options thực sự không có cấu trúc cố định), `correctAnswer`, `audioUrl`, `imageUrl`. Tương tự cho `ExamSession.answers` → `SessionAnswer(sessionId, questionId, userAnswer)`.

### 1.2. Dữ liệu `IeltsWritingExercise.modelAnswer` nên là các cột riêng

Model `IeltsWritingUserAnswer` lưu bài viết của user với 4 cột rõ ràng (`intro`, `overview`, `body1`, `body2`), nhưng bài mẫu (`modelAnswer`) trong `IeltsWritingExercise` lại được lưu dưới dạng `Json`. Đây là sự **thiếu nhất quán** — cùng một cấu trúc dữ liệu nhưng được mô hình hóa theo 2 cách khác nhau, gây nhầm lẫn khi phát triển.

---

## 2. Các vấn đề về thiết kế quan hệ (Relationship Design)

### 2.1. Phân mảnh mô hình bài tập (Model Fragmentation)

Hệ thống hiện có **3 tầng model** cho cùng một khái niệm "bài tập IELTS":

```
Tầng 1 (Generic):     Exam → ExamSession → Result
Tầng 2 (IELTS Basic): IeltsListeningExercise, IeltsReadingExercise, IeltsWritingExercise
Tầng 3 (IELTS Advanced): IeltsPracticeListeningPart, IeltsPracticeReadingPart
```

Mỗi tầng có cấu trúc câu hỏi, cách lưu điểm, và cách track progress **hoàn toàn khác nhau**. Điều này dẫn đến:

- **Code duplication**: Backend và frontend phải xử lý 3 flow khác nhau cho cùng một chức năng "làm bài + chấm điểm".
- **Không thể thống kê xuyên suốt**: Không có cách nào đơn giản để hiển thị "Tổng hợp kết quả IELTS Reading" vì dữ liệu nằm rải rác ở `Result`, `IeltsBasicProgress`, và `IeltsPracticeReadingSession`.
- **Inconsistent scoring**: `Result.readingScore` là `Int?`, `Result.writingScore` là `Float?`, `IeltsPracticeSession.totalScore` là `Int` — 3 kiểu điểm khác nhau cho cùng hệ thống.

### 2.2. `QuestionNote.examId` thiếu Foreign Key

```prisma
model QuestionNote {
  examId  String   // ← Chỉ là String, KHÔNG có relation tới Exam
  user    User     @relation(...)
}
```

Trường `examId` không có ràng buộc khóa ngoại (`@relation`) tới model `Exam`. Điều này có nghĩa:
- Có thể tạo note cho một exam không tồn tại (orphan data).
- Khi xóa một exam, các note liên quan **không bị xóa theo** (không cascade).
- Database engine không thể tối ưu join queries.

### 2.3. `ShadowingDictationProgress.lessonId` — Polymorphic Association không an toàn

```prisma
model ShadowingDictationProgress {
  lessonId  String  // Có thể là static ID ("toeic-1") HOẶC ShadowingVideo.id
}
```

Một cột duy nhất tham chiếu đến 2 loại entity khác nhau mà không có foreign key. Đây là anti-pattern "Polymorphic Association" — database không thể enforce rằng `lessonId` thực sự tồn tại ở bất kỳ bảng nào.

**Khuyến nghị**: Tách thành 2 cột nullable: `staticLessonId String?` và `videoId String?` (với `@relation` tới `ShadowingVideo`), kèm constraint đảm bảo chính xác 1 trong 2 có giá trị.

### 2.4. `ShadowingVideo.folder` — String thay vì Foreign Key

```prisma
model ShadowingVideo {
  folder  String  @default("All Videos")  // ← Plain string
}

model ShadowingFolder {
  id    String
  name  String
}
```

`ShadowingVideo.folder` lưu tên folder dưới dạng string thay vì tham chiếu tới `ShadowingFolder.id`. Nếu user đổi tên folder, tất cả video trong folder đó **không tự động cập nhật** — dẫn đến video "mồ côi" (orphaned).

### 2.5. `CardType.userId` không có relation

```prisma
model CardType {
  userId  String?  // null = built-in system type — nhưng KHÔNG có @relation
}
```

Không có foreign key tới `User`, nên không thể cascade delete khi user bị xóa, và không thể query `user.cardTypes`.

---

## 3. Các vấn đề về hiệu năng (Performance)

### 3.1. Thiếu hoàn toàn `@@index`

Toàn bộ schema **không có một chỉ mục (index) nào** ngoài các index tự động từ `@id`, `@unique`, và `@@unique`. Các trường thường xuyên được dùng để lọc/sắp xếp nhưng thiếu index:

| Trường | Lý do cần index |
|--------|----------------|
| `ExamSession.userId` | Lấy danh sách phiên thi của user |
| `ExamSession.examId` | Lấy tất cả phiên thi của một đề |
| `ExamSession.status` | Lọc phiên thi theo trạng thái |
| `Result.userId` | Lấy lịch sử kết quả của user |
| `PronunciationAttempt.userId` | Lịch sử phát âm |
| `Flashcard.deckId` | Lấy flashcard trong deck |
| `Flashcard.due` | **Quan trọng nhất** — FSRS scheduler phải query "cards due ≤ now" liên tục |
| `Flashcard.cardState` | Lọc card theo trạng thái |
| `FlashcardReview.flashcardId` | Lịch sử review của card |
| `VocabularyWord.unitId` | Lấy từ vựng trong unit |
| `IeltsBasicProgress.userId` | Progress tracking |
| `ShadowingVideo.userId` | Danh sách video của user |

**Hệ quả**: Với vài trăm user, hệ thống sẽ vẫn hoạt động bình thường nhờ PostgreSQL seq scan. Nhưng khi lên **10,000+ user** với hàng triệu `FlashcardReview` và `PronunciationAttempt`, các query sẽ chậm nghiêm trọng do phải full table scan.

**Khuyến nghị**: Thêm ít nhất các index sau:
```prisma
model Flashcard {
  @@index([deckId])
  @@index([due, cardState])
}

model ExamSession {
  @@index([userId, status])
  @@index([examId])
}

model FlashcardReview {
  @@index([flashcardId, reviewedAt])
}
```

### 3.2. `IeltsBasicProgress` — Unique constraint quá phức tạp

```prisma
@@unique([userId, lessonId, listeningExerciseId, readingExerciseId, writingExerciseId])
```

Constraint unique trên **5 cột nullable** rất khó sử dụng hiệu quả. Trong PostgreSQL, `NULL ≠ NULL` nên unique constraint trên nullable columns có hành vi không trực quan — 2 row với cùng `userId` + `lessonId` nhưng tất cả các cột còn lại là `NULL` sẽ **không vi phạm** constraint, có thể dẫn đến duplicate data.

---

## 4. Các vấn đề về tính nhất quán (Consistency Issues)

### 4.1. Model "zombie" — Tồn tại trong schema nhưng không được sử dụng

Qua kiểm tra cross-reference giữa schema và source code:

| Model | Hiện trạng |
|-------|-----------|
| `Lesson` | Chỉ được dùng trong `learning.service.ts` — **KHÔNG** được seed, **KHÔNG** có data |
| `Vocabulary` | Tương tự — có service nhưng không có data. Bị thay thế bởi `VocabularyWord` |
| `Grammar` | Tương tự — bị thay thế bởi `GrammarUnit` + `GrammarExercise` |
| `LearningMaterial` | Chỉ có 1 service dùng, không có seed data, không có frontend |
| `LearningProgress` | Tương tự |

Hệ thống có **2 hệ thống Vocabulary song song** chồng chéo lên nhau:
- **Cũ**: `Lesson → Vocabulary → PronunciationAttempt` (không có data)
- **Mới**: `VocabularyBook → VocabularyUnit → VocabularyWord` (có data đầy đủ)

Điều này cho thấy quá trình phát triển có sự chuyển đổi mô hình nhưng **chưa dọn dẹp các model cũ**, gây confusion cho developer mới hoặc người đánh giá.

### 4.2. Thiếu nhất quán về timestamp

| Model | `createdAt` | `updatedAt` |
|-------|------------|------------|
| `VocabularyExercise` | ❌ Không có | ❌ Không có |
| `VocabularyQuestion` | ❌ Không có | ❌ Không có |
| `ShadowingFolder` | ❌ Không có | ❌ Không có |
| `IeltsPracticeSession` | ✅ Có | ❌ Không có |
| `IeltsPracticeReadingSession` | ✅ Có | ❌ Không có |
| Tất cả model còn lại | ✅ Có | ✅ Có |

Thiếu `createdAt`/`updatedAt` khiến không thể audit khi data thay đổi, cũng không thể implement tính năng "Recently Modified".

### 4.3. Sử dụng `String` thay vì `Enum` cho các trường có giá trị cố định

| Model | Trường | Giá trị thực tế | Nên dùng |
|-------|--------|-----------------|---------|
| `PronunciationSound` | `type` | "monophthong", "diphthong", "consonant" | `enum SoundType` |
| `GrammarExercise` | `type` | "fill_blank", "match", "multiple_choice", "rewrite" | `enum ExerciseType` |
| `VocabularyQuestion` | `type` | "multiple_choice", "fill_blank" | `enum QuestionType` |
| `GrammarBook` | `level` | "Elementary", "Intermediate", "Advanced" | Tái sử dụng `enum Difficulty` |
| `ShadowingDictationProgress` | `type` | "shadowing", "dictation" | `enum PracticeMode` |
| `ShadowingDictationProgress` | `dictationDifficulty` | "Beginner", "Intermediate", "Advanced", "Expert" | `enum DictationLevel` |
| `StudentTeacherLink` | `status` | "LINKED" | `enum LinkStatus` |
| `CardTypeField` | `fieldType` | "text", "media" | `enum FieldType` |

Sử dụng `String` thay vì `Enum` khiến database không thể validate giá trị đầu vào, dẫn đến nguy cơ **typo data** (ví dụ: "mulitple_choice" thay vì "multiple_choice") mà không bị phát hiện.

---

## 5. Thiếu sót về tính năng (Missing Features)

### 5.1. Thiếu `IeltsSpeakingExercise` cho module IELTS Basic

Hệ thống IELTS Basic có đầy đủ model cho Listening, Reading, Writing nhưng **hoàn toàn thiếu** `IeltsSpeakingExercise`. `IeltsSkill` có seed giá trị "Speaking" nhưng không có bất kỳ model bài tập nào gắn vào.

### 5.2. Thiếu bảng `IeltsPracticeWritingPart` và `IeltsPracticeSpeakingPart`

Module IELTS Advanced có `IeltsPracticeListeningPart` và `IeltsPracticeReadingPart` nhưng thiếu phần Writing và Speaking tương ứng.

### 5.3. Không có cơ chế Soft Delete

Toàn bộ hệ thống sử dụng hard delete. Khi một `Exam` bị xóa, tất cả `ExamSession` và `Result` liên quan bị xóa vĩnh viễn. Trong một hệ thống giáo dục, dữ liệu kết quả và tiến trình học của sinh viên nên được bảo tồn ngay cả khi admin xóa đề thi.

**Khuyến nghị**: Thêm trường `deletedAt DateTime?` vào các model quan trọng (`Exam`, `User`, `Result`) và sử dụng Prisma middleware để tự động lọc soft-deleted records.

### 5.4. Thiếu Audit Trail

Không có bảng `AuditLog` để ghi nhận các hành động quan trọng (ai tạo đề thi, ai sửa câu hỏi, ai xóa user). Đây là yêu cầu cơ bản cho hệ thống có nhiều vai trò (`STUDENT`, `ADMIN`, `INSTRUCTOR`).

---

## 6. Vấn đề bảo mật dữ liệu (Data Security)

### 6.1. Password lưu trữ không có constraint

```prisma
model User {
  password  String  // Không có annotation nào đánh dấu đây là sensitive field
}
```

Mặc dù việc hash password thuộc về application layer, schema nên có comment rõ ràng yêu cầu bcrypt/argon2. Ngoài ra, không có cơ chế nào ngăn Prisma trả về trường `password` trong các query (cần dùng Prisma `omit` hoặc `select` nhất quán).

### 6.2. Hardcoded credentials trong seed data

File `seed.ts` chứa Cloudinary API key và secret dưới dạng plain text:
```typescript
CLOUDINARY_API_KEY=164472782852722
CLOUDINARY_API_SECRET=iCcwSoJcMo3qutisvDD5b3NErY8
```

Đây là rủi ro bảo mật nếu repository là public.

---

## 7. Tổng kết đánh giá

### Ma trận đánh giá tổng quát

| Tiêu chí | Đánh giá | Ghi chú |
|----------|---------|--------|
| Bao phủ nghiệp vụ (Coverage) | ⭐⭐⭐⭐⭐ | Rất đầy đủ — cover 8+ module học tập |
| Chuẩn hóa (Normalization) | ⭐⭐☆☆☆ | Lạm dụng Json, model zombie, duplication |
| Tính toàn vẹn (Integrity) | ⭐⭐⭐☆☆ | Cascade delete tốt, nhưng thiếu FK ở nhiều chỗ |
| Hiệu năng (Performance) | ⭐⭐☆☆☆ | Không có index nào ngoài PK/Unique |
| Tính nhất quán (Consistency) | ⭐⭐☆☆☆ | String vs Enum, timestamp không đồng nhất |
| Bảo mật (Security) | ⭐⭐⭐☆☆ | Password cần chú ý, credentials trong seed |
| Khả năng mở rộng (Scalability) | ⭐⭐⭐☆☆ | Phân mảnh model cản trở mở rộng tính năng |

### Ưu tiên khắc phục (theo mức độ nghiêm trọng)

1. **🔴 Critical**: Thêm `@@index` cho các trường query thường xuyên (đặc biệt `Flashcard.due`, `ExamSession.userId`)
2. **🔴 Critical**: Thêm foreign key cho `QuestionNote.examId` và `CardType.userId`
3. **🟡 Major**: Xóa các model zombie (`Lesson`, `Vocabulary`, `Grammar`, `LearningMaterial`, `LearningProgress`) hoặc ghi chú rõ ràng chúng là deprecated
4. **🟡 Major**: Chuyển các trường `String` có giá trị cố định sang `Enum`
5. **🟡 Major**: Thống nhất timestamp (`createdAt`/`updatedAt`) cho tất cả model
6. **🟢 Minor**: Chuẩn hóa các trường Json quan trọng nhất (`Exam.questions` → `Question` model)
7. **🟢 Minor**: Gộp 3 tầng model bài tập IELTS thành kiến trúc thống nhất
