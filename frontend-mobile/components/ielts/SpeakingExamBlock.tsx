/**
 * SpeakingExamBlock — per-question voice recorder + text fallback
 *
 * Audio recording uses expo-audio.
 * After recording, audio is uploaded via ieltsExamsApi.uploadSpeakingAudio.
 * The returned URL is stored as the answer for AI grading.
 * Text input fallback is always available alongside.
 *
 * Requires permissions in app.json:  ios.infoPlist.NSMicrophoneUsageDescription
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useAudioRecorder, 
  useAudioRecorderState, 
  RecordingPresets, 
  requestRecordingPermissionsAsync, 
  setAudioModeAsync 
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpeakingPart {
  part_number?: number;
  topic?: string;
  cue_card?: string;
  questions?: Array<{ text?: string; question?: string }>;
}

interface Props {
  parts: SpeakingPart[];
  answers: Record<string, string>;
  onChange: (a: Record<string, string>) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PART_COLORS = ['#2563EB', '#059669', '#D97706'];

// ─── Sub-components ──────────────────────────────────────────────────────────

function RecordingTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return <Text style={rt.text}>{mm}:{ss}</Text>;
}
const rt = StyleSheet.create({
  text: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: '#ef4444', letterSpacing: 1 },
});

// ─── Voice Recorder per question ─────────────────────────────────────────────

interface RecorderProps {
  answerKey: string;
  answer: string;
  onAnswerChange: (text: string) => void;
  placeholder?: string;
}

function VoiceRecorder({ answerKey, answer, onAnswerChange, placeholder }: RecorderProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioUploaded, setAudioUploaded] = useState(false);

  const isRecording = recorderState.isRecording;
  const recordingSeconds = Math.round((recorderState.durationMillis || 0) / 1000);

  const startRecording = useCallback(async () => {
    try {
      setUploadError(null);
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setUploadError('Microphone permission denied. Please enable it in Settings.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setAudioUploaded(false);
    } catch (e) {
      setUploadError('Could not start recording. Please try again.');
    }
  }, [recorder]);

  const stopAndUpload = useCallback(async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;

      if (!uri) { setUploadError('Recording failed — no audio file.'); return; }

      setUploading(true);
      // Build multipart form data
      const filename = `speaking_${answerKey}_${Date.now()}.m4a`;
      const formData = new FormData();
      formData.append('audio', { uri, name: filename, type: 'audio/m4a' } as any);
      const { url } = await ieltsExamsApi.uploadSpeakingAudio(formData);
      onAnswerChange(url); // store URL as answer for AI grading
      setAudioUploaded(true);
    } catch (e) {
      setUploadError('Upload failed. You can still type your response below.');
    } finally {
      setUploading(false);
    }
  }, [recorder, answerKey, onAnswerChange]);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const isUrl = answer.startsWith('http');

  return (
    <View style={vr.container}>
      {/* Recording controls */}
      <View style={vr.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={[vr.recBtn, uploading && vr.recBtnDisabled]}
            onPress={startRecording}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={18} color="#fff" />
            <Text style={vr.recBtnText}>{audioUploaded ? 'Re-record' : 'Record'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={vr.stopBtn} onPress={stopAndUpload} activeOpacity={0.8}>
            <View style={vr.stopIcon} />
            <Text style={vr.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}

        {/* Status */}
        <View style={vr.statusArea}>
          {isRecording && (
            <View style={vr.recordingRow}>
              <View style={vr.recDot} />
              <Text style={vr.recordingLabel}>Recording</Text>
              <RecordingTimer seconds={recordingSeconds} />
            </View>
          )}
          {uploading && (
            <View style={vr.uploadRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={vr.uploadLabel}>Uploading…</Text>
            </View>
          )}
          {audioUploaded && !uploading && (
            <View style={vr.uploadedRow}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={vr.uploadedLabel}>Audio uploaded ✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* Error */}
      {uploadError && (
        <View style={vr.errorBox}>
          <Ionicons name="warning-outline" size={13} color="#ef4444" />
          <Text style={vr.errorText}>{uploadError}</Text>
        </View>
      )}

      {/* Text fallback (always shown — AI grades either URL or text) */}
      {!isUrl && (
        <>
          <Text style={vr.orLabel}>— or type your response —</Text>
          <TextInput
            style={vr.input}
            value={answer}
            onChangeText={onAnswerChange}
            placeholder={placeholder ?? 'Type your spoken response…'}
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
          />
          <Text style={vr.wordCount}>{wordCount} words</Text>
        </>
      )}
    </View>
  );
}

const vr = StyleSheet.create({
  container: { marginTop: SPACING.sm },
  controls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  recBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: '#ef4444', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 9,
  },
  recBtnDisabled: { opacity: 0.5 },
  recBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#1e293b', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: 9,
  },
  stopIcon: { width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 2 },
  stopBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  statusArea: { flex: 1 },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  recordingLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#ef4444' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  uploadLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  uploadedLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#22c55e' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: SPACING.sm },
  errorText: { flex: 1, fontSize: 11, color: '#ef4444', lineHeight: 16 },
  orLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginVertical: SPACING.sm },
  input: {
    minHeight: 90, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20,
  },
  wordCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
});

// ─── Preparation Timer (Part 2) ───────────────────────────────────────────────
function PreparationTimer({ seconds = 60 }: { seconds?: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  return (
    <View style={pt.container}>
      <Text style={pt.title}>Preparation Time</Text>
      <Text style={pt.time}>00:{String(timeLeft).padStart(2, '0')}</Text>
      {timeLeft > 0 && (
        <TouchableOpacity 
          style={pt.btn} 
          onPress={() => started ? setTimeLeft(0) : setStarted(true)}
          activeOpacity={0.8}
        >
          <Text style={pt.btnText}>{started ? 'Skip Prep' : 'Start 1 Min Prep'}</Text>
        </TouchableOpacity>
      )}
      {timeLeft === 0 && <Text style={{ color: '#16a34a', fontWeight: '700', marginTop: 4 }}>You should start speaking now!</Text>}
    </View>
  );
}

const pt = StyleSheet.create({
  container: { backgroundColor: '#EEF2FF', padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#C7D2FE' },
  title: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  time: { fontSize: 32, fontWeight: '900', color: COLORS.primary, marginBottom: 12, fontVariant: ['tabular-nums'] },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: 10, borderRadius: RADIUS.full },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpeakingExamBlock({ parts, answers, onChange }: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const currentPart = parts[activePartIdx];

  const getKey = (partIdx: number, qIdx: number) => `${partIdx}-${qIdx}`;

  const handleChange = useCallback((partIdx: number, qIdx: number, text: string) => {
    onChange({ ...answers, [getKey(partIdx, qIdx)]: text });
  }, [answers, onChange]);

  const answeredCount = Object.values(answers).filter(v => v.trim()).length;
  const totalQuestions = parts.reduce((sum, p) => {
    return sum + (p.questions?.length || (p.cue_card ? 1 : 0));
  }, 0);

  return (
    <View style={styles.container}>
      {/* Part tabs */}
      <View style={styles.tabs}>
        {parts.map((part, idx) => {
          const color = PART_COLORS[idx] || COLORS.primary;
          const active = activePartIdx === idx;
          const partQCount = part.questions?.length || (part.cue_card ? 1 : 0);
          const partAnswered = Array.from({ length: partQCount }, (_, qi) => answers[getKey(idx, qi)] || '').filter(v => v.trim()).length;
          const partDone = partQCount > 0 && partAnswered === partQCount;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, active && { borderBottomColor: color }]}
              onPress={() => setActivePartIdx(idx)}
              activeOpacity={0.8}
            >
              {partDone && <Text style={[styles.tabCheck, { color }]}>✓ </Text>}
              <Text style={[styles.tabLabel, active && { color }]}>
                Part {part.part_number || idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 20 }}>
        {/* Mic permission banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="mic" size={16} color="#7C3AED" />
          <Text style={styles.infoText}>
            Tap <Text style={{ fontWeight: '800' }}>Record</Text> to capture your spoken answer. Your audio is uploaded for AI grading. You can also type if preferred.
          </Text>
        </View>

        {/* Part topic */}
        {currentPart?.topic && (
          <View style={styles.topicBox}>
            <Text style={styles.topicLabel}>Topic</Text>
            <Text style={styles.topicText}>{currentPart.topic}</Text>
          </View>
        )}

        {/* Cue card (Part 2) */}
        {currentPart?.cue_card && (
          <View style={styles.cueCard}>
            <PreparationTimer seconds={60} />
            <Text style={styles.cueCardLabel}>Cue Card (Topic)</Text>
            <Text style={styles.cueCardText}>{currentPart.cue_card}</Text>
            <VoiceRecorder
              answerKey={getKey(activePartIdx, 0)}
              answer={answers[getKey(activePartIdx, 0)] || ''}
              onAnswerChange={t => handleChange(activePartIdx, 0, t)}
              placeholder="Describe the topic on the cue card…"
            />
          </View>
        )}

        {/* Questions (Part 1 & 3) */}
        {currentPart?.questions?.map((q, qIdx) => {
          const key = getKey(activePartIdx, qIdx);
          return (
            <View key={key} style={styles.questionBlock}>
              <Text style={styles.questionNumber}>Q{qIdx + 1}</Text>
              <Text style={styles.questionText}>{q.text || q.question}</Text>
              <VoiceRecorder
                answerKey={key}
                answer={answers[key] || ''}
                onAnswerChange={t => handleChange(activePartIdx, qIdx, t)}
                placeholder="Answer this question in spoken English…"
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Progress */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>{answeredCount}/{totalQuestions} answered</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabCheck: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: '#F5F3FF', borderRadius: RADIUS.md, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: '#7C3AED', marginBottom: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#5B21B6', lineHeight: 18 },
  topicBox: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  topicLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  topicText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
  cueCard: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#FDE68A',
  },
  cueCardLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  cueCardText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.md },
  questionBlock: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  questionNumber: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  questionText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.sm },
  progressBar: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
