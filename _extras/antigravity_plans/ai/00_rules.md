# Stage 0 — Immutable Rules

> **READ THIS BEFORE TOUCHING ANY CODE.** These are hard constraints that cannot be overridden.

---

## Architecture Rules (Cannot Change)

1. **Only 2 backends exist**: `backend-core` (NestJS) and `backend-ai` (FastAPI). Do NOT create new services.
2. **Only REST API** — no GraphQL, gRPC, or WebSocket for new features.
3. **Backend Core publishes** to RabbitMQ. **Backend AI consumes** from RabbitMQ. Never reverse this.
4. **Backend AI writes to DB directly** via psycopg2 — never calls backend-core via HTTP.
5. **File uploads** go through MinIO (local) / GCS (prod) — never save to local disk.

## Backend Code Rules

6. **Module structure is fixed**: `{name}.module.ts`, `{name}.controller.ts`, `{name}.service.ts`, `dto/{name}.dto.ts`. No extra files.
7. **Controllers have ZERO business logic** — they validate DTO and call Service methods only.
8. **No DB queries in Controllers** — always go through Service.
9. **All routes** are prefixed `/api/v1` (configured in `main.ts`).
10. **Use NestJS exceptions** (`NotFoundException`, `BadRequestException`, etc.) — never `throw new Error()`.
11. **Use Prisma Client** exclusively — no raw SQL unless Prisma literally can't do it.
12. **Anti N+1**: Never query inside a loop. Use `include`, `Promise.all`, or batch queries.
13. **DTOs use `class-validator`** decorators — no manual if-else validation.

## Database Rules

14. **UUIDs** for all primary keys.
15. **Model names**: PascalCase. **Field names**: camelCase. **Table names**: snake_case via `@@map`.
16. **Hard delete only** — no soft deletes. Use `onDelete: Cascade`.
17. **After schema changes**: always run `prisma migrate dev` then `prisma generate`.

## Frontend Rules

18. **API calls live in `src/services/`** — never call fetch/axios directly from a component.
19. **Zustand** for global state — no Redux, no Context API for new global state.
20. **`react-hook-form` + `zod`** for forms — no manual validation.
21. **Tailwind design tokens** only — no hardcoded hex colors or arbitrary pixel values in className.
22. **`src/config/env.ts`** for environment variables — never use `process.env` directly in components.
23. **Token** stored in `localStorage` with key `access_token`.

## Git Rules

24. No committing to `main` directly.
25. Conventional Commits: `feat(module): ...`, `fix(module): ...`, `chore(scope): ...`
26. Never commit: `.env`, `node_modules/`, `venv/`, `dist/`, `.next/`

## Existing Modules (Do NOT rename or delete)

```
auth, users, exams, results, learning, vocabulary, grammar,
pronunciation, shadowing, vocab-lab, notes, ai-client,
ielts, notifications
```

## Existing Enums (Add values carefully)

```prisma
UserRole: STUDENT, ADMIN, INSTRUCTOR
ExamType: FULL_TEST, READING, LISTENING, SPEAKING, WRITING, PRACTICE
Difficulty: BEGINNER, INTERMEDIATE, ADVANCED
SessionStatus: IN_PROGRESS, SUBMITTED, GRADING, COMPLETED, ABANDONED
CardState: NEW, LEARNING, REVIEW, RELEARNING
```
