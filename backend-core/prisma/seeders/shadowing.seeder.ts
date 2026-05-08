import { PrismaClient } from '@prisma/client';
import { SHADOWING_LESSONS } from '../data/shadowing-lessons';

const TAG_TO_CATEGORY: Record<string, string> = {
  friends: 'Friends',
  'the-office': 'The Office',
  'ted-talk': 'Ted Talk',
  kurzgesagt: 'Kurzgesagt',
  'breaking-bad': 'Breaking Bad',
  'stevie-emerson': 'Stevie Emerson',
};

function resolveCategory(tags: string[]): string {
  const slug = tags.find((t) => t !== 'YOUTUBE');
  if (!slug) return 'Other';
  return TAG_TO_CATEGORY[slug] ?? 'Other';
}

export async function seedShadowingLessons(prisma: PrismaClient) {
  console.log('Seeding Shadowing lessons...');

  for (const foundationVocabLesson of SHADOWING_LESSONS) {
    if (foundationVocabLesson.type === 'dictation') continue;
    
    const data = {
      title: foundationVocabLesson.title,
      youtubeVideoId: foundationVocabLesson.youtubeVideoId || null,
      audioUrl: foundationVocabLesson.audioUrl,
      imageUrl: foundationVocabLesson.image,
      tags: foundationVocabLesson.tags,
      category: resolveCategory(foundationVocabLesson.tags),
      duration: foundationVocabLesson.duration,
      sentences: foundationVocabLesson.sentences as any,
    };

    // Seed into ShadowingVideo (with vietnamese/phonetic fields preserved)
    await prisma.shadowingVideo.upsert({
      where: { id: foundationVocabLesson.id },
      update: data,
      create: { id: foundationVocabLesson.id, ...data },
    });
  }

  console.log('Shadowing lessons seeded successfully.');
}

export async function seedDictationLessons(prisma: PrismaClient) {
  console.log('Seeding Dictation lessons...');

  for (const foundationVocabLesson of SHADOWING_LESSONS) {
    if (foundationVocabLesson.type === 'shadowing') continue;

    // Dictation uses a different ID namespace to keep tables fully isolated
    const dictationId = `dictation-${foundationVocabLesson.id}`;

    const data = {
      title: foundationVocabLesson.title,
      youtubeVideoId: foundationVocabLesson.youtubeVideoId || null,
      audioUrl: foundationVocabLesson.audioUrl,
      imageUrl: foundationVocabLesson.image,
      tags: foundationVocabLesson.tags,
      category: resolveCategory(foundationVocabLesson.tags),
      duration: foundationVocabLesson.duration,
      // Strip vietnamese/phonetic — dictation doesn't need them
      sentences: (foundationVocabLesson.sentences as any[]).map((s: any) => ({
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

