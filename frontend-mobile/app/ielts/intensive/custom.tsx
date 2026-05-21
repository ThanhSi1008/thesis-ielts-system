import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────
type IeltsSkill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
type PartOption = 'all' | number;

const SKILLS: { key: IeltsSkill; label: string; icon: string; color: string }[] = [
  { key: 'LISTENING', label: 'Listening', icon: '🎧', color: COLORS.skill.listening },
  { key: 'READING', label: 'Reading', icon: '📖', color: COLORS.skill.reading },
  { key: 'WRITING', label: 'Writing', icon: '✍️', color: COLORS.skill.writing },
  { key: 'SPEAKING', label: 'Speaking', icon: '🎤', color: COLORS.skill.speaking },
];

const PART_COUNTS: Record<IeltsSkill, number> = {
  LISTENING: 4,
  READING: 3,
  WRITING: 2,
  SPEAKING: 3,
};

const PRESET_TIMES = [10, 20, 30, 40, 60];

// ─── Step header ─────────────────────────────────────────────────────────────
function StepLabel({ num, text }: { num: number; text: string }) {
  return (
    <View style={s.stepLabel}>
      <View style={s.stepBadge}>
        <Text style={s.stepNum}>{num}</Text>
      </View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  );
}

// ─── Option chip ──────────────────────────────────────────────────────────────
function OptionChip({
  label,
  active,
  color = COLORS.primary,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.optChip, active && { borderColor: color, backgroundColor: color + '15' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.optChipText, active && { color, fontFamily: FONTS.bold }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CustomPracticeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [skill, setSkill] = useState<IeltsSkill>('LISTENING');
  const [catalog, setCatalog] = useState<any>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExamLabel, setSelectedExamLabel] = useState<string>('Select an exam…');
  const [showExamPicker, setShowExamPicker] = useState(false);

  const [part, setPart] = useState<PartOption>('all');
  const [timeLimit, setTimeLimit] = useState(30);
  const [customTimeStr, setCustomTimeStr] = useState('30');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const skillInfo = SKILLS.find((s) => s.key === skill)!;
  const partCount = PART_COUNTS[skill];

  // Fetch catalog when skill changes
  useEffect(() => {
    const load = async () => {
      setLoadingCatalog(true);
      setCatalog(null);
      setSelectedExamId('');
      setSelectedExamLabel('Select an exam…');
      setPart('all');
      try {
        const data = await ieltsExamsApi.getIntensiveCatalog(skill);
        setCatalog(data);
        // Auto-select first exam
        const firstExam = data?.groups?.[0]?.tests?.[0];
        if (firstExam) {
          setSelectedExamId(firstExam.examId);
          setSelectedExamLabel(
            `${data.groups[0].title} – ${skill.charAt(0) + skill.slice(1).toLowerCase()} Test ${firstExam.testNumber}`,
          );
        }
      } catch {
        /* silent */
      } finally {
        setLoadingCatalog(false);
      }
    };
    load();
  }, [skill]);

  // Flat list of all exams for the picker
  const allExams = useMemo(() => {
    const list: { examId: string; label: string; group: string }[] = [];
    catalog?.groups?.forEach((g: any) => {
      g.tests?.forEach((t: any) => {
        list.push({
          examId: t.examId,
          group: g.title,
          label: `${g.title} – ${skill.charAt(0) + skill.slice(1).toLowerCase()} Test ${t.testNumber}`,
        });
      });
    });
    return list;
  }, [catalog, skill]);

  const canStart = !!selectedExamId;

  const handleStart = () => {
    if (!canStart) {
      Alert.alert('Select an exam', 'Please choose an exam source first.');
      return;
    }
    // Navigate to the exam player, passing custom params via query string
    const params: Record<string, string> = {
      customTime: String(timeLimit),
      autoSubmit: String(autoSubmit),
    };
    if (part !== 'all') params.practicePart = String(part);

    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    router.push((ROUTES.ieltsIntensiveExam(selectedExamId) + `?${query}`) as any);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Custom Practice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[s.subtitle, { color: colors.textMuted }]}>Build your own practice session exactly the way you want.</Text>

        {/* ── Step 1: Skill ─────────────────────────────────────────────── */}
        <StepLabel num={1} text="Select Skill" />
        <View style={s.chipRow}>
          {SKILLS.map((sk) => (
            <TouchableOpacity
              key={sk.key}
              style={[
                s.optChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                skill === sk.key && { borderColor: sk.color, backgroundColor: sk.color + '15' }
              ]}
              onPress={() => setSkill(sk.key)}
              activeOpacity={0.8}
            >
              <Text style={[s.optChipText, { color: colors.textSecondary }, skill === sk.key && { color: sk.color, fontFamily: FONTS.bold }]}>
                {sk.icon} {sk.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Step 2: Exam Source ────────────────────────────────────────── */}
        <StepLabel num={2} text="Select Exam Source" />
        {loadingCatalog ? (
          <View style={[s.loadingBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[s.loadingText, { color: colors.textMuted }]}>Loading exams…</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[s.examSelector, { backgroundColor: colors.card, borderColor: colors.border }, !canStart && { borderColor: colors.border }]}
              onPress={() => setShowExamPicker((v) => !v)}
              activeOpacity={0.8}
            >
              <Text
                style={[s.examSelectorText, { color: colors.text }, !selectedExamId && { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {selectedExamLabel}
              </Text>
              <Ionicons
                name={showExamPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Inline exam picker */}
            {showExamPicker && (
              <View style={[s.examPickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
                  {allExams.map((exam) => {
                    const active = exam.examId === selectedExamId;
                    return (
                      <TouchableOpacity
                        key={exam.examId}
                        style={[s.examPickerItem, { borderColor: colors.border }, active && { backgroundColor: colors.surface }]}
                        onPress={() => {
                          setSelectedExamId(exam.examId);
                          setSelectedExamLabel(exam.label);
                          setShowExamPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.examPickerText,
                            { color: colors.text },
                            active && { color: skillInfo.color, fontFamily: FONTS.bold },
                          ]}
                        >
                          {exam.label}
                        </Text>
                        {active && <Ionicons name="checkmark" size={16} color={skillInfo.color} />}
                      </TouchableOpacity>
                    );
                  })}
                  {allExams.length === 0 && (
                    <Text style={[s.examPickerEmpty, { color: colors.textMuted }]}>No exams available for this skill.</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* ── Step 3: Part ──────────────────────────────────────────────── */}
        <StepLabel num={3} text="Select Parts" />
        <View style={s.chipRow}>
          <TouchableOpacity
            style={[
              s.optChip,
              { backgroundColor: colors.card, borderColor: colors.border },
              part === 'all' && { borderColor: skillInfo.color, backgroundColor: skillInfo.color + '15' }
            ]}
            onPress={() => setPart('all')}
            activeOpacity={0.8}
          >
            <Text style={[s.optChipText, { color: colors.textSecondary }, part === 'all' && { color: skillInfo.color, fontFamily: FONTS.bold }]}>
              All Parts
            </Text>
          </TouchableOpacity>
          {Array.from({ length: partCount }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                s.optChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                part === n && { borderColor: skillInfo.color, backgroundColor: skillInfo.color + '15' }
              ]}
              onPress={() => setPart(n)}
              activeOpacity={0.8}
            >
              <Text style={[s.optChipText, { color: colors.textSecondary }, part === n && { color: skillInfo.color, fontFamily: FONTS.bold }]}>
                Part {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Step 4: Time Limit ────────────────────────────────────────── */}
        <StepLabel num={4} text="Time Limit" />
        <View style={s.chipRow}>
          {PRESET_TIMES.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                s.optChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                !isCustomTime && timeLimit === mins && { borderColor: skillInfo.color, backgroundColor: skillInfo.color + '15' }
              ]}
              onPress={() => {
                setIsCustomTime(false);
                setTimeLimit(mins);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.optChipText, { color: colors.textSecondary }, !isCustomTime && timeLimit === mins && { color: skillInfo.color, fontFamily: FONTS.bold }]}>
                {mins} min
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              s.optChip,
              { backgroundColor: colors.card, borderColor: colors.border },
              isCustomTime && { borderColor: skillInfo.color, backgroundColor: skillInfo.color + '15' }
            ]}
            onPress={() => setIsCustomTime(true)}
            activeOpacity={0.8}
          >
            <Text style={[s.optChipText, { color: colors.textSecondary }, isCustomTime && { color: skillInfo.color, fontFamily: FONTS.bold }]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>
        {isCustomTime && (
          <View style={s.customTimeRow}>
            <TextInput
              style={[s.customTimeInput, { backgroundColor: colors.card, borderColor: skillInfo.color, color: colors.text }]}
              value={customTimeStr}
              onChangeText={(t) => {
                setCustomTimeStr(t);
                const n = parseInt(t, 10);
                if (!isNaN(n) && n > 0 && n <= 180) setTimeLimit(n);
              }}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="30"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[s.customTimeLabel, { color: colors.textSecondary }]}>minutes (max 180)</Text>
          </View>
        )}

        {/* ── Step 5: Auto-Submit ───────────────────────────────────────── */}
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <View style={s.autoSubmitRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.autoSubmitTitle, { color: colors.text }]}>Auto-Submit when time is up</Text>
            <Text style={[s.autoSubmitSub, { color: colors.textSecondary }]}>
              If off, you can keep practicing after the timer reaches zero.
            </Text>
          </View>
          <Switch
            value={autoSubmit}
            onValueChange={setAutoSubmit}
            trackColor={{ false: colors.border, true: skillInfo.color }}
            thumbColor="#fff"
          />
        </View>

        {/* ── Summary card ─────────────────────────────────────────────── */}
        {canStart && (
          <View style={[s.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: skillInfo.color }]}>
            <Text style={[s.summaryTitle, { color: skillInfo.color }]}>
              {skillInfo.icon} {skillInfo.label} · {part === 'all' ? 'All Parts' : `Part ${part}`}
            </Text>
            <Text style={[s.summaryDetail, { color: colors.textSecondary }]}>{selectedExamLabel}</Text>
            <Text style={[s.summaryDetail, { color: colors.textSecondary }]}>
              ⏱ {timeLimit} min · {autoSubmit ? 'Auto-submit on' : 'No auto-submit'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Start button (sticky) ─────────────────────────────────────────── */}
      <View style={[s.startBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            s.startBtn,
            !canStart && s.startBtnDisabled,
            { backgroundColor: canStart ? skillInfo.color : colors.border },
          ]}
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.85}
        >
          <Text style={s.startBtnText}>
            {canStart ? 'Start Custom Practice' : 'Select an exam to start'}
          </Text>
          {canStart && (
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },

  // Step label
  stepLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: '#fff', fontSize: 12, fontFamily: FONTS.bold },
  stepText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },

  // Option chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  optChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  optChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  // Exam picker
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  examSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  examSelectorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  examPickerDropdown: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xs,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  examPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  examPickerItemActive: { backgroundColor: COLORS.surface },
  examPickerText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  examPickerEmpty: {
    padding: SPACING.lg,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },

  // Custom time
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  customTimeInput: {
    width: 72,
    height: 44,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  customTimeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  // Auto submit
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xl },
  autoSubmitRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  autoSubmitTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  autoSubmitSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  // Summary
  summaryCard: {
    marginTop: SPACING.xl,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, marginBottom: 6 },
  summaryDetail: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 3 },

  // Start bar
  startBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  startBtnDisabled: { opacity: 0.7 },
  startBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
});
