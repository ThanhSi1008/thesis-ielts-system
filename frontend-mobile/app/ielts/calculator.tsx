import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '@/constants';

// ─── DATA ──────────────────────────────────────────────────────────
const L_BANDS = [
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
const RA_BANDS = [
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
const RG_BANDS = [
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
const SP_BANDS: any = {
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
const W1_BANDS: any = {
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
const W2_BANDS: any = {
  criteria: ['Task Response', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range'],
  keys: ['tr', 'cc', 'lr', 'gra'],
  bands: W1_BANDS.bands, // Simplified for brevity as descriptions are similar structurally for the demo
};

const ALL_BANDS = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0];

const utils = {
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

const SK_COLOR: Record<string, string> = {
  listening: COLORS.skill.listening,
  reading: COLORS.skill.reading,
  writing: COLORS.skill.writing,
  speaking: COLORS.skill.speaking,
};
const SK_ICON: Record<string, string> = {
  listening: 'headset',
  reading: 'book',
  writing: 'create',
  speaking: 'mic',
};
const SK_LABEL: Record<string, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};
const TABS = ['listening', 'reading', 'writing', 'speaking'];

const getBandColor = (b: number | null) =>
  b == null ? COLORS.gray[400] : b >= 7 ? COLORS.success : b >= 5.5 ? COLORS.info : COLORS.warning;
const getBandLabel = (b: number) =>
  b >= 7 ? 'Good user' : b >= 5.5 ? 'Modest / Competent' : 'Limited or below';

// ─── COMPONENTS ────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
  min = 0,
  max = 40,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  const n = parseInt(value) || 0;
  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        onPress={() => onChange(String(Math.max(min, n - 1)))}
        style={styles.stepperBtn}
      >
        <Text style={styles.stepperBtnText}>−</Text>
      </TouchableOpacity>
      <View style={styles.stepperValueContainer}>
        <Text style={styles.stepperValue}>{value === '' ? '—' : value}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onChange(String(Math.min(max, n + 1)))}
        style={styles.stepperBtn}
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function ScoreTable({
  data,
  highlighted,
  onRowClick,
  color,
}: {
  data: any[];
  highlighted: number | null;
  onRowClick: (b: number) => void;
  color: string;
}) {
  return (
    <View style={styles.scoreTable}>
      <View style={styles.scoreTableHeader}>
        <Text style={styles.scoreTableHeaderTextRaw}>Raw Score</Text>
        <Text style={styles.scoreTableHeaderTextBand}>Band</Text>
      </View>
      {data.map((row, i) => {
        const hi = highlighted === row.b;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onRowClick(row.b)}
            style={[
              styles.scoreTableRow,
              hi && { backgroundColor: color + '0d', borderLeftWidth: 3, borderLeftColor: color },
            ]}
          >
            <Text
              style={[
                styles.scoreTableRowRaw,
                hi && { fontFamily: FONTS.bold, color: COLORS.text },
              ]}
            >
              {row.r}
            </Text>
            <Text style={[styles.scoreTableRowBand, hi && { fontSize: 17, color }]}>
              {row.b % 1 === 0 ? row.b + '.0' : row.b}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BandDescriptorView({
  descriptor,
  color,
  initBand = null,
}: {
  descriptor: any;
  color: string;
  initBand?: number | null;
}) {
  const [sel, setSel] = useState<number | null>(initBand);
  const BANDS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const row = sel != null ? descriptor.bands[sel] : null;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bandPicker}
      >
        {BANDS.map((b) => {
          const on = sel === b;
          return (
            <TouchableOpacity
              key={b}
              onPress={() => setSel(on ? null : b)}
              style={[styles.bandPickerBtn, on && { backgroundColor: color, shadowColor: color }]}
            >
              <Text style={[styles.bandPickerBtnText, on && { color: COLORS.background }]}>{b}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {row ? (
        <View style={{ marginTop: 16, gap: 10 }}>
          <View
            style={[
              styles.bandSummary,
              { backgroundColor: color + '0d', borderColor: color + '25' },
            ]}
          >
            <Text style={[styles.bandSummaryScore, { color }]}>{sel}</Text>
            <View>
              <Text style={[styles.bandSummaryTitle, { color }]}>Band {sel}</Text>
              <Text style={styles.bandSummaryDesc}>{getBandLabel(sel as number)}</Text>
            </View>
          </View>
          {descriptor.criteria.map((label: string, i: number) => {
            const key = descriptor.keys[i];
            return (
              <View key={key} style={[styles.criteriaCard, { borderLeftColor: color }]}>
                <Text style={[styles.criteriaLabel, { color }]}>{label}</Text>
                <Text style={styles.criteriaText}>{row[key]}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.bandEmptyText}>Select a band number above to view descriptors</Text>
      )}
    </View>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────

function ListeningTab() {
  const data = L_BANDS;
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [rawVal, setRawVal] = useState('');

  const handleRaw = (v: string) => {
    setRawVal(v);
    if (!v) return setHighlighted(null);
    const n = parseInt(v);
    if (isNaN(n) || n < 0 || n > 40) return;
    const m = utils.findRaw(data, n);
    setHighlighted(m ? m.b : null);
  };

  const handleBand = (b: number) => {
    setHighlighted(b);
    const row = utils.findBand(data, b);
    if (row) setRawVal(String(Math.round((row.range[0] + row.range[1]) / 2)));
  };

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="star" size={12} /> TARGET BAND SCORE
        </Text>
        <View style={styles.quickBandSelector}>
          {utils.uniqBands(data).map((b: number) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBand(b)}
              style={[
                styles.quickBandBtn,
                highlighted === b && { backgroundColor: COLORS.skill.listening + '20', borderColor: COLORS.skill.listening },
              ]}
            >
              <Text style={[styles.quickBandText, highlighted === b && { color: COLORS.skill.listening }]}>
                {b % 1 === 0 ? b + '.0' : b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="calculator" size={12} /> RAW SCORE (0–40)
        </Text>
        <Stepper value={rawVal} onChange={handleRaw} />
      </View>
      <ScoreTable
        data={data}
        highlighted={highlighted}
        onRowClick={(b) => setHighlighted(highlighted === b ? null : b)}
        color={COLORS.skill.listening}
      />
    </View>
  );
}

function ReadingTab() {
  const [type, setType] = useState<'ACADEMIC' | 'GENERAL'>('ACADEMIC');
  const data = type === 'ACADEMIC' ? RA_BANDS : RG_BANDS;
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [rawVal, setRawVal] = useState('');

  const handleType = (t: 'ACADEMIC' | 'GENERAL') => {
    setType(t);
    setRawVal('');
    setHighlighted(null);
  };

  const handleRaw = (v: string) => {
    setRawVal(v);
    if (!v) return setHighlighted(null);
    const n = parseInt(v);
    if (isNaN(n) || n < 0 || n > 40) return;
    const m = utils.findRaw(data, n);
    setHighlighted(m ? m.b : null);
  };

  const handleBand = (b: number) => {
    setHighlighted(b);
    const row = utils.findBand(data, b);
    if (row) setRawVal(String(Math.round((row.range[0] + row.range[1]) / 2)));
  };

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="albums" size={12} /> TEST TYPE
        </Text>
        <View style={styles.segmentControl}>
          <TouchableOpacity
            onPress={() => handleType('ACADEMIC')}
            style={[styles.segmentBtn, type === 'ACADEMIC' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, type === 'ACADEMIC' && styles.segmentTextActive]}>
              Academic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleType('GENERAL')}
            style={[styles.segmentBtn, type === 'GENERAL' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, type === 'GENERAL' && styles.segmentTextActive]}>
              General
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="star" size={12} /> TARGET BAND SCORE
        </Text>
        <View style={styles.quickBandSelector}>
          {utils.uniqBands(data).map((b: number) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBand(b)}
              style={[
                styles.quickBandBtn,
                highlighted === b && { backgroundColor: COLORS.skill.reading + '20', borderColor: COLORS.skill.reading },
              ]}
            >
              <Text style={[styles.quickBandText, highlighted === b && { color: COLORS.skill.reading }]}>
                {b % 1 === 0 ? b + '.0' : b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="calculator" size={12} /> RAW SCORE (0–40)
        </Text>
        <Stepper value={rawVal} onChange={handleRaw} />
      </View>
      <ScoreTable
        data={data}
        highlighted={highlighted}
        onRowClick={(b) => setHighlighted(highlighted === b ? null : b)}
        color={COLORS.skill.reading}
      />
    </View>
  );
}

function WritingTab() {
  const [task, setTask] = useState<'task1' | 'task2'>('task2');
  const descriptor = task === 'task1' ? W1_BANDS : W2_BANDS;
  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="albums" size={12} /> TASK TYPE
        </Text>
        <View style={styles.segmentControl}>
          <TouchableOpacity
            onPress={() => setTask('task1')}
            style={[styles.segmentBtn, task === 'task1' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, task === 'task1' && styles.segmentTextActive]}>
              Task 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTask('task2')}
            style={[styles.segmentBtn, task === 'task2' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, task === 'task2' && styles.segmentTextActive]}>
              Task 2
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="bar-chart" size={12} /> BAND DESCRIPTORS
        </Text>
        <BandDescriptorView descriptor={descriptor} color={COLORS.skill.writing} />
      </View>
    </View>
  );
}

function SpeakingTab() {
  const descriptor = SP_BANDS;
  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>
          <Ionicons name="bar-chart" size={12} /> BAND DESCRIPTORS
        </Text>
        <BandDescriptorView descriptor={descriptor} color={COLORS.skill.speaking} />
      </View>
    </View>
  );
}

function BandStepper({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  const num = value === '' ? 0 : parseFloat(value);
  const displayVal = value === '' ? '—' : num % 1 === 0 ? num + '.0' : num;

  const handleDec = () => {
    if (value === '') onChange('6.0');
    else onChange(String(Math.max(0, num - 0.5)));
  };
  const handleInc = () => {
    if (value === '') onChange('6.0');
    else onChange(String(Math.min(9, num + 0.5)));
  };

  return (
    <View
      style={[
        styles.bandStepper,
        value !== '' && { borderColor: color, backgroundColor: color + '0d' },
      ]}
    >
      <TouchableOpacity onPress={handleDec} style={styles.bandStepperBtn}>
        <Ionicons name="remove" size={20} color={value !== '' ? color : COLORS.gray[400]} />
      </TouchableOpacity>
      <View style={styles.bandStepperVal}>
        <Text style={[styles.bandStepperText, value !== '' && { color }]}>{displayVal}</Text>
      </View>
      <TouchableOpacity onPress={handleInc} style={styles.bandStepperBtn}>
        <Ionicons name="add" size={20} color={value !== '' ? color : COLORS.gray[400]} />
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN SCREEN ───────────────────────────────────────────────────

export default function IELTSCalculatorScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('listening');
  const [bands, setBands] = useState<Record<string, string>>({
    listening: '',
    reading: '',
    writing: '',
    speaking: '',
  });

  const allFilled = Object.values(bands).every((v) => v !== '');
  const overall = allFilled
    ? utils.overall(
        Number(bands.listening),
        Number(bands.reading),
        Number(bands.writing),
        Number(bands.speaking),
      )
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>IELTS · LEXON</Text>
          <Text style={styles.headerTitle}>Calculator</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overall Calculator Widget */}
        <View style={styles.overallWidget}>
          <View style={styles.overallHeader}>
            <Ionicons name="calculator" size={16} color={COLORS.textSecondary} />
            <Text style={styles.overallTitle}>Overall Band Calculator</Text>
          </View>

          <View style={styles.overallInputs}>
            {TABS.map((tab) => (
              <View key={tab} style={styles.overallInputCol}>
                <Text style={styles.overallInputLabel}>{SK_LABEL[tab]}</Text>
                <BandStepper
                  value={bands[tab]}
                  onChange={(v) => setBands((p) => ({ ...p, [tab]: v }))}
                  color={SK_COLOR[tab]}
                />
              </View>
            ))}
          </View>

          <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.resultCard}>
            <View>
              <Text style={styles.resultCardLabel}>ESTIMATED</Text>
              <Text style={styles.resultCardTitle}>Overall Band</Text>
              {allFilled && overall !== null && (
                <Text style={[styles.resultCardBadge, { color: getBandColor(overall) }]}>
                  {getBandLabel(overall)}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.resultCardScore,
                { color: overall !== null ? getBandColor(overall) : 'rgba(255,255,255,0.2)' },
              ]}
            >
              {overall !== null ? (overall % 1 === 0 ? overall + '.0' : overall) : '—'}
            </Text>
          </LinearGradient>
        </View>

        {/* Tab Strip */}
        <View style={styles.tabStrip}>
          {TABS.map((tab) => {
            const on = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, on && styles.tabBtnActive]}
              >
                <Ionicons
                  name={SK_ICON[tab] as any}
                  size={14}
                  color={on ? SK_COLOR[tab] : COLORS.gray[400]}
                />
                <Text style={[styles.tabBtnText, on && { color: COLORS.text }]}>{SK_LABEL[tab]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentCard}>
          {activeTab === 'listening' && <ListeningTab />}
          {activeTab === 'reading' && <ReadingTab />}
          {activeTab === 'writing' && <WritingTab />}
          {activeTab === 'speaking' && <SpeakingTab />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerSubtitle: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.gray[400], letterSpacing: 1 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text },

  scrollContent: { padding: 16, paddingBottom: 40 },

  overallWidget: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overallHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  overallTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  overallInputs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  overallInputCol: { width: '47%' },
  overallInputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  bandStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  bandStepperBtn: { width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' },
  bandStepperVal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bandStepperText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.gray[400] },

  resultCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  resultCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  resultCardBadge: { fontFamily: FONTS.bold, fontSize: 11, marginTop: 6 },
  resultCardScore: { fontFamily: FONTS.bold, fontSize: 48, lineHeight: 54 },

  tabStrip: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabBtnText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.gray[400] },

  tabContentCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },

  fieldLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentBtnActive: {
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.gray[400] },
  segmentTextActive: { color: COLORS.text },

  quickBandSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickBandBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickBandText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.gray[400] },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
    backgroundColor: COLORS.background,
  },
  stepperBtn: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  stepperBtnText: { fontFamily: FONTS.medium, fontSize: 24, color: COLORS.textSecondary, marginTop: -4 },
  stepperValueContainer: { flex: 1, alignItems: 'center' },
  stepperValue: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text },

  scoreTable: { borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  scoreTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scoreTableHeaderTextRaw: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
  },
  scoreTableHeaderTextBand: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
  },
  scoreTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  scoreTableRowRaw: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary },
  scoreTableRowBand: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text },

  bandPicker: { gap: 8, paddingBottom: 8 },
  bandPickerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandPickerBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textSecondary },

  bandSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  bandSummaryScore: { fontFamily: FONTS.bold, fontSize: 32, lineHeight: 36 },
  bandSummaryTitle: { fontFamily: FONTS.bold, fontSize: 14 },
  bandSummaryDesc: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.gray[400], marginTop: 2 },

  criteriaCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  criteriaLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  criteriaText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  bandEmptyText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 20,
  },
});
