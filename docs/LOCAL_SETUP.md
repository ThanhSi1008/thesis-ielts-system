# Local Development Setup Guide

> **IELTS Master AI** — full-stack platform (NestJS + FastAPI + Next.js + Expo)
> Supports **macOS (Apple Silicon & Intel)** and **Windows 10/11**.

---

## Prerequisites

Install the following tools before starting:

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20 or 22 LTS | [nodejs.org](https://nodejs.org) |
| **Python** | 3.11+ | [python.org](https://python.org) — check "Add to PATH" on Windows installer |
| **Docker Desktop** | 24+ | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

### Windows-only: one-time system setup

**1. Docker Desktop — enable WSL 2 backend**
Open Docker Desktop → Settings → General → enable **"Use the WSL 2 based engine"**.
Without this, containers start slowly and volume mounts may fail.

**2. PowerShell execution policy** (run once as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Needed to activate Python virtual environments from PowerShell.

**3. Git line endings** (run once after cloning):
```bash
git config core.autocrlf true
```
Prevents shell scripts embedded in npm scripts from being corrupted by CRLF line endings.

---

## Step 1 — Clone & Install Dependencies

```bash
git clone <repo-url>
cd thesis-ielts-system

# Install Node dependencies for root workspace, backend-core, and frontend-web
npm install
```

**Set up the Python virtual environment for `backend-ai`:**

```bash
cd backend-ai
python -m venv venv
```

Activate it (only needed for manual runs — `npm run ai:dev` activates it automatically):

```bash
# macOS / Linux
source venv/bin/activate

# Windows — Command Prompt
venv\Scripts\activate.bat

# Windows — PowerShell
.\venv\Scripts\Activate.ps1
```

```bash
pip install -r requirements.txt
cd ..
```

> **Note:** If `faster-whisper` fails to install (common on Windows without build tools),
> the AI service will fall back to a mock transcription that returns `"hello"`.
> All other features (writing grading, chat, vocabulary) still work normally.

---

## Step 2 — Create Environment Files

All `.env` and `.env.local` files are **gitignored** — they are never committed to the repo.
Create the three files below exactly as shown. They contain local-only credentials (Docker containers, VNPay sandbox test account).

### `backend-core/.env.local`

```env
# PostgreSQL — local Docker (external port 5433 maps to container port 5432)
DATABASE_URL="postgresql://ielts_user:ielts_password@localhost:5433/ielts_db?schema=public"
DIRECT_URL="postgresql://ielts_user:ielts_password@localhost:5433/ielts_db"

# Redis — local Docker
REDIS_URL="redis://localhost:6379"

# RabbitMQ — local Docker
RABBITMQ_URL="amqp://ielts:ielts_password@localhost:5672"

# MinIO — local Docker (S3-compatible object storage)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="ielts-files"
STORAGE_REGION="us-east-1"
STORAGE_USE_SSL="false"

# JWT — local-only secrets (do not use these in production)
JWT_SECRET="local-dev-jwt-secret-not-for-production"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="local-dev-refresh-secret-not-for-production"
JWT_REFRESH_EXPIRATION="30d"

# CORS — allow frontend web (3001) and Expo web (19006)
CORS_ORIGIN="http://localhost:3001,http://localhost:19006"

# VNPay sandbox — shared test account, no real money
PAYMENT_PROVIDER=vnpay
VNPAY_TMN_CODE=9LXTDV8R
VNPAY_HASH_SECRET=W7P9HX4TZOJEY307B678OTTMLSLM8HU3
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return
# VNPay cannot reach localhost for IPN callbacks — this is expected.
# The Return URL flow (/checkout/verify) is sufficient for local testing.
VNPAY_IPN_URL=http://localhost:3000/api/v1/subscriptions/webhook/vnpay

NODE_ENV="development"
```

### `backend-ai/.env`

> FastAPI uses `pydantic-settings` which reads `.env` directly. `.env.local` is not supported here.

```env
# RabbitMQ — local Docker
RABBITMQ_URL="amqp://ielts:ielts_password@localhost:5672"

# PostgreSQL — local Docker (port 5433)
DATABASE_URL="postgresql://ielts_user:ielts_password@localhost:5433/ielts_db"

# MinIO — local Docker
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="ielts-files"
STORAGE_REGION="us-east-1"
STORAGE_USE_SSL="false"

# Backend Core callback URL
BACKEND_CORE_URL="http://localhost:3000/api/v1"

# Google Gemini API key — get a free key at https://aistudio.google.com/apikey
GEMINI_API_KEY=""

# Whisper model — "tiny" is fastest for local development
WHISPER_MODEL="tiny"
WHISPER_DEVICE="cpu"
WHISPER_COMPUTE_TYPE="int8"

ENVIRONMENT="development"
PORT=8000
LOG_LEVEL="INFO"
MAX_WORKERS=2
CONSUMER_PREFETCH_COUNT=1
```

### `frontend-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME="IELTS Master AI (local)"
NEXT_PUBLIC_APP_VERSION="1.0.0"
# Leave blank to skip Google login — email/password works without this
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Step 3 — First-Time Database & Storage Setup

Run this block **once** after creating your environment files:

```bash
# Start Docker containers
npm run infra:up

# Wait ~15 seconds for containers to become healthy, then:

# Create the MinIO bucket used for audio and media files
docker exec ielts-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec ielts-minio mc mb local/ielts-files --ignore-existing

# Apply database migrations
cd backend-core
npx prisma migrate deploy

# Seed required data (pricing plans, achievements, lessons, etc.)
npx prisma db seed
cd ..
```

> On subsequent starts you do **not** need to repeat migrations or seed. Jump straight to Step 4.

---

## Step 4 — Start Everything

From the project root:

```bash
npm run dev
```

This single command starts Docker infrastructure, then concurrently runs:
- **Backend Core** — NestJS on port 3000
- **Backend AI** — FastAPI on port 8000 (auto-detects Windows vs macOS venv path)
- **Frontend Web** — Next.js on port 3001

All output is color-coded by service prefix in the same terminal.

---

## Running Services Individually

Useful when debugging a single service. Open four separate terminals:

```bash
# Terminal 1 — Infrastructure
npm run infra:up

# Terminal 2 — Backend Core (NestJS :3000)
npm run backend:dev

# Terminal 3 — Backend AI (FastAPI :8000)
npm run ai:dev

# Terminal 4 — Frontend Web (Next.js :3001)
npm run web:dev
```

**Frontend Mobile (Expo)** — optional, in its own terminal:
```bash
npm run mobile:dev
```

---

## Port Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend Web | http://localhost:3001 | — |
| Backend Core API | http://localhost:3000/api/v1 | — |
| Backend AI | http://localhost:8000 | — |
| RabbitMQ Management | http://localhost:15672 | `ielts` / `ielts_password` |
| MinIO Console | http://localhost:9001 | `minioadmin` / `minioadmin` |
| pgAdmin 4 | http://localhost:5050 | `admin@ielts.com` / `admin` |
| Prisma Studio | http://localhost:5555 | run `npm run prisma:studio` first |

---

## Google OAuth Setup (Optional)

Email/password registration and login work without any Google setup. Skip this section unless you specifically need to test Google sign-in.

**Steps:**
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Application type: **Web application**)
3. Add to **Authorized JavaScript origins**: `http://localhost:3001`
4. Add to **Authorized redirect URIs**: `http://localhost:3001` and `http://localhost:3001/login`
5. Copy the **Client ID** and **Client Secret**

**Add to `backend-core/.env.local`:**
```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-secret>
```

**Update `frontend-web/.env.local`:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

Restart `npm run dev` after updating.

---

## Stopping & Cleanup

```bash
# Stop infrastructure, keep all data volumes
npm run infra:down

# Stop infrastructure and delete all data volumes (full reset)
npm run infra:clean
```

---

## Troubleshooting

### `Cannot find module '.../dist/main'`
TypeScript build cache is out of sync. `npm run backend:dev` clears it automatically.
Manual fix: delete `backend-core/tsconfig.tsbuildinfo`.

### `Cannot connect to Docker daemon`
Docker Desktop is not running. Open it and wait for the whale icon to stop animating before retrying.

### `ECONNREFUSED localhost:5672` or `localhost:6379`
Containers are still initializing. Wait 15 seconds and retry.

### Port already in use

**macOS / Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Windows — Command Prompt:**
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Windows — PowerShell:**
```powershell
(Get-NetTCPConnection -LocalPort 3000).OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### `ai:dev` fails — Python or venv not found
Make sure the venv was created inside `backend-ai/`:
```bash
cd backend-ai && python -m venv venv && pip install -r requirements.txt
```

### Windows: `Activate.ps1 cannot be loaded`
Run once in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Prisma migration error on first run
The database container may not be fully ready. Verify it is healthy:
```bash
docker ps
# ielts-postgres STATUS column should show (healthy)
```
Then re-run `npx prisma migrate deploy`.

### VNPay returns to payment error page after redirect
Confirm `backend-core` is running and `VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return` is set in `backend-core/.env.local`. IPN errors in the backend log are expected locally and do not affect the payment result.
