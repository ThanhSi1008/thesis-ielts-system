# IELTS Advanced Speaking — Requirements & Suggestions

## 1. Overview

Add an **IELTS Advanced Speaking** module under the IELTS Advanced section, providing users with authentic Cambridge-style speaking prompts organized by **Part** (Part 1, Part 2, Part 3), with audio recording, timer, and **AI-powered scoring** using the existing Gemini-based grading pipeline.

### Reference
- **UI Inspiration**: Existing IELTS Intensive `SpeakingTaskBoard.tsx` (video-based), adapted to a **text-based, per-part** practice format
- **Scoring Pipeline Reference**: Existing `backend-ai/app/services/speaking_grader.py` + `SpeakingResultView.tsx`
- **Data Source**: [engnovate.com](https://engnovate.com/ielts-speaking-tests/) — WordPress REST API (public, no auth required)

### Key Difference from IELTS Intensive Speaking
| | IELTS Intensive | IELTS Advanced |
|---|---|---|
| **Structure** | Full exam (Part 1 + 2 + 3 together) | Individual parts practiced separately |
| **Question delivery** | Video-based (examiner video plays) | **Text-based** (questions displayed on screen) |
| **Scope** | One session = entire speaking exam | One session = single part (4 questions for Part 1, 1 cue card for Part 2, 4 questions for Part 3) |
| **Grading** | Grades all 3 parts together | **Grades one part at a time** |
| **Data source** | Manually seeded with video links | Scraped from Engnovate (text only, no video) |

---

## 2. Data Source Strategy

> **Discovery**: engnovate.com exposes a **fully public WordPress REST API** with a custom post type `ielts_speaking_test`. Same pattern as the writing module — no authentication, no scraping libraries needed for metadata. Questions need HTML parsing.

### 2.1. API Endpoints (engnovate.com)

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /wp-json/wp/v2/ielts_speaking_test` | List all speaking tests | `?per_page=100&page=1&_fields=id,slug,title,ielts_speaking_test_category` |
| `GET /wp-json/wp/v2/ielts_speaking_test/{id}` | Get single test metadata | Returns `title`, `slug`, `content`, `category` |
| `GET /wp-json/wp/v2/ielts_speaking_test_category` | Get all categories | 10 categories, ~340 total tests |

### 2.2. Available Data (~340 tests across 10 categories)

| Category ID | Name | Count | Slug |
|-------------|------|-------|------|
| `1545` | **Cambridge Academic** | 170 | `cambridge-academic` |
| `1622` | Cambridge General | 44 | `cambridge-general` |
| `1645` | Forecast Academic | 10 | `forecast-academic` |
| `1648` | Forecast General | 10 | `forecast-general` |
| `1637` | Official Guide Academic | 8 | `official-guide-to-ielts-academic` |
| `1649` | Official Guide General | 8 | `official-guide-to-ielts-general` |
| `1633` | Practice Test Plus Academic | 18 | `practice-test-plus-academic` |
| `1650` | Practice Test Plus General | 18 | `practice-test-plus-general` |
| `1641` | Recent Actual Tests Academic | 27 | `recent-actual-tests-academic` |
| `1651` | Recent Actual Tests General | 27 | `recent-actual-tests-general` |
| | **Total** | **~340** | |

> [!IMPORTANT]
> Engnovate stores speaking tests in TWO formats:
> 1. **Full Test pages** (e.g., `cambridge-ielts-20-academic-speaking-test-4`) — contain ALL 3 parts on one page (11 questions total)
> 2. **Per-Part pages** (e.g., `cambridge-ielts-20-academic-speaking-test-4-part-1`) — contain questions for a single part
>
> **Recommendation**: Scrape the **Full Test pages only**, then programmatically split them into Part 1 / Part 2 / Part 3 entries. This avoids duplicates.

### 2.3. Data Structure Observed from a Full Test Page

From the Cambridge IELTS 20 Academic Speaking Test 4 page, the content structure is:

```
Questions 1-4 → Part 1 (Introduction & Interview)
  - "What do you think your best personal qualities are? [Why?]"
  - "Do you have the same personal qualities as your parents? [Why/Why not?]"
  - "What personal qualities are important to you in a friend? [Why?]"
  - "Do you think you have the personal qualities to be a good/successful leader?"

Question 5 → Part 2 (Cue Card / Long Turn)
  - "Describe a time when you had a long discussion about a news story."
  - "You should say:"
  - "  what the news story was about"
  - "  who you discussed this news story with"
  - "  what people's opinions were"
  - "and explain why you had such a long discussion about this news story."

Questions 6-11 → Part 3 (Discussion)
  - "How do most people find out about the news in your country?"
  - "Are people more interested in local news than national news?"
  - "How important is it to know about international news?"
  - "Why are discussion programmes involving members of the public popular?"
  - "What kinds of people want to take part in discussion programmes?"
  - "Do discussion programmes influence people in a good or bad way?"
```

> [!NOTE]
> The page content is rendered dynamically via React, but the question text appears in plain divs. Use `cheerio` to parse the rendered HTML, splitting on `### Enhanced Speech Comparison` delimiters.

### 2.4. Data Pipeline

```
1. Node.js script: Fetch all speaking tests from WP REST API (paginated)
2. Filter: Keep ONLY "full test" pages (exclude "-part-1", "-part-2", "-part-3" slugs)
3. For each test: HTTP GET the page HTML → parse question texts from DOM
4. Split questions into Part 1 (first 4), Part 2 (question 5 / cue card), Part 3 (questions 6+)
5. Parse slug to extract: source series, book number, test number
6. Categorize: topic detection via keyword matching or AI classification
7. Output: prisma/data/ielts-advanced-compiled/speaking-parts.json
8. Seeder writes to DB (IeltsAdvancedSpeakingPart table)
```

### 2.5. Prompt Data Schema (JSON output per part)

**Part 1 example:**
```json
{
  "id": "engnovate-cambridge-20-test-4-part-1",
  "partNumber": 1,
  "partType": "interview",
  "topic": "Personal Qualities",
  "source": "cambridge_20",
  "bookNumber": 20,
  "testNumber": 4,
  "category": "cambridge-academic",
  "questions": [
    { "text": "What do you think your best personal qualities are? [Why?]" },
    { "text": "Do you have the same personal qualities as your parents? [Why/Why not?]" },
    { "text": "What personal qualities are important to you in a friend? [Why?]" },
    { "text": "Do you think you have the personal qualities to be a good/successful leader?" }
  ],
  "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4"
}
```

**Part 2 example:**
```json
{
  "id": "engnovate-cambridge-20-test-4-part-2",
  "partNumber": 2,
  "partType": "cue_card",
  "topic": "News Discussion",
  "source": "cambridge_20",
  "bookNumber": 20,
  "testNumber": 4,
  "category": "cambridge-academic",
  "questions": [
    {
      "text": "Describe a time when you had a long discussion about a news story.\nYou should say:\n  what the news story was about\n  who you discussed this news story with\n  what people's opinions were\nand explain why you had such a long discussion about this news story."
    }
  ],
  "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4"
}
```

**Part 3 example:**
```json
{
  "id": "engnovate-cambridge-20-test-4-part-3",
  "partNumber": 3,
  "partType": "discussion",
  "topic": "News & Media",
  "source": "cambridge_20",
  "bookNumber": 20,
  "testNumber": 4,
  "category": "cambridge-academic",
  "questions": [
    { "text": "How do most people find out about the news in your country?" },
    { "text": "Are people more interested in local news than national news?" },
    { "text": "How important is it to know about international news?" },
    { "text": "Why are discussion programmes involving members of the public popular?" }
  ],
  "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4"
}
```

### 2.6. Scraping Script Location

```
backend-core/prisma/scripts/
└── scrape-engnovate-speaking.mjs   # Node.js script (fetch + cheerio)
```

---

## 3. Feature Requirements

### 3.1. Speaking Catalog Page (`/ielts/advanced/speaking`)

> Displayed within the existing Advanced tabs alongside Listening, Reading, Writing.

| Requirement | Details |
|-------------|---------|
| **Part Filter** | Toggle between "Part 1", "Part 2", "Part 3", or "All" (tab-style, like Writing's Task 1/Task 2 filter) |
| **Category Filter** | Dropdown: Cambridge Academic, Forecast, Practice Test Plus, etc. |
| **Topic Filter** | Optional: derived from question content (e.g., "Personal Qualities", "Technology", "News & Media") |
| **Source Badge** | Show origin (Cambridge 20, Forecast, etc.) |
| **Completion Status** | ✅ completed / 🔄 in progress / ⬜ not started per part |
| **My Best Score** | Show highest band score achieved (if any) |
| **Pagination** | Load prompts in batches of 12–20 |

### 3.2. Speaking Practice Page (`/ielts/advanced/speaking/[partId]`)

> Modeled after the IELTS Intensive `SpeakingTaskBoard.tsx` but **text-based, without video**. The user sees questions on screen, records audio responses.

| Requirement | Details |
|-------------|---------|
| **Layout (Part 1 & 3)** | Centered card showing questions one-by-one with record button |
| **Layout (Part 2)** | Split: Left side = Cue card + timer, Right side = Notes area + record button |
| **Question Display** | Show current question text prominently in a card |
| **Think Time** | Part 1: 2 seconds, Part 2: 60 seconds (with visible countdown), Part 3: 2 seconds |
| **Recording** | Microphone recording with real-time timer: Part 1/3 max 60s, Part 2 max 120s |
| **Auto-advance** | After recording stops, auto-move to next question (or show "Next" button) |
| **Question Progress** | Show "Question 2 of 4" indicator |
| **No Video** | Unlike Intensive, there is no examiner video — questions are purely text |
| **Tabbed Layout** | Practice / My Answers / Community tabs (consistent with Writing/Reading/Listening) |

### 3.3. AI Scoring & Results Page (`/ielts/advanced/speaking/[partId]/result/[sessionId]`)

> **Reuse existing pipeline**: `backend-core → RabbitMQ → grading_consumer.py → speaking_grader.py → SpeakingResultView.tsx`

| Requirement | Details |
|-------------|---------|
| **Scoring Engine** | Reuse `backend-ai/app/services/speaking_grader.py` (Gemini 2.5 Flash) |
| **4 Criteria** | Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation |
| **Per-Criterion Feedback** | Band score + strengths + weaknesses + specific advice |
| **Overall Band** | Calculated per IELTS formula |
| **Transcription** | AI transcribes the audio and includes it in feedback (for user reference) |
| **Result View** | Reuse `SpeakingResultView.tsx` or adapt `WritingResultContent.tsx` |
| **Grading Status** | Show "Grading in progress..." with polling until `GRADED` status |

---

## 4. Backend Requirements

### 4.1. New Database Tables

```prisma
model IeltsAdvancedSpeakingPart {
  id          String   @id @default(uuid())
  partNumber  Int      // 1, 2, or 3
  partType    String   // "interview", "cue_card", "discussion"
  topic       String   // e.g. "Personal Qualities", "News & Media"
  source      String   @default("manual")  // e.g. "cambridge_20"
  bookNumber  Int?
  testNumber  Int?
  category    String   @default("cambridge-academic")
  questions   Json     // Array of { text: string } for all parts
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sessions IeltsAdvancedSpeakingSession[]

  @@map("ielts_advanced_speaking_parts")
}

model IeltsAdvancedSpeakingSession {
  id            String   @id @default(uuid())
  userId        String
  partId        String
  audioUrls     Json?    // Array of audio file URLs (one per question)
  transcription Json?    // AI-generated transcription
  timeTaken     Int?     // total seconds
  status        String   @default("IN_PROGRESS")
  // IN_PROGRESS, SUBMITTED, GRADING, GRADED, GRADING_FAILED
  feedback      Json?    // AI grading feedback
  bandScore     Float?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User                        @relation(fields: [userId], references: [id])
  part IeltsAdvancedSpeakingPart   @relation(fields: [partId], references: [id])

  @@map("ielts_advanced_speaking_sessions")
}
```

### 4.2. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ielts/advanced/speaking/parts` | List parts with filters (partNumber, category, topic) |
| `GET` | `/ielts/advanced/speaking/parts/:id` | Get single part detail with questions |
| `GET` | `/ielts/advanced/speaking/parts/:id/sessions` | Get all sessions for a part (My Answers) |
| `POST` | `/ielts/advanced/speaking/sessions` | Create new speaking session |
| `POST` | `/ielts/advanced/speaking/sessions/:id/submit` | Submit audio recordings for AI grading |
| `GET` | `/ielts/advanced/speaking/sessions/:id` | Get session details + feedback |
| `GET` | `/ielts/advanced/speaking/history` | User's speaking practice history |

### 4.3. Audio Upload Strategy

> **Key decision**: Speaking audio files need to be uploaded somewhere.

| Option | Pros | Cons |
|--------|------|------|
| **A. Send audio as base64 in JSON body** | Simple, no file upload infra needed | Large payloads, memory-heavy |
| **B. Upload audio to cloud storage (S3/GCS) first, then send URLs** | Clean, scalable | Requires cloud storage setup |
| **C. Multipart form upload to backend, stored locally** | No cloud dependency | Disk management needed |

**Recommendation**: Option A for MVP (same approach as IELTS Intensive speaking), Option B for production scale.

### 4.4. AI Grading Integration

```
Frontend Submit → Backend Controller → RabbitMQ Queue
  → GradingConsumer → speaking_grader.py → DB Update
```

**Key adaptation needed**: The existing `speaking_grader.py` grades all 3 parts together. For Advanced Speaking, we need a single-part variant:

```python
async def grade_single_speaking_part(
    part_number: int,        # 1, 2, or 3
    part_type: str,          # "interview", "cue_card", "discussion"
    questions: list[str],    # The question texts
    audio_data: list[str],   # Base64 encoded audio per question
) -> dict:
    """Grade a single IELTS speaking part."""
    # Returns: { band, criteria: { ... }, transcription, overall_band }
```

---

## 5. Frontend Requirements

### 5.1. New Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/ielts/advanced/speaking` | `SpeakingCatalogContent.tsx` | Filterable catalog of speaking parts |
| `/ielts/advanced/speaking/[partId]` | `SpeakingPracticeContent.tsx` | Text-based speaking practice with recording |
| `/ielts/advanced/speaking/[partId]/result/[sessionId]` | `SpeakingResultContent.tsx` | AI grading result |
| `/ielts/advanced/speaking/[partId]/my-answers` | `page.tsx` | History of attempts for this part |
| `/ielts/advanced/speaking/[partId]/community` | `page.tsx` | Community placeholder |

### 5.2. New Hooks (DIP-compliant)

| Hook | Purpose |
|------|---------|
| `useSpeakingParts(filters)` | Fetch paginated parts with TanStack Query |
| `useSpeakingPartDetail(id)` | Fetch single part with questions |
| `useSpeakingSession(sessionId)` | Fetch session detail + poll for grading status |
| `useStartSpeakingSession()` | Mutation to create a new session |
| `useSubmitSpeaking()` | Mutation to submit audio recordings |
| `useSpeakingSessionsByPart(partId)` | Fetch all sessions for My Answers tab |

### 5.3. Component Reuse

| Component | Notes |
|-----------|-------|
| `SpeakingTaskBoard.tsx` | ⚠️ **Partially reusable** — the recording logic (MediaRecorder, timer, step state machine) can be extracted. The video playback parts are removed for Advanced Speaking. |
| `SpeakingResultView.tsx` | ✅ **Reusable** for displaying grading results |
| Layout (`[partId]/layout.tsx`) | ✅ Copy from Writing layout (Practice / My Answers / Community tabs) |

### 5.4. Simplified State Machine (no video)

The Intensive speaking board uses this state flow:
```
IDLE → LISTEN_CAPTION → PLAYING (video) → THINK_CAPTION → THINKING → PLAYING_2 (video2) → RECORDING → RECORDED
```

For Advanced Speaking, simplify to:
```
IDLE → READING (show question text) → THINKING (countdown) → RECORDING → RECORDED
```

---

## 6. Statistics & Gamification Integration

| Feature | Details |
|---------|---------|
| **Statistics Dashboard** | Add speaking band scores to IELTS Statistics page (average band, progress over time) |
| **Achievement Keys** | `ADV_SPEAKING_FIRST` (first submission), `ADV_SPEAKING_10` (10 parts), `ADV_SPEAKING_BAND_7` (achieve band 7+) |
| **XP Rewards** | +20 XP per submission, +50 XP bonus for band >= 7.0 |
| **Streak Counting** | Count speaking practice toward daily study streak |

---

## 7. Implementation Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| **Phase 1** | Scraping script (fetch all speaking tests → parse → split into parts → JSON) | 1–2 days |
| **Phase 2** | DB schema, seeder, API endpoints (CRUD + submit) | 1–2 days |
| **Phase 3** | Speaking catalog page with filters (Part 1/2/3 tabs, category dropdown) | 1 day |
| **Phase 4** | Speaking practice page (text-based recording, no video, simplified state machine) | 2–3 days |
| **Phase 5** | AI grading integration (adapt `speaking_grader.py` for single-part, results page) | 1–2 days |
| **Phase 6** | Polish, tabs (My Answers, Community), statistics integration | 1 day |

**Total estimated effort: ~8–11 days**

---

## 8. Key Design Decisions

1. **Text-based, not video-based**: Unlike Intensive Speaking which uses examiner videos, Advanced Speaking displays question text on screen. This is simpler to implement and doesn't require video hosting. The user imagines an examiner asking the question.

2. **Per-part practice**: Unlike Intensive which always runs all 3 parts, Advanced allows practicing Part 1, Part 2, or Part 3 individually. This is more flexible for targeted practice.

3. **Same recording UX, simpler delivery**: The recording flow (think time → record → stop → next) is identical to Intensive. Only the question delivery changes (text instead of video).

4. **Reuse the step state machine**: The `SpeakingTaskBoard.tsx` has a well-tested state machine. For Advanced, simplify to: `IDLE → READING → THINKING → RECORDING → RECORDED` (skip video-related states).

5. **Scrape full tests, split into parts**: Engnovate stores both full tests and individual parts. Scraping full tests and splitting programmatically avoids duplicates and gives us cleaner metadata.

6. **Audio upload via base64 (MVP)**: Same as Intensive Speaking — audio blobs are converted to base64 and sent in the request body. This keeps the architecture simple and consistent.
