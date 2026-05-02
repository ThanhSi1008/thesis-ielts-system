'use client';

import React, { useCallback } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { useBrowseCards } from './browse/useBrowseCards';
import { BrowseFilterSidebar } from './browse/BrowseFilterSidebar';
import { BrowseCardList } from './browse/BrowseCardList';
import { BrowseCardEditor } from './browse/BrowseCardEditor';

export function BrowseTab({ isActive }: { isActive: boolean }) {
  const browse = useBrowseCards(isActive);

  // Derive count maps for sidebar badges (client-side from loaded cards)
  const cardCountByDeck: Record<string, number> = {};
  const cardCountByState: Record<string, number> = {};
  browse.cards.forEach(c => {
    if (c.deck?.id) cardCountByDeck[c.deck.id] = (cardCountByDeck[c.deck.id] ?? 0) + 1;
    cardCountByState[c.cardState] = (cardCountByState[c.cardState] ?? 0) + 1;
  });

  // Keyboard navigation handler
  const handleListKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); browse.navigateCard('down'); }
    if (e.key === 'ArrowUp') { e.preventDefault(); browse.navigateCard('up'); }
  }, [browse]);

  // Empty state when no card selected
  const emptyEditor = (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-3">
      <svg className="h-12 w-12 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Select a card to edit</p>
    </div>
  );

  return (
    <div className="flex gap-0 min-h-[680px] h-[680px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">

      {/* Hidden file inputs (managed by hook) */}
      <input type="file" ref={browse.imageInputRef} className="hidden" accept="image/*" onChange={e => browse.handleFileUpload(e, 'image')} />
      <input type="file" ref={browse.audioInputRef} className="hidden" accept="audio/*,video/*" onChange={e => browse.handleFileUpload(e, 'audio')} />

      {/* ── Left: Filter Sidebar ── */}
      <div className="w-[200px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <BrowseFilterSidebar
          decks={browse.decks}
          cardTypes={browse.cardTypes}
          tags={browse.tags}
          filter={browse.filter}
          onFilterChange={(type, value) => browse.pick(type, value)}
          onClearFilter={() => browse.pick(undefined, '')}
          cardCountByDeck={cardCountByDeck}
          cardCountByState={cardCountByState}
        />
      </div>

      {/* ── Center: Card List ── */}
      <div className="flex-1 flex flex-col border-r border-gray-100 dark:border-gray-800 min-w-0">
        <BrowseCardList
          cards={browse.cards}
          selectedCardId={browse.selectedCard?.id ?? null}
          loading={browse.loading}
          onSelectCard={browse.handleSelectCard}
          getSortFieldValue={browse.getSortFieldValue}
          onKeyboardNav={handleListKeyDown}
        />
      </div>

      {/* ── Right: Card Editor ── */}
      <div className="w-[400px] flex-shrink-0 flex flex-col">
        {browse.selectedCard ? (
          <BrowseCardEditor
            card={browse.selectedCard}
            editFieldValues={browse.editFieldValues}
            editFieldStyles={browse.editFieldStyles}
            editTagsList={browse.editTagsList}
            tagInput={browse.tagInput}
            saving={browse.saving}
            message={browse.message}
            activeFieldId={browse.activeFieldId}
            isUploading={browse.isUploading}
            fieldStyleToCSS={browse.fieldStyleToCSS}
            onFieldValueChange={(id, val) => browse.setEditFieldValues(prev => ({ ...prev, [id]: val }))}
            onActiveFieldChange={browse.setActiveFieldId}
            onTagInputChange={browse.setTagInput}
            onAddTag={browse.handleAddTag}
            onRemoveTag={browse.handleRemoveTag}
            onSave={browse.handleSaveCard}
            onDelete={browse.handleDeleteCard}
            onUploadClick={browse.handleUploadClick}
            onToggleStyle={browse.toggleStyle}
            onSetStyle={browse.setStyle}
            isActiveStyle={browse.isActiveStyle}
          />
        ) : emptyEditor}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={browse.showDeleteConfirm}
        title="Delete Flashcard"
        message="Are you sure you want to delete this flashcard? This action cannot be undone and will permanently remove your study history for this card."
        confirmText="Yes, delete card"
        cancelText="Cancel"
        onConfirm={browse.confirmDeleteCard}
        onClose={() => browse.setShowDeleteConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
}
