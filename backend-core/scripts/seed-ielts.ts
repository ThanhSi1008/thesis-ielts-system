import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IELTS data...');

  const extrasDir = path.join(__dirname, '../../_extras/question_types');
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

  const writingSkill = await prisma.ieltsSkill.upsert({ where: { name: 'Writing' }, update: {}, create: { name: 'Writing', order: 3 } });
  await prisma.ieltsSkill.upsert({ where: { name: 'Speaking' }, update: {}, create: { name: 'Speaking', order: 4 } });

  // Helper: parse a theory.txt file and seed lessons for a given skill
  async function seedLessonsFromTheory(theoryFilePath: string, skillId: string) {
    if (!fs.existsSync(theoryFilePath)) {
      console.warn(`Theory file not found: ${theoryFilePath}`);
      return;
    }
    const content = fs.readFileSync(theoryFilePath, 'utf-8');
    const sections = content.split('\n    - ').slice(1);

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
          skillId,
          chapter: `Chapter ${order.toString().padStart(2, '0')}`,
          title,
          content: JSON.stringify({ markdown: contentBlock }),
          order: order++,
        }
      });
      console.log(`Created lesson: ${title}`);
    }
  }

  // 2. Parse theory.txt for Listening Lessons
  const listeningTheoryPath = path.join(listeningDir, '1. theory', 'theory.txt');
  await seedLessonsFromTheory(listeningTheoryPath, listeningSkill.id);

  // 3. Fetch Listening Exercises
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
              await prisma.ieltsListeningExercise.create({
                data: {
                  skillId: listeningSkill.id,
                  lessonId: lesson ? lesson.id : null,
                  topic: exerciseData.topic || "Unknown Topic",
                  instructions: exerciseData.instructions || "",
                  audioUrl: exerciseData.audio_url || "",
                  transcript: exerciseData.transcript ? (Array.isArray(exerciseData.transcript) ? exerciseData.transcript : [{ speaker: '', text: exerciseData.transcript }]) : [],
                  content: exerciseData.content || [],
                  order: exOrder++
                }
              });
              console.log(`Created exercise: ${exerciseData.topic}`);
            }
          } catch (e) {
            console.error(`Error parsing JSON at ${dataJsonPath}:`, e);
          }
        }
      }
    }
  }

  // 4. Parse theory.txt for Writing Task 1 Lessons
  const writingTask1TheoryPath = path.join(extrasDir, 'writing', 'task 1', '1. theory', 'theory.txt');
  await seedLessonsFromTheory(writingTask1TheoryPath, writingSkill.id);

  // 5. Parse Writing Task 1 Exercises
  const writingTask1ExercisesPath = path.join(extrasDir, '_compiled', 'writing_task_1_exercises.txt');
  if (fs.existsSync(writingTask1ExercisesPath)) {
    console.log("Seeding Writing Task 1 Exercises...");
    const text = fs.readFileSync(writingTask1ExercisesPath, 'utf-8');
    const lines = text.split('\n');
    let currentTheme = '';
    let currentSubcategory = '';
    const exercisesToSeed = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('    - ')) {
        currentTheme = line.replace('    - ', '').trim();
        currentSubcategory = '';
      } else if (line.startsWith('        - ') && !line.includes('- Exercise')) {
        currentSubcategory = line.replace('        - ', '').trim();
      } else if (line.indexOf('- Exercise') !== -1) {
        exercisesToSeed.push({ theme: currentTheme, subCategory: currentSubcategory, content: "" });
      } else if (exercisesToSeed.length > 0) {
        exercisesToSeed[exercisesToSeed.length - 1].content += line + "\n";
      }
    }

    let exOrder = 1;
    for (const exObj of exercisesToSeed) {
      const { theme, subCategory, content } = exObj;
      const promptMatch = content.match(/- Prompt\s+([\s\S]*?)\s+-(?: Diagram| Digram) Image Link/);
      const diagramMatch = content.match(/-(?: Diagram| Digram) Image Link\s+([\s\S]*?)\s+- Answer/);
      const introMatch = content.match(/- Introduction\s+([\s\S]*?)\s+- Overview/);
      const overviewMatch = content.match(/- Overview\s+([\s\S]*?)\s+- Body 1/);
      const body1Match = content.match(/- Body 1\s+([\s\S]*?)\s+- Body 2/);
      const body2Match = content.match(/- Body 2\s+([\s\S]+)/);

      const promptText = promptMatch ? promptMatch[1].trim() : "";
      const diagramUrl = diagramMatch ? diagramMatch[1].trim() : "";
      const intro = introMatch ? introMatch[1].trim() : "";
      const overview = overviewMatch ? overviewMatch[1].trim() : "";
      const body1 = body1Match ? body1Match[1].trim() : "";
      const body2 = body2Match ? body2Match[1].trim() : "";

      if (promptText) {
        const topicName = subCategory ? `${theme} - ${subCategory}` : theme;
        // Attempt to match exercise to a lesson based on string similarity later, but for now lessonId is null
        await prisma.ieltsWritingExercise.create({
          data: {
            skillId: writingSkill.id,
            topic: topicName,
            instructions: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
            prompt: promptText,
            diagramUrl: diagramUrl,
            modelAnswer: { intro, overview, body1, body2 },
            order: exOrder++
          }
        });
        console.log(`Created writing exercise: ${topicName}`);
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
