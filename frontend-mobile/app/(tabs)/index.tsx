import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, PlatformColor, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { COLORS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

export default function HomeTab() {
  const { width } = useWindowDimensions();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Background Image */}
      <Image
        source={{ uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773916745/ca3ae396-1909-4543-b0d3-8a1c7424d3ce.png' }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <View style={styles.overlay}>
        {/* Main Content */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>
            Master English{'\n'}
            Ace IELTS{'\n'}
            Smarter with <Text style={styles.titleHighlight}>AI <Ionicons name="sparkles" size={32} color={COLORS.primary} /></Text>
          </Text>

          <Text style={styles.subtitle}>
            An intelligent learning platform that helps you build vocabulary, improve speaking, and prepare for IELTS with personalized guidance
          </Text>

          <Link href="/(tabs)/ielts" asChild>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>START LEARNING</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />
            </Pressable>
          </Link>
        </View>

        {/* Images */}
        <View style={[styles.imagesContainer, { height: width }]}>
          {/* Decorative glow elements */}
          <View style={[styles.glow, styles.glowPrimary]} />
          <View style={[styles.glow, styles.glowInfo]} />

          <Image
            source={{ uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773729695/3e3d5ef3-5951-4cb2-8cf8-3266a1304cdf.png' }}
            style={[styles.floatingImage1, { width: width * 0.65, height: width * 0.65 }]}
            contentFit="contain"
          />
          <Image
            source={{ uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1773729718/25516531-c70c-44ad-846b-790cbc14e7ae.png' }}
            style={[styles.floatingImage2, { width: width * 0.65, height: width * 0.65 }]}
            contentFit="contain"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.2)', // Slight darkening to ensure text readability
  },
  heroSection: {
    alignItems: 'flex-start',
    marginTop: 40,
    marginBottom: 60,
  },
  title: {
    fontFamily: 'Farro-Bold',
    fontSize: 40,
    color: '#FFF',
    lineHeight: 48,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: 'Farro-Light',
    fontSize: 18,
    color: '#FFF',
    lineHeight: 28,
    marginBottom: 40,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    boxShadow: '0 4px 14px 0 rgba(255,198,0,0.39)',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Farro-Bold',
    fontSize: 16,
    color: '#111827', // Gray 900
    letterSpacing: 1,
  },
  imagesContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  floatingImage1: {
    position: 'absolute',
    top: 0,
    right: 20,
    transform: [{ rotate: '2deg' }],
    borderRadius: 16,
    zIndex: 10,
  },
  floatingImage2: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    transform: [{ rotate: '-2deg' }],
    borderRadius: 16,
    zIndex: 20,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  glowPrimary: {
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 198, 0, 0.3)',
    boxShadow: '0 0 40px 20px rgba(255, 198, 0, 0.3)',
  },
  glowInfo: {
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    boxShadow: '0 0 40px 20px rgba(33, 150, 243, 0.3)',
  },
});
