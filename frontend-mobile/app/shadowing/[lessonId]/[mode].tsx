import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { shadowingApi } from '@/services/features.api';

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_H = SCREEN_W * (9 / 16);

// Placeholder sentence data — in production, loaded from API or bundled JSON
const PLACEHOLDER_SENTENCES = [
  { id: 0, english: 'Hello, welcome to the IELTS practice session.', vietnamese: 'Xin chào, chào mừng đến với buổi luyện tập IELTS.', audioStart: 0, audioEnd: 3 },
  { id: 1, english: 'Today we will practice shadowing techniques.', vietnamese: 'Hôm nay chúng ta sẽ luyện tập kỹ thuật shadowing.', audioStart: 3, audioEnd: 6 },
  { id: 2, english: 'Listen carefully and repeat after the speaker.', vietnamese: 'Lắng nghe cẩn thận và nhắc lại sau người nói.', audioStart: 6, audioEnd: 9 },
];

export default function ShadowingPracticeScreen() {
  const router = useRouter();
  const { lessonId, mode } = useLocalSearchParams<{ lessonId: string; mode: string }>();
  const isShadowing = mode === 'shadowing';

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [dictationInput, setDictationInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [saving, setSaving] = useState(false);

  const sentences = lesson?.sentences?.length ? lesson.sentences : PLACEHOLDER_SENTENCES;
  const current = sentences[currentIdx];
  const progress = Math.round((completed.length / sentences.length) * 100);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await shadowingApi.getVideoById(lessonId);
        setLesson(data);
      } catch {
        // Use placeholder for static lessons
        setLesson({ id: lessonId, title: 'Practice Session', youtubeVideoId: '', sentences: [] });
      } finally { setLoading(false); }
    };
    load();
  }, [lessonId]);

  const markCompleted = (idx: number) => {
    if (!completed.includes(idx)) setCompleted(prev => [...prev, idx]);
  };

  const handleNext = () => {
    markCompleted(currentIdx);
    setDictationInput('');
    setShowAnswer(false);
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const allIdx = sentences.map((_: any, i: number) => i);
      await shadowingApi.upsertProgress({
        lessonId,
        type: isShadowing ? 'shadowing' : 'dictation',
        completedSentences: [...new Set([...completed, currentIdx])],
      });
      Alert.alert('Well done! 🎉', `You completed all ${sentences.length} sentences.`, [
        { text: 'Back', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
    } finally { setSaving(false); }
  };

  const checkDictation = () => {
    const correct = current.english.toLowerCase().replace(/[^\w\s]/g, '');
    const input = dictationInput.toLowerCase().replace(/[^\w\s]/g, '');
    const isClose = input.split(' ').filter((w: string) => correct.includes(w)).length >= correct.split(' ').length * 0.6;
    setShowAnswer(true);
    if (isClose) markCompleted(currentIdx);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const youtubeId = lesson?.youtubeVideoId;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isShadowing ? '🗣 Shadowing' : '✏️ Dictation'} — {lesson?.title}
        </Text>
        <Text style={styles.headerProg}>{currentIdx + 1}/{sentences.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Video player (YouTube) */}
        {youtubeId ? (
          <View style={styles.videoContainer}>
            <WebView
              style={styles.video}
              source={{ uri: `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0` }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-off" size={40} color={COLORS.textMuted} />
            <Text style={styles.videoPlaceholderText}>No video available</Text>
          </View>
        )}

        {/* Sentence card */}
        <View style={styles.sentenceCard}>
          {isShadowing ? (
            <>
              {/* Shadowing: show English + phonetic, hide Vietnamese */}
              <Text style={styles.sentenceEnglish}>{current?.english}</Text>
              {current?.phonetic && <Text style={styles.phonetic}>{current.phonetic}</Text>}
              <TouchableOpacity
                style={styles.revealBtn}
                onPress={() => setShowAnswer(v => !v)}
              >
                <Text style={styles.revealLabel}>{showAnswer ? 'Hide translation' : 'Show translation'}</Text>
              </TouchableOpacity>
              {showAnswer && (
                <Text style={styles.sentenceViet}>{current?.vietnamese}</Text>
              )}
            </>
          ) : (
            <>
              {/* Dictation: hide English, show input */}
              <Text style={styles.dictationPrompt}>Listen and type what you hear:</Text>
              <TextInput
                style={styles.dictationInput}
                value={dictationInput}
                onChangeText={setDictationInput}
                placeholder="Type the sentence here…"
                placeholderTextColor={COLORS.textMuted}
                multiline
                autoCorrect={false}
                spellCheck={false}
              />
              {!showAnswer ? (
                <TouchableOpacity style={styles.checkBtn} onPress={checkDictation}>
                  <Text style={styles.checkBtnText}>Check Answer</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.answerReveal}>
                  <Text style={styles.correctLabel}>Correct:</Text>
                  <Text style={styles.correctText}>{current?.english}</Text>
                  <Text style={styles.translateText}>{current?.vietnamese}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => { if (currentIdx > 0) { setCurrentIdx(i => i - 1); setShowAnswer(false); setDictationInput(''); } }}
            disabled={currentIdx === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentIdx === 0 ? COLORS.textMuted : COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextBtn, completed.includes(currentIdx) && styles.nextBtnCompleted]}
            onPress={handleNext}
            disabled={saving}
          >
            <Text style={styles.nextBtnText}>
              {currentIdx === sentences.length - 1 ? (saving ? 'Saving…' : 'Finish ✓') : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700', marginHorizontal: SPACING.sm },
  headerProg: { color: '#BFDBFE', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  progressBg: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  videoContainer: { width: SCREEN_W, height: VIDEO_H },
  video: { flex: 1 },
  videoPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, margin: SPACING.lg, borderRadius: RADIUS.xl },
  videoPlaceholderText: { color: COLORS.textMuted, marginTop: SPACING.sm },
  sentenceCard: {
    margin: SPACING.lg, padding: SPACING.lg,
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sentenceEnglish: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, lineHeight: 28, marginBottom: SPACING.sm },
  phonetic: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: SPACING.sm },
  revealBtn: { alignSelf: 'flex-start', marginBottom: SPACING.sm },
  revealLabel: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  sentenceViet: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 24, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.sm },
  dictationPrompt: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  dictationInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    minHeight: 80, textAlignVertical: 'top', marginBottom: SPACING.md,
  },
  checkBtn: {
    backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.xl, alignItems: 'center',
  },
  checkBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },
  answerReveal: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.md },
  correctLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.success, marginBottom: 4 },
  correctText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  translateText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl },
  prevBtn: { width: 48, height: 48, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.xl, alignItems: 'center' },
  nextBtnCompleted: { backgroundColor: COLORS.success },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
});
