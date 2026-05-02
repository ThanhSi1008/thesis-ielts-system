# Stage 3 — Backend Core (NestJS)

> **Location:** `backend-core/src/modules/`
> **Framework:** NestJS 10.x
> **Port:** 3000, prefix `/api/v1`
> **Pattern:** Each module = `{name}.module.ts` + `{name}.controller.ts` + `{name}.service.ts` + `dto/`

---

## Module Directory

### 1. `auth` — Authentication
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/auth/register` | POST | Public | Register new user |
| `/auth/login` | POST | Public | Login → returns JWT `access_token` |
| `/auth/me` | GET | JWT | Get current user profile |
| `/auth/profile` | PATCH | JWT | Update user profile |

**Key:** JWT strategy via Passport. Token has `{ sub: userId, email, role }`. `JwtAuthGuard` extracts `req.user`.

### 2. `users` — User Management
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/users` | GET | Admin | List all users |
| `/users/:id` | GET | Admin | Get user by ID |

### 3. `exams` — Exam CRUD & Sessions
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/exams` | GET | Public | List published exams |
| `/exams/:id` | GET | Public | Get exam details with questions |
| `/exams` | POST | Admin | Create exam |
| `/exams/:id` | PUT | Admin | Update exam |
| `/exams/sessions/start` | POST | JWT | Start a new exam session |
| `/exams/sessions/:id` | GET | JWT | Get session status + answers |
| `/exams/sessions/:id/submit` | POST | JWT | Submit answers → triggers AI grading |
| `/exams/sessions/:id/abandon` | POST | JWT | Abandon session |

**AI Integration:** On submit, publishes to `exam-grading-queue` via `AiClientService`.

### 4. `results` — Exam Results
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/results` | GET | JWT | Get user's result history |
| `/results/:sessionId` | GET | JWT | Get detailed result for a session |

### 5. `learning` — Learning Progress
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/learning/progress` | GET | JWT | Get all progress for user |
| `/learning/progress` | POST | JWT | Update/create progress entry |

### 6. `vocabulary` — 4000 Essential Words
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/vocabulary/books` | GET | Public | List all books |
| `/vocabulary/books/:slug` | GET | Public | Get book with units |
| `/vocabulary/books/:slug/units/:unitSlug` | GET | Public | Get unit with words, exercises, reading |
| `/vocabulary/progress` | GET | JWT | Get user's vocabulary progress |
| `/vocabulary/progress/:unitId` | POST | JWT | Update unit progress |

### 7. `grammar` — Grammar Lessons
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/grammar/topics` | GET | Public | List all grammar topics |
| `/grammar/topics/:slug` | GET | Public | Get topic with lessons |
| `/grammar/topics/:topicSlug/lessons/:lessonSlug` | GET | Public | Get single lesson content |
| `/grammar/progress` | GET | JWT | Get user grammar progress |
| `/grammar/progress/:lessonId` | POST | JWT | Submit lesson progress |

### 8. `pronunciation` — IPA Sounds & AI Scoring
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/pronunciation/sounds` | GET | Public | List all IPA sounds |
| `/pronunciation/sounds/:symbol` | GET | Public | Get sound details |
| `/pronunciation/check` | POST | JWT | Upload audio → AI scoring (multipart) |
| `/pronunciation/attempts` | GET | JWT | Get user's attempt history |
| `/pronunciation/progress` | GET | JWT | Get user's per-sound progress |
| `/pronunciation/progress/update` | POST | JWT | Update progress after practice |

### 9. `shadowing` — Shadowing & Dictation
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/shadowing/videos` | GET | JWT | List user's shadowing videos |
| `/shadowing/videos` | POST | JWT | Add a new video |
| `/shadowing/videos/:id` | DELETE | JWT | Delete video |
| `/shadowing/folders` | GET/POST/DELETE | JWT | Manage folders |
| `/shadowing/dictation/progress` | GET/POST | JWT | Track dictation progress |
| `/shadowing/dictation/progress/video/:videoId` | GET | JWT | Get progress for a video |

### 10. `vocab-lab` — SRS Flashcards (FSRS)
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/vocab-lab/decks` | GET/POST | JWT | List/create decks |
| `/vocab-lab/decks/:id` | GET/DELETE | JWT | Deck detail/delete |
| `/vocab-lab/cards` | GET/POST | JWT | Browse/create cards |
| `/vocab-lab/cards/:id` | PUT/DELETE | JWT | Update/delete card |
| `/vocab-lab/from-vocabulary` | POST | JWT | Create card from vocabulary module word |
| `/vocab-lab/study/:deckId` | GET | JWT | Get due cards for study session |
| `/vocab-lab/review` | POST | JWT | Submit card review (FSRS scheduling) |
| `/vocab-lab/stats` | GET | JWT | Get user statistics (`?range=30`) |
| `/vocab-lab/tags` | GET | JWT | Get all user tags |
| `/vocab-lab/card-types` | CRUD | JWT | Manage card type definitions |
| `/vocab-lab/media/upload` | POST | JWT | Upload media to MinIO |

**FSRS Algorithm:** Rating 1=Again, 2=Hard, 3=Good, 4=Easy. Updates stability, difficulty, scheduledDays, reps, lapses.

### 11. `notes` — Question Notes
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/notes` | GET | JWT | Get user's notes (filter by examId) |
| `/notes` | POST | JWT | Create note |
| `/notes/:id` | PUT/DELETE | JWT | Update/delete note |

### 12. `ielts` — IELTS Practice & Profiles
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/ielts/profile` | GET/POST/PATCH | JWT | IELTS profile (target band, streak) |
| `/ielts/basic/progress` | GET/POST | JWT | Basic lesson progress |
| `/ielts/practice/listening-parts` | GET | Public | List listening practice parts |
| `/ielts/practice/listening-parts/:id` | GET | Public | Get part details |
| `/ielts/practice/listening-parts/:id/submit` | POST | JWT | Submit listening answers |
| `/ielts/practice/reading-parts` | GET/POST | Public/Admin | Reading practice CRUD |
| `/ielts/practice/reading-parts/:id/submit` | POST | JWT | Submit reading answers |
| `/ielts/writing/submit` | POST | JWT | Submit writing → AI grading |
| `/ielts/writing/history` | GET | JWT | Get writing history |
| `/ielts/speaking/submit` | POST | JWT | Submit speaking (audio) → AI grading |
| `/ielts/statistics/*` | GET | JWT | Dashboard statistics |

### 13. `ai-client` — RabbitMQ Publisher
Not a REST module. Provides `AiClientService` with methods:
- `publishGradingJob(sessionId, answers)` → `exam-grading-queue`
- `publishPronunciationCheck(attemptId, audioUrl, expectedText)` → `pronunciation-check-queue`

### 14. `notifications` — In-App Notifications
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/notifications` | GET | JWT | Get user's notifications |
| `/notifications/:id/read` | PATCH | JWT | Mark as read |
| `/notifications/read-all` | PATCH | JWT | Mark all as read |

---

## Shared Services (in `common/`)

| Service | Purpose |
|---------|---------|
| `PrismaService` | Database access — extends PrismaClient with `onModuleInit` lifecycle |
| `StorageService` | File upload/download — MinIO (local) / GCS (production) |
| `RabbitMQService` | AMQP connection management |

## Auth Guard Usage

```typescript
// Public endpoint (no guard)
@Get('books')
async getBooks() { ... }

// Requires login
@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Request() req) { return req.user; }

// Requires admin role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post('exams')
async createExam() { ... }
```
