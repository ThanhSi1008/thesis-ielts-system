import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vocabularyApi } from '@/services/ielts.api';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { Breadcrumb } from '@/components';

// Group component for 10 units
function UnitGroup({
  groupIndex,
  units,
  progressMap,
  isExpanded,
  onToggle,
  router,
  bookId,
}: {
  groupIndex: number;
  units: any[];
  progressMap: any;
  isExpanded: boolean;
  onToggle: () => void;
  router: any;
  bookId: string;
}) {
  const startNum = groupIndex * 10 + 1;
  const endNum = startNum + units.length - 1;
  const groupTitle = `Units ${startNum}–${endNum}`;

  const completedCount = units.filter((u) => progressMap[u.id]?.isCompleted).length;
  const totalWords = units.reduce((sum, u) => sum + (progressMap[u.id]?.totalWords || 20), 0);

  return (
    <View
      style={[styles.groupCard, !isExpanded && completedCount === 0 && styles.groupCardInactive]}
    >
      {/* Group header */}
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.groupHeader, isExpanded && styles.groupHeaderExpanded]}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${groupTitle}. ${units.length} units, ${totalWords} words. Completed ${completedCount} out of ${units.length}.`}
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={isExpanded ? 'Double tap to collapse this section' : 'Double tap to expand this section'}
      >
        <View style={[styles.groupToggleBtn, isExpanded && styles.groupToggleBtnActive]}>
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={14}
            color={isExpanded ? COLORS.text : COLORS.gray[400]}
          />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle} allowFontScaling={true}>{groupTitle}</Text>
          <Text style={styles.groupSubtitle} allowFontScaling={true}>
            {units.length} units · {totalWords} words
          </Text>
        </View>
        <View style={styles.groupProgressCol}>
          <Text
            style={[
              styles.groupProgressText,
              completedCount > 0 && { color: COLORS.textSecondary },
            ]}
            allowFontScaling={true}
          >
            {completedCount}/{units.length}
          </Text>
          {completedCount > 0 && (
            <View style={styles.groupProgressBar}>
              <View
                style={[
                  styles.groupProgressFill,
                  { width: `${(completedCount / units.length) * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Unit rows */}
      {isExpanded && (
        <View style={styles.groupContent}>
          {units.map((unit, idx) => {
            const up = progressMap[unit.id];
            const isComp = up?.isCompleted ?? false;
            const wordsLearned = up?.wordsLearned ?? 0;
            const totalWords = up?.totalWords ?? 20;
            const isIP = !isComp && wordsLearned > 0;
            const orderNum = startNum + idx;

            return (
              <TouchableOpacity
                key={unit.id}
                style={[styles.unitRow, isComp ? styles.unitRowCompleted : styles.unitRowDefault]}
                onPress={() => router.push(ROUTES.foundationVocabularyUnit(bookId, unit.id))}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Unit ${orderNum}: ${unit.title}. Status: ${isComp ? 'Completed' : isIP ? 'In Progress' : 'Not started'}. Progress ${wordsLearned} of ${totalWords} words.`}
                accessibilityHint="Double tap to open vocabulary study interface for this unit"
              >
                {/* Badge */}
                <View
                  style={[
                    styles.unitBadge,
                    isComp ? styles.unitBadgeCompleted : styles.unitBadgeDefault,
                  ]}
                >
                  {isComp ? (
                    <Ionicons name="checkmark" size={14} color={COLORS.text} />
                  ) : (
                    <Text style={styles.unitBadgeText} allowFontScaling={true}>{orderNum}</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.unitMain}>
                  <Text
                    style={[styles.unitName, isComp && { color: COLORS.text }]}
                    numberOfLines={1}
                    allowFontScaling={true}
                  >
                    {unit.title}
                  </Text>

                  {isComp && <Text style={styles.unitCompletedLabel} allowFontScaling={true}>COMPLETED</Text>}

                  {isIP && (
                    <View style={styles.unitIPRow}>
                      <View style={styles.unitIPBar}>
                        <View
                          style={[
                            styles.unitIPFill,
                            { width: `${(wordsLearned / totalWords) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.unitIPText} allowFontScaling={true}>
                        {wordsLearned}/{totalWords}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Stats */}
                <View style={styles.unitStats}>
                  <Text style={[styles.unitStatsCount, isComp && { color: 'rgba(0,0,0,0.45)' }]} allowFontScaling={true}>
                    {wordsLearned}/{totalWords}
                  </Text>
                  <Text style={[styles.unitStatsStatus, isComp && { color: 'rgba(0,0,0,0.35)' }]} allowFontScaling={true}>
                    {isComp ? '✓ Reading' : isIP ? 'Pending' : '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function VocabularyBookScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const [book, setBook] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track expanded groups (index based)
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({ 0: true });

  const loadingBreadcrumb = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Vocabulary', route: '/ielts/foundation/vocabulary' },
    { label: 'Loading...' }
  ], []);

  const breadcrumbItems = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Vocabulary', route: '/ielts/foundation/vocabulary' },
    { label: book?.name ?? 'Book' }
  ], [book?.name]);

  const load = useCallback(async () => {
    try {
      const [bookData, progressData] = await Promise.allSettled([
        vocabularyApi.getBook(bookId!),
        vocabularyApi.getProgress(bookId!),
      ]);
      if (bookData.status === 'fulfilled') setBook(bookData.value);
      if (progressData.status === 'fulfilled') setProgress(progressData.value);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigates back to the previous screen"
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Breadcrumb items={loadingBreadcrumb} />
            <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={true}>
              Loading...
            </Text>
          </View>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Build a map of unitId → progress
  const progressMap: Record<string, any> = {};
  (progress?.units ?? []).forEach((u: any) => {
    progressMap[u.id] = u;
  });

  const units = book?.units ?? [];
  const totalUnits = units.length;
  const completedCount = units.filter((u: any) => progressMap[u.id]?.isCompleted).length;

  // Chunk units into groups of 10
  const groups = [];
  for (let i = 0; i < totalUnits; i += 10) {
    groups.push(units.slice(i, i + 10));
  }

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerWrapper} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigates back to the previous screen"
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Breadcrumb items={breadcrumbItems} />
            <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={true}>
              {book?.name ?? 'Word List'}
            </Text>
          </View>
          <View
            style={styles.headerBadge}
            accessible={true}
            accessibilityLabel={`${completedCount} of ${totalUnits} units completed`}
          >
            <Text style={styles.headerBadgeVal} allowFontScaling={true}>
              {completedCount}/{totalUnits}
            </Text>
            <Text style={styles.headerBadgeLbl} allowFontScaling={true}>UNITS</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        contentContainerStyle={styles.content}
      >
        {groups.map((groupUnits, idx) => (
          <UnitGroup
            key={idx}
            groupIndex={idx}
            units={groupUnits}
            progressMap={progressMap}
            isExpanded={!!expandedGroups[idx]}
            onToggle={() => toggleGroup(idx)}
            router={router}
            bookId={bookId!}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerWrapper: {
    backgroundColor: 'rgba(248,249,250,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: { flex: 1 },
  headerEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, letterSpacing: -0.1 },
  headerBadge: { alignItems: 'center' },
  headerBadgeVal: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  headerBadgeLbl: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.gray[400],
    letterSpacing: 0.4,
  },

  content: { padding: 14, paddingBottom: 60 },

  groupCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  groupCardInactive: { opacity: 0.45 },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.background,
  },
  groupHeaderExpanded: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupToggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupToggleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  groupInfo: { flex: 1 },
  groupTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.text },
  groupSubtitle: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.gray[400], marginTop: 1 },
  groupProgressCol: { alignItems: 'flex-end' },
  groupProgressText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.gray[400] },
  groupProgressBar: {
    width: 60,
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  groupProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },

  groupContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: 'rgba(248,249,250,0.5)',
  },

  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  unitRowDefault: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  unitRowCompleted: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },

  unitBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBadgeDefault: { backgroundColor: '#f3f4f6' },
  unitBadgeCompleted: { backgroundColor: 'rgba(0,0,0,0.12)' },
  unitBadgeText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textSecondary },

  unitMain: { flex: 1 },
  unitName: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text },
  unitCompletedLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(0,0,0,0.45)',
    marginTop: 1,
  },

  unitIPRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  unitIPBar: {
    flex: 1,
    maxWidth: 72,
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  unitIPFill: { height: '100%', backgroundColor: COLORS.info, borderRadius: 2 },
  unitIPText: { fontFamily: FONTS.medium, fontSize: 9, color: COLORS.gray[400] },

  unitStats: { alignItems: 'flex-end' },
  unitStatsCount: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.gray[400] },
  unitStatsStatus: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.gray[400],
    marginTop: 2,
  },
});
