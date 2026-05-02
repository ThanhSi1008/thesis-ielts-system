'use client';

import React, { useState } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import type { Flashcard } from '@/types';
import type { SaveMessage } from './useBrowseCards';
import { EditorToolbar } from './EditorToolbar';

interface Props {
  card: Flashcard;
  editFieldValues: Record<string, string>;
  editFieldStyles: Record<string, any>;
  editTagsList: string[];
  tagInput: string;
  saving: boolean;
  message: SaveMessage | null;
  activeFieldId: string | null;
  isUploading: boolean;
  fieldStyleToCSS: (s?: Record<string, string>) => React.CSSProperties;
  onFieldValueChange: (fieldId: string, value: string) => void;
  onActiveFieldChange: (id: string | null) => void;
  onTagInputChange: (value: string) => void;
  onAddTag: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onUploadClick: (type: 'image' | 'audio') => void;
  onToggleStyle: (key: string, val: string) => void;
  onSetStyle: (key: string, val: string) => void;
  isActiveStyle: (key: string, val: string) => boolean;
}

export function BrowseCardEditor({
  card, editFieldValues, editFieldStyles, editTagsList, tagInput,
  saving, message, activeFieldId, isUploading,
  fieldStyleToCSS,
  onFieldValueChange, onActiveFieldChange,
  onTagInputChange, onAddTag, onRemoveTag,
  onSave, onDelete, onUploadClick,
  onToggleStyle, onSetStyle, isActiveStyle,
}: Props) {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);

  const sortedFields = [...(card.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);

  const createdAt = (card as any).createdAt
    ? new Date((card as any).createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
  const dueAt = card.nextReviewDate
    ? new Date(card.nextReviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col h-full">
      {/* ── Editor Header ── */}
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-2">
        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-1">
          {card.cardType?.name ?? 'Basic'}
        </span>
        {/* Toolbar toggle */}
        <button
          onClick={() => setToolbarVisible(v => !v)}
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${toolbarVisible ? 'bg-gray-900 dark:bg-gray-700 text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Format
        </button>
      </div>

      {/* ── Formatting Toolbar (collapsible) ── */}
      <EditorToolbar
        activeFieldId={activeFieldId}
        fieldStyles={editFieldStyles}
        isUploading={isUploading}
        onToggleStyle={onToggleStyle}
        onSetStyle={onSetStyle}
        onUploadClick={onUploadClick}
        isVisible={toolbarVisible}
      />

      {/* ── Success/Error message ── */}
      {message && (
        <div className={`mx-5 mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'}`}>
          {message.type === 'success'
            ? <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          {message.text}
        </div>
      )}

      {/* ── Fields ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

        {sortedFields.length > 0 ? (
          sortedFields.map(field => {
            const value = editFieldValues[field.id] ?? '';
            const hasMedia = /<(img|audio)\s/i.test(value);
            const mediaMatches = [...value.matchAll(/<(img|audio)[^>]*>(<\/audio>)?/gi)].map(m => m[0]);
            const mediaHtml = mediaMatches.join('\n');

            let textOnly = value;
            if (mediaHtml && value.endsWith('\n' + mediaHtml)) textOnly = value.slice(0, value.length - ('\n' + mediaHtml).length);
            else if (mediaHtml && value.endsWith(mediaHtml)) textOnly = value.slice(0, value.length - mediaHtml.length);
            else if (mediaHtml) textOnly = value.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');

            const fieldStyle = fieldStyleToCSS({
              ...(card.cardType?.templates?.[0]?.fieldStyles?.[field.id] as any || {}),
              ...(editFieldStyles[field.id] || {}),
            });

            const isFocused = activeFieldId === field.id;

            return (
              <div
                key={field.id}
                onClick={() => onActiveFieldChange(field.id)}
                className={`group flex flex-col relative border rounded-xl p-3.5 transition-all cursor-text ${isFocused ? 'border-amber-300 dark:border-amber-500 ring-1 ring-amber-200 dark:ring-amber-900 bg-white dark:bg-gray-900 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <label className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 select-none transition-colors ${isFocused ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {field.name}
                </label>
                <textarea
                  value={textOnly || (hasMedia ? '' : value)}
                  rows={1}
                  onFocus={() => onActiveFieldChange(field.id)}
                  onChange={e => {
                    const newText = e.target.value;
                    const newVal = mediaHtml ? `${newText}\n${mediaHtml}` : newText;
                    onFieldValueChange(field.id, newVal);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  ref={el => {
                    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
                  }}
                  style={fieldStyle}
                  placeholder={hasMedia ? 'Add text (optional)...' : (field.description || `Enter ${field.name.toLowerCase()}…`)}
                  className="browse-textarea w-full bg-transparent border-none p-0 text-[14px] leading-relaxed text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-0 focus:outline-none resize-none overflow-hidden"
                />
                {hasMedia && (
                  <div className="mt-3 flex flex-col gap-3">
                    {mediaMatches.map((tag, mIdx) => {
                      const isAudio = /^<audio/i.test(tag);
                      return (
                        <div key={mIdx} className="relative group/media rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              const remaining = mediaMatches.filter((_, i) => i !== mIdx);
                              onFieldValueChange(field.id, [textOnly, ...remaining].filter(Boolean).join('\n'));
                            }}
                            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {isAudio
                            ? <div className="p-3 [&_audio]:w-full [&_audio]:outline-none [&_audio]:rounded-lg" dangerouslySetInnerHTML={{ __html: tag }} />
                            : <div className="p-3 flex items-center justify-center [&_img]:max-h-[200px] [&_img]:max-w-full [&_img]:object-contain [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: tag }} />
                          }
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Fallback for cards without a loaded cardType */
          <>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Front</label>
              <input type="text" onFocus={() => onActiveFieldChange('__front')} value={editFieldValues['__front'] ?? ''} onChange={e => onFieldValueChange('__front', e.target.value)} className="w-full bg-transparent border-none p-0 text-[14px] text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none" />
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 block">Back</label>
              <textarea onFocus={() => onActiveFieldChange('__back')} value={editFieldValues['__back'] ?? ''} rows={2} onChange={e => { onFieldValueChange('__back', e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} className="browse-textarea w-full bg-transparent border-none p-0 text-[14px] text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none resize-none overflow-hidden" />
            </div>
          </>
        )}

        {/* ── Tags ── */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 bg-white dark:bg-gray-900">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">Tags</label>
          <div className="flex items-center flex-wrap gap-1.5 min-h-[28px] cursor-text" onClick={() => document.getElementById('browse-tag-input')?.focus()}>
            {editTagsList.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[11px] text-gray-700 dark:text-gray-300 font-semibold">
                {tag}
                <button type="button" onClick={e => { e.stopPropagation(); onRemoveTag(tag); }} className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </span>
            ))}
            <input
              id="browse-tag-input"
              type="text"
              value={tagInput}
              onChange={e => onTagInputChange(e.target.value)}
              onKeyDown={onAddTag}
              className="flex-1 min-w-[80px] bg-transparent text-[13px] text-gray-900 dark:text-gray-100 border-none p-0 focus:ring-0 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
              placeholder="Add tag…"
            />
          </div>
        </div>

        {/* ── Card Info (collapsible) ── */}
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setInfoExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Card Info</span>
            <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform ${infoExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {infoExpanded && (
            <div className="px-4 py-3 bg-white dark:bg-gray-900 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              {[
                ['State', card.cardState],
                ['Due', dueAt],
                ['Interval', `${(card as any).scheduledDays ?? 0}d`],
                ['Reps', (card as any).reps ?? 0],
                ['Lapses', (card as any).lapses ?? 0],
                ['Stability', ((card as any).stability ?? 0).toFixed(2)],
                ['Difficulty', ((card as any).difficulty ?? 0).toFixed(2)],
                ['Created', createdAt],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">{label}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-right">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-3">
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          Delete
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FFC600] text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" /> Saving…</>
          ) : (
            <><svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
