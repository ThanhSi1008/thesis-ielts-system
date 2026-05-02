// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScoreRow {
  rawRange: [number, number];
  rawLabel: string;
  band: number;
}

export interface BandDescriptorRow {
  band: number;
  criteria: Record<string, string>;
}

// ─── Score Table Helpers ──────────────────────────────────────────────────────

export function findRowByRawScore(table: ScoreRow[], rawScore: number): ScoreRow | null {
  return table.find((row) => rawScore >= row.rawRange[0] && rawScore <= row.rawRange[1]) ?? null;
}

export function findRowByBandScore(table: ScoreRow[], band: number): ScoreRow | null {
  return table.find((row) => row.band === band) ?? null;
}

export function getUniqueBands(table: ScoreRow[]): number[] {
  return table.map((r) => r.band);
}

// ─── Overall Band Calculator ──────────────────────────────────────────────────

export function calculateOverallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number,
): number {
  const avg = (listening + reading + writing + speaking) / 4;
  return Math.round(avg * 2) / 2;
}

// ─── Listening Score Table ────────────────────────────────────────────────────

export const LISTENING_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [39, 40], rawLabel: "39–40", band: 9 },
  { rawRange: [37, 38], rawLabel: "37–38", band: 8.5 },
  { rawRange: [35, 36], rawLabel: "35–36", band: 8 },
  { rawRange: [32, 34], rawLabel: "32–34", band: 7.5 },
  { rawRange: [30, 31], rawLabel: "30–31", band: 7 },
  { rawRange: [26, 29], rawLabel: "26–29", band: 6.5 },
  { rawRange: [23, 25], rawLabel: "23–25", band: 6 },
  { rawRange: [18, 22], rawLabel: "18–22", band: 5.5 },
  { rawRange: [16, 17], rawLabel: "16–17", band: 5 },
  { rawRange: [13, 15], rawLabel: "13–15", band: 4.5 },
  { rawRange: [11, 12], rawLabel: "11–12", band: 4 },
  { rawRange: [8, 10],  rawLabel: "8–10",  band: 3.5 },
  { rawRange: [6, 7],   rawLabel: "6–7",   band: 3 },
  { rawRange: [4, 5],   rawLabel: "4–5",   band: 2.5 },
  { rawRange: [2, 3],   rawLabel: "2–3",   band: 2 },
  { rawRange: [1, 1],   rawLabel: "1",     band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];

// ─── Reading Score Tables ─────────────────────────────────────────────────────

export const READING_ACADEMIC_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [39, 40], rawLabel: "39–40", band: 9 },
  { rawRange: [37, 38], rawLabel: "37–38", band: 8.5 },
  { rawRange: [35, 36], rawLabel: "35–36", band: 8 },
  { rawRange: [33, 34], rawLabel: "33–34", band: 7.5 },
  { rawRange: [30, 32], rawLabel: "30–32", band: 7 },
  { rawRange: [27, 29], rawLabel: "27–29", band: 6.5 },
  { rawRange: [23, 26], rawLabel: "23–26", band: 6 },
  { rawRange: [19, 22], rawLabel: "19–22", band: 5.5 },
  { rawRange: [15, 18], rawLabel: "15–18", band: 5 },
  { rawRange: [13, 14], rawLabel: "13–14", band: 4.5 },
  { rawRange: [10, 12], rawLabel: "10–12", band: 4 },
  { rawRange: [8, 9],   rawLabel: "8–9",   band: 3.5 },
  { rawRange: [6, 7],   rawLabel: "6–7",   band: 3 },
  { rawRange: [4, 5],   rawLabel: "4–5",   band: 2.5 },
  { rawRange: [2, 3],   rawLabel: "2–3",   band: 2 },
  { rawRange: [1, 1],   rawLabel: "1",     band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];

export const READING_GENERAL_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [40, 40], rawLabel: "40",    band: 9 },
  { rawRange: [39, 39], rawLabel: "39",    band: 8.5 },
  { rawRange: [38, 38], rawLabel: "38",    band: 8 },
  { rawRange: [36, 37], rawLabel: "36–37", band: 7.5 },
  { rawRange: [34, 35], rawLabel: "34–35", band: 7 },
  { rawRange: [32, 33], rawLabel: "32–33", band: 6.5 },
  { rawRange: [30, 31], rawLabel: "30–31", band: 6 },
  { rawRange: [27, 29], rawLabel: "27–29", band: 5.5 },
  { rawRange: [23, 26], rawLabel: "23–26", band: 5 },
  { rawRange: [19, 22], rawLabel: "19–22", band: 4.5 },
  { rawRange: [15, 18], rawLabel: "15–18", band: 4 },
  { rawRange: [12, 14], rawLabel: "12–14", band: 3.5 },
  { rawRange: [9, 11],  rawLabel: "9–11",  band: 3 },
  { rawRange: [6, 8],   rawLabel: "6–8",   band: 2.5 },
  { rawRange: [3, 5],   rawLabel: "3–5",   band: 2 },
  { rawRange: [1, 2],   rawLabel: "1–2",   band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];

// ─── Writing Descriptors ──────────────────────────────────────────────────────

export const WRITING_TASK_1_CRITERIA_LABELS = [
  "Task Achievement",
  "Coherence & Cohesion",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
];

export const WRITING_TASK_1_CRITERIA_KEYS = [
  "taskAchievement",
  "coherenceCohesion",
  "lexicalResource",
  "grammaticalRange",
];

export const WRITING_TASK_1_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    criteria: {
      taskAchievement:
        "Fully satisfies all the requirements of the task; clearly presents a fully developed response.",
      coherenceCohesion:
        "Uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing.",
      lexicalResource:
        "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.",
      grammaticalRange:
        "Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.",
    },
  },
  {
    band: 8,
    criteria: {
      taskAchievement:
        "Covers all requirements of the task sufficiently; presents, highlights and illustrates key features/bullet points clearly and appropriately.",
      coherenceCohesion:
        "Sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately.",
      lexicalResource:
        "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings; skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation; produces rare errors in spelling and/or word formation.",
      grammaticalRange:
        "Uses a wide range of structures; the majority of sentences are error-free; makes only very occasional errors or inappropriacies.",
    },
  },
  {
    band: 7,
    criteria: {
      taskAchievement:
        "Covers the requirements of the task; (A) presents a clear overview of main trends, differences or stages; (GT) presents a clear purpose, with the tone consistent and appropriate; clearly presents and highlights key features/bullet points but could be more fully extended.",
      coherenceCohesion:
        "Logically organises information and ideas; there is clear progression throughout; uses a range of cohesive devices appropriately although there may be some under-/over-use.",
      lexicalResource:
        "Uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with some awareness of style and collocation; may produce occasional errors in word choice, spelling and/or word formation.",
      grammaticalRange:
        "Uses a variety of complex structures; produces frequent error-free sentences; has good control of grammar and punctuation but may make a few errors.",
    },
  },
  {
    band: 6,
    criteria: {
      taskAchievement:
        "Addresses the requirements of the task; (A) presents an overview with information appropriately selected; (GT) presents a purpose that is generally clear; there may be inconsistencies in tone; presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate.",
      coherenceCohesion:
        "Arranges information and ideas coherently and there is a clear overall progression; uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical; may not always use referencing clearly or appropriately.",
      lexicalResource:
        "Uses an adequate range of vocabulary for the task; attempts to use less common vocabulary but with some inaccuracy; makes some errors in spelling and/or word formation, but they do not impede communication.",
      grammaticalRange:
        "Uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation but they rarely reduce communication.",
    },
  },
  {
    band: 5,
    criteria: {
      taskAchievement:
        "Generally addresses the task; the format may be inappropriate in places; (A) recounts detail mechanically with no clear overview; there may be no data to support the description; (GT) may present a purpose that is unclear; the tone may be variable and sometimes inappropriate; presents, but inadequately covers, key features/bullet points; there may be a tendency to focus on details.",
      coherenceCohesion:
        "Presents information with some organisation but there may be a lack of overall progression; makes inadequate, inaccurate or over-use of cohesive devices; may be repetitive because of lack of referencing and substitution.",
      lexicalResource:
        "Uses a limited range of vocabulary, but this is minimally adequate for the task; may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.",
      grammaticalRange:
        "Uses only a limited range of structures; attempts complex sentences but these tend to be less accurate than simple sentences; may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader.",
    },
  },
  {
    band: 4,
    criteria: {
      taskAchievement:
        "Attempts to address the task but does not cover all key features/bullet points; the format may be inappropriate; (GT) fails to clearly explain the purpose of the letter; the tone may be inappropriate; may confuse key features/bullet points with detail; parts may be unclear, irrelevant, repetitive or inaccurate.",
      coherenceCohesion:
        "Presents information and ideas but these are not arranged coherently and there is no clear progression in the response; uses some basic cohesive devices but these may be inaccurate or repetitive.",
      lexicalResource:
        "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task; has limited control of word formation and/or spelling; errors may cause strain for the reader.",
      grammaticalRange:
        "Uses only a very limited range of structures with only rare use of subordinate clauses; some structures are accurate but errors predominate, and punctuation is often faulty.",
    },
  },
  {
    band: 3,
    criteria: {
      taskAchievement:
        "Fails to address the task, which may have been completely misunderstood; presents limited ideas which may be largely irrelevant/repetitive.",
      coherenceCohesion:
        "Does not organise ideas logically; may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas.",
      lexicalResource:
        "Uses only a very limited range of words and expressions with very limited control of word formation and/or spelling; errors may severely distort the message.",
      grammaticalRange:
        "Attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning.",
    },
  },
  {
    band: 2,
    criteria: {
      taskAchievement: "Answer is barely related to the task.",
      coherenceCohesion: "Has very little control of organisational features.",
      lexicalResource:
        "Uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling.",
      grammaticalRange: "Cannot use sentence forms except in memorised phrases.",
    },
  },
  {
    band: 1,
    criteria: {
      taskAchievement:
        "Answer is completely unrelated to the task; does not attend; does not attempt the task in any way; writes a totally memorised response.",
      coherenceCohesion: "Fails to communicate any message.",
      lexicalResource: "Can only use a few isolated words.",
      grammaticalRange: "Cannot use sentence forms at all.",
    },
  },
  {
    band: 0,
    criteria: {
      taskAchievement: "Did not attempt the task.",
      coherenceCohesion: "Did not attempt the task.",
      lexicalResource: "Did not attempt the task.",
      grammaticalRange: "Did not attempt the task.",
    },
  },
];

export const WRITING_TASK_2_CRITERIA_LABELS = [
  "Task Response",
  "Coherence & Cohesion",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
];

export const WRITING_TASK_2_CRITERIA_KEYS = [
  "taskResponse",
  "coherenceCohesion",
  "lexicalResource",
  "grammaticalRange",
];

export const WRITING_TASK_2_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    criteria: {
      taskResponse:
        "Fully addresses all parts of the task; presents a fully developed position in answer to the question with relevant, fully extended and well supported ideas.",
      coherenceCohesion:
        "Uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing.",
      lexicalResource:
        "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.",
      grammaticalRange:
        "Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.",
    },
  },
  {
    band: 8,
    criteria: {
      taskResponse:
        "Sufficiently addresses all parts of the task; presents a well-developed response to the question with relevant, extended and supported ideas.",
      coherenceCohesion:
        "Sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately.",
      lexicalResource:
        "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings; skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation; produces rare errors in spelling and/or word formation.",
      grammaticalRange:
        "Uses a wide range of structures; the majority of sentences are error-free; makes only very occasional errors or inappropriacies.",
    },
  },
  {
    band: 7,
    criteria: {
      taskResponse:
        "Addresses all parts of the task; presents a clear position throughout the response; presents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus.",
      coherenceCohesion:
        "Logically organises information and ideas; there is clear progression throughout; uses a range of cohesive devices appropriately although there may be some under-/over-use; presents a clear central topic within each paragraph.",
      lexicalResource:
        "Uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with some awareness of style and collocation; may produce occasional errors in word choice, spelling and/or word formation.",
      grammaticalRange:
        "Uses a variety of complex structures; produces frequent error-free sentences; has good control of grammar and punctuation but may make a few errors.",
    },
  },
  {
    band: 6,
    criteria: {
      taskResponse:
        "Addresses all parts of the task although some parts may be more fully covered than others; presents a relevant position although the conclusions may become unclear or repetitive; presents relevant main ideas but some may be inadequately developed/unclear.",
      coherenceCohesion:
        "Arranges information and ideas coherently and there is a clear overall progression; uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical; may not always use referencing clearly or appropriately; uses paragraphing, but not always logically.",
      lexicalResource:
        "Uses an adequate range of vocabulary for the task; attempts to use less common vocabulary but with some inaccuracy; makes some errors in spelling and/or word formation, but they do not impede communication.",
      grammaticalRange:
        "Uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation but they rarely reduce communication.",
    },
  },
  {
    band: 5,
    criteria: {
      taskResponse:
        "Addresses the task only partially; the format may be inappropriate in places; expresses a position but the development is not always clear and there may be no conclusions drawn; presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail.",
      coherenceCohesion:
        "Presents information with some organisation but there may be a lack of overall progression; makes inadequate, inaccurate or over-use of cohesive devices; may be repetitive because of lack of referencing and substitution; may not write in paragraphs, or paragraphing may be inadequate.",
      lexicalResource:
        "Uses a limited range of vocabulary, but this is minimally adequate for the task; may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.",
      grammaticalRange:
        "Uses only a limited range of structures; attempts complex sentences but these tend to be less accurate than simple sentences; may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader.",
    },
  },
  {
    band: 4,
    criteria: {
      taskResponse:
        "Responds to the task only in a minimal way or the answer is tangential; the format may be inappropriate; presents a position but this is unclear; presents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported.",
      coherenceCohesion:
        "Presents information and ideas but these are not arranged coherently and there is no clear progression in the response; uses some basic cohesive devices but these may be inaccurate or repetitive; may not write in paragraphs, or paragraphing may be confusing.",
      lexicalResource:
        "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task; has limited control of word formation and/or spelling; errors may cause strain for the reader.",
      grammaticalRange:
        "Uses only a very limited range of structures with only rare use of subordinate clauses; some structures are accurate but errors predominate, and punctuation is often faulty.",
    },
  },
  {
    band: 3,
    criteria: {
      taskResponse:
        "Does not adequately address any part of the task; does not express a clear position; presents few ideas, which are largely undeveloped or irrelevant.",
      coherenceCohesion:
        "Does not organise ideas logically; may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas.",
      lexicalResource:
        "Uses only a very limited range of words and expressions with very limited control of word formation and/or spelling; errors may severely distort the message.",
      grammaticalRange:
        "Attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning.",
    },
  },
  {
    band: 2,
    criteria: {
      taskResponse: "Barely responds to the task; does not express a position; may attempt a few ideas but there is no development.",
      coherenceCohesion: "Has very little control of organisational features.",
      lexicalResource:
        "Uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling.",
      grammaticalRange: "Cannot use sentence forms except in memorised phrases.",
    },
  },
  {
    band: 1,
    criteria: {
      taskResponse:
        "Answer is completely unrelated to the task; does not attend; does not attempt the task in any way; writes a totally memorised response.",
      coherenceCohesion: "Fails to communicate any message.",
      lexicalResource: "Can only use a few isolated words.",
      grammaticalRange: "Cannot use sentence forms at all.",
    },
  },
  {
    band: 0,
    criteria: {
      taskResponse: "Did not attempt the task.",
      coherenceCohesion: "Did not attempt the task.",
      lexicalResource: "Did not attempt the task.",
      grammaticalRange: "Did not attempt the task.",
    },
  },
];

// ─── Speaking Descriptors ─────────────────────────────────────────────────────

export const SPEAKING_CRITERIA_LABELS = [
  "Fluency & Coherence",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
  "Pronunciation",
];

export const SPEAKING_CRITERIA_KEYS = [
  "fluencyCoherence",
  "lexicalResource",
  "grammaticalRange",
  "pronunciation",
];

export const SPEAKING_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    criteria: {
      fluencyCoherence:
        "Speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar; speaks coherently with fully appropriate cohesive features; develops topics fully and appropriately.",
      lexicalResource:
        "Uses vocabulary with full flexibility and precision in all topics; uses idiomatic language naturally and accurately.",
      grammaticalRange:
        "Uses a full range of structures naturally and appropriately; produces consistently accurate structures apart from 'slips' characteristic of native speaker speech.",
      pronunciation:
        "Uses a full range of pronunciation features with precision and subtlety; sustains flexible use of features throughout; is effortless to understand.",
    },
  },
  {
    band: 8,
    criteria: {
      fluencyCoherence:
        "Speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language; develops topics coherently and appropriately.",
      lexicalResource:
        "Uses a wide vocabulary resource readily and flexibly to convey precise meaning; uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies; uses paraphrase effectively as required.",
      grammaticalRange:
        "Uses a wide range of structures flexibly; produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors.",
      pronunciation:
        "Uses a wide range of pronunciation features; sustains flexible use of features, with only occasional lapses; is easy to understand throughout; L1 accent has minimal effect on intelligibility.",
    },
  },
  {
    band: 7,
    criteria: {
      fluencyCoherence:
        "Speaks at length without noticeable effort or loss of coherence; may demonstrate language-related hesitation at times, or some repetition and/or self-correction; uses a range of connectives and discourse markers with some flexibility.",
      lexicalResource:
        "Uses vocabulary resource flexibly to discuss a variety of topics; uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices; uses paraphrase effectively.",
      grammaticalRange:
        "Uses a range of complex structures with some flexibility; frequently produces error-free sentences, though some grammatical mistakes persist.",
      pronunciation:
        "Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8.",
    },
  },
  {
    band: 6,
    criteria: {
      fluencyCoherence:
        "Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation; uses a range of connectives and discourse markers but not always appropriately.",
      lexicalResource:
        "Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies; generally paraphrases successfully.",
      grammaticalRange:
        "Uses a mix of simple and complex structures, but with limited flexibility; may make frequent mistakes with complex structures, though these rarely cause comprehension problems.",
      pronunciation:
        "Uses a range of pronunciation features with mixed control; shows some effective use of features but this is not sustained; can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times.",
    },
  },
  {
    band: 5,
    criteria: {
      fluencyCoherence:
        "Usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going; may over-use certain connectives and discourse markers; produces simple speech fluently, but more complex communication causes fluency problems.",
      lexicalResource:
        "Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility; attempts to use paraphrase but with mixed success.",
      grammaticalRange:
        "Produces basic sentence forms with reasonable accuracy; uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems.",
      pronunciation:
        "Shows all the positive features of Band 4 and some, but not all, of the positive features of Band 6.",
    },
  },
  {
    band: 4,
    criteria: {
      fluencyCoherence:
        "Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction; links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence.",
      lexicalResource:
        "Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice; rarely attempts paraphrase.",
      grammaticalRange:
        "Produces basic sentence forms and some correct simple sentences but subordinate structures are rare; errors are frequent and may lead to misunderstanding.",
      pronunciation:
        "Uses a limited range of pronunciation features; attempts to control features but lapses are frequent; mispronunciations are frequent and cause some difficulty for the listener.",
    },
  },
  {
    band: 3,
    criteria: {
      fluencyCoherence:
        "Speaks with long pauses; has limited ability to link simple sentences; gives only simple responses and is frequently unable to convey basic message.",
      lexicalResource:
        "Uses simple vocabulary to convey personal information; has insufficient vocabulary for less familiar topics.",
      grammaticalRange:
        "Attempts basic sentence forms but with limited success, or relies on apparently memorised utterances; makes numerous errors except in memorised expressions.",
      pronunciation:
        "Shows some of the features of Band 2 and some, but not all, of the positive features of Band 4.",
    },
  },
  {
    band: 2,
    criteria: {
      fluencyCoherence: "Pauses lengthily before most words; little communication possible.",
      lexicalResource: "Only produces isolated words or memorised utterances.",
      grammaticalRange: "Cannot produce basic sentence forms.",
      pronunciation: "Speech is often unintelligible.",
    },
  },
  {
    band: 1,
    criteria: {
      fluencyCoherence: "No communication possible; no rateable language.",
      lexicalResource: "—",
      grammaticalRange: "—",
      pronunciation: "Does not attend.",
    },
  },
  {
    band: 0,
    criteria: {
      fluencyCoherence: "Did not attend.",
      lexicalResource: "Did not attend.",
      grammaticalRange: "Did not attend.",
      pronunciation: "Did not attend.",
    },
  },
];
