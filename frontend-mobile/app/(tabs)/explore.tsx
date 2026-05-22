import React, { useEffect, useRef } from 'react';
import { View, ScrollView, useWindowDimensions, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { ROUTES } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useTabBarVisibility } from '@/hooks';
import { Text } from '@/components/atoms';
import { PressableCard } from '@/components/molecules';

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
    link: ROUTES.foundationVocabulary,
  },
  {
    id: 'shadowing',
    title: 'Shadowing & Dictation',
    desc: 'Improve fluency by repeating after native speakers',
    icon: 'headset',
    color: '#3B82F6',
    gradient: ['#60A5FA', '#3B82F6'],
    link: ROUTES.practiceTools,
  },
  {
    id: 'grammar',
    title: 'Grammar',
    desc: 'Essential grammar structures for Band 7.0+',
    icon: 'text',
    color: '#10B981',
    gradient: ['#34D399', '#10B981'],
    link: ROUTES.foundationGrammar,
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    desc: 'Master phonetics, word stress, and intonation',
    icon: 'mic',
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    link: ROUTES.foundationPronunciation,
  },
];

export default function ExploreTab() {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { handleScroll } = useTabBarVisibility();
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top on double tap active tab
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'explore') {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      }
    );
    return () => listener.remove();
  }, []);

  const bannerTextTitleColor = isDark ? '#FFFFFF' : '#1E293B';
  const bannerTextDescColor = isDark ? '#94A3B8' : '#475569';
  const bannerBadgeBg = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const bannerBadgeText = isDark ? '#E2E8F0' : '#1E293B';

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
          variant="display"
          weight="bold"
          color="text"
          style={{
            marginBottom: 6,
            letterSpacing: -0.5,
          }}
        >
          Explore
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{
            lineHeight: 22,
          }}
        >
          Discover specialized tools to boost your band score.
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
            shadowOpacity: isDark ? 0.35 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={
              (isDark
                ? ['#1E293B', '#0F172A']
                : [colors.primary, '#FFA000']) as [string, string]
            }
            style={{ ...fillObject }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={{ zIndex: 2 }}>
            <View
              style={{
                backgroundColor: bannerBadgeBg,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}
            >
              <Text
                variant="caption"
                weight="bold"
                style={{
                  color: bannerBadgeText,
                  letterSpacing: 1,
                }}
              >
                FEATURED
              </Text>
            </View>
            <Text
              variant="headline"
              weight="bold"
              style={{
                color: bannerTextTitleColor,
                marginBottom: 8,
              }}
            >
              Vocab Lab is here!
            </Text>
            <Text
              variant="body"
              style={{
                color: bannerTextDescColor,
                marginBottom: 20,
                lineHeight: 20,
                width: '85%',
              }}
            >
              Supercharge your memory with our AI-powered SRS flashcards.
            </Text>
            <Link href={ROUTES.vocabLab} asChild>
              <PressableCard
                variant="elevated"
                style={{
                  backgroundColor: isDark ? '#FFFFFF' : '#1E293B',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  marginBottom: 0,
                }}
                accessibilityLabel="Try Vocab Lab featured module now"
                accessibilityHint="Double tap to open the Vocab Lab SRS study tool"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    weight="bold"
                    style={{
                      fontSize: 14,
                      color: isDark ? '#0F172A' : '#FFFFFF',
                    }}
                  >
                    Try it now
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={isDark ? '#0F172A' : '#FFFFFF'}
                  />
                </View>
              </PressableCard>
            </Link>
          </View>
          <Ionicons
            name="flask"
            size={100}
            color={
              isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }
            style={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              zIndex: 1,
              transform: [{ rotate: '-10deg' }],
            }}
          />
        </View>

        <Text
          variant="title"
          weight="bold"
          color="text"
          style={{
            marginBottom: 16,
            paddingHorizontal: 4,
          }}
        >
          Learning Modules
        </Text>

        <View style={{ gap: 12 }}>
          {MODULES.map((mod) => (
            <Link key={mod.id} href={mod.link as any} asChild>
              <PressableCard
                variant="elevated"
                accessibilityLabel={`${mod.title} learning module. ${mod.desc}`}
                accessibilityHint={`Double tap to enter the ${mod.title} section`}
                leftAccessory={
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
                    }}
                  >
                    <Ionicons name={mod.icon as any} size={26} color="#FFF" />
                  </LinearGradient>
                }
                rightAccessory={
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                }
                style={{
                  marginBottom: 0,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 16,
                }}
              >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    variant="title"
                    weight="bold"
                    color="text"
                    style={{
                      marginBottom: 4,
                    }}
                  >
                    {mod.title}
                  </Text>
                  <Text
                    variant="body"
                    color="textSecondary"
                    style={{
                      lineHeight: 18,
                      paddingRight: 8,
                    }}
                    numberOfLines={2}
                  >
                    {mod.desc}
                  </Text>
                </View>
              </PressableCard>
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

