# Phase 1 — Export Deck

> **Goal:** Allow users to export any deck as a portable `.lexon` JSON file.
>
> **Dependencies:** None (this is the first phase)
>
> **Estimated effort:** ~2-3 hours

---

## Overview

Add an "Export" button to each deck row in the DecksTab. When clicked, the backend serializes the entire deck (with its CardType, fields, templates, and all flashcards) into the `.lexon` portable format and returns it as a downloadable JSON file.

---

## Step 1: Backend — Export Service Method

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

Add a new method `exportDeck(userId: string, deckId: string)`:

```typescript
async exportDeck(userId: string, deckId: string) {
  // 1. Fetch deck with all flashcards + their cardType + fields + templates
  const deck = await this.prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: {
      flashcards: {
        include: {
          cardType: {
            include: {
              fields: { orderBy: { order: 'asc' } },
              templates: true,
            },
          },
        },
      },
    },
  });
  if (!deck) throw new NotFoundException('Deck not found');

  // 2. Determine the card type used (use the first card's type, or null)
  const firstCardWithType = deck.flashcards.find(f => f.cardType);
  const cardType = firstCardWithType?.cardType ?? null;

  // 3. Build field name map: fieldId → fieldName (for portable fieldValues)
  const fieldIdToName: Record<string, string> = {};
  if (cardType) {
    for (const field of cardType.fields) {
      fieldIdToName[field.id] = field.name;
    }
  }

  // 4. Transform flashcards: strip FSRS data, convert fieldValue keys from IDs to names
  const cards = deck.flashcards.map(card => {
    // Convert fieldValues keys from UUIDs to field names
    const portableFieldValues: Record<string, string> = {};
    const fv = card.fieldValues as Record<string, string>;
    for (const [key, value] of Object.entries(fv)) {
      const fieldName = fieldIdToName[key] ?? key; // fallback to raw key if no mapping
      portableFieldValues[fieldName] = value;
    }

    return {
      fieldValues: portableFieldValues,
      tags: card.tags,
      fieldStyles: card.fieldStyles ?? null,
      cardStyle: card.cardStyle ?? null,
    };
  });

  // 5. Build the .lexon export object
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
    },
    cardType: cardType ? {
      name: cardType.name,
      description: cardType.description ?? null,
      fields: cardType.fields.map(f => ({
        name: f.name,
        order: f.order,
        fieldType: f.fieldType,
      })),
      templates: cardType.templates.map(t => ({
        name: t.name,
        // Convert frontFields/backFields from field IDs to field names
        frontFieldNames: (t.frontFields as string[]).map(id => fieldIdToName[id] ?? id),
        backFieldNames: (t.backFields as string[]).map(id => fieldIdToName[id] ?? id),
        fieldStyles: t.fieldStyles ?? {},
        cardStyle: t.cardStyle ?? {},
      })),
    } : null,
    cards,
  };

  return exportData;
}
```

**Key points:**
- FSRS fields (`due`, `stability`, `difficulty`, `reps`, `lapses`, `cardState`, `scheduledDays`, `elapsedDays`, `lastReview`, `nextReviewDate`) are **intentionally omitted**
- `front`/`back` HTML are omitted (they're derived from fieldValues at render time)
- Field IDs are converted to field **names** for portability across different databases

---

## Step 2: Backend — Export Controller Endpoint

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts`

Add a new endpoint after the existing deck endpoints (~line 141):

```typescript
@Get('decks/:id/export')
async exportDeck(@Request() req: any, @Param('id') id: string) {
  return this.vocabLabService.exportDeck(req.user.id, id);
}
```

**API:** `GET /api/vocab-lab/decks/:id/export`
**Auth:** JWT required (existing `@UseGuards(JwtAuthGuard)` on the controller class)
**Response:** JSON body with the `.lexon` format

---

## Step 3: Frontend — API Client Method

**File:** `frontend-web/src/services/vocabLab.api.ts`

Add after the `deleteDeck` method (~line 34):

```typescript
exportDeck: async (id: string) => {
  const { data } = await api.get(`/vocab-lab/decks/${id}/export`);
  return data;
},
```

---

## Step 4: Frontend — Download Helper Utility

**File:** `frontend-web/src/utils/download.ts` (create new file)

```typescript
/**
 * Triggers a browser download of a JSON object as a .lexon file.
 */
export function downloadAsLexon(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.lexon`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## Step 5: Frontend — Export Button in DecksTab

**File:** `frontend-web/src/app/vocab-lab/components/DecksTab.tsx`

### 5.1 — Add state and handler

Add to the component body (after existing state declarations ~line 18):

```typescript
const [exportingId, setExportingId] = useState<string | null>(null);

const handleExport = async (e: React.MouseEvent, deck: DeckWithCounts) => {
  e.stopPropagation(); // Prevent row click navigation
  setExportingId(deck.id);
  try {
    const data = await vocabLabApi.exportDeck(deck.id);
    downloadAsLexon(data, deck.name.replace(/\s+/g, '_'));
  } catch (error) {
    console.error('Failed to export deck:', error);
  } finally {
    setExportingId(null);
  }
};
```

### 5.2 — Add export button to deck row

In the existing `<td>` for the deck name (around line 119-133), add an export icon button **next to** the existing delete button:

```tsx
{/* Export button */}
<button
  onClick={(e) => handleExport(e, deck)}
  disabled={exportingId === deck.id}
  className="ml-1 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all p-1"
  title="Export Deck"
>
  {exportingId === deck.id ? (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )}
</button>
```

### 5.3 — Add import for the download utility

At the top of `DecksTab.tsx`:

```typescript
import { downloadAsLexon } from '@/utils/download';
```

---

## Step 6: Verify

After implementing all steps, verify:

1. **Export a deck with cards** — Click the export icon on "4000 Essential English Words Book 1"
   - A `.lexon` file should download
   - Open it and verify the JSON structure matches the format spec
   - `fieldValues` keys should be field **names** (e.g., "Word", "IPA") not UUIDs
   - No FSRS scheduling data should be present
   - Templates should reference field names in `frontFieldNames`/`backFieldNames`

2. **Export an empty deck** — Should produce a valid `.lexon` with `cards: []`

3. **Export a deck with Basic card type** — Cards using the built-in "Basic" type should export with `cardType.name: "Basic"` and fields "Front"/"Back"

---

## Files Modified/Created

| Action | File |
|--------|------|
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.service.ts` — add `exportDeck()` |
| **Modified** | `backend-core/src/modules/vocab-lab/vocab-lab.controller.ts` — add `GET decks/:id/export` |
| **Modified** | `frontend-web/src/services/vocabLab.api.ts` — add `exportDeck()` |
| **Created** | `frontend-web/src/utils/download.ts` — `downloadAsLexon()` helper |
| **Modified** | `frontend-web/src/app/vocab-lab/components/DecksTab.tsx` — add export button + handler |
