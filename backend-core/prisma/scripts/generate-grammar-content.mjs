import fs from 'fs';
import path from 'path';

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const OUTPUT_DIR = path.join(process.cwd(), 'prisma/data/grammar-generated');
const DELAY_MS = 4000; // Rate limiting between API calls (15 RPM free tier)

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const INTERMEDIATE_UNITS = [
  { order: 1, title: "Present continuous (I am doing)" },
  { order: 2, title: "Present simple (I do)" },
  { order: 3, title: "Present continuous and present simple 1 (I am doing and I do)" },
  { order: 4, title: "Present continuous and present simple 2 (I am doing and I do)" },
  { order: 5, title: "Past simple (I did)" },
  { order: 6, title: "Past continuous (I was doing)" },
  { order: 7, title: "Present perfect 1 (I have done)" },
  { order: 8, title: "Present perfect 2 (I have done)" },
  { order: 9, title: "Present perfect continuous (I have been doing)" },
  { order: 10, title: "Present perfect continuous and simple (I have been doing and I have done)" },
  { order: 11, title: "how long have you (been) ... ?" },
  { order: 12, title: "for and since when ... ? and how long ... ?" },
  { order: 13, title: "Present perfect and past 1 (I have done and I did)" },
  { order: 14, title: "Present perfect and past 2 (I have done and I did)" },
  { order: 15, title: "Past perfect (I had done)" },
  { order: 16, title: "Past perfect continuous (I had been doing)" },
  { order: 17, title: "have and have got" },
  { order: 18, title: "used to (do)" },
  { order: 19, title: "Present tenses (I am doing / I do) for the future" },
  { order: 20, title: "I’m going to (do)" },
  { order: 21, title: "will and shall 1" },
  { order: 22, title: "will and shall 2" },
  { order: 23, title: "I will and I’m going to" },
  { order: 24, title: "will be doing and will have done" },
  { order: 25, title: "when I do and when I’ve done if and when" },
  { order: 26, title: "can, could and (be) able to" },
  { order: 27, title: "could (do) and could have (done)" },
  { order: 28, title: "must and can’t" },
  { order: 29, title: "may and might 1" },
  { order: 30, title: "may and might 2" },
  { order: 31, title: "have to and must" },
  { order: 32, title: "must mustn’t needn’t" },
  { order: 33, title: "should 1" },
  { order: 34, title: "should 2" },
  { order: 35, title: "I’d better ... it’s time ..." },
  { order: 36, title: "would" },
  { order: 37, title: "can/could/would you ... ? etc. (Requests, offers, permission and invitations)" },
  { order: 38, title: "if I do ... and if I did ..." },
  { order: 39, title: "if I knew ... I wish I knew ..." },
  { order: 40, title: "if I had known ... I wish I had known ..." },
  { order: 41, title: "wish" },
  { order: 42, title: "Passive 1 (is done / was done)" },
  { order: 43, title: "Passive 2 (be done / been done / being done)" },
  { order: 44, title: "Passive 3" },
  { order: 45, title: "it is said that ... he is said to ... he is supposed to ..." },
  { order: 46, title: "have something done" },
  { order: 47, title: "Reported speech 1 (he said that ...)" },
  { order: 48, title: "Reported speech 2" },
  { order: 49, title: "Questions 1" },
  { order: 50, title: "Questions 2 (do you know where ... ? / he asked me where ...)" },
  { order: 51, title: "Auxiliary verbs (have/do/can etc.) I think so / I hope so etc." },
  { order: 52, title: "Question tags (do you? isn’t it? etc.)" },
  { order: 53, title: "Verb + -ing (enjoy doing / stop doing etc.)" },
  { order: 54, title: "Verb + to ... (decide to ... / forget to ... etc.)" },
  { order: 55, title: "Verb (+ object) + to ... (I want you to ...)" },
  { order: 56, title: "Verb + -ing or to ... 1 (remember, regret etc.)" },
  { order: 57, title: "Verb + -ing or to ... 2 (try, need, help)" },
  { order: 58, title: "Verb + -ing or to ... 3 (like / would like etc.)" },
  { order: 59, title: "prefer and would rather" },
  { order: 60, title: "Preposition (in/for/about etc.) + -ing" },
  { order: 61, title: "be/get used to ... (I’m used to ...)" },
  { order: 62, title: "Verb + preposition + -ing (succeed in -ing / insist on -ing etc.)" },
  { order: 63, title: "there’s no point in -ing, it’s worth -ing etc." },
  { order: 64, title: "to ... , for ... and so that ..." },
  { order: 65, title: "Adjective + to ..." },
  { order: 66, title: "to ... (afraid to do) and preposition + -ing (afraid of -ing)" },
  { order: 67, title: "see somebody do and see somebody doing" },
  { order: 68, title: "-ing clauses (He hurt his knee playing football.)" },
  { order: 69, title: "Countable and uncountable 1" },
  { order: 70, title: "Countable and uncountable 2" },
  { order: 71, title: "Countable nouns with a/an and some" },
  { order: 72, title: "a/an and the" },
  { order: 73, title: "the 1" },
  { order: 74, title: "the 2 (school / the school etc.)" },
  { order: 75, title: "the 3 (children / the children)" },
  { order: 76, title: "the 4 (the giraffe / the telephone / the old etc.)" },
  { order: 77, title: "Names with and without the 1" },
  { order: 78, title: "Names with and without the 2" },
  { order: 79, title: "Singular and plural" },
  { order: 80, title: "Noun + noun (a bus driver / a headache)" },
  { order: 81, title: "-’s (your sister’s name) and of ... (the name of the book)" },
  { order: 82, title: "myself/yourself/themselves etc." },
  { order: 83, title: "a friend of mine my own house on my own / by myself" },
  { order: 84, title: "there ... and it ..." },
  { order: 85, title: "some and any" },
  { order: 86, title: "no/none/any nothing/nobody etc." },
  { order: 87, title: "much, many, little, few, a lot, plenty" },
  { order: 88, title: "all / all of most / most of no / none of etc." },
  { order: 89, title: "both / both of neither / neither of either / either of" },
  { order: 90, title: "all every whole" },
  { order: 91, title: "each and every" },
  { order: 92, title: "Relative clauses 1: clauses with who/that/which" },
  { order: 93, title: "Relative clauses 2: clauses with and without who/that/which" },
  { order: 94, title: "Relative clauses 3: whose/whom/where" },
  { order: 95, title: "Relative clauses 4: extra information clauses (1)" },
  { order: 96, title: "Relative clauses 5: extra information clauses (2)" },
  { order: 97, title: "-ing and -ed clauses (the woman talking to Tom, the boy injured in the accident)" },
  { order: 98, title: "Adjectives ending in -ing and -ed (boring/bored etc.)" },
  { order: 99, title: "Adjectives: a nice new house, you look tired" },
  { order: 100, title: "Adjectives and adverbs 1 (quick/quickly)" },
  { order: 101, title: "Adjectives and adverbs 2 (well, fast, late, hard/hardly)" },
  { order: 102, title: "so and such" },
  { order: 103, title: "enough and too" },
  { order: 104, title: "quite, pretty, rather and fairly" },
  { order: 105, title: "Comparative 1 (cheaper, more expensive etc.)" },
  { order: 106, title: "Comparative 2 (much better / any better etc.)" },
  { order: 107, title: "Comparative 3 (as ... as / than)" },
  { order: 108, title: "Superlative (the longest, the most enjoyable etc.)" },
  { order: 109, title: "Word order 1: verb + object; place and time" },
  { order: 110, title: "Word order 2: adverbs with the verb" },
  { order: 111, title: "still any more yet already" },
  { order: 112, title: "even" },
  { order: 113, title: "although though even though in spite of despite" },
  { order: 114, title: "in case" },
  { order: 115, title: "unless as long as provided" },
  { order: 116, title: "as (as I walked ... / as I was ... etc.)" },
  { order: 117, title: "like and as" },
  { order: 118, title: "like as if" },
  { order: 119, title: "during for while" },
  { order: 120, title: "by and until by the time ..." },
  { order: 121, title: "at/on/in (time)" },
  { order: 122, title: "on time and in time at the end and in the end" },
  { order: 123, title: "in/at/on (position) 1" },
  { order: 124, title: "in/at/on (position) 2" },
  { order: 125, title: "in/at/on (position) 3" },
  { order: 126, title: "to, at, in and into" },
  { order: 127, title: "in/on/at (other uses)" },
  { order: 128, title: "by" },
  { order: 129, title: "Noun + preposition (reason for, cause of etc.)" },
  { order: 130, title: "Adjective + preposition 1" },
  { order: 131, title: "Adjective + preposition 2" },
  { order: 132, title: "Verb + preposition 1 to and at" },
  { order: 133, title: "Verb + preposition 2 about/for/of/after" },
  { order: 134, title: "Verb + preposition 3 about and of" },
  { order: 135, title: "Verb + preposition 4 of/for/from/on" },
  { order: 136, title: "Verb + preposition 5 in/into/with/to/on" },
  { order: 137, title: "Phrasal verbs 1 Introduction" },
  { order: 138, title: "Phrasal verbs 2 in/out" },
  { order: 139, title: "Phrasal verbs 3 out" },
  { order: 140, title: "Phrasal verbs 4 on/off (1)" },
  { order: 141, title: "Phrasal verbs 5 on/off (2)" },
  { order: 142, title: "Phrasal verbs 6 up/down" },
  { order: 143, title: "Phrasal verbs 7 up (1)" },
  { order: 144, title: "Phrasal verbs 8 up (2)" },
  { order: 145, title: "Phrasal verbs 9 away/back" }
];

const THEORY_PROMPT = (unitNumber, title, level) => `
You are creating educational English grammar content for a learning platform.

Generate a grammar theory lesson for:
- Book: "\${level} English Grammar"
- Unit \${unitNumber}: "\${title}"

FORMAT REQUIREMENTS:
Return a JSON object with exactly this structure:
{
  "theory": "<HTML string>",
  "exercises": [<exercise objects>]
}

THEORY HTML REQUIREMENTS:
- Wrap everything in: <div class="space-y-6 text-gray-800">...</div>
- Use <section> tags for each main section (A, B, C, D)
- Section headings: <h3 class="text-xl font-bold mb-4 text-blue-800">A. [Title]</h3>
- Example boxes: <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">...</div>
- Grammar formation tables: <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">...</div>
- Example sentences with highlights: <strong>verb form</strong> and wrong usage <span class="text-red-400 text-sm">(not wrong form)</span>
- Correct usage: <span class="text-green-500 font-bold">✓</span>
- Warning notes: <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-6">...</div>
- Verb/keyword chips: <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">word</span>
- Include 8-12 example sentences showing correct usage
- Include 2-3 common mistakes with corrections
- Aim for 400-600 words of explanation

EXERCISE REQUIREMENTS:
Generate exactly 4 exercises:

Exercise 1 (fill_blank with verb bank):
{
  "id": "\${unitNumber}.1",
  "question": "Description of what to do",
  "verbs": ["verb1", "verb2", ...],  // 6-8 verbs
  "items": [
    { "label": "1. She ________ a book.", "answer": "is reading", "isExample": true, "value": "She's reading a book." },
    { "label": "2. He ________ ...", "answer": "correct form" }
  ]
}

Exercise 2 (match):
{
  "id": "\${unitNumber}.2",
  "question": "Match the sentences on the left with the correct endings on the right.",
  "matches": [
    { "left": "1. It's raining.", "right": "c. Take an umbrella.", "isExample": true },
    { "left": "2. She's tired.", "right": "a. She should rest." }
  ]
}

Exercise 3 (fill_blank - write questions):
{
  "id": "\${unitNumber}.3",
  "question": "Write questions using the given words.",
  "items": [
    { "label": "1. what / happen? → What's happening?", "isExample": true, "value": "What's happening?" },
    { "label": "2. why / you / cry?", "answer": "Why are you crying?" }
  ]
}

Exercise 4 (fill_blank - put verb in correct form):
{
  "id": "\${unitNumber}.4",
  "question": "Put the verb into the correct form, positive or negative.",
  "items": [
    { "label": "1. I ________ (try) to work.", "answer": "am trying", "isExample": true, "value": "I'm trying" },
    { "label": "2. It ________ (rain) any more.", "answer": "isn't raining" }
  ]
}

IMPORTANT:
- All answers must be grammatically correct
- Examples (isExample: true) show the answer; practice items do NOT
- Use natural, everyday English sentences
- Return ONLY valid JSON, no markdown code fences
`;

async function generateUnit(unit, level) {
  const prompt = THEORY_PROMPT(unit.order, unit.title, level);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ API error for unit ${unit.order}: ${response.status}`, errorBody);
    return null;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error(`❌ Empty response for unit ${unit.order}`);
    return null;
  }

  try {
    const parsed = JSON.parse(text);
    return validateAndClean(parsed, unit);
  } catch (e) {
    console.error(`❌ Invalid JSON for unit ${unit.order}: ${e.message}`);
    // Try to extract JSON from markdown fences
    const match = text.match(/```json?\s*([\s\S]*?)```/);
    if (match) {
      try { return validateAndClean(JSON.parse(match[1]), unit); } catch {}
    }
    return null;
  }
}

function validateAndClean(data, unit) {
  if (!data.theory || typeof data.theory !== 'string') {
    console.warn(`⚠️ Unit ${unit.order}: Missing or invalid theory`);
    return null;
  }
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
    console.warn(`⚠️ Unit ${unit.order}: Missing exercises`);
    return null;
  }

  // Validate each exercise has answers
  for (const ex of data.exercises) {
    if (ex.items) {
      const nonExamples = ex.items.filter(i => !i.isExample);
      if (nonExamples.some(i => !i.answer)) {
        console.warn(`⚠️ Unit ${unit.order}, Ex ${ex.id}: Missing answers`);
      }
    }
    if (ex.matches) {
      if (ex.matches.length < 4) {
        console.warn(`⚠️ Unit ${unit.order}, Ex ${ex.id}: Too few matches`);
      }
    }
  }

  return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const bookSlug = 'intermediate';
  const units = INTERMEDIATE_UNITS.slice(0, 5); // ONLY DOING 5 UNITS FOR DEMO SO IT DOESN'T TAKE FOREVER
  const results = [];

  for (const unit of units) {
    const outputFile = path.join(OUTPUT_DIR, `${bookSlug}-unit-${unit.order}.json`);

    // Skip if already generated
    if (fs.existsSync(outputFile)) {
      console.log(`⏭️ Unit ${unit.order} already exists, skipping`);
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      results.push({ ...unit, ...existing });
      continue;
    }

    console.log(`🔄 Generating unit ${unit.order}: ${unit.title}...`);
    const content = await generateUnit(unit, 'Intermediate');

    if (content) {
      fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
      results.push({ ...unit, ...content });
      console.log(`✅ Unit ${unit.order} saved`);
    } else {
      console.error(`❌ Unit ${unit.order} failed — will retry next run`);
    }

    await sleep(DELAY_MS);
  }

  // Assemble into final seed format
  const seedData = {
    slug: bookSlug,
    name: "English Grammar in Use",
    author: "Raymond Murphy",
    level: "Intermediate",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    color: "#3B82F6",
    unitCount: 145,
    units: results.map(u => ({
      title: u.title,
      order: u.order,
      theoryContent: u.theory || null,
      exercises: (u.exercises || []).map((ex, idx) => ({
        section: ex.id || `${u.order}.${idx + 1}`,
        question: ex.question,
        type: ex.matches ? 'match' : 'fill_blank',
        options: ex.verbs ? JSON.stringify({ verbs: ex.verbs }) : null,
        items: JSON.stringify(ex.items || ex.matches || []),
        order: idx + 1,
      })),
    })),
  };

  const outputPath = path.join(process.cwd(), `prisma/data/grammar-${bookSlug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`\n📦 Assembled seed data: ${outputPath}`);
  console.log(`   ${results.length}/${units.length} units generated`);
}

main().catch(console.error);
