# Relational Diagram Generation Plan

## What is a "Relational Diagram"?

For a thesis, this typically means an **Entity-Relationship Diagram (ERD)** showing:
- **Tables** (entities) with their columns (attributes)
- **Primary keys** (PK) and **Foreign keys** (FK)
- **Relationships** with cardinality (1:1, 1:N, M:N)

This is **different** from a class diagram — an ERD uses **database table names** (`@@map` values), shows FK columns explicitly, and uses crow's-foot or Chen notation for relationships.

---

## Your Schema at a Glance

Your `schema.prisma` has **~50 models** across 9 logical domains:

| Domain | Models | Table count |
|---|---|---|
| **Core / Auth** | User, IeltsProfile, StudentTeacherLink | 3 |
| **IELTS Intensive** | IeltsIntensiveExam, Session, Result | 3 |
| **Foundation Vocab** | VocabBook, Unit, Item, Question, Progress, Lesson, Word | 7 |
| **Foundation Grammar** | GrammarBook, Unit, Exercise, Progress | 4 |
| **Foundation Pronunciation** | Sound, SoundExample, Attempt, Progress | 4 |
| **IELTS Basic** | Skill, Lesson, Listening/Reading/Writing/Speaking Exercises, Progress, WritingAnswer | 8 |
| **IELTS Advanced** | Listening/Reading Parts & Sessions, Writing Prompts & Sessions, Speaking Parts & Sessions | 8 |
| **Vocab Lab** | Deck, Flashcard, FlashcardReview, CardType, CardTypeField, CardTemplate, SharedDeck | 7 |
| **Shadowing & Dictation** | ShadowingVideo, Folder, Progress, DictationVideo, Folder, Progress | 6 |
| **Community** | Post, Comment, PostLike, PostBookmark | 4 |
| **Gamification** | Achievement, UserAchievement, XpLog, Notification | 4 |
| **Subscription** | Subscription, Payment, UsageRecord, PricingPlan | 4 |
| **Other** | LearningMaterial, LearningProgress, QuestionNote | 3 |

---

## Approach Options

### Option A: Generate from Prisma directly (Recommended)

You already have a `generate-puml.js` script. I can create a similar script that generates an **ERD-specific** diagram (using `@@map` table names, showing PK/FK, proper crow's-foot notation) in one of these formats:

| Format | Pros | Cons |
|---|---|---|
| **Mermaid erDiagram** | Easy to render (GitHub, VSCode preview), thesis-friendly | Limited styling |
| **DBML (dbdiagram.io)** | Beautiful web UI, export to PNG/PDF, interactive | Requires external tool |
| **PlantUML ERD** | Consistent with your existing class diagrams | ERD notation is limited in PlantUML |
| **Draw.io XML** | Matches your flowchart format, fully editable | Harder to auto-generate cleanly |

**My recommendation: DBML → dbdiagram.io**
- Write a script to convert `schema.prisma` → `.dbml` format
- Paste into [dbdiagram.io](https://dbdiagram.io) for a beautiful, interactive ERD
- Export as PNG/PDF for thesis
- Alternative: Use `prisma-dbml-generator` npm package to auto-generate DBML

### Option B: Use an existing Prisma ERD tool

| Tool | Command | Output |
|---|---|---|
| `prisma-dbml-generator` | Add to `schema.prisma` generators, run `npx prisma generate` | `.dbml` file |
| `prisma-erd-generator` | Add generator, run `npx prisma generate` | SVG/PNG/PDF ERD |
| `prisma db pull` + DBeaver | Connect DBeaver to PostgreSQL, auto-generate ERD | Visual ERD in DBeaver |

### Option C: Write a custom script (most control)

A Node.js script that:
1. Parses `schema.prisma`
2. Extracts models, fields, relations, `@@map` table names
3. Outputs Mermaid/DBML/DrawIO format
4. You can split into sub-diagrams per domain (thesis requirement for readability)

---

## Recommended Strategy for Thesis

Given that 50+ tables in a single diagram will be **unreadable**, I recommend:

### Split into 4-5 sub-diagrams by domain:

1. **Core ERD**: `users`, `ielts_profiles`, `student_teacher_links`, `subscriptions`, `payments`, `usage_records`, `pricing_plans`
2. **Foundation ERD**: `vocabulary_books/units/words/questions/progress`, `grammar_books/units/exercises/progress`, `pronunciation_sounds/examples/attempts/progress`
3. **IELTS ERD**: `ielts_skills`, `ielts_lessons`, all exercise tables, `ielts_basic_progress`, intensive exam/session/result, advanced parts/sessions
4. **Practice ERD**: `shadowing_videos/folders/progress`, `dictation_videos/folders/progress`, `decks`, `flashcards`, `flashcard_reviews`, `card_types`, `shared_decks`
5. **Community ERD**: `posts`, `comments`, `post_likes`, `post_bookmarks`, `achievements`, `user_achievements`, `xp_logs`, `notifications`

Each sub-diagram would have 8-15 tables — perfect for thesis readability.

### Show `User` as a reference node in each sub-diagram
Since `User` connects to everything, include it as a simplified reference in each sub-diagram (show only PK, not all 20+ fields).

---

## Quick Start: Fastest Path

The fastest approach is using `prisma-dbml-generator`:

```bash
cd backend-core
npm install -D prisma-dbml-generator
```

Add to `schema.prisma`:
```prisma
generator dbml {
  provider = "prisma-dbml-generator"
  output   = "../../_thesis_paper/relational_diagram"
}
```

Then run:
```bash
npx prisma generate
```

This creates a `.dbml` file you can paste into [dbdiagram.io](https://dbdiagram.io) for a beautiful ERD.

---

## What Should I Do?

Tell me which approach you prefer:

1. **Quick**: Install `prisma-dbml-generator` and generate DBML → use dbdiagram.io
2. **Custom**: I write a script to parse schema.prisma and generate split Mermaid/DBML diagrams per domain
3. **Draw.io**: I generate `.drawio` XML ERDs to match your existing flowchart format
4. **PlantUML**: I generate `.puml` ERDs to match your existing class diagrams
