import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

const ROADMAP_STEPS = [
  {
    id: 1, icon: '🎯', title: 'IELTS Onboarding',
    desc: 'Set your target band, daily commitment, and exam date.',
    route: '/ielts/onboarding', color: '#6366F1',
  },
  {
    id: 2, icon: '📚', title: 'Learn the Basics',
    desc: 'Study IELTS strategies for all 4 skills.',
    route: '/(tabs)', color: '#2563EB',
  },
  {
    id: 3, icon: '🎧', title: 'Advanced Practice',
    desc: 'Practice specific question types with Cambridge parts.',
    route: '/ielts/advanced', color: '#E11D48',
  },
  {
    id: 4, icon: '📝', title: 'Mock Tests',
    desc: 'Take full-length mock tests under timed conditions.',
    route: '/ielts/intensive', color: '#D97706',
  },
  {
    id: 5, icon: '📊', title: 'Review Statistics',
    desc: 'Track your band score trends and progress over time.',
    route: '/ielts/statistics', color: '#059669',
  },
  {
    id: 6, icon: '🏆', title: 'Achieve Your Target',
    desc: 'Consistent daily practice leads to IELTS success.',
    route: null, color: '#7C3AED',
  },
];

export default function RoadmapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IELTS Roadmap</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.subtitle}>Your personalized path to IELTS success</Text>

        {ROADMAP_STEPS.map((step, i) => (
          <View key={step.id} style={styles.stepContainer}>
            {/* Connector line */}
            {i < ROADMAP_STEPS.length - 1 && (
              <View style={[styles.connector, { backgroundColor: step.color + '40' }]} />
            )}

            <TouchableOpacity
              style={styles.stepCard}
              onPress={() => step.route && router.push(step.route as any)}
              activeOpacity={step.route ? 0.8 : 1}
            >
              {/* Step number + icon */}
              <View style={[styles.stepIcon, { backgroundColor: step.color + '15', borderColor: step.color }]}>
                <Text style={styles.stepEmoji}>{step.icon}</Text>
              </View>

              {/* Content */}
              <View style={styles.stepContent}>
                <View style={styles.stepTop}>
                  <Text style={[styles.stepNum, { color: step.color }]}>Step {step.id}</Text>
                  {step.route && <Ionicons name="chevron-forward" size={16} color={step.color} />}
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  scroll: { padding: SPACING.lg },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center' },
  stepContainer: { position: 'relative', marginBottom: SPACING.md },
  connector: { position: 'absolute', left: 36, top: 80, width: 3, height: SPACING.md + 8, zIndex: 0 },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepEmoji: { fontSize: 26 },
  stepContent: { flex: 1 },
  stepTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  stepNum: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  stepTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
