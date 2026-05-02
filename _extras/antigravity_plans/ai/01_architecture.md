# Stage 1 — System Architecture

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌──────────────────┐         ┌──────────────────────┐             │
│  │  Next.js Web     │         │  Expo Mobile          │             │
│  │  Port 3001       │         │  (React Native)       │             │
│  └───────┬──────────┘         └──────────┬───────────┘             │
│          │ HTTP REST                      │ HTTP REST               │
└──────────┼────────────────────────────────┼─────────────────────────┘
           │                                │
           ▼                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND CORE (NestJS)                           │
│  Port 3000 — Prefix: /api/v1                                        │
│                                                                      │
│  ┌──────┐ ┌───────┐ ┌───────────┐ ┌─────────┐ ┌──────────┐        │
│  │ Auth │ │ Exams │ │ Vocabulary│ │ Grammar │ │Pronuncia-│        │
│  │      │ │       │ │           │ │         │ │tion      │        │
│  └──────┘ └───────┘ └───────────┘ └─────────┘ └──────────┘        │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐         │
│  │VocabLab  │ │ Shadowing │ │  IELTS   │ │ Notifications│         │
│  │(SRS FSRS)│ │(Dictation)│ │(Practice)│ │              │         │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────┘         │
│                                                                      │
│  Shared: PrismaService, StorageService, RabbitMQ AiClientService    │
└──────────┬─────────────────────────────────────────┬─────────────────┘
           │ Prisma ORM                              │ AMQP (RabbitMQ)
           ▼                                         ▼
┌──────────────────┐                    ┌──────────────────────────────┐
│   PostgreSQL     │                    │     BACKEND AI (FastAPI)     │
│   Port 5433      │◄───psycopg2────── │     Port 8000                │
│                  │                    │                              │
│   35+ models     │                    │  Consumers:                  │
│   8+ migrations  │                    │    grading_consumer.py       │
│                  │                    │    pronunciation_consumer.py │
└──────────────────┘                    │                              │
                                        │  Services:                   │
┌──────────────────┐                    │    transcription (Whisper)   │
│   Redis          │                    │    pronunciation (scoring)   │
│   Port 6379      │                    │    writing_grader (Gemini)   │
│   (caching)      │                    │    speaking_grader (Gemini)  │
└──────────────────┘                    │    grading_service           │
                                        │    storage_service (MinIO)   │
┌──────────────────┐                    └──────────────────────────────┘
│   MinIO          │
│   Port 9000      │
│   (file storage) │
└──────────────────┘

┌──────────────────┐
│   RabbitMQ       │
│   Port 5672      │
│   UI: 15672      │
│                  │
│  Queues:         │
│   exam-grading   │
│   pronunciation  │
└──────────────────┘
```

## Request Flow Examples

### 1. User takes an IELTS Listening test

```
Browser → POST /api/v1/exams/sessions/:id/submit
  → ExamsController.submitSession()
  → ExamsService.submitSession() — saves answers to DB
  → AiClientService.publishGradingJob() — publishes to RabbitMQ
  → (async) grading_consumer.py picks up the message
  → grading_service.py grades answers
  → psycopg2 UPDATE exam_sessions SET status='COMPLETED', score=...
  → Browser polls GET /api/v1/exams/sessions/:id → sees COMPLETED
```

### 2. User records pronunciation

```
Browser → POST /api/v1/pronunciation/check (multipart audio file)
  → PronunciationController.check()
  → PronunciationService.createAttempt() — uploads audio to MinIO, saves attempt
  → AiClientService.publishPronunciationCheck() → RabbitMQ
  → (async) pronunciation_consumer.py picks up
  → transcription_service.py → Whisper STT → text
  → pronunciation_service.py → Levenshtein scoring
  → psycopg2 UPDATE pronunciation_attempts SET score=...
```

### 3. User reviews a flashcard (synchronous, no AI)

```
Browser → POST /api/v1/vocab-lab/review { flashcardId, rating }
  → VocabLabController.submitReview()
  → VocabLabService.submitReview() — runs FSRS algorithm, updates card scheduling
  → Returns updated card to browser immediately
```

## Directory Structure

```
thesis-toeic-system/
├── backend-core/          ← NestJS (TypeScript)
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/       ← Shared (PrismaService, StorageService, Guards)
│   │   └── modules/      ← 14 domain modules
│   └── prisma/
│       ├── schema.prisma  ← 35+ models, 998 lines
│       ├── seed.ts
│       ├── data/          ← Seed data files (vocabulary, grammar, etc.)
│       └── migrations/
├── backend-ai/            ← FastAPI (Python 3.12)
│   └── app/
│       ├── main.py
│       ├── api/           ← REST endpoints
│       ├── consumers/     ← RabbitMQ consumers
│       └── services/      ← Business logic (Whisper, Gemini, scoring)
├── frontend-web/          ← Next.js 14 (TypeScript)
│   └── src/
│       ├── app/           ← Pages (App Router)
│       ├── components/    ← Shared UI components
│       ├── services/      ← API client functions
│       ├── stores/        ← Zustand stores
│       ├── types/         ← TypeScript interfaces
│       └── config/        ← Environment config
├── frontend-mobile/       ← Expo SDK 52 (TypeScript)
├── infrastructure/        ← Docker configs
└── docker-compose.yml     ← All infra services
```

## Ports & Credentials (Local Development)

| Service | Port | Access |
|---------|------|--------|
| NestJS Backend | 3000 | `http://localhost:3000/api/v1` |
| FastAPI AI | 8000 | `http://localhost:8000` |
| Next.js Web | 3001 | `http://localhost:3001` |
| PostgreSQL | **5433** | user: `toeic_user`, pass: `toeic_password`, db: `toeic_db` |
| Redis | 6379 | No auth |
| RabbitMQ | 5672 / 15672 (UI) | user: `toeic`, pass: `toeic_password` |
| MinIO | 9000 / 9001 (Console) | user: `minioadmin`, pass: `minioadmin` |

> ⚠️ PostgreSQL is on port **5433**, not the default 5432.

## Startup Order

```bash
# 1. Infrastructure
docker-compose up -d

# 2. Backend Core (in backend-core/)
npx prisma migrate dev && npx prisma generate  # first time only
npm run start:dev

# 3. Backend AI (in backend-ai/)
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Frontend Web (in frontend-web/)
npm run dev

# Or from project root using workspace scripts:
npm run backend:dev    # starts NestJS
npm run web:dev        # starts Next.js
```
