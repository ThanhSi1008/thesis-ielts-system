import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.65;

type TabType = 'VI' | 'EN' | 'AI';

export function DictionaryPopup() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('VI');
  const [loading, setLoading] = useState(true);
  const [dictData, setDictData] = useState<any>(null);
  const [viTranslation, setViTranslation] = useState('');
  const { colors } = useTheme();

  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;

  // Listen to open-dictionary event
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'OPEN_DICTIONARY',
      ({ word: queryWord, sentence: contextSentence }: { word: string; sentence: string }) => {
        setWord(queryWord);
        setSentence(contextSentence);
        setActiveTab('VI');
        setOpen(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
      },
    );
    return () => sub.remove();
  }, []);

  // Fetch dictionary and translation data
  useEffect(() => {
    if (!word) return;

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // 1. Fetch free English dictionary API
        const enRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let enData = null;
        if (enRes.ok) {
          const json = await enRes.json();
          enData = json[0];
        }

        // 2. Fetch Vietnamese Translation (MyMemory API - free tier)
        const viRes = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`,
        );
        let viText = '';
        if (viRes.ok) {
          const viJson = await viRes.json();
          viText = viJson.responseData.translatedText;
        }

        if (isMounted) {
          setDictData(enData);
          setViTranslation(viText);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch dictionary data', error);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [word]);

  const closeSheet = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: SHEET_H,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  }, []);

  // Extract phonetic audio URL
  const audioUrl =
    dictData?.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio || '';
  const player = useAudioPlayer(audioUrl);

  const playAudio = () => {
    try {
      if (player) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      console.log('Phonetic audio playback error', e);
    }
  };

  const handleAddToVocabLab = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const definition = dictData?.meanings?.[0]?.definitions?.[0]?.definition || viTranslation || '';

    // Emit quick add event to be captured by GlobalVocabFab
    DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
      front: word,
      back: definition,
      tags: ['lookup'],
      audioUrl: audioUrl || undefined,
    });

    closeSheet();
  };

  const styles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SHEET_H,
      backgroundColor: colors.background,
      borderTopLeftRadius: RADIUS.xl * 1.5,
      borderTopRightRadius: RADIUS.xl * 1.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 12,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    titleWrapper: {
      flex: 1,
    },
    wordTitle: {
      fontSize: FONT_SIZES.xl,
      fontFamily: FONTS.bold,
      color: colors.text,
      textTransform: 'capitalize',
    },
    phoneticText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    audioBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FF980015',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabsRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    tabItem: {
      flex: 1,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderColor: 'transparent',
    },
    tabItemActive: {
      borderColor: COLORS.primary,
    },
    tabLabel: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
    },
    tabLabelActive: {
      color: colors.text,
      fontFamily: FONTS.bold,
    },
    body: {
      flex: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    loadingText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
    },
    scrollContent: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xxl,
    },
    tabContent: {
      gap: SPACING.md,
    },
    sectionLabel: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    translationText: {
      fontSize: FONT_SIZES.lg,
      color: colors.text,
      fontFamily: FONTS.medium,
      lineHeight: 24,
    },
    definitionBlock: {
      marginBottom: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    partOfSpeech: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: COLORS.primary,
      fontStyle: 'italic',
      marginBottom: SPACING.sm,
      textTransform: 'capitalize',
    },
    defItem: {
      marginBottom: SPACING.md,
    },
    defText: {
      fontSize: FONT_SIZES.sm + 1,
      color: colors.text,
      lineHeight: 22,
      fontFamily: FONTS.medium,
    },
    defIndex: {
      fontFamily: FONTS.bold,
      color: COLORS.primary,
    },
    exampleWrapper: {
      marginTop: 4,
      paddingLeft: SPACING.md,
      borderLeftWidth: 2,
      borderColor: colors.border,
    },
    exampleText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
      fontFamily: FONTS.regular,
    },
    noDataText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: SPACING.xxl,
    },
    aiContextBox: {
      backgroundColor: '#FFC60010',
      borderColor: '#FFC60030',
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      gap: SPACING.xs,
    },
    aiLabel: {
      fontSize: 10,
      fontFamily: FONTS.bold,
      color: colors.text,
      letterSpacing: 0.8,
    },
    contextSentence: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 20,
      borderLeftWidth: 2,
      borderColor: COLORS.primary,
      paddingLeft: SPACING.sm,
      marginVertical: 4,
    },
    aiExplanation: {
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      lineHeight: 20,
      fontFamily: FONTS.medium,
    },
    boldText: {
      fontFamily: FONTS.bold,
    },
    italicText: {
      fontStyle: 'italic',
    },
    generalBox: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      gap: 4,
    },
    generalText: {
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      lineHeight: 20,
      fontFamily: FONTS.medium,
    },
    originBox: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      gap: 4,
    },
    originText: {
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      lineHeight: 20,
      fontFamily: FONTS.medium,
    },
    footer: {
      padding: SPACING.lg,
      borderTopWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    saveCtaBtn: {
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      borderRadius: RADIUS.xl,
      paddingVertical: SPACING.md,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveCtaText: {
      color: '#fff',
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
    },
  });

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={closeSheet}>
      <Pressable style={styles.backdrop} onPress={closeSheet} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Drag handle indicator */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleWrapper}>
            <Text style={styles.wordTitle}>{word}</Text>
            {dictData?.phonetic && <Text style={styles.phoneticText}>{dictData.phonetic}</Text>}
          </View>
          <View style={styles.actions}>
            {audioUrl ? (
              <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
                <Ionicons name="volume-high" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.addBtn} onPress={handleAddToVocabLab}>
              <Ionicons name="star" size={20} color="#FF9800" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={closeSheet}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {(['VI', 'EN', 'AI'] as TabType[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab === 'VI' ? 'Vietnamese' : tab === 'EN' ? 'English' : 'AI Context'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content body */}
        <View style={styles.body}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fetching definitions...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'VI' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionLabel}>Dịch Nghĩa (Translation)</Text>
                  <Text style={styles.translationText}>
                    {viTranslation || 'Không tìm thấy bản dịch.'}
                  </Text>
                </View>
              )}

              {activeTab === 'EN' && (
                <View style={styles.tabContent}>
                  {dictData?.meanings ? (
                    dictData.meanings.map((meaning: any, index: number) => (
                      <View key={index} style={styles.definitionBlock}>
                        <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
                        {meaning.definitions.slice(0, 3).map((def: any, defIdx: number) => (
                          <View key={defIdx} style={styles.defItem}>
                            <Text style={styles.defText}>
                              <Text style={styles.defIndex}>{defIdx + 1}.</Text> {def.definition}
                            </Text>
                            {def.example && (
                              <View style={styles.exampleWrapper}>
                                <Text style={styles.exampleText}>"{def.example}"</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No detailed English definitions found.</Text>
                  )}
                </View>
              )}

              {activeTab === 'AI' && (
                <View style={styles.tabContent}>
                  <View style={styles.aiContextBox}>
                    <Text style={styles.aiLabel}>CONTEXTUAL INTERPRETATION</Text>
                    <Text style={styles.contextSentence}>"{sentence}"</Text>
                    <Text style={styles.aiExplanation}>
                      In this sentence, <Text style={styles.boldText}>{word}</Text> means:{' '}
                      <Text style={styles.italicText}>
                        {dictData?.meanings?.[0]?.definitions?.[0]?.definition?.toLowerCase() ||
                          viTranslation?.toLowerCase() ||
                          'its standard contextual meaning'}
                      </Text>
                      .
                    </Text>
                  </View>

                  <View style={styles.generalBox}>
                    <Text style={styles.sectionLabel}>General Definition</Text>
                    <Text style={styles.generalText}>
                      Generally, <Text style={styles.boldText}>{word}</Text> refers to:{' '}
                      {dictData?.meanings?.[0]?.definitions?.[0]?.definition ||
                        viTranslation ||
                        'the concept described above'}
                      .
                    </Text>
                  </View>

                  {dictData?.origin && (
                    <View style={styles.originBox}>
                      <Text style={styles.sectionLabel}>Word Origin</Text>
                      <Text style={styles.originText}>{dictData.origin}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Footer CTA */}
        {!loading && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveCtaBtn} onPress={handleAddToVocabLab}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveCtaText}>Save Word to Vocab Lab</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}
