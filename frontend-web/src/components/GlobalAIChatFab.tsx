"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import axios from "axios";
import type { CardType } from "@/types";
import { vocabLabApi } from "@/services/vocabLab.api";
import api from "@/lib/api";

type SuggestionMsg = {
  id: string;
  label: string;
  actionType: "EXPLAIN_NOTE" | "ADD_VOCAB";
  payload: any;
};

type Message = {
  role: "user" | "model";
  content: string;
  suggestions?: SuggestionMsg[];
};

const parseInlineStyles = (line: string) => {
  if (!line) return null;
  const parts = line.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-gray-900 dark:text-gray-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-gray-800 dark:text-gray-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const renderMessageContent = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // 1. Divider (--- or ===)
    if (/^[=-]{3,}$/.test(trimmed)) {
      return <hr key={idx} className="my-4 border-gray-200/80" />;
    }

    // 2. Headers
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const parsed = parseInlineStyles(content);

      if (level === 1) return <h1 key={idx} className="text-[18px] font-bold mt-4 mb-2 text-indigo-600">{parsed}</h1>;
      if (level === 2) return <h2 key={idx} className="text-[16px] font-bold mt-3 mb-1.5 text-slate-800">{parsed}</h2>;
      if (level === 3) return <h3 key={idx} className="text-[14.5px] font-extrabold mt-3 mb-1 text-slate-700 uppercase tracking-widest">{parsed}</h3>;
      return <h4 key={idx} className="text-[14px] font-bold mt-2 mb-1 text-slate-600">{parsed}</h4>;
    }

    // 3. Bullets
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      const spaces = bulletMatch[1];
      const content = bulletMatch[3];
      return (
        <div key={idx} className="flex gap-2 min-h-[1.5em] mt-1" style={{ paddingLeft: `${spaces.length * 0.5}rem` }}>
          <span className="text-gray-400 select-none mt-[2px]">•</span>
          <div className="flex-1">{parseInlineStyles(content)}</div>
        </div>
      );
    }

    // 4. Numbered list
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const spaces = numberMatch[1];
      const num = numberMatch[2];
      const content = numberMatch[3];
      return (
        <div key={idx} className="flex gap-2 min-h-[1.5em] mt-1" style={{ paddingLeft: `${spaces.length * 0.5}rem` }}>
          <span className="text-gray-500 font-semibold select-none">{num}.</span>
          <div className="flex-1">{parseInlineStyles(content)}</div>
        </div>
      );
    }

    // Default paragraph line (can be empty for spacing)
    return (
      <div key={idx} className="min-h-[1.2em] leading-relaxed">
        {trimmed === "" ? <br /> : parseInlineStyles(line)}
      </div>
    );
  });
};

const NeutralBlackHoleIcon = ({ className }: { className?: string }) => (
  <div
    className={`relative flex items-center justify-center shrink-0 w-8 h-8 ${className || ""}`}
  >
    <style>{`
      @keyframes eye-blink {
        0%, 92%, 100% { transform: scaleY(1); }
        96% { transform: scaleY(0.1); }
      }
      .animate-bh-blink { animation: eye-blink 4s infinite ease-in-out; }
    `}</style>
    {/* Accretion disk */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-orange-400 opacity-60 animate-[spin_4s_linear_infinite] blur-[2px] scale-110"></div>
    {/* Inner dashed ring */}
    <div className="absolute inset-[2px] rounded-full border-[1.5px] border-dashed border-white/40 animate-[spin_6s_linear_infinite_reverse]"></div>

    {/* Event horizon */}
    <div className="absolute w-[20px] h-[20px] bg-[#0A0A0A] rounded-full shadow-[0_0_10px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center gap-[3px]">
      {/* Left Eye */}
      <div className="w-1 h-1 bg-white rounded-full animate-bh-blink"></div>
      {/* Right Eye */}
      <div className="w-1 h-1 bg-white rounded-full animate-bh-blink"></div>
    </div>
  </div>
);

export function GlobalAIChatFab() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        `Hello${user?.firstName ? `, **${user.firstName}**` : ''}! I'm **Lexon AI**, your personal IELTS study assistant. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- User context for RAG personalization ---
  const [streak, setStreak] = useState<number>(0);
  const [vocabDue, setVocabDue] = useState<number>(0);
  const [recentScores, setRecentScores] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!user) return;
    // Fetch streak
    api.get<{ currentStreak: number }>("/ielts/streak")
      .then(r => setStreak(r.data.currentStreak ?? 0))
      .catch(() => {});
    // Fetch vocab due
    vocabLabApi.getDecks()
      .then(decks => setVocabDue(decks.reduce((s, d) => s + d.newCount + d.learningCount + d.dueCount, 0)))
      .catch(() => {});
  }, [user]);

  const userContext = useMemo(() => ({
    name: user?.firstName || undefined,
    currentPage: pathname,
    studyStreak: streak || undefined,
    vocabDueCount: vocabDue || undefined,
    recentScores: Object.keys(recentScores).length ? recentScores : undefined,
  }), [user, pathname, streak, vocabDue, recentScores]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }),
        50,
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (isTyping) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "model") {
        // Scroll so the top of the AI's reply sits beautifully at the top of the chatbox
        const el = document.getElementById(`msg-${messages.length - 1}`);
        if (el) {
          setTimeout(
            () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
            50,
          );
        }
      } else {
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      }
    }
  }, [messages.length, isTyping]);

  const explainAsCardType = async (
    word: string,
    context: string,
    cardType: any,
    allCardTypes: any[],
  ) => {
    setIsTyping(true);
    const fieldDescriptions = cardType.fields
      .map(
        (f: any) => `"${f.name}"${f.description ? ` (${f.description})` : ""}`,
      )
      .join(", ");

    try {
      const prompt = `Act as an expert English Teacher. The user highlighted the word '${word}' from the sentence: "${context}". Use the **${cardType.name}** card type format to explain it. Cover precisely these aspects based on their descriptions: ${fieldDescriptions}. Make the explanation clear, conversational, and highly educational.`;

      const response = await axios.post("http://localhost:8000/api/v1/chat", {
        messages: [{ role: "user", content: prompt }],
        userContext,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: response.data.response,
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
        },
      ]);
      localStorage.setItem("preferredExplanationCardTypeId", cardType.id);
    } catch (error) {
      console.error("Generation error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Sorry, I failed to generate the explanation. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const handleOpen = async (e: any) => {
      setIsOpen(true);
      if (e.detail?.word && e.detail?.context) {
        try {
          const types = await vocabLabApi.getCardTypes();
          const preferredId = localStorage.getItem(
            "preferredExplanationCardTypeId",
          );
          const preferredType = types.find((t) => t.id === preferredId);

          if (preferredType) {
            setMessages((prev) => [
              ...prev,
              {
                role: "user",
                content: `Explain "${e.detail.word}" as ${preferredType.name}`,
              },
            ]);
            setTimeout(() => {
              explainAsCardType(
                e.detail.word,
                e.detail.context,
                preferredType,
                types,
              );
            }, 50);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                role: "model",
                content: `Hello! Curious about the word **"${e.detail.word}"** from your practice? I'm here to help.\n\nPlease choose a format below to explain it:`,
                suggestions: types.map((t: any) => ({
                  id: t.id,
                  label: `Explain as ${t.name}`,
                  actionType: "EXPLAIN_NOTE" as const,
                  payload: {
                    word: e.detail.word,
                    context: e.detail.context,
                    cardType: t,
                    allCardTypes: types,
                  },
                })),
              },
            ]);
          }
        } catch (error) {
          // Fallback if cardtypes fail to load
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              content: `I see you highlighted the term **"${e.detail.word}"** from the context:\n*"${e.detail.context}"*\n\nDo you have any questions about its meaning, pronunciation, or usage in the IELTS test?`,
            },
          ]);
        }
      }
    };
    window.addEventListener("open-ai-chat-fab", handleOpen);
    return () => window.removeEventListener("open-ai-chat-fab", handleOpen);
  }, []);

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
      // Add user message to show what they clicked
      newMsgs.push({ role: "user", content: suggestion.label });
      return newMsgs;
    });

    if (suggestion.actionType === "EXPLAIN_NOTE") {
      const { word, context, cardType, allCardTypes } = suggestion.payload;
      await explainAsCardType(word, context, cardType, allCardTypes);
    } else if (suggestion.actionType === "ADD_VOCAB") {
      const { word, context, cardType } = suggestion.payload;
      const fieldDescriptions = cardType.fields
        .map(
          (f: any) =>
            `"${f.name}"${f.description ? ` (${f.description})` : ""}`,
        )
        .join(", ");
      const fieldKeys = cardType.fields.map((f: any) => f.name).join(", ");

      try {
        // Add a temporary matching response
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "Generating card data..." },
        ]);

        const prompt = `Act as an expert English Teacher generating a flashcard for the word '${word}' from the sentence: "${context}". Use the **${cardType.name}** card type. Generate content fulfilling these fields: ${fieldDescriptions}. Return a strictly formatted JSON object where the keys are exactly these field names: [${fieldKeys}] and the values are strings of the generated content. Do not include markdown blocks, explanation text, or anything other than the raw JSON object.`;

        const response = await axios.post("http://localhost:8000/api/v1/chat", {
          messages: [{ role: "user", content: prompt }],
        });

        let jsonStr = response.data.response || "";
        if (jsonStr.startsWith("```json"))
          jsonStr = jsonStr.replace(/```json\n?/, "");
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/```\n?/, "");
        jsonStr = jsonStr.replace(/```\n?$/, "");

        const generatedFields = JSON.parse(jsonStr.trim());

        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "model",
            content: `Awesome! I have generated the content. Opening your Vocab Lab so you can review and save it...`,
          };
          return newMsgs;
        });

        window.dispatchEvent(new CustomEvent("open-vocab-fab"));
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("vocab-lab-prefill", {
              detail: {
                word: word,
                context: context,
                AICardType: cardType,
                AIFieldValues: generatedFields,
              },
            }),
          );
        }, 500);
      } catch (error) {
        console.error("Generation error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content:
              "Sorry, I failed to generate the card fields. This might be due to an AI response error. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    const target = e.currentTarget.parentElement!;
    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:8000/api/v1/chat", {
        messages: newMessages,
        userContext,
      });
      setMessages([
        ...newMessages,
        { role: "model", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "model",
          content:
            "Sorry, I encountered an error and cannot process your message right now.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const isTakePage = pathname.includes("/take/") || pathname.includes("/practice/") || pathname.endsWith("/start") || pathname === "/ielts/basic/onboarding";

  if (!user || isTakePage) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[8999] flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 focus:outline-none group"
        title="Lexon AI"
      >
        {isOpen ? (
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            resize: "both",
            left: pos.x !== null ? `${pos.x}px` : undefined,
            top: pos.y !== null ? `${pos.y}px` : undefined,
            bottom: pos.y !== null ? "auto" : undefined,
            transition: isDragging ? "none" : undefined,
          }}
          className={`fixed bottom-[10vh] right-[100px] z-[9000] w-[475px] min-w-[300px] max-w-[90vw] h-[80vh] min-h-[400px] max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 ${pos.x === null ? "animate-fade-in-up" : ""}`}
        >
          {/* Modal Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 z-10 sticky top-0 shrink-0 cursor-move select-none touch-none rounded-t-2xl"
          >
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gemini-grad-header"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
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
              Lexon AI
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors focus:outline-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-950 flex flex-col gap-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {messages.map((message, idx) => (
              <div
                key={idx}
                id={`msg-${idx}`}
                className="flex flex-col gap-2 w-full"
              >
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "model" && (
                    <NeutralBlackHoleIcon className="mt-1 mr-2" />
                  )}
                  <div className={`flex flex-col gap-2 max-w-[85%] w-fit`}>
                    <div
                      className={`px-4 py-2.5 shadow-sm text-[14px] ${message.role === "user"
                        ? "bg-[#111111] dark:bg-gray-800 text-white rounded-[20px] self-end"
                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm self-start"
                        }`}
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                </div>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-col gap-2 w-full items-end mt-1">
                    {message.suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSuggestionClick(idx, s)}
                        className="text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-[20px] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 text-[14px] max-w-[85%]"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-end gap-2">
                <NeutralBlackHoleIcon className="mb-0.5" />
                <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-fit">
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0"
          >
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isTyping) {
                      handleSend(e as any);
                    }
                  }
                }}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-[20px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none min-h-[44px] max-h-[120px] overflow-y-auto break-words leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500"
                disabled={isTyping}
                style={{ height: input ? undefined : 'auto' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900 transition-colors focus:outline-none"
              >
                <svg
                  className="w-4 h-4 translate-x-[1px] translate-y-[-1px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
