import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components';
import {
  L_BANDS,
  RA_BANDS,
  RG_BANDS,
  SP_BANDS,
  W1_BANDS,
  W2_BANDS,
  bandUtils,
} from '@/lib/bandCalculator';

const getBandLabel = (b: number) =>
  b >= 7 ? 'Good User' : b >= 5.5 ? 'Modest / Competent' : 'Limited or below';

// ─── HELPER STEPS ────────────────────────────────────────────────────

export function Stepper({
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
  const { colors } = useTheme();
  const n = parseInt(value) || 0;
  return (
    <View style={[styles.stepperContainer, { borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => onChange(String(Math.max(min, n - 1)))}
        style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
      >
        <Text style={{ fontSize: 22, color: colors.textSecondary }}>−</Text>
      </TouchableOpacity>
      <View style={styles.stepperValueContainer}>
        <Text style={[styles.stepperValue, { color: colors.text }]}>
          {value === '' ? '—' : value}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onChange(String(Math.min(max, n + 1)))}
        style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
      >
        <Text style={{ fontSize: 22, color: colors.textSecondary }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── SCORE TABLE ─────────────────────────────────────────────────────

export function ScoreTable({
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
  const { colors } = useTheme();
  return (
    <View style={[styles.scoreTable, { borderColor: colors.border }]}>
      <View
        style={[
          styles.scoreTableHeader,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
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
              { borderBottomColor: colors.surface },
              hi && { backgroundColor: color + '12', borderLeftWidth: 3, borderLeftColor: color },
            ]}
          >
            <Text
              style={[
                styles.scoreTableRowRaw,
                { color: colors.textSecondary },
                hi && { fontFamily: FONTS.bold, color: colors.text },
              ]}
            >
              {row.r}
            </Text>
            <Text
              style={[
                styles.scoreTableRowBand,
                { color: colors.text },
                hi && { fontSize: 16, color, fontFamily: FONTS.bold },
              ]}
            >
              {row.b.toFixed(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── BAND DESCRIPTOR VIEW ───────────────────────────────────────────

export function BandDescriptorView({
  descriptor,
  color,
  initBand = null,
}: {
  descriptor: any;
  color: string;
  initBand?: number | null;
}) {
  const { colors } = useTheme();
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
              style={[
                styles.bandPickerBtn,
                { backgroundColor: colors.surface },
                on && { backgroundColor: color },
              ]}
            >
              <Text
                style={[
                  styles.bandPickerBtnText,
                  { color: colors.textSecondary },
                  on && { color: '#fff', fontFamily: FONTS.bold },
                ]}
              >
                {b}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {row ? (
        <View style={{ marginTop: 16, gap: 10 }}>
          <View
            style={[
              styles.bandSummary,
              { backgroundColor: color + '08', borderColor: color + '25' },
            ]}
          >
            <Text style={[styles.bandSummaryScore, { color }]}>{sel}</Text>
            <View>
              <Text style={[styles.bandSummaryTitle, { color }]}>Band {sel}</Text>
              <Text style={styles.bandSummaryDesc}>{getBandLabel(sel!)}</Text>
            </View>
          </View>
          {descriptor.criteria.map((label: string, i: number) => {
            const key = descriptor.keys[i];
            return (
              <View
                key={key}
                style={[
                  styles.criteriaCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderLeftColor: color,
                  },
                ]}
              >
                <Text style={[styles.criteriaLabel, { color }]}>{label}</Text>
                <Text style={[styles.criteriaText, { color: colors.text }]}>{row[key]}</Text>
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

// ─── STEPS & CALCULATOR TABS ────────────────────────────────────────

export function ListeningTab() {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [rawVal, setRawVal] = useState('');

  const handleRaw = (v: string) => {
    setRawVal(v);
    if (!v) return setHighlighted(null);
    const n = parseInt(v);
    if (isNaN(n) || n < 0 || n > 40) return;
    const m = bandUtils.findRaw(L_BANDS, n);
    setHighlighted(m ? m.b : null);
  };

  const handleBand = (b: number) => {
    setHighlighted(b);
    const row = bandUtils.findBand(L_BANDS, b);
    if (row) setRawVal(String(Math.round((row.range[0] + row.range[1]) / 2)));
  };

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>TARGET BAND SCORE</Text>
        <View style={styles.quickBandSelector}>
          {bandUtils.uniqBands(L_BANDS).map((b: number) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBand(b)}
              style={[
                styles.quickBandBtn,
                highlighted === b && {
                  backgroundColor: COLORS.skill.listening + '20',
                  borderColor: COLORS.skill.listening,
                },
              ]}
            >
              <Text
                style={[
                  styles.quickBandText,
                  highlighted === b && { color: COLORS.skill.listening, fontFamily: FONTS.bold },
                ]}
              >
                {b.toFixed(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>RAW SCORE (0–40)</Text>
        <Stepper value={rawVal} onChange={handleRaw} />
      </View>
      <ScoreTable
        data={L_BANDS}
        highlighted={highlighted}
        onRowClick={(b) => setHighlighted(highlighted === b ? null : b)}
        color={COLORS.skill.listening}
      />
    </View>
  );
}

export function ReadingTab() {
  const { colors } = useTheme();
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
    const m = bandUtils.findRaw(data, n);
    setHighlighted(m ? m.b : null);
  };

  const handleBand = (b: number) => {
    setHighlighted(b);
    const row = bandUtils.findBand(data, b);
    if (row) setRawVal(String(Math.round((row.range[0] + row.range[1]) / 2)));
  };

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>TEST TYPE</Text>
        <View
          style={[
            styles.segmentControl,
            { backgroundColor: colors.surface === '#ffffff' ? '#ebebeb' : '#27272a' },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleType('ACADEMIC')}
            style={[
              styles.segmentBtn,
              type === 'ACADEMIC' && [styles.segmentBtnActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text style={[styles.segmentText, type === 'ACADEMIC' && { color: colors.text }]}>
              Academic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleType('GENERAL')}
            style={[
              styles.segmentBtn,
              type === 'GENERAL' && [styles.segmentBtnActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text style={[styles.segmentText, type === 'GENERAL' && { color: colors.text }]}>
              General
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>TARGET BAND SCORE</Text>
        <View style={styles.quickBandSelector}>
          {bandUtils.uniqBands(data).map((b: number) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBand(b)}
              style={[
                styles.quickBandBtn,
                highlighted === b && {
                  backgroundColor: COLORS.skill.reading + '20',
                  borderColor: COLORS.skill.reading,
                },
              ]}
            >
              <Text
                style={[
                  styles.quickBandText,
                  highlighted === b && { color: COLORS.skill.reading, fontFamily: FONTS.bold },
                ]}
              >
                {b.toFixed(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>RAW SCORE (0–40)</Text>
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

export function WritingTab() {
  const { colors } = useTheme();
  const [task, setTask] = useState<'task1' | 'task2'>('task2');
  const descriptor = task === 'task1' ? W1_BANDS : W2_BANDS;
  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>TASK TYPE</Text>
        <View
          style={[
            styles.segmentControl,
            { backgroundColor: colors.surface === '#ffffff' ? '#ebebeb' : '#27272a' },
          ]}
        >
          <TouchableOpacity
            onPress={() => setTask('task1')}
            style={[
              styles.segmentBtn,
              task === 'task1' && [styles.segmentBtnActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text style={[styles.segmentText, task === 'task1' && { color: colors.text }]}>
              Task 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTask('task2')}
            style={[
              styles.segmentBtn,
              task === 'task2' && [styles.segmentBtnActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text style={[styles.segmentText, task === 'task2' && { color: colors.text }]}>
              Task 2
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.fieldLabel}>BAND DESCRIPTORS</Text>
        <BandDescriptorView descriptor={descriptor} color={COLORS.skill.writing} />
      </View>
    </View>
  );
}

export function SpeakingTab() {
  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={styles.fieldLabel}>BAND DESCRIPTORS</Text>
        <BandDescriptorView descriptor={SP_BANDS} color={COLORS.skill.speaking} />
      </View>
    </View>
  );
}

// ─── BAND STEPPER ────────────────────────────────────────────────────

export function BandStepper({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  const { colors } = useTheme();
  const num = value === '' ? 0 : parseFloat(value);
  const displayVal = value === '' ? '—' : num.toFixed(1);

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
        { borderColor: colors.border, backgroundColor: colors.surface },
        value !== '' && { borderColor: color, backgroundColor: color + '0a' },
      ]}
    >
      <TouchableOpacity onPress={handleDec} style={styles.bandStepperBtn}>
        <Ionicons name="remove" size={18} color={value !== '' ? color : colors.textSecondary} />
      </TouchableOpacity>
      <View style={styles.bandStepperVal}>
        <Text
          style={[
            styles.bandStepperText,
            { color: colors.textSecondary },
            value !== '' && { color, fontFamily: FONTS.bold },
          ]}
        >
          {displayVal}
        </Text>
      </View>
      <TouchableOpacity onPress={handleInc} style={styles.bandStepperBtn}>
        <Ionicons name="add" size={18} color={value !== '' ? color : colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 50,
  },
  stepperBtn: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueContainer: { flex: 1, alignItems: 'center' },
  stepperValue: { fontFamily: FONTS.bold, fontSize: 18 },

  scoreTable: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  scoreTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
  },
  scoreTableRowRaw: { flex: 1, fontFamily: FONTS.medium, fontSize: 14 },
  scoreTableRowBand: { fontSize: 15 },

  bandPicker: { gap: 8, paddingBottom: 8 },
  bandPickerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandPickerBtnText: { fontFamily: FONTS.bold, fontSize: 15 },

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
  bandSummaryDesc: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },

  criteriaCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
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
  criteriaText: { fontFamily: FONTS.medium, fontSize: 13, lineHeight: 20 },
  bandEmptyText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: 20,
  },
  fieldLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  quickBandSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickBandBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickBandText: { fontSize: 13, color: COLORS.gray[400] },

  segmentControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.gray[400] },

  bandStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  bandStepperBtn: { width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' },
  bandStepperVal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bandStepperText: { fontFamily: FONTS.medium, fontSize: 15 },
});
