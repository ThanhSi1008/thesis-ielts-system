# Phase 3 — Import UI Polish

> **Goal:** Replace the basic file picker with a polished import modal featuring file preview, card count, conflict detection, and deck name editing before import.
>
> **Dependencies:** Phase 2 (import endpoint must exist)
>
> **Estimated effort:** ~3-4 hours

---

## Overview

Instead of immediately importing upon file selection, show a **preview modal** where the user can:
1. See the deck name, card count, card type info, and sample cards
2. Edit the deck name before importing
3. See warnings about potential CardType conflicts
4. Confirm or cancel

---

## Step 1: Create Import Preview Modal Component

**File:** `frontend-web/src/app/vocab-lab/components/ImportDeckModal.tsx` (create new)

### Props interface (ISP — only pass what the modal needs):

```typescript
interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (deckName: string) => Promise<void>;
  lexonData: LexonData | null;
  isImporting: boolean;
  existingDeckNames: string[];
}

interface LexonData {
  version: number;
  exportedAt: string;
  deck: { name: string };
  cardType: {
    name: string;
    description?: string | null;
    fields: Array<{ name: string; order: number; fieldType: string }>;
    templates: Array<{ name: string; frontFieldNames: string[]; backFieldNames: string[] }>;
  } | null;
  cards: Array<{
    fieldValues: Record<string, string>;
    tags?: string[];
  }>;
}
```

### Component structure:

The modal should have these visual sections:

```
┌──────────────────────────────────────────────────────┐
│  📥 Import Deck                                   ✕  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Deck Name                                           │
│  ┌──────────────────────────────────────────────┐    │
│  │ 4000 Essential English Words Book 1           │    │
│  └──────────────────────────────────────────────┘    │
│  ⚠ A deck with this name already exists.             │
│    It will be imported as "... (Imported 2026-05-04)" │
│                                                      │
│  ── Summary ─────────────────────────────────────    │
│  📇 123 cards  ·  📋 Card Type: essential            │
│  📝 Fields: Word, IPA, Meaning, Example, Image      │
│  📅 Exported: May 4, 2026                            │
│                                                      │
│  ── Preview Cards (first 3) ─────────────────────    │
│  ┌────────────────────────────────────────────────┐  │
│  │ Word: afraid   IPA: /əˈfreɪd/                  │  │
│  │ Meaning: feeling fear; scared                   │  │
│  ├────────────────────────────────────────────────┤  │
│  │ Word: agree    IPA: /əˈɡriː/                   │  │
│  │ Meaning: to think the same way                  │  │
│  ├────────────────────────────────────────────────┤  │
│  │ Word: angry    IPA: /ˈæŋɡri/                   │  │
│  │ Meaning: feeling strong displeasure             │  │
│  └────────────────────────────────────────────────┘  │
│  ... and 120 more cards                              │
│                                                      │
│           [Cancel]  [Import 123 cards]                │
└──────────────────────────────────────────────────────┘
```

### Implementation guidelines:

```tsx
export function ImportDeckModal({ isOpen, onClose, onConfirmImport, lexonData, isImporting, existingDeckNames }: ImportDeckModalProps) {
  const [deckName, setDeckName] = useState('');

  // Sync deck name from lexonData when it changes
  useEffect(() => {
    if (lexonData) {
      setDeckName(lexonData.deck.name);
    }
  }, [lexonData]);

  if (!isOpen || !lexonData) return null;

  const nameConflict = existingDeckNames.includes(deckName);
  const previewCards = lexonData.cards.slice(0, 3);
  const remainingCount = Math.max(0, lexonData.cards.length - 3);
  const exportDate = new Date(lexonData.exportedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 border dark:border-gray-800 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            📥 Import Deck
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Deck Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Deck Name
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {nameConflict && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                ⚠ A deck with this name already exists. It will be imported with a date suffix.
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>📇</span>
              <span className="font-semibold">{lexonData.cards.length}</span> cards
              {lexonData.cardType && (
                <>
                  <span className="text-gray-400 mx-1">·</span>
                  <span>📋 Card Type:</span>
                  <span className="font-medium text-primary">{lexonData.cardType.name}</span>
                </>
              )}
            </div>
            {lexonData.cardType && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                📝 Fields: {lexonData.cardType.fields.map(f => f.name).join(', ')}
              </div>
            )}
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              📅 Exported: {exportDate}
            </div>
          </div>

          {/* Preview Cards */}
          {previewCards.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Preview
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {previewCards.map((card, i) => (
                  <div key={i} className="px-4 py-3 text-sm">
                    {Object.entries(card.fieldValues).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium min-w-[60px]">{key}:</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{stripHtml(value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {remainingCount > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                  ... and {remainingCount} more cards
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmImport(deckName)}
            disabled={isImporting || !deckName.trim()}
            className="px-5 py-2.5 bg-primary text-gray-900 font-medium rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : `Import ${lexonData.cards.length} cards`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to strip HTML tags for preview display
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim().slice(0, 80);
}
```

---

## Step 2: Update DecksTab to Use the Modal

**File:** `frontend-web/src/app/vocab-lab/components/DecksTab.tsx`

### 2.1 — Replace direct import logic with modal flow

Replace the Phase 2 state and handlers with:

```typescript
const [showImportModal, setShowImportModal] = useState(false);
const [pendingLexonData, setPendingLexonData] = useState<any>(null);
const [isImporting, setIsImporting] = useState(false);
const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### 2.2 — File selection opens modal (not immediate import)

```typescript
const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = '';

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.version || !data.deck?.name || !Array.isArray(data.cards)) {
      throw new Error('Invalid .lexon file format');
    }
    setPendingLexonData(data);
    setShowImportModal(true);
  } catch (error: any) {
    setImportFeedback({
      type: 'error',
      text: error instanceof SyntaxError ? 'File is not valid JSON' : (error.message || 'Invalid file'),
    });
  }
};

const handleConfirmImport = async (deckName: string) => {
  if (!pendingLexonData) return;
  setIsImporting(true);

  try {
    // Override deck name if user edited it
    const payload = { ...pendingLexonData, deck: { ...pendingLexonData.deck, name: deckName } };
    const result = await vocabLabApi.importDeck(payload);
    setImportFeedback({ type: 'success', text: `Imported "${result.deckName}" with ${result.cardsImported} cards` });
    setShowImportModal(false);
    setPendingLexonData(null);
    await fetchDecks();
  } catch (error: any) {
    setImportFeedback({
      type: 'error',
      text: error?.response?.data?.message || error?.message || 'Import failed',
    });
  } finally {
    setIsImporting(false);
  }
};
```

### 2.3 — Render the modal in JSX

Add at the end of the component's JSX return (before closing `</div>`):

```tsx
<ImportDeckModal
  isOpen={showImportModal}
  onClose={() => { setShowImportModal(false); setPendingLexonData(null); }}
  onConfirmImport={handleConfirmImport}
  lexonData={pendingLexonData}
  isImporting={isImporting}
  existingDeckNames={decks.map(d => d.name)}
/>
```

### 2.4 — Add import and component import

```typescript
import { ImportDeckModal } from './ImportDeckModal';
```

---

## Step 3: Drag-and-Drop Support (Optional Enhancement)

Add drag-and-drop to the DecksTab so users can drop a `.lexon` file directly onto the deck list:

```typescript
const [isDragOver, setIsDragOver] = useState(false);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(true);
};

const handleDragLeave = () => setIsDragOver(false);

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);
  const file = e.dataTransfer.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.version || !data.deck?.name || !Array.isArray(data.cards)) {
      throw new Error('Invalid .lexon file format');
    }
    setPendingLexonData(data);
    setShowImportModal(true);
  } catch (error: any) {
    setImportFeedback({
      type: 'error',
      text: 'Invalid .lexon file',
    });
  }
};
```

Add to the outer container div:

```tsx
<div
  className={`min-h-[800px] pb-12 flex flex-col items-center ${isDragOver ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
```

---

## Step 4: Verify

1. **Select a .lexon file** → modal opens with preview, not immediate import
2. **Preview shows** deck name, card count, field names, first 3 cards
3. **Edit deck name** → type a new name, verify it's used on import
4. **Name conflict warning** → shows amber warning when name matches existing deck
5. **Confirm import** → cards are imported, modal closes, deck list refreshes
6. **Cancel** → nothing is imported
7. **Drag and drop** → dropping a `.lexon` file opens the same modal

---

## Files Modified/Created

| Action | File |
|--------|------|
| **Created** | `frontend-web/src/app/vocab-lab/components/ImportDeckModal.tsx` — preview modal component |
| **Modified** | `frontend-web/src/app/vocab-lab/components/DecksTab.tsx` — modal integration, drag-and-drop |
