# System Architecture Diagram — Master Plan

## Goal
Create a **pixel-perfect, thesis-quality** system architecture diagram for the TOEIC Master AI system using **PlantUML** (`.puml` file). The diagram must be accurate to the actual codebase — every node, arrow, protocol, and port has been verified.

## Output Location
All generated `.puml` files go into:
```
_extras/antigravity_plans/sysmtem_diagram/output/
```

## Phases (Execute in Order)

| Phase | File | What It Produces | Depends On |
|-------|------|-----------------|------------|
| **Phase 1** | `01_DATA_LAYER.md` | Data layer nodes (PostgreSQL, Redis, RabbitMQ, MinIO) | — |
| **Phase 2** | `02_APPLICATION_LAYER.md` | Backend Core + Backend AI nodes with internal structure | Phase 1 |
| **Phase 3** | `03_PRESENTATION_LAYER.md` | Frontend Web + Frontend Mobile nodes | Phase 2 |
| **Phase 4** | `04_EXTERNAL_SERVICES.md` | Google Gemini, Cloudinary, Google OAuth, VNPay, YouTube | Phase 3 |
| **Phase 5** | `05_DATA_FLOWS.md` | All arrows with protocols, directions, labels | Phase 1–4 |
| **Phase 6** | `06_FINAL_ASSEMBLY.md` | Combine everything into final diagram, add legend, validate | Phase 1–5 |

## Rules for All Phases
1. Use PlantUML C4 or Component diagram syntax
2. Every node must include: **name**, **technology**, **port** (if applicable)
3. Every arrow must include: **protocol**, **direction**, **purpose**
4. Use consistent color coding:
   - 🔵 Blue = Frontend (Presentation)
   - 🟢 Green = Backend (Application)
   - 🟠 Orange = Data stores
   - 🟣 Purple = External services
5. The diagram must be **thesis-paper ready** (black-and-white printing friendly — use patterns too, not just colors)
6. Vietnamese labels are NOT needed — use English only

## Tech Stack Summary (for context)
- **Frontend Web**: Next.js + TailwindCSS + Axios (port 3001)
- **Frontend Mobile**: Expo (React Native) + Expo Router
- **Backend Core**: NestJS + Prisma ORM (port 3000, prefix `/api/v1`)
- **Backend AI**: FastAPI + Whisper STT + Google Gemini (port 8000)
- **Database**: PostgreSQL 16 (shared between both backends)
- **Cache**: Redis 7 (used only by Backend Core)
- **Message Broker**: RabbitMQ 3 (3 queues)
- **Object Storage**: MinIO (dev) / Cloudinary (prod)
- **AI Provider**: Google Gemini API (gemini-2.5-flash)
- **Payment**: VNPay
- **Auth**: JWT + Google OAuth
