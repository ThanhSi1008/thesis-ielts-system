# Architecture Stack Summary — Để Vẽ Diagram

---

## 1. CLIENT LAYER (Người dùng truy cập)

| Component | Stack | Deploy |
|---|---|---|
| **Web App** | Next.js 14, React 18, TypeScript, Tailwind CSS 3 | Google Cloud Run (auto-scaled) |
| **Mobile App** | Expo 54, React Native 0.81, React 19, TypeScript | APK/IPA (cài trực tiếp) |

- Web domain: `ielts-master.io.vn`
- Mobile gọi API qua: `dedangdown.io.vn`

---

## 2. REVERSE PROXY (Trên VM)

| Component | Stack |
|---|---|
| **Nginx** (Alpine) | SSL termination, HTTP→HTTPS redirect |
| **SSL** | Let's Encrypt + Certbot (TLSv1.2 + TLSv1.3) |

Routing:
- `/api/v1/*` → backend-core:3000
- `/ai/*` → backend-ai:8000

---

## 3. APPLICATION LAYER (Cùng 1 VM: `app-vm` n2-standard-4)

| Component | Stack | Port | Ngôn ngữ |
|---|---|---|---|
| **Backend Core** | NestJS 10, Prisma 5 | :3000 | TypeScript |
| **Backend AI** | FastAPI 0.109, Uvicorn | :8000 | Python 3.11 |

**Backend Core kết nối tới:**
- PostgreSQL (Supabase) — qua PgBouncer
- Redis (Upstash) — qua TLS
- RabbitMQ (CloudAMQP) — qua AMQPS
- Cloudinary — image upload/CDN
- Google OAuth — xác thực
**Backend AI kết nối tới:**
- PostgreSQL (Supabase) — direct connection
- RabbitMQ (CloudAMQP) — consumer
- Google Gemini API — LLM grading (Writing + Speaking)
- Faster-Whisper — Speech-to-Text (chạy local trên VM, CPU)
- Google Cloud Storage — audio file access
- Backend Core — callback kết quả grading

**Giao tiếp giữa 2 backend:**
- Backend Core → (RabbitMQ) → Backend AI (async grading queue)
- Backend AI → (HTTP callback) → Backend Core (trả kết quả)

---

## 4. DATA LAYER (Managed Services bên ngoài)

| Service | Provider | Giao thức | Mục đích |
|---|---|---|---|
| **PostgreSQL** | Supabase | `postgresql://` (PgBouncer :6543 + Direct :5432) | Database chính (55+ models) |
| **Redis** | Upstash | `rediss://` (TLS) | Cache, session |
| **RabbitMQ** | CloudAMQP | `amqps://` (TLS) | Message broker (grading queue) |
| **Object Storage** | Google Cloud Storage | GCS API | Audio, media assets |
| **Image CDN** | Cloudinary | HTTPS API | Image upload, transformation |

---

## 5. AI/ML SERVICES

| Model | Thư viện | Chạy ở đâu | Mục đích |
|---|---|---|---|
| **Whisper** (base) | faster-whisper, CTranslate2 | Local trên VM (CPU, int8) | Speech-to-Text |
| **Gemini** (2.0-flash) | google-genai | Google Cloud API | Writing + Speaking grading |
| **IPA Engine** | eng-to-ipa + Levenshtein | Local trên VM | Pronunciation assessment |
| **ffmpeg** | system package | Local trên VM | Audio decoding (runtime dependency của Whisper) |

---

## 6. EXTERNAL SERVICES (API bên thứ 3)

| Service | Mục đích |
|---|---|
| **Google OAuth** | Đăng nhập bằng Google |
| **Google Gemini API** | AI grading |
| **VNPay** | Thanh toán trực tuyến |
| **Cloudinary** | Image CDN |
| **YouTube** (yt-dlp) | Download video cho Shadowing |

---

## 7. MONITORING & OBSERVABILITY

| Component | Stack | Vai trò |
|---|---|---|
| **Grafana Alloy** | grafana/alloy (container trên VM) | Collector trung tâm |
| **Prometheus pipeline** | Alloy prometheus.scrape + remote_write | Thu metrics từ backend-core + backend-ai |
| **Loki pipeline** | Alloy loki.source.docker + loki.write | Thu logs từ Docker containers |
| **Traces** | OpenTelemetry SDK (cả NestJS + FastAPI) | Distributed tracing |
| **Dashboard** | Grafana Cloud (free tier) | Hiển thị metrics, logs, traces |
| **prom-client** | @willsoto/nestjs-prometheus | Expose /metrics endpoint (NestJS) |

Luồng:
```
backend-core ──metrics──→ Alloy ──remote_write──→ Grafana Cloud (Prometheus)
backend-ai   ──metrics──→ Alloy ──remote_write──→ Grafana Cloud (Prometheus)
Docker containers ─logs─→ Alloy ──loki.write────→ Grafana Cloud (Loki)
NestJS/FastAPI ──traces──→ Alloy ──OTLP──────────→ Grafana Cloud (Tempo)
```

---

## 8. CI/CD PIPELINE

| Step | Stack |
|---|---|
| **Trigger** | GitHub Actions (push to `main`/`deploy`) |
| **Change Detection** | dorny/paths-filter |
| **Build** | Docker multi-stage (linux/amd64) |
| **Registry** | Google Container Registry (GCR) |
| **Deploy Frontend** | `gcloud run deploy` → Cloud Run |
| **Deploy Backend** | SSH (ed25519) → VM → `docker compose pull + up` |

---

## 9. CONTAINERIZATION (Trên VM: `/opt/app/`)

| Container | Image | Resource |
|---|---|---|
| `nginx` | nginx:alpine | — |
| `backend-core` | gcr.io/.../backend-core:latest | — |
| `backend-ai` | gcr.io/.../backend-ai:latest | max 10GB RAM, 3 CPUs |
| `alloy` | grafana/alloy:latest | — |

---

## 📐 Sơ Đồ Tổng Quát (Text) — Để Tham Khảo Khi Vẽ

```
┌─────────────────────────────────────────────────────────┐
│                     USERS                                │
│          Web Browser        Mobile App                   │
└──────────┬──────────────────┬────────────────────────────┘
           │                  │
           ▼                  │
┌─────────────────────┐       │
│   Google Cloud Run  │       │
│   Next.js 14 (Web)  │       │
│  ielts-master.io.vn │       │
└──────────┬──────────┘       │
           │ HTTPS            │ HTTPS
           ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│  GCP VM (n2-standard-4, 16GB RAM, asia-southeast1-b)     │
│  dedangdown.io.vn (34.143.226.199)                       │
│                                                           │
│  ┌───────────────────────────────────────────────┐       │
│  │  Nginx (SSL termination, reverse proxy)       │       │
│  │  Let's Encrypt / TLSv1.2+1.3                 │       │
│  └──────┬────────────────────────┬───────────────┘       │
│         │ /api/v1/               │ /ai/                  │
│         ▼                        ▼                       │
│  ┌──────────────┐    ┌──────────────────────┐            │
│  │ backend-core │    │    backend-ai         │            │
│  │ NestJS 10    │    │    FastAPI 0.109      │            │
│  │ TypeScript   │    │    Python 3.11        │            │
│  │ Prisma 5     │    │    Whisper (STT)      │            │
│  │ :3000        │    │    Gemini (LLM)       │            │
│  └──────┬───────┘    │    :8000              │            │
│         │            └────────┬──────────────┘            │
│         │   RabbitMQ (async)  │                           │
│         │◄═══════════════════►│                           │
│                                                           │
│  ┌───────────────────────────────────────────────┐       │
│  │  Grafana Alloy (metrics + logs + traces)      │       │
│  └───────────────────────┬───────────────────────┘       │
└──────────────────────────┼───────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────────┐
        ▼                  ▼                      ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Supabase   │  │   Upstash    │  │   CloudAMQP      │
│  PostgreSQL  │  │    Redis     │  │   RabbitMQ       │
│  (PgBouncer) │  │   (TLS)     │  │   (AMQPS)        │
└──────────────┘  └──────────────┘  └──────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Cloudinary  │  │     GCS      │  │  Grafana Cloud   │
│  Image CDN   │  │ Object Store │  │ Prometheus+Loki  │
└──────────────┘  └──────────────┘  │    +Tempo        │
                                    └──────────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Google OAuth │  │ Google Gemini│  │     VNPay        │
│   (Login)    │  │   (AI API)   │  │   (Payment)      │
└──────────────┘  └──────────────┘  └──────────────────┘
```
