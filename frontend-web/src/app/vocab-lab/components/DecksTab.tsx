'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { vocabLabApi } from '@/services/vocabLab.api';
import { downloadAsLexon } from '@/utils/download';
import { ImportDeckModal, LexonData } from './ImportDeckModal';
import { PublishDeckModal } from './PublishDeckModal';
import type { DeckWithCounts } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ConfirmModal from '@/components/ConfirmModal';

export function DecksTab({ isActive, onTotalDueChange }: { isActive: boolean; onTotalDueChange?: (total: number) => void }) {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deckToPublish, setDeckToPublish] = useState<{ id: string, name: string } | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingLexonData, setPendingLexonData] = useState<LexonData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !data.deck?.name || !Array.isArray(data.cards)) {
        throw new Error('Invalid .lexon file format');
      }
      setPendingLexonData(data);
      setShowImportModal(true);
    } catch (error: any) {
      setImportFeedback({
        type: 'error',
        text: error instanceof SyntaxError ? 'File is not valid JSON' : (error.message || 'Invalid file'),
      });
    }
  };

  const handleConfirmImport = async (deckName: string) => {
    if (!pendingLexonData) return;
    setIsImporting(true);

    try {
      const payload = { ...pendingLexonData, deck: { ...pendingLexonData.deck, name: deckName } };
      const result = await vocabLabApi.importDeck(payload);
      setImportFeedback({ type: 'success', text: `Imported "${result.deckName}" with ${result.cardsImported} cards` });
      setShowImportModal(false);
      setPendingLexonData(null);
      await fetchDecks();
    } catch (error: any) {
      setImportFeedback({
        type: 'error',
        text: error?.response?.data?.message || error?.message || 'Import failed',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !data.deck?.name || !Array.isArray(data.cards)) {
        throw new Error('Invalid .lexon file format');
      }
      setPendingLexonData(data);
      setShowImportModal(true);
    } catch (error: any) {
      setImportFeedback({
        type: 'error',
        text: 'Invalid .lexon file',
      });
    }
  };

  const handleExport = async (e: React.MouseEvent, deck: DeckWithCounts) => {
    e.stopPropagation(); // Prevent row click navigation
    setExportingId(deck.id);
    try {
      const data = await vocabLabApi.exportDeck(deck.id);
      downloadAsLexon(data, deck.name.replace(/\s+/g, '_'));
    } catch (error) {
      console.error('Failed to export deck:', error);
    } finally {
      setExportingId(null);
    }
  };

  const fetchDecks = async () => {
    try {
      const data = await vocabLabApi.getDecks();
      setDecks(data);
      // Notify parent of total due cards
      const total = data.reduce((sum, d) => sum + d.newCount + d.learningCount + d.dueCount, 0);
      onTotalDueChange?.(total);
      // Also notify Header badge to refresh in sync
      window.dispatchEvent(new CustomEvent('vocabduechanged'));
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchDecks();
    }
  }, [isActive]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      await vocabLabApi.createDeck(newDeckName);
      setNewDeckName('');
      setShowCreateModal(false);
      await fetchDecks();
    } catch (error: any) {
      console.error('Failed to create deck:', error);
      const msg = error?.message || 'Failed to create deck.';
      if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('token')) {
        setError('You must be signed in to create a deck. Please sign in first.');
      } else {
        setError(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, deck: DeckWithCounts) => {
    e.stopPropagation();
    setDeckToDelete({ id: deck.id, name: deck.name });
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;
    try {
      await vocabLabApi.deleteDeck(deckToDelete.id);
      await fetchDecks();
      setDeckToDelete(null);
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner /></div>;
  }

  // Calculate totals for the summary line
  const totalDueCards = decks.reduce((sum, d) => sum + d.newCount + d.learningCount + d.dueCount, 0);

  return (
    <div
      className={`min-h-[800px] pb-12 flex flex-col items-center transition-colors ${isDragOver ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Deck Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden w-full max-w-4xl">
        {decks.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-100">No decks yet</p>
            <p className="text-sm dark:text-gray-400">Create your first deck to start studying!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Deck Name</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">New</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">Learn</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">Due</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck, index) => (
                <tr
                  key={deck.id}
                  onClick={() => router.push(`/vocab-lab/study/${deck.id}`)}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${index < decks.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                    }`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                        {deck.name}
                      </span>
                      <button
                        onClick={(e) => handleExport(e, deck)}
                        disabled={exportingId === deck.id}
                        className="ml-1 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Export Deck"
                      >
                        {exportingId === deck.id ? (
                          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeckToPublish({ id: deck.id, name: deck.name }); }}
                        className="ml-1 text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Publish to Community"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, deck)}
                        className="ml-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Delete Deck"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="text-center px-4 py-5">
                    <span className="font-bold text-blue-600">{deck.newCount}</span>
                  </td>
                  <td className="text-center px-4 py-5">
                    <span className="font-bold text-orange-500">{deck.learningCount}</span>
                  </td>
                  <td className="text-center px-4 py-5">
                    <span className="font-bold text-green-600">{deck.dueCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Import feedback messages */}
      {importFeedback && (
        <div className={`w-full max-w-4xl mt-4 p-3 rounded-lg border text-sm flex items-center justify-between ${importFeedback.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
          }`}>
          <span>{importFeedback.type === 'success' ? '✅' : '❌'} {importFeedback.text}</span>
          <button onClick={() => setImportFeedback(null)} className="opacity-70 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".lexon,.json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Study summary */}
      {totalDueCards > 0 && (
        <div className="text-center mt-6 text-gray-600 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 align-middle"></span>
          Study <span className="font-bold text-gray-900 dark:text-gray-100">{totalDueCards} cards</span> today
        </div>
      )}

      {/* Create / Import Deck Buttons */}
      <div className="text-center mt-6 flex items-center justify-center gap-3">
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          {isImporting ? (
            <svg className="h-5 w-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isImporting ? 'Importing...' : 'Import Deck'}
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-6 py-2.5 bg-primary rounded-lg shadow-sm text-gray-900 font-medium hover:bg-primary/80 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Deck
        </button>
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowCreateModal(false); setError(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Create New Deck</h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateDeck}>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. TOEFL Essential Words"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 text-lg"
                required
                disabled={isCreating}
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setError(null); }}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newDeckName.trim()}
                  className="px-5 py-2.5 bg-primary text-gray-900 font-medium rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deckToDelete}
        title="Delete Deck"
        message={
          <>
            Are you sure you want to delete the deck <strong className="text-gray-900 dark:text-gray-100">"{deckToDelete?.name}"</strong>?
            <br /><br />
            This will permanently delete all flashcards inside this deck. This action cannot be undone.
          </>
        }
        confirmText="Yes, delete deck"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => setDeckToDelete(null)}
        isDestructive={true}
      />

      {/* Import Modal */}
      <ImportDeckModal
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setPendingLexonData(null); }}
        onConfirmImport={handleConfirmImport}
        lexonData={pendingLexonData}
        isImporting={isImporting}
        existingDeckNames={decks.map(d => d.name)}
      />

      {/* Publish Modal */}
      {deckToPublish && (
        <PublishDeckModal
          isOpen={true}
          onClose={() => setDeckToPublish(null)}
          deckId={deckToPublish.id}
          defaultName={deckToPublish.name}
        />
      )}
    </div>
  );
}
