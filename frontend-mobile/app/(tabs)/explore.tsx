import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MODULES = [
  {
    id: 'vocab',
    title: 'IELTS Vocabulary',
    desc: 'Master IELTS vocabulary with spaced repetition and AI.',
    icon: 'library',
    color: '#FF9800',
    link: '/(tabs)/vocabulary'
  },
  {
    id: 'shadowing',
    title: 'Shadowing',
    desc: 'Improve pronunciation and fluency by repeating after native speakers.',
    icon: 'headset',
    color: '#2196F3',
    link: '/(tabs)/shadowing'
  },
  {
    id: 'grammar',
    title: 'Grammar',
    desc: 'Essential grammar lessons for speaking and writing bands 7.0+',
    icon: 'text',
    color: '#4CAF50',
    link: '/(tabs)/grammar'
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    desc: 'Phonetics training and intonation practice.',
    icon: 'mic',
    color: '#9C27B0',
    link: '/(tabs)/pronunciation'
  }
];

export default function ExploreTab() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover learning modules to boost your score.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {MODULES.map((mod) => (
            <Link key={mod.id} href={mod.link as any} asChild>
              <TouchableOpacity style={[styles.card, { width: (width - 48) / 2 }]}>
                <View style={[styles.iconBox, { backgroundColor: mod.color + '20' }]}>
                  <Ionicons name={mod.icon as any} size={28} color={mod.color} />
                </View>
                <Text style={styles.cardTitle}>{mod.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={3}>{mod.desc}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
        
        {/* Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['#FFC600', '#F59E0B']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Daily Challenge</Text>
            <Text style={styles.bannerDesc}>Complete 3 modules today to earn a streak freeze!</Text>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="flame" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 32,
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Farro-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 16,
    color: '#212529',
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'Farro-Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  banner: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    padding: SPACING.lg,
  },
  bannerContent: {
    zIndex: 2,
  },
  bannerTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 4,
  },
  bannerDesc: {
    fontFamily: 'Farro-Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
    width: '70%',
  },
  bannerBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontFamily: 'Farro-Bold',
    fontSize: 12,
    color: '#D97706',
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  }
});
