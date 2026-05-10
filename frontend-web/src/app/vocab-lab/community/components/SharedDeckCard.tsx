import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { SharedDeck } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface SharedDeckCardProps {
  deck: SharedDeck;
  onImportSuccess?: () => void;
}

export function SharedDeckCard({ deck, onImportSuccess }: SharedDeckCardProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setFeedback(null);
    try {
      await vocabLabApi.importSharedDeck(deck.id);
      setFeedback({ type: 'success', text: 'Imported successfully!' });
      onImportSuccess?.();
    } catch (error: any) {
      setFeedback({ type: 'error', text: error?.response?.data?.message || 'Import failed' });
    } finally {
      setIsImporting(false);
    }
  };

  const publishDate = new Date(deck.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {deck.name}
        </h3>
        
        {deck.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
            {deck.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {deck.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{deck.cardCount}</span> cards
          </div>
          <div className="flex items-center gap-3">
            <span title="Import count" className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> {deck.importCount}
            </span>
            <span>{publishDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {deck.publisher.avatar ? (
              <img src={deck.publisher.avatar} alt={deck.publisher.firstName || 'User'} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {(deck.publisher.firstName?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {deck.publisher.firstName} {deck.publisher.lastName}
            </span>
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting || feedback?.type === 'success'}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-gray-900 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary"
          >
            {isImporting ? 'Importing...' : feedback?.type === 'success' ? 'Imported ✓' : 'Import'}
          </button>
        </div>
        
        {feedback?.type === 'error' && (
          <div className="mt-2 text-xs text-red-500">{feedback.text}</div>
        )}
      </div>
    </div>
  );
}
