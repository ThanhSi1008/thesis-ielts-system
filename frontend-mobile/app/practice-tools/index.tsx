import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, ROUTES, SPACING, RADIUS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PracticeToolsDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 16,
    },
    headerTitleWrap: {
      flex: 1,
    },
    eyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: colors.text,
      letterSpacing: -0.5,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    welcomeCard: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 28,
      overflow: 'hidden',
      position: 'relative',
    },
    welcomeGlow: {
      position: 'absolute',
      right: -50,
      top: -50,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255, 198, 0, 0.15)',
      filter: 'blur(30px)',
    },
    welcomeTitle: {
      fontFamily: FONTS.bold,
      fontSize: 20,
      color: '#0F172A',
      marginBottom: 8,
    },
    welcomeDesc: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: '#334155',
      lineHeight: 20,
    },
    sectionTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    cardsContainer: {
      gap: 20,
    },
    toolCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    cardContent: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    iconWrapper: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shadowingIcon: {
      backgroundColor: 'rgba(56, 189, 248, 0.12)', // sky blue light
    },
    dictationIcon: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)', // amber light
    },
    infoWrapper: {
      flex: 1,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    cardTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.text,
    },
    cardDesc: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    cardFooterText: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      color: COLORS.primary,
      marginRight: 4,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(ROUTES.ielts);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close"
            accessibilityHint="Close Practice Tools dashboard and return to IELTS screen"
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.eyebrow} allowFontScaling={true}>Lexon AI Suite</Text>
            <Text style={styles.headerTitle} allowFontScaling={true}>Practice Tools</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={['#FFD93D', '#FFC600']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
          accessible={true}
          accessibilityLabel="Interactive Training Lab. Elevate your IELTS listening and speaking performance. Pick a dedicated tool below to start practicing with dynamic feedback loop."
        >
          <View style={styles.welcomeGlow} />
          <Text style={styles.welcomeTitle} allowFontScaling={true}>Interactive Training Lab</Text>
          <Text style={styles.welcomeDesc} allowFontScaling={true}>
            Elevate your IELTS listening & speaking performance. Pick a dedicated tool below to
            start practicing with dynamic feedback loop.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionTitle} allowFontScaling={true}>Select Practice Module</Text>

        <View style={styles.cardsContainer}>
          {/* Shadowing Card */}
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => handlePress(ROUTES.practiceToolsShadowing)}
            activeOpacity={0.9}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Shadowing Practitioner, Enter Studio. Sharpen speaking pronunciation, speed, and accent by echoing native speakers with real-time AI phoneme analysis."
            accessibilityHint="Double tap to open shadowing lessons list"
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconWrapper, styles.shadowingIcon]}>
                <Ionicons name="mic-outline" size={26} color="#0284c7" />
              </View>
              <View style={styles.infoWrapper}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} allowFontScaling={true}>Shadowing Practitioner</Text>
                </View>
                <Text style={styles.cardDesc} allowFontScaling={true}>
                  Sharpen speaking pronunciation, speed, and accent by echoing native speakers with
                  real-time AI phoneme analysis.
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText} allowFontScaling={true}>Enter Studio</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Dictation Card */}
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => handlePress(ROUTES.practiceToolsDictation)}
            activeOpacity={0.9}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Dictation Lab, Start Practice. Improve listening comprehension, phonetic spelling, and grammar by writing down spoken sentences exactly as heard."
            accessibilityHint="Double tap to open dictation exercises"
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconWrapper, styles.dictationIcon]}>
                <Ionicons name="create-outline" size={26} color="#d97706" />
              </View>
              <View style={styles.infoWrapper}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} allowFontScaling={true}>Dictation Lab</Text>
                </View>
                <Text style={styles.cardDesc} allowFontScaling={true}>
                  Improve listening comprehension, phonetic spelling, and grammar by writing down
                  spoken sentences exactly as heard.
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText} allowFontScaling={true}>Start Practice</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
