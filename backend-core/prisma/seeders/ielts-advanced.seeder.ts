import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export async function seedIeltsAdvanced(prisma: PrismaClient) {
  console.log("  Seeding IELTS Advanced Listening...");

  const parts = [
    {
      file: "listening_Chapter_01_Note-Form_Completion_Questions_1-10_Cousins_Trip.json",
      title: "Planning a Cousins' Family Trip",
      partNumber: 1,
      types: ["form_completion"],
    },
    {
      file: "listening_Part_02_Football_History_1-10.json",
      title: "Football History from 1870",
      partNumber: 2,
      types: ["multiple_choice", "matching"],
    },
    {
      file: "listening_Part_03_Handwriting_Skills.json",
      title: "Importance of Handwriting Skills",
      partNumber: 3,
      types: ["multiple_choice_multiple", "multiple_choice"],
    },
    {
      file: "listening_Part_04_Predatory_Birds.json",
      title: "Ecological Role of Predatory Birds",
      partNumber: 4,
      types: ["form_completion"],
    },
  ];

  await (prisma as any).ieltsAdvancedListeningPart.deleteMany({});

  for (const p of parts) {
    const jsonPath = path.join(
      __dirname,
      "..",
      "data",
      "ielts-advanced-compiled",
      p.file,
    );
    if (!fs.existsSync(jsonPath)) {
      console.error("  JSON file missing", jsonPath);
      continue;
    }
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"))[0];

    const part = await (prisma as any).ieltsAdvancedListeningPart.create({
      data: {
        title: p.title,
        partNumber: p.partNumber,
        audioUrl: jsonData.audio_url,
        transcript: jsonData.transcript,
        content: jsonData.content,
        questionTypes: p.types,
      },
    });
    console.log(`    Seeded Part ${p.partNumber} success: `, part.id);
  }

  console.log("  Seeding IELTS Advanced Reading...");

  const readingParts = [
    {
      file: "reading_Part_01_The_development_of_the_London_underground_railway.json",
      partNumber: 1,
    },
    {
      file: "reading_Part_02_Stadiums_past_present_and_future.json",
      partNumber: 2,
    },
    {
      file: "reading_Part_03_To_catch_a_king.json",
      partNumber: 3,
    },
  ];

  await (prisma as any).ieltsAdvancedReadingPart.deleteMany({});

  for (const p of readingParts) {
    const jsonPath = path.join(
      __dirname,
      "..",
      "data",
      "ielts-advanced-compiled",
      p.file,
    );
    if (!fs.existsSync(jsonPath)) {
      console.error("  JSON file missing", jsonPath);
      continue;
    }
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"))[0];

    // dynamically extract question types from content array
    const qTypes = jsonData.content.map((c: any) => c.type);
    const uniqueTypes = Array.from(new Set(qTypes)) as string[];

    const part = await (prisma as any).ieltsAdvancedReadingPart.create({
      data: {
        title: jsonData.title,
        partNumber: p.partNumber,
        passage: jsonData.passage,
        passageWithLocations: jsonData.passage_with_locations,
        content: jsonData.content,
        questionTypes: uniqueTypes,
      },
    });
    console.log(`    Seeded Reading Part ${p.partNumber} success: `, part.id);
  }

  await seedWritingPrompts(prisma);
  await seedSpeakingParts(prisma);
}

async function seedWritingPrompts(prisma: PrismaClient) {
  console.log("  Seeding IELTS Advanced Writing Prompts...");

  const jsonPath = path.join(
    __dirname,
    "..",
    "data",
    "ielts-advanced-compiled",
    "writing-prompts.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.error("  writing-prompts.json not found — skipping writing seeder");
    return;
  }

  const prompts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  await (prisma as any).ieltsAdvancedWritingPrompt.deleteMany({});

  let seeded = 0;
  for (const p of prompts) {
    await (prisma as any).ieltsAdvancedWritingPrompt.create({
      data: {
        taskType: p.taskType,
        subType: p.subType,
        source: p.source,
        category: p.category,
        bookNumber: p.bookNumber ?? null,
        testNumber: p.testNumber ?? null,
        title: p.title,
        prompt: p.prompt,
        imageUrl: p.imageUrl ?? null,
        minimumWords: p.minimumWords,
        suggestedTime: p.suggestedTime,
        difficulty: p.difficulty,
        engnovateSlug: p.engnovateSlug ?? null,
      },
    });
    seeded++;
  }

  console.log(`    Seeded ${seeded} writing prompts`);
}

type SpeakingPartSeed = {
  engnovateSlug: string;
  partNumber: 1 | 2 | 3;
  partType: "interview" | "cue_card" | "discussion";
  topic: string;
  source: string;
  category: string;
  bookNumber: number | null;
  testNumber: number | null;
  title: string;
  questions: Array<{ text: string }>;
};

function isValidQuestions(value: unknown): value is Array<{ text: string }> {
  return (
    Array.isArray(value) &&
    value.every(
      (q) =>
        q &&
        typeof q === "object" &&
        typeof (q as { text?: unknown }).text === "string" &&
        (q as { text: string }).text.trim().length > 0,
    )
  );
}

async function seedSpeakingParts(prisma: PrismaClient) {
  console.log("  Seeding IELTS Advanced Speaking Parts...");

  const jsonPath = path.join(
    __dirname,
    "..",
    "data",
    "ielts-advanced-compiled",
    "speaking-parts.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.error("  speaking-parts.json not found — skipping speaking seeder");
    return;
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as unknown;
  if (!Array.isArray(raw)) {
    throw new Error("speaking-parts.json must be an array");
  }

  const parts = raw as SpeakingPartSeed[];

  // Clear existing speaking data first (sessions -> parts)
  await (prisma as any).ieltsAdvancedSpeakingSession.deleteMany({});
  await (prisma as any).ieltsAdvancedSpeakingPart.deleteMany({});

  let seeded = 0;
  let skipped = 0;
  const validPartTypes = new Set(["interview", "cue_card", "discussion"]);

  for (const p of parts) {
    if (![1, 2, 3].includes(p.partNumber)) {
      skipped++;
      console.warn(`    Skipping invalid partNumber: ${p.partNumber} (${p.title})`);
      continue;
    }
    if (!validPartTypes.has(p.partType)) {
      skipped++;
      console.warn(`    Skipping invalid partType: ${p.partType} (${p.title})`);
      continue;
    }
    if (!p.title?.trim()) {
      skipped++;
      console.warn("    Skipping row with empty title");
      continue;
    }
    if (!isValidQuestions(p.questions)) {
      skipped++;
      console.warn(`    Skipping invalid questions payload: ${p.title}`);
      continue;
    }

    try {
      await (prisma as any).ieltsAdvancedSpeakingPart.create({
        data: {
          partNumber: p.partNumber,
          partType: p.partType,
          topic: p.topic,
          source: p.source,
          category: p.category,
          bookNumber: p.bookNumber ?? null,
          testNumber: p.testNumber ?? null,
          title: p.title,
          questions: p.questions,
          engnovateSlug: p.engnovateSlug ?? null,
        },
      });
      seeded++;
    } catch (err: any) {
      // Handle duplicates from compound unique (engnovateSlug, partNumber)
      if (err?.code === "P2002") {
        skipped++;
        console.warn(`    Skipping duplicate: ${p.engnovateSlug} part ${p.partNumber}`);
      } else {
        throw err;
      }
    }
  }

  console.log(`    Seeded ${seeded} speaking parts (${skipped} skipped)`);
}
