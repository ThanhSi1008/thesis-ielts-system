/**
 * SpeakingExamBlock — Sequential Mobile Speaking Test Flow
 *
 * Implements:
 * 1. 7-state video-think-record machine per question
 * 2. Sequential "Next/Skip" navigation (no scrolling between questions)
 * 3. Part 2 Notes area during THINKING
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { ieltsExamsApi } from '@/services/ielts.api';
import SpeakingVideoPlayer from './SpeakingVideoPlayer';
import { RecordButton } from '../voice/RecordButton';
import { Waveform } from '../voice/Waveform';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpeakingQuestion {
  text?: string;
  question?: string;
  video?: string;
  video2?: string;
}

interface SpeakingPart {
  part_number?: number;
  topic?: string;
  cue_card?: string;
  video?: string;
  video2?: string;
  questions?: SpeakingQuestion[];
}

interface Props {
  parts: SpeakingPart[];
  answers: Record<string, string>;
  onChange: (a: Record<string, string>) => void;
  onSubmit: () => void; // Called when the final question is submitted
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PART_COLORS_LIGHT = ['#2563EB', '#059669', '#D97706'];
const PART_COLORS_DARK = ['#3B82F6', '#10B981', '#F59E0B'];

function getThinkTime(partNumber?: number) {
  return partNumber === 2 ? 60 : 2;
}

function getMaxRecordTime(partNumber?: number) {
  return partNumber === 2 ? 120 : 60;
}

// ─── Timer Components ────────────────────────────────────────────────────────

function RecordingTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <Text style={rt.text}>
      {mm}:{ss}
    </Text>
  );
}
const rt = StyleSheet.create({
  text: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: '#ef4444', letterSpacing: 1 },
});

function ThinkTimer({
  seconds,
  onDone,
  showSkip = false,
}: {
  seconds: number;
  onDone: () => void;
  showSkip?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const [left, setLeft] = useState(seconds);
  const doneCalledRef = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    doneCalledRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        onDone();
      }
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <View style={tt.container}>
      <View
        style={[
          tt.wrap,
          {
            backgroundColor: isDark ? colors.infoBg : '#EEF2FF',
            borderColor: isDark ? colors.border : '#C7D2FE',
          },
        ]}
      >
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[tt.label, { color: colors.primary }]}>Preparation Time</Text>
        <Text style={[tt.time, { color: colors.primary }]}>
          {mm}:{ss}
        </Text>
      </View>
      {showSkip && left > 0 && (
        <TouchableOpacity
          style={[tt.skipBtn, { backgroundColor: isDark ? colors.successBg : '#dcfce7' }]}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={[tt.skipText, { color: colors.success }]}>Start Speaking Now</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.success} />
        </TouchableOpacity>
      )}
    </View>
  );
}
const tt = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: SPACING.lg },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  time: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  skipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#16a34a' },
});

// ─── Metering Waveform (isolated so 100ms polling never re-renders the ScrollView) ──

function MeteringWaveform({ recorder }: { recorder: ReturnType<typeof useAudioRecorder> }) {
  const recorderState = useAudioRecorderState(recorder, 100);
  return <Waveform isRecording={true} metering={recorderState.metering ?? -160} />;
}

// ─── Recording Controller ─────────────────────────────────────────────────────
// Owns useAudioRecorder so that audio-session failure re-renders stay out of
// the parent ScrollView's render tree.

interface RecordingControllerProps {
  answerKey: string;
  partNumber: number;
  maxRecordTime: number;
  answer: string;
  currentStep: VoiceRecorderStep;
  isDisabled: boolean;
  onAnswerChange: (url: string) => void;
  onStepChange: (step: VoiceRecorderStep) => void;
}

const RecordingController = React.forwardRef<RecordingControllerHandle, RecordingControllerProps>(
  (
    {
      answerKey,
      partNumber,
      maxRecordTime,
      answer,
      currentStep,
      isDisabled,
      onAnswerChange,
      onStepChange,
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const recorder = useAudioRecorder({
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });
    const isDegradedRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [recordTimeElapsed, setRecordTimeElapsed] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const audioUploaded = answer.startsWith('http');
    const isRecording = currentStep === 'RECORDING';
    const isUploading = currentStep === 'UPLOADING';

    useEffect(() => {
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);

    const stopAndUpload = useCallback(async () => {
      try {
        if (timerRef.current) clearInterval(timerRef.current);
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
        const uri = recorder.uri;
        if (!uri) {
          setUploadError('No audio file.');
          onStepChange('RECORDED');
          return;
        }

        onStepChange('UPLOADING');

        const filename = `speaking_${answerKey}_${Date.now()}.m4a`;
        const formData = new FormData();
        formData.append('audio', { uri, name: filename, type: 'audio/m4a' } as any);

        const { url } = await ieltsExamsApi.uploadSpeakingAudio(formData);
        onAnswerChange(url);
        onStepChange('RECORDED');
      } catch {
        setUploadError('Upload failed. Tap Record to try again.');
        onStepChange('RECORDED');
      }
    }, [recorder, answerKey, onAnswerChange, onStepChange]);

    const start = useCallback(async () => {
      if (isDegradedRef.current) {
        setUploadError('Microphone unavailable on this device.');
        return;
      }
      try {
        setUploadError(null);
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          setUploadError('Microphone permission required.');
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecordTimeElapsed(0);
        onStepChange('RECORDING');

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordTimeElapsed((prev) => {
            if (prev >= maxRecordTime - 1) {
              stopAndUpload();
              return maxRecordTime;
            }
            return prev + 1;
          });
        }, 1000);
      } catch (e: any) {
        const msg = String(e?.message ?? e ?? '');
        // Error -50 = invalid param (iOS simulator has no real mic). Flag as
        // degraded so we never retry and perpetuate the failure loop.
        if (
          msg.includes('-50') ||
          msg.includes('ENODEV') ||
          msg.toLowerCase().includes('no device')
        ) {
          isDegradedRef.current = true;
        }
        setUploadError('Could not start recording.');
      }
    }, [recorder, maxRecordTime, onStepChange, stopAndUpload]);

    useImperativeHandle(ref, () => ({ start, stopAndUpload }), [start, stopAndUpload]);

    return (
      <View style={[aq.controlsPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={aq.statusArea}>
          {currentStep === 'PLAYING' || currentStep === 'PLAYING_2' ? (
            <Text style={[aq.statusText, { color: colors.textSecondary }]}>Listen to the examiner...</Text>
          ) : isRecording ? (
            <RecordingTimer seconds={recordTimeElapsed} />
          ) : isUploading ? (
            <View style={aq.recordStatus}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[aq.statusText, { color: colors.textSecondary }]}>Uploading audio...</Text>
            </View>
          ) : audioUploaded ? (
            <View style={aq.recordStatus}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[aq.statusText, { color: colors.success, fontWeight: '700' }]}>
                Audio saved
              </Text>
            </View>
          ) : uploadError ? (
            <Text style={[aq.statusText, { color: colors.error }]}>{uploadError}</Text>
          ) : (
            <Text style={[aq.statusText, { color: colors.textSecondary }]}>Tap mic to start recording</Text>
          )}
        </View>

        <RecordButton
          isRecording={isRecording}
          isDisabled={
            isDisabled || isUploading || currentStep === 'PLAYING' || currentStep === 'PLAYING_2'
          }
          onPress={isRecording ? stopAndUpload : start}
          size={48}
        />

        {isRecording && <MeteringWaveform recorder={recorder} />}
      </View>
    );
  },
);

// ─── Active Question View (VoiceRecorder + Notes) ────────────────────────────

type VoiceRecorderStep =
  | 'IDLE'
  | 'LISTEN_CAPTION'
  | 'PLAYING'
  | 'THINK_CAPTION'
  | 'THINKING'
  | 'PLAYING_2'
  | 'RECORDING'
  | 'UPLOADING'
  | 'RECORDED';

interface RecordingControllerHandle {
  start: () => Promise<void>;
  stopAndUpload: () => Promise<void>;
}

interface ActiveQuestionProps {
  questionText: string;
  videoUri?: string;
  video2Uri?: string;
  partNumber: number;
  answerKey: string;
  answer: string;
  onAnswerChange: (text: string) => void;
  isCueCard: boolean;
  onNext: () => void;
  onSkip: () => void;
  isLastQuestion: boolean;
}

function ActiveQuestionBlock({
  questionText,
  videoUri = '',
  video2Uri = '',
  partNumber,
  answerKey,
  answer,
  onAnswerChange,
  isCueCard,
  onNext,
  onSkip,
  isLastQuestion,
}: ActiveQuestionProps) {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const recorderRef = useRef<RecordingControllerHandle>(null);

  const [step, setStep] = useState<VoiceRecorderStep>('IDLE');
  const [notes, setNotes] = useState('');

  const maxRecordTime = getMaxRecordTime(partNumber);
  const thinkTime = getThinkTime(partNumber);
  const audioUploaded = answer.startsWith('http');

  // Auto-start video when component mounts
  useEffect(() => {
    if (videoUri && step === 'IDLE') {
      startPlaybackFlow();
    }
  }, [videoUri]);

  const startPlaybackFlow = useCallback(() => {
    setStep('LISTEN_CAPTION');
    setTimeout(() => setStep('PLAYING'), 2000);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (step === 'PLAYING') {
      setStep('THINK_CAPTION');
      setTimeout(() => setStep('THINKING'), 1500);
    } else if (step === 'PLAYING_2') {
      recorderRef.current?.start();
    }
  }, [step]);

  const handleThinkDone = useCallback(() => {
    if (video2Uri) {
      setStep('PLAYING_2');
    } else {
      recorderRef.current?.start();
    }
  }, [video2Uri]);

  const videoCaptionText =
    step === 'LISTEN_CAPTION'
      ? 'Listen to the question'
      : step === 'THINK_CAPTION'
        ? 'Time to think'
        : undefined;

  const activeVideoUri = step === 'PLAYING_2' ? video2Uri : videoUri || video2Uri;

  return (
    <View style={aq.container}>
      {/* Step-dependent media/timer — ABOVE ScrollView so layout shifts here
          never reset the scroll position of the question/controls below */}
      {(videoUri || video2Uri) && (
        <View style={aq.videoWrap}>
          <SpeakingVideoPlayer
            uri={activeVideoUri}
            playing={step === 'PLAYING' || step === 'PLAYING_2'}
            onEnded={handleVideoEnded}
            captionText={videoCaptionText}
          />
        </View>
      )}

      {step === 'THINKING' && (
        <ThinkTimer seconds={thinkTime} onDone={handleThinkDone} showSkip={isCueCard} />
      )}

      {isCueCard && step === 'THINKING' && (
        <View style={aq.notesWrap}>
          <Text style={[aq.notesLabel, { color: colors.textSecondary }]}>Your Notes (optional, not graded)</Text>
          <TextInput
            style={[
              aq.notesInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Type quick notes here..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Stable scroll area — question text + recording controls + nav.
          Content here never changes layout when step changes, so iOS will
          not reset the scroll offset on re-renders. */}
      <ScrollView
        ref={scrollRef}
        style={aq.scroll}
        contentContainerStyle={aq.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question Text / Cue Card */}
        <View
          style={[
            isCueCard ? aq.cueCard : aq.questionCard,
            isCueCard
              ? {
                  backgroundColor: isDark ? colors.warningBg : '#FFFBEB',
                  borderColor: isDark ? colors.border : '#FDE68A',
                }
              : {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
          ]}
        >
          {isCueCard && <Text style={[aq.cueLabel, { color: colors.warning }]}>Cue Card Topic</Text>}
          <Text style={[isCueCard ? aq.cueText : aq.questionText, { color: colors.text }]}>
            {questionText}
          </Text>
        </View>

        {/* Recording Controls — isolated component; useAudioRecorder lives here,
            so audio-session failure re-renders never propagate up to this ScrollView */}
        <RecordingController
          ref={recorderRef}
          answerKey={answerKey}
          partNumber={partNumber}
          maxRecordTime={maxRecordTime}
          answer={answer}
          currentStep={step}
          isDisabled={false}
          onAnswerChange={onAnswerChange}
          onStepChange={setStep}
        />

        {/* Navigation (Next / Skip) */}
        <View style={aq.navRow}>
          <TouchableOpacity style={aq.skipBtn} onPress={onSkip} activeOpacity={0.8}>
            <Text style={[aq.skipBtnText, { color: colors.textMuted }]}>Skip Question</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              aq.nextBtn,
              { backgroundColor: colors.success },
              (!audioUploaded || step === 'RECORDING' || step === 'UPLOADING') && { opacity: 0.5 },
            ]}
            onPress={onNext}
            disabled={!audioUploaded || step === 'RECORDING' || step === 'UPLOADING'}
            activeOpacity={0.8}
          >
            <Text style={aq.nextBtnText}>{isLastQuestion ? 'Submit Test' : 'Next Question'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
const aq = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, flexGrow: 1, paddingBottom: 100 },
  questionCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  questionText: { fontSize: FONT_SIZES.lg, fontWeight: '600', lineHeight: 26 },
  cueCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  cueLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cueText: { fontSize: FONT_SIZES.md, lineHeight: 24 },
  videoWrap: { marginBottom: SPACING.lg },
  notesWrap: { marginBottom: SPACING.lg },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 100,
    fontSize: FONT_SIZES.sm,
  },
  controlsPanel: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusArea: { alignItems: 'center' },
  statusText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  recordStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  skipBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
  nextBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});

// ─── Main Component ───────────────────────────────────────────────────────────

function SpeakingExamBlock({ parts, answers, onChange, onSubmit }: Props) {
  const { colors, isDark } = useTheme();
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeQIdx, setActiveQIdx] = useState(0);

  // Flatten questions list for sequential navigation
  const flatQuestions = useMemo(() => {
    const list: {
      partIdx: number;
      qIdx: number;
      part: SpeakingPart;
      questionText: string;
      videoUri?: string;
      video2Uri?: string;
      isCueCard: boolean;
    }[] = [];
    parts.forEach((part, pIdx) => {
      if (part.cue_card) {
        list.push({
          partIdx: pIdx,
          qIdx: 0,
          part,
          questionText: part.cue_card,
          videoUri: part.video,
          video2Uri: part.video2,
          isCueCard: true,
        });
      } else if (part.questions) {
        part.questions.forEach((q, qIdx) => {
          list.push({
            partIdx: pIdx,
            qIdx,
            part,
            questionText: q.text || q.question || '',
            videoUri: q.video,
            video2Uri: q.video2,
            isCueCard: false,
          });
        });
      }
    });
    return list;
  }, [parts]);

  // Sync active part tab with sequential flat index
  const currentFlatIdx = flatQuestions.findIndex(
    (q) => q.partIdx === activePartIdx && q.qIdx === activeQIdx,
  );

  const currentQ = flatQuestions[currentFlatIdx];
  const isLastQuestion = currentFlatIdx === flatQuestions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      onSubmit();
    } else {
      const nextQ = flatQuestions[currentFlatIdx + 1];
      setActivePartIdx(nextQ.partIdx);
      setActiveQIdx(nextQ.qIdx);
    }
  };

  const handleSkip = () => {
    handleNext(); // Skip acts exactly like next but bypasses validation
  };

  const handleAnswerChange = (text: string) => {
    if (!currentQ) return;
    const key = `${currentQ.partIdx}-${currentQ.qIdx}`;
    onChange({ ...answers, [key]: text });
  };

  const answerKey = currentQ ? `${currentQ.partIdx}-${currentQ.qIdx}` : '';

  if (!currentQ) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
    >
      {/* Part tabs (read-only indicator) */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {parts.map((part, idx) => {
          const color = isDark ? PART_COLORS_DARK[idx] : PART_COLORS_LIGHT[idx] || colors.primary;
          const active = activePartIdx === idx;
          return (
            <View key={idx} style={[styles.tab, active && { borderBottomColor: color }]}>
              <Text
                style={[
                  styles.tabLabel,
                  { color: colors.textSecondary },
                  active && { color },
                ]}
              >
                Part {part.part_number || idx + 1}
              </Text>
            </View>
          );
        })}
      </View>

      <ActiveQuestionBlock
        key={answerKey} // Force unmount/remount on question change
        questionText={currentQ.questionText}
        videoUri={currentQ.videoUri}
        video2Uri={currentQ.video2Uri}
        partNumber={currentQ.part.part_number || 1}
        answerKey={answerKey}
        answer={answers[answerKey] || ''}
        onAnswerChange={handleAnswerChange}
        isCueCard={currentQ.isCueCard}
        onNext={handleNext}
        onSkip={handleSkip}
        isLastQuestion={isLastQuestion}
      />
    </KeyboardAvoidingView>
  );
}

export default React.memo(SpeakingExamBlock, (prev, next) => {
  // Only re-render if parts or answers change.
  // We ignore onChange and onSubmit because they might be re-created on every render in the parent,
  // but their functionality remains the same.
  return prev.parts === next.parts && prev.answers === next.answers;
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 90 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
});
