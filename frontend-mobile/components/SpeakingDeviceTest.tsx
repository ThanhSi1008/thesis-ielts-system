import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useAudioRecorder } from '@/hooks';

interface SpeakingDeviceTestProps {
  onComplete: () => void;
  onExit: () => void;
}

export function SpeakingDeviceTest({ onComplete, onExit }: SpeakingDeviceTestProps) {
  // --- Headphone Test State ---
  const [hasCompletedStep1, setHasCompletedStep1] = useState(false);
  const testAudioUrl =
    'https://res.cloudinary.com/dalaaegob/video/upload/v1774555714/changthevolume_cqpnwp.mp3';

  const headphonePlayer = useAudioPlayer(testAudioUrl);
  const headphoneStatus = useAudioPlayerStatus(headphonePlayer);

  // Monitor playback end
  useEffect(() => {
    if (headphoneStatus.duration > 0 && headphoneStatus.currentTime >= headphoneStatus.duration) {
      setHasCompletedStep1(true);
    }
  }, [headphoneStatus.currentTime, headphoneStatus.duration]);

  const handlePlayHeadphone = () => {
    if (headphonePlayer.playing) {
      headphonePlayer.pause();
    } else {
      headphonePlayer.play();
    }
  };

  // --- Microphone Test State ---
  const [hasCompletedStep2, setHasCompletedStep2] = useState(false);
  const [micState, setMicState] = useState<'IDLE' | 'RECORDING' | 'RECORDED' | 'PLAYING'>('IDLE');
  const [recordTime, setRecordTime] = useState(0);

  const recorder = useAudioRecorder();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // For playing back recorded audio
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const playbackPlayer = useAudioPlayer(playbackUri || '');
  const playbackStatus = useAudioPlayerStatus(playbackPlayer);

  // Watch playback finished
  useEffect(() => {
    if (
      micState === 'PLAYING' &&
      playbackStatus.duration > 0 &&
      playbackStatus.currentTime >= playbackStatus.duration
    ) {
      setMicState('RECORDED');
      setHasCompletedStep2(true);
    }
  }, [playbackStatus.currentTime, playbackStatus.duration, micState]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleMicAction = async () => {
    if (micState === 'IDLE') {
      // Start Recording
      try {
        setRecordTime(0);
        await recorder.startRecording();
        setMicState('RECORDING');

        timerRef.current = setInterval(() => {
          setRecordTime((prev) => {
            if (prev >= 10) {
              // Auto stop at 10s
              handleStopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } catch (err) {
        console.error('Mic error:', err);
        Alert.alert('Permission Denied', 'Microphone access is required to run the test.');
      }
    } else if (micState === 'RECORDING') {
      // Stop Recording
      await handleStopRecording();
    } else if (micState === 'RECORDED') {
      // Playback
      if (playbackUri) {
        setMicState('PLAYING');
        playbackPlayer.play();
      }
    } else if (micState === 'PLAYING') {
      // Stop Playback
      playbackPlayer.pause();
      playbackPlayer.seekTo(0);
      setMicState('RECORDED');
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const uri = await recorder.stopRecording();
    if (uri) {
      setPlaybackUri(uri);
      setMicState('RECORDED');
    } else {
      setMicState('IDLE');
    }
  };

  const handleRerecord = async () => {
    if (micState === 'PLAYING') {
      playbackPlayer.pause();
      playbackPlayer.seekTo(0);
    }
    await recorder.clearRecording();
    setPlaybackUri(null);
    setMicState('IDLE');
    setRecordTime(0);
    setHasCompletedStep2(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReady = async () => {
    try {
      await AsyncStorage.setItem('speaking-device-tested-v1', 'true');
      onComplete();
    } catch (e) {
      console.error('Failed to save device test flag', e);
      onComplete();
    }
  };

  const headphoneProgress =
    headphoneStatus.duration > 0 ? (headphoneStatus.currentTime / headphoneStatus.duration) * 100 : 0;
  const playbackProgress =
    playbackStatus.duration > 0 ? (playbackStatus.currentTime / playbackStatus.duration) * 100 : 0;

  const isHeadphoneLoading = headphoneStatus.isBuffering || !headphoneStatus.isLoaded;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>IELTS</Text>
          <Text style={styles.logoSubtext}>Advanced</Text>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitText}>Exit Test</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Device Test</Text>
          <Text style={styles.cardSubtitle}>Confirm your hardware is working properly before practicing.</Text>
        </View>

        <View style={styles.stepsContainer}>
          {/* Vertical Connecting Line */}
          <View style={styles.connectingLine} />

          {/* 1. Headphone Check */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconContainer, styles.activeStepBorder]}>
              <Ionicons name="headset-outline" size={20} color={COLORS.skill.speaking} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. Headphone check</Text>
              <Text style={styles.stepDescription}>
                Make sure your headphone's audio is good enough before taking the test. Please click on the play icon to check the sound quality.
              </Text>

              {/* Audio Playback Box */}
              <View style={styles.audioBox}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayHeadphone}
                  disabled={isHeadphoneLoading}
                >
                  {isHeadphoneLoading ? (
                    <ActivityIndicator size="small" color={COLORS.skill.speaking} />
                  ) : (
                    <Ionicons
                      name={headphonePlayer.playing ? 'pause' : 'play'}
                      size={18}
                      color={COLORS.skill.speaking}
                    />
                  )}
                </TouchableOpacity>

                <Text style={styles.timeLabel}>
                  {formatTime(Math.floor(headphoneStatus.currentTime))}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${headphoneProgress}%` }]} />
                  </View>
                </View>

                {headphoneStatus.duration > 0 && (
                  <Text style={styles.totalDuration}>
                    {formatTime(Math.floor(headphoneStatus.duration))}
                  </Text>
                )}
              </View>

              {!hasCompletedStep1 && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setHasCompletedStep1(true)}
                >
                  <Text style={styles.confirmButtonText}>I can hear it clearly</Text>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                </TouchableOpacity>
              )}

              {hasCompletedStep1 && (
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.successBadgeText}>Step 1 Complete</Text>
                </View>
              )}
            </View>
          </View>

          {/* 2. Microphone Check */}
          <View style={[styles.stepRow, !hasCompletedStep1 && styles.disabledStep]}>
            <View
              style={[
                styles.stepIconContainer,
                hasCompletedStep1 && styles.activeStepBorder,
                !hasCompletedStep1 && styles.disabledStepBorder,
              ]}
            >
              <Ionicons
                name="mic-outline"
                size={20}
                color={hasCompletedStep1 ? COLORS.skill.speaking : COLORS.textDisabled}
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, !hasCompletedStep1 && styles.disabledText]}>
                2. Microphone check
              </Text>
              <Text style={styles.stepDescription}>
                Make sure your microphone works well before taking the test. Record audio and play to go next.
              </Text>

              {hasCompletedStep1 && (
                <View style={styles.micCheckContainer}>
                  <Text style={styles.promptLabel}>Please read out loud:</Text>
                  <Text style={styles.promptQuote}>
                    "I love English. My English is great and I practice it everyday!"
                  </Text>

                  <View style={styles.recorderControls}>
                    {/* Record / Stop / Playback button */}
                    <TouchableOpacity
                      style={[
                        styles.recordActionBtn,
                        micState === 'RECORDING' && styles.recordingBtnActive,
                      ]}
                      onPress={handleMicAction}
                    >
                      <Ionicons
                        name={
                          micState === 'IDLE'
                            ? 'mic'
                            : micState === 'RECORDING'
                              ? 'square'
                              : micState === 'PLAYING'
                                ? 'square'
                                : 'play'
                        }
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.recordActionBtnText}>
                        {micState === 'IDLE'
                          ? 'RECORD'
                          : micState === 'RECORDING'
                            ? 'STOP'
                            : micState === 'PLAYING'
                              ? 'STOP'
                              : 'PLAY BACK'}
                      </Text>
                    </TouchableOpacity>

                    {/* Re-record button */}
                    <TouchableOpacity
                      style={styles.rerecordBtn}
                      onPress={handleRerecord}
                      disabled={micState === 'IDLE' || micState === 'RECORDING'}
                    >
                      <Ionicons
                        name="refresh"
                        size={18}
                        color={
                          micState === 'IDLE' || micState === 'RECORDING'
                            ? COLORS.textDisabled
                            : COLORS.textSecondary
                        }
                      />
                    </TouchableOpacity>

                    <Text style={styles.timerText}>{formatTime(recordTime)}</Text>

                    {/* Metering or waveform */}
                    <View style={styles.waveformContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width:
                                micState === 'RECORDING'
                                  ? `${(recordTime / 10) * 100}%`
                                  : `${playbackProgress}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {hasCompletedStep2 && (
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.successBadgeText}>Step 2 Complete</Text>
                </View>
              )}
            </View>
          </View>

          {/* 3. Waiting Room */}
          <View
            style={[
              styles.stepRow,
              (!hasCompletedStep1 || !hasCompletedStep2) && styles.disabledStep,
            ]}
          >
            <View
              style={[
                styles.stepIconContainer,
                hasCompletedStep2 && styles.activeStepBorder,
                !hasCompletedStep2 && styles.disabledStepBorder,
              ]}
            >
              <Ionicons
                name="hourglass-outline"
                size={20}
                color={hasCompletedStep2 ? COLORS.skill.speaking : COLORS.textDisabled}
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, !hasCompletedStep2 && styles.disabledText]}>
                3. Waiting room
              </Text>
              <Text style={styles.stepDescription}>
                You are in the waiting room now. The examiner will enter the meeting soon. Please wait for a while.
              </Text>

              {hasCompletedStep2 && (
                <TouchableOpacity
                  style={styles.readyButton}
                  onPress={handleReady}
                  activeOpacity={0.9}
                >
                  <Text style={styles.readyButtonText}>I'M READY</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.skill.speaking,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.md,
  },
  exitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
  },
  exitText: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.gray[900],
    marginBottom: 6,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  stepsContainer: {
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    left: 23,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: COLORS.gray[200],
    zIndex: 0,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: SPACING.xxl,
    zIndex: 1,
  },
  disabledStep: {
    opacity: 0.5,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepBorder: {
    borderColor: COLORS.skill.speaking,
  },
  disabledStepBorder: {
    borderColor: COLORS.gray[300],
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 6,
  },
  disabledText: {
    color: COLORS.textDisabled,
  },
  stepDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  audioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: 10,
    marginBottom: SPACING.md,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  timeLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.gray[600],
    minWidth: 36,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.skill.speaking,
    borderRadius: 3,
  },
  totalDuration: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.skill.speaking,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  confirmButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#fff',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.successScale[50],
    borderWidth: 1,
    borderColor: COLORS.successScale[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  successBadgeText: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.successScale[700],
  },
  micCheckContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    backgroundColor: '#fff',
    marginBottom: SPACING.md,
  },
  promptLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  promptQuote: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  recorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: 8,
  },
  recordActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.skill.speaking,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  recordingBtnActive: {
    backgroundColor: '#EF4444',
  },
  recordActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  rerecordBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.gray[700],
    minWidth: 36,
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.skill.speaking,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.skill.speaking,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: SPACING.sm,
  },
  readyButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 1,
  },
});
