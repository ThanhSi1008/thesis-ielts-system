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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/components/ui';

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
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  return (
    <View style={styles.stepLabel}>
      <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.stepNum}>{num}</Text>
      </View>
      <Text style={[styles.stepText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

// ─── Option chip ──────────────────────────────────────────────────────────────
function OptionChip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();
  const activeColor = color || colors.primary;
  const styles = createStyles(colors, isDark);
  return (
    <TouchableOpacity
      style={[
        styles.optChip,
        active && { borderColor: activeColor, backgroundColor: activeColor + '15' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.optChipText, active && { color: activeColor, fontFamily: FONTS.bold }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CustomPracticeScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  // Verify subscription status
  useEffect(() => {
    if (!isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium]);

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
      toast.info('Warning', 'Please choose an exam source first.');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Navigate back to intensive dashboard"
        >
          <Ionicons name="chevron-back" size={24} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} allowFontScaling={true}>Custom Practice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle} allowFontScaling={true}>
          Build your own practice session exactly the way you want.
        </Text>

        {/* ── Step 1: Skill ─────────────────────────────────────────────── */}
        <StepLabel num={1} text="Select Skill" />
        <View style={styles.chipRow}>
          {SKILLS.map((sk) => (
            <TouchableOpacity
              key={sk.key}
              style={[
                styles.optChip,
                skill === sk.key && { borderColor: sk.color, backgroundColor: sk.color + '15' },
              ]}
              onPress={() => setSkill(sk.key)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={sk.label}
              accessibilityState={{ checked: skill === sk.key }}
              accessibilityHint={`Selects ${sk.label} skill for this custom exam`}
            >
              <Text
                style={[
                  styles.optChipText,
                  skill === sk.key && { color: sk.color, fontFamily: FONTS.bold },
                ]}
                allowFontScaling={true}
              >
                {sk.icon} {sk.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Step 2: Exam Source ────────────────────────────────────────── */}
        <StepLabel num={2} text="Select Exam Source" />
        {loadingCatalog ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText} allowFontScaling={true}>Loading exams…</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.examSelector}
              onPress={() => setShowExamPicker((v) => !v)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Exam source. Currently selected: ${selectedExamLabel}`}
              accessibilityHint="Double tap to open or close the exam selection dropdown list"
              accessibilityState={{ expanded: showExamPicker }}
            >
              <Text
                style={[styles.examSelectorText, !selectedExamId && { color: colors.textMuted }]}
                numberOfLines={1}
                allowFontScaling={true}
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
              <View style={styles.examPickerDropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
                  {allExams.map((exam) => {
                    const active = exam.examId === selectedExamId;
                    return (
                      <TouchableOpacity
                        key={exam.examId}
                        style={[styles.examPickerItem, active && styles.examPickerItemActive]}
                        onPress={() => {
                          setSelectedExamId(exam.examId);
                          setSelectedExamLabel(exam.label);
                          setShowExamPicker(false);
                        }}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={exam.label}
                        accessibilityState={{ selected: active }}
                        accessibilityHint="Selects this exam source"
                      >
                        <Text
                          style={[
                            styles.examPickerText,
                            active && { color: skillInfo.color, fontFamily: FONTS.bold },
                          ]}
                          allowFontScaling={true}
                        >
                          {exam.label}
                        </Text>
                        {active && <Ionicons name="checkmark" size={16} color={skillInfo.color} />}
                      </TouchableOpacity>
                    );
                  })}
                  {allExams.length === 0 && (
                    <Text style={styles.examPickerEmpty} allowFontScaling={true}>No exams available for this skill.</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* ── Step 3: Part ──────────────────────────────────────────────── */}
        <StepLabel num={3} text="Select Parts" />
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[
              styles.optChip,
              part === 'all' && {
                borderColor: skillInfo.color,
                backgroundColor: skillInfo.color + '15',
              },
            ]}
            onPress={() => setPart('all')}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="radio"
            accessibilityLabel="All Parts"
            accessibilityState={{ checked: part === 'all' }}
            accessibilityHint="Selects all parts of the practice exam"
          >
            <Text
              style={[
                styles.optChipText,
                part === 'all' && { color: skillInfo.color, fontFamily: FONTS.bold },
              ]}
              allowFontScaling={true}
            >
              All Parts
            </Text>
          </TouchableOpacity>
          {Array.from({ length: partCount }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.optChip,
                part === n && {
                  borderColor: skillInfo.color,
                  backgroundColor: skillInfo.color + '15',
                },
              ]}
              onPress={() => setPart(n)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={`Part ${n}`}
              accessibilityState={{ checked: part === n }}
              accessibilityHint={`Selects part ${n} only`}
            >
              <Text
                style={[
                  styles.optChipText,
                  part === n && { color: skillInfo.color, fontFamily: FONTS.bold },
                ]}
                allowFontScaling={true}
              >
                Part {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Step 4: Time Limit ────────────────────────────────────────── */}
        <StepLabel num={4} text="Time Limit" />
        <View style={styles.chipRow}>
          {PRESET_TIMES.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.optChip,
                !isCustomTime &&
                  timeLimit === mins && {
                    borderColor: skillInfo.color,
                    backgroundColor: skillInfo.color + '15',
                  },
              ]}
              onPress={() => {
                setIsCustomTime(false);
                setTimeLimit(mins);
              }}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={`${mins} minutes`}
              accessibilityState={{ checked: !isCustomTime && timeLimit === mins }}
              accessibilityHint={`Sets practice duration to ${mins} minutes`}
            >
              <Text
                style={[
                  styles.optChipText,
                  !isCustomTime &&
                    timeLimit === mins && { color: skillInfo.color, fontFamily: FONTS.bold },
                ]}
                allowFontScaling={true}
              >
                {mins} min
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.optChip,
              isCustomTime && {
                borderColor: skillInfo.color,
                backgroundColor: skillInfo.color + '15',
              },
            ]}
            onPress={() => setIsCustomTime(true)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="radio"
            accessibilityLabel="Custom duration"
            accessibilityState={{ checked: isCustomTime }}
            accessibilityHint="Enables manual custom duration input in minutes"
          >
            <Text
              style={[
                styles.optChipText,
                isCustomTime && { color: skillInfo.color, fontFamily: FONTS.bold },
              ]}
              allowFontScaling={true}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>
        {isCustomTime && (
          <View style={styles.customTimeRow}>
            <TextInput
              style={styles.customTimeInput}
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
              accessible={true}
              accessibilityLabel="Custom time in minutes"
              accessibilityHint="Type practice duration in minutes. Maximum 180 minutes"
              allowFontScaling={true}
            />
            <Text style={styles.customTimeLabel} allowFontScaling={true}>minutes (max 180)</Text>
          </View>
        )}

        {/* ── Step 5: Auto-Submit ───────────────────────────────────────── */}
        <View style={styles.divider} />
        <View style={styles.autoSubmitRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.autoSubmitTitle} allowFontScaling={true}>Auto-Submit when time is up</Text>
            <Text style={styles.autoSubmitSub} allowFontScaling={true}>
              If off, you can keep practicing after the timer reaches zero.
            </Text>
          </View>
          <Switch
            value={autoSubmit}
            onValueChange={setAutoSubmit}
            trackColor={{ false: colors.border, true: skillInfo.color }}
            thumbColor="#fff"
            accessible={true}
            accessibilityLabel="Auto-Submit when time is up"
            accessibilityHint="Toggle automatic submission when the practice timer ends"
          />
        </View>

        {/* ── Summary card ─────────────────────────────────────────────── */}
        {canStart && (
          <View
            style={[styles.summaryCard, { borderLeftColor: skillInfo.color }]}
            accessible={true}
            accessibilityLabel={`Session summary. Skill: ${skillInfo.label}, Parts: ${part === 'all' ? 'All Parts' : 'Part ' + part}, Source: ${selectedExamLabel}, Duration: ${timeLimit} minutes, Auto-Submit is ${autoSubmit ? 'enabled' : 'disabled'}`}
          >
            <Text style={[styles.summaryTitle, { color: skillInfo.color }]} allowFontScaling={true}>
              {skillInfo.icon} {skillInfo.label} · {part === 'all' ? 'All Parts' : `Part ${part}`}
            </Text>
            <Text style={styles.summaryDetail} allowFontScaling={true}>{selectedExamLabel}</Text>
            <Text style={styles.summaryDetail} allowFontScaling={true}>
              ⏱ {timeLimit} min · {autoSubmit ? 'Auto-submit on' : 'No auto-submit'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Start button (sticky) ─────────────────────────────────────────── */}
      <View style={styles.startBar}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            !canStart && styles.startBtnDisabled,
            { backgroundColor: canStart ? skillInfo.color : colors.border },
          ]}
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={canStart ? 'Start Custom Practice' : 'Select an exam to start'}
          accessibilityHint="Launches the simulated practice test session with current options"
          accessibilityState={{ disabled: !canStart }}
        >
          <Text style={styles.startBtnText} allowFontScaling={true}>
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

// ─── Styles Factory ──────────────────────────────────────────────────────────
const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: isDark ? colors.surface : colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: {
      color: isDark ? colors.text : '#fff',
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
    },
    subtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNum: { color: isDark ? colors.background : '#fff', fontSize: 12, fontFamily: FONTS.bold },
    stepText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },

    // Option chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
    optChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.xl,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    optChipText: { fontSize: FONT_SIZES.sm, color: colors.textSecondary },

    // Exam picker
    loadingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingText: { fontSize: FONT_SIZES.sm, color: colors.textMuted },
    examSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 2,
      borderColor: colors.border,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    examSelectorText: {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginRight: SPACING.sm,
    },
    examPickerDropdown: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: SPACING.xs,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
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
      borderColor: colors.border,
    },
    examPickerItemActive: { backgroundColor: colors.surface },
    examPickerText: {
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      flex: 1,
      marginRight: SPACING.sm,
    },
    examPickerEmpty: {
      padding: SPACING.lg,
      textAlign: 'center',
      color: colors.textMuted,
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
      borderColor: colors.primary,
      textAlign: 'center',
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
      color: colors.text,
      backgroundColor: colors.card,
    },
    customTimeLabel: { fontSize: FONT_SIZES.sm, color: colors.textSecondary },

    // Auto submit
    divider: { height: 1, backgroundColor: colors.border, marginVertical: SPACING.xl },
    autoSubmitRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
    autoSubmitTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: colors.text },
    autoSubmitSub: {
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
      marginTop: 3,
      lineHeight: 18,
    },

    // Summary
    summaryCard: {
      marginTop: SPACING.xl,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, marginBottom: 6 },
    summaryDetail: { fontSize: FONT_SIZES.sm, color: colors.textSecondary, marginTop: 3 },

    // Start bar
    startBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: SPACING.lg,
      paddingBottom: SPACING.xl,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderColor: colors.border,
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
    startBtnText: {
      color: isDark ? colors.background : '#fff',
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
    },
  });
