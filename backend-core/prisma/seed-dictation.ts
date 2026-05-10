// Quick seed script for dictation lessons
import { PrismaClient } from '@prisma/client';
import { seedDictationLessons } from './seeders/shadowing.seeder';

const prisma = new PrismaClient();

seedDictationLessons(prisma)
  .then(() => { console.log('Done'); })
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
