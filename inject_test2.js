const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'backend-core/prisma/seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');

const p1Text = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test2/part1.md'), 'utf8');
const p2Text = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test2/part2.md'), 'utf8');
const p3Text = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test2/part3.md'), 'utf8');

const test2Data = `
const cambridgeIelts17ReadingTest2Questions = {
  test_title: "Test 2",
  section: "Reading",
  parts: [
    {
      part_number: 1,
      part_type: "Reading Passage",
      topic: "The Dead Sea Scrolls",
      passage_text: \`${p1Text.replace(/`/g, '\\`')}\`,
      questions: "1–13",
      question_groups: [
        {
          questions: "1–5",
          instructions: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Note Completion",
          content: [
            {
              heading: "The Dead Sea Scrolls: Discovery",
              points: [
                { question_number: 1, text: "heard a noise of breaking when one teenager threw a 1 ..............................", answer: "rock" },
                { question_number: 2, text: "teenagers went into the 2 .............................. and found a number of containers", answer: "cave" },
                { question_number: 3, text: "containers made of 3 ..............................", answer: "clay" }
              ]
            },
            {
              heading: "The scrolls",
              points: [
                { question_number: 4, text: "thought to have been written by group of people known as the 4 ..............................", answer: "Essenes" },
                { question_number: 5, text: "written mainly in the 5 .............................. language", answer: "Hebrew" }
              ]
            }
          ]
        },
        {
          questions: "6–13",
          instructions: "Do the following statements agree with the information given in Reading Passage 1?",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 6, question_text: "The Bedouin teenagers who found the scrolls were disappointed by how little money they received for them.", answer: "NOT GIVEN" },
            { question_number: 7, question_text: "There is agreement among academics about the origin of the Dead Sea Scrolls.", answer: "FALSE" },
            { question_number: 8, question_text: "Most of the books of the Bible written on the scrolls are incomplete.", answer: "TRUE" },
            { question_number: 9, question_text: "The information on the Copper Scroll is written in an unusual way.", answer: "TRUE" },
            { question_number: 10, question_text: "Mar Samuel was given some of the scrolls as a gift.", answer: "FALSE" },
            { question_number: 11, question_text: "In the early 1950s, a number of educational establishments in the US were keen to buy scrolls from Mar Samuel.", answer: "FALSE" },
            { question_number: 12, question_text: "The scroll that was pieced together in 2017 contains information about annual occasions in the Qumran area 2,000 years ago.", answer: "TRUE" },
            { question_number: 13, question_text: "Academics at the University of Haifa are currently researching how to decipher the final scroll.", answer: "NOT GIVEN" }
          ]
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Reading Passage",
      topic: "A second attempt at domesticating the tomato",
      passage_text: \`${p2Text.replace(/`/g, '\\`')}\`,
      questions: "14–26",
      question_groups: [
        {
          questions: "14–18",
          instructions: "Reading Passage 2 has five sections, A–E. Which section contains the following information?",
          question_type: "Matching Information",
          items: [
            { question_number: 14, question_text: "a reference to a type of tomato that can resist a dangerous infection", answer: "C" },
            { question_number: 15, question_text: "an explanation of how problems can arise from focusing only on a certain type of tomato plant.", answer: "B" },
            { question_number: 16, question_text: "a number of examples of plants that are not cultivated at present but could be useful as food sources", answer: "E" },
            { question_number: 17, question_text: "a comparison between the early domestication of the tomato and more recent research", answer: "A" },
            { question_number: 18, question_text: "a personal reaction to the flavour of a tomato that has been genetically edited", answer: "C" }
          ]
        },
        {
          questions: "19–23",
          instructions: "Match each statement with the correct researcher, A–D.",
          question_type: "Matching Features",
          options_box: {
            title: "List of Researchers",
            options: { A: "Jorg Kudla", B: "Caixia Gao", C: "Joyce Van Eck", D: "Jonathan Jones" }
          },
          items: [
            { question_number: 19, question_text: "Domestication of certain plants could allow them to adapt to future environmental challenges.", answer: "B" },
            { question_number: 20, question_text: "The idea of growing and eating unusual plants may not be accepted on a large scale.", answer: "D" },
            { question_number: 21, question_text: "It is not advisable for the future direction of certain research to be made public.", answer: "A" },
            { question_number: 22, question_text: "Present efforts to domesticate one wild fruit are limited by the costs involved.", answer: "C" },
            { question_number: 23, question_text: "Humans only make use of a small proportion of the plant food available on Earth.", answer: "A" }
          ]
        },
        {
          questions: "24–26",
          instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Sentence Completion",
          items: [
            { question_number: 24, question_text: "An undesirable trait such as loss of [blank] may be caused by a mutation in a tomato gene.", answer: "flavour" },
            { question_number: 25, question_text: "By modifying one gene in a tomato plant, researchers made the tomato three times its original [blank].", answer: "size" },
            { question_number: 26, question_text: "A type of tomato which was not badly affected by [blank], and was rich in vitamin C, was produced by a team of researchers in China.", answer: "salt" }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Reading Passage",
      topic: "Insight or evolution?",
      passage_text: \`${p3Text.replace(/`/g, '\\`')}\`,
      questions: "27–40",
      question_groups: [
        {
          questions: "27–31",
          instructions: "Choose the correct letter, A, B, C or D.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 27,
              question_text: "The purpose of the first paragraph is to",
              options: { A: "defend particular ideas.", B: "compare certain beliefs.", C: "disprove a widely held view.", D: "outline a common assumption." },
              answer: "D"
            },
            {
              question_number: 28,
              question_text: "What are the writers doing in the second paragraph?",
              options: { A: "criticising an opinion", B: "justifying a standpoint", C: "explaining an approach", D: "supporting an argument" },
              answer: "A"
            },
            {
              question_number: 29,
              question_text: "In the third paragraph, what do the writers suggest about Darwin and Einstein?",
              options: { A: "They represent an exception to a general rule.", B: "Their way of working has been misunderstood.", C: "They are an ideal which others should aspire to.", D: "Their achievements deserve greater recognition." },
              answer: "A"
            },
            {
              question_number: 30,
              question_text: "John Nicholson is an example of a person whose idea",
              options: { A: "established his reputation as an influential scientist.", B: "was only fully understood at a later point in history.", C: "laid the foundations for someone else's breakthrough.", D: "initially met with scepticism from the scientific community." },
              answer: "C"
            },
            {
              question_number: 31,
              question_text: "What is the key point of interest about the 'acey-deucy' stirrup placement?",
              options: { A: "the simple reason why it was invented", B: "the enthusiasm with which it was adopted", C: "the research that went into its development", D: "the cleverness of the person who first used it" },
              answer: "A"
            }
          ]
        },
        {
          questions: "32–36",
          instructions: "Do the following statements agree with the claims of the writer in Reading Passage 3?",
          question_type: "Yes/No/Not Given",
          items: [
            { question_number: 32, question_text: "Acknowledging people such as Plato or da Vinci as geniuses will help us understand the process by which great minds create new ideas.", answer: "NO" },
            { question_number: 33, question_text: "The Law of Effect was discovered at a time when psychologists were seeking a scientific reason why creativity occurs.", answer: "NOT GIVEN" },
            { question_number: 34, question_text: "The Law of Effect states that no planning is involved in the behaviour of organisms.", answer: "YES" },
            { question_number: 35, question_text: "The Law of Effect sets out clear explanations about the sources of new ideas and behaviours.", answer: "NO" },
            { question_number: 36, question_text: "Many scientists are now turning away from the notion of intelligent design and genius.", answer: "NOT GIVEN" }
          ]
        },
        {
          questions: "37–40",
          instructions: "Complete the summary using the list of words, A–G, below.",
          topic: "The origins of creative behaviour",
          question_type: "Summary Completion",
          options_box: {
            title: "Options",
            options: { A: "invention", B: "goals", C: "compromise", D: "mistakes", E: "luck", F: "inspiration", G: "experiments" }
          },
          content: [
            {
              text: "The traditional view of scientific discovery is that breakthroughs happen when a single great mind has sudden 37 [blank] . Advances are more likely to be the result of a longer process. In some cases, this process involves 38 [blank] , such as Nicholson's theory about proto-elements. In others, simple necessity may provoke innovation, as with Westrope's decision to modify the position of his riding stirrups. There is also often an element of 39 [blank] , for example, the coincidence of ideas that led to the invention of the Post-It note. With both the Law of Natural Selection and the Law of Effect, there may be no clear 40 [blank] involved, but merely a process of variation and selection.",
              points: [
                { question_number: 37, answer: "F" },
                { question_number: 38, answer: "D" },
                { question_number: 39, answer: "E" },
                { question_number: 40, answer: "B" }
              ]
            }
          ]
        }
      ]
    }
  ]
};
`;

if (!seedContent.includes('const cambridgeIelts17ReadingTest2Questions =')) {
  let parts = seedContent.split('const cambridgeIelts17ReadingTest1Questions = {');
  if (parts.length === 2) {
    seedContent = parts[0] + test2Data + '\nconst cambridgeIelts17ReadingTest1Questions = {' + parts[1];
  } else {
    console.log("Failed to find cambridgeIelts17ReadingTest1Questions declaration");
  }
  
  const upsertCode = `await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 2",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest2Questions,
  });\n`;
  
  const upsertParts = seedContent.split('title: "Cambridge IELTS 17 - Reading Test 1",');
  if (upsertParts.length === 2) {
    const endOfUpsertIdx = upsertParts[1].indexOf('});');
    if (endOfUpsertIdx !== -1) {
      seedContent = upsertParts[0] + 'title: "Cambridge IELTS 17 - Reading Test 1",' + upsertParts[1].substring(0, endOfUpsertIdx + 3) + '\n\n  ' + upsertCode + upsertParts[1].substring(endOfUpsertIdx + 3);
    }
  } else {
    console.log("Failed to find Reading Test 1 upsert call");
  }
  
  fs.writeFileSync(seedPath, seedContent);
  console.log('Inject successful!');
} else {
  console.log('Already injected!');
}
