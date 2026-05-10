/**
 * Migration script: Split ShadowingDictationProgress into ShadowingProgress + DictationProgress
 * Run ONCE before dropping the old table.
 * 
 * Usage: npx ts-node prisma/migrations/migrate-split-progress.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading existing unified progress rows...');

  // Read directly via raw query so we don't need the old model in schema
  const rows = await prisma.$queryRaw<Array<{
    userId: string;
    lessonId: string;
    type: string;
    completedSentences: number[];
    dictationDifficulty: string | null;
  }>>`SELECT "userId", "lessonId", "type", "completedSentences", "dictationDifficulty" FROM shadowing_dictation_progress`;

  console.log(`Found ${rows.length} progress rows to migrate.`);

  let shadowingCount = 0;
  let dictationCount = 0;

  for (const row of rows) {
    if (row.type === 'shadowing') {
      await prisma.shadowingProgress.upsert({
        where: { userId_lessonId: { userId: row.userId, lessonId: row.lessonId } },
        update: { completedSentences: row.completedSentences },
        create: {
          userId: row.userId,
          lessonId: row.lessonId,
          completedSentences: row.completedSentences,
        },
      });
      shadowingCount++;
    } else if (row.type === 'dictation') {
      await prisma.dictationProgress.upsert({
        where: { userId_lessonId: { userId: row.userId, lessonId: row.lessonId } },
        update: {
          completedSentences: row.completedSentences,
          difficulty: row.dictationDifficulty ?? 'Intermediate',
        },
        create: {
          userId: row.userId,
          lessonId: row.lessonId,
          completedSentences: row.completedSentences,
          difficulty: row.dictationDifficulty ?? 'Intermediate',
        },
      });
      dictationCount++;
    }
  }

  console.log(`✅ Migrated ${shadowingCount} shadowing progress rows.`);
  console.log(`✅ Migrated ${dictationCount} dictation progress rows.`);
  console.log('Migration complete. You can now safely drop the old shadowing_dictation_progress table.');
}

main()
  .catch((e) => { console.error('Migration failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
