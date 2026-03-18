import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// CAMBRIDGE IELTS (Intensive Mock Tests)
// ============================================================

const cambridgeIelts17ListeningTest1Questions = {
  test_title: "Test 1",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843893/ELT_IELTS17_t1_audio1_yaagme.mp3",
      questions: "1–10",
      instructions:
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
      topic: "Buckworth Conservation Group",
      question_type: "Note Completion",
      content: [
        {
          heading: "Regular activities",
          subsections: [
            {
              subheading: "Beach",
              points: [
                {
                  question_number: 1,
                  text: "making sure the beach does not have 1 .............................. on it",
                  answer: "litter",
                },
                {
                  question_number: 2,
                  text: "no 2 ..............................",
                  answer: "dogs",
                },
              ],
            },
            {
              subheading: "Nature reserve",
              points: [
                { text: "maintaining paths" },
                { text: "nesting boxes for birds installed" },
                {
                  question_number: 3,
                  text: "next task is taking action to attract 3 .............................. to the place",
                  answer: "insects",
                },
                {
                  question_number: 4,
                  text: "identifying types of 4 ..............................",
                  answer: "butterflies",
                },
                {
                  question_number: 5,
                  text: "building a new 5 ..............................",
                  answer: "wall",
                },
              ],
            },
          ],
        },
        {
          heading: "Forthcoming events",
          subsections: [
            {
              subheading: "Saturday",
              points: [
                { text: "meet at Dunsmore Beach car park" },
                {
                  question_number: 6,
                  text: "walk across the sands and reach the 6 ..............................",
                  answer: "island",
                },
                { text: "take a picnic" },
                {
                  question_number: 7,
                  text: "wear appropriate 7 ..............................",
                  answer: "boots",
                },
              ],
            },
            {
              subheading: "Woodwork session",
              points: [
                {
                  question_number: 8,
                  text: "suitable for 8 .............................. to participate in",
                  answer: "beginners",
                },
                {
                  question_number: 9,
                  text: "making 9 .............................. out of wood",
                  answer: "spoons",
                },
                { text: "17th, from 10 a.m. to 3 p.m." },
                {
                  question_number: 10,
                  text: "cost of session (no camping): 10 £ ..............................",
                  answer: "35 / thirty five",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      part_number: 2,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843894/ELT_IELTS17_t1_audio2_fshrgc.mp3",
      questions: "11–20",
      topic: "Boat trip round Tasmania",
      question_groups: [
        {
          questions: "11–14",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 11,
              question_text:
                "What is the maximum number of people who can stand on each side of the boat?",
              options: { A: "9", B: "15", C: "18" },
              answer: "A",
            },
            {
              question_number: 12,
              question_text: "What colour are the tour boats?",
              options: { A: "dark red", B: "jet black", C: "light green" },
              answer: "C",
            },
            {
              question_number: 13,
              question_text:
                "Which lunchbox is suitable for someone who doesn’t eat meat or fish?",
              options: { A: "Lunchbox 1", B: "Lunchbox 2", C: "Lunchbox 3" },
              answer: "B",
            },
            {
              question_number: 14,
              question_text: "What should people do with their litter?",
              options: {
                A: "take it home",
                B: "hand it to a member of staff",
                C: "put it in the bins provided on the boat",
              },
              answer: "B",
            },
          ],
        },
        {
          questions: "15–20",
          instructions: "Choose TWO letters, A–E.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [15, 16],
              question_text:
                "Which TWO features of the lighthouse does Lou mention?",
              options: {
                A: "why it was built",
                B: "who built it",
                C: "how long it took to build",
                D: "who staffed it",
                E: "what it was built with",
              },
              answer: ["A", "D"],
              grading_note: "IN EITHER ORDER",
            },
            {
              question_numbers: [17, 18],
              question_text:
                "Which TWO types of creature might come close to the boat?",
              options: {
                A: "sea eagles",
                B: "fur seals",
                C: "dolphins",
                D: "whales",
                E: "penguins",
              },
              answer: ["B", "C"],
              grading_note: "IN EITHER ORDER",
            },
            {
              question_numbers: [19, 20],
              question_text: "Which TWO points does Lou make about the caves?",
              options: {
                A: "Only large tourist boats can visit them.",
                B: "The entrances to them are often blocked.",
                C: "It is too dangerous for individuals to go near them.",
                D: "Someone will explain what is inside them.",
                E: "They cannot be reached on foot.",
              },
              answer: ["D", "E"],
              grading_note: "IN EITHER ORDER",
            },
          ],
        },
      ],
    },
    {
      part_number: 3,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843896/ELT_IELTS17_t1_audio3_eidh3p.mp3",
      questions: "21–30",
      topic: "Work experience for veterinary science students",
      question_groups: [
        {
          questions: "21–26",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 21,
              question_text:
                "What problem did both Diana and Tim have when arranging their work experience?",
              options: {
                A: "making initial contact with suitable farms",
                B: "organising transport to and from the farm",
                C: "finding a placement for the required length of time",
              },
              answer: "A",
            },
            {
              question_number: 22,
              question_text: "Tim was pleased to be able to help",
              options: {
                A: "a lamb that had a broken leg.",
                B: "a sheep that was having difficulty giving birth.",
                C: "a newly born lamb that was having trouble feeding.",
              },
              answer: "B",
            },
            {
              question_number: 23,
              question_text: "Diana says the sheep on her farm",
              options: {
                A: "were of various different varieties.",
                B: "were mainly reared for their meat.",
                C: "had better quality wool than sheep on the hills.",
              },
              answer: "B",
            },
            {
              question_number: 24,
              question_text:
                "What did the students learn about adding supplements to chicken feed?",
              options: {
                A: "These should only be given if specially needed.",
                B: "It is worth paying extra for the most effective ones.",
                C: "The amount given at one time should be limited.",
              },
              answer: "A",
            },
            {
              question_number: 25,
              question_text: "What happened when Diana was working with dairy cows?",
              options: {
                A: "She identified some cows incorrectly.",
                B: "She accidentally threw some milk away.",
                C: "She made a mistake when storing milk.",
              },
              answer: "C",
            },
            {
              question_number: 26,
              question_text: "What did both farmers mention about vets and farming?",
              options: {
                A: "Vets are failing to cope with some aspects of animal health.",
                B: "There needs to be a fundamental change in the training of vets.",
                C: "Some jobs could be done by the farmer rather than by a vet.",
              },
              answer: "C",
            },
          ],
        },
        {
          questions: "27–30",
          instructions:
            "What opinion do the students give about each of the following modules on their veterinary science course? Choose FOUR answers from the box and write the correct letter, A–F, next to questions 27–30.",
          question_type: "Matching",
          options_box: {
            title: "Opinions",
            options: {
              A: "Tim found this easier than expected.",
              B: "Tim thought this was not very clearly organised.",
              C: "Diana may do some further study on this.",
              D: "They both found the reading required for this was difficult.",
              E: "Tim was shocked at something he learned on this module.",
              F: "They were both surprised how little is known about some aspects of this.",
            },
          },
          items: [
            { question_number: 27, prompt: "Medical terminology", answer: "A" },
            { question_number: 28, prompt: "Diet and nutrition", answer: "E" },
            { question_number: 29, prompt: "Animal disease", answer: "F" },
            { question_number: 30, prompt: "Wildlife medication", answer: "C" },
          ],
        },
      ],
    },
    {
      part_number: 4,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843901/ELT_IELTS17_t1_audio4_yvhjwu.mp3",
      questions: "31–40",
      topic: "Labyrinths",
      instructions:
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
      question_type: "Note Completion",
      content: [
        {
          heading: "Definition",
          points: [{ text: "a winding spiral path leading to a central area" }],
        },
        {
          heading: "Labyrinths compared with mazes",
          points: [
            {
              question_number: 31,
              text: "Mazes are a type of 31 ..............................",
              answer: "puzzle",
            },
            {
              question_number: 32,
              text: "32 .............................. is needed to navigate through a maze",
              answer: "logic",
            },
            {
              question_number: 33,
              text: "the word 'maze' is derived from a word meaning a feeling of 33 ..............................",
              answer: "confusion",
            },
            { text: "Labyrinths represent a journey through life" },
            {
              question_number: 34,
              text: "they have frequently been used in 34 .............................. and prayer",
              answer: "meditation",
            },
          ],
        },
        {
          heading: "Early examples of the labyrinth spiral",
          points: [
            {
              question_number: 35,
              text: "Ancient carvings on 35 .............................. have been found across many cultures",
              answer: "stone",
            },
            {
              text: "The Pima, a Native American tribe, wove the symbol on baskets",
            },
            {
              question_number: 36,
              text: "Ancient Greeks used the symbol on 36 ..............................",
              answer: "coins",
            },
          ],
        },
        {
          heading: "Walking labyrinths",
          points: [
            {
              question_number: 37,
              text: "The largest surviving example of a turf labyrinth once had a big 37 .............................. at its centre",
              answer: "tree",
            },
          ],
        },
        {
          heading: "Labyrinths nowadays",
          points: [
            {
              question_number: 38,
              text: "Believed to have a beneficial impact on mental and physical health, e.g., walking a maze can reduce a person's 38 .............................. rate",
              answer: "breathing",
            },
            {
              text: "Used in medical and health and fitness settings and also prisons",
            },
            {
              text: "Popular with patients, visitors and staff in hospitals",
            },
            {
              question_number: 39,
              text: "patients who can't walk can use 'finger labyrinths' made from 39 ..............................",
              answer: "paper",
            },
            {
              question_number: 40,
              text: "research has shown that Alzheimer's sufferers experience less 40 ..............................",
              answer: "anxiety",
            },
          ],
        },
      ],
    },
  ],
};

async function upsertCambridgeExam(params: {
  title: string;
  type: "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "FULL_TEST" | "PRACTICE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes: number;
  questions: any;
  isPublished: boolean;
}) {
  const existing = await prisma.exam.findFirst({
    where: { title: params.title, type: params.type as any },
    select: { id: true },
  });

  if (existing) {
    await prisma.exam.update({
      where: { id: existing.id },
      data: {
        difficulty: params.difficulty as any,
        duration: params.durationMinutes,
        questions: params.questions,
        isPublished: params.isPublished,
      },
    });
    console.log(`  ✓ Updated exam: ${params.title}`);
    return;
  }

  await prisma.exam.create({
    data: {
      title: params.title,
      description: null,
      type: params.type as any,
      difficulty: params.difficulty as any,
      duration: params.durationMinutes,
      questions: params.questions,
      isPublished: params.isPublished,
    },
  });
  console.log(`  ✓ Created exam: ${params.title}`);
}

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

  // Seed Cambridge IELTS exams for Intensive Mock Tests
  console.log('🧪 Seeding Cambridge IELTS exams...');
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 1",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 27, // rounded from 26:28 (Exam.duration is integer minutes)
    questions: cambridgeIelts17ListeningTest1Questions,
    isPublished: true,
  });

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
