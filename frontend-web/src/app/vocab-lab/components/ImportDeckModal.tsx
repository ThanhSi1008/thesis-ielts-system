import React, { useState, useEffect } from 'react';

export interface LexonData {
  version: number;
  exportedAt: string;
  deck: { name: string };
  cardType: {
    name: string;
    description?: string | null;
    fields: Array<{ name: string; order: number; fieldType: string }>;
    templates: Array<{ name: string; frontFieldNames: string[]; backFieldNames: string[] }>;
  } | null;
  cards: Array<{
    fieldValues: Record<string, string>;
    tags?: string[];
  }>;
}

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (deckName: string) => Promise<void>;
  lexonData: LexonData | null;
  isImporting: boolean;
  existingDeckNames: string[];
}

export function ImportDeckModal({ isOpen, onClose, onConfirmImport, lexonData, isImporting, existingDeckNames }: ImportDeckModalProps) {
  const [deckName, setDeckName] = useState('');

  // Sync deck name from lexonData when it changes
  useEffect(() => {
    if (lexonData) {
      setDeckName(lexonData.deck.name);
    }
  }, [lexonData]);

  if (!isOpen || !lexonData) return null;

  const nameConflict = existingDeckNames.includes(deckName);
  const previewCards = lexonData.cards.slice(0, 3);
  const remainingCount = Math.max(0, lexonData.cards.length - 3);
  const exportDate = new Date(lexonData.exportedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 border dark:border-gray-800 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            📥 Import Deck
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Deck Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Deck Name
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {nameConflict && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                ⚠ A deck with this name already exists. It will be imported with a date suffix.
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>📇</span>
              <span className="font-semibold">{lexonData.cards.length}</span> cards
              {lexonData.cardType && (
                <>
                  <span className="text-gray-400 mx-1">·</span>
                  <span>📋 Card Type:</span>
                  <span className="font-medium text-primary">{lexonData.cardType.name}</span>
                </>
              )}
            </div>
            {lexonData.cardType && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                📝 Fields: {lexonData.cardType.fields.map(f => f.name).join(', ')}
              </div>
            )}
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              📅 Exported: {exportDate}
            </div>
          </div>

          {/* Preview Cards */}
          {previewCards.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Preview
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {previewCards.map((card, i) => (
                  <div key={i} className="px-4 py-3 text-sm">
                    {Object.entries(card.fieldValues).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium min-w-[60px]">{key}:</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{stripHtml(value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {remainingCount > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                  ... and {remainingCount} more cards
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmImport(deckName)}
            disabled={isImporting || !deckName.trim()}
            className="px-5 py-2.5 bg-primary text-gray-900 font-medium rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : `Import ${lexonData.cards.length} cards`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to strip HTML tags for preview display
function stripHtml(html: string): string {
  if (typeof html !== 'string') return String(html);
  return html.replace(/<[^>]*>/g, '').trim().slice(0, 80);
}
