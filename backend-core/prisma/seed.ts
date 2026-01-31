import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// SEED DATA - Migrated from frontend hardcoded data
// ============================================================

const vocabularyBooks = [
  {
    name: "4000 essential English words book 1",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png",
    wordCount: 600,
    order: 1,
    units: [
      { title: "The Lion and the Rabbit", order: 1 },
      { title: "The Laboratory", order: 2 },
      { title: "The Report", order: 3 },
      { title: "The Dog's Bell", order: 4 },
      { title: "The Jackal and the Sun Child", order: 5 },
      { title: "The Friendly Ghost", order: 6 },
      { title: "The Best Prince", order: 7 },
      { title: "How the Sun and the Moon Were Made", order: 8 },
      { title: "The Starfish", order: 9 },
      { title: "The First Peacock", order: 10 },
      { title: "Princess Rose and the Creature", order: 11 },
      { title: "The Crazy Artist", order: 12 },
      { title: "The Farmer and the Cats", order: 13 },
      { title: "A Magical Book", order: 14 },
      { title: "The Big Race", order: 15 },
      { title: "Adams County's Gold", order: 16 },
      { title: "The Race for Water", order: 17 },
      { title: "The Little Red Chicken", order: 18 },
      { title: "Shipwrecked", order: 19 },
      { title: "The Seven Cities of Gold", order: 20 },
      { title: "Katy", order: 21 },
      { title: "A Better Reward", order: 22 },
      { title: "The Camp", order: 23 },
      { title: "A Strong Friendship", order: 24 },
      { title: "Joe's Pond", order: 25 },
      { title: "Archie and His Donkey", order: 26 },
      { title: "The Spider and the Bird", order: 27 },
      { title: "The Party", order: 28 },
      { title: "How the World Got Light", order: 29 },
      { title: "Cats and Secrets", order: 30 },
    ],
  },
  {
    name: "4000 essential English words book 2",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    wordCount: 600,
    order: 2,
    units: [
      { title: "The Twelve Months", order: 1 },
      { title: "The Dragon", order: 2 },
      { title: "The Battle of Thermopylae", order: 3 },
      { title: "The Deer and His Image", order: 4 },
      { title: "May 29,1953", order: 5 },
      { title: "The Frog Prince", order: 6 },
      { title: "A Beautiful Bird", order: 7 },
      { title: "Tricky Turtle", order: 8 },
      { title: "The Tale of Bartelby O'Boyle", order: 9 },
      { title: "Blackbeard", order: 10 },
    ],
  },
  {
    name: "4000 essential English words book 3",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_3_gt3hcu.png",
    wordCount: 600,
    order: 3,
    units: [
      { title: "The Real St. Nick", order: 1 },
      { title: "The Shepherd and the Wild Sheep", order: 2 },
      { title: "The Boy and his Sled", order: 3 },
      { title: "Tiny Tina", order: 4 },
      { title: "Trick-or-treat!", order: 5 },
    ],
  },
  {
    name: "4000 essential English words book 4",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab_4_dujqob.png",
    wordCount: 600,
    order: 4,
    units: [
      { title: "The History of Chocolate", order: 1 },
      { title: "Monkey Island", order: 2 },
      { title: "The Young Man and the Old Man", order: 3 },
    ],
  },
  {
    name: "4000 essential English words book 5",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_5_uxrn7b.png",
    wordCount: 600,
    order: 5,
    units: [
      { title: "The Little Mice", order: 1 },
      { title: "The Helpful Abbey", order: 2 },
    ],
  },
  {
    name: "4000 essential English words book 6",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774254/vocab_6_rf9ub1.png",
    wordCount: 600,
    order: 6,
    units: [
      { title: "The North Star", order: 1 },
      { title: "The Fossil Hunters", order: 2 },
    ],
  },
];

const grammarBooks = [
  {
    slug: "elementary",
    name: "Essential Grammar in Use",
    author: "Raymond Murphy",
    level: "Elementary",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png",
    color: "#EF4444",
    unitCount: 115,
    units: [
      { title: "am/is/are", order: 1 },
      { title: "am/is/are (questions)", order: 2 },
      { title: "I am doing (present continuous)", order: 3 },
      { title: "are you doing? (present continuous questions)", order: 4 },
      { title: "I do/work/like etc. (present simple)", order: 5 },
      { title: "I don't ... (present simple negative)", order: 6 },
      { title: "Do you ...? (present simple questions)", order: 7 },
      { title: "I am doing and I do (present continuous vs present simple)", order: 8 },
      { title: "I have ... and I've got ...", order: 9 },
      { title: "was/were", order: 10 },
    ],
  },
  {
    slug: "intermediate",
    name: "English Grammar in Use",
    author: "Raymond Murphy",
    level: "Intermediate",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    color: "#3B82F6",
    unitCount: 145,
    units: [
      { title: "Present continuous (I am doing)", order: 1 },
      { title: "Present simple (I do)", order: 2 },
      { title: "Present continuous and present simple 1", order: 3 },
      { title: "Present continuous and present simple 2", order: 4 },
      { title: "Past simple (I did)", order: 5 },
    ],
  },
  {
    slug: "advanced",
    name: "Advanced Grammar in Use",
    author: "Martin Hewings",
    level: "Advanced",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_3_gt3hcu.png",
    color: "#15803D",
    unitCount: 105,
    units: [
      { title: "Present continuous and present simple", order: 1 },
      { title: "Present perfect and past simple", order: 2 },
      { title: "Future forms", order: 3 },
    ],
  },
];

const pronunciationSounds = [
  // Monophthongs
  { symbol: "i:", word: "sleep", type: "monophthong", order: 1 },
  { symbol: "ɪ", word: "slip", type: "monophthong", order: 2 },
  { symbol: "ʊ", word: "good", type: "monophthong", order: 3 },
  { symbol: "u:", word: "food", type: "monophthong", order: 4 },
  { symbol: "e", word: "bed", type: "monophthong", order: 5 },
  { symbol: "ə", word: "teacher", type: "monophthong", order: 6 },
  { symbol: "ɜ:", word: "bird", type: "monophthong", order: 7 },
  { symbol: "ɔ:", word: "door", type: "monophthong", order: 8 },
  { symbol: "æ", word: "cat", type: "monophthong", order: 9 },
  { symbol: "ʌ", word: "up", type: "monophthong", order: 10 },
  { symbol: "ɑ:", word: "far", type: "monophthong", order: 11 },
  { symbol: "ɒ", word: "on", type: "monophthong", order: 12 },
  // Diphthongs
  { symbol: "ɪə", word: "here", type: "diphthong", order: 1 },
  { symbol: "eɪ", word: "wait", type: "diphthong", order: 2 },
  { symbol: "ʊə", word: "tourist", type: "diphthong", order: 3 },
  { symbol: "ɔɪ", word: "boy", type: "diphthong", order: 4 },
  { symbol: "əʊ", word: "show", type: "diphthong", order: 5 },
  { symbol: "eə", word: "hair", type: "diphthong", order: 6 },
  { symbol: "aɪ", word: "my", type: "diphthong", order: 7 },
  { symbol: "aʊ", word: "cow", type: "diphthong", order: 8 },
  // Consonants
  { symbol: "p", word: "pea", type: "consonant", voiced: false, order: 1 },
  { symbol: "b", word: "boat", type: "consonant", voiced: true, order: 2 },
  { symbol: "t", word: "tea", type: "consonant", voiced: false, order: 3 },
  { symbol: "d", word: "dog", type: "consonant", voiced: true, order: 4 },
  { symbol: "ʧ", word: "cheese", type: "consonant", voiced: false, order: 5 },
  { symbol: "ʤ", word: "june", type: "consonant", voiced: true, order: 6 },
  { symbol: "k", word: "car", type: "consonant", voiced: false, order: 7 },
  { symbol: "g", word: "go", type: "consonant", voiced: true, order: 8 },
  { symbol: "f", word: "fly", type: "consonant", voiced: false, order: 9 },
  { symbol: "v", word: "video", type: "consonant", voiced: true, order: 10 },
  { symbol: "θ", word: "think", type: "consonant", voiced: false, order: 11 },
  { symbol: "ð", word: "this", type: "consonant", voiced: true, order: 12 },
  { symbol: "s", word: "see", type: "consonant", voiced: false, order: 13 },
  { symbol: "z", word: "zoo", type: "consonant", voiced: true, order: 14 },
  { symbol: "ʃ", word: "shall", type: "consonant", voiced: false, order: 15 },
  { symbol: "ʒ", word: "television", type: "consonant", voiced: true, order: 16 },
  { symbol: "m", word: "man", type: "consonant", voiced: true, order: 17 },
  { symbol: "n", word: "now", type: "consonant", voiced: true, order: 18 },
  { symbol: "ŋ", word: "sing", type: "consonant", voiced: true, order: 19 },
  { symbol: "h", word: "hat", type: "consonant", voiced: false, order: 20 },
  { symbol: "l", word: "love", type: "consonant", voiced: true, order: 21 },
  { symbol: "r", word: "red", type: "consonant", voiced: true, order: 22 },
  { symbol: "w", word: "wet", type: "consonant", voiced: true, order: 23 },
  { symbol: "j", word: "yes", type: "consonant", voiced: true, order: 24 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.pronunciationSound.deleteMany();
  await prisma.grammarExercise.deleteMany();
  await prisma.grammarUnit.deleteMany();
  await prisma.grammarBook.deleteMany();
  await prisma.vocabularyQuestion.deleteMany();
  await prisma.vocabularyExercise.deleteMany();
  await prisma.vocabularyWord.deleteMany();
  await prisma.vocabularyUnit.deleteMany();
  await prisma.vocabularyBook.deleteMany();

  // Seed Vocabulary Books
  console.log('📚 Seeding vocabulary books...');
  for (const book of vocabularyBooks) {
    const createdBook = await prisma.vocabularyBook.create({
      data: {
        name: book.name,
        imageUrl: book.imageUrl,
        wordCount: book.wordCount,
        order: book.order,
        units: {
          create: book.units.map(unit => ({
            title: unit.title,
            order: unit.order,
          })),
        },
      },
    });
    console.log(`  ✓ Created: ${createdBook.name}`);
  }

  // Seed Grammar Books
  console.log('📖 Seeding grammar books...');
  for (const book of grammarBooks) {
    const createdBook = await prisma.grammarBook.create({
      data: {
        slug: book.slug,
        name: book.name,
        author: book.author,
        level: book.level,
        imageUrl: book.imageUrl,
        color: book.color,
        unitCount: book.unitCount,
        units: {
          create: book.units.map(unit => ({
            title: unit.title,
            order: unit.order,
          })),
        },
      },
    });
    console.log(`  ✓ Created: ${createdBook.name}`);
  }

  // Seed Pronunciation Sounds
  console.log('🔊 Seeding pronunciation sounds...');
  await prisma.pronunciationSound.createMany({
    data: pronunciationSounds,
  });
  console.log(`  ✓ Created ${pronunciationSounds.length} sounds`);

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
