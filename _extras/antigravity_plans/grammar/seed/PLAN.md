# Grammar PDF Extraction & Seeding Plan

> **Goal**: Extract all 145 units from the _English Grammar in Use (Intermediate, 5th Edition)_ PDF into structured data and seed them into the database — **without any LLM**.

## Source Material Analysis

| Property | Value |
|---|---|
| **PDF File** | `_extras/antigravity_plans/grammar/MUCLecture_2022_5217521.pdf` |
| **Total pages** | 392 |
| **Units** | 145 (Unit 1–145) |
| **Structure per unit** | 2 pages: Theory (odd) + Exercises (even) |
| **Theory pages** | Pages 13–302 (units content) |
| **Answer key** | Pages 347–383 (all answers for every exercise) |
| **Text quality** | Clean, extractable via PyMuPDF (already verified) |

### Layout Pattern (Verified)

```
Page 13: Unit 1 Theory    → Sections A, B, C, D with explanations + examples
Page 14: Unit 1 Exercises → Exercises 1.1, 1.2, 1.3, 1.4
Page 15: Unit 2 Theory
Page 16: Unit 2 Exercises
...
Page 347–383: Answer Key  → "UNIT 1\n1.1\n2 He's tying...\n1.2\n2 e\n..."
```

---

## Phase 1: PDF Text Extraction

**Script**: `_extras/antigravity_plans/grammar/seed/01_extract_raw.py`
**Output**: `_extras/antigravity_plans/grammar/seed/output/raw_units.json`

### Steps

1. Open the PDF with PyMuPDF.
2. **Map unit boundaries**: Scan pages 13–302 looking for the `Unit\n<number>` marker. Each unit has exactly 2 pages (theory + exercises).
3. **Extract theory text**: For each unit, grab the full text of the theory page.
4. **Extract exercise text**: For each unit, grab the full text of the exercise page.
5. **Extract answer key**: Scan pages 347–383. Split by `UNIT <N>` headers, then split by exercise section markers (`1.1`, `1.2`, etc.) to get per-exercise answer lists.
6. **Save** a JSON file with this structure:

```json
{
  "1": {
    "unit": 1,
    "title": "Present continuous (I am doing)",
    "theory_raw": "...(full theory page text)...",
    "exercises_raw": "...(full exercise page text)...",
    "answers_raw": {
      "1.1": "2 He's tying...\n3 They're crossing...",
      "1.2": "2 e\n3 g\n4 a...",
      "1.3": "...",
      "1.4": "..."
    }
  },
  "2": { ... }
}
```

### Key Regex Patterns

| What | Pattern | Example Match |
|---|---|---|
| Unit number on page | `Unit\n(\d+)\n` | `Unit\n1\n` |
| Unit title (first line of theory page) | First line before `Unit\n` | `Present continuous (I am doing)` |
| Exercise section marker | `(\d+\.\d+)\n` | `1.1\n`, `1.2\n` |
| Answer key unit separator | `UNIT (\d+)\n` | `UNIT 1\n` |

---

## Phase 2: Structured Parsing (Theory + Exercises)

**Script**: `_extras/antigravity_plans/grammar/seed/02_parse_structured.py`
**Input**: `output/raw_units.json`
**Output**: `output/structured_units.json`

### 2A: Theory → HTML

Convert raw theory text into clean HTML for rendering:

1. **Detect section boundaries**: Split by `\nA\n`, `\nB\n`, `\nC\n`, `\nD\n` markers.
2. **Format each section**:
   - Wrap in `<div class="grammar-section">` with a section letter heading.
   - Detect example sentences (indented or italicized patterns) → wrap in `<div class="example">`.
   - Detect conjugation tables (am/is/are patterns) → wrap in `<table>`.
   - Detect bold grammar rules (lines with key patterns like "I am doing", "We use the present continuous") → wrap in `<p class="rule">`.
   - Detect cross-references (e.g., "➜ Unit 19") → wrap in `<span class="cross-ref">`.
3. **Preserve line breaks** in example sentences.

> **NOTE**: The theory HTML does NOT need to be pixel-perfect to the book. It just needs to be readable and well-structured. Simple semantic HTML with CSS classes is sufficient — the frontend already has styles for `.grammar-section`, `.example`, etc.

### 2B: Exercises → Structured Items

Parse exercise text + answers into structured exercise objects:

1. **Split exercise page by section markers** (`1.1`, `1.2`, `1.3`, `1.4`).
2. **For each exercise section**, determine the type:
   - **`fill_blank`**: Contains blanks (underscores or gaps where students fill in). Pattern: numbered items (`1`, `2`, `3...`) with blanks.
   - **`match`**: Contains matching pairs (left + right columns). Pattern: numbered items on left, lettered items on right.
   - **`rewrite`**: "Write questions" or "Put the verb into correct form" → still `fill_blank` with a prompt.
3. **Extract the question/instruction**: First line after the section marker (e.g., "What's happening in the pictures?").
4. **Extract verb banks/options**: Lines like `cross  hide  scratch  take  tie  wave` → `options.verbs[]`.
5. **Extract items**: Parse each numbered line into `{ label, answer, isExample }`.
   - Item 1 usually has the answer pre-filled (it's the example) → `isExample: true`.
   - Items 2+ have blanks → fill `answer` from the answer key.
6. **Merge with answer key**: Match exercise `N.M` to the corresponding answer key section.

### Output Structure

```json
{
  "1": {
    "unit": 1,
    "title": "Present continuous (I am doing)",
    "theory": "<div class='grammar-section'><h3>A</h3><p>...</p></div>...",
    "exercises": [
      {
        "id": "1.1",
        "question": "What's happening in the pictures? Choose from these verbs:",
        "type": "fill_blank",
        "options": { "verbs": ["cross", "hide", "scratch", "take", "tie", "wave"] },
        "items": [
          { "label": "________ a picture.", "answer": "She's taking", "isExample": true },
          { "label": "________ a shoelace.", "answer": "He's tying", "isExample": false }
        ]
      },
      {
        "id": "1.2",
        "question": "The sentences on the right follow those on the left. Which sentence goes with which?",
        "type": "match",
        "items": [
          { "left": "1 Please don't make so much noise.", "right": "f. I'm trying to work.", "isExample": true },
          { "left": "2 We need to leave soon.", "right": "e. It's getting late.", "isExample": false }
        ]
      }
    ]
  }
}
```

### Parsing Strategy by Exercise Type

| Type | Detection Pattern | Item Extraction |
|---|---|---|
| `fill_blank` | Default. Numbered items with blank spaces. | Split by `\n\d+ ` pattern. First completed item = example. |
| `match` | Right column has lettered answers (a, b, c...) | Extract left items (numbered) + right items (lettered). Answer key gives mapping. |
| `rewrite` | Instructions like "Write questions" or "Complete the sentences" | Same as `fill_blank` — instruction becomes `question`, items are numbered prompts. |

---

## Phase 3: Generate Seed File & Import

**Script**: `_extras/antigravity_plans/grammar/seed/03_generate_seed.py`
**Input**: `output/structured_units.json`
**Output**: `backend-core/prisma/data/grammar-intermediate.ts`

### Steps

1. Read `structured_units.json`.
2. Generate a TypeScript file exporting an object matching the format expected by `seed.ts`:

```typescript
export const intermediateGrammarData = {
  book: {
    slug: "intermediate",
    name: "English Grammar in Use",
    author: "Raymond Murphy",
    level: "Intermediate",
    imageUrl: "...",
    color: "#1e6dc0",
    unitCount: 145,
  },
  units: [
    {
      order: 1,
      title: "Present continuous (I am doing)",
      theory: "<div>...</div>",
      exercises: [ ... ]
    },
    ...
  ]
};
```

3. Update `seed.ts` to import from this new file and iterate through units.

### Seeding Logic (already exists in `seed.ts`, just needs data source swap)

```
For each unit:
  → upsert GrammarUnit (bookId, title, order, theoryContent)
  → delete existing exercises for this unit
  → create GrammarExercise for each exercise item
```

---

## Execution Order

```
Phase 1: 01_extract_raw.py  → raw_units.json
Phase 2: 02_parse_structured.py  → structured_units.json
Phase 3: 03_generate_seed.py  → grammar-intermediate.ts  → npx prisma db seed
```

| Phase | Script | Input | Output | Estimated LOC |
|---|---|---|---|---|
| 1 | `01_extract_raw.py` | PDF file | `raw_units.json` | ~80 |
| 2 | `02_parse_structured.py` | `raw_units.json` | `structured_units.json` | ~200 |
| 3 | `03_generate_seed.py` | `structured_units.json` | `grammar-intermediate.ts` | ~60 |

## Edge Cases to Handle

| Edge Case | Solution |
|---|---|
| Unit title extraction | First line of theory page, before `Unit\n` marker |
| Multi-answer exercises (e.g., "He's tying / He is tying") | Accept first variant as primary answer |
| Example items (pre-filled) | Detect by checking if answer exists in exercise text (not blank) |
| Cross-references ("➜ Unit 19") | Wrap in `<span class="cross-ref">` but don't create hyperlinks |
| Tables (verb conjugation grids) | Detect columnar patterns → render as `<table>` |
| Special characters (arrows, bullets) | PyMuPDF handles Unicode; preserve as-is |

## Prerequisites

- **Python 3.10+** (already installed)
- **PyMuPDF** (`pip install PyMuPDF`) — already installed
- **No LLM / API key needed**

## Success Criteria

- [ ] All 145 units extracted with correct titles
- [ ] All theory pages converted to readable HTML
- [ ] All exercise sections parsed with correct type classification
- [ ] All answers correctly matched from the answer key
- [ ] `seed.ts` successfully seeds all data into the database
- [ ] Frontend renders theory and exercises correctly for any unit
