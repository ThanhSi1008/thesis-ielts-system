import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  ScrollView,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGrading } from '@/contexts/GradingContext';
import { useTimer, useWritingAutosave } from '@/hooks';

import { useTheme } from '@/contexts/ThemeContext';

const MIN_TOP_HEIGHT = 150;
const MAX_TOP_HEIGHT = 500;

export default function AdvancedWritingPracticeScreen() {
  const router = useRouter();
  const { promptId } = useLocalSearchParams<{ promptId: string }>();
  const { isPremium } = useSubscription();
  const { submitAndTrack } = useGrading();
  const { colors, isDark } = useTheme();

  const [prompt, setPrompt] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Layout Height Split (Defaults to 280px top)
  const [topHeight, setTopHeight] = useState(280);
  const topHeightRef = useRef(topHeight);
  topHeightRef.current = topHeight;
  const startHeightRef = useRef(topHeight);

  // PanResponder to resize vertical layout split
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startHeightRef.current = topHeightRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = startHeightRef.current + gestureState.dy;
        if (newHeight >= MIN_TOP_HEIGHT && newHeight <= MAX_TOP_HEIGHT) {
          setTopHeight(newHeight);
        }
      },
    }),
  ).current;

  // Verify subscription status
  useEffect(() => {
    if (!isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium]);

  // Fetch or resume writing session
  useEffect(() => {
    if (!isPremium || !promptId) return;

    const initPractice = async () => {
      try {
        const res = await ieltsAdvancedApi.getWritingPrompt(promptId);
        setPrompt(res);

        if (res.activeSession) {
          setSessionId(res.activeSession.id);
          setEssay(res.activeSession.draftEssay || '');
        } else {
          const session = await ieltsAdvancedApi.createWritingSession(promptId);
          setSessionId(session.id);
          setEssay('');
        }
        setTimerRunning(true);
      } catch (err) {
        console.error('[WritingPractice] Failed to initialize:', err);
        Alert.alert('Error', 'Failed to load writing session. Please try again.', [
          { text: 'Go Back', onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    initPractice();
  }, [promptId, isPremium]);

  // Hook integrations
  const suggestedTime = prompt?.suggestedTime ?? (prompt?.taskType === 'TASK1' ? 20 : 40);
  const {
    elapsed,
    display: timerDisplay,
    remaining,
    isExpired,
  } = useTimer(suggestedTime * 60, timerRunning);
  const { lastSavedAt, isSaving, error: saveError } = useWritingAutosave(sessionId, essay);

  const isTimeCritical = isExpired || remaining < 120; // Highlight if expired or < 2 min left

  // Word count helper
  const wordCount = useMemo(() => {
    const clean = essay.trim();
    if (!clean) return 0;
    return clean.split(/\s+/).length;
  }, [essay]);

  const targetWords = prompt?.minimumWords ?? (prompt?.taskType === 'TASK1' ? 150 : 250);
  const isWordCountMet = wordCount >= targetWords;

  const handleSubmit = async () => {
    if (!sessionId) return;
    setShowSubmitModal(false);
    setIsSubmitting(true);
    setTimerRunning(false);

    try {
      await submitAndTrack({
        sessionId,
        examType: 'WRITING',
        answers: essay,
        timeTaken: elapsed,
        resultUrl: `/ielts/advanced/writing/result/${sessionId}`,
      });
      // Replace practice with results screen immediately
      router.replace(`/ielts/advanced/writing/result/${sessionId}`);
    } catch (err: any) {
      console.error('[WritingPractice] Submit failed:', err);
      Alert.alert(
        'Submit Failed',
        err?.message ?? 'Could not submit your essay. Please try again.',
      );
      setTimerRunning(true);
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: SPACING.md,
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    errorText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: colors.error,
      textAlign: 'center',
    },
    backBtnText: {
      marginTop: SPACING.md,
      padding: SPACING.sm,
    },
    header: {
      backgroundColor: isDark ? colors.card : COLORS.skill.writing,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      flex: 1,
      marginLeft: SPACING.sm,
    },
    headerTitle: {
      color: isDark ? colors.text : '#fff',
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
    },
    headerSubtitle: {
      color: isDark ? colors.textSecondary : 'rgba(255, 255, 255, 0.8)',
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      gap: 4,
    },
    timerContainerCritical: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : COLORS.errorScale[50],
      borderWidth: 1,
      borderColor: colors.error,
    },
    timerText: {
      color: isDark ? colors.text : '#fff',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
    },
    timerTextCritical: {
      color: colors.error,
    },
    keyboardView: {
      flex: 1,
    },
    promptPane: {
      backgroundColor: colors.background,
    },
    promptScrollContent: {
      padding: SPACING.md,
    },
    promptImage: {
      width: '100%',
      height: 180,
      marginBottom: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: isDark ? colors.card : '#fff',
      borderWidth: 1,
      borderColor: colors.border,
    },
    resizerBar: {
      height: 10,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resizerGrabLine: {
      width: 40,
      height: 4,
      borderRadius: RADIUS.full,
      backgroundColor: colors.textMuted,
    },
    editorPane: {
      flex: 1,
      backgroundColor: colors.card,
    },
    editorToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    autosaveContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    autosaveText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
    },
    wordCounter: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    wordCountText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.xs,
    },
    wordCountMet: {
      color: colors.success,
    },
    wordCountUnmet: {
      color: colors.warning,
    },
    textInput: {
      flex: 1,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      padding: SPACING.md,
      lineHeight: 20,
    },
    bottomBar: {
      padding: SPACING.md,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      gap: SPACING.xs,
      boxShadow: SHADOWS.sm,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: '#212529',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    modalContainer: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.xl,
      boxShadow: SHADOWS.modal,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: SPACING.md,
      gap: SPACING.xs,
    },
    modalTitle: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.lg,
      color: colors.text,
      marginTop: SPACING.xs,
    },
    modalBody: {
      marginBottom: SPACING.xl,
    },
    modalDesc: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SPACING.md,
    },
    warningBox: {
      flexDirection: 'row',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      gap: SPACING.sm,
      alignItems: 'flex-start',
    },
    warningBoxSuccess: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : COLORS.successScale[50],
    },
    warningBoxAlert: {
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : COLORS.warningScale[50],
    },
    warningText: {
      flex: 1,
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    modalCancelBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    modalCancelText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    modalConfirmBtn: {
      flex: 1,
      backgroundColor: COLORS.skill.writing,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
    },
    modalConfirmText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.sm,
      color: '#fff',
    },
    submittingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
    },
    submittingText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: COLORS.skill.writing,
    },
  });

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          fontFamily: FONTS.medium,
          fontSize: FONT_SIZES.sm,
          color: colors.text,
          lineHeight: 20,
        },
        strong: {
          fontFamily: FONTS.bold,
          fontWeight: '700',
          color: colors.text,
        },
        em: {
          fontStyle: 'italic',
          color: colors.text,
        },
        paragraph: {
          marginBottom: SPACING.sm,
          color: colors.text,
        },
        list_item: {
          flexDirection: 'row',
          marginBottom: 4,
          color: colors.text,
        },
        bullet_list: {
          marginTop: 4,
          marginBottom: 8,
          color: colors.text,
        },
      }),
    [colors],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.skill.writing} />
        <Text style={styles.loadingText}>Initializing practice room...</Text>
      </View>
    );
  }

  if (!prompt) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Writing prompt not found.</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.back()}>
          <Text style={{ color: COLORS.skill.writing }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{prompt.taskType} Practice</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {prompt.title}
          </Text>
        </View>
        <View style={[styles.timerContainer, isTimeCritical && styles.timerContainerCritical]}>
          <Ionicons
            name="time-outline"
            size={16}
            color={isTimeCritical ? colors.error : isDark ? colors.text : '#fff'}
          />
          <Text style={[styles.timerText, isTimeCritical && styles.timerTextCritical]}>
            {timerDisplay}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Top Pane: Prompt Details */}
        <View style={[styles.promptPane, { height: topHeight }]}>
          <ScrollView
            showsVerticalScrollIndicator
            contentContainerStyle={styles.promptScrollContent}
          >
            {prompt.imageUrl && (
              <Image
                source={{ uri: prompt.imageUrl }}
                style={styles.promptImage as any}
                resizeMode="contain"
              />
            )}
            <Markdown style={markdownStyles}>{prompt.promptText}</Markdown>
          </ScrollView>
        </View>

        {/* Drag Resizer Bar */}
        <View style={styles.resizerBar} {...panResponder.panHandlers}>
          <View style={styles.resizerGrabLine} />
        </View>

        {/* Bottom Pane: Editor & Toolbar */}
        <View style={styles.editorPane}>
          {/* Editor Toolbar */}
          <View style={styles.editorToolbar}>
            <View style={styles.autosaveContainer}>
              {isSaving ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.skill.writing}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.autosaveText}>Saving...</Text>
                </>
              ) : saveError ? (
                <>
                  <Ionicons name="cloud-offline" size={14} color={colors.error} />
                  <Text style={[styles.autosaveText, { color: colors.error }]}>Save failed</Text>
                </>
              ) : lastSavedAt ? (
                <>
                  <Ionicons name="checkmark-done" size={14} color={colors.success} />
                  <Text style={styles.autosaveText}>Saved at {lastSavedAt}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.autosaveText}>Autosave active</Text>
                </>
              )}
            </View>

            <View style={styles.wordCounter}>
              <Text
                style={[
                  styles.wordCountText,
                  isWordCountMet ? styles.wordCountMet : styles.wordCountUnmet,
                ]}
              >
                {wordCount} / {targetWords} words
              </Text>
            </View>
          </View>

          {/* Editor TextInput */}
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your essay here... Use appropriate academic vocabulary and paragraph structures."
            placeholderTextColor={isDark ? colors.textSecondary : COLORS.textMuted}
            value={essay}
            onChangeText={setEssay}
            textAlignVertical="top"
            scrollEnabled
            autoCapitalize="sentences"
            autoCorrect
          />

          {/* Bottom Action Section */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.submitBtn, essay.trim().length === 0 && styles.submitBtnDisabled]}
              onPress={() => setShowSubmitModal(true)}
              disabled={essay.trim().length === 0}
            >
              <Text style={styles.submitBtnText}>Submit Essay</Text>
              <Ionicons name="arrow-forward" size={16} color="#212529" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Submission Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-circle" size={42} color={COLORS.skill.writing} />
              <Text style={styles.modalTitle}>Submit Your Essay?</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Are you ready to submit your writing session for AI grading?
              </Text>

              {/* Word count warning indicator */}
              <View
                style={[
                  styles.warningBox,
                  isWordCountMet ? styles.warningBoxSuccess : styles.warningBoxAlert,
                ]}
              >
                <Ionicons
                  name={isWordCountMet ? 'checkmark-circle' : 'warning'}
                  size={20}
                  color={isWordCountMet ? colors.success : colors.warning}
                />
                <Text style={styles.warningText}>
                  {isWordCountMet
                    ? `Great job! You have written ${wordCount} words, satisfying the minimum length.`
                    : `You have written only ${wordCount} words. Underlength essays (< ${targetWords} words) are penalized in IELTS band scoring.`}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSubmit}>
                <Text style={styles.modalConfirmText}>Grade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full screen loader during submission */}
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color={COLORS.skill.writing} />
          <Text style={styles.submittingText}>Submitting essay for evaluation...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
