# Phase 4 — Publish & Community Marketplace

> **Goal:** Allow users to publish their decks for others to browse and import. Create a public marketplace page.
>
> **Dependencies:** Phase 1 (export format) + Phase 2 (import logic)
>
> **Estimated effort:** ~6-8 hours

---

## Overview

This phase introduces:
1. A `SharedDeck` Prisma model to store published decks
2. Backend CRUD for publish/unpublish/browse/import-from-shared
3. A new frontend page `/vocab-lab/community` with a browsable marketplace
4. A "Publish" action on each deck in DecksTab

---

## Step 1: Prisma Schema — SharedDeck Model

**File:** `backend-core/prisma/schema.prisma`

Add after the `CardTemplate` model (around line 636), before the QuestionNote section:

```prisma
// ============================================================
// SHARED DECK MARKETPLACE
// ============================================================

model SharedDeck {
  id            String   @id @default(uuid())
  publisherId   String
  deckName      String
  description   String?  @db.Text
  tags          String[] @default([])
  cardCount     Int
  cardTypeName  String
  fieldNames    String[] @default([])    // e.g., ["Word", "IPA", "Meaning"]
  previewCards  Json                     // First 5 cards for preview
  fullData      Json                     // Complete .lexon payload
  importCount   Int      @default(0)
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  publisher     User     @relation(fields: [publisherId], references: [id], onDelete: Cascade)

  @@map("shared_decks")
}
```

**Also add** to the `User` model relations (around line 48):

```prisma
  sharedDecks                SharedDeck[]
```

**Then run migration:**

```bash
cd backend-core
npx prisma migrate dev --name add_shared_decks
```

---

## Step 2: Backend — SharedDeck DTOs

**File:** `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts`

Add:

```typescript
export class PublishDeckDto {
  @IsString()
  deckId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateSharedDeckDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
```

---

## Step 3: Backend — Publish/Marketplace Service Methods

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

Add these methods:

### 3.1 — publishDeck

```typescript
async publishDeck(userId: string, dto: PublishDeckDto) {
  // 1. Export the deck to get the .lexon payload
  const lexonData = await this.exportDeck(userId, dto.deckId);

  // 2. Check if already published
  const existing = await this.prisma.sharedDeck.findFirst({
    where: {
      publisherId: userId,
      deckName: lexonData.deck.name,
      isPublished: true,
    },
  });
  if (existing) {
    throw new BadRequestException('This deck is already published. Unpublish it first to re-publish.');
  }

  // 3. Build preview (first 5 cards, strip HTML from values)
  const previewCards = lexonData.cards.slice(0, 5).map(card => ({
    fieldValues: Object.fromEntries(
      Object.entries(card.fieldValues).map(([k, v]) => [k, (v as string).replace(/<[^>]*>/g, '').slice(0, 100)])
    ),
  }));

  // 4. Create SharedDeck
  const shared = await this.prisma.sharedDeck.create({
    data: {
      publisherId: userId,
      deckName: lexonData.deck.name,
      description: dto.description ?? null,
      tags: dto.tags ?? [],
      cardCount: lexonData.cards.length,
      cardTypeName: lexonData.cardType?.name ?? 'Basic',
      fieldNames: lexonData.cardType?.fields.map(f => f.name) ?? ['Front', 'Back'],
      previewCards,
      fullData: lexonData,
      importCount: 0,
      isPublished: true,
    },
  });

  return {
    id: shared.id,
    deckName: shared.deckName,
    cardCount: shared.cardCount,
  };
}
```

### 3.2 — unpublishDeck

```typescript
async unpublishDeck(userId: string, sharedDeckId: string) {
  const shared = await this.prisma.sharedDeck.findFirst({
    where: { id: sharedDeckId, publisherId: userId },
  });
  if (!shared) throw new NotFoundException('Shared deck not found');

  return this.prisma.sharedDeck.update({
    where: { id: sharedDeckId },
    data: { isPublished: false },
  });
}
```

### 3.3 — browseSharedDecks (public)

```typescript
async browseSharedDecks(params?: {
  search?: string;
  tag?: string;
  sort?: 'popular' | 'newest' | 'cards';
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = Math.min(params?.limit ?? 20, 50);
  const skip = (page - 1) * limit;

  const where: any = { isPublished: true };

  if (params?.search) {
    where.OR = [
      { deckName: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { cardTypeName: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params?.tag) {
    where.tags = { has: params.tag };
  }

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' }; // default: newest
  if (params?.sort === 'popular') orderBy = { importCount: 'desc' };
  if (params?.sort === 'cards') orderBy = { cardCount: 'desc' };

  const [items, total] = await Promise.all([
    this.prisma.sharedDeck.findMany({
      where,
      select: {
        id: true,
        deckName: true,
        description: true,
        tags: true,
        cardCount: true,
        cardTypeName: true,
        fieldNames: true,
        previewCards: true,
        importCount: true,
        createdAt: true,
        publisher: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    this.prisma.sharedDeck.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

### 3.4 — importFromShared

```typescript
async importFromShared(userId: string, sharedDeckId: string) {
  const shared = await this.prisma.sharedDeck.findFirst({
    where: { id: sharedDeckId, isPublished: true },
  });
  if (!shared) throw new NotFoundException('Shared deck not found');

  // Use the existing importDeck logic with the stored .lexon data
  const result = await this.importDeck(userId, shared.fullData as any);

  // Increment import count
  await this.prisma.sharedDeck.update({
    where: { id: sharedDeckId },
    data: { importCount: { increment: 1 } },
  });

  return result;
}
```

### 3.5 — getMyPublishedDecks

```typescript
async getMyPublishedDecks(userId: string) {
  return this.prisma.sharedDeck.findMany({
    where: { publisherId: userId },
    select: {
      id: true,
      deckName: true,
      description: true,
      tags: true,
      cardCount: true,
      importCount: true,
      isPublished: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## Step 4: Backend — Controller Endpoints

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts`

Add a new section after the MEDIA UPLOAD section:

```typescript
// ==================== COMMUNITY / SHARED DECKS ====================

@Post('community/publish')
async publishDeck(@Request() req: any, @Body() dto: PublishDeckDto) {
  return this.vocabLabService.publishDeck(req.user.id, dto);
}

@Delete('community/:id')
async unpublishDeck(@Request() req: any, @Param('id') id: string) {
  return this.vocabLabService.unpublishDeck(req.user.id, id);
}

@Get('community')
async browseSharedDecks(
  @Query('search') search?: string,
  @Query('tag') tag?: string,
  @Query('sort') sort?: 'popular' | 'newest' | 'cards',
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.vocabLabService.browseSharedDecks({
    search,
    tag,
    sort,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
}

@Post('community/:id/import')
async importFromShared(@Request() req: any, @Param('id') id: string) {
  return this.vocabLabService.importFromShared(req.user.id, id);
}

@Get('community/mine')
async getMyPublishedDecks(@Request() req: any) {
  return this.vocabLabService.getMyPublishedDecks(req.user.id);
}
```

Add the new DTOs to the import statement:

```typescript
import { PublishDeckDto, UpdateSharedDeckDto } from './dto/vocab-lab.dto';
```

---

## Step 5: Frontend — API Client Methods

**File:** `frontend-web/src/services/vocabLab.api.ts`

Add a new section:

```typescript
// ==================== COMMUNITY / SHARED DECKS ====================
publishDeck: async (deckId: string, description?: string, tags?: string[]) => {
  const { data } = await api.post('/vocab-lab/community/publish', { deckId, description, tags });
  return data;
},

unpublishDeck: async (sharedDeckId: string) => {
  const { data } = await api.delete(`/vocab-lab/community/${sharedDeckId}`);
  return data;
},

browseSharedDecks: async (params?: { search?: string; tag?: string; sort?: string; page?: number }) => {
  const { data } = await api.get('/vocab-lab/community', { params });
  return data;
},

importFromShared: async (sharedDeckId: string) => {
  const { data } = await api.post(`/vocab-lab/community/${sharedDeckId}/import`);
  return data;
},

getMyPublishedDecks: async () => {
  const { data } = await api.get('/vocab-lab/community/mine');
  return data;
},
```

---

## Step 6: Frontend Types

**File:** `frontend-web/src/types/index.ts`

Add after the VocabLabStats interface:

```typescript
// ==================== SHARED DECK MARKETPLACE ====================

export interface SharedDeckSummary {
  id: string;
  deckName: string;
  description: string | null;
  tags: string[];
  cardCount: number;
  cardTypeName: string;
  fieldNames: string[];
  previewCards: Array<{ fieldValues: Record<string, string> }>;
  importCount: number;
  createdAt: string;
  publisher: {
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

export interface SharedDeckBrowseResponse {
  items: SharedDeckSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MyPublishedDeck {
  id: string;
  deckName: string;
  description: string | null;
  tags: string[];
  cardCount: number;
  importCount: number;
  isPublished: boolean;
  createdAt: string;
}
```

---

## Step 7: Frontend — Publish Modal

**File:** `frontend-web/src/app/vocab-lab/components/PublishDeckModal.tsx` (create new)

A modal that opens when user clicks "Publish" on a deck:

```
┌──────────────────────────────────────────────────────┐
│  🌍 Publish Deck                                  ✕  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Publishing "4000 Essential English Words Book 1"    │
│  with 123 cards                                      │
│                                                      │
│  Description (optional)                              │
│  ┌──────────────────────────────────────────────┐    │
│  │ A comprehensive vocabulary deck covering     │    │
│  │ essential English words...                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Tags (optional)                                     │
│  ┌──────────────────────────────────────────────┐    │
│  │ [english] [vocabulary] [essential] [+]        │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ℹ This will make your deck visible to all users.    │
│    You can unpublish it at any time.                 │
│                                                      │
│           [Cancel]  [🌍 Publish]                     │
└──────────────────────────────────────────────────────┘
```

### Props:

```typescript
interface PublishDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: { id: string; name: string; totalCards: number } | null;
  onPublished: () => void;
}
```

### Key behaviors:
- Description is a `<textarea>` for multi-line input
- Tags are entered one at a time with Enter key (reuse existing tag input pattern from BrowseCardEditor)
- On submit, call `vocabLabApi.publishDeck(deck.id, description, tags)`
- Show success toast and close modal

---

## Step 8: Frontend — Add Publish Button to DecksTab

**File:** `frontend-web/src/app/vocab-lab/components/DecksTab.tsx`

Add a publish icon button to each deck row, next to export and delete:

```tsx
{/* Publish button */}
<button
  onClick={(e) => { e.stopPropagation(); setDeckToPublish(deck); }}
  className="ml-1 text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all p-1"
  title="Publish Deck"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
  </svg>
</button>
```

---

## Step 9: Frontend — Community Browse Page

**File:** `frontend-web/src/app/vocab-lab/community/page.tsx` (create new)

This is a new Next.js page at `/vocab-lab/community`. It should contain:

### 9.1 — Custom hook: `useCommunityDecks.ts`

**File:** `frontend-web/src/app/vocab-lab/community/useCommunityDecks.ts`

```typescript
export function useCommunityDecks() {
  // State: items, total, page, search, sort, tag, loading
  // Methods: fetchDecks, handleSearch, handleSort, handleImport, handlePageChange
  // Returns all state + methods
}
```

### 9.2 — Page layout

```
┌────────────────────────────────────────────────────────────┐
│  Vocab Lab Community                                       │
│  ┌────────────────────────────────────┐  ┌──────────────┐  │
│  │ 🔍 Search decks...                │  │ Sort: Popular │  │
│  └────────────────────────────────────┘  └──────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📚 4000 Essential English Words Book 1              │   │
│  │ By Thanh Si · 123 cards · 45 imports               │   │
│  │ Card Type: essential · Fields: Word, IPA, Meaning  │   │
│  │ Tags: [english] [vocabulary] [essential]            │   │
│  │                                                     │   │
│  │ Preview:                                            │   │
│  │ afraid · /əˈfreɪd/ · feeling fear; scared          │   │
│  │ agree · /əˈɡriː/ · to think the same way          │   │
│  │                                                     │   │
│  │                            [📥 Import to My Lab]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📚 IELTS Vocabulary Advanced                       │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  [← Prev]  Page 1 of 3  [Next →]                         │
└────────────────────────────────────────────────────────────┘
```

### 9.3 — SharedDeckCard component

**File:** `frontend-web/src/app/vocab-lab/community/SharedDeckCard.tsx`

Props (ISP):

```typescript
interface SharedDeckCardProps {
  deck: SharedDeckSummary;
  onImport: (id: string) => void;
  isImporting: boolean;
}
```

Renders a card with:
- Deck name as title
- Publisher name + avatar
- Card count + import count badges
- Field names list
- Tags as small pills
- Preview: first 2-3 cards showing key field values
- "Import to My Lab" CTA button

---

## Step 10: Verify

1. **Publish flow:**
   - Click publish icon on a deck → modal opens
   - Add description and tags → click Publish
   - Deck appears in `/vocab-lab/community`

2. **Community browse:**
   - Navigate to `/vocab-lab/community`
   - See published decks with previews
   - Search by name → filters results
   - Sort by popular/newest/cards

3. **Import from community:**
   - Click "Import to My Lab" → deck is imported
   - Import count increments
   - New deck appears in user's DecksTab

4. **Unpublish:**
   - User can see their published decks via "My Published" section
   - Click unpublish → deck is hidden from community

---

## Files Modified/Created

| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add `SharedDeck` model + User relation |
| **Created** | Migration file via `prisma migrate dev` |
| **Modified** | `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts` — add `PublishDeckDto`, `UpdateSharedDeckDto` |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` — add 5 community methods |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` — add 5 community endpoints |
| **Modified** | `frontend-web/src/services/vocabLab.api.ts` — add 5 community API methods |
| **Modified** | `frontend-web/src/types/index.ts` — add `SharedDeckSummary`, `SharedDeckBrowseResponse`, `MyPublishedDeck` |
| **Created** | `frontend-web/src/app/vocab-lab/components/PublishDeckModal.tsx` |
| **Modified** | `frontend-web/src/app/vocab-lab/components/DecksTab.tsx` — add publish button |
| **Created** | `frontend-web/src/app/vocab-lab/community/page.tsx` — community browse page |
| **Created** | `frontend-web/src/app/vocab-lab/community/useCommunityDecks.ts` — data hook |
| **Created** | `frontend-web/src/app/vocab-lab/community/SharedDeckCard.tsx` — deck card component |
