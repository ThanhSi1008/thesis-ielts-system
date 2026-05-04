/**
 * SpeakingExamBlock — Sequential Mobile Speaking Test Flow
 * 
 * Implements:
 * 1. 7-state video-think-record machine per question
 * 2. Sequential "Next/Skip" navigation (no scrolling between questions)
 * 3. Part 2 Notes area during THINKING
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import SpeakingVideoPlayer from './SpeakingVideoPlayer';

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

const PART_COLORS = ['#2563EB', '#059669', '#D97706'];

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
  return <Text style={rt.text}>{mm}:{ss}</Text>;
}
const rt = StyleSheet.create({
  text: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: '#ef4444', letterSpacing: 1 },
});

function ThinkTimer({
  seconds,
  onDone,
  showSkip = false
}: {
  seconds: number;
  onDone: () => void;
  showSkip?: boolean;
}) {
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
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <View style={tt.container}>
      <View style={tt.wrap}>
        <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        <Text style={tt.label}>Preparation Time</Text>
        <Text style={tt.time}>{mm}:{ss}</Text>
      </View>
      {showSkip && left > 0 && (
        <TouchableOpacity style={tt.skipBtn} onPress={onDone} activeOpacity={0.8}>
          <Text style={tt.skipText}>Start Speaking Now</Text>
          <Ionicons name="arrow-forward" size={14} color="#16a34a" />
        </TouchableOpacity>
      )}
    </View>
  );
}
const tt = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: SPACING.lg },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEF2FF', paddingHorizontal: SPACING.lg,
    paddingVertical: 12, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '700' },
  time: {
    fontSize: FONT_SIZES.md, fontWeight: '900', color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 6,
    backgroundColor: '#dcfce7', borderRadius: RADIUS.full,
  },
  skipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#16a34a' }
});

// ─── Active Question View (VoiceRecorder + Notes) ────────────────────────────

type VoiceRecorderStep =
  | 'IDLE'
  | 'LISTEN_CAPTION'
  | 'PLAYING'
  | 'THINK_CAPTION'
  | 'THINKING'
  | 'PLAYING_2'
  | 'RECORDING'
  | 'RECORDED';

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
  isLastQuestion
}: ActiveQuestionProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);

  const [step, setStep] = useState<VoiceRecorderStep>('IDLE');
  const [recordTimeElapsed, setRecordTimeElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notes, setNotes] = useState(''); // Local state for Part 2 notes

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordTime = getMaxRecordTime(partNumber);
  const thinkTime = getThinkTime(partNumber);
  const audioUploaded = answer.startsWith('http');

  // Auto-start video when component mounts
  useEffect(() => {
    if (videoUri && step === 'IDLE') {
      startPlaybackFlow();
    }
  }, [videoUri]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startPlaybackFlow = useCallback(() => {
    setStep('LISTEN_CAPTION');
    setTimeout(() => setStep('PLAYING'), 2000);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (step === 'PLAYING') {
      setStep('THINK_CAPTION');
      setTimeout(() => setStep('THINKING'), 1500);
    } else if (step === 'PLAYING_2') {
      startRecording();
    }
  }, [step]);

  const handleThinkDone = useCallback(() => {
    if (video2Uri) {
      setStep('PLAYING_2');
    } else {
      startRecording();
    }
  }, [video2Uri]);

  const startRecording = useCallback(async () => {
    try {
      setUploadError(null);
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setUploadError('Microphone permission required.');
        setStep('IDLE');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordTimeElapsed(0);
      setStep('RECORDING');

      // Start elapsed timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordTimeElapsed(prev => {
          if (prev >= maxRecordTime - 1) {
            stopAndUpload();
            return maxRecordTime;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setUploadError('Could not start recording.');
      setStep('IDLE');
    }
  }, [recorder, maxRecordTime]);

  const stopAndUpload = useCallback(async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (!uri) { setUploadError('No audio file.'); return; }

      setUploading(true);
      setStep('RECORDED');
      
      const filename = `speaking_${answerKey}_${Date.now()}.m4a`;
      const formData = new FormData();
      formData.append('audio', { uri, name: filename, type: 'audio/m4a' } as any);
      
      const { url } = await ieltsExamsApi.uploadSpeakingAudio(formData);
      onAnswerChange(url);
    } catch {
      setUploadError('Upload failed. Tap Record to try again.');
      setStep('RECORDED');
    } finally {
      setUploading(false);
    }
  }, [recorder, answerKey, onAnswerChange]);

  const videoCaptionText =
    step === 'LISTEN_CAPTION' ? 'Listen to the question' :
    step === 'THINK_CAPTION' ? 'Time to think' : undefined;

  const activeVideoUri = step === 'PLAYING_2' ? video2Uri : (videoUri || video2Uri);

  return (
    <KeyboardAvoidingView 
      style={aq.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={aq.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question Text / Cue Card */}
        <View style={isCueCard ? aq.cueCard : aq.questionCard}>
          {isCueCard && <Text style={aq.cueLabel}>Cue Card Topic</Text>}
          <Text style={isCueCard ? aq.cueText : aq.questionText}>{questionText}</Text>
        </View>

        {/* Video Player */}
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

        {/* Think Timer (Visible during THINKING state) */}
        {step === 'THINKING' && (
          <ThinkTimer 
            seconds={thinkTime} 
            onDone={handleThinkDone} 
            showSkip={isCueCard} 
          />
        )}

        {/* Part 2 Notes Area (Visible during THINKING for Cue Card) */}
        {isCueCard && step === 'THINKING' && (
          <View style={aq.notesWrap}>
            <Text style={aq.notesLabel}>Your Notes (optional, not graded)</Text>
            <TextInput
              style={aq.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Type quick notes here..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Recording Status & Controls */}
        <View style={aq.controlsPanel}>
          <View style={aq.statusArea}>
            {step === 'PLAYING' || step === 'PLAYING_2' ? (
              <Text style={aq.statusText}>Listen to the examiner...</Text>
            ) : step === 'RECORDING' ? (
              <View style={aq.recordStatus}>
                <View style={aq.recDot} />
                <RecordingTimer seconds={recordTimeElapsed} />
              </View>
            ) : uploading ? (
              <View style={aq.recordStatus}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={aq.statusText}>Uploading audio...</Text>
              </View>
            ) : audioUploaded ? (
              <View style={aq.recordStatus}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={[aq.statusText, { color: '#22c55e', fontWeight: '700' }]}>Audio saved</Text>
              </View>
            ) : uploadError ? (
              <Text style={[aq.statusText, { color: '#ef4444' }]}>{uploadError}</Text>
            ) : (
              <Text style={aq.statusText}>Ready to record</Text>
            )}
          </View>

          {/* Action Buttons */}
          {step === 'RECORDING' ? (
            <TouchableOpacity style={aq.stopBtn} onPress={stopAndUpload} activeOpacity={0.8}>
              <View style={aq.stopIcon} />
              <Text style={aq.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[aq.recBtn, uploading && { opacity: 0.5 }]}
              onPress={startRecording}
              disabled={uploading || step === 'PLAYING' || step === 'PLAYING_2'}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={18} color="#fff" />
              <Text style={aq.recBtnText}>
                {audioUploaded ? 'Re-record' : step === 'THINKING' ? 'Record Now' : 'Record'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation (Next / Skip) */}
        <View style={aq.navRow}>
          <TouchableOpacity style={aq.skipBtn} onPress={onSkip} activeOpacity={0.8}>
            <Text style={aq.skipBtnText}>Skip Question</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[aq.nextBtn, (!audioUploaded || uploading) && { opacity: 0.5 }]}
            onPress={onNext}
            disabled={!audioUploaded || uploading}
            activeOpacity={0.8}
          >
            <Text style={aq.nextBtnText}>{isLastQuestion ? 'Submit Test' : 'Next Question'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const aq = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, flexGrow: 1, paddingBottom: 100 },
  questionCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  questionText: { fontSize: FONT_SIZES.lg, color: COLORS.text, fontWeight: '600', lineHeight: 26 },
  cueCard: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#FDE68A',
  },
  cueLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#D97706', textTransform: 'uppercase', marginBottom: 8 },
  cueText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 24 },
  videoWrap: { marginBottom: SPACING.lg },
  notesWrap: { marginBottom: SPACING.lg },
  notesLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  notesInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, height: 100, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  controlsPanel: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  statusArea: { flex: 1 },
  statusText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  recordStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  recBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 10,
  },
  recBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1e293b', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl, paddingVertical: 10,
  },
  stopIcon: { width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: 2 },
  stopBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  skipBtnText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#10b981', paddingHorizontal: SPACING.xl, paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
  nextBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});


// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpeakingExamBlock({ parts, answers, onChange, onSubmit }: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeQIdx, setActiveQIdx] = useState(0);

  // Flatten questions list for sequential navigation
  const flatQuestions = useMemo(() => {
    const list: { partIdx: number, qIdx: number, part: SpeakingPart, questionText: string, videoUri?: string, video2Uri?: string, isCueCard: boolean }[] = [];
    parts.forEach((part, pIdx) => {
      if (part.cue_card) {
        list.push({
          partIdx: pIdx, qIdx: 0, part,
          questionText: part.cue_card,
          videoUri: part.video,
          video2Uri: part.video2,
          isCueCard: true
        });
      } else if (part.questions) {
        part.questions.forEach((q, qIdx) => {
          list.push({
            partIdx: pIdx, qIdx, part,
            questionText: q.text || q.question || '',
            videoUri: q.video,
            video2Uri: q.video2,
            isCueCard: false
          });
        });
      }
    });
    return list;
  }, [parts]);

  // Sync active part tab with sequential flat index
  const currentFlatIdx = flatQuestions.findIndex(
    q => q.partIdx === activePartIdx && q.qIdx === activeQIdx
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
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Part tabs (read-only indicator) */}
      <View style={styles.tabs}>
        {parts.map((part, idx) => {
          const color = PART_COLORS[idx] || COLORS.primary;
          const active = activePartIdx === idx;
          return (
            <View key={idx} style={[styles.tab, active && { borderBottomColor: color }]}>
              <Text style={[styles.tabLabel, active && { color }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
});
