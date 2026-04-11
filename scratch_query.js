// Query all lessons and exercises to understand what we have available to build a syllabus
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.ieltsSkill.findMany();
  console.log("Skills:", skills.map(s => s.name));

  for (const skill of skills) {
    const lessons = await prisma.ieltsLesson.findMany({
      where: { skillId: skill.id },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true }
    });
    console.log(`\n--- ${skill.name} Lessons ---`);
    lessons.forEach(l => console.log(`${l.order}. ${l.title}`));

    if (skill.name === 'Listening') {
      const exercises = await prisma.ieltsListeningExercise.findMany({
        where: { skillId: skill.id },
        orderBy: { order: 'asc' },
        select: { id: true, topic: true, order: true, lessonId: true }
      });
      console.log(`\n--- ${skill.name} Exercises ---`);
      exercises.forEach(e => console.log(`${e.order}. ${e.topic} (lesson: ${e.lessonId ? 'yes' : 'no'})`));
    }
    
    if (skill.name === 'Reading') {
      const exercises = await prisma.ieltsReadingExercise.findMany({
        where: { skillId: skill.id },
        orderBy: { order: 'asc' },
        select: { id: true, topic: true, order: true, lessonId: true }
      });
      console.log(`\n--- ${skill.name} Exercises ---`);
      exercises.forEach(e => console.log(`${e.order}. ${e.topic} (lesson: ${e.lessonId ? 'yes' : 'no'})`));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
