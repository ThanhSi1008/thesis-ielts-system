'use client';
import { useState, useEffect } from 'react';
import type { CardType } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';
import { CardTypeEditorModal } from './CardTypeEditorModal';

interface Props { onClose: () => void; }

type Dialog =
  | { kind: 'rename'; nt: CardType; value: string }
  | { kind: 'delete'; nt: CardType };

// ── shared sub-dialog shell ───────────────────────────────────────────────────
function SubDialog({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9200] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[360px] border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function CardTypeManagerModal({ onClose }: Props) {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => vocabLabApi.getCardTypes().then(data => {
    setCardTypes(data);
    if (!selectedId && data.length > 0) {
      setSelectedId(data[0].id);
    }
  });

  useEffect(() => { load(); }, []);

  const handleSelectRow = (nt: CardType) => {
    setSelectedId(nt.id);
  };


  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const created = await vocabLabApi.createCardType(name);
    setIsCreateOpen(false);
    setNewName('');
    await load();
    setSelectedId(created.id);
    setEditTargetId(created.id); // Open the editor immediately for the new type
  };

  const confirmRename = async () => {
    if (dialog?.kind !== 'rename') return;
    const name = dialog.value.trim();
    if (!name) return;
    setActionLoading(true);
    try {
      await vocabLabApi.renameCardType(dialog.nt.id, name);
      await load();
      setDialog(null);
    } finally { setActionLoading(false); }
  };

  const confirmDelete = async () => {
    if (dialog?.kind !== 'delete') return;
    setActionLoading(true);
    try {
      await vocabLabApi.deleteCardType(dialog.nt.id);
      await load();
      setSelectedId('');
      setDialog(null);
    } finally { setActionLoading(false); }
  };

  const editTarget = cardTypes.find(nt => nt.id === editTargetId);

  return (
    <>
      {/* ── Main modal ───────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-[9100] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-[580px] flex flex-col border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">Card Types</h2>
            <button
              onClick={() => { setNewName(''); setIsCreateOpen(true); }}
              title="Add Card Type"
              className="mt-1.5 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="px-6">
            <div className="rounded-xl border border-gray-100 overflow-y-auto custom-scrollbar overflow-x-hidden" style={{ height: 280 }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Cards</th>
                    <th className="w-28" />
                  </tr>
                </thead>
                <tbody>
                  {cardTypes.map(nt => {
                    const isSelected = selectedId === nt.id;
                    const canModify = !nt.isBuiltIn;
                    return (
                      <tr
                        key={nt.id}
                        onClick={() => handleSelectRow(nt)}
                        onDoubleClick={() => { handleSelectRow(nt); setEditTargetId(nt.id); }}
                        className={`group cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-4 py-2.5 text-[13px] font-medium border-l-[3px] ${isSelected ? 'border-primary text-gray-900' : 'border-transparent text-gray-700'}`}>
                          <div className="flex items-center gap-2">
                            <span>{nt.name}</span>
                            {/* Rename */}
                            <div className="relative flex items-center group/btn">
                              <button
                                disabled={!canModify}
                                onClick={e => { e.stopPropagation(); setDialog({ kind: 'rename', nt, value: nt.name }); }}
                                className={`p-1 rounded-md transition-colors ${!canModify
                                  ? 'text-gray-200 cursor-not-allowed hidden'
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">
                                Rename
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-[13px] tabular-nums text-gray-400">
                          {nt.cardCount ?? 0}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-0.5">

                            {/* Delete */}
                            <div className="relative flex items-center group/btn">
                              <button
                                disabled={!canModify}
                                onClick={e => { e.stopPropagation(); setDialog({ kind: 'delete', nt }); }}
                                className={`p-1.5 rounded-lg transition-colors ${!canModify
                                  ? 'text-gray-200 cursor-not-allowed'
                                  : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
                              >
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10.5px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">
                                {canModify ? 'Delete' : 'Built-in'}
                              </div>
                            </div>

                            {/* Edit Data */}
                            <div className="relative flex items-center group/btn">
                              <button
                                onClick={e => { e.stopPropagation(); setSelectedId(nt.id); setEditTargetId(nt.id); }}
                                className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors ml-0.5"
                              >
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                                </svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10.5px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">
                                Edit Data
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* Footer */}
          <div className="px-6 py-4 mt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* ── Add dialog ───────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <SubDialog>
          <div className="px-6 pt-5 pb-2">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">New Card Type</h3>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsCreateOpen(false); }}
              placeholder="e.g. FoundationVocabWord, Grammar…"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="px-6 py-4 flex justify-end gap-2">
            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={!newName.trim()} className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Create</button>
          </div>
        </SubDialog>
      )}

      {/* ── Rename dialog ─────────────────────────────────────────────────────── */}
      {dialog?.kind === 'rename' && (
        <SubDialog>
          <div className="px-6 pt-5 pb-2">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Rename Card Type</h3>
            <p className="text-[12px] text-gray-400 mb-4">Currently: <span className="font-medium text-gray-500">{dialog.nt.name}</span></p>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">New name</label>
            <input
              autoFocus
              value={dialog.value}
              onChange={e => setDialog({ ...dialog, value: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setDialog(null); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="px-6 py-4 flex justify-end gap-2">
            <button onClick={() => setDialog(null)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmRename} disabled={!dialog.value.trim() || actionLoading} className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {actionLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </SubDialog>
      )}

      {/* ── Delete dialog ─────────────────────────────────────────────────────── */}
      {dialog?.kind === 'delete' && (
        <SubDialog>
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Delete "{dialog.nt.name}"?</h3>
                {(dialog.nt.cardCount ?? 0) > 0 ? (
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-[12.5px] text-red-800 leading-relaxed font-medium">
                      Warning: Are you sure you want to delete all <span className="font-bold">{dialog.nt.cardCount} card{dialog.nt.cardCount === 1 ? '' : 's'}</span> in this type?
                    </p>
                    <p className="text-[11.5px] text-red-600/90 mt-1">
                      This action will permanently remove those cards from your decks. This cannot be undone.
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-[12.5px] text-gray-500">This action cannot be undone.</p>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-2">
            <button onClick={() => setDialog(null)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmDelete} disabled={actionLoading} className="px-4 py-2 text-[13px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {actionLoading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </SubDialog>
      )}

      {/* ── Edit panel ───────────────────────────────────────────────────────── */}
      {editTargetId && editTarget && (
        <CardTypeEditorModal cardType={editTarget} onClose={() => { setEditTargetId(null); load(); }} />
      )}
    </>
  );
}
