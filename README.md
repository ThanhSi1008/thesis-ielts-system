# TOEIC Master AI

A comprehensive TOEIC learning and examination system built with an **Event-Driven Hybrid Architecture**, deployed on Google Cloud Platform (GCP) using K3s.

## 📋 Project Overview

TOEIC Master AI is a full-stack educational platform that enables students to:

- Take complete TOEIC exams (Reading, Listening, Speaking, Writing)
- Receive AI-powered automated grading for Speaking and Writing sections
- Track learning progress and exam history
- Access personalized learning materials

The system leverages modern microservices architecture with asynchronous AI processing to deliver scalable, high-performance exam experiences.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Mobile App      │              │   Web Portal     │         │
│  │  (React Native)  │              │   (Next.js 14)   │         │
│  └──────────────────┘              └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Gateway Layer                              │
│         GCP Load Balancer → Traefik Ingress Controller          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer (K3s)                        │
│  ┌──────────────────┐    ┌──────────────┐   ┌───────────────┐  │
│  │  Core Backend    │───▶│  RabbitMQ    │──▶│  AI Service   │  │
│  │  (NestJS)        │    │  (Broker)    │   │  (FastAPI)    │  │
│  │  - Auth Module   │    └──────────────┘   │  - Whisper    │  │
│  │  - User Module   │                       │  - LLM Grading│  │
│  │  - Exam Module   │                       └───────────────┘  │
│  │  - Result Module │                                           │
│  │  - Learning Mod. │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Observability: Prometheus + Loki + Grafana       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer (GCP Managed)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Cloud SQL   │  │ Memorystore  │  │  Cloud Storage (GCS) │  │
│  │ (PostgreSQL) │  │   (Redis)    │  │  - Audio files       │  │
│  │ + pgvector   │  │              │  │  - Images            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend

- **Core Backend:** NestJS (TypeScript) - Modular Monolith
- **AI Service:** Python FastAPI - Microservice for AI operations
- **Message Broker:** RabbitMQ - Event-driven communication
- **ORM:** Prisma (PostgreSQL)
- **Cache:** Redis (ioredis)

### Frontend

- **Web Portal:** Next.js 14+ (App Router, TypeScript, Tailwind CSS)
- **Mobile App:** React Native (Expo, TypeScript)

### Infrastructure

- **Orchestration:** K3s (Lightweight Kubernetes)
- **Ingress:** Traefik
- **Database:** Cloud SQL (PostgreSQL 16) with pgvector extension
- **Cache:** Memorystore (Redis 7)
- **Object Storage:** Google Cloud Storage (GCS)
- **Observability:** Prometheus, Loki, Grafana

### AI/ML

- **Speech-to-Text:** Faster-Whisper
- **Grading:** Large Language Models (LLMs) running locally

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v24.0+) and **Docker Compose** (v2.20+)
- **Node.js** (v20.x LTS) and **npm** (v10.x)
- **Python** (v3.11+) and **pip**
- **Git**

Optional (for development):

- **Prisma CLI:** `npm install -g prisma`
- **NestJS CLI:** `npm install -g @nestjs/cli`
- **Expo CLI:** `npm install -g expo-cli`

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/toeic-master-ai.git
cd toeic-master-ai
```

### 2. Start Infrastructure Services

Start all required infrastructure services (PostgreSQL, Redis, RabbitMQ, MinIO):

```bash
docker-compose up -d
```

Verify all services are running:

```bash
docker-compose ps
```

### 3. Setup Backend Core (NestJS)

```bash
cd backend-core

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### 4. Setup AI Service (FastAPI)

```bash
cd backend-ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Start development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The AI service will be available at `http://localhost:8000`

### 5. Setup Frontend Web (Next.js)

```bash
cd frontend-web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The web portal will be available at `http://localhost:3001`

### 6. Setup Frontend Mobile (Expo)

```bash
cd frontend-mobile

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start Expo development server
npm start
```

Scan the QR code with Expo Go app on your mobile device.

## 🔧 Environment Variables

### Backend Core (`backend-core/.env`)

```env
# Database
DATABASE_URL="postgresql://toeic_user:toeic_password@localhost:5432/toeic_db?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# RabbitMQ
RABBITMQ_URL="amqp://toeic:toeic_password@localhost:5672"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"

# Object Storage (MinIO for local, GCS for production)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="toeic-files"
STORAGE_USE_SSL="false"

# Application
PORT=3000
NODE_ENV="development"
```

### AI Service (`backend-ai/.env`)

```env
# RabbitMQ
RABBITMQ_URL="amqp://toeic:toeic_password@localhost:5672"

# Database (for updating exam results)
DATABASE_URL="postgresql://toeic_user:toeic_password@localhost:5432/toeic_db"

# Object Storage
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="toeic-files"
STORAGE_USE_SSL="false"

# AI Models
WHISPER_MODEL="base"  # Options: tiny, base, small, medium, large
LLM_MODEL_PATH="./models/llm"

# Application
PORT=8000
ENVIRONMENT="development"
```

### Frontend Web (`frontend-web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

### Frontend Mobile (`frontend-mobile/.env`)

```env
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

## 🌐 Accessing Services

Once all services are running, you can access:

| Service                 | URL                    | Credentials                                                              |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------ |
| **Backend Core API**    | http://localhost:3000  | N/A                                                                      |
| **AI Service API**      | http://localhost:8000  | N/A                                                                      |
| **Web Portal**          | http://localhost:3001  | N/A                                                                      |
| **PostgreSQL**          | localhost:5432         | User: `toeic_user`<br>Password: `toeic_password`<br>Database: `toeic_db` |
| **Redis**               | localhost:6379         | No password                                                              |
| **RabbitMQ Management** | http://localhost:15672 | User: `toeic`<br>Password: `toeic_password`                              |
| **MinIO Console**       | http://localhost:9001  | User: `minioadmin`<br>Password: `minioadmin`                             |
| **PgAdmin**             | http://localhost:5050  | Email: `admin@toeic.com`<br>Password: `admin`                            |

## 📁 Project Structure

```
toeic-master-ai/
├── backend-core/              # NestJS Core Backend (Modular Monolith)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # Authentication & Authorization
│   │   │   ├── users/        # User Management
│   │   │   ├── exams/        # Exam Management
│   │   │   ├── results/      # Result Tracking
│   │   │   ├── learning/     # Learning Materials
│   │   │   └── ai-client/    # RabbitMQ Publisher
│   │   ├── common/           # Shared utilities, guards, decorators
│   │   ├── config/           # Configuration modules
│   │   └── main.ts           # Application entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── backend-ai/                # Python FastAPI AI Service
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── services/         # AI services (Whisper, LLM)
│   │   ├── consumers/        # RabbitMQ consumers
│   │   ├── models/           # Pydantic models
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend-web/              # Next.js 14+ Web Portal
│   ├── app/
│   │   ├── (student)/        # Student routes
│   │   ├── (admin)/          # Admin routes
│   │   ├── api/              # API routes
│   │   └── layout.tsx
│   ├── components/           # React components
│   ├── lib/                  # Utilities & API clients
│   ├── public/               # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── frontend-mobile/           # React Native Expo Mobile App
│   ├── app/                  # Expo Router
│   ├── components/           # React Native components
│   ├── services/             # API services
│   ├── assets/               # Images, fonts
│   └── package.json
│
├── infrastructure/            # Deployment configurations
│   ├── k8s/                  # Kubernetes manifests
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   ├── configmaps/
│   │   └── secrets/
│   └── traefik/              # Traefik configurations
│
├── docker-compose.yml         # Local development infrastructure
├── package.json               # Monorepo scripts
└── README.md                  # This file
```

## 💻 Development Workflow

### Running All Services

Use the monorepo scripts defined in the root `package.json`:

```bash
# Start infrastructure services
npm run infra:up

# Start backend core in development mode
npm run backend:dev

# Start AI service in development mode
npm run ai:dev

# Start web portal in development mode
npm run web:dev

# Start mobile app in development mode
npm run mobile:dev

# Run all development servers concurrently (backend + ai + web)
npm run dev:all
```

### Database Management

```bash
# Run Prisma migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Generate Prisma Client after schema changes
cd backend-core && npx prisma generate
```

### Viewing Infrastructure Logs

```bash
# View all infrastructure logs
npm run infra:logs

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f rabbitmq
```

### Stopping Services

```bash
# Stop infrastructure services (preserves data)
npm run infra:down

# Stop and remove all data volumes (clean slate)
npm run infra:clean
```

## 🚢 Deployment

### Prerequisites for GCP Deployment

1. **GCP Project Setup:**
   - Create a GCP project
   - Enable required APIs: Compute Engine, Cloud SQL, Memorystore, Cloud Storage
   - Set up service accounts with appropriate permissions

2. **K3s Cluster:**
   - Provision GCP Compute Engine instances
   - Install K3s on the instances
   - Configure kubectl to connect to the cluster

3. **Managed Services:**
   - Create Cloud SQL (PostgreSQL 16) instance with pgvector extension
   - Create Memorystore (Redis 7) instance
   - Create Cloud Storage bucket for file storage

### Deployment Steps

1. **Build and Push Docker Images:**

```bash
# Build backend-core image
cd backend-core
docker build -t gcr.io/YOUR_PROJECT_ID/toeic-backend-core:latest .
docker push gcr.io/YOUR_PROJECT_ID/toeic-backend-core:latest

# Build backend-ai image
cd backend-ai
docker build -t gcr.io/YOUR_PROJECT_ID/toeic-backend-ai:latest .
docker push gcr.io/YOUR_PROJECT_ID/toeic-backend-ai:latest

# Build frontend-web image
cd frontend-web
docker build -t gcr.io/YOUR_PROJECT_ID/toeic-frontend-web:latest .
docker push gcr.io/YOUR_PROJECT_ID/toeic-frontend-web:latest
```

2. **Apply Kubernetes Manifests:**

```bash
# Create namespace
kubectl apply -f infrastructure/k8s/namespaces/

# Create ConfigMaps and Secrets
kubectl apply -f infrastructure/k8s/configmaps/
kubectl apply -f infrastructure/k8s/secrets/

# Deploy applications
kubectl apply -f infrastructure/k8s/deployments/
kubectl apply -f infrastructure/k8s/services/

# Configure Ingress
kubectl apply -f infrastructure/k8s/ingress/
```

3. **Install Observability Stack:**

```bash
# Install Prometheus, Loki, Grafana using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Install Loki
helm install loki grafana/loki-stack -n monitoring

# Install Grafana (if not included in kube-prometheus-stack)
helm install grafana grafana/grafana -n monitoring
```

## 🔍 Monitoring and Debugging

### Health Checks

- **Backend Core:** `http://localhost:3000/health`
- **AI Service:** `http://localhost:8000/health`

### Logs

- **Backend Core:** Check NestJS console output or Docker logs
- **AI Service:** Check FastAPI console output or Docker logs
- **RabbitMQ:** Access management UI at http://localhost:15672

### Metrics

- **Prometheus:** Scrapes metrics from all services
- **Grafana:** Visualizes metrics and logs
- **Loki:** Aggregates logs from all services

## 🔒 Security Considerations

- **JWT Secrets:** Change default JWT secrets in production
- **Database Passwords:** Use strong passwords and rotate regularly
- **API Rate Limiting:** Implement rate limiting on public endpoints
- **CORS:** Configure CORS policies appropriately
- **HTTPS:** Use TLS/SSL certificates in production
- **Secrets Management:** Use Kubernetes Secrets or GCP Secret Manager
- **Network Policies:** Implement network policies in K8s cluster

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support, please contact:

- Email: support@toeicmasterai.com
- Documentation: https://docs.toeicmasterai.com
- Issues: https://github.com/your-org/toeic-master-ai/issues

---

**Built with ❤️ by the TOEIC Master AI Team**
