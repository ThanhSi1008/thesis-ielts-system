# Plan: Generate StarUML Class Diagrams from Prisma Schema

## Goal
Generate two `.mdj` (StarUML project) files from `backend-core/prisma/schema.prisma` into `_thesis_paper/v2/`. The diagrams should match the reference image style: white boxes, `- attribute : Type` notation, association lines with multiplicity.

## Output Directory
`_thesis_paper/v2/`

---

## Phase 1 — Create the MDJ Generator Script

### Task
Create `_thesis_paper/v2/generate_staruml.js` — a Node.js script that:

1. **Reads** `backend-core/prisma/schema.prisma`
2. **Parses** all `model` and `enum` blocks using regex
3. **Generates** valid StarUML `.mdj` JSON files

### MDJ Top-Level Structure

```json
{
  "_type": "Project",
  "_id": "<unique-id>",
  "name": "TOEIC System",
  "ownedElements": [
    {
      "_type": "UMLModel",
      "_id": "<unique-id>",
      "name": "Model",
      "ownedElements": [
        // UMLClass, UMLEnumeration, UMLAssociation objects here
      ]
    }
  ]
}
```

### ID Generation
Use counter-based: `"id_" + counter++`. StarUML accepts any unique string.

### Prisma → UML Type Map

| Prisma | UML |
|--------|-----|
| `String` | `String` |
| `String[]` | `String[]` |
| `Int` | `Integer` |
| `Int[]` | `Integer[]` |
| `Float` | `Double` |
| `Boolean` | `Boolean` |
| `DateTime` | `Date` |
| `Json` | `Object` |
| Enum name | Keep as-is |
| Relation type | **SKIP** |

### Parsing Rules

**Models:** For each `model` block, extract name and fields. Skip lines starting with `//`, `@@`, or empty. Skip relation fields (type is another model name or ends with `[]` where the base is a model). Strip `?` from types. Create `UMLClass` + `UMLAttribute` array.

**Enums:** Extract name and literal values. Create `UMLEnumeration` + `UMLEnumerationLiteral` array.

### UMLClass Template

```json
{
  "_type": "UMLClass",
  "_id": "<id>",
  "_parent": { "$ref": "<model-id>" },
  "name": "User",
  "attributes": [
    {
      "_type": "UMLAttribute",
      "_id": "<id>",
      "_parent": { "$ref": "<class-id>" },
      "name": "email",
      "type": "String",
      "visibility": "private"
    }
  ]
}
```

### UMLEnumeration Template

```json
{
  "_type": "UMLEnumeration",
  "_id": "<id>",
  "_parent": { "$ref": "<model-id>" },
  "name": "UserRole",
  "literals": [
    {
      "_type": "UMLEnumerationLiteral",
      "_id": "<id>",
      "_parent": { "$ref": "<enum-id>" },
      "name": "STUDENT"
    }
  ]
}
```

### Associations

Parse Prisma `@relation(fields: [...])` to create `UMLAssociation`. Array field = `0..*`, singular = `1` or `0..1`.

```json
{
  "_type": "UMLAssociation",
  "_id": "<id>",
  "_parent": { "$ref": "<model-id>" },
  "end1": {
    "_type": "UMLAssociationEnd",
    "_id": "<id>",
    "_parent": { "$ref": "<assoc-id>" },
    "reference": { "$ref": "<classA-id>" },
    "multiplicity": "1"
  },
  "end2": {
    "_type": "UMLAssociationEnd",
    "_id": "<id>",
    "_parent": { "$ref": "<assoc-id>" },
    "reference": { "$ref": "<classB-id>" },
    "multiplicity": "0..*"
  }
}
```

### Diagram View Elements

Include a `UMLClassDiagram` with `UMLClassView` per class/enum so they appear on canvas:

```json
{
  "_type": "UMLClassView",
  "_id": "<id>",
  "_parent": { "$ref": "<diagram-id>" },
  "model": { "$ref": "<class-id>" },
  "left": <x>, "top": <y>,
  "width": 200, "height": 0,
  "autoResize": true
}
```

**Grid layout:** 6 columns, `left = (i % 6) * 280 + 50`, `top = Math.floor(i / 6) * 400 + 50`.

For associations add `UMLAssociationView`:

```json
{
  "_type": "UMLAssociationView",
  "_id": "<id>",
  "_parent": { "$ref": "<diagram-id>" },
  "model": { "$ref": "<assoc-id>" },
  "head": { "$ref": "<targetClassView-id>" },
  "tail": { "$ref": "<sourceClassView-id>" },
  "lineStyle": 1
}
```

---

## Phase 2 — Split into Two Diagram Files

### File 1: `class-diagram-core.mdj`
All models NOT in the IELTS list + `User`.

### File 2: `class-diagram-ielts.mdj`
All IELTS/Foundation models + `User`.

### IELTS Model List

```javascript
const IELTS_MODELS = [
  'IeltsProfile', 'IeltsBasicSkill', 'IeltsBasicLesson',
  'IeltsBasicListeningExercise', 'IeltsBasicReadingExercise',
  'IeltsBasicWritingExercise', 'IeltsBasicSpeakingExercise',
  'IeltsBasicProgress', 'IeltsBasicWritingAnswer',
  'IeltsAdvancedListeningPart', 'IeltsAdvancedListeningSession',
  'IeltsAdvancedReadingPart', 'IeltsAdvancedReadingSession',
  'IeltsAdvancedWritingPrompt', 'IeltsAdvancedWritingSession',
  'IeltsAdvancedSpeakingPart', 'IeltsAdvancedSpeakingSession',
  'FoundationVocabBook', 'FoundationVocabUnit',
  'FoundationVocabItem', 'FoundationVocabExercise',
  'FoundationVocabQuestion', 'FoundationVocabProgress',
  'FoundationVocabLesson', 'FoundationVocabWord',
  'Grammar', 'FoundationGrammarBook', 'FoundationGrammarUnit',
  'FoundationGrammarExercise', 'FoundationGrammarProgress',
  'FoundationPronunciationSound', 'FoundationSoundExample',
  'FoundationPronunciationProgress', 'FoundationPronunciationAttempt',
];
```

### Rules
- Enums used by IELTS models → IELTS file; by Core → Core file; both → both
- Associations: include only if both ends are in the diagram (User counts for both)

---

## Phase 3 — Run the Generator

```powershell
cd c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_thesis_paper\v2
node generate_staruml.js
```

**Expected output files:**
- `v2/class-diagram-core.mdj`
- `v2/class-diagram-ielts.mdj`

**Validation:** Check valid JSON, no duplicate `_id`, all `$ref` resolve, print class/enum/association counts.

---

## Phase 4 — Open in StarUML & Polish

1. Open StarUML → `File > Open` → select `.mdj` file
2. Diagram appears with classes in grid layout
3. Use `Format > Auto Layout` or rearrange manually
4. Export: `File > Export Diagram as > PNG/SVG`
5. Repeat for second file

---

## Reference Files

| File | Path |
|------|------|
| Prisma Schema | `backend-core/prisma/schema.prisma` (1453 lines) |
| Previous generator | `_thesis_paper/generate_java_vp.js` |
| Core mermaid | `_thesis_paper/class-diagram-rest.md` |
| IELTS mermaid | `_thesis_paper/class-diagram-ielts.md` |

## All Enums (14)
UserRole, ExamType, Difficulty, SessionStatus, MaterialType, PronunciationStatus, PronunciationMastery, CardState, SubscriptionTier, SubscriptionStatus, PaymentProvider, NotificationType, PostType
