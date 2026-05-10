import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants';
import type { WordScore } from '@/types';

interface TranscriptFeedbackProps {
  words: WordScore[];
  onWordPress?: (word: string) => void;
}

/**
 * Renders transcribed words with color-coded feedback based on accuracy
 */
export const TranscriptFeedback: React.FC<TranscriptFeedbackProps> = ({ 
  words, 
  onWordPress 
}) => {
  const getWordColor = (score: number, errorType?: string) => {
    if (errorType === 'Omission') return COLORS.textMuted;
    if (errorType === 'Insertion') return '#9CA3AF'; // Gray
    
    if (score >= 75) return '#059669'; // Emerald-600
    if (score >= 40) return '#D97706'; // Amber-600
    return '#DC2626'; // Red-600
  };

  return (
    <View style={styles.container}>
      {words.map((item, idx) => (
        <TouchableOpacity 
          key={idx} 
          onPress={() => onWordPress?.(item.word)}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.word, 
              { color: getWordColor(item.accuracyScore, item.errorType) },
              item.errorType === 'Omission' && styles.omission
            ]}
          >
            {item.word}{' '}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.md,
  },
  word: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    lineHeight: 32,
  },
  omission: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
