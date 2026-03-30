'use client';
import { useState, useEffect, useRef } from 'react';
import type { NoteType } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface Props {
  selectedNoteTypeId: string;
  onChoose: (nt: NoteType) => void;
  onClose: () => void;
}

export function NoteTypeChooserModal({ selectedNoteTypeId, onChoose, onClose }: Props) {
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [filter, setFilter] = useState('');
  const [highlightedId, setHighlightedId] = useState(selectedNoteTypeId);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const filterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    vocabLabApi.getNoteTypes().then(setNoteTypes).catch(() => {});
    filterRef.current?.focus();
  }, []);

  const filtered = noteTypes.filter(nt =>
    nt.name.toLowerCase().includes(filter.toLowerCase())
  );
  const highlighted = noteTypes.find(nt => nt.id === highlightedId);
  const handleChoose = () => { if (highlighted) onChoose(highlighted); };
  const handleManage = () => setIsManagerOpen(true);

  return (
    <>
      <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-[460px] flex flex-col border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">Choose Card Type</h2>
          </div>

          {/* Search */}
          <div className="px-6 pb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                ref={filterRef}
                type="text"
                value={filter}
                placeholder="Search card types…"
                onChange={e => setFilter(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleChoose(); if (e.key === 'Escape') onClose(); }}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="mx-6 rounded-xl border border-gray-100 overflow-y-auto custom-scrollbar" style={{ height: 220 }}>
            {filtered.map(nt => (
              <button
                key={nt.id}
                type="button"
                onClick={() => setHighlightedId(nt.id)}
                onDoubleClick={() => { setHighlightedId(nt.id); onChoose(nt); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors border-l-2 ${
                  highlightedId === nt.id
                    ? 'bg-primary/10 border-l-primary text-gray-900 font-semibold'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                {nt.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-[13px] text-gray-400 italic">No card types found.</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={handleManage}
              title="Manage Card Types"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChoose}
                disabled={!highlightedId}
                className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Choose
              </button>
            </div>
          </div>
        </div>
      </div>

      {isManagerOpen && (
        <NoteTypeManagerLazy
          onClose={() => {
            setIsManagerOpen(false);
            vocabLabApi.getNoteTypes().then(setNoteTypes).catch(() => {});
          }}
        />
      )}
    </>
  );
}

function NoteTypeManagerLazy({ onClose }: { onClose: () => void }) {
  const [Comp, setComp] = useState<React.ComponentType<{ onClose: () => void }> | null>(null);
  useEffect(() => {
    import('./NoteTypeManagerModal').then(m => setComp(() => m.NoteTypeManagerModal));
  }, []);
  if (!Comp) return null;
  return <Comp onClose={onClose} />;
}
