import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

export interface TranscriptSegment {
  text: string;
  question_markers?: number[];
}

interface Props {
  transcript: TranscriptSegment[];
  locatedQuestion: number | null;
  accentColor?: string;
}

export default function TranscriptReview({
  transcript,
  locatedQuestion,
  accentColor = COLORS.skill.listening,
}: Props) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // Map from question number → y-offset of that segment
  const yOffsets = useRef<Record<number, number>>({});
  // Track active highlight timer
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightedQ, setHighlightedQ] = React.useState<number | null>(null);

  useEffect(() => {
    if (locatedQuestion == null) return;
    const y = yOffsets.current[locatedQuestion];
    if (y != null) {
      scrollRef.current?.scrollTo({ y, animated: true });
    }
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedQ(locatedQuestion);
    highlightTimer.current = setTimeout(() => setHighlightedQ(null), 3000);
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, [locatedQuestion]);

  const onSegmentLayout = useCallback((qNums: number[], y: number) => {
    qNums.forEach((q) => {
      yOffsets.current[q] = y;
    });
  }, []);

  const styles = StyleSheet.create({
    scroll: { flex: 1 },
    inner: { padding: SPACING.md, gap: SPACING.sm },
    segment: {
      borderRadius: RADIUS.lg,
      padding: SPACING.sm,
      paddingHorizontal: SPACING.md,
    },
    markerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 4,
    },
    qBadge: {
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    qBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#fff',
    },
    segText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,
    },
    emptyText: { fontSize: FONT_SIZES.sm, color: colors.textMuted },
  });

  if (!transcript || transcript.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Transcript not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        {transcript.map((seg, idx) => {
          const hasMarkers = seg.question_markers && seg.question_markers.length > 0;
          const isHighlighted = hasMarkers && seg.question_markers!.some((q) => q === highlightedQ);
          return (
            <View
              key={idx}
              style={[styles.segment, isHighlighted && { backgroundColor: accentColor + '20' }]}
              onLayout={(evt) => {
                if (hasMarkers) {
                  onSegmentLayout(seg.question_markers!, evt.nativeEvent.layout.y);
                }
              }}
            >
              {hasMarkers && (
                <View style={styles.markerRow}>
                  {seg.question_markers!.map((q) => (
                    <View key={q} style={[styles.qBadge, { backgroundColor: accentColor }]}>
                      <Text style={styles.qBadgeText}>Q{q}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={[styles.segText, isHighlighted && { color: colors.text }]}>
                {seg.text}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
