# Local Development Setup Guide

> **IELTS Master AI** — full-stack platform (NestJS + FastAPI + Next.js + Expo)

## Prerequisites

Cài đặt các công cụ sau trước khi bắt đầu:

| Tool | Version tối thiểu | Download |
|------|-------------------|----------|
| Node.js | 18+ (khuyến nghị 22) | https://nodejs.org |
| npm | 9+ | đi kèm Node.js |
| Python | 3.11+ | https://python.org |
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Git | bất kỳ | https://git-scm.com |

---

## Bước 1 — Clone & cài dependencies

```bash
git clone <repo-url>
cd thesis-toeic-system

# Cài Node dependencies (root workspace + backend-core + frontend-web)
npm install

# Cài Python dependencies cho backend-ai
cd backend-ai
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
cd ..
```

---

## Bước 2 — Tạo file cấu hình local

Tất cả file `.env.local` đều nằm trong `.gitignore`, không bao giờ được commit.  
**Chỉ cần tạo 3 file sau** — copy nội dung bên dưới.

### `backend-core/.env.local`

```env
# PostgreSQL (local Docker, port 5433)
DATABASE_URL="postgresql://toeic_user:toeic_password@localhost:5433/toeic_db?schema=public"
DIRECT_URL="postgresql://toeic_user:toeic_password@localhost:5433/toeic_db"

# Redis (local Docker, port 6379)
REDIS_URL="redis://localhost:6379"

# RabbitMQ (local Docker, port 5672)
RABBITMQ_URL="amqp://toeic:toeic_password@localhost:5672"

# MinIO (local Docker, port 9000)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="toeic-files"
STORAGE_REGION="us-east-1"
STORAGE_USE_SSL="false"

# Payment: mock tự động approve — không cần VNPay
PAYMENT_PROVIDER=mock

NODE_ENV="development"
```

### `backend-ai/.env`

> backend-ai dùng `pydantic-settings` — đọc file `.env` trực tiếp (không hỗ trợ `.env.local`).  
> Overwrite file này cho local. Để **restore production**, không dùng file này trên server.

```env
RABBITMQ_URL="amqp://toeic:toeic_password@localhost:5672"
DATABASE_URL="postgresql://toeic_user:toeic_password@localhost:5433/toeic_db"

STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="toeic-files"
STORAGE_REGION="us-east-1"
STORAGE_USE_SSL="false"

BACKEND_CORE_URL="http://localhost:3000/api/v1"

# Lấy key tại: https://aistudio.google.com/apikey (free tier đủ dùng)
GEMINI_API_KEY="<your-gemini-api-key>"

WHISPER_MODEL="tiny"
WHISPER_DEVICE="cpu"
WHISPER_COMPUTE_TYPE="int8"

ENVIRONMENT="development"
PORT=8000
```

### `frontend-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME="IELTS Master AI (local)"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

> **Google Client ID** — liên hệ team lead để lấy. Nếu không cần test Google OAuth thì bỏ qua, đăng nhập email/password vẫn hoạt động bình thường.

---

## Bước 3 — Khởi động Docker infrastructure

```bash
# Start PostgreSQL :5433, Redis :6379, RabbitMQ :5672/:15672, MinIO :9000/:9001, pgAdmin :5050
npm run infra:up

# Kiểm tra các container đã healthy chưa (chờ khoảng 15-30 giây)
docker ps
```

Kết quả mong đợi:

```
toeic-postgres   Up (healthy)   0.0.0.0:5433->5432/tcp
toeic-redis      Up (healthy)   0.0.0.0:6379->6379/tcp
toeic-rabbitmq   Up (healthy)   0.0.0.0:5672->5672/tcp
toeic-minio      Up (healthy)   0.0.0.0:9000-9001->9000-9001/tcp
toeic-pgadmin    Up             0.0.0.0:5050->80/tcp
```

---

## Bước 4 — Setup database

```bash
# Tạo MinIO bucket cho audio/media files
docker exec toeic-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec toeic-minio mc mb local/toeic-files --ignore-existing

# Apply tất cả migrations vào local DB
cd backend-core
DATABASE_URL="postgresql://toeic_user:toeic_password@localhost:5433/toeic_db?schema=public" \
DIRECT_URL="postgresql://toeic_user:toeic_password@localhost:5433/toeic_db" \
npx prisma migrate deploy

# (Tuỳ chọn) Seed data mẫu
npx prisma db seed
cd ..
```

> **Nếu migrate lỗi** về `DIRECT_URL not set` — đảm bảo bạn đã tạo `backend-core/.env.local` ở Bước 2.

---

## Bước 5 — Chạy các services

Mở **4 terminal riêng biệt**:

### Terminal 1 — Backend Core (NestJS, port 3000)

```bash
npm run backend:dev
```

Thành công khi thấy:
```
✅ Redis connected successfully
✅ RabbitMQ connected successfully
🚀 Backend Core is running on: http://localhost:3000/api/v1
```

### Terminal 2 — Backend AI (FastAPI, port 8000)

```bash
cd backend-ai
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Thành công khi thấy:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

> **Lưu ý:** `faster-whisper` nặng (~500MB). Nếu chưa cài, AI service vẫn chạy được với mock transcription trả về `"hello"`.

### Terminal 3 — Frontend Web (Next.js, port 3001)

```bash
npm run web:dev
```

Mở trình duyệt: http://localhost:3001

### Terminal 4 — Frontend Mobile (Expo, tuỳ chọn)

```bash
npm run mobile:dev
```

Mở Expo Go app trên điện thoại và scan QR code, hoặc nhấn `i` (iOS simulator) / `a` (Android emulator).

---

## Chạy tất cả cùng lúc (shortcut)

```bash
# Start infra + chạy backend-core + backend-ai + frontend-web đồng thời
npm run infra:up && npm run dev:all
```

> `dev:all` dùng `concurrently` — log của 3 services hiện trong cùng 1 terminal với prefix màu.

---

## Ports & URLs

| Service | URL | Ghi chú |
|---------|-----|---------|
| Backend Core API | http://localhost:3000/api/v1 | NestJS |
| Backend AI | http://localhost:8000 | FastAPI |
| Frontend Web | http://localhost:3001 | Next.js |
| RabbitMQ Management UI | http://localhost:15672 | user: `toeic` / pass: `toeic_password` |
| MinIO Console | http://localhost:9001 | user: `minioadmin` / pass: `minioadmin` |
| pgAdmin | http://localhost:5050 | email: `admin@toeic.com` / pass: `admin` |
| Prisma Studio | http://localhost:5555 | chạy `npm run prisma:studio` |

---

## Prisma Studio (GUI quản lý database)

```bash
npm run prisma:studio
# Mở http://localhost:5555
```

---

## Xử lý lỗi thường gặp

### `Cannot connect to Docker daemon`

Docker Desktop chưa chạy. Mở Docker Desktop trước rồi chạy lại `npm run infra:up`.

### `ECONNREFUSED redis://localhost:6379`

Container Redis chưa healthy. Chờ thêm 10-15 giây sau `infra:up` rồi thử lại.

### `ECONNREFUSED amqp://localhost:5672`

Tương tự — RabbitMQ cần thêm thời gian khởi động. Kiểm tra: `docker ps | grep rabbitmq`.

### `Error: Cannot find module '@common/...'` khi chạy `node dist/main.js`

Path aliases chưa được resolve. Chạy đủ 2 bước build:

```bash
cd backend-core
npx tsc && npx tsc-alias
node dist/main.js
```

Hoặc dùng watch mode (khuyến nghị cho dev): `npm run backend:dev`

### `prisma migrate` lỗi SSL/connection

Kiểm tra `DATABASE_URL` trong `backend-core/.env.local` trỏ đúng `localhost:5433` (không phải Supabase).

### Port đã bị dùng

```bash
# Xem process đang dùng port 3000
lsof -i :3000      # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

---

## Dừng và dọn dẹp

```bash
# Dừng infra nhưng giữ data
npm run infra:down

# Dừng và xoá toàn bộ volumes (reset DB sạch)
npm run infra:clean
```

---

## Cấu trúc file cấu hình

```
thesis-toeic-system/
├── docker-compose.yml          # Infra: postgres, redis, rabbitmq, minio, pgadmin
├── backend-core/
│   ├── .env                    # Production config (gitignored, team lead giữ)
│   ├── .env.local              # Local override — BẠN TỰ TẠO (Bước 2)
│   └── .env.example            # Template tham khảo
├── backend-ai/
│   ├── .env                    # Local config — BẠN TỰ TẠO (Bước 2)
│   └── .env.example            # Template tham khảo
└── frontend-web/
    ├── .env.local              # Local config — BẠN TỰ TẠO (Bước 2)
    └── .env.example            # Template tham khảo
```

> Tất cả file `.env` và `.env.local` đều nằm trong `.gitignore` — không bao giờ được commit lên git.
