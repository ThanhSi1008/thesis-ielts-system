'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import type { NoteType } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

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

const renderMessageContent = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export function GlobalAIChatFab() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hello! I am your AI assistant. How can I help you studying today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const handleOpen = async (e: any) => {
      setIsOpen(true);
      if (e.detail?.word && e.detail?.context) {
        try {
          const types = await vocabLabApi.getNoteTypes();
          setMessages(prev => [
            ...prev,
            { 
              role: 'model', 
              content: `Hello! Curious about the word **"${e.detail.word}"** from your practice? I'm here to help.\n\nPlease choose a format below to explain it:`,
              suggestions: types.map(t => ({
                id: t.id,
                label: `Explain as ${t.name}`,
                actionType: 'EXPLAIN_NOTE',
                payload: { word: e.detail.word, context: e.detail.context, noteType: t }
              }))
            }
          ]);
        } catch (error) {
          // Fallback if notetypes fail to load
          setMessages(prev => [
            ...prev,
            { role: 'model', content: `I see you highlighted the term **"${e.detail.word}"** from the context:\n*"${e.detail.context}"*\n\nDo you have any questions about its meaning, pronunciation, or usage in the IELTS test?` }
          ]);
        }
      }
    };
    window.addEventListener('open-ai-chat-fab', handleOpen);
    return () => window.removeEventListener('open-ai-chat-fab', handleOpen);
  }, []);

  const handleSuggestionClick = async (messageIndex: number, suggestion: SuggestionMsg) => {
    // Remove suggestions from the clicked message
    setMessages(prev => {
      const newMsgs = [...prev];
      const msg = { ...newMsgs[messageIndex] };
      delete msg.suggestions;
      newMsgs[messageIndex] = msg;
      // Add user message to show what they clicked
      newMsgs.push({ role: 'user', content: suggestion.label });
      return newMsgs;
    });

    setIsTyping(true);

    if (suggestion.actionType === 'EXPLAIN_NOTE') {
      const { word, context, noteType } = suggestion.payload;
      const fieldsStr = noteType.fields.map((f: any) => f.name).join(', ');

      try {
        const prompt = `Act as an expert English Teacher. The user highlighted the word '${word}' from the sentence: "${context}". Explain this word in detail based precisely on these aspects from the ${noteType.name} template: [${fieldsStr}]. Make the explanation clear, conversational, and highly educational.`;

        const response = await axios.post('http://localhost:8000/api/v1/chat', {
          messages: [{ role: 'user', content: prompt }]
        });

        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content: response.data.response,
            suggestions: [
              {
                id: 'add-vocab',
                label: `Add to Vocab Lab`,
                actionType: 'ADD_VOCAB',
                payload: { word, context, noteType }
              }
            ]
          }
        ]);
      } catch (error) {
        console.error('Generation error:', error);
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I failed to generate the explanation. Please try again.' }]);
      } finally {
        setIsTyping(false);
      }
    } else if (suggestion.actionType === 'ADD_VOCAB') {
      const { word, context, noteType } = suggestion.payload;
      const fieldsStr = noteType.fields.map((f: any) => f.name).join(', ');

      try {
        // Add a temporary matching response
        setMessages(prev => [...prev, { role: 'model', content: 'Generating card data...' }]);

        const prompt = `Act as an expert English Teacher generating a flashcard for the word '${word}' from the sentence: "${context}". Generate content based on this schema: [${fieldsStr}]. Return a strictly formatted JSON object where the keys are exactly the field names ([${fieldsStr}]) and the values are strings of the generated content. Do not include markdown blocks, explanation text, or anything other than the raw JSON object.`;

        const response = await axios.post('http://localhost:8000/api/v1/chat', {
          messages: [{ role: 'user', content: prompt }]
        });

        let jsonStr = response.data.response || '';
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json\n?/, '');
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```\n?/, '');
        jsonStr = jsonStr.replace(/```\n?$/, '');

        const generatedFields = JSON.parse(jsonStr.trim());

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', content: `Awesome! I have generated the content. Opening your Vocab Lab so you can review and save it...` };
          return newMsgs;
        });

        window.dispatchEvent(new CustomEvent('open-vocab-fab'));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('vocab-lab-prefill', {
            detail: {
              word: word,
              context: context,
              AINoteType: noteType,
              AIFieldValues: generatedFields
            }
          }));
        }, 500);
      } catch (error) {
        console.error('Generation error:', error);
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I failed to generate the card fields. This might be due to an AI response error. Please try again.' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    const target = e.currentTarget.parentElement!;
    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/chat', {
        messages: newMessages
      });
      setMessages([...newMessages, { role: 'model', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'model', content: 'Sorry, I encountered an error and cannot process your message right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[8999] flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 focus:outline-none group"
        title="Gemini AI Chat"
      >
        {isOpen ? (
          <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gemini-grad-fab" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="50%" stopColor="#9C6FEF" />
                <stop offset="100%" stopColor="#EA4335" />
              </linearGradient>
            </defs>
            <path
              d="M14 2C14 2 14.8 8.4 17.6 11.2C20.4 14 26.8 14 26.8 14C26.8 14 20.4 14 17.6 16.8C14.8 19.6 14 26 14 26C14 26 13.2 19.6 10.4 16.8C7.6 14 1.2 14 1.2 14C1.2 14 7.6 14 10.4 11.2C13.2 8.4 14 2 14 2Z"
              fill="url(#gemini-grad-fab)"
            />
          </svg>
        )}
      </button>

      {/* Non-blocking Floating Widget */}
      {isOpen && (
        <div
          style={{
            resize: 'both',
            left: pos.x !== null ? `${pos.x}px` : undefined,
            top: pos.y !== null ? `${pos.y}px` : undefined,
            bottom: pos.y !== null ? 'auto' : undefined,
            transition: isDragging ? 'none' : undefined
          }}
          className={`fixed bottom-[10vh] right-[100px] z-[9000] w-[400px] min-w-[300px] max-w-[90vw] h-[65vh] min-h-[400px] max-h-[85vh] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200 ${pos.x === null ? 'animate-fade-in-up' : ''}`}
        >
          {/* Modal Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center justify-between px-5 py-3.5 bg-white text-gray-900 border-b border-gray-100 z-10 sticky top-0 shrink-0 cursor-move select-none touch-none rounded-t-2xl"
          >
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gemini-grad-header" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="50%" stopColor="#9C6FEF" />
                    <stop offset="100%" stopColor="#EA4335" />
                  </linearGradient>
                </defs>
                <path
                  d="M14 2C14 2 14.8 8.4 17.6 11.2C20.4 14 26.8 14 26.8 14C26.8 14 20.4 14 17.6 16.8C14.8 19.6 14 26 14 26C14 26 13.2 19.6 10.4 16.8C7.6 14 1.2 14 1.2 14C1.2 14 7.6 14 10.4 11.2C13.2 8.4 14 2 14 2Z"
                  fill="url(#gemini-grad-header)"
                />
              </svg>
              Gemini
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 flex flex-col gap-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-2 max-w-[85%] w-fit`}>
                  <div
                    className={`px-4 py-2.5 shadow-sm text-[14px] ${message.role === 'user'
                        ? 'bg-white text-gray-800 border border-gray-200 rounded-[20px] self-end hover:bg-gray-50 transition-colors'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm self-start'
                      }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 w-full items-end">
                      {message.suggestions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSuggestionClick(idx, s)}
                          className="text-right bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-[20px] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 text-[14px]"
                        >
                           {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:bg-white transition-all"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900 transition-colors focus:outline-none"
              >
                <svg className="w-4 h-4 translate-x-[1px] translate-y-[-1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
