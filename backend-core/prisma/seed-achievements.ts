import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // ── FOUNDATION: VOCABULARY ──
  { key: "FV_FIRST_WORDS", name: "First Words", description: "Complete your first foundationVocabWord unit", icon: "📖", category: "FOUNDATION_VOCAB", tier: 1, xpReward: 20, order: 1 },
  { key: "FV_BOOKWORM", name: "Bookworm", description: "Complete all units in one foundationVocabWord book", icon: "📗", category: "FOUNDATION_VOCAB", tier: 2, xpReward: 50, order: 2 },
  { key: "FV_PERFECT", name: "Perfect Vocab", description: "Score 100% on any foundationVocabWord exercise", icon: "💯", category: "FOUNDATION_VOCAB", tier: 2, xpReward: 30, order: 3 },

  // ── FOUNDATION: GRAMMAR ──
  { key: "FG_STARTER", name: "Grammar Starter", description: "Complete your first grammar unit", icon: "✏️", category: "FOUNDATION_GRAMMAR", tier: 1, xpReward: 20, order: 10 },
  { key: "FG_GRADUATE", name: "Grammar Graduate", description: "Complete all units in one grammar book", icon: "📘", category: "FOUNDATION_GRAMMAR", tier: 2, xpReward: 50, order: 11 },

  // ── FOUNDATION: PRONUNCIATION ──
  { key: "FP_FIRST_SOUND", name: "First Sound", description: "Practice any pronunciation sound", icon: "🔤", category: "FOUNDATION_PRONUNCIATION", tier: 1, xpReward: 10, order: 20 },
  { key: "FP_SHARP_EAR", name: "Sharp Ear", description: "Master 10 pronunciation sounds", icon: "🎯", category: "FOUNDATION_PRONUNCIATION", tier: 2, xpReward: 40, order: 21 },
  { key: "FP_NATIVE", name: "Native Speaker", description: "Master all IPA sounds", icon: "👄", category: "FOUNDATION_PRONUNCIATION", tier: 3, xpReward: 100, order: 22 },

  // ── IELTS BASIC ──
  { key: "IB_LESSON_5", name: "FoundationVocabLesson Learner", description: "Complete 5 IELTS basic lessons", icon: "📗", category: "IELTS_BASIC", tier: 1, xpReward: 30, order: 30 },
  { key: "IB_LISTENING_3", name: "Listening Rookie", description: "Complete 3 listening exercises", icon: "🎧", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 31 },
  { key: "IB_READING_3", name: "Reading Rookie", description: "Complete 3 reading exercises", icon: "📖", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 32 },
  { key: "IB_WRITING_3", name: "Writing Rookie", description: "Submit 3 writing exercises", icon: "✍️", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 33 },

  // ── IELTS ADVANCED ──
  { key: "IA_LISTENER_5", name: "Cambridge Listener", description: "Complete 5 advanced listening sessions", icon: "🎧", category: "IELTS_ADVANCED", tier: 2, xpReward: 40, order: 40 },
  { key: "IA_READER_5", name: "Cambridge Reader", description: "Complete 5 advanced reading sessions", icon: "📖", category: "IELTS_ADVANCED", tier: 2, xpReward: 40, order: 41 },
  { key: "IA_HIGH_ACHIEVER", name: "High Achiever", description: "Score ≥80% on any advanced practice", icon: "🏅", category: "IELTS_ADVANCED", tier: 2, xpReward: 30, order: 42 },

  // ── IELTS INTENSIVE ──
  { key: "II_FIRST_EXAM", name: "First IeltsIntensiveExam", description: "Submit your first full IELTS ieltsIntensiveExam", icon: "📝", category: "IELTS_INTENSIVE", tier: 1, xpReward: 30, order: 50 },
  { key: "II_BAND_6", name: "Band 6", description: "Score ≥6.0 on any ieltsIntensiveExam", icon: "🎯", category: "IELTS_INTENSIVE", tier: 1, xpReward: 40, order: 51 },
  { key: "II_BAND_7", name: "Band 7", description: "Score ≥7.0 on any ieltsIntensiveExam", icon: "⭐", category: "IELTS_INTENSIVE", tier: 2, xpReward: 60, order: 52 },
  { key: "II_BAND_8", name: "Band 8", description: "Score ≥8.0 on any ieltsIntensiveExam", icon: "💎", category: "IELTS_INTENSIVE", tier: 3, xpReward: 100, order: 53 },
  { key: "II_VETERAN", name: "IeltsIntensiveExam Veteran", description: "Complete 10 full exams", icon: "🏆", category: "IELTS_INTENSIVE", tier: 2, xpReward: 50, order: 54 },

  // ── SHADOWING ──
  { key: "SH_ECHO", name: "Echo", description: "Complete your first shadowing foundationVocabLesson", icon: "🎙️", category: "SHADOWING", tier: 1, xpReward: 20, order: 60 },
  { key: "SH_PARROT", name: "Parrot", description: "Complete 10 shadowing lessons", icon: "🗣️", category: "SHADOWING", tier: 2, xpReward: 40, order: 61 },
  { key: "SH_VOICE_ACTOR", name: "Voice Actor", description: "Complete 30 shadowing lessons", icon: "🎤", category: "SHADOWING", tier: 3, xpReward: 80, order: 62 },

  // ── DICTATION ──
  { key: "DI_FIRST", name: "First Dictation", description: "Complete your first dictation foundationVocabLesson", icon: "🎧", category: "DICTATION", tier: 1, xpReward: 20, order: 70 },
  { key: "DI_REGULAR", name: "Dictation Regular", description: "Complete 10 dictation lessons", icon: "📝", category: "DICTATION", tier: 2, xpReward: 40, order: 71 },
  { key: "DI_EXPERT", name: "Dictation Expert", description: "Complete a foundationVocabLesson on Expert difficulty", icon: "🏆", category: "DICTATION", tier: 3, xpReward: 60, order: 72 },

  // ── VOCAB LAB ──
  { key: "VL_DECK_BUILDER", name: "Deck Builder", description: "Create your first deck", icon: "📦", category: "VOCAB_LAB", tier: 1, xpReward: 10, order: 80 },
  { key: "VL_COLLECTOR", name: "Card Collector", description: "Create 100 flashcards", icon: "📚", category: "VOCAB_LAB", tier: 2, xpReward: 40, order: 81 },
  { key: "VL_MEMORY_MASTER", name: "Memory Master", description: "Have 50 cards in REVIEW state", icon: "🧠", category: "VOCAB_LAB", tier: 2, xpReward: 50, order: 82 },
  { key: "VL_PUBLISHER", name: "Deck Publisher", description: "Publish a deck to the Marketplace", icon: "🏪", category: "VOCAB_LAB", tier: 1, xpReward: 20, order: 83 },

  // ── COMMUNITY ──
  { key: "CM_FIRST_POST", name: "First Post", description: "Create your first community post", icon: "✍️", category: "COMMUNITY", tier: 1, xpReward: 10, order: 90 },
  { key: "CM_CONVERSATIONALIST", name: "Conversationalist", description: "Leave 10 comments", icon: "💬", category: "COMMUNITY", tier: 1, xpReward: 20, order: 91 },
  { key: "CM_CROWD_FAVORITE", name: "Crowd Favorite", description: "Receive 25 total likes", icon: "❤️", category: "COMMUNITY", tier: 2, xpReward: 40, order: 92 },

  // ── CROSS-MODULE ──
  { key: "XM_ON_FIRE", name: "On Fire", description: "Reach a 7-day streak", icon: "🔥", category: "CROSS_MODULE", tier: 1, xpReward: 30, order: 100 },
  { key: "XM_MARATHON", name: "Marathon", description: "Reach a 30-day streak", icon: "🏔️", category: "CROSS_MODULE", tier: 2, xpReward: 80, order: 101 },
  { key: "XM_UNSTOPPABLE", name: "Unstoppable", description: "Reach a 100-day streak", icon: "🌋", category: "CROSS_MODULE", tier: 3, xpReward: 200, order: 102 },
  { key: "XM_DEDICATED", name: "Dedicated Learner", description: "Reach Level 10", icon: "🎓", category: "CROSS_MODULE", tier: 2, xpReward: 50, order: 103 },
];

async function main() {
  console.log("Seeding achievements...");
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { ...a },
      create: { ...a },
    });
  }
  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
