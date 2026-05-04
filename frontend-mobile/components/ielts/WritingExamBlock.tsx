import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Image, PanResponder, Animated
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

interface WritingTask {
  task_number: number;
  task_type?: string;
  prompt: string;
  image_url?: string;
  time_advice?: string;
  instruction?: string;
  min_words?: number;
}

interface Props {
  tasks: WritingTask[];
  answers: { task1: string; task2: string };
  onChange: (a: { task1: string; task2: string }) => void;
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const DEFAULT_MIN_WORDS = [150, 250];

export default function WritingExamBlock({ tasks, answers, onChange }: Props) {
  const [activeTask, setActiveTask] = useState(1);
  const [promptHeight, setPromptHeight] = useState(250);
  const promptHeightRef = React.useRef(250);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        promptHeightRef.current = promptHeight;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Adjust prompt height based on drag distance (dy)
        const newHeight = Math.max(100, promptHeightRef.current + gestureState.dy);
        // Cap max height to avoid squeezing the keyboard out entirely
        const cappedHeight = Math.min(newHeight, 500); 
        setPromptHeight(cappedHeight);
      },
    })
  ).current;

  const task1 = tasks.find(t => t.task_number === 1);
  const task2 = tasks.find(t => t.task_number === 2);
  const current = activeTask === 1 ? task1 : task2;
  const currentValue = activeTask === 1 ? answers.task1 : answers.task2;
  const wordCount = countWords(currentValue);
  const minWords = current?.min_words || DEFAULT_MIN_WORDS[activeTask - 1];
  const meetsMin = wordCount >= minWords;

  const handleChange = (text: string) => {
    onChange(activeTask === 1
      ? { ...answers, task1: text }
      : { ...answers, task2: text });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Task tabs */}
      <View style={styles.tabs}>
        {[1, 2].map(n => {
          const val = n === 1 ? answers.task1 : answers.task2;
          const targetWords = tasks.find(t => t.task_number === n)?.min_words || DEFAULT_MIN_WORDS[n - 1];
          const done = countWords(val) >= targetWords;
          return (
            <TouchableOpacity
              key={n}
              style={[styles.tab, activeTask === n && styles.tabActive]}
              onPress={() => setActiveTask(n)}
              activeOpacity={0.8}
            >
              {done && <Text style={styles.tabCheck}>✓ </Text>}
              <Text style={[styles.tabLabel, activeTask === n && styles.tabLabelActive]}>
                Task {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Prompt */}
      {current && (
        <ScrollView 
          style={[styles.promptScroll, { height: promptHeight, flex: undefined }]} 
          nestedScrollEnabled 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.promptBox}>
            {/* Instruction Banner */}
            <View style={styles.instructionBanner}>
              <Text style={styles.instructionText}>
                You should spend about <Text style={{ fontWeight: '700' }}>{current.time_advice || (activeTask === 1 ? '20' : '40')}</Text> minutes on this task.
                {'\n'}Write at least <Text style={{ fontWeight: '700' }}>{minWords}</Text> words.
              </Text>
            </View>

            {current.instruction && (
              <Text style={styles.instructionPrompt}>{current.instruction}</Text>
            )}

            <Text style={styles.taskType}>{current.task_type || `Task ${current.task_number}`}</Text>
            <Text style={styles.promptText}>{current.prompt}</Text>
            
            {/* Task 1 Image */}
            {current.image_url && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                <Image 
                  source={{ uri: current.image_url }} 
                  style={styles.taskImage} 
                  resizeMode="contain"
                />
              </ScrollView>
            )}
          </View>
        </ScrollView>
      )}

      {/* Resizable Divider */}
      {current && (
        <View style={styles.dividerContainer} {...panResponder.panHandlers}>
          <View style={styles.dividerBar}>
            <Ionicons name="reorder-two" size={20} color={COLORS.textMuted} />
          </View>
        </View>
      )}

      {/* Essay input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.essayInput}
          multiline
          autoCorrect={false}
          spellCheck={false}
          value={currentValue}
          onChangeText={handleChange}
          placeholder={`Write your Task ${activeTask} response here…`}
          placeholderTextColor={COLORS.textMuted}
          textAlignVertical="top"
        />
        {/* Word count progress */}
        <View style={styles.wordCountRow}>
          <Text style={[styles.wordCount, meetsMin ? styles.wordCountOk : styles.wordCountWarn]}>
            {wordCount} words
          </Text>
          <Text style={styles.wordCountTarget}>min {minWords}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((wordCount / minWords) * 100, 100)}%` as any,
                backgroundColor: meetsMin ? '#16a34a' : wordCount > minWords * 0.7 ? '#D97706' : COLORS.primary,
              },
            ]}
          />
        </View>
        {meetsMin && (
          <Text style={styles.wordCountDone}>✓ Minimum word count met</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.primary },
  tabCheck: { fontSize: FONT_SIZES.sm, color: '#16a34a', fontWeight: '700' },
  promptScroll: { backgroundColor: '#fff' },
  promptBox: { padding: SPACING.lg, backgroundColor: COLORS.surface },
  taskType: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promptText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  inputWrapper: { flex: 1, padding: SPACING.lg },
  essayInput: {
    flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  wordCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  wordCount: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  wordCountTarget: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  wordCountOk: { color: '#16a34a' },
  wordCountWarn: { color: COLORS.warning },
  wordCountDone: { fontSize: FONT_SIZES.xs, color: '#16a34a', fontWeight: '600', marginTop: 4, textAlign: 'right' },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  instructionBanner: {
    backgroundColor: '#EEF2FF', padding: SPACING.md, borderRadius: RADIUS.md, 
    marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary
  },
  instructionText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, lineHeight: 18 },
  instructionPrompt: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontStyle: 'italic', marginBottom: SPACING.md },
  imageScroll: { marginTop: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: '#f8fafc', padding: SPACING.sm },
  taskImage: { width: 500, height: 300 }, // Scrollable fixed size for readability
  dividerContainer: {
    height: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    cursor: 'ns-resize' as any,
  },
  dividerBar: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
