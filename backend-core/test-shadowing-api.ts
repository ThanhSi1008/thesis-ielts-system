import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Direct Service Test for Shadowing & Dictation ---');

  const user = await prisma.user.findFirst({
    where: { email: { not: undefined } }
  });

  if (!user) {
    console.error('No users found.');
    process.exit(1);
  }

  const userId = user.id;

  // Test Folders
  try {
    const existingFolders = await prisma.shadowingFolder.findMany({ where: { userId } });
    console.log(`✅ Folders check: ${existingFolders.length} found.`);
  } catch (error: any) {
    console.error('❌ Prisma Folders error:', error);
  }

  // Test Progress
  try {
    console.log('Fetching user progress...');
    const existingProgress = await prisma.shadowingProgress.findMany({ where: { userId } });
    console.log('Existing progress:', existingProgress);

    console.log('Updating progress for foundationVocabLesson toeic-1...');
    await prisma.shadowingProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId: 'toeic-1' }
      },
      update: {
        completedSentences: [0, 1]
      },
      create: {
        userId,
        lessonId: 'toeic-1',
        completedSentences: [0, 1]
      }
    });
    console.log('✅ Progress upsert successful.');
  } catch (error: any) {
    console.error('❌ Prisma Progress error:', error);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
