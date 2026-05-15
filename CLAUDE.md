# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tool Usage Rules (RTK Optimization)

- NEVER use Read tool for files — always use `cat`, `head`, or `rtk read` via Bash
- NEVER use Grep tool — always use `rg` or `rtk grep` via Bash
- NEVER use Glob tool — always use `find` or `rtk find` via Bash
- For large files (>500 lines): use `rtk read <file>`
- For schema/config files: use `rtk read <file> -l aggressive`

## Project Overview

**IELTS Master English AI** — a full-stack AI-powered IELTS preparation platform (originally bootstrapped as TOEIC and still named `toeic-master-ai` at the workspace level). Four deployable units:

1. **`backend-core`** — NestJS 10 modular monolith (TypeScript) — primary API on port `3000`, prefix `/api/v1`
2. **`backend-ai`** — FastAPI 0.109 microservice (Python 3.11) — AI/ML workloads on port `8000`
3. **`frontend-web`** — Next.js 14 App Router (TypeScript) — web portal on port `3001`
4. **`frontend-mobile`** — Expo 54 / React Native 0.81 / React 19 — Expo Router, NativeWind v4

The two backends communicate **asynchronously via RabbitMQ** for grading, pronunciation analysis, and YouTube dictation transcription. AI workers post results back to NestJS via HTTP callback.

### Deployment topology

| Component                                         | Environment                                                                      | Notes                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| `frontend-web`                                    | **Google Cloud Run** (auto-scaled, region `asia-southeast1`)                     | Domain: `ielts-master.io.vn` |
| `backend-core` + `backend-ai` + `nginx` + `alloy` | **GCP VM `n2-standard-4`** (4 vCPU, 16 GB RAM) via Docker Compose at `/opt/app/` | Domain: `dedangdown.io.vn`   |
| Database                                          | **Supabase** (managed PostgreSQL, PgBouncer `:6543` + Direct `:5432`)            | —                            |
| Cache                                             | **Upstash** (managed Redis, TLS `rediss://`)                                     | —                            |
| Message broker                                    | **CloudAMQP** (managed RabbitMQ, AMQPS)                                          | —                            |
| Object storage                                    | **Google Cloud Storage** (audio/media) + **Cloudinary** (images/CDN)             | —                            |
| Telemetry sink                                    | **Grafana Cloud** (Prometheus + Loki + Tempo)                                    | Collected by Alloy on the VM |

Nginx (Alpine) terminates TLS (Let's Encrypt + Certbot, TLSv1.2/1.3) and routes `/api/v1/*` → `backend-core:3000`, `/ai/*` → `backend-ai:8000`. The `backend-ai` container is capped at 10 GB RAM and 3 CPUs.

**Local development** uses Docker Compose (`docker-compose.yml` at the repo root) for PostgreSQL 16, Redis 7, RabbitMQ 3, MinIO, and pgAdmin 4. The mock payment provider is used by default unless `PAYMENT_PROVIDER=vnpay` is set.

## Commands

### Infrastructure (local only — production uses managed services)

```bash
npm run infra:up       # Start Postgres :5433, Redis :6379, RabbitMQ :5672/:15672, MinIO :9000/:9001, pgAdmin :5050
npm run infra:down     # Stop containers
npm run infra:clean    # Stop and delete named volumes
npm run infra:logs     # Tail compose logs
```

### Backend Core (NestJS)

```bash
cd backend-core
npm run start:dev      # nest start --watch
npm run build          # nest build && tsc-alias
npm run lint           # ESLint with --fix
npm run test           # Jest unit tests (rootDir: src, *.spec.ts)
npm run test:e2e       # jest --config ./test/jest-e2e.json
npx jest path/to/file.spec.ts
npm run prisma:migrate # prisma migrate dev
npm run prisma:studio  # Prisma Studio GUI
npm run prisma:seed    # ts-node prisma/seed.ts
```

### Backend AI (FastAPI / Python 3.11)

```bash
cd backend-ai
python -m venv venv && source venv/bin/activate   # First time only
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pytest                                            # If tests exist
```

If `faster-whisper` is missing the transcription service falls back to a mock that returns `"hello"` — useful for non-ML local work.

### Frontend Web (Next.js)

```bash
cd frontend-web
npm run dev            # next dev -p 3001
npm run build
npm run lint
npm run type-check     # tsc --noEmit
```

### Frontend Mobile (Expo)

```bash
cd frontend-mobile
npm start              # expo start
npm run ios            # expo run:ios
npm run android        # expo run:android
```

### Root-level shortcuts (npm workspaces: `backend-core`, `frontend-web`)

```bash
npm run backend:dev    # backend-core
npm run ai:dev         # backend-ai (uses Windows path in package.json — adjust on macOS/Linux)
npm run web:dev        # frontend-web
npm run mobile:dev     # frontend-mobile
npm run dev:all        # concurrently: backend-core + backend-ai + frontend-web
npm run prisma:migrate
npm run prisma:studio
```

## Architecture

### Backend Core (`backend-core/src/`)

NestJS 10 modular monolith. `main.ts` sets global prefix `api/v1`, enables CORS from `CORS_ORIGIN` (comma-separated), and raises Express body limits to `50mb` (for base64 audio). Global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted`, and `transform`. Throttler is enabled globally (100 req / 60 s).

**Feature modules registered in `app.module.ts`:**
`AuthModule`, `UsersModule`, `ExamsModule`, `ResultsModule`, `LearningModule`, `AiClientModule`, `IeltsModule`, `VocabularyModule`, `GrammarModule`, `PronunciationModule`, `VocabLabModule`, `NotesModule`, `ShadowingModule`, `DictationModule`, `NotificationsModule`, `PostsModule`, `GamificationModule`, `SubscriptionsModule`.

**Global common modules:**

- `PrismaModule` — single `PrismaService` (`@Global()`)
- `RedisModule` — ioredis-backed
- `CacheModule` — app-level cache wrapper
- `PrometheusModule` (`@willsoto/nestjs-prometheus`) — `/metrics` endpoint with default Node metrics
- `ScheduleModule` (`@nestjs/schedule`) — used by subscription lifecycle cron
- `ThrottlerModule` (`@nestjs/throttler`)

**Auth:** Email/password (bcrypt) + Google OAuth via `google-auth-library`. `googleLogin` accepts ID tokens whose audience matches any of `GOOGLE_CLIENT_ID` (web), `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`. JWT issued via `@nestjs/jwt`. Guards/decorators live in `src/modules/auth/` and `src/common/{guards,decorators}/` (`roles.guard.ts`, `roles.decorator.ts`).

**IELTS module** is the largest feature, split into:

- `ielts.service.ts` — Foundation + Basic content
- `ielts-advanced.service.ts` — full-length practice sessions across L/R/W/S
- `ielts-roadmap.service.ts` — personalised study path
- `ielts-statistics.service.ts` — analytics aggregation
- `streak.service.ts` — daily-streak tracking

**AI client (`ai-client/`):** Publishes durable messages to RabbitMQ. Two queues are asserted:

- `exam-grading-queue` — TTL `300000ms`, dead-lettered to `exam-grading-dlq`
- `dictation-transcription-queue`

Pronunciation tasks share the grading channel via the `pronunciation-check-queue` consumer on the AI side. Result delivery is HTTP callback to `BACKEND_CORE_URL`.

**Subscriptions module:** Tiers `FREE / PREMIUM / PRO`, providers `MOCK / VNPAY / STRIPE / MANUAL`. Quotas tracked in `UsageRecord` (monthly) and per-day for `PRONUNCIATION_ATTEMPT`. 7-day Premium trial available once per user. `subscriptions.cron.ts` runs daily at 2:00 AM to send 7/3/1-day expiry reminders, downgrade expired subs (3-day grace), and end trials. VNPay payments verified via HMAC-SHA512 + IPN webhook.

**Storage (`src/common/storage/`):** Wraps Cloudinary v2 SDK — `uploadFile(file, folder)` returns the secure URL, `deleteFile(url)` parses `public_id` from the URL. Used for all user-uploaded images.

**Database:** Prisma 5 (`schema.prisma`, ~1440 lines, **66 models**). The Postgres datasource takes both `DATABASE_URL` (pooled) and `directUrl` (`DIRECT_URL`, used by migrations). Key domains:

| Domain                      | Representative models                                                                                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity                    | `User` (roles `STUDENT / INSTRUCTOR / ADMIN`), `StudentTeacherLink`, `IeltsProfile`                                                                                                                                                                                       |
| Foundation tier             | `FoundationVocabBook/Unit/Item/Question/Progress`, `FoundationVocabLesson/Word`, `FoundationGrammarBook/Unit/Exercise/Progress`, `Grammar`, `FoundationPronunciationSound`, `FoundationSoundExample`, `FoundationPronunciationAttempt`, `FoundationPronunciationProgress` |
| IELTS Basic                 | `IeltsBasicSkill`, `IeltsBasicLesson`, `IeltsBasicListeningExercise`, `IeltsBasicReadingExercise`, `IeltsBasicWritingExercise`, `IeltsBasicWritingAnswer`, `IeltsBasicSpeakingExercise`, `IeltsBasicProgress`                                                             |
| IELTS Advanced              | `IeltsAdvancedListeningPart/Session`, `IeltsAdvancedReadingPart/Session`, `IeltsAdvancedWritingPrompt/Session`, `IeltsAdvancedSpeakingPart/Session`                                                                                                                       |
| IELTS Intensive (mock exam) | `IeltsIntensiveExam`, `IeltsIntensiveSession` (status `IN_PROGRESS → SUBMITTED → GRADING → GRADED / COMPLETED / ABANDONED / GRADING_FAILED`), `IeltsIntensiveResult`                                                                                                      |
| Vocab Lab                   | `Deck`, `Flashcard`, `FlashcardReview`, `CardType`, `CardTypeField`, `CardTemplate`, `SharedDeck` (uses `ts-fsrs` for spaced repetition)                                                                                                                                  |
| Shadowing / Dictation       | `ShadowingVideo/Folder/Progress`, `DictationVideo/Folder/Progress`                                                                                                                                                                                                        |
| Notes                       | `QuestionNote`                                                                                                                                                                                                                                                            |
| Gamification                | `Achievement`, `UserAchievement`, `XpLog`                                                                                                                                                                                                                                 |
| Community                   | `Post`, `Comment`, `PostLike`, `PostBookmark` (enum `PostType`)                                                                                                                                                                                                           |
| Subscriptions               | `Subscription`, `Payment`, `UsageRecord`, `PricingPlan`                                                                                                                                                                                                                   |
| Notifications               | `Notification` (enum `NotificationType`)                                                                                                                                                                                                                                  |
| Generic                     | `LearningMaterial`, `LearningProgress`                                                                                                                                                                                                                                    |

Many JSON columns hold structured content (exam questions, transcripts with speaker labels, table/map labelling answer groups).

**Observability (`telemetry.ts`):** OpenTelemetry SDK with `@opentelemetry/auto-instrumentations-node`. In production exports OTLP HTTP traces to `OTEL_EXPORTER_OTLP_ENDPOINT` (defaults to `http://172.18.0.1:4318/v1/traces` — the host Docker bridge where Alloy listens); locally uses `ConsoleSpanExporter`. Prometheus metrics exposed at `/metrics`.

### Backend AI (`backend-ai/app/`)

FastAPI service with three RabbitMQ consumers started by the FastAPI lifespan:

| Consumer                | Queue                           | Purpose                                           |
| ----------------------- | ------------------------------- | ------------------------------------------------- |
| `GradingConsumer`       | `exam-grading-queue`            | IELTS writing/speaking grading via Gemini         |
| `PronunciationConsumer` | `pronunciation-check-queue`     | Whisper transcription + IPA phoneme scoring       |
| `TranscriptionConsumer` | `dictation-transcription-queue` | YouTube/audio transcription for dictation lessons |

**REST endpoints** (mounted under `/api/v1/`): `grading`, `writing`, `speaking`, `chat`, plus an unprefixed `/health`.

**Services (`app/services/`):**

- `transcription_service.py` — `faster-whisper` (model `base`, `cpu`, `int8`); falls back to a mock returning `"hello"` if the library is missing
- `pronunciation_service.py` — weighted IPA phoneme edit distance (vowels / plosives / fricatives / nasals / approximants / affricates) combined with Whisper word confidence and Levenshtein text accuracy: final score = `0.4·phoneme + 0.4·confidence + 0.2·text`
- `writing_grader.py` and `speaking_grader.py` — Gemini-based scoring against IELTS rubrics
- `grading_service.py` — orchestration / persistence
- `storage_service.py` — `boto3` against MinIO (local) or GCS (production); URLs are also downloaded directly via `requests` for Cloudinary fallback

**Prompts (`app/prompts/`):** Currently only `chat_system.py` (chat tutor system prompt). Grader prompts are embedded in `writing_grader.py` / `speaking_grader.py`.

**Config (`app/config.py`):** `pydantic-settings`, `.env`-driven. Notable keys: `gemini_api_key`, `whisper_model/device/compute_type`, `rabbitmq_url`, `backend_core_url`, `storage_*`, `gcs_*`.

**Telemetry (`telemetry.py`):** OpenTelemetry FastAPI + httpx instrumentation, OTLP HTTP exporter.

### Frontend Web (`frontend-web/src/`)

Next.js 14 App Router on port 3001. TypeScript 5, Tailwind CSS 3, Radix UI primitives, Framer Motion 12, React Hook Form 7 + Zod, Zustand 4, Axios, `@react-oauth/google`.

**Top-level routes (`src/app/`):** `login/`, `register/`, `ielts/` (with `basic`, `advanced`, `intensive`, `dashboard`, `roadmap`, `statistics`, `history`, `calculator`, `pronunciation`, `grammar`, `vocabulary`, `student-teacher`), `vocabulary/`, `grammar/`, `pronunciation/`, `vocab-lab/`, `lessons/`, `shadowing-dictation/`, `community/`, `pricing/`, `payment/` (VNPay return handler), `profile/`, `admin/` (users, subscriptions, dictation, shadowing).

**Contexts (`src/contexts/`):** `AuthContext`, `GradingContext`, `IeltsSidebarContext`, `NotificationContext`, `SubscriptionContext`, `ThemeContext`.

**Service layer (`src/services/`):** Per-domain Axios wrappers (`auth.service.ts`, `admin.api.ts`, `dictation.api.ts`, `exams.api.ts`, `foundationVocabLesson.service.ts`, `gamification.api.ts`, `ielts-statistics.api.ts`, `learning.api.ts`, `notes.api.ts`, `posts.api.ts`, `shadowing.api.ts`, `subscriptions.api.ts`, `users.api.ts`, `vocabLab.api.ts`).

**API client:** Axios instance with JWT injection from `localStorage` and global error handling.

### Frontend Mobile (`frontend-mobile/`)

Expo SDK 54, Expo Router 6, React Native 0.81, React 19, NativeWind 4 (Tailwind for RN), Reanimated 4, `expo-audio`, `expo-video`, `expo-speech-recognition`, `expo-auth-session`, `react-native-youtube-iframe`.

**Routes (`app/`):**

- `(auth)/` — `login.tsx`, `register.tsx`
- `(tabs)/` — `index` (home), `ielts`, `vocabulary`, `pronunciation`, `grammar`, `shadowing`, `vocablab`, `profile`, `community`, `explore`, `more`
- Deep-linked stacks: `ielts/` (advanced, basic, intensive, grammar, pronunciation, student-teacher, calculator, dashboard, history, onboarding, roadmap, statistics), `vocabulary/`, `grammar/`, `vocab-lab/` (`[deckId].tsx`, `study/`), `shadowing/`, `student-teacher/`
- Top-level screens: `chat-ai.tsx`, `exams.tsx`, `notification.tsx`, `pricing.tsx`, `results.tsx`

**Feature folders (`features/`):** `vocab-lab/components/` (richer domain components).

**Service layer (`services/`):** `api-client.ts` (native `fetch` wrapper with `AsyncStorage` JWT + structured `ApiError`), `api.ts`, `auth.service.ts`, `features.api.ts`, `ielts.api.ts`, `learning.api.ts`, `notes.api.ts`, `posts.api.ts`.

**Hooks (`hooks/`):** `useApi`, `useAudioRecorder`, `useGradingPoll`, `usePronunciationChecker`.

**Design system:** Farro (Google Fonts) typography, `tailwind.config.js` + NativeWind, design tokens at `docs/design-tokens.json`.

## Async AI Grading Flow

```
Client submits exam
        │
        ▼
backend-core ──publish──▶ RabbitMQ (exam-grading-queue, durable, TTL 5min, DLQ)
                                            │
                                            ▼
                              backend-ai (GradingConsumer)
                                            │
                                            ▼
              Faster-Whisper (speaking) → Gemini (writing/speaking) → result JSON
                                            │
                                            ▼
                       HTTP callback → backend-core (writes IeltsIntensiveResult)

Session status transitions: IN_PROGRESS → SUBMITTED → GRADING → GRADED
                                                            ↘ GRADING_FAILED
```

The client polls `/results/:sessionId` until status reaches a terminal state.

## Observability Pipeline

```
backend-core  ── /metrics (prom-client) ──▶ Alloy (prometheus.scrape) ──▶ Grafana Cloud Prometheus
backend-ai    ── /metrics                ──▶ Alloy                      ──▶ Grafana Cloud Prometheus
Docker containers ── stdout/stderr        ──▶ Alloy (loki.source.docker) ──▶ Grafana Cloud Loki
NestJS + FastAPI ── OTLP traces           ──▶ Alloy (OTLP receiver)      ──▶ Grafana Cloud Tempo
```

## CI/CD (`.github/workflows/deploy.yml`)

- Trigger: push to `main` or `deploy`.
- `dorny/paths-filter@v3` detects which of `frontend-web/`, `backend-core/`, `backend-ai/` changed.
- Builds multi-arch `linux/amd64` Docker images, pushes to **Google Container Registry** (`gcr.io/ielts-master-495612/...`) tagged with both `:${{ github.sha }}` and `:latest`.
- `frontend-web` → `gcloud run deploy frontend-web --region asia-southeast1` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars.
- Backend → SSH (ed25519 key in `VM_SSH_PRIVATE_KEY`) to VM `34.143.226.199` as user `xis108`: `cd /opt/app && docker compose pull <svc> && docker compose up -d --no-deps <svc> && docker image prune -f`.

## Key Conventions

- **DTOs** use `class-validator` decorators; the global `ValidationPipe` rejects unknown fields (`forbidNonWhitelisted`) and transforms primitives.
- **Prisma**: never call `prisma.$connect()` manually — `PrismaService` handles it. Use `prisma.$transaction()` for multi-step writes. Many tables expose JSON columns for structured content (questions, transcripts, exercise groups).
- **Naming history**: original `Exam` / `ExamSession` / `Result` models are now `IeltsIntensiveExam` / `IeltsIntensiveSession` / `IeltsIntensiveResult` but still map to `exams` / `exam_sessions` / `results` SQL tables (`@@map`) — preserve `@@map` annotations when editing the schema.
- **Auth**: prefer `@CurrentUser()` to access the authenticated user inside controllers. Google OAuth users have `password: null` — block password-change attempts on those accounts.
- **Storage**: server-uploaded images go through Cloudinary; AI audio is read from MinIO/GCS via boto3 in the FastAPI worker. Cloudinary URLs are sometimes downloaded directly with `requests` when boto3 sees an `http(s)://` `object_key`.
- **Payment provider**: default `PAYMENT_PROVIDER=mock` auto-completes checkouts. Switch to `vnpay` in production and supply `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, `VNPAY_RETURN_URL`, `VNPAY_IPN_URL`.
- **Mobile NativeWind**: use `className` for Tailwind classes; fall back to `StyleSheet` when dynamic styles can't be statically resolved.
- **Mobile navigation**: Expo Router (file-based). Use `router.replace()` for auth-driven redirects to avoid the back-stack retaining the login screen.
- **IELTS exam blocks** are memoised with `React.memo` to prevent scroll jumps caused by the global timer interval re-renders.
- **FastAPI routing**: define routes with exact prefixes (e.g. `@router.post("")`) — a trailing slash can trigger a 307 redirect that breaks CORS preflight between web/mobile clients and the AI service.
- **IELTS Intensive sessions** must be saved via the API when the user navigates away from an active test; the engine relies on programmatic "Protect Session" semantics rather than client-side persistence.
- **RabbitMQ queues** are asserted with `durable: true`; the grading queue uses a 5-minute message TTL and a dead-letter routing key (`exam-grading-dlq`). Don't change these without coordinating with `backend-ai` consumers.
- **Telemetry**: production traces go to OTLP HTTP `http://172.18.0.1:4318/v1/traces` (Alloy on the Docker host bridge). Locally, traces print to stdout via `ConsoleSpanExporter`.
- **Subscription cron** runs daily at 2:00 AM (`@nestjs/schedule`) — keep `ScheduleModule.forRoot()` registered in `AppModule`.
