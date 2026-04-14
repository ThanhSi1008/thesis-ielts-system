const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const lesson = await p.ieltsLesson.findFirst({
    orderBy: { order: 'asc' },
    select: { id: true, title: true, content: true }
  });
  console.log('Lesson:', lesson.title);
  console.log('Content blocks:');
  lesson.content.forEach((b, i) => {
    console.log(`  [${i}] type=${b.type} title=${b.title || '(none)'}`);
    console.log(`       keys: ${Object.keys(b).join(', ')}`);
    if (b.points) console.log(`       points[0]:`, JSON.stringify(b.points[0]).slice(0, 120));
    if (b.content) console.log(`       content:`, String(b.content).slice(0, 120));
  });
}
main().finally(() => p.$disconnect());
