import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

export interface PassageLocation {
  paragraphIndex: number;
  questionNumbers?: number[];
  text?: string;
}

interface Props {
  passage: string;
  passageWithLocations?: PassageLocation[] | null;
  locatedQuestion: number | null;
  accentColor?: string;
}

export default function PassageReview({
  passage,
  passageWithLocations,
  locatedQuestion,
  accentColor = '#2563EB',
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const yOffsets = useRef<Record<number, number>>({}); // paragraphIndex → y
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);

  // Build a map from question number → paragraph index
  const qToParaIndex = React.useMemo(() => {
    const map: Record<number, number> = {};
    if (passageWithLocations) {
      passageWithLocations.forEach((loc) => {
        loc.questionNumbers?.forEach((q) => {
          map[q] = loc.paragraphIndex;
        });
      });
    }
    return map;
  }, [passageWithLocations]);

  useEffect(() => {
    if (locatedQuestion == null) return;
    const paraIdx = qToParaIndex[locatedQuestion];
    if (paraIdx != null) {
      const y = yOffsets.current[paraIdx];
      if (y != null) {
        scrollRef.current?.scrollTo({ y, animated: true });
      }
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      setHighlightedPara(paraIdx);
      highlightTimer.current = setTimeout(() => setHighlightedPara(null), 3000);
    }
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, [locatedQuestion, qToParaIndex]);

  const paragraphs = passage ? passage.split(/\n\n+/) : [];

  if (paragraphs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Passage not available.</Text>
      </View>
    );
  }

  // Build a set of question numbers per paragraph for labels
  const paraToQNums: Record<number, number[]> = {};
  if (passageWithLocations) {
    passageWithLocations.forEach((loc) => {
      if (loc.questionNumbers?.length) paraToQNums[loc.paragraphIndex] = loc.questionNumbers;
    });
  }

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        {paragraphs.map((para, idx) => {
          const isHighlighted = idx === highlightedPara;
          const qNums = paraToQNums[idx];
          return (
            <View
              key={idx}
              style={[
                styles.paragraph,
                isHighlighted && {
                  backgroundColor: accentColor + '18',
                  borderColor: accentColor + '60',
                },
              ]}
              onLayout={(evt) => {
                yOffsets.current[idx] = evt.nativeEvent.layout.y;
              }}
            >
              {qNums && qNums.length > 0 && (
                <View style={styles.markerRow}>
                  {qNums.map((q) => (
                    <View key={q} style={[styles.qBadge, { backgroundColor: accentColor }]}>
                      <Text style={styles.qBadgeText}>Q{q}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.paraText}>{para.trim()}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  inner: { padding: SPACING.md, gap: SPACING.sm },
  paragraph: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#fff',
  },
  markerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
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
  paraText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
});
