import React, { useState, useRef, useEffect } from 'react';
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
import { apiClient } from '@/services/api-client';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Markdown from 'react-native-markdown-display';

type SuggestionMsg = {
  id: string;
  label: string;
  actionType: 'EXPLAIN_NOTE' | 'ADD_VOCAB';
  payload: {
    query?: string;
    word?: string;
    definition?: string;
  };
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
      content: `Hello${user?.firstName ? `, ${user.firstName}` : ''}! I'm Lexon AI, your personal IELTS study assistant. How can I help you today?`,
      suggestions: welcomeSuggestions,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Save history to AsyncStorage whenever messages change (except if only default welcome message remains)
  useEffect(() => {
    const saveHistory = async () => {
      try {
        if (
          messages.length === 1 &&
          messages[0].suggestions?.length === 3 &&
          messages[0].suggestions[0].id.startsWith('welcome-')
        ) {
          return; // Don't save initial default screen state
        }
        const historyToSave = messages.slice(-50);
        await AsyncStorage.setItem('chat-ai-history', JSON.stringify(historyToSave));
      } catch (e) {
        if (__DEV__) console.error('Failed to save chat history:', e);
      }
    };
    saveHistory();
  }, [messages]);

  // Handle word lookup on mount if passed as query params
  useEffect(() => {
    if (params.word) {
      const context = params.context || '';
      handleWordExplanation(params.word, context);
    }
  }, [params.word]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('chat-ai-history');
      setMessages([
        {
          role: 'model',
          content: `Hello${user?.firstName ? `, ${user.firstName}` : ''}! I'm Lexon AI, your personal IELTS study assistant. How can I help you today?`,
          suggestions: welcomeSuggestions,
        },
      ]);
    } catch (e) {
      if (__DEV__) console.error('Failed to clear chat history:', e);
    }
  };

  const handleWordExplanation = async (word: string, context: string) => {
    if (isTyping) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const queryMsg = `Explain the word "${word}"`;
    const newMessages = [...messages, { role: 'user', content: queryMsg } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    // Add empty model message for streaming
    setMessages((prev) => [...prev, { role: 'model', content: '' }]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const detailedPrompt = `Act as an expert English Teacher. Explain the word "${word}" from the sentence: "${context}". Explain its meaning, word class, pronunciation, how it fits in this specific context, and how it is used in the IELTS exam. Keep it clean, structured, and highly conversational.`;

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: detailedPrompt }],
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            text += content;

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
        }
      }

      // Complete lookup with custom suggestions
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'model') {
          const backupDefinition = text.length > 120 ? text.substring(0, 120) + '...' : text;
          next[next.length - 1].suggestions = [
            {
              id: `add-vocab-${Date.now()}`,
              label: `⭐ Save "${word}" to Vocab Lab`,
              actionType: 'ADD_VOCAB',
              payload: { word, definition: backupDefinition },
            },
            {
              id: `explain-more-${Date.now()}`,
              label: `📖 Give example sentences for "${word}"`,
              actionType: 'EXPLAIN_NOTE',
              payload: {
                query: `Give me 3 example sentences using the word "${word}" in IELTS contexts.`,
              },
            },
            {
              id: `synonyms-${Date.now()}`,
              label: `🔄 Synonyms & Antonyms of "${word}"`,
              actionType: 'EXPLAIN_NOTE',
              payload: { query: `What are some common IELTS synonyms and antonyms for "${word}"?` },
            },
          ];
        }
        return next;
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (__DEV__) console.log('Lookup stream aborted');
        return;
      }
      if (__DEV__) console.error('Lexon AI lookup error:', error);
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'model') {
          next[next.length - 1] = {
            role: 'model',
            content: 'Sorry, I failed to generate the explanation. Please try again.',
          };
        }
        return next;
      });
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
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

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newMessages = [...messages, { role: 'user', content: userText } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    // Add empty model message for streaming
    setMessages((prev) => [...prev, { role: 'model', content: '' }]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages,
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            text += content;

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
        }
      }

      // Completed normal stream, let's offer interactive IELTS suggestions!
      setMessages((prev) => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'model') {
          next[next.length - 1].suggestions = [
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
          ];
        }
        return next;
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (__DEV__) console.log('Stream aborted');
        return;
      }
      if (__DEV__) console.error('Lexon AI streaming error:', error);

      // Fallback to standard non-streaming API call
      try {
        const res = await apiClient.post<{ response: string }>('/chat', {
          messages: newMessages,
          stream: false,
        });
        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0 && next[next.length - 1].role === 'model') {
            next[next.length - 1] = {
              role: 'model',
              content: res.response,
              suggestions: [
                {
                  id: `suggest-retry-${Date.now()}`,
                  label: '🔄 Try asking again',
                  actionType: 'EXPLAIN_NOTE',
                  payload: { query: userText },
                },
              ],
            };
          }
          return next;
        });
      } catch (fallbackError) {
        if (__DEV__) console.error('Fallback error:', fallbackError);
        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0 && next[next.length - 1].role === 'model') {
            next[next.length - 1] = {
              role: 'model',
              content:
                'Sorry, I encountered an error. Please check your internet connection and try again.',
            };
          }
          return next;
        });
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = async (index: number, suggestion: SuggestionMsg) => {
    // Remove suggestion from bubble so user knows it's clicked
    setMessages((prev) => {
      const next = [...prev];
      if (next[index] && next[index].suggestions) {
        next[index].suggestions = next[index].suggestions?.filter((s) => s.id !== suggestion.id);
      }
      return next;
    });

    if (suggestion.actionType === 'EXPLAIN_NOTE') {
      await handleSend(suggestion.payload.query || suggestion.label);
    } else if (suggestion.actionType === 'ADD_VOCAB') {
      const { word, definition } = suggestion.payload;
      DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
        front: word || '',
        back: definition || '',
        tags: ['AI-Chat'],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
          <Text style={styles.headerTitle}>Lexon AI</Text>
        </View>

        <View style={styles.headerActions}>
          {messages.length > 1 && (
            <TouchableOpacity
              style={styles.trashBtn}
              onPress={handleClearHistory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={24} color="#64748b" />
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
                    <View style={styles.aiAvatar}>
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
                      isUser ? styles.messageBubbleUser : styles.messageBubbleAI,
                    ]}
                  >
                    {isUser ? (
                      <Text style={[styles.messageText, styles.messageTextUser]}>
                        {msg.content}
                      </Text>
                    ) : msg.content ? (
                      <Markdown style={markdownStyles}>{msg.content}</Markdown>
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
                        style={styles.suggestionPill}
                        onPress={() => handleSuggestionClick(index, s)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.suggestionText}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {isTyping && messages[messages.length - 1]?.content === '' && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAI, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#9C6FEF" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="paper-plane" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  heading1: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4,
    color: '#0f172a',
  },
  heading2: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 4,
    color: '#1e293b',
  },
  strong: {
    fontFamily: FONTS.bold,
  },
  em: {
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#e11d48',
  },
  code_block: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 2,
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
} as any;

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
    color: '#4f39e5',
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
