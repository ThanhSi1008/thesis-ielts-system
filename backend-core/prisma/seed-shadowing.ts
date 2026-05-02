import { PrismaClient } from '@prisma/client';
import { seedShadowingLessons } from './seeders/shadowing.seeder';

const prisma = new PrismaClient();

seedShadowingLessons(prisma)
  .then(() => { console.log('Done!'); return prisma.$disconnect(); })
  .catch(e => { console.error(e); return prisma.$disconnect(); });
