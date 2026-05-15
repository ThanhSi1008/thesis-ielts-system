# IELTS Advanced Writing — Requirements & Suggestions

## 1. Overview

Add an **IELTS Advanced Writing** module under the IELTS Intensive section, providing users with authentic Cambridge-style writing prompts (Task 1 & Task 2), a rich text editor, timer, word counter, and **AI-powered scoring** using the existing Gemini-based grading pipeline.

### Reference
- **UI Inspiration**: [oneielts.com/ielts-writing/practice](https://oneielts.com/ielts-writing/practice)
- **Scoring Pipeline Reference**: Existing `backend-ai/app/services/writing_grader.py` + `WritingResultView.tsx`
- **Data Source**: [engnovate.com](https://engnovate.com/ielts-writing-tests/) — WordPress REST API (public, no auth required)

---

## 2. Data Source Strategy

> **Discovery**: engnovate.com exposes a **fully public WordPress REST API** with a custom post type `ielts_writing_test`. No authentication, no scraping libraries needed — just HTTP `GET` requests.

### 2.1. API Endpoints (engnovate.com)

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /wp-json/wp/v2/ielts_writing_test` | List all writing tests | `?per_page=100&page=1&_fields=id,slug,title,featured_media,ielts_writing_test_category` |
| `GET /wp-json/wp/v2/ielts_writing_test/{id}` | Get single test metadata | Returns `featured_media` (image ID), `title`, `slug`, `category` |
| `GET /wp-json/wp/v2/media/{media_id}` | Get image URL + metadata | Returns `source_url`, `alt_text`, `media_details.sizes` |
| `GET /wp-json/wp/v2/ielts_writing_test_category` | Get all categories | 9 categories, 234 total tests |

### 2.2. Available Data (234 tests across 9 categories)

| Category ID | Name | Count | Type |
|-------------|------|-------|------|
| `1546` | **Cambridge Academic** | 132 | Task 1 (charts) + Task 2 (essays) |
| `1623` | Cambridge General | 40 | Task 1 (letters) + Task 2 (essays) |
| `1644` | Forecast Academic | 10 | Predicted exam topics |
| `1635` | Official Guide Academic | 8 | Official Cambridge guide material |
| `1636` | Official Guide General | 2 | Official Cambridge guide material |
| `1632` | Practice Test Plus Academic | 18 | Extra practice material |
| `1634` | Practice Test Plus General | 3 | Extra practice material |
| `1642` | Recent Actual Tests Academic | 15 | Real past exam questions |
| `1643` | Recent Actual Tests General | 6 | Real past exam questions |
| | **Total** | **234** | |

> **Key Finding**: The `content.rendered` field is **empty** — prompt text is loaded dynamically by the frontend React app. We need to **combine** the API (metadata + images) with **HTML parsing** (prompt text from the page) for complete data.

### 2.3. Data Per Test (API Response)

| Field | Available via API? | Example |
|-------|--------------------|---------|
| `id` | ✅ | `14944` |
| `slug` | ✅ | `cambridge-ielts-13-academic-writing-test-2-task-1` |
| `title.rendered` | ✅ | `Cambridge IELTS 13 Academic Writing Test 2 (Task 1)` |
| `featured_media` | ✅ | `14938` → resolves to image URL via Media API |
| `ielts_writing_test_category` | ✅ | `[1546]` → Cambridge Academic |
| **Prompt text** | ❌ (HTML parse needed) | "The bar chart below shows..." |
| **Image URL** | ✅ (via Media API) | `https://engnovate.com/wp-content/uploads/2023/08/cambridge-ielts-13-academic-writing-2.jpg` |

### 2.4. Data Pipeline

```
1. Node.js script: Fetch all tests from WP REST API (paginated, ~3 pages)
2. For each test with featured_media > 0: resolve → image URL via Media API
3. For each test: HTTP GET the page HTML → parse prompt text from DOM
4. Parse slug to extract: book number, test number, task number
5. Categorize: Task 1 (has image) vs Task 2 (text only)
6. Output: prisma/data/ielts-advanced/writing-prompts.json
7. Seeder writes to DB (IeltsAdvancedWritingPrompt table)
```

### 2.5. Prompt Data Schema (JSON)

```json
{
  "id": "engnovate-14944",
  "taskType": "TASK_1",
  "subType": "bar_chart",
  "source": "cambridge_13",
  "bookNumber": 13,
  "testNumber": 2,
  "category": "cambridge-academic",
  "prompt": "The bar chart below shows the percentage of Australian men and women in different age groups who did regular physical activity in 2010.",
  "imageUrl": "https://engnovate.com/wp-content/uploads/2023/08/cambridge-ielts-13-academic-writing-2.jpg",
  "minimumWords": 150,
  "suggestedTime": 20,
  "difficulty": "medium",
  "engnovateSlug": "cambridge-ielts-13-academic-writing-test-2-task-1"
}
```

### 2.6. Scraping Script Location

```
backend-core/prisma/scripts/
└── scrape-engnovate-writing.mjs   # Node.js script (fetch + cheerio)
```

---

## 3. Feature Requirements

### 3.1. Practice Catalog Page (`/ielts/advanced/writing`)

> Reference: oneielts.com's writing practice page with filterable list of prompts.

| Requirement | Details |
|-------------|---------|
| **Task Type Filter** | Toggle between "Task 1", "Task 2", or "All" |
| **Sub-type Filter** (Task 1) | Line Graph, Bar Chart, Pie Chart, Table, Map, Process Diagram, Mixed |
| **Sub-type Filter** (Task 2) | Opinion, Discussion, Problem & Solution, Advantages & Disadvantages, Two-Part Question |
| **Topic Filter** | Education, Technology, Health, Environment, Society, Economy, etc. |
| **Difficulty Filter** | Easy / Medium / Hard |
| **Source Badge** | Show origin (Cambridge 17, AI-Generated, etc.) |
| **Completion Status** | Show ✅ completed / 🔄 in progress / ⬜ not started per prompt |
| **My Best Score** | Show highest band score achieved (if any) |
| **Sort Options** | Recent, Popularity, My Score, Not Attempted |
| **Pagination / Infinite Scroll** | Load prompts in batches of 12–20 |

### 3.2. Writing Practice Page (`/ielts/advanced/writing/:promptId`)

| Requirement | Details |
|-------------|---------|
| **Split Layout** | Left: Prompt + Image (Task 1) / Right: Text Editor |
| **Rich Text Editor** | Textarea with real-time word count, paragraph detection |
| **Word Count** | Live counter with color coding: 🔴 under min, 🟢 at/above min, 🔵 well over |
| **Timer** | Countdown timer (20 min for Task 1, 40 min for Task 2), configurable. Optional: no-timer mode |
| **Auto-Save** | Auto-save draft every 30s to prevent data loss |
| **Submit Button** | Submits essay for AI grading, shows loading state |
| **Keyboard Shortcut** | Ctrl+Enter to submit |
| **Mobile Responsive** | Full-width prompt on top, editor below on mobile |

### 3.3. AI Scoring & Results Page

> **Reuse existing pipeline**: `exams.service.ts → RabbitMQ → grading_consumer.py → writing_grader.py → WritingResultView.tsx`

| Requirement | Details |
|-------------|---------|
| **Scoring Engine** | Reuse `backend-ai/app/services/writing_grader.py` (Gemini 2.5 Flash) |
| **4 Criteria** | Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy |
| **Per-Criterion Feedback** | Band score + strengths + weak areas + how to improve + annotated mistakes |
| **Overall Band** | Calculated as per IELTS formula (Task 2 worth double) |
| **Result View** | Reuse `WritingResultView.tsx` component (already built) |
| **Grading Status** | Show "Grading in progress..." with polling until `GRADED` status |
| **Quota Integration** | Use existing `AI_WRITING_GRADING` subscription quota |
| **Sample Answer** | After grading, optionally show a model answer for comparison |
| **Retry** | Allow re-submitting a new attempt for the same prompt |

### 3.4. Standalone Free-Write Mode (Bonus)

| Requirement | Details |
|-------------|---------|
| **Custom Prompt Input** | User pastes any prompt (e.g., from a textbook) |
| **Task Type Selection** | User selects Task 1 or Task 2 |
| **Image Upload** (Task 1) | User uploads their own chart/graph image |
| **AI Grading** | Same pipeline as above |
| **No Persistence** | Optional: don't save prompt to catalog, only save the result |

---

## 4. Backend Requirements

### 4.1. New Database Tables

```prisma
model IeltsAdvancedWritingPrompt {
  id            String   @id @default(uuid())
  taskType      String   // "TASK_1" or "TASK_2"
  subType       String   // e.g. "line_graph", "opinion"
  topic         String
  prompt        String   @db.Text
  imageUrl      String?
  minimumWords  Int      @default(150)
  suggestedTime Int      @default(20)  // minutes
  sampleAnswer  String?  @db.Text
  difficulty    String   @default("medium")
  source        String   @default("manual")
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sessions IeltsAdvancedWritingSession[]

  @@map("ielts_advanced_writing_prompts")
}

model IeltsAdvancedWritingSession {
  id         String   @id @default(uuid())
  userId     String
  promptId   String
  essay      String?  @db.Text
  draftEssay String?  @db.Text  // auto-saved draft
  timeTaken  Int?     // seconds
  status     String   @default("IN_PROGRESS") // IN_PROGRESS, SUBMITTED, GRADED, GRADING_FAILED
  feedback   Json?    // AI grading feedback (same shape as WritingFeedback)
  bandScore  Float?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User                        @relation(fields: [userId], references: [id])
  prompt IeltsAdvancedWritingPrompt   @relation(fields: [promptId], references: [id])

  @@map("ielts_advanced_writing_sessions")
}
```

### 4.2. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ielts-advanced/writing/prompts` | List prompts with filters (taskType, subType, topic, difficulty) |
| `GET` | `/ielts-advanced/writing/prompts/:id` | Get single prompt detail |
| `POST` | `/ielts-advanced/writing/sessions` | Create new writing session (start practice) |
| `PATCH` | `/ielts-advanced/writing/sessions/:id/draft` | Auto-save draft essay |
| `POST` | `/ielts-advanced/writing/sessions/:id/submit` | Submit essay for AI grading |
| `GET` | `/ielts-advanced/writing/sessions/:id` | Get session details + feedback |
| `GET` | `/ielts-advanced/writing/history` | User's writing practice history |
| `POST` | `/ielts-advanced/writing/free-write` | Submit a free-write (custom prompt) for grading |

### 4.3. AI Grading Integration

The grading flow for this new module should follow the same pattern as the existing intensive writing:

```
Frontend Submit → Backend Controller → RabbitMQ Queue → GradingConsumer → writing_grader.py → DB Update
```

**Key difference**: Unlike the full exam (which grades Task 1 + Task 2 together), the Advanced Writing module grades **one task at a time**. The `writing_grader.py` needs a minor adaptation:

```python
async def grade_single_writing_task(
    task_type: str,        # "TASK_1" or "TASK_2"
    prompt: str,
    essay: str,
    image_url: str = "",
) -> dict:
    """Grade a single IELTS writing task."""
    # Similar to grade_writing() but for one task only
    # Returns: { band, criteria: { ... }, overall_band }
```

---

## 5. Frontend Requirements

### 5.1. New Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/ielts/advanced/writing` | `WritingCatalogContent.tsx` | Filterable catalog of writing prompts |
| `/ielts/advanced/writing/:promptId` | `WritingPracticeContent.tsx` | Writing editor with prompt display |
| `/ielts/advanced/writing/:promptId/result/:sessionId` | `WritingResultContent.tsx` | AI grading result (reuses `WritingResultView`) |

### 5.2. New Hooks (DIP-compliant)

| Hook | Purpose |
|------|---------|
| `useWritingPrompts(filters)` | Fetch paginated prompts with TanStack Query |
| `useWritingPromptDetail(id)` | Fetch single prompt |
| `useWritingSession(sessionId)` | Fetch session detail + poll for grading status |
| `useWritingSubmit()` | Mutation to submit essay |
| `useWritingDraft()` | Mutation to auto-save draft |
| `useWritingHistory()` | Fetch user's writing history |

### 5.3. Reusable Components

| Component | Notes |
|-----------|-------|
| `WritingResultView.tsx` | ✅ Already exists — reuse directly |
| `WritingEditor.tsx` | New: Textarea + word count + timer |
| `PromptCard.tsx` | New: Card for catalog grid |
| `TaskTypeBadge.tsx` | New: Badge showing Task 1 / Task 2 |
| `WritingTimer.tsx` | New: Countdown timer with warning states |

---

## 6. Statistics & Gamification Integration

| Feature | Details |
|---------|---------|
| **Statistics Dashboard** | Add writing band scores to the IELTS Statistics page (average band, progress over time) |
| **Achievement Keys** | `IELTS_ADV_WRITING_FIRST` (first submission), `IELTS_ADV_WRITING_10` (10 essays), `IELTS_ADV_WRITING_BAND_7` (achieve band 7+) |
| **XP Rewards** | +50 XP per submission, +100 XP bonus for band >= 7.0 |
| **Streak Counting** | Count writing practice toward daily study streak |

---

## 7. Subscription / Quota

| Tier | Limit |
|------|-------|
| Free | 3 AI grading per month |
| Basic | 15 AI grading per month |
| Premium | Unlimited |

> Reuse existing `AI_WRITING_GRADING` quota feature from `subscriptions.service.ts`.

---

## 8. Implementation Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| **Phase 1** | Data seeding (extract prompts from Kaggle/HF datasets), DB schema, API endpoints | 2–3 days |
| **Phase 2** | Writing catalog page with filters, prompt detail page | 2 days |
| **Phase 3** | Writing editor (timer, word count, auto-save), submit flow | 2–3 days |
| **Phase 4** | AI grading integration (adapt `writing_grader.py` for single-task), result page | 1–2 days |
| **Phase 5** | Free-write mode, statistics integration, gamification | 1–2 days |
| **Phase 6** | Polish, mobile responsiveness, edge cases | 1 day |

**Total estimated effort: ~10–13 days**

---

## 9. Key Design Decisions

1. **Separate from Intensive Writing**: The existing Intensive module uses Cambridge full exams (Task 1 + Task 2 together). The Advanced Writing module allows practicing individual tasks with a much larger prompt library.

2. **Single-task grading**: Unlike Intensive which always grades both tasks together, Advanced Writing grades one task per session. This requires a small refactor of `writing_grader.py`.

3. **Hybrid data sourcing**: Start with free datasets (Kaggle, HuggingFace) for initial prompts (~200–500 unique prompts), then supplement with AI-generated prompts for unlimited variety.

4. **Draft persistence**: Auto-save drafts to DB to handle accidental page refresh or network issues.

5. **Reuse existing UI**: `WritingResultView.tsx` already provides a polished scoring breakdown with 4 criteria, band badges, strengths/weaknesses, and annotated mistakes. No need to rebuild this.
