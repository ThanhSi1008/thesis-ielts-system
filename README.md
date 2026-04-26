# IELTS Master English AI 

A comprehensive AI-powered IELTS preparation and English mastery platform built with an **Event-Driven Hybrid Architecture**, deployed on Google Cloud Platform (GCP) using K3s. 

> *Note: This repository was originally structured for TOEIC and scaled into a comprehensive IELTS and overarching English Mastery platform over the course of development.*

## 📋 Project Overview

IELTS Master English AI is a full-stack educational platform engineered to elevate English proficiency and rigorously prepare students for the IELTS exam through interactive, AI-driven guidance.

**Core Features Implemented:**
- **IELTS Intensive:** Complete mock exams and targeted skill practices. Features robust session persistence ("Save & Pause") preventing progress loss.
- **AI-Powered Grading:** Automated, rubric-based scoring for subjective sections using local/cloud Large Language Models (LLMs).
- **Shadowing & Dictation:** Interactive modules to enhance listening comprehension and speaking fluency.
- **Pronunciation Checker:** Real-time speech transcription and analysis using Faster-Whisper.
- **Vocab-Lab & Grammar:** Integrated vocabulary building, flashcards, and grammar lessons with a global Quick-Add Floating Action Button (FAB).
- **Global AI Chat Assistant:** Persisted AI tutor across all screens, assisting in translation and concept explanation.

## 🏗️ Architecture Overview

The system leverages a modern microservices architecture with asynchronous AI processing, ensuring the core web interface never hangs during heavy AI inferences.

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
│  │  - Auth/Users    │    └──────────────┘   │  - Whisper    │  │
│  │  - IELTS Exams   │                       │  - LLM Scoring│  │
│  │  - Vocab/Grammar │                       └───────────────┘  │
│  │  - Shadowing     │                                           │
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
│  │ (PostgreSQL) │  │   (Redis)    │  │  - Audio & Assets    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Core Backend:** NestJS (TypeScript) - Modular Monolith separating distinct domains (exams, results, notes, shadowing, vocabulary).
- **AI Service:** Python FastAPI - Dedicated worker microservice strictly for ML inferences.
- **Message Broker:** RabbitMQ - Decouples audio upload flows from AI transcription constraints.
- **ORM & DB Cache:** Prisma (PostgreSQL) & Redis (ioredis).

### Frontend
- **Web Portal:** Next.js 14+ (App Router, TypeScript, Tailwind CSS, global context providers).
- **Mobile App:** React Native (Expo, TypeScript) for on-the-go practice.

### Infrastructure & AI/ML
- **Orchestration:** K3s (Lightweight Kubernetes) managed on GCP.
- **Ingress:** Traefik.
- **Speech-to-Text:** Faster-Whisper.
- **Evaluator:** Large Language Models (LLMs) instructed for IELTS grading metrics.

## 📦 Prerequisites

Ensure you have the following installed to test the platform locally:
- **Docker** (v24.0+) & **Docker Compose**
- **Node.js** (v20.x LTS) & **npm** (v10.x)
- **Python** (v3.11+)
- **Git**

## 🚀 Getting Started

### 1. Start Infrastructure Services

Start PostgreSQL, Redis, RabbitMQ, and MinIO (Local GCS analog):
```bash
docker-compose up -d
```

### 2. Setup Backend Core (NestJS)

```bash
cd backend-core
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```
*Runs on http://localhost:3000*

### 3. Setup AI Service (FastAPI)

```bash
cd backend-ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Runs on http://localhost:8000*

> **Critical Notice**: Ensure lingering Python processes do not bind to port 8000 when performing environment reboots manually. 

### 4. Setup Frontend Web (Next.js)

```bash
cd frontend-web
npm install
cp .env.example .env.local
npm run dev
```
*Runs on http://localhost:3001*

### 5. Setup Frontend Mobile (Expo)

```bash
cd frontend-mobile
npm install
cp .env.example .env
npm start
```

## 📁 Project Structure

```
thesis-toeic-system/
├── backend-core/              # NestJS Core Backend (Modular Monolith)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/ & users/
│   │   │   ├── exams/         # IELTS logic & session states 
│   │   │   ├── grammar/ & vocabulary/ & vocab-lab/
│   │   │   ├── pronunciation/ & shadowing/
│   │   │   ├── results/
│   │   │   └── ai-client/     # RabbitMQ Publisher
│   │   ├── common/           
│   │   └── main.ts           
│   ├── prisma/schema.prisma     
│
├── backend-ai/                # Python FastAPI AI Worker Node
│   ├── app/
│   │   ├── services/         # Faster-Whisper, LLM interactions
│   │   └── consumers/        # RabbitMQ persistent listeners
│
├── frontend-web/              # Next.js 14+ Web Portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── ielts/        # Intensive exam prep views
│   │   │   ├── shadowing-dictation/
│   │   │   ├── vocab-lab/
│   │   │   ├── grammar/
│   │   │   └── pronunciation/
│   │   ├── components/       # Global FABs, timers, complex practice boards
│   │   └── contexts/         # Authentication & Global AI grading states
│
├── frontend-mobile/           # React Native Expo App
│
├── infrastructure/            # Kubernetes (K3s) & Traefik Configurations
├── docker-compose.yml         # Local backing services
└── package.json               # Monorepo concurrent scripts
```

## 💻 Development Workflow

You can utilize the overarching scripts from the root directory to manage the entirety of the stack seamlessly:

```bash
npm run infra:up      # Launch PostgreSQL, RabbitMQ, Redis
npm run dev:all       # Concurrently fires Web, NestJS Core, and FastAPI AI Worker
```

## 🔍 Development Context Notes

### Session Persistence Constraints
When developing within the `app/ielts/intensive` or `app/ielts/history` pathways, remember that mock tests enforce "Protect Session" constraints. Moving away from the active take environment requires programmatic saving to prevent accidental test-dropping.

### FastAPI Routing & Trailing Slashes
If integrating new endpoints spanning NextJS to FastAPI, utilize exact prefixes (i.e. `@router.post("")`) to circumvent silent `307 Temporary Redirect` failures blocking CORS preflight rules across environments.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit and push.
4. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the IELTS/TOEIC Master AI Team**
