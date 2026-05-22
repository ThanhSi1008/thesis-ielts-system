import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface AIGradingOverlayProps {
  onGoBack: () => void;
}

export function AIGradingOverlay({ onGoBack }: AIGradingOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color="#D51025" />
      </View>
      <Text style={styles.title}>Calculating your score…</Text>
      <Text style={styles.subtitle}>
        Our AI examiner is grading your responses.{'\n'}This may take a minute.
      </Text>
      <TouchableOpacity style={styles.backBtn} onPress={onGoBack}>
        <Ionicons name="arrow-back-outline" size={16} color="rgba(255,255,255,0.8)" />
        <Text style={styles.backBtnText}>Go back to mock tests</Text>
      </TouchableOpacity>
      <Text style={styles.note}>You'll be redirected automatically when done.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    zIndex: 200,
  },
  spinnerWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    color: '#fff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xxl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.md,
  },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: FONT_SIZES.sm },
  note: { color: 'rgba(255,255,255,0.25)', fontSize: FONT_SIZES.xs, textAlign: 'center' },
});
