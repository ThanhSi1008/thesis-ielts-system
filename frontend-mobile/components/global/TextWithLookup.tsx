import React, { useMemo } from 'react';
import { Text, StyleSheet, DeviceEventEmitter, TextStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TextWithLookupProps {
  content: string;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
}

export function TextWithLookup({ content, style, selectable = true }: TextWithLookupProps) {
  if (!content) return null;

  // Split text by word boundaries, preserving spaces and punctuation.
  // This matches English letters, hyphens, and apostrophes.
  const tokens = useMemo(() => {
    return content.split(/([a-zA-Z'-]+)/);
  }, [content]);

  // Try to find the sentence containing the word.
  // We can do a simple sentence split on ".", "?", "!" followed by space.
  const sentences = useMemo(() => {
    // Using a simple regex split that splits on punctuation followed by space
    return content.split(/([.!?]\s+)/).reduce<string[]>((acc, current, index, arr) => {
      if (index % 2 === 0) {
        // This is a sentence text
        const punctuation = arr[index + 1] || '';
        acc.push(current + punctuation);
      }
      return acc;
    }, []);
  }, [content]);

  const handleWordLongPress = (word: string) => {
    // Premium feedback: medium haptic vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Find the sentence that contains this word.
    const cleanWord = word.toLowerCase();
    const matchingSentence = sentences.find(s => s.toLowerCase().includes(cleanWord)) || content;

    // Emit event to open dictionary
    DeviceEventEmitter.emit('OPEN_DICTIONARY', {
      word,
      sentence: matchingSentence.trim(),
    });
  };

  return (
    <Text style={style} selectable={selectable}>
      {tokens.map((token, index) => {
        const isWord = /^[a-zA-Z'-]+$/.test(token);
        if (isWord) {
          return (
            <Text
              key={index}
              onLongPress={() => handleWordLongPress(token)}
              style={styles.lookupWord}
              suppressHighlighting={false}
            >
              {token}
            </Text>
          );
        }
        return <Text key={index}>{token}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  lookupWord: {
    // Inherit everything, but can add custom styling if we want
  },
});
