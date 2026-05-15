# Phase 5 — Advanced Import Formats & Marketplace Polish

> **Goal:** Support CSV/TSV import, Anki .apkg import, and polish the community marketplace with ratings, categories, and richer UI.
>
> **Dependencies:** Phase 4 (marketplace must exist)
>
> **Estimated effort:** ~8-10 hours

---

## Overview

This phase adds:
1. **CSV/TSV import** — Import flashcards from spreadsheets (Google Sheets, Excel export)
2. **Anki .apkg import** — Import from Anki's native format (SQLite + zip)
3. **Marketplace polish** — Ratings, categories, featured decks, richer preview
4. **Navigation integration** — Add "Community" tab to Vocab Lab sidebar

---

## Part A: CSV/TSV Import

### A.1 — Backend CSV Import Endpoint

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts`

Add a new endpoint that accepts a multipart file upload:

```typescript
@Post('decks/import-csv')
@UseInterceptors(FileInterceptor('file'))
async importCsv(
  @Request() req: any,
  @UploadedFile() file: Express.Multer.File,
  @Body('deckName') deckName: string,
  @Body('separator') separator?: string, // 'comma' | 'tab' | 'semicolon'
  @Body('hasHeader') hasHeader?: string,  // 'true' | 'false'
) {
  if (!file) throw new BadRequestException('File is required');
  if (!deckName) throw new BadRequestException('Deck name is required');
  return this.vocabLabService.importCsv(
    req.user.id,
    file.buffer.toString('utf-8'),
    deckName,
    separator || 'comma',
    hasHeader !== 'false',
  );
}
```

### A.2 — Backend CSV Import Service

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

```typescript
async importCsv(
  userId: string,
  csvContent: string,
  deckName: string,
  separator: string,
  hasHeader: boolean,
) {
  // 1. Parse CSV
  const sep = separator === 'tab' ? '\t' : separator === 'semicolon' ? ';' : ',';
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) throw new BadRequestException('CSV file is empty');

  // 2. Extract headers or generate defaults
  let headers: string[];
  let dataStartIndex: number;

  if (hasHeader) {
    headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
    dataStartIndex = 1;
  } else {
    // Default: first column = Front, second = Back
    const colCount = lines[0].split(sep).length;
    headers = colCount === 2 ? ['Front', 'Back'] :
              Array.from({ length: colCount }, (_, i) => `Field ${i + 1}`);
    dataStartIndex = 0;
  }

  if (headers.length < 2) {
    throw new BadRequestException('CSV must have at least 2 columns');
  }

  // 3. Determine or create CardType
  //    If headers match "Front"/"Back" → use built-in Basic type
  //    Otherwise → create a custom type matching the CSV columns
  let cardTypeId: string;
  const fieldNameToId: Record<string, string> = {};

  const isBasic = headers.length === 2 &&
    headers[0].toLowerCase() === 'front' &&
    headers[1].toLowerCase() === 'back';

  if (isBasic) {
    cardTypeId = await this.ensureBasicCardType();
    const basicType = await this.prisma.cardType.findUnique({
      where: { id: cardTypeId },
      include: { fields: true },
    });
    for (const f of basicType!.fields) {
      fieldNameToId[f.name] = f.id;
    }
  } else {
    // Create custom card type from CSV headers
    const newType = await this.prisma.cardType.create({
      data: {
        userId,
        name: `CSV Import - ${deckName}`,
        fields: {
          create: headers.map((name, i) => ({
            name,
            order: i,
            fieldType: 'text',
          })),
        },
      },
      include: { fields: true },
    });
    cardTypeId = newType.id;
    for (const f of newType.fields) {
      fieldNameToId[f.name] = f.id;
    }
    // Create default template
    await this.prisma.cardTemplate.create({
      data: {
        cardTypeId,
        name: 'Card 1',
        frontFields: [newType.fields[0].id],
        backFields: newType.fields.slice(1).map(f => f.id),
      },
    });
  }

  // 4. Create Deck
  const deck = await this.prisma.deck.create({
    data: { userId, name: deckName },
  });

  // 5. Parse rows and create flashcards
  const flashcardData = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], sep);
    if (values.length < 2) continue; // Skip malformed rows

    const fieldValues: Record<string, string> = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      const fieldId = fieldNameToId[headers[j]];
      if (fieldId) fieldValues[fieldId] = values[j];
    }

    flashcardData.push({
      deckId: deck.id,
      front: values[0] || '',
      back: values[1] || '',
      tags: [],
      cardTypeId,
      fieldValues,
    });
  }

  const result = await this.prisma.flashcard.createMany({ data: flashcardData });

  return {
    deckId: deck.id,
    deckName: deck.name,
    cardTypeId,
    cardsImported: result.count,
    headers,
  };
}
```

Add a CSV line parser helper (handles quoted values):

```typescript
function parseCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === sep && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
```

### A.3 — Frontend CSV Import UI

**File:** `frontend-web/src/app/vocab-lab/components/ImportCsvModal.tsx` (create new)

A modal with:
- File picker (accepts `.csv`, `.tsv`, `.txt`)
- Separator selector (Comma, Tab, Semicolon) — auto-detect from file extension
- "First row is header" checkbox (default: true)
- Deck name input
- Preview table showing first 5 rows parsed
- Import button

---

## Part B: Anki .apkg Import (Optional — Advanced)

> [!NOTE]
> This is the most complex part. `.apkg` files are SQLite databases inside a ZIP archive. Consider making this a stretch goal.

### B.1 — Backend Anki Import Endpoint

The .apkg format contains:
- `collection.anki2` — SQLite database with tables: `col`, `notes`, `cards`, `revlog`
- `media` — JSON mapping of filenames to media files in the archive

**Steps:**
1. Accept `.apkg` file upload
2. Unzip in memory using a library like `adm-zip` or `unzipper`
3. Read the SQLite database using `better-sqlite3` or `sql.js`
4. Extract notes (→ flashcards) and their fields
5. Extract media files and upload to CDN
6. Map to the `.lexon` format
7. Use the existing `importDeck` method

**Packages needed:**
```bash
npm install adm-zip sql.js
```

This is complex enough to warrant its own sub-plan if you decide to pursue it.

---

## Part C: Marketplace Polish

### C.1 — Add "Community" Link to Vocab Lab Navigation

**File:** `frontend-web/src/app/vocab-lab/page.tsx`

The current Vocab Lab page has a left sidebar with tabs: Decks, Add, Browse, Stats. Add a new tab:

```tsx
{ key: 'community', label: 'Community', icon: '🌍' }
```

When clicked, navigate to `/vocab-lab/community` page (created in Phase 4).

### C.2 — Featured Decks Section

In the community page, add a horizontal carousel at the top showing "Featured" or "Most Popular" decks:

```
┌─────────────────────────────────────────────────────────┐
│ 🔥 Featured Decks                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ 4000     │ │ IELTS    │ │ TOEFL    │ │ Academic │    │
│ │ Essential│ │ Vocab    │ │ Advanced │ │ Words    │    │
│ │ 123 cards│ │ 85 cards │ │ 200 cards│ │ 150 cards│    │
│ │ ↓45      │ │ ↓23      │ │ ↓12      │ │ ↓8       │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

Query: `browseSharedDecks({ sort: 'popular', limit: 8 })`

### C.3 — Category Tags

Pre-define popular category tags:

```typescript
const COMMUNITY_CATEGORIES = [
  'English', 'IELTS', 'TOEFL', 'TOEIC', 'Academic',
  'Business', 'Medical', 'Legal', 'Science', 'Daily',
] as const;
```

Show as filter pills above the deck grid:

```
[All] [English] [IELTS] [TOEFL] [Academic] [Business] ...
```

### C.4 — Deck Detail Page (Expandable)

Instead of (or in addition to) inline preview, allow clicking a deck card to see a full detail view with:
- Full description
- Complete field list
- 10 preview cards (scrollable)
- Publisher profile link
- Import button
- Import count + date published

This can be a modal or a separate route `/vocab-lab/community/[id]`.

### C.5 — "My Published Decks" Tab

Add a tab/section in the community page for logged-in users to manage their own published decks:
- See all their published decks
- Toggle published/unpublished
- See import counts
- Delete published decks

---

## Part D: Import Format Selection

### D.1 — Unified Import Button with Format Dropdown

Replace the single "Import Deck" button with a dropdown:

```
┌─────────────────┐
│ ▼ Import Deck   │
├─────────────────┤
│ 📄 .lexon File  │
│ 📊 CSV / TSV    │
│ 📦 Anki (.apkg) │
│ 🌍 From Community│
└─────────────────┘
```

- `.lexon` → Opens ImportDeckModal (Phase 3)
- `CSV / TSV` → Opens ImportCsvModal (this phase)
- `Anki (.apkg)` → Opens Anki import flow (if implemented)
- `From Community` → Navigates to `/vocab-lab/community`

---

## Verify

1. **CSV import:**
   - Create a CSV: `Word,IPA,Meaning\ndog,/dɒɡ/,a domestic animal\ncat,/kæt/,a small furry animal`
   - Import with header row → creates deck with 2 cards
   - Verify card type has fields: Word, IPA, Meaning
   - Import same CSV without header row → fields named "Field 1", "Field 2", "Field 3"

2. **Tab-separated:**
   - Change separator to Tab → works with `.tsv` files

3. **Marketplace polish:**
   - Community page shows featured decks
   - Category filter pills work
   - "My Published" section shows user's published decks

---

## Files Modified/Created

| Action | File |
|--------|------|
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` — add CSV import endpoint |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` — add `importCsv()` method |
| **Created** | `frontend-web/src/app/vocab-lab/components/ImportCsvModal.tsx` — CSV import modal |
| **Modified** | `frontend-web/src/app/vocab-lab/components/DecksTab.tsx` — unified import dropdown |
| **Modified** | `frontend-web/src/app/vocab-lab/page.tsx` — add Community tab |
| **Modified** | `frontend-web/src/app/vocab-lab/community/page.tsx` — featured decks, categories, My Published |
| **Modified** | `frontend-web/src/services/vocabLab.api.ts` — add `importCsv()` |
