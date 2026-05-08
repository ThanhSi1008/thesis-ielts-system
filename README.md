# IELTS Master English AI

A full-stack AI-powered IELTS preparation platform. Built as a thesis project, evolved from an initial TOEIC structure into a comprehensive English mastery system covering all four IELTS skills.

**Live domains:** Frontend → ielts-master.io.vn · Backend API → dedangdown.io.vn

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│   ┌─────────────────────┐       ┌─────────────────────┐      │
│   │  Mobile (Expo 54)   │       │  Web (Next.js 14)   │      │
│   │  React Native 0.81  │       │  TypeScript/Tailwind │      │
│   └─────────────────────┘       └─────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     Application Layer                         │
│  ┌─────────────────────┐   ┌──────────┐   ┌──────────────┐  │
│  │  Core Backend       │──▶│ RabbitMQ │──▶│  AI Service  │  │
│  │  NestJS 10          │   │          │   │  FastAPI 0.109│  │
│  │  18 modules         │   └──────────┘   │  Whisper     │  │
│  │  Prisma 5 / Postgres│                  │  Gemini      │  │
│  │  Redis (ioredis)    │                  └──────────────┘  │
│  └─────────────────────┘                                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         Data Layer                            │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │  PostgreSQL  │  │   Redis    │  │   MinIO / GCS (S3)   │ │
│  │  (55+ models)│  │  (cache)   │  │  audio & media assets │ │
│  └──────────────┘  └────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Deployment (GCP, region: asia-southeast1):**
- Frontend Web → Google Cloud Run (managed, auto-scaled) — `ielts-master.io.vn`
- Backend → GCP VM (Docker Compose): nginx + backend-core + backend-ai — `dedangdown.io.vn`
  - nginx terminates SSL (Let's Encrypt), routes `/api/v1/` → backend-core:3000, `/ai/` → backend-ai:8000
  - PostgreSQL, Redis, RabbitMQ run directly on the VM (outside Docker Compose)
  - Object storage in production: Google Cloud Storage (GCS)
- CI/CD via GitHub Actions on push to `main`/`deploy`: path-filtered builds → images pushed to GCR → SSH deploy to VM

---

## Features

### IELTS Learning Tiers

| Tier | What's implemented |
|---|---|
| **Foundation** | Vocabulary books (4000 Essential Words dataset), grammar lessons (Cambridge Grammar in Use units), IPA pronunciation sounds library with practice attempts |
| **Basic** | Skill-specific lessons across Listening, Reading, Writing, Speaking with exercises and per-user progress tracking |
| **Advanced** | Full-length practice sessions — timed reading parts, audio-based listening, writing prompts, speaking rounds — each with session state |
| **Intensive** | Mock exam engine with "Save & Pause" session persistence, AI auto-grading for writing and speaking, score history |

### AI & Machine Learning

- **Speech-to-Text** — Faster-Whisper (base model, CPU/CUDA) for pronunciation assessment and dictation transcription
- **Writing Grading** — Google Gemini with IELTS rubric: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
- **Speaking Grading** — Gemini-powered evaluation aligned with IELTS speaking band descriptors (467 lines of scoring logic)
- **Pronunciation Assessment** — IPA conversion via `eng-to-ipa` + Levenshtein distance scoring against reference transcription
- **AI Chat Tutor** — Persistent assistant available across all screens for translation and explanation
- **Async processing** — Grading submitted to RabbitMQ queue; AI service consumes and posts results back via callback

### Vocabulary & Grammar

- **Vocab Lab** — Anki-style flashcard decks using FSRS (Free Spaced Repetition Scheduler) algorithm, custom card templates (front/back), community deck sharing
- **Vocabulary Module** — 4000 Essential English Words with comprehension exercises and matching questions
- **Grammar Module** — Unit-based lessons with exercises and progress tracking
- **Quick-Add FAB** — Global Floating Action Button to add words to Vocab Lab from any screen

### Engagement & Social

- **Gamification** — XP logs, achievement badges, daily study streaks
- **Community** — Posts (study tips, score achievements, general discussion), threaded comments, likes, bookmarks
- **Notifications** — WebSocket-based real-time notifications (streak milestones, exam graded, review due, new lesson, achievements)
- **Teacher–Student** — Instructor linking for classroom management

### Shadowing & Dictation

- Video-based shadowing practice with folder organisation and progress tracking
- Audio dictation with transcription comparison and scoring

### Subscription & Payments

- Three-tier plans: Free, Premium, Pro with feature-level usage limits
- **VNPay** integration with HMAC-SHA512 signature verification (production)
- Mock payment provider for development
- Subscription lifecycle management via cron job (auto-expiry, trial handling)

---

## Technology Stack

### Backend Core — NestJS 10 (TypeScript)

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (ioredis) |
| Message Broker | RabbitMQ 3 (amqplib) |
| Storage | AWS S3 SDK — MinIO (local dev) / GCS (production) |
| Auth | JWT + Passport + Google OAuth (google-auth-library) |
| Real-time | WebSockets (@nestjs/websockets) |
| Scheduling | @nestjs/schedule |
| Spaced Repetition | ts-fsrs |
| Media | music-metadata, youtube-transcript, cheerio, yt-dlp |

### AI Service — FastAPI (Python)

| Component | Technology |
|---|---|
| Framework | FastAPI 0.109 + Uvicorn |
| Speech-to-Text | faster-whisper ≥ 1.0.1 |
| LLM Grading | Google Gemini (google-genai) |
| Queue Consumer | Pika (RabbitMQ) |
| ORM | SQLAlchemy 2 + psycopg2 |
| Storage | boto3 (MinIO local) + google-cloud-storage (GCS production) |
| Pronunciation | eng-to-ipa + python-Levenshtein |

### Frontend Web — Next.js 14

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| UI | Radix UI primitives |
| Animation | Framer Motion 12 |
| State | Zustand 4 |
| Forms | React Hook Form 7 + Zod |
| Auth | @react-oauth/google |

### Frontend Mobile — React Native Expo 54

| Layer | Technology |
|---|---|
| Framework | Expo 54 / Expo Router 6 |
| Runtime | React Native 0.81.5, React 19 |
| Language | TypeScript 5 |
| Audio/Video | expo-av |
| Speech | expo-speech-recognition |
| Animation | react-native-reanimated 4 |
| Storage | AsyncStorage |

---

## Local Development

### Prerequisites

- Docker (v24+) and Docker Compose
- Node.js v20 LTS and npm v10
- Python 3.11+

### 1. Start Infrastructure

```bash
docker-compose up -d
```

| Service | Port | UI |
|---|---|---|
| PostgreSQL 16 | 5433 | PgAdmin → localhost:5050 |
| Redis 7 | 6379 | — |
| RabbitMQ 3 | 5672 | Management → localhost:15672 |
| MinIO (local S3) | 9000 | Console → localhost:9001 |

> Production uses GCS instead of MinIO. MinIO is only used in local development.

### 2. Backend Core (NestJS)

```bash
cd backend-core
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
# http://localhost:3000
```

### 3. AI Service (FastAPI)

```bash
cd backend-ai
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# http://localhost:8000
```

> If `faster-whisper` is not installed, the transcription service falls back to a mock response. Set a Gemini API key in `.env` to enable real grading.

### 4. Frontend Web (Next.js)

```bash
cd frontend-web
npm install
cp .env.example .env.local
npm run dev
# http://localhost:3001
```

### 5. Frontend Mobile (Expo)

```bash
cd frontend-mobile
npm install
cp .env.example .env
npm start
```

### Run Everything at Once

```bash
npm run dev:all   # Concurrently: NestJS + Next.js (FastAPI started separately)
```

---

## Project Structure

```
thesis-toeic-system/
├── backend-core/                  # NestJS modular monolith
│   ├── prisma/schema.prisma       # 55+ models across 8 domains
│   └── src/modules/
│       ├── auth/                  # JWT, Google OAuth, Passport strategies
│       ├── users/                 # User CRUD, profile, teacher–student links
│       ├── exams/                 # Mock exam engine, session persistence
│       ├── results/               # Score storage, AI grading callbacks
│       ├── ielts/                 # Foundation / Basic / Advanced content + sessions
│       ├── vocabulary/            # 4000-word dataset, exercises, questions
│       ├── vocab-lab/             # FSRS flashcard engine, deck sharing
│       ├── grammar/               # Unit lessons, exercises, progress
│       ├── shadowing/             # Video practice, folders, progress
│       ├── dictation/             # Audio dictation, folders, scoring
│       ├── pronunciation/         # IPA sounds library, practice attempts
│       ├── learning/              # Generic learning materials and progress
│       ├── notes/                 # Per-question user notes
│       ├── gamification/          # XP, achievements, streaks
│       ├── notifications/         # WebSocket notification service
│       ├── posts/                 # Community posts, comments, likes, bookmarks
│       ├── subscriptions/         # Plans, VNPay, mock provider, cron expiry
│       └── ai-client/             # RabbitMQ publisher to AI service
│
├── backend-ai/                    # FastAPI AI worker
│   └── app/
│       ├── api/                   # Endpoints: chat, grading, speaking, writing, health
│       ├── consumers/             # RabbitMQ event consumers
│       ├── services/              # Whisper transcription, Gemini grading, pronunciation, storage
│       ├── prompts/               # LLM prompt templates for IELTS scoring
│       └── models/                # Pydantic request/response schemas
│
├── frontend-web/                  # Next.js 14 web portal
│   └── src/app/
│       ├── ielts/                 # /basic, /advanced, /intensive, /dashboard, /history ...
│       ├── vocab-lab/             # Flashcard UI
│       ├── grammar/               # Grammar lessons
│       ├── shadowing-dictation/   # Shadowing and dictation practice
│       ├── pronunciation/         # Pronunciation checker
│       ├── community/             # Posts and comments
│       ├── pricing/               # Subscription plans
│       ├── payment/vnpay-return/  # VNPay callback handler
│       ├── admin/                 # Admin dashboard (users, subscriptions, content)
│       ├── login/ & register/     # Auth pages
│       └── profile/               # User profile
│
├── frontend-mobile/               # React Native Expo app
│   └── app/
│       ├── (tabs)/                # ielts, vocabulary, pronunciation, grammar, profile, more
│       ├── ielts/                 # IELTS sub-routes
│       ├── vocabulary/            # Vocabulary sub-routes
│       ├── vocab-lab/             # Vocab lab sub-routes
│       ├── grammar/               # Grammar sub-routes
│       ├── shadowing/             # Shadowing sub-routes
│       └── login/ & register/     # Auth screens
│
├── docs/deployment/               # Deployment checklist and notes
├── docker-compose.yml             # Local dev: Postgres, Redis, RabbitMQ, MinIO, PgAdmin
└── package.json                   # Monorepo scripts (concurrently)
```

---

## Key Development Notes

### FastAPI Routing and Trailing Slashes

Use exact route prefixes (`@router.post("")`) rather than trailing slashes to avoid silent `307 Temporary Redirect` failures that break CORS preflight between Next.js and FastAPI.

### IELTS Intensive Session Persistence

The exam engine enforces "Protect Session" semantics. Navigating away from an active test must trigger programmatic session saving via the API — otherwise the session is silently dropped.

### AI Grading Queue Flow

Writing and speaking submissions are published to RabbitMQ by the `ai-client` module and consumed asynchronously by the FastAPI worker. Results are posted back to the NestJS callback endpoint. Session status transitions: `IN_PROGRESS → SUBMITTED → GRADING → GRADED`.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit and push.
4. Open a Pull Request against `main`.

---

## License

MIT License
