// Script to generate correct answers for listening tests
// and update the seeded sessions with proper answer data

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://toeic_user:toeic_password@localhost:5433/toeic_db?schema=public",
    },
  },
});

function extractCorrectAnswers(obj, ansMap) {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((x) => extractCorrectAnswers(x, ansMap));
    } else {
      const ans =
        obj.correct_answer !== undefined
          ? obj.correct_answer
          : obj.answer !== undefined
            ? obj.answer
            : obj.correct_answers;
      if (typeof obj.question_number === "number" && ans !== undefined) {
        ansMap.set(String(obj.question_number), ans);
      } else if (Array.isArray(obj.question_numbers) && ans !== undefined) {
        const key = obj.question_numbers.join(",");
        ansMap.set(key, ans);
      } else {
        Object.values(obj).forEach((x) => extractCorrectAnswers(x, ansMap));
      }
    }
  }
}

function buildAnswersFromCorrect(ansMap, targetCorrect, totalQuestions) {
  // Build an answer object where `targetCorrect` answers are correct
  // and the rest are intentionally wrong
  const answers = {};
  const keys = [...ansMap.keys()].sort((a, b) => {
    // Sort by the first number in the key
    const na = parseInt(a.split(",")[0]);
    const nb = parseInt(b.split(",")[0]);
    return na - nb;
  });

  let correctCount = 0;

  for (const key of keys) {
    const correct = ansMap.get(key);

    if (key.includes(",")) {
      // Multi-select question (e.g., "21,22")
      const qNums = key.split(",");
      const correctArr = Array.isArray(correct) ? correct : [String(correct)];

      if (correctCount < targetCorrect) {
        // Give correct answers
        for (let i = 0; i < qNums.length && correctCount < targetCorrect; i++) {
          answers[qNums[i]] = correctArr[i] || correctArr[0];
          correctCount++;
        }
        // Fill remaining with wrong if any
        for (let i = correctCount - (parseInt(qNums[0])); i < qNums.length; i++) {
          if (!answers[qNums[i]]) {
            answers[qNums[i]] = "WRONG_ANSWER";
          }
        }
      } else {
        // Give wrong answers
        for (const qn of qNums) {
          answers[qn] = "WRONG_ANSWER";
        }
      }
    } else {
      // Single question
      if (correctCount < targetCorrect) {
        // Give correct answer
        const correctVal = Array.isArray(correct) ? correct[0] : String(correct);
        // Extract just the first valid form (before any /)
        const cleanVal = String(correctVal).split("/")[0].replace(/[()]/g, "").trim();
        answers[key] = cleanVal;
        correctCount++;
      } else {
        // Give a wrong answer
        const correctVal = String(Array.isArray(correct) ? correct[0] : correct);
        if (/^[A-G]$/i.test(correctVal.trim())) {
          // It's a letter choice - give a different letter
          const letters = ["A", "B", "C", "D", "E", "F", "G"];
          const wrongLetter = letters.find(
            (l) => l !== correctVal.trim().toUpperCase()
          );
          answers[key] = wrongLetter || "X";
        } else {
          // It's a fill-in - give wrong text
          answers[key] = "incorrect";
        }
      }
    }
  }

  return { answers, actualCorrect: correctCount };
}

async function main() {
  const userId = "61e1a283-318e-4d02-9b56-a80c8fa14069";

  // Sessions we created with their target scores
  const sessionsToUpdate = [
    {
      sessionId: "a0000001-demo-4000-8000-000000000002",
      examId: "eb1e4a25-dee0-4197-9a37-051063d9fa52", // Listening Test 2
      targetScore: 18, // Band 5.5
    },
    {
      sessionId: "a0000001-demo-4000-8000-000000000003",
      examId: "d0277eb2-c1c1-44ac-ba0a-ba71af7bea12", // Listening Test 3
      targetScore: 30, // Band 7.0
    },
    {
      sessionId: "a0000001-demo-4000-8000-000000000004",
      examId: "ae6fdf14-6ecd-4469-827f-0ac5d0ac4d48", // Listening Test 4
      targetScore: 37, // Band 8.5
    },
  ];

  for (const s of sessionsToUpdate) {
    // Get the exam questions
    const exam = await prisma.ieltsIntensiveExam.findUnique({
      where: { id: s.examId },
      select: { title: true, questions: true },
    });

    if (!exam) {
      console.error(`Exam ${s.examId} not found!`);
      continue;
    }

    // Extract correct answers map
    const ansMap = new Map();
    extractCorrectAnswers(exam.questions, ansMap);

    console.log(`\n=== ${exam.title} ===`);
    console.log(`Total questions in answer map: ${ansMap.size}`);

    // Build answers with target correct count
    const { answers, actualCorrect } = buildAnswersFromCorrect(
      ansMap,
      s.targetScore,
      40
    );

    console.log(`Target correct: ${s.targetScore}, Actual correct: ${actualCorrect}`);
    console.log(`Answer keys: ${Object.keys(answers).length}`);

    // Verify by re-grading
    let verifyScore = 0;
    for (const [key, correct] of ansMap.entries()) {
      if (key.includes(",")) {
        const qNums = key.split(",");
        const correctArr = Array.isArray(correct) ? correct : [String(correct)];
        const correctNorm = correctArr.flatMap((c) => {
          const parts = String(c).split("/").map((p) => p.trim());
          const results = [];
          for (const part of parts) {
            if (part.includes("(") && part.includes(")")) {
              const match = part.match(/(.*)\((.*?)\)(.*)/);
              if (match) {
                const [, prefix, optional, suffix] = match;
                results.push((prefix + suffix).trim());
                results.push((prefix + optional + suffix).trim());
              } else {
                results.push(part);
              }
            } else {
              results.push(part);
            }
          }
          return results.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
        });

        for (const qn of qNums) {
          const userAns = String(answers[qn] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const idx = correctNorm.indexOf(userAns);
          if (idx !== -1) {
            verifyScore++;
            correctNorm.splice(idx, 1);
          }
        }
      } else {
        const userAns = String(answers[key] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const correctArr = Array.isArray(correct) ? correct : [String(correct)];
        let isCorrect = false;
        for (const c of correctArr) {
          const parts = String(c).split("/").map((p) => p.trim());
          const validSet = [];
          for (const part of parts) {
            if (part.includes("(") && part.includes(")")) {
              const match = part.match(/(.*)\((.*?)\)(.*)/);
              if (match) {
                const [, prefix, optional, suffix] = match;
                validSet.push((prefix + suffix).trim());
                validSet.push((prefix + optional + suffix).trim());
              } else {
                validSet.push(part);
              }
            } else {
              validSet.push(part);
            }
          }
          const norm = validSet.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
          if (norm.includes(userAns)) {
            isCorrect = true;
            break;
          }
        }
        if (isCorrect) verifyScore++;
      }
    }
    console.log(`Verified score: ${verifyScore}`);

    // Update the session with the answers
    await prisma.ieltsIntensiveSession.update({
      where: { id: s.sessionId },
      data: { answers },
    });

    console.log(`✅ Updated session ${s.sessionId}`);
  }

  await prisma.$disconnect();
  console.log("\n✅ All sessions updated with correct answers!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
