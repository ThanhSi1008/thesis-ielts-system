/**
 * Pronunciation Tab — IPA Phonetic Chart
 * Matches web: grid of symbols (Monophthongs / Diphthongs / Consonants)
 * Tap any symbol → detail sheet with example words + AI recorder
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { learningApi } from '@/services/learning.api';

// ─── IPA Data (mirrors web) ──────────────────────────────────────────────────
const IPA_DATA = {
  monophthongs: [
    { symbol: 'iː', word: 'sleep' }, { symbol: 'ɪ', word: 'slip' },
    { symbol: 'ʊ', word: 'good' },  { symbol: 'uː', word: 'food' },
    { symbol: 'e', word: 'bed' },   { symbol: 'ə', word: 'teacher' },
    { symbol: 'ɜː', word: 'bird' }, { symbol: 'ɔː', word: 'door' },
    { symbol: 'æ', word: 'cat' },   { symbol: 'ʌ', word: 'up' },
    { symbol: 'ɑː', word: 'far' },  { symbol: 'ɒ', word: 'on' },
  ],
  diphthongs: [
    { symbol: 'ɪə', word: 'here' }, { symbol: 'eɪ', word: 'wait' },
    { symbol: 'ʊə', word: 'tourist' }, { symbol: 'ɔɪ', word: 'boy' },
    { symbol: 'əʊ', word: 'show' }, { symbol: 'eə', word: 'hair' },
    { symbol: 'aɪ', word: 'my' },   { symbol: 'aʊ', word: 'cow' },
  ],
  consonants: [
    { symbol: 'p', word: 'pea', voiced: false },  { symbol: 'b', word: 'boat', voiced: true },
    { symbol: 't', word: 'tea', voiced: false },  { symbol: 'd', word: 'dog', voiced: true },
    { symbol: 'ʧ', word: 'cheese', voiced: false }, { symbol: 'ʤ', word: 'june', voiced: true },
    { symbol: 'k', word: 'car', voiced: false },  { symbol: 'g', word: 'go', voiced: true },
    { symbol: 'f', word: 'fly', voiced: false },  { symbol: 'v', word: 'video', voiced: true },
    { symbol: 'θ', word: 'think', voiced: false }, { symbol: 'ð', word: 'this', voiced: true },
    { symbol: 's', word: 'see', voiced: false },  { symbol: 'z', word: 'zoo', voiced: true },
    { symbol: 'ʃ', word: 'shall', voiced: false }, { symbol: 'ʒ', word: 'television', voiced: true },
    { symbol: 'm', word: 'man', voiced: true },   { symbol: 'n', word: 'now', voiced: true },
    { symbol: 'ŋ', word: 'sing', voiced: true },  { symbol: 'h', word: 'hat', voiced: false },
    { symbol: 'l', word: 'love', voiced: true },  { symbol: 'r', word: 'red', voiced: true },
    { symbol: 'w', word: 'wet', voiced: true },   { symbol: 'j', word: 'yes', voiced: true },
  ],
} as const;

// Example words per symbol for the detail sheet
const EXAMPLE_WORDS: Record<string, string[]> = {
  'iː': ['sleep', 'tree', 'see'],  'ɪ': ['slip', 'sit', 'big'],
  'ʊ': ['good', 'book', 'put'],    'uː': ['food', 'moon', 'shoe'],
  'e': ['bed', 'red', 'ten'],      'ə': ['teacher', 'about', 'sofa'],
  'ɜː': ['bird', 'word', 'turn'],  'ɔː': ['door', 'four', 'saw'],
  'æ': ['cat', 'man', 'back'],     'ʌ': ['up', 'cup', 'run'],
  'ɑː': ['far', 'car', 'heart'],   'ɒ': ['on', 'hot', 'dog'],
  'ɪə': ['here', 'ear', 'beer'],   'eɪ': ['wait', 'day', 'name'],
  'ʊə': ['tourist', 'sure', 'pure'], 'ɔɪ': ['boy', 'oil', 'join'],
  'əʊ': ['show', 'go', 'home'],    'eə': ['hair', 'care', 'there'],
  'aɪ': ['my', 'time', 'night'],   'aʊ': ['cow', 'now', 'out'],
  'p': ['pea', 'pen', 'cap'],      'b': ['boat', 'big', 'cab'],
  't': ['tea', 'top', 'cat'],      'd': ['dog', 'day', 'bad'],
  'ʧ': ['cheese', 'chair', 'watch'], 'ʤ': ['june', 'job', 'age'],
  'k': ['car', 'key', 'back'],     'g': ['go', 'get', 'big'],
  'f': ['fly', 'fan', 'off'],      'v': ['video', 'van', 'love'],
  'θ': ['think', 'three', 'math'], 'ð': ['this', 'the', 'with'],
  's': ['see', 'sit', 'pass'],     'z': ['zoo', 'zip', 'buzz'],
  'ʃ': ['shall', 'she', 'push'],   'ʒ': ['television', 'measure', 'beige'],
  'm': ['man', 'make', 'home'],    'n': ['now', 'not', 'ten'],
  'ŋ': ['sing', 'ring', 'long'],   'h': ['hat', 'hot', 'who'],
  'l': ['love', 'let', 'full'],    'r': ['red', 'run', 'very'],
  'w': ['wet', 'win', 'away'],     'j': ['yes', 'you', 'yet'],
};

// ─── Symbol Cell ─────────────────────────────────────────────────────────────
interface SymbolCellProps {
  symbol: string;
  word: string;
  bg: string;
  textColor?: string;
  onPress: () => void;
}
const SymbolCell = ({ symbol, word, bg, textColor = '#1a1a2e', onPress }: SymbolCellProps) => (
  <TouchableOpacity style={[styles.cell, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
    <Text style={[styles.cellSymbol, { color: textColor }]}>{symbol}</Text>
    <Text style={[styles.cellWord, { color: textColor, opacity: 0.75 }]}>{word}</Text>
  </TouchableOpacity>
);

// ─── AI Recorder (word-level, with polling) ───────────────────────────────────
interface WordRecorderProps {
  word: string;
  userId: string;
}
function WordRecorder({ word, userId }: WordRecorderProps) {
  const { isRecording, startRecording, stopRecording } = useAudioRecorderHook();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recError, setRecError] = useState<string | null>(null);

  const handleToggle = useCallback(async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (!uri) return;
      setIsProcessing(true);
      setRecError(null);
      setResult(null);
      try {
        const res: any = await learningApi.checkPronunciation(uri, userId, { targetWord: word });
        if (!res?.attemptId) throw new Error('No attemptId returned');
        // Poll until COMPLETED or FAILED (max 30s)
        let tries = 0;
        const timer = setInterval(async () => {
          tries++;
          try {
            const attempts: any[] = await learningApi.getUserPronunciationAttempts(userId);
            const attempt = attempts.find((a: any) => a.id === res.attemptId);
            if (attempt?.status === 'COMPLETED') {
              clearInterval(timer);
              setResult(attempt);
              setIsProcessing(false);
            } else if (attempt?.status === 'FAILED' || tries >= 15) {
              clearInterval(timer);
              setRecError(attempt?.status === 'FAILED' ? 'Analysis failed. Try again.' : 'Timed out. Try again.');
              setIsProcessing(false);
            }
          } catch (_) {}
        }, 2000);
      } catch (err: any) {
        setRecError(err?.message ?? 'Failed. Please try again.');
        setIsProcessing(false);
      }
    } else {
      setResult(null);
      setRecError(null);
      await startRecording();
    }
  }, [isRecording, word, userId, startRecording, stopRecording]);

  const score: number = result?.score ?? 0;
  const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <View style={styles.recorderBox}>
      {isProcessing ? (
        <View style={styles.recorderProcessing}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.recorderProcessingText}>Analyzing…</Text>
        </View>
      ) : result ? (
        <Animated.View entering={FadeIn} style={styles.recorderResult}>
          <Text style={[styles.recorderScore, { color: scoreColor }]}>{Math.round(score)}/100</Text>
          {result.feedback?.level && (
            <Text style={[styles.recorderLevel, { color: scoreColor }]}>{result.feedback.level}</Text>
          )}
          <TouchableOpacity onPress={() => setResult(null)} style={styles.retryBtn}>
            <Ionicons name="refresh" size={14} color={COLORS.textSecondary} />
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={[styles.recorderMic, isRecording && styles.recorderMicActive]}
          onPress={handleToggle}
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={22}
            color={isRecording ? '#fff' : COLORS.primary}
          />
        </TouchableOpacity>
      )}
      {recError && <Text style={styles.recorderError}>{recError}</Text>}
      {!isProcessing && !result && (
        <Text style={styles.recorderHint}>{isRecording ? 'Tap to stop' : 'Tap to record'}</Text>
      )}
    </View>
  );
}

// ─── Detail Bottom Sheet ──────────────────────────────────────────────────────
interface DetailSheetProps {
  symbol: string;
  word: string;
  visible: boolean;
  onClose: () => void;
  userId: string | undefined;
}
function DetailSheet({ symbol, word, visible, onClose, userId }: DetailSheetProps) {
  const examples = EXAMPLE_WORDS[symbol] ?? [word];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetSymbolBadge}>
            <Text style={styles.sheetSymbol}>{symbol}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>/{symbol}/</Text>
            <Text style={styles.sheetSub}>Example: <Text style={{ fontWeight: '700' }}>{word}</Text></Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close-circle" size={26} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Practice words */}
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>PRACTICE WORDS</Text>
          {examples.map((w, i) => (
            <Animated.View key={w} entering={FadeInDown.delay(i * 80)} style={styles.wordCard}>
              <View style={styles.wordCardLeft}>
                <Text style={styles.wordCardText}>{w}</Text>
                <Text style={styles.wordCardIpa}>/{symbol}/</Text>
              </View>
              {userId ? (
                <WordRecorder word={w} userId={userId} />
              ) : (
                <Text style={styles.loginHint}>Log in to practice</Text>
              )}
            </Animated.View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PronunciationScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<{ symbol: string; word: string } | null>(null);

  const open = (symbol: string, word: string) => setSelected({ symbol, word });
  const close = () => setSelected(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗣️ IPA Phonetic Chart</Text>
          <Text style={styles.headerSub}>Tap any symbol to practice with AI feedback</Text>
        </View>

        {/* Vowels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vowels</Text>

          <Text style={styles.groupLabel}>Monophthongs</Text>
          <View style={styles.grid}>
            {IPA_DATA.monophthongs.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg="#FEF08A"
                onPress={() => open(item.symbol, item.word)}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { marginTop: SPACING.md }]}>Diphthongs</Text>
          <View style={styles.grid}>
            {IPA_DATA.diphthongs.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg="#FCA5A5"
                textColor="#fff"
                onPress={() => open(item.symbol, item.word)}
              />
            ))}
          </View>
        </View>

        {/* Consonants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consonants</Text>
          <View style={styles.grid}>
            {IPA_DATA.consonants.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg={item.voiced ? '#fff' : '#F3F4F6'}
                onPress={() => open(item.symbol, item.word)}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {selected && (
        <DetailSheet
          symbol={selected.symbol}
          word={selected.word}
          visible={!!selected}
          onClose={close}
          userId={user?.id}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },

  header: { marginBottom: SPACING.xl },
  headerTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  groupLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: {
    width: '21%',
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cellSymbol: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  cellWord: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Detail Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 16,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  sheetSymbolBadge: {
    width: 56, height: 56, borderRadius: RADIUS.lg,
    backgroundColor: '#FEF08A',
    alignItems: 'center', justifyContent: 'center',
  },
  sheetSymbol: { fontSize: 28, fontWeight: '900', color: '#1a1a2e' },
  sheetTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  sheetSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  sheetScroll: { flex: 1 },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },

  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wordCardLeft: { flex: 1 },
  wordCardText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  wordCardIpa: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  loginHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },

  // AI Recorder
  recorderBox: { alignItems: 'center', gap: 4 },
  recorderMic: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary + '40',
  },
  recorderMicActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  recorderHint: { fontSize: 10, color: COLORS.textMuted },
  recorderProcessing: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recorderProcessingText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  recorderResult: { alignItems: 'center' },
  recorderScore: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  recorderLevel: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  retryText: { fontSize: 11, color: COLORS.textSecondary },
  recorderError: { fontSize: 10, color: COLORS.status?.error ?? '#EF4444', textAlign: 'center', maxWidth: 80 },
});
