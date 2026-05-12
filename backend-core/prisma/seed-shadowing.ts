import { PrismaClient } from '@prisma/client';
import { seedShadowingLessons, seedDictationLessons } from './seeders/shadowing.seeder';

const prisma = new PrismaClient();

async function main() {
  await seedShadowingLessons(prisma);
  await seedDictationLessons(prisma);
  console.log('All shadowing & dictation lessons seeded!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect(); });
