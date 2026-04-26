import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsProfileApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';

const TARGET_BANDS = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
const COMMITMENTS = [15, 30, 45, 60, 90, 120];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [targetBand, setTargetBand] = useState(6.5);
  const [commitment, setCommitment] = useState(30);
  const [examDate, setExamDate] = useState('');
  const [saving, setSaving] = useState(false);

  const STEPS = ['Target Band', 'Daily Commitment', 'Exam Date'];

  const handleFinish = async () => {
    setSaving(true);
    try {
      await ieltsProfileApi.create({
        targetBand,
        dailyCommitmentMins: commitment,
        examDate: examDate ? new Date(examDate).toISOString() : null,
        onboardingCompleted: true,
      });
      router.replace('/(tabs)/ielts' as any);
    } catch (e) {
      Alert.alert('Error', 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressDots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step 0: Target Band */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>What's your target IELTS band?</Text>
            <Text style={styles.stepSubtitle}>We'll personalize your study plan.</Text>
            <View style={styles.bandGrid}>
              {TARGET_BANDS.map(b => (
                <TouchableOpacity
                  key={b}
                  style={[styles.bandOption, targetBand === b && styles.bandOptionActive]}
                  onPress={() => setTargetBand(b)}
                >
                  <Text style={[styles.bandOptionText, targetBand === b && styles.bandOptionTextActive]}>
                    {b.toFixed(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Daily commitment */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>⏰</Text>
            <Text style={styles.stepTitle}>How long can you study daily?</Text>
            <Text style={styles.stepSubtitle}>Consistency beats intensity.</Text>
            {COMMITMENTS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.commitOption, commitment === c && styles.commitOptionActive]}
                onPress={() => setCommitment(c)}
              >
                <Text style={[styles.commitText, commitment === c && styles.commitTextActive]}>
                  {c >= 60 ? `${c / 60}h` : `${c} min`}
                </Text>
                {commitment === c && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Exam date */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📅</Text>
            <Text style={styles.stepTitle}>When is your exam?</Text>
            <Text style={styles.stepSubtitle}>Optional — helps track countdown.</Text>
            <TextInput
              style={styles.dateInput}
              value={examDate}
              onChangeText={setExamDate}
              placeholder="YYYY-MM-DD (e.g. 2025-06-15)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        )}
      </ScrollView>

      {/* Nav buttons */}
      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          {step < STEPS.length - 1 ? (
            <Button title="Next" onPress={() => setStep(s => s + 1)} fullWidth />
          ) : (
            <Button title="Get Started" onPress={handleFinish} loading={saving} fullWidth />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: SPACING.xl },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  scroll: { padding: SPACING.xl, paddingTop: SPACING.xxl },
  stepContent: { alignItems: 'center' },
  stepEmoji: { fontSize: 60, marginBottom: SPACING.lg },
  stepTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  stepSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xxl },
  bandGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  bandOption: { width: 64, height: 64, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  bandOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  bandOptionText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textSecondary },
  bandOptionTextActive: { color: '#fff' },
  commitOption: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 2, borderColor: COLORS.border, marginBottom: SPACING.sm, backgroundColor: COLORS.surface },
  commitOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  commitText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textSecondary },
  commitTextActive: { color: COLORS.primary },
  checkmark: { fontSize: 20, color: COLORS.primary, fontWeight: '800' },
  dateInput: { width: '100%', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.lg, fontSize: FONT_SIZES.lg, color: COLORS.text, textAlign: 'center' },
  navRow: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.xl, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  backBtn: { padding: SPACING.md + 2, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border },
  backBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONT_SIZES.md },
});
