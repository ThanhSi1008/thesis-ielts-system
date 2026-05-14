# Implementation Plan: Split `schema.dbml` into `core.dbml` + `ielts.dbml`

## Goal

Split the monolithic `schema.dbml` (1195 lines) into two domain-specific DBML files that mirror the existing class diagram split at:
- `_thesis-paper/2. class-diagram/v5/core.puml` — Platform & general features
- `_thesis-paper/2. class-diagram/v5/ielts.puml` — IELTS-specific domain

Both output files go in `_thesis-paper/3. relational-diagram/`.

> [!IMPORTANT]
> The source file is `schema.dbml` in that folder. Do NOT delete it — keep it as a backup. Create two **new** files: `core.dbml` and `ielts.dbml`.

---

## Phase 1: Create `core.dbml`

Create `core.dbml` in the `3. relational-diagram/` folder. It contains all **platform, community, gamification, flashcard, shadowing, dictation, and billing** tables.

### 1.1 — Shared anchor table (copy as-is from `schema.dbml`)

The `users` table must appear in **both** files since it's the shared FK target. Copy it exactly:

```
Table users { ... }
```
> Lines 5–49 in `schema.dbml`

### 1.2 — Core Tables to include (copy each exactly from `schema.dbml`)

| Table name | Lines in schema.dbml | Domain |
|---|---|---|
| `decks` | 279–287 | Flashcard |
| `flashcards` | 289–314 | Flashcard |
| `flashcard_reviews` | 316–325 | Flashcard |
| `card_types` | 327–338 | Flashcard |
| `card_type_fields` | 340–349 | Flashcard |
| `card_templates` | 351–361 | Flashcard |
| `shared_decks` | 363–374 | Flashcard |
| `question_notes` | 376–389 | Exam Notes |
| `shadowing_videos` | 391–407 | Shadowing |
| `shadowing_folders` | 409–419 | Shadowing |
| `shadowing_progress` | 421–433 | Shadowing |
| `dictation_videos` | 435–451 | Dictation |
| `dictation_folders` | 453–463 | Dictation |
| `dictation_progress` | 465–478 | Dictation |
| `student_teacher_links` | 771–784 | User Mgmt |
| `notifications` | 786–798 | Notification |
| `achievements` | 800–812 | Gamification |
| `user_achievements` | 814–825 | Gamification |
| `xp_logs` | 827–834 | Gamification |
| `posts` | 836–856 | Community |
| `comments` | 858–871 | Community |
| `post_likes` | 873–884 | Community |
| `post_bookmarks` | 886–897 | Community |
| `subscriptions` | 899–916 | Billing |
| `payments` | 918–929 | Billing |
| `usage_records` | 931–945 | Billing |
| `pricing_plans` | 947–961 | Billing |

### 1.3 — Core Enums to include

```
Enum UserRole          (lines 963–967)
Enum CardState         (lines 1002–1007)
Enum SubscriptionTier  (lines 1009–1013)
Enum SubscriptionStatus (lines 1015–1021)
Enum PaymentProvider   (lines 1023–1028)
Enum NotificationType  (lines 1030–1041)
Enum PostType          (lines 1043–1047)
```

### 1.4 — Core Refs to include

Copy only the `Ref:` lines that involve **core tables**. Here is the exact list:

```
Ref: decks.userId > users.id [delete: Cascade]
Ref: flashcards.deckId > decks.id [delete: Cascade]
Ref: flashcards.cardTypeId > card_types.id
Ref: flashcard_reviews.flashcardId > flashcards.id [delete: Cascade]
Ref: card_type_fields.cardTypeId > card_types.id [delete: Cascade]
Ref: card_templates.cardTypeId > card_types.id [delete: Cascade]
Ref: shared_decks.publisherId > users.id [delete: Cascade]
Ref: question_notes.userId > users.id [delete: Cascade]
Ref: shadowing_videos.userId > users.id [delete: Cascade]
Ref: shadowing_folders.userId > users.id [delete: Cascade]
Ref: shadowing_progress.userId > users.id [delete: Cascade]
Ref: dictation_videos.userId > users.id [delete: Cascade]
Ref: dictation_folders.userId > users.id [delete: Cascade]
Ref: dictation_progress.userId > users.id [delete: Cascade]
Ref: student_teacher_links.studentId > users.id [delete: Cascade]
Ref: student_teacher_links.teacherId > users.id [delete: Cascade]
Ref: notifications.userId > users.id [delete: Cascade]
Ref: user_achievements.userId > users.id [delete: Cascade]
Ref: user_achievements.achievementId > achievements.id [delete: Cascade]
Ref: xp_logs.userId > users.id [delete: Cascade]
Ref: posts.authorId > users.id [delete: Cascade]
Ref: comments.postId > posts.id [delete: Cascade]
Ref: comments.authorId > users.id [delete: Cascade]
Ref: comments.parentId - comments.id [delete: Cascade]
Ref: post_likes.postId > posts.id [delete: Cascade]
Ref: post_likes.userId > users.id [delete: Cascade]
Ref: post_bookmarks.postId > posts.id [delete: Cascade]
Ref: post_bookmarks.userId > users.id [delete: Cascade]
Ref: subscriptions.userId - users.id [delete: Cascade]
Ref: payments.subscriptionId > subscriptions.id [delete: Cascade]
Ref: usage_records.subscriptionId > subscriptions.id [delete: Cascade]
```

### 1.5 — File structure for `core.dbml`

Organize in this order, with comment headers separating each section:

```
//// --- CORE DOMAIN (Platform Features) ---

// ====== SHARED ======
Table users { ... }

// ====== FLASHCARD SYSTEM ======
Table decks { ... }
Table flashcards { ... }
Table flashcard_reviews { ... }
Table card_types { ... }
Table card_type_fields { ... }
Table card_templates { ... }
Table shared_decks { ... }

// ====== EXAM NOTES ======
Table question_notes { ... }

// ====== SHADOWING ======
Table shadowing_videos { ... }
Table shadowing_folders { ... }
Table shadowing_progress { ... }

// ====== DICTATION ======
Table dictation_videos { ... }
Table dictation_folders { ... }
Table dictation_progress { ... }

// ====== USER MANAGEMENT ======
Table student_teacher_links { ... }
Table notifications { ... }

// ====== GAMIFICATION ======
Table achievements { ... }
Table user_achievements { ... }
Table xp_logs { ... }

// ====== COMMUNITY ======
Table posts { ... }
Table comments { ... }
Table post_likes { ... }
Table post_bookmarks { ... }

// ====== BILLING ======
Table subscriptions { ... }
Table payments { ... }
Table usage_records { ... }
Table pricing_plans { ... }

// ====== ENUMS ======
Enum UserRole { ... }
Enum CardState { ... }
Enum SubscriptionTier { ... }
Enum SubscriptionStatus { ... }
Enum PaymentProvider { ... }
Enum NotificationType { ... }
Enum PostType { ... }

// ====== RELATIONSHIPS ======
Ref: ...
```

---

## Phase 2: Create `ielts.dbml`

Create `ielts.dbml` in the same folder. It contains all **IELTS intensive exams, foundation learning (vocab/grammar/pronunciation), IELTS basic skills, IELTS advanced practice, and IELTS profiles**.

### 2.1 — Shared anchor table

Copy the same `users` table here too (lines 5–49). This is needed because all progress/session tables FK back to `users`.

### 2.2 — IELTS Tables to include

| Table name | Lines in schema.dbml | Domain |
|---|---|---|
| `exams` | 51–64 | Intensive Exam |
| `exam_sessions` | 66–81 | Intensive Exam |
| `results` | 83–98 | Intensive Exam |
| `vocabulary_books` | 102–111 | Foundation Vocab |
| `vocabulary_units` | 113–127 | Foundation Vocab |
| `vocabulary_words` | 129–143 | Foundation Vocab |
| `vocabulary_questions` | 145–154 | Foundation Vocab |
| `vocabulary_progress` | 156–173 | Foundation Vocab |
| `grammar_books` | 175–187 | Foundation Grammar |
| `grammar_units` | 189–200 | Foundation Grammar |
| `grammar_exercises` | 202–212 | Foundation Grammar |
| `grammar_progress` | 214–230 | Foundation Grammar |
| `pronunciation_sounds` | 232–249 | Foundation Pronunciation |
| `sound_example_words` | 251–259 | Foundation Pronunciation |
| `pronunciation_progress` | 261–277 | Foundation Pronunciation |
| `ielts_skills` | 480–491 | IELTS Basic |
| `ielts_lessons` | 493–509 | IELTS Basic |
| `ielts_listening_exercises` | 511–526 | IELTS Basic |
| `ielts_reading_exercises` | 528–543 | IELTS Basic |
| `ielts_basic_progress` | 545–566 | IELTS Basic |
| `ielts_writing_exercises` | 568–585 | IELTS Basic |
| `ielts_writing_user_answers` | 587–602 | IELTS Basic |
| `ielts_speaking_exercises` | 604–621 | IELTS Basic |
| `ielts_practice_listening_parts` | 623–634 | IELTS Practice |
| `ielts_practice_sessions` | 636–647 | IELTS Practice |
| `ielts_practice_reading_parts` | 649–660 | IELTS Practice |
| `ielts_practice_reading_sessions` | 662–673 | IELTS Practice |
| `ielts_advanced_writing_prompts` | 675–694 | IELTS Advanced |
| `ielts_advanced_writing_sessions` | 696–710 | IELTS Advanced |
| `ielts_advanced_speaking_parts` | 712–732 | IELTS Advanced |
| `ielts_advanced_speaking_sessions` | 734–748 | IELTS Advanced |
| `ielts_profiles` | 750–769 | IELTS Profile |

### 2.3 — IELTS Enums to include

```
Enum UserRole                    (lines 963–967)   ← shared, also in core
Enum IeltsIntensiveExamType      (lines 969–976)
Enum Difficulty                  (lines 978–982)
Enum IeltsIntensiveSessionStatus (lines 984–992)
Enum PronunciationMastery        (lines 996–1000)
```

### 2.4 — IELTS Refs to include

```
Ref: exam_sessions.userId > users.id [delete: Cascade]
Ref: exam_sessions.examId > exams.id [delete: Cascade]
Ref: results.userId > users.id [delete: Cascade]
Ref: results.sessionId - exam_sessions.id [delete: Cascade]
Ref: vocabulary_units.bookId > vocabulary_books.id [delete: Cascade]
Ref: vocabulary_words.unitId > vocabulary_units.id [delete: Cascade]
Ref: vocabulary_questions.unitId > vocabulary_units.id [delete: Cascade]
Ref: vocabulary_progress.userId > users.id [delete: Cascade]
Ref: vocabulary_progress.unitId > vocabulary_units.id [delete: Cascade]
Ref: grammar_units.bookId > grammar_books.id [delete: Cascade]
Ref: grammar_exercises.unitId > grammar_units.id [delete: Cascade]
Ref: grammar_progress.userId > users.id [delete: Cascade]
Ref: grammar_progress.unitId > grammar_units.id [delete: Cascade]
Ref: sound_example_words.soundId > pronunciation_sounds.id [delete: Cascade]
Ref: pronunciation_progress.userId > users.id [delete: Cascade]
Ref: pronunciation_progress.soundId > pronunciation_sounds.id [delete: Cascade]
Ref: ielts_lessons.skillId > ielts_skills.id [delete: Cascade]
Ref: ielts_listening_exercises.skillId > ielts_skills.id [delete: Cascade]
Ref: ielts_listening_exercises.lessonId > ielts_lessons.id [delete: Cascade]
Ref: ielts_reading_exercises.skillId > ielts_skills.id [delete: Cascade]
Ref: ielts_reading_exercises.lessonId > ielts_lessons.id [delete: Cascade]
Ref: ielts_basic_progress.userId > users.id [delete: Cascade]
Ref: ielts_basic_progress.lessonId > ielts_lessons.id [delete: Cascade]
Ref: ielts_basic_progress.listeningExerciseId > ielts_listening_exercises.id [delete: Cascade]
Ref: ielts_basic_progress.readingExerciseId > ielts_reading_exercises.id [delete: Cascade]
Ref: ielts_basic_progress.writingExerciseId > ielts_writing_exercises.id [delete: Cascade]
Ref: ielts_basic_progress.speakingExerciseId > ielts_speaking_exercises.id [delete: Cascade]
Ref: ielts_writing_exercises.skillId > ielts_skills.id [delete: Cascade]
Ref: ielts_writing_exercises.lessonId > ielts_lessons.id [delete: Cascade]
Ref: ielts_writing_user_answers.userId > users.id [delete: Cascade]
Ref: ielts_writing_user_answers.writingExerciseId > ielts_writing_exercises.id [delete: Cascade]
Ref: ielts_speaking_exercises.skillId > ielts_skills.id [delete: Cascade]
Ref: ielts_speaking_exercises.lessonId > ielts_lessons.id [delete: Cascade]
Ref: ielts_practice_sessions.partId > ielts_practice_listening_parts.id [delete: Cascade]
Ref: ielts_practice_sessions.userId > users.id [delete: Cascade]
Ref: ielts_practice_reading_sessions.partId > ielts_practice_reading_parts.id [delete: Cascade]
Ref: ielts_practice_reading_sessions.userId > users.id [delete: Cascade]
Ref: ielts_advanced_writing_sessions.userId > users.id [delete: Cascade]
Ref: ielts_advanced_writing_sessions.promptId > ielts_advanced_writing_prompts.id [delete: Cascade]
Ref: ielts_advanced_speaking_sessions.userId > users.id [delete: Cascade]
Ref: ielts_advanced_speaking_sessions.partId > ielts_advanced_speaking_parts.id [delete: Cascade]
Ref: ielts_profiles.userId - users.id [delete: Cascade]
```

### 2.5 — File structure for `ielts.dbml`

```
//// --- IELTS DOMAIN ---

// ====== SHARED ======
Table users { ... }

// ====== INTENSIVE EXAM ======
Table exams { ... }
Table exam_sessions { ... }
Table results { ... }

// ====== FOUNDATION: VOCABULARY ======
Table vocabulary_books { ... }
Table vocabulary_units { ... }
Table vocabulary_words { ... }
Table vocabulary_questions { ... }
Table vocabulary_progress { ... }

// ====== FOUNDATION: GRAMMAR ======
Table grammar_books { ... }
Table grammar_units { ... }
Table grammar_exercises { ... }
Table grammar_progress { ... }

// ====== FOUNDATION: PRONUNCIATION ======
Table pronunciation_sounds { ... }
Table sound_example_words { ... }
Table pronunciation_progress { ... }

// ====== IELTS BASIC SKILLS ======
Table ielts_skills { ... }
Table ielts_lessons { ... }
Table ielts_listening_exercises { ... }
Table ielts_reading_exercises { ... }
Table ielts_writing_exercises { ... }
Table ielts_writing_user_answers { ... }
Table ielts_speaking_exercises { ... }
Table ielts_basic_progress { ... }

// ====== IELTS PRACTICE ======
Table ielts_practice_listening_parts { ... }
Table ielts_practice_sessions { ... }
Table ielts_practice_reading_parts { ... }
Table ielts_practice_reading_sessions { ... }

// ====== IELTS ADVANCED ======
Table ielts_advanced_writing_prompts { ... }
Table ielts_advanced_writing_sessions { ... }
Table ielts_advanced_speaking_parts { ... }
Table ielts_advanced_speaking_sessions { ... }

// ====== IELTS PROFILE ======
Table ielts_profiles { ... }

// ====== ENUMS ======
Enum UserRole { ... }
Enum IeltsIntensiveExamType { ... }
Enum Difficulty { ... }
Enum IeltsIntensiveSessionStatus { ... }
Enum PronunciationMastery { ... }

// ====== RELATIONSHIPS ======
Ref: ...
```

---

## Phase 3: Validation

After creating both files, verify:

1. **Table count check**: `core.dbml` should have **28 tables** (27 core + 1 shared `users`). `ielts.dbml` should have **34 tables** (33 IELTS + 1 shared `users`). Together (minus the duplicated `users`): **60 unique tables** — same as the original.

2. **Ref count check**: The original has **67 Ref lines** (lines 1049–1195, skipping blanks). `core.dbml` should have **31 Refs**. `ielts.dbml` should have **36 Refs**. Total: **67** ✅

3. **Enum count check**: The original has **11 Enums**. `core.dbml` has **7 Enums**. `ielts.dbml` has **5 Enums**. `UserRole` is shared (in both). Unique total: **11** ✅

4. **No orphaned references**: Every `Ref:` line should reference tables that exist **within the same file**. Since `users` is duplicated into both files, all FK chains remain valid within each file.

5. **Content integrity**: Each table's body (columns, indexes) must be **byte-for-byte identical** to the original `schema.dbml`. Do not rename, reorder columns, or change any syntax.

---

## Phase 4: Cleanup

1. Keep the original `schema.dbml` as-is (backup / single-source-of-truth).
2. The final folder structure should be:

```
3. relational-diagram/
├── schema.dbml              ← original (keep)
├── core.dbml                ← NEW
├── ielts.dbml               ← NEW
├── SUGGESTIONS.md           ← existing
└── IMPLEMENTATION_PLAN.md   ← this file
```
