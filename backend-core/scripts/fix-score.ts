import { PrismaClient } from '@prisma/client';
import { ExamsService } from './src/modules/exams/exams.service';

const prisma = new PrismaClient();
const svc = new ExamsService(prisma as any);

async function main() {
  const sessions = await prisma.examSession.findMany({ 
    where: { status: 'COMPLETED' } 
  });
  
  for (const s of sessions) {
    if (!s.answers) continue;
    try {
      await svc.submitSession(s.id, { answers: s.answers as any });
      console.log(`Recalculated session ${s.id}`);
    } catch (e: any) {
      console.error(`Failed session ${s.id}:`, e.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
