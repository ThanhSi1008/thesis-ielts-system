import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';
import DiagramMapBlock from '@/components/ielts/DiagramMapBlock';
import MatchingBlock from '@/components/ielts/MatchingBlock';
import RichAudioPlayer from '@/components/ielts/RichAudioPlayer';
import MCMultipleBlock from '@/components/ielts/MCMultipleBlock';
import FormCompletionBlock from '@/components/ielts/FormCompletionBlock';
import TranscriptReview from '@/components/ielts/TranscriptReview';
import PassageReview from '@/components/ielts/PassageReview';

// ─── Question blocks ───────────────────────────────────────────────────────────

function LocateButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} style={locate.btn}>
      <Ionicons name="locate-outline" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const locate = StyleSheet.create({
  btn: { padding: 4 },
});

function MCQBlock({
  q,
  answer,
  onAnswer,
  onLocate,
}: {
  q: any;
  answer: string;
  onAnswer: (v: string) => void;
  onLocate?: () => void;
}) {
  const options = q.options || [];
  return (
    <View style={styles.qBlock}>
      <View style={styles.qTopRow}>
        <Text style={styles.qNum}>Q{q.question_number}</Text>
        {onLocate && <LocateButton onPress={onLocate} />}
      </View>
      <Text style={styles.qText}>{q.question || q.text || q.stem}</Text>
      {options.map((opt: any, i: number) => {
        const letter = opt.letter || String.fromCharCode(65 + i);
        const label = opt.text || opt;
        const sel = answer === letter;
        return (
          <TouchableOpacity
            key={letter}
            style={[styles.option, sel && styles.optionSel]}
            onPress={() => onAnswer(sel ? '' : letter)}
            activeOpacity={0.8}
          >
            <View style={[styles.bullet, sel && styles.bulletSel]}>
              <Text style={[styles.bulletLetter, sel && { color: '#fff' }]}>{letter}</Text>
            </View>
            <Text style={[styles.optText, sel && styles.optTextSel]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FillBlock({
  q,
  answer,
  onAnswer,
  onLocate,
}: {
  q: any;
  answer: string;
  onAnswer: (v: string) => void;
  onLocate?: () => void;
}) {
  return (
    <View style={styles.qBlock}>
      <View style={styles.qTopRow}>
        <Text style={styles.qNum}>Q{q.question_number}</Text>
        {onLocate && <LocateButton onPress={onLocate} />}
      </View>
      <Text style={styles.qText}>{q.question || q.text}</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={onAnswer}
        placeholder="Your answer…"
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

// ─── Type sets ─────────────────────────────────────────────────────────────────

const DIAGRAM_TYPES = new Set([
  'diagram_labelling',
  'diagram_completion',
  'map_labelling',
  'plan_labelling',
]);
const MATCHING_TYPES = new Set([
  'matching',
  'matching_headings',
  'matching_features',
  'matching_information',
  'matching_sentence_endings',
]);
const FORM_TYPES = new Set([
  'form_completion',
  'note_completion',
  'flowchart_completion',
  'flow_chart',
]);

// ─── Group renderer ────────────────────────────────────────────────────────────

function renderGroup(
  group: any,
  answers: Record<string, string>,
  setAns: (k: string, v: string) => void,
  onLocate: (qNum: number) => void,
  idx = 0,
) {
  const type = group.type;
  const qs: any[] = group.questions || group.points || [];
  const baseKey = `g-${idx}-${type}`;

  if (DIAGRAM_TYPES.has(type)) {
    return <DiagramMapBlock key={baseKey} group={group} answers={answers} onAnswer={setAns} />;
  }
  if (MATCHING_TYPES.has(type)) {
    return <MatchingBlock key={baseKey} group={group} answers={answers} onAnswer={setAns} />;
  }
  if (type === 'multiple_choice_multiple') {
    return (
      <MCMultipleBlock
        key={baseKey}
        group={group}
        groupIdx={idx}
        answer={answers[`mcm-${idx}`] || ''}
        onAnswer={setAns}
      />
    );
  }
  if (FORM_TYPES.has(type)) {
    return <FormCompletionBlock key={baseKey} group={group} answers={answers} onAnswer={setAns} />;
  }

  return (
    <View key={baseKey}>
      {group.instructions && <Text style={styles.instructions}>{group.instructions}</Text>}
      {qs.map((q: any) => {
        const num = String(q.question_number);
        const handleLocate = q.question_number
          ? () => onLocate(Number(q.question_number))
          : undefined;
        if (type === 'multiple_choice' || q.options) {
          return (
            <MCQBlock
              key={`${baseKey}-${num}`}
              q={q}
              answer={answers[num] || ''}
              onAnswer={(v) => setAns(num, v)}
              onLocate={handleLocate}
            />
          );
        }
        return (
          <FillBlock
            key={`${baseKey}-${num}`}
            q={q}
            answer={answers[num] || ''}
            onAnswer={(v) => setAns(num, v)}
            onLocate={handleLocate}
          />
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AdvancedPartScreen() {
  const router = useRouter();
  const { skill, partId } = useLocalSearchParams<{ skill: string; partId: string }>();
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const isListening = skill === 'listening';
  const accentColor = isListening ? COLORS.skill.listening : COLORS.skill.reading;

  useEffect(() => {
    const load = async () => {
      try {
        const data = isListening
          ? await ieltsAdvancedApi.getListeningPart(partId)
          : await ieltsAdvancedApi.getReadingPart(partId);
        setPart(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [partId, isListening]);

  const setAnswer = useCallback(
    (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleLocate = useCallback(
    (qNum: number) => {
      // Reset to re-trigger scroll effect in child even if same question
      setLocatedQuestion(null);
      setTimeout(() => setLocatedQuestion(qNum), 30);
      if (isListening) setShowTranscript(true);
    },
    [isListening],
  );

  const handleSubmit = async () => {
    Alert.alert('Submit?', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setSubmitting(true);
          try {
            console.log('[SUBMIT] sending:', JSON.stringify({ partId, answers })); // DEBUG
            const result = isListening
              ? await ieltsAdvancedApi.submitListening(partId, answers)
              : await ieltsAdvancedApi.submitReading(partId, answers);
            console.log('[SUBMIT] response:', JSON.stringify(result)); // DEBUG
            router.replace(`/ielts/advanced/${skill}/${partId}/result/${result.id}` as any);
          } catch (err) {
            console.error('[SUBMIT] error:', err);
            Alert.alert('Error', 'Submission failed.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const content: any[] = part?.content || [];
  const audioUrl: string | undefined = part?.audioUrl;
  const transcript: any[] | undefined = part?.transcript;
  const passage: string | undefined = part?.passage;
  const passageWithLocations: any[] = part?.passageWithLocations ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {part?.title}
          </Text>
          <Text style={styles.headerSub}>
            Part {part?.partNumber} · {isListening ? 'Listening' : 'Reading'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.ansCount}>{Object.keys(answers).length} ans</Text>
          <TouchableOpacity
            onPress={() => router.push(`/ielts/advanced/${skill}/${partId}/history` as any)}
            hitSlop={8}
            style={styles.historyBtn}
          >
            <Ionicons name="time-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio player (listening) */}
      {audioUrl && (
        <RichAudioPlayer audioUrl={audioUrl} accentColor={accentColor} style={styles.audioPlayer} />
      )}

      {/* Collapsible transcript (listening) */}
      {isListening && transcript && transcript.length > 0 && (
        <View style={styles.transcriptSection}>
          <TouchableOpacity
            style={[
              styles.transcriptToggle,
              { borderColor: accentColor + '40', backgroundColor: accentColor + '08' },
            ]}
            onPress={() => setShowTranscript((v) => !v)}
          >
            <Ionicons name="document-text-outline" size={16} color={accentColor} />
            <Text style={[styles.transcriptToggleText, { color: accentColor }]}>
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </Text>
            <Ionicons
              name={showTranscript ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={accentColor}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {showTranscript && (
            <View style={styles.transcriptPanel}>
              <TranscriptReview
                transcript={transcript}
                locatedQuestion={locatedQuestion}
                accentColor={accentColor}
              />
            </View>
          )}
        </View>
      )}

      {/* Reading passage with locate support */}
      {!isListening && passage && (
        <View style={styles.passagePanel}>
          <Text style={[styles.panelLabel, { color: accentColor }]}>Passage</Text>
          <PassageReview
            passage={passage}
            passageWithLocations={passageWithLocations}
            locatedQuestion={locatedQuestion}
            accentColor={accentColor}
          />
        </View>
      )}

      {/* Questions */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
      >
        {content.map((g: any, gi: number) => renderGroup(g, answers, setAnswer, handleLocate, gi))}
      </ScrollView>

      {/* Submit bar */}
      <View style={styles.submitBar}>
        <Button
          title={submitting ? 'Submitting…' : 'Submit'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.xs, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  ansCount: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  historyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  audioPlayer: { margin: SPACING.md, marginBottom: 0 },

  transcriptSection: { marginHorizontal: SPACING.md, marginTop: SPACING.sm },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  transcriptToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  transcriptPanel: {
    maxHeight: 240,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  passagePanel: {
    maxHeight: 220,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: SPACING.sm,
  },
  panelLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: SPACING.sm,
  },

  scroll: { flex: 1 },

  // Question blocks
  qBlock: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  qNum: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  qText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  optionSel: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    backgroundColor: '#fff',
  },
  bulletSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  bulletLetter: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  optText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  optTextSel: { color: COLORS.primary, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  instructions: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFF9C4',
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },

  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
});
