'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { DeckWithCounts } from '@/types';

export function AddCardTab({ isActive }: { isActive: boolean }) {
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [deckId, setDeckId] = useState('');
  const [cardType, setCardType] = useState('basic');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await vocabLabApi.getDecks();
        setDecks(data);
        if (data.length > 0 && !deckId) {
          setDeckId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch decks:', error);
      }
    };
    if (isActive) {
      fetchDecks();
    }
  }, [isActive, deckId]);

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/,'');
      if (newTag && !tagsList.includes(newTag)) {
        setTagsList([...tagsList, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) {
      setMessage({ type: 'error', text: 'Please select or create a deck first.' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await vocabLabApi.createFlashcard({
        deckId,
        front,
        back,
        tags: tagsList.length > 0 ? tagsList : undefined
      });
      
      setMessage({ type: 'success', text: 'Card added successfully!' });
      setFront('');
      setBack('');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add card. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ToolbarButton = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={title}
      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Card Settings Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Current Deck */}
            <div className="flex items-center gap-3 flex-1">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Current Deck</label>
              {decks.length === 0 ? (
                <span className="text-sm text-red-500 italic">Create a deck first</span>
              ) : (
                <div className="relative flex-1 max-w-[220px]">
                  <select
                    value={deckId}
                    onChange={(e) => setDeckId(e.target.value)}
                    className="appearance-none w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-gray-700 cursor-pointer transition-colors"
                    required
                  >
                    <option value="" disabled>Select a deck</option>
                    {decks.map(deck => (
                      <option key={deck.id} value={deck.id}>{deck.name}</option>
                    ))}
                  </select>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                  </div>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical separator */}
            <div className="hidden sm:block w-px h-8 bg-gray-200" />

            {/* Card Type */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Card Type</label>
              <div className="relative">
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="appearance-none pl-9 pr-9 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-gray-700 cursor-pointer transition-colors min-w-[160px]"
                >
                  <option value="basic">Basic</option>
                  <option value="reversed">Basic (reversed)</option>
                  <option value="cloze">Cloze</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <ToolbarButton title="Bold"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg></ToolbarButton>
            <ToolbarButton title="Italic"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></ToolbarButton>
            <ToolbarButton title="Underline"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Text Color">
              <span className="flex flex-col items-center leading-none">
                <span className="text-[11px] font-bold">A</span>
                <span className="w-3.5 h-[3px] bg-red-500 rounded-sm -mt-px"></span>
              </span>
            </ToolbarButton>
            <ToolbarButton title="Highlight"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Align Left"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg></ToolbarButton>
            <ToolbarButton title="Align Center"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg></ToolbarButton>
            <ToolbarButton title="Align Right"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Insert Image"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></ToolbarButton>
            <ToolbarButton title="Attach File"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13,2 13,9 20,9"/></svg></ToolbarButton>
          </div>

          {/* Front */}
          <div className="px-5 pt-5 pb-3">
            <label className="block text-sm font-bold text-gray-800 mb-2">Front</label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="e.g. Ubiquitous"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Divider */}
          <div className="mx-5">
            <div className="border-t border-dashed border-gray-200"></div>
          </div>

          {/* Back */}
          <div className="px-5 pt-3 pb-5">
            <label className="block text-sm font-bold text-gray-800 mb-2">Back</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={`e.g. Present, appearing, found everywhere\n\nExample sentence: His ubiquitous influence was felt by all the family`}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base min-h-[140px] bg-white resize-y placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        {/* Tags Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-3">Tags</label>
          <div className="flex items-center flex-wrap gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent min-h-[44px] transition-shadow">
            {/* Tag icon */}
            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {/* Tag chips */}
            {tagsList.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 font-medium group hover:bg-gray-200 transition-colors">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 group-hover:text-red-500 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </span>
            ))}
            {/* Tag input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tagsList.length === 0 ? 'Type a tag and press Enter' : 'Add tag...'}
              className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || decks.length === 0}
            className="px-8 py-3 bg-primary text-gray-900 font-semibold rounded-xl hover:bg-primary/80 transition-all disabled:opacity-50 flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>
                Add Card
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
