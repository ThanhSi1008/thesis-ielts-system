import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IELTS data...');

  const extrasDir = path.join(__dirname, '../../../_extras/question_types');
  const listeningDir = path.join(extrasDir, 'listening');

  // 1. Create Skills
  const listeningSkill = await prisma.ieltsSkill.upsert({
    where: { name: 'Listening' },
    update: {},
    create: {
      name: 'Listening',
      order: 1,
    },
  });

  const readingSkill = await prisma.ieltsSkill.upsert({
    where: { name: 'Reading' },
    update: {},
    create: {
      name: 'Reading',
      order: 2,
    },
  });

  await prisma.ieltsSkill.upsert({ where: { name: 'Writing' }, update: {}, create: { name: 'Writing', order: 3 } });
  await prisma.ieltsSkill.upsert({ where: { name: 'Speaking' }, update: {}, create: { name: 'Speaking', order: 4 } });

  // 2. Parse theory.txt for Listening Lessons
  const theoryFilePath = path.join(listeningDir, '1. theory', 'theory.txt');
  if (fs.existsSync(theoryFilePath)) {
    const content = fs.readFileSync(theoryFilePath, 'utf-8');
    const sections = content.split('\n    - ').slice(1); // very naive split based on indentation format in the file
    
    let order = 1;
    for (const section of sections) {
      if (section.trim().length === 0) continue;
      
      const titleMatch = section.match(/^(.*?)\n/);
      if (!titleMatch) continue;
      
      const title = titleMatch[1].trim();
      let contentBlock = '';
      
      const contentMatch = section.split(/        - Content(.*?)        - Quiz/s);
      if (contentMatch.length > 1) {
        contentBlock = contentMatch[1].trim();
      } else {
        const contentMatchAlternate = section.split(/        - Content/s);
        if (contentMatchAlternate.length > 1) {
          contentBlock = contentMatchAlternate[1].trim();
        }
      }

      await prisma.ieltsLesson.create({
        data: {
          skillId: listeningSkill.id,
          chapter: `Chapter ${order.toString().padStart(2, '0')}`,
          title: title,
          content: JSON.stringify({ markdown: contentBlock }),
          order: order++,
        }
      });
      console.log(`Created lesson: ${title}`);
    }
  }

  // 3. Fetch Exercises
  const exercisesDir = path.join(listeningDir, '2. exercises');
  if (fs.existsSync(exercisesDir)) {
    const chapters = fs.readdirSync(exercisesDir);
    
    let exOrder = 1;

    for (const chapterFolder of chapters) {
      const chapterPath = path.join(exercisesDir, chapterFolder);
      if (!fs.statSync(chapterPath).isDirectory()) continue;
      
      // Match lesson by name roughly (e.g. "Chapter 01 - Multiple Choice" -> "Multiple Choice")
      const titleParts = chapterFolder.split(' - ');
      const lessonTitleSearch = titleParts.length > 1 ? titleParts[1] : chapterFolder;
      
      const lesson = await prisma.ieltsLesson.findFirst({
        where: { skillId: listeningSkill.id, title: lessonTitleSearch }
      });

      const parts = fs.readdirSync(chapterPath);
      for (const part of parts) {
         const dataJsonPath = path.join(chapterPath, part, 'data.json');
         if (fs.existsSync(dataJsonPath)) {
            const dataStr = fs.readFileSync(dataJsonPath, 'utf-8');
            try {
              const dataObjList = JSON.parse(dataStr);
              for (const exerciseData of dataObjList) {
                await prisma.ieltsExercise.create({
                  data: {
                    skillId: listeningSkill.id,
                    lessonId: lesson ? lesson.id : null,
                    topic: exerciseData.topic || "Unknown Topic",
                    instructions: exerciseData.instructions || "",
                    audioUrl: exerciseData.audio_url || "",
                    transcript: exerciseData.transcript || null,
                    content: exerciseData.content || [],
                    order: exOrder++
                  }
                });
                console.log(`Created exercise: ${exerciseData.topic}`);
              }
            } catch(e) {
              console.error(`Error parsing JSON at ${dataJsonPath}:`, e);
            }
         }
      }
    }
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
