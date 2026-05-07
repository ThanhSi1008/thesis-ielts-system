const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ieltsIntensiveResult = await prisma.ieltsIntensiveResult.findFirst({
    where: { writingScore: { not: null } },
    orderBy: { id: 'desc' }
  });
  console.log("Feedback type:", typeof ieltsIntensiveResult.feedback);
  console.log(JSON.stringify(ieltsIntensiveResult.feedback, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
