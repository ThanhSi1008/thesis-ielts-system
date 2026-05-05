'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { Flashcard, DeckWithCounts, CardType } from '@/types';
import { toast } from '@/components/Toaster';

export type BrowseFilterData = { type: 'deck' | 'state' | 'cardType' | 'tag'; value: string };
export type BrowseFilter = BrowseFilterData | null;

export interface SaveMessage { type: 'success' | 'error'; text: string }

export function useBrowseCards(isActive: boolean) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [filter, setFilter] = useState<BrowseFilter>(null);
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({});
  const [editFieldStyles, setEditFieldStyles] = useState<Record<string, any>>({});
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<SaveMessage | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textareas when selected card changes
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
    if (isActive) fetchInitialData();
  }, [isActive]);

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

  const pick = (type: BrowseFilterData['type'] | undefined, value: string) => {
    if (!type) { setFilter(null); return; }
    setFilter(prev => (prev && prev.type === type && prev.value === value) ? null : { type, value });
  };

  const handleSelectCard = useCallback((card: Flashcard) => {
    setSelectedCard(card);
    setEditFieldStyles((card as any).fieldStyles || {});
    const fields = [...(card.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    if (fields.length > 0 && card.fieldValues && Object.keys(card.fieldValues).length > 0) {
      setEditFieldValues({ ...card.fieldValues });
    } else {
      const init: Record<string, string> = {};
      fields.forEach((f, i) => { init[f.id] = i === 0 ? card.front : i === 1 ? card.back : ''; });
      setEditFieldValues(init);
    }
    setEditTagsList(card.tags || []);
    setTagInput('');
    setActiveFieldId(null);
  }, []);

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !editTagsList.includes(newTag)) setEditTagsList(prev => [...prev, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTagsList(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSaveCard = async () => {
    if (!selectedCard || saving) return;
    setSaving(true);
    setMessage(null);
    const fields = [...(selectedCard.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    const template = selectedCard.cardType?.templates[0];
    const frontFieldId = template?.frontFields[0] ?? fields[0]?.id;
    const backFieldId = template?.backFields[0] ?? fields[1]?.id;
    const front = editFieldValues[frontFieldId] ?? '';
    const back = editFieldValues[backFieldId] ?? '';
    try {
      await vocabLabApi.updateFlashcard(selectedCard.id, {
        front, back, tags: editTagsList,
        fieldValues: editFieldValues,
        fieldStyles: editFieldStyles,
      });
      setMessage({ type: 'success', text: 'Card updated successfully!' });
      await fetchCards();
      await fetchInitialData();
      setTimeout(() => setMessage(null), 3000);
    } catch {
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
      window.dispatchEvent(new CustomEvent('vocabduechanged'));
      await fetchCards();
      await fetchInitialData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete card.' });
    }
  };

  const getSortFieldValue = (card: Flashcard): string => {
    const fields = [...(card.cardType?.fields ?? [])].sort((a, b) => a.order - b.order);
    const firstField = fields[0];
    if (!firstField) return card.front.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
    return (card.fieldValues?.[firstField.id] || card.front || '—').replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
  };

  const handleUploadClick = (type: 'image' | 'audio') => {
    if (!activeFieldId) { toast.error('Please click inside a text field first to insert media.'); return; }
    if (type === 'image') imageInputRef.current?.click();
    else audioInputRef.current?.click();
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file || !activeFieldId) return;
    try {
      setIsUploading(true);
      toast.info(`Uploading ${type}...`);
      const res = await vocabLabApi.uploadMedia(file);
      toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded!`);
      const html = type === 'image'
        ? `<img src="${res.url}" alt="${file.name}" className="max-w-full rounded-lg my-2 max-h-[300px] object-contain" />`
        : `<audio controls src="${res.url}" className="w-full my-2 outline-none"></audio>`;
      setEditFieldValues(prev => {
        const current = prev[activeFieldId] || '';
        const newVal = current + (current.endsWith('\n') || current === '' ? '' : '\n') + html + '\n';
        return { ...prev, [activeFieldId]: newVal };
      });
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
      return { ...prev, [activeFieldId]: { ...current, [key]: current[key] === val ? undefined : val } };
    });
  };

  const setStyle = (key: string, val: string) => {
    if (!activeFieldId) return;
    setEditFieldStyles(prev => ({ ...prev, [activeFieldId]: { ...(prev[activeFieldId] || {}), [key]: val } }));
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
      textAlign: (s.textAlign as any) || undefined,
    };
  }

  // Keyboard navigation: navigate card list with ↑/↓
  const navigateCard = useCallback((direction: 'up' | 'down') => {
    if (cards.length === 0) return;
    const idx = selectedCard ? cards.findIndex(c => c.id === selectedCard.id) : -1;
    if (direction === 'up' && idx > 0) handleSelectCard(cards[idx - 1]);
    if (direction === 'down' && idx < cards.length - 1) handleSelectCard(cards[idx + 1]);
  }, [cards, selectedCard, handleSelectCard]);

  return {
    // Data
    cards, decks, tags, cardTypes, filter, selectedCard,
    editFieldValues, editFieldStyles, editTagsList, tagInput,
    loading, saving, showDeleteConfirm, message,
    activeFieldId, isUploading,
    imageInputRef, audioInputRef,
    // Setters
    setTagInput, setEditFieldValues, setShowDeleteConfirm, setActiveFieldId,
    // Handlers
    pick, handleSelectCard, handleAddTag, handleRemoveTag,
    handleSaveCard, handleDeleteCard, confirmDeleteCard,
    handleUploadClick, handleFileUpload,
    toggleStyle, setStyle, isActiveStyle, fieldStyleToCSS,
    getSortFieldValue, navigateCard,
    // Refreshers
    fetchCards, fetchInitialData,
  };
}
