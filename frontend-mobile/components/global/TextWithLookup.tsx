import React, { useMemo } from 'react';
import { Text, StyleSheet, DeviceEventEmitter, TextStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TextWithLookupProps {
  content: string;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
  foundationVocabMeta?: {
    bookName: string;
    words: any[];
  };
}

export function TextWithLookup({
  content,
  style,
  selectable = true,
  foundationVocabMeta,
}: TextWithLookupProps) {
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
    const cleanWord = word.toLowerCase().trim();
    const matchingSentence = sentences.find((s) => s.toLowerCase().includes(cleanWord)) || content;

    // Find if the word exists in the vocabulary context
    let vocabMetaPayload = undefined;
    if (foundationVocabMeta?.words) {
      const match = foundationVocabMeta.words.find(
        (w) => w.word.toLowerCase().trim() === cleanWord
      );
      if (match) {
        vocabMetaPayload = {
          bookName: foundationVocabMeta.bookName,
          wordData: {
            word: match.word,
            phonetic: match.ipa || match.phonetic,
            definition: match.meaning || match.definition,
            example: match.example,
            imageUrl: match.imageUrl,
            audioUrl: match.audioUrl,
          },
        };
      }
    }

    // Emit event to open dictionary
    DeviceEventEmitter.emit('OPEN_DICTIONARY', {
      word,
      sentence: matchingSentence.trim(),
      foundationVocabMeta: vocabMetaPayload,
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
