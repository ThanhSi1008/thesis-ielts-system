"use client";

import React, { useEffect, useState, useRef } from 'react';
import { BookPlus, Sparkles } from 'lucide-react';

interface FloatingSelectionManagerProps {
  children: React.ReactNode;
}

export default function FloatingSelectionManager({ children }: FloatingSelectionManagerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current context words
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
            y: rect.top - 12, // viewport-relative, used with position:fixed
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
    window.dispatchEvent(new CustomEvent('open-vocab-fab'));
    
    // Give GlobalVocabFab time to mount its internal AddCardTab listener
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('vocab-lab-prefill', {
        detail: { word: selectedText, context: vocabContextSentence }
      }));
    }, 500);

    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAskAI = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chat-fab', {
      detail: { word: selectedText, context: aiContextSentence }
    }));
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
          className="fixed z-[9999] flex items-center bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            left: menuPos.x,
            top: menuPos.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button 
            onClick={handleAddVocab}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            <BookPlus className="w-4 h-4 text-emerald-500" />
            Add to Vocab
          </button>
          <button 
            onClick={handleAskAI}
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Ask AI
          </button>
          
          {/* Arrow pointing down */}
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
        </div>
      )}
    </div>
  );
}


