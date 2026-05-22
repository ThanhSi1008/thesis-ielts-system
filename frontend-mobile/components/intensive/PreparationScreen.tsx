import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface PreparationScreenProps {
  exam: any;
  onStartExam: () => void;
  onBack: () => void;
}

export function PreparationScreen({ exam, onStartExam, onBack }: PreparationScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = createPrepStyles(colors, isDark);

  const prepType: string = exam.type || 'LISTENING';
  const isSpeaking = prepType === 'SPEAKING';

  const videoId =
    prepType === 'READING'
      ? 'zectOHoEduM'
      : prepType === 'WRITING'
        ? 'ZU7RjBvAj2E'
        : prepType === 'SPEAKING'
          ? ''
          : 'UFjDeMuyPMs';

  const titleParts = (exam.title || '').split(' - ');
  const groupTitle = titleParts[0]?.trim() || exam.title;
  const testTitle = titleParts.slice(1).join(' - ').trim();

  const skillIcon =
    prepType === 'READING'
      ? 'book-outline'
      : prepType === 'WRITING'
        ? 'pencil-outline'
        : prepType === 'SPEAKING'
          ? 'mic-outline'
          : 'headset-outline';

  const questionsLabel = isSpeaking ? 'Structure' : prepType === 'WRITING' ? 'Tasks' : 'Questions';
  const questionsValue = isSpeaking
    ? '3 Parts · multiple questions'
    : prepType === 'WRITING'
      ? '2 tasks'
      : '40 questions';

  const noticeText = isSpeaking
    ? 'Make sure your microphone is connected and allowed. Speak clearly and at a natural pace.'
    : prepType === 'LISTENING'
      ? 'Make sure your headphones or speakers are on. Audio will play automatically when you start.'
      : 'Ensure you have a quiet environment and are ready to focus for the duration of the test.';

  const chips =
    prepType === 'WRITING'
      ? ['2 Tasks', '60 Minutes', 'Computer Based']
      : prepType === 'READING'
        ? ['3 Sections', '40 Questions', 'Computer Based']
        : ['4 Sections', '40 Questions', 'Computer Based'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.prepContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.prepHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onBack} style={styles.prepBack}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.prepHeaderTitle, { color: colors.text }]}>Exam Preparation</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.prepScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.prepTitleSection}>
            <View style={[styles.prepCamBadge, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="book-outline" size={12} color={colors.primary} />
              <Text style={[styles.prepCamBadgeText, { color: colors.primary }]}>Cambridge IELTS</Text>
            </View>
            <Text style={[styles.prepGroupTitle, { color: colors.text }]}>{groupTitle}</Text>
            {testTitle ? <Text style={[styles.prepTestTitle, { color: colors.textSecondary }]}>{testTitle}</Text> : null}
            <View style={styles.prepDecorRow}>
              <View style={[styles.prepDecorBar, { width: 40, backgroundColor: colors.primary }]} />
              <View style={[styles.prepDecorBar, { width: 12, backgroundColor: isDark ? colors.border : '#D1D5DB' }]} />
              <View style={[styles.prepDecorBar, { width: 12, backgroundColor: isDark ? colors.border + '60' : '#E5E7EB' }]} />
            </View>
          </View>

          <View style={[styles.prepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.prepCardLeft}>
              <Text style={[styles.prepSectionLabel, { color: colors.textSecondary }]}>Exam Details</Text>

              <View style={[styles.prepDetailRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.prepDetailIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="timer-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.prepDetailMeta, { color: colors.textSecondary }]}>Duration</Text>
                  <Text style={[styles.prepDetailValue, { color: colors.text }]}>{exam.duration ?? 60} minutes</Text>
                </View>
              </View>

              <View style={[styles.prepDetailRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.prepDetailIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={skillIcon as any} size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.prepDetailMeta, { color: colors.textSecondary }]}>Skill</Text>
                  <Text style={[styles.prepDetailValue, { color: colors.text }]}>
                    {prepType.charAt(0) + prepType.slice(1).toLowerCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.prepDetailRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.prepDetailIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.prepDetailMeta, { color: colors.textSecondary }]}>{questionsLabel}</Text>
                  <Text style={[styles.prepDetailValue, { color: colors.text }]}>{questionsValue}</Text>
                </View>
              </View>

              <View style={[styles.prepNoticeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.prepNoticeText, { color: colors.textSecondary }]}>{noticeText}</Text>
              </View>
            </View>

            <View style={[styles.prepCardDivider, { backgroundColor: colors.border }]} />

            <View style={styles.prepCardRight}>
              <View style={styles.prepVideoHeader}>
                <Ionicons name="play-circle-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.prepSectionLabel, { color: colors.textSecondary }]}>Test Instructions</Text>
              </View>

              {videoId ? (
                <>
                  <View style={[styles.prepVideoWrapper, { borderColor: colors.border }]}>
                    <WebView
                      style={styles.prepVideo}
                      source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
                      allowsFullscreenVideo
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                    />
                  </View>
                  <Text style={[styles.prepVideoCaption, { color: colors.textSecondary }]}>
                    Watch the full tutorial before attempting the test to familiarise yourself with the format.
                  </Text>
                </>
              ) : (
                <View style={styles.prepNoVideo}>
                  <Ionicons name="mic-outline" size={40} color={colors.textSecondary} />
                  <Text style={[styles.prepNoVideoText, { color: colors.textSecondary }]}>
                    Speaking test — use the device microphone during the exam.
                  </Text>
                </View>
              )}

              <View style={styles.prepChipRow}>
                {chips.map((chip) => (
                  <View key={chip} style={[styles.prepChip, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border }]}>
                    <Text style={[styles.prepChipText, { color: colors.textSecondary }]}>{chip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.prepFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.prepStartBtn} onPress={onStartExam} activeOpacity={0.85}>
            <Text style={[styles.prepStartBtnText, { color: '#fff' }]}>Start Test</Text>
            <View style={[styles.prepStartBtnIcon, { backgroundColor: '#fff' }]}>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createPrepStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  prepContainer: { flex: 1, backgroundColor: colors.background },
  prepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  prepBack: { padding: 4 },
  prepHeaderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: colors.text },
  prepScroll: { padding: SPACING.lg, paddingBottom: 120 },
  prepTitleSection: { alignItems: 'center', marginBottom: SPACING.xl },
  prepCamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: SPACING.md,
  },
  prepCamBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  prepGroupTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  prepTestTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  prepDecorRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.md, alignItems: 'center' },
  prepDecorBar: { height: 3, borderRadius: 99 },
  prepCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  prepCardLeft: { padding: SPACING.xl, gap: SPACING.md },
  prepCardDivider: { height: 1 },
  prepCardRight: { padding: SPACING.xl, gap: SPACING.md },
  prepSectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  prepDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
  },
  prepDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prepDetailMeta: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prepDetailValue: { fontSize: FONT_SIZES.md, fontWeight: '800', marginTop: 2 },
  prepNoticeBox: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
  },
  prepNoticeText: { fontSize: FONT_SIZES.sm, fontWeight: '500', lineHeight: 22 },
  prepVideoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  prepVideoWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  prepVideo: { flex: 1 },
  prepVideoCaption: {
    fontSize: FONT_SIZES.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  prepNoVideo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  prepNoVideoText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  prepChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  prepChip: {
    borderRadius: 99,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderWidth: 1,
  },
  prepChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  prepFooter: {
    padding: SPACING.xl,
    borderTopWidth: 1,
  },
  prepStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 99,
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    alignSelf: 'center',
    minWidth: 200,
  },
  prepStartBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingLeft: SPACING.sm,
  },
  prepStartBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
