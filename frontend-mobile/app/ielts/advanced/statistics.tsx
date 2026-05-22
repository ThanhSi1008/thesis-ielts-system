import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Circle, Text as SvgText, Rect, G } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { ieltsAdvancedApi } from '@/services';
import { EmptyState } from '@/components/ui';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - SPACING.lg * 2;
const CHART_W = CARD_W - SPACING.lg * 2;
const CHART_H = 160;

const SKILLS = [
  {
    key: 'listening',
    label: 'Listening',
    color: COLORS.skill.listening,
    icon: 'headset-outline' as const,
  },
  { key: 'reading', label: 'Reading', color: COLORS.skill.reading, icon: 'book-outline' as const },
  {
    key: 'writing',
    label: 'Writing',
    color: COLORS.skill.writing,
    icon: 'create-outline' as const,
  },
  {
    key: 'speaking',
    label: 'Speaking',
    color: COLORS.skill.speaking,
    icon: 'mic-outline' as const,
  },
] as const;

type SkillKey = (typeof SKILLS)[number]['key'];

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  return 1.0;
}

function getBandForSession(h: any, skill: SkillKey): number {
  if (skill === 'writing' || skill === 'speaking') {
    return h.bandScore ?? 0;
  }
  const correct = h.totalScore ?? h.rawScore ?? 0;
  const total = h.totalQuestions ?? 0;
  if (total > 0) {
    const projected = Math.round((correct / total) * 40);
    return getIeltsBandFromScore(projected);
  }
  return getIeltsBandFromScore(correct);
}

const QT_LABEL: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  fill_in_blank: 'Fill in Blank',
  short_answer: 'Short Answer',
  matching: 'Matching',
  matching_headings: 'Matching Headings',
  matching_features: 'Matching Features',
  matching_information: 'Matching Info',
  matching_sentence_endings: 'Sentence Endings',
  true_false_not_given: 'T/F/NG',
  yes_no_not_given: 'Y/N/NG',
  diagram_labelling: 'Diagram Label',
  diagram_completion: 'Diagram Completion',
  map_labelling: 'Map Label',
  plan_labelling: 'Plan Label',
  sentence_completion: 'Sentence Completion',
  summary_completion: 'Summary Completion',
  note_completion: 'Note Completion',
  table_completion: 'Table Completion',
  flowchart_completion: 'Flowchart',
  unknown: 'Other',
};

// ─── Extraction Helpers ──────────────────────────────────────────────────────

function extractWritingCriteria(h: any) {
  if (!h.feedback) return null;
  try {
    const raw = typeof h.feedback === 'string' ? JSON.parse(h.feedback) : h.feedback;
    const task1 = raw.task1 ?? (h.prompt?.taskType === 'TASK1' ? raw : null);
    const task2 = raw.task2 ?? (h.prompt?.taskType === 'TASK2' ? raw : null);

    let ta = 0,
      cc = 0,
      lr = 0,
      gra = 0;
    let count = 0;

    if (task1?.criteria) {
      const c = task1.criteria;
      ta += c.task_achievement?.band ?? 0;
      cc += c.coherence_and_cohesion?.band ?? 0;
      lr += c.lexical_resource?.band ?? 0;
      gra += c.grammatical_range_and_accuracy?.band ?? 0;
      count++;
    }
    if (task2?.criteria) {
      const c = task2.criteria;
      ta += c.task_achievement?.band ?? 0;
      cc += c.coherence_and_cohesion?.band ?? 0;
      lr += c.lexical_resource?.band ?? 0;
      gra += c.grammatical_range_and_accuracy?.band ?? 0;
      count++;
    }

    if (count > 0) {
      return { ta: ta / count, cc: cc / count, lr: lr / count, gra: gra / count };
    }

    if (raw.criteria) {
      const c = raw.criteria;
      return {
        ta: c.task_achievement?.band ?? raw.task_achievement?.band ?? 0,
        cc: c.coherence_and_cohesion?.band ?? raw.coherence_and_cohesion?.band ?? 0,
        lr: c.lexical_resource?.band ?? raw.lexical_resource?.band ?? 0,
        gra:
          c.grammatical_range_and_accuracy?.band ?? raw.grammatical_range_and_accuracy?.band ?? 0,
      };
    }

    return {
      ta: raw.task_achievement?.band ?? raw.ta?.band ?? raw.task_response?.band ?? 0,
      cc: raw.coherence_and_cohesion?.band ?? raw.cc?.band ?? 0,
      lr: raw.lexical_resource?.band ?? raw.lr?.band ?? 0,
      gra: raw.grammatical_range_and_accuracy?.band ?? raw.gra?.band ?? 0,
    };
  } catch (e) {
    return null;
  }
}

function extractSpeakingCriteria(h: any) {
  if (!h.feedback) return null;
  try {
    const raw = typeof h.feedback === 'string' ? JSON.parse(h.feedback) : h.feedback;
    const c = raw.criteria ?? raw;
    return {
      fc: c?.fluency_and_coherence?.band ?? c?.fc?.band ?? 0,
      lr: c?.lexical_resource?.band ?? c?.lr?.band ?? 0,
      gra: c?.grammatical_range_and_accuracy?.band ?? c?.gra?.band ?? 0,
      pro: c?.pronunciation?.band ?? c?.pro?.band ?? 0,
    };
  } catch (e) {
    return null;
  }
}

// ─── Custom SVG Line Trend Chart ─────────────────────────────────────────────

function BandChart({
  points,
  color,
}: {
  points: { band: number; label: string }[];
  color: string;
}) {
  const { colors } = useTheme();
  if (points.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={[chartStyles.emptyText, { color: colors.textSecondary }]}>
          Not enough sessions completed yet (min. 2)
        </Text>
      </View>
    );
  }

  const padX = 28;
  const padY = 20;
  const w = CHART_W - padX - 8;
  const h = CHART_H - padY * 2;
  const maxBand = 9;
  const minBand = 1;

  const toX = (i: number) => padX + (i / (points.length - 1)) * w;
  const toY = (band: number) => padY + h - ((band - minBand) / (maxBand - minBand)) * h;

  const polyPoints = points.map((p, i) => `${toX(i)},${toY(p.band)}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={CHART_W} height={CHART_H}>
        {/* Grid lines */}
        {[2, 4, 6, 8, 9].map((b) => (
          <Line
            key={b}
            x1={padX}
            y1={toY(b)}
            x2={CHART_W - 8}
            y2={toY(b)}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Y Axis labels */}
        {[2, 4, 6, 8, 9].map((b) => (
          <SvgText
            key={`y-${b}`}
            x={padX - 8}
            y={toY(b) + 3}
            fontSize={8}
            fill={colors.textSecondary}
            textAnchor="end"
            fontFamily={FONTS.medium}
          >
            {b.toFixed(1)}
          </SvgText>
        ))}

        {/* Path line */}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dynamic points & bands */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={toX(i)} cy={toY(p.band)} r={4.5} fill={color} />
            <Circle cx={toX(i)} cy={toY(p.band)} r={2} fill={colors.card} />
            <SvgText
              x={toX(i)}
              y={toY(p.band) - 8}
              textAnchor="middle"
              fontSize={8.5}
              fill={color}
              fontFamily={FONTS.bold}
            >
              {p.band.toFixed(1)}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

// ─── Custom SVG Bar Chart (Part/Rubric Criteria) ──────────────────────────

interface BarChartData {
  label: string;
  value: number;
  displayValue: string;
}

function BarChart({
  data,
  color,
  maxScale = 100,
}: {
  data: BarChartData[];
  color: string;
  maxScale?: number;
}) {
  const { colors } = useTheme();
  const BAR_H = 140;
  const PAD_T = 16;
  const PAD_B = 24;
  const PAD_L = 32;
  const PAD_R = 8;

  const w = CHART_W - PAD_L - PAD_R;
  const h = BAR_H - PAD_T - PAD_B;
  const colW = w / data.length;
  const barWidth = Math.min(colW * 0.55, 36);

  if (data.length === 0) {
    return (
      <View style={chartStyles.empty}>
        <Text style={[chartStyles.emptyText, { color: colors.textSecondary }]}>
          No data available for criteria analysis
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={CHART_W} height={BAR_H}>
        {/* Y Axis Guide Lines */}
        {[0, 0.5, 1].map((ratio) => {
          const val = ratio * maxScale;
          const y = PAD_T + h - ratio * h;
          return (
            <G key={ratio}>
              <Line
                x1={PAD_L}
                y1={y}
                x2={CHART_W - PAD_R}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <SvgText
                x={PAD_L - 8}
                y={y + 3}
                fontSize={8}
                fill={colors.textSecondary}
                textAnchor="end"
                fontFamily={FONTS.medium}
              >
                {maxScale === 9 ? val.toFixed(0) : `${val.toFixed(0)}%`}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const valRatio = Math.min(item.value / maxScale, 1);
          const barH = valRatio * h;
          const x = PAD_L + i * colW + (colW - barWidth) / 2;
          const y = PAD_T + h - barH;

          return (
            <G key={item.label}>
              {/* Background Track */}
              <Rect x={x} y={PAD_T} width={barWidth} height={h} rx={4} fill={color + '0E'} />
              {/* Filled Bar */}
              {barH > 0 && <Rect x={x} y={y} width={barWidth} height={barH} rx={4} fill={color} />}
              {/* Value Label above Bar */}
              {item.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize={8}
                  textAnchor="middle"
                  fill={color}
                  fontFamily={FONTS.bold}
                >
                  {item.displayValue}
                </SvgText>
              )}
              {/* X Axis Label */}
              <SvgText
                x={x + barWidth / 2}
                y={BAR_H - 6}
                fontSize={9}
                textAnchor="middle"
                fill={colors.text}
                fontFamily={FONTS.semibold}
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ─── Custom SVG Donut Chart (L/R Question Types) ───────────────────────────

interface DonutSlice {
  type: string;
  label: string;
  correct: number;
  total: number;
  pct: number;
  share: number;
  color: string;
}

function DonutChart({
  slices,
  totalCorrect,
  totalAttempted,
}: {
  slices: DonutSlice[];
  totalCorrect: number;
  totalAttempted: number;
}) {
  const { colors } = useTheme();

  if (slices.length === 0 || totalAttempted === 0) {
    return (
      <View style={chartStyles.empty}>
        <Text style={[chartStyles.emptyText, { color: colors.textSecondary }]}>
          No question-type breakdown available
        </Text>
      </View>
    );
  }

  const R = 40;
  const C = 2 * Math.PI * R;
  const strokeW = 12;
  const center = 60;
  const size = 120;

  const overallPct = Math.round((totalCorrect / totalAttempted) * 100);
  let accumulatedPercent = 0;

  return (
    <View style={donutStyles.container}>
      <View style={donutStyles.donutContainer}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${center}, ${center}`}>
            {/* Base Circle */}
            <Circle
              cx={center}
              cy={center}
              r={R}
              stroke={colors.border}
              strokeWidth={strokeW}
              fill="transparent"
            />
            {slices.map((slice) => {
              const sliceLength = slice.share * C;
              const strokeDasharray = `${sliceLength} ${C}`;
              const strokeDashoffset = C - accumulatedPercent * C;
              accumulatedPercent += slice.share;

              return (
                <Circle
                  key={slice.type}
                  cx={center}
                  cy={center}
                  r={R}
                  stroke={slice.color}
                  strokeWidth={strokeW}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>

        {/* Core display */}
        <View style={donutStyles.centerLabel}>
          <Text style={[donutStyles.overallPctText, { color: colors.text }]}>{overallPct}%</Text>
          <Text style={[donutStyles.overallSubText, { color: colors.textSecondary }]}>
            Accuracy
          </Text>
        </View>
      </View>

      {/* Legend checklist */}
      <View style={donutStyles.legendContainer}>
        {slices.map((slice) => (
          <View key={slice.type} style={donutStyles.legendRow}>
            <View style={[donutStyles.colorIndicator, { backgroundColor: slice.color }]} />
            <View style={donutStyles.legendTextContainer}>
              <Text style={[donutStyles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                {slice.label}
              </Text>
              <Text style={[donutStyles.legendStats, { color: colors.textSecondary }]}>
                {slice.correct}/{slice.total} ({slice.pct}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeSkill, setActiveSkill] = useState<SkillKey>('listening');

  // States
  const [histories, setHistories] = useState<Record<SkillKey, any[]>>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  const [loadingMap, setLoadingMap] = useState<Record<SkillKey, boolean>>({
    listening: false,
    reading: false,
    writing: false,
    speaking: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  const activeColor = useMemo(() => {
    return SKILLS.find((s) => s.key === activeSkill)?.color ?? COLORS.primary;
  }, [activeSkill]);

  const loadData = useCallback(
    async (skill: SkillKey, isRefresh = false) => {
      if (!isRefresh && histories[skill].length > 0) return; // cache

      setLoadingMap((prev) => ({ ...prev, [skill]: !isRefresh }));
      try {
        let data: any[] = [];
        if (skill === 'listening') {
          data = await ieltsAdvancedApi.getListeningHistory();
        } else if (skill === 'reading') {
          data = await ieltsAdvancedApi.getReadingHistory();
        } else if (skill === 'writing') {
          data = await ieltsAdvancedApi.getWritingHistory();
        } else if (skill === 'speaking') {
          data = await ieltsAdvancedApi.getSpeakingHistory();
        }

        setHistories((prev) => ({
          ...prev,
          [skill]: Array.isArray(data) ? data : [],
        }));
      } catch (err) {
        console.error(`[AdvancedStats] Fetch history for ${skill} failed:`, err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [skill]: false }));
        if (isRefresh) setRefreshing(false);
      }
    },
    [histories],
  );

  // Lazy tabs trigger
  useEffect(() => {
    loadData(activeSkill);
  }, [activeSkill, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(activeSkill, true);
  }, [activeSkill, loadData]);

  const activeHistory = histories[activeSkill];
  const isLoading = loadingMap[activeSkill];

  // ─── Computations via useMemo ──────────────────────────────────────────────

  // Chronological trend data
  const skillTrendData = useMemo(() => {
    if (!activeHistory || activeHistory.length === 0) return [];
    const sorted = [...activeHistory].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const limited = sorted.slice(-10);
    return limited.map((h) => {
      const band = getBandForSession(h, activeSkill);
      const dateStr = new Date(h.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return { band, label: dateStr };
    });
  }, [activeHistory, activeSkill]);

  // Criteria averages Bar Chart (W/S)
  const criteriaData = useMemo(() => {
    if (activeSkill !== 'writing' && activeSkill !== 'speaking') return [];

    if (activeSkill === 'writing') {
      let sumTA = 0,
        sumCC = 0,
        sumLR = 0,
        sumGRA = 0;
      let count = 0;

      activeHistory.forEach((h) => {
        const criteria = extractWritingCriteria(h);
        if (criteria) {
          sumTA += criteria.ta;
          sumCC += criteria.cc;
          sumLR += criteria.lr;
          sumGRA += criteria.gra;
          count++;
        }
      });

      if (count === 0) return [];
      const avgTA = Number((sumTA / count).toFixed(1));
      const avgCC = Number((sumCC / count).toFixed(1));
      const avgLR = Number((sumLR / count).toFixed(1));
      const avgGRA = Number((sumGRA / count).toFixed(1));

      return [
        { label: 'TA', value: avgTA, displayValue: avgTA.toFixed(1) },
        { label: 'C&C', value: avgCC, displayValue: avgCC.toFixed(1) },
        { label: 'LR', value: avgLR, displayValue: avgLR.toFixed(1) },
        { label: 'GRA', value: avgGRA, displayValue: avgGRA.toFixed(1) },
      ];
    } else {
      let sumFC = 0,
        sumLR = 0,
        sumGRA = 0,
        sumPRO = 0;
      let count = 0;

      activeHistory.forEach((h) => {
        const criteria = extractSpeakingCriteria(h);
        if (criteria) {
          sumFC += criteria.fc;
          sumLR += criteria.lr;
          sumGRA += criteria.gra;
          sumPRO += criteria.pro;
          count++;
        }
      });

      if (count === 0) return [];
      const avgFC = Number((sumFC / count).toFixed(1));
      const avgLR = Number((sumLR / count).toFixed(1));
      const avgGRA = Number((sumGRA / count).toFixed(1));
      const avgPRO = Number((sumPRO / count).toFixed(1));

      return [
        { label: 'F&C', value: avgFC, displayValue: avgFC.toFixed(1) },
        { label: 'LR', value: avgLR, displayValue: avgLR.toFixed(1) },
        { label: 'GRA', value: avgGRA, displayValue: avgGRA.toFixed(1) },
        { label: 'PRO', value: avgPRO, displayValue: avgPRO.toFixed(1) },
      ];
    }
  }, [activeHistory, activeSkill]);

  // Parts accuracy Bar Chart (L/R)
  const partsData = useMemo(() => {
    if (activeSkill !== 'listening' && activeSkill !== 'reading') return [];
    const sums: Record<number, { correct: number; total: number }> = {};

    activeHistory.forEach((h) => {
      const partNum = h.part?.partNumber ?? h.practicePart;
      if (!partNum) return;
      if (!sums[partNum]) {
        sums[partNum] = { correct: 0, total: 0 };
      }
      sums[partNum].correct += h.totalScore ?? 0;
      sums[partNum].total += h.totalQuestions ?? 0;
    });

    const maxPart = activeSkill === 'listening' ? 4 : 3;
    const list: BarChartData[] = [];
    for (let p = 1; p <= maxPart; p++) {
      const entry = sums[p];
      const pct = entry && entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
      list.push({
        label: `Part ${p}`,
        value: pct,
        displayValue: `${pct}%`,
      });
    }
    return list;
  }, [activeHistory, activeSkill]);

  // Question Type aggregates (Donut Chart)
  const donutData = useMemo(() => {
    if (activeSkill !== 'listening' && activeSkill !== 'reading') {
      return { slices: [], totalCorrect: 0, totalAttempted: 0 };
    }

    const aggregated: Record<string, { correct: number; total: number }> = {};
    activeHistory.forEach((session) => {
      if (!session.scoreData) return;
      try {
        const data =
          typeof session.scoreData === 'string' ? JSON.parse(session.scoreData) : session.scoreData;

        if (!data) return;

        for (const [type, stats] of Object.entries(data)) {
          const correct = (stats as any).correct ?? 0;
          const total = (stats as any).total ?? 0;
          if (!aggregated[type]) {
            aggregated[type] = { correct: 0, total: 0 };
          }
          aggregated[type].correct += correct;
          aggregated[type].total += total;
        }
      } catch (e) {
        // quiet fail
      }
    });

    const entries = Object.entries(aggregated).filter(([, v]) => v.total > 0);
    if (entries.length === 0) {
      return { slices: [], totalCorrect: 0, totalAttempted: 0 };
    }

    const totalAttempted = entries.reduce((s, [, v]) => s + v.total, 0);
    const totalCorrect = entries.reduce((s, [, v]) => s + v.correct, 0);

    const DONUT_COLORS = [
      '#2563EB',
      '#10B981',
      '#D97706',
      '#7C3AED',
      '#EC4899',
      '#06B6D4',
      '#F43F5E',
    ];

    const slices: DonutSlice[] = entries.map(([type, v], index) => {
      const pct = Math.round((v.correct / v.total) * 100);
      const share = v.total / totalAttempted;
      const label = QT_LABEL[type] ?? type.replace(/_/g, ' ');
      return {
        type,
        label,
        correct: v.correct,
        total: v.total,
        pct,
        share,
        color: DONUT_COLORS[index % DONUT_COLORS.length],
      };
    });

    return { slices, totalCorrect, totalAttempted };
  }, [activeHistory, activeSkill]);

  // Overall dynamic summary card metrics
  const summaryMetrics = useMemo(() => {
    if (!activeHistory || activeHistory.length === 0) return null;

    const count = activeHistory.length;
    const bands = activeHistory.map((h) => getBandForSession(h, activeSkill));
    const avgBand = Number((bands.reduce((sum, b) => sum + b, 0) / count).toFixed(2));
    const maxBand = Math.max(...bands);

    let customMetric1 = { label: 'Sessions', value: String(count) };
    let customMetric2 = { label: 'Best Band', value: maxBand.toFixed(1) };
    let highlightText = '';

    if (activeSkill === 'listening' || activeSkill === 'reading') {
      const totalCorrect = activeHistory.reduce((sum, h) => sum + (h.totalScore ?? 0), 0);
      const totalQs = activeHistory.reduce((sum, h) => sum + (h.totalQuestions ?? 0), 0);
      const overallAccuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

      customMetric1 = { label: 'Overall Acc.', value: `${overallAccuracy}%` };
      highlightText = `Attempted ${totalQs} questions across ${count} advanced sessions.`;
    } else {
      const criteria = criteriaData;
      if (criteria && criteria.length > 0) {
        const sorted = [...criteria].sort((a, b) => b.value - a.value);
        const strongest = sorted[0];
        const weakest = sorted[sorted.length - 1];

        if (strongest && strongest.value > 0) {
          customMetric1 = { label: 'Strongest', value: strongest.label };
        }
        if (weakest && weakest.value > 0) {
          customMetric2 = { label: 'Needs Work', value: weakest.label };
        }
        highlightText = `Average score of ${avgBand.toFixed(1)} across ${count} graded essays/audios.`;
      }
    }

    return {
      avgBand,
      customMetric1,
      customMetric2,
      highlightText,
    };
  }, [activeHistory, activeSkill, criteriaData]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: activeColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Skills Tab List */}
      <View
        style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContent}
        >
          {SKILLS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.tabChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeSkill === s.key && {
                  backgroundColor: s.color,
                  borderColor: s.color,
                },
              ]}
              onPress={() => setActiveSkill(s.key)}
            >
              <Ionicons
                name={s.icon}
                size={14}
                color={activeSkill === s.key ? '#fff' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabChipText,
                  { color: colors.textSecondary },
                  activeSkill === s.key && { color: '#fff' },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={activeColor} />
          <Text style={[styles.loadingText, { color: activeColor }]}>
            Loading stats for {activeSkill}...
          </Text>
        </View>
      ) : activeHistory.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColor} />
          }
        >
          <EmptyState
            icon="📊"
            title="No sessions found"
            subtitle={`You haven't completed any advanced ${activeSkill} sessions yet.`}
          />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColor} />
          }
        >
          {/* Summary Overview Card */}
          {summaryMetrics && (
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.summaryRow, { borderColor: colors.border }]}>
                <View style={styles.summaryLeft}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>
                    Overall Performance
                  </Text>
                  <Text style={[styles.summarySub, { color: colors.textSecondary }]}>
                    {summaryMetrics.highlightText}
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: activeColor + (isDark ? '25' : '10') },
                  ]}
                >
                  <Text style={[styles.summaryBadgeScore, { color: activeColor }]}>
                    {summaryMetrics.avgBand.toFixed(1)}
                  </Text>
                  <Text style={[styles.summaryBadgeLabel, { color: colors.textSecondary }]}>
                    Avg. Band
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    {summaryMetrics.customMetric1.value}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    {summaryMetrics.customMetric1.label}
                  </Text>
                </View>
                <View style={[styles.metricItem, styles.metricMid, { borderColor: colors.border }]}>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    {activeHistory.length}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Sessions
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    {summaryMetrics.customMetric2.value}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    {summaryMetrics.customMetric2.label}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Line Chart: Band score trend */}
          <View
            style={[
              styles.chartSection,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Band Score Trend</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Progress over last 10 sessions
              </Text>
            </View>
            <BandChart points={skillTrendData} color={activeColor} />
          </View>

          {/* Bar Chart: Part Accuracy (L/R) vs Criteria averages (W/S) */}
          <View
            style={[
              styles.chartSection,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {activeSkill === 'listening' || activeSkill === 'reading'
                  ? 'Part Accuracy Breakdown'
                  : 'Rubric Criteria Averages'}
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                {activeSkill === 'listening' || activeSkill === 'reading'
                  ? 'Average percentage correct per part'
                  : 'Average band score across core assessment parameters'}
              </Text>
            </View>
            <BarChart
              data={
                activeSkill === 'listening' || activeSkill === 'reading' ? partsData : criteriaData
              }
              color={activeColor}
              maxScale={activeSkill === 'listening' || activeSkill === 'reading' ? 100 : 9}
            />
          </View>

          {/* Donut Chart: Question type breakdown (L/R only) */}
          {(activeSkill === 'listening' || activeSkill === 'reading') &&
            donutData.slices.length > 0 && (
              <View
                style={[
                  styles.chartSection,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.chartHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Question Type Breakdown
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Attempt ratio and correctness per question category
                  </Text>
                </View>
                <DonutChart
                  slices={donutData.slices}
                  totalCorrect={donutData.totalCorrect}
                  totalAttempted={donutData.totalAttempted}
                />
              </View>
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const chartStyles = StyleSheet.create({
  empty: {
    height: CHART_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  container: {
    paddingVertical: SPACING.xs,
  },
});

const donutStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  donutContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallPctText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  overallSubText: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: SPACING.lg,
    gap: SPACING.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  legendStats: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    marginTop: SPACING.sm,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },

  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tabContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full ?? 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  tabChipText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semibold, color: COLORS.textSecondary },

  scrollContent: { padding: SPACING.lg, paddingBottom: 120, gap: SPACING.lg },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  summarySub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  summaryBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  summaryBadgeScore: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
  },
  summaryBadgeLabel: {
    fontSize: 7.5,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  metricVal: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  chartSection: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  sectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
});
