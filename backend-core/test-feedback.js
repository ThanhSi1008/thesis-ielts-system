const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.result.findFirst({
    where: { writingScore: { not: null } },
    orderBy: { id: 'desc' }
  });
  console.log("Feedback type:", typeof result.feedback);
  console.log(JSON.stringify(result.feedback, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
