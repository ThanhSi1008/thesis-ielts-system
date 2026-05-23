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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, ROUTES, SPACING, RADIUS } from '@/constants';
import { FeatureLock } from '@/components/ui/index';
import { AddVideoModal, FolderManageSheet, EditVideoSheet } from '@/components/shadowing';
import { ConfirmDialog } from '@/components';
import { useShadowingLessons } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'completed', label: 'Completed' },
];

export default function MyVideosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [activeMode, setActiveMode] = useState<'shadowing' | 'dictation'>('shadowing');

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<{ id: string; title: string; folder?: string; category?: string } | null>(null);
  const [editVideoVisible, setEditVideoVisible] = useState(false);

  const activeHook = useShadowingLessons(activeMode);

  const {
    status,
    setStatus,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    showAddModal,
    setShowAddModal,
    filteredUser: filtered,
    userVideos: tabLessons,
    progress,
    loading,
    refreshing,
    handleRefresh,
    handleDeleteVideo,
    deleteConfirmVisible,
    setDeleteConfirmVisible,
    videoToDelete,
    executeDeleteVideo,
    handleRenameFolder,
    handleDeleteFolder,
    handleUpdateVideo,
  } = activeHook;

  const videosByFolder = React.useMemo(() => {
    return filtered.reduce((acc, v) => {
      const folder = v.folder || 'General';
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(v);
      return acc;
    }, {} as Record<string, typeof filtered>);
  }, [filtered]);

  const foldersList = React.useMemo(() => {
    return Object.keys(videosByFolder).sort((a, b) => {
      if (a === 'General') return -1;
      if (b === 'General') return 1;
      return a.localeCompare(b);
    });
  }, [videosByFolder]);


  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 20,
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
      fontSize: 22,
      color: colors.text,
      letterSpacing: -0.5,
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
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 2,
    },
    chipText: { fontFamily: FONTS.bold, fontSize: 11, color: colors.textSecondary },
    chipTextActive: { color: colors.text },

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
    thumbProgFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },

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
    progBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
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
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
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

    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 99,
    },
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 50,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      marginTop: 20,
    },
    emptyText: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 10,
      textAlign: 'center',
    },
    importBtnInline: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    importBtnInlineText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: '#0F172A',
    },
    folderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 16,
      marginBottom: 10,
    },
    folderHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    folderTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.text,
    },
    folderCountBadge: {
      backgroundColor: 'rgba(255, 198, 0, 0.08)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 198, 0, 0.2)',
    },
    folderCountText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: colors.textSecondary,
    },
    folderMenuBtn: {
      padding: 4,
    },
    editBtn: {
      width: 30,
      height: 30,
      borderRadius: RADIUS.md,
      backgroundColor: 'rgba(255, 198, 0, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const renderLessonList = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="cloud-upload-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText} allowFontScaling={true}>
            No videos imported for this mode yet.
          </Text>
          <TouchableOpacity
            style={styles.importBtnInline}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#0F172A" />
            <Text style={styles.importBtnInlineText}>Import your first video</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const showFolders = foldersList.length > 1 || (foldersList.length === 1 && foldersList[0] !== 'General');

    const renderVideoCard = (lesson: typeof filtered[0]) => {
      const p = progress[lesson.id]?.[activeMode] || 0;
      const isComp = p === 100;
      const isIP = p > 0 && p < 100;
      const isProcessing = (lesson as any).status === 'PROCESSING';
      const accent = activeMode === 'shadowing' ? COLORS.info : COLORS.warning;
      const cat = lesson.category || lesson.tags?.[0] || 'YouTube';

      return (
        <View
          key={lesson.id}
          style={styles.lessonCard}
          accessible={true}
          accessibilityLabel={`Lesson: ${lesson.title}. Category: ${cat}. ${
            isProcessing ? 'Transcribing and processing' : `Duration: ${lesson.duration || '5 min'}`
          }. Status: ${isComp ? 'Completed' : isIP ? `${p} percent completed` : 'Not started'}`}
        >
          {/* Thumbnail */}
          <View style={styles.thumbWrap}>
            <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.thumbBg}>
              <View style={[styles.thumbGlow, { backgroundColor: accent }]} />
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : isComp ? (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.status.success} />
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
            <Text style={styles.lessonTitle} numberOfLines={2} allowFontScaling={true}>
              {lesson.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.durWrap}>
                <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                <Text style={styles.durText} allowFontScaling={true}>
                  {isProcessing ? 'Analyzing...' : lesson.duration || '5 min'}
                </Text>
              </View>
              <View style={styles.catWrap}>
                <Text style={styles.catText} allowFontScaling={true}>{cat}</Text>
              </View>
              {lesson.folder && (
                <View style={[styles.catWrap, styles.folderBadge]}>
                  <Ionicons
                    name="folder-outline"
                    size={10}
                    color={colors.textSecondary}
                    style={{ marginRight: 2 }}
                  />
                  <Text style={styles.catText} allowFontScaling={true}>{lesson.folder}</Text>
                </View>
              )}
            </View>

            {isIP && !isProcessing && (
              <View style={styles.progBarRow}>
                <View style={styles.progBarBg}>
                  <View style={[styles.progBarFill, { width: `${p}%` as any }]} />
                </View>
                <Text style={styles.progBarText} allowFontScaling={true}>{p}%</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                {isProcessing ? (
                  <View style={styles.processingWrap}>
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.processingText} allowFontScaling={true}>Transcribing...</Text>
                  </View>
                ) : p === 0 ? (
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
                  style={styles.editBtn}
                  onPress={() => {
                    setVideoToEdit({
                      id: lesson.id,
                      title: lesson.title,
                      folder: lesson.folder || 'General',
                      category: cat,
                    });
                    setEditVideoVisible(true);
                  }}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${lesson.title}`}
                  accessibilityHint="Double tap to edit this video metadata"
                >
                  <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteVideo(lesson.id, lesson.title)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${lesson.title}`}
                  accessibilityHint="Double tap to remove this imported video"
                >
                  <Ionicons name="trash-outline" size={15} color={COLORS.status.error} />
                </TouchableOpacity>

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
                    router.push(ROUTES.practiceToolsShadowingLesson(lesson.id, activeMode) as any)
                  }
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${isComp ? 'Redo' : isIP ? 'Continue' : 'Start'} lesson ${lesson.title}`}
                  accessibilityHint="Double tap to open shadowing exercise"
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
                    allowFontScaling={true}
                  >
                    {isProcessing ? 'ETA ~1M' : isIP ? 'CONTINUE' : isComp ? 'REDO' : 'START'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    };

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {showFolders ? (
          foldersList.map((folderName) => {
            const folderVideos = videosByFolder[folderName] || [];
            if (folderVideos.length === 0) return null;
            return (
              <View key={folderName}>
                <View style={styles.folderHeader}>
                  <View style={styles.folderHeaderLeft}>
                    <Ionicons name="folder" size={18} color={colors.primary} />
                    <Text style={styles.folderTitle} allowFontScaling={true}>
                      {folderName}
                    </Text>
                    <View style={styles.folderCountBadge}>
                      <Text style={styles.folderCountText} allowFontScaling={true}>
                        {folderVideos.length} {folderVideos.length === 1 ? 'video' : 'videos'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.folderMenuBtn}
                    onPress={() => {
                      setSelectedFolder(folderName);
                      setFolderSheetVisible(true);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Manage folder ${folderName}`}
                  >
                    <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {folderVideos.map((lesson) => renderVideoCard(lesson))}
              </View>
            );
          })
        ) : (
          filtered.map((lesson) => renderVideoCard(lesson))
        )}
      </ScrollView>
    );
  };

  const hasVideos = tabLessons.length > 0;

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
            accessibilityHint="Navigate back to practice tools dashboard"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.eyebrow} allowFontScaling={true}>Lexon Custom Lab</Text>
            <Text style={styles.headerTitle} allowFontScaling={true}>My Video Studio</Text>
          </View>
          {hasVideos && (
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
          )}
        </View>

        {hasVideos && showSearch && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search custom videos..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.textMuted}
              accessible={true}
              accessibilityLabel="Search lessons"
              accessibilityHint="Type keywords here to filter custom lessons list"
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
        {hasVideos && (
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
        )}
      </View>

      <FeatureLock requiredTier="PREMIUM" featureName="My Video Studio">
        {/* List content */}
        <View style={styles.listWrap}>
          {hasVideos && (
            <Text style={styles.countText} allowFontScaling={true}>
              {filtered.length} of {tabLessons.length} custom videos
            </Text>
          )}

          {renderLessonList()}
        </View>

        {/* Floating Action Button (FAB) inside premium wrapper */}
        {!loading && hasVideos && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Import new video"
            accessibilityHint="Double tap to open YouTube link import window"
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </FeatureLock>

      {/* YouTube Import Modal */}
      <AddVideoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleRefresh}
        mode="shadowing"
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        title="Delete Video"
        message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
        variant="destructive"
        primaryAction={{
          title: 'Delete',
          onPress: executeDeleteVideo,
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setDeleteConfirmVisible(false),
        }}
      />

      {/* Folder Management Bottom Sheet */}
      {selectedFolder && (
        <FolderManageSheet
          visible={folderSheetVisible}
          onClose={() => {
            setFolderSheetVisible(false);
            setSelectedFolder(null);
          }}
          folderName={selectedFolder}
          onRename={async (name, newName) => {
            await handleRenameFolder(name, newName);
            handleRefresh();
          }}
          onDelete={async (name) => {
            await handleDeleteFolder(name);
            handleRefresh();
          }}
        />
      )}

      {/* Edit Video Bottom Sheet */}
      <EditVideoSheet
        visible={editVideoVisible}
        onClose={() => {
          setEditVideoVisible(false);
          setVideoToEdit(null);
        }}
        video={videoToEdit}
        onSave={async (id, dto) => {
          await handleUpdateVideo(id, dto);
          handleRefresh();
        }}
      />
    </View>
  );
}
