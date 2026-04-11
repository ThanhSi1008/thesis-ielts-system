'use client';
import { useState, useEffect } from 'react';
import type { CardType, CardTypeField, CardTemplate, FieldStyle, CardStyle } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface Props { cardType: CardType; onClose: () => void; }

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
function FieldsTab({ cardType, onClose, onRefresh }: { cardType: CardType; onClose: () => void; onRefresh?: () => void }) {
  const [fields, setFields] = useState<CardTypeField[]>([...cardType.fields].sort((a, b) => a.order - b.order));

  useEffect(() => {
    setFields([...cardType.fields].sort((a, b) => a.order - b.order));
  }, [cardType.fields]);

  const [selectedId, setSelectedId] = useState(fields[0]?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addVal, setAddVal] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addType, setAddType] = useState<'text' | 'media'>('text');
  const [deleteDialog, setDeleteDialog] = useState<'confirm' | 'alert' | null>(null);

  const selected = fields.find(f => f.id === selectedId);

  const handleSelect = (f: CardTypeField) => {
    setSelectedId(f.id);
  };

  const openAdd = () => { setAddVal(''); setAddDesc(''); setIsAdding(true); };
  const confirmAdd = async () => {
    if (!addVal.trim()) return;
    const newField = await vocabLabApi.addField(cardType.id, { 
      name: addVal.trim(), 
      fieldType: addType,
      description: addDesc.trim() || undefined
    });
    setFields(prev => [...prev, newField].sort((a, b) => a.order - b.order));
    setSelectedId(newField.id);
    setIsAdding(false);
    onRefresh?.();
  };

  const openDelete = () => {
    if (!selected) return;
    if (fields.length <= 1) { setDeleteDialog('alert'); return; }
    setDeleteDialog('confirm');
  };
  const confirmDelete = async () => {
    if (!selected) return;
    await vocabLabApi.deleteField(cardType.id, selectedId);
    const next = fields.filter(f => f.id !== selectedId);
    setFields(next);
    setSelectedId(next[0]?.id ?? '');
    setDeleteDialog(null);
    onRefresh?.();
  };

  const handleRename = async () => {
    if (!selected || !renameVal.trim()) return;
    const updated = await vocabLabApi.updateField(cardType.id, selectedId, { name: renameVal.trim() });
    setFields(prev => prev.map(f => f.id === selectedId ? { ...f, name: updated.name } : f));
    setIsRenaming(false);
    onRefresh?.();
  };

  const handleDescriptionChange = (id: string, val: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, description: val } : f));
  };

  const handleDescriptionBlur = async (id: string, val: string) => {
    setSaving(true);
    try {
      await vocabLabApi.updateField(cardType.id, id, { description: val });
      onRefresh?.();
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    onClose();
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
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-12">No.</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-40">Name</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-32">Type</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-2.5 w-28 align-middle">
                      <button onClick={openAdd} disabled={cardType.isBuiltIn || saving}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        + Add Field
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => {
                    const isSelected = selectedId === f.id;
                    const canModify = !cardType.isBuiltIn;
                    const canDelete = canModify && fields.length > 1;
                    return (
                      <tr key={f.id} onClick={() => handleSelect(f)}
                        className={`group cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
                        <td className={`px-4 py-2.5 text-[13px] font-medium border-l-[3px] text-gray-400 ${isSelected ? 'border-primary' : 'border-transparent'}`}>
                          {i + 1}
                        </td>
                        <td className={`px-4 py-2.5 text-[13px] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          <div className="flex items-center gap-2">
                            <span>{f.name}</span>
                            <div className="relative flex items-center group/btn">
                              <button disabled={!canModify}
                                onClick={(e) => { e.stopPropagation(); setRenameVal(f.name); setIsRenaming(true); setSelectedId(f.id); }}
                                className={`p-1 rounded-md transition-colors ${!canModify ? 'hidden' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}>
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">Rename</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <select
                            value={f.fieldType || 'text'}
                            disabled={!canModify}
                            onChange={async (e) => {
                              const newType = e.target.value as 'text' | 'media';
                              const updated = await vocabLabApi.updateField(cardType.id, f.id, { fieldType: newType });
                              setFields(prev => prev.map(field => field.id === f.id ? { ...field, fieldType: updated.fieldType } : field));
                              onRefresh?.();
                            }}
                            className={`h-7 px-2 text-[12px] font-medium border rounded bg-white text-gray-700 outline-none w-24 cursor-pointer transition-colors ${!canModify ? 'border-transparent bg-transparent bg-none appearance-none cursor-default text-gray-500' : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/50 hover:border-gray-300'
                              }`}
                          >
                            <option value="text">Text</option>
                            <option value="media">Media</option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={f.description ?? ''}
                            onChange={(e) => handleDescriptionChange(f.id, e.target.value)}
                            onBlur={(e) => handleDescriptionBlur(f.id, e.target.value)}
                            disabled={!canModify}
                            placeholder="Optional empty text..."
                            className={`w-full h-8 px-2 text-[12px] bg-transparent border rounded text-gray-700 outline-none transition-colors ${!canModify ? 'border-transparent cursor-default text-gray-500 placeholder-transparent' : 'border-transparent hover:border-gray-200 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/50 placeholder-gray-300'}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-0.5">
                            <div className="relative flex items-center group/btn">
                              <button disabled={!canModify}
                                onClick={e => { e.stopPropagation(); setSelectedId(f.id); openDelete(); }}
                                className={`p-1.5 rounded-lg transition-colors ${!canDelete ? 'text-gray-300 opacity-0 group-hover:opacity-100 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}>
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/btn:opacity-100 pointer-events-none px-2 py-1 bg-gray-900 text-white text-[10.5px] font-semibold tracking-wide rounded transition-all duration-200 translate-y-1 group-hover/btn:translate-y-0 shadow-lg z-50 whitespace-nowrap">Delete</div>
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

        <div className="px-6 pb-2 pt-2 bg-white">
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-center gap-2 pl-[4.5rem]">
              <input type="radio" id="sortByField" name="sortOption" defaultChecked className="accent-primary w-3.5 h-3.5" />
              <label htmlFor="sortByField" className="text-[13px] text-gray-600 font-medium">Sort by this field in the browser</label>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white" />

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button onClick={handleSave} className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors">
            Done
          </button>
        </div>
      </div>

      {isAdding && (
        <MiniDialog title="Add Field">
          <div className="px-6 pb-4 flex flex-col gap-3 mt-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Field name</label>
              <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setIsAdding(false); }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description <span className="text-[9px] font-normal lowercase">(optional)</span></label>
              <textarea value={addDesc} onChange={e => setAddDesc(e.target.value)}
                placeholder="Give context to AI on what data to generate here"
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none placeholder-gray-300" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Field type</label>
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <button onClick={() => setAddType('text')} className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-colors ${addType === 'text' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Text</button>
                <button onClick={() => setAddType('media')} className={`flex-1 py-1.5 text-[12px] font-medium rounded-md transition-colors ${addType === 'media' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Media</button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmAdd} disabled={!addVal.trim()} className="px-4 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">OK</button>
          </div>
        </MiniDialog>
      )}

      {deleteDialog === 'confirm' && (
        <MiniDialog title="Delete Field">
          <div className="px-6 pb-5 mt-1">
            <p className="text-[13px] text-gray-600 leading-relaxed">Delete field <span className="font-semibold text-gray-900">&ldquo;{selected?.name}&rdquo;</span>? This cannot be undone.</p>
          </div>
          <div className="px-6 py-4 flex justify-end gap-2 border-t border-gray-100 bg-gray-50/50">
            <button onClick={() => setDeleteDialog(null)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
            <button onClick={confirmDelete} className="px-4 py-2 text-[13px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </MiniDialog>
      )}

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

      {isRenaming && (
        <MiniDialog title="Rename Field">
          <div className="px-6 pb-4 mt-2">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">New name</label>
            <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
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

// ── Style helpers ─────────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: 'XS', value: 'sm', px: '12px' },
  { label: 'S', value: 'md', px: '15px' },
  { label: 'M', value: 'lg', px: '20px' },
  { label: 'L', value: 'xl', px: '28px' },
  { label: 'XL', value: '2xl', px: '36px' },
];

const FONT_FAMILIES = [
  { label: 'Sans', value: 'sans', css: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'serif', css: 'Georgia, serif' },
  { label: 'Mono', value: 'mono', css: 'ui-monospace, monospace' },
];

type FieldStyleKey = 'fontSize' | 'fontWeight' | 'fontStyle' | 'textDecoration' | 'color' | 'textAlign';

function fieldStyleToCSS(s: Record<string, string>): React.CSSProperties {
  const sz = FONT_SIZES.find(f => f.value === s.fontSize);
  const alignItems = s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center';
  return {
    fontSize: sz?.px,
    fontWeight: s.fontWeight === 'bold' ? 'bold' : undefined,
    fontStyle: s.fontStyle === 'italic' ? 'italic' : undefined,
    textDecoration: s.textDecoration === 'underline' ? 'underline' : undefined,
    color: s.color || undefined,
    textAlign: (s.textAlign as React.CSSProperties['textAlign']) || undefined,
    // flex layout makes align work for block elements (audio, img) not just text
    display: alignItems ? 'flex' : undefined,
    flexDirection: alignItems ? 'column' : undefined,
    alignItems,
  };
}

function cardStyleToCSS(cs: Record<string, string>): React.CSSProperties {
  const ff = FONT_FAMILIES.find(f => f.value === cs.fontFamily);
  return {
    backgroundColor: cs.backgroundColor || undefined,
    fontFamily: ff?.css,
    color: cs.textColor || undefined,
  };
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex items-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-semibold rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg">
        {label}
      </div>
    </div>
  );
}

// ── FieldStyleRow ─────────────────────────────────────────────────────────────
function FieldStyleRow({ label, type, style, onChange }: {
  label: string;
  type: 'text' | 'media';
  style: Record<string, string>;
  onChange: (key: FieldStyleKey, val: string) => void;
}) {
  const isMedia = type === 'media';
  const isActive = (key: FieldStyleKey, val: string) =>
    style[key] === val ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100';

  const AlignIcons = [
    <svg key="l" className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1H2zm0 3h8v1H2zm0 3h10v1H2zm0 3h6v1H2z" /></svg>,
    <svg key="c" className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1H2zm2 3h8v1H4zm1 3h6v1H5zm1 3h4v1H6z" /></svg>,
    <svg key="r" className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v1H2zm4 3h8v1H6zm2 3h6v1H8zm2 3h4v1h-4z" /></svg>,
  ];

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {/* Label + type chip */}
      <div className="w-[72px] shrink-0 flex flex-col gap-0.5">
        <span className="text-[12px] font-bold text-gray-700 truncate" title={label}>{label}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isMedia ? 'text-amber-500' : 'text-blue-500'}`}>
          {isMedia ? 'media' : 'text'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
        {!isMedia && (
          <>
            {/* Font size */}
            <select value={style.fontSize || 'lg'} onChange={e => onChange('fontSize', e.target.value)}
              className="h-7 px-1.5 text-[11px] font-medium border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer">
              {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* B/I/U */}
            <div className="flex rounded overflow-hidden border border-gray-200">
              <Tip label="Bold">
                <button onClick={() => onChange('fontWeight', style.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`h-7 w-7 flex items-center justify-center text-[12px] font-bold transition-colors ${isActive('fontWeight', 'bold')}`}>
                  B
                </button>
              </Tip>
              <Tip label="Italic">
                <button onClick={() => onChange('fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`h-7 w-7 flex items-center justify-center italic text-[12px] border-l border-gray-200 transition-colors ${isActive('fontStyle', 'italic')}`}>
                  I
                </button>
              </Tip>
              <Tip label="Underline">
                <button onClick={() => onChange('textDecoration', style.textDecoration === 'underline' ? 'none' : 'underline')}
                  className={`h-7 w-7 flex items-center justify-center underline text-[12px] border-l border-gray-200 transition-colors ${isActive('textDecoration', 'underline')}`}>
                  U
                </button>
              </Tip>
            </div>

            {/* Alignment */}
            <div className="flex rounded overflow-hidden border border-gray-200">
              {(['left', 'center', 'right'] as const).map((align, i) => (
                <Tip key={align} label={align.charAt(0).toUpperCase() + align.slice(1)}>
                  <button onClick={() => onChange('textAlign', style.textAlign === align ? '' : align)}
                    className={`h-7 w-7 flex items-center justify-center ${i > 0 ? 'border-l border-gray-200' : ''} transition-colors ${(style.textAlign || 'center') === align ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    {AlignIcons[i]}
                  </button>
                </Tip>
              ))}
            </div>

            {/* Text color */}
            <Tip label="Text color">
              <label className="relative h-7 w-7 rounded border border-gray-200 cursor-pointer flex items-center justify-center overflow-hidden hover:border-gray-400 transition-colors bg-white">
                <span className="text-[10px] font-bold" style={{ color: style.color || '#374151' }}>A</span>
                <div className="absolute bottom-0 left-0 right-0 h-[5px]" style={{ backgroundColor: style.color || '#e5e7eb' }} />
                <input type="color" value={style.color || '#374151'} onChange={e => onChange('color', e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </label>
            </Tip>
          </>
        )}

        {isMedia && (
          <>
            <div className="flex rounded overflow-hidden border border-gray-200">
              {(['left', 'center', 'right'] as const).map((align, i) => (
                <Tip key={align} label={align.charAt(0).toUpperCase() + align.slice(1)}>
                  <button onClick={() => onChange('textAlign', style.textAlign === align ? '' : align)}
                    className={`h-7 w-7 flex items-center justify-center ${i > 0 ? 'border-l border-gray-200' : ''} transition-colors ${(style.textAlign || 'center') === align ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    {AlignIcons[i]}
                  </button>
                </Tip>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Cards tab ─────────────────────────────────────────────────────────────────
function CardsTab({ cardType, onClose }: { cardType: CardType; onClose: () => void }) {
  const [templates, setTemplates] = useState<CardTemplate[]>(cardType.templates);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [styleTab, setStyleTab] = useState<'fields' | 'card'>('fields');

  useEffect(() => { setTemplates(cardType.templates); }, [cardType.templates]);

  const template = templates[selectedTemplateIdx];

  const [frontFields, setFrontFields] = useState<Set<string>>(new Set(template?.frontFields ?? []));
  const [backFields, setBackFields] = useState<Set<string>>(new Set(template?.backFields ?? []));
  const [fieldStyles, setFieldStyles] = useState<Record<string, Record<string, string>>>(
    (template?.fieldStyles as Record<string, Record<string, string>>) ?? {}
  );
  const [cardStyle, setCardStyle] = useState<Record<string, string>>(
    (template?.cardStyle as Record<string, string>) ?? {}
  );

  // Sync when switching templates
  useEffect(() => {
    const t = templates[selectedTemplateIdx];
    if (t) {
      setFrontFields(new Set(t.frontFields));
      setBackFields(new Set(t.backFields));
      setFieldStyles((t.fieldStyles as Record<string, Record<string, string>>) ?? {});
      setCardStyle((t.cardStyle as Record<string, string>) ?? {});
    }
  }, [selectedTemplateIdx, templates]);

  const fields = [...cardType.fields].sort((a, b) => a.order - b.order);

  const toggleFront = (id: string) => setFrontFields(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleBack = (id: string) => setBackFields(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleFlip = () => { const tmp = new Set(frontFields); setFrontFields(new Set(backFields)); setBackFields(tmp); };

  const handleFieldStyleChange = (fieldId: string, key: FieldStyleKey, val: string) => {
    setFieldStyles(prev => ({ ...prev, [fieldId]: { ...(prev[fieldId] ?? {}), [key]: val } }));
  };
  const handleCardStyleChange = (key: string, val: string) => {
    setCardStyle(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!template) { onClose(); return; }
    setSaving(true);
    try {
      await vocabLabApi.updateTemplate(cardType.id, template.id, {
        frontFields: [...frontFields],
        backFields: [...backFields],
        fieldStyles: fieldStyles as Record<string, FieldStyle>,
        cardStyle: cardStyle as CardStyle,
      });
      onClose();
    } finally { setSaving(false); }
  };

  const activeFieldIds = [...new Set([...frontFields, ...backFields])];
  const activeFields = fields.filter(f => activeFieldIds.includes(f.id));
  const frontFieldNames = fields.filter(f => frontFields.has(f.id)).map(f => f.name);
  const backFieldNames = fields.filter(f => backFields.has(f.id)).map(f => f.name);
  const cardCSS = cardStyleToCSS(cardStyle);

  return (
    <div className="flex flex-col flex-1">
      {/* Template selector */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-gray-100 bg-gray-50/30">
        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide shrink-0">Template:</span>
        <select value={selectedTemplateIdx} onChange={e => setSelectedTemplateIdx(Number(e.target.value))}
          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-colors">
          {templates.map((t, i) => <option key={t.id} value={i}>{i + 1}: {t.name}</option>)}
        </select>
      </div>

      {/* Main layout: left panel + right preview */}
      <div className="flex bg-white flex-1 min-h-[420px] overflow-hidden">

        {/* ── Left panel ── */}
        <div className="flex-1 border-r border-gray-100 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Field visibility section */}
          <div className="px-5 pt-4 pb-3">
            <div className="text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-3">Field Visibility</div>
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-gray-100">Front</div>
                <div className="flex flex-col gap-2">
                  {fields.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700 font-medium group">
                      <input type="checkbox" checked={frontFields.has(f.id)} onChange={() => toggleFront(f.id)}
                        disabled={cardType.isBuiltIn} className="accent-primary w-4 h-4 cursor-pointer" />
                      <span className="group-hover:text-gray-900 transition-colors truncate">{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-gray-100">Back</div>
                <div className="flex flex-col gap-2">
                  {fields.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700 font-medium group">
                      <input type="checkbox" checked={backFields.has(f.id)} onChange={() => toggleBack(f.id)}
                        disabled={cardType.isBuiltIn} className="accent-primary w-4 h-4 cursor-pointer" />
                      <span className="group-hover:text-gray-900 transition-colors truncate">{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Styling section */}
          <div className="border-t border-gray-100 mx-5 mt-2" />
          <div className="px-5 pt-3 pb-4">
            <div className="text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Styling</div>
            {/* Sub-tabs */}
            <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden mb-3 w-fit">
              {(['fields', 'card'] as const).map((tab, i) => (
                <button key={tab} onClick={() => setStyleTab(tab)}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${styleTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  {tab === 'fields' ? 'Per Field' : 'Card'}
                </button>
              ))}
            </div>

            {styleTab === 'fields' && (
              activeFields.length === 0
                ? <p className="text-[12px] text-gray-400 italic">Select fields above to style them.</p>
                : <div className="flex flex-col">{activeFields.map(f => (
                  <FieldStyleRow key={f.id} label={f.name} type={f.fieldType} style={fieldStyles[f.id] ?? {}}
                    onChange={(key, val) => handleFieldStyleChange(f.id, key, val)} />
                ))}</div>
            )}

            {styleTab === 'card' && (
              <div className="flex flex-col gap-3">
                {/* Background color */}
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-gray-600 w-24 shrink-0">Background</span>
                  <div className="flex items-center gap-2">
                    <label className="relative h-8 w-8 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden hover:border-gray-400 transition-colors shadow-sm">
                      <div className="w-full h-full" style={{ backgroundColor: cardStyle.backgroundColor || '#ffffff' }} />
                      <input type="color" value={cardStyle.backgroundColor || '#ffffff'} onChange={e => handleCardStyleChange('backgroundColor', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </label>
                    <span className="text-[11px] text-gray-500 font-mono">{cardStyle.backgroundColor || '#ffffff'}</span>
                    {cardStyle.backgroundColor && (
                      <button onClick={() => handleCardStyleChange('backgroundColor', '')} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">✕</button>
                    )}
                  </div>
                </div>

                {/* Text color */}
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-gray-600 w-24 shrink-0">Text color</span>
                  <div className="flex items-center gap-2">
                    <label className="relative h-8 w-8 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden hover:border-gray-400 transition-colors shadow-sm">
                      <div className="w-full h-full flex items-center justify-center text-[13px] font-bold" style={{ color: cardStyle.textColor || '#111827' }}>A</div>
                      <input type="color" value={cardStyle.textColor || '#111827'} onChange={e => handleCardStyleChange('textColor', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </label>
                    <span className="text-[11px] text-gray-500 font-mono">{cardStyle.textColor || '#111827'}</span>
                    {cardStyle.textColor && (
                      <button onClick={() => handleCardStyleChange('textColor', '')} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">✕</button>
                    )}
                  </div>
                </div>

                {/* Font family */}
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-gray-600 w-24 shrink-0">Font</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {FONT_FAMILIES.map(ff => (
                      <button key={ff.value} onClick={() => handleCardStyleChange('fontFamily', cardStyle.fontFamily === ff.value ? '' : ff.value)}
                        style={{ fontFamily: ff.css }}
                        className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${cardStyle.fontFamily === ff.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                        {ff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: Live Preview ── */}
        <div className="flex-1 flex flex-col p-5 bg-gray-50/30">
          <div className="text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-3">Live Preview</div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-xs rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-200" style={cardCSS}>
              {/* Front */}
              <div className="px-6 py-5 flex flex-col items-center gap-2 min-h-[100px] justify-center">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: cardStyle.textColor ? `${cardStyle.textColor}80` : '#9ca3af' }}>FRONT</div>
                {frontFieldNames.length > 0
                  ? frontFieldNames.map((name, i) => {
                    const fid = fields.find(f => f.name === name)?.id;
                    const fs = fid ? fieldStyleToCSS(fieldStyles[fid] ?? {}) : {};
                    return (
                      <div key={i} className="font-medium text-[15px] transition-all duration-150"
                        style={{ ...fs, color: fs.color || cardStyle.textColor || '#111827' }}>{name}</div>
                    );
                  })
                  : <span className="italic text-[13px]" style={{ color: '#d1d5db' }}>Empty</span>
                }
              </div>
              <div className="border-t border-dashed" style={{ borderColor: cardStyle.textColor ? `${cardStyle.textColor}25` : '#e5e7eb' }} />
              {/* Back */}
              <div className="px-6 py-5 flex flex-col items-center gap-2 min-h-[100px] justify-center">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: cardStyle.textColor ? `${cardStyle.textColor}80` : '#9ca3af' }}>BACK</div>
                {backFieldNames.length > 0
                  ? backFieldNames.map((name, i) => {
                    const fid = fields.find(f => f.name === name)?.id;
                    const fs = fid ? fieldStyleToCSS(fieldStyles[fid] ?? {}) : {};
                    return (
                      <div key={i} className="font-medium text-[14px] transition-all duration-150"
                        style={{ ...fs, color: fs.color || cardStyle.textColor || '#374151' }}>{name}</div>
                    );
                  })
                  : <span className="italic text-[13px]" style={{ color: '#d1d5db' }}>Empty</span>
                }
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">Changes apply instantly in the study view</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
        <button onClick={handleFlip} disabled={cardType.isBuiltIn}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-[13px] rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Flip Sides
        </button>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || cardType.isBuiltIn}
            className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Combined editor modal (tabbed) ────────────────────────────────────────────
export function CardTypeEditorModal({ cardType: initialCardType, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'fields' | 'cards'>('fields');
  const [cardType, setCardType] = useState(initialCardType);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleRefresh = async () => {
    try {
      const all = await vocabLabApi.getCardTypes();
      const fresh = all.find(nt => nt.id === cardType.id);
      if (fresh) setCardType(fresh);
    } catch (e) {
      console.error('Failed to refresh card type', e);
    }
  };

  const tabs: { key: 'fields' | 'cards'; label: string; icon: React.ReactNode }[] = [
    {
      key: 'fields',
      label: 'Fields',
      icon: <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    },
    {
      key: 'cards',
      label: 'Cards',
      icon: <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9300] flex items-center justify-center bg-black/50">
      <div className={`bg-white flex flex-col overflow-hidden border border-gray-100 transition-all duration-200 ${isMaximized
        ? 'fixed inset-0 rounded-none shadow-none'
        : 'rounded-2xl shadow-2xl w-[1100px] max-h-[90vh]'
        }`}>
        {/* Header */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">Edit Card Type</h2>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-medium text-gray-600 border border-gray-200">{cardType.name}</span>
            </div>
            {/* Window controls */}
            <div className="flex items-center gap-1.5">
              {/* Maximize / Restore */}
              <button
                onClick={() => setIsMaximized(v => !v)}
                title={isMaximized ? 'Restore' : 'Maximize'}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMaximized ? (
                  /* Restore icon */
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="7" y="3" width="10" height="10" rx="1.5" />
                    <path d="M13 7H4a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-9" strokeLinecap="round" />
                  </svg>
                ) : (
                  /* Maximize icon */
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="3" y="3" width="14" height="14" rx="1.5" />
                    <path d="M8 3v3H3M12 3v3h5M8 17v-3H3M12 17v-3h5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                title="Close"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-6 border-b border-gray-100">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center pb-3 pt-1 px-1 mr-6 text-[13px] font-medium border-b-2 transition-colors relative top-px ${activeTab === tab.key ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar bg-gray-50/20">
          {activeTab === 'fields' && <FieldsTab cardType={cardType} onClose={onClose} onRefresh={handleRefresh} />}
          {activeTab === 'cards' && <CardsTab cardType={cardType} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
