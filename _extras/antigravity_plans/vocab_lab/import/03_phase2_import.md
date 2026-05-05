# Phase 2 — Import Deck

> **Goal:** Allow users to import a `.lexon` JSON file to create a new deck with all cards.
>
> **Dependencies:** Phase 1 (shares the `.lexon` format definition)
>
> **Estimated effort:** ~3-4 hours

---

## Overview

Add an "Import Deck" button next to "Create Deck" in the DecksTab. Users select a `.lexon` file, the backend validates the format, creates the CardType (or matches an existing one), creates the Deck, and bulk-inserts all flashcards.

---

## Step 1: Backend — Import DTO

**File:** `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts`

Add at the bottom of the file:

```typescript
// ==================== IMPORT/EXPORT DTOs ====================

export class ImportDeckDto {
  @IsInt()
  version: number;

  @IsString()
  exportedAt: string;

  @IsObject()
  deck: { name: string };

  @IsObject()
  @IsOptional()
  cardType: {
    name: string;
    description?: string | null;
    fields: Array<{ name: string; order: number; fieldType: string }>;
    templates: Array<{
      name: string;
      frontFieldNames: string[];
      backFieldNames: string[];
      fieldStyles?: Record<string, any>;
      cardStyle?: any;
    }>;
  } | null;

  @IsArray()
  cards: Array<{
    fieldValues: Record<string, string>;
    tags?: string[];
    fieldStyles?: Record<string, any> | null;
    cardStyle?: any | null;
  }>;
}
```

---

## Step 2: Backend — Import Service Method

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

Add a new method `importDeck(userId: string, dto: ImportDeckDto)`:

```typescript
async importDeck(userId: string, dto: ImportDeckDto) {
  // 1. Validate version
  if (dto.version !== 1) {
    throw new BadRequestException(`Unsupported .lexon version: ${dto.version}. Expected version 1.`);
  }

  // 2. Resolve or create CardType
  let cardTypeId: string | null = null;
  const fieldNameToId: Record<string, string> = {};

  if (dto.cardType) {
    // Check if user already has a CardType with the same name and same field structure
    const existingType = await this.prisma.cardType.findFirst({
      where: {
        name: dto.cardType.name,
        OR: [{ userId }, { isBuiltIn: true }],
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    });

    if (existingType) {
      // Verify field structure matches
      const existingFieldNames = existingType.fields.map(f => f.name).sort();
      const importFieldNames = dto.cardType.fields.map(f => f.name).sort();
      const fieldsMatch = JSON.stringify(existingFieldNames) === JSON.stringify(importFieldNames);

      if (fieldsMatch) {
        // Reuse existing card type
        cardTypeId = existingType.id;
        for (const field of existingType.fields) {
          fieldNameToId[field.name] = field.id;
        }
      } else {
        // Create a new card type with a suffixed name to avoid collision
        const newType = await this.createImportedCardType(userId, dto.cardType, fieldNameToId);
        cardTypeId = newType.id;
      }
    } else {
      // Create new card type
      const newType = await this.createImportedCardType(userId, dto.cardType, fieldNameToId);
      cardTypeId = newType.id;
    }
  }

  // 3. Create the Deck
  //    If a deck with the same name exists, append " (Imported)" or a timestamp
  let deckName = dto.deck.name;
  const existingDeck = await this.prisma.deck.findFirst({
    where: { name: deckName, userId },
  });
  if (existingDeck) {
    const timestamp = new Date().toISOString().split('T')[0]; // "2026-05-04"
    deckName = `${deckName} (Imported ${timestamp})`;
  }

  const newDeck = await this.prisma.deck.create({
    data: { userId, name: deckName },
  });

  // 4. Bulk-insert flashcards
  const flashcardData = dto.cards.map(card => {
    // Convert field names back to field IDs
    const fieldValues: Record<string, string> = {};
    for (const [fieldName, value] of Object.entries(card.fieldValues)) {
      const fieldId = fieldNameToId[fieldName] ?? fieldName;
      fieldValues[fieldId] = value;
    }

    // Generate front/back HTML from field values (fallback)
    const frontValue = card.fieldValues['Front'] ?? card.fieldValues['Word'] ?? Object.values(card.fieldValues)[0] ?? '';
    const backValue = card.fieldValues['Back'] ?? card.fieldValues['Meaning'] ?? Object.values(card.fieldValues)[1] ?? '';

    return {
      deckId: newDeck.id,
      front: frontValue,
      back: backValue,
      tags: card.tags ?? [],
      cardTypeId,
      fieldValues,
      fieldStyles: card.fieldStyles ?? undefined,
      cardStyle: card.cardStyle ?? undefined,
      // FSRS fields default to NEW state (Prisma defaults handle this)
    };
  });

  // Use createMany for performance
  const result = await this.prisma.flashcard.createMany({
    data: flashcardData,
  });

  return {
    deckId: newDeck.id,
    deckName: newDeck.name,
    cardTypeId,
    cardsImported: result.count,
  };
}

/**
 * Helper: Create a new CardType from import data and populate fieldNameToId mapping.
 */
private async createImportedCardType(
  userId: string,
  cardTypeData: NonNullable<ImportDeckDto['cardType']>,
  fieldNameToId: Record<string, string>,
) {
  const newType = await this.prisma.cardType.create({
    data: {
      userId,
      name: cardTypeData.name,
      description: cardTypeData.description,
      fields: {
        create: cardTypeData.fields.map(f => ({
          name: f.name,
          order: f.order,
          fieldType: f.fieldType || 'text',
        })),
      },
    },
    include: { fields: { orderBy: { order: 'asc' } } },
  });

  // Populate name→id mapping
  for (const field of newType.fields) {
    fieldNameToId[field.name] = field.id;
  }

  // Create templates
  for (const tmpl of cardTypeData.templates) {
    await this.prisma.cardTemplate.create({
      data: {
        cardTypeId: newType.id,
        name: tmpl.name,
        frontFields: tmpl.frontFieldNames.map(name => fieldNameToId[name]).filter(Boolean),
        backFields: tmpl.backFieldNames.map(name => fieldNameToId[name]).filter(Boolean),
        fieldStyles: tmpl.fieldStyles ?? {},
        cardStyle: tmpl.cardStyle ?? {},
      },
    });
  }

  return newType;
}
```

**Key design decisions:**
- If a CardType with the same name AND same field names already exists → reuse it (no duplicates)
- If name matches but fields differ → create a new one (safe)
- If no match → create new
- Deck name collision → append `(Imported YYYY-MM-DD)` suffix
- `createMany` for bulk insert performance
- All imported cards start as `NEW` state (FSRS defaults)

---

## Step 3: Backend — Import Controller Endpoint

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts`

Add after the export endpoint:

```typescript
@Post('decks/import')
async importDeck(@Request() req: any, @Body() dto: ImportDeckDto) {
  return this.vocabLabService.importDeck(req.user.id, dto);
}
```

**Important:** Add `ImportDeckDto` to the imports from `./dto/vocab-lab.dto`:

```typescript
import {
  // ... existing imports
  ImportDeckDto,
} from "./dto/vocab-lab.dto";
```

**API:** `POST /api/vocab-lab/decks/import`
**Auth:** JWT required
**Body:** The complete `.lexon` JSON payload
**Response:** `{ deckId, deckName, cardTypeId, cardsImported }`

---

## Step 4: Frontend — API Client Method

**File:** `frontend-web/src/services/vocabLab.api.ts`

Add after the `exportDeck` method:

```typescript
importDeck: async (lexonData: any) => {
  const { data } = await api.post<{
    deckId: string;
    deckName: string;
    cardTypeId: string | null;
    cardsImported: number;
  }>('/vocab-lab/decks/import', lexonData);
  return data;
},
```

---

## Step 5: Frontend — Import Button and File Handler in DecksTab

**File:** `frontend-web/src/app/vocab-lab/components/DecksTab.tsx`

### 5.1 — Add state and refs

Add after existing state declarations:

```typescript
const [isImporting, setIsImporting] = useState(false);
const [importError, setImportError] = useState<string | null>(null);
const [importSuccess, setImportSuccess] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

Add `useRef` to the React imports.

### 5.2 — Add import handler

```typescript
const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Reset file input so same file can be selected again
  e.target.value = '';

  // Validate file extension
  if (!file.name.endsWith('.lexon') && !file.name.endsWith('.json')) {
    setImportError('Please select a .lexon or .json file');
    return;
  }

  setIsImporting(true);
  setImportError(null);
  setImportSuccess(null);

  try {
    const text = await file.text();
    const lexonData = JSON.parse(text);

    // Basic client-side validation
    if (!lexonData.version || !lexonData.deck?.name || !Array.isArray(lexonData.cards)) {
      throw new Error('Invalid .lexon file format');
    }

    const result = await vocabLabApi.importDeck(lexonData);
    setImportSuccess(`Imported "${result.deckName}" with ${result.cardsImported} cards`);
    await fetchDecks(); // Refresh deck list
  } catch (error: any) {
    console.error('Import failed:', error);
    if (error instanceof SyntaxError) {
      setImportError('File is not valid JSON');
    } else {
      setImportError(error?.response?.data?.message || error?.message || 'Import failed');
    }
  } finally {
    setIsImporting(false);
  }
};
```

### 5.3 — Add hidden file input and Import button

Add the hidden file input somewhere in the JSX (e.g., right before the Create Deck button section):

```tsx
{/* Hidden file input for import */}
<input
  ref={fileInputRef}
  type="file"
  accept=".lexon,.json"
  onChange={handleFileSelected}
  className="hidden"
/>
```

Add an Import button **next to** the existing Create Deck button (~line 160-170):

```tsx
<div className="text-center mt-6 flex items-center justify-center gap-3">
  <button
    onClick={handleImportClick}
    disabled={isImporting}
    className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
  >
    {isImporting ? (
      <svg className="h-5 w-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    )}
    {isImporting ? 'Importing...' : 'Import Deck'}
  </button>

  <button
    onClick={() => setShowCreateModal(true)}
    className="inline-flex items-center px-6 py-2.5 bg-primary rounded-lg shadow-sm text-gray-900 font-medium hover:bg-primary/80 transition-all"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
    Create Deck
  </button>
</div>
```

### 5.4 — Add success/error toast messages

Add right after the deck table `</div>` and before the study summary:

```tsx
{/* Import feedback messages */}
{importSuccess && (
  <div className="w-full max-w-4xl mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 text-sm flex items-center justify-between">
    <span>✅ {importSuccess}</span>
    <button onClick={() => setImportSuccess(null)} className="text-green-500 hover:text-green-700 ml-2">✕</button>
  </div>
)}
{importError && (
  <div className="w-full max-w-4xl mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-sm flex items-center justify-between">
    <span>❌ {importError}</span>
    <button onClick={() => setImportError(null)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
  </div>
)}
```

---

## Step 6: Verify

1. **Export → Import round-trip:**
   - Export the "4000 Essential English Words Book 1" deck
   - Import the downloaded `.lexon` file
   - Verify a new deck "4000 Essential English Words Book 1 (Imported 2026-05-04)" appears
   - Verify card count matches
   - Click into the study view — cards should display correctly with field values

2. **CardType reuse:**
   - Import the same `.lexon` again
   - The "essential" CardType should be **reused** (not duplicated)
   - A new deck with different timestamp suffix should be created

3. **Invalid file handling:**
   - Try importing a random `.txt` file → should show "File is not valid JSON"
   - Try importing a JSON file without `version` field → should show "Invalid .lexon file format"

4. **Empty deck import:**
   - Create a `.lexon` with `cards: []` → should create a deck with 0 cards

---

## Files Modified/Created

| Action | File |
|--------|------|
| **Modified** | `backend-core/src/modules/vocab-lab/dto/vocab-lab.dto.ts` — add `ImportDeckDto` |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` — add `importDeck()` + `createImportedCardType()` |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` — add `POST decks/import` |
| **Modified** | `frontend-web/src/services/vocabLab.api.ts` — add `importDeck()` |
| **Modified** | `frontend-web/src/app/vocab-lab/components/DecksTab.tsx` — add import button + file handler |
