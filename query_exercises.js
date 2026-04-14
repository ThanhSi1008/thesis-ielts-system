const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  // Get all listening exercises and what group types they contain
  const exs = await p.ieltsListeningExercise.findMany({
    select: { id: true, topic: true, lessonId: true, content: true },
    orderBy: { order: 'asc' }
  });

  console.log('\n=== LISTENING EXERCISES ===');
  exs.forEach(e => {
    const types = e.content.map((g, i) => `[${i}] ${g.type || 'form'}`);
    console.log(`ID: ${e.id}`);
    console.log(`  Topic: ${e.topic.slice(0,60)}`);
    console.log(`  Groups: ${types.join(', ')}`);
    console.log(`  LessonId: ${e.lessonId}`);
    console.log('');
  });

  const readingExs = await p.ieltsReadingExercise.findMany({
    select: { id: true, topic: true, lessonId: true, content: true },
    orderBy: { order: 'asc' }
  });

  console.log('\n=== READING EXERCISES ===');
  readingExs.forEach(e => {
    const types = e.content.map((g, i) => `[${i}] ${g.type || '?'}`);
    console.log(`ID: ${e.id}`);
    console.log(`  Topic: ${e.topic.slice(0,60)}`);
    console.log(`  Groups: ${types.join(', ')}`);
    console.log(`  LessonId: ${e.lessonId}`);
    console.log('');
  });

  // Also get lessons to see what we're working with
  const lessons = await p.ieltsLesson.findMany({
    select: { id: true, title: true, chapter: true, skill: { select: { name: true } } },
    orderBy: { order: 'asc' }
  });

  console.log('\n=== LESSONS ===');
  lessons.forEach(l => {
    console.log(`${l.skill.name} | ${l.chapter} | ${l.title} | ID: ${l.id}`);
  });
}

main().finally(() => p.$disconnect());
