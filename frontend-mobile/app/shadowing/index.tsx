import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Image, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { shadowingApi } from '@/services/features.api';
import { Chip, EmptyState } from '@/components/ui';

// Static IELTS lessons bundled into the app (same IDs as web)
const STATIC_LESSONS = [
  { id: 'ielts-1', title: 'IELTS Part 1 – People at Work', youtubeVideoId: '', duration: '3:20', tags: ['IELTS'], sentences: [] },
  { id: 'ielts-2', title: 'IELTS Part 2 – Short Conversations', youtubeVideoId: '', duration: '4:10', tags: ['IELTS'], sentences: [] },
];

const CATEGORIES = ['All', 'IELTS', 'YOUTUBE'];

export default function ShadowingScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, { shadowing: number; dictation: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [videosRes, progressRes] = await Promise.allSettled([
        shadowingApi.getVideos(),
        shadowingApi.getAllProgress(),
      ]);
      if (videosRes.status === 'fulfilled') setUserVideos(videosRes.value);
      if (progressRes.status === 'fulfilled') {
        const rawProgress = progressRes.value;
        const computed: Record<string, { shadowing: number; dictation: number }> = {};
        [...STATIC_LESSONS, ...((videosRes.status === 'fulfilled' ? videosRes.value : []) as any[])].forEach((lesson: any) => {
          const p = rawProgress[lesson.id];
          const total = lesson.sentences?.length || 1;
          computed[lesson.id] = {
            shadowing: p?.shadowing ? Math.round((p.shadowing.length / total) * 100) : 0,
            dictation: p?.dictation ? Math.round((p.dictation.length / total) * 100) : 0,
          };
        });
        setProgress(computed);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const allLessons = [...STATIC_LESSONS, ...userVideos.map(v => ({ ...v, tags: ['YOUTUBE'] }))];
  const filtered = allLessons.filter(l => {
    const matchCat = category === 'All' || l.tags.includes(category);
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shadowing & Dictation</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/shadowing/create' as any)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search lessons…"
            placeholderTextColor={COLORS.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
      >
        {CATEGORIES.map(c => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {/* Lesson list */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="🎧"
              title="No lessons found"
              subtitle="Try a different search or category."
              action={{ label: 'Clear filters', onPress: () => { setSearch(''); setCategory('All'); } }}
            />
          ) : (
            filtered.map(lesson => {
              const p = progress[lesson.id] || { shadowing: 0, dictation: 0 };
              return (
                <View key={lesson.id} style={styles.lessonCard}>
                  {/* Thumbnail */}
                  <View style={styles.thumbnail}>
                    {lesson.youtubeVideoId ? (
                      <Image
                        source={{ uri: `https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg` }}
                        style={styles.thumbImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.thumbPlaceholder}>
                        <Text style={styles.thumbLetters}>IELTS</Text>
                      </View>
                    )}
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{lesson.duration}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>

                    {/* Progress bars */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Shadowing</Text>
                        <View style={styles.progressBg}>
                          <View style={[styles.progressFill, { width: `${p.shadowing}%` as any, backgroundColor: COLORS.primary }]} />
                        </View>
                        <Text style={styles.progressPct}>{p.shadowing}%</Text>
                      </View>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Dictation</Text>
                        <View style={styles.progressBg}>
                          <View style={[styles.progressFill, { width: `${p.dictation}%` as any, backgroundColor: COLORS.text }]} />
                        </View>
                        <Text style={styles.progressPct}>{p.dictation}%</Text>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: COLORS.primary }]}
                        onPress={() => router.push(`/shadowing/${lesson.id}/shadowing` as any)}
                      >
                        <Ionicons name="play" size={14} color={COLORS.primary} />
                        <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Shadowing</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: COLORS.text }]}
                        onPress={() => router.push(`/shadowing/${lesson.id}/dictation` as any)}
                      >
                        <Ionicons name="mic" size={14} color={COLORS.text} />
                        <Text style={[styles.actionLabel, { color: COLORS.text }]}>Dictation</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700', marginHorizontal: SPACING.md },
  addBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  searchRow: { padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#fff', borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: SPACING.sm + 2, fontSize: FONT_SIZES.md, color: COLORS.text },
  catBar: { borderBottomWidth: 1, borderColor: COLORS.border, maxHeight: 52 },
  lessonCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  thumbnail: { position: 'relative', height: 160 },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: '#FFC600',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbLetters: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  lessonInfo: { padding: SPACING.md },
  lessonTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  progressSection: { gap: SPACING.xs, marginBottom: SPACING.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progressLabel: { fontSize: 11, color: COLORS.textSecondary, width: 60 },
  progressBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', width: 32, textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xs, paddingVertical: SPACING.sm,
    borderWidth: 2, borderRadius: RADIUS.xl,
  },
  actionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
