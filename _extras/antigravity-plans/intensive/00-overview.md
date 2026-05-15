# IELTS Intensive Module — Refactor Overview

## Goal
Migrate from monolithic `Exam.questions: Json` to a normalized relational schema with file-based seeding and a component-registry frontend.

## Current State
- All IELTS exam data lives in `Exam` model (`backend-core/prisma/schema.prisma:62`) with a single `questions: Json` column.
- Seed data is hardcoded in `backend-core/prisma/seed.ts` and `_extras/seed.ts`.
- Frontend renders questions via large monolithic components in `frontend-web/src/app/ielts/intensive/`.
- Backend API is in `backend-core/src/modules/exams/exams.service.ts` — reads from `Exam` table directly.
- Grading logic in `exams.service.ts:457-547` walks the JSON tree to extract answers.

## Question Type Taxonomy (32 types total)

### LISTENING — 11 types
1. `form_completion` — Form fields with labels (Name: ___, Phone: ___)
2. `note_completion` — Bullets under headings with inline blanks
3. `table_completion` — Grid table with blank cells
4. `flowchart_completion` — Connected boxes/arrows with blanks
5. `summary_completion` — Continuous paragraph with inline blanks
6. `sentence_completion` — Standalone sentences each with one blank
7. `short_answer` — Question displayed, user writes 1-3 word answer
8. `mcq_single` — Radio buttons A/B/C
9. `mcq_multi` — Checkboxes, pick N from A-E
10. `matching` — Prompts → options box A-H
11. `plan_map_diagram` — Image with numbered markers, select from list

### READING — 16 types
1. `tfng` — TRUE/FALSE/NOT GIVEN 3-way toggle
2. `ynng` — YES/NO/NOT GIVEN 3-way toggle
3. `mcq_single` — Radio A/B/C/D
4. `mcq_multi` — Checkboxes, pick 2+ from A-E
5. `matching_information` — Assign paragraph letter to each statement
6. `matching_headings` — Assign heading (i-x) to each paragraph
7. `matching_features` — Match statements to people/categories
8. `matching_sentence_endings` — Match sentence start → ending from list
9. `sentence_completion` — Sentences with blanks, write words
10. `note_completion` — Bullets under headings with blanks
11. `table_completion` — Table grid with blanks
12. `flowchart_completion` — Connected boxes with blanks
13. `summary_completion_free` — Paragraph with blanks, write from passage
14. `summary_completion_wordbank` — Paragraph with blanks, select from word bank
15. `diagram_label` — Image with numbered arrows, write labels
16. `short_answer` — Question with short text answer

### WRITING — 2 types (with data subtypes)
1. `#	Type	What makes it visually unique	Key data fields
1	True / False / Not Given	Statement + 3-way toggle labeled TRUE / FALSE / NOT GIVEN. Tests factual accuracy.	items: [{ questionNumber, statement, answer: "TRUE"|"FALSE"|"NOT GIVEN" }]
2	Yes / No / Not Given	Statement + 3-way toggle labeled YES / NO / NOT GIVEN. Tests writer's opinion/claim. Different labels from TFNG.	items: [{ questionNumber, statement, answer: "YES"|"NO"|"NOT GIVEN" }]
MCQ Family
#	Type	What makes it visually unique	Key data fields
3	MCQ Single	Question + radio buttons (A/B/C/D — often 4 options, not 3 like Listening).	items: [{ questionNumber, questionText, options: {A,B,C,D}, answer }]
4	MCQ Multi	Question + checkboxes. Pick 2+ correct answers from A–E/F.	items: [{ questionNumbers[], questionText, options, answer[], gradingNote }]
Matching Family (4 visually distinct formats)
#	Type	What makes it visually unique	Key data fields
5	Matching Information	"Which paragraph contains...?" User assigns a paragraph letter (A–G) to each statement.	items: [{ questionNumber, statement, answer: "A"–"G" }]
6	Matching Headings	List of roman numeral headings (i–x). User assigns one heading per paragraph/section. Heading list is displayed as a separate box.	headingsList: [{ numeral, text }], items: [{ questionNumber, paragraph, answer }]
7	Matching Features	Match statements to people/categories/dates from an options box. Similar to Listening matching but with reading-specific features.	optionsBox: { title, options }, items: [{ questionNumber, statement, answer }]
8	Matching Sentence Endings	Left: sentence beginnings. Right: list of endings (A–G). User matches each start to its correct ending. Two-column layout.	endings: [{ letter, text }], items: [{ questionNumber, sentenceStart, answer }]
Completion Family (5 visually distinct formats)
#	Type	What makes it visually unique	Key data fields
9	Sentence Completion	Individual standalone sentences with ___ blank. Write word(s) from passage.	items: [{ questionNumber, sentenceText, answer }]
10	Note Completion	Bullet points under headings with blanks. Same visual as Listening but in reading context (split-screen with passage).	content: [{ heading, points }]
11	Table Completion	Grid table with headers and blank cells.	table: { headers[], rows[] }
12	Flow-chart Completion	Sequential connected boxes with blanks.	steps: [{ stepNumber, text, questionNumber?, answer? }]
13	Summary Completion (free text)	Continuous paragraph with blanks. User writes word(s) from the passage. No word bank. Text input.	paragraph, items: [{ questionNumber, answer }]
14	Summary Completion (word bank)	Same paragraph layout BUT with a word bank box displayed. User selects from provided options. Dropdown or drag. Visually and data-wise different from #13.	paragraph, optionsBox: { options }, items: [{ questionNumber, answer }]
Other
#	Type	What makes it visually unique	Key data fields
15	Diagram Label Completion	Image (technical diagram, machine, building) with numbered arrows. User writes labels.	imageUrl, items: [{ questionNumber, answer }]
16	Short-answer Questions	A question (ends with ?), user writes a short answer from the passage.	items: [{ questionNumber, questionText, answer }]` — Image + prompt + editor (150+ words). Subtypes: line_graph, bar_chart, pie_chart, table, mixed_chart, map, process_manmade, process_natural
2. `task_2_essay` — Prompt + instruction + editor (250+ words)

### SPEAKING — 3 types
1. `part_1_interview` — Examiner video + 4 questions + record per question
2. `part_2_cue_card` — Cue card + timers + examiner video + record
3. `part_3_discussion` — Examiner video + 4-6 abstract questions + record

## Phases
- `01-schema.md` — Prisma schema (new normalized models + migration)
- `02-seed-pipeline.md` — JSON files + modular seeders
- `03-api.md` — Backend API endpoints
- `04-listening-components.md` — 11 Listening question-type components
- `05-reading-components.md` — 16 Reading question-type components
- `06-writing-components.md` — Writing components
- `07-speaking-components.md` — Speaking components
- `08-grading.md` — Update grading + analytics
- `09-cleanup.md` — Remove old Exam JSON, wire everything together

## Key Files
- Schema: `backend-core/prisma/schema.prisma`
- Current seed: `backend-core/prisma/seed.ts`
- Old seed data: `_extras/seed.ts`
- Exams service: `backend-core/src/modules/exams/exams.service.ts`
- Frontend intensive: `frontend-web/src/app/ielts/intensive/`
- Frontend take page: `frontend-web/src/app/ielts/intensive/[examId]/take/`
- Frontend result page: `frontend-web/src/app/ielts/intensive/[examId]/result/`
