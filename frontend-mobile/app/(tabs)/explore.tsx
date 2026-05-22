import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { RADIUS, SPACING, FONTS, ROUTES } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 28,
            color: colors.text,
            marginBottom: 6,
            letterSpacing: -0.5,
          }}
        >
          Explore
        </Text>
        <Text
          style={{
            fontFamily: FONTS.regular,
            fontSize: 15,
            color: colors.textSecondary,
            lineHeight: 22,
          }}
        >
          Discover specialized tools to boost your band score.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Banner */}
        <View
          style={{
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
          }}
        >
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={{ ...fillObject }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={{ zIndex: 2 }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontFamily: FONTS.bold, fontSize: 10, color: '#E2E8F0', letterSpacing: 1 }}
              >
                FEATURED
              </Text>
            </View>
            <Text
              style={{ fontFamily: FONTS.bold, fontSize: 22, color: '#FFF', marginBottom: 8 }}
            >
              Vocab Lab is here!
            </Text>
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 14,
                color: '#94A3B8',
                marginBottom: 20,
                lineHeight: 20,
                width: '85%',
              }}
            >
              Supercharge your memory with our AI-powered SRS flashcards.
            </Text>
            <Link href={ROUTES.vocabLab} asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFF',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A' }}>
                  Try it now
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#0F172A" />
              </TouchableOpacity>
            </Link>
          </View>
          <Ionicons
            name="flask"
            size={100}
            color="rgba(255,255,255,0.05)"
            style={{ position: 'absolute', right: -20, bottom: -20, zIndex: 1, transform: [{ rotate: '-10deg' }] }}
          />
        </View>

        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
            paddingHorizontal: 4,
          }}
        >
          Learning Modules
        </Text>

        <View style={{ gap: 12 }}>
          {MODULES.map((mod) => (
            <Link key={mod.id} href={mod.link} asChild>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1,
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={mod.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons name={mod.icon as any} size={26} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontFamily: FONTS.bold,
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {mod.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 13,
                      color: colors.textSecondary,
                      lineHeight: 18,
                      paddingRight: 8,
                    }}
                    numberOfLines={2}
                  >
                    {mod.desc}
                  </Text>
                </View>
                <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const fillObject = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
