"use client";

import { useCallback } from "react";
import type { DictationSentenceFormData } from "../_hooks/useAdminDictationForm";

interface DictationSentenceEditorProps {
  sentences: DictationSentenceFormData[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<DictationSentenceFormData>) => void;
  onMove: (from: number, to: number) => void;
}

function DictationSentenceRow({
  sentence,
  index,
  total,
  onRemove,
  onUpdate,
  onMove,
}: {
  sentence: DictationSentenceFormData;
  index: number;
  total: number;
  onRemove: (i: number) => void;
  onUpdate: (i: number, u: Partial<DictationSentenceFormData>) => void;
  onMove: (from: number, to: number) => void;
}) {
  const autoSplitWords = useCallback(() => {
    const words = sentence.english.split(/\s+/).filter(Boolean);
    onUpdate(index, { words });
  }, [sentence.english, index, onUpdate]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900 flex flex-col gap-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sentence #{sentence.id}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => index > 0 && onMove(index, index - 1)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Move up"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
          </button>
          <button
            type="button"
            onClick={() => index < total - 1 && onMove(index, index + 1)}
            disabled={index === total - 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            aria-label="Move down"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
            aria-label="Remove sentence"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* English */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">English *</label>
        <textarea
          value={sentence.english}
          onChange={e => onUpdate(index, { english: e.target.value })}
          placeholder="Enter the English sentence to dictate..."
          rows={2}
          className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Audio timestamps */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Audio Start (s)</label>
          <input
            type="number"
            min={0}
            step="any"
            value={sentence.audioStart}
            onChange={e => onUpdate(index, { audioStart: parseFloat(e.target.value) || 0 })}
            className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Audio End (s)</label>
          <input
            type="number"
            min={0}
            step="any"
            value={sentence.audioEnd}
            onChange={e => onUpdate(index, { audioEnd: parseFloat(e.target.value) || 0 })}
            className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Words */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Words
            <span className="ml-1 text-gray-400 font-normal">(used for word-by-word masking)</span>
          </label>
          <button
            type="button"
            onClick={autoSplitWords}
            className="text-xs text-primary hover:underline font-medium"
          >
            Auto-split from English
          </button>
        </div>
        <input
          type="text"
          value={sentence.words.join(" ")}
          onChange={e => onUpdate(index, { words: e.target.value.split(/\s+/).filter(Boolean) })}
          placeholder="word1 word2 word3..."
          className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
        />
      </div>
    </div>
  );
}

export function DictationSentenceEditor({ sentences, onAdd, onRemove, onUpdate, onMove }: DictationSentenceEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      {sentences.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400 text-sm">
          No sentences yet. Click &ldquo;Add Sentence&rdquo; to start building the foundationVocabLesson.
        </div>
      )}
      {sentences.map((s, i) => (
        <DictationSentenceRow
          key={s.id}
          sentence={s}
          index={i}
          total={sentences.length}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onMove={onMove}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Sentence
      </button>
    </div>
  );
}
