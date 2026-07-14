import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export async function seedIeltsBasic(prisma: PrismaClient) {
  const baseDir = path.join(__dirname, "..", "data", "ielts-basic-compiled");
  console.log("  Seeding IELTS basic data from:", baseDir);

  // Clean existing data.
  await prisma.ieltsBasicListeningExercise.deleteMany({});
  await prisma.ieltsBasicReadingExercise.deleteMany({});
  await prisma.ieltsBasicWritingExercise.deleteMany({});
  await prisma.ieltsBasicSpeakingExercise.deleteMany({});
  await prisma.ieltsBasicLesson.deleteMany({});

  // 1. Ensure skills exist
  const skillsData = [
    { name: "Listening", order: 1 },
    { name: "Reading", order: 2 },
    { name: "Writing", order: 3 },
    { name: "Speaking", order: 4 },
  ];

  for (const s of skillsData) {
    await prisma.ieltsBasicSkill.upsert({
      where: { name: s.name },
      update: { order: s.order },
      create: s,
    });
  }

  // 2. Iterate through "listening" and "reading"
  const activeSkills = ["listening", "reading", "writing"];

  for (const skillName of activeSkills) {
    const skillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: skillName.charAt(0).toUpperCase() + skillName.slice(1) },
    });
    if (!skillRecord) continue;

    // Parse Theory
    const theoryPath = path.join(baseDir, `${skillName}_theory.txt`);
    const theoryArr = getTheoryLessons(theoryPath);

    // Parse Exercises
    const exercisesArr = getExercises(baseDir, skillName);

    console.log(
      `  [${skillName}] Found ${theoryArr.length} theory lessons, ${exercisesArr.length} exercises.`,
    );

    // Insert lessons
    let order = 1;
    for (const theory of theoryArr) {
      const foundationVocabLesson = await prisma.ieltsBasicLesson.create({
        data: {
          skillId: skillRecord.id,
          chapter: `Chapter ${String(order).padStart(2, "0")}`,
          title: theory.title,
          content: theory.content,
          quiz: theory.quiz,
          order: order++,
        },
      });
      console.log(`    -> Created foundationVocabLesson: ${foundationVocabLesson.title}`);

      // Robust matching between theory title and filename
      const cleanTheoryTitle = theory.title
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase();

      const matchedExs = exercisesArr.filter((e) => {
        const cleanExTitle = e.chapterFolderName
          .replace(/[^a-zA-Z]/g, "")
          .toLowerCase();
        return (
          cleanExTitle.includes(cleanTheoryTitle) ||
          (cleanTheoryTitle.length > 5 &&
            cleanExTitle.includes(cleanTheoryTitle.substring(0, 10)))
        );
      });

      let exOrder = 1;
      for (const ex of matchedExs) {
        if (ex.seeded) continue;
        if (skillName === "listening") {
          await prisma.ieltsBasicListeningExercise.create({
            data: {
              skillId: skillRecord.id,
              lessonId: foundationVocabLesson.id,
              topic: ex.topic,
              instructions: ex.instructions,
              audioUrl: ex.audioUrl!,
              transcript: ex.transcript,
              content: ex.content,
              order: exOrder++,
            },
          });
        } else if (skillName === "reading") {
          await prisma.ieltsBasicReadingExercise.create({
            data: {
              skillId: skillRecord.id,
              lessonId: foundationVocabLesson.id,
              topic: ex.topic,
              instructions: ex.instructions,
              passage: ex.passage!,
              passageWithLocations: ex.passageWithLocations || [],
              content: ex.content,
              order: exOrder++,
            },
          });
        }
        ex.seeded = true;
      }
    }

    // Unmatched exercises linked to skill only
    let exOrderUnmatched = 100;
    const unmatched = exercisesArr.filter((e: any) => !e.seeded);
    if (unmatched.length > 0) {
      console.log(
        `    -> Found ${unmatched.length} unmatched exercises for ${skillName}. Linking directly to skill without foundationVocabLesson.`,
      );
    }

    for (const ex of unmatched) {
      if (skillName === "listening") {
        await prisma.ieltsBasicListeningExercise.create({
          data: {
            skillId: skillRecord.id,
            topic: ex.topic,
            instructions: ex.instructions,
            audioUrl: ex.audioUrl!,
            transcript: ex.transcript,
            content: ex.content,
            order: exOrderUnmatched++,
          },
        });
      } else if (skillName === "reading") {
        await prisma.ieltsBasicReadingExercise.create({
          data: {
            skillId: skillRecord.id,
            topic: ex.topic,
            instructions: ex.instructions,
            passage: ex.passage!,
            passageWithLocations: ex.passageWithLocations || [],
            content: ex.content,
            order: exOrderUnmatched++,
          },
        });
      }
    }
  }

  // 3. Parse Writing Task 1 Exercises (Auto-Generated Cloze format)
  const writingTask1ExercisesPath = path.join(
    baseDir,
    "writing_task_1_cloze_auto.json",
  );
  if (fs.existsSync(writingTask1ExercisesPath)) {
    console.log("  Seeding Writing Task 1 Exercises (Cloze Auto)...");
    const text = fs.readFileSync(writingTask1ExercisesPath, "utf-8");
    const exercisesToSeed = JSON.parse(text);

    const writingSkillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Writing" },
    });

    if (writingSkillRecord) {
      let exOrder = 1;
      for (const exObj of exercisesToSeed) {
        const { theme, subCategory, prompt, diagramUrl, modelAnswer } = exObj;
        const topicName = subCategory ? `${theme} - ${subCategory}` : theme;

        const foundationVocabLesson = await prisma.ieltsBasicLesson.findFirst({
          where: { skillId: writingSkillRecord.id, title: theme },
        });

        await prisma.ieltsBasicWritingExercise.create({
          data: {
            skillId: writingSkillRecord.id,
            lessonId: foundationVocabLesson ? foundationVocabLesson.id : null,
            topic: topicName,
            instructions: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
            prompt: prompt || "",
            diagramUrl: diagramUrl || "",
            modelAnswer: modelAnswer,
            order: exOrder++,
          },
        });
        console.log(`    Created writing exercise: ${topicName}`);
      }
    }
  }

  // 4. Parse Writing Task 2 Theory (separate file)
  const task2TheoryPath = path.join(baseDir, "writing_task_2_theory.txt");
  if (fs.existsSync(task2TheoryPath)) {
    console.log("  Seeding Writing Task 2 Theory...");
    const writingSkillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Writing" },
    });

    if (writingSkillRecord) {
      const task2TheoryArr = getTheoryLessons(task2TheoryPath);
      let order = 100; // Start at 100 to separate from Task 1 lessons
      for (const theory of task2TheoryArr) {
        const lesson = await prisma.ieltsBasicLesson.create({
          data: {
            skillId: writingSkillRecord.id,
            chapter: `Task 2 - Chapter ${String(order - 99).padStart(2, "0")}`,
            title: theory.title,
            content: theory.content,
            quiz: theory.quiz,
            order: order++,
          },
        });
        console.log(`    -> Created Task 2 lesson: ${lesson.title}`);
      }
    }
  }

  // 5. Parse Writing Task 2 Exercises (Auto-Generated Cloze format)
  const writingTask2ExercisesPath = path.join(
    baseDir,
    "writing_task_2_cloze_auto.json",
  );
  if (fs.existsSync(writingTask2ExercisesPath)) {
    console.log("  Seeding Writing Task 2 Exercises (Cloze Auto)...");
    const task2Text = fs.readFileSync(writingTask2ExercisesPath, "utf-8");
    const task2Exercises = JSON.parse(task2Text);

    const writingSkillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Writing" },
    });

    if (writingSkillRecord) {
      let exOrder = 100; // Start at 100 to avoid collision with Task 1 orders
      for (const exObj of task2Exercises) {
        const { theme, subCategory, prompt, diagramUrl, modelAnswer } = exObj;
        const topicName = subCategory ? `${theme} - ${subCategory}` : theme;

        // Try to match to a Task 2 lesson
        const lesson = await prisma.ieltsBasicLesson.findFirst({
          where: { skillId: writingSkillRecord.id, title: theme },
        });

        await prisma.ieltsBasicWritingExercise.create({
          data: {
            skillId: writingSkillRecord.id,
            lessonId: lesson ? lesson.id : null,
            topic: topicName,
            instructions:
              "Write about the following topic. Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
            prompt: prompt || "",
            diagramUrl: diagramUrl || null,
            modelAnswer: modelAnswer,
            taskType: 2,
            order: exOrder++,
          },
        });
        console.log(`    Created Task 2 writing exercise: ${topicName}`);
      }
    }
  }

  // 6. Parse Speaking Theory
  const speakingTheoryPath = path.join(baseDir, "speaking_theory.txt");
  if (fs.existsSync(speakingTheoryPath)) {
    console.log("  Seeding Speaking Theory...");
    const speakingSkill = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Speaking" },
    });

    if (speakingSkill) {
      const speakingTheoryArr = getTheoryLessons(speakingTheoryPath);
      let order = 1;
      for (const theory of speakingTheoryArr) {
        const lesson = await prisma.ieltsBasicLesson.create({
          data: {
            skillId: speakingSkill.id,
            chapter: `Chapter ${String(order).padStart(2, "0")}`,
            title: theory.title,
            content: theory.content,
            quiz: theory.quiz,
            order: order++,
          },
        });
        console.log(`    -> Created Speaking lesson: ${lesson.title}`);
      }
    }
  }

  // 7. Parse Speaking Exercises (Auto-Generated Cloze + MCQ)
  const speakingExercisesPath = path.join(baseDir, "speaking_cloze_auto.json");
  if (fs.existsSync(speakingExercisesPath)) {
    console.log("  Seeding Speaking Exercises...");
    const speakingText = fs.readFileSync(speakingExercisesPath, "utf-8");
    const speakingExercises = JSON.parse(speakingText);

    const speakingSkill = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Speaking" },
    });

    if (speakingSkill) {
      let exOrder = 1;
      for (const exObj of speakingExercises) {
        const { theme, subCategory, prompt, partType, questionType, modelAnswer, content } = exObj;
        const topicName = subCategory ? `${theme} - ${subCategory}` : theme;

        const lesson = await prisma.ieltsBasicLesson.findFirst({
          where: { skillId: speakingSkill.id, title: theme },
        });

        await prisma.ieltsBasicSpeakingExercise.create({
          data: {
            skillId: speakingSkill.id,
            lessonId: lesson ? lesson.id : null,
            topic: topicName,
            partType: partType || 1,
            questionType: questionType || "cloze",
            instructions: questionType === "mcq"
              ? "Select the best response to the examiner's question."
              : "Complete the model answer by selecting the most appropriate word or phrase.",
            prompt: prompt || "",
            content: content || null,
            modelAnswer: modelAnswer || null,
            order: exOrder++,
          },
        });
        console.log(`    Created speaking exercise: ${topicName}`);
      }
    }
  }

  console.log("  Finished seeding IELTS basic data.");
}

function getTheoryLessons(txtPath: string) {
  if (!fs.existsSync(txtPath)) return [];
  const text = fs.readFileSync(txtPath, "utf8");
  const lines = text.replace(/\r/g, "").split("\n");

  const lessons: any[] = [];
  let currentLesson: any = null;

  let inQuizSection = false;

  let currentContentType = "overview";
  let currentContentTitle = "Overview";
  let currentContent = "";

  let currentQuizQuestion: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const titleMatch = line.match(/^ {4}- (.*)$/);
    if (titleMatch) {
      if (currentLesson) {
        if (currentContent.trim() && !inQuizSection) {
          currentLesson.content.push({
            type: currentContentType,
            title: currentContentTitle,
            content: currentContent.trim(),
          });
        }
        if (currentQuizQuestion) {
          currentLesson.quiz.push(currentQuizQuestion);
          currentQuizQuestion = null;
        }
        lessons.push(currentLesson);
      }

      const title = titleMatch[1].trim();
      currentLesson = { title, content: [], quiz: [] };
      inQuizSection = false;
      currentContentType = "overview";
      currentContentTitle = "Overview";
      currentContent = "";
      continue;
    }

    if (!currentLesson) continue;

    const sectionMatch = line.match(/^ {8}- (.*)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      if (sectionName.toLowerCase() === "quiz") {
        if (currentContent.trim()) {
          currentLesson.content.push({
            type: currentContentType,
            title: currentContentTitle,
            content: currentContent.trim(),
          });
          currentContent = "";
        }
        inQuizSection = true;
      } else {
        inQuizSection = false;
      }
      continue;
    }

    if (inQuizSection) {
      const trimmed = line.replace(/^ {12}/, "").trim();
      if (!trimmed) continue;

      if (trimmed.match(/^(?:\*\*)?\d+\.(?:\*\*)?\s/)) {
        if (currentQuizQuestion) {
          currentLesson.quiz.push(currentQuizQuestion);
        }
        currentQuizQuestion = {
          question: trimmed.replace(/^(?:\*\*)?\d+\.(?:\*\*)?\s/, ""),
          options: [],
          hint: "",
          answer: "",
          explanation: "",
        };
      } else if (currentQuizQuestion) {
        if (
          trimmed.match(/^-?\s*(?:\*\*)?[A-Z]\)/) ||
          trimmed.match(/^(?:\*\*)?[A-Z]\)/)
        ) {
          let opt = trimmed.replace(
            /^-?\s*(?:\*\*)?([A-Z]\))(?:\*\*)?\s*/,
            "$1 ",
          );
          currentQuizQuestion.options.push(opt);
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Hint:(?:\*\*)?/i)) {
          currentQuizQuestion.hint = trimmed.replace(
            /^-?\s*(?:\*\*)?Hint:(?:\*\*)?\s*/i,
            "",
          );
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Answer:(?:\*\*)?/i)) {
          currentQuizQuestion.answer = trimmed.replace(
            /^-?\s*(?:\*\*)?Answer:(?:\*\*)?\s*/i,
            "",
          );
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Why:(?:\*\*)?/i)) {
          currentQuizQuestion.explanation = trimmed.replace(
            /^-?\s*(?:\*\*)?Why:(?:\*\*)?\s*/i,
            "",
          );
        } else {
          if (currentQuizQuestion.explanation) {
            currentQuizQuestion.explanation += " " + trimmed;
          } else if (
            currentQuizQuestion.question &&
            currentQuizQuestion.options.length === 0
          ) {
            currentQuizQuestion.question += " " + trimmed;
          }
        }
      }
    } else {
      const trimmed = line.replace(/^ {12,16}/, "");

      let subheadMatch = trimmed.match(/^#{2,3}\s+(.*)$/);

      if (!subheadMatch) {
        const listMatch = trimmed.match(/^- \s*(.*)$/);
        if (listMatch) {
          const text = listMatch[1].toLowerCase();
          if (
            text.includes("task achievement") ||
            text.includes("grammar") ||
            text.includes("lexical") ||
            text.includes("fluency") ||
            text.includes("question type") ||
            text.includes("quetion type")
          ) {
            subheadMatch = listMatch;
          }
        }
      }

      if (subheadMatch) {
        if (currentContent.trim()) {
          currentLesson.content.push({
            type: currentContentType,
            title: currentContentTitle,
            content: currentContent.trim(),
          });
          currentContent = "";
        }

        const rawTitle = subheadMatch[1].trim();
        const lowerTitle = rawTitle.toLowerCase();

        if (
          lowerTitle.includes("trap") ||
          lowerTitle.includes("task achievement") ||
          lowerTitle.includes("fluency")
        ) {
          currentContentType = "traps";
        } else if (
          lowerTitle.includes("strategy") ||
          lowerTitle.includes("step-by-step") ||
          lowerTitle.includes("grammar")
        ) {
          currentContentType = "strategy";
        } else if (
          lowerTitle.includes("tip") ||
          lowerTitle.includes("pro-tip") ||
          lowerTitle.includes("lexical")
        ) {
          currentContentType = "tips";
        } else {
          currentContentType = "section";
        }

        const pureTitleMatch = rawTitle
          .replace(/^\*\*/, "")
          .match(/[a-zA-Z0-9].*$/);
        let cleanedTitle = pureTitleMatch ? pureTitleMatch[0] : rawTitle;
        cleanedTitle = cleanedTitle
          .replace(/\*+$/, "")
          .replace(/^\*+/, "")
          .trim();
        currentContentTitle = cleanedTitle;
      } else {
        currentContent += trimmed + "\n";
      }
    }
  }

  if (currentLesson) {
    if (currentContent.trim() && !inQuizSection) {
      currentLesson.content.push({
        type: currentContentType,
        title: currentContentTitle,
        content: currentContent.trim(),
      });
    }
    if (currentQuizQuestion) {
      currentLesson.quiz.push(currentQuizQuestion);
    }
    lessons.push(currentLesson);
  }

  return lessons;
}

function getExercises(compiledDir: string, skillName: string) {
  const exList: any[] = [];
  if (!fs.existsSync(compiledDir)) return exList;
  const files = fs.readdirSync(compiledDir);
  for (const file of files) {
    if (file.startsWith(skillName + "_") && file.endsWith(".json")) {
      const dataFile = path.join(compiledDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

        const root: any = Array.isArray(data) ? data[0] : data;
        if (!root) continue;

        let contentData: any[] = [];
        if (root.content && Array.isArray(root.content))
          contentData = root.content;
        else if (root.question_groups) contentData = root.question_groups;
        else if (root.questions && Array.isArray(root.questions))
          contentData = root.questions;
        else contentData = [root];

        const match = file.match(/^[a-z]+_(Chapter_\d+)_(.*?)_Question(s)?_/);
        let rawTitle = file;
        let chapterFolderName = "";
        if (match) {
          chapterFolderName = match[1].replace("_", " ");
          rawTitle = match[2].replace(/_/g, " ");
        }

        exList.push({
          chapterFolderName: chapterFolderName + " - " + rawTitle,
          topic: root.topic || root.title || rawTitle,
          instructions: root.instructions || "",
          audioUrl: root.audio_url || null,
          transcript: root.transcript || null,
          passage: typeof root.passage === "string" ? root.passage : null,
          passageWithLocations: root.passage_with_locations || [],
          content: contentData,
          seeded: false,
        });
      } catch (e) {
        console.error("Failed to parse", dataFile, e);
      }
    }
  }
  return exList;
}
