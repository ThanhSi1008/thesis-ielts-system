import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useShadowingMode } from '@/hooks';
import { Waveform } from '@/components/voice/Waveform';
import { RecordButton } from '@/components/voice/RecordButton';
import { ScoreDashboard } from '@/components/voice/feedback/ScoreDashboard';
import { TranscriptFeedback } from '@/components/voice/feedback/TranscriptFeedback';

// Colour aliases so existing code compiles (COLORS has no .success/.error keys)
const SUCCESS_COLOR = COLORS.status.success;
const ERROR_COLOR = COLORS.status.error;

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_H = SCREEN_W * (9 / 16);

export default function ShadowingPracticeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const { lessonId, mode } = useLocalSearchParams<{ lessonId: string; mode: string }>();

  const {
    isShadowing,
    lesson,
    loading,
    currentIdx,
    setCurrentIdx,
    completed,
    dictationInput,
    setDictationInput,
    showAnswer,
    setShowAnswer,
    saving,
    sentences,
    current,
    progress,
    playing,
    playbackSpeed,
    currentTime,
    trackWidth,
    setTrackWidth,
    playerRef,
    difficulty,
    setDifficulty,
    revealedWords,
    sentenceCorrect,
    currentSentenceWords,
    handleSeekPress,
    formatTimeStr,
    userWords,
    isRecording,
    spokenTranscript,
    startShadowingRecording,
    stopShadowingRecording,
    selectedWord,
    setSelectedWord,
    handleWordTap,
    togglePlay,
    cycleSpeed,
    handleNext,
    audioRecorder,
    pronunciationChecker,
    normalizeWord,
    handleYoutubeStateChange,
  } = useShadowingMode({ lessonId, mode, userId: user?.id });

  const styles = createStyles(colors);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  const youtubeId = lesson?.youtubeVideoId;
  const showDictation = mode === 'dictation';
  const progressPercent = current
    ? Math.max(
        0,
        Math.min(
          100,
          ((currentTime - current.audioStart) / (current.audioEnd - current.audioStart || 1)) * 100,
        ),
      )
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isShadowing ? '🗣 Shadowing' : '✏️ Dictation'} — {lesson?.title}
        </Text>
        <Text style={styles.headerProg}>
          {currentIdx + 1}/{sentences.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
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
                onChangeState={handleYoutubeStateChange}
                initialPlayerParams={{
                  controls: true,
                  modestbranding: true,
                  rel: false,
                }}
              />
            </View>
          ) : (
            <View style={styles.audioPlaceholder}>
              <Ionicons name="musical-notes-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.videoPlaceholderText}>
                {lesson?.audioUrl ? 'Audio Lesson' : 'No media available'}
              </Text>
            </View>
          )}

          {/* Media Controls */}
          <View style={styles.mediaControls}>
            <TouchableOpacity
              style={[styles.playBtn, playing && styles.playingBtn]}
              onPress={togglePlay}
            >
              <Ionicons
                name={playing ? 'pause' : 'play'}
                size={20}
                color={playing ? '#fff' : COLORS.primary}
              />
            </TouchableOpacity>

            <View style={styles.sliderWrapper}>
              <View
                style={styles.progressContainer}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => handleSeekPress(e.nativeEvent.locationX)}
                onResponderMove={(e) => handleSeekPress(e.nativeEvent.locationX)}
              >
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.currentTimeText}>
                  {formatTimeStr(currentTime - (current?.audioStart || 0))}
                </Text>
                <Text style={styles.durationText}>
                  {' '}
                  / {formatTimeStr((current?.audioEnd || 0) - (current?.audioStart || 0))}
                </Text>
              </View>
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
              {/* Shadowing: show English, tap word to dictionary */}
              <View style={styles.clickableSentence}>
                {currentSentenceWords.map((word: string, i: number) => (
                  <TouchableOpacity key={i} onPress={() => handleWordTap(word)}>
                    <Text style={styles.sentenceEnglishWord}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {current?.phonetic && <Text style={styles.phonetic}>{current.phonetic}</Text>}

              {/* AI Waveform when recording */}
              {(isRecording || audioRecorder.isRecording) && (
                <Waveform
                  isRecording={audioRecorder.isRecording}
                  metering={audioRecorder.currentMetering}
                  barCount={28}
                />
              )}

              {/* Record button */}
              <View style={styles.recordSection}>
                {pronunciationChecker.isChecking ? (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                  <RecordButton
                    isRecording={audioRecorder.isRecording}
                    onPress={
                      audioRecorder.isRecording ? stopShadowingRecording : startShadowingRecording
                    }
                    size={64}
                  />
                )}
                <Text style={styles.recordText}>
                  {pronunciationChecker.isChecking
                    ? 'AI scoring…'
                    : audioRecorder.isRecording
                      ? 'Recording… tap to stop'
                      : 'Tap to speak'}
                </Text>
              </View>

              {/* Transcript (speech-recognition) */}
              {spokenTranscript ? (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptLabel}>You said:</Text>
                  <Text style={styles.transcriptText}>{spokenTranscript}</Text>
                </View>
              ) : null}

              {/* AI Pronunciation Score */}
              {pronunciationChecker.result?.score && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <ScoreDashboard score={pronunciationChecker.result.score} />
                  {pronunciationChecker.result.score.words &&
                    pronunciationChecker.result.score.words.length > 0 && (
                      <View style={styles.transcriptBox}>
                        <Text style={styles.transcriptLabel}>WORD FEEDBACK</Text>
                        <TranscriptFeedback words={pronunciationChecker.result.score.words} />
                      </View>
                    )}
                </Animated.View>
              )}

              {/* AI error */}
              {pronunciationChecker.error && (
                <Animated.View entering={FadeIn} style={styles.aiErrorBox}>
                  <Text style={styles.aiErrorText}>{pronunciationChecker.error}</Text>
                </Animated.View>
              )}

              {sentenceCorrect && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={24} color={SUCCESS_COLOR} />
                  <Text style={styles.successText}>Great pronunciation! 🎉</Text>
                </View>
              )}

              <TouchableOpacity style={styles.revealBtn} onPress={() => setShowAnswer((v) => !v)}>
                <Text style={styles.revealLabel}>
                  {showAnswer ? 'Hide translation' : 'Show translation'}
                </Text>
              </TouchableOpacity>
              {showAnswer && <Text style={styles.sentenceViet}>{current?.vietnamese}</Text>}
            </>
          ) : (
            <>
              {/* Dictation Mode */}
              <View style={styles.difficultyRow}>
                <Text style={styles.difficultyLabel}>Difficulty:</Text>
                <View style={styles.diffGroup}>
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDifficulty(level)}
                      style={[styles.diffBtn, difficulty === level && styles.diffActive]}
                    >
                      <Text
                        style={[styles.diffText, difficulty === level && styles.diffTextActive]}
                      >
                        {level[0]}
                      </Text>
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
                    if (isCorrect) {
                      boxStyle = styles.wordBoxCorrect;
                      displayText = word;
                      textColor = COLORS.success;
                    } else {
                      boxStyle = styles.wordBoxIncorrect;
                      displayText = userWords[i];
                      textColor = COLORS.error;
                    }
                  }

                  if (sentenceCorrect) {
                    boxStyle = styles.wordBoxCorrect;
                    displayText = word;
                    textColor = COLORS.success;
                  }

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleWordTap(word)}
                      style={[styles.wordBox, boxStyle]}
                    >
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
                  <Ionicons name="checkmark-circle" size={24} color={SUCCESS_COLOR} />
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
            onPress={() => {
              if (currentIdx > 0) {
                setCurrentIdx((i) => i - 1);
                setShowAnswer(false);
                setDictationInput('');
              }
            }}
            disabled={currentIdx === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentIdx === 0 ? COLORS.textMuted : COLORS.primary}
            />
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
            <Text style={styles.dictDef}>
              Definition and phonetics for "{selectedWord}" will be loaded from the backend.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },
    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      marginHorizontal: SPACING.sm,
    },
    headerProg: {
      color: COLORS.primary,
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
    },
    progressBg: { height: 3, backgroundColor: colors.border },
    progressFill: { height: '100%', backgroundColor: COLORS.primary },

    mediaSection: {
      backgroundColor: colors.card,
      paddingBottom: SPACING.lg,
      borderBottomLeftRadius: RADIUS.xl,
      borderBottomRightRadius: RADIUS.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: SPACING.md,
    },
    videoContainer: { width: SCREEN_W, height: VIDEO_H, backgroundColor: '#000' },
    audioPlaceholder: {
      height: VIDEO_H * 0.8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    videoPlaceholderText: {
      color: colors.textMuted,
      marginTop: SPACING.sm,
      fontFamily: FONTS.medium,
    },

    mediaControls: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.md,
      gap: SPACING.md,
    },
    playBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    playingBtn: {
      backgroundColor: COLORS.primary,
    },
    sliderWrapper: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressContainer: { flex: 1, height: 24, justifyContent: 'center' },
    track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 65,
      justifyContent: 'flex-end',
    },
    currentTimeText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    durationText: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textMuted,
      fontVariant: ['tabular-nums'],
    },
    speedBtn: {
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    speedText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: colors.text },

    sentenceCard: {
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xl,
      padding: SPACING.xl,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 3,
    },
    clickableSentence: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm, gap: 6 },
    sentenceEnglishWord: { fontSize: 24, fontFamily: FONTS.bold, color: colors.text, lineHeight: 34 },
    phonetic: {
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: SPACING.lg,
    },

    revealBtn: { alignSelf: 'flex-start', marginBottom: SPACING.md, paddingVertical: SPACING.xs },
    revealLabel: { color: COLORS.primary, fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
    sentenceViet: {
      fontSize: FONT_SIZES.lg,
      color: colors.textSecondary,
      lineHeight: 28,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: SPACING.md,
      fontFamily: FONTS.medium,
    },

    difficultyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.lg,
    },
    difficultyLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: colors.textSecondary },
    diffGroup: { flexDirection: 'row', gap: 6 },
    diffBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    diffActive: { backgroundColor: COLORS.primary },
    diffText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: colors.textMuted },
    diffTextActive: { color: '#fff' },

    wordList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: SPACING.xl,
      minHeight: 48,
    },
    wordBox: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
    },
    wordBoxPending: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    wordBoxCorrect: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
    wordBoxIncorrect: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    wordText: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },

    dictationInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      fontSize: FONT_SIZES.lg,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: SPACING.lg,
      fontFamily: FONTS.regular,
      backgroundColor: colors.card,
    },
    dictationInputCorrect: { borderColor: SUCCESS_COLOR, backgroundColor: '#F0FDF4' },

    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: '#F0FDF4',
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: '#bbf7d0',
    },
    successText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: SUCCESS_COLOR },

    aiErrorBox: {
      backgroundColor: '#FEF2F2',
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    aiErrorText: { fontSize: FONT_SIZES.sm, color: ERROR_COLOR, fontFamily: FONTS.medium },
    answerReveal: { borderTopWidth: 1, borderColor: colors.border, paddingTop: SPACING.md },
    translateText: {
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
      lineHeight: 24,
    },

    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      gap: SPACING.md,
      marginBottom: SPACING.xxxl,
    },
    prevBtn: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    nextBtn: {
      flex: 1,
      backgroundColor: COLORS.primary,
      height: 56,
      borderRadius: RADIUS.xl,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    nextBtnCompleted: { backgroundColor: SUCCESS_COLOR, shadowColor: SUCCESS_COLOR },
    nextBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },

    recordSection: { alignItems: 'center', marginVertical: SPACING.xl },
    recordText: {
      marginTop: SPACING.md,
      color: colors.textSecondary,
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
    },

    transcriptBox: {
      backgroundColor: colors.surface,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    transcriptLabel: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    transcriptText: {
      fontSize: FONT_SIZES.md,
      color: colors.text,
      fontStyle: 'italic',
      lineHeight: 24,
    },

    dictModalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
    dictModalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    dictModalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: SPACING.xl,
      paddingBottom: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    dictModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    dictModalTitle: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dictWord: { fontSize: 28, fontFamily: FONTS.bold, color: colors.text, marginBottom: SPACING.md },
    dictDef: {
      fontSize: FONT_SIZES.lg,
      color: colors.textSecondary,
      lineHeight: 28,
      fontFamily: FONTS.regular,
    },
  });
