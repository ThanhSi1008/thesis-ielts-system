"use client";

import React, { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { BookPlus, Sparkles, X, Send, Save, Check } from 'lucide-react';

interface FloatingSelectionManagerProps {
  children: React.ReactNode;
}

export default function FloatingSelectionManager({ children }: FloatingSelectionManagerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for Draggable panels
  const [vocabLabOpen, setVocabLabOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);

  // Current context words
  const [vocabWord, setVocabWord] = useState("");
  const [aiWord, setAiWord] = useState("");
  const [aiContextSentence, setAiContextSentence] = useState("");
  const [vocabContextSentence, setVocabContextSentence] = useState("");

  const MIN_WORD_LENGTH = 1;
  const MAX_PHRASE_LENGTH = 100; // Limit selection character count to a phrase

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Small timeout to allow the browser's selection to securely register
      setTimeout(() => {
        const selection = window.getSelection();
        const target = e.target as Element | null;

        // If clicked inside the menu or panels, ignore
        if (target?.closest?.("#selection-context-menu") || target?.closest?.(".draggable-panel")) {
          return;
        }

        if (!selection || selection.isCollapsed) {
          setMenuPos(null);
          setSelectedText("");
          return;
        }

        const text = selection.toString().trim();
        if (!text || text.length < MIN_WORD_LENGTH || text.length > MAX_PHRASE_LENGTH) {
          setMenuPos(null);
          return;
        }

        // Try to get some context (the sentence around the selection)
        let contextSentence = "";
        try {
          if (selection.anchorNode && selection.anchorNode.nodeValue) {
             const fullText = selection.anchorNode.nodeValue;
             // extract ~50 characters around the word
             contextSentence = fullText.substring(
               Math.max(0, selection.anchorOffset - 40),
               Math.min(fullText.length, selection.focusOffset + 40)
             ).trim();
          }
        } catch(err) {
            // ignore
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position (slightly above the center of the bounding box)
        if (rect.width > 0 && rect.height > 0) {
          setMenuPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 12 + window.scrollY,
          });
          setSelectedText(text);
          setAiContextSentence(contextSentence || text);
          setVocabContextSentence(contextSentence || text);
        }
      }, 50);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  const handleAddVocab = () => {
    setVocabWord(selectedText);
    setVocabLabOpen(true);
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAskAI = () => {
    setAiWord(selectedText);
    setAskAIOpen(true);
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
      
      {/* Contextual Box */}
      {menuPos && (
        <div 
          id="selection-context-menu"
          className="absolute z-[9999] flex items-center bg-gray-900 shadow-xl rounded-lg overflow-hidden border border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            left: menuPos.x,
            top: menuPos.y,
            transform: 'translate(-50%, -100%)' // Center horizontally, place fully above coordinates
          }}
        >
          <button 
            onClick={handleAddVocab}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-white hover:bg-gray-800 transition-colors border-r border-gray-700"
          >
            <BookPlus className="w-4 h-4 text-emerald-400" />
            Add to Vocab Lab
          </button>
          <button 
            onClick={handleAskAI}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Ask AI
          </button>
          
          {/* Arrow pointing down */}
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
        </div>
      )}

      {vocabLabOpen && (
        <VocabLabPanel 
          word={vocabWord} 
          context={vocabContextSentence}
          onClose={() => setVocabLabOpen(false)} 
        />
      )}
      
      {askAIOpen && (
        <AskAIPanel 
          word={aiWord} 
          context={aiContextSentence}
          onClose={() => setAskAIOpen(false)} 
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Draggable Panels
// ─────────────────────────────────────────────────────────────────

function VocabLabPanel({ word, context, onClose }: { word: string, context: string, onClose: () => void }) {
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState(context);
  const [saved, setSaved] = useState(false);

  // Focus effect for natural UX
  useEffect(() => {
    setSaved(false);
    setDefinition("");
    setExample(context); // Update if they highlighted a new word while panel is open
  }, [word, context]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Draggable handle=".drag-handle" bounds="body" defaultPosition={{ x: 0, y: 0 }}>
      {/* Positioned initially relative to the body using fixed and translate to approximate center/right */}
      <div className="draggable-panel fixed z-[1000] w-[340px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden flex flex-col" style={{ top: '20vh', left: '60vw' }}>
        {/* Header */}
        <div className="drag-handle flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-100 cursor-move opacity-95 transition-opacity hover:opacity-100 select-none">
          <div className="flex items-center gap-2">
            <BookPlus className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-sm text-emerald-900">Vocab Lab</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-200/60 rounded-md transition-colors text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 flex flex-col gap-4 bg-white">
          <div>
            <label className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest mb-1 block">Selected Word</label>
            <div className="text-xl font-extrabold text-gray-900 bg-emerald-50/50 px-3 py-2 rounded-lg inline-block border border-emerald-100">{word}</div>
          </div>
          
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
              Meaning
            </label>
            <input 
              autoFocus
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:bg-gray-100/50 transition-colors"
              placeholder="Enter meaning..."
            />
          </div>
          
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Example Context</label>
            <textarea 
              value={example}
              onChange={e => setExample(e.target.value)}
              rows={3}
              className="w-full text-[13px] leading-relaxed px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:bg-gray-100/50 transition-colors resize-none custom-scrollbar"
              placeholder="e.g. They negotiated a tough deal."
            />
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saved || !definition.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved Successfully!</> : <><Save className="w-4 h-4" /> Save to Vocabulary</>}
          </button>
        </div>
      </div>
    </Draggable>
  );
}

function AskAIPanel({ word, context, onClose }: { word: string, context: string, onClose: () => void }) {
  const defaultMessages = [
    { role: 'ai' as const, text: `I am your AI study assistant. Let's look at the term **"${word}"**.\n\nIn standard contexts, this often refers to something specific. Do you have any questions about its meaning, pronunciation, or usage in the IELTS test?` }
  ];
  
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>(defaultMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset or append when word changes
  useEffect(() => {
    setMessages([
        { role: 'ai' as const, text: `I am your AI study assistant. Let's look at the term **"${word}"**.\n\nHow can I help you understand this word better?` }
    ]);
  }, [word]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput("");
    
    // Fake AI typing and response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "That is an excellent question! Yes, you can definitely use it in tasks like Speaking Part 3 or Writing Task 2. It shows lexical resource." }]);
    }, 1200);
  };

  return (
    <Draggable handle=".drag-handle" bounds="body" defaultPosition={{ x: 0, y: 0 }}>
      {/* Starting position */}
      <div className="draggable-panel fixed z-[1000] w-[380px] h-[520px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden flex flex-col" style={{ top: '15vh', left: '10vw' }}>
        {/* Header */}
        <div className="drag-handle flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100 cursor-move opacity-95 transition-opacity hover:opacity-100 select-none shrink-0" title="Drag to move panel">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-indigo-900">Ask AI</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-200/60 rounded-md transition-colors text-indigo-700">
             <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-gray-50/50 custom-scrollbar relative">
          {messages.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] px-4 py-3 text-[13.5px] leading-[1.6] shadow-sm whitespace-pre-wrap
                  ${msg.role === 'user' 
                     ? 'bg-indigo-600 text-white rounded-[16px] rounded-br-[4px]' 
                     : 'bg-white border border-gray-100 rounded-[16px] rounded-bl-[4px] text-gray-800'
                  }
               `}>
                 {msg.text}
               </div>
             </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input Area */}
        <div className="p-3.5 bg-white border-t border-gray-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
           <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-[20px] p-1.5 ring-1 ring-transparent focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all">
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
               rows={1}
               placeholder="Message AI Assistant..."
               className="flex-1 w-full bg-transparent border-none px-3 py-2 text-[14px] focus:outline-none resize-none min-h-[40px] max-h-[100px] custom-scrollbar"
             />
             <button 
               onClick={handleSend}
               disabled={!input.trim()}
               className="flex shrink-0 items-center justify-center w-9 h-9 mb-0.5 mr-0.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full transition-colors self-end"
             >
               <Send className="w-[15px] h-[15px] -ml-[2px]" />
             </button>
           </div>
           <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">AI can make mistakes. Verify important information.</div>
        </div>
      </div>
    </Draggable>
  );
}
