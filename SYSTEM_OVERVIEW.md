# TOEIC Master AI — Tổng Quan Hệ Thống (Chi Tiết)

> Cập nhật: 2026-03-29 | Dựa trên code thực tế của nhánh `main`

---

## 1. TỔNG QUAN DỰ ÁN

Hệ thống học tiếng Anh IELTS/TOEIC với các tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| **Luyện từ vựng** | Học theo sách (VocabularyBook → Unit → Word), có bài tập và đọc hiểu |
| **Luyện ngữ pháp** | Theo sách Cambridge Grammar (GrammarBook → Unit → lý thuyết + bài tập) |
| **Shadowing & Dictation** | Upload video YouTube, luyện nghe → nói lại / điền từ |
| **Vocab Lab** | Flashcard với thuật toán SM-2 (Spaced Repetition), chia Deck |
| **Luyện phát âm** | Ghi âm → AI chấm điểm qua Whisper STT |
| **Thi IELTS** | Làm bài thi đầy đủ (Reading, Listening, Speaking, Writing) |
| **Chấm điểm AI** | Writing & Speaking chấm tự động bằng Gemini API |
| **Ghi chú câu hỏi** | User ghi chú riêng từng câu hỏi trong đề thi |

---

## 2. KIẾN TRÚC HỆ THỐNG

```
Kiểu: Event-Driven Hybrid Architecture
```

```
┌──────────────────────────────────────────────────┐
│                  CLIENT LAYER                     │
│   📱 React Native (Expo SDK 52)  │  🌐 Next.js 14 │
│   Mobile: Học từ vựng, ngữ pháp  │  Web: Thi IELTS│
│   phát âm, grammar               │  shadowing      │
└──────────────────────────────────────────────────┘
                       │ HTTP REST (axios)
                       ▼
┌──────────────────────────────────────────────────┐
│         BACKEND CORE — NestJS (port 3000)        │
│   Global prefix: /api/v1                         │
│   Guards: JwtAuthGuard, RolesGuard               │
│   Validation: ValidationPipe (whitelist: true)   │
│                                                   │
│  Modules: auth, users, exams, results, learning, │
│  vocabulary, grammar, pronunciation, shadowing,   │
│  vocab-lab, notes, ai-client                     │
│                    │                              │
│                    │ amqplib (AMQP)               │
│                    ▼                              │
│           RabbitMQ (port 5672)                   │
│           Queue: exam-grading-queue              │
│           Queue: pronunciation-check-queue       │
└──────────────────────────────────────────────────┘
                       │
                       ▼ consume
┌──────────────────────────────────────────────────┐
│         BACKEND AI — FastAPI (port 8000)         │
│   GradingConsumer (thread) + PronunciationCon.   │
│   Whisper STT → chấm phát âm                    │
│   Gemini API → chấm Writing/Speaking             │
│   Cập nhật kết quả trực tiếp vào PostgreSQL      │
└──────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                  DATA LAYER                       │
│  PostgreSQL:5433  │  Redis:6379  │  MinIO:9000   │
│  (8 migrations)  │  (cache/TTL) │  (audio/image) │
└──────────────────────────────────────────────────┘
```

---

## 3. BACKEND CORE — CHI TIẾT TỪNG MODULE

**Entry point:** `backend-core/src/main.ts`
- Global prefix: `api/v1`
- CORS: `http://localhost:3001`, `http://localhost:19006`
- ValidationPipe: `whitelist: true`, `forbidNonWhitelisted: true`
- **Không có Helmet** (chưa implement, khác với AI_CONTEXT)
- **Không có Swagger** (chưa implement)

---

### Module: `auth`

**File:** `auth.controller.ts`, `auth.service.ts`

| Endpoint | Method | Guard | Mô tả |
|----------|--------|-------|-------|
| `POST /api/v1/auth/register` | Public | — | Đăng ký tài khoản mới |
| `POST /api/v1/auth/login` | Public | LocalAuthGuard | Đăng nhập, trả JWT |
| `POST /api/v1/auth/refresh` | Public | — | ⚠️ TODO: chưa implement |

**Chiến lược:** JWT (access token) + Local (password). Refresh token chưa implement.

---

### Module: `users`

**File:** `users.controller.ts`, `users.service.ts`

Quản lý user profile. Enum role: `STUDENT`, `ADMIN`, `INSTRUCTOR`.

---

### Module: `vocabulary`

**File:** `vocabulary.controller.ts`, `vocabulary.service.ts`

| Endpoint | Method | Guard | Mô tả |
|----------|--------|-------|-------|
| `GET /api/v1/vocabulary/books` | Public | — | Danh sách tất cả sách từ vựng |
| `GET /api/v1/vocabulary/books/:id` | Public | — | Chi tiết sách + danh sách units |
| `GET /api/v1/vocabulary/units/:id` | Public | — | Chi tiết unit (words, exercises, questions) |
| `GET /api/v1/vocabulary/progress/:bookId` | JWT | JwtAuthGuard | Tiến trình học của user theo bookId |
| `POST /api/v1/vocabulary/progress/words` | JWT | JwtAuthGuard | Cập nhật số từ đã học trong unit |
| `POST /api/v1/vocabulary/progress/exercise` | JWT | JwtAuthGuard | Nộp bài tập, lưu exerciseScore |
| `POST /api/v1/vocabulary/progress/questions` | JWT | JwtAuthGuard | Nộp câu hỏi đọc hiểu, lưu questionScore |
| `POST /api/v1/vocabulary/books` | JWT+Role | ADMIN | Tạo sách mới |
| `PUT /api/v1/vocabulary/books/:id` | JWT+Role | ADMIN | Sửa sách |
| `DELETE /api/v1/vocabulary/books/:id` | JWT+Role | ADMIN | Xoá sách |
| `POST /api/v1/vocabulary/units` | JWT+Role | ADMIN | Tạo unit |
| `PUT /api/v1/vocabulary/units/:id` | JWT+Role | ADMIN | Sửa unit |
| `DELETE /api/v1/vocabulary/units/:id` | JWT+Role | ADMIN | Xoá unit |
| `POST /api/v1/vocabulary/words` | JWT+Role | ADMIN | Tạo từ |
| `PUT /api/v1/vocabulary/words/:id` | JWT+Role | ADMIN | Sửa từ |
| `DELETE /api/v1/vocabulary/words/:id` | JWT+Role | ADMIN | Xoá từ |

---

### Module: `grammar`

**File:** `grammar.controller.ts`, `grammar.service.ts`

Tương tự vocabulary. Hierarchy: `GrammarBook` → `GrammarUnit` (có `theoryContent` dạng HTML/Markdown) → `GrammarExercise` (type: `fill_blank`, `match`, `multiple_choice`, `rewrite`).

---

### Module: `exams`

**File:** `exams.controller.ts`, `exams.service.ts` (file service nặng nhất: 19KB)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `GET /api/v1/exams` | JWT | Danh sách tất cả bài thi |
| `GET /api/v1/exams/intensive/catalog` | JWT | Catalog bài thi theo skill (Reading/Listening/Writing/Speaking) |
| `GET /api/v1/exams/history` | JWT | Lịch sử thi của user |
| `GET /api/v1/exams/:id` | JWT | Chi tiết đề thi (questions dạng JSON) |
| `POST /api/v1/exams` | JWT | Tạo đề thi mới |
| `PATCH /api/v1/exams/:id` | JWT | Sửa đề thi |
| `DELETE /api/v1/exams/:id` | JWT | Xoá đề thi |
| `POST /api/v1/exams/:id/sessions` | JWT | Bắt đầu một lượt thi (tạo ExamSession) |
| `GET /api/v1/exams/sessions/:sessionId` | JWT | Lấy trạng thái session |
| `POST /api/v1/exams/sessions/:sessionId/submit` | JWT | Nộp bài → trigger AI grading qua RabbitMQ |
| `DELETE /api/v1/exams/sessions/:sessionId` | JWT | Xoá session |
| `POST /api/v1/exams/audio/upload` | JWT | Upload audio (Speaking) → MinIO, trả URL |

**Enum ExamType:** `FULL_TEST`, `READING`, `LISTENING`, `SPEAKING`, `WRITING`, `PRACTICE`
**Enum Difficulty:** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
**Enum SessionStatus:** `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `COMPLETED`, `ABANDONED`

---

### Module: `shadowing`

**File:** `shadowing.controller.ts`, `shadowing.service.ts`

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `GET /api/v1/shadowing/videos` | JWT | Danh sách video của user |
| `GET /api/v1/shadowing/videos/:id` | JWT | Chi tiết video + sentences |
| `POST /api/v1/shadowing/videos` | JWT | Tạo video mới (YouTube ID + sentences đã parse) |
| `PATCH /api/v1/shadowing/videos/:id` | JWT | Sửa video |
| `DELETE /api/v1/shadowing/videos/:id` | JWT | Xoá video |
| `GET /api/v1/shadowing/folders` | JWT | Danh sách thư mục |
| `POST /api/v1/shadowing/folders` | JWT | Tạo thư mục |
| `PATCH /api/v1/shadowing/folders/:name` | JWT | Đổi tên thư mục |
| `DELETE /api/v1/shadowing/folders/:name` | JWT | Xoá thư mục |
| `GET /api/v1/shadowing/progress` | JWT | Tất cả progress |
| `GET /api/v1/shadowing/progress/:lessonId` | JWT | Progress 1 lesson |
| `POST /api/v1/shadowing/progress` | JWT | Upsert progress (completedSentences, type: shadowing/dictation) |

Mỗi video lưu `sentences: Json` — mảng `{id, english, vietnamese, phonetic, words, audioStart, audioEnd}`.

---

### Module: `vocab-lab`

**File:** `vocab-lab.controller.ts`, `vocab-lab.service.ts`

Flashcard với thuật toán SM-2 (Spaced Repetition).

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `GET /api/v1/vocab-lab/decks` | JWT | Danh sách deck của user |
| `GET /api/v1/vocab-lab/decks/:id` | JWT | Chi tiết deck + flashcards |
| `POST /api/v1/vocab-lab/decks` | JWT | Tạo deck mới |
| `DELETE /api/v1/vocab-lab/decks/:id` | JWT | Xoá deck |
| `POST /api/v1/vocab-lab/cards` | JWT | Tạo flashcard (front/back/tags) |
| `PUT /api/v1/vocab-lab/cards/:id` | JWT | Sửa flashcard |
| `DELETE /api/v1/vocab-lab/cards/:id` | JWT | Xoá flashcard |
| `GET /api/v1/vocab-lab/cards` | JWT | Browse cards (filter: deckId, cardState, tag) |
| `GET /api/v1/vocab-lab/study/:deckId` | JWT | Lấy cards cần ôn hôm nay |
| `POST /api/v1/vocab-lab/review` | JWT | Submit review (rating 0-5, SM-2 update) |
| `GET /api/v1/vocab-lab/stats` | JWT | Thống kê học |
| `GET /api/v1/vocab-lab/tags` | JWT | Danh sách tags |

**CardState:** `NEW` → `LEARNING` → `REVIEW`
**SM-2 fields:** `interval`, `repetition`, `easeFactor`, `nextReviewDate`

---

### Module: `notes`

**File:** `notes.controller.ts`, `notes.service.ts`

Ghi chú per-user, per-exam, per-question. Unique key: `(userId, examId, questionNumber)`.

---

### Module: `pronunciation`

Xử lý luồng bất đồng bộ:
1. Mobile upload audio → MinIO, lấy URL
2. NestJS tạo `PronunciationAttempt` (status: `PENDING`)
3. Publish event lên RabbitMQ queue: `pronunciation-check-queue`
4. FastAPI consume → Whisper transcribe → tính score → update DB (status: `COMPLETED`)

---

### Module: `ai-client`

Publish message lên RabbitMQ:
- **Queue `exam-grading-queue`:** khi submit Speaking/Writing session
- **Queue `pronunciation-check-queue`:** khi submit pronunciation attempt

---

## 4. BACKEND AI — CHI TIẾT

**Entry point:** `backend-ai/app/main.py` (FastAPI)

### Startup sequence (lifespan):
1. Khởi tạo `GradingConsumer` (thread riêng) — lắng nghe `exam-grading-queue`
2. Khởi tạo `PronunciationConsumer` (thread riêng) — lắng nghe `pronunciation-check-queue`
3. Khi `PronunciationConsumer` init → load **WhisperModel** vào RAM (model: `base`, device: `cpu`, compute_type: `int8`) — mất 15-30s lần đầu

### REST Endpoints:

| Endpoint | Mô tả |
|----------|-------|
| `GET /health` | Health check: `{status: healthy, timestamp, environment}` |
| `GET /` | Root: `{message, version, status}` |
| `POST /api/v1/writing` | Grade Writing manually (Gemini API) |
| `POST /api/v1/speaking` | Grade Speaking manually |
| `POST /api/v1/grading` | Manual grading endpoint |

### Luồng chấm Writing (qua Gemini):
```
NestJS publish → RabbitMQ → GradingConsumer.callback()
  → grade_writing(task1_prompt, task2_prompt, task1_essay, task2_essay, task1_image_url)
  → fetch image từ URL (httpx)
  → gọi Gemini API (model: gemini-2.5-flash, fallback: gemini-1.5-pro)
  → parse JSON response → tính band score → update Result table
```

### Luồng chấm Pronunciation (qua Whisper):
```
NestJS publish → RabbitMQ → PronunciationConsumer.callback()
  → download audio từ MinIO → /tmp/{filename}
  → WhisperModel.transcribe() → get text
  → PronunciationService.analyze_pronunciation(transcribed, targetWord)
  → Levenshtein distance → score 0-100
  → update pronunciation_attempts table (status: COMPLETED)
```

---

## 5. DATABASE SCHEMA — CHI TIẾT

**Kết nối:** `host: localhost, port: 5433, db: toeic_db, user: toeic_user`
**8 migrations** từ `20260130` đến `20260326`

### Nhóm Auth & Users
```
users (id UUID, email UNIQUE, password, firstName, lastName, role, isActive)
  role: STUDENT | ADMIN | INSTRUCTOR
```

### Nhóm Exams & Results
```
exams (id, title, description, imageUrl, duration, type, difficulty, isPublished, questions JSON)
exam_sessions (id, userId→users, examId→exams, status, answers JSON, timeTaken, startedAt, submittedAt)
results (id, userId→users, sessionId UNIQUE→exam_sessions, totalScore, readingScore, listeningScore, speakingScore, writingScore, feedback JSON)

SessionStatus: IN_PROGRESS | SUBMITTED | GRADING | COMPLETED | ABANDONED
```

### Nhóm Learning (Lessons cũ)
```
lessons (id, title, description, difficulty, order, isPublished)
vocabularies (id, lessonId→lessons, word, meaning, ipa, audioUrl, example, partOfSpeech)
grammars (id, lessonId→lessons, title, rule TEXT, example)
learning_materials (id, title, content JSON, type MaterialType, difficulty, tags[], isPublished)
learning_progress (userId→users, materialId→learning_materials) [UNIQUE userId+materialId]
```

### Nhóm VocabularyBook (content chính)
```
vocabulary_books (id, name, imageUrl, wordCount, order)
vocabulary_units (id, bookId, title, order, storyTitle, storyContent TEXT, storyImageUrl)
vocabulary_words (id, unitId, word, meaning, ipa, partOfSpeech, example, imageUrl, audioUrl, order)
vocabulary_exercises (id, unitId, question, answer, options JSON, order)   ← definition matching
vocabulary_questions (id, unitId, question, type, options JSON, answer, order)  ← story comprehension
vocabulary_progress (userId, unitId, wordsLearned, totalWords=20, exerciseScore, questionScore, isCompleted, completedAt) [UNIQUE userId+unitId]
```

### Nhóm GrammarBook
```
grammar_books (id, slug UNIQUE, name, author, level, imageUrl, color, unitCount)
grammar_units (id, bookId, title, order, theoryContent TEXT)
grammar_exercises (id, unitId, section, question TEXT, type, options JSON, answer TEXT, order)
  type: fill_blank | match | multiple_choice | rewrite
```

### Nhóm Pronunciation
```
pronunciation_sounds (id, symbol UNIQUE, type, word, description TEXT, imageUrl, audioUrl, voiced, order)
  type: monophthong | diphthong | consonant

pronunciation_attempts (id, userId→users, vocabularyId→vocabularies, audioUrl, transcribedText, targetWord, score 0-100, feedback JSON, status)
  status: PENDING | PROCESSING | COMPLETED | FAILED
```

### Nhóm Vocab Lab (SM-2 Flashcards)
```
decks (id, userId→users, name)
flashcards (id, deckId→decks, front, back TEXT, tags[], interval, repetition, easeFactor=2.5, nextReviewDate, cardState)
  cardState: NEW | LEARNING | REVIEW
flashcard_reviews (id, flashcardId→flashcards, rating 0-5, reviewedAt)
```

### Nhóm Notes
```
question_notes (userId, examId, questionNumber, noteText TEXT) [UNIQUE userId+examId+questionNumber]
```

### Nhóm Shadowing & Dictation
```
shadowing_videos (id, userId→users, title, youtubeVideoId, folder, category, duration, sentences JSON)
  sentences JSON: [{id, english, vietnamese, phonetic, words, audioStart, audioEnd}]

shadowing_folders (userId, name) [UNIQUE userId+name]

shadowing_dictation_progress (userId, lessonId, type, completedSentences INT[], dictationDifficulty)
  type: shadowing | dictation
  dictationDifficulty: Beginner | Intermediate | Advanced | Expert
  [UNIQUE userId+lessonId+type]
```

---

## 6. FRONTEND WEB — CHI TIẾT ROUTES

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Cloudinary (images)
**API base:** `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`

### Pages (src/app/)

| Route | Trang | Mô tả |
|-------|-------|-------|
| `/` | `page.tsx` | Landing page (hero, call-to-action "START LEARNING") |
| `/login` | `login/` | Đăng nhập |
| `/register` | `register/` | Đăng ký |
| `/vocabulary` | `vocabulary/page.tsx` | Danh sách VocabularyBook (có dữ liệu tĩnh từ `data.ts`) |
| `/vocabulary/[bookSlug]` | `vocabulary/[bookSlug]/` | Chi tiết book → units |
| `/grammar` | `grammar/` | Danh sách GrammarBook |
| `/pronunciation` | `pronunciation/` | Luyện phát âm |
| `/shadowing-dictation` | `shadowing-dictation/page.tsx` | Trang chính Shadowing (16KB — phức tạp nhất) |
| `/shadowing-dictation/[id]` | `shadowing-dictation/[id]/` | Practice 1 video |
| `/shadowing-dictation/my-videos` | `shadowing-dictation/my-videos/` | Quản lý video của user |
| `/vocab-lab` | `vocab-lab/page.tsx` | Danh sách Deck |
| `/vocab-lab/study` | `vocab-lab/study/` | Học flashcard (SM-2 session) |
| `/ielts` | `ielts/page.tsx` | Catalog bài thi IELTS |
| `/ielts/intensive` | `ielts/intensive/page.tsx` | Danh sách bài thi intensive (31KB — lớn nhất) |
| `/ielts/intensive/[examId]` | `ielts/intensive/[examId]/` | Làm bài thi |
| `/ielts/history` | `ielts/history/` | Lịch sử thi |
| `/lessons` | `lessons/` | Bài học (Lessons cũ) |

### API Services (src/services/)

| File | Gọi gì |
|------|--------|
| `auth.service.ts` | POST /auth/register, /auth/login |
| `exams.api.ts` | GET /exams, /exams/intensive/catalog, sessions CRUD |
| `learning.api.ts` | Vocabulary API (books, units, progress) |
| `lesson.service.ts` | GET /lessons |
| `notes.api.ts` | Notes CRUD |
| `shadowing.api.ts` | Shadowing videos, folders, progress |
| `vocabLab.api.ts` | Decks, cards, review, stats |

---

## 7. FRONTEND MOBILE — CHI TIẾT ROUTES

**Stack:** Expo SDK 52 · expo-router · TypeScript
**API base:** `EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1`

### Screens (app/)

```
app/
├── (auth)/                    # Auth stack
│   ├── login.tsx              # Màn hình đăng nhập
│   └── register.tsx           # Màn hình đăng ký
│
├── (tabs)/                    # Bottom tab navigation
│   ├── _layout.tsx            # Tab bar config (5 tabs)
│   ├── index.tsx              # Tab Home — trang chủ
│   ├── vocabulary.tsx         # Tab Vocabulary — danh sách sách
│   ├── grammar.tsx            # Tab Grammar — danh sách sách ngữ pháp
│   ├── pronunciation.tsx      # Tab Pronunciation — IPA sounds
│   └── profile.tsx            # Tab Profile — thông tin user
│
├── vocabulary/
│   ├── [bookId].tsx           # Chi tiết book (units list)
│   └── [bookId]/              # Sub-routes của book
│
├── grammar/                   # Màn hình ngữ pháp chi tiết
│
├── exams.tsx                  # Màn hình thi
└── results.tsx                # Màn hình kết quả
```

### Services & Config

```
frontend-mobile/
├── services/                  # API caller functions
├── config/                    # env.ts — centralized env access
├── constants/                 # Hằng số app
├── contexts/                  # React Context (AuthContext...)
├── hooks/                     # Custom hooks
└── types/                     # TypeScript interfaces
```

---

## 8. INFRASTRUCTURE

### Docker Compose (local dev)

| Container | Image | Port ngoài:trong | Data Volume |
|-----------|-------|------------------|-------------|
| `toeic-postgres` | postgres:16-alpine | `5433:5432` | `toeic_postgres_data` |
| `toeic-redis` | redis:7-alpine | `6379:6379` | `toeic_redis_data` |
| `toeic-rabbitmq` | rabbitmq:3-management-alpine | `5672:5672`, `15672:15672` | `toeic_rabbitmq_data` |
| `toeic-minio` | minio/minio:latest | `9000:9000`, `9001:9001` | `toeic_minio_data` |
| `toeic-pgadmin` | dpage/pgadmin4:latest | `5050:80` | `toeic_pgadmin_data` |

**Network:** `toeic-network` (bridge)

### Scripts trong `package.json` (root)

```bash
npm run infra:up      # docker-compose up -d
npm run infra:down    # docker-compose down
npm run infra:logs    # docker-compose logs -f
npm run infra:clean   # docker-compose down -v (xoá cả volumes!)
npm run backend:dev   # cd backend-core && npm run start:dev
npm run ai:dev        # cd backend-ai && uvicorn app.main:app --reload
npm run web:dev       # cd frontend-web && npm run dev
npm run mobile:dev    # cd frontend-mobile && npm start
npm run dev:all       # chạy backend + ai + web song song (concurrently)
npm run prisma:migrate # npx prisma migrate dev
npm run prisma:studio  # npx prisma studio (GUI DB)
```

---

## 9. LUỒNG KHỞI CHẠY ĐẦY ĐỦ

```bash
# 1. Infrastructure (Docker)
docker-compose up -d

# 2. Backend Core — cần làm 1 lần đầu
cd backend-core
sudo chown -R $(whoami) ~/.cache ~/.npm   # fix permission (1 lần)
npx prisma migrate dev --name init        # apply 8 migrations
npx prisma generate                       # tạo Prisma Client types
npm run start:dev                          # NestJS hot-reload → port 3000

# 3. AI Service
cd backend-ai
source venv/bin/activate
pip install google-genai                  # cài thêm package mới
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  → port 8000

# 4. Frontend Web
cd frontend-web
npm install
npm run dev  → http://localhost:3001

# 5. Frontend Mobile (tuỳ chọn)
cd frontend-mobile
npm install
npm start  → Expo QR code
```

---

## 10. ENDPOINTS KIỂM TRA HEALTH

```bash
curl http://localhost:3000/api/v1
# → {"message":"TOEIC Master AI - Core Backend API","version":"1.0.0","status":"running"}

curl http://localhost:8000/health
# → {"status":"healthy","timestamp":"...","environment":"development","service":"ai-service"}

curl -o /dev/null -w "%{http_code}" http://localhost:3001
# → 200
```

---

## 11. NHỮNG GÌ CHƯA IMPLEMENT / CÒN TODO

| Vị trí | Vấn đề |
|--------|--------|
| `auth.controller.ts` line 24 | `POST /auth/refresh` — TODO, chưa implement |
| `backend-core/src/main.ts` | Không có `helmet` (đã config theo AI_CONTEXT nhưng chưa code) |
| `backend-core/src/main.ts` | Không có Swagger setup |
| `backend-ai/.env` | `GEMINI_API_KEY=""` — phải điền để grading hoạt động |
| `frontend-web` | Chưa có trang Admin |
| `requirements.txt` | `faster-whisper==1.0.1` outdated, đã upgrade lên `1.2.1` trong venv |

---

## 12. CÁC FILE QUAN TRỌNG CẦN NẮM

| File | Vai trò |
|------|---------|
| `backend-core/prisma/schema.prisma` | Toàn bộ database schema (565 dòng) |
| `backend-core/prisma/seed.ts` | Dữ liệu mẫu (24KB) |
| `backend-core/src/main.ts` | Bootstrap app — global config |
| `backend-core/.env` | DB, Redis, RabbitMQ, JWT, MinIO, Cloudinary config |
| `backend-ai/app/main.py` | FastAPI entry point + consumer startup |
| `backend-ai/app/services/writing_grader.py` | Gemini grading logic |
| `backend-ai/.env` | RabbitMQ, DB, MinIO, Gemini key |
| `docker-compose.yml` | Toàn bộ infrastructure local |
| `AI_CONTEXT.md` | Quy tắc bất biến của project (bắt buộc tuân theo) |

---

*Tạo bởi: AI Agent | Dựa trên code thực tế tại commit mới nhất của nhánh main*
