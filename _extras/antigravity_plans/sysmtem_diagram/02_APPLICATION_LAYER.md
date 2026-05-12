# Phase 2: Application Layer Nodes

## Objective
Add the two backend services to the diagram. These are the core processing engines of the system.

## Exact Nodes to Draw

### Node 1: Backend Core (NestJS)
- **Label**: `Backend Core`
- **Sublabel**: `NestJS (TypeScript) — REST API`
- **Port**: `:3000`
- **API Prefix**: `/api/v1`
- **Color**: Green (application)
- **Role**: The **orchestrator**. Handles ALL REST API endpoints, authentication, authorization, business logic, and CRUD operations. This is the single entry point for both frontend clients.

#### Internal Modules (show as grouped sub-components if space allows):

| Category | Modules |
|----------|---------|
| **Core** | AuthModule (JWT + Google OAuth), UsersModule |
| **IELTS Testing** | ExamsModule, ResultsModule, IeltsModule (Intensive + Advanced) |
| **Learning Content** | VocabularyModule, GrammarModule, PronunciationModule, ShadowingModule, DictationModule, VocabLabModule |
| **Engagement** | GamificationModule, NotificationsModule, PostsModule, NotesModule |
| **Business** | SubscriptionsModule, LearningModule |
| **Integration** | AiClientModule (RabbitMQ producer — publishes to 3 queues) |
| **Common/Shared** | PrismaModule (ORM), RedisModule (cache), CacheModule, StorageModule (Cloudinary) |

#### Key Dependencies Inside Backend Core:
- `ExamsModule` imports `AiClientModule` + `SubscriptionsModule`
- `IeltsModule` imports `AiClientModule` + `NotificationsModule` + `GamificationModule` + `SubscriptionsModule`
- `PronunciationModule` imports `NotificationsModule` + `GamificationModule`
- ALL modules import `PrismaModule` (implicit via global)

### Node 2: Backend AI (FastAPI)
- **Label**: `Backend AI`
- **Sublabel**: `FastAPI (Python) — AI Microservice`
- **Port**: `:8000`
- **Color**: Green (application)
- **Role**: AI microservice. It's a **HYBRID** service with two operational modes running simultaneously:

#### Mode A: REST API Endpoints (Synchronous)
Show these as sub-components:
1. `/api/v1/chat` — AI chatbot (Gemini)
2. `/api/v1/writing/grade` — Synchronous writing grading (Gemini)
3. `/api/v1/speaking/grade` — Synchronous speaking grading (Whisper + Gemini)
4. `/api/v1/grading/*` — General grading endpoints
5. `/health` — Health check

#### Mode B: RabbitMQ Consumers (Asynchronous, daemon threads)
Show these as sub-components, visually distinct from the REST endpoints:
1. **GradingConsumer** — Listens on `exam-grading-queue`
   - Handles: WRITING, SPEAKING, ADVANCED_WRITING, ADVANCED_SPEAKING
   - Calls Gemini API for grading
   - Writes results directly to PostgreSQL via psycopg2
2. **PronunciationConsumer** — Listens on `pronunciation-check-queue`
   - Downloads audio from MinIO/Cloudinary URLs
   - Runs Whisper STT (local model, on CPU)
   - Calculates pronunciation score
   - Writes results directly to PostgreSQL via psycopg2
3. **TranscriptionConsumer** — Listens on `dictation-transcription-queue`
   - Downloads audio from YouTube via `yt-dlp`
   - Runs Whisper STT (local model)
   - Calls BACK to Backend Core via HTTP PATCH (webhook callback)
   - Does NOT write to PostgreSQL directly

#### Internal Services (shared by both modes):
- `TranscriptionService` — Whisper STT wrapper (faster_whisper, model: base, device: cpu)
- `WritingGrader` — Gemini-based IELTS writing grading
- `SpeakingGrader` — Whisper transcription + Gemini grading
- `PronunciationService` — Score calculation and analysis
- `StorageService` — S3/MinIO client (boto3) + HTTP download

## Layout Suggestion
Place the two backends in the **middle** of the diagram, side by side:
```
┌─────────────────────┐    ┌─────────────────────────────┐
│    Backend Core      │    │        Backend AI            │
│    (NestJS :3000)    │    │     (FastAPI :8000)          │
│                      │    │                              │
│  ┌────────────────┐  │    │  ┌─────────┐ ┌───────────┐  │
│  │ 18 NestJS      │  │    │  │REST API │ │ Consumers │  │
│  │ Modules        │  │    │  │(Sync)   │ │(Async)    │  │
│  │                │  │    │  │         │ │           │  │
│  │ Auth, Exams,   │  │    │  │ Chat    │ │ Grading   │  │
│  │ IELTS, Vocab,  │  │    │  │ Writing │ │ Pronunc.  │  │
│  │ Grammar,       │  │    │  │ Speaking│ │ Transcript│  │
│  │ Pronunciation, │  │    │  └─────────┘ └───────────┘  │
│  │ Shadowing,     │  │    │                              │
│  │ Gamification,  │  │    │  ┌─────────────────────────┐│
│  │ Subscriptions  │  │    │  │ Whisper STT (local)     ││
│  │ ...            │  │    │  │ Gemini Client           ││
│  └────────────────┘  │    │  └─────────────────────────┘│
│                      │    │                              │
│  AiClientModule      │    │                              │
│  (RabbitMQ Producer) │    │                              │
└─────────────────────┘    └─────────────────────────────┘
```

## PlantUML Snippet

```plantuml
' === APPLICATION LAYER ===
rectangle "Application Layer" as app_layer #E8F5E9 {

    rectangle "Backend Core\n(NestJS :3000)\nREST API /api/v1" as BC #4CAF50 {
        card "AuthModule\n(JWT + Google OAuth)" as BC_AUTH
        card "ExamsModule" as BC_EXAM
        card "IeltsModule\n(Intensive + Advanced)" as BC_IELTS
        card "PronunciationModule" as BC_PRON
        card "Learning Modules\n(Vocab, Grammar, Shadowing,\nDictation, VocabLab)" as BC_LEARN
        card "Engagement\n(Gamification, Notifications,\nPosts, Notes)" as BC_ENGAGE
        card "SubscriptionsModule\n(VNPay integration)" as BC_SUB
        card "AiClientModule\n(RabbitMQ Producer)" as BC_AI
    }

    rectangle "Backend AI\n(FastAPI :8000)" as BAI #66BB6A {
        rectangle "REST API (Sync)" as BAI_REST {
            card "/chat" as BAI_CHAT
            card "/writing/grade" as BAI_WRITE
            card "/speaking/grade" as BAI_SPEAK
        }
        rectangle "RabbitMQ Consumers (Async)" as BAI_CONSUMERS {
            card "GradingConsumer\n(exam-grading-queue)" as BAI_GC
            card "PronunciationConsumer\n(pronunciation-check-queue)" as BAI_PC
            card "TranscriptionConsumer\n(dictation-transcription-queue)" as BAI_TC
        }
        card "Whisper STT\n(local, base model, CPU)" as BAI_WHISPER
    }
}
```

## Validation Checklist
- [x] Backend Core shows it's the main REST API orchestrator
- [x] Backend Core's `AiClientModule` is visually identified as the RabbitMQ producer
- [x] Backend AI clearly shows TWO modes: REST (sync) and Consumers (async)
- [x] All 3 consumers are named with their exact queue names
- [x] Whisper STT is shown as a local model (not a cloud service)
- [x] Ports `:3000` and `:8000` are labeled

**Implemented in:** `output/system_architecture.puml` (Application Layer block). Arrows in Phase 5.
