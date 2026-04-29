import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Dimensions, Pressable
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useAudioPlayer } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { usePronunciationChecker } from '@/hooks/usePronunciationChecker';
import { SHADOWING_LESSONS } from '@/constants/shadowing-lessons';
import { Waveform } from '@/components/voice/Waveform';
import { RecordButton } from '@/components/voice/RecordButton';
import { ScoreDashboard } from '@/components/voice/feedback/ScoreDashboard';
import { TranscriptFeedback } from '@/components/voice/feedback/TranscriptFeedback';

// Colour aliases so existing code compiles (COLORS has no .success/.error keys)
const SUCCESS_COLOR = COLORS.status.success;
const ERROR_COLOR = COLORS.status.error;

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = (_eventName: string, _listener: any) => { };

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
  // ── Auth & AI scoring ────────────────────────────────────────────────────
  const { user } = useAuth();
  const audioRecorder = useAudioRecorderHook();
  const pronunciationChecker = usePronunciationChecker();
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

  const sentences = React.useMemo(
    () => (lesson?.sentences?.length ? lesson.sentences : PLACEHOLDER_SENTENCES),
    [lesson]
  );
  const current = React.useMemo(
    () => sentences[currentIdx] || sentences[0],
    [sentences, currentIdx]
  );
  const progress = Math.round((completed.length / sentences.length) * 100);

  // Phase 1: Media Sync States
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  // react-native-youtube-iframe exposes seekTo/getCurrentTime via imperative ref
  const playerRef = useRef<any>(null);
  const audioPlayer = useAudioPlayer(lesson?.audioUrl || '');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // JS-clock based tracking (avoids unreliable async getCurrentTime)
  const playStartTimeRef = useRef<number>(0);     // Date.now() when play started
  const sentenceStartSecRef = useRef<number>(0);  // audioStart of sentence when play started

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

  useEffect(() => {
    if (current) {
      setCurrentTime(current.audioStart);
      setRevealedWords(new Set());
      setDictationInput('');
      setSentenceCorrect(false);
      pronunciationChecker.reset();
      setShowAnswer(false);
      setSpokenTranscript('');
    }
  // Use currentIdx (primitive) NOT current (object) to avoid spurious resets on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  const handleSeek = (value: number) => {
    setCurrentTime(value);
    // Update clock refs so interval keeps counting from the seeked position
    sentenceStartSecRef.current = value;
    playStartTimeRef.current = Date.now();
    if (lesson?.youtubeVideoId && playerRef.current) {
      playerRef.current.seekTo(value, true);
    } else if (lesson?.audioUrl) {
      audioPlayer.seekTo(value * 1000);
    }
  };

  const handleSeekPress = (locationX: number) => {
    if (trackWidth > 0 && current) {
      const duration = current.audioEnd - current.audioStart;
      const seekTime = current.audioStart + Math.max(0, Math.min(1, locationX / trackWidth)) * duration;
      handleSeek(seekTime);
    }
  };


  const formatTimeStr = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Phase 3: Speech Recognition + AI Scoring
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  useSpeechRecognitionEvent('result', (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      setSpokenTranscript(transcript);

      if (isShadowing && !sentenceCorrect) {
        const closeCount = currentSentenceWords.filter((cw: string) =>
          transcript.toLowerCase().includes(normalizeWord(cw))
        ).length;
        if (closeCount >= currentSentenceWords.length * 0.7) {
          setSentenceCorrect(true);
          markCompleted(currentIdx);
          stopShadowingRecording();
        }
      }
    }
  });

  /** Start speech recognition + expo-audio recording simultaneously */
  const startShadowingRecording = useCallback(async () => {
    pronunciationChecker.reset();
    // Start audio file recording for AI scoring
    await audioRecorder.startRecording();

    // Also start speech recognition for real-time text matching
    if (!ExpoSpeechRecognitionModule) return;
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) return;
      setSpokenTranscript('');
      setIsRecording(true);
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', continuous: true, interimResults: true });
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  }, [audioRecorder, pronunciationChecker]);

  /** Stop both speech recognition and audio recording, then submit for AI scoring */
  const stopShadowingRecording = useCallback(async () => {
    // Stop speech recognition
    if (ExpoSpeechRecognitionModule) ExpoSpeechRecognitionModule.stop();
    setIsRecording(false);

    // Stop expo-audio recorder and get URI
    const uri = await audioRecorder.stopRecording();
    if (uri && user?.id && current?.english) {
      await pronunciationChecker.checkPronunciation(uri, user.id, {
        targetWord: current.english,
      });
      // Cleanup temp file after upload
      audioRecorder.clearRecording();
    }
  }, [audioRecorder, pronunciationChecker, user, current]);

  /** Legacy: kept for backward-compat (e.g. when sentenceCorrect auto-fires) */
  const stopRecording = () => stopShadowingRecording();

  // Phase 4: Dictionary State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordTap = (word: string) => {
    setSelectedWord(normalizeWord(word));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Stable ref so the interval callback always sees latest `current`
  const currentRef = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  const playSentence = useCallback((targetSentence?: any) => {
    const sentence = targetSentence ?? currentRef.current;
    if (!sentence) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Record JS clock baseline for reliable progress tracking
    sentenceStartSecRef.current = sentence.audioStart;
    playStartTimeRef.current = Date.now();

    const startInterval = (audioEnd: number) => {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
        const t = sentenceStartSecRef.current + elapsed;
        setCurrentTime(t);
        if (t >= audioEnd) {
          setPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (lesson?.youtubeVideoId && playerRef.current) {
            // No-op: YouTube controls will show paused state
          } else if (lesson?.audioUrl) {
            audioPlayer.pause();
          }
        }
      }, 100);
    };

    if (lesson?.youtubeVideoId && playerRef.current) {
      setPlaying(false);
      playerRef.current.seekTo(sentence.audioStart, true);
      setTimeout(() => {
        setPlaying(true);
        // Reset clock after the 100ms seek delay
        playStartTimeRef.current = Date.now();
        startInterval(sentence.audioEnd);
      }, 150);
    } else if (lesson?.audioUrl) {
      audioPlayer.seekTo(sentence.audioStart * 1000);
      audioPlayer.play();
      setPlaying(true);
      startInterval(sentence.audioEnd);
    }
  }, [lesson, audioPlayer]);

  const togglePlay = useCallback(() => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lesson?.youtubeVideoId && playerRef.current) {
        setPlaying(false);
      } else if (lesson?.audioUrl) {
        audioPlayer.pause();
        setPlaying(false);
      }
    } else {
      playSentence(current);
    }
  }, [playing, lesson, audioPlayer, current, playSentence]);

  const cycleSpeed = () => {
    const speeds = [0.25, 0.5, 0.75, 1.0, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  useEffect(() => {
    const load = async () => {
      // 1. Check bundled static lessons first (no network needed)
      const staticLesson = SHADOWING_LESSONS.find(l => l.id === lessonId);
      if (staticLesson) {
        setLesson(staticLesson);
        setLoading(false);
        return;
      }
      // 2. Fallback: try fetching user-created video from API
      try {
        const data = await shadowingApi.getVideoById(lessonId);
        setLesson(data);
      } catch {
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const youtubeId = lesson?.youtubeVideoId;
  const showDictation = mode === 'dictation';
  const progressPercent = current ? Math.max(0, Math.min(100, ((currentTime - current.audioStart) / ((current.audioEnd - current.audioStart) || 1)) * 100)) : 0;

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
                  if (state === 'ended' || state === 'paused') {
                    setPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                  }
                }}
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
              <Text style={styles.videoPlaceholderText}>{lesson?.audioUrl ? 'Audio Lesson' : 'No media available'}</Text>
            </View>
          )}

          {/* Media Controls */}
          <View style={styles.mediaControls}>
            <TouchableOpacity 
              style={[styles.playBtn, playing && styles.playingBtn]} 
              onPress={togglePlay}
            >
              <Ionicons name={playing ? "pause" : "play"} size={20} color={playing ? "#fff" : COLORS.primary} />
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
                 <Text style={styles.currentTimeText}>{formatTimeStr(currentTime - (current?.audioStart || 0))}</Text>
                 <Text style={styles.durationText}> / {formatTimeStr((current?.audioEnd || 0) - (current?.audioStart || 0))}</Text>
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
                      audioRecorder.isRecording
                        ? stopShadowingRecording
                        : startShadowingRecording
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
  sliderWrapper: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 20, padding: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  progressContainer: { flex: 1, height: 24, justifyContent: 'center' },
  track: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.primary },
  timeContainer: { flexDirection: 'row', alignItems: 'center', minWidth: 60, justifyContent: 'flex-end' },
  currentTimeText: { fontFamily: FONTS.bold, fontSize: 12, color: '#374151', fontVariant: ['tabular-nums'] },
  durationText: { fontFamily: FONTS.bold, fontSize: 12, color: '#9CA3AF', fontVariant: ['tabular-nums'] },
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
  dictationInputCorrect: { borderColor: SUCCESS_COLOR, backgroundColor: '#F0FDF4' },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#F0FDF4', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  successText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: SUCCESS_COLOR },
  aiErrorBox: { backgroundColor: ERROR_COLOR + '18', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  aiErrorText: { fontSize: FONT_SIZES.sm, color: ERROR_COLOR, fontWeight: '600' },
  answerReveal: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SPACING.md },
  translateText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.xl, marginTop: SPACING.sm },
  prevBtn: { width: 48, height: 48, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.xl, alignItems: 'center' },
  nextBtnCompleted: { backgroundColor: SUCCESS_COLOR },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
  recordSection: { alignItems: 'center', marginVertical: SPACING.lg },
  recordBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  recordingActive: { backgroundColor: ERROR_COLOR, shadowColor: ERROR_COLOR },
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
