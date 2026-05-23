import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES, FONTS, COLORS } from '@/constants';
import BottomSheet from '../organisms/BottomSheet';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import { vocabLabApi } from '@/services/features.api';
import { SharedDeck } from '@/types';
import { toast } from '../ui/Toaster';

const { width } = Dimensions.get('window');

interface SharedDeckDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  deckId: string | null;
  onImported?: () => void;
}

export default function SharedDeckDetailSheet({
  visible,
  onClose,
  deckId,
  onImported,
}: SharedDeckDetailSheetProps) {
  const { colors } = useTheme();
  const [deck, setDeck] = useState<SharedDeck | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (visible && deckId) {
      setLoading(true);
      setDeck(null);
      vocabLabApi
        .getSharedDeck(deckId)
        .then((res) => {
          setDeck(res);
        })
        .catch((err) => {
          if (__DEV__) console.error('Failed to load shared deck details', err);
          toast.error('Lỗi', 'Không thể tải chi tiết bộ thẻ cộng đồng.');
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, deckId]);

  const handleImport = async () => {
    if (!deck) return;
    setImporting(true);
    try {
      await vocabLabApi.importSharedDeck(deck.id);
      toast.success('Thành công 🎉', `Đã import bộ thẻ "${deck.name}" (${deck.cardCount} thẻ) thành công.`);
      onImported?.();
      onClose();
    } catch (err: any) {
      if (__DEV__) console.error('Failed to import deck', err);
      toast.error('Lỗi', err?.message || 'Import thất bại. Vui lòng thử lại.');
    } finally {
      setImporting(false);
    }
  };

  const publishDate = deck?.createdAt
    ? new Date(deck.createdAt).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={deck ? deck.name : 'Chi tiết bộ thẻ'}
      snapPointHeight={0.7}
    >
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : deck ? (
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Publisher Block */}
            <View style={[styles.publisherCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Avatar
                source={deck.publisherAvatar || undefined}
                name={deck.publisherName}
                size={40}
              />
              <View style={styles.publisherMeta}>
                <Text variant="body" weight="bold" color="text">
                  {deck.publisherName}
                </Text>
                <Text variant="caption" style={{ color: colors.textMuted }}>
                  Chia sẻ ngày {publishDate}
                </Text>
              </View>
              {deck.category && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text variant="caption" weight="bold" style={{ color: colors.primary }}>
                    {deck.category}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {deck.description ? (
              <View style={styles.descSection}>
                <Text variant="body" weight="medium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Giới thiệu
                </Text>
                <Text variant="body" style={[styles.descText, { color: colors.textSecondary }]}>
                  {deck.description}
                </Text>
              </View>
            ) : null}

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Ionicons name="albums-outline" size={20} color={colors.primary} />
                <Text variant="body" weight="bold" color="text">
                  {deck.cardCount}
                </Text>
                <Text variant="caption" style={{ color: colors.textMuted }}>
                  Thẻ từ vựng
                </Text>
              </View>
              <View style={[styles.statBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Ionicons name="cloud-download-outline" size={20} color={COLORS.status.success} />
                <Text variant="body" weight="bold" color="text">
                  {deck.importCount}
                </Text>
                <Text variant="caption" style={{ color: colors.textMuted }}>
                  Lượt tải về
                </Text>
              </View>
            </View>

            {/* Tag Chips List */}
            {deck.tags && deck.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text variant="body" weight="medium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Tags
                </Text>
                <View style={styles.tagsContainer}>
                  {deck.tags.map((tag) => (
                    <View key={tag} style={[styles.tagChip, { backgroundColor: colors.border + '30', borderColor: colors.border }]}>
                      <Text variant="caption" style={{ color: colors.textSecondary }}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Preview Cards Slider */}
            {deck.previewCards && deck.previewCards.length > 0 && (
              <View style={styles.previewSection}>
                <Text variant="body" weight="medium" style={[styles.sectionTitle, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Xem trước thẻ ({deck.previewCards.length})
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={deck.previewCards}
                  keyExtractor={(item, index) => String(index)}
                  contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
                  renderItem={({ item }) => (
                    <View style={[styles.previewCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                      {/* Front preview */}
                      <View style={styles.cardHalf}>
                        <Text variant="caption" weight="bold" style={{ color: colors.primary, marginBottom: 4 }}>
                          MẶT TRƯỚC
                        </Text>
                        <Text variant="body" weight="bold" color="text" numberOfLines={3} style={styles.cardPreviewText}>
                          {item.front}
                        </Text>
                      </View>
                      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
                      {/* Back preview */}
                      <View style={styles.cardHalf}>
                        <Text variant="caption" weight="bold" style={{ color: COLORS.status.success, marginBottom: 4 }}>
                          MẶT SAU
                        </Text>
                        <Text variant="body" color="text" numberOfLines={3} style={styles.cardPreviewText}>
                          {item.back}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </ScrollView>

          {/* Bottom CTA Block */}
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <Button
              title="Import Bộ Thẻ"
              onPress={handleImport}
              loading={importing}
              fullWidth
              style={styles.importBtn}
            />
          </View>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textSecondary }}>Không tìm thấy thông tin.</Text>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    gap: 20,
  },
  publisherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
  },
  publisherMeta: {
    flex: 1,
    marginLeft: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  descSection: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descText: {
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    gap: 4,
  },
  tagsSection: {
    gap: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  previewSection: {
    gap: SPACING.xs,
  },
  previewCard: {
    width: width * 0.72,
    height: 140,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  cardHalf: {
    flex: 1,
  },
  cardPreviewText: {
    lineHeight: 18,
  },
  cardDivider: {
    width: 1,
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1.5,
  },
  importBtn: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
});
