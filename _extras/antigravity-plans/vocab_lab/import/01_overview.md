# Vocab Lab — Import / Export / Publish Feature

> **Master Plan Overview**
>
> This document is the entry point for implementing Import, Export, and Community Publish features for the Vocab Lab flashcard system. Each phase is in its own file for independent implementation.

---

## Current Architecture Snapshot

### Prisma Models (schema.prisma L525-636)

```
Deck ──1:N──▶ Flashcard ──N:1──▶ CardType ──1:N──▶ CardTypeField
                                      │
                                      └──1:N──▶ CardTemplate
```

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Deck` | `id, userId, name` | User-owned, simple container |
| `Flashcard` | `deckId, front, back, tags[], cardTypeId, fieldValues(Json), fieldStyles(Json), cardStyle(Json)` | FSRS scheduling fields (due, stability, difficulty, reps, lapses, cardState) |
| `CardType` | `id, userId?, name, description, isBuiltIn` | Defines field structure; `userId=null` = built-in |
| `CardTypeField` | `id, cardTypeId, name, order, fieldType('text'\|'media')` | Ordered list of fields |
| `CardTemplate` | `id, cardTypeId, name, frontFields[], backFields[], fieldStyles(Json), cardStyle(Json)` | Display layout config |

### Backend (backend-core/src/modules/vocab-lab/)

| File | Lines | Purpose |
|------|-------|---------|
| `vocab-lab.controller.ts` | 223 | 22 REST endpoints, all `@UseGuards(JwtAuthGuard)` |
| `vocab-lab.service.ts` | 942 | All business logic: CRUD Decks/Cards/CardTypes, FSRS reviews, stats |
| `dto/vocab-lab.dto.ts` | 174 | class-validator DTOs |

### Frontend (frontend-web/src/)

| File | Purpose |
|------|---------|
| `services/vocabLab.api.ts` | Axios-based API client, 22 methods |
| `app/vocab-lab/components/DecksTab.tsx` | Deck list + create/delete (236 lines) |
| `app/vocab-lab/components/AddCardTab.tsx` | Card creation form |
| `app/vocab-lab/components/BrowseTab.tsx` | Card browser + editor |
| `types/index.ts` L306-466 | All TypeScript interfaces |

### Design System
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#FFC600` | Buttons, active states |
| Dark bg | `dark:bg-gray-900` | Dark mode panels |
| Border | `border-gray-100 dark:border-gray-800` | Card borders |
| Radius | `rounded-xl` | Cards/modals |

---

## Feature Summary

### 1. Export Deck
A user can export any of their decks as a `.lexon` JSON file containing:
- Deck metadata (name)
- CardType definition (fields, templates, styles)
- All flashcards (field values, tags, styles) — **without** FSRS scheduling data

### 2. Import Deck
A user can import a `.lexon` file which:
- Creates (or reuses) the matching CardType with its fields and templates
- Creates a new Deck with the imported name
- Bulk-inserts all flashcards with fresh FSRS state (NEW)

### 3. Publish Deck (Community Marketplace)
A user can publish a deck to a shared library. Other users can:
- Browse published decks with search, tags, and popularity sorting
- Preview card content before importing
- One-click import into their own Vocab Lab

---

## Portable Exchange Format (`.lexon`)

```jsonc
{
  "version": 1,
  "exportedAt": "2026-05-04T10:00:00Z",
  "deck": {
    "name": "4000 Essential English Words Book 1"
  },
  "cardType": {
    "name": "essential",
    "description": "Vocabulary card with word, IPA, meaning, example, image, audio",
    "fields": [
      { "name": "Word", "order": 0, "fieldType": "text" },
      { "name": "IPA", "order": 1, "fieldType": "text" },
      { "name": "Meaning", "order": 2, "fieldType": "text" },
      { "name": "Example", "order": 3, "fieldType": "text" },
      { "name": "Image", "order": 4, "fieldType": "text" },
      { "name": "Audio", "order": 5, "fieldType": "media" }
    ],
    "templates": [
      {
        "name": "Card 1: Word → Meaning",
        "frontFieldNames": ["Image", "Word"],
        "backFieldNames": ["Word", "IPA", "Meaning", "Example", "Audio"],
        "fieldStyles": {},
        "cardStyle": {}
      }
    ]
  },
  "cards": [
    {
      "fieldValues": {
        "Word": "afraid",
        "IPA": "/əˈfreɪd/",
        "Meaning": "feeling fear; scared",
        "Example": "The boy is afraid of spiders.",
        "Image": "<img src=\"https://...\" />",
        "Audio": "https://..."
      },
      "tags": ["vocab-abc123"],
      "fieldStyles": null,
      "cardStyle": null
    }
  ]
}
```

> **Key design decisions:**
> - Field references in templates use **field names** (not UUIDs) for portability
> - FSRS data is stripped — imported cards start fresh as `NEW`
> - `front`/`back` HTML fields are NOT included (they're derived from fieldValues + template)
> - Media URLs are preserved as-is (they point to your CDN)

---

## New Prisma Model: `SharedDeck` (Phase 4)

```prisma
model SharedDeck {
  id            String   @id @default(uuid())
  publisherId   String
  deckName      String
  description   String?  @db.Text
  tags          String[] @default([])
  cardCount     Int
  cardTypeName  String
  previewCards  Json     // First 5 cards for preview
  fullData      Json     // Complete .lexon payload
  importCount   Int      @default(0)
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  publisher     User     @relation(fields: [publisherId], references: [id], onDelete: Cascade)

  @@map("shared_decks")
}
```

---

## Phase Map

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_export.md` | Backend export endpoint + Frontend export button | None |
| **Phase 2** | `03_phase2_import.md` | Backend import endpoint + Frontend import modal | Phase 1 (shares format) |
| **Phase 3** | `04_phase3_import_ui.md` | Polished import modal with preview, conflict resolution | Phase 2 |
| **Phase 4** | `05_phase4_publish.md` | SharedDeck model, publish flow, community browse page | Phase 1 + 2 |
| **Phase 5** | `06_phase5_polish.md` | Anki .apkg import, CSV import, search/filter for marketplace | Phase 4 |

```
Phase 1 (Export) ──▶ Phase 2 (Import) ──▶ Phase 3 (Import UI Polish)
     │                      │
     └────────┬─────────────┘
              ▼
      Phase 4 (Publish/Marketplace) ──▶ Phase 5 (Advanced Import + Polish)
```
