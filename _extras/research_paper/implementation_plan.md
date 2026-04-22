# Research Paper Plan: IELTS Master English AI Platform

## Background & Analysis of Reference Paper (SE2025_Paper_18)

The reference paper **"Social Network Platform Supporting English Learning and Multimedia Communication"** by a senior group at IUH follows this structure:

| Section | Content | Pages |
|---------|---------|-------|
| I. Introduction | Problem statement, motivation, paper outline | ~1 |
| II. Theoretical Background | Technology descriptions (TypeScript, Next.js, React Native, Gemini API, Supabase, Client-Server, Accuracy formula, Mastery Score formula) | ~1.5 |
| III. Related Work | Feature comparison table (SLP vs Duolingo/ELSA/Quizlet), key differentiators | ~1.5 |
| IV. System Design | Architecture diagram, Auth, AI-based learning (5 subsystems) | ~3 |
| V. Implementation & Results | Deployment diagram, UI screenshots, 3 experiments (STT accuracy, writing evaluation, mastery score simulation) | ~2 |
| VI. Conclusion & Future Work | Summary + future directions | ~0.5 |
| VII. References | 11 references | ~0.5 |

**Total: ~8 pages, IEEE two-column format**

---

## Your System's Advantages Over the Reference Paper

Your system ("IELTS Master English AI") is **significantly more advanced** than the reference paper's system. Here is why:

| Aspect | Reference Paper (Social-Learning) | Your System (IELTS Master AI) |
|--------|----------------------------------|-------------------------------|
| **Architecture** | Monolithic Node.js/Express backend | Event-Driven Hybrid: NestJS Modular Monolith + Python FastAPI microservice |
| **AI Integration** | Gemini API calls from Express.js | Dedicated FastAPI AI Worker + RabbitMQ message broker for async AI processing |
| **Speech-to-Text** | Google Cloud Speech API | Self-hosted Faster-Whisper (local ML model, no API cost) |
| **AI Grading** | Gemini API only | LLM-based (Llama 3.3 70B via Groq) with rubric-structured JSON output + Levenshtein pronunciation scoring |
| **Database** | Supabase + MongoDB | PostgreSQL + Prisma ORM with 35+ models, Redis caching |
| **Exam System** | Basic exercises | Full Cambridge IELTS mock exams (Listening, Reading, Writing, Speaking) with session persistence |
| **Vocabulary** | Manual + error-triggered vocab | Anki-style SM-2 spaced repetition with custom card types/templates |
| **Infrastructure** | Single VPS + Nginx | Docker Compose locally + K3s Kubernetes on GCP + Traefik Ingress |
| **Content Depth** | AI-generated content | Real Cambridge IELTS content (Books 14-20) with structured question types |
| **Learning Path** | AI-generated roadmap | Onboarding-driven personalized roadmap with diagnostic placement + daily time budgeting |
| **Mobile** | React Native | React Native (Expo) |

---

## Proposed Paper Structure

> [!IMPORTANT]
> Your paper should follow the same IEEE conference format as the reference but leverage your system's far greater technical depth. Below is a section-by-section plan.

### Paper Title (Proposed)
**"AN AI-POWERED IELTS PREPARATION PLATFORM WITH EVENT-DRIVEN ARCHITECTURE AND LOCAL SPEECH PROCESSING"**

Or in Vietnamese if required:
**"NỀN TẢNG LUYỆN THI IELTS TÍCH HỢP TRÍ TUỆ NHÂN TẠO VỚI KIẾN TRÚC HƯỚNG SỰ KIỆN VÀ XỬ LÝ GIỌNG NÓI CỤC BỘ"**

---

### Section I: Introduction (~1 page)

**What to write:**
1. **The problem**: IELTS is the world's most popular English proficiency test; online preparation tools are growing but most lack:
   - Automated scoring for subjective skills (Writing & Speaking)
   - Real-time speech analysis without expensive cloud APIs
   - Structured learning paths personalized to individual goals
   - Integration of all 4 IELTS skills in one platform
2. **Gap in existing solutions**: Duolingo lacks IELTS-specific preparation; ELSA focuses only on pronunciation; Cambridge official apps have no AI grading
3. **Your contribution** (3-4 bullet points):
   - An Event-Driven Hybrid Architecture separating AI inference from core business logic via RabbitMQ
   - Local speech processing using Faster-Whisper, eliminating per-request cloud API costs
   - LLM-based automated IELTS Writing & Speaking grading with rubric-structured JSON output
   - A comprehensive learning pipeline: Foundation → Basic → Advanced → Intensive with SM-2 spaced repetition vocabulary
4. **Paper outline**: Brief description of sections 2-6

**References to find:**
- IELTS test statistics (number of test-takers worldwide)
- Limitations of current IELTS prep apps
- Event-driven architecture benefits in educational systems

---

### Section II: Theoretical Background (~1.5 pages)

**What to write — technology foundations with formulas:**

#### A. Event-Driven Architecture
- Brief explanation of async message passing via broker
- Why it matters: AI inference (Whisper, LLM) takes 2-30 seconds; blocking the main thread degrades UX

#### B. NestJS (TypeScript)
- Modular monolith pattern: domain modules (exams, auth, vocabulary, shadowing, etc.)
- Dependency injection, guards, decorators

#### C. FastAPI (Python)
- Async AI worker microservice
- Why Python: ML ecosystem (Faster-Whisper, OpenAI SDK)

#### D. Faster-Whisper (Speech-to-Text)
- Local Whisper model inference
- VAD (Voice Activity Detection) for clean transcription
- Advantage over cloud APIs: zero latency variability, no per-request cost

#### E. LLM-Based Grading
- Using Llama 3.3 70B (via Groq) for rubric-based evaluation
- Structured JSON output schema enforcement
- Band descriptor scoring for IELTS criteria

#### F. SM-2 Spaced Repetition Algorithm
**Include the formula from your code:**
```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
```
Where:
- `EF` = Ease Factor (≥ 1.3)
- `q` = quality rating (0-5)
- Interval calculation: `I(n) = I(n-1) × EF`

#### G. Levenshtein Distance for Pronunciation Scoring
**Formula from your code:**
```
Score = (1 - d(transcribed, target) / max(|transcribed|, |target|)) × 100
```

#### H. IELTS Answer Matching Algorithm
- Handling optional words: `"(the) answer"` → matches both `"answer"` and `"the answer"`
- Handling alternative answers: `"answer1/answer2"` → matches either
- Case-insensitive, non-alphanumeric stripped comparison

---

### Section III: Related Work & System Comparison (~1.5 pages)

**What to write:**

#### A. Feature Comparison Table

| Feature | IELTS Master AI | Duolingo | ELSA Speak | Cambridge Official | Reference Paper (SLP) |
|---------|----------------|----------|------------|-------------------|----------------------|
| IELTS Mock Exams | ✅ Full 4-skill | ❌ | ❌ | ✅ Limited | ❌ |
| AI Writing Grading | ✅ LLM rubric-based | ❌ | ❌ | ❌ | ✅ Gemini basic |
| AI Speaking Grading | ✅ Whisper + LLM | ❌ | ✅ Phoneme-level | ❌ | ❌ |
| Pronunciation Checker | ✅ Faster-Whisper local | ❌ | ✅ | ❌ | ✅ Cloud API |
| Spaced Repetition | ✅ SM-2 (Anki-style) | ❌ | ❌ | ❌ | ❌ |
| Shadowing/Dictation | ✅ YouTube-based | ❌ | ❌ | ❌ | ❌ |
| Event-Driven AI | ✅ RabbitMQ | ❌ | ❌ | ❌ | ❌ |
| Personalized Roadmap | ✅ Onboarding + placement | ✅ Basic | ❌ | ❌ | ✅ AI-generated |
| Social Features | ❌ | ✅ Leaderboards | ❌ | ❌ | ✅ Full social network |
| Real Content | ✅ Cambridge Books 14-20 | ❌ | ❌ | ✅ | ❌ AI-generated |

#### B. Key Differentiators (3 subsections)
1. **Local AI Processing** (vs cloud-only competitors)
2. **Event-Driven Decoupling** (vs monolithic API-blocking)
3. **Comprehensive IELTS Coverage** (all 4 skills + vocabulary + grammar + pronunciation)

---

### Section IV: System Architecture & Design (~3-4 pages) ⭐ MOST IMPORTANT

**What to write:**

#### A. System Architecture Overview
- **Include your ASCII architecture diagram** (from README) — redraw as a proper figure
- 3-layer explanation: Client → Gateway → Application (K3s) → Data Layer
- **Key design decision**: Separation of NestJS (business logic) and FastAPI (ML inference) connected via RabbitMQ

#### B. Database Design
- **Include an ER diagram** showing key entities and relationships
- Highlight the 35+ Prisma models:
  - Core: `User`, `Exam`, `ExamSession`, `Result`
  - IELTS Basic: `IeltsSkill`, `IeltsLesson`, `IeltsListeningExercise`, `IeltsReadingExercise`, `IeltsWritingExercise`
  - IELTS Advanced: `IeltsPracticeListeningPart`, `IeltsPracticeSession`
  - Vocabulary: `VocabularyBook`, `VocabularyUnit`, `VocabularyWord`, `VocabularyExercise`
  - Vocab Lab: `Deck`, `Flashcard`, `FlashcardReview`, `CardType`, `CardTypeField`, `CardTemplate`
  - Shadowing: `ShadowingVideo`, `ShadowingFolder`, `ShadowingDictationProgress`
  - Grammar: `GrammarBook`, `GrammarUnit`, `GrammarExercise`
  - Pronunciation: `PronunciationSound`, `PronunciationAttempt`

#### C. Authentication & Authorization
- JWT-based auth via NestJS Guards
- Role-based access (STUDENT, ADMIN, INSTRUCTOR)
- Redis session caching

#### D. AI-Powered Grading Pipeline (Write this in DETAIL — it's your crown jewel)

##### D.1. Event-Driven Flow Diagram
```
[User submits exam]
       ↓
[NestJS Core Backend]
       ↓ (RabbitMQ publish)
[pronunciation-check-queue / exam-grading-queue]
       ↓ (RabbitMQ consume)
[FastAPI AI Worker]
  ├── Faster-Whisper transcription
  ├── Levenshtein pronunciation scoring
  └── LLM grading (Groq/Llama 3.3 70B)
       ↓ (Direct DB update via psycopg2)
[PostgreSQL - Update result]
```

##### D.2. Writing Grading
- System prompt enforcing IELTS band descriptors
- 4 criteria: Task Achievement, Coherence/Cohesion, Lexical Resource, Grammatical Range
- Structured JSON output with strengths, weaknesses, how-to-improve, specific mistakes
- Server-side band recalculation: `overall = (task1 + task2 × 2) / 3`

##### D.3. Speaking Grading
- Audio → Base64 decode → Whisper transcription → LLM evaluation
- 4 criteria: Fluency/Coherence, Lexical Resource, Grammar, Pronunciation
- Handles URL-based and Base64-encoded audio inputs

##### D.4. Pronunciation Checking
- RabbitMQ consumer processes `pronunciation-check-queue`
- Download audio from MinIO → Whisper transcription → Levenshtein scoring → DB update

#### E. IELTS Exam Engine
- Synchronous grading for Listening/Reading (answer key matching)
- Asynchronous AI grading for Writing/Speaking
- Session persistence with Save & Pause
- Cambridge-style question parsing with optional word handling

#### F. Spaced Repetition Vocab Lab
- SM-2 algorithm implementation
- Custom card types with configurable fields and templates
- Deck management, study queue, review history

#### G. Personalized Learning Roadmap
- Onboarding wizard: target band, daily commitment, placement test
- Dynamic step generation based on daily time budget
- Sequential locking: must complete step N before accessing step N+1
- Items interleaved across skills (Listening, Reading, Writing, Speaking)

#### H. Shadowing & Dictation System
- YouTube video integration with timestamped sentences
- Sentence-level progress tracking
- Multiple difficulty levels for dictation

---

### Section V: Implementation & Results (~2-3 pages)

**What to write:**

#### A. Deployment Architecture
- Docker Compose for local development (PostgreSQL 16, Redis 7, RabbitMQ 3, MinIO)
- K3s Kubernetes on GCP for production
- Traefik Ingress Controller
- Include a deployment diagram

#### B. User Interface Screenshots
Include screenshots of:
1. IELTS Hub (the roadmap page with Foundation → Basic → Advanced → Intensive)
2. IELTS Intensive exam catalog
3. Listening/Reading practice interface
4. Writing practice with AI grading result view
5. Speaking test with device test + recording
6. Vocab Lab (Anki-style flashcards)
7. Shadowing/Dictation interface
8. Pronunciation checker
9. Grammar lessons

#### C. Experimental Evaluation

> [!IMPORTANT]
> You need **3-4 concrete experiments** with charts/tables. Here are the ones you should run:

##### Experiment 1: Speech-to-Text Accuracy (Faster-Whisper)
- **Method**: Record 30+ audio samples across 3 difficulty levels (Basic, Intermediate, Advanced)
- **Metrics**: Word Error Rate (WER), Accuracy, Latency
- **Compare**: Your local Faster-Whisper vs. Google Cloud Speech-to-Text API
- **Expected charts**: Bar chart of accuracy by level, latency comparison

##### Experiment 2: AI Writing Grading Consistency
- **Method**: Submit 20-30 essays (varying band levels) to the LLM grader
- **Metrics**: Compare AI-assigned band scores vs. human IELTS examiner scores
- **Analysis**: Pearson correlation coefficient, Mean Absolute Error
- **Expected charts**: Scatter plot (AI score vs Human score), criteria breakdown bar chart

##### Experiment 3: Pronunciation Scoring Accuracy (Levenshtein)
- **Method**: Test 50+ pronunciation attempts with known correct/incorrect pronunciations
- **Metrics**: Precision, Recall, F1-score for pass/fail classification
- **Analysis**: Confusion matrix, ROC curve
- **Expected charts**: Score distribution histogram, accuracy by word difficulty

##### Experiment 4: SM-2 Spaced Repetition Effectiveness
- **Method**: Simulate 3 user profiles (High/Medium/Low accuracy) over N=50+ reviews
- **Metrics**: Interval growth rate, retention prediction accuracy
- **Expected charts**: Interval progression graph (similar to reference paper's Mastery Score simulation)

##### Experiment 5 (Optional): System Performance Under Load
- **Method**: Measure API response times and RabbitMQ queue processing times
- **Metrics**: p50/p95/p99 latency, throughput
- **Expected charts**: Latency distribution histogram

---

### Section VI: Conclusion & Future Work (~0.5 page)

**What to write:**

#### A. Conclusion
- Summarize the 3-4 key contributions
- Emphasize the Event-Driven Architecture as a novel approach for educational platforms
- Highlight local AI processing as a cost-effective alternative to cloud APIs

#### B. Future Work
- Real-time collaborative practice sessions
- Advanced analytics dashboard for teachers (student-teacher linking is already in schema)
- Support for other English proficiency tests (TOEFL, PTE)
- On-device ML models for mobile (TensorFlow Lite)
- Gamification and social features

---

### Section VII: References (~15-20 references)

**Categories to include:**
1. IELTS test statistics & importance
2. AI in education / adaptive learning systems
3. Speech-to-text: Whisper paper, Faster-Whisper
4. LLMs for automated essay scoring
5. Spaced repetition: SM-2 algorithm (Piotr Wozniak)
6. Event-driven architecture patterns
7. Technology documentation: NestJS, FastAPI, Next.js, React Native, Prisma, RabbitMQ, Redis, Kubernetes

---

## Concrete Action Items

### Phase 1: Prepare Assets (1-2 days)
- [ ] Take 8-10 polished screenshots of the running app
- [ ] Create architecture diagram (use draw.io or Mermaid)
- [ ] Create ER diagram (subset of key entities)
- [ ] Create deployment diagram
- [ ] Create the AI grading pipeline flow diagram

### Phase 2: Run Experiments (2-3 days)
- [ ] Experiment 1: Record 30 audio samples, measure Whisper accuracy
- [ ] Experiment 2: Collect 20-30 essay samples, compare AI vs human scores
- [ ] Experiment 3: Test pronunciation scoring with 50+ samples
- [ ] Experiment 4: Run SM-2 simulation script
- [ ] Generate all charts (use matplotlib/seaborn or Excel)

### Phase 3: Write the Paper (3-5 days)
- [ ] Write Section I: Introduction
- [ ] Write Section II: Theoretical Background
- [ ] Write Section III: Related Work
- [ ] Write Section IV: System Architecture (longest section)
- [ ] Write Section V: Implementation & Results
- [ ] Write Section VI: Conclusion
- [ ] Compile references

### Phase 4: Review & Format (1-2 days)
- [ ] Format in IEEE two-column template
- [ ] Proofread and polish English
- [ ] Verify all figures and tables render correctly
- [ ] Check page count (aim for 8-10 pages)

---

## Open Questions

> [!IMPORTANT]
> **Do you need help with any of these?**
> 1. Should I help you **write simulation scripts** for the experiments (e.g., SM-2 simulation, Whisper accuracy benchmarking)?
> 2. Should the paper be written in **English or Vietnamese**?
> 3. Does your university require a specific **IEEE template** or LaTeX format?
> 4. Do you want me to **draft any specific sections** of the paper right now?
> 5. Is the paper for `STUDENT SCIENTIFIC RESEARCH COMMUNICATION, VOLUME I, 2025` (same venue as the reference paper)?
