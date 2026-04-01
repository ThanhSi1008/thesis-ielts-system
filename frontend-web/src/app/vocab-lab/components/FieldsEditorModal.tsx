'use client';
import { useState, useRef } from 'react';
import type { NoteType, NoteTypeField } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface Props { noteType: NoteType; onClose: () => void; }

// ── tiny shared dialog shell ──────────────────────────────────────────────────
function MiniDialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9400] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-2xl w-80 flex flex-col overflow-hidden border border-gray-300">
        <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FieldsEditorModal({ noteType, onClose }: Props) {
  const [fields, setFields] = useState<NoteTypeField[]>([...noteType.fields].sort((a, b) => a.order - b.order));
  const [selectedId, setSelectedId] = useState(fields[0]?.id ?? '');
  const [saving, setSaving] = useState(false);

  // rename dialog
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState('');

  // add dialog
  const [isAdding, setIsAdding] = useState(false);
  const [addVal, setAddVal] = useState('');

  // delete dialog  ('confirm' | 'alert' | null)
  const [deleteDialog, setDeleteDialog] = useState<'confirm' | 'alert' | null>(null);

  // description
  const [descVal, setDescVal] = useState(fields[0]?.description ?? '');

  const selected = fields.find(f => f.id === selectedId);

  const handleSelect = (f: NoteTypeField) => {
    setSelectedId(f.id);
    setDescVal(f.description ?? '');
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const openAdd = () => { setAddVal(''); setIsAdding(true); };
  const confirmAdd = async () => {
    if (!addVal.trim()) return;
    const newField = await vocabLabApi.addField(noteType.id, { name: addVal.trim() });
    setFields(prev => [...prev, newField].sort((a, b) => a.order - b.order));
    setSelectedId(newField.id);
    setDescVal(newField.description ?? '');
    setIsAdding(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const openDelete = () => {
    if (!selected) return;
    if (fields.length <= 1) { setDeleteDialog('alert'); return; }
    setDeleteDialog('confirm');
  };
  const confirmDelete = async () => {
    if (!selected) return;
    await vocabLabApi.deleteField(noteType.id, selectedId);
    const next = fields.filter(f => f.id !== selectedId);
    setFields(next);
    setSelectedId(next[0]?.id ?? '');
    setDescVal(next[0]?.description ?? '');
    setDeleteDialog(null);
  };

  // ── Rename ───────────────────────────────────────────────────────────────────
  const handleRename = async () => {
    if (!selected || !renameVal.trim()) return;
    const updated = await vocabLabApi.updateField(noteType.id, selectedId, { name: renameVal.trim() });
    setFields(prev => prev.map(f => f.id === selectedId ? { ...f, name: updated.name } : f));
    setIsRenaming(false);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await vocabLabApi.updateField(noteType.id, selectedId, { description: descVal });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[9300] flex items-center justify-center bg-black/40">
      <div className="bg-[#f0f0f0] rounded shadow-2xl w-[480px] flex flex-col overflow-hidden font-sans border border-gray-300">
        {/* Title bar */}
        <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-sm font-semibold text-gray-900">Fields for {noteType.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
        </div>

        {/* Body */}
        <div className="flex gap-3 p-4 bg-white">
          {/* Field list */}
          <div className="flex-1 border border-gray-300 overflow-y-auto" style={{ height: 200 }}>
            {fields.map((f, i) => (
              <div
                key={f.id}
                onClick={() => handleSelect(f)}
                className={`px-3 py-1.5 text-[13.5px] cursor-pointer select-none ${selectedId === f.id ? 'bg-primary text-black' : 'hover:bg-primary/10 text-gray-800'}`}
              >
                {i + 1}: {f.name}
              </div>
            ))}
          </div>

          {/* Field action buttons */}
          <div className="flex flex-col gap-2 w-24 shrink-0">
            {[
              { label: 'Add',    action: openAdd,    disabled: noteType.isBuiltIn },
              { label: 'Delete', action: openDelete, disabled: noteType.isBuiltIn || !selected },
              { label: 'Rename', action: () => { setRenameVal(selected?.name ?? ''); setIsRenaming(true); }, disabled: noteType.isBuiltIn || !selected },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                className={`px-2 py-1.5 border rounded text-[13px] shadow-sm transition-colors text-center ${disabled ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-[#8e8f8f] bg-white text-black hover:border-blue-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description row */}
        <div className="px-4 pb-3 bg-white">
          <div className="border-t border-gray-200 pt-3 flex items-center gap-3">
            <label className="text-[13px] text-gray-600 shrink-0 w-24">Description</label>
            <input value={descVal} onChange={e => setDescVal(e.target.value)} disabled={noteType.isBuiltIn}
              placeholder="Text to show inside the field when it's empty"
              className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400" />
          </div>
          <div className="mt-2 flex items-center gap-2 pl-[calc(6rem+0.75rem)]">
            <input type="radio" id="sortByField" name="sortOption" defaultChecked className="accent-blue-500" />
            <label htmlFor="sortByField" className="text-[13px] text-gray-700">Sort by this field in the browser</label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex justify-center gap-4">
          <button onClick={handleSave} disabled={saving || noteType.isBuiltIn}
            className="min-w-[80px] px-3 py-1 border border-[#8e8f8f] rounded hover:border-blue-400 text-[13.5px] bg-white text-black disabled:opacity-50 shadow-sm font-medium">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onClose} className="min-w-[80px] px-3 py-1 border border-[#8e8f8f] rounded hover:border-blue-400 text-[13.5px] bg-white text-black shadow-sm">Cancel</button>
          <button disabled className="min-w-[80px] px-3 py-1 border border-gray-200 rounded text-gray-400 text-[13.5px] bg-gray-50 cursor-not-allowed">Help</button>
        </div>
      </div>

      {/* ── Add Field dialog ─────────────────────────────────────────────────── */}
      {isAdding && (
        <MiniDialog title="Add Field">
          <div className="p-4 flex flex-col gap-1.5">
            <label className="text-[13px] text-gray-600">Field name:</label>
            <input
              autoFocus
              value={addVal}
              onChange={e => setAddVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setIsAdding(false); }}
              className="px-2.5 py-1.5 border border-blue-400 rounded text-[13.5px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="px-4 py-3 flex justify-end gap-3 border-t border-gray-200">
            <button onClick={confirmAdd} disabled={!addVal.trim()} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white disabled:opacity-50 hover:border-blue-400 shadow-sm">OK</button>
            <button onClick={() => setIsAdding(false)} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white hover:border-blue-400 shadow-sm">Cancel</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Delete — confirm dialog ──────────────────────────────────────────── */}
      {deleteDialog === 'confirm' && (
        <MiniDialog title="Delete Field">
          <div className="p-4">
            <p className="text-[13.5px] text-gray-700">
              Delete field <span className="font-semibold">"{selected?.name}"</span>? This cannot be undone.
            </p>
          </div>
          <div className="px-4 py-3 flex justify-end gap-3 border-t border-gray-200">
            <button onClick={confirmDelete} className="min-w-[60px] px-3 py-1 border border-red-400 rounded text-[13.5px] bg-white text-red-600 hover:bg-red-50 shadow-sm">Delete</button>
            <button onClick={() => setDeleteDialog(null)} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white hover:border-blue-400 shadow-sm">Cancel</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Delete — alert (can't delete last field) ─────────────────────────── */}
      {deleteDialog === 'alert' && (
        <MiniDialog title="Cannot Delete">
          <div className="p-4">
            <p className="text-[13.5px] text-gray-700">A note type must have at least one field.</p>
          </div>
          <div className="px-4 py-3 flex justify-end border-t border-gray-200">
            <button onClick={() => setDeleteDialog(null)} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white hover:border-blue-400 shadow-sm">OK</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Rename dialog ────────────────────────────────────────────────────── */}
      {isRenaming && (
        <MiniDialog title="Rename Field">
          <div className="p-4">
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
              className="w-full px-2.5 py-1.5 border border-blue-400 rounded text-[13.5px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="px-4 py-3 flex justify-end gap-3 border-t border-gray-200">
            <button onClick={handleRename} disabled={!renameVal.trim()} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white disabled:opacity-50 hover:border-blue-400 shadow-sm">OK</button>
            <button onClick={() => setIsRenaming(false)} className="min-w-[60px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white hover:border-blue-400 shadow-sm">Cancel</button>
          </div>
        </MiniDialog>
      )}
    </div>
  );
}
