import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// VOCABULARY DATA - 4000 Essential English Words
// ============================================================

const unit1Words = [
  { word: 'afraid', meaning: 'feeling fear', ipa: '/əˈfreɪd/', partOfSpeech: 'adj', example: 'The woman was afraid of what she saw.', imageUrl: 'https://img.freepik.com/free-photo/portrait-young-scared-asian-woman-looking-camera_171337-1496.jpg', order: 1 },
  { word: 'agree', meaning: 'to say yes or to think the same way', ipa: '/əˈɡriː/', partOfSpeech: 'v', example: 'I agree with you.', order: 2 },
  { word: 'angry', meaning: 'feeling upset or mad', ipa: '/ˈæŋɡri/', partOfSpeech: 'adj', example: 'The lion was angry when the rabbit arrived late.', order: 3 },
  { word: 'arrive', meaning: 'to reach a place', ipa: '/əˈraɪv/', partOfSpeech: 'v', example: 'The bus will arrive soon.', order: 4 },
  { word: 'attack', meaning: 'to try to fight or hurt', ipa: '/əˈtæk/', partOfSpeech: 'v', example: 'The lion jumped into the well to attack.', order: 5 },
  { word: 'bottom', meaning: 'the lowest part', ipa: '/ˈbɒtəm/', partOfSpeech: 'n', example: 'The lion lives at the bottom of the well.', order: 6 },
  { word: 'clever', meaning: 'smart or intelligent', ipa: '/ˈklevər/', partOfSpeech: 'adj', example: 'The rabbit was very clever.', order: 7 },
  { word: 'cruel', meaning: 'bad or hurting others', ipa: '/ˈkruːəl/', partOfSpeech: 'adj', example: 'A cruel lion lived in the forest.', order: 8 },
  { word: 'finally', meaning: 'at last or at the end', ipa: '/ˈfaɪnəli/', partOfSpeech: 'adv', example: 'Finally, it was the rabbit\'s turn.', order: 9 },
  { word: 'hide', meaning: 'to not let others see', ipa: '/haɪd/', partOfSpeech: 'v', example: 'I was hiding from another lion.', order: 10 },
  { word: 'hunt', meaning: 'to look for animals to kill', ipa: '/hʌnt/', partOfSpeech: 'v', example: 'You don\'t have to hunt and kill us.', order: 11 },
  { word: 'lot', meaning: 'a large amount', ipa: '/lɒt/', partOfSpeech: 'n', example: 'He killed a lot of animals.', order: 12 },
  { word: 'middle', meaning: 'the center of something', ipa: '/ˈmɪdl/', partOfSpeech: 'n', example: 'The well was in the middle of the forest.', order: 13 },
  { word: 'moment', meaning: 'a very short time', ipa: '/ˈmoʊmənt/', partOfSpeech: 'n', example: 'Without waiting another moment, the lion jumped.', order: 14 },
  { word: 'pleased', meaning: 'feeling happy', ipa: '/pliːzd/', partOfSpeech: 'adj', example: 'All animals were pleased with the rabbit.', order: 15 },
  { word: 'promise', meaning: 'to say you will do something', ipa: '/ˈprɒmɪs/', partOfSpeech: 'v', example: 'If you promise to eat only one animal each day.', order: 16 },
  { word: 'reply', meaning: 'to answer', ipa: '/rɪˈplaɪ/', partOfSpeech: 'v', example: 'The rabbit replied, "I will show you."', order: 17 },
  { word: 'safe', meaning: 'not in danger', ipa: '/seɪf/', partOfSpeech: 'adj', example: 'All the other animals were safe.', order: 18 },
  { word: 'trick', meaning: 'a clever idea to fool someone', ipa: '/trɪk/', partOfSpeech: 'n', example: 'They were pleased with the rabbit\'s clever trick.', order: 19 },
  { word: 'well', meaning: 'a deep hole with water', ipa: '/wel/', partOfSpeech: 'n', example: 'The rabbit led the lion to an old well.', order: 20 },
];

const unit1Exercises = [
  { question: 'bad or hurting others', answer: 'cruel', options: ['afraid', 'clever', 'cruel', 'hunt'], order: 1 },
  { question: 'at last or at the end', answer: 'finally', options: ['angry', 'clever', 'finally', 'reply'], order: 2 },
  { question: 'to try to fight or hurt', answer: 'attack', options: ['attack', 'middle', 'pleased', 'trick'], order: 3 },
  { question: 'to not let others see', answer: 'hide', options: ['agree', 'hide', 'safe', 'well'], order: 4 },
  { question: 'the lowest part', answer: 'bottom', options: ['bottom', 'lot', 'moment', 'promise'], order: 5 },
];

const unit1Questions = [
  { question: 'What is this story about?', type: 'multiple_choice', options: ['How a clever rabbit tricked a cruel lion.', 'How rabbits learned to hide from lions.', 'How a rabbit pleased an angry lion.', 'How to be safe when you hunt in the forest.'], answer: 'How a clever rabbit tricked a cruel lion.', order: 1 },
  { question: 'What did all the animals say to the lion?', type: 'multiple_choice', options: ['They said they wanted him to be their king.', 'They said that the rabbit would be there in a moment.', 'They said that they would allow him to eat one of them a day.', 'They said that they would hide at the bottom of the well.'], answer: 'They said that they would allow him to eat one of them a day.', order: 2 },
  { question: 'Why did the rabbit take the lion to the well in the middle of the forest?', type: 'multiple_choice', options: ['So a lot of animals could see the rabbit walking with the lion.', 'So the lion could attack the "other" lion.', 'So the lion could drink water.', 'So the other animals would be afraid of the rabbit.'], answer: 'So the lion could attack the "other" lion.', order: 3 },
  { question: 'Which of the following is true at the end of the story?', type: 'multiple_choice', options: ['The lion attacked another lion, and they both got hurt.', 'The lion cannot reply to the rabbit, so the rabbit wins.', 'The lion finally dies.', 'The lion is pleased by the rabbit\'s words, so it does not eat the rabbit.'], answer: 'The lion finally dies.', order: 4 },
  { question: 'What did the lion see when it looked in the well?', type: 'fill_blank', answer: 'his own face', order: 5 },
];

const unit1Story = {
  title: 'The Lion and the Rabbit',
  content: `<p>A <strong>cruel</strong> lion lived in the forest. Every day, he killed and ate a <strong>lot</strong> of animals. The other animals were <strong>afraid</strong> the lion would kill them all.</p>
<p>The animals told the lion, "Let's make a deal. If you <strong>promise</strong> to eat only one animal each day, then one of us will come to you every day. Then you don't have to <strong>hunt</strong> and kill us."</p>
<p>The plan sounded <strong>well</strong> thought-out to the lion, so he <strong>agreed</strong>, but he also said, "If you don't come every day, I <strong>promise</strong> to kill all of you the next day!" Each day after that, one animal went to the lion so that the lion could eat it. Then, all the other animals were <strong>safe</strong>. <strong>Finally</strong>, it was the rabbit's turn to go to the lion. The rabbit went very slowly that day, so the lion was <strong>angry</strong> when the rabbit <strong>finally</strong> arrived.</p>
<p>The lion angrily asked the rabbit, "Why are you late?"</p>
<p>"I was <strong>hiding</strong> from another lion in the forest. That lion said he was the king, so I was <strong>afraid</strong>."</p>
<p>The lion told the rabbit, "I am the only king here! Take me to that other lion, and I will kill him."</p>
<p>The rabbit <strong>replied</strong>, "I will be happy to show you where he lives."</p>
<p>The rabbit led the lion to an old well in the <strong>middle</strong> of the forest. The well was very deep with water at the <strong>bottom</strong>. The rabbit told the lion, "Look in there. The lion lives at the <strong>bottom</strong>."</p>
<p>When the lion looked in the well, he could see his own face in the water. He thought that was the other lion. Without waiting another <strong>moment</strong>, the lion jumped into the well to <strong>attack</strong> the other lion. He never came out.</p>
<p>All of the other animals in the forest were very <strong>pleased</strong> with the rabbit's <strong>clever</strong> <strong>trick</strong>.</p>`,
  imageUrl: 'https://img.freepik.com/free-vector/lion-rabbit-forest-scene_1308-41088.jpg',
};

const unit2Words = [
  { word: 'allow', meaning: 'to let someone do something', ipa: '/əˈlaʊ/', partOfSpeech: 'v', example: 'Allow me to help you.', order: 1 },
  { word: 'apart', meaning: 'separated by distance or time', ipa: '/əˈpɑːrt/', partOfSpeech: 'adv', example: 'The two cities are far apart.', order: 2 },
  { word: 'beside', meaning: 'next to', ipa: '/bɪˈsaɪd/', partOfSpeech: 'prep', example: 'He sat beside his friend.', order: 3 },
  { word: 'cabinet', meaning: 'a piece of furniture with shelves', ipa: '/ˈkæbɪnət/', partOfSpeech: 'n', example: 'The plates are in the cabinet.', order: 4 },
  { word: 'charge', meaning: 'to ask for money for something', ipa: '/tʃɑːrdʒ/', partOfSpeech: 'v', example: 'They charge $10 for parking.', order: 5 },
  { word: 'cloth', meaning: 'material used for making clothes', ipa: '/klɒθ/', partOfSpeech: 'n', example: 'The cloth is soft.', order: 6 },
  { word: 'compare', meaning: 'to examine for differences', ipa: '/kəmˈpeər/', partOfSpeech: 'v', example: 'Compare the two answers.', order: 7 },
  { word: 'contain', meaning: 'to have something inside', ipa: '/kənˈteɪn/', partOfSpeech: 'v', example: 'The box contains books.', order: 8 },
  { word: 'create', meaning: 'to make something new', ipa: '/kriˈeɪt/', partOfSpeech: 'v', example: 'Scientists create new medicines.', order: 9 },
  { word: 'electric', meaning: 'powered by electricity', ipa: '/ɪˈlektrɪk/', partOfSpeech: 'adj', example: 'The car is electric.', order: 10 },
  { word: 'experiment', meaning: 'a test to find out something', ipa: '/ɪkˈsperɪmənt/', partOfSpeech: 'n', example: 'The experiment was successful.', order: 11 },
  { word: 'include', meaning: 'to have as part of a group', ipa: '/ɪnˈkluːd/', partOfSpeech: 'v', example: 'The price includes breakfast.', order: 12 },
  { word: 'knife', meaning: 'a tool for cutting', ipa: '/naɪf/', partOfSpeech: 'n', example: 'Use a sharp knife.', order: 13 },
  { word: 'laboratory', meaning: 'a room for scientific work', ipa: '/ləˈbɒrətri/', partOfSpeech: 'n', example: 'They work in a laboratory.', order: 14 },
  { word: 'liquid', meaning: 'something that flows like water', ipa: '/ˈlɪkwɪd/', partOfSpeech: 'n', example: 'Water is a liquid.', order: 15 },
  { word: 'measure', meaning: 'to find the size or amount', ipa: '/ˈmeʒər/', partOfSpeech: 'v', example: 'Measure the length.', order: 16 },
  { word: 'medicine', meaning: 'something to treat illness', ipa: '/ˈmedɪsn/', partOfSpeech: 'n', example: 'Take the medicine three times a day.', order: 17 },
  { word: 'pour', meaning: 'to make liquid flow', ipa: '/pɔːr/', partOfSpeech: 'v', example: 'Pour the water into the glass.', order: 18 },
  { word: 'prove', meaning: 'to show something is true', ipa: '/pruːv/', partOfSpeech: 'v', example: 'Can you prove it?', order: 19 },
  { word: 'smooth', meaning: 'having an even surface', ipa: '/smuːð/', partOfSpeech: 'adj', example: 'The table is smooth.', order: 20 },
];

const unit2Exercises = [
  { question: 'a room for scientific work', answer: 'laboratory', options: ['cabinet', 'laboratory', 'medicine', 'liquid'], order: 1 },
  { question: 'to make something new', answer: 'create', options: ['allow', 'compare', 'create', 'prove'], order: 2 },
  { question: 'something that flows like water', answer: 'liquid', options: ['cloth', 'liquid', 'knife', 'charge'], order: 3 },
  { question: 'a test to find out something', answer: 'experiment', options: ['apart', 'beside', 'experiment', 'smooth'], order: 4 },
  { question: 'to find the size or amount', answer: 'measure', options: ['contain', 'include', 'measure', 'pour'], order: 5 },
];

const vocabularyBooks = [
  {
    name: "4000 essential English words book 1",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png",
    wordCount: 600,
    order: 1,
    units: [
      { title: "The Lion and the Rabbit", order: 1, words: unit1Words, exercises: unit1Exercises, questions: unit1Questions, story: unit1Story },
      { title: "The Laboratory", order: 2, words: unit2Words, exercises: unit2Exercises, questions: [], story: null },
      { title: "The Report", order: 3 },
      { title: "The Dog's Bell", order: 4 },
      { title: "The Jackal and the Sun Child", order: 5 },
      { title: "The Friendly Ghost", order: 6 },
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
      { title: "May 29, 1953", order: 5 },
      { title: "The Frog Prince", order: 6 },
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
      { title: "The Senator and the Worm", order: 6 },
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
      { title: "The Tricky Fox", order: 4 },
      { title: "The Magic Computer", order: 5 },
      { title: "Jack Frost and the Pudding", order: 6 },
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
      { title: "The Bachelor's Lesson", order: 3 },
      { title: "The Corrupt Administrator", order: 4 },
      { title: "A Famous Accident", order: 5 },
      { title: "The Island", order: 6 },
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
      { title: "Dressed to Excess", order: 3 },
      { title: "The Butler's Bad Day", order: 4 },
      { title: "A Bet", order: 5 },
      { title: "Amazing Komodo Dragons", order: 6 },
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
  console.log('🌱 Seeding database with comprehensive vocabulary data...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.vocabularyProgress.deleteMany();
  await prisma.pronunciationSound.deleteMany();
  await prisma.grammarExercise.deleteMany();
  await prisma.grammarUnit.deleteMany();
  await prisma.grammarBook.deleteMany();
  await prisma.vocabularyQuestion.deleteMany();
  await prisma.vocabularyExercise.deleteMany();
  await prisma.vocabularyWord.deleteMany();
  await prisma.vocabularyUnit.deleteMany();
  await prisma.vocabularyBook.deleteMany();

  // Seed Vocabulary Books with full content
  console.log('📚 Seeding vocabulary books...');
  for (const book of vocabularyBooks) {
    const createdBook = await prisma.vocabularyBook.create({
      data: {
        name: book.name,
        imageUrl: book.imageUrl,
        wordCount: book.wordCount,
        order: book.order,
      },
    });

    // Create units with words, exercises, questions
    for (const unit of book.units) {
      const createdUnit = await prisma.vocabularyUnit.create({
        data: {
          bookId: createdBook.id,
          title: unit.title,
          order: unit.order,
          storyTitle: (unit as any).story?.title || null,
          storyContent: (unit as any).story?.content || null,
          storyImageUrl: (unit as any).story?.imageUrl || null,
        },
      });

      // Add words
      if ((unit as any).words) {
        await prisma.vocabularyWord.createMany({
          data: (unit as any).words.map((w: any) => ({
            unitId: createdUnit.id,
            word: w.word,
            meaning: w.meaning,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
            imageUrl: w.imageUrl || null,
            order: w.order,
          })),
        });
      }

      // Add exercises
      if ((unit as any).exercises) {
        await prisma.vocabularyExercise.createMany({
          data: (unit as any).exercises.map((e: any) => ({
            unitId: createdUnit.id,
            question: e.question,
            answer: e.answer,
            options: e.options,
            order: e.order,
          })),
        });
      }

      // Add questions
      if ((unit as any).questions && (unit as any).questions.length > 0) {
        await prisma.vocabularyQuestion.createMany({
          data: (unit as any).questions.map((q: any) => ({
            unitId: createdUnit.id,
            question: q.question,
            type: q.type,
            options: q.options || null,
            answer: q.answer,
            order: q.order,
          })),
        });
      }
    }

    console.log(`  ✓ Created: ${createdBook.name} (${book.units.length} units)`);
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

  // Summary
  const vocabCount = await prisma.vocabularyBook.count();
  const unitCount = await prisma.vocabularyUnit.count();
  const wordCount = await prisma.vocabularyWord.count();
  const exerciseCount = await prisma.vocabularyExercise.count();
  const questionCount = await prisma.vocabularyQuestion.count();

  console.log('\n✅ Database seeding completed!');
  console.log(`   📚 ${vocabCount} vocabulary books`);
  console.log(`   📄 ${unitCount} units`);
  console.log(`   📝 ${wordCount} words`);
  console.log(`   ❓ ${exerciseCount} exercises`);
  console.log(`   ❔ ${questionCount} questions`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
