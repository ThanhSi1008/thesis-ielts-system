# Stage 2 — Database Schema

> **File:** `backend-core/prisma/schema.prisma` (998 lines, 35+ models)
> **Provider:** PostgreSQL 16, port 5433
> **ORM:** Prisma 5.x — all queries go through `PrismaService`

---

## Model Map (grouped by domain)

### Authentication & Users
| Model | Table | Key Fields | Relations |
|-------|-------|------------|-----------|
| `User` | `users` | id, email, password, role (UserRole), firstName, lastName | Has many: ExamSession, Result, Deck, Progress models, Notifications |
| `IeltsProfile` | `ielts_profiles` | userId (unique), targetBand, dailyCommitmentMins, examDate, placementScore, currentStreak, longestStreak | Belongs to User |

### Exam System
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `Exam` | `exams` | title, type (ExamType), difficulty, duration, questions (Json), isPublished | Questions stored as JSON blob |
| `ExamSession` | `exam_sessions` | userId, examId, status (SessionStatus), answers (Json), score, startTime, endTime | Tracks an attempt |
| `Result` | `results` | userId, sessionId, overallScore, sectionScores (Json) | Aggregated results |

### IELTS Practice (Intensive)
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `IeltsPracticeListeningPart` | `ielts_practice_listening_parts` | title, partNumber, audioUrl, transcript (Json), content (Json), questionTypes[] | Granular listening practice |
| `IeltsPracticeReadingPart` | `ielts_practice_reading_parts` | title, partNumber, passage (Text), content (Json), questionTypes[] | Granular reading practice |
| `IeltsPracticeSession` | `ielts_practice_sessions` | userId, partId, answers (Json), scoreData (Json), totalScore | Links to ListeningPart |
| `IeltsPracticeReadingSession` | `ielts_practice_reading_sessions` | userId, partId, answers (Json), scoreData (Json) | Links to ReadingPart |
| `IeltsBasicProgress` | `ielts_basic_progress` | userId, examType, lessonIndex, answers (Json) | Tracks basic exam progress |
| `IeltsWritingUserAnswer` | `ielts_writing_user_answers` | userId, taskType, topicTitle, userAnswer, aiFeedback (Json), score | AI-graded writing |

### Vocabulary (4000 Essential Words)
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `VocabularyBook` | `vocabulary_books` | name, slug, description, imageUrl, totalUnits | 6 books |
| `VocabularyUnit` | `vocabulary_units` | bookId, title, slug, orderIndex | 30 units per book |
| `VocabularyWord` | `vocabulary_words` | unitId, word, definition, partOfSpeech, exampleSentence, imageUrl, audioUrl | ~20 words per unit |
| `VocabularyExercise` | `vocabulary_exercises` | unitId, type, question, options (Json), correctAnswer | Fill-in, multiple choice |
| `VocabularyReadingPassage` | `vocabulary_reading_passages` | unitId, title, content, questions (Json) | Reading comprehension per unit |
| `VocabularyProgress` | `vocabulary_progress` | userId, unitId, completedExercises, score | Per-user per-unit progress |

### Grammar (145 units)
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `GrammarTopic` | `grammar_topics` | name, slug, description, orderIndex, imageUrl | Groups of related grammar lessons |
| `GrammarLesson` | `grammar_lessons` | topicId, title, slug, orderIndex, content (Json), exercises (Json) | Each lesson has structured content |
| `GrammarProgress` | `grammar_progress` | userId, lessonId, isCompleted, exerciseAnswers (Json), score | Per-user per-lesson |

### Pronunciation
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `PronunciationSound` | `pronunciation_sounds` | symbol, soundType (VOWEL/CONSONANT/DIPHTHONG), exampleWords (Json), audioUrl, videoUrl, mouthDiagram | IPA sounds catalog |
| `PronunciationAttempt` | `pronunciation_attempts` | userId, soundId, audioUrl, transcribedText, score, status | Individual recording attempts |
| `PronunciationProgress` | `pronunciation_progress` | userId, soundId, totalAttempts, bestScore, status, wordProgress (Json) | Aggregated progress per sound |

### Shadowing & Dictation
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `ShadowingVideo` | `shadowing_videos` | title, youtubeId, userId, folderId, subtitles (Json), duration | YouTube-based lessons |
| `ShadowingFolder` | `shadowing_folders` | name, userId | User-created folders |
| `ShadowingDictationProgress` | `shadowing_dictation_progress` | userId, videoId, subtitleIndex, mode, score, userInput, isCorrect | Per-subtitle-line progress |

### Vocab Lab (SRS Flashcards)
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `Deck` | `decks` | userId, name, description | Card container |
| `Flashcard` | `flashcards` | deckId, front, back, tags[], due, stability, difficulty, scheduledDays, reps, lapses, cardState (CardState), fieldValues (Json), fieldStyles (Json) | FSRS-scheduled card |
| `FlashcardReview` | `flashcard_reviews` | flashcardId, rating (1-4), reviewedAt, scheduledDays, elapsedDays, state | Review history log |
| `CardType` | `card_types` | userId, name, description, isBuiltIn | Custom card type definitions |
| `CardTypeField` | `card_type_fields` | cardTypeId, name, order, fieldType, description | Fields within a card type |
| `CardTemplate` | `card_templates` | cardTypeId, name, frontFields[], backFields[], frontHtml, backHtml, css, fieldStyles (Json) | Rendering templates |

### Notes
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `QuestionNote` | `question_notes` | userId, examId, questionIndex, content, tags[] | Notes on exam questions |

### Social & Notifications
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `StudentTeacherLink` | `student_teacher_links` | studentId, teacherId, status | Links students to teachers |
| `Notification` | `notifications` | userId, type (NotificationType), title, body, icon, link, isRead | In-app notifications |

### Learning & Progress
| Model | Table | Key Fields | Notes |
|-------|-------|------------|-------|
| `LearningProgress` | `learning_progress` | userId, materialType, materialId, completedPercentage, lastAccessedAt | Generic progress tracker |

---

## Key Relationships

```
User ──┬── Deck ──── Flashcard ──── FlashcardReview
       ├── ExamSession ──── Result
       ├── VocabularyProgress
       ├── GrammarProgress
       ├── PronunciationAttempt / PronunciationProgress
       ├── ShadowingVideo / ShadowingDictationProgress
       ├── IeltsProfile
       ├── IeltsBasicProgress
       ├── IeltsPracticeSession / IeltsPracticeReadingSession
       ├── IeltsWritingUserAnswer
       ├── Notification
       └── StudentTeacherLink

VocabularyBook ── VocabularyUnit ──┬── VocabularyWord
                                   ├── VocabularyExercise
                                   └── VocabularyReadingPassage

GrammarTopic ── GrammarLesson

PronunciationSound ──┬── PronunciationAttempt
                     └── PronunciationProgress
```

---

## Seed Data Location

All seed data lives in `backend-core/prisma/data/`:
- `vocabulary.ts` — All 6 books × 30 units × ~20 words
- `grammar-topics.ts`, `grammar-lessons.ts` — 145 grammar units
- `pronunciation-sounds.ts` — IPA sounds catalog
- `shadowing-lessons.ts` — YouTube video lessons
- `exams.ts` — Sample IELTS exams
- `ielts-practice-*.ts` — Intensive listening/reading parts

Entry point: `backend-core/prisma/seed.ts` (uses upsert — safe to re-run).

---

## Migration Commands

```bash
cd backend-core

# Create a new migration after schema changes
npx prisma migrate dev --name describe-what-changed

# Regenerate Prisma Client (after schema or migration changes)
npx prisma generate

# Reset DB and re-seed (DESTRUCTIVE)
npx prisma migrate reset

# Seed only
npm run prisma:seed
```
