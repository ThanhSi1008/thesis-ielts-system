# Phase 5: Data Flows (All Arrows)

## Objective
Draw ALL arrows connecting the nodes from Phases 1–4. Every arrow must have a **protocol label** and a **direction**.

## Complete Arrow List (14 arrows total)

### ARROW 1: Frontend Web → Backend Core
- **From**: Frontend Web
- **To**: Backend Core
- **Protocol**: `HTTP/REST (Axios + JWT)`
- **Direction**: →
- **Purpose**: ALL CRUD operations, auth, exams, learning content, etc.
- **Base URL**: `http://localhost:3000/api/v1`

### ARROW 2: Frontend Mobile → Backend Core
- **From**: Frontend Mobile
- **To**: Backend Core
- **Protocol**: `HTTP/REST (fetch + JWT)`
- **Direction**: →
- **Purpose**: Same API as web, different HTTP client
- **Base URL**: `http://192.168.1.24:3000/api/v1`

### ARROW 3: Frontend Web → Backend AI (DIRECT)
- **From**: Frontend Web
- **To**: Backend AI (REST API → `/chat` endpoint)
- **Protocol**: `HTTP/REST (Chat API)`
- **Direction**: →
- **Purpose**: AI chatbot conversations. This is the ONLY direct FE→AI connection.
- **IMPORTANT**: This arrow BYPASSES backend-core. The chat is called directly.

### ARROW 4: Backend Core → RabbitMQ (Publish)
- **From**: Backend Core (`AiClientModule`)
- **To**: RabbitMQ
- **Protocol**: `AMQP (Publish)`
- **Direction**: →
- **Purpose**: Publishes async tasks to 3 queues:
  - `exam-grading-queue` — writing/speaking grading
  - `pronunciation-check-queue` — pronunciation analysis
  - `dictation-transcription-queue` — transcription tasks

### ARROW 5: RabbitMQ → GradingConsumer (Consume)
- **From**: RabbitMQ (`exam-grading-queue`)
- **To**: Backend AI → `GradingConsumer`
- **Protocol**: `AMQP (Consume)`
- **Direction**: →

### ARROW 6: RabbitMQ → PronunciationConsumer (Consume)
- **From**: RabbitMQ (`pronunciation-check-queue`)
- **To**: Backend AI → `PronunciationConsumer`
- **Protocol**: `AMQP (Consume)`
- **Direction**: →

### ARROW 7: RabbitMQ → TranscriptionConsumer (Consume)
- **From**: RabbitMQ (`dictation-transcription-queue`)
- **To**: Backend AI → `TranscriptionConsumer`
- **Protocol**: `AMQP (Consume)`
- **Direction**: →

### ARROW 8: Backend Core → PostgreSQL
- **From**: Backend Core
- **To**: PostgreSQL
- **Protocol**: `Prisma ORM`
- **Direction**: ↔ (read/write)
- **Purpose**: All 18 modules access DB through PrismaService

### ARROW 9: Backend AI → PostgreSQL (DIRECT)
- **From**: Backend AI (GradingConsumer + PronunciationConsumer)
- **To**: PostgreSQL
- **Protocol**: `psycopg2 (Direct SQL)`
- **Direction**: → (write)
- **Purpose**: Consumers write grading results and pronunciation scores directly
- **CRITICAL**: This bypasses Backend Core's API. Both backends write to the SAME database.
- **Tables**: `results`, `exam_sessions`, `pronunciation_attempts`, `ielts_advanced_writing_sessions`, `ielts_advanced_speaking_sessions`

### ARROW 10: Backend AI → Backend Core (HTTP Callback)
- **From**: Backend AI (`TranscriptionConsumer`)
- **To**: Backend Core
- **Protocol**: `HTTP PATCH (Webhook callback)`
- **Direction**: →
- **Purpose**: After transcription, calls back to Backend Core with results:
  - `PATCH /api/v1/dictation/webhooks/videos/{videoId}/complete`
  - `PATCH /api/v1/shadowing/webhooks/videos/{videoId}/complete`

### ARROW 11: Backend Core → Redis
- **From**: Backend Core
- **To**: Redis
- **Protocol**: `ioredis`
- **Direction**: ↔ (read/write)
- **Purpose**: Cache layer for pronunciation data, vocab data, etc.
- **IMPORTANT**: ONLY Backend Core uses Redis. Backend AI has NO Redis connection.

### ARROW 12: Backend Core → Cloudinary
- **From**: Backend Core (`StorageService`)
- **To**: Cloudinary
- **Protocol**: `HTTPS (Cloudinary SDK)`
- **Direction**: ↔ (upload/delete)

### ARROW 13: Backend AI → Google Gemini API
- **From**: Backend AI (WritingGrader, SpeakingGrader, Chat)
- **To**: Google Gemini API
- **Protocol**: `HTTPS (google-genai SDK)`
- **Direction**: →

### ARROW 14: Backend AI → MinIO + YouTube
- **14a From**: Backend AI (`PronunciationConsumer`) → MinIO
  - **Protocol**: `S3 Protocol (boto3)`
  - **Purpose**: Download pronunciation audio files
- **14b From**: Backend AI (`TranscriptionConsumer`) → YouTube
  - **Protocol**: `HTTPS (yt-dlp)`
  - **Purpose**: Download YouTube audio for transcription

### ARROW 15 (bidirectional): Backend Core ↔ VNPay
- **From**: Backend Core → VNPay: Create payment URL
- **From**: VNPay → Backend Core: IPN webhook at `/subscriptions/webhook/vnpay`
- **Protocol**: `HTTPS`

### ARROW 16: Backend Core → Google OAuth
- **From**: Backend Core (`AuthModule`)
- **To**: Google OAuth
- **Protocol**: `HTTPS`
- **Purpose**: Validate Google ID tokens for social login

## Validation Checklist
- [x] Frontend Web has 2 outgoing arrows (Backend Core + Backend AI chat)
- [x] Frontend Mobile has 1 outgoing arrow (Backend Core only)
- [x] Backend Core → RabbitMQ is labeled as "Publish"
- [x] RabbitMQ → Backend AI consumers are labeled as "Consume" (3 arrows)
- [x] Backend AI → PostgreSQL is labeled "psycopg2 (Direct SQL)" — NOT "Prisma"
- [x] Backend Core → PostgreSQL is labeled "Prisma ORM"
- [x] TranscriptionConsumer → Backend Core callback arrow exists
- [x] NO arrow from Backend AI to Redis
- [x] NO arrow from Backend Core to Gemini API
- [x] NO arrow from Frontend Mobile to Backend AI
- [x] VNPay arrows are bidirectional

**Implemented in:** `output/system_architecture.puml`. **Phase 6:** legend + final caption per `06_FINAL_ASSEMBLY.md`.
