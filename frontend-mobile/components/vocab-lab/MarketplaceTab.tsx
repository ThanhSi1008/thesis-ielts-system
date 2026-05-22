import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureLock } from '@/components/ui/index';

// ── Types ──────────────────────────────────────────────────────
interface SharedDeck {
  id: string;
  publisherId: string;
  name: string;
  description: string | null;
  tags: string[];
  importCount: number;
  createdAt: string;
  cardCount: number;
  publisher: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

// ── Constants ──────────────────────────────────────────────────
const CATEGORIES = [
  'English',
  'IELTS',
  'TOEFL',
  'TOEIC',
  'Academic',
  'Business',
  'Medical',
  'Legal',
  'Science',
  'Daily',
];

// ── SharedDeckCard ─────────────────────────────────────────────
function SharedDeckCard({ deck, onImported }: { deck: SharedDeck; onImported?: () => void }) {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publisherName =
    [deck.publisher.firstName, deck.publisher.lastName].filter(Boolean).join(' ') || 'Unknown';
  const publishDate = new Date(deck.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      await vocabLabApi.importSharedDeck(deck.id);
      setImported(true);
      onImported?.();
    } catch (e: any) {
      setError(e?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={s.deckCard}>
      {/* Name + Description */}
      <Text style={s.deckName} numberOfLines={2}>
        {deck.name}
      </Text>
      {deck.description ? (
        <Text style={s.deckDesc} numberOfLines={3}>
          {deck.description}
        </Text>
      ) : null}

      {/* Tags */}
      {deck.tags.length > 0 && (
        <View style={s.tagRow}>
          {deck.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={s.divider} />

      {/* Meta + Publisher */}
      <View style={s.metaRow}>
        <Text style={s.metaText}>
          <Text style={{ fontFamily: FONTS.bold }}>{deck.cardCount}</Text> cards
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="download-outline" size={13} color="#9ca3af" />
            <Text style={s.metaText}>{deck.importCount}</Text>
          </View>
          <Text style={s.metaText}>{publishDate}</Text>
        </View>
      </View>

      <View style={s.publisherRow}>
        {/* Avatar */}
        {deck.publisher.avatar ? (
          <Image source={{ uri: deck.publisher.avatar }} style={s.publisherAvatar} />
        ) : (
          <View
            style={[
              s.publisherAvatar,
              {
                backgroundColor: COLORS.primary + '33',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: 10, color: COLORS.primary }}>
              {(deck.publisher.firstName?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={s.publisherName} numberOfLines={1}>
          {publisherName}
        </Text>

        {/* Import button */}
        <TouchableOpacity
          onPress={handleImport}
          disabled={importing || imported}
          style={[s.importBtn, imported && s.importBtnDone]}
        >
          {importing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[s.importBtnText, imported && { color: '#10b981' }]}>
              {imported ? 'Imported ✓' : 'Import'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{error}</Text>}
    </View>
  );
}

// ── Main MarketplaceTab ────────────────────────────────────────
type PageTab = 'explore' | 'my-published';

export function MarketplaceTab() {
  const { user } = useAuth();
  const [pageTab, setPageTab] = useState<PageTab>('explore');
  const [decks, setDecks] = useState<SharedDeck[]>([]);
  const [featured, setFeatured] = useState<SharedDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest'>('popular');
  const [category, setCategory] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const data = await vocabLabApi.browseSharedDecks({ sort: 'popular', limit: 8 });
      setFeatured(data);
    } catch {
      /* silent */
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    try {
      let data: SharedDeck[];
      if (pageTab === 'my-published' && user) {
        data = await vocabLabApi.browseSharedDecks({ publisherId: user.id, sort });
      } else {
        data = await vocabLabApi.browseSharedDecks({
          search,
          sort,
          category: category || undefined,
        });
      }
      setDecks(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [pageTab, user, search, sort, category]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchDecks, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchDecks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFeatured(), fetchDecks()]);
    setRefreshing(false);
  };

  return (
    <FeatureLock requiredTier="PREMIUM" featureName="Community Marketplace">
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8f9fa' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={s.title}>Community Marketplace</Text>
        <Text style={s.subtitle}>
          Discover and import flashcard decks shared by other learners.
        </Text>

        {/* Tabs */}
        <View style={s.tabRow}>
          {(['explore', ...(user ? ['my-published'] : [])] as PageTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setPageTab(tab)}
              style={[s.tabBtn, pageTab === tab && s.tabBtnActive]}
            >
              <Text style={[s.tabBtnText, pageTab === tab && s.tabBtnTextActive]}>
                {tab === 'explore' ? 'Explore' : 'My Published'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured (explore + no filters) */}
        {pageTab === 'explore' && !search && !category && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="flame" size={18} color="#f97316" />
              <Text style={s.sectionTitle}>Featured Decks</Text>
            </View>
            {loadingFeatured ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {featured.map((deck) => (
                  <View key={deck.id} style={{ width: 280 }}>
                    <SharedDeckCard deck={deck} />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Explore: category + search + sort */}
        {pageTab === 'explore' && (
          <>
            {/* Category pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoryScroll}
            >
              <TouchableOpacity
                onPress={() => setCategory('')}
                style={[s.catChip, category === '' && s.catChipActive]}
              >
                <Text style={[s.catChipText, category === '' && s.catChipTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[s.catChip, category === cat && s.catChipActive]}
                >
                  <Text style={[s.catChipText, category === cat && s.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search */}
            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Ionicons name="search-outline" size={18} color="#9ca3af" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search decks by name, tags…"
                  placeholderTextColor="#9ca3af"
                  style={s.searchInput}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Sort toggle */}
              <TouchableOpacity
                onPress={() => setSort((s) => (s === 'popular' ? 'newest' : 'popular'))}
                style={s.sortBtn}
              >
                <Ionicons
                  name={sort === 'popular' ? 'trending-up' : 'time-outline'}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={s.sortBtnText}>{sort === 'popular' ? 'Popular' : 'Newest'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Deck list */}
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} size="large" />
        ) : decks.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="albums-outline" size={48} color="#d1d5db" />
            <Text style={s.emptyTitle}>No decks found</Text>
            <Text style={s.emptyDesc}>
              {pageTab === 'my-published'
                ? "You haven't published any decks yet."
                : 'Try adjusting your search or be the first to share!'}
            </Text>
          </View>
        ) : (
          decks.map((deck) => <SharedDeckCard key={deck.id} deck={deck} onImported={fetchDecks} />)
        )}
      </ScrollView>
    </FeatureLock>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  title: { fontSize: 24, color: '#212529', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 20,
    gap: 0,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabBtnText: { fontSize: 14, color: '#6b7280' },
  tabBtnTextActive: { color: COLORS.primary },
  sectionTitle: { fontSize: 17, color: '#212529' },
  categoryScroll: { gap: 8, paddingVertical: 4, marginBottom: 14 },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  catChipActive: { backgroundColor: COLORS.primary },
  catChipText: { fontSize: 13, color: '#6b7280' },
  catChipTextActive: { color: '#212529' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#212529' },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primary + '18',
    borderRadius: 14,
  },
  sortBtnText: { fontSize: 13, color: COLORS.primary },
  // DeckCard
  deckCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  deckName: { fontSize: 16, color: '#212529', marginBottom: 6 },
  deckDesc: { fontSize: 14, color: '#6b7280', marginBottom: 10, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: { fontSize: 13, color: '#9ca3af' },
  publisherRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publisherAvatar: { width: 26, height: 26, borderRadius: 13 },
  publisherName: { flex: 1, fontSize: 14, color: '#374151' },
  importBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '18',
    borderRadius: 10,
  },
  importBtnDone: { backgroundColor: '#d1fae5' },
  importBtnText: { fontSize: 13, color: COLORS.primary },
  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyTitle: { fontSize: 17, color: '#212529', marginTop: 12, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 20 },
});
