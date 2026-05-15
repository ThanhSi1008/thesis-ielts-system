# Phase 1 — Content Authoring (Theory)

> **Goal:** Create `writing_task_2_theory.txt` with 6 complete lessons following the exact same format as the existing `writing_theory.txt`.
> **Dependencies:** None. **Effort:** ~3-4 hours (content-heavy).

---

## Step 1: Create the Theory File

**File:** `backend-core/prisma/data/ielts-basic-compiled/writing_task_2_theory.txt` (create new)

### File Structure

The file MUST follow this exact indentation pattern (4 spaces per level). The seeder parses this format:

```
- writing_task_2 + theory
    - Lesson Title
        - Content
            (markdown content here — tables, images, headers, etc.)
            
            - Task Achievement
                (content specific to Task Achievement)
            - Grammar + Coherence & Cohesion
                (content specific to Grammar)
            - Lexical Resource
                (content specific to Lexical Resource)
        - Quiz
            1. Question text?
            A) Option A
            B) Option B
            C) Option C
            D) Option D
            **Hint:** hint text
            **Answer:** B
            **Why:** explanation text
```

> **CRITICAL:** The seeder maps `Task Achievement` → type `"traps"`, `Grammar + Coherence & Cohesion` → type `"strategy"`, `Lexical Resource` → type `"tips"`. These map names MUST be used exactly. The frontend uses these types to display the correct theory modal when clicking the 3 buttons (Target 🟢, Link 🔗, BookOpen 📖).

---

## Step 2: Write Lesson 1 — Introduction to Writing Task 2

### Content Section

Write the following content topics:

```markdown
## 1. The Logistics

- **Time:** 40 minutes (spend more time on Task 2 than Task 1)
- **Length:** At least **250 words**
- **Weight:** 2/3 of your total Writing score (Task 1 is only 1/3)
- **Format:** You are given a statement or question about a topic. You must write an essay responding to it.

## 2. The 5 Question Types

1. **Opinion Essay (Agree/Disagree):** "To what extent do you agree or disagree?"
2. **Discussion Essay (Both Views):** "Discuss both views and give your own opinion."
3. **Problem & Solution:** "What are the problems? What solutions can you suggest?"
4. **Advantages & Disadvantages:** "Do the advantages outweigh the disadvantages?"
5. **Two-Part Question:** "Why is this happening? Is this a positive or negative development?"

## 3. The Golden Structure (4 paragraphs)

- **Paragraph 1: Introduction** (2-3 sentences)
    - Paraphrase the question
    - State your thesis/position clearly
- **Paragraph 2: Body 1** (5-7 sentences)
    - Main argument/view/cause with examples
- **Paragraph 3: Body 2** (5-7 sentences)
    - Second argument/counter-view/solution with examples
- **Paragraph 4: Conclusion** (2-3 sentences)
    - Summarize your main points
    - Restate your opinion

## 4. How You Are Graded (same 4 criteria as Task 1)

1. **Task Achievement (Task Response):** Did you address ALL parts of the question? Is your position clear throughout?
2. **Coherence and Cohesion:** Is the essay logically organized? Do paragraphs flow naturally?
3. **Lexical Resource:** Did you use topic-specific vocabulary accurately?
4. **Grammatical Range and Accuracy:** Did you use complex sentence structures correctly?

## 5. Critical Don'ts

- **Don't be vague:** Take a clear position. "I somewhat agree" is weak.
- **Don't repeat the question word-for-word:** Paraphrase it.
- **Don't write a memorized essay:** The examiner can tell.
- **Don't forget the conclusion:** An incomplete essay cannot score above Band 5.
- **Don't write fewer than 250 words:** You WILL be penalized.
```

### Task Achievement Sub-Block

```markdown
| Part | What to Write |
| --- | --- |
| Introduction | Paraphrase the question + clear thesis statement |
| Body 1 | First main idea + explanation + example |
| Body 2 | Second main idea + explanation + example |
| Conclusion | Summary + restate opinion (no new ideas) |

**The thesis statement is the most important sentence in the essay.**

Example thesis for "Agree/Disagree":
- "I strongly agree that governments should invest more in public transportation."
- "While some may argue otherwise, I firmly believe that the benefits of remote work far outweigh its drawbacks."
```

### Grammar + Coherence & Cohesion Sub-Block

```markdown
| **Function** | **Phrases** |
| --- | --- |
| **Stating opinion** | I firmly believe / I strongly agree / In my view / From my perspective |
| **Adding arguments** | Furthermore / Moreover / In addition / What is more |
| **Contrasting** | However / On the other hand / Nevertheless / Conversely |
| **Giving examples** | For instance / For example / A case in point is / To illustrate |
| **Cause & Effect** | Consequently / As a result / Therefore / This leads to |
| **Conceding** | Although / While it is true that / Despite / Admittedly |
| **Concluding** | In conclusion / To sum up / Overall / Taking everything into account |
```

### Lexical Resource Sub-Block

```markdown
Common topic vocabulary banks:

| **Topic** | **Key Vocabulary** |
| --- | --- |
| **Education** | curriculum, tuition, scholarship, academic, literacy, compulsory, tertiary |
| **Technology** | innovation, automation, digital literacy, artificial intelligence, cybersecurity |
| **Environment** | sustainability, carbon emissions, renewable energy, biodiversity, deforestation |
| **Health** | pandemic, sedentary lifestyle, mental health, obesity, healthcare system |
| **Society** | inequality, globalisation, urbanisation, cultural heritage, social cohesion |
| **Crime** | rehabilitation, deterrent, recidivism, incarceration, juvenile delinquency |
```

### Quiz Section

Write 6-9 MCQ questions testing comprehension. Example:

```
1. How much time should you spend on Writing Task 2?
A) 20 minutes
B) 30 minutes
C) 40 minutes
D) 60 minutes
**Hint:** Task 2 is worth more than Task 1, so allocate more time.
**Answer:** C
**Why:** The lesson states you should spend 40 minutes on Task 2.
```

---

## Step 3: Write Lesson 2 — Opinion Essay (Agree/Disagree)

### Content Topics to Cover:

- When you see the question "To what extent do you agree or disagree?"
- Two approaches: **Fully agree/disagree** (easier) vs **Partially agree** (harder)
- Structure for a fully agree essay vs partially agree

### Task Achievement:

```markdown
| Part | Fully Agree | Partially Agree |
| --- | --- | --- |
| Introduction | Paraphrase + "I strongly agree that..." | Paraphrase + "While I agree that X, I also believe Y" |
| Body 1 | First reason you agree + example | The side you agree with more + example |
| Body 2 | Second reason you agree + example | The other side (concede) + example |
| Conclusion | Restate agreement | Restate balanced position |
```

### Grammar + Coherence & Cohesion:

Provide sentence templates specific to opinion essays:

```markdown
| **Template** | **Example** |
| --- | --- |
| I strongly agree/disagree that [topic] because [reason]. | I strongly agree that university education should be free because it promotes social equality. |
| The main reason I hold this view is that [argument]. | The main reason I hold this view is that free education reduces financial barriers for low-income families. |
| [Concession], I still believe that [main position]. | Although some argue this would burden taxpayers, I still believe that the long-term benefits outweigh the costs. |
| A compelling example of this is [example]. | A compelling example of this is the Scandinavian model, where free tertiary education has led to higher literacy rates. |
```

### Lexical Resource:

Agreement/disagreement phrases with intensity levels:

```markdown
| **Intensity** | **Agree** | **Disagree** |
| --- | --- | --- |
| Strong | I firmly/strongly believe, I am convinced | I completely/strongly disagree, I am firmly opposed |
| Moderate | I agree to a large extent, I generally agree | I tend to disagree, I partially disagree |
| Balanced | While I lean towards agreement, I acknowledge... | Although there is some merit, I maintain... |
```

### Quiz: 6-9 MCQs testing the Opinion Essay lesson

---

## Step 4: Write Lesson 3 — Discussion Essay (Both Views)

### Content Topics:
- Trigger phrase: "Discuss both views and give your own opinion"
- MUST present BOTH sides, then state your own view
- Common mistake: only discussing one side

### Task Achievement:

```markdown
| Part | What to Write |
| --- | --- |
| Introduction | Paraphrase + acknowledge both views exist |
| Body 1 | First view (the one you disagree with) + reasons + example |
| Body 2 | Second view (the one you agree with) + reasons + example |
| Conclusion | Your own opinion + brief summary |
```

### Grammar: Templates for presenting opposing views
### Lexical Resource: Phrases for discussing multiple viewpoints
### Quiz: 6-9 MCQs

---

## Step 5: Write Lesson 4 — Problem & Solution Essay

### Content Topics:
- Trigger phrases: "What problems does this cause?", "What solutions can you suggest?"
- Structure: Problems in Body 1, Solutions in Body 2
- Solutions should be specific and realistic

### Task Achievement:

```markdown
| Part | What to Write |
| --- | --- |
| Introduction | Paraphrase the topic + mention both problems and solutions exist |
| Body 1 | 2-3 problems with explanations |
| Body 2 | 2-3 solutions (ideally matching the problems above) |
| Conclusion | Summary + call to action |
```

### Grammar: Cause/effect sentence structures
### Lexical Resource: Problem/solution vocabulary
### Quiz: 6-9 MCQs

---

## Step 6: Write Lesson 5 — Advantages & Disadvantages Essay

### Content Topics:
- Trigger phrase: "Do the advantages outweigh the disadvantages?"
- Must discuss BOTH pros and cons
- Take a clear position on which side outweighs

### Task Achievement:

```markdown
| Part | What to Write |
| --- | --- |
| Introduction | Paraphrase + state whether advantages or disadvantages outweigh |
| Body 1 | Advantages (or whichever side is stronger) + examples |
| Body 2 | Disadvantages + examples |
| Conclusion | Restate which side outweighs + brief explanation |
```

### Grammar: Comparison/weighing sentence structures
### Lexical Resource: Advantage/disadvantage vocabulary
### Quiz: 6-9 MCQs

---

## Step 7: Write Lesson 6 — Two-Part Question Essay

### Content Topics:
- Contains TWO distinct questions that must BOTH be answered
- Common mistake: only answering one question
- Each body paragraph answers one question

### Task Achievement:

```markdown
| Part | What to Write |
| --- | --- |
| Introduction | Paraphrase both questions |
| Body 1 | Answer to Question 1 (e.g., "Why is this happening?") |
| Body 2 | Answer to Question 2 (e.g., "Is this positive or negative?") |
| Conclusion | Brief summary of both answers |
```

### Grammar: Templates for addressing dual questions
### Lexical Resource: Cause/evaluation vocabulary
### Quiz: 6-9 MCQs

---

## Step 8: Validate the File

After writing, verify:

1. ✅ File uses exact indentation pattern (4 spaces per level)
2. ✅ Top line is `- writing_task_2 + theory`
3. ✅ Each lesson has `- Content` (with 3 sub-blocks) and `- Quiz`
4. ✅ Sub-blocks are labeled exactly: `- Task Achievement`, `- Grammar + Coherence & Cohesion`, `- Lexical Resource`
5. ✅ Quiz answers use format: `**Answer:** X` and `**Why:** explanation`
6. ✅ All 6 lessons are present

### Test Parse

After creating the file, the seeder function `getTheoryLessons()` in `ielts-basic.seeder.ts` will parse it. Verify by adding a temporary log:

```typescript
const theoryArr = getTheoryLessons(path.join(baseDir, "writing_task_2_theory.txt"));
console.log(`Task 2 theory lessons found: ${theoryArr.length}`);
// Expected: 6
```
