// IELTS Band Score Calculator Data and Logic

export const L_BANDS = [
  { r: '39–40', range: [39, 40], b: 9.0 },
  { r: '37–38', range: [37, 38], b: 8.5 },
  { r: '35–36', range: [35, 36], b: 8.0 },
  { r: '33–34', range: [33, 34], b: 7.5 },
  { r: '30–32', range: [30, 32], b: 7.0 },
  { r: '27–29', range: [27, 29], b: 6.5 },
  { r: '23–26', range: [23, 26], b: 6.0 },
  { r: '20–22', range: [20, 22], b: 5.5 },
  { r: '16–19', range: [16, 19], b: 5.0 },
  { r: '13–15', range: [13, 15], b: 4.5 },
  { r: '10–12', range: [10, 12], b: 4.0 },
  { r: '8–9', range: [8, 9], b: 3.5 },
  { r: '6–7', range: [6, 7], b: 3.0 },
  { r: '4–5', range: [4, 5], b: 2.5 },
  { r: '0–3', range: [0, 3], b: 1.0 },
];

export const RA_BANDS = [
  { r: '39–40', range: [39, 40], b: 9.0 },
  { r: '37–38', range: [37, 38], b: 8.5 },
  { r: '35–36', range: [35, 36], b: 8.0 },
  { r: '33–34', range: [33, 34], b: 7.5 },
  { r: '30–32', range: [30, 32], b: 7.0 },
  { r: '27–29', range: [27, 29], b: 6.5 },
  { r: '23–26', range: [23, 26], b: 6.0 },
  { r: '19–22', range: [19, 22], b: 5.5 },
  { r: '15–18', range: [15, 18], b: 5.0 },
  { r: '13–14', range: [13, 14], b: 4.5 },
  { r: '10–12', range: [10, 12], b: 4.0 },
  { r: '8–9', range: [8, 9], b: 3.5 },
  { r: '6–7', range: [6, 7], b: 3.0 },
  { r: '4–5', range: [4, 5], b: 2.5 },
  { r: '0–3', range: [0, 3], b: 1.0 },
];

export const RG_BANDS = [
  { r: '40', range: [40, 40], b: 9.0 },
  { r: '39', range: [39, 39], b: 8.5 },
  { r: '37–38', range: [37, 38], b: 8.0 },
  { r: '36', range: [36, 36], b: 7.5 },
  { r: '34–35', range: [34, 35], b: 7.0 },
  { r: '32–33', range: [32, 33], b: 6.5 },
  { r: '30–31', range: [30, 31], b: 6.0 },
  { r: '27–29', range: [27, 29], b: 5.5 },
  { r: '23–26', range: [23, 26], b: 5.0 },
  { r: '19–22', range: [19, 22], b: 4.5 },
  { r: '15–18', range: [15, 18], b: 4.0 },
  { r: '12–14', range: [12, 14], b: 3.5 },
  { r: '9–11', range: [9, 11], b: 3.0 },
  { r: '6–8', range: [6, 8], b: 2.5 },
  { r: '0–5', range: [0, 5], b: 1.0 },
];

export const SP_BANDS: any = {
  criteria: ['Fluency & Coherence', 'Lexical Resource', 'Grammatical Range', 'Pronunciation'],
  keys: ['fc', 'lr', 'gr', 'pr'],
  bands: {
    9: {
      fc: 'Speaks with complete fluency; any hesitation is natural and content-related only.',
      lr: 'Uses vocabulary with full flexibility and precision.',
      gr: 'Full range of structures used naturally and appropriately.',
      pr: 'Full range of pronunciation features with precision.',
    },
    8: {
      fc: 'Fluent with only occasional repetition or self-correction.',
      lr: 'Wide vocabulary used readily and flexibly; idiomatic vocabulary used skilfully.',
      gr: 'Wide range of structures with flexibility; majority of sentences error-free.',
      pr: 'Wide range of pronunciation features with only occasional lapses.',
    },
    7: {
      fc: 'Speaks at length without noticeable effort.',
      lr: 'Uses vocabulary flexibly across a variety of topics.',
      gr: 'High degree of grammatical control; uses complex structures.',
      pr: 'Shows effective use of pronunciation features.',
    },
    6: {
      fc: 'Willing to speak at length but may lose coherence.',
      lr: 'Vocabulary sufficient to discuss topics at length.',
      gr: 'Mix of simple and complex structures; frequent mistakes with complex forms.',
      pr: 'Range of pronunciation features with mixed control.',
    },
    5: {
      fc: 'Maintains flow but uses repetition and slow speech.',
      lr: 'Limited flexibility; attempts less common vocabulary with inaccuracy.',
      gr: 'Basic sentence forms with reasonable accuracy.',
      pr: 'Some positive features present but many attempts are inconsistent.',
    },
    4: {
      fc: 'Noticeable pauses; slow rate with little intonation variation.',
      lr: 'Talks about familiar topics; frequent errors in word choice.',
      gr: 'Basic sentence forms; subordinate structures rare.',
      pr: 'Limited range of features; frequent lapses.',
    },
    3: {
      fc: 'Long pauses before most utterances.',
      lr: 'Simple vocabulary used with frequent errors.',
      gr: 'Attempts basic sentences; grammatical errors are frequent.',
      pr: 'Mispronounces many words; often difficult to understand.',
    },
    2: {
      fc: 'Pauses lengthily before most words.',
      lr: 'Only isolated words and memorised utterances.',
      gr: 'No evidence of sentence forms.',
      pr: 'Articulation often unintelligible.',
    },
    1: {
      fc: 'No real communication possible.',
      lr: 'No rateable language.',
      gr: 'No rateable language.',
      pr: 'Pronunciation renders speech unintelligible.',
    },
    0: {
      fc: 'Did not attempt the test.',
      lr: 'Did not attempt the test.',
      gr: 'Did not attempt the test.',
      pr: 'Did not attempt the test.',
    },
  },
};

export const W1_BANDS: any = {
  criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range'],
  keys: ['ta', 'cc', 'lr', 'gra'],
  bands: {
    9: {
      ta: 'Fully satisfies all requirements.',
      cc: 'Sequences all information appropriately.',
      lr: 'Uses a wide range of vocabulary with natural control.',
      gra: 'Uses a wide range of structures with full flexibility.',
    },
    8: {
      ta: 'Covers all requirements; well organised.',
      cc: 'Sequences information logically.',
      lr: 'Wide vocabulary resource readily used.',
      gra: 'Wide range of structures used accurately.',
    },
    7: {
      ta: 'Covers the requirements; presents a clear overview.',
      cc: 'Logically organises information.',
      lr: 'Sufficient vocabulary range.',
      gra: 'Uses a variety of complex structures.',
    },
    6: {
      ta: 'Addresses requirements though overview may be unclear.',
      cc: 'Arranges information coherently.',
      lr: 'Adequate range of vocabulary.',
      gra: 'Mix of sentence forms; some errors.',
    },
    5: {
      ta: 'Addresses the task but format may be inappropriate.',
      cc: 'Some organisation but progression not clear.',
      lr: 'Limited vocabulary; noticeable repetition.',
      gra: 'Limited range of structures; errors present.',
    },
    4: {
      ta: 'Responds very limitedly.',
      cc: 'Information not arranged coherently.',
      lr: 'Only basic vocabulary; errors present.',
      gra: 'Very limited range; errors dominate.',
    },
    3: {
      ta: 'Does not adequately address the task.',
      cc: 'Very basic linking words.',
      lr: 'Only very basic vocabulary.',
      gra: 'Frequently dominated by errors.',
    },
    2: {
      ta: 'Barely responds to the task.',
      cc: 'Very little control of organisation.',
      lr: 'Extremely limited vocabulary.',
      gra: 'Cannot use sentence forms.',
    },
    1: {
      ta: 'Answer is completely unrelated.',
      cc: 'No apparent coherence.',
      lr: 'Can only use a few isolated words.',
      gra: 'Unable to use sentence forms.',
    },
    0: {
      ta: 'Did not attempt the task.',
      cc: 'Did not attempt the task.',
      lr: 'Did not attempt the task.',
      gra: 'Did not attempt the task.',
    },
  },
};

export const W2_BANDS: any = {
  criteria: ['Task Response', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range'],
  keys: ['tr', 'cc', 'lr', 'gra'],
  bands: W1_BANDS.bands,
};

export const ALL_BANDS = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0];

export const bandUtils = {
  overall: (l: number, r: number, w: number, s: number) => {
    const avg = (l + r + w + s) / 4;
    const whole = Math.floor(avg);
    const frac = avg - whole;
    return frac < 0.25 ? whole : frac < 0.75 ? whole + 0.5 : whole + 1;
  },
  findRaw: (table: any[], raw: number) =>
    table.find((row) => raw >= row.range[0] && raw <= row.range[1]) || null,
  findBand: (table: any[], band: number) => table.find((row) => row.b === band) || null,
  uniqBands: (table: any[]) => table.map((r) => r.b),
};

export function calculateListeningReadingBand(
  correctCount: number,
  moduleType: 'listening' | 'reading',
  subtype: 'academic' | 'general' = 'academic'
): number {
  if (correctCount < 0) return 0;
  if (correctCount > 40) correctCount = 40;

  let table = L_BANDS;
  if (moduleType === 'reading') {
    table = subtype === 'general' ? RG_BANDS : RA_BANDS;
  }

  const match = bandUtils.findRaw(table, correctCount);
  return match ? match.b : 1.0;
}
