/**
 * patch_lesson_examples.js
 *
 * Injects "example" blocks into each lesson's content array after the
 * "Variations" section. Each example references a real exercise in the DB.
 *
 * Run with: node patch_lesson_examples.js
 */

const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

// ─── Mapping: lessonId → example blocks to inject ─────────────────────────
// Determined by reading the Variations section of each lesson.

const LESSON_EXAMPLES = {

  // Listening | Chapter 02 | Multiple Choice
  // Variations: Single Answer, Multiple Answers  → 2 examples
  "5e5531e2-a206-45c4-a680-3c7629a271dd": [
    {
      type: "example",
      title: "Single Answer",
      exerciseType: "listening",
      exerciseId: "51e3d85d-bece-4b9a-8ea4-6aef7562bda5",  // Melbourne City Tour — multiple_choice
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Multiple Answers",
      exerciseType: "listening",
      exerciseId: "46dbea51-1f54-4e9c-97e7-9642ce2edb1c",  // Psychology Study Abroad — multiple_choice_multiple
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 03 | Note/Form Completion
  // Variations: Note Completion, Form Completion  → 2 examples
  "5c8a292f-bb57-437f-b357-c420b83eefd0": [
    {
      type: "example",
      title: "Note Completion",
      exerciseType: "listening",
      exerciseId: "8112adf9-8875-49c2-9f94-2d479072de47",  // Art Academy Enrolment — form (note-style)
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Form Completion",
      exerciseType: "listening",
      exerciseId: "66e0e4fd-367b-4386-9687-0d408135502d",  // Medical Insurance Inquiry — form
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 04 | Table Completion
  // No variations → 1 example
  "cbb76629-59bf-4242-b83e-a8246ea8bb9c": [
    {
      type: "example",
      title: "Table Completion",
      exerciseType: "listening",
      exerciseId: "e4336602-8fe7-41f4-a77f-53deaae25d98",  // University Housing Options — table
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 05 | Sentence/Summary/Flow-chart/Diagram Completion
  // Variations: Sentence, Summary, Flow-chart, Diagram  → 4 examples
  // NOTE: We don't have a dedicated "sentence completion" exercise; will use short_answer as proxy
  "177bf0f0-0054-48ef-ae9d-27765d8efb9c": [
    {
      type: "example",
      title: "Sentence Completion",
      exerciseType: "listening",
      exerciseId: "938e2b4c-69f9-4cc6-acbf-371a2a774fbe",  // University Literature Degree — summary_completion (sentence-like)
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Summary Completion",
      exerciseType: "listening",
      exerciseId: "ec7e6fc4-b455-427e-be0d-342c3d05b436",  // The decline in outdoor play — summary_completion
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Flow-chart Completion",
      exerciseType: "listening",
      exerciseId: "89d7d292-058d-40d9-b347-a3040363942f",  // Registration Process — flow_chart
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Diagram Completion",
      exerciseType: "listening",
      exerciseId: "6af9e169-e8aa-49cd-9cef-0ae9221586a2",  // Washing Machine — diagram_labelling
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 06 | Matching
  // Variations: Matching Features, Matching Sentence Endings (both share same renderer)
  // → 2 examples from different exercises
  "d9aed80f-cf5f-4c00-ad17-9a4ed80cec72": [
    {
      type: "example",
      title: "Matching Features",
      exerciseType: "listening",
      exerciseId: "8aec531f-792b-45ea-b98d-eacbd4c8c46c",  // Urban Gardening — matching
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Matching Sentence Endings",
      exerciseType: "listening",
      exerciseId: "b1f63ea9-ff82-40bc-9044-c607748db4d0",  // Behavioural Traits of Primates — matching
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 07 | Map/Plan/Diagram Labelling
  // Variations: Map Labelling, Plan Labelling, Diagram Labelling  → 3 examples
  "273ca303-0e2f-4f96-9687-26de14ff09f2": [
    {
      type: "example",
      title: "Map Labelling",
      exerciseType: "listening",
      exerciseId: "af0790dc-baf6-4388-afc5-073c2e56229a",  // Fun Fortress Theme Park Map — map_labelling
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Plan Labelling",
      exerciseType: "listening",
      exerciseId: "dc895809-22f3-41f8-803e-fe6cd65e6168",  // Castle Hill Hotel Lobby Plan — plan_labelling
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Diagram Labelling",
      exerciseType: "listening",
      exerciseId: "6af9e169-e8aa-49cd-9cef-0ae9221586a2",  // Washing Machine — diagram_labelling
      groupIndex: 0,
    },
  ],

  // Listening | Chapter 08 | Short Answer
  // No variations → 1 example
  "e170e8e9-46fb-43f0-9ad7-6dcc19a6637b": [
    {
      type: "example",
      title: "Short Answer Questions",
      exerciseType: "listening",
      exerciseId: "f050b256-c365-473e-8eec-b15a857c4137",  // Euro Travels Coastal Package — short_answer
      groupIndex: 0,
    },
  ],

  // ─── READING LESSONS ─────────────────────────────────────────────────────

  // Reading | Chapter 02 | Multiple Choice
  // Only 1 variation (reading MC is one type, unlike listening) → 1 example
  "a73062e0-3938-4be0-b3fc-071194255d05": [
    {
      type: "example",
      title: "Multiple Choice",
      exerciseType: "reading",
      exerciseId: "b858cb76-dca6-40c0-a662-0e6f47d5ebf5",  // The Mediterranean's History — multiple_choice
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 03 | True/False/Not Given
  // No sub-variations → 1 example
  "9cd19948-9039-4272-84b5-eda6bfaa8e0d": [
    {
      type: "example",
      title: "True / False / Not Given",
      exerciseType: "reading",
      exerciseId: "48209b3a-2e4d-4b8b-b21e-30793d35eccd",  // The Pueblo Indians — true_false_not_given
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 04 | Yes/No/Not Given
  // No sub-variations → 1 example
  "4d500108-97c1-4ac8-8011-d20d2c45fd06": [
    {
      type: "example",
      title: "Yes / No / Not Given",
      exerciseType: "reading",
      exerciseId: "3707cb7d-3f33-4876-a7f8-aaa43c332d0c",  // Language Comprehension — yes_no_not_given
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 05 | Note/Table/Flow-chart/Diagram Completion
  // Variations: Note, Table (same renderer), Flow-chart, Diagram → 4 examples
  // (Table uses NoteCompletion renderer; use note_completion for both)
  "807b9eb0-6424-4ac6-8281-54ca05bc38fe": [
    {
      type: "example",
      title: "Note Completion",
      exerciseType: "reading",
      exerciseId: "b93a33df-a750-4dd5-94bf-69a2204ad325",  // History of Architectural Materials — note_completion
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Table Completion",
      exerciseType: "reading",
      exerciseId: "87ac518e-90c5-4a2d-9613-3390b3a4c010",  // Prairie Ecosystems — note_completion (table-style)
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Flow-chart Completion",
      exerciseType: "reading",
      exerciseId: "cd176cba-07a1-4696-bf0a-5357c64e9113",  // Parrotfish Lifecycle — flowchart_completion
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Diagram Completion",
      exerciseType: "reading",
      exerciseId: "f6bf1675-ecae-4f7d-a0a2-70cb33e630c2",  // Biomimicry and the Eastgate Centre — diagram_completion
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 06 | Sentence Completion
  // Variations: Sentence Completion, Summary Completion → 2 examples
  "87f78159-ed00-4e36-9f5e-a9def3def6ff": [
    {
      type: "example",
      title: "Sentence Completion",
      exerciseType: "reading",
      exerciseId: "a00c28bd-a952-40eb-b628-c88a703236cd",  // Weaver Ants — sentence_completion
      groupIndex: 0,
    },
    {
      type: "example",
      title: "Sentence Endings Matching",
      exerciseType: "reading",
      exerciseId: "badf2734-d7c1-40cd-b8bd-71b81ebbc540",  // Theatreland — matching_sentence_endings
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 07 | Summary Completion
  // No sub-variations → 1 example
  "1a9f1d29-ad3c-4e93-97ff-b60fb9b15064": [
    {
      type: "example",
      title: "Summary Completion",
      exerciseType: "reading",
      exerciseId: "873e5825-6a38-4fb6-81b9-998c0750b015",  // Canadian National Policy — summary_completion
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 08 | Matching Features
  // No sub-variations → 1 example
  "c03ffe36-c76e-4b3f-a75f-06c2a1b4b3b4": [
    {
      type: "example",
      title: "Matching Features",
      exerciseType: "reading",
      exerciseId: "d7d8a4ce-69b0-4360-969d-d4046351801a",  // Pollinators and Human Well-being — matching_features
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 09 | Matching Information
  // No sub-variations → 1 example
  "000733c2-5cda-4f24-b715-5667c6b128ec": [
    {
      type: "example",
      title: "Matching Information",
      exerciseType: "reading",
      exerciseId: "6709f9af-c2d8-4ab8-afdf-c7bb037178cd",  // Parrots: Beloved Pets and Pests — matching_information
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 10 | Matching Headings
  // No sub-variations → 1 example
  "50ab21eb-b5e7-466d-a2fd-f6eed12dd4e4": [
    {
      type: "example",
      title: "Matching Headings",
      exerciseType: "reading",
      exerciseId: "c07e31ce-ee62-4a3a-8fe5-ce77dcf243e2",  // The Rise of Microfibres — matching_headings
      groupIndex: 0,
    },
  ],

  // Reading | Chapter 11 | Short Answer
  // No sub-variations → 1 example
  "2fd39a35-9f3b-4dd4-bc1b-372ab2aa330f": [
    {
      type: "example",
      title: "Short Answer Questions",
      exerciseType: "reading",
      exerciseId: "f692c039-e671-48d2-8759-7397689d0de8",  // A History of Painting Surfaces — short_answer
      groupIndex: 0,
    },
  ],
};

async function main() {
  for (const [lessonId, exampleBlocks] of Object.entries(LESSON_EXAMPLES)) {
    const lesson = await p.ieltsLesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true, content: true },
    });

    if (!lesson) {
      console.warn(`⚠️  Lesson ${lessonId} not found — skipping`);
      continue;
    }

    const content = lesson.content;

    // Find the index of any "section" block whose title contains "Variation"
    const variationsIdx = content.findIndex(
      (b) => b.type === "section" && b.title && b.title.toLowerCase().includes("variation")
    );

    // Determine where to insert: right after the variations section block
    const insertAt = variationsIdx >= 0 ? variationsIdx + 1 : content.length;

    // Remove any previously patched example blocks to avoid duplication
    const cleaned = content.filter((b) => b.type !== "example");

    // Find the "traps" block — insert examples just before it
    const trapsIdx = cleaned.findIndex((b) => b.type === "traps");
    const cleanedInsertAt = trapsIdx >= 0 ? trapsIdx : cleaned.length;

    // Splice in the example blocks
    const updated = [
      ...cleaned.slice(0, cleanedInsertAt),
      ...exampleBlocks,
      ...cleaned.slice(cleanedInsertAt),
    ];

    await p.ieltsLesson.update({
      where: { id: lessonId },
      data: { content: updated },
    });

    console.log(`✅  ${lesson.title} — injected ${exampleBlocks.length} example block(s) at position ${cleanedInsertAt}`);
  }

  console.log('\nDone!');
}

main().finally(() => p.$disconnect());
