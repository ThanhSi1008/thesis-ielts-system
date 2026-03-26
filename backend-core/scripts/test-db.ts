import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videos = await prisma.shadowingVideo.findMany();
  for (const video of videos) {
    console.log(`Video ID: ${video.id}, Title: ${video.title}`);
    console.log(`Sentences type: ${typeof video.sentences}, IsArray: ${Array.isArray(video.sentences)}, Length: ${(video.sentences as any)?.length}`);
    console.log(`Full sentences dump:`, JSON.stringify(video.sentences, null, 2));
    console.log('---');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
