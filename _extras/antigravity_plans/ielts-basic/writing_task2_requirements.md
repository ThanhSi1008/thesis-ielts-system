# IELTS Writing Task 2 — Requirements & Suggestions

## Context: What We Already Have (Task 1)

| Layer | Task 1 Status |
|-------|---------------|
| **Theory** | 5 lessons in `writing_theory.txt` (Intro, Change Over Time, No Change Over Time, Mixed Charts, Maps, Process) — each with Content (3 sections: Task Achievement + Grammar & Cohesion + Lexical Resource), Quiz |
| **Exercises** | 20 exercises in `writing_task_1_cloze_auto.json` — Cloze format with dropdowns |
| **Schema** | `IeltsBasicWritingExercise` (prompt, diagramUrl, modelAnswer as JSON, order) |
| **UI** | `WritingClozeLayout` — Two-pane: left = prompt + diagram, right = fill-in-the-blank paragraphs |
| **Theory Buttons** | 3 modals: Task Achievement (🟢 Target), Grammar & Cohesion (🔗 Link), Lexical Resource (📖 BookOpen) |

---

## 1. Content Layer — What to Teach

### 1.1 Theory Lessons (6 lessons suggested)

Task 2 is fundamentally different from Task 1. It requires **opinion writing**, not data description. The theory must teach a completely different skill set.

| # | Lesson Title | Content Focus |
|---|---|---|
| 1 | **Introduction to Writing Task 2** | Logistics (40 min, 250 words, 2/3 of Writing score), 5 question types, the 4-paragraph golden structure, how you're graded (same 4 criteria), critical don'ts |
| 2 | **Opinion Essay** *(Agree/Disagree)* | "To what extent do you agree or disagree?" — How to take a clear position, one-sided vs balanced approach |
| 3 | **Discussion Essay** *(Discuss Both Views)* | "Discuss both views and give your own opinion" — How to present both sides fairly before stating your position |
| 4 | **Problem & Solution Essay** | "What are the problems? What solutions can you suggest?" — How to identify causes and propose realistic solutions |
| 5 | **Advantages & Disadvantages Essay** | "Do the advantages outweigh the disadvantages?" — How to weigh pros and cons systematically |
| 6 | **Two-Part Question Essay** | "Why is this happening? Is this a positive or negative development?" — How to answer two distinct questions in one essay |

### 1.2 Theory Structure Per Lesson

Each lesson should follow the exact same 3-section + Quiz pattern as Task 1:

```
- Task Achievement
    - Essay structure table (Introduction / Body 1 / Body 2 / Conclusion)
    - What to write in each paragraph
    - High-band example overview/thesis statement
    
- Grammar + Coherence & Cohesion
    - Sentence templates specific to the essay type
    - Linking devices (opinion markers, contrast connectors, cause/effect)
    - Paragraph transition techniques
    
- Lexical Resource
    - Opinion phrases: "I firmly believe...", "It is widely acknowledged..."
    - Argument phrases: "A compelling argument for... is...", "Critics argue that..."
    - Conclusion phrases: "In conclusion...", "To sum up..."
    - Topic-specific vocabulary banks (education, technology, environment, health, etc.)
    
- Quiz (6-9 MCQ questions testing comprehension of the lesson)
```

---

## 2. Exercise Layer — What Format?

> [!IMPORTANT]
> This is the biggest design decision. Task 2 is an **essay**, not a data report. The exercise format must reflect this.

### Option A: Cloze (Same as Task 1) ✅ Recommended for "Basic" Level

**How it works:** Provide a model essay with key phrases blanked out. Students select from dropdowns.

**What to blank out:**
- **Thesis statements:** "I *firmly believe* that..." → [firmly believe / somewhat agree / partially disagree / strongly oppose]
- **Linking devices:** "*Furthermore*, ..." → [Furthermore / Because / Although / Despite]
- **Topic vocabulary:** "This can lead to *obesity*" → [obesity / happiness / confusion / poverty]
- **Argument structures:** "A *compelling* argument for this is..." → [compelling / weak / main / strange]

**Pros:**
- Consistent UX across the entire Writing module
- Auto-gradable — no AI/manual review needed
- Teaches correct patterns through muscle memory
- Fast to implement — reuses existing `WritingClozeLayout`

**Cons:**
- Doesn't test actual writing ability
- Students learn to recognize, not produce

### Option B: Free-Text Writing + AI Review 🔮 Future Enhancement

**How it works:** Students write their own essay. An AI model evaluates it against the 4 IELTS criteria.

**Pros:** Most authentic practice
**Cons:** Requires AI integration (cost, latency, accuracy), much harder to implement

### Option C: Hybrid — Cloze + Guided Outline 🎯 Best of Both

**How it works:**
1. **Phase 1 (Cloze):** Fill in blanks in a model essay (same as Option A)
2. **Phase 2 (Outline Builder):** After completing cloze, show an empty 4-paragraph template where students type their own version using the patterns they just learned

**Pros:** Teaches patterns first, then lets students practice producing them
**Cons:** Phase 2 still needs manual/AI review for meaningful feedback

### 📌 Recommendation

Start with **Option A (Cloze)** for the thesis deadline. It's consistent, auto-gradable, and fast to ship. Add Option C later as an enhancement.

---

## 3. Data Layer — What to Create

### 3.1 New Files Needed

| File | Purpose |
|------|---------|
| `writing_task_2_theory.txt` | Theory content for 6 lessons (same format as `writing_theory.txt`) |
| `writing_task_2_exercises.txt` | Raw exercise content: prompt + model essay for each question type |
| `writing_task_2_cloze_auto.json` | Auto-generated cloze JSON (produced by converter script) |

### 3.2 Exercise Distribution

| Question Type | # of Exercises | Total |
|---|---|---|
| Opinion (Agree/Disagree) | 4 | |
| Discussion (Both Views) | 4 | |
| Problem & Solution | 3 | |
| Advantages & Disadvantages | 3 | |
| Two-Part Question | 3 | |
| **Total** | | **17-20** |

### 3.3 Exercise Data Structure

Each exercise needs:

```json
{
  "theme": "Opinion Essay",
  "subCategory": "Education",
  "prompt": "Some people believe that university education should be free for all students. To what extent do you agree or disagree?",
  "diagramUrl": null,  // Task 2 has NO diagrams
  "taskType": 2,       // NEW FIELD to distinguish from Task 1
  "modelAnswer": {
    "paragraphs": [
      {
        "number": 1,
        "title": "Introduction",
        "segments": [
          { "type": "text", "value": "It is often " },
          { "type": "blank", "id": "b1", "correctAnswer": "argued", "options": ["argued", "denied", "proven", "forgotten"] },
          { "type": "text", "value": " that higher education should be provided free of charge. I " },
          { "type": "blank", "id": "b2", "correctAnswer": "firmly believe", "options": ["firmly believe", "somewhat doubt", "partially agree", "strongly deny"] },
          { "type": "text", "value": " that making university free would bring significant benefits to society." }
        ]
      }
      // ... Body 1, Body 2, Conclusion
    ]
  }
}
```

> [!NOTE]
> Key difference from Task 1: Task 2 has **4 paragraphs** with a **Conclusion** instead of Body 2 + no diagram. The `diagramUrl` field will be null.

---

## 4. Schema Layer — What to Change

### Option A: Reuse existing model (Recommended)

The current `IeltsBasicWritingExercise` model already supports Task 2:

| Field | Task 1 Usage | Task 2 Usage |
|-------|-------------|-------------|
| `prompt` | Chart description prompt | Essay question |
| `diagramUrl` | Chart/graph image | `null` |
| `modelAnswer` | Cloze JSON with paragraphs | Same structure, different paragraph titles |
| `topic` | "Change Over Time - Standard 4 categories" | "Opinion Essay - Education" |

**Only addition needed:** A `taskType` field (`Int`, default `1`) to distinguish Task 1 vs Task 2 in the UI and API.

```prisma
model IeltsBasicWritingExercise {
  // ... existing fields
  taskType     Int         @default(1)  // 1 = Task 1, 2 = Task 2
}
```

### Option B: Separate model

Create `IeltsBasicWritingTask2Exercise`. **Not recommended** — the data shape is identical, and it doubles maintenance.

---

## 5. Frontend Layer — What to Build

### 5.1 UI Changes for Task 2

The `WritingClozeLayout` can be reused with minor adjustments:

| Aspect | Task 1 | Task 2 Change |
|--------|--------|---------------|
| Left pane | Prompt + Diagram image | Prompt only (no diagram) — use full width for prompt text |
| Right pane | 4 paragraphs (Intro, Overview, Body 1, Body 2) | 4 paragraphs (Intro, Body 1, Body 2, Conclusion) |
| Header | "Exercise: Change Over Time" | "Exercise: Opinion Essay - Education" |
| Theory buttons | Same 3 buttons | Same 3 buttons (different content per lesson) |

### 5.2 Layout Variant

When `diagramUrl` is null (Task 2), the layout should adapt:
- **Option 1:** Make the prompt pane narrower (~30%) and the cloze pane wider (~70%)
- **Option 2:** Stack vertically — prompt on top, cloze below (since there's no image to show side-by-side)

### 5.3 Navigation

The sidebar/exercise list needs to separate Task 1 and Task 2:

```
Writing
├── Task 1 Lessons
│   ├── Introduction to Task 1
│   ├── Change Over Time
│   └── ...
├── Task 1 Exercises
│   ├── Change Over Time - Standard 4 categories (Exercise 1)
│   └── ...
├── Task 2 Lessons        ← NEW
│   ├── Introduction to Task 2
│   ├── Opinion Essay
│   └── ...
└── Task 2 Exercises      ← NEW
    ├── Opinion Essay - Education
    └── ...
```

---

## 6. Distractor Dictionary — Task 2 Specific

The Task 1 converter script has a dictionary of IELTS trend/reporting vocabulary. Task 2 needs its own:

| Category | Words to Blank | Distractor Pool |
|----------|---------------|----------------|
| **Opinion markers** | firmly believe, strongly agree, partially disagree | each other + "somewhat doubt", "entirely reject" |
| **Argument starters** | Furthermore, Moreover, In addition | However, Nevertheless, Although, Despite |
| **Cause/Effect** | consequently, therefore, as a result | similarly, conversely, meanwhile |
| **Concession** | Although, Despite, While | Because, Since, Due to |
| **Conclusion** | In conclusion, To sum up, Overall | In detail, To begin, Furthermore |
| **Topic vocab (Education)** | curriculum, tuition, scholarship | revenue, infrastructure, legislation |
| **Topic vocab (Technology)** | innovation, automation, digital | agricultural, medicinal, classical |
| **Topic vocab (Environment)** | sustainability, emissions, renewable | tuition, curriculum, innovation |

---

## Summary — Implementation Priority

| Priority | Task | Effort |
|----------|------|--------|
| 🔴 P0 | Write `writing_task_2_theory.txt` (6 lessons with Task Achievement, Grammar, Lexical Resource, Quiz) | High — content authoring |
| 🔴 P0 | Write `writing_task_2_exercises.txt` (17-20 model essays with prompts) | High — content authoring |
| 🟡 P1 | Add `taskType` field to schema, run migration | Low |
| 🟡 P1 | Extend `convert_cloze.js` with Task 2 distractor dictionary | Medium |
| 🟡 P1 | Update seeder to read Task 2 JSON | Low |
| 🟢 P2 | Adapt `WritingClozeLayout` for no-diagram layout | Low |
| 🟢 P2 | Update sidebar navigation to show Task 1 / Task 2 sections | Medium |

---

## Questions for You

1. **Content source:** Do you already have Task 2 theory content and model essays prepared (like you had the TXT file for Task 1), or do I need to generate them?
2. **Exercise format:** Are you happy with **Cloze only** for now, or do you want the hybrid approach from the start?
3. **Scope for thesis:** Do you need all 6 lesson types, or would 3-4 be enough for the thesis deadline?
