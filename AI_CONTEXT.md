# AI_CONTEXT.md — Quy Tắc Bất Biến của IELTS Master AI

> **ĐÂY LÀ FILE BẮT BUỘC ĐỌC TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ.**
> Mọi AI Agent làm việc trên project này phải tuân thủ 100% các quy tắc dưới đây.
> Không được tự ý sáng tạo kiến trúc, naming convention, hay pattern mới nếu chưa được ghi ở đây.

---

## 0. NHẬN DẠNG PROJECT

| Thông tin | Giá trị |
|----------|--------|
| **Tên hiển thị** | IELTS Master AI |
| **Tên kỹ thuật (code/repo)** | toeic-master-ai *(tên cũ, giữ nguyên trong code để không breaking)* |
| **Mục tiêu hiện tại** | Hệ thống học & luyện thi **IELTS** (Reading, Listening, Writing, Speaking) với AI chấm điểm tự động |
| **Vai trò AI Agent** | Senior Lead Architect — ưu tiên stability, clean code, scalability |
| **Architecture Style** | Event-Driven Hybrid (Modular Monolith Core + AI Microservice) |

---

## 1. KIẾN TRÚC HỆ THỐNG — KHÔNG ĐƯỢC THAY ĐỔI

### Kiến trúc tổng thể: Event-Driven Hybrid

```
Client (Next.js / React Native)
    ↓ HTTP REST /api/v1
Backend Core (NestJS — port 3000)
    ↓ AMQP (RabbitMQ — port 5672)
Backend AI (FastAPI — port 8000)
    ↓ psycopg2 trực tiếp
PostgreSQL (port 5433)
```

### Nguyên tắc bất biến:

- **Backend Core** là trung tâm điều phối — mọi business logic chính đi qua đây
- **Backend AI** CHỈ làm: nhận message từ RabbitMQ → xử lý AI → ghi kết quả thẳng vào DB
- **Không** tạo thêm service/microservice mới ngoài 2 backend trên trừ khi được approve
- **Không** dùng GraphQL, gRPC, WebSocket cho tính năng mới — chỉ dùng REST
- **File upload** (audio, image) phải đi qua MinIO (local) / GCS (production) — KHÔNG lưu local disk

---

## 2. TECH STACK — CỐ ĐỊNH, KHÔNG ĐƯỢC THAY THẾ

| Layer | Technology | Version | Ghi chú |
|-------|-----------|---------|---------|
| Backend Core | NestJS | 10.x | Modular Monolith |
| ORM | Prisma | 5.x | PostgreSQL provider |
| Database | PostgreSQL | 16 | port 5433 (local) |
| Cache | Redis | 7 | port 6379 |
| Message Queue | RabbitMQ | 3 | port 5672 |
| Object Storage | MinIO (local) / GCS (prod) | — | port 9000 |
| AI Service | FastAPI | latest | Python 3.12 |
| STT | faster-whisper | 1.2.1+ | model: base, device: cpu |
| LLM | Google Gemini API | gemini-2.5-flash | fallback: gemini-1.5-pro |
| Frontend Web | Next.js | 14 | App Router |
| Frontend Mobile | Expo | SDK 52 | expo-router |
| Auth | JWT + Passport | — | access token only (refresh TODO) |

---

## 3. BACKEND CORE — QUY TẮC CODE

### 3.1 Module Structure (bắt buộc)

Mỗi module PHẢI có đúng cấu trúc này:

```
src/modules/{module-name}/
├── {module-name}.module.ts      ← imports, providers, exports
├── {module-name}.controller.ts  ← routes chỉ, không có logic
├── {module-name}.service.ts     ← toàn bộ business logic
└── dto/
    └── {module-name}.dto.ts     ← class-validator DTOs
```

**Không** tạo thêm file ngoài cấu trúc trên (repository, entity... không dùng vì đã có Prisma).

### 3.2 Các module hiện có — KHÔNG được rename/xoá

```
auth, users, exams, results, learning, vocabulary, grammar,
pronunciation, shadowing, vocab-lab, notes, ai-client
```

### 3.3 API Prefix

**BẮT BUỘC:** Tất cả routes đều bắt đầu bằng `/api/v1`

Ví dụ đúng:
- `GET /api/v1/exams`
- `POST /api/v1/vocabulary/books`
- `GET /api/v1/shadowing/videos`

### 3.4 Guards

| Guard | Dùng khi |
|-------|---------|
| `@UseGuards(JwtAuthGuard)` | Route yêu cầu đăng nhập |
| `@UseGuards(JwtAuthGuard, RolesGuard) + @Roles('ADMIN')` | Route chỉ ADMIN |
| Không có guard | Route public (GET books, GET units...) |

### 3.5 DTOs

- **BẮT BUỘC** dùng `class-validator` decorators (`@IsString()`, `@IsUUID()`, `@IsOptional()`, v.v.)
- **BẮT BUỘC** export DTO từ file `dto/`
- **KHÔNG** dùng `any` type trong DTOs — định nghĩa Interface hoặc DTO rõ ràng
- `ValidationPipe` đã được cấu hình global với `whitelist: true, forbidNonWhitelisted: true`
- **[TODO - chưa implement]** Swagger: Khi thêm DTO mới, nên thêm `@ApiProperty()` để chuẩn bị cho Swagger
- **[TODO - chưa implement]** Controller endpoints nên có `@ApiOperation()` và `@ApiResponse()`

### 3.6 Prisma Usage

```typescript
// ✅ ĐÚNG — inject PrismaService
constructor(private readonly prisma: PrismaService) {}

// ✅ ĐÚNG — upsert để tránh duplicate
await this.prisma.vocabularyBook.upsert({
  where: { id: bookId },
  update: { ... },
  create: { ... },
});

// ❌ SAI — KHÔNG dùng raw SQL trừ khi Prisma không hỗ trợ
await this.prisma.$queryRaw`...`
```

### 3.7 Error Handling

```typescript
// ✅ ĐÚNG — dùng NestJS exceptions
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');

// ❌ SAI — KHÔNG throw Error hoặc return error object
throw new Error('something went wrong');
```

**[TODO - chưa implement]** Mọi error response phải có cấu trúc nhất quán:
```json
{ "statusCode": 404, "message": "Not found", "timestamp": "...", "path": "/api/v1/..." }
```
Achieve bằng Global `HttpExceptionFilter` — cần implement khi có time.

### 3.8 Anti N+1 — Database Performance

```typescript
// ❌ SAI — Query trong loop (N+1 problem)
for (const unit of units) {
  const words = await this.prisma.vocabularyWord.findMany({ where: { unitId: unit.id } });
}

// ✅ ĐÚNG — Một query duy nhất dùng include
const units = await this.prisma.vocabularyUnit.findMany({
  where: { bookId },
  include: { words: true }
});

// ✅ ĐÚNG — Parallel queries dùng Promise.all
const [books, progress] = await Promise.all([
  this.prisma.vocabularyBook.findMany(),
  this.prisma.vocabularyProgress.findMany({ where: { userId } }),
]);
```

### 3.8 RabbitMQ — Chỉ Publish, Không Consume ở Backend Core

`backend-core` chỉ **publish** message, KHÔNG consume:

```typescript
// ✅ ĐÚNG — publish từ ai-client module
await this.aiClientService.publishGradingJob(sessionId, answers);

// Queues cố định:
// - 'exam-grading-queue'
// - 'pronunciation-check-queue'
```

---

## 4. DATABASE — QUY TẮC PRISMA SCHEMA

### 4.1 Naming Convention trong schema.prisma

```prisma
// Model names: PascalCase
model VocabularyBook { ... }

// Field names: camelCase
word         String
partOfSpeech String?

// Table names: snake_case (dùng @@map)
@@map("vocabulary_books")

// UUID cho tất cả primary keys
id String @id @default(uuid())
```

### 4.2 Khi thêm model mới

1. Thêm vào `schema.prisma`
2. Chạy: `npx prisma migrate dev --name {mô-tả-ngắn}`
3. Chạy: `npx prisma generate`
4. Thêm seed data vào `prisma/seed.ts`

### 4.3 Soft Delete

**Project này KHÔNG dùng soft delete.** Tất cả `delete` là hard delete với `onDelete: Cascade`.

### 4.4 Enum đã có — Không thêm giá trị mới khi không cần

```prisma
enum UserRole { STUDENT, ADMIN, INSTRUCTOR }
enum ExamType { FULL_TEST, READING, LISTENING, SPEAKING, WRITING, PRACTICE }
enum Difficulty { BEGINNER, INTERMEDIATE, ADVANCED }
enum SessionStatus { IN_PROGRESS, SUBMITTED, GRADING, COMPLETED, ABANDONED }
enum PronunciationStatus { PENDING, PROCESSING, COMPLETED, FAILED }
enum CardState { NEW, LEARNING, REVIEW }
enum MaterialType { LESSON, VOCABULARY, GRAMMAR, PRACTICE, VIDEO, AUDIO }
```

---

## 5. BACKEND AI — QUY TẮC CODE

### 5.1 File Structure

```
backend-ai/app/
├── main.py              ← FastAPI app + lifespan (consumers startup)
├── config.py            ← get_settings() via pydantic-settings
├── api/                 ← REST endpoints (health, grading, writing, speaking)
├── consumers/           ← RabbitMQ consumers (thread-based)
│   ├── grading_consumer.py
│   └── pronunciation_consumer.py
└── services/            ← Business logic
    ├── transcription_service.py  ← Whisper STT (singleton)
    ├── pronunciation_service.py  ← Scoring (Levenshtein)
    ├── writing_grader.py         ← Gemini API
    ├── speaking_grader.py        ← Gemini API
    ├── grading_service.py        ← Exam grading
    └── storage_service.py        ← MinIO/GCS
```

### 5.2 Singleton Pattern cho heavy services

```python
# ✅ ĐÚNG — singleton để tránh load model nhiều lần
_transcription_service: Optional[TranscriptionService] = None

def get_transcription_service() -> TranscriptionService:
    global _transcription_service
    if _transcription_service is None:
        _transcription_service = TranscriptionService()
    return _transcription_service
```

### 5.3 Consumer Threading

- Mỗi consumer chạy trong **thread riêng** (daemon thread)
- Consumer dùng `pika.BlockingConnection` — KHÔNG dùng async pika
- ACK sau khi xử lý thành công; NACK (requeue=False) khi fail

### 5.4 DB Update từ AI Service

AI Service cập nhật DB **trực tiếp qua psycopg2**, KHÔNG qua Backend Core API:

```python
# ✅ ĐÚNG
conn = psycopg2.connect(settings.database_url)
cursor = conn.cursor()
cursor.execute("""
    UPDATE pronunciation_attempts
    SET status = %s, "transcribedText" = %s, score = %s
    WHERE id = %s
""", (status, text, score, attempt_id))
conn.commit()

# ❌ SAI — KHÔNG gọi HTTP về backend-core
requests.patch(f"{backend_url}/api/v1/pronunciation/{id}", data={...})
```

### 5.5 Gemini API

```python
# Model ưu tiên: gemini-2.5-flash, fallback: gemini-1.5-pro
# KHÔNG hardcode API key — luôn lấy từ .env: os.getenv("GEMINI_API_KEY")
# SDK: from google import genai (KHÔNG dùng google.generativeai — đó là SDK cũ)
```

---

## 6. FRONTEND WEB — QUY TẮC CODE

### 6.1 Stack thực tế (đã install)

| Package | Dùng cho |
|---------|----------|
| `zustand ^4.4.7` | Global state management |
| `react-hook-form ^7.49.3` | Form handling |
| `zod ^3.22.4` | Schema validation cho forms |
| `lucide-react ^0.312.0` | Icons |
| `@radix-ui/*` | Headless UI primitives (Dialog, Dropdown) |
| `tailwindcss` | Styling |
| `axios` | HTTP client (dùng trong services/) |

### 6.2 Routing (Next.js App Router)

```
src/app/
├── (auth)/              ← public routes (login, register)
├── vocabulary/          ← vocabulary module
├── grammar/             ← grammar module
├── pronunciation/       ← pronunciation module
├── shadowing-dictation/ ← shadowing & dictation module
├── vocab-lab/           ← flashcard module
└── ielts/               ← exam module (intensive, history)
```

### 6.3 API Services

- **BẮT BUỘC** đặt tất cả API calls vào `src/services/`
- **KHÔNG** gọi API trực tiếp từ component
- **KHÔNG** dùng `process.env.NEXT_PUBLIC_API_URL` trực tiếp trong component — phải qua centralized config

```typescript
// ✅ ĐÚNG — centralized config
// src/config/env.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// src/services/exams.api.ts
import { API_URL } from '@/config/env';
export const getExams = async (token: string) => {
  const res = await axios.get(`${API_URL}/exams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// ❌ SAI — gọi fetch trực tiếp trong component hoặc dùng process.env trực tiếp
```

### 6.4 State Management

```typescript
// ✅ ĐÚNG — zustand cho global state
import { create } from 'zustand';
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
}));

// ✅ ĐÚNG — useState cho local UI state
const [isOpen, setIsOpen] = useState(false);

// ❌ SAI — KHÔNG dùng Redux, Context API cho global state mới
```

### 6.5 Form Handling

```typescript
// ✅ ĐÚNG — react-hook-form + zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ❌ SAI — validate thủ công với if statements
```

### 6.6 Styling Rules (STRICT)

```typescript
// ❌ SAI — KHÔNG hardcode hex color hay pixel
<div style={{ color: '#1a202c', marginTop: '13px' }}>

// ❌ SAI — KHÔNG dùng arbitrary Tailwind values
<div className="bg-[#1a202c] mt-[13px]">

// ✅ ĐÚNG — dùng Tailwind design tokens
<div className="text-gray-900 mt-3">

// Nếu cần màu custom → thêm vào tailwind.config.js, không hardcode
```

### 6.7 Atomic Design — Component Rule

```typescript
// ❌ SAI — inline button với raw HTML
<button className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600">
  Submit
</button>

// ✅ ĐÚNG — dùng component tái sử dụng từ src/components/ui/
import { Button } from '@/components/ui/button';
<Button variant="primary">Submit</Button>
```

- Tất cả UI primitives đặt trong `src/components/ui/` (Web)
- Props interface bắt buộc: `variant: 'default' | 'outline' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`
- **KHÔNG** expose raw `style` object prop ra ngoài component

### 6.8 Auth Token

Token lưu trong `localStorage` với key `access_token`. Lấy bằng:

```typescript
const token = localStorage.getItem('access_token');
```

---

## 7. FRONTEND MOBILE — QUY TẮC CODE

### 7.1 Stack thực tế (đã install)

| Package | Dùng cho |
|---------|----------|
| `expo-router` | File-based navigation |
| `expo-av ~15.0.0` | **Audio recording & playback** (Pronunciation feature) |
| React Native Stylesheet | Styling (KHÔNG dùng Tailwind trên mobile) |

### 7.2 Navigation (Expo Router)

```
app/
├── (auth)/    ← Stack cho login/register
├── (tabs)/    ← Bottom tab navigation (5 tabs: Home, Vocab, Grammar, Pronunciation, Profile)
├── vocabulary/
└── grammar/
```

### 7.3 Audio Recording (Pronunciation)

```typescript
// ✅ ĐÚNG — dùng expo-av cho recording
import { Audio } from 'expo-av';

// KHÔNG dùng thư viện audio khác trừ khi expo-av không đáp ứng được
```

### 7.4 API Base URL

```typescript
// src/config/env.ts — PHẢI có file này, KHÔNG dùng process.env trực tiếp
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// Trong component:
import { API_URL } from '@/config/env';  // ✅ ĐÚNG
process.env.EXPO_PUBLIC_API_URL          // ❌ SAI — không dùng trực tiếp
```

### 7.5 Styling

```typescript
// ✅ ĐÚNG — Standard RN StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});

// Constants cho design tokens:
// src/constants/Colors.ts — đã có file này
```

---

## 8. GIT WORKFLOW — BẮT BUỘC

### Branch naming

```
feature/{tên-tính-năng}      ← tính năng mới
fix/{mô-tả-bug}              ← sửa bug
chore/{mô-tả-task}           ← task kỹ thuật (refactor, deps...)
```

### Commit message format (Conventional Commits)

```
feat(module): mô tả tính năng mới
fix(module): mô tả bug đã sửa
chore(scope): mô tả thay đổi kỹ thuật
docs: cập nhật tài liệu
```

Ví dụ đúng:
```
feat(vocab): add flashcard spaced repetition review endpoint
fix(auth): correct JWT expiry time in config
chore(prisma): add ShadowingDictationProgress migration
```

### Quy tắc tuyệt đối:

- **KHÔNG commit trực tiếp lên `main`**
- **KHÔNG tự merge PR của mình**
- **LUÔN** `git fetch && git pull` trước khi bắt đầu làm việc
- **KHÔNG commit** các file: `.env`, `node_modules/`, `venv/`, `dist/`, `.next/`

---

## 9. MÔI TRƯỜNG LOCAL — PORTS & CREDENTIALS

| Service | Port | Credentials |
|---------|------|-------------|
| NestJS Backend | 3000 | — |
| FastAPI AI | 8000 | — |
| Next.js Web | 3001 | — |
| PostgreSQL | **5433** | user: `toeic_user`, pass: `toeic_password`, db: `toeic_db` |
| Redis | 6379 | — |
| RabbitMQ | 5672 | user: `toeic`, pass: `toeic_password` |
| RabbitMQ UI | 15672 | user: `toeic`, pass: `toeic_password` |
| MinIO API | 9000 | user: `minioadmin`, pass: `minioadmin` |
| MinIO Console | 9001 | user: `minioadmin`, pass: `minioadmin` |
| PgAdmin | 5050 | email: `admin@toeic.com`, pass: `toeic_admin` |

> ⚠️ **QUAN TRỌNG:** PostgreSQL chạy trên port **5433** (không phải 5432 mặc định). Phải dùng đúng port này trong mọi kết nối.

---

## 10. LỆNH KHỞI CHẠY — CHUẨN

### Bước 1: Infrastructure (Docker)
```bash
docker-compose up -d
```

### Bước 2: Backend Core
```bash
cd backend-core
npm run start:dev          # Hot-reload — port 3000
```

Lần đầu (hoặc sau khi pull code mới):
```bash
npx prisma migrate dev     # Apply migrations
npx prisma generate        # Regenerate Prisma Client
npm run prisma:seed        # Seed dữ liệu
```

### Bước 3: AI Service
```bash
cd backend-ai
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Bước 4: Frontend Web
```bash
cd frontend-web
npm run dev                # port 3001
```

### Bước 5 (tuỳ chọn): Frontend Mobile
```bash
cd frontend-mobile
npm start                  # Expo dev server
```

---

## 11. QUY TẮC KHI AI AGENT LÀM VIỆC

### ✅ PHẢI làm

1. **Đọc file này trước** khi bắt bất kỳ task nào
2. **Đọc file liên quan** (`schema.prisma`, controller, service) trước khi sửa
3. **Tuân theo naming convention** đã có trong codebase
4. **Chạy `prisma generate`** sau khi sửa schema
5. **Kiểm tra health** sau khi sửa code: `curl http://localhost:3000/api/v1`
6. **Ghi rõ** những gì đã thay đổi sau khi xong task
7. **Kiểm tra Anti N+1**: trước khi viết service, hỏi "query này có trong loop không?"
8. **Dùng component ui/** trên web thay vì raw HTML elements
9. **Dùng constants/enums** thay vì magic strings/numbers

### ❌ KHÔNG được làm

1. **KHÔNG** tạo endpoint mới mà không có Guard — mọi endpoint phải xác định rõ public hay JWT
2. **KHÔNG** hard-code credentials, URL, hex color, pixel values — luôn dùng env/constants/tailwind tokens
3. **KHÔNG** sửa `schema.prisma` mà không tạo migration
4. **KHÔNG** cài package mới mà không cập nhật `package.json` và thông báo lý do
5. **KHÔNG** dùng `any` type trong TypeScript (ngoại lệ chấp nhận: Express Request, RabbitMQ callback params)
6. **KHÔNG** để `console.log` trong production code — dùng NestJS `Logger` hoặc Python `logging`
7. **KHÔNG** xoá data migration files trong `prisma/migrations/`
8. **KHÔNG** thay đổi kiến trúc tổng thể (thêm microservice, đổi framework, đổi ORM...)
9. **KHÔNG** commit file `.env` lên git
10. **KHÔNG** viết business logic trong Controller — chỉ validate DTO và gọi Service
11. **KHÔNG** query DB từ Controller — phải qua Service
12. **KHÔNG** dùng `process.env` trực tiếp trong components — phải qua `src/config/env.ts`
13. **KHÔNG** dùng Redux, Context API cho global state mới trên web — dùng zustand

### Khi không chắc chắn

→ Đọc lại file tương tự đã có trong codebase và làm theo pattern đó.
→ Hỏi người dùng trước khi tạo pattern mới.

---

## 12. THÔNG TIN DỰ ÁN

| Thông tin | Giá trị |
|----------|--------|
| Tên project | IELTS Master AI *(code/repo vẫn dùng tên cũ: toeic-master-ai)* |
| Mục tiêu | Hệ thống học & luyện thi **IELTS** với AI chấm điểm tự động |
| Repo | ThanhSi1008/thesis-toeic-system |
| Nhánh chính | `main` |
| Ngôn ngữ chính | TypeScript (backend/frontend), Python (AI service) |
| Database migrations | `backend-core/prisma/migrations/` (8 migrations) |
| Seed data | `backend-core/prisma/seed.ts` (dùng `upsert`, an toàn khi chạy lại) |
| Tài liệu hệ thống | `SYSTEM_OVERVIEW.md` (luôn cập nhật khi có thay đổi lớn) |

---

---

## 13. PHÂN TÍCH V0 → GIỮ LẠI / BỎ ĐI

| Rule từ V0 | Trạng thái | Ghi chú |
|-----------|-----------|--------|
| Architecture Hybrid | ✅ Giữ | Đã implement đúng |
| Tech stack constraints | ✅ Giữ (đã cập nhật) | SQLAlchemy → psycopg2 trực tiếp |
| Coding standards (no `any`, SRP) | ✅ Giữ | Bắt buộc |
| No hardcode env/credentials | ✅ Giữ | Bắt buộc |
| Git workflow | ✅ Giữ | Không thay đổi |
| Anti N+1 rule | ✅ Giữ (thêm mới) | Quan trọng, V0 có nhưng đã bỏ sót |
| Atomic Design (components/ui/) | ✅ Giữ (thêm mới) | Đã có `src/components/ui/` trong web |
| No hardcode hex/px | ✅ Giữ (thêm mới) | Dùng Tailwind tokens |
| zustand global state | ✅ Giữ (đã verify) | Package đã install `^4.4.7` |
| react-hook-form + zod | ✅ Giữ (đã verify) | Package đã install |
| expo-av cho audio | ✅ Giữ (đã verify) | Package `~15.0.0` |
| Swagger `@ApiProperty()` | ⏳ TODO | Chưa implement, đánh dấu để làm sau |
| Global HttpExceptionFilter | ⏳ TODO | Chưa implement, đánh dấu để làm sau |
| helmet middleware | ⏳ TODO | Chưa implement trong main.ts |
| "TOEIC" trong mission | ❌ Đã sửa | Đổi thành IELTS |
| "TOEIC Exam simulation" | ❌ Đã sửa | Đổi thành IELTS Exam |
| shadcn/ui | ⚠️ Partial | Radix UI đã install, nhưng không setup đầy đủ shadcn |

---

*File này được tạo và duy trì bởi AI Agent dựa trên code thực tế của project.*
*Cập nhật lần cuối: 2026-03-29 — Merged từ AI_CONTEXT_V0.md*
