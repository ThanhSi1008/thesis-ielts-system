import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ex = await prisma.ieltsListeningExercise.findFirst({
    where: { topic: 'Fun Fortress Theme Park Map' }
  });
  if (!ex) return console.log('Exercise not found');
  
  const content = Array.isArray(ex.content) ? ex.content : [ex.content];
  let updated = false;

  const newContent = content.map((c: any) => {
    if (c.type === 'map_labelling' && c.heading === 'Fun Fortress Map') {
      c.image_url = 'https://res.cloudinary.com/dvh7ztvgk/image/upload/v1775638317/chapter6-1_iuenao.png';
      updated = true;
    }
    return c;
  });

  if (updated) {
    await prisma.ieltsListeningExercise.update({
      where: { id: ex.id },
      data: { content: newContent }
    });
    console.log('Successfully updated image url in database!');
  } else {
    console.log('No update needed or group not found.');
  }
}

main().finally(() => prisma.$disconnect());
