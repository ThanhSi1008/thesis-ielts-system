import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, ROUTES, SPACING, RADIUS } from '@/constants';
import { useShadowingLessons, useDictationLessons } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'completed', label: 'Completed' },
];

export default function ShadowingScreen() {
  const router = useRouter();
  const { mode: urlMode } = useLocalSearchParams<{ mode?: 'shadowing' | 'dictation' }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [activeMode, setActiveMode] = useState<'shadowing' | 'dictation'>('shadowing');

  // Sync state if URL search param changes
  useEffect(() => {
    if (urlMode === 'shadowing' || urlMode === 'dictation') {
      setActiveMode(urlMode);
    }
  }, [urlMode]);

  const shadowing = useShadowingLessons('shadowing');
  const dictation = useDictationLessons();

  const activeHook = activeMode === 'shadowing' ? shadowing : dictation;

  const {
    status,
    setStatus,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    filteredSystem: filtered,
    systemLessons: tabLessons,
    progress,
    loading,
    refreshing,
    handleRefresh,
  } = activeHook;

  const accentColor = activeMode === 'shadowing' ? COLORS.info : COLORS.warning;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    backBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginRight: 12,
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
      fontSize: 21,
      color: colors.text,
      letterSpacing: -0.25,
      lineHeight: 26,
    },
    searchBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      marginTop: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 38,
    },
    searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: colors.text },

    modeToggle: {
      flexDirection: 'row',
      marginTop: 12,
      backgroundColor: colors.border,
      borderRadius: 11,
      padding: 3,
    },
    modeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 8,
      borderRadius: 9,
    },
    modeBtnActive: {
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    modeBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: colors.textMuted },
    modeBtnTextActive: { color: colors.text },

    statusFilters: { paddingVertical: 12, gap: 6 },
    chip: {
      paddingVertical: 5,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: accentColor,
      borderColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 2,
    },
    chipText: { fontFamily: FONTS.bold, fontSize: 11, color: colors.textSecondary },
    chipTextActive: { color: '#FFF' },

    listWrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    countText: {
      fontFamily: FONTS.medium,
      fontSize: 11,
      color: colors.textMuted,
      paddingBottom: 10,
      fontWeight: '600',
    },

    lessonCard: {
      flexDirection: 'row',
      gap: 14,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    thumbWrap: { width: 68, height: 68, borderRadius: 12, overflow: 'hidden' },
    thumbBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    thumbGlow: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 36,
      height: 36,
      borderRadius: 18,
      opacity: 0.3,
    },
    thumbProgBg: {
      position: 'absolute',
      bottom: 5,
      left: 5,
      right: 5,
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 999,
    },
    thumbProgFill: { height: '100%', backgroundColor: accentColor, borderRadius: 999 },

    metaWrap: { flex: 1, justifyContent: 'center' },
    lessonTitle: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.text,
      lineHeight: 17,
      marginBottom: 3,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    durWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    durText: { fontFamily: FONTS.regular, fontSize: 11, color: colors.textMuted },
    catWrap: {
      backgroundColor: colors.border,
      paddingVertical: 1,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
    catText: { fontFamily: FONTS.bold, fontSize: 10, color: colors.textSecondary },

    progBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    progBarBg: {
      flex: 1,
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 999,
      overflow: 'hidden',
    },
    progBarFill: { height: '100%', backgroundColor: accentColor, borderRadius: 999 },
    progBarText: { fontFamily: FONTS.bold, fontSize: 10, color: colors.textSecondary },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    statusText: { fontFamily: FONTS.regular, fontSize: 11, color: colors.textMuted },
    compWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    compText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.status.success },

    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
    actionBtnStart: {
      backgroundColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 2,
    },
    actionBtnComp: { backgroundColor: colors.border },
    actionBtnDisabled: {
      backgroundColor: COLORS.gray[200],
    },
    actionBtnText: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 0.4 },
    actionBtnTextStart: { color: '#FFF' },
    actionBtnTextComp: { color: colors.textSecondary },
    actionBtnTextDisabled: { color: colors.textMuted },
  });

  const renderLessonList = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />;
    }

    if (filtered.length === 0) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: colors.textSecondary, marginTop: 10 }}>
            No lessons found matching active filters.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[accentColor]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filtered.map((lesson) => {
          const p = progress[lesson.id]?.[activeMode] || 0;
          const isComp = p === 100;
          const isIP = p > 0 && p < 100;
          const cat = lesson.category || lesson.tags?.[0] || 'English';

          return (
            <View
              key={lesson.id}
              style={styles.lessonCard}
              accessible={true}
              accessibilityLabel={`Lesson: ${lesson.title}. Category: ${cat}. Duration: ${
                lesson.duration || '5 min'
              }. Status: ${isComp ? 'Completed' : isIP ? `${p} percent completed` : 'Not started'}`}
            >
              {/* Thumbnail */}
              <View style={styles.thumbWrap}>
                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.thumbBg}>
                  <View style={[styles.thumbGlow, { backgroundColor: accentColor }]} />
                  {isComp ? (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.status.success} />
                  ) : (
                    <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.65)" />
                  )}
                </LinearGradient>
                {isIP && (
                  <View style={styles.thumbProgBg}>
                    <View style={[styles.thumbProgFill, { width: `${p}%` as any }]} />
                  </View>
                )}
              </View>

              {/* Meta */}
              <View style={styles.metaWrap}>
                <Text style={styles.lessonTitle} numberOfLines={2} allowFontScaling={true}>
                  {lesson.title}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.durWrap}>
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={styles.durText} allowFontScaling={true}>
                      {lesson.duration || '5 min'}
                    </Text>
                  </View>
                  <View style={styles.catWrap}>
                    <Text style={styles.catText} allowFontScaling={true}>{cat}</Text>
                  </View>
                </View>

                {isIP && (
                  <View style={styles.progBarRow}>
                    <View style={styles.progBarBg}>
                      <View style={[styles.progBarFill, { width: `${p}%` as any }]} />
                    </View>
                    <Text style={styles.progBarText} allowFontScaling={true}>{p}%</Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    {p === 0 ? (
                      <Text style={styles.statusText} allowFontScaling={true}>Not started</Text>
                    ) : isComp ? (
                      <View style={styles.compWrap}>
                        <Ionicons name="checkmark" size={11} color={COLORS.status.success} />
                        <Text style={styles.compText} allowFontScaling={true}>Completed</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        isComp ? styles.actionBtnComp : styles.actionBtnStart,
                      ]}
                      onPress={() =>
                        router.push(ROUTES.practiceToolsShadowingLesson(lesson.id, activeMode) as any)
                      }
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${isComp ? 'Redo' : isIP ? 'Continue' : 'Start'} lesson ${lesson.title}`}
                      accessibilityHint={`Double tap to open shadowing exercise in ${activeMode} mode`}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          isComp ? styles.actionBtnTextComp : styles.actionBtnTextStart,
                        ]}
                        allowFontScaling={true}
                      >
                        {isIP ? 'CONTINUE' : isComp ? 'REDO' : 'START'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push(ROUTES.practiceTools);
              }
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityHint="Navigate back to practice tools screen"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow} allowFontScaling={true}>Lexon Practice Tools</Text>
            <Text style={styles.headerTitle} allowFontScaling={true}>Shadowing & Dictation</Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => setShowSearch(!showSearch)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Search lessons"
            accessibilityHint="Double tap to toggle search input bar"
            accessibilityState={{ expanded: showSearch }}
          >
            <Ionicons name="search" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.textMuted}
              accessible={true}
              accessibilityLabel="Search lessons"
              accessibilityHint="Type keywords here to filter shadowed lessons list"
              allowFontScaling={true}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear Search"
              >
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mode toggle */}
        <View style={styles.modeToggle} accessible={true} accessibilityRole="tablist">
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'shadowing' && styles.modeBtnActive]}
            onPress={() => setActiveMode('shadowing')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Shadowing mode active"
            accessibilityState={{ selected: activeMode === 'shadowing' }}
            accessibilityHint="Enables vocal microphone mirroring and shadowing training mode"
          >
            <Ionicons
              name="volume-high"
              size={14}
              color={activeMode === 'shadowing' ? COLORS.info : COLORS.gray[400]}
            />
            <Text
              style={[styles.modeBtnText, activeMode === 'shadowing' && styles.modeBtnTextActive]}
              allowFontScaling={true}
            >
              Shadowing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'dictation' && styles.modeBtnActive]}
            onPress={() => setActiveMode('dictation')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Dictation mode"
            accessibilityState={{ selected: activeMode === 'dictation' }}
            accessibilityHint="Enables keyboard spelling typing training mode"
          >
            <Ionicons
              name="pencil"
              size={14}
              color={activeMode === 'dictation' ? COLORS.warning : COLORS.gray[400]}
            />
            <Text
              style={[styles.modeBtnText, activeMode === 'dictation' && styles.modeBtnTextActive]}
              allowFontScaling={true}
            >
              Dictation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilters}
          accessible={true}
          accessibilityRole="radiogroup"
          accessibilityLabel="Status filters"
        >
          {STATUS_FILTERS.map((f) => {
            const on = status === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setStatus(f.id)}
                style={[styles.chip, on && styles.chipActive]}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={f.label}
                accessibilityState={{ checked: on }}
                accessibilityHint={`Filters practice lessons list by progress status ${f.label}`}
              >
                <Text
                  style={[styles.chipText, on && styles.chipTextActive]}
                  allowFontScaling={true}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List content */}
      <View style={styles.listWrap}>
        <Text style={styles.countText} allowFontScaling={true}>
          {filtered.length} of {tabLessons.length} lessons
        </Text>

        {renderLessonList()}
      </View>
    </View>
  );
}
