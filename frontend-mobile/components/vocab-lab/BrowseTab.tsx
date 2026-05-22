import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState, toast } from '@/components/ui';
import { CardDetailSheet } from '@/components/vocab-lab/CardDetailSheet';
import { ConfirmDialog } from '@/components';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATE_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'New', value: 'NEW' },
  { label: 'Learning', value: 'LEARNING' },
  { label: 'Review', value: 'REVIEW' },
] as const;

type CardStateFilter = (typeof STATE_FILTERS)[number]['value'];

// ─── State badge ──────────────────────────────────────────────────────────────
const STATE_STYLE: Record<string, { bg: string; color: string }> = {
  NEW: { bg: '#EFF6FF', color: '#2563EB' },
  LEARNING: { bg: '#FEF9C3', color: '#CA8A04' },
  REVIEW: { bg: '#DCFCE7', color: '#16A34A' },
  RELEARNING: { bg: '#FFF1F2', color: '#BE123C' },
};

function StateBadge({ state }: { state?: string }) {
  const key = (state ?? 'NEW').toUpperCase();
  const style = STATE_STYLE[key] ?? STATE_STYLE.NEW;
  return (
    <View style={[b.pill, { backgroundColor: style.bg }]}>
      <Text style={[b.text, { color: style.color }]}>{key}</Text>
    </View>
  );
}
const b = StyleSheet.create({
  pill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  text: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});

// ─── BrowseTab ────────────────────────────────────────────────────────────────
export function BrowseTab() {
  // ── Deck / state / tag / search filters ─────────────────────────────────────
  const [decks, setDecks] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  const [deckId, setDeckId] = useState('');
  const [stateFilter, setStateFilter] = useState<CardStateFilter>(undefined);
  const [tagFilter, setTagFilter] = useState('');
  const [cardTypeFilter, setCardTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Load decks + tags + types once
  useEffect(() => {
    vocabLabApi
      .getDecks()
      .then((d) => setDecks(d))
      .catch(() => {});
    vocabLabApi
      .getTags()
      .then((t) => setAllTags(t))
      .catch(() => {});
    vocabLabApi
      .getCardTypes()
      .then((ct) => setCardTypes(ct))
      .catch(() => {});
  }, []);

  // Fetch cards whenever deck / state / tag filter changes
  const fetchCards = useCallback(() => {
    setLoading(true);
    const isUntagged = tagFilter === '__untagged';
    const isTagged = tagFilter === '__tagged';
    vocabLabApi
      .browseCards({
        deckId: deckId || undefined,
        cardState: stateFilter || undefined,
        tag: !isUntagged && !isTagged && tagFilter ? tagFilter : undefined,
      })
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [deckId, stateFilter, tagFilter]);

  useEffect(() => {
    fetchCards();
    const sub = DeviceEventEmitter.addListener('VOCAB_LAB_CARD_ADDED', () => {
      fetchCards();
    });
    return () => sub.remove();
  }, [fetchCards]);

  // Client-side text search across front/back/fieldValues + card type filtering
  const filtered = cards.filter((c) => {
    if (cardTypeFilter && c.cardTypeId !== cardTypeFilter) return false;
    if (tagFilter === '__untagged' && c.tags && c.tags.length > 0) return false;
    if (tagFilter === '__tagged' && (!c.tags || c.tags.length === 0)) return false;
    if (!search.trim()) return true;
    const fieldText = Object.values((c as any).fieldValues || {}).join(' ');
    return [c.front, c.back, fieldText].join(' ').toLowerCase().includes(search.toLowerCase());
  });

  const handleDeleteCard = (id: string) => {
    setCardToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    try {
      await vocabLabApi.deleteFlashcard(cardToDelete);
      setCards((prev) => prev.filter((c) => c.id !== cardToDelete));
      toast.success('Success', 'Card deleted successfully.');
    } catch {
      toast.error('Error', 'Failed to delete card.');
    }
  };

  const handleCardSaved = (updatedCard: any) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setSelectedCard(null);
  };

  const handleCardDeleted = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setSelectedCard(null);
  };

  // ── Visible tag chips (max 6 collapsed, all expanded) ─────────────────────
  const TAGS_COLLAPSED_LIMIT = 6;
  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAGS_COLLAPSED_LIMIT);
  const hasMoreTags = allTags.length > TAGS_COLLAPSED_LIMIT;

  return (
    <View style={{ flex: 1 }}>
      {/* ── Deck filter pills ─────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillBar}
        contentContainerStyle={s.pillBarContent}
      >
        {[{ id: '', name: 'All Decks' }, ...decks].map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[s.pill, deckId === d.id && s.pillActive]}
            onPress={() => setDeckId(d.id)}
          >
            <Text style={[s.pillText, deckId === d.id && s.pillTextActive]}>{d.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Card Type filter pills ────────────────────────────────── */}
      {cardTypes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[s.pillBar, { borderBottomWidth: 0, paddingBottom: 0 }]}
          contentContainerStyle={s.pillBarContent}
        >
          {[{ id: '', name: 'All Types' }, ...cardTypes].map((ct) => (
            <TouchableOpacity
              key={ct.id}
              style={[s.pill, cardTypeFilter === ct.id && s.pillActive]}
              onPress={() => setCardTypeFilter(ct.id)}
            >
              <Text style={[s.pillText, cardTypeFilter === ct.id && s.pillTextActive]}>
                {ct.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Card state filter segment ──────────────────────────────── */}
      <View style={s.segmentRow}>
        {STATE_FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[s.segmentBtn, stateFilter === f.value && s.segmentBtnActive]}
            onPress={() =>
              setStateFilter(stateFilter === f.value && f.value !== undefined ? undefined : f.value)
            }
          >
            <Text style={[s.segmentText, stateFilter === f.value && s.segmentTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tag filter pills ───────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.pillBar, { borderBottomWidth: 0, paddingBottom: 0 }]}
        contentContainerStyle={s.pillBarContent}
      >
        {[
          { id: '', name: 'All Tags' },
          { id: '__untagged', name: 'Untagged' },
          { id: '__tagged', name: 'Tagged' },
          ...allTags.map((t) => ({ id: t, name: `#${t}` })),
        ].map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[s.pill, tagFilter === tag.id && s.pillActive]}
            onPress={() => setTagFilter(tag.id)}
          >
            <Text style={[s.pillText, tagFilter === tag.id && s.pillTextActive]}>{tag.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Search box ────────────────────────────────────────────── */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search cards…"
          placeholderTextColor={COLORS.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Card list ────────────────────────────────────────────── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
          {/* Active filter summary */}
          {(stateFilter || tagFilter) && (
            <View style={s.filterSummary}>
              <Ionicons name="filter" size={13} color={COLORS.primary} />
              <Text style={s.filterSummaryText}>
                Filtered by{stateFilter ? ` state:${stateFilter}` : ''}
                {tagFilter ? ` tag:${tagFilter.replace('__', '')}` : ''} — {filtered.length} result
                {filtered.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setStateFilter(undefined);
                  setTagFilter('');
                  setCardTypeFilter('');
                }}
              >
                <Text style={s.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon="🃏"
              title="No cards found"
              subtitle={
                deckId || stateFilter || tagFilter
                  ? 'Try adjusting your filters.'
                  : 'Select a deck or add some cards first.'
              }
            />
          ) : (
            filtered.map((c) => {
              const displayFront = c.front || Object.values((c as any).fieldValues || {})[0] || '';
              const displayBack = c.back || Object.values((c as any).fieldValues || {})[1] || '';
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    s.cardRow,
                    c.cardType?.templates?.[0]?.cardStyle
                      ? {
                          backgroundColor:
                            c.cardType.templates[0].cardStyle.backgroundColor || '#fff',
                        }
                      : null,
                  ]}
                  onPress={() => setSelectedCard(c)}
                  activeOpacity={0.78}
                >
                  <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                    <Text
                      style={[
                        s.cardFront,
                        c.cardType?.templates?.[0]?.cardStyle?.color
                          ? { color: c.cardType.templates[0].cardStyle.color }
                          : null,
                      ]}
                      numberOfLines={2}
                    >
                      {String(displayFront)}
                    </Text>
                    {displayBack ? (
                      <Text
                        style={[
                          s.cardBack,
                          c.cardType?.templates?.[0]?.cardStyle?.color
                            ? { color: c.cardType.templates[0].cardStyle.color, opacity: 0.7 }
                            : null,
                        ]}
                        numberOfLines={2}
                      >
                        {String(displayBack)}
                      </Text>
                    ) : null}
                    {/* Tags on the card */}
                    {c.tags?.length > 0 && (
                      <View style={s.cardTagsRow}>
                        {c.tags.slice(0, 3).map((t: string) => (
                          <TouchableOpacity key={t} onPress={() => setTagFilter(t)}>
                            <Text
                              style={[
                                s.cardTag,
                                c.cardType?.templates?.[0]?.cardStyle?.color
                                  ? { color: c.cardType.templates[0].cardStyle.color }
                                  : null,
                              ]}
                            >
                              #{t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {c.tags.length > 3 && (
                          <Text
                            style={[
                              s.cardTag,
                              c.cardType?.templates?.[0]?.cardStyle?.color
                                ? { color: c.cardType.templates[0].cardStyle.color }
                                : null,
                            ]}
                          >
                            +{c.tags.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: SPACING.sm }}>
                    <StateBadge state={c.cardState ?? c.state} />
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={c.cardType?.templates?.[0]?.cardStyle?.color || COLORS.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
      <CardDetailSheet
        card={selectedCard}
        visible={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onSaved={handleCardSaved}
        onDeleted={handleCardDeleted}
      />

      <ConfirmDialog
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        title="Delete Card"
        message="Are you sure you want to delete this card?"
        variant="destructive"
        primaryAction={{
          title: 'Delete',
          onPress: confirmDeleteCard,
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => {},
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },

  // Deck pill bar
  pillBar: { maxHeight: 52, borderBottomWidth: 1, borderColor: COLORS.border },
  pillBarContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  pillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.primary },

  // State segment
  segmentRow: { flexDirection: 'row', margin: SPACING.md, gap: SPACING.xs },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  segmentBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  segmentText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary },
  segmentTextActive: { color: COLORS.primary },

  // Tags section
  tagsSection: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagsHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    flex: 1,
  },
  clearTagBtn: { paddingHorizontal: SPACING.sm },
  clearTagText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  tagChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  tagChipText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  tagChipTextActive: { color: COLORS.primary },
  showMoreBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  showMoreText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },

  // Filter summary
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '08',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  filterSummaryText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  clearAllText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },

  // Card row
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  cardFront: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardBack: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  cardTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs },
  cardTag: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
});
