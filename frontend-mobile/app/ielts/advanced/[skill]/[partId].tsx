import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';
import DiagramMapBlock from '@/components/ielts/DiagramMapBlock';
import MatchingBlock from '@/components/ielts/MatchingBlock';

// Reusable MCQ for advanced practice
function MCQBlock({ q, answer, onAnswer }: { q: any; answer: string; onAnswer: (v: string) => void }) {
  const options = q.options || [];
  return (
    <View style={styles.qBlock}>
      <Text style={styles.qNum}>Q{q.question_number}</Text>
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

function FillBlock({ q, answer, onAnswer }: { q: any; answer: string; onAnswer: (v: string) => void }) {
  return (
    <View style={styles.qBlock}>
      <Text style={styles.qNum}>Q{q.question_number}</Text>
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

const DIAGRAM_TYPES_ADV = new Set(['diagram_labelling', 'diagram_completion', 'map_labelling', 'plan_labelling']);
const MATCHING_TYPES_ADV = new Set(['matching', 'matching_headings', 'matching_features', 'matching_information', 'matching_sentence_endings']);

function renderGroup(group: any, answers: Record<string, string>, setAns: (k: string, v: string) => void, _idx = 0) {
  const type = group.type;
  const qs = group.questions || group.points || [];
  const baseKey = `g-${_idx}-${type}`;

  if (DIAGRAM_TYPES_ADV.has(type)) {
    return (
      <DiagramMapBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAns}
      />
    );
  }

  if (MATCHING_TYPES_ADV.has(type)) {
    return (
      <MatchingBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAns}
      />
    );
  }

  return (
    <View key={baseKey}>
      {group.instructions && <Text style={styles.instructions}>{group.instructions}</Text>}
      {qs.map((q: any) => {
        const num = String(q.question_number);
        if (type === 'multiple_choice' || q.options) {
          return <MCQBlock key={`${baseKey}-${num}`} q={q} answer={answers[num] || ''} onAnswer={v => setAns(num, v)} />;
        }
        return <FillBlock key={`${baseKey}-${num}`} q={q} answer={answers[num] || ''} onAnswer={v => setAns(num, v)} />;
      })}
    </View>
  );
}

export default function AdvancedPartScreen() {
  const router = useRouter();
  const { skill, partId } = useLocalSearchParams<{ skill: string; partId: string }>();
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const player = useAudioPlayer(part?.audioUrl || '');

  useEffect(() => {
    const load = async () => {
      try {
        const data = skill === 'listening'
          ? await ieltsAdvancedApi.getListeningPart(partId)
          : await ieltsAdvancedApi.getReadingPart(partId);
        setPart(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [partId]);

  const setAnswer = (key: string, value: string) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const toggleAudio = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSubmit = async () => {
    Alert.alert('Submit?', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit', onPress: async () => {
          setSubmitting(true);
          try {
            const result = skill === 'listening'
              ? await ieltsAdvancedApi.submitListening(partId, answers)
              : await ieltsAdvancedApi.submitReading(partId, answers);
            router.replace(`/ielts/advanced/${skill}/${partId}/result/${result.id}` as any);
          } catch { Alert.alert('Error', 'Submission failed.'); }
          finally { setSubmitting(false); }
        }
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const content: any[] = part?.content || [];
  const audioUrl = part?.audioUrl;
  const isListening = skill === 'listening';
  const accentColor = isListening ? '#E11D48' : '#2563EB';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={2}>{part?.title}</Text>
          <Text style={styles.headerSub}>Part {part?.partNumber} · {isListening ? 'Listening' : 'Reading'}</Text>
        </View>
        <Text style={styles.ansCount}>{Object.keys(answers).length} ans</Text>
      </View>

      {/* Audio bar */}
      {audioUrl && (
        <TouchableOpacity
          style={[styles.audioBanner, { borderColor: accentColor + '40', backgroundColor: accentColor + '0A' }]}
          onPress={toggleAudio}
        >
          <Ionicons name={player.playing ? 'pause-circle' : 'play-circle'} size={32} color={accentColor} />
          <Text style={[styles.audioLabel, { color: accentColor }]}>
            {player.playing ? 'Playing…' : 'Tap to play audio'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Reading passage */}
      {part?.passage && (
        <ScrollView style={styles.passageBox} nestedScrollEnabled>
          <Text style={styles.passageText}>{part.passage}</Text>
        </ScrollView>
      )}

      {/* Questions */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
      >
        {content.map((g: any, gi: number) => renderGroup(g, answers, setAnswer, gi))}
      </ScrollView>

      {/* Submit bar */}
      <View style={styles.submitBar}>
        <Button title={submitting ? 'Submitting…' : 'Submit'} onPress={handleSubmit} loading={submitting} size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.xs, marginTop: 2 },
  ansCount: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  audioBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderBottomWidth: 1,
  },
  audioLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  passageBox: {
    maxHeight: 200, margin: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  scroll: { flex: 1 },
  qBlock: {
    marginBottom: SPACING.xl, padding: SPACING.lg,
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
  },
  qNum: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 4, textTransform: 'uppercase' },
  qText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.sm, backgroundColor: COLORS.surface,
  },
  optionSel: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  bullet: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md, backgroundColor: '#fff',
  },
  bulletSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  bulletLetter: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  optText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  optTextSel: { color: COLORS.primary, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
  },
  instructions: {
    fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic',
    marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: '#FFF9C4',
    borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  submitBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.lg, backgroundColor: '#fff',
    borderTopWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
});
