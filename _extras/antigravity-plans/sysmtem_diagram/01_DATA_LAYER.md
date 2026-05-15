# Phase 1: Data Layer Nodes

## Objective
Create the foundational data/infrastructure layer of the architecture diagram. These are the stateful services that other components depend on.

## Exact Nodes to Draw

### Node 1: PostgreSQL
- **Label**: `PostgreSQL 16`
- **Sublabel**: `Primary Relational Database`
- **Port**: `:5433 → 5432` (host → container)
- **Container name**: `toeic-postgres`
- **Color**: Orange (data store)
- **Key fact**: This is a **single shared database**. Both `backend-core` (via Prisma ORM) and `backend-ai` (via raw psycopg2 SQL) connect to it. This dual-access pattern is critical to show.
- **Database name**: `toeic_db`

### Node 2: Redis
- **Label**: `Redis 7`
- **Sublabel**: `Cache & Session Store`
- **Port**: `:6379`
- **Container name**: `toeic-redis`
- **Color**: Orange (data store)
- **Key fact**: Used **ONLY by backend-core** (via `ioredis` library). The AI backend does NOT use Redis. Do NOT draw any arrow from backend-ai to Redis.
- **Features**: append-only persistence enabled

### Node 3: RabbitMQ
- **Label**: `RabbitMQ 3`
- **Sublabel**: `Message Broker (AMQP)`
- **Ports**: `:5672` (AMQP protocol), `:15672` (Management UI)
- **Container name**: `toeic-rabbitmq`
- **Color**: Orange (data store / infrastructure)
- **Key fact**: Contains exactly **3 queues** (detail them as sub-labels or notes):
  1. `exam-grading-queue` — Writing & Speaking grading tasks (has DLQ: `exam-grading-dlq`, TTL: 5 min)
  2. `pronunciation-check-queue` — Pronunciation analysis tasks
  3. `dictation-transcription-queue` — YouTube audio transcription tasks
- **Pattern**: Producer = backend-core, Consumers = backend-ai (3 daemon threads)

### Node 4: MinIO
- **Label**: `MinIO`
- **Sublabel**: `S3-Compatible Object Storage (Dev)`
- **Ports**: `:9000` (API), `:9001` (Console UI)
- **Container name**: `toeic-minio`
- **Color**: Orange (data store), but with a **dashed border** to indicate "development only"
- **Key fact**: Used **only in development**. In production, Cloudinary (backend-core) and direct HTTP downloads (backend-ai) replace it. Only `backend-ai`'s `PronunciationConsumer` accesses MinIO via S3 protocol (boto3).

## Layout Suggestion
Place these 4 nodes at the **bottom** of the diagram in a horizontal row:
```
[ PostgreSQL ]  [ Redis ]  [ RabbitMQ ]  [ MinIO (dev) ]
```

## PlantUML Snippet (Starting Point)

```plantuml
' === DATA LAYER ===
rectangle "Data Layer" as data_layer #FFF3E0 {
    database "PostgreSQL 16\n(Shared DB)\n:5433" as PG #FF9800
    database "Redis 7\n(Cache)\n:6379" as RD #FF9800
    queue "RabbitMQ 3\n(Message Broker)\n:5672" as RMQ #FF9800 {
        card "exam-grading-queue" as Q1
        card "pronunciation-check-queue" as Q2
        card "dictation-transcription-queue" as Q3
    }
    storage "MinIO\n(Dev Object Storage)\n:9000" as MINIO #FF9800
}
```

## Validation Checklist
- [x] PostgreSQL shows it's shared (dual-access from 2 backends)
- [x] Redis shows it's backend-core only
- [x] RabbitMQ shows exactly 3 queues with their names
- [x] MinIO is visually marked as "development only"
- [x] All ports are correct
- [x] All container names match docker-compose.yml

**Implemented in:** `output/system_architecture.puml` (Phase 1 section; arrows in Phase 5).
