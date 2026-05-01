import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface WritingTask {
  task_number: number;
  task_type?: string;
  prompt: string;
}

interface Props {
  tasks: WritingTask[];
  answers: { task1: string; task2: string };
  onChange: (a: { task1: string; task2: string }) => void;
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const MIN_WORDS = [150, 250];

export default function WritingExamBlock({ tasks, answers, onChange }: Props) {
  const [activeTask, setActiveTask] = useState(1);

  const task1 = tasks.find(t => t.task_number === 1);
  const task2 = tasks.find(t => t.task_number === 2);
  const current = activeTask === 1 ? task1 : task2;
  const currentValue = activeTask === 1 ? answers.task1 : answers.task2;
  const wordCount = countWords(currentValue);
  const minWords = MIN_WORDS[activeTask - 1];
  const meetsMin = wordCount >= minWords;

  const handleChange = (text: string) => {
    onChange(activeTask === 1
      ? { ...answers, task1: text }
      : { ...answers, task2: text });
  };

  return (
    <View style={styles.container}>
      {/* Task tabs */}
      <View style={styles.tabs}>
        {[1, 2].map(n => {
          const val = n === 1 ? answers.task1 : answers.task2;
          const done = countWords(val) >= MIN_WORDS[n - 1];
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
        <ScrollView style={styles.promptScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <View style={styles.promptBox}>
            <Text style={styles.taskType}>{current.task_type || `Task ${current.task_number}`}</Text>
            <Text style={styles.promptText}>{current.prompt}</Text>
          </View>
        </ScrollView>
      )}

      {/* Essay input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.essayInput}
          multiline
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
    </View>
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
  promptScroll: { maxHeight: 200, borderBottomWidth: 1, borderColor: COLORS.border },
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
});
