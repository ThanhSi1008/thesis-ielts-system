import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONTS, SPACING, ROUTES, navigation } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, ScoreBadge, Text } from '@/components';
import { SharedDrawer } from '@/components/ui/SharedDrawer';
import { bandUtils } from '@/lib/bandCalculator';
import {
  ListeningTab,
  ReadingTab,
  WritingTab,
  SpeakingTab,
  BandStepper,
} from '@/components/ielts/CalculatorComponents';

const SK_COLOR: Record<string, string> = {
  listening: COLORS.skill.listening,
  reading: COLORS.skill.reading,
  writing: COLORS.skill.writing,
  speaking: COLORS.skill.speaking,
};

const SK_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  listening: 'headset',
  reading: 'book',
  writing: 'create',
  speaking: 'mic',
};

const SK_LABEL: Record<string, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};

const TABS = ['listening', 'reading', 'writing', 'speaking'];

const getBandLabel = (b: number) =>
  b >= 7 ? 'Good User' : b >= 5.5 ? 'Modest / Competent' : 'Limited or below';

export default function IELTSCalculatorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('listening');

  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -280,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (route: string) => {
    closeDrawer();
    if (route !== ROUTES.ieltsCalculator) {
      navigation.push(route);
    }
  };
  const [bands, setBands] = useState<Record<string, string>>({
    listening: '',
    reading: '',
    writing: '',
    speaking: '',
  });

  const allFilled = Object.values(bands).every((v) => v !== '');
  const overall = allFilled
    ? bandUtils.overall(
        Number(bands.listening),
        Number(bands.reading),
        Number(bands.writing),
        Number(bands.speaking),
      )
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* ── Theme-Aware Header ── */}
      <View
        style={{
          backgroundColor: colors.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu drawer"
          accessibilityHint="Double tap to open the navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.headerSubtitle}>IELTS · LEXON</Text>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: 18, marginTop: 1 }]}>Calculator</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overall Calculator Widget */}
        <Card
          variant="elevated"
          style={{ backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }}
        >
          <View style={styles.overallHeader}>
            <Ionicons name="calculator" size={16} color={colors.textSecondary} />
            <Text style={{ fontFamily: FONTS.bold, fontSize: 14, color: colors.text }}>
              Overall Band Calculator
            </Text>
          </View>

          <View style={styles.overallInputs}>
            {TABS.map((tab) => (
              <View key={tab} style={styles.overallInputCol}>
                <Text style={styles.overallInputLabel}>{SK_LABEL[tab]}</Text>
                <BandStepper
                  value={bands[tab]}
                  onChange={(v) => setBands((p) => ({ ...p, [tab]: v }))}
                  color={SK_COLOR[tab]}
                />
              </View>
            ))}
          </View>

          <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.resultCard}>
            <View>
              <Text style={styles.resultCardLabel}>ESTIMATED</Text>
              <Text style={styles.resultCardTitle}>Overall Band</Text>
              {allFilled && overall !== null && (
                <Text
                  style={[
                    styles.resultCardBadge,
                    { color: overall >= 6.5 ? '#10b981' : '#f59e0b' },
                  ]}
                >
                  {getBandLabel(overall)}
                </Text>
              )}
            </View>
            {overall !== null ? (
              <ScoreBadge band={overall} size="lg" variant="solid" />
            ) : (
              <Text style={styles.resultCardEmptyScore}>—</Text>
            )}
          </LinearGradient>
        </Card>

        {/* Tab Strip */}
        <View
          style={[
            styles.tabStrip,
            { backgroundColor: colors.surface === '#ffffff' ? '#e8e8e8' : '#27272a' },
          ]}
        >
          {TABS.map((tab) => {
            const on = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, on && { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name={SK_ICON[tab]}
                  size={14}
                  color={on ? SK_COLOR[tab] : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: colors.textSecondary },
                    on && { color: colors.text, fontFamily: FONTS.bold },
                  ]}
                >
                  {SK_LABEL[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {activeTab === 'listening' && <ListeningTab />}
          {activeTab === 'reading' && <ReadingTab />}
          {activeTab === 'writing' && <WritingTab />}
          {activeTab === 'speaking' && <SpeakingTab />}
        </Card>
      </ScrollView>
      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    letterSpacing: 1,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  overallHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  overallInputs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  overallInputCol: { width: '47%' },
  overallInputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  resultCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  resultCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  resultCardBadge: { fontFamily: FONTS.bold, fontSize: 11, marginTop: 6 },
  resultCardEmptyScore: { fontFamily: FONTS.bold, fontSize: 40, color: 'rgba(255,255,255,0.2)' },

  tabStrip: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 12,
  },
  tabBtnText: { fontSize: 11 },
});
