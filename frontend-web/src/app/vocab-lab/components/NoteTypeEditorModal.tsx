'use client';
import { useState, useEffect } from 'react';
import type { NoteType, NoteTypeField, CardTemplate } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface Props { noteType: NoteType; onClose: () => void; }

// ── tiny shared dialog shell ──────────────────────────────────────────────────
function MiniDialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9400] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[360px] flex flex-col overflow-hidden border border-gray-100">
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-[14px] font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Fields tab ────────────────────────────────────────────────────────────────
function FieldsTab({ noteType, onClose, onRefresh }: { noteType: NoteType; onClose: () => void; onRefresh?: () => void }) {
  const [fields, setFields] = useState<NoteTypeField[]>([...noteType.fields].sort((a, b) => a.order - b.order));

  // Sync with parent NoteType updates
  useEffect(() => {
    setFields([...noteType.fields].sort((a, b) => a.order - b.order));
  }, [noteType.fields]);

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
    const newField = await vocabLabApi.addField(noteType.id, addVal.trim());
    setFields(prev => [...prev, newField].sort((a, b) => a.order - b.order));
    setSelectedId(newField.id);
    setDescVal(newField.description ?? '');
    setIsAdding(false);
    onRefresh?.();
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
    onRefresh?.();
  };

  // ── Rename ───────────────────────────────────────────────────────────────────
  const handleRename = async () => {
    if (!selected || !renameVal.trim()) return;
    const updated = await vocabLabApi.updateField(noteType.id, selectedId, { name: renameVal.trim() });
    setFields(prev => prev.map(f => f.id === selectedId ? { ...f, name: updated.name } : f));
    setIsRenaming(false);
    onRefresh?.();
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selected) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await vocabLabApi.updateField(noteType.id, selectedId, { description: descVal });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="p-6 bg-white pb-2">
          <div className="border border-gray-100 rounded-xl overflow-hidden flex flex-col bg-white" style={{ height: 280 }}>
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden bg-white">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-16">No.</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="text-right px-4 py-2.5 w-28 align-middle">
                      <button
                        onClick={openAdd}
                        disabled={noteType.isBuiltIn || saving}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        + Add Field
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => {
                    const isSelected = selectedId === f.id;
                    const canModify = !noteType.isBuiltIn;
                    const canDelete = canModify && fields.length > 1;
                    return (
                      <tr
                        key={f.id}
                        onClick={() => handleSelect(f)}
                        className={`group cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-4 py-2.5 text-[13px] font-medium border-l-[3px] text-gray-400 ${isSelected ? 'border-primary' : 'border-transparent'}`}>
                          {i + 1}
                        </td>
                        <td className={`px-4 py-2.5 text-[13px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          <div className="flex items-center gap-2">
                            <span>{f.name}</span>
                            {/* Rename */}
                            <div className="relative flex items-center group/btn">
                              <button
                                disabled={!canModify}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameVal(f.name);
                                  setIsRenaming(true);
                                  setSelectedId(f.id);
                                }}
                                className={`p-1 rounded-md transition-colors ${!canModify
                                  ? 'hidden'
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">
                                Rename
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-0.5">
                            {/* Delete */}
                            <div className="relative flex items-center group/btn">
                              <button
                                disabled={!canModify}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedId(f.id);
                                  openDelete();
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${!canDelete
                                  ? 'text-gray-300 opacity-0 group-hover:opacity-100 cursor-not-allowed'
                                  : 'text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                              >
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10.5px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">
                                Delete
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
        </div>

        {/* Description row */}
        <div className="px-6 pb-2 pt-2 bg-white">
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide shrink-0 w-24">Description</label>
              <input value={descVal} onChange={e => setDescVal(e.target.value)} disabled={noteType.isBuiltIn}
                placeholder="Text to show inside the field when it's empty"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-gray-400 disabled:opacity-60 transition-colors" />
            </div>
            <div className="flex items-center gap-2 pl-[calc(6rem+1rem)]">
              <input type="radio" id="sortByField" name="sortOption" defaultChecked className="accent-primary w-3.5 h-3.5" />
              <label htmlFor="sortByField" className="text-[13px] text-gray-600 font-medium">Sort by this field in the browser</label>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 bg-white" />

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || noteType.isBuiltIn}
            className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Add Field dialog ─────────────────────────────────────────────────── */}
      {isAdding && (
        <MiniDialog title="Add Field">
          <div className="px-6 pb-4 flex flex-col gap-1.5 mt-2">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Field name</label>
            <input
              autoFocus
              value={addVal}
              onChange={e => setAddVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setIsAdding(false); }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmAdd} disabled={!addVal.trim()} className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Delete — confirm dialog ──────────────────────────────────────────── */}
      {deleteDialog === 'confirm' && (
        <MiniDialog title="Delete Field">
          <div className="px-6 pb-5 mt-1">
            <p className="text-[13px] text-gray-600 leading-relaxed">
              Delete field <span className="font-semibold text-gray-900">"{selected?.name}"</span>? This cannot be undone.
            </p>
          </div>
          <div className="px-6 py-4 flex justify-end gap-2 border-t border-gray-100 bg-gray-50/50">
            <button onClick={() => setDeleteDialog(null)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmDelete} className="px-4 py-2 text-[13px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Delete — alert (can't delete last field) ─────────────────────────── */}
      {deleteDialog === 'alert' && (
        <MiniDialog title="Cannot Delete">
          <div className="px-6 pb-5 mt-1">
            <p className="text-[13px] text-gray-600">A card type must have at least one field.</p>
          </div>
          <div className="px-6 py-4 flex justify-end border-t border-gray-100 bg-gray-50/50">
            <button onClick={() => setDeleteDialog(null)} className="px-4 py-2 text-[13px] font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">OK</button>
          </div>
        </MiniDialog>
      )}

      {/* ── Rename dialog ────────────────────────────────────────────────────── */}
      {isRenaming && (
        <MiniDialog title="Rename Field">
          <div className="px-6 pb-4 mt-2">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">New name</label>
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="px-6 py-4 flex justify-end gap-2 border-t border-gray-100 bg-gray-50/50">
            <button onClick={() => setIsRenaming(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleRename} disabled={!renameVal.trim()} className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button>
          </div>
        </MiniDialog>
      )}
    </>
  );
}

// ── Cards tab ─────────────────────────────────────────────────────────────────
function CardsTab({ noteType, onClose }: { noteType: NoteType; onClose: () => void }) {
  const [templates, setTemplates] = useState<CardTemplate[]>(noteType.templates);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);

  useEffect(() => {
    setTemplates(noteType.templates);
  }, [noteType.templates]);
  const [frontFields, setFrontFields] = useState<Set<string>>(
    new Set(noteType.templates[0]?.frontFields ?? [])
  );
  const [backFields, setBackFields] = useState<Set<string>>(
    new Set(noteType.templates[0]?.backFields ?? [])
  );
  const [saving, setSaving] = useState(false);

  const template = templates[selectedTemplateIdx];
  const fields = [...noteType.fields].sort((a, b) => a.order - b.order);

  const toggleFront = (fieldId: string) => {
    setFrontFields(prev => {
      const next = new Set(prev);
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId);
      return next;
    });
  };

  const toggleBack = (fieldId: string) => {
    setBackFields(prev => {
      const next = new Set(prev);
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId);
      return next;
    });
  };

  const handleFlip = () => {
    const tmp = new Set(frontFields);
    setFrontFields(new Set(backFields));
    setBackFields(tmp);
  };

  const handleSave = async () => {
    if (!template) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await vocabLabApi.updateTemplate(noteType.id, template.id, {
        frontFields: [...frontFields],
        backFields: [...backFields],
      });
      onClose();
    } finally { setSaving(false); }
  };

  const frontFieldNames = fields.filter(f => frontFields.has(f.id)).map(f => f.name);
  const backFieldNames = fields.filter(f => backFields.has(f.id)).map(f => f.name);

  return (
    <div className="flex flex-col flex-1">
      {/* Card type selector */}
      <div className="px-6 py-4 bg-white flex items-center gap-3 border-b border-gray-100 bg-gray-50/30">
        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide shrink-0">Template:</span>
        <select value={selectedTemplateIdx} onChange={e => setSelectedTemplateIdx(Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-colors">
          {templates.map((t, i) => (
            <option key={t.id} value={i}>{i + 1}: {t.name}</option>
          ))}
        </select>
      </div>

      {/* Editor + Preview */}
      <div className="flex gap-6 bg-white p-6 flex-1 min-h-[300px]">
        {/* Template editor (left) */}
        <div className="w-[280px] shrink-0">
          <div className="text-[14px] font-semibold text-gray-900 mb-4">Configuration</div>
          <div className="grid grid-cols-2 gap-6">
            {/* Front fields */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Front</div>
              <div className="flex flex-col gap-2.5">
                {fields.map(f => (
                  <label key={f.id} className="flex items-center gap-2.5 cursor-pointer text-[13px] text-gray-700 font-medium group">
                    <input type="checkbox" checked={frontFields.has(f.id)} onChange={() => toggleFront(f.id)}
                      disabled={noteType.isBuiltIn}
                      className="accent-primary w-4 h-4 cursor-pointer rounded-sm border-gray-300" />
                    <span className="group-hover:text-gray-900 transition-colors">{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Back fields */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Back</div>
              <div className="flex flex-col gap-2.5">
                {fields.map(f => (
                  <label key={f.id} className="flex items-center gap-2.5 cursor-pointer text-[13px] text-gray-700 font-medium group">
                    <input type="checkbox" checked={backFields.has(f.id)} onChange={() => toggleBack(f.id)}
                      disabled={noteType.isBuiltIn}
                      className="accent-primary w-4 h-4 cursor-pointer rounded-sm border-gray-300" />
                    <span className="group-hover:text-gray-900 transition-colors">{f.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-gray-100 my-2" />

        {/* Preview (right) */}
        <div className="flex-1 flex flex-col">
          <div className="text-[14px] font-semibold text-gray-900 mb-4">Live Preview</div>
          <div className="flex-1 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-inner">
            
            <div className="flex flex-col items-center gap-2 w-full max-w-sm">
              <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">Front</div>
              <div className="text-gray-900 font-medium text-[16px]">
                {frontFieldNames.length > 0 ? frontFieldNames.join(' · ') : <span className="italic text-gray-300 font-normal">Empty</span>}
              </div>
            </div>

            <div className="w-full max-w-sm border-t border-dashed border-gray-300 my-6" />
            
            <div className="flex flex-col items-center gap-2 w-full max-w-sm">
              <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">Back</div>
              <div className="text-gray-900 font-medium text-[16px]">
                {backFieldNames.length > 0 ? backFieldNames.join(' · ') : <span className="italic text-gray-300 font-normal">Empty</span>}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <button onClick={handleFlip} disabled={noteType.isBuiltIn}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-[13px] rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Flip Sides
        </button>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || noteType.isBuiltIn}
            className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Combined editor modal (tabbed) ────────────────────────────────────────────
export function NoteTypeEditorModal({ noteType: initialNoteType, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'fields' | 'cards'>('fields');
  const [noteType, setNoteType] = useState(initialNoteType);

  const handleRefresh = async () => {
    try {
      const all = await vocabLabApi.getNoteTypes();
      const fresh = all.find(nt => nt.id === noteType.id);
      if (fresh) setNoteType(fresh);
    } catch (e) {
      console.error('Failed to refresh note type', e);
    }
  };

  const tabs: { key: 'fields' | 'cards'; label: string; icon: React.ReactNode }[] = [
    { 
      key: 'fields', 
      label: 'Fields',
      icon: <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
    },
    { 
      key: 'cards',  
      label: 'Cards',
      icon: <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
  ];

  return (
    <div className="fixed inset-0 z-[9300] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] flex flex-col overflow-hidden border border-gray-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">Edit Card Type</h2>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-medium text-gray-600 border border-gray-200">{noteType.name}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-6 border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center pb-3 pt-1 px-1 mr-6 text-[13px] font-medium border-b-2 transition-colors relative top-px ${
                activeTab === tab.key
                  ? 'border-primary text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content wrapper that groes */}
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar bg-gray-50/20">
          {activeTab === 'fields' && <FieldsTab noteType={noteType} onClose={onClose} onRefresh={handleRefresh} />}
          {activeTab === 'cards'  && <CardsTab  noteType={noteType} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
