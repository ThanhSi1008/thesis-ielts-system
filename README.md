<div align="center">

# IELTS Master English AI

### Thesis Project — B.Eng. in Information Technology

#### Industrial University of Ho Chi Minh City (IUH)

*A full-stack, AI-augmented IELTS preparation system employing a Modular Monolith + Async AI Worker architecture across four competency tiers: Foundation, Basic, Advanced, and Intensive mock examination.*

![System Architecture](architecture-diagram.png)

**Production deployment:** [ielts-master.io.vn](https://ielts-master.io.vn)

</div>

---

<div align="center">

[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0.0-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![ts-fsrs](https://img.shields.io/badge/ts--fsrs-5.3.2-4B8BBE)](https://github.com/open-spaced-repetition/ts-fsrs)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Abstract

This thesis presents the design and implementation of **IELTS Master English AI**, a production-deployed software system that addresses the pedagogical challenge of providing scalable, feedback-rich IELTS preparation across all four language competencies — Listening, Reading, Writing, and Speaking.

The system is structured as a **hybrid architecture**: a NestJS 10 modular monolith handles synchronous user-facing operations, while a decoupled FastAPI 0.109 AI worker processes computationally intensive grading tasks asynchronously via a RabbitMQ message queue. Writing and Speaking submissions are evaluated by a large language model (Google Gemini) against official IELTS rubric dimensions; speech audio is transcribed locally using CTranslate2-accelerated Faster-Whisper to avoid per-request cloud STT costs. Vocabulary acquisition is supported by an implementation of the **Free Spaced Repetition Scheduler (FSRS)** algorithm (`ts-fsrs` v5.3.2), which computes evidence-based inter-review intervals from per-card memory state vectors.

The system is deployed on Google Cloud Platform and served concurrently via a **Next.js 14 web portal** and an **Expo 54 / React Native 0.81 mobile application**. A Prisma 5 schema comprising **61 models and 12 enumerations** persists user data, learning artefacts, and grading results in Supabase-managed PostgreSQL, with Upstash Redis for session caching and CloudAMQP-hosted RabbitMQ for inter-service communication.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Asynchronous AI Grading Workflow](#2-asynchronous-ai-grading-workflow)
3. [Core Technical Modules](#3-core-technical-modules)
   - 3.1 [Adaptive Vocabulary Engine (FSRS)](#31-adaptive-vocabulary-engine-fsrs)
   - 3.2 [Security and Payment Lifecycle (VNPay)](#32-security-and-payment-lifecycle-vnpay)
4. [Implemented Feature Set](#4-implemented-feature-set)
5. [Technology Stack](#5-technology-stack)
6. [Database Schema](#6-database-schema)
7. [Project Structure](#7-project-structure)
8. [Local Development Setup](#8-local-development-setup)
9. [DevOps and Infrastructure Observability](#9-devops-and-infrastructure-observability)
10. [Contribution Matrix and Academic Credits](#10-contribution-matrix-and-academic-credits)

---

## 1. System Architecture

The production system is composed of four independently deployable units communicating over managed cloud services:

![System Architecture](architecture-diagram.png)

### Deployment Topology

| Unit | Runtime | Platform | Domain |
|---|---|---|---|
| `frontend-web` | Next.js 14 (Node.js 20) | Google Cloud Run — auto-scaled, `asia-southeast1` | `ielts-master.io.vn` |
| `backend-core` | NestJS 10 (Node.js 20) | GCP VM `n2-standard-4` (4 vCPU, 16 GB RAM) via Docker Compose | `dedangdown.io.vn/api/v1` |
| `backend-ai` | FastAPI 0.109 (Python 3.11) | Same VM — capped at 10 GB RAM, 3 CPUs | `dedangdown.io.vn/ai` |
| `frontend-mobile` | Expo 54 / React Native 0.81 | Distributed via Expo Go / native binary | N/A |

An **Nginx Alpine** reverse proxy terminates TLS (Let's Encrypt, TLSv1.2/1.3) and routes inbound traffic:

- `/api/v1/*` → `backend-core:3000`
- `/ai/*` → `backend-ai:8000`

### Managed Infrastructure

| Service | Provider | Protocol |
|---|---|---|
| Relational database | Supabase PostgreSQL | PgBouncer `:6543` (pooled) + Direct `:5432` (migrations) |
| In-memory cache / session store | Upstash Redis | TLS `rediss://` |
| Message broker | CloudAMQP RabbitMQ | AMQPS |
| Image and media CDN | Cloudinary v2 | HTTPS |
| Audio / object storage | Google Cloud Storage | GCS SDK / `boto3` |
| Telemetry aggregation | Grafana Cloud | Prometheus remote write + Loki + Tempo OTLP |

---

## 2. Asynchronous AI Grading Workflow

Writing and Speaking assessments are decoupled from the HTTP request lifecycle via a durable RabbitMQ queue. This prevents API timeout on LLM inference and allows horizontal scaling of AI workers independently of the API server.

### Queue Configuration (asserted at `backend-core` startup)

| Queue | Durability | TTL | Dead-Letter Exchange |
|---|---|---|---|
| `exam-grading-queue` | `durable: true` | 300 000 ms (5 min) | `exam-grading-dlq` |
| `dictation-transcription-queue` | `durable: true` | — | — |
| `pronunciation-check-queue` | `durable: true` | — | — |

### Data Flow — End-to-End Grading

**Step 1 — Client submission.**
The learner submits a completed Writing or Speaking session via `POST /api/v1/ielts/intensive/sessions/:id/submit`. The NestJS controller sets the session status to `SUBMITTED` in PostgreSQL and immediately returns `HTTP 202 Accepted`.

**Step 2 — Message publication.**
The `AiClientModule` serialises the session payload (essay text, audio object key, rubric variant) and publishes it to `exam-grading-queue` via `amqplib`. The message is marked persistent (`deliveryMode: 2`) to survive broker restarts.

**Step 3 — Worker consumption.**
`GradingConsumer` (Python `pika`) prefetches one message at a time (`basic_qos(prefetch_count=1)`). For Speaking: `TranscriptionService` loads the Faster-Whisper `base` model on CPU (`compute_type="int8"`) and transcribes the audio file retrieved from GCS / Cloudinary. For Writing and Speaking: the transcript or essay is forwarded to `WritingGrader` / `SpeakingGrader`, which compose a structured prompt and call the Google Gemini API (`gemini-2.0-flash`).

**Step 4 — Result delivery.**
The AI worker posts the graded result JSON to `BACKEND_CORE_URL/results/callback` via `httpx`. The NestJS `ResultsModule` persists an `IeltsIntensiveResult` record and transitions the session status to `GRADED`.

**Step 5 — Client polling.**
The client polls `GET /api/v1/results/:sessionId` at a fixed interval until the session status reaches one of the terminal states below.

### Session Status State Machine

```
IN_PROGRESS
    │ (user submits)
    ▼
SUBMITTED
    │ (worker picks up)
    ▼
GRADING
    │                   │
    ▼ (success)         ▼ (LLM error / timeout)
  GRADED           GRADING_FAILED
    │
    ▼ (user acknowledges)
COMPLETED

(user abandons exam → ABANDONED)
```

### Pronunciation Assessment Sub-pipeline

Pronunciation attempts bypass the queue and are processed synchronously via `POST /api/v1/pronunciation/assess`. The scoring model combines three signals:

| Signal | Weight | Method |
|---|---|---|
| Phoneme accuracy | 0.40 | IPA conversion (`eng-to-ipa` 0.0.2) + weighted edit distance (`python-Levenshtein` 0.25.0). Same phoneme = 0.0, same articulatory class = 0.3, cross-class = 0.7–1.0 |
| Whisper word confidence | 0.40 | Per-word probability from `faster-whisper` segment output |
| Orthographic accuracy | 0.20 | Normalised Levenshtein distance between reference and transcribed text |

`final_score = 0.4 × phoneme_score + 0.4 × confidence_score + 0.2 × text_accuracy`

---

## 3. Core Technical Modules

### 3.1 Adaptive Vocabulary Engine (FSRS)

The Vocab Lab implements the **Free Spaced Repetition Scheduler v5** via `ts-fsrs` v5.3.2 on the NestJS backend. The algorithm maintains a five-dimensional memory state vector per card — `stability`, `difficulty`, `elapsed_days`, `scheduled_days`, and `reps` / `lapses` — and computes the next review date to target a configurable retention probability.

**Algorithm configuration** (`vocab-lab.service.ts`):

```typescript
import { fsrs, Rating, Card, State, createEmptyCard } from "ts-fsrs";

const f = fsrs({
  request_retention: 0.9,   // target 90% recall probability at review time
  maximum_interval: 365,    // cap inter-review interval at 365 days
});
```

**Review submission flow:**
When a learner rates a card (Again=1, Hard=2, Good=3, Easy=4), the service reconstructs the current `Card` object from the persisted Prisma `Flashcard` row, calls `f.next(fsrsCard, now, rating)`, and writes the resulting memory state back atomically:

```typescript
const result = f.next(fsrsCard, now, rating);
const next   = result.card;

await prisma.flashcard.update({
  where: { id: dto.flashcardId },
  data: {
    due:           next.due,          // absolute timestamp of next scheduled review
    stability:     next.stability,    // memory stability S (days)
    difficulty:    next.difficulty,   // item difficulty D ∈ [1, 10]
    elapsedDays:   next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps:          next.reps,
    lapses:        next.lapses,
    lastReview:    now,
    nextReviewDate: next.due,
    cardState:     toPrismaState(next.state), // NEW | LEARNING | REVIEW | RELEARNING
  },
});
```

A `FlashcardReview` audit row is also created per submission, enabling per-card learning curve analysis. The mobile client (`frontend-mobile`) calls the same REST endpoint — no client-side FSRS computation is performed; the algorithm is authoritative on the server.

**Card statistics** exposed at `GET /vocab-lab/decks/:id/stats`:
- `new` — cards in state `NEW`
- `learning` — cards in `LEARNING` or `RELEARNING`
- `young` — `REVIEW` with `scheduledDays < 21`
- `mature` — `REVIEW` with `scheduledDays >= 21`
- `suspended` — cards with `lapses > 8`
- `due` — `REVIEW` cards where `nextReviewDate ≤ now`

---

### 3.2 Security and Payment Lifecycle (VNPay)

The subscription payment system integrates with the **VNPay payment gateway** (API version 2.1.0) and implements the complete IPN (Instant Payment Notification) lifecycle including HMAC-SHA512 signature verification and Redis-backed idempotency enforcement.

#### Checkout Creation

On `POST /api/v1/subscriptions/checkout`, the service generates a `txnRef` (UUID v4, truncated to 20 characters to satisfy VNPay's `vnp_TxnRef` length constraint), stores the session in Redis under key `vnpay:session:{txnRef}` with a 30-minute TTL, and constructs the signed redirect URL:

```
sort vnp_Params keys by encodeURIComponent(key)
signData = qs.stringify(sorted, { encode: false })
secureHash = HMAC-SHA512(VNPAY_HASH_SECRET, signData)
redirectUrl = VNPAY_URL + "?" + signData + "&vnp_SecureHash=" + secureHash
```

The amount field follows the VNPay convention: `vnp_Amount = amountVND × 100`. USD-denominated plans are converted at the current USD/VND rate cached in Redis (refreshed by a `@nestjs/schedule` cron; fallback from `USD_TO_VND_RATE` env variable).

#### IPN Handler and Idempotency Enforcement

VNPay delivers an Instant Payment Notification via `GET /api/v1/subscriptions/webhook/vnpay`. The handler executes the following steps, returning VNPay-specified `RspCode` values to control retry behaviour:

| Step | Check | RspCode on failure | Retry behaviour |
|---|---|---|---|
| 1 | HMAC-SHA512 signature verification | `97` | VNPay retries |
| 2 | `vnp_ResponseCode == "00"` and `vnp_TransactionStatus == "00"` | `00` (non-success confirmed) | No retry |
| 3 | Redis session lookup by `txnRef` | `01` (order not found) | VNPay retries |
| 4 | Amount integrity: `vnp_Amount == session.amount × 100` | `04` | VNPay retries |
| 5 | Idempotency: `Payment.findFirst({ where: { providerPayId: vnpTransactionNo } })` | `02` (already confirmed) | No retry |
| 6 | Subscription activation via `verifyCheckout` | `99` on exception | VNPay retries |
| — | Success | `00` | — |

**Idempotency enforcement** addresses the race condition between the browser Return URL and the server-side IPN: if the Return URL handler activates the subscription first (consuming the Redis session), the subsequent IPN call finds no session but locates the `Payment` record by `vnp_TransactionNo` and returns `RspCode: "02"` without double-activating.

The Redis session key is deleted atomically within `verifyPayment` upon successful verification, ensuring the checkout session can only activate one subscription regardless of concurrent IPN and Return URL deliveries.

---

## 4. Implemented Feature Set

### IELTS Learning Tiers

| Tier | Implemented Components |
|---|---|
| **Foundation** | IPA pronunciation sounds library (monophthongs, diphthongs, consonants) with audio examples and scored practice attempts; 4000 Essential Words vocabulary books with unit-level comprehension exercises (multiple choice, fill-blank); Cambridge Grammar in Use unit lessons with exercises and progress tracking |
| **Basic** | Skill-specific lesson sets for Listening (audio + questions), Reading (passage + questions), Writing (prompt + submission), Speaking (prompt + audio recording); per-user progress state persisted per lesson |
| **Advanced** | Full-length timed practice sessions across all four skills — each session stores answers in a JSON column enabling Save-and-Resume; Speaking parts use `expo-speech-recognition` on mobile and MediaRecorder on web for audio capture |
| **Intensive** | Mock exam engine (Listening + Reading + Writing + Speaking in a single timed session); Save-and-Pause with programmatic session protection; AI auto-grading via the async queue; band score history with per-criterion breakdowns; IELTS band calculator utility |

### Vocabulary Lab

- Anki-style flashcard system with user-definable `CardType` templates (named fields with ordering)
- FSRS v5 review scheduling (`ts-fsrs` v5.3.2) targeting 90% retention
- Per-deck statistics (new / learning / young / mature / suspended / due)
- Community `SharedDeck` publishing with view count tracking
- Quick-Add floating action button available on all screens (mobile)

### Shadowing and Dictation

- **Shadowing** — YouTube-embedded video playback via `react-native-youtube-iframe` and `react-player`; videos organised into user-created folders; per-video completion progress
- **Dictation** — YouTube URL import with automatic audio transcription by Faster-Whisper (`yt-dlp` fetches audio stream); gap-fill exercise generated from transcript; learner answers scored by Levenshtein distance

### AI Chat Tutor

Persistent conversational assistant (`chat-ai.tsx` on mobile, sidebar on web) powered by Google Gemini. System prompt (`app/prompts/chat_system.py`) positions the model as an IELTS tutor. Available across all screen contexts for vocabulary lookup, grammar explanation, and translation.

### Gamification System

- **XP ledger** — `XpLog` table records points per event type (`VOCAB_LAB_REVIEW`, `EXAM_COMPLETED`, etc.)
- **Achievements** — predefined achievement catalogue (e.g., `VL_COLLECTOR`) with unlock detection on each qualifying event
- **Daily streaks** — consecutive study-day counter with `STREAK_MILESTONE` notification at configurable thresholds
- **Leaderboard** — aggregate XP ranking across all users

### Community and Social Features

- Post feed with three categories: `STUDY_TIP`, `SCORE_ACHIEVEMENT`, `GENERAL`
- Threaded comments, per-post likes (`PostLike`), and bookmarks (`PostBookmark`)
- Teacher–Student linking (`StudentTeacherLink`) for cohort management and progress monitoring

### Notification Centre

Ten notification types managed by `NotificationsModule`:

`STREAK_MILESTONE` · `LESSON_COMPLETED` · `REVIEW_DUE` · `DECK_MASTERED` · `EXAM_GRADED` · `NEW_EXAM_AVAILABLE` · `DICTATION_COMPLETE` · `NEW_LESSON` · `SYSTEM_ANNOUNCEMENT` · `ACHIEVEMENT`

### Subscription and Access Control

- Three tiers: `FREE`, `PREMIUM`, `PRO` with per-feature server-side quota enforcement (`UsageRecord`)
- 7-day `PREMIUM` trial (one per account lifetime)
- Payment providers: `VNPAY` (production) and `MOCK` (development / CI; auto-approves checkout)
- Subscription lifecycle cron (`@Cron('0 2 * * *')`): sends 7/3/1-day expiry reminders, applies 3-day grace period, then downgrades expired subscriptions to `FREE`
- Exchange rate cron: refreshes USD→VND rate from external API into Redis; `USD_TO_VND_RATE` env variable serves as static fallback

---

## 5. Technology Stack

### Backend Core (NestJS 10 · TypeScript 5.3)

| Category | Package | Version |
|---|---|---|
| Framework | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | ^10.3.0 |
| ORM | `@prisma/client`, `prisma` | ^5.8.0 |
| Authentication | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `passport-local` | ^10.2.0 / ^10.0.3 |
| Google OAuth | `google-auth-library` | ^10.6.2 |
| Message queue | `amqplib` | ^0.10.3 |
| Cache | `ioredis` | ^5.3.2 |
| Spaced repetition | `ts-fsrs` | ^5.3.2 |
| Media storage | `cloudinary` | ^2.9.0 |
| Scheduling | `@nestjs/schedule` | ^6.1.3 |
| Rate limiting | `@nestjs/throttler` | ^6.5.0 |
| Metrics | `@willsoto/nestjs-prometheus`, `prom-client` | ^6.1.0 / ^15.1.3 |
| Tracing | `@opentelemetry/sdk-node`, `@opentelemetry/exporter-trace-otlp-http` | ^0.217.0 |
| Validation | `class-validator`, `class-transformer` | ^0.14.1 / ^0.5.1 |
| YouTube | `youtube-transcript` | ^1.3.1 |

### AI Worker (FastAPI 0.109 · Python 3.11)

| Category | Package | Version |
|---|---|---|
| Framework | `fastapi`, `uvicorn[standard]` | 0.109.0 / 0.27.0 |
| Message queue | `pika` | 1.3.2 |
| Speech-to-text | `faster-whisper` | ≥1.0.1 |
| LLM | `google-genai` | ≥0.1.0 |
| Pronunciation | `eng-to-ipa`, `python-Levenshtein` | 0.0.2 / 0.25.0 |
| Object storage | `boto3`, `google-cloud-storage` | 1.34.0 / 2.14.0 |
| YouTube | `yt-dlp` | ≥2024.3.10 |
| HTTP client | `httpx` | 0.27.0 |
| Settings | `pydantic-settings` | 2.1.0 |
| Tracing | `opentelemetry-instrumentation-fastapi`, `opentelemetry-exporter-otlp-proto-http` | latest |

### Frontend Web (Next.js 14.1 · TypeScript 5.3)

| Category | Package | Version |
|---|---|---|
| Framework | `next`, `react`, `react-dom` | ^14.1.0 / ^18.2.0 |
| Styling | `tailwindcss`, `tailwind-merge` | ^3.4.1 / ^2.2.0 |
| UI primitives | `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu` | ^1.0.5 / ^2.0.6 |
| Animation | `framer-motion` | ^12.38.0 |
| State | `zustand` | ^4.4.7 |
| Forms | `react-hook-form`, `zod` | ^7.49.3 / ^3.22.4 |
| HTTP | `axios` | ^1.13.4 |
| Auth | `@react-oauth/google` | ^0.13.5 |
| Markdown | `react-markdown`, `remark-gfm`, `rehype-raw` | ^10.1.0 / ^4.0.1 / ^7.0.0 |
| Media | `react-player` | ^3.4.0 |

### Frontend Mobile (Expo 54 · React Native 0.81 · React 19)

| Category | Package | Version |
|---|---|---|
| Framework | `expo`, `expo-router` | ~54.0.0 / ~6.0.23 |
| Runtime | `react-native`, `react` | 0.81.5 / 19.1.0 |
| Styling | `nativewind`, `tailwindcss` | ^4.0.0 / ^3.4.1 |
| Animation | `react-native-reanimated` | ~4.1.1 |
| Audio | `expo-audio` | ~1.1.1 |
| Video | `expo-video` | ~3.0.16 |
| Speech recognition | `expo-speech-recognition` | ^3.1.3 |
| YouTube | `react-native-youtube-iframe` | ^2.4.1 |
| Auth | `expo-auth-session` | ~7.0.11 |
| Storage | `@react-native-async-storage/async-storage` | 2.2.0 |
| Typography | `@expo-google-fonts/farro` | ^0.4.1 |

---

## 6. Database Schema

The Prisma 5 schema (`backend-core/prisma/schema.prisma`, 1346 lines) defines **61 models** and **12 enumerations** on PostgreSQL. Legacy models that predate the IELTS rename retain their original SQL table names via `@@map`.

### Model Catalogue by Domain

| Domain | Models (61 total) |
|---|---|
| **Identity** | `User` (→ `users`), `IeltsProfile`, `StudentTeacherLink` |
| **IELTS Intensive** | `IeltsIntensiveExam` (→ `exams`), `IeltsIntensiveSession` (→ `exam_sessions`), `IeltsIntensiveResult` (→ `results`) |
| **Foundation — Vocabulary** | `FoundationVocabBook` (→ `vocabulary_books`), `FoundationVocabUnit`, `FoundationVocabItem` (→ `vocabulary_words`), `FoundationVocabQuestion`, `FoundationVocabProgress` |
| **Foundation — Grammar** | `FoundationGrammarBook` (→ `grammar_books`), `FoundationGrammarUnit`, `FoundationGrammarExercise`, `FoundationGrammarProgress` |
| **Foundation — Pronunciation** | `FoundationPronunciationSound`, `FoundationSoundExample`, `FoundationPronunciationAttempt` (→ `pronunciation_attempts`), `FoundationPronunciationProgress` |
| **IELTS Basic** | `IeltsBasicSkill`, `IeltsBasicLesson`, `IeltsBasicListeningExercise`, `IeltsBasicReadingExercise`, `IeltsBasicWritingExercise`, `IeltsBasicWritingAnswer`, `IeltsBasicSpeakingExercise`, `IeltsBasicProgress` |
| **IELTS Advanced** | `IeltsAdvancedListeningPart`, `IeltsAdvancedListeningSession`, `IeltsAdvancedReadingPart`, `IeltsAdvancedReadingSession`, `IeltsAdvancedWritingPrompt`, `IeltsAdvancedWritingSession`, `IeltsAdvancedSpeakingPart`, `IeltsAdvancedSpeakingSession` |
| **Vocab Lab** | `Deck`, `Flashcard`, `FlashcardReview`, `CardType`, `CardTypeField`, `CardTemplate`, `SharedDeck` |
| **Shadowing / Dictation** | `ShadowingVideo`, `ShadowingFolder`, `ShadowingProgress`, `DictationVideo`, `DictationFolder`, `DictationProgress` |
| **Notes** | `QuestionNote` |
| **Gamification** | `Achievement`, `UserAchievement`, `XpLog` |
| **Community** | `Post`, `Comment`, `PostLike`, `PostBookmark` |
| **Subscriptions** | `Subscription`, `Payment`, `UsageRecord`, `PricingPlan` |
| **Notifications** | `Notification` |
| **Learning** | `LearningMaterial`, `LearningProgress` |

### Key Enumerations

| Enum | Values |
|---|---|
| `UserRole` | `STUDENT`, `INSTRUCTOR`, `ADMIN` |
| `IeltsIntensiveSessionStatus` | `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `GRADED`, `COMPLETED`, `ABANDONED`, `GRADING_FAILED` |
| `SubscriptionTier` | `FREE`, `PREMIUM`, `PRO` |
| `PaymentProvider` | `MOCK`, `VNPAY` |
| `CardState` | `NEW`, `LEARNING`, `REVIEW`, `RELEARNING` |
| `NotificationType` | `STREAK_MILESTONE`, `LESSON_COMPLETED`, `REVIEW_DUE`, `DECK_MASTERED`, `EXAM_GRADED`, `NEW_EXAM_AVAILABLE`, `DICTATION_COMPLETE`, `NEW_LESSON`, `SYSTEM_ANNOUNCEMENT`, `ACHIEVEMENT` |
| `PostType` | `STUDY_TIP`, `SCORE_ACHIEVEMENT`, `GENERAL` |

---

## 7. Project Structure

```
thesis-ielts-system/
│
├── backend-core/                        # NestJS 10 modular monolith (port 3000)
│   ├── prisma/
│   │   └── schema.prisma                # 61 models, 12 enums, 1346 lines
│   └── src/
│       ├── main.ts                      # Bootstrap: /api/v1 prefix, CORS, 50 MB body
│       ├── app.module.ts                # Module graph root
│       ├── telemetry.ts                 # OpenTelemetry SDK init (OTLP HTTP exporter)
│       └── modules/
│           ├── ai-client/               # RabbitMQ publisher (exam-grading-queue, dictation-transcription-queue)
│           ├── auth/                    # JWT strategy, Google OAuth, Passport guards
│           ├── dictation/               # Dictation video/folder management
│           ├── exams/                   # Intensive mock exam engine
│           ├── gamification/            # XP ledger, achievements, streaks
│           ├── grammar/                 # Grammar units and exercises
│           ├── ielts/                   # Foundation / Basic / Advanced / Roadmap / Statistics
│           ├── notes/                   # Per-question user annotations
│           ├── notifications/           # Notification dispatch and retrieval
│           ├── posts/                   # Community posts, comments, likes, bookmarks
│           ├── pronunciation/           # IPA sounds library and practice attempts
│           ├── results/                 # Grading result storage and AI callback endpoint
│           ├── shadowing/               # Shadowing video/folder management
│           ├── subscriptions/           # Plans, VNPay provider, mock provider, lifecycle cron
│           │   ├── providers/
│           │   │   ├── vnpay-payment.provider.ts   # HMAC-SHA512, Redis session, IPN idempotency
│           │   │   └── mock-payment.provider.ts
│           │   └── services/
│           │       └── exchange-rate.service.ts    # USD→VND rate cron + Redis cache
│           ├── users/                   # User CRUD, profile, teacher-student links
│           ├── vocab-lab/               # FSRS flashcard engine, deck sharing
│           └── vocabulary/              # 4000 Essential Words exercises
│
├── backend-ai/                          # FastAPI 0.109 AI worker (port 8000)
│   └── app/
│       ├── api/
│       │   ├── chat.py                  # POST /chat — Gemini conversational tutor
│       │   ├── grading.py               # POST /grading — direct grading endpoint
│       │   ├── speaking.py              # POST /speaking
│       │   ├── writing.py               # POST /writing
│       │   └── health.py                # GET /health
│       ├── consumers/
│       │   ├── grading_consumer.py      # exam-grading-queue (Writing + Speaking)
│       │   ├── pronunciation_consumer.py # pronunciation-check-queue
│       │   └── transcription_consumer.py # dictation-transcription-queue
│       ├── services/
│       │   ├── writing_grader.py        # Gemini IELTS Writing rubric (4 criteria)
│       │   ├── speaking_grader.py       # Gemini IELTS Speaking band descriptors
│       │   ├── pronunciation_service.py # IPA weighted edit distance + Whisper confidence
│       │   ├── transcription_service.py # Faster-Whisper (base, cpu, int8); mock fallback
│       │   ├── grading_service.py       # Orchestration and DB persistence
│       │   └── storage_service.py       # boto3 / GCS download for audio files
│       ├── prompts/
│       │   └── chat_system.py           # Gemini system prompt for chat tutor
│       ├── config.py                    # pydantic-settings configuration
│       ├── main.py                      # FastAPI app, lifespan (consumers start here)
│       └── telemetry.py                 # OpenTelemetry FastAPI + httpx instrumentation
│
├── frontend-web/                        # Next.js 14 App Router (port 3001)
│   └── src/
│       ├── app/
│       │   ├── ielts/                   # /basic /advanced /intensive /dashboard /roadmap /statistics /history /calculator
│       │   ├── vocabulary/              # Vocabulary module
│       │   ├── grammar/                 # Grammar module
│       │   ├── pronunciation/           # Pronunciation checker
│       │   ├── vocab-lab/               # Flashcard deck management and study UI
│       │   ├── shadowing-dictation/     # Shadowing and dictation practice
│       │   ├── community/               # Post feed, comments
│       │   ├── pricing/                 # Subscription plan selection
│       │   ├── payment/vnpay-return/    # VNPay browser return URL handler
│       │   ├── admin/                   # Admin dashboard (users, subscriptions, content)
│       │   ├── login/ register/         # Authentication pages
│       │   └── profile/                 # User profile
│       ├── contexts/                    # Auth, Grading, Notification, Subscription, Theme
│       └── services/                    # Axios service wrappers per domain
│
├── frontend-mobile/                     # Expo 54 / React Native 0.81
│   └── app/
│       ├── (auth)/                      # login.tsx, register.tsx
│       ├── (tabs)/                      # Bottom tab navigator: ielts, vocabulary, pronunciation, grammar, shadowing, vocablab, profile, community, more
│       ├── ielts/                       # Advanced / Basic / Intensive sub-stacks
│       ├── vocabulary/                  # Vocabulary sub-routes
│       ├── grammar/                     # Grammar sub-routes
│       ├── vocab-lab/                   # [deckId].tsx, study/
│       ├── shadowing/                   # Shadowing sub-routes
│       ├── student-teacher/             # Student-teacher linking screens
│       ├── chat-ai.tsx                  # AI chat tutor screen
│       ├── notification.tsx             # Notification centre
│       └── pricing.tsx                  # Subscription screen
│
├── docs/                                # Deployment guides, architecture notes
├── docker-compose.yml                   # Local infra: Postgres 16, Redis 7, RabbitMQ 3, MinIO, PgAdmin
├── architecture-diagram.png             # System architecture diagram
├── .github/workflows/
│   ├── deploy.yml                       # Production deployment pipeline
│   └── test.yml                         # Backend test pipeline (prerequisite for deploy)
└── package.json                         # npm workspace root (backend-core + frontend-web)
```

---

## 8. Local Development Setup

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Docker + Docker Compose | v24.0 |
| Node.js | v20 LTS |
| Python | 3.11 |
| npm | v10 |

### Step 1 — Start Local Infrastructure

```bash
docker compose up -d
```

| Service | Host Port | Admin Interface |
|---|---|---|
| PostgreSQL 16 | 5433 | PgAdmin 4 → `http://localhost:5050` |
| Redis 7 | 6379 | — |
| RabbitMQ 3 | 5672 (AMQP) | Management UI → `http://localhost:15672` |
| MinIO | 9000 (API) | Console → `http://localhost:9001` |

> Production substitutes Supabase, Upstash, CloudAMQP, and Google Cloud Storage for the above containers respectively.

### Step 2 — Backend Core (NestJS)

```bash
cd backend-core
npm install
cp .env.example .env    # edit values below
npx prisma migrate dev
npx prisma generate
npm run start:dev       # → http://localhost:3000/api/v1
```

**`backend-core/.env` reference:**

```dotenv
# Database
DATABASE_URL="postgresql://ielts_user:ielts_password@localhost:5433/ielts_db?schema=public"
DIRECT_URL="postgresql://ielts_user:ielts_password@localhost:5433/ielts_db"

# Redis
REDIS_URL="redis://localhost:6379"

# RabbitMQ
RABBITMQ_URL="amqp://ielts:ielts_password@localhost:5672"
RABBITMQ_QUEUE_GRADING="exam-grading-queue"
RABBITMQ_QUEUE_TRANSCRIPTION="dictation-transcription-queue"
RABBITMQ_EXCHANGE="ielts-exchange"

# JWT
JWT_SECRET="change-in-production"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="change-in-production"
JWT_REFRESH_EXPIRATION="30d"

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Google OAuth (web + iOS + Android client IDs)
GOOGLE_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=<ios-client-id>.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=<android-client-id>.apps.googleusercontent.com

# Server
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3001,http://localhost:19006"

# Payment (mock = auto-approve; vnpay = VNPay gateway)
PAYMENT_PROVIDER=mock
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return
VNPAY_IPN_URL=http://localhost:3000/api/v1/subscriptions/webhook/vnpay
USD_TO_VND_RATE=25400

# OpenTelemetry (production only)
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Step 3 — AI Worker (FastAPI)

```bash
cd backend-ai
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # edit values below
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**`backend-ai/.env` reference:**

```dotenv
RABBITMQ_URL="amqp://ielts:ielts_password@localhost:5672"
RABBITMQ_QUEUE_GRADING="exam-grading-queue"

DATABASE_URL="postgresql://ielts_user:ielts_password@localhost:5432/ielts_db"

# MinIO (local) — swap for GCS vars in production
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="ielts-files"
STORAGE_USE_SSL="false"

# Google Cloud Storage (production)
GCS_BUCKET_NAME=""
GCS_PROJECT_ID=""
GOOGLE_APPLICATION_CREDENTIALS=""

# Whisper model configuration
WHISPER_MODEL="base"           # tiny | base | small | medium | large
WHISPER_DEVICE="cpu"           # cpu | cuda
WHISPER_COMPUTE_TYPE="int8"    # int8 | float16 | float32

# Google Gemini (model: gemini-2.0-flash)
GEMINI_API_KEY=""

BACKEND_CORE_URL="http://localhost:3000/api/v1"
PORT=8000
MAX_WORKERS=2
CONSUMER_PREFETCH_COUNT=1
```

> If `faster-whisper` is not installed, `TranscriptionService` falls back to a stub returning `"hello"` — sufficient for non-ML local development.

### Step 4 — Frontend Web (Next.js)

```bash
cd frontend-web
npm install
cp .env.example .env.local
npm run dev    # → http://localhost:3001
```

**`frontend-web/.env.local` reference:**

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
```

### Step 5 — Frontend Mobile (Expo)

```bash
cd frontend-mobile
npm install
cp .env.example .env
npm start      # Expo Dev Server — scan QR with Expo Go
```

**`frontend-mobile/.env` reference:**

```dotenv
EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"
EXPO_PUBLIC_AI_URL="http://localhost:8000"
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web-client-id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android-client-id>.apps.googleusercontent.com
```

### Convenience Scripts (workspace root)

```bash
npm run dev:all        # NestJS + Next.js concurrently (FastAPI must be started separately)
npm run infra:up       # docker compose up -d
npm run infra:down     # docker compose down
npm run infra:clean    # docker compose down -v (deletes volumes)
npm run prisma:migrate
npm run prisma:studio
```

---

## 9. DevOps and Infrastructure Observability

### CI/CD Pipeline (`.github/workflows/deploy.yml`)

The deployment pipeline is gated behind the **Backend Tests** workflow (`test.yml`). A deploy run is triggered only when the test workflow completes successfully on `main` or `develop`.

```
push to main/develop
        │
        ▼
[Backend Tests] workflow (test.yml)
        │ conclusion == 'success'
        ▼
[Deploy] workflow (deploy.yml)
        │
        ├── changes detection (dorny/paths-filter@v3)
        │     frontend-web/**  → deploy-frontend job
        │     backend-core/**  → deploy-backend job
        │     backend-ai/**    → deploy-backend job
        │
        ├── deploy-frontend
        │     Build linux/amd64 Docker image
        │     Push to gcr.io/ielts-master-495612/frontend-web:{sha} + :latest
        │     gcloud run deploy frontend-web --region asia-southeast1
        │
        └── deploy-backend
              Build changed images → push to GCR
              SSH (ed25519) to VM 34.143.226.199 as user xis108
              cd /opt/app
              docker compose pull <svc>
              docker compose up -d --no-deps <svc>
              docker image prune -f
```

Path-based filtering ensures that a change isolated to `frontend-web/` does not trigger a backend container build, and vice versa.

### Observability Stack

Grafana Alloy runs as a Docker container on the VM and serves as the unified telemetry collector:

| Signal | Source | Alloy Component | Destination |
|---|---|---|---|
| Metrics | `backend-core:3000/metrics`, `backend-ai:8000/metrics` (prom-client) | `prometheus.scrape` | Grafana Cloud Prometheus (remote write) |
| Logs | Docker container stdout/stderr | `loki.source.docker` | Grafana Cloud Loki |
| Traces | NestJS and FastAPI OTLP HTTP export to Alloy | OTLP receiver (`http://172.18.0.1:4318`) | Grafana Cloud Tempo |

NestJS instrumentation uses `@opentelemetry/auto-instrumentations-node` (covers HTTP, Express, and DB layers). FastAPI instrumentation uses `opentelemetry-instrumentation-fastapi` and `opentelemetry-instrumentation-httpx`. In local development, traces are emitted to stdout via `ConsoleSpanExporter`; production sets `OTEL_EXPORTER_OTLP_ENDPOINT` to the Alloy receiver on the Docker bridge network.

---

## 10. Contribution Matrix and Academic Credits

### Development Team

| Name | Student ID | Role | Primary Responsibilities |
|---|---|---|---|
| **La Thanh Si** | — | Fullstack Engineer · DevOps · AI Infrastructure | System architecture design; NestJS modular monolith; FastAPI AI worker; Prisma schema; FSRS integration; VNPay payment lifecycle; Next.js web portal; Expo mobile application; GCP deployment; CI/CD pipeline; observability stack |
| **Pham Duc Tai** | — | Co-Developer | Feature development and testing across web and mobile clients |

### Academic Supervision

| Name | Title | Institution |
|---|---|---|
| Nguyen Thi Hoang Khanh | Master of Science | Industrial University of Ho Chi Minh City (IUH) |

### Institution

**Industrial University of Ho Chi Minh City (Trường Đại học Công nghiệp TP.HCM)**
Faculty of Information Technology · Bachelor of Engineering in Information Technology

---

## License

This project is released under the **MIT License**. See [`LICENSE`](LICENSE) for full terms.

**Contact:** lathanhsi100804@gmail.com · [GitHub Issues](https://github.com/xishanht108/thesis-ielts-system/issues)

---

<div align="center">
<sub>
NestJS 10 · FastAPI 0.109 · Next.js 14 · Expo 54 · React Native 0.81 · Prisma 5 · ts-fsrs 5.3 · Google Gemini · Faster-Whisper · RabbitMQ · PostgreSQL · Redis · GCP
</sub>
</div>
