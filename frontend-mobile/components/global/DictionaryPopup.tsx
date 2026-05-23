import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RADIUS, FONTS } from '@/constants';
import { useRouter } from 'expo-router';

export function DictionaryPopup() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [vocabMeta, setVocabMeta] = useState<any>(undefined);
  const router = useRouter();

  // Listen to open-dictionary event
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'OPEN_DICTIONARY',
      ({
        word: queryWord,
        sentence: contextSentence,
        foundationVocabMeta,
      }: {
        word: string;
        sentence: string;
        foundationVocabMeta?: { bookName: string; wordData: any };
      }) => {
        setWord(queryWord);
        setSentence(contextSentence);
        setVocabMeta(foundationVocabMeta);
        setOpen(true);
      },
    );
    return () => sub.remove();
  }, []);

  const closeSheet = useCallback((callback?: () => void) => {
    setOpen(false);
    if (callback) callback();
  }, []);

  // Safe Add to Vocab Lab: close popup instantly first, then open Quick Add Modal after 350ms to prevent iOS UI deadlock
  const handleAddToVocabLab = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const formattedBack = sentence
      ? `Definition: [Explain with Lexon AI]\n\nExample sentence: ${sentence}`
      : 'Definition: [Explain with Lexon AI]';

    closeSheet(() => {
      // Trigger Quick Add Card ONLY after the DictionaryPopup is fully closed
      setTimeout(() => {
        DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
          front: word,
          back: formattedBack,
          tags: ['lookup'],
          foundationVocabMeta: vocabMeta,
        });
      }, 200);
    });
  };

  // Safely open Lexon AI full-screen modal
  const handleAskAI = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSheet(() => {
      router.push({
        pathname: '/chat-ai',
        params: { word, context: sentence },
      });
    });
  };

  const styles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    floatingContainer: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 110 : 90, // Float beautifully above navigation tab bar
      left: 16,
      right: 16,
      alignItems: 'center',
    },
    pillBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E293B', // Sleek dark slate
      borderRadius: RADIUS.xl,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      width: '100%',
    },
    wordSection: {
      flex: 1,
    },
    wordText: {
      fontSize: 15,
      fontFamily: FONTS.bold,
      color: '#FFFFFF',
      textTransform: 'lowercase',
    },
    actionsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#8B5CF6', // Purple Ask AI
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: RADIUS.lg,
      gap: 6,
    },
    vocabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF9800', // Orange Add Vocab
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: RADIUS.lg,
      gap: 6,
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontFamily: FONTS.bold,
    },
    closeBtn: {
      padding: 4,
      marginLeft: 4,
    },
  });

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => closeSheet()}>
      <Pressable style={styles.backdrop} onPress={() => closeSheet()} />

      <View style={styles.floatingContainer}>
        <View style={styles.pillBar}>
          <View style={styles.wordSection}>
            <Text style={styles.wordText} numberOfLines={1}>{word}</Text>
          </View>
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.aiButton} onPress={handleAskAI}>
              <Ionicons name="sparkles" size={14} color="#FFF" />
              <Text style={styles.actionText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vocabButton} onPress={handleAddToVocabLab}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.actionText}>Add Vocab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeSheet()}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
