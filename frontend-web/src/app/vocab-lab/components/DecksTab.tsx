'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { DeckWithCounts } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ConfirmModal from '@/components/ConfirmModal';

export function DecksTab({ isActive }: { isActive: boolean }) {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<{ id: string, name: string } | null>(null);

  const fetchDecks = async () => {
    try {
      const data = await vocabLabApi.getDecks();
      setDecks(data);
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
    <div className="min-h-[800px] pb-12 flex flex-col items-center">
      {/* Deck Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-4xl">
        {decks.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium mb-1">No decks yet</p>
            <p className="text-sm">Create your first deck to start studying!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
                  className={`cursor-pointer hover:bg-gray-50 transition-colors group ${index < decks.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {deck.name}
                      </span>
                      <button
                        onClick={(e) => handleDeleteClick(e, deck)}
                        className="ml-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
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

      {/* Study summary */}
      {totalDueCards > 0 && (
        <div className="text-center mt-6 text-gray-600 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 align-middle"></span>
          Study <span className="font-bold text-gray-900">{totalDueCards} cards</span> today
        </div>
      )}

      {/* Create Deck Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-6 py-2.5 bg-primary rounded-lg shadow-sm text-gray-900 font-medium hover:bg-primary/80 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Deck
        </button>
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowCreateModal(false); setError(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Deck</h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateDeck}>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. TOEFL Essential Words"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 text-lg"
                required
                disabled={isCreating}
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setError(null); }}
                  className="px-5 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
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
            Are you sure you want to delete the deck <strong className="text-gray-900">"{deckToDelete?.name}"</strong>?
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
    </div>
  );
}
