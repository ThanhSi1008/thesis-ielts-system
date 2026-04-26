import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const e = await prisma.ieltsListeningExercise.findFirst({
    where: { topic: 'Fun Fortress Theme Park Map' }
  });
  console.log(JSON.stringify(e?.content, null, 2));
}
main().finally(() => prisma.$disconnect());
