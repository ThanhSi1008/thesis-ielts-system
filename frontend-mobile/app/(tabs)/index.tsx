import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Animated,
  DeviceEventEmitter,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { FONT_SIZES, RADIUS, SPACING, FONTS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles, useTabBarVisibility } from '@/hooks';
import type { ThemeTokens } from '@/constants';

export default function HomeTab() {
  const { width } = useWindowDimensions();
  const { unreadCount } = useNotification();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDark = colors.statusBar === 'light-content';
  const { handleScroll } = useTabBarVisibility();
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top on double tap active tab
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'index') {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      }
    );
    return () => listener.remove();
  }, []);

  // Animations
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createFloatAnim = (anim: Animated.Value, delay: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: duration, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: duration, useNativeDriver: true }),
        ]),
      );
    };

    createFloatAnim(floatAnim1, 0, 3000).start();
    createFloatAnim(floatAnim2, 500, 4000).start();
  }, [floatAnim1, floatAnim2]);

  const translateY1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.container}>
      {/* Background Image with Overlay */}
      {isDark ? (
        <>
          <Image
            source={{
              uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773916745/ca3ae396-1909-4543-b0d3-8a1c7424d3ce.png',
            }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </>
      ) : (
        <LinearGradient
          colors={[colors.bgSubtle, colors.background]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header / Notifications */}
        <View style={styles.headerArea}>
          <View style={{ flex: 1 }} />
          <Link href="/notification" asChild>
            <Pressable style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {/* Notification Badge */}
              {unreadCount > 0 && <View style={styles.notifBadge} />}
            </Pressable>
          </Link>
        </View>

        {/* Top Content Section */}
        <View style={styles.topSection}>
          {/* Hero Title */}
          <Text style={styles.title}>
            Master English{'\n'}
            Ace IELTS{'\n'}
            Smarter with{' '}
            <View style={styles.inlineIconWrapper}>
              <Text style={styles.titleHighlight}>AI</Text>
              <Animated.View style={{ transform: [{ translateY: translateY1 }] }}>
                <Ionicons
                  name="sparkles"
                  size={28}
                  color={colors.primary}
                  style={styles.sparkles}
                />
              </Animated.View>
            </View>
          </Text>

          <Text style={styles.subtitle}>
            An intelligent learning platform that helps you build vocabulary, improve speaking, and
            prepare for IELTS with personalized guidance
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Link href="/(tabs)/ielts" asChild>
              <Pressable style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}>
                <Text style={styles.btnPrimaryText}>START LEARNING</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Images & Interactive Cards Section */}
        <View style={[styles.visualSection, { height: width * 1.0 }]}>
          {/* Decorative Glows */}
          <View style={[styles.glow, styles.glowPrimary, { left: 20, top: 20 }]} />
          <View style={[styles.glow, styles.glowInfo, { right: 20, bottom: 20 }]} />

          {/* Image 1 */}
          <View
            style={[
              styles.imageWrapper,
              styles.image1,
              { width: width * 0.6, height: width * 0.6 },
            ]}
          >
            <Image
              source={{
                uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773729695/3e3d5ef3-5951-4cb2-8cf8-3266a1304cdf.png',
              }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          </View>

          {/* Image 2 */}
          <View
            style={[
              styles.imageWrapper,
              styles.image2,
              { width: width * 0.6, height: width * 0.6 },
            ]}
          >
            <Image
              source={{
                uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773729718/25516531-c70c-44ad-846b-790cbc14e7ae.png',
              }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingTop: 60,
      paddingBottom: 60,
    },
    headerArea: {
      paddingHorizontal: SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
      zIndex: 20,
    },
    notifButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 5,
      elevation: isDark ? 8 : 2,
    },
    notifBadge: {
      position: 'absolute',
      top: 10,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.error,
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    topSection: {
      paddingHorizontal: SPACING.lg,
      zIndex: 10,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 42,
      color: colors.text,
      lineHeight: 48,
      marginBottom: SPACING.lg,
      textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.05)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    inlineIconWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    titleHighlight: {
      color: colors.primary,
    },
    sparkles: {
      marginLeft: 4,
      marginTop: -8,
    },
    subtitle: {
      fontFamily: FONTS.light,
      fontSize: 18,
      color: colors.textSecondary,
      lineHeight: 28,
      marginBottom: SPACING.xl,
      opacity: 0.95,
    },
    buttonRow: {
      flexDirection: 'row',
      marginBottom: SPACING.xl,
    },
    btnPrimary: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: RADIUS.full,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    btnPrimaryText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.onPrimary,
      letterSpacing: 1,
    },
    btnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    visualSection: {
      position: 'relative',
      marginTop: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glow: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
    },
    glowPrimary: {
      backgroundColor: isDark ? 'rgba(255, 198, 0, 0.25)' : 'rgba(255, 198, 0, 0.1)',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 50,
      elevation: 10,
    },
    glowInfo: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)',
      shadowColor: colors.info,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 50,
      elevation: 10,
    },
    imageWrapper: {
      position: 'absolute',
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.5 : 0.1,
      shadowRadius: 20,
      elevation: 15,
    },
    image1: {
      top: 0,
      right: 16,
      transform: [{ rotate: '3deg' }],
      zIndex: 2,
    },
    image2: {
      bottom: 20,
      left: 16,
      transform: [{ rotate: '-4deg' }],
      zIndex: 3,
    },
  });
};
