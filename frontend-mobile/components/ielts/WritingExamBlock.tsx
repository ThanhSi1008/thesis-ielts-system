import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  PanResponder,
  Animated,
} from 'react-native';
import { SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
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

function WritingExamBlock({ tasks, answers, onChange }: Props) {
  const { colors, isDark } = useTheme();
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
        const newHeight = Math.max(10, promptHeightRef.current + gestureState.dy);
        // Cap max height to avoid squeezing the keyboard out entirely
        const cappedHeight = Math.min(newHeight, 500);
        setPromptHeight(cappedHeight);
      },
    }),
  ).current;

  const task1 = tasks.find((t) => t.task_number === 1);
  const task2 = tasks.find((t) => t.task_number === 2);
  const current = activeTask === 1 ? task1 : task2;
  const currentValue = activeTask === 1 ? answers.task1 : answers.task2;
  const wordCount = countWords(currentValue);
  const minWords = current?.min_words || DEFAULT_MIN_WORDS[activeTask - 1];
  const meetsMin = wordCount >= minWords;

  const handleChange = (text: string) => {
    onChange(activeTask === 1 ? { ...answers, task1: text } : { ...answers, task2: text });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Task tabs */}
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {[1, 2].map((n) => {
          const val = n === 1 ? answers.task1 : answers.task2;
          const targetWords =
            tasks.find((t) => t.task_number === n)?.min_words || DEFAULT_MIN_WORDS[n - 1];
          const done = countWords(val) >= targetWords;
          return (
            <TouchableOpacity
              key={n}
              style={[
                styles.tab,
                activeTask === n && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTask(n)}
              activeOpacity={0.8}
            >
              {done && <Text style={[styles.tabCheck, { color: colors.success }]}>✓ </Text>}
              <Text
                style={[
                  styles.tabLabel,
                  { color: colors.textSecondary },
                  activeTask === n && [styles.tabLabelActive, { color: colors.primary }],
                ]}
              >
                Task {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Prompt */}
      {current && (
        <ScrollView
          style={[
            styles.promptScroll,
            { height: promptHeight, flex: undefined, backgroundColor: colors.card },
          ]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.promptBox, { backgroundColor: colors.surface }]}>
            {/* Instruction Banner */}
            <View
              style={[
                styles.instructionBanner,
                {
                  backgroundColor: isDark ? colors.infoBg : '#EEF2FF',
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.instructionText, { color: isDark ? colors.text : '#1E3A8A' }]}>
                You should spend about{' '}
                <Text style={{ fontWeight: '700' }}>
                  {current.time_advice || (activeTask === 1 ? '20' : '40')}
                </Text>{' '}
                minutes on this task.
                {'\n'}Write at least <Text style={{ fontWeight: '700' }}>{minWords}</Text> words.
              </Text>
            </View>

            {current.instruction && (
              <Text style={[styles.instructionPrompt, { color: colors.text }]}>
                {current.instruction}
              </Text>
            )}

            <Text style={[styles.taskType, { color: colors.primary }]}>
              {current.task_type || `Task ${current.task_number}`}
            </Text>
            <Text style={[styles.promptText, { color: colors.text }]}>{current.prompt}</Text>

            {/* Task 1 Image */}
            {current.image_url && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.imageScroll, { backgroundColor: colors.card }]}
              >
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
        <View
          style={[
            styles.dividerContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={[styles.dividerBar, { backgroundColor: isDark ? colors.border : '#cbd5e1' }]}
          >
            <Ionicons name="reorder-two" size={20} color={colors.textMuted} />
          </View>
        </View>
      )}

      {/* Essay input */}
      <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
        <TextInput
          style={[
            styles.essayInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          multiline
          autoCorrect={false}
          spellCheck={false}
          value={currentValue}
          onChangeText={handleChange}
          placeholder={`Write your Task ${activeTask} response here…`}
          placeholderTextColor={colors.textMuted}
          textAlignVertical="top"
        />
        {/* Word count progress */}
        <View style={styles.wordCountRow}>
          <Text
            style={[
              styles.wordCount,
              meetsMin ? { color: colors.success } : { color: colors.warning },
            ]}
          >
            {wordCount} words
          </Text>
          <Text style={[styles.wordCountTarget, { color: colors.textMuted }]}>min {minWords}</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((wordCount / minWords) * 100, 100)}%` as any,
                backgroundColor: meetsMin
                  ? colors.success
                  : wordCount > minWords * 0.7
                    ? colors.warning
                    : colors.primary,
              },
            ]}
          />
        </View>
        {meetsMin && (
          <Text style={[styles.wordCountDone, { color: colors.success }]}>
            ✓ Minimum word count met
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

export default React.memo(WritingExamBlock, (prev, next) => {
  return prev.tasks === next.tasks && prev.answers === next.answers;
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 90 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabLabelActive: {},
  tabCheck: { fontSize: FONT_SIZES.sm, color: '#16a34a', fontWeight: '700' },
  promptScroll: {},
  promptBox: { padding: SPACING.lg },
  taskType: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  promptText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  inputWrapper: { flex: 1, padding: SPACING.lg },
  essayInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  wordCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordCount: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  wordCountTarget: { fontSize: FONT_SIZES.xs },
  wordCountOk: { color: '#16a34a' },
  wordCountWarn: {},
  wordCountDone: {
    fontSize: FONT_SIZES.xs,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  instructionBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
  },
  instructionText: { fontSize: FONT_SIZES.xs, lineHeight: 18 },
  instructionPrompt: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  imageScroll: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  taskImage: { width: 500, height: 300 },
  dividerContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    cursor: 'ns-resize' as any,
  },
  dividerBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
