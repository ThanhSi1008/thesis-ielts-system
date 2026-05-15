# Phase 2 — Exercise Data (Model Essays + Cloze Conversion)

> **Goal:** Create `writing_task_2_exercises.txt` with 17 model essays, extend the converter script with Task 2 vocabulary, generate `writing_task_2_cloze_auto.json`.
> **Dependencies:** Phase 1 (theme names must align). **Effort:** ~3-4 hours.

---

## Step 1: Create the Exercises TXT File

**File:** `backend-core/prisma/data/ielts-basic-compiled/writing_task_2_exercises.txt` (create new)

### File Structure

Follow the EXACT same format as `writing_task_1_exercises.txt`, but with these differences:
- No `Diagram Image Link` (or leave empty)
- `Overview` is replaced by `Conclusion`
- Paragraph order: Introduction → Body 1 → Body 2 → Conclusion

```
- writing_task_2 + exercise
    - Opinion Essay
        - Education
            - Exercise 1
                - Question
                    - Prompt

                        Some people believe that university education should be free for all students. To what extent do you agree or disagree?

                    - Diagram Image Link

                        

                - Answer
                    - Introduction

                        It is widely argued that tertiary education should be made available at no cost to all students. I firmly believe that making university education free would yield significant benefits for individuals and society as a whole.

                    - Body 1

                        The most compelling argument in favour of free university education is that it promotes social equality. Currently, many talented students from low-income families are unable to pursue higher education due to prohibitive tuition fees. By removing this financial barrier, governments can ensure that academic potential, rather than economic status, determines who receives a quality education. For instance, countries such as Germany and Norway have implemented free tertiary education, resulting in higher enrollment rates across all socioeconomic groups.

                    - Body 2

                        Furthermore, a more educated workforce contributes significantly to economic growth. University graduates tend to earn higher salaries, pay more taxes, and are less likely to depend on government welfare programs. Consequently, the initial investment in free education can generate substantial long-term returns for the economy. Additionally, sectors facing skill shortages, such as healthcare and technology, would benefit from a larger pool of qualified professionals.

                    - Conclusion

                        In conclusion, I strongly believe that the advantages of free university education, including greater social mobility and enhanced economic productivity, far outweigh the associated costs. Governments should prioritise making higher education accessible to all citizens.

    - Discussion Essay
        - Technology
            - Exercise 1
                - Question
                    - Prompt

                        Some people think that social media has a negative impact on society, while others believe it has many benefits. Discuss both views and give your own opinion.

                    - Diagram Image Link

                        

                - Answer
                    - Introduction

                        (model essay introduction here)

                    - Body 1

                        (first view with arguments and examples)

                    - Body 2

                        (second view with arguments and examples)

                    - Conclusion

                        (your own opinion + summary)
```

### Exercise Topics to Write

Write FULL model essays (all 4 paragraphs) for each:

#### Opinion Essay (4 exercises)
| # | Topic | Prompt |
|---|-------|--------|
| 1 | Education | "Some people believe that university education should be free for all students. To what extent do you agree or disagree?" |
| 2 | Technology | "Some people think that the increasing use of technology in the workplace is a positive development. To what extent do you agree or disagree?" |
| 3 | Environment | "Some people argue that governments should invest more in public transport rather than building new roads. To what extent do you agree or disagree?" |
| 4 | Health | "Some people believe that the government should be responsible for people's health, while others think individuals should take care of their own health. To what extent do you agree or disagree?" |

#### Discussion Essay (4 exercises)
| # | Topic | Prompt |
|---|-------|--------|
| 1 | Technology | "Some people think social media has a negative impact on society. Others believe it brings many benefits. Discuss both views and give your opinion." |
| 2 | Education | "Some people think children should be taught to be competitive. Others believe cooperation is more important. Discuss both views and give your opinion." |
| 3 | Society | "Some people believe that cultural traditions will be destroyed by modern technology. Others think technology helps preserve them. Discuss both views and give your opinion." |
| 4 | Work | "Some people think it is better to work for the same company throughout their career. Others believe changing jobs regularly is beneficial. Discuss both views and give your opinion." |

#### Problem & Solution (3 exercises)
| # | Topic | Prompt |
|---|-------|--------|
| 1 | Environment | "In many cities, traffic congestion is a growing problem. What are the causes of this problem and what measures could be taken to solve it?" |
| 2 | Health | "In many countries, obesity is an increasing problem among young people. What are the causes and what solutions can you suggest?" |
| 3 | Education | "Many students find it difficult to concentrate in class. What are the reasons for this, and what can schools do to address it?" |

#### Advantages & Disadvantages (3 exercises)
| # | Topic | Prompt |
|---|-------|--------|
| 1 | Technology | "Many people now work from home rather than in an office. Do the advantages of working from home outweigh the disadvantages?" |
| 2 | Education | "An increasing number of schools are using computers and tablets in the classroom. Do the advantages outweigh the disadvantages?" |
| 3 | Society | "In some countries, people are moving from rural areas to cities. Do the advantages of urbanisation outweigh the disadvantages?" |

#### Two-Part Question (3 exercises)
| # | Topic | Prompt |
|---|-------|--------|
| 1 | Society | "In many countries, the gap between the rich and the poor is increasing. Why is this happening? Is this a positive or negative development?" |
| 2 | Education | "Some children spend a lot of time on electronic devices rather than playing outdoors. Why is this the case? Is this a positive or negative trend?" |
| 3 | Environment | "The amount of waste produced globally is increasing every year. Why is this happening? What measures could be taken to address this issue?" |

---

## Step 2: Extend the Converter Script

**File:** `backend-core/prisma/data/convert_cloze.js` (modify existing)

### 2.1 — Add Task 2 Distractor Dictionary

Add a separate `task2Dict` alongside the existing `dict` (Task 1). The Task 2 dictionary should focus on **opinion/argument vocabulary** instead of data-reporting vocabulary:

```javascript
const task2Dict = {
  // ── Opinion markers ──
  "argued": ["denied", "proven", "forgotten"],
  "believe": ["doubt", "deny", "assume"],
  "convinced": ["uncertain", "skeptical", "doubtful"],
  "maintain": ["deny", "reject", "question"],
  "contend": ["deny", "concede", "reject"],

  // ── Argument starters / Linking ──
  "Furthermore,": ["However,", "Nevertheless,", "Although,"],
  "Moreover,": ["However,", "Nevertheless,", "Conversely,"],
  "Additionally,": ["However,", "Conversely,", "Nevertheless,"],
  "Consequently,": ["Similarly,", "Meanwhile,", "Furthermore,"],
  "Therefore,": ["However,", "Similarly,", "Meanwhile,"],
  "Nevertheless,": ["Furthermore,", "Moreover,", "Additionally,"],
  "However,": ["Furthermore,", "Moreover,", "Additionally,"],
  "Conversely,": ["Similarly,", "Likewise,", "Furthermore,"],

  // ── Cause / effect ──
  "consequently": ["similarly", "conversely", "meanwhile"],
  "therefore": ["however", "similarly", "meanwhile"],
  "thus": ["however", "likewise", "conversely"],

  // ── Concession ──
  "Although": ["Because", "Since", "When"],
  "Despite": ["Because of", "Due to", "Thanks to"],
  "While": ["Since", "Because", "When"],
  "Admittedly,": ["Clearly,", "Obviously,", "Evidently,"],

  // ── Conclusion ──
  "conclusion,": ["detail,", "addition,", "contrast,"],

  // ── Strength/degree ──
  "significant": ["minimal", "negligible", "slight"],
  "significantly": ["slightly", "minimally", "negligibly"],
  "compelling": ["weak", "questionable", "minor"],
  "substantial": ["minimal", "negligible", "slight"],
  "crucial": ["optional", "trivial", "minor"],

  // ── Opinion intensity ──
  "strongly": ["slightly", "somewhat", "partially"],
  "firmly": ["loosely", "somewhat", "vaguely"],

  // ── Topic vocab: Education ──
  "curriculum": ["infrastructure", "legislation", "revenue"],
  "tuition": ["taxation", "inflation", "employment"],
  "scholarship": ["penalty", "subsidy", "donation"],
  "literacy": ["commerce", "tourism", "agriculture"],
  "compulsory": ["optional", "voluntary", "discretionary"],

  // ── Topic vocab: Technology ──
  "innovation": ["tradition", "regulation", "isolation"],
  "automation": ["regulation", "immigration", "conservation"],
  "cybersecurity": ["agriculture", "architecture", "archaeology"],

  // ── Topic vocab: Environment ──
  "sustainability": ["profitability", "productivity", "popularity"],
  "emissions": ["revenues", "investments", "traditions"],
  "renewable": ["conventional", "traditional", "historical"],
  "biodiversity": ["productivity", "profitability", "popularity"],
  "deforestation": ["urbanisation", "industrialisation", "modernisation"],

  // ── Topic vocab: Health ──
  "obesity": ["prosperity", "stability", "popularity"],
  "sedentary": ["active", "mobile", "dynamic"],
  "pandemic": ["celebration", "tradition", "innovation"],

  // ── Topic vocab: Society ──
  "inequality": ["prosperity", "stability", "harmony"],
  "urbanisation": ["conservation", "preservation", "isolation"],
  "globalisation": ["isolation", "conservation", "stagnation"],
  "rehabilitation": ["punishment", "deportation", "incarceration"],
  "deterrent": ["incentive", "reward", "benefit"]
};
```

### 2.2 — Add Task 2 Parser Section

After the Task 1 section in `convert_cloze.js`, add a new section:

```javascript
// ========== TASK 2 CONVERSION ==========
const task2InputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_2_exercises.txt');
const task2OutputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_2_cloze_auto.json');

if (fs.existsSync(task2InputPath)) {
  // Reset blank counter
  globalBlankId = 1;
  
  const task2Text = fs.readFileSync(task2InputPath, 'utf-8').replace(/\r\n/g, '\n');
  const task2Lines = task2Text.split('\n');
  
  // Same parsing logic as Task 1, but:
  // 1. Use task2Dict instead of dict
  // 2. Parse Conclusion instead of Overview
  // 3. Set taskType: 2
  // 4. diagramUrl is always null/empty
  
  let currentTheme = "";
  let currentSubcategory = "";
  const task2Exercises = [];

  for (let i = 0; i < task2Lines.length; i++) {
    const line = task2Lines[i];
    if (line.startsWith("    - ") && !line.includes("Exercise")) {
      currentTheme = line.replace("    - ", "").trim();
      currentSubcategory = "";
    } else if (line.startsWith("        - ") && !line.includes("- Exercise")) {
      currentSubcategory = line.replace("        - ", "").trim();
    } else if (line.indexOf("- Exercise") !== -1) {
      task2Exercises.push({ theme: currentTheme, subCategory: currentSubcategory, content: "" });
    } else if (task2Exercises.length > 0) {
      task2Exercises[task2Exercises.length - 1].content += line + "\n";
    }
  }

  const task2Output = [];

  for (const exObj of task2Exercises) {
    const { theme, subCategory, content } = exObj;
    const promptMatch = content.match(/- Prompt\s+([\s\S]*?)\s+- Diagram Image Link/);
    const introMatch = content.match(/- Introduction\s+([\s\S]*?)\s+- Body 1/);
    const body1Match = content.match(/- Body 1\s+([\s\S]*?)\s+- Body 2/);
    const body2Match = content.match(/- Body 2\s+([\s\S]*?)\s+- Conclusion/);
    const conclusionMatch = content.match(/- Conclusion\s+([\s\S]+)/);

    const promptText = promptMatch ? promptMatch[1].trim() : "";
    const intro = introMatch ? introMatch[1].trim() : "";
    const body1 = body1Match ? body1Match[1].trim() : "";
    const body2 = body2Match ? body2Match[1].trim() : "";
    const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "";

    if (promptText) {
      const paragraphs = [];
      if (intro) paragraphs.push({ number: 1, title: "Introduction", segments: processTask2Paragraph(intro) });
      if (body1) paragraphs.push({ number: 2, title: "Body 1", segments: processTask2Paragraph(body1) });
      if (body2) paragraphs.push({ number: 3, title: "Body 2", segments: processTask2Paragraph(body2) });
      if (conclusion) paragraphs.push({ number: 4, title: "Conclusion", segments: processTask2Paragraph(conclusion) });

      task2Output.push({
        theme, subCategory,
        prompt: promptText,
        diagramUrl: null,
        taskType: 2,
        modelAnswer: { paragraphs }
      });
    }
  }

  fs.writeFileSync(task2OutputPath, JSON.stringify(task2Output, null, 2));
  console.log(`Generated ${task2Output.length} Task 2 exercises in ${task2OutputPath}`);
}
```

The `processTask2Paragraph()` function is identical to the existing `processParagraph()` but uses `task2Dict` instead of `dict`.

### 2.3 — Run the Converter

```bash
cd backend-core/prisma/data
node convert_cloze.js
# Expected output:
# Generated 20 exercises in .../writing_task_1_cloze_auto.json
# Generated 17 exercises in .../writing_task_2_cloze_auto.json
```

---

## Step 3: Validate the Output JSON

Open `writing_task_2_cloze_auto.json` and verify:

1. ✅ All 17 exercises are present
2. ✅ Each exercise has `taskType: 2`
3. ✅ Each exercise has `diagramUrl: null`
4. ✅ Each exercise has 4 paragraphs: Introduction, Body 1, Body 2, Conclusion
5. ✅ Each paragraph has 2-3 blanks (not more)
6. ✅ Each blank has 4 options (1 correct + 3 distractors)
7. ✅ Distractors are meaningful IELTS vocabulary (not "Option A/B/C")
8. ✅ Blanks test the right vocabulary categories:
   - Introduction: opinion markers ("argued", "believe", "convinced")
   - Body paragraphs: linking devices ("Furthermore", "However", "Consequently") + topic vocabulary
   - Conclusion: concluding phrases ("conclusion")

### Sample Valid Output

```json
{
  "theme": "Opinion Essay",
  "subCategory": "Education",
  "prompt": "Some people believe that university education should be free for all students. To what extent do you agree or disagree?",
  "diagramUrl": null,
  "taskType": 2,
  "modelAnswer": {
    "paragraphs": [
      {
        "number": 1,
        "title": "Introduction",
        "segments": [
          { "type": "text", "value": "It is widely " },
          { "type": "blank", "id": "b1", "correctAnswer": "argued", "options": ["forgotten", "argued", "proven", "denied"] },
          { "type": "text", "value": " that tertiary education should be made available at no cost to all students. I " },
          { "type": "blank", "id": "b2", "correctAnswer": "firmly", "options": ["loosely", "firmly", "vaguely", "somewhat"] },
          { "type": "text", "value": " believe that making university education free would yield " },
          { "type": "blank", "id": "b3", "correctAnswer": "significant", "options": ["negligible", "significant", "minimal", "slight"] },
          { "type": "text", "value": " benefits for individuals and society as a whole." }
        ]
      }
    ]
  }
}
```
