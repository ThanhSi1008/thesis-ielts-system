# Phase 6: Final Assembly & Validation

## Objective
Combine all phases into a single, complete PlantUML diagram. Add legend, polish layout, and validate against the checklist.

## Step 1: Combine All PlantUML Snippets
Merge the snippets from Phases 1–5 into a single `.puml` file at:
```
_extras/antigravity_plans/sysmtem_diagram/output/system_architecture.puml
```

## Step 2: Add Legend
Add a legend box at the bottom-right explaining the color coding and arrow styles:

```plantuml
legend right
  |= Color |= Meaning |
  | <#2196F3> | Presentation Layer (Frontends) |
  | <#4CAF50> | Application Layer (Backends) |
  | <#FF9800> | Data Layer (Databases, Caches, Brokers) |
  | <#9C27B0> | External Services (3rd Party APIs) |
  |= Arrow Style |= Meaning |
  | ──→ (solid) | Synchronous (HTTP/REST, SQL) |
  | --→ (dashed) | Asynchronous (AMQP message queue) |
  | ←→ (double) | Bidirectional |
end legend
```

## Step 3: Add Title and Metadata
```plantuml
title TOEIC Master AI — System Architecture Diagram
caption Generated from codebase analysis. All connections are code-verified.
```

## Step 4: Final Validation Checklist

### Nodes (10 total)
- [x] Frontend Web (Next.js :3001)
- [x] Frontend Mobile (Expo)
- [x] Backend Core (NestJS :3000)
- [x] Backend AI (FastAPI :8000) — showing REST + Consumers
- [x] PostgreSQL 16 (:5433)
- [x] Redis 7 (:6379)
- [x] RabbitMQ 3 (:5672) — showing 3 queues
- [x] MinIO (:9000) — marked as dev-only
- [x] 5 External Services (Gemini, Cloudinary, OAuth, VNPay, YouTube)

### Arrows (16 total)
- [x] FW → BC (HTTP/REST Axios+JWT)
- [x] FM → BC (HTTP/REST fetch+JWT)
- [x] FW → BAI (HTTP/REST Chat API) — DIRECT, bypasses BC
- [x] BC → RMQ (AMQP Publish)
- [x] RMQ → GradingConsumer (AMQP Consume)
- [x] RMQ → PronunciationConsumer (AMQP Consume)
- [x] RMQ → TranscriptionConsumer (AMQP Consume)
- [x] BC → PG (Prisma ORM)
- [x] BAI → PG (psycopg2 Direct SQL)
- [x] BAI(TC) → BC (HTTP PATCH Webhook callback)
- [x] BC → Redis (ioredis)
- [x] BC → Cloudinary (HTTPS SDK)
- [x] BAI → Gemini (HTTPS SDK)
- [x] BAI(PC) → MinIO (S3 boto3)
- [x] BAI(TC) → YouTube (HTTPS yt-dlp)
- [x] BC ↔ VNPay (HTTPS bidirectional)
- [x] BC → Google OAuth (HTTPS)

### Common Mistakes — Final Check
- [x] ❌ NO arrow from Backend AI to Redis
- [x] ❌ NO arrow from Backend Core to Gemini
- [x] ❌ NO arrow from Frontend Mobile to Backend AI
- [x] ❌ MinIO is NOT shown as a production component
- [x] ✅ PostgreSQL shows DUAL access (Prisma + psycopg2)
- [x] ✅ Backend AI shows HYBRID nature (REST + Consumers)
- [x] ✅ TranscriptionConsumer has callback arrow BACK to Backend Core

**Deliverable:** `output/system_architecture.puml` (title, caption, legend, flows).

## Step 5: Trace Key Scenarios to Verify

### Scenario A: IELTS Writing Grading (Async)
```
FW → BC → RMQ → GradingConsumer → Gemini → PostgreSQL
```

### Scenario B: Pronunciation Check
```
FW/FM → BC → RMQ → PronunciationConsumer → MinIO → Whisper → PostgreSQL
```

### Scenario C: AI Chatbot (Sync, Direct)
```
FW → BAI (REST /chat) → Gemini → response (no DB, no BC)
```

### Scenario D: Shadowing Transcription
```
BC → RMQ → TranscriptionConsumer → YouTube(yt-dlp) → Whisper → BC(webhook) → PostgreSQL
```

If ALL 4 scenarios can be traced on your diagram without missing any node or arrow, the diagram is **correct and complete**.

## Output Files
After completion, the folder should contain:
```
_extras/antigravity_plans/sysmtem_diagram/
├── 00_MASTER_PLAN.md
├── 01_DATA_LAYER.md
├── 02_APPLICATION_LAYER.md
├── 03_PRESENTATION_LAYER.md
├── 04_EXTERNAL_SERVICES.md
├── 05_DATA_FLOWS.md
├── 06_FINAL_ASSEMBLY.md   (this file)
└── output/
    └── system_architecture.puml   (the final diagram)
```
