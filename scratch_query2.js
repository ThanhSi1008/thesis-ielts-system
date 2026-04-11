const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.ieltsSkill.findMany();

  for (const skill of skills) {
    if (!['Listening', 'Reading'].includes(skill.name)) continue;

    const lessons = await prisma.ieltsLesson.findMany({
      where: { skillId: skill.id },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true }
    });

    console.log(`\n=== ${skill.name} ===`);
    for (const lesson of lessons) {
      let exCount = 0;
      if (skill.name === 'Listening') {
         exCount = await prisma.ieltsListeningExercise.count({ where: { lessonId: lesson.id } });
      } else {
         exCount = await prisma.ieltsReadingExercise.count({ where: { lessonId: lesson.id } });
      }
      console.log(`Lesson ${lesson.order}: ${lesson.title} -> ${exCount} exercises`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
