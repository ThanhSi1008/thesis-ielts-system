import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IELTS Advanced Listening...');

  const parts = [
    {
      dir: path.join(__dirname, '..', '..', '_extras', 'part', 'listening', 'part 1', '1. Planning a Cousins’ Family Trip'),
      file: 'listening_Chapter_01_Note-Form_Completion_Questions_1-10_Cousins_Trip.json',
      title: "Planning a Cousins' Family Trip",
      partNumber: 1,
      types: ['form_completion']
    },
    {
      dir: path.join(__dirname, '..', '..', '_extras', 'part', 'listening', 'part 2', '1 Football History from 1870'),
      file: 'listening_Part_02_Football_History_1-10.json',
      title: "Football History from 1870",
      partNumber: 2,
      types: ['multiple_choice', 'matching']
    },
    {
      dir: path.join(__dirname, '..', '..', '_extras', 'part', 'listening', 'part 3', '1. Importance of Handwriting Skills'),
      file: 'handwriting_skills.json',
      title: "Importance of Handwriting Skills",
      partNumber: 3,
      types: ['multiple_choice_multiple', 'multiple_choice']
    },
    {
      dir: path.join(__dirname, '..', '..', '_extras', 'part', 'listening', 'part 4', '1. Ecological Role of Predatory Birds'),
      file: 'predatory_birds.json',
      title: "Ecological Role of Predatory Birds",
      partNumber: 4,
      types: ['form_completion']
    }
  ];

  await (prisma as any).ieltsPracticeListeningPart.deleteMany({});

  for (const p of parts) {
    const jsonPath = path.join(p.dir, p.file);
    if (!fs.existsSync(jsonPath)) {
      console.error('JSON file missing', jsonPath);
      continue;
    }
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))[0];

    const part = await (prisma as any).ieltsPracticeListeningPart.create({
      data: {
        title: p.title,
        partNumber: p.partNumber,
        audioUrl: jsonData.audio_url,
        transcript: jsonData.transcript,
        content: jsonData.content,
        questionTypes: p.types
      }
    });
    console.log(`Seeded Part ${p.partNumber} success: `, part.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
