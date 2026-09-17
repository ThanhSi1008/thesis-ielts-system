import { PrismaClient } from "@prisma/client";
import { pronunciationSounds } from "../data/pronunciation";

export async function seedPronunciation(prisma: PrismaClient) {
  console.log("🔊 Seeding pronunciation sounds...");

  for (const sound of pronunciationSounds) {
    const { exampleWords, ...soundData } = sound;

    const processedExampleWords = exampleWords.map((ew) => ({
      ...ew,
      audioUrl:
        !ew.audioUrl || ew.audioUrl.includes("api.dictionaryapi.dev")
          ? `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(ew.word)}`
          : ew.audioUrl,
    }));

    const created = await prisma.foundationPronunciationSound.upsert({
      where: { symbol: soundData.symbol },
      update: {
        ...soundData,
        exampleWords: {
          deleteMany: {},
          create: processedExampleWords,
        },
      },
      create: {
        ...soundData,
        exampleWords: {
          create: processedExampleWords,
        },
      },
    });

    console.log(`  ✓ ${created.symbol} (${created.name})`);
  }

  console.log(`✅ Seeded ${pronunciationSounds.length} pronunciation sounds`);
}
