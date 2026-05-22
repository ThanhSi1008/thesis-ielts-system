import React from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, ROUTES, SPACING, RADIUS } from '@/constants';
import { FeatureLock } from '@/components/ui/index';
import { AddVideoModal } from '@/components/shadowing';
import { useShadowingLessons } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'completed', label: 'Completed' },
];

export default function ShadowingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    mode,
    setMode,
    tab,
    setTab,
    status,
    setStatus,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    showAddModal,
    setShowAddModal,
    filtered,
    tabLessons,
    progress,
    loading,
    refreshing,
    handleRefresh,
    handleDeleteVideo,
  } = useShadowingLessons();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
      paddingTop: 4,
    },
    eyebrow: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: colors.textMuted,
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
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 38,
    },
    searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: colors.text },

    modeToggle: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 8,
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

    subTabs: {
      flexDirection: 'row',
      marginHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    subTab: {
      paddingVertical: 7,
      paddingRight: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      marginBottom: -2,
    },
    subTabActive: { borderBottomColor: COLORS.primary },
    subTabText: { fontFamily: FONTS.bold, fontSize: 12, color: colors.textMuted },
    subTabTextActive: { color: colors.text },

    statusFilters: { paddingHorizontal: 16, paddingVertical: 9, gap: 6 },
    chip: {
      paddingVertical: 5,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 2,
    },
    chipText: { fontFamily: FONTS.bold, fontSize: 11, color: colors.textSecondary },
    chipTextActive: { color: colors.text },

    listWrap: { flex: 1, paddingHorizontal: 16 },
    countText: {
      fontFamily: FONTS.medium,
      fontSize: 11,
      color: colors.textMuted,
      paddingVertical: 7,
      fontWeight: '600',
    },

    lessonCard: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    thumbProgFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 999 },

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
    folderBadge: {
      backgroundColor: 'rgba(255, 198, 0, 0.08)',
      flexDirection: 'row',
      alignItems: 'center',
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
    progBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 999 },
    progBarText: { fontFamily: FONTS.bold, fontSize: 10, color: colors.textSecondary },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    statusText: { fontFamily: FONTS.regular, fontSize: 11, color: colors.textMuted },
    compWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    compText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.success },

    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    deleteBtn: {
      width: 30,
      height: 30,
      borderRadius: RADIUS.md,
      backgroundColor: 'rgba(244, 67, 54, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    processingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    processingText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: colors.textMuted,
    },
    actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
    actionBtnStart: {
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.primary,
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
    actionBtnTextStart: { color: colors.text },
    actionBtnTextComp: { color: colors.textSecondary },
    actionBtnTextDisabled: { color: colors.textMuted },

    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 99,
    },
  });

  const renderLessonList = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filtered.map((lesson) => {
          const p = progress[lesson.id]?.[mode] || 0;
          const isComp = p === 100;
          const isIP = p > 0 && p < 100;
          const isProcessing = (lesson as any).status === 'PROCESSING';
          const accent = mode === 'shadowing' ? COLORS.info : COLORS.warning;
          const cat = lesson.category || lesson.tags?.[0] || 'English';

          return (
            <View key={lesson.id} style={styles.lessonCard}>
              {/* Thumbnail */}
              <View style={styles.thumbWrap}>
                <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.thumbBg}>
                  <View style={[styles.thumbGlow, { backgroundColor: accent }]} />
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : isComp ? (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  ) : (
                    <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.65)" />
                  )}
                </LinearGradient>
                {isIP && !isProcessing && (
                  <View style={styles.thumbProgBg}>
                    <View style={[styles.thumbProgFill, { width: `${p}%` as any }]} />
                  </View>
                )}
              </View>

              {/* Meta */}
              <View style={styles.metaWrap}>
                <Text style={styles.lessonTitle} numberOfLines={2}>
                  {lesson.title}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.durWrap}>
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={styles.durText}>
                      {isProcessing ? 'Analyzing...' : lesson.duration || '5 min'}
                    </Text>
                  </View>
                  <View style={styles.catWrap}>
                    <Text style={styles.catText}>{cat}</Text>
                  </View>
                  {lesson.folder && (
                    <View style={[styles.catWrap, styles.folderBadge]}>
                      <Ionicons
                        name="folder-outline"
                        size={10}
                        color={colors.textSecondary}
                        style={{ marginRight: 2 }}
                      />
                      <Text style={styles.catText}>{lesson.folder}</Text>
                    </View>
                  )}
                </View>

                {isIP && !isProcessing && (
                  <View style={styles.progBarRow}>
                    <View style={styles.progBarBg}>
                      <View style={[styles.progBarFill, { width: `${p}%` as any }]} />
                    </View>
                    <Text style={styles.progBarText}>{p}%</Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    {isProcessing ? (
                      <View style={styles.processingWrap}>
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.processingText}>Transcribing...</Text>
                      </View>
                    ) : p === 0 ? (
                      <Text style={styles.statusText}>Not started</Text>
                    ) : isComp ? (
                      <View style={styles.compWrap}>
                        <Ionicons name="checkmark" size={11} color={COLORS.success} />
                        <Text style={styles.compText}>Completed</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.actionGroup}>
                    {tab === 'my-videos' && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteVideo(lesson.id, lesson.title)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      disabled={isProcessing}
                      style={[
                        styles.actionBtn,
                        isProcessing
                          ? styles.actionBtnDisabled
                          : isComp
                            ? styles.actionBtnComp
                            : styles.actionBtnStart,
                      ]}
                      onPress={() =>
                        router.push(ROUTES.practiceToolsShadowingLesson(lesson.id, mode))
                      }
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          isProcessing
                            ? styles.actionBtnTextDisabled
                            : isComp
                              ? styles.actionBtnTextComp
                              : styles.actionBtnTextStart,
                        ]}
                      >
                        {isProcessing ? 'ETA ~1M' : isIP ? 'CONTINUE' : isComp ? 'REDO' : 'START'}
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
            style={{ marginRight: 12, paddingVertical: 4 }}
            onPress={() => router.push(ROUTES.practiceTools)}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Lexon Practice Tools</Text>
            <Text style={styles.headerTitle}>Shadowing & Dictation</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(!showSearch)}>
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
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'shadowing' && styles.modeBtnActive]}
            onPress={() => setMode('shadowing')}
          >
            <Ionicons
              name="volume-high"
              size={14}
              color={mode === 'shadowing' ? COLORS.info : COLORS.gray[400]}
            />
            <Text style={[styles.modeBtnText, mode === 'shadowing' && styles.modeBtnTextActive]}>
              Shadowing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'dictation' && styles.modeBtnActive]}
            onPress={() => setMode('dictation')}
          >
            <Ionicons
              name="pencil"
              size={14}
              color={mode === 'dictation' ? COLORS.warning : COLORS.gray[400]}
            />
            <Text style={[styles.modeBtnText, mode === 'dictation' && styles.modeBtnTextActive]}>
              Dictation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-tabs */}
        <View style={styles.subTabs}>
          <TouchableOpacity
            style={[styles.subTab, tab === 'library' && styles.subTabActive]}
            onPress={() => setTab('library')}
          >
            <Text style={[styles.subTabText, tab === 'library' && styles.subTabTextActive]}>
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, tab === 'my-videos' && styles.subTabActive]}
            onPress={() => setTab('my-videos')}
          >
            <Text style={[styles.subTabText, tab === 'my-videos' && styles.subTabTextActive]}>
              My Videos
            </Text>
            <Ionicons name="lock-closed" size={10} color="#d97706" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilters}
        >
          {STATUS_FILTERS.map((f) => {
            const on = status === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setStatus(f.id)}
                style={[styles.chip, on && styles.chipActive]}
              >
                <Text style={[styles.chipText, on && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List content */}
      <View style={styles.listWrap}>
        <Text style={styles.countText}>
          {filtered.length} of {tabLessons.length} lessons
        </Text>

        {tab === 'my-videos' ? (
          <FeatureLock requiredTier="PREMIUM" featureName="Shadowing My Videos">
            <View style={{ flex: 1 }}>
              {renderLessonList()}

              {/* Floating Action Button (FAB) inside premium wrapper */}
              {!loading && (
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </FeatureLock>
        ) : (
          renderLessonList()
        )}
      </View>

      {/* YouTube Import Modal */}
      <AddVideoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleRefresh}
      />
    </View>
  );
}
