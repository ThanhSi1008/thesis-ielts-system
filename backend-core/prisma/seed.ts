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
import { vocabularyBooks } from "./data/foundationVocabWord";
import { grammarBooks } from "./data/grammar";
import * as fs from 'fs';
import * as path from 'path';

const intermediateData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'grammar-intermediate.json'), 'utf-8'));
import { pronunciationSounds } from "./data/pronunciation";
import { seedPronunciation } from "./seeders/pronunciation.seed";
import { seedIeltsBasic } from "./seeders/ielts-basic.seeder";
import { seedIeltsAdvanced } from "./seeders/ielts-advanced.seeder";
import { seedShadowingLessons, seedDictationLessons } from "./seeders/shadowing.seeder";

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
  const existing = await prisma.ieltsIntensiveExam.findFirst({
    where: { title: params.title, type: params.type as any },
    select: { id: true },
  });

  if (existing) {
    await prisma.ieltsIntensiveExam.update({
      where: { id: existing.id },
      data: {
        difficulty: params.difficulty as any,
        duration: params.durationMinutes,
        imageUrl: params.imageUrl,
        questions: params.questions,
        isPublished: params.isPublished,
      },
    });
    console.log(`  ✓ Updated ieltsIntensiveExam: ${params.title}`);
    return;
  }

  await prisma.ieltsIntensiveExam.create({
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
  console.log(`  ✓ Created ieltsIntensiveExam: ${params.title}`);
}

async function main() {
  console.log("🌱 Seeding database with comprehensive foundationVocabWord data...");

  // Clear existing data safely
  console.log("🗑️  Clearing existing progress data...");
  try {
    await prisma.foundationVocabProgress.deleteMany();
    await prisma.foundationPronunciationAttempt.deleteMany();
  } catch (e) {
    console.warn("⚠️  Could not clear some data...");
  }

  // Seed FoundationVocabWord Books
  console.log("📚 Seeding foundationVocabWord books...");
  for (const book of vocabularyBooks) {
    let existingBook = await prisma.foundationVocabBook.findFirst({
      where: { name: book.name }
    });

    if (existingBook) {
      existingBook = await prisma.foundationVocabBook.update({
        where: { id: existingBook.id },
        data: {
          imageUrl: book.imageUrl,
          wordCount: book.wordCount,
          order: book.order,
        }
      });
    } else {
      existingBook = await prisma.foundationVocabBook.create({
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
      let existingUnit = await prisma.foundationVocabUnit.findFirst({
        where: { bookId, title: unit.title }
      });

      if (existingUnit) {
        existingUnit = await prisma.foundationVocabUnit.update({
          where: { id: existingUnit.id },
          data: {
            order: unit.order,
            storyTitle: (unit as any).story?.title || null,
            storyContent: (unit as any).story?.content || null,
            storyImageUrl: (unit as any).story?.imageUrl || null,
          }
        });
      } else {
        existingUnit = await prisma.foundationVocabUnit.create({
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
      await prisma.foundationVocabItem.deleteMany({ where: { unitId } });
      await prisma.foundationVocabExercise.deleteMany({ where: { unitId } });
      await prisma.foundationVocabQuestion.deleteMany({ where: { unitId } });

      if ((unit as any).words) {
        await prisma.foundationVocabItem.createMany({
          data: (unit as any).words.map((w: any) => ({
            unitId,
            word: w.word,
            meaning: w.meaning,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
            imageUrl: w.imageUrl || null,
            audioUrl: w.audioUrl || null,
            order: w.order,
          })),
        });
      }

      if ((unit as any).exercises) {
        await prisma.foundationVocabExercise.createMany({
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
        await prisma.foundationVocabQuestion.createMany({
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
    const existing = await prisma.foundationGrammarBook.findUnique({ where: { slug: book.slug } });
    if (existing) {
      await prisma.foundationGrammarBook.update({
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
      await prisma.foundationGrammarBook.create({
        data: {
          slug: book.slug,
          name: book.name,
          author: book.author,
          level: book.level,
          imageUrl: book.imageUrl,
          color: book.color,
          unitCount: book.unitCount,
        }
      });
    }
    const bookId = existing ? existing.id : (await prisma.foundationGrammarBook.findUnique({ where: { slug: book.slug } }))!.id;

    const unitsToSeed = book.slug === 'intermediate' ? intermediateData.units : book.units;

    for (const unitData of unitsToSeed) {
      const content = book.slug === 'intermediate' && intermediateData.content && unitData.order.toString() in intermediateData.content 
        ? (intermediateData.content as any)[unitData.order.toString()] 
        : null;

      const unit = await prisma.foundationGrammarUnit.upsert({
        where: {
          id: existing ? (await prisma.foundationGrammarUnit.findFirst({ where: { bookId, order: unitData.order } }))?.id || 'new-unit-placeholder' : 'new-unit-placeholder'
        },
        create: {
          bookId,
          title: unitData.title,
          order: unitData.order,
          theoryContent: book.slug === 'intermediate' 
            ? `<img src="/images/grammar/intermediate/unit_${unitData.order}.png" alt="Unit ${unitData.order} Theory" class="w-full h-auto object-contain rounded-xl shadow-sm border border-gray-200 bg-white" />` 
            : (content?.theory || null),
        },
        update: {
          title: unitData.title,
          theoryContent: book.slug === 'intermediate' 
            ? `<img src="/images/grammar/intermediate/unit_${unitData.order}.png" alt="Unit ${unitData.order} Theory" class="w-full h-auto object-contain rounded-xl shadow-sm border border-gray-200 bg-white" />` 
            : (content?.theory || null),
        },
      });

      if (content?.exercises?.length) {
        await prisma.foundationGrammarExercise.deleteMany({ where: { unitId: unit.id } });
        for (const ex of content.exercises) {
          await prisma.foundationGrammarExercise.create({
            data: {
              unitId: unit.id,
              section: ex.id,
              question: ex.question,
              type: ex.type || (ex.matches ? 'match' : 'fill_blank'),
              options: ex.options ? (ex.options.verbs ? { verbs: ex.options.verbs } : ex.options) : (ex.verbs ? { verbs: ex.verbs } : null),
              answer: JSON.stringify(ex.items || ex.matches || []),
              order: parseInt(ex.id.split('.')[1]) || 0,
            },
          });
        }
      }
    }
  }

  await seedPronunciation(prisma);

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
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 2",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest2Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 3",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest3Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 4",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest4Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 1",
    difficulty: "ADVANCED",
    durationMinutes: 40,
    type: "LISTENING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest1Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 2",
    difficulty: "ADVANCED",
    durationMinutes: 40,
    type: "LISTENING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest2Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 3",
    difficulty: "ADVANCED",
    durationMinutes: 40,
    type: "LISTENING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest3Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 4",
    difficulty: "ADVANCED",
    durationMinutes: 40,
    type: "LISTENING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest4Questions,
  });
  await upsertCambridgeExam({
    title: "Cambridge IELTS 13 - Listening Test 1",
    difficulty: "INTERMEDIATE",
    durationMinutes: 40,
    type: "LISTENING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts13ListeningTest1Questions,
  });

// ─── Writing Tests ───────────────────────────────────────────
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 1",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_map",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The maps below show an industrial area in the town of Norbiton, and planned future development of the site.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774400584/cam17-test1_ifztbi.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          prompt:
            "It is important for people to take risks, both in their professional lives and their personal lives.\n\nDo you think the advantages of taking risks outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          instruction:
            "Write about the following topic:",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 2",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485815/cam17-test2_caxdco.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Some children spend hours every day on their smartphones.\n\nWhy is this the case? Do you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 3",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The chart below gives information about how families in one country spent their weekly income in 1968 and in 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485815/cam17-test3_ji67c1.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Some people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country if they wish.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 4",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The graph below shows the number of shops that closed and the number of new shops that opened in one country between 2011 and 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485816/cam17-test4_fauyvk.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Nowadays, a growing number of people with health problems are trying alternative medicines and treatments instead of visiting their usual doctor.\n\nDo you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });
  // ─── Speaking Tests ───────────────────────────────────────────
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Speaking Test 1",
    type: "SPEAKING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 15,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "speaking",
      examiner: {
        name: "Jim Hopper",
        role: "IELTS Examiner",
        avatarUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1774672658/jim-hopper_mawpyh.png"
      },
      parts: [
        {
          part_number: 1,
          part_type: "Part 1: History",
          topic: "History",
          questions: [
            {
              text: "What did you study in history lessons when you were at school?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651103/1-1_cas2xq.mp4"
            },
            {
              text: "Did you enjoy studying history at school? Why, or why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651101/1-2_waawji.mp4"
            },
            {
              text: "How often do you watch TV programmes about history now? Why, or why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/1-3_cw4cz4.mp4"
            },
            {
              text: "What period in history would you like to learn more about? Why?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/1-4_vfoyzx.mp4"
            }
          ]
        },
        {
          part_number: 2,
          part_type: "Part 2: Long Turn (Cue Card)",
          topic: "Describe the neighbourhood you lived in when you were a child.",
          cue_card: "Describe the neighbourhood you lived in when you were a child.\nYou should say:\n- where in your town/city the neighbourhood was\n- what kind of people lived there\n- what it was like to live in this neighbourhood\n- and explain whether you would like to live in this neighbourhood in the future.",
          video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774667596/2-1_daeni9.mp4",
          video2: "https://res.cloudinary.com/dalaaegob/video/upload/v1774667596/2-2_caanop.mp4"
        },
        {
          part_number: 3,
          part_type: "Part 3: Discussion Topics",
          topic: "Discussion Topics",
          questions: [
            {
              text: "What sort of things can neighbours do to help each other?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651107/3-1_gjoj8d.mp4"
            },
            {
              text: "How well do people generally know their neighbours in your country?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/3-2_khqn7w.mp4"
            },
            {
              text: "How important do you think it is to have good neighbours?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/3-3_sambxo.mp4"
            },
            {
              text: "Which facilities are most important to people living in cities?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651105/3-4_jzlys0.mp4"
            },
            {
              text: "How does shopping in small local shops differ from shopping in large city centre shops?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/3-5_h7ckie.mp4"
            },
            {
              text: "Do you think that children should always go to the school nearest to where they live?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/3-6_j9dj5u.mp4"
            }
          ]
        }
      ]
    }
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Speaking Test 2",
    type: "SPEAKING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 15,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "speaking",
      examiner: {
        name: "Amber Bennett",
        role: "IELTS Examiner",
        avatarUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1774672202/amber-bennett_yhupu4.png"
      },
      parts: [
        {
          part_number: 1,
          part_type: "Part 1: Reading",
          topic: "Reading",
          questions: [
            {
              text: "Did you have a favourite book when you were a child? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669864/1.1_zsrotd.mp4"
            },
            {
              text: "How much reading do you do for your work/studies? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669860/1.2_ejqmb1.mp4"
            },
            {
              text: "What kinds of books do you read for pleasure? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669860/1.3_gs36fs.mp4"
            },
            {
              text: "Do you prefer to read a newspaper or a magazine online, or to buy a copy? Why?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669862/1.4_xq5p4k.mp4"
            }
          ]
        },
        {
          part_number: 2,
          part_type: "Part 2: Long Turn (Cue Card)",
          topic: "Describe a big city you would like to visit.",
          cue_card: "Describe a big city you would like to visit.\nYou should say:\n- which big city you would like to visit\n- how you would travel there\n- what you would do there\n- and explain why you would like to visit this big city.",
          video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669864/2.1_ckz0y8.mp4",
          video2: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669863/2.2_cy5jf7.mp4"
        },
        {
          part_number: 3,
          part_type: "Part 3: Discussion Topics",
          topic: "Discussion Topics",
          questions: [
            {
              text: "What are the most interesting things to do while visiting cities on holiday?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669868/3.1_hhezku.mp4"
            },
            {
              text: "Why can it be expensive to visit cities on holiday?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.2_ywkn6r.mp4"
            },
            {
              text: "Do you think it is better to visit cities alone or in a group with friends?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.3_agpays.mp4"
            },
            {
              text: "Why have cities increased in size in recent years?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669863/3.4_chcirv.mp4"
            },
            {
              text: "What are the challenges created by ever-growing cities?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.5_bakekj.mp4"
            },
            {
              text: "In what ways do you think cities of the future will be different to cities today?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.6_soujli.mp4"
            }
          ]
        }
      ]
    }
  });


  // Default Decks
  const allUsers = await prisma.user.findMany();
  for (const u of allUsers) {
    const deck = await prisma.deck.findFirst({ where: { userId: u.id, name: "Default" } });
    if (!deck) {
      await prisma.deck.create({ data: { userId: u.id, name: "Default" } });
    }
  }

  console.log("📘 Seeding IELTS Basic Roadmap...");
  await seedIeltsBasic(prisma);

  console.log("📙 Seeding IELTS Advanced Practice...");
  await seedIeltsAdvanced(prisma);

  await seedShadowingLessons(prisma);
  await seedDictationLessons(prisma);

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
