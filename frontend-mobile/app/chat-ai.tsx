import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api-client';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Markdown from 'react-native-markdown-display';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

type ToolAction = {
  tool: string;
  displayName: string;
  phase: 'calling' | 'done';
  summary?: string;
};

type Message = {
  role: 'user' | 'model';
  content: string;
  toolActions?: ToolAction[];
};

function decodeUtf8(array: Uint8Array): string {
  let out = "";
  let i = 0;
  const len = array.length;
  while (i < len) {
    const c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        const char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        const char2_3 = array[i++];
        const char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2_3 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}

export default function ChatAIScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello${user?.firstName ? `, ${user.firstName}` : ''}! I'm Lexon AI, your personal IELTS study assistant. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when messages change or typing status changes
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    Keyboard.dismiss();
    
    const newMessages = [...messages, { role: 'user', content: userText } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw response;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream not supported');
      }

      let text = "";
      let toolActions: ToolAction[] = [];
      let sseBuffer = "";

      // Add a pending message to the UI
      setMessages([...newMessages, { role: "model", content: "", toolActions: [] }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuffer += decodeUtf8(value);

        // Split on double newline (SSE event boundary)
        const events = sseBuffer.split("\n\n");
        sseBuffer = events.pop() || "";

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          if (rawEvent.startsWith("event: status")) {
            const dataLine = rawEvent.split("\n").find((l: string) => l.startsWith("data: "));
            if (dataLine) {
              try {
                const status = JSON.parse(dataLine.slice(6));
                const action: ToolAction = {
                  tool: status.tool,
                  displayName: status.displayName || status.tool,
                  phase: status.phase,
                  summary: status.summary,
                };
                if (status.phase === "done") {
                  toolActions = toolActions.map((a) =>
                    a.tool === status.tool && a.phase === "calling" ? action : a
                  );
                } else {
                  toolActions = [...toolActions, action];
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated.length > 0) {
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      toolActions: [...toolActions],
                    };
                  }
                  return updated;
                });
              } catch { /* ignore */ }
            }
            continue;
          }

          if (rawEvent.startsWith("data: ")) {
            const content = rawEvent.slice(6);
            text += content;
            setMessages((prev) => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: text,
                };
              }
              return updated;
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Lexon AI error:', error);
      const status = error?.status || (error instanceof Response ? error.status : null);
      const isRateLimit = status === 429;
      const isUnavailable = status === 503;
      
      let errMsg = 'Sorry, I encountered an error. Please check your internet connection and try again.';
      if (isRateLimit) {
        errMsg = 'AI is currently busy. Please wait a minute and try again.';
      } else if (isUnavailable) {
        errMsg = 'AI servers are experiencing high demand. Please try again later.';
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errMsg 
      }]);
    } finally {
      setIsTyping(false);
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
        <TouchableOpacity 
          style={styles.closeBtn} 
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
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
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <View 
                key={index} 
                style={[
                  styles.messageRow, 
                  isUser ? styles.messageRowUser : styles.messageRowAI
                ]}
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
                
                <View style={[
                  styles.messageBubble,
                  isUser ? styles.messageBubbleUser : styles.messageBubbleAI
                ]}>
                  {!isUser && msg.toolActions && msg.toolActions.length > 0 && (
                    <View style={styles.toolActionsContainer}>
                      {msg.toolActions.map((action, aIdx) => (
                        <View
                          key={`${action.tool}-${aIdx}`}
                          style={[
                            styles.toolActionPill,
                            action.phase === 'calling'
                              ? styles.toolActionCalling
                              : styles.toolActionDone
                          ]}
                        >
                          {action.phase === 'calling' ? (
                            <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 6 }} />
                          ) : (
                            <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6 }} />
                          )}
                          <Text style={[
                            styles.toolActionText,
                            action.phase === 'calling' ? styles.toolActionTextCalling : styles.toolActionTextDone
                          ]}>
                            {action.phase === 'calling'
                              ? `${action.displayName}...`
                              : action.summary || action.displayName}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {(msg.content || !(msg.toolActions && msg.toolActions.length > 0)) && (
                    isUser ? (
                      <Text style={[styles.messageText, styles.messageTextUser]}>
                        {msg.content}
                      </Text>
                    ) : (
                      <Markdown style={markdownStyles}>
                        {msg.content}
                      </Markdown>
                    )
                  )}
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAI, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#94a3b8" />
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
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]} 
            onPress={handleSend}
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
    fontFamily: 'Farro-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  heading1: {
    fontFamily: 'Farro-Bold',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4,
    color: '#0f172a',
  },
  heading2: {
    fontFamily: 'Farro-Bold',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 4,
    color: '#1e293b',
  },
  strong: {
    fontFamily: 'Farro-Bold',
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
  }
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
    fontFamily: 'Farro-Bold',
    fontSize: 18,
    color: '#0f172a',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
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
    marginBottom: 8,
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
    fontFamily: 'Farro-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAI: {
    color: '#334155',
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
    fontFamily: 'Farro-Regular',
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
  toolActionsContainer: {
    marginBottom: 8,
    gap: 6,
  },
  toolActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolActionCalling: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  toolActionDone: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  toolActionText: {
    fontSize: 12,
    fontFamily: 'Farro-Medium',
  },
  toolActionTextCalling: {
    color: '#2563eb',
  },
  toolActionTextDone: {
    color: '#059669',
  },
});
