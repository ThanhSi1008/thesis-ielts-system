# Technical Specification & Architectural Patterns Blueprint — Phase 1

> IELTS Master AI — Mobile App (Expo SDK 52)
> Ngày soạn: 2026-04-26 | Tác giả: Tech Lead

---

## 1. Đề Xuất Architectural Patterns

### 1.1. Architectural Pattern: Feature-First Modular

Áp dụng **Architectural Pattern Feature-First** kết hợp **Shared Core Layer**. Đây không đơn thuần là cấu trúc thư mục, mà là một **design pattern có chủ đích** nhằm phân tách hệ thống thành các vertical slice độc lập. Mỗi feature module (Auth, Vocabulary, IELTS, Shadowing...) tự chứa screens, hooks, components riêng, trong khi tầng core dùng chung được tách riêng.

**Nguyên tắc cốt lõi:**
- Mỗi feature module **tự chứa**: screen, hook, component riêng
- Tầng `core/` cung cấp **API client, store, types** dùng chung
- Tầng `components/` chứa **UI primitives** tái sử dụng (Button, Badge, Card...)
- Data-fetching logic **tách hoàn toàn** khỏi UI qua custom hooks

### 1.2. Cấu Trúc Thư Mục Đề Xuất (Architecture Overview)

```
frontend-mobile/
├── app/                          # expo-router — CHỈ CHỨA ROUTING
│   ├── _layout.tsx               # Root layout (providers: Query, Auth, Theme)
│   ├── index.tsx                 # Redirect → (tabs)
│   │
│   ├── (auth)/                   # Auth route group
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # → dùng <LoginScreen /> từ features/
│   │   └── register.tsx
│   │
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab config (IELTS, Shadowing, VocabLab, More)
│   │   ├── index.tsx
│   │   ├── ielts.tsx
│   │   ├── shadowing.tsx
│   │   ├── vocablab.tsx
│   │   └── more.tsx
│   │
│   ├── vocabulary/[bookId].tsx   # Deep screens — delegate to feature
│   ├── grammar/[bookSlug].tsx
│   ├── ielts/intensive/[examId].tsx
│   ├── ielts/advanced/[skill]/[partId].tsx
│   ├── shadowing/[lessonId]/[mode].tsx
│   └── vocab-lab/study/[deckId].tsx
│
├── features/                     # FEATURE MODULES (business logic)
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm
│   │   ├── hooks/                # useLogin, useRegister
│   │   ├── screens/              # LoginScreen, RegisterScreen
│   │   └── types.ts
│   │
│   ├── vocabulary/
│   │   ├── components/           # BookCard, UnitList, WordCard
│   │   ├── hooks/                # useBooks, useUnit, useProgress
│   │   ├── screens/              # BookListScreen, UnitDetailScreen
│   │   └── types.ts
│   │
│   ├── grammar/
│   │   ├── components/           # TheoryRenderer, ExerciseCard
│   │   ├── hooks/                # useGrammarBooks, useGrammarUnit
│   │   ├── screens/
│   │   └── types.ts
│   │
│   ├── ielts/
│   │   ├── components/           # ExamCard, QuestionRenderer, TimerBar
│   │   ├── hooks/                # useExamCatalog, useExamSession, useResult
│   │   ├── screens/              # CatalogScreen, ExamScreen, ResultScreen
│   │   └── types.ts
│   │
│   ├── shadowing/
│   │   ├── components/           # VideoPlayer, SentenceCard, WaveformView
│   │   ├── hooks/                # useShadowingVideos, useProgress
│   │   ├── screens/
│   │   └── types.ts
│   │
│   ├── pronunciation/
│   │   ├── components/           # SoundCard, RecordButton, ScoreView
│   │   ├── hooks/                # useSounds, useRecording, useAttemptResult
│   │   ├── screens/
│   │   └── types.ts
│   │
│   └── vocab-lab/
│       ├── components/           # DeckCard, FlashcardView, ReviewButtons
│       ├── hooks/                # useDecks, useStudySession, useReview
│       ├── screens/
│       ├── utils/                # sm2.ts (SM-2 algorithm)
│       └── types.ts
│
├── core/                         # SHARED INFRASTRUCTURE
│   ├── api/
│   │   ├── client.ts             # Enhanced ApiClient (auto-refresh, interceptors)
│   │   └── query-client.ts       # TanStack QueryClient config
│   ├── auth/
│   │   ├── store.ts              # Zustand auth store
│   │   └── secure-token.ts       # expo-secure-store wrapper
│   ├── store/
│   │   ├── storage.ts            # MMKV adapter cho Zustand persist
│   │   └── index.ts
│   └── config/
│       └── env.ts                # Environment variables
│
├── components/                   # SHARED UI PRIMITIVES
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── Divider.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SectionHeader.tsx
│   │   └── ScoreBadge.tsx
│   ├── feedback/
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorView.tsx
│   └── index.ts                  # Barrel exports
│
├── constants/
│   ├── colors.ts                 # Design tokens
│   ├── spacing.ts
│   └── index.ts
│
├── types/                        # SHARED TYPES (cross-feature)
│   └── index.ts
│
└── assets/
    ├── fonts/
    └── images/
```

### 1.3. Architectural Pattern: Phân tách UI và Data-Fetching

**Pattern: "Thin Route, Fat Feature"**

File trong `app/` (expo-router) chỉ đóng vai trò **route connector** — import screen từ `features/` và truyền params:

```typescript
// app/vocabulary/[bookId].tsx — CHỈ LÀ ROUTE CONNECTOR
import { useLocalSearchParams } from 'expo-router';
import { BookDetailScreen } from '@/features/vocabulary/screens/BookDetailScreen';

export default function BookDetailRoute() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  return <BookDetailScreen bookId={bookId} />;
}
```

```typescript
// features/vocabulary/screens/BookDetailScreen.tsx — CHỨA LOGIC
import { useBookDetail } from '../hooks/useBookDetail';
import { UnitList } from '../components/UnitList';
import { LoadingSpinner, ErrorView } from '@/components';

export function BookDetailScreen({ bookId }: { bookId: string }) {
  const { data, isLoading, error } = useBookDetail(bookId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;
  return <UnitList units={data.units} />;
}
```

```typescript
// features/vocabulary/hooks/useBookDetail.ts — DATA FETCHING
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { VocabularyBookWithUnits } from '../types';

const keys = {
  book: (id: string) => ['vocabulary', 'book', id] as const,
};

export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: keys.book(bookId),
    queryFn: () => apiClient.get<VocabularyBookWithUnits>(`/vocabulary/books/${bookId}`),
    staleTime: 5 * 60_000,
  });
}
```

**Lợi ích:**
- **Test dễ dàng**: hook và screen test độc lập, không phụ thuộc router
- **Tái sử dụng**: cùng một screen có thể render ở nhiều route
- **Tách rõ concerns**: route ↔ screen ↔ hook ↔ API

---

## 2. Lựa Chọn Tech Stack Bổ Trợ

### 2.1. Server State: TanStack Query (React Query) v5

**So sánh với hiện tại và các lựa chọn khác:**

| Tiêu chí | Hiện tại (`useApi` hook tự viết) | TanStack Query v5 | RTK Query |
|:---|:---|:---|:---|
| Caching | ❌ Không | ✅ Tự động, cấu hình `staleTime` | ✅ Có |
| Background Refetch | ❌ Không | ✅ Tự động khi focus/reconnect | ✅ Có |
| Retry | ❌ Không | ✅ 3 lần mặc định, exponential backoff | ✅ Có |
| Optimistic Updates | ❌ Không | ✅ `onMutate` / `onError` rollback | ✅ Có |
| Boilerplate | Ít | Ít | Nhiều (slice, adapter, middleware) |
| Bundle Size | 0 KB | ~13 KB gzip | ~40 KB (cần Redux core) |
| Learning Curve | — | Thấp (hook-based) | Cao (Redux ecosystem) |
| Devtools cho RN | — | ✅ Có plugin riêng | ✅ Flipper |

**Kết luận: Chọn TanStack Query v5** vì:
- Bundle size nhỏ hơn RTK Query ~3x
- Không cần Redux boilerplate (project không dùng Redux)
- `refetchInterval` giải quyết trực tiếp nhu cầu polling kết quả AI grading
- Thay thế hoàn toàn hook `useApi.ts` hiện tại (49 dòng code tự viết, thiếu caching/retry)

### 2.2. Global Client State: Zustand v5

**So sánh với hiện tại:**

| Tiêu chí | Hiện tại (Context API) | Zustand v5 | Redux Toolkit |
|:---|:---|:---|:---|
| Re-render | Tất cả consumer re-render khi bất kỳ value nào thay đổi | Chỉ component đọc slice bị thay đổi | Tương tự Zustand (với selector) |
| Boilerplate | Thấp | Rất thấp | Cao |
| Middleware | Không | `persist`, `devtools`, `immer` | Rất phong phú |
| Persistence | Tự implement | `persist` middleware + MMKV | Tự implement |
| Dùng ngoài React | ❌ Không | ✅ `getState()` (dùng trong ApiClient) | ✅ `store.getState()` |

**Kết luận: Chọn Zustand v5** vì:
- Giải quyết vấn đề re-render của `AuthContext` hiện tại
- `getState()` cho phép đọc token trong `ApiClient` (class thuần JS, không phải React component)
- Persist middleware + MMKV phù hợp cho SM-2 offline data

**Scope của Zustand stores:**

| Store | Dữ liệu | Persist? |
|:---|:---|:---|
| `useAuthStore` | user, accessToken | ✅ (MMKV cho user, SecureStore cho token) |
| `useThemeStore` | theme mode (light/dark) | ✅ MMKV |
| `useAudioStore` | playback state, current audio URL | ❌ In-memory |
| `useFlashcardStore` | offline review queue | ✅ MMKV |

### 2.3. UI Styling: NativeWind (Tailwind CSS for React Native)

**So sánh lựa chọn:**

| Tiêu chí | StyleSheet (hiện tại) | NativeWind (Tailwind) | Tamagui |
|:---|:---|:---|:---|
| Performance | ✅ Native, nhanh nhất | ⚠️ Overhead runtime (nhỏ) | ✅ Biên dịch AOT |
| Kiến thức từ Web | ❌ Không tận dụng Tailwind | ✅ Tận dụng 100% | ❌ API riêng |
| Cấu hình | Đơn giản | Phức tạp (babel, tailwind.config) | Phức tạp |
| Tốc độ phát triển UI | ⚠️ Chậm (viết StyleSheet thủ công) | ✅ Nhanh (utility classes) | ✅ Nhanh |
| Đồng bộ Web ↔ Mobile | ❌ Hoàn toàn khác biệt | ✅ Dùng chung `tailwind.config` | ❌ Không liên quan |

**Kết luận: Chọn NativeWind** vì:
- Việc sử dụng NativeWind cho phép **tái sử dụng gần như 100%** tư duy và các Tailwind utility classes từ dự án Next.js (Web), giúp đội ngũ phát triển không phải học thêm hệ thống styling mới
- Dù tốn thời gian setup ban đầu (cấu hình Babel plugin, `tailwind.config.ts`), nhưng nó sẽ **tăng tốc độ phát triển giao diện gấp nhiều lần** ở Phase 2 khi cần build hàng chục màn hình
- Đảm bảo **tính nhất quán tuyệt đối** về khoảng cách (spacing), màu sắc (colors), và responsive giữa Web và Mobile thông qua file `tailwind.config.ts` dùng chung
- Có thể **chia sẻ bảng màu** trực tiếp từ `tailwind.config.ts` của Web sang Mobile, giải quyết triệt để vấn đề bất đồng bộ màu sắc (Primary Web: `#FFC600` vs Mobile: `#3B82F6`)

**Chiến lược migration:**
- **Bước 1:** Cài đặt NativeWind v4 + cấu hình Babel, Metro, `tailwind.config.ts` (copy từ Web, điều chỉnh `content` paths)
- **Bước 2:** Migrate các shared UI primitives (`components/ui/`) sang NativeWind `className` trước
- **Bước 3:** Các feature screens mới viết hoàn toàn bằng NativeWind; screens cũ migrate dần
- **Bước 4:** Xóa dần các `StyleSheet.create()` khi đã chuyển xong

---

## 3. Chiến Lược Giao Tiếp Bất Đồng Bộ (Async Communication Pattern)

### 3.1. Bối cảnh kiến trúc

```
Mobile App                   Backend Core (NestJS)           Backend AI (FastAPI)
    │                              │                               │
    │  POST /pronunciation/upload  │                               │
    │ ───────────────────────────> │  Lưu MinIO, tạo Attempt      │
    │  ← { attemptId, status:     │  (status: PENDING)            │
    │      PENDING }               │                               │
    │                              │  publish → RabbitMQ           │
    │                              │  (pronunciation-check-queue)  │
    │                              │ ────────────────────────────> │
    │                              │                               │  Whisper transcribe
    │                              │                               │  Tính score
    │                              │                               │  UPDATE DB
    │                              │                               │  (status: COMPLETED)
    │  GET /pronunciation/         │                               │
    │      attempts/{attemptId}    │                               │
    │ ───────────────────────────> │  Đọc DB, trả kết quả         │
    │  ← { status: COMPLETED,     │                               │
    │      score: 85 }             │                               │
```

### 3.2. Đánh giá 3 phương pháp

| Tiêu chí | Polling (TanStack Query) | SSE (Server-Sent Events) | WebSocket (Socket.io) |
|:---|:---|:---|:---|
| Độ phức tạp implement | ⭐ Thấp | ⭐⭐ Trung bình | ⭐⭐⭐ Cao |
| Cần thay đổi Backend | ❌ Không | ✅ Thêm SSE endpoint | ✅ Thêm WS Gateway |
| Tải trên server | ⚠️ Trung bình | ✅ Thấp | ✅ Thấp |
| Độ trễ nhận kết quả | 1-3 giây (tùy interval) | < 1 giây | < 1 giây |
| Pin & bandwidth | ⚠️ Tốn hơn | ✅ Tiết kiệm | ✅ Tiết kiệm |
| Phù hợp MVP | ✅ Hoàn hảo | ⚠️ Overkill | ❌ Overkill |

### 3.3. Architectural Pattern đề xuất: Smart Polling → SSE Upgrade Path

**Phase 1 — Smart Polling (không cần thay đổi backend):**

```typescript
// features/pronunciation/hooks/useAttemptResult.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';

export function useAttemptResult(attemptId: string | null) {
  return useQuery({
    queryKey: ['pronunciation', 'attempt', attemptId],
    queryFn: () => apiClient.get(`/pronunciation/attempts/${attemptId}`),
    enabled: !!attemptId,
    // Smart polling: dừng khi nhận được kết quả cuối cùng
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') return false;
      return 2000; // Poll mỗi 2 giây
    },
    // Giới hạn tối đa 60 giây polling (30 lần × 2s)
    refetchIntervalInBackground: false,
  });
}
```

**Tương tự cho Exam Grading (Writing/Speaking):**

```typescript
// features/ielts/hooks/useExamResult.ts
export function useExamResult(sessionId: string | null) {
  return useQuery({
    queryKey: ['exam', 'session', sessionId],
    queryFn: () => apiClient.get(`/exams/sessions/${sessionId}`),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'ABANDONED') return false;
      return 3000; // Poll mỗi 3 giây (AI grading mất thời gian hơn)
    },
  });
}
```

**UX Pattern cho người dùng trong lúc chờ:**

```typescript
// features/pronunciation/components/GradingStatus.tsx
function GradingStatus({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return <PendingView message="Đang gửi bài..." />;
    case 'PROCESSING':
      return <ProcessingView message="AI đang chấm điểm..." showAnimation />;
    case 'COMPLETED':
      return <CompletedView />;
    case 'FAILED':
      return <ErrorView message="Có lỗi xảy ra, vui lòng thử lại" />;
  }
}
```

**Phase 2+ — Nâng cấp lên SSE (khi cần):**
- Thêm endpoint SSE trên NestJS: `GET /api/v1/events/grading/:sessionId`
- NestJS consume completion event từ RabbitMQ → push qua SSE
- Mobile dùng `EventSource` polyfill hoặc TanStack Query `queryFn` với SSE stream

---

## 4. Checklist Công Việc Kỹ Thuật

### 4.1. Review & Cleanup Base Code Hiện Tại

#### Files cần REFACTOR (di chuyển vào cấu trúc mới):

| File hiện tại | Vấn đề | Hành động |
|:---|:---|:---|
| `contexts/AuthContext.tsx` | Dùng AsyncStorage lưu token (plain text), gộp logic auth + routing guard | Thay bằng `core/auth/store.ts` (Zustand) + `core/auth/secure-token.ts` |
| `hooks/useApi.ts` | Hook tự viết, thiếu cache/retry/stale management | Xóa, thay bằng TanStack Query hooks trong `features/*/hooks/` |
| `hooks/useAuth.ts` | Trùng logic với `AuthContext.tsx`, gây confuse | Xóa, hợp nhất vào `core/auth/store.ts` |
| `services/api-client.ts` | Không xử lý 401 auto-refresh, không attach token từ store | Refactor thành `core/api/client.ts` với interceptor logic |
| `services/api.ts` | Gộp tất cả domain API (vocab, grammar, pronunciation, auth) vào 1 file | Tách vào `features/*/hooks/` tương ứng |
| `services/auth.service.ts` | Kế thừa ApiClient (OOP) — khác pattern so với các service khác (object literal) | Refactor thành hooks trong `features/auth/hooks/` |
| `components/ui.tsx` | 205 dòng gộp 7 components vào 1 file | Tách thành 7 files trong `components/ui/` |
| `constants/index.ts` | Gộp API config + design tokens vào 1 file | Tách `colors.ts`, `spacing.ts`, `env.ts` |

#### Files cần REVIEW nội dung:

| File | Kích thước | Lý do review |
|:---|:---|:---|
| `app/(tabs)/ielts.tsx` | 18.5 KB | Quá lớn cho 1 tab screen — cần tách components |
| `app/vocab-lab/index.tsx` | 39.6 KB | File lớn nhất — chắc chắn cần tách logic ra hooks và components |
| `app/ielts/intensive/[examId].tsx` | 15.3 KB | Screen phức tạp — cần tách |
| `app/ielts/statistics.tsx` | 13.3 KB | Screen phức tạp — cần tách |
| `app/shadowing/index.tsx` | 11.5 KB | Cần tách |
| `constants/shadowing-lessons.ts` | 202.6 KB | File dữ liệu tĩnh khổng lồ — cần chuyển sang API hoặc lazy load |

#### Files/Folders có thể XÓA hoặc gộp:

| Item | Lý do |
|:---|:---|
| `hooks/useAuth.ts` | Trùng với AuthContext, sẽ thay bằng Zustand store |
| `hooks/useApi.ts` | Thay bằng TanStack Query |
| `services/auth.service.ts` | Gộp vào feature auth hooks |
| `.npmrc` | Review xem còn cần thiết không |

### 4.2. Công Việc Cần Phối Hợp Với Backend

#### A. Chốt API Contract

| Hạng mục | Chi tiết cần thống nhất | Ưu tiên |
|:---|:---|:---|
| **Error Response Format** | Thống nhất format lỗi: `{ statusCode, message, error? }` cho mọi endpoint. Hiện tại `ApiClient` chỉ throw `API Error: ${status}` — không parse body | 🔴 Cao |
| **Pagination Format** | Thống nhất format: `{ data: T[], total, page, limit }` cho tất cả list endpoints (exams, vocabulary books, flashcards) | 🔴 Cao |
| **JWT Payload** | Xác nhận các field trong JWT payload: `sub`, `email`, `role`, `iat`, `exp`. Mobile cần decode để hiển thị user info | 🟡 TB |
| **Refresh Token** | Backend cần implement `POST /auth/refresh` (hiện đang TODO ở `auth.controller.ts` line 24). Đây là **blocker** cho mobile | 🔴 Cao |
| **Upload Endpoints** | Xác nhận format multipart/form-data cho: `POST /exams/audio/upload`, `POST /pronunciation/upload`. Field name, max size, allowed mime types | 🟡 TB |
| **Pronunciation Attempt** | Cần endpoint `GET /pronunciation/attempts/:id` để mobile poll trạng thái. Xác nhận response schema | 🔴 Cao |
| **CORS cho Mobile** | Thêm origin cho Expo development vào CORS config. Hiện chỉ có `localhost:3001` và `localhost:19006` | 🟡 TB |

#### B. API Contract — Error Codes

Đề xuất chuẩn hóa error codes:

```typescript
// Đề xuất thống nhất với backend team
interface ApiErrorResponse {
  statusCode: number;       // HTTP status
  message: string;          // Human-readable message (hiển thị cho user)
  error?: string;           // Error code machine-readable
  details?: unknown;        // Validation errors array (optional)
}

// Error codes cần thống nhất:
// 400 — Bad Request (validation failed)
// 401 — Unauthorized (token expired/invalid)
// 403 — Forbidden (insufficient role)
// 404 — Not Found
// 409 — Conflict (duplicate email, etc.)
// 422 — Unprocessable Entity
// 429 — Too Many Requests
// 500 — Internal Server Error
```

#### C. Checklist Backend Tasks

- [ ] Implement `POST /api/v1/auth/refresh` (refresh token rotation)
- [ ] Thêm endpoint `GET /api/v1/pronunciation/attempts/:id` (nếu chưa có)
- [ ] Chuẩn hóa error response format cho toàn bộ API
- [ ] Thêm pagination cho `GET /api/v1/exams` và các list endpoints
- [ ] Cập nhật CORS để chấp nhận request từ Expo development server
- [ ] Document API contract (Swagger/OpenAPI — hiện chưa implement)

#### D. Chiến Lược Đồng Bộ TypeScript Interfaces (Shared Types)

Để tránh lỗi **type mismatch** khi backend thay đổi cấu trúc database, Mobile App cần có chiến lược đồng bộ types rõ ràng với NestJS/Prisma.

**Nguyên tắc:**
- Thư mục `core/types/` của Mobile phải được **ánh xạ trực tiếp** từ các DTOs (Data Transfer Objects) của NestJS
- Đặc biệt lưu ý các trường dữ liệu **JSON phức tạp** từ Prisma schema: `Exam.questions`, `ExamSession.answers`, `Result.feedback`, `ShadowingVideo.sentences`, `Flashcard.fieldValues`
- Khi backend thay đổi schema (thêm/xóa/đổi tên field), Mobile types phải được cập nhật tương ứng

**Cấu trúc đề xuất:**

```
core/types/
├── auth.types.ts          # User, AuthResponse, LoginRequest, RegisterRequest
├── exam.types.ts          # Exam, ExamSession, Result, SessionStatus, ExamType
├── vocabulary.types.ts    # VocabularyBook, VocabularyUnit, VocabularyWord, VocabularyProgress
├── grammar.types.ts       # GrammarBook, GrammarUnit, GrammarExercise
├── pronunciation.types.ts # PronunciationSound, PronunciationAttempt, PronunciationStatus
├── vocab-lab.types.ts     # Deck, Flashcard, CardState, SubmitReviewDto, CardType
├── shadowing.types.ts     # ShadowingVideo, ShadowingSentence, ShadowingProgress
├── ielts.types.ts         # IeltsProfile, IeltsLesson, IeltsPracticeSession
├── api.types.ts           # ApiErrorResponse, PaginatedResponse<T>
└── index.ts               # Barrel re-exports
```

**Quy trình đồng bộ với backend:**

| Bước | Hành động | Người thực hiện |
|:---|:---|:---|
| 1 | Backend cập nhật Prisma schema / NestJS DTO | Backend Dev |
| 2 | Thông báo thay đổi (PR description hoặc changelog) | Backend Dev |
| 3 | Cập nhật file tương ứng trong `core/types/` | Mobile Dev |
| 4 | Chạy TypeScript compiler kiểm tra lỗi toàn bộ project | Mobile Dev |

**Ví dụ ánh xạ DTO → Mobile Type (trường JSON phức tạp):**

```typescript
// core/types/exam.types.ts
// Ánh xạ từ: backend-core/src/modules/exams/dto/*.dto.ts + Prisma schema

// Exam.questions (Json trong Prisma) → cần định nghĩa rõ structure
interface ExamQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'true_false';
  text: string;
  options?: string[];
  correctAnswer: string;
  section?: string;         // Reading Part 1, Listening Part 2...
  audioUrl?: string;        // Cho Listening questions
  imageUrl?: string;        // Cho diagram/map questions
}

// Result.feedback (Json trong Prisma) → structure từ Gemini AI response
interface AIFeedback {
  overall?: string;
  reading?: { score: number; details: string };
  listening?: { score: number; details: string };
  writing?: {
    task1: { band: number; criteria: Record<string, number>; comments: string };
    task2: { band: number; criteria: Record<string, number>; comments: string };
  };
  speaking?: {
    band: number;
    criteria: Record<string, number>;
    comments: string;
  };
}
```

**Checklist đồng bộ types:**
- [ ] Tạo thư mục `core/types/` với các file theo domain
- [ ] Ánh xạ tất cả JSON fields từ Prisma schema sang TypeScript interfaces cụ thể
- [ ] Đảm bảo rating scale FSRS (1-4) khớp giữa Mobile và Backend (`SubmitReviewDto.rating: 1|2|3|4`)
- [ ] Thêm comment trong mỗi file type ghi rõ file nguồn DTO tương ứng bên backend

---

## Phụ Lục: Dependency Map

### Packages cần thêm

```bash
# Core infrastructure
npm install zustand @tanstack/react-query react-native-mmkv
npx expo install expo-secure-store @react-native-community/netinfo

# UI Styling (NativeWind)
npm install nativewind tailwindcss
npx tailwindcss init  # Tạo tailwind.config.ts

# UI Performance
npm install @shopify/flash-list react-native-render-html
```

### Package versions tương thích Expo SDK 52 (React Native 0.81)

| Package | Version | Ghi chú |
|:---|:---|:---|
| `zustand` | `^5.x` | Không cần native module |
| `@tanstack/react-query` | `^5.x` | Không cần native module |
| `nativewind` | `^4.x` | Cần cấu hình Babel + Metro |
| `tailwindcss` | `^3.4` | Dev dependency, dùng chung config với Web |
| `react-native-mmkv` | `^3.x` | Cần `expo prebuild` (native module) |
| `expo-secure-store` | `~14.x` | Managed workflow compatible |
| `@shopify/flash-list` | `^1.7` | Cần `expo prebuild` |
| `@react-native-community/netinfo` | `~12.x` | Managed workflow compatible |

---

*Phase 1 hoàn tất khi: cấu trúc thư mục mới đã setup, tech stack đã cài đặt, API contract đã chốt với backend team, và base code đã cleanup. Sau đó chuyển sang Phase 2: Feature Implementation.*
