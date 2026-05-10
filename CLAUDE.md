# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TOEIC/IELTS learning and examination platform with a **three-service architecture**:

1. **`backend-core`** — NestJS modular monolith (TypeScript) — primary API server on port 3000
2. **`backend-ai`** — FastAPI microservice (Python) — AI/ML workloads on port 8000
3. **`frontend-web`** — Next.js 14 app router (TypeScript) — web portal on port 3001
4. **`frontend-mobile`** — React Native with Expo Router (TypeScript) — iOS/Android mobile app

The backends communicate via **RabbitMQ** for async AI tasks (exam grading, pronunciation analysis). Infrastructure is PostgreSQL (port 5433), Redis (6379), RabbitMQ (5672), and MinIO object storage (9000).

## Commands

### Infrastructure (required before running services)
```bash
npm run infra:up       # Start all Docker services (Postgres, Redis, RabbitMQ, MinIO)
npm run infra:down     # Stop services
npm run infra:clean    # Stop and delete volumes
```

### Backend Core (NestJS)
```bash
cd backend-core
npm run start:dev      # Dev server with hot reload
npm run build          # Production build
npm run lint           # ESLint with auto-fix
npm run test           # Jest unit tests
npm run test:watch     # Jest in watch mode
npm run test:e2e       # End-to-end tests
npx jest path/to/file.spec.ts  # Run a single test file
npm run prisma:migrate # Apply DB migrations
npm run prisma:studio  # Open Prisma Studio GUI
npm run prisma:seed    # Seed the database
```

### Backend AI (FastAPI / Python)
```bash
cd backend-ai
./venv/bin/python -m uvicorn app.main:app --reload  # Dev server
./venv/bin/pytest      # Run tests
```

### Frontend Web (Next.js)
```bash
cd frontend-web
npm run dev            # Dev server on port 3001
npm run build          # Production build
npm run lint           # ESLint
npm run type-check     # TypeScript check without emit
```

### Frontend Mobile (Expo)
```bash
cd frontend-mobile
npm start              # Expo dev server (scan QR code)
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
```

### Root-level shortcuts
```bash
npm run backend:dev    # backend-core dev server
npm run ai:dev         # backend-ai dev server
npm run web:dev        # frontend-web dev server
npm run mobile:dev     # frontend-mobile expo start
npm run dev:all        # backend + ai + web concurrently
npm run prisma:migrate # Shortcut to backend-core migration
```

## Architecture

### Backend Core (`backend-core/src/`)

NestJS modular monolith. Each domain lives under `src/modules/<name>/` with its own `module.ts`, `controller.ts`, `service.ts`, and `dto/`.

**Feature modules:** `auth`, `users`, `exams`, `results`, `learning`, `ielts`, `vocabulary`, `grammar`, `pronunciation`, `vocab-lab`, `notes`, `shadowing`, `notifications`, `ai-client`

**Common modules** (globally registered):
- `PrismaModule` — single `PrismaService` injected everywhere; `@Global()` so no per-module import needed
- `RedisModule` — ioredis-backed caching
- `CacheModule` — application-level cache layer

**Authentication:** JWT via `passport-jwt`; guards and decorators in `src/modules/auth/guards/` and `src/modules/auth/decorators/`. Use `@CurrentUser()` decorator to access the authenticated user in controllers.

**IELTS module** is the largest feature, spanning `ielts.service.ts`, `ielts-advanced.service.ts`, `ielts-roadmap.service.ts`, and `streak.service.ts` — plus corresponding controllers.

**AI communication:** `ai-client` module sends jobs to RabbitMQ queues (`exam-grading-queue`, `pronunciation-check-queue`). Results are returned asynchronously via a polling mechanism.

**File storage:** `src/common/storage/` wraps AWS S3 SDK (also used with MinIO in dev). Cloudinary is used for media.

**Database:** Prisma ORM. Schema at `backend-core/prisma/schema.prisma`. Key models: `User`, `Exam`, `ExamSession`, `Result`, `LearningProgress`, `IeltsProfile`, `IeltsPracticeSession`, `VocabularyProgress`, `Deck`. Exam questions are stored as a `Json` column.

### Backend AI (`backend-ai/app/`)

FastAPI service with two startup consumers:
- `GradingConsumer` — listens on `exam-grading-queue`, grades IELTS writing/speaking via Gemini AI
- `PronunciationConsumer` — listens on `pronunciation-check-queue`, uses Faster-Whisper (local) for transcription + phoneme scoring

REST endpoints (`/api/v1/`): `grading`, `writing`, `speaking`, `chat`

AI models used: **Faster-Whisper** (speech-to-text), **Google Gemini** (writing/speaking grading), `eng-to-ipa` + `python-Levenshtein` (pronunciation scoring).

Config is in `app/config.py` (pydantic-settings, loads `.env`).

### Frontend Web (`frontend-web/src/`)

Next.js 14 App Router. Pages under `src/app/`, shared components under `src/components/`, API services under `src/services/`, state in `src/contexts/`.

**Key contexts:** `AuthContext`, `GradingContext`, `IeltsSidebarContext`, `NotificationContext`

**API client:** `src/lib/api.ts` — Axios instance with JWT injection via `localStorage` and global error handling.

**Styling:** Tailwind CSS + shadcn-style Radix UI components. `tailwind.config.ts` + `postcss.config.js`.

**State management:** Zustand for local feature state; React Context for global auth/notifications.

**Main feature areas:** `(auth)` login/register, `ielts/` (dashboard, basic, advanced, intensive, roadmap, statistics, pronunciation, grammar), `vocabulary/`, `grammar/`, `pronunciation/`, `vocab-lab/`, `lessons/`, `shadowing-dictation/`

### Frontend Mobile (`frontend-mobile/`)

Expo SDK ~54, React Native 0.81, using **Expo Router** (file-based routing). Styling via **NativeWind v4** (Tailwind for React Native).

**App routes** (`app/`): `(auth)/` login/register, `(tabs)/` bottom-nav tabs (home, IELTS, vocabulary, grammar, pronunciation, shadowing, vocab-lab), plus deep-linked screens.

**Feature folders** (`features/`): `ielts/` and `vocab-lab/` contain complex domain-specific screens and components.

**API client:** `services/api-client.ts` — native `fetch` wrapper with `AsyncStorage`-based JWT, token refresh, and structured `ApiError`.

**Service layer:** `services/*.api.ts` files map to backend domains (auth, IELTS, learning, notes, features).

**Key contexts:** `AuthContext` (JWT + route guards via `useSegments`), hooks in `hooks/` (audio recorder, pronunciation checker, grading poll).

**Design system:** `design-tokens.json` defines the token set; `tailwind.config.js` + NativeWind for styling. Farro Google font is the primary typeface.

## Key Conventions

- **Backend DTOs** use `class-validator` decorators; all controllers validate via `ValidationPipe`.
- **Prisma**: never call `prisma.$connect()` manually — `PrismaService` handles it. Use `prisma.$transaction()` for multi-step writes.
- **Mobile NativeWind**: use `className` prop (not `style`) for Tailwind classes. For dynamic styles that NativeWind can't resolve, fall back to `StyleSheet`.
- **Mobile navigation**: Expo Router file-based; nested `(groups)` define layout nesting. Use `router.replace()` for auth redirects to avoid back-stack issues.
- **IELTS exam blocks** (Listening/Reading/Writing/Speaking) are memoized with `React.memo` to prevent scroll jumps caused by the global timer interval re-renders.
- **Async AI grading flow**: client submits exam → NestJS enqueues RabbitMQ message → AI service processes and stores result → client polls `/results/:sessionId` until status is `COMPLETED`.
