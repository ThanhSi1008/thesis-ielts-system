import React, { useRef, useEffect, useState } from 'react';
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
import { useShadowingMode, getHintText } from '@/hooks';
import { ConfirmDialog } from '@/components';
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
    userInputs,
    setUserInputs,
    isChecked,
    setIsChecked,
    isAllCorrect,
    setIsAllCorrect,
    hintLevels,
    setHintLevels,
    hiddenIndices,
    requestHint,
    checkAnswers,
    retry,
    handleInputChange,
    isShadowing,
    lesson,
    loading,
    currentIdx,
    setCurrentIdx,
    completed,
    setCompleted,
    dictationInput,
    setDictationInput,
    showAnswer,
    setShowAnswer,
    saving,
    setSaving,
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
    setRevealedWords,
    sentenceCorrect,
    setSentenceCorrect,
    currentSentenceWords,
    normalizeWord,
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
    handleYoutubeStateChange,
    showFinishDialog,
    setShowFinishDialog,
  } = useShadowingMode({ lessonId, mode, userId: user?.id });

  const [showTranslation, setShowTranslation] = useState(false);
  const [showPhonetics, setShowPhonetics] = useState(true);
  const inputsRef = useRef<Record<number, TextInput | null>>({});

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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to the practice list screen"
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          allowFontScaling={true}
          accessibilityRole="header"
        >
          {isShadowing ? '🗣 Shadowing' : '✏️ Dictation'} — {lesson?.title}
        </Text>
        <Text
          style={styles.headerProg}
          allowFontScaling={true}
          accessibilityLabel={`Sentence ${currentIdx + 1} of ${sentences.length}`}
        >
          {currentIdx + 1}/{sentences.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={styles.progressBg}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={`Lesson progress: ${Math.round(progress)}%`}
      >
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
            <View
              style={styles.audioPlaceholder}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={lesson?.audioUrl ? 'Audio Lesson Media File' : 'No media available'}
            >
              <Ionicons name="musical-notes-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.videoPlaceholderText} allowFontScaling={true}>
                {lesson?.audioUrl ? 'Audio Lesson' : 'No media available'}
              </Text>
            </View>
          )}

          {/* Media Controls */}
          <View style={styles.mediaControls}>
            <TouchableOpacity
              style={[styles.playBtn, playing && styles.playingBtn]}
              onPress={togglePlay}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={playing ? "Pause lesson audio" : "Play lesson audio"}
              accessibilityHint={playing ? "Double tap to pause the playback" : "Double tap to resume the playback"}
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
                accessible={true}
                accessibilityRole="adjustable"
                accessibilityLabel="Audio timeline progress"
                accessibilityHint="Drag or double tap to change playback position"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.round(progressPercent),
                  text: `${Math.round(progressPercent)}%`
                }}
              >
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
              <View style={styles.timeContainer} accessible={true} accessibilityLabel="Elapsed and total duration">
                <Text style={styles.currentTimeText} allowFontScaling={true}>
                  {formatTimeStr(currentTime - (current?.audioStart || 0))}
                </Text>
                <Text style={styles.durationText} allowFontScaling={true}>
                  {' '}
                  / {formatTimeStr((current?.audioEnd || 0) - (current?.audioStart || 0))}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.speedBtn}
              onPress={cycleSpeed}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Playback speed is ${playbackSpeed}x`}
              accessibilityHint="Double tap to cycle between speeds: 0.75, 1, 1.25, or 1.5 times"
            >
              <Text style={styles.speedText} allowFontScaling={true}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sentence card */}
        <View style={styles.sentenceCard}>
          {isShadowing ? (
            <>
              {/* Sleek toggles */}
              <View style={styles.toggleRow}>
                {current?.phonetic ? (
                  <TouchableOpacity
                    style={[styles.toggleBtn, showPhonetics && styles.toggleBtnActive]}
                    onPress={() => setShowPhonetics(!showPhonetics)}
                  >
                    <Ionicons
                      name="language"
                      size={16}
                      color={showPhonetics ? '#fff' : colors.textSecondary}
                    />
                    <Text style={[styles.toggleBtnText, showPhonetics && styles.toggleBtnTextActive]}>
                      IPA
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.toggleBtn, showTranslation && styles.toggleBtnActive]}
                  onPress={() => setShowTranslation(!showTranslation)}
                >
                  <Ionicons
                    name={showTranslation ? 'eye' : 'eye-off'}
                    size={16}
                    color={showTranslation ? '#fff' : colors.textSecondary}
                  />
                  <Text style={[styles.toggleBtnText, showTranslation && styles.toggleBtnTextActive]}>
                    Dịch
                  </Text>
                </TouchableOpacity>
              </View>

              {/* English sentence with word-by-word coloring against spoken transcript */}
              <View
                style={styles.clickableSentence}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`Target English sentence: ${sentences[currentIdx]?.english || ''}`}
                accessibilityHint="Review this sentence. Tap individual words below to look them up in the dictionary."
              >
                {currentSentenceWords.map((word: string, i: number) => {
                  const spokenWords = spokenTranscript.trim().split(/\s+/).filter(w => w.length > 0);
                  let wordColor = colors.text;
                  let decorationLine: 'none' | 'underline' = 'none';

                  if (spokenWords.length > 0) {
                    const typed = normalizeWord(spokenWords[i] || '');
                    const correct = normalizeWord(word);
                    if (typed === correct) {
                      wordColor = '#10B981'; // Emerald Green
                    } else if (i < spokenWords.length) {
                      wordColor = '#EF4444'; // Crimson Red
                      decorationLine = 'underline';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleWordTap(word)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={word}
                      accessibilityHint="Tap to lookup word in dictionary"
                    >
                      <Text
                        style={[
                          styles.sentenceEnglishWord,
                          { color: wordColor, textDecorationLine: decorationLine },
                        ]}
                        allowFontScaling={true}
                      >
                        {word}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showPhonetics && current?.phonetic ? (
                <Text
                  style={styles.phonetic}
                  allowFontScaling={true}
                  accessibilityLabel={`Phonetic transcription: ${current.phonetic}`}
                >
                  /{current.phonetic}/
                </Text>
              ) : null}

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
                <Text style={styles.recordText} allowFontScaling={true}>
                  {pronunciationChecker.isChecking
                    ? 'AI scoring…'
                    : audioRecorder.isRecording
                      ? 'Recording… tap to stop'
                      : 'Tap to speak'}
                </Text>
              </View>

              {/* Transcript (speech-recognition) */}
              {spokenTranscript ? (
                <View
                  style={styles.transcriptBox}
                  accessible={true}
                  accessibilityLabel={`Speech transcription: You said: ${spokenTranscript}`}
                >
                  <Text style={styles.transcriptLabel} allowFontScaling={true}>You said:</Text>
                  <Text style={styles.transcriptText} allowFontScaling={true}>{spokenTranscript}</Text>
                </View>
              ) : null}

              {/* AI Pronunciation Score */}
              {pronunciationChecker.result?.score && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <ScoreDashboard score={pronunciationChecker.result.score} />
                  {pronunciationChecker.result.score.words &&
                    pronunciationChecker.result.score.words.length > 0 && (
                      <View style={styles.transcriptBox}>
                        <Text style={styles.transcriptLabel} allowFontScaling={true}>WORD FEEDBACK</Text>
                        <TranscriptFeedback words={pronunciationChecker.result.score.words} />
                      </View>
                    )}
                </Animated.View>
              )}

              {/* AI error */}
              {pronunciationChecker.error && (
                <Animated.View entering={FadeIn} style={styles.aiErrorBox}>
                  <Text style={styles.aiErrorText} allowFontScaling={true}>{pronunciationChecker.error}</Text>
                </Animated.View>
              )}

              {sentenceCorrect && (
                <View
                  style={styles.successBanner}
                  accessible={true}
                  accessibilityLabel="Great pronunciation check passed"
                >
                  <Ionicons name="checkmark-circle" size={24} color={SUCCESS_COLOR} />
                  <Text style={styles.successText} allowFontScaling={true}>Great pronunciation! 🎉</Text>
                </View>
              )}

              {showTranslation && current?.vietnamese ? (
                <Text
                  style={styles.sentenceViet}
                  allowFontScaling={true}
                  accessibilityLabel={`Vietnamese translation: ${current?.vietnamese}`}
                >
                  {current?.vietnamese}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              {/* Dictation Mode */}
              <View
                style={styles.difficultyRow}
                accessible={true}
                accessibilityRole="tablist"
                accessibilityLabel="Difficulty settings"
              >
                <Text style={styles.difficultyLabel} allowFontScaling={true}>Difficulty:</Text>
                <View style={styles.diffGroup}>
                  {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDifficulty(level)}
                      style={[styles.diffBtn, difficulty === level && styles.diffActive]}
                      accessible={true}
                      accessibilityRole="tab"
                      accessibilityLabel={`${level} difficulty mode`}
                      accessibilityState={{ selected: difficulty === level }}
                    >
                      <Text
                        style={[styles.diffText, difficulty === level && styles.diffTextActive]}
                        allowFontScaling={true}
                      >
                        {level[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Inline flow dictation words */}
              <View style={styles.dictationFlowContainer}>
                {currentSentenceWords.map((word: string, idx: number) => {
                  const isHidden = hiddenIndices.has(idx);
                  const rawCorrect = word;
                  const normCorrect = normalizeWord(word);
                  const userInput = userInputs[idx] || '';
                  const isMatch = normalizeWord(userInput) === normCorrect;
                  const wordHintLevel = hintLevels[idx] ?? 0;

                  if (!isHidden) {
                    return (
                      <Text
                        key={idx}
                        style={styles.dictationStaticText}
                        allowFontScaling={true}
                      >
                        {rawCorrect}
                      </Text>
                    );
                  }

                  let inputBg = colors.surface;
                  let inputBorder = colors.border;
                  let inputTextColor = colors.text;

                  if (!isChecked && wordHintLevel > 0) {
                    // Amber/Orange for hints
                    inputBg = '#FFF8E1';
                    inputBorder = '#FFE082';
                  }

                  if (isChecked) {
                    if (isMatch) {
                      // Correct: green
                      inputBg = '#E8F5E9';
                      inputBorder = '#81C784';
                      inputTextColor = '#2E7D32';
                    } else {
                      // Incorrect: red
                      inputBg = '#FFEBEE';
                      inputBorder = '#E57373';
                      inputTextColor = '#C62828';
                    }
                  }

                  const charWidth = 13; // average width of character
                  const computedWidth = Math.max(rawCorrect.length, userInput.length, 3) * charWidth + 24;

                  return (
                    <View key={idx} style={styles.dictationWordWrapper}>
                      <View style={styles.dictationInputContainer}>
                        <TextInput
                          ref={(el) => {
                            inputsRef.current[idx] = el;
                          }}
                          value={userInput}
                          onChangeText={(val) => {
                            if (val.endsWith(' ')) {
                              const cleanVal = val.trim();
                              handleInputChange(idx, cleanVal);
                              // Focus next
                              const nextIndex = Array.from(hiddenIndices)
                                .sort((a, b) => a - b)
                                .find((i) => i > idx);
                              if (nextIndex !== undefined) {
                                inputsRef.current[nextIndex]?.focus();
                              }
                            } else {
                              handleInputChange(idx, val);
                            }
                          }}
                          onSubmitEditing={() => {
                            const nextIndex = Array.from(hiddenIndices)
                              .sort((a, b) => a - b)
                              .find((i) => i > idx);
                            if (nextIndex !== undefined) {
                              inputsRef.current[nextIndex]?.focus();
                            }
                          }}
                          onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && userInput === '') {
                              const prevIndex = Array.from(hiddenIndices)
                                .sort((a, b) => b - a)
                                .find((i) => i < idx);
                              if (prevIndex !== undefined) {
                                inputsRef.current[prevIndex]?.focus();
                              }
                            }
                          }}
                          editable={!isChecked}
                          style={[
                            styles.dictationInlineInput,
                            {
                              width: computedWidth,
                              backgroundColor: inputBg,
                              borderColor: inputBorder,
                              color: inputTextColor,
                            },
                          ]}
                          placeholder={getHintText(rawCorrect, wordHintLevel)}
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="none"
                          autoCorrect={false}
                          spellCheck={false}
                          accessible={true}
                          accessibilityLabel={`Word ${idx + 1} dictation input`}
                        />

                        {!isChecked && (
                          <TouchableOpacity
                            style={[
                              styles.hintBulbBtn,
                              wordHintLevel > 0 && styles.hintBulbBtnActive,
                            ]}
                            onPress={() => requestHint(idx)}
                          >
                            <Ionicons
                              name="bulb"
                              size={12}
                              color={wordHintLevel > 0 ? '#F59E0B' : colors.textMuted}
                            />
                            {wordHintLevel > 0 && wordHintLevel < 3 ? (
                              <Text style={styles.hintLevelText}>{wordHintLevel}</Text>
                            ) : null}
                          </TouchableOpacity>
                        )}
                      </View>

                      {isChecked && !isMatch && (
                        <View style={styles.dictCorrectTooltip}>
                          <Text style={styles.dictCorrectTooltipText}>{rawCorrect}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.dictActionContainer}>
                {!isChecked ? (
                  <TouchableOpacity
                    style={styles.checkAnswersBtn}
                    onPress={checkAnswers}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.checkAnswersBtnText}>Kiểm tra đáp án</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.dictResultsContainer}>
                    {!isAllCorrect ? (
                      <TouchableOpacity
                        style={styles.dictRetryBtn}
                        onPress={retry}
                      >
                        <Ionicons name="refresh" size={20} color={COLORS.primary} />
                        <Text style={styles.dictRetryBtnText}>Thử lại</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.successBannerInline}>
                        <Ionicons name="checkmark-circle" size={24} color={SUCCESS_COLOR} />
                        <Text style={styles.successTextInline}>Chính xác! Hoàn thành xuất sắc 🎉</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.dictNextBtn,
                        isAllCorrect && styles.dictNextBtnSuccess,
                      ]}
                      onPress={handleNext}
                      disabled={saving}
                    >
                      <Text style={styles.dictNextBtnText}>
                        {currentIdx === sentences.length - 1
                          ? saving
                            ? 'Đang lưu…'
                            : 'Hoàn thành ✓'
                          : 'Câu tiếp theo →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {isChecked && current?.vietnamese ? (
                <View style={styles.answerReveal}>
                  <Text style={styles.translateText} allowFontScaling={true}>
                    {current?.vietnamese}
                  </Text>
                </View>
              ) : null}
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous sentence"
            accessibilityState={{ disabled: currentIdx === 0 }}
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={currentIdx === sentences.length - 1 ? (saving ? 'Saving score progress' : 'Finish practice lesson') : 'Next sentence'}
            accessibilityState={{ disabled: saving }}
          >
            <Text style={styles.nextBtnText} allowFontScaling={true}>
              {currentIdx === sentences.length - 1 ? (saving ? 'Saving…' : 'Finish ✓') : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>



      {/* Lesson Complete Confirm Dialog */}
      <ConfirmDialog
        visible={showFinishDialog}
        onClose={() => {
          setShowFinishDialog(false);
          router.back();
        }}
        title="Well done! 🎉"
        message={`You completed all ${sentences.length} sentences.`}
        variant="confirm"
        primaryAction={{
          title: 'Back',
          onPress: () => {
            setShowFinishDialog(false);
            router.back();
          },
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
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
    sentenceEnglishWord: {
      fontSize: 24,
      fontFamily: FONTS.bold,
      color: colors.text,
      lineHeight: 34,
    },
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
    difficultyLabel: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
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
    dictWord: {
      fontSize: 28,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.md,
    },
    dictDef: {
      fontSize: FONT_SIZES.lg,
      color: colors.textSecondary,
      lineHeight: 28,
      fontFamily: FONTS.regular,
    },

    toggleRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: SPACING.md,
      alignSelf: 'flex-start',
    },
    toggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    toggleBtnActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    toggleBtnText: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    toggleBtnTextActive: {
      color: '#fff',
    },

    dictationFlowContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginBottom: SPACING.xl,
    },
    dictationStaticText: {
      fontSize: 20,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginVertical: 4,
    },
    dictationWordWrapper: {
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    },
    dictationInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    dictationInlineInput: {
      height: 38,
      borderWidth: 1.5,
      borderRadius: RADIUS.md,
      paddingHorizontal: 8,
      fontSize: 18,
      fontFamily: FONTS.bold,
      textAlign: 'center',
      paddingVertical: 0,
    },
    hintBulbBtn: {
      marginLeft: 4,
      padding: 4,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    hintBulbBtnActive: {
      backgroundColor: '#FFFBEB',
      borderColor: '#FCD34D',
    },
    hintLevelText: {
      fontSize: 10,
      fontFamily: FONTS.bold,
      color: '#D97706',
    },
    dictCorrectTooltip: {
      position: 'absolute',
      top: 42,
      alignSelf: 'center',
      backgroundColor: colors.text,
      borderRadius: RADIUS.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dictCorrectTooltipText: {
      fontSize: 12,
      fontFamily: FONTS.bold,
      color: colors.card,
    },
    dictActionContainer: {
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
    },
    checkAnswersBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: COLORS.primary,
      height: 50,
      borderRadius: RADIUS.xl,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    checkAnswersBtnText: {
      color: '#fff',
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
    },
    dictResultsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    dictRetryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      height: 50,
      borderRadius: RADIUS.xl,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
    },
    dictRetryBtnText: {
      color: COLORS.primary,
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
    },
    successBannerInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: '#C8E6C9',
      flex: 1,
    },
    successTextInline: {
      fontSize: 13,
      fontFamily: FONTS.bold,
      color: '#2E7D32',
    },
    dictNextBtn: {
      flex: 1,
      height: 50,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dictNextBtnSuccess: {
      backgroundColor: SUCCESS_COLOR,
      shadowColor: SUCCESS_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    dictNextBtnText: {
      color: '#fff',
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
    },
  });
