import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfill() {
  console.log("🚀 Starting backfill of provenance fields...");

  // 1. IeltsIntensiveExam
  const intensiveExams = await prisma.ieltsIntensiveExam.findMany();
  let intensiveCount = 0;
  for (const exam of intensiveExams) {
    // Matches: "Cambridge IELTS 17 - Reading Test 1"
    const match = exam.title.match(/^Cambridge IELTS\s*(\d+)\s*-\s*(Listening|Reading|Writing|Speaking)\s*Test\s*(\d+)\s*$/i);
    if (match) {
      const bookNumber = parseInt(match[1], 10);
      const testNumber = parseInt(match[3], 10);
      await prisma.ieltsIntensiveExam.update({
        where: { id: exam.id },
        data: {
          source: "cambridge",
          bookNumber,
          testNumber,
        },
      });
      intensiveCount++;
    }
  }
  console.log(`✅ Backfilled ${intensiveCount} IeltsIntensiveExam records.`);

  // 2. IeltsAdvancedListeningPart
  const listeningParts = await prisma.ieltsAdvancedListeningPart.findMany();
  let listeningCount = 0;
  for (const part of listeningParts) {
    await prisma.ieltsAdvancedListeningPart.update({
      where: { id: part.id },
      data: {
        source: "cambridge",
        bookNumber: null,
        testNumber: null,
        isPublished: true,
      },
    });
    listeningCount++;
  }
  console.log(`✅ Backfilled ${listeningCount} IeltsAdvancedListeningPart records.`);

  // 3. IeltsAdvancedReadingPart
  const readingParts = await prisma.ieltsAdvancedReadingPart.findMany();
  let readingCount = 0;
  for (const part of readingParts) {
    await prisma.ieltsAdvancedReadingPart.update({
      where: { id: part.id },
      data: {
        source: "cambridge",
        bookNumber: null,
        testNumber: null,
        isPublished: true,
      },
    });
    readingCount++;
  }
  console.log(`✅ Backfilled ${readingCount} IeltsAdvancedReadingPart records.`);

  console.log("🎉 Provenance backfill completed successfully!");
}

backfill()
  .catch((err) => {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
