import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = (eventName: string, listener: any) => { };

try {
  const SpeechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = SpeechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = SpeechModule.useSpeechRecognitionEvent;
} catch (e) {
  console.warn("expo-speech-recognition not found. Voice features require a dev client.");
}
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
  const current = sentences[currentIdx] || sentences[0];
  const progress = Math.round((completed.length / sentences.length) * 100);

  // Phase 1: Media Sync States
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const playerRef = useRef<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Phase 2: Dictation States
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [sentenceCorrect, setSentenceCorrect] = useState(false);

  const currentSentenceWords = React.useMemo(() => {
    return (current?.english || '').split(/\s+/).filter((w: string) => w.length > 0);
  }, [current?.english]);

  const normalizeWord = (w: string) => w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

  // Phase 2: Apply difficulty
  useEffect(() => {
    const totalWords = currentSentenceWords.length;
    const newRevealed = new Set<number>();
    currentSentenceWords.forEach((w: string, i: number) => {
      if (/^[.,!?'"]+$/.test(w)) newRevealed.add(i);
    });

    let targetPercent = 0;
    if (difficulty === 'Beginner') targetPercent = 0.7;
    else if (difficulty === 'Intermediate') targetPercent = 0.5;
    else if (difficulty === 'Advanced') targetPercent = 0.3;

    if (targetPercent > 0) {
      const targetCount = Math.floor(totalWords * targetPercent);
      const indices = Array.from({ length: totalWords }, (_, i) => i).filter(i => !newRevealed.has(i));
      indices.sort((a, b) => currentSentenceWords[a].length - currentSentenceWords[b].length);
      for (let i = 0; i < targetCount && i < indices.length; i++) {
        newRevealed.add(indices[i]);
      }
    }

    setRevealedWords(newRevealed);
    setDictationInput('');
    setSentenceCorrect(false);
  }, [currentIdx, difficulty, currentSentenceWords]);

  // Phase 2: Evaluate Input Real-time
  const userWords = React.useMemo(() => dictationInput.split(/\s+/).filter(w => w.length > 0), [dictationInput]);

  useEffect(() => {
    if (sentenceCorrect) return;
    if (userWords.length === currentSentenceWords.length) {
      const allCorrect = currentSentenceWords.every((w: string, i: number) =>
        normalizeWord(userWords[i] || '') === normalizeWord(w)
      );
      if (allCorrect) {
        setSentenceCorrect(true);
        markCompleted(currentIdx);
      }
    }
  }, [userWords, currentSentenceWords, sentenceCorrect, currentIdx]);

  // Phase 3: Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  useSpeechRecognitionEvent('result', (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      setSpokenTranscript(transcript);

      // Real-time evaluation for shadowing
      if (isShadowing && !sentenceCorrect) {
        const spokenWords = transcript.split(/\s+/).filter((w: string) => w.length > 0);
        if (spokenWords.length >= currentSentenceWords.length) {
          const isClose = spokenWords.some((w: string, i: number) => {
            const matchCount = currentSentenceWords.filter((cw: string) => normalizeWord(cw) === normalizeWord(w)).length;
            return matchCount > 0;
          });
          // For simplicity in mobile MVP, if they said most of the words, we pass them
          const closeCount = currentSentenceWords.filter((cw: string) =>
            transcript.toLowerCase().includes(normalizeWord(cw))
          ).length;

          if (closeCount >= currentSentenceWords.length * 0.7) {
            setSentenceCorrect(true);
            markCompleted(currentIdx);
            stopRecording();
          }
        }
      }
    }
  });

  const startRecording = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert('Unsupported', 'Speech recognition requires a development build. Please run "npx expo prebuild" and compile the app natively.');
      return;
    }
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please grant microphone access to use shadowing.');
        return;
      }
      setSpokenTranscript('');
      setIsRecording(true);
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', continuous: true, interimResults: true });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to start speech recognition.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsRecording(false);
  };

  // Phase 4: Dictionary State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordTap = (word: string) => {
    setSelectedWord(normalizeWord(word));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const playSentence = async () => {
    if (!current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (lesson?.youtubeVideoId && playerRef.current) {
      playerRef.current.seekTo(current.audioStart, true);
      setPlaying(true);
      timerRef.current = setInterval(async () => {
        const currentTime = await playerRef.current?.getCurrentTime();
        if (currentTime && currentTime >= current.audioEnd) {
          setPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 50);
    } else if (lesson?.audioUrl) {
      // Local/Remote Audio file fallback
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri: lesson.audioUrl });
        soundRef.current = sound;
      }
      await soundRef.current.setRateAsync(playbackSpeed, true);
      await soundRef.current.setPositionAsync(current.audioStart * 1000);
      await soundRef.current.playAsync();
      setPlaying(true);

      timerRef.current = setInterval(async () => {
        const status = await soundRef.current?.getStatusAsync();
        if (status?.isLoaded && status.positionMillis >= current.audioEnd * 1000) {
          await soundRef.current?.pauseAsync();
          setPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 50);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.25, 0.5, 0.75, 1.0, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

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
    setSpokenTranscript('');
    setShowAnswer(false);
    setPlaying(false);
    if (isRecording) stopRecording();
    if (timerRef.current) clearInterval(timerRef.current);

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
    // Deprecated for real-time evaluation
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
        {/* Media Player */}
        <View style={styles.mediaSection}>
          {youtubeId ? (
            <View style={styles.videoContainer}>
              <YoutubePlayer
                ref={playerRef}
                height={VIDEO_H}
                width={SCREEN_W}
                videoId={youtubeId}
                play={playing}
                playbackRate={playbackSpeed}
                onChangeState={(state: string) => {
                  if (state === 'ended' || state === 'paused') setPlaying(false);
                }}
                initialPlayerParams={{
                  controls: false,
                  modestbranding: true,
                  rel: false,
                }}
              />
            </View>
          ) : (
            <View style={styles.audioPlaceholder}>
              <Ionicons name="musical-notes-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.videoPlaceholderText}>{lesson?.audioUrl ? 'Audio Lesson' : 'No media available'}</Text>
            </View>
          )}

          {/* Media Controls */}
          <View style={styles.mediaControls}>
            <TouchableOpacity
              style={[styles.playBtn, playing && styles.playingBtn]}
              onPress={playSentence}
            >
              <Ionicons name={playing ? "pause" : "play"} size={24} color={playing ? "#fff" : COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.waveformDummy}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: playing ? Math.max(8, Math.random() * 24) : 8 },
                    playing && { backgroundColor: COLORS.primary }
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.speedBtn} onPress={cycleSpeed}>
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sentence card */}
        <View style={styles.sentenceCard}>
          {isShadowing ? (
            <>
              {/* Shadowing: show English + phonetic, hide Vietnamese */}
              <View style={styles.clickableSentence}>
                {currentSentenceWords.map((word: string, i: number) => (
                  <TouchableOpacity key={i} onPress={() => handleWordTap(word)}>
                    <Text style={styles.sentenceEnglishWord}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {current?.phonetic && <Text style={styles.phonetic}>{current.phonetic}</Text>}

              <View style={styles.recordSection}>
                <TouchableOpacity
                  style={[styles.recordBtn, isRecording && styles.recordingActive]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Ionicons name={isRecording ? "stop" : "mic"} size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.recordText}>
                  {isRecording ? "Listening..." : "Tap to speak"}
                </Text>
              </View>

              {spokenTranscript ? (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptLabel}>You said:</Text>
                  <Text style={styles.transcriptText}>{spokenTranscript}</Text>
                </View>
              ) : null}

              {sentenceCorrect && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  <Text style={styles.successText}>Great pronunciation! 🎉</Text>
                </View>
              )}

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
              {/* Dictation Mode */}
              <View style={styles.difficultyRow}>
                <Text style={styles.difficultyLabel}>Difficulty:</Text>
                <View style={styles.diffGroup}>
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map(level => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDifficulty(level)}
                      style={[styles.diffBtn, difficulty === level && styles.diffActive]}
                    >
                      <Text style={[styles.diffText, difficulty === level && styles.diffTextActive]}>{level[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.wordList}>
                {currentSentenceWords.map((word: string, i: number) => {
                  const isRevealed = revealedWords.has(i);
                  const isPending = i >= userWords.length;
                  const typed = normalizeWord(userWords[i] || '');
                  const correct = normalizeWord(word);
                  const isCorrect = typed === correct;

                  let boxStyle: any = styles.wordBoxPending;
                  let textColor: string = COLORS.text;
                  let displayText = isRevealed ? word : '*'.repeat(word.length);

                  if (!isRevealed && !isPending) {
                    if (isCorrect) { boxStyle = styles.wordBoxCorrect; displayText = word; textColor = COLORS.success; }
                    else { boxStyle = styles.wordBoxIncorrect; displayText = userWords[i]; textColor = COLORS.error; }
                  }

                  if (sentenceCorrect) {
                    boxStyle = styles.wordBoxCorrect;
                    displayText = word;
                    textColor = COLORS.success;
                  }

                  return (
                    <TouchableOpacity key={i} onPress={() => handleWordTap(word)} style={[styles.wordBox, boxStyle]}>
                      <Text style={[styles.wordText, { color: textColor }]}>{displayText}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={[styles.dictationInput, sentenceCorrect && styles.dictationInputCorrect]}
                value={dictationInput}
                onChangeText={setDictationInput}
                placeholder="Type the sentence here…"
                placeholderTextColor={COLORS.textMuted}
                multiline
                editable={!sentenceCorrect}
                autoCorrect={false}
                spellCheck={false}
              />

              {sentenceCorrect && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  <Text style={styles.successText}>Correct! Well done 🎉</Text>
                </View>
              )}

              {sentenceCorrect && (
                <View style={styles.answerReveal}>
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

      {/* Dictionary Modal */}
      {selectedWord && (
        <View style={styles.dictModalOverlay}>
          <TouchableOpacity style={styles.dictModalBg} onPress={() => setSelectedWord(null)} />
          <View style={styles.dictModalContent}>
            <View style={styles.dictModalHeader}>
              <Text style={styles.dictModalTitle}>Dictionary lookup</Text>
              <TouchableOpacity onPress={() => setSelectedWord(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.dictWord}>{selectedWord}</Text>
            <Text style={styles.dictDef}>Definition and phonetics for "{selectedWord}" will be loaded from the backend.</Text>
          </View>
        </View>
      )}
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
  mediaSection: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: SPACING.lg },
  videoContainer: { width: SCREEN_W, height: VIDEO_H, backgroundColor: '#000' },
  audioPlaceholder: { height: VIDEO_H, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  videoPlaceholderText: { color: COLORS.textMuted, marginTop: SPACING.sm, fontWeight: '600' },
  mediaControls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginTop: SPACING.md, gap: SPACING.md },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  playingBtn: { backgroundColor: COLORS.primary },
  waveformDummy: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 32, gap: 2, overflow: 'hidden' },
  waveBar: { flex: 1, backgroundColor: COLORS.border, borderRadius: 4 },
  speedBtn: { backgroundColor: COLORS.surface, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  speedText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
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
  difficultyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  difficultyLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  diffGroup: { flexDirection: 'row', gap: 4 },
  diffBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  diffActive: { backgroundColor: COLORS.primary },
  diffText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted },
  diffTextActive: { color: '#fff' },
  wordList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg, minHeight: 48 },
  wordBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md, borderWidth: 1 },
  wordBoxPending: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderStyle: 'dashed' },
  wordBoxCorrect: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  wordBoxIncorrect: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  wordText: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  dictationInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    minHeight: 80, textAlignVertical: 'top', marginBottom: SPACING.md,
  },
  dictationInputCorrect: { borderColor: COLORS.success, backgroundColor: '#F0FDF4' },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#F0FDF4', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  successText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.success },
  answerReveal: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.md },
  translateText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl },
  prevBtn: { width: 48, height: 48, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.xl, alignItems: 'center' },
  nextBtnCompleted: { backgroundColor: COLORS.success },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
  recordSection: { alignItems: 'center', marginVertical: SPACING.lg },
  recordBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  recordingActive: { backgroundColor: COLORS.error, shadowColor: COLORS.error },
  recordText: { marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  transcriptBox: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  transcriptLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4 },
  transcriptText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontStyle: 'italic' },
  clickableSentence: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm, gap: 4 },
  sentenceEnglishWord: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, lineHeight: 28 },
  dictModalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  dictModalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  dictModalContent: { backgroundColor: '#fff', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  dictModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  dictModalTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  dictWord: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  dictDef: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
});
