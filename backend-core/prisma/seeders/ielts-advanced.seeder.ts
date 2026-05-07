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
}
