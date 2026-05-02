import { PrismaClient } from '@prisma/client';
import { SHADOWING_LESSONS } from '../data/shadowing-lessons';

export async function seedShadowingLessons(prisma: PrismaClient) {
  console.log('Seeding Shadowing lessons...');

  for (const lesson of SHADOWING_LESSONS) {
    if (lesson.type === 'dictation') continue;
    
    const data = {
      title: lesson.title,
      youtubeVideoId: lesson.youtubeVideoId || null,
      audioUrl: lesson.audioUrl,
      imageUrl: lesson.image,
      tags: lesson.tags,
      duration: lesson.duration,
      sentences: lesson.sentences as any,
    };

    // Seed into ShadowingVideo (with vietnamese/phonetic fields preserved)
    await prisma.shadowingVideo.upsert({
      where: { id: lesson.id },
      update: data,
      create: { id: lesson.id, ...data },
    });
  }

  console.log('Shadowing lessons seeded successfully.');
}

export async function seedDictationLessons(prisma: PrismaClient) {
  console.log('Seeding Dictation lessons...');

  for (const lesson of SHADOWING_LESSONS) {
    if (lesson.type === 'shadowing') continue;

    // Dictation uses a different ID namespace to keep tables fully isolated
    const dictationId = `dictation-${lesson.id}`;

    const data = {
      title: lesson.title,
      youtubeVideoId: lesson.youtubeVideoId || null,
      audioUrl: lesson.audioUrl,
      imageUrl: lesson.image,
      tags: lesson.tags,
      duration: lesson.duration,
      // Strip vietnamese/phonetic — dictation doesn't need them
      sentences: (lesson.sentences as any[]).map((s: any) => ({
        id: s.id,
        english: s.english,
        words: s.words,
        audioStart: s.audioStart,
        audioEnd: s.audioEnd,
      })) as any,
    };

    await prisma.dictationVideo.upsert({
      where: { id: dictationId },
      update: data,
      create: { id: dictationId, ...data },
    });
  }

  console.log('Dictation lessons seeded successfully.');
}

