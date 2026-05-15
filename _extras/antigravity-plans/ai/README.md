# AI Training Plan — IELTS Master AI System

> **Purpose:** This plan teaches an AI model to understand, navigate, and modify the IELTS Master AI codebase through staged context ingestion. Each stage has a dedicated file in this folder.

---

## System Overview (One-Paragraph Summary)

IELTS Master AI is a **full-stack IELTS learning platform** built as a **thesis project**. It uses **NestJS** (backend), **FastAPI** (AI microservice), **Next.js** (web frontend), and **Expo** (mobile). The system covers **7 learning modules**: Exam Practice (Reading/Listening/Writing/Speaking), Vocabulary (4000 Essential Words), Grammar (145 units), Pronunciation (IPA sounds + AI scoring), Shadowing-Dictation (YouTube videos), Vocab Lab (Anki-style SRS flashcards), and an IELTS Dashboard (scores, streaks, roadmap). Data flows via REST API + RabbitMQ queues. AI grading uses Google Gemini + Whisper STT.

---

## File Index

| Stage | File | What the AI Learns | Read Time |
|-------|------|---------------------|-----------|
| 0 | `00_rules.md` | Immutable project rules, forbidden actions, naming conventions | 3 min |
| 1 | `01_architecture.md` | System architecture, data flow, service topology, ports | 5 min |
| 2 | `02_database.md` | All 35+ Prisma models, their relationships, enums, seed data | 8 min |
| 3 | `03_backend_core.md` | All 14 NestJS modules — routes, DTOs, service methods | 10 min |
| 4 | `04_backend_ai.md` | FastAPI structure, RabbitMQ consumers, Gemini/Whisper integration | 5 min |
| 5 | `05_frontend_web.md` | Next.js App Router pages, shared components, API services, state management | 10 min |
| 6 | `06_module_deep_dives.md` | Detailed walkthrough of each learning module's full stack slice | 12 min |
| 7 | `07_common_tasks.md` | Step-by-step playbooks for common modifications | 5 min |

---

## How to Use This Plan

### For an AI Agent starting a new session:
1. **Always read `00_rules.md` first** — it contains hard constraints that override everything else
2. **Read `01_architecture.md`** to understand the system topology
3. **Read the stage matching your task**:
   - Adding a DB model? → Read `02_database.md`
   - Modifying a backend endpoint? → Read `03_backend_core.md`
   - Changing AI grading? → Read `04_backend_ai.md`
   - Building a UI feature? → Read `05_frontend_web.md`
   - Need full-stack context for a specific module? → Read `06_module_deep_dives.md`
   - Doing a standard task (add endpoint, add page, etc.)? → Read `07_common_tasks.md`

### For a human onboarding:
Read stages 0-1-2 first for the big picture, then 06 for the module you'll work on.

---

## Key Facts for Quick Reference

| Fact | Value |
|------|-------|
| **Backend Core** | NestJS 10.x, port 3000, prefix `/api/v1` |
| **Backend AI** | FastAPI, port 8000, Python 3.12 |
| **Frontend Web** | Next.js 14 App Router, port 3001 |
| **Database** | PostgreSQL 16, port 5433 |
| **ORM** | Prisma 5.x |
| **Message Queue** | RabbitMQ, port 5672 |
| **Object Storage** | MinIO (local) / GCS (prod), port 9000 |
| **AI Model** | Google Gemini 2.5 Flash (fallback: 1.5 Pro) |
| **STT** | faster-whisper, model: base |
| **Auth** | JWT + Passport, token in `localStorage` |
| **Styling** | Tailwind CSS, primary color `#FFC600` |
| **State Mgmt** | Zustand (global), useState (local) |
| **SRS Algorithm** | FSRS (Free Spaced Repetition Scheduler) |
