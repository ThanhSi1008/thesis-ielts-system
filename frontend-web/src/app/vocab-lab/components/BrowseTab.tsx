'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { Flashcard, DeckWithCounts } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';

export function BrowseTab({ isActive }: { isActive: boolean }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (isActive) {
      fetchInitialData();
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      fetchCards();
    }
  }, [selectedDeck, selectedState, selectedTag, isActive]);

  const fetchInitialData = async () => {
    try {
      const [decksData, tagsData] = await Promise.all([
        vocabLabApi.getDecks(),
        vocabLabApi.getTags()
      ]);
      setDecks(decksData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await vocabLabApi.browseCards({
        deckId: selectedDeck || undefined,
        cardState: selectedState || undefined,
        tag: selectedTag || undefined,
      });
      setCards(data);
      if (data.length > 0 && !selectedCard) {
        handleSelectCard(data[0]);
      } else if (data.length === 0) {
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
    setEditFront(card.front);
    setEditBack(card.back);
    setEditTagsList(card.tags || []);
    setTagInput('');
  };

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !editTagsList.includes(newTag)) {
        setEditTagsList([...editTagsList, newTag]);
      }
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
    try {
      await vocabLabApi.updateFlashcard(selectedCard.id, {
        front: editFront,
        back: editBack,
        tags: editTagsList,
      });
      setMessage({ type: 'success', text: 'Card updated successfully!' });
      await fetchCards();
      await fetchInitialData(); // Refresh tags if changed
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update card:', error);
      setMessage({ type: 'error', text: 'Failed to update card.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCard = async () => {
    if (!selectedCard) return;
    try {
      await vocabLabApi.deleteFlashcard(selectedCard.id);
      setSelectedCard(null);
      setShowDeleteConfirm(false);
      setMessage({ type: 'success', text: 'Card deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
      await fetchCards();
      await fetchInitialData(); // Refresh tags and decks
    } catch (error) {
      console.error('Failed to delete card:', error);
      setMessage({ type: 'error', text: 'Failed to delete card.' });
    }
  };

  const ToolbarButton = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={title}
      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-4 bg-gray-200 mx-1" />;

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 min-h-[700px]">

      {/* LEFT SIDEBAR - Filters */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[700px] overflow-y-auto">
        <div className="p-5 md:p-6 space-y-8">

          {/* Decks Filter */}
          <div>
            <h3 className="flex items-center w-full text-left text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Decks
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${!selectedDeck ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  onClick={() => setSelectedDeck('')}
                >
                  <svg className={`w-4 h-4 mr-2 ${!selectedDeck ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                  All Decks
                </button>
              </li>
              {decks.map(deck => (
                <li key={deck.id}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center truncate ${selectedDeck === deck.id ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    onClick={() => setSelectedDeck(deck.id)}
                  >
                    <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${selectedDeck === deck.id ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                    <span className="truncate">{deck.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Card State Filter */}
          <div>
            <h3 className="flex items-center w-full text-left text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
              </svg>
              Card State
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${!selectedState ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  onClick={() => setSelectedState('')}
                >
                  All States
                </button>
              </li>
              {['NEW', 'LEARNING', 'REVIEW'].map(state => (
                <li key={state}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${selectedState === state ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    onClick={() => setSelectedState(state)}
                  >
                    <span className={`w-2 h-2 rounded-full mr-3 ${state === 'NEW' ? 'bg-[#3B82F6]' : state === 'LEARNING' ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}></span>
                    {state.charAt(0) + state.slice(1).toLowerCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Note Types Filter (Visual only for now) */}
          <div>
            <h3 className="flex items-center w-full text-left text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Note Types
            </h3>
            <ul className="space-y-1">
              <li>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Basic
                </button>
              </li>
            </ul>
          </div>

          {/* Tags Filter */}
          <div>
            <h3 className="flex items-center w-full text-left text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Tags
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${!selectedTag ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  onClick={() => setSelectedTag('')}
                >
                  <svg className={`w-4 h-4 mr-2 ${!selectedTag ? 'text-[#D97706]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Untagged
                </button>
              </li>
              {tags.map(tag => (
                <li key={tag}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center truncate ${selectedTag === tag ? 'bg-[#FEF3C7] text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${selectedTag === tag ? 'text-[#D97706]' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{tag}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* CENTER - Card List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[700px] overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : cards.length === 0 ? (
            <div className="text-center py-16 text-gray-500 flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              No cards match your current filters.
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] text-gray-500 sticky top-0 border-b border-gray-100 z-10 shadow-sm uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-4 w-[40%] flex items-center cursor-pointer hover:bg-gray-100 transition-colors">
                    Sort Field
                    <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </th>
                  <th className="px-5 py-4 w-[20%]">Card type</th>
                  <th className="px-5 py-4 w-[20%]">Due</th>
                  <th className="px-5 py-4 w-[20%]">Deck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cards.map(card => (
                  <tr
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedCard?.id === card.id ? 'bg-primary hover:bg-primary' : ''}`}
                  >
                    <td className={`px-5 py-3 truncate max-w-[200px] ${selectedCard?.id === card.id ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                      {card.front}
                    </td>
                    <td className={`px-5 py-3 ${selectedCard?.id === card.id ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>Basic</td>
                    <td className={`px-5 py-3 ${selectedCard?.id === card.id ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                      {card.cardState === 'NEW' ? 'New #' + card.id.slice(0, 3) : new Date(card.nextReviewDate).toLocaleDateString()}
                    </td>
                    <td className={`px-5 py-3 truncate max-w-[120px] ${selectedCard?.id === card.id ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                      {card.deck?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - Card Editor */}
      <div className="w-full md:w-[480px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-[700px] overflow-y-auto">
        {selectedCard ? (
          <>
            {message && (
              <div className={`p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {message.text}
              </div>
            )}

            {/* Editor formatting toolbar */}
            <div className="flex items-center gap-0.5 pb-3 border-b border-gray-100 mb-6">
              <ToolbarButton title="Bold"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg></ToolbarButton>
              <ToolbarButton title="Italic"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg></ToolbarButton>
              <ToolbarButton title="Underline"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg></ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Text Color">
                <span className="flex flex-col items-center leading-none mt-1">
                  <span className="text-[10px] font-bold">A</span>
                  <span className="w-3 h-0.5 bg-red-500 rounded-sm"></span>
                </span>
              </ToolbarButton>
              <ToolbarButton title="Highlight"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Align Left"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></ToolbarButton>
              <ToolbarButton title="Align Center"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></ToolbarButton>
              <ToolbarButton title="Align Right"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg></ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Insert Image"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg></ToolbarButton>
              <ToolbarButton title="Attach File"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13,2 13,9 20,9" /></svg></ToolbarButton>
            </div>

            <div className="space-y-6 flex-1">
              {/* Front */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Front</label>
                <input
                  type="text"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white focus:border-primary transition-all text-sm"
                />
              </div>

              {/* Back */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Back</label>
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white focus:border-primary transition-all text-sm min-h-[140px] resize-y"
                />
              </div>

              {/* Tags */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-900 mb-2">Tags</label>
                <div className="flex items-center flex-wrap gap-2 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-white focus-within:border-primary transition-all min-h-[50px]">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {editTagsList.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white shadow-sm border border-gray-200 rounded-md text-sm text-gray-700 font-medium">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500 ml-0.5">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none py-0.5"
                    placeholder="Add a tag..."
                  />
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="mt-8 flex justify-end gap-3 flex-wrap">
              <button
                onClick={handleDeleteCard}
                className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Delete
              </button>
              <button
                onClick={handleSaveCard}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-gray-900 rounded-lg font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center shadow-sm"
              >
                {saving ? 'Saving...' : (
                  <>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Review Info (collapsed/compact) */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-500 border-t border-gray-100 pt-4 px-2">
              <span title="State">State: <strong>{selectedCard.cardState}</strong></span>
              <span title="Ease Factor">Ease: <strong>{selectedCard.easeFactor.toFixed(2)}</strong></span>
              <span title="Current Interval">Int: <strong>{selectedCard.interval}d</strong></span>
              <span title="Repetitions">Reps: <strong>{selectedCard.repetition}</strong></span>
            </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
