# Stage 4 — Backend AI (FastAPI)

> **Location:** `backend-ai/app/`
> **Framework:** FastAPI, Python 3.12
> **Port:** 8000
> **Role:** Receives async jobs from RabbitMQ, processes with AI, writes results directly to PostgreSQL

---

## Architecture

```
FastAPI App (main.py)
  ├── REST API (app/api/)     — Health checks + synchronous AI endpoints
  ├── Consumers (app/consumers/) — RabbitMQ async workers (daemon threads)
  └── Services (app/services/)   — Business logic singletons
```

## Startup Flow (`main.py`)

1. FastAPI app created with lifespan context manager
2. On startup: spawns RabbitMQ consumer threads (daemon)
3. Consumers run `pika.BlockingConnection` in infinite loops
4. On shutdown: connections close automatically (daemon threads)

## REST Endpoints (`app/api/`)

| File | Route | Method | Purpose |
|------|-------|--------|---------|
| `health.py` | `/health` | GET | Health check with service status |
| `grading.py` | `/grade` | POST | Synchronous exam grading (backup) |
| `writing.py` | `/writing/grade` | POST | Grade IELTS writing with Gemini |
| `speaking.py` | `/speaking/grade` | POST | Grade IELTS speaking with Gemini + Whisper |
| `chat.py` | `/chat` | POST | AI chat for study assistance |

## RabbitMQ Consumers (`app/consumers/`)

### `grading_consumer.py`
- **Queue:** `exam-grading-queue`
- **Flow:** Receives `{ sessionId, answers }` → grades answers → updates `exam_sessions` table via psycopg2
- **Grading:** Compares user answers against correct answers in the exam JSON
- **Status updates:** `IN_PROGRESS` → `GRADING` → `COMPLETED`

### `pronunciation_consumer.py`
- **Queue:** `pronunciation-check-queue`
- **Flow:** Receives `{ attemptId, audioUrl, expectedText, userId, soundId }` → downloads audio from MinIO → Whisper STT → scoring → updates `pronunciation_attempts` + `pronunciation_progress` tables
- **Scoring:** Levenshtein distance between transcribed text and expected text
- **Progress:** Updates mastery status (NEW → PRACTICING → MASTERED) based on scores

## Services (`app/services/`)

### `transcription_service.py` — Whisper STT
```python
# Singleton pattern — model loaded once
class TranscriptionService:
    def __init__(self):
        self.model = WhisperModel("base", device="cpu", compute_type="int8")
    
    def transcribe(self, audio_path: str) -> str:
        segments, info = self.model.transcribe(audio_path)
        return " ".join([s.text for s in segments]).strip()
```

### `pronunciation_service.py` — Scoring
- Word-level comparison using Levenshtein distance
- Returns per-word scores (0-100) + overall score
- Handles edge cases: empty transcription, short recordings

### `writing_grader.py` — IELTS Writing Assessment
- Uses **Gemini 2.5 Flash** API
- Sends structured prompt with IELTS Writing rubric (Task Achievement, Coherence, Lexical Resource, Grammar)
- Returns JSON: `{ overallBand, scores: { ta, cc, lr, gra }, feedback, correctedEssay }`

### `speaking_grader.py` — IELTS Speaking Assessment
- Downloads audio → Whisper transcription → Gemini evaluation
- Rubric: Fluency, Lexical Resource, Grammar, Pronunciation
- Returns JSON: `{ overallBand, scores: {...}, transcript, feedback }`

### `grading_service.py` — Exam Auto-grading
- Compares arrays of answers against correct answers
- Handles multiple question types (multiple choice, fill-in, matching)

### `storage_service.py` — MinIO/GCS Client
- Downloads files from object storage for processing
- Uses `boto3` client with MinIO endpoint

## Configuration (`app/config.py`)

```python
class Settings(BaseSettings):
    database_url: str
    rabbitmq_url: str
    gemini_api_key: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket_name: str
    whisper_model_size: str = "base"
    
    class Config:
        env_file = ".env"
```

## DB Access Pattern

The AI service writes **directly** to PostgreSQL via `psycopg2`:

```python
import psycopg2
from app.config import get_settings

settings = get_settings()
conn = psycopg2.connect(settings.database_url)
cursor = conn.cursor()

# Update pronunciation attempt
cursor.execute("""
    UPDATE pronunciation_attempts
    SET status = %s, "transcribedText" = %s, score = %s, "updatedAt" = NOW()
    WHERE id = %s
""", ('COMPLETED', transcribed_text, score, attempt_id))
conn.commit()
```

> ⚠️ Column names in SQL must use double-quotes for camelCase fields (Prisma convention).

## Gemini API Usage

```python
from google import genai  # NOT google.generativeai (old SDK)

client = genai.Client(api_key=settings.gemini_api_key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config=genai.types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.3,
    ),
)
```
