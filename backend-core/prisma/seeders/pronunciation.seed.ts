import { PrismaClient } from "@prisma/client";
import { pronunciationSounds } from "../data/pronunciation";

export async function seedPronunciation(prisma: PrismaClient) {
  console.log("🔊 Seeding pronunciation sounds...");

  for (const sound of pronunciationSounds) {
    const { exampleWords, ...soundData } = sound;

    const created = await prisma.foundationPronunciationSound.upsert({
      where: { symbol: soundData.symbol },
      update: {
        ...soundData,
        exampleWords: {
          deleteMany: {},
          create: exampleWords,
        },
      },
      create: {
        ...soundData,
        exampleWords: {
          create: exampleWords,
        },
      },
    });

    console.log(`  ✓ ${created.symbol} (${created.name})`);
  }

  console.log(`✅ Seeded ${pronunciationSounds.length} pronunciation sounds`);
}
