import React, { useEffect, useState, useRef } from 'react';
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
import { shadowingApi } from '@/services/features.api';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
  P: '#FFC600',
  FG1: '#212529',
  FG2: '#64748b',
  FG3: '#9ca3af',
  BDR: '#e5e7eb',
  SRF: '#f8f9fa',
  WH: '#ffffff',
  BLU: '#2196F3',
  RED: '#F44336',
  GRN: '#4CAF50',
  ORG: '#FF9800',
};

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'not-started', label: 'Not Started' },
  { id: 'completed', label: 'Completed' },
];

export default function ShadowingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'shadowing' | 'dictation'>('shadowing');
  const [tab, setTab] = useState<'library' | 'my-videos'>('library');
  const [status, setStatus] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const [systemLessons, setSystemLessons] = useState<any[]>([]);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [progress, setProgress] = useState<
    Record<string, { shadowing: number; dictation: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [videosRes, lessonsRes, progressRes] = await Promise.allSettled([
        shadowingApi.getVideos(),
        shadowingApi.getLessons(),
        shadowingApi.getAllProgress(),
      ]);
      if (videosRes.status === 'fulfilled') setUserVideos(videosRes.value);
      if (lessonsRes.status === 'fulfilled') setSystemLessons(lessonsRes.value);
      if (progressRes.status === 'fulfilled') {
        const rawProgress = progressRes.value;
        const computed: Record<string, { shadowing: number; dictation: number }> = {};
        const activeLessons = lessonsRes.status === 'fulfilled' ? lessonsRes.value : [];
        const activeVideos = videosRes.status === 'fulfilled' ? videosRes.value : [];
        [...activeLessons, ...activeVideos].forEach((lesson: any) => {
          const p = rawProgress[lesson.id];
          const total = lesson.sentences?.length || 1;
          computed[lesson.id] = {
            shadowing: p?.shadowing ? Math.round((p.shadowing.length / total) * 100) : 0,
            dictation: p?.dictation ? Math.round((p.dictation.length / total) * 100) : 0,
          };
        });
        setProgress(computed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allLessons = [
    ...systemLessons.map((l) => ({ ...l, tags: l.tags || ['English'] })),
    ...userVideos.map((v) => ({ ...v, tags: ['YOUTUBE'] })),
  ];

  const tabLessons =
    tab === 'my-videos'
      ? allLessons.filter((l) => l.tags.includes('YOUTUBE'))
      : allLessons.filter((l) => !l.tags.includes('YOUTUBE'));

  const filtered = tabLessons.filter((l) => {
    const p = progress[l.id]?.[mode] || 0;
    let matchStatus = true;
    if (status === 'completed') matchStatus = p === 100;
    if (status === 'in-progress') matchStatus = p > 0 && p < 100;
    if (status === 'not-started') matchStatus = p === 0;

    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Lexon</Text>
            <Text style={styles.headerTitle}>Shadowing & Dictation</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name="search" size={18} color={THEME.FG1} />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={THEME.FG3} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={THEME.FG3}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={THEME.FG3} />
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
              color={mode === 'shadowing' ? THEME.BLU : THEME.FG3}
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
              color={mode === 'dictation' ? THEME.ORG : THEME.FG3}
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

      {/* List */}
      <View style={styles.listWrap}>
        <Text style={styles.countText}>
          {filtered.length} of {tabLessons.length} lessons
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.P} style={{ marginTop: 20 }} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchData();
                }}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {filtered.map((lesson) => {
              const p = progress[lesson.id]?.[mode] || 0;
              const isComp = p === 100;
              const isIP = p > 0 && p < 100;
              const accent = mode === 'shadowing' ? THEME.BLU : THEME.ORG;
              const cat = lesson.tags?.[0] || 'English';

              return (
                <View key={lesson.id} style={styles.lessonCard}>
                  {/* Thumbnail */}
                  <View style={styles.thumbWrap}>
                    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.thumbBg}>
                      <View style={[styles.thumbGlow, { backgroundColor: accent }]} />
                      {isComp ? (
                        <Ionicons name="checkmark-circle" size={24} color={THEME.GRN} />
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
                    <Text style={styles.lessonTitle} numberOfLines={2}>
                      {lesson.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.durWrap}>
                        <Ionicons name="time-outline" size={11} color={THEME.FG3} />
                        <Text style={styles.durText}>{lesson.duration || '5 min'}</Text>
                      </View>
                      <View style={styles.catWrap}>
                        <Text style={styles.catText}>{cat}</Text>
                      </View>
                    </View>

                    {isIP && (
                      <View style={styles.progBarRow}>
                        <View style={styles.progBarBg}>
                          <View style={[styles.progBarFill, { width: `${p}%` as any }]} />
                        </View>
                        <Text style={styles.progBarText}>{p}%</Text>
                      </View>
                    )}

                    <View style={styles.actionRow}>
                      <View style={{ flex: 1 }}>
                        {p === 0 && <Text style={styles.statusText}>Not started</Text>}
                        {isComp && (
                          <View style={styles.compWrap}>
                            <Ionicons name="checkmark" size={11} color={THEME.GRN} />
                            <Text style={styles.compText}>Completed</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          isComp ? styles.actionBtnComp : styles.actionBtnStart,
                        ]}
                        onPress={() => router.push(`/shadowing/${lesson.id}/${mode}` as any)}
                      >
                        <Text
                          style={[
                            styles.actionBtnText,
                            isComp ? styles.actionBtnTextComp : styles.actionBtnTextStart,
                          ]}
                        >
                          {isIP ? 'CONTINUE' : isComp ? 'REDO' : 'START'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.SRF },
  header: {
    backgroundColor: 'rgba(248,249,250,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.BDR,
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
    fontFamily: 'Farro-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: THEME.FG3,
  },
  headerTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 21,
    color: THEME.FG1,
    letterSpacing: -0.25,
    lineHeight: 26,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: THEME.WH,
    borderWidth: 1,
    borderColor: THEME.BDR,
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
    backgroundColor: THEME.WH,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.BDR,
    height: 38,
  },
  searchInput: { flex: 1, fontFamily: 'Farro-Regular', fontSize: 13, color: THEME.FG1 },

  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#ebebeb',
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
    backgroundColor: THEME.WH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtnText: { fontFamily: 'Farro-Bold', fontSize: 12, color: THEME.FG3 },
  modeBtnTextActive: { color: THEME.FG1 },

  subTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
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
  subTabActive: { borderBottomColor: THEME.P },
  subTabText: { fontFamily: 'Farro-Bold', fontSize: 12, color: THEME.FG3 },
  subTabTextActive: { color: THEME.FG1 },

  statusFilters: { paddingHorizontal: 16, paddingVertical: 9, gap: 6 },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.BDR,
    backgroundColor: THEME.WH,
  },
  chipActive: {
    backgroundColor: THEME.P,
    borderColor: THEME.P,
    shadowColor: THEME.P,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  chipText: { fontFamily: 'Farro-Bold', fontSize: 11, color: THEME.FG2 },
  chipTextActive: { color: THEME.FG1 },

  listWrap: { flex: 1, paddingHorizontal: 16 },
  countText: {
    fontFamily: 'Farro-Medium',
    fontSize: 11,
    color: THEME.FG3,
    paddingVertical: 7,
    fontWeight: '600',
  },

  lessonCard: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  thumbProgFill: { height: '100%', backgroundColor: THEME.P, borderRadius: 999 },

  metaWrap: { flex: 1, justifyContent: 'center' },
  lessonTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 13,
    color: THEME.FG1,
    lineHeight: 17,
    marginBottom: 3,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  durWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durText: { fontFamily: 'Farro-Regular', fontSize: 11, color: THEME.FG3 },
  catWrap: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  catText: { fontFamily: 'Farro-Bold', fontSize: 10, color: THEME.FG2 },

  progBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  progBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progBarFill: { height: '100%', backgroundColor: THEME.P, borderRadius: 999 },
  progBarText: { fontFamily: 'Farro-Bold', fontSize: 10, color: THEME.FG2 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusText: { fontFamily: 'Farro-Regular', fontSize: 11, color: THEME.FG3 },
  compWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  compText: { fontFamily: 'Farro-Bold', fontSize: 11, color: THEME.GRN },

  actionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  actionBtnStart: {
    backgroundColor: THEME.P,
    shadowColor: THEME.P,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnComp: { backgroundColor: '#f3f4f6' },
  actionBtnText: { fontFamily: 'Farro-Bold', fontSize: 11, letterSpacing: 0.4 },
  actionBtnTextStart: { color: THEME.FG1 },
  actionBtnTextComp: { color: THEME.FG2 },
});
