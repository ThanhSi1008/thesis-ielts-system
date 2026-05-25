import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FONTS, API_BASE_URL, STORAGE_KEYS } from '@/constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api-client';
import { vocabLabApi } from '@/services';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Markdown from 'react-native-markdown-display';

type SuggestionMsg = {
  id: string;
  label: string;
  actionType: 'EXPLAIN_NOTE' | 'ADD_VOCAB';
  payload: any;
};

type Message = {
  role: 'user' | 'model';
  content: string;
  suggestions?: SuggestionMsg[];
};

export default function ChatAIScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ word?: string; context?: string }>();
  const { colors, isDark } = useTheme();

  // Dynamic markdown styling supporting dark mode text colors
  const dynamicMarkdownStyles = useMemo(() => ({
    body: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    heading1: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      marginTop: 8,
      marginBottom: 4,
      color: colors.text,
    },
    heading2: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      marginTop: 6,
      marginBottom: 4,
      color: colors.text,
    },
    strong: {
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.text,
    },
    code_inline: {
      backgroundColor: isDark ? colors.surface : '#f1f5f9',
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: isDark ? '#fb7185' : '#e11d48',
    },
    code_block: {
      backgroundColor: isDark ? '#020617' : '#1e293b',
      borderRadius: 8,
      padding: 12,
      color: '#f8fafc',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    list_item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 2,
      marginBottom: 2,
      color: colors.text,
    },
    bullet_list: {
      marginTop: 4,
      marginBottom: 4,
    },
    ordered_list: {
      marginTop: 4,
      marginBottom: 4,
    },
    paragraph: {
      marginTop: 4,
      marginBottom: 4,
    },
  } as any), [colors, isDark]);

  const welcomeSuggestions: SuggestionMsg[] = [
    {
      id: 'welcome-suggest-1',
      label: '📝 Practice IELTS Writing Task 2',
      actionType: 'EXPLAIN_NOTE',
      payload: {
        query: 'Give me an IELTS Writing Task 2 prompt and guide me on how to structure it.',
      },
    },
    {
      id: 'welcome-suggest-2',
      label: '🗣️ Practice IELTS Speaking Part 1',
      actionType: 'EXPLAIN_NOTE',
      payload: { query: 'Let’s practice IELTS Speaking Part 1. Ask me the first question.' },
    },
    {
      id: 'welcome-suggest-3',
      label: '💡 Explain Active vs Passive Voice',
      actionType: 'EXPLAIN_NOTE',
      payload: {
        query:
          'Can you explain the difference between active and passive voice with IELTS examples?',
      },
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello${user?.firstName ? `, **${user.firstName}**` : ''}! I'm **Lexon AI**, your personal IELTS study assistant. How can I help you today?`,
      suggestions: welcomeSuggestions,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Card Type states
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [activeCardTypeId, setActiveCardTypeId] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom card types on mount
  useEffect(() => {
    const loadCardTypes = async () => {
      try {
        const ctList = await vocabLabApi.getCardTypes();
        setCardTypes(ctList || []);
        if (ctList && ctList.length > 0) {
          const preferredId = await AsyncStorage.getItem('preferredExplanationCardTypeId');
          const preferredType = ctList.find((t: any) => t.id === preferredId);
          if (preferredType) {
            setActiveCardTypeId(preferredType.id);
          } else {
            const defaultBuiltIn = ctList.find((t: any) => t.isBuiltIn) || ctList[0];
            setActiveCardTypeId(defaultBuiltIn.id);
          }
        }
      } catch (e) {
        if (__DEV__) console.error('Failed to load card types in chat-ai:', e);
      }
    };
    loadCardTypes();
  }, []);

  // Load chat history from AsyncStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('chat-ai-history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        if (__DEV__) console.error('Failed to load chat history:', e);
      }
    };
    loadHistory();
  }, []);

  // Save history to AsyncStorage
  useEffect(() => {
    const saveHistory = async () => {
      try {
        if (
          messages.length === 1 &&
          messages[0].suggestions?.length === 3 &&
          messages[0].suggestions[0].id.startsWith('welcome-')
        ) {
          return;
        }
        const historyToSave = messages.slice(-50);
        await AsyncStorage.setItem('chat-ai-history', JSON.stringify(historyToSave));
      } catch (e) {
        if (__DEV__) console.error('Failed to save chat history:', e);
      }
    };
    saveHistory();
  }, [messages]);

  // Handle word lookup on mount once cardTypes are ready (web style)
  useEffect(() => {
    if (params.word && cardTypes.length > 0) {
      const context = params.context || '';
      triggerInitialWordLookup(params.word, context);
    }
  }, [params.word, cardTypes]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const triggerInitialWordLookup = async (word: string, context: string) => {
    try {
      const preferredId = await AsyncStorage.getItem('preferredExplanationCardTypeId');
      const preferredType = cardTypes.find((t) => t.id === preferredId);

      if (preferredType) {
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: `Explain "${word}" as ${preferredType.name}`,
          },
        ]);
        setTimeout(() => {
          explainAsCardType(word, context, preferredType, cardTypes);
        }, 50);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `Hello! Curious about the word **"${word}"** from your practice? I'm here to help.\n\nPlease choose a format below to explain it:`,
            suggestions: cardTypes.map((t: any) => ({
              id: t.id,
              label: `Explain as ${t.name}`,
              actionType: "EXPLAIN_NOTE" as const,
              payload: {
                word: word,
                context: context,
                cardType: t,
                allCardTypes: cardTypes,
              },
            })),
          },
        ]);
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to trigger lookup:', error);
    }
  };

  // Explain word formatted specifically as a Card Type (web logic)
  const explainAsCardType = useCallback(async (
    word: string,
    context: string,
    cardType: any,
    allCardTypes: any[],
  ) => {
    setIsTyping(true);
    const fieldDescriptions = cardType.fields
      .map(
        (f: { name: string; description?: string | null }) => `"${f.name}"${f.description ? ` (${f.description})` : ""}`,
      )
      .join(", ");

    try {
      const prompt = `Act as an expert English Teacher. The user highlighted the word/phrase '${word}' from the sentence: "${context}". Use the **${cardType.name}** card type format to explain it. Cover precisely these aspects based on their descriptions: ${fieldDescriptions}. Make the explanation clear, conversational, and highly educational.`;

      // Add placeholder
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      const res = await apiClient.post<{ response: string }>("/chat", {
        messages: [{ role: "user", content: prompt }],
        stream: false,
      });

      const fullText = res.response;
      let text = '';
      let index = 0;
      const charsPerStep = fullText.length > 500 ? 5 : 2;

      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = setInterval(() => {
        index += charsPerStep;
        if (index >= fullText.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'model') {
              next[next.length - 1] = {
                role: 'model',
                content: fullText,
                suggestions: [
                  {
                    id: "add-vocab",
                    label: `Add to Vocab Lab`,
                    actionType: "ADD_VOCAB" as const,
                    payload: { word, context, cardType },
                  },
                  ...(allCardTypes || [])
                    .filter((t: any) => t.id !== cardType.id)
                    .map((t: any) => ({
                      id: t.id,
                      label: `Explain as ${t.name}`,
                      actionType: "EXPLAIN_NOTE" as const,
                      payload: { word, context, cardType: t, allCardTypes },
                    })),
                ],
              };
            }
            return next;
          });
          setIsTyping(false);
        } else {
          text = fullText.substring(0, index);
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'model') {
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: text,
              };
            }
            return next;
          });
        }
      }, 12);

      await AsyncStorage.setItem('preferredExplanationCardTypeId', cardType.id);
      setActiveCardTypeId(cardType.id);
    } catch (error) {
      if (__DEV__) console.error("Generation error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I failed to generate the explanation. Please try again.",
        },
      ]);
      setIsTyping(false);
    }
  }, []);

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('chat-ai-history');
      setMessages([
        {
          role: 'model',
          content: `Hello${user?.firstName ? `, **${user.firstName}**` : ''}! I'm **Lexon AI**, your personal IELTS study assistant. How can I help you today?`,
          suggestions: welcomeSuggestions,
        },
      ]);
    } catch (e) {
      if (__DEV__) console.error('Failed to clear chat history:', e);
    }
  };

  const handleSend = async (customInput?: string) => {
    if (isTyping) return;

    const userText = customInput !== undefined ? customInput : input.trim();
    if (!userText) return;

    if (customInput === undefined) {
      setInput('');
    }
    Keyboard.dismiss();

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newMessages = [...messages, { role: 'user', content: userText } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    setMessages((prev) => [...prev, { role: 'model', content: '' }]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await apiClient.post<{ response: string }>('/chat', {
        messages: newMessages,
        stream: false,
      });

      const fullText = res.response;
      let text = '';
      let index = 0;
      const charsPerStep = fullText.length > 500 ? 5 : 2;

      typingIntervalRef.current = setInterval(() => {
        index += charsPerStep;
        if (index >= fullText.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'model') {
              next[next.length - 1] = {
                role: 'model',
                content: fullText,
                suggestions: [
                  {
                    id: `suggest-more-${Date.now()}`,
                    label: '📈 Ask for IELTS preparation tips',
                    actionType: 'EXPLAIN_NOTE',
                    payload: { query: 'Can you give me some tips to improve my overall IELTS score?' },
                  },
                  {
                    id: `suggest-quiz-${Date.now()}`,
                    label: '🎯 Quiz me on IELTS Vocabulary',
                    actionType: 'EXPLAIN_NOTE',
                    payload: {
                      query: 'Quiz me on 5 essential IELTS vocabulary words. Show one at a time.',
                    },
                  },
                ],
              };
            }
            return next;
          });
          setIsTyping(false);
        } else {
          text = fullText.substring(0, index);
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'model') {
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: text,
              };
            }
            return next;
          });
        }
      }, 12);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (__DEV__) console.log('Stream aborted');
        return;
      }
      if (__DEV__) console.error('Lexon AI chat error:', error);
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'model') {
          next[next.length - 1] = {
            role: 'model',
            content: 'Sorry, I encountered an error. Please check your internet connection and try again.',
          };
        }
        return next;
      });
      setIsTyping(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = async (
    messageIndex: number,
    suggestion: SuggestionMsg,
  ) => {
    // Remove only the clicked suggestion, keeping others visible
    setMessages((prev) => {
      const newMsgs = [...prev];
      const msg = { ...newMsgs[messageIndex] };
      if (msg.suggestions) {
        msg.suggestions = msg.suggestions.filter((s) => s.id !== suggestion.id);
      }
      newMsgs[messageIndex] = msg;
      newMsgs.push({ role: 'user', content: suggestion.label });
      return newMsgs;
    });

    if (suggestion.actionType === 'EXPLAIN_NOTE') {
      const { word, context, cardType, allCardTypes } = suggestion.payload as { word: string; context: string; cardType: any; allCardTypes: any[] };
      await explainAsCardType(word, context, cardType, allCardTypes);
    } else if (suggestion.actionType === 'ADD_VOCAB') {
      const { word, context, cardType } = suggestion.payload as { word: string; context: string; cardType: any };
      const fieldDescriptions = cardType.fields
        .map(
          (f: { name: string; description?: string | null }) =>
            `"${f.name}"${f.description ? ` (${f.description})` : ""}`,
        )
        .join(", ");
      const fieldKeys = cardType.fields.map((f: { name: string }) => f.name).join(", ");

      setIsTyping(true);
      try {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: 'Generating card data...' },
        ]);

        const prompt = `Act as an expert English Teacher generating a flashcard for the word '${word}' from the sentence: "${context}". Use the **${cardType.name}** card type. Generate content fulfilling these fields: ${fieldDescriptions}. Return a strictly formatted JSON object where the keys are exactly these field names: [${fieldKeys}] and the values are strings of the generated content. Do not include markdown blocks, explanation text, or anything other than the raw JSON object.`;

        const response = await apiClient.post<{ response: string }>('/chat', {
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        });

        let jsonStr = response.response || '';
        if (jsonStr.startsWith('```json'))
          jsonStr = jsonStr.replace(/```json\n?/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```\n?/, '');
        jsonStr = jsonStr.replace(/```\n?$/, '');

        const generatedFields = JSON.parse(jsonStr.trim());

        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: 'model',
            content: `Awesome! I have generated the content. Opening your Vocab Lab so you can review and save it...`,
          };
          return newMsgs;
        });

        // Trigger Quick Add Card prefilled exactly matching web!
        DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
          front: word,
          back: context,
          tags: ['AI-Chat'],
          AICardType: cardType,
          AIFieldValues: generatedFields,
        });
      } catch (error) {
        if (__DEV__) console.error('Generation error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: 'Sorry, I failed to generate the card fields. This might be due to an AI response error. Please try again.',
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleContainer}>
          <Svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <Defs>
              <LinearGradient id="gemini-grad-header" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#4285F4" />
                <Stop offset="50%" stopColor="#9C6FEF" />
                <Stop offset="100%" stopColor="#EA4335" />
              </LinearGradient>
            </Defs>
            <Path
              d="M14 2C14 2 14.8 8.4 17.6 11.2C20.4 14 26.8 14 26.8 14C26.8 14 20.4 14 17.6 16.8C14.8 19.6 14 26 14 26C14 26 13.2 19.6 10.4 16.8C7.6 14 1.2 14 1.2 14C1.2 14 7.6 14 10.4 11.2C13.2 8.4 14 2 14 2Z"
              fill="url(#gemini-grad-header)"
            />
          </Svg>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lexon AI</Text>
        </View>

        <View style={styles.headerActions}>
          {messages.length > 1 && (
            <TouchableOpacity
              style={[styles.trashBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2' }]}
              onPress={handleClearHistory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <View key={index} style={{ marginBottom: 12 }}>
                <View
                  style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}
                >
                  {!isUser && (
                    <View style={[styles.aiAvatar, { backgroundColor: isDark ? colors.surface : '#1e293b' }]}>
                      <Svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                        <Defs>
                          <LinearGradient id="gemini-grad-avatar" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0%" stopColor="#4285F4" />
                            <Stop offset="50%" stopColor="#9C6FEF" />
                            <Stop offset="100%" stopColor="#EA4335" />
                          </LinearGradient>
                        </Defs>
                        <Path
                          d="M14 2C14 2 14.8 8.4 17.6 11.2C20.4 14 26.8 14 26.8 14C26.8 14 20.4 14 17.6 16.8C14.8 19.6 14 26 14 26C14 26 13.2 19.6 10.4 16.8C7.6 14 1.2 14 1.2 14C1.2 14 7.6 14 10.4 11.2C13.2 8.4 14 2 14 2Z"
                          fill="url(#gemini-grad-avatar)"
                        />
                      </Svg>
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.messageBubbleUser, { backgroundColor: isDark ? colors.surface : '#111111' }]
                        : [styles.messageBubbleAI, { backgroundColor: colors.card, borderColor: colors.border }],
                    ]}
                  >
                    {isUser ? (
                      <Text style={[styles.messageText, styles.messageTextUser, isDark && { color: colors.text }]}>
                        {msg.content}
                      </Text>
                    ) : msg.content ? (
                      <Markdown style={dynamicMarkdownStyles}>{msg.content}</Markdown>
                    ) : (
                      <ActivityIndicator
                        size="small"
                        color="#9C6FEF"
                        style={{ alignSelf: 'flex-start' }}
                      />
                    )}
                  </View>
                </View>

                {/* Suggestions UI */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {msg.suggestions.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.suggestionPill, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleSuggestionClick(index, s)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.suggestionText, { color: isDark ? colors.primary : '#8B5CF6' }]}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: isDark ? colors.primary : '#1e293b' },
              (!input.trim() || isTyping) && [styles.sendBtnDisabled, { backgroundColor: isDark ? colors.surface : '#94a3b8' }],
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="paper-plane" size={20} color={isDark ? colors.onPrimary : '#FFF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTypeSelectorRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTypeSelectorLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTypePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cardTypePillActive: {
    backgroundColor: '#8B5CF6',
  },
  cardTypePillText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#475569',
  },
  cardTypePillTextActive: {
    color: '#FFFFFF',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    maxWidth: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubbleUser: {
    backgroundColor: '#111111',
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typingBubble: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAI: {
    color: '#334155',
  },
  suggestionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
    marginLeft: 36,
    maxWidth: '85%',
  },
  suggestionPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#8B5CF6',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#0f172a',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
});
