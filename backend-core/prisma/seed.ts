import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import {
  cambridgeIelts17ReadingTest1Questions,
  cambridgeIelts17ReadingTest2Questions,
  cambridgeIelts17ReadingTest3Questions,
  cambridgeIelts17ReadingTest4Questions,
  cambridgeIelts17ListeningTest1Questions,
  cambridgeIelts17ListeningTest2Questions,
  cambridgeIelts17ListeningTest3Questions,
  cambridgeIelts17ListeningTest4Questions,
  cambridgeIelts13ListeningTest1Questions,
} from "./data/mock-tests";
import {
  unit1Words,
  unit1Exercises,
  unit1Questions,
  unit1Story,
  unit2Words,
  unit2Exercises,
  vocabularyBooks,
} from "./data/vocabulary";
import { grammarBooks } from "./data/grammar";
import { pronunciationSounds } from "./data/pronunciation";
import { seedIeltsBasic } from "./seeders/ielts-basic.seeder";
import { seedIeltsAdvanced } from "./seeders/ielts-advanced.seeder";

async function upsertCambridgeExam(params: {
  title: string;
  type:
    | "LISTENING"
    | "READING"
    | "WRITING"
    | "SPEAKING"
    | "FULL_TEST"
    | "PRACTICE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes: number;
  imageUrl?: string;
  questions: any;
  isPublished: boolean;
}) {
  const existing = await prisma.exam.findFirst({
    where: { title: params.title, type: params.type as any },
    select: { id: true },
  });

  if (existing) {
    await prisma.exam.update({
      where: { id: existing.id },
      data: {
        difficulty: params.difficulty as any,
        duration: params.durationMinutes,
        imageUrl: params.imageUrl,
        questions: params.questions,
        isPublished: params.isPublished,
      },
    });
    console.log(`  ✓ Updated exam: ${params.title}`);
    return;
  }

  await prisma.exam.create({
    data: {
      title: params.title,
      description: null,
      imageUrl: params.imageUrl,
      type: params.type as any,
      difficulty: params.difficulty as any,
      duration: params.durationMinutes,
      questions: params.questions,
      isPublished: params.isPublished,
    },
  });
  console.log(`  ✓ Created exam: ${params.title}`);
}

async function main() {
  console.log("🌱 Seeding database with comprehensive vocabulary data...");

  // Clear existing data safely
  console.log("🗑️  Clearing existing progress data...");
  try {
    await prisma.vocabularyProgress.deleteMany();
    await prisma.pronunciationAttempt.deleteMany();
  } catch (e) {
    console.warn("⚠️  Could not clear some data...");
  }

  // Seed Vocabulary Books
  console.log("📚 Seeding vocabulary books...");
  for (const book of vocabularyBooks) {
    let existingBook = await prisma.vocabularyBook.findFirst({
      where: { name: book.name }
    });

    if (existingBook) {
      existingBook = await prisma.vocabularyBook.update({
        where: { id: existingBook.id },
        data: {
          imageUrl: book.imageUrl,
          wordCount: book.wordCount,
          order: book.order,
        }
      });
    } else {
      existingBook = await prisma.vocabularyBook.create({
        data: {
          name: book.name,
          imageUrl: book.imageUrl,
          wordCount: book.wordCount,
          order: book.order,
        }
      });
    }

    const bookId = existingBook.id;

    // Create units
    for (const unit of book.units) {
      let existingUnit = await prisma.vocabularyUnit.findFirst({
        where: { bookId, title: unit.title }
      });

      if (existingUnit) {
        existingUnit = await prisma.vocabularyUnit.update({
          where: { id: existingUnit.id },
          data: {
            order: unit.order,
            storyTitle: (unit as any).story?.title || null,
            storyContent: (unit as any).story?.content || null,
            storyImageUrl: (unit as any).story?.imageUrl || null,
          }
        });
      } else {
        existingUnit = await prisma.vocabularyUnit.create({
          data: {
            bookId,
            title: unit.title,
            order: unit.order,
            storyTitle: (unit as any).story?.title || null,
            storyContent: (unit as any).story?.content || null,
            storyImageUrl: (unit as any).story?.imageUrl || null,
          }
        });
      }

      const unitId = existingUnit.id;

      // Clean and recreate children
      await prisma.vocabularyWord.deleteMany({ where: { unitId } });
      await prisma.vocabularyExercise.deleteMany({ where: { unitId } });
      await prisma.vocabularyQuestion.deleteMany({ where: { unitId } });

      if ((unit as any).words) {
        await prisma.vocabularyWord.createMany({
          data: (unit as any).words.map((w: any) => ({
            unitId,
            word: w.word,
            meaning: w.meaning,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
            imageUrl: w.imageUrl || null,
            order: w.order,
          })),
        });
      }

      if ((unit as any).exercises) {
        await prisma.vocabularyExercise.createMany({
          data: (unit as any).exercises.map((e: any) => ({
            unitId,
            question: e.question,
            answer: e.answer,
            options: e.options,
            order: e.order,
          })),
        });
      }

      if ((unit as any).questions && (unit as any).questions.length > 0) {
        await prisma.vocabularyQuestion.createMany({
          data: (unit as any).questions.map((q: any) => ({
            unitId,
            question: q.question,
            type: q.type,
            options: q.options || null,
            answer: q.answer,
            order: q.order,
          })),
        });
      }
    }
    console.log(`  ✓ Processed: ${book.name}`);
  }

  // Seed Grammar Books
  console.log("📖 Seeding grammar books...");
  for (const book of grammarBooks) {
    const existing = await prisma.grammarBook.findUnique({ where: { slug: book.slug } });
    if (existing) {
      await prisma.grammarBook.update({
        where: { slug: book.slug },
        data: {
          name: book.name,
          author: book.author,
          level: book.level,
          imageUrl: book.imageUrl,
          color: book.color,
          unitCount: book.unitCount,
        }
      });
    } else {
      await prisma.grammarBook.create({
        data: {
          slug: book.slug,
          name: book.name,
          author: book.author,
          level: book.level,
          imageUrl: book.imageUrl,
          color: book.color,
          unitCount: book.unitCount,
          units: {
            create: book.units.map((unit) => ({
              title: unit.title,
              order: unit.order,
            })),
          },
        }
      });
    }
  }

  // Seed Pronunciation Sounds
  console.log("🔊 Seeding pronunciation sounds...");
  for (const sound of pronunciationSounds) {
    await prisma.pronunciationSound.upsert({
      where: { symbol: sound.symbol },
      update: sound,
      create: sound,
    });
  }

  // IELTS exams
  console.log("🧪 Seeding Cambridge IELTS exams...");
  const cambridge17Image = "https://res.cloudinary.com/dalaaegob/image/upload/v1773932448/ed06fa88-6d9c-4142-9c7e-3bcd8613f175.png";
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 1",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest1Questions,
  });

  // Default Decks
  const allUsers = await prisma.user.findMany();
  for (const u of allUsers) {
    const deck = await prisma.deck.findFirst({ where: { userId: u.id, name: "Default" } });
    if (!deck) {
      await prisma.deck.create({ data: { userId: u.id, name: "Default" } });
    }
  }

  console.log("\n✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
