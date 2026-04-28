import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Pressable, Dimensions, Modal as RNModal,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  Layout,
  LinearTransition
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '@/constants';
import { ieltsProfileApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';

const TARGET_BANDS = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const COMMITMENTS = [
  { value: 15, label: '15 min', sub: 'Light start', icon: 'leaf-outline' },
  { value: 30, label: '30 min', sub: 'Moderate', icon: 'bicycle-outline' },
  { value: 45, label: '45 min', sub: 'Focused', icon: 'book-outline' },
  { value: 60, label: '1h', sub: 'Intensive', icon: 'flame-outline' },
  { value: 90, label: '1.5h', sub: 'Ambitious', icon: 'rocket-outline' },
  { value: 120, label: '2h', sub: 'Hardcore', icon: 'trophy-outline' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [targetBand, setTargetBand] = useState(6.5);
  const [commitment, setCommitment] = useState(30);
  const [examDate, setExamDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dateSet, setDateSet] = useState(false);
  const [saving, setSaving] = useState(false);

  const STEPS = ['Target', 'Commitment', 'Timeline'];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s - 1);
  };

  const handleSelectBand = (b: number) => {
    Haptics.selectionAsync();
    setTargetBand(b);
  };

  const handleSelectCommitment = (c: number) => {
    Haptics.selectionAsync();
    setCommitment(c);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    try {
      // Dùng ieltsProfileApi.onboarding (POST) với đầy đủ các trường bắt buộc
      await ieltsProfileApi.onboarding({
        targetBand,
        dailyCommitmentMins: commitment,
        examDate: dateSet ? examDate.toISOString() : null,
        takePlacement: false, // Mặc định là không làm test đầu vào trong flow này
      });
      router.replace('/(tabs)/ielts' as any);
    } catch (e: any) {
      console.error('Onboarding Save Error:', e?.response?.data || e.message || e);
      Alert.alert('Error', 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress Pills */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {STEPS.map((_, i) => (
            <Animated.View 
              key={i} 
              layout={LinearTransition}
              style={[
                styles.progressPill, 
                i <= step && styles.pillActive,
                i === step && styles.pillCurrent
              ]} 
            />
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Animated.View 
          key={step}
          entering={FadeIn.duration(400).delay(100)}
          exiting={FadeOut.duration(300)}
        >
          {/* Step 0: Target Band */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set your target</Text>
              <Text style={styles.stepSubtitle}>We'll build a personalized roadmap to help you reach your goal.</Text>
              
              <View style={styles.bandGrid}>
                {TARGET_BANDS.map(b => {
                  const isActive = targetBand === b;
                  return (
                    <TouchableOpacity
                      key={b}
                      activeOpacity={0.7}
                      style={[styles.bandCard, isActive && styles.bandCardActive]}
                      onPress={() => handleSelectBand(b)}
                    >
                      <Text style={[styles.bandValue, isActive && styles.bandValueActive]}>
                        {b.toFixed(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 1: Daily commitment */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Daily dedication</Text>
              <Text style={styles.stepSubtitle}>How much time can you realistically invest in your future each day?</Text>
              
              <View style={styles.commitGrid}>
                {COMMITMENTS.map(item => {
                  const isActive = commitment === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      activeOpacity={0.7}
                      style={[styles.commitCard, isActive && styles.commitCardActive]}
                      onPress={() => handleSelectCommitment(item.value)}
                    >
                      <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                        <Ionicons 
                          name={item.icon as any} 
                          size={24} 
                          color={isActive ? '#fff' : COLORS.primary} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.commitLabel, isActive && styles.commitLabelActive]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.commitSub, isActive && styles.commitSubActive]}>
                          {item.sub}
                        </Text>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 2: Exam date */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Your deadline</Text>
              <Text style={styles.stepSubtitle}>Optional. We'll show a countdown to keep you motivated.</Text>
              
              <View style={styles.dateCardContainer}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.premiumDateCard,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                  ]}
                  onPress={() => setShowPicker(true)}
                >
                  <View style={styles.dateIconWrapper}>
                    <Ionicons name="calendar" size={32} color={COLORS.primary} />
                  </View>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Test Date</Text>
                    <Text style={styles.dateDisplay}>
                      {dateSet ? examDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Not scheduled yet'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </Pressable>

                {/* Nút bỏ qua đã được gỡ bỏ để tránh gây rối, người dùng chỉ cần nhấn Continue/Start ở dưới cùng */}
              </View>

              <RNModal
                visible={showPicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Exam Date</Text>
                      <TouchableOpacity onPress={() => setShowPicker(false)}>
                        <Text style={styles.modalDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={examDate}
                      mode="date"
                      display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (process.env.EXPO_OS === 'android') {
                          setShowPicker(false);
                        }
                        if (selectedDate) {
                          setExamDate(selectedDate);
                          setDateSet(true);
                          Haptics.selectionAsync();
                        }
                      }}
                    />
                  </View>
                </View>
              </RNModal>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modern Navigation Bar */}
      <View style={styles.footer}>
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Button 
              title={step === STEPS.length - 1 ? (saving ? 'Setting up...' : 'Start Training') : 'Continue'} 
              onPress={handleNext} 
              loading={saving}
              variant="primary"
              size="lg"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressContainer: { 
    flexDirection: 'row', 
    gap: 6,
    height: 6,
  },
  progressPill: { 
    flex: 1, 
    height: '100%', 
    borderRadius: 3, 
    backgroundColor: COLORS.border,
  },
  pillActive: { 
    backgroundColor: COLORS.primary + '40',
  },
  pillCurrent: {
    backgroundColor: COLORS.primary,
  },
  scroll: { 
    paddingHorizontal: SPACING.xl, 
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  stepContent: { 
    alignItems: 'flex-start',
  },
  stepTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: COLORS.text, 
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  stepSubtitle: { 
    fontSize: 17, 
    color: COLORS.textSecondary, 
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  
  // Band Grid
  bandGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
  },
  bandCard: { 
    width: (SCREEN_W - SPACING.xl * 2 - 24) / 3,
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    boxShadow: SHADOWS.sm,
  },
  bandCardActive: { 
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    boxShadow: SHADOWS.md,
  },
  bandValue: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: COLORS.text,
  },
  bandValueActive: { 
    color: COLORS.onPrimary,
  },

  // Commitment List
  commitGrid: {
    width: '100%',
    gap: 12,
  },
  commitCard: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.lg, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    backgroundColor: COLORS.background,
    borderCurve: 'continuous',
    boxShadow: SHADOWS.card,
    gap: SPACING.md,
  },
  commitCardActive: { 
    borderColor: COLORS.primary, 
    backgroundColor: COLORS.primary + '10',
    boxShadow: SHADOWS.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: COLORS.primary,
  },
  commitLabel: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.text,
  },
  commitLabelActive: { 
    color: COLORS.onPrimary,
  },
  commitSub: { 
    fontSize: 14, 
    color: COLORS.textMuted,
    marginTop: 2,
  },
  commitSubActive: {
    color: COLORS.textSecondary,
  },

  // Date Card
  dateCardContainer: {
    width: '100%',
  },
  premiumDateCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderCurve: 'continuous',
    boxShadow: SHADOWS.lg,
    gap: SPACING.lg,
  },
  dateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateDisplay: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 24,
  },
  skipDateBtn: {
    marginTop: 24,
    alignSelf: 'center',
  },
  skipDateText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xl + 10,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  navRow: { 
    flexDirection: 'row', 
    gap: SPACING.md, 
    alignItems: 'center',
  },
  backBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md, 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    gap: 4,
  },
  backBtnText: { 
    color: COLORS.textSecondary, 
    fontWeight: '700', 
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderCurve: 'continuous',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
