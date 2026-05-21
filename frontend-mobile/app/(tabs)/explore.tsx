import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {COLORS, RADIUS, SPACING, FONTS, ROUTES} from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MODULES = [
  {
    id: 'vocab-lab',
    title: 'Vocab Lab',
    desc: 'Advanced flashcards with Spaced Repetition (SRS)',
    icon: 'flask',
    color: '#E11D48',
    gradient: ['#F43F5E', '#E11D48'],
    link: ROUTES.vocabLab,
  },
  {
    id: 'vocab',
    title: 'IELTS Vocabulary',
    desc: 'Topic-based vocabulary lessons with interactive quizzes',
    icon: 'book',
    color: '#FF9800',
    gradient: ['#FBBF24', '#F59E0B'],
    link: ROUTES.vocabulary,
  },
  {
    id: 'shadowing',
    title: 'Shadowing & Dictation',
    desc: 'Improve fluency by repeating after native speakers',
    icon: 'headset',
    color: '#3B82F6',
    gradient: ['#60A5FA', '#3B82F6'],
    link: ROUTES.shadowing,
  },
  {
    id: 'grammar',
    title: 'Grammar',
    desc: 'Essential grammar structures for Band 7.0+',
    icon: 'text',
    color: '#10B981',
    gradient: ['#34D399', '#10B981'],
    link: ROUTES.grammar,
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    desc: 'Master phonetics, word stress, and intonation',
    icon: 'mic',
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    link: ROUTES.ieltsPronunciation,
  },
];

export default function ExploreTab() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>
          Discover specialized tools to boost your band score.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>FEATURED</Text>
            </View>
            <Text style={styles.bannerTitle}>Vocab Lab is here!</Text>
            <Text style={styles.bannerDesc}>
              Supercharge your memory with our AI-powered SRS flashcards.
            </Text>
            <Link href={ROUTES.vocabLab} asChild>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Try it now</Text>
                <Ionicons name="arrow-forward" size={14} color="#0F172A" />
              </TouchableOpacity>
            </Link>
          </View>
          <Ionicons
            name="flask"
            size={100}
            color="rgba(255,255,255,0.05)"
            style={styles.bannerIcon}
          />
        </View>

        <Text style={styles.sectionTitle}>Learning Modules</Text>

        <View style={styles.list}>
          {MODULES.map((mod) => (
            <Link key={mod.id} href={mod.link} asChild>
              <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                <LinearGradient
                  colors={mod.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardIconBox}
                >
                  <Ionicons name={mod.icon as any} size={26} color="#FFF" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{mod.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {mod.desc}
                  </Text>
                </View>
                <View style={styles.cardAction}>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            </Link>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100, // padding for FAB and Tabs
  },
  banner: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: {
    zIndex: 2,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#FFF',
    marginBottom: 8,
  },
  bannerDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
    width: '85%',
  },
  bannerBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  bannerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    paddingRight: 8,
  },
  cardAction: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
