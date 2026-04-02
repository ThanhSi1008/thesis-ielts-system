const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, 'seed.ts');

function loadTranscript(jsonPath, partNum, highlightMappings, speakers) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const segments = raw.segments;
    let transcript = [];
    
    // Simplistic speaker assignment: For part 1 and 3, we alternate or keep track.
    // To make it highly accurate, we just map highlight texts.
    // For part 2 and 4, speaker is always OFFICIAL / SPEAKER.
    let currentSpeakerIndex = 0;
    
    for (let seg of segments) {
        let text = seg.text.trim();
        let speaker = "OFFICIAL";
        if (partNum === 1) {
            // Very naive speaker assigning for Part 1 since it alternates, but let's just use what we have or skip doing alternating and just use standard. 
            // Actually, we'll manually provide the transcript for part 1 because it's already done.
            // Let's use this generic function for part 2 and 4, which are monologues. 
            speaker = "OFFICIAL"; 
        } else if (partNum === 3) {
            speaker = "SPEAKER"; // We will fix part 3 manually later or just use SPEAKER
        } else if (partNum === 4) {
            speaker = "LECTURER";
        }
        
        let highlight = null;
        let qNum = null;
        for (let mapping of highlightMappings) {
            if (text.toLowerCase().includes(mapping.text.toLowerCase())) {
                highlight = mapping.text;
                qNum = mapping.qNum;
            }
        }
        
        const entry = { speaker, text };
        if (highlight) {
            entry.question_number = qNum;
            entry.highlight_text = highlight;
        }
        transcript.push(entry);
    }
    return transcript;
}

// Since Part 1 and Part 3 have multiple speakers, we should hardcode their transcripts or provide a very careful matching.
// To ensure high quality, I'll define them precisely here.

// I will define the exact structure for all parts based on my findings.

const cambridgeIelts13ListeningTest1Questions = {
    test_title: "Cambridge IELTS 13 - Listening Test 1",
    section: "Listening",
    parts: []
};

// ======================= PART 1 =======================
const part1Transcript = [
    { speaker: "OFFICIAL", text: "Hello, Tourist Information Centre, Mike speaking, how can I help you?" },
    { speaker: "WOMAN", text: "Oh, hi. I wanted to find out about cookery classes. I believe there are some one-day classes for tourists?" },
    { speaker: "OFFICIAL", text: "Well, they're open to everyone, but tourists are always welcome. Ok, let me give you some details of what's available. There are several classes. One very popular one is at the Food Studio." },
    { speaker: "WOMAN", text: "OK." },
    { speaker: "OFFICIAL", text: "They focus on seasonal products, and as well as teaching you how to cook them, they also show you how to choose them.", question_number: 1, highlight_text: "choose" },
    { speaker: "WOMAN", text: "Right, that sounds good. How big are the classes?" },
    { speaker: "OFFICIAL", text: "I'm not sure exactly, but they'll be quite small." },
    { speaker: "WOMAN", text: "And could I get a private lesson there?", question_number: 2, highlight_text: "private" },
    { speaker: "OFFICIAL", text: "I think so... let me check, yes, they do offer those. Though in fact most of the people who attend the classes find it's a nice way of getting to know one another." },
    { speaker: "WOMAN", text: "I suppose it must be, yes." },
    { speaker: "OFFICIAL", text: "And this company has a special deal for clients where they offer a discount of 20 percent if you return for a further class.", question_number: 3, highlight_text: "20 percent" },
    { speaker: "WOMAN", text: "OK. But you said there were several classes?" },
    { speaker: "OFFICIAL", text: "That's right. Another one you might be interested in is Bond's Cookery School. They're quite new, they just opened six months ago, but I've heard good things about them. They concentrate on teaching you to prepare healthy food, and they have quite a lot of specialist staff.", question_number: 4, highlight_text: "healthy" },
    { speaker: "WOMAN", text: "So is that food for people on a diet and things like that? I don't know if I'd be interested in that." },
    { speaker: "OFFICIAL", text: "Well, I don't think they particularly focus on low calorie diets or weight loss. It's more to do with recipes that look at specific needs, like including ingredients that will help build up your bones and make them stronger, that sort of thing.", question_number: 5, highlight_text: "bones" },
    { speaker: "WOMAN", text: "I see. Well, I might be interested, I'm not sure. Do they have a website I could check?" },
    { speaker: "OFFICIAL", text: "Yes, just key in the name of the school-- it'll come up. And if you want to know more about them, every Thursday evening they have a lecture at the school. It's free and you don't need to book or anything, just turn up at 7.30. And that might give you an idea of whether you want to go to an actual class.", question_number: 6, highlight_text: "lecture" },
    { speaker: "OFFICIAL", text: "OK, there's one more place you might be interested in. That's got a rather strange name, it's called The Arretsa Centre-- that's spelled A-R-R-E-T-S-A.", question_number: 7, highlight_text: "Arretsa" },
    { speaker: "WOMAN", text: "OK." },
    { speaker: "OFFICIAL", text: "They've got a very good reputation. They do a bit of meat and fish cookery but they mostly specialise in vegetarian dishes.", question_number: 8, highlight_text: "vegetarian" },
    { speaker: "WOMAN", text: "Right. That's certainly an area I'd like to learn more about. I've got lots of friends who don't eat meat. In fact, I think I might have seen that school today. Is it just by the market?", question_number: 9, highlight_text: "market" },
    { speaker: "OFFICIAL", text: "That's right. So they don't have any problem getting their ingredients. They're right next door. And they also offer a special two-hour course in how to use a knife. They cover all the different skills--buying them, sharpening, chopping techniques. It gets booked up quickly though so you'd need to check it was available.", question_number: 10, highlight_text: "knife" },
    { speaker: "WOMAN", text: "Right, well thank you very much. I'll go and ..." }
];

cambridgeIelts13ListeningTest1Questions.parts.push({
    part_number: 1,
    part_type: "Basic Conversation",
    audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1775050442/IELTS13-Tests1-4CD1Track_01_dvevha.mp3",
    questions: "1–10",
    topic: "COOKERY CLASSES",
    transcript: part1Transcript,
    question_groups: [
        {
            questions: "1–10",
            instructions: "Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.",
            topic: "COOKERY CLASSES",
            question_type: "Note Completion",
            content: [
                {
                    heading: "The Food Studio",
                    points: [
                        { text: "small classes" },
                        { text: "focus on how to 1 .............................. and cook with seasonal products", question_number: 1, answer: "choose", timestamp_seconds: 209 },
                        { text: "also offers 2 .............................. classes", question_number: 2, answer: "private", timestamp_seconds: 218 },
                        { text: "clients who return get a 3 .............................. discount", question_number: 3, answer: "20 / twenty percent", timestamp_seconds: 236 },
                    ],
                },
                {
                    heading: "Bond's Cookery School",
                    points: [
                        { text: "food that is 4 ..............................", question_number: 4, answer: "healthy", timestamp_seconds: 253 },
                        { text: "includes recipes to strengthen your 5 ..............................", question_number: 5, answer: "bones", timestamp_seconds: 275 },
                        { text: "they have a free 6 .............................. every Thursday", question_number: 6, answer: "lecture", timestamp_seconds: 294 },
                    ],
                },
                {
                    heading: "The 7 .............................. Centre",
                    points: [
                        { text: "mainly 8 .............................. food", question_number: 8, answer: "vegetarian", timestamp_seconds: 362 },
                        { text: "located near the 9 ..............................", question_number: 9, answer: "market", timestamp_seconds: 376 },
                        { text: "a special course in skills with a 10 .............................. is sometimes available", question_number: 10, answer: "knife", timestamp_seconds: 384 },
                    ],
                }
            ]
        }
    ]
});

// Since "The 7 .............................. Centre" is a heading itself in the UI, we should add question 7 properly. Let's fix that.
cambridgeIelts13ListeningTest1Questions.parts[0].question_groups[0].content[2].heading = "The 7 _________ Centre";
// Adding a note/point for 7 might be weird if it's the heading, but we follow structural norms.
cambridgeIelts13ListeningTest1Questions.parts[0].question_groups[0].content[2].points.unshift({ text: "The name of the centre is 7 ..............................", question_number: 7, answer: "Arretsa", timestamp_seconds: 348 });

// ======================= PART 2 =======================
const part2RawJson = JSON.parse(fs.readFileSync('../../srt/listening/cam13/test1/part2/timestamp_file/IELTS13-Tests1-4CD1Track_02.json'));
let part2Transcript = [];
let part2Highlights = [
    { text: "volume of traffic", q: 11 },
    { text: "cars parked along the sides", q: 12 },
    { text: "everyone obeys them", q: 13 },
    { text: "the school road junction", q: 14 },
    { text: "in front of the supermarket", q: 15 },
    { text: "allow parking there but not at the other end", q: 16 },
    { text: "forbidding parking for 25", q: 17 },
    { text: "on the side road up towards the bank", q: 18 },
    { text: "widen the pavement on school road", q: 19 },
    { text: "loading and unloading for the supermarket", q: 20 },
];
let used2 = new Set();
for (let seg of part2RawJson.segments) {
    let t = seg.text;
    let hn = null;
    let ht = null;
    for (let h of part2Highlights) {
        if (!used2.has(h.q) && t.toLowerCase().includes(h.text.toLowerCase())) {
            hn = h.q;
            ht = h.text;
            used2.add(h.q);
        }
    }
    let entry = { speaker: "OFFICIAL", text: t.trim() };
    if (hn) { entry.question_number = hn; entry.highlight_text = ht; }
    part2Transcript.push(entry);
}

cambridgeIelts13ListeningTest1Questions.parts.push({
    part_number: 2,
    part_type: "Monologue",
    topic: "Traffic Changes in Granford",
    audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1775051911/IELTS13-Tests1-4CD1Track_02_h2ofvj.mp3", // Assuming regular structure. Wait, we don't know the cloudinary link. I will just read it from audio_link.txt
    questions: "11–20",
    transcript: part2Transcript,
    question_groups: [
        {
            questions: "11–13",
            instructions: "Choose the correct letter, A, B or C.",
            topic: "Traffic Changes in Granford",
            question_type: "Multiple Choice (one answer)",
            items: [
                { question_number: 11, question_text: "Why are changes needed to traffic systems in Granford?", options: { "A": "The number of traffic accidents has risen.", "B": "The amount of traffic on the roads has increased.", "C": "The types of vehicles on the roads have changed." }, answer: "B", timestamp_seconds: 96 },
                { question_number: 12, question_text: "In a survey, local residents particularly complained about", options: { "A": "dangerous driving by parents.", "B": "pollution from trucks and lorries.", "C": "inconvenience from parked cars." }, answer: "C", timestamp_seconds: 117 },
                { question_number: 13, question_text: "According to the speaker, one problem with the new regulations will be", options: { "A": "raising money to pay for them.", "B": "finding a way to make people follow them.", "C": "getting the support of the police." }, answer: "B", timestamp_seconds: 156 },
            ]
        },
        {
             questions: "14–20",
             instructions: "Label the map below.\nWrite the correct letter, A-I, next to Questions 14-20.",
             question_type: "Map Labelling",
             topic: "Proposed traffic changes in Granford",
             image_url: fs.readFileSync('../../srt/listening/cam13/test1/part2/question_images/map_image_link.txt', 'utf-8').trim(),
             items: [
                 { question_number: 14, question_text: "14 New traffic lights", answer: "E", timestamp_seconds: 232 },
                 { question_number: 15, question_text: "15 Pedestrian crossing", answer: "D", timestamp_seconds: 260 },
                 { question_number: 16, question_text: "16 Parking allowed", answer: "B", timestamp_seconds: 275 },
                 { question_number: 17, question_text: "17 New 'No Parking' sign", answer: "G", timestamp_seconds: 289 },
                 { question_number: 18, question_text: "18 New disabled parking spaces", answer: "C", timestamp_seconds: 309 },
                 { question_number: 19, question_text: "19 Widened pavement", answer: "H", timestamp_seconds: 322 },
                 { question_number: 20, question_text: "20 Lorry loading/unloading restrictions", answer: "I", timestamp_seconds: 335 },
             ]
        }
    ]
});

// We need to fetch the audio link.
const part2AudioUrl = fs.readFileSync('../../srt/listening/cam13/test1/part2/audio_link.txt', 'utf-8').trim();
cambridgeIelts13ListeningTest1Questions.parts[1].audio_url = part2AudioUrl;

// ======================= PART 3 =======================
const part3AudioUrl = fs.readFileSync('../../srt/listening/cam13/test1/part3/audio_link.txt', 'utf-8').trim();
// I will manually reconstruct transcript from track_03 to split Emma and Jack.
// Doing fuzzy matching.
const part3RawJson = JSON.parse(fs.readFileSync('../../srt/listening/cam13/test1/part3/timestamp_file/IELTS13-Tests1-4CD1Track_03.json'));
let part3Transcript = [];
let emmaLines = ["We've got to choose", "OK. Any particular reason?", "Good idea.", "OK. We'd need to allow time", "So that's make it a good one to choose.", "Yeah, it's only 5% actually", "The one by Graves", "Yes. I'd been hoping for something more practical.", "About seeds that lie in the ground", "Was that the article with the illustrations", "Anyway, shall we have a look at the procedure", "I think that would be enough", "That'll be quite time consuming", "No. I think we need a different one", "Then all we have to do is look at our numbers"];
let t3segs = part3RawJson.segments;
let currentSpeaker3 = "JACK";
let used3 = new Set();
let part3Highlights = [
    { text: "useful for that", q: 21 },
    { text: "allow time for the seeds to come up", q: 22 },
    { text: "sure we're the only ones doing it", q: 23 },
    { text: "lots about the theory", q: 24 },
    { text: "was done in a lot of detail", q: 25 },
    { text: "four different ones", q: 26 },
    { text: "much it weighs", q: 27 },
    { text: "how deep we're going to plant", q: 28 },
    { text: "different one for each seed", q: 29 },
    { text: "how tall they've grown", q: 30 },
];
for(let seg of t3segs) {
     let t = seg.text.trim();
     for(let el of emmaLines) { if(t.includes(el.split(" ")[0]) && t.includes(el.split(" ")[1])) currentSpeaker3 = "EMMA"; }
     if(t.includes("That's right. I thought") || t.includes("Yeah, but practically") || t.includes("No, there's an optional module") || t.includes("Well, I thought for this experiment") || t.includes("And I don't suppose") || t.includes("Yeah. We need to have a word") || t.includes("I'm sure our aim's okay") || t.includes("Did you read that book") || t.includes("It would be for this experiment") || t.includes("It does include references") || t.includes("That's the one. I knew a bit") || t.includes("His analysis of figures") || t.includes("I think those diagrams") || t.includes("Right. So the first thing") || t.includes("Then for each seed") || t.includes("OK, So then we get planting.") || t.includes("Right. And we'll need to label them.") || t.includes("That's right.")) {
         currentSpeaker3 = "JACK";
     }
     
     let hn = null;
     let ht = null;
     for (let h of part3Highlights) {
        if (!used3.has(h.q) && t.toLowerCase().includes(h.text.toLowerCase())) {
            hn = h.q;
            ht = h.text;
            used3.add(h.q);
        }
     }
     let entry = { speaker: currentSpeaker3, text: t };
     if (hn) { entry.question_number = hn; entry.highlight_text = ht; }
     part3Transcript.push(entry);
}

cambridgeIelts13ListeningTest1Questions.parts.push({
    part_number: 3,
    part_type: "Conversation",
    topic: "Seed Germination Experiment",
    audio_url: part3AudioUrl,
    questions: "21–30",
    transcript: part3Transcript,
    question_groups: [
        {
            questions: "21–25",
            instructions: "Choose the correct letter, A, B or C.",
            question_type: "Multiple Choice (one answer)",
            items: [
                { question_number: 21, question_text: "Why is Jack interested in investigating seed germination?", options: { "A": "He may do a module on a related topic later on.", "B": "He wants to have a career in plant science.", "C": "He is thinking of choosing this topic for his dissertation." }, answer: "A", timestamp_seconds: 92 },
                { question_number: 22, question_text: "Jack and Emma agree the main advantage of their present experiment is that it can be", options: { "A": "described very easily.", "B": "carried out inside the laboratory.", "C": "completed in the time available." }, answer: "C", timestamp_seconds: 125 },
                { question_number: 23, question_text: "What do they decide to check with their tutor?", options: { "A": "whether their aim is appropriate", "B": "whether anyone else has chosen this topic", "C": "whether the assignment contributes to their final grade" }, answer: "B", timestamp_seconds: 161 },
                { question_number: 24, question_text: "They agree that Graves' book on seed germination is disappointing because", options: { "A": "it fails to cover recent advances in seed science.", "B": "the content is irrelevant for them.", "C": "its focus is very theoretical." }, answer: "C", timestamp_seconds: 187 },
                { question_number: 25, question_text: "What does Jack say about the article on seed germination by Lee Hall?", options: { "A": "The diagrams of plant development are useful.", "B": "The analysis of seed germination statistics is thorough.", "C": "The findings on seed germination after fires are surprising." }, answer: "B", timestamp_seconds: 221 },
            ]
        },
        {
            questions: "26–30",
            instructions: "Complete the flow-chart below.\nChoose FIVE answers from the box and write the correct letter, A-H, next to Questions 26-30.",
            question_type: "Flowchart Completion",
            topic: "Stages in the experiment",
            options_box: {
                title: "Options",
                options: { "A": "container", "B": "soil", "C": "weight", "D": "condition", "E": "height", "F": "colour", "G": "types", "H": "depths" }
            },
            content: [
                {
                    heading: "Stages in the experiment",
                    points: [
                        { text: "Select seeds of different 26 .............................. and sizes.", question_number: 26, answer: "G", timestamp_seconds: 305 },
                        { text: "Measure and record the 27 .............................. and size of each one.", question_number: 27, answer: "C", timestamp_seconds: 315 },
                        { text: "Decide on the 28 .............................. to be used.", question_number: 28, answer: "H", timestamp_seconds: 327 },
                        { text: "Use a different 29 .............................. for each seed and label it.", question_number: 29, answer: "A", timestamp_seconds: 347 },
                        { text: "After about 3 weeks, record the plant's 30 .............................. .", question_number: 30, answer: "E", timestamp_seconds: 366 },
                    ]
                }
            ]
        }
    ]
});


// ======================= PART 4 =======================
const part4AudioUrl = fs.readFileSync('../../srt/listening/cam13/test1/part4/audio_link.txt', 'utf-8').trim();
const part4RawJson = JSON.parse(fs.readFileSync('../../srt/listening/cam13/test1/part4/timestamp_file/IELTS13-Tests1-4CD1Track_04.json'));
let part4Transcript = [];
let used4 = new Set();
let part4Highlights = [
    { text: "adaptable is the crow", q: 31 },
    { text: "perched on cliffs", q: 32 },
    { text: "the speed with which", q: 33 },
    { text: "jump in brain", q: 34 },
    { text: "to find food", q: 35 },
    { text: "at their behavior", q: 36 },
    { text: "anything new", q: 37 },
    { text: "are under stress", q: 38 },
    { text: "waving their tails", q: 39 },
    { text: "be permanent", q: 40 },
];
for (let seg of part4RawJson.segments) {
    let t = seg.text;
    let hn = null;
    let ht = null;
    for (let h of part4Highlights) {
        if (!used4.has(h.q) && t.toLowerCase().includes(h.text.toLowerCase())) {
            hn = h.q;
            ht = h.text;
            used4.add(h.q);
        }
    }
    let entry = { speaker: "LECTURER", text: t.trim() };
    if (hn) { entry.question_number = hn; entry.highlight_text = ht; }
    part4Transcript.push(entry);
}

cambridgeIelts13ListeningTest1Questions.parts.push({
    part_number: 4,
    part_type: "Lecture",
    topic: "Effects of urban environments on animals",
    audio_url: part4AudioUrl,
    questions: "31–40",
    transcript: part4Transcript,
    question_groups: [
        {
            questions: "31–40",
            instructions: "Complete the notes below.\nWrite ONE WORD ONLY for each answer.",
            topic: "Effects of urban environments on animals",
            question_type: "Note Completion",
            content: [
                {
                    heading: "Introduction",
                    points: [
                        { text: "Recent urban developments represent massive environmental changes. It was previously thought that only a few animals were suitable for city life, e.g." },
                        { text: "the 31 .............................. — because of its general adaptability", question_number: 31, answer: "crow", timestamp_seconds: 107 },
                        { text: "the pigeon — because walls of city buildings are similar to 32 ..............................", question_number: 32, answer: "cliffs", timestamp_seconds: 124 },
                        { text: "In fact, many urban animals are adapting with unusual 33 .............................. .", question_number: 33, answer: "speed", timestamp_seconds: 144 },
                    ]
                },
                {
                    heading: "Recent research",
                    points: [
                        { text: "Emilie Snell-Rood studied small urbanised mammal specimens from museums in Minnesota." },
                        { text: "She found the size of their 34 .............................. had increased.", question_number: 34, answer: "brain(s)", timestamp_seconds: 191 },
                        { text: "She suggests this may be due to the need to locate new sources of 35 .............................. and to deal with new dangers.", question_number: 35, answer: "food", timestamp_seconds: 219 },
                        { text: "Catarina Miranda focused on the 36 .............................. of urban and rural blackbirds.", question_number: 36, answer: "behaviour(s) / behavior(s)", timestamp_seconds: 242 },
                        { text: "She found urban birds were often braver, but were afraid of situations that were 37 .............................. .", question_number: 37, answer: "new", timestamp_seconds: 259 },
                        { text: "Jonathan Atwell studies how animals respond to urban environments." },
                        { text: "He found that some animals respond to 38 .............................. by producing lower levels of hormones.", question_number: 38, answer: "stress", timestamp_seconds: 287 },
                        { text: "Sarah Partan's team found urban squirrels use their 39 .............................. to help them communicate.", question_number: 39, answer: "tail(s)", timestamp_seconds: 318 },
                    ]
                },
                {
                    heading: "Long-term possibilities",
                    points: [
                        { text: "Species of animals may develop which are unique to cities. However, some changes may not be 40 .............................. .", question_number: 40, answer: "permanent", timestamp_seconds: 347 },
                    ]
                }
            ]
        }
    ]
});


const injectionCode = '\nconst cambridgeIelts13ListeningTest1Questions = ' + JSON.stringify(cambridgeIelts13ListeningTest1Questions, null, 2) + ';\n';

const upsertCode = `  await upsertCambridgeExam({
    title: "Cambridge IELTS 13 - Listening Test 1",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 30,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts13ListeningTest1Questions,
    isPublished: true,
  });

`;

let seedPathContent = fs.readFileSync(seedPath, 'utf8');

if (!seedPathContent.includes('const cambridgeIelts13ListeningTest1Questions =')) {
  const writingTestsIdx = seedPathContent.indexOf('Writing Tests');
  if (writingTestsIdx === -1) {
    console.error('Could not find Writing Tests marker in seed.ts');
    process.exit(1);
  }
  
  // Find the start of the line for the marker
  let insertIdx = seedPathContent.lastIndexOf('\n', writingTestsIdx);
  if (insertIdx === -1) insertIdx = 0;
  
  // Insert variable declaration before the marker line
  seedPathContent = seedPathContent.slice(0, insertIdx) + '\n' + injectionCode + seedPathContent.slice(insertIdx);

  // Re-calculate the insertIdx because we just added string content before it
  const writingTestsIdx2 = seedPathContent.indexOf('Writing Tests', insertIdx + injectionCode.length);
  let insertIdx2 = seedPathContent.lastIndexOf('\n', writingTestsIdx2);
  if (insertIdx2 === -1) insertIdx2 = 0;

  // Insert the upsert call before the marker line
  seedPathContent = seedPathContent.slice(0, insertIdx2) + '\n' + upsertCode + seedPathContent.slice(insertIdx2);

  fs.writeFileSync(seedPath, seedPathContent);
  console.log('Successfully injected Cambridge 13 Listening Test 1 data into seed.ts');
} else {
  console.log('Data already exists in seed.ts');
}
