# Phase 4 — Frontend UI

> **Goal:** Adapt `WritingClozeLayout` for Task 2 (no diagram), update sidebar to separate Task 1 vs Task 2, ensure theory modals work correctly.
> **Dependencies:** Phase 3 (needs API). **Effort:** ~2 hours.

---

## Step 1: Adapt WritingClozeLayout for No-Diagram

**File:** `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/_components/containers/WritingClozeLayout.tsx`

### 1.1 — Detect Task 2 (No Diagram)

The existing layout has a two-pane split: left pane (45%) shows prompt + diagram, right pane (55%) shows cloze paragraphs.

For Task 2, `diagramUrl` is `null`. The layout should adapt:

**Find the main two-pane split (around line 152):**

```tsx
{/* Main Two-Pane Split */}
<div className="flex flex-1 overflow-hidden px-6 py-6 gap-6">
  {/* Left Pane: Prompt and Image */}
  <div className="w-[45%] overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
```

**Replace with conditional layout:**

```tsx
{/* Main Content */}
<div className="flex flex-col flex-1 overflow-hidden px-6 py-6 gap-6">
  {/* Task 2: Prompt as a top banner (no diagram) */}
  {!exercise?.diagramUrl && (
    <div className="flex-none bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-[15px] font-medium text-slate-700 leading-relaxed">
        {exercise?.prompt}
      </div>
    </div>
  )}

  <div className={`flex flex-1 overflow-hidden gap-6 ${exercise?.diagramUrl ? '' : ''}`}>
    {/* Left Pane: Prompt + Image (Task 1 only) */}
    {exercise?.diagramUrl && (
      <div className="w-[45%] overflow-y-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-[15px] font-medium text-slate-700 leading-relaxed">
          {exercise?.prompt}
        </div>
        <div className="mt-8 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white p-2">
          <img
            src={exercise.diagramUrl}
            alt="Diagram"
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
      </div>
    )}

    {/* Right Pane: Cloze Paragraphs (full width for Task 2) */}
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ... existing cloze content stays the same ... */}
    </div>
  </div>
</div>
```

**Design reasoning:**
- **Task 1** (has diagram): Keep the existing 45%/55% side-by-side layout
- **Task 2** (no diagram): Show prompt as a compact top banner, then give the cloze paragraphs full width below

### 1.2 — Update Paragraph Titles

The existing code renders `para.title` directly from the JSON, so no changes needed — the seeded data already contains "Conclusion" instead of "Overview" for Task 2 paragraphs.

---

## Step 2: Update the Skill Detail Page (Sidebar/Navigation)

**File:** Find the component that renders the exercise list for the Writing skill. This is likely in:
- `frontend-web/src/app/ielts/basic/[skill]/SkillDetailContent.tsx`, or
- A sub-component that renders the exercise sidebar

### 2.1 — Fetch and Separate Task Types

The API now supports `?taskType=1` and `?taskType=2`. The frontend should either:

**Option A: Two separate API calls:**

```typescript
// Fetch Task 1 exercises
const task1Res = await axios.get(`/api/v1/ielts/writing-exercises?skillId=${skillId}&taskType=1`);
const task1Exercises = task1Res.data;

// Fetch Task 2 exercises
const task2Res = await axios.get(`/api/v1/ielts/writing-exercises?skillId=${skillId}&taskType=2`);
const task2Exercises = task2Res.data;
```

**Option B: Single fetch, then filter client-side:**

```typescript
const allExercises = response.data;
const task1Exercises = allExercises.filter((e: any) => (e.taskType || 1) === 1);
const task2Exercises = allExercises.filter((e: any) => e.taskType === 2);
```

### 2.2 — Render Separate Sections

Display Task 1 and Task 2 as separate groups in the sidebar/exercise list:

```tsx
{/* Task 1 Section */}
<div className="mb-8">
  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <BarChart3 size={20} className="text-blue-500" />
    Writing Task 1
  </h2>
  <p className="text-sm text-gray-500 mb-3">
    Describe charts, graphs, and diagrams
  </p>
  {task1Exercises.map((ex) => (
    <ExerciseCard key={ex.id} exercise={ex} />
  ))}
</div>

{/* Task 2 Section */}
<div className="mb-8">
  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <PenTool size={20} className="text-purple-500" />
    Writing Task 2
  </h2>
  <p className="text-sm text-gray-500 mb-3">
    Write argumentative essays on various topics
  </p>
  {task2Exercises.map((ex) => (
    <ExerciseCard key={ex.id} exercise={ex} />
  ))}
</div>
```

Import icons:
```typescript
import { BarChart3, PenTool } from "lucide-react";
```

### 2.3 — Also Separate Theory Lessons

If the Writing skill page shows theory lessons, they also need to be separated. Task 2 lessons have `chapter` starting with `"Task 2 -"` (from the seeder).

```typescript
const task1Lessons = lessons.filter((l: any) => !l.chapter.startsWith("Task 2"));
const task2Lessons = lessons.filter((l: any) => l.chapter.startsWith("Task 2"));
```

---

## Step 3: Update Theory Modal Content

The theory modals (Target, Link, BookOpen) should show lesson-specific content from the seeder. This already works automatically because:

1. The seeder parses `Task Achievement`, `Grammar + Coherence & Cohesion`, `Lexical Resource` from the TXT file into `content` blocks with types `"traps"`, `"strategy"`, `"tips"`
2. `ExerciseDetailContent.tsx` fetches the lesson blocks via the `lessonId` on the exercise
3. `WritingClozeLayout` displays them in the 3 modals

**No changes needed IF** the exercises are correctly linked to their lessons via `lessonId` in the seeder. Verify this by checking:

```typescript
// In the seeder, the lesson matching logic:
const lesson = await prisma.ieltsBasicLesson.findFirst({
  where: { skillId: writingSkillRecord.id, title: theme },
});
// "theme" must match the lesson's "title" exactly
// e.g., theme = "Opinion Essay" must match lesson title = "Opinion Essay"
```

---

## Step 4: Verify End-to-End

### 4.1 — Task 1 Exercise (should still work as before)

1. Navigate to Writing → Task 1 → any exercise
2. ✅ Two-pane layout: prompt + diagram on left, cloze on right
3. ✅ Paragraphs: Introduction, Overview, Body 1, Body 2
4. ✅ Theory buttons show Task 1 content (reporting verbs, trend vocabulary)

### 4.2 — Task 2 Exercise (new)

1. Navigate to Writing → Task 2 → any exercise
2. ✅ Prompt banner on top (no diagram image)
3. ✅ Cloze paragraphs take full width below
4. ✅ Paragraphs: Introduction, Body 1, Body 2, Conclusion
5. ✅ Dropdown blanks test opinion/argument vocabulary (not trend/data vocabulary)
6. ✅ Theory buttons show Task 2 content (thesis statements, linking devices, topic vocabulary)

### 4.3 — Navigation

1. ✅ Writing skill page shows two separate sections: Task 1 and Task 2
2. ✅ Each section shows its own lessons and exercises
3. ✅ Clicking a Task 2 exercise opens it correctly

---

## Step 5: Commit

```bash
git add -A
git commit -m "feat(ielts): add Writing Task 2 frontend layout and navigation"
```

---

## Post-Implementation Checklist

| Check | Status |
|-------|--------|
| Task 2 theory lessons visible in sidebar | ☐ |
| Task 2 exercises visible in sidebar (separate from Task 1) | ☐ |
| Task 2 exercise layout has no diagram pane | ☐ |
| Task 2 cloze blanks use opinion/argument vocabulary | ☐ |
| Task 2 paragraphs are: Introduction, Body 1, Body 2, Conclusion | ☐ |
| Theory modals show Task 2-specific content | ☐ |
| Task 1 exercises still work correctly (no regression) | ☐ |
| Save Progress and Check Answers work for Task 2 | ☐ |
| Progress tracking works for Task 2 exercises | ☐ |
