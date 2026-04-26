'use client';

import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { Flashcard, DeckWithCounts, CardType } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from '@/components/Toaster';

export function BrowseTab({ isActive }: { isActive: boolean }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);

  // Single unified filter — only one item across all sections can be active
  const [filter, setFilter] = useState<{ type: 'deck' | 'state' | 'cardType' | 'tag'; value: string } | null>(null);

  const pick = (type: 'deck' | 'state' | 'cardType' | 'tag', value: string) =>
    setFilter(prev => prev?.type === type && prev.value === value ? null : { type, value });

  // Per-section collapse — persisted to localStorage
  const STORAGE_KEY = 'browseTab_collapsed';
  const readCollapsed = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
  };
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => readCollapsed());
  const toggleSection = (key: string) =>
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({});
  const [editFieldStyles, setEditFieldStyles] = useState<Record<string, any>>({});
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Media Tracking
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) fetchInitialData();
  }, [isActive]);

  useEffect(() => {
    if (selectedCard) {
      setTimeout(() => {
        document.querySelectorAll('.browse-textarea').forEach((el: any) => {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        });
      }, 0);
    }
  }, [selectedCard, editFieldValues]);

  useEffect(() => {
    if (isActive) fetchCards();
  }, [filter, isActive]);

  const fetchInitialData = async () => {
    try {
      const [decksData, tagsData, cardTypesData] = await Promise.all([
        vocabLabApi.getDecks(),
        vocabLabApi.getTags(),
        vocabLabApi.getCardTypes(),
      ]);
      setDecks(decksData);
      setTags(tagsData);
      setCardTypes(cardTypesData);
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const isUntagged = filter?.type === 'tag' && filter.value === '__untagged';
      const isTagged = filter?.type === 'tag' && filter.value === '__tagged';
      const isAll = filter?.value === '__all';
      const data = await vocabLabApi.browseCards({
        deckId: filter?.type === 'deck' && !isAll ? filter.value : undefined,
        cardState: filter?.type === 'state' && !isAll ? filter.value : undefined,
        tag: filter?.type === 'tag' && !isUntagged && !isTagged ? filter.value : undefined,
      });
      // client-side filters
      let filtered = data;
      if (filter?.type === 'cardType' && !isAll) filtered = filtered.filter(c => c.cardTypeId === filter.value);
      if (isUntagged) filtered = filtered.filter(c => !c.tags || c.tags.length === 0);
      if (isTagged) filtered = filtered.filter(c => c.tags && c.tags.length > 0);
      setCards(filtered);
      if (filtered.length > 0 && !selectedCard) {
        handleSelectCard(filtered[0]);
      } else if (filtered.length === 0) {
        setSelectedCard(null);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSelectCard = (card: Flashcard) => {
    setSelectedCard(card);
    setEditFieldStyles((card as any).fieldStyles || {});
    // Populate field values from card.fieldValues; fall back to front/back for legacy cards
    const fields = [...(card.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    if (fields.length > 0 && card.fieldValues && Object.keys(card.fieldValues).length > 0) {
      setEditFieldValues({ ...card.fieldValues });
    } else {
      // Legacy / fallback: map first field → front, second → back
      const init: Record<string, string> = {};
      fields.forEach((f, i) => {
        init[f.id] = i === 0 ? card.front : i === 1 ? card.back : '';
      });
      setEditFieldValues(init);
    }
    setEditTagsList(card.tags || []);
    setTagInput('');
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !editTagsList.includes(newTag)) setEditTagsList([...editTagsList, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTagsList(editTagsList.filter(t => t !== tagToRemove));
  };

  const handleSaveCard = async () => {
    if (!selectedCard || saving) return;
    setSaving(true);
    setMessage(null);

    // Derive front/back from the card type template for backward compat
    const fields = [...(selectedCard.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    const template = selectedCard.cardType?.templates[0];
    const frontFieldId = template?.frontFields[0] ?? fields[0]?.id;
    const backFieldId = template?.backFields[0] ?? fields[1]?.id;
    const front = editFieldValues[frontFieldId] ?? '';
    const back = editFieldValues[backFieldId] ?? '';

    try {
      await vocabLabApi.updateFlashcard(selectedCard.id, {
        front,
        back,
        tags: editTagsList,
        fieldValues: editFieldValues,
        fieldStyles: editFieldStyles,
      });
      setMessage({ type: 'success', text: 'Card updated successfully!' });
      await fetchCards();
      await fetchInitialData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update card:', error);
      setMessage({ type: 'error', text: 'Failed to update card.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = () => { if (selectedCard) setShowDeleteConfirm(true); };

  const confirmDeleteCard = async () => {
    if (!selectedCard) return;
    try {
      await vocabLabApi.deleteFlashcard(selectedCard.id);
      setSelectedCard(null);
      setShowDeleteConfirm(false);
      setMessage({ type: 'success', text: 'Card deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
      // Notify Header badge to refresh
      window.dispatchEvent(new CustomEvent('vocabduechanged'));
      await fetchCards();
      await fetchInitialData();
    } catch (error) {
      console.error('Failed to delete card:', error);
      setMessage({ type: 'error', text: 'Failed to delete card.' });
    }
  };

  /** Returns the "sort field" value to show in the card list row */
  const getSortFieldValue = (card: Flashcard): string => {
    const fields = [...(card.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    const firstField = fields[0];
    if (!firstField) return card.front.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
    // prefer fieldValues, fall back to card.front
    return (card.fieldValues?.[firstField.id] || card.front || '—').replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
  };

  const handleUploadClick = (type: 'image' | 'audio') => {
    if (!activeFieldId) {
      toast.error('Please click inside a text field first to insert media.');
      return;
    }
    if (type === 'image') imageInputRef.current?.click();
    else audioInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file || !activeFieldId) return;

    try {
      setIsUploading(true);
      toast.info(`Uploading ${type}...`);
      const res = await vocabLabApi.uploadMedia(file);
      toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);

      const html = type === 'image'
        ? `<img src="${res.url}" alt="${file.name}" className="max-w-full rounded-lg my-2 max-h-[300px] object-contain" />`
        : `<audio controls src="${res.url}" className="w-full my-2 outline-none"></audio>`;

      setEditFieldValues(prev => {
        const current = prev[activeFieldId] || '';
        const newVal = current + (current.endsWith('\n') || current === '' ? '' : '\n') + html + '\n';
        return { ...prev, [activeFieldId]: newVal };
      });
      
      // Auto-resize the active textarea after media insertion
      setTimeout(() => {
        document.querySelectorAll('.browse-textarea').forEach((el: any) => {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        });
      }, 0);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  const toggleStyle = (key: string, val: string) => {
    if (!activeFieldId) { toast.error('Click inside a field first to style it.'); return; }
    setEditFieldStyles(prev => {
      const current = prev[activeFieldId] || {};
      return {
        ...prev,
        [activeFieldId]: { ...current, [key]: current[key] === val ? undefined : val }
      };
    });
  };

  const setStyle = (key: string, val: string) => {
    if (!activeFieldId) return;
    setEditFieldStyles(prev => ({
      ...prev,
      [activeFieldId]: { ...(prev[activeFieldId] || {}), [key]: val }
    }));
  };

  const isActiveStyle = (key: string, val: string) => activeFieldId ? editFieldStyles[activeFieldId]?.[key] === val : false;

  function fieldStyleToCSS(s?: Record<string, string>): React.CSSProperties {
    if (!s) return {};
    return {
      fontSize: s.fontSize === 'sm' ? '13px' : s.fontSize === 'md' ? '16px' : s.fontSize === 'lg' ? '22px' : s.fontSize === 'xl' ? '30px' : s.fontSize === '2xl' ? '38px' : undefined,
      fontWeight: s.fontWeight === 'bold' ? 'bold' : undefined,
      fontStyle: s.fontStyle === 'italic' ? 'italic' : undefined,
      textDecoration: s.textDecoration === 'underline' ? 'underline' : undefined,
      color: s.color || undefined,
      textAlign: (s.textAlign as 'left' | 'center' | 'right' | 'justify') || undefined,
    };
  }

  const ToolbarButton = ({ children, title, onClick, isActive }: { children: React.ReactNode; title: string; onClick?: () => void; isActive?: boolean }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={isUploading}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed text-gray-400' : isActive ? 'bg-gray-900 text-white shadow-inner' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
  const ToolbarDivider = () => <div className="w-px h-4 bg-gray-200 mx-1" />;

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 min-h-[650px]">

      {/* ── LEFT SIDEBAR – Filters ─────────────────────────────────────────── */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[650px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div className="p-5 md:p-6 space-y-8">

          {/* Decks */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <button onClick={() => toggleSection('decks')} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded flex-shrink-0">
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed['decks'] ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => pick('deck', '__all')}
                className={`flex items-center text-xs uppercase tracking-wider font-bold transition-colors ${filter?.type === 'deck' && filter.value === '__all' ? 'text-[#D97706]' : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Decks
              </button>
            </div>
            {!collapsed['decks'] && (
              <ul className="space-y-1">
                {decks.map(deck => {
                  const active = filter?.type === 'deck' && filter.value === deck.id;
                  return (
                    <li key={deck.id}>
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center truncate ${active ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} onClick={() => pick('deck', deck.id)}>
                        <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${active ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                        <span className="truncate">{deck.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Card State */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <button onClick={() => toggleSection('state')} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded flex-shrink-0">
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed['state'] ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => pick('state', '__all')}
                className={`flex items-center text-xs uppercase tracking-wider font-bold transition-colors ${filter?.type === 'state' && filter.value === '__all' ? 'text-[#D97706]' : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                Card State
              </button>
            </div>
            {!collapsed['state'] && (
              <ul className="space-y-1">
                {['NEW', 'LEARNING', 'REVIEW'].map(state => {
                  const active = filter?.type === 'state' && filter.value === state;
                  return (
                    <li key={state}>
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${active ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} onClick={() => pick('state', state)}>
                        <span className={`w-2 h-2 rounded-full mr-3 ${state === 'NEW' ? 'bg-[#3B82F6]' : state === 'LEARNING' ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} />
                        {state.charAt(0) + state.slice(1).toLowerCase()}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Card Types */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <button onClick={() => toggleSection('cardTypes')} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded flex-shrink-0">
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed['cardTypes'] ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => pick('cardType', '__all')}
                className={`flex items-center text-xs uppercase tracking-wider font-bold transition-colors ${filter?.type === 'cardType' && filter.value === '__all' ? 'text-[#D97706]' : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Card Types
              </button>
            </div>
            {!collapsed['cardTypes'] && (
              <ul className="space-y-1">
                {cardTypes.map(nt => {
                  const active = filter?.type === 'cardType' && filter.value === nt.id;
                  return (
                    <li key={nt.id}>
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center truncate ${active ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} onClick={() => pick('cardType', nt.id)}>
                        <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${active ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="truncate">{nt.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <button onClick={() => toggleSection('tags')} className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded flex-shrink-0">
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed['tags'] ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => pick('tag', '__tagged')}
                className={`flex items-center text-xs uppercase tracking-wider font-bold transition-colors ${filter?.type === 'tag' && filter.value === '__tagged' ? 'text-[#D97706]' : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Tags
              </button>
            </div>
            {!collapsed['tags'] && (
              <ul className="space-y-1">
                {/* Untagged – fixed sentinel */}
                {(() => {
                  const active = filter?.type === 'tag' && filter.value === '__untagged';
                  return (
                    <li>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${active ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        onClick={() => pick('tag', '__untagged')}
                      >
                        <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${active ? 'text-[#D97706]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Untagged
                      </button>
                    </li>
                  );
                })()}
                {tags.map(tag => {
                  const active = filter?.type === 'tag' && filter.value === tag;
                  return (
                    <li key={tag}>
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center truncate ${active ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} onClick={() => pick('tag', tag)}>
                        <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${active ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{tag}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </div>

      {/* ── CENTER – Card List ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-200/60 flex flex-col h-[650px] overflow-hidden">
        {/* Panel Header */}
        {!loading && (
          <div className="px-5 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Card Collection
            </h2>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
              {cards.length} {cards.length === 1 ? 'Item' : 'Items'}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          ) : cards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="font-medium text-sm text-gray-500">No cards found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters on the left.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-white/90 backdrop-blur sticky top-0 border-b border-gray-200 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <tr className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  <th className="px-6 py-4 w-[40%] cursor-pointer hover:text-gray-600 transition-colors group">
                    <div className="flex items-center gap-1.5">
                      Sort Field
                      <svg className="w-3 h-3 text-gray-300 group-hover:text-amber-500 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </th>
                  <th className="px-4 py-4 w-[20%]">Type</th>
                  <th className="px-4 py-4 w-[20%]">Due</th>
                  <th className="px-6 py-4 w-[20%] text-right">Deck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cards.map(card => {
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <tr 
                      key={card.id} 
                      onClick={() => handleSelectCard(card)} 
                      className={`cursor-pointer transition-all duration-200 group ${
                        isSelected 
                          ? 'bg-amber-50/50 hover:bg-amber-50/80' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`relative px-6 py-3.5 max-w-[200px] ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>
                        {/* Selection Indicator bar */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 rounded-r-full shadow-[1px_0_4px_rgba(245,158,11,0.5)] z-10 hidden md:block"></div>
                        )}
                        <div className="truncate">{getSortFieldValue(card)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                          isSelected ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {card.cardType?.name ?? 'Basic'}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-[13px] ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1.5">
                          {card.cardState === 'NEW' ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              New
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {new Date(card.nextReviewDate).toLocaleDateString()}
                            </>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-3.5 text-right max-w-[120px] text-[13px] ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                        <div className="truncate">{card.deck?.name || '—'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── RIGHT SIDEBAR – Card Editor ───────────────────────────────────── */}
      <div className="w-full md:w-[480px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-[650px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
        <input type="file" ref={audioInputRef} className="hidden" accept="audio/*,video/*" onChange={e => handleFileUpload(e, 'audio')} />
        
        {selectedCard ? (
          <>
            {message && (
              <div className={`p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {message.text}
              </div>
            )}

            {/* Card type label */}
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{selectedCard.cardType?.name ?? 'Basic'}</span>
            </div>

            {/* Formatting toolbar */}
            <div className="flex items-center gap-0.5 pb-3 border-b border-gray-100 mb-5">
              <ToolbarButton title="Bold" isActive={isActiveStyle('fontWeight', 'bold')} onClick={() => toggleStyle('fontWeight', 'bold')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg></ToolbarButton>
              <ToolbarButton title="Italic" isActive={isActiveStyle('fontStyle', 'italic')} onClick={() => toggleStyle('fontStyle', 'italic')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg></ToolbarButton>
              <ToolbarButton title="Underline" isActive={isActiveStyle('textDecoration', 'underline')} onClick={() => toggleStyle('textDecoration', 'underline')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton title="Text Color" isActive={isActiveStyle('color', '#ef4444')} onClick={() => toggleStyle('color', '#ef4444')}><span className="flex flex-col items-center leading-none mt-1"><span className="text-[10px] font-bold">A</span><span className="w-3 h-0.5 bg-red-500 rounded-sm" /></span></ToolbarButton>
              <ToolbarButton title="Highlight" isActive={isActiveStyle('color', '#ca8a04')} onClick={() => toggleStyle('color', '#ca8a04')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton title="Align Left" isActive={isActiveStyle('textAlign', 'left')} onClick={() => setStyle('textAlign', 'left')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></ToolbarButton>
              <ToolbarButton title="Align Center" isActive={isActiveStyle('textAlign', 'center')} onClick={() => setStyle('textAlign', 'center')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></ToolbarButton>
              <ToolbarButton title="Align Right" isActive={isActiveStyle('textAlign', 'right')} onClick={() => setStyle('textAlign', 'right')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton title="Insert Image" onClick={() => handleUploadClick('image')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg></ToolbarButton>
              <ToolbarButton title="Attach File" onClick={() => handleUploadClick('audio')}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13,2 13,9 20,9" /></svg></ToolbarButton>
            </div>

            {/* ── Dynamic fields ──────────────────────────────────────────────── */}
            <div className="space-y-4 flex-1">
              {[...(selectedCard.cardType?.fields ?? [])].sort((a, b) => a.order - b.order).map((field, idx) => {
                const value = editFieldValues[field.id] ?? '';
                const hasMedia = /<(img|audio)\s/i.test(value);
                const mediaMatches = [...value.matchAll(/<(img|audio)[^>]*>(<\/audio>)?/gi)].map(m => m[0]);
                const mediaHtml = mediaMatches.join('\n');

                let textOnly = value;
                if (mediaHtml && value.endsWith('\n' + mediaHtml)) {
                  textOnly = value.slice(0, value.length - ('\n' + mediaHtml).length);
                } else if (mediaHtml && value.endsWith(mediaHtml)) {
                  textOnly = value.slice(0, value.length - mediaHtml.length);
                } else if (mediaHtml) {
                  textOnly = value.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
                }

                const fieldStyle = fieldStyleToCSS({
                  ...(selectedCard.cardType?.templates?.[0]?.fieldStyles?.[field.id] as any || {}),
                  ...(editFieldStyles[field.id] || {}),
                });

                return (
                  <div key={field.id} className="group flex flex-col relative bg-transparent border border-gray-200 rounded-xl p-3.5 shadow-sm transition-all focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200 cursor-text">
                    <label className="text-[11px] font-semibold text-gray-500/80 uppercase tracking-widest mb-1.5 transition-colors group-focus-within:text-gray-800 cursor-text select-none">
                      {field.name}
                    </label>

                    <textarea
                      value={textOnly || (hasMedia ? '' : value)}
                      rows={1}
                      onFocus={() => setActiveFieldId(field.id)}
                      onClick={() => setActiveFieldId(field.id)}
                      onChange={e => {
                        const newText = e.target.value;
                        const newVal = mediaHtml ? `${newText}\n${mediaHtml}` : newText;
                        setEditFieldValues(prev => ({ ...prev, [field.id]: newVal }));
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      ref={el => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      style={fieldStyle}
                      placeholder={hasMedia ? 'Add text (optional)...' : (field.description || `Enter ${field.name.toLowerCase()}…`)}
                      className="browse-textarea w-full bg-transparent border-none p-0 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none resize-none overflow-hidden"
                    />

                    {/* Media preview section */}
                    {hasMedia && (
                      <div className="mt-3 flex flex-col gap-3">
                        {mediaMatches.map((tag, mIdx) => {
                          const isAudio = /^<audio/i.test(tag);
                          return (
                            <div key={mIdx} className="relative group/media rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                              <button
                                type="button"
                                onClick={() => {
                                  const remaining = mediaMatches.filter((_, i) => i !== mIdx);
                                  const newVal = [textOnly, ...remaining].filter(Boolean).join('\n');
                                  setEditFieldValues(prev => ({ ...prev, [field.id]: newVal }));
                                }}
                                className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover/media:opacity-100"
                                title="Remove"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              {isAudio ? (
                                <div className="p-3">
                                  <div className="w-full [&_audio]:w-full [&_audio]:outline-none [&_audio]:rounded-lg" dangerouslySetInnerHTML={{ __html: tag }} />
                                </div>
                              ) : (
                                <div className="p-3 flex items-center justify-center [&_img]:max-h-[240px] [&_img]:max-w-full [&_img]:object-contain [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: tag }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Fallback for cards without a cardType loaded */}
              {!selectedCard.cardType && (
                <>
                  <div className="group flex flex-col relative bg-transparent border border-gray-200 rounded-xl p-3.5 shadow-sm transition-all focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200 cursor-text">
                    <label className="text-[11px] font-semibold text-gray-500/80 uppercase tracking-widest mb-1.5 transition-colors group-focus-within:text-gray-800 cursor-text select-none">
                      Front
                    </label>
                    <input 
                      type="text" 
                      onFocus={() => setActiveFieldId('__front')}
                      onClick={() => setActiveFieldId('__front')}
                      value={editFieldValues['__front'] ?? ''} 
                      onChange={e => setEditFieldValues(prev => ({ ...prev, __front: e.target.value }))} 
                      className="w-full bg-transparent border-none p-0 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none" 
                    />
                  </div>
                  <div className="group flex flex-col relative bg-transparent border border-gray-200 rounded-xl p-3.5 shadow-sm transition-all focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200 cursor-text">
                    <label className="text-[11px] font-semibold text-gray-500/80 uppercase tracking-widest mb-1.5 transition-colors group-focus-within:text-gray-800 cursor-text select-none">
                      Back
                    </label>
                    <textarea
                      value={editFieldValues['__back'] ?? ''}
                      rows={1}
                      onFocus={() => setActiveFieldId('__back')}
                      onClick={() => setActiveFieldId('__back')}
                      onChange={e => {
                        setEditFieldValues(prev => ({ ...prev, __back: e.target.value }));
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      ref={el => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      className="browse-textarea w-full bg-transparent border-none p-0 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none resize-none overflow-hidden"
                    />
                  </div>
                </>
              )}

              {/* Tags */}
              <div className="group flex flex-col pt-1">
                <label className="text-[11px] font-semibold text-gray-500/80 uppercase tracking-widest mb-1.5">
                  Tags
                </label>
                <div className="flex items-center flex-wrap gap-2 px-3.5 py-2.5 bg-transparent border border-gray-200 rounded-xl shadow-sm transition-all focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200 min-h-[46px] cursor-text" onClick={() => document.getElementById('browse-tag-input')?.focus()}>
                  <svg className="h-4 w-4 text-gray-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                  {editTagsList.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 font-semibold">
                      {tag}
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }} className="text-gray-400 hover:text-red-500 ml-0.5 focus:outline-none">
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </span>
                  ))}
                  <input
                    id="browse-tag-input"
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[100px] bg-transparent text-[15px] text-gray-900 border-none p-0 focus:ring-0 focus:outline-none placeholder:text-gray-300"
                    placeholder="Add a tag..."
                  />
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="mt-8 flex justify-end gap-3 flex-wrap">
              <button onClick={handleDeleteCard} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Delete
              </button>
              <button onClick={handleSaveCard} disabled={saving} className="px-5 py-2.5 bg-primary text-gray-900 rounded-lg font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center shadow-sm">
                {saving ? 'Saving...' : (
                  <>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Review info */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 border-t border-gray-100 pt-4 px-2">
              <span>State: <strong>{selectedCard.cardState}</strong></span>
              <span>Stability: <strong>{((selectedCard as any).stability ?? 0).toFixed(2)}</strong></span>
              <span>Difficulty: <strong>{((selectedCard as any).difficulty ?? 0).toFixed(2)}</strong></span>
              <span>Int: <strong>{((selectedCard as any).scheduledDays ?? 0)}d</strong></span>
              <span>Reps: <strong>{((selectedCard as any).reps ?? 0)}</strong></span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p>Select a card to view and edit details</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Flashcard"
        message="Are you sure you want to delete this flashcard? This action cannot be undone and will permanently remove your study history for this card."
        confirmText="Yes, delete card"
        cancelText="Cancel"
        onConfirm={confirmDeleteCard}
        onClose={() => setShowDeleteConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
}
