# Web-to-Mobile Mapping Guide — IELTS Master AI

> Đảm bảo nhất quán 100% giữa Web (Next.js) và Mobile (Expo SDK 52) | 2026-04-26

---

## 1. Data Model Mapping

### 1.1. Core TypeScript Interfaces (từ Prisma Schema)

> **Lưu ý quan trọng:** Backend sử dụng thuật toán **FSRS** (Free Spaced Repetition Scheduler) qua thư viện `ts-fsrs`, **KHÔNG phải SM-2** như mô tả trong tài liệu cũ. Mobile cần đồng bộ đúng rating scale (1-4) và các trường FSRS.

#### Chiến lược đồng bộ Types giữa Web và Mobile

Thay vì copy/paste thủ công các file Type từ Web sang Mobile (dễ gây lỗi out-of-sync), dự án sẽ thiết lập một **package `@shared/types`** trong kiến trúc Monorepo (Turborepo). Package này trích xuất các DTOs và Interfaces trực tiếp từ Prisma Schema của Backend Core (NestJS), sau đó cả thư mục Next.js (Web) và Expo (Mobile) đều import chung package này.

**Cấu trúc Monorepo đề xuất:**

```
thesis-toeic-system/
├── packages/
│   └── shared-types/             # @shared/types package
│       ├── src/
│       │   ├── auth.types.ts      # User, AuthResponse, LoginRequest
│       │   ├── exam.types.ts      # Exam, ExamSession, Result, ExamQuestion
│       │   ├── vocabulary.types.ts
│       │   ├── grammar.types.ts
│       │   ├── pronunciation.types.ts
│       │   ├── vocab-lab.types.ts  # Deck, Flashcard, CardState, SubmitReviewDto
│       │   ├── shadowing.types.ts
│       │   ├── ielts.types.ts
│       │   ├── api.types.ts       # ApiErrorResponse, PaginatedResponse<T>
│       │   └── index.ts           # Barrel re-exports
│       ├── package.json           # { "name": "@shared/types" }
│       └── tsconfig.json
├── frontend-web/                  # import { User } from '@shared/types'
├── frontend-mobile/               # import { User } from '@shared/types'
├── backend-core/                  # Source of truth (Prisma Schema + DTOs)
├── turbo.json
```

**Lợi ích:**
- **Single Source of Truth**: Mọi thay đổi types chỉ cần sửa 1 nơi (`@shared/types`), cả Web và Mobile tự động nhận
- **Type Safety**: TypeScript compiler phát hiện lỗi mismatch ngay lập tức khi build
- **Không out-of-sync**: Loại bỏ hoàn toàn rủi ro copy/paste sai giữa các project

**Phương án thay thế (nếu chưa chuyển sang Monorepo):** Sử dụng **Git Submodule** chứa thư mục `shared-types/`, cả Web và Mobile mount submodule này vào `src/types/` của mình.

#### User & Auth

```typescript
// Đồng bộ giữa Web và Mobile
interface User {
  id: string;          // UUID
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  isActive: boolean;
  createdAt: string;   // ISO 8601
}

interface AuthResponse {
  access_token: string;
  refresh_token?: string;  // ⚠️ Backend chưa implement
  user: User;
}
```

#### Exam & Results (⚠️ JSON phức tạp)

```typescript
type ExamType = 'FULL_TEST' | 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING' | 'PRACTICE';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'GRADED' | 'COMPLETED' | 'ABANDONED' | 'GRADING_FAILED';

interface Exam {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  duration: number;        // phút
  type: ExamType;
  difficulty: Difficulty;
  isPublished: boolean;
  questions: ExamQuestion[];  // ⚠️ JSON — có thể rất lớn
}

interface ExamSession {
  id: string;
  userId: string;
  examId: string;
  status: SessionStatus;
  answers: Record<string, any>;  // ⚠️ JSON
  timeTaken?: number;            // giây
  practicePart?: number;
  startedAt: string;
  submittedAt?: string;
}

interface Result {
  id: string;
  totalScore: number;
  readingScore?: number;
  listeningScore?: number;
  speakingScore?: number;    // Float
  writingScore?: number;     // Float
  feedback?: AIFeedback;     // ⚠️ JSON — phản hồi AI lồng nhau
}
```

#### Vocabulary & Grammar

```typescript
interface VocabularyBook {
  id: string;
  name: string;
  imageUrl: string;
  wordCount: number;
  order: number;
}

interface VocabularyUnit {
  id: string;
  bookId: string;
  title: string;
  order: number;
  storyTitle?: string;
  storyContent?: string;      // ⚠️ Text dài — cần ScrollView
  storyImageUrl?: string;
}

interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;          // URL MinIO
  order: number;
}

interface VocabularyExercise {
  id: string;
  question: string;
  answer: string;
  options: string[];           // ⚠️ JSON array
  order: number;
}

interface GrammarBook {
  id: string;
  slug: string;
  name: string;
  author: string;
  level: string;
  imageUrl: string;
  color: string;               // Hex — dùng làm header color
  unitCount: number;
}

interface GrammarUnit {
  id: string;
  title: string;
  order: number;
  theoryContent?: string;      // ⚠️ HTML/Markdown — cần renderer
}

interface GrammarExercise {
  id: string;
  section: string;
  question: string;            // Text dài
  type: 'fill_blank' | 'match' | 'multiple_choice' | 'rewrite';
  options?: any;               // ⚠️ JSON — tùy type
  answer: string;
  order: number;
}
```

#### Vocab Lab — FSRS Flashcards

```typescript
type CardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;                // Text dài
  tags: string[];
  // FSRS fields — Mobile KHÔNG tự tính, gọi API
  due: string;                 // ISO DateTime
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  nextReviewDate: string;
  cardState: CardState;
  // Custom card type
  cardTypeId?: string;
  fieldValues: Record<string, string>;  // ⚠️ JSON
  fieldStyles?: Record<string, any>;    // ⚠️ JSON
  cardStyle?: Record<string, any>;      // ⚠️ JSON
}

interface Deck {
  id: string;
  name: string;
  createdAt: string;
  // Computed by backend
  newCount: number;
  learningCount: number;
  dueCount: number;
  totalCards: number;
}

// FSRS Rating Scale (1-4, KHÔNG phải SM-2 0-5)
interface SubmitReviewDto {
  flashcardId: string;
  rating: 1 | 2 | 3 | 4;  // 1=Again, 2=Hard, 3=Good, 4=Easy
}
```

#### Shadowing & Dictation

```typescript
interface ShadowingVideo {
  id: string;
  title: string;
  youtubeVideoId: string;
  folder: string;
  category: string;
  duration: string;
  sentences: ShadowingSentence[];  // ⚠️ JSON array lớn
}

interface ShadowingSentence {
  id: number;
  english: string;
  vietnamese: string;
  phonetic: string;
  words: string[];
  audioStart: number;    // giây
  audioEnd: number;
}

interface ShadowingProgress {
  lessonId: string;
  type: 'shadowing' | 'dictation';
  completedSentences: number[];    // ⚠️ Array of indices
  dictationDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}
```

#### Pronunciation

```typescript
type PronunciationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface PronunciationSound {
  id: string;
  symbol: string;
  type: 'monophthong' | 'diphthong' | 'consonant';
  word: string;
  description?: string;
  imageUrl?: string;
  audioUrl?: string;
  voiced?: boolean;
  order: number;
}

interface PronunciationAttempt {
  id: string;
  audioUrl: string;
  transcribedText?: string;
  targetWord: string;
  score?: number;              // 0-100
  feedback?: Record<string, any>;  // ⚠️ JSON
  status: PronunciationStatus;
}
```

### 1.2. Bảng JSON Fields Cần Lưu Ý

| Model | Field | Kiểu dữ liệu thực tế | Chiến lược Mobile |
|:---|:---|:---|:---|
| `Exam` | `questions` | Array lồng nhiều cấp (sections → questions → options) | **FlashList** + lazy render, phân trang nếu >50 câu |
| `ExamSession` | `answers` | `Record<string, any>` | Lưu tạm local (Zustand), submit 1 lần |
| `Result` | `feedback` | Object lồng (AI feedback per skill) | Parse cẩn thận, hiển thị từng section |
| `GrammarUnit` | `theoryContent` | HTML/Markdown dài | `react-native-render-html` hoặc `WebView` |
| `ShadowingVideo` | `sentences` | Array 20-100+ objects với timing | Memoize, chỉ render visible items |
| `Flashcard` | `fieldValues`, `fieldStyles` | Dynamic key-value | Map theo `CardType.fields` order |
| `IeltsLesson` | `content`, `quiz` | Array of content blocks | Custom renderer theo block type |
| `IeltsListeningExercise` | `transcript`, `content` | Nested arrays with question groups | Flatten trước khi render |

---

## 2. UI/UX Consistency

> **Tài liệu cốt lõi:** Vui lòng xem thêm [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) để biết chi tiết toàn bộ Phong cách, Typography, Animation, và Patterns được trích xuất từ `frontend-web`.

### 2.1. Bảng Màu — Quyết Định Chốt Hạ

> **Quyết định:** Mobile App sẽ **kế thừa 100% bộ màu (Brand Colors) của Web App**. Các mã màu cũ không khớp trên Mobile sẽ bị xóa bỏ và thay thế hoàn toàn bằng hệ thống màu của Web.

**Bảng màu chính thức (áp dụng cho cả Web và Mobile):**

| Token | Mã màu | Nguồn | Ghi chú |
|:---|:---|:---|:---|
| **Primary** | `#FFC600` | Web `tailwind.config.ts` | ~~Mobile cũ: `#3B82F6`~~ → **Đã xóa** |
| **Secondary** | `#EDEDED` | Web `tailwind.config.ts` | ~~Mobile cũ: `#10B981`~~ → **Đã xóa** |
| **Success** | `#4CAF50` | Đồng nhất | ✅ Giữ nguyên |
| **Danger/Error** | `#F44336` | Web `tailwind.config.ts` | ~~Mobile cũ: `#EF4444`~~ → Thống nhất theo Web |
| **Info** | `#2196F3` | Web `tailwind.config.ts` | ~~Mobile cũ: `#0DCAF0`~~ → Thống nhất theo Web |
| **Warning** | `#FF9800` | Web `tailwind.config.ts` | ~~Mobile cũ: `#FFC107`~~ → Thống nhất theo Web |
| **Dark/Text** | `#212529` | Đồng nhất | ✅ Giữ nguyên |
| **Light/Surface** | `#f8f9fa` | Đồng nhất | ✅ Giữ nguyên |

#### Brand Colors theo Feature Level (đồng nhất Web và Mobile)

| Level | Màu | Feature | Hex |
|:---|:---|:---|:---|
| Level 1 | 🟡 Yellow | Vocabulary | `#FFC600` |
| Level 2 | 🟢 Green | Grammar | `#5B9557` |
| Level 3 | 🔴 Red | Advanced | `#E74C3C` |
| Level 4 | 🔵 Blue | Mastery | `#3B82F6` |

> **Triển khai:** Toàn bộ bảng màu này sẽ được định nghĩa trong file `tailwind.config.ts` dùng chung. Khi Mobile dùng NativeWind, nó tự động kế thừa toàn bộ palette này mà không cần khai báo lại trong `constants/index.ts`.

### 2.2. Typography

| Property | Web | Mobile | Đề xuất Mobile |
|:---|:---|:---|:---|
| Font Family | `Farro`, system-ui | System default | Giữ system default (tốt cho hiệu suất) |
| Body | `16px` (Tailwind base) | `FONT_SIZES.md = 16` | ✅ Khớp |
| Small | `14px` (`text-sm`) | `FONT_SIZES.sm = 14` | ✅ Khớp |
| Large | `18px` (`text-lg`) | `FONT_SIZES.lg = 18` | ✅ Khớp |
| Heading | `24px` (`text-2xl`) | `FONT_SIZES.xxl = 24` | ✅ Khớp |

### 2.3. Tailwind → NativeWind Chuyển Đổi

> **Khẳng định:** Mobile App sử dụng **NativeWind** (Tailwind CSS for React Native) làm giải pháp styling chính thức, cho phép tái sử dụng gần như 100% tư duy Tailwind utility classes từ dự án Web (Next.js).

#### Layout & Spacing

| Tailwind (Web) | NativeWind (Mobile) | StyleSheet equivalent |
|:---|:---|:---|
| `flex flex-row` | `className="flex flex-row"` | `{ flexDirection: 'row' }` |
| `items-center justify-between` | `className="items-center justify-between"` | `{ alignItems: 'center', justifyContent: 'space-between' }` |
| `p-4` | `className="p-4"` | `{ padding: 16 }` |
| `mx-auto` | Không hỗ trợ | `{ marginHorizontal: 'auto' }` hoặc `alignSelf: 'center'` |
| `gap-4` | `className="gap-4"` | `{ gap: 16 }` |
| `w-full` | `className="w-full"` | `{ width: '100%' }` |
| `hidden md:block` | Không có breakpoint | Dùng `useWindowDimensions()` |

#### Colors & Typography

| Tailwind (Web) | NativeWind (Mobile) | Ghi chú |
|:---|:---|:---|
| `bg-primary` | `className="bg-[#FFC600]"` | Cần config NativeWind theme |
| `text-dark` | `className="text-[#212529]"` | Hoặc dùng COLORS.text |
| `text-sm font-semibold` | `className="text-sm font-semibold"` | ✅ Tương thích |
| `rounded-lg` | `className="rounded-lg"` | ✅ Tương thích |
| `shadow-md` | `className="shadow-md"` | ⚠️ Shadow khác trên Android/iOS |
| `hover:bg-gray-100` | Không có hover | Dùng `Pressable` + `onPressIn/Out` |

#### Các class KHÔNG tương thích trực tiếp

| Tailwind (Web only) | Giải pháp Mobile |
|:---|:---|
| `hover:*`, `focus:*` | `Pressable` component + state styles |
| `transition-all`, `duration-300` | `Animated` API hoặc `react-native-reanimated` |
| `grid grid-cols-2` | `FlatList numColumns={2}` hoặc `flexWrap: 'wrap'` |
| `prose` (typography plugin) | `react-native-render-html` |
| `overflow-auto` | `ScrollView` hoặc `FlatList` |
| `backdrop-blur` | `expo-blur` (BlurView) |

---

## 3. Logic Consistency

### 3.1. Vocab Lab — Luồng FSRS (Không phải SM-2)

> **Phát hiện quan trọng:** Backend sử dụng `ts-fsrs` (file `vocab-lab.service.ts` dòng 9), KHÔNG phải SM-2. FSRS dùng rating 1-4, còn SM-2 dùng 0-5. Mobile **PHẢI** gọi API backend để tính scheduling, KHÔNG tự tính trên device.

**Cấu hình FSRS trên backend:**
```typescript
// backend-core/src/modules/vocab-lab/vocab-lab.service.ts
const f = fsrs({
  request_retention: 0.9,  // Tỷ lệ nhớ mục tiêu 90%
  maximum_interval: 365,   // Tối đa 365 ngày giữa các lần ôn
});
```

**Rating Scale (FSRS):**

| Rating | Giá trị | Ý nghĩa | Nút UI đề xuất |
|:---|:---|:---|:---|
| Again | `1` | Quên hoàn toàn | 🔴 "Quên" |
| Hard | `2` | Nhớ nhưng khó | 🟠 "Khó" |
| Good | `3` | Nhớ bình thường | 🟢 "Tốt" |
| Easy | `4` | Nhớ dễ dàng | 🔵 "Dễ" |

**Luồng dữ liệu đầy đủ:**

```
┌─────────────────────────────────────────────────────────────┐
│ MOBILE APP                                                   │
│                                                               │
│  1. GET /vocab-lab/study/:deckId                             │
│     ← Nhận danh sách cards cần học (NEW + due LEARNING/REVIEW)│
│                                                               │
│  2. Hiển thị card → User đánh giá (1/2/3/4)                 │
│                                                               │
│  3. POST /vocab-lab/review                                   │
│     → { flashcardId, rating: 1|2|3|4 }                      │
│     ← Card đã cập nhật (due, stability, difficulty, state)  │
│                                                               │
│  4. Hiển thị card tiếp theo từ danh sách                     │
│     Khi hết cards → Hiển thị thống kê session                │
│                                                               │
│  5. GET /vocab-lab/stats                                     │
│     ← { newCount, learningCount, reviewCount, totalCount }   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (NestJS) — vocab-lab.service.ts                      │
│                                                               │
│  submitReview():                                             │
│    1. Load card from DB                                      │
│    2. Convert to FSRS Card object                            │
│    3. f.next(fsrsCard, now, rating)  ← ts-fsrs tính toán    │
│    4. Update: due, stability, difficulty, elapsed_days,      │
│       scheduled_days, reps, lapses, cardState                │
│    5. Create FlashcardReview log                             │
│    6. Return updated card                                    │
└─────────────────────────────────────────────────────────────┘
```

**Mobile implementation pattern:**

```typescript
// features/vocab-lab/hooks/useStudySession.ts
export function useStudySession(deckId: string) {
  const studyCards = useQuery({
    queryKey: ['vocab-lab', 'study', deckId],
    queryFn: () => apiClient.get(`/vocab-lab/study/${deckId}`),
  });

  const reviewMutation = useMutation({
    mutationFn: (dto: { flashcardId: string; rating: 1|2|3|4 }) =>
      apiClient.post('/vocab-lab/review', dto),
    onSuccess: () => {
      // Invalidate deck stats
      queryClient.invalidateQueries({ queryKey: ['vocab-lab', 'decks'] });
    },
  });

  return { studyCards, reviewMutation };
}
```

### 3.2. Audio Processing — Pronunciation & Speaking Grading

> Luồng xử lý bất đồng bộ qua RabbitMQ. Mobile cần polling để lấy kết quả.

**Luồng Pronunciation (Whisper AI):**

```
┌──────────────┐      ┌─────────────┐      ┌──────────┐      ┌───────────┐
│  Mobile App  │      │  NestJS     │      │ RabbitMQ │      │ FastAPI   │
│              │      │  (port 3000)│      │          │      │ (port 8000)│
└──────┬───────┘      └──────┬──────┘      └────┬─────┘      └─────┬─────┘
       │                     │                   │                  │
       │  1. Record audio    │                   │                  │
       │     (expo-av)       │                   │                  │
       │                     │                   │                  │
       │  2. POST /exams/    │                   │                  │
       │  audio/upload       │                   │                  │
       │  (FormData)         │                   │                  │
       │ ──────────────────> │                   │                  │
       │                     │  3. Store in      │                  │
       │                     │     MinIO         │                  │
       │                     │  4. Create        │                  │
       │                     │     Attempt       │                  │
       │                     │     (PENDING)     │                  │
       │  ← { attemptId }   │                   │                  │
       │                     │  5. Publish msg   │                  │
       │                     │ ────────────────> │                  │
       │                     │  (pronunciation-  │  6. Consume      │
       │                     │   check-queue)    │ ───────────────> │
       │                     │                   │                  │  7. Download
       │                     │                   │                  │     from MinIO
       │                     │                   │                  │  8. Whisper
       │                     │                   │                  │     transcribe
       │                     │                   │                  │  9. Calculate
       │                     │                   │                  │     score
       │                     │                   │                  │  10. UPDATE DB
       │                     │                   │                  │      (COMPLETED)
       │  11. Poll:          │                   │                  │
       │  GET /pronunciation/│                   │                  │
       │  attempts/:id       │                   │                  │
       │ ──────────────────> │                   │                  │
       │  ← { status:       │                   │                  │
       │    COMPLETED,       │                   │                  │
       │    score: 85 }      │                   │                  │
```

**Mobile implementation pattern:**

```typescript
// features/pronunciation/hooks/useAttemptResult.ts
export function useAttemptResult(attemptId: string | null) {
  return useQuery({
    queryKey: ['pronunciation', 'attempt', attemptId],
    queryFn: () => apiClient.get(`/pronunciation/attempts/${attemptId}`),
    enabled: !!attemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'COMPLETED' || status === 'FAILED') ? false : 2000;
    },
  });
}
```

**Luồng Exam Grading (Writing/Speaking → Gemini AI):**

Quy trình tương tự nhưng qua `exam-grading-queue`:
1. Mobile: `POST /exams/sessions/:sessionId/submit` → `{ answers, timeTaken }`
2. NestJS: Tạo session (status: `SUBMITTED` → `GRADING`), publish lên RabbitMQ
3. FastAPI: Consume, gọi Gemini API, tính band score, update `Result` table
4. Mobile: Poll `GET /exams/sessions/:sessionId` cho đến khi `status === 'COMPLETED'`

---

## 4. API Communication Standards

### 4.1. Authentication Headers

```typescript
// Mọi request từ Mobile phải gửi:
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,  // JWT từ POST /auth/login
};

// Upload file (FormData):
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  // KHÔNG set Content-Type — browser/RN tự set multipart/form-data + boundary
};
```

**JWT Payload (decode từ access_token):**

```typescript
interface JwtPayload {
  sub: string;       // userId (UUID)
  email: string;
  role: UserRole;
  iat: number;       // issued at (Unix timestamp)
  exp: number;       // expires at (Unix timestamp)
}
```

### 4.2. Error Response Format

Backend NestJS sử dụng `ValidationPipe` với format lỗi chuẩn:

```typescript
// Error responses từ NestJS
interface NestErrorResponse {
  statusCode: number;
  message: string | string[];   // Có thể là array khi validation error
  error?: string;               // "Bad Request", "Unauthorized", etc.
}

// Ví dụ validation error (400):
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request"
}

// Ví dụ auth error (401):
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// Ví dụ not found (404):
{
  "statusCode": 404,
  "message": "Deck not found"
}

// Ví dụ forbidden (403):
{
  "statusCode": 403,
  "message": "Not yours"
}
```

**Mobile Error Handler mẫu:**

```typescript
// core/api/error-handler.ts
export function parseApiError(error: unknown): string {
  if (error instanceof Response) {
    const body = await error.json();
    if (Array.isArray(body.message)) return body.message.join(', ');
    return body.message || `Error ${body.statusCode}`;
  }
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi không xác định';
}
```

### 4.3. HTTP Status Codes Cần Xử Lý

| Code | Ý nghĩa | Mobile Action |
|:---|:---|:---|
| `200` | OK | Xử lý response bình thường |
| `201` | Created | Tạo resource thành công |
| `400` | Bad Request | Hiển thị validation errors cho user |
| `401` | Unauthorized | Thử refresh token → nếu fail → logout |
| `403` | Forbidden | Hiển thị "Không có quyền truy cập" |
| `404` | Not Found | Hiển thị "Không tìm thấy", navigate back |
| `409` | Conflict | Email đã tồn tại (register) |
| `500` | Server Error | Hiển thị "Lỗi hệ thống, thử lại sau" |

### 4.4. Pagination (Đề xuất chuẩn hóa)

> ⚠️ Backend hiện tại **CHƯA** implement pagination chuẩn cho hầu hết endpoints. Cần phối hợp backend team.

**Format đề xuất:**

```typescript
// Request
GET /api/v1/exams?page=1&limit=20&sort=createdAt&order=desc

// Response
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### 4.5. API Base URL Configuration

| Môi trường | Web | Mobile |
|:---|:---|:---|
| Development | `http://localhost:3000/api/v1` | `http://<LAN_IP>:3000/api/v1` |
| Staging | `https://staging-api.domain.com/api/v1` | Tương tự |
| Production | `https://api.domain.com/api/v1` | Tương tự |

> **Mobile lưu ý:** Không dùng `localhost` — Expo Go chạy trên device thật cần LAN IP. Cấu hình qua `EXPO_PUBLIC_API_URL` trong `.env`.

### 4.6. CORS

Backend hiện config CORS origin qua env `CORS_ORIGIN` (dạng comma-separated). Mobile cần đảm bảo origin được whitelist hoặc backend set `origin: '*'` cho dev.

---

## Phụ Lục: Checklist Đồng Bộ Web-Mobile

- [ ] Thiết lập package `@shared/types` (Monorepo/Turborepo hoặc Git Submodule) để đồng bộ TypeScript interfaces
- [ ] Xóa toàn bộ mã màu cũ trong `constants/index.ts` của Mobile, thay bằng bảng màu Web
- [ ] **Copy toàn bộ cấu hình từ `tailwind.config.ts` của Next.js sang `tailwind.config.js` của Expo** để đảm bảo hệ thống Design Tokens (màu sắc, khoảng cách, font chữ) đồng nhất tuyệt đối
- [ ] Cài đặt và cấu hình NativeWind v4 + Babel plugin cho Expo project
- [ ] Đảm bảo Mobile dùng FSRS rating scale (1-4), KHÔNG dùng SM-2 (0-5)
- [ ] Implement error handler parse `message: string | string[]`
- [ ] Phối hợp backend implement `POST /auth/refresh`
- [ ] Phối hợp backend chuẩn hóa pagination format

---

*Tài liệu được tạo từ phân tích trực tiếp: `schema.prisma` (891 dòng), `tailwind.config.ts`, `constants/index.ts`, `vocab-lab.service.ts` (ts-fsrs), và toàn bộ service layer của cả Web và Mobile.*
