const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  // Get all progress records
  const progress = await p.ieltsBasicProgress.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('\n=== ALL PROGRESS RECORDS ===');
  progress.forEach(r => {
    console.log(`lessonId: ${r.lessonId || '-'} | listeningEx: ${r.listeningExerciseId || '-'} | readingEx: ${r.readingExerciseId || '-'} | completed: ${r.isCompleted}`);
  });
  console.log(`Total: ${progress.length} records`);
}

main().finally(() => p.$disconnect());
