'use client';
import { useState } from 'react';
import type { CardType, CardTemplate } from '@/types';
import { vocabLabApi } from '@/services/vocabLab.api';

interface Props { cardType: CardType; onClose: () => void; }

export function CardTemplateEditorModal({ cardType, onClose }: Props) {
  const [templates] = useState<CardTemplate[]>(cardType.templates);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [frontFields, setFrontFields] = useState<Set<string>>(
    new Set(cardType.templates[0]?.frontFields ?? [])
  );
  const [backFields, setBackFields] = useState<Set<string>>(
    new Set(cardType.templates[0]?.backFields ?? [])
  );
  const [saving, setSaving] = useState(false);

  const template = templates[selectedTemplateIdx];
  const fields = [...cardType.fields].sort((a, b) => a.order - b.order);

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
    if (!template) return;
    setSaving(true);
    try {
      await vocabLabApi.updateTemplate(cardType.id, template.id, {
        frontFields: [...frontFields],
        backFields: [...backFields],
      });
      onClose();
    } finally { setSaving(false); }
  };

  // Derive front field names for static preview
  const frontFieldNames = fields.filter(f => frontFields.has(f.id)).map(f => f.name);
  const backFieldNames = fields.filter(f => backFields.has(f.id)).map(f => f.name);

  return (
    <div className="fixed inset-0 z-[9300] flex items-center justify-center bg-black/40">
      <div className="bg-[#f0f0f0] rounded shadow-2xl w-[750px] flex flex-col overflow-hidden font-sans border border-gray-300">
        {/* Title bar */}
        <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-sm font-semibold text-gray-900">Card Types for {cardType.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
        </div>

        {/* Card type selector */}
        <div className="px-4 pt-3 pb-2 bg-white flex items-center gap-3 border-b border-gray-100">
          <span className="text-[13px] text-gray-600 shrink-0">Card Type:</span>
          <select value={selectedTemplateIdx} onChange={e => setSelectedTemplateIdx(Number(e.target.value))}
            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-400 bg-white">
            {templates.map((t, i) => (
              <option key={t.id} value={i}>{i + 1}: {t.name}</option>
            ))}
          </select>
        </div>

        {/* Editor + Preview */}
        <div className="flex gap-0 bg-white flex-1" style={{ minHeight: 260 }}>
          {/* Template editor (left) */}
          <div className="flex-1 border-r border-gray-200 p-4">
            <div className="text-[13px] font-semibold text-gray-700 mb-3">Template</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Front fields */}
              <div>
                <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Front side</div>
                <div className="flex flex-col gap-1.5">
                  {fields.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-800">
                      <input type="checkbox" checked={frontFields.has(f.id)} onChange={() => toggleFront(f.id)}
                        disabled={cardType.isBuiltIn}
                        className="accent-blue-500 cursor-pointer" />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Back fields */}
              <div>
                <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Back side</div>
                <div className="flex flex-col gap-1.5">
                  {fields.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-800">
                      <input type="checkbox" checked={backFields.has(f.id)} onChange={() => toggleBack(f.id)}
                        disabled={cardType.isBuiltIn}
                        className="accent-blue-500 cursor-pointer" />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview (right) */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="text-[13px] font-semibold text-gray-700 mb-3">Preview</div>
            <div className="flex-1 border border-gray-200 rounded bg-gray-50 flex flex-col items-center justify-center p-6 gap-4 text-center">
              <div className="text-gray-400 text-[13px] uppercase tracking-wide font-semibold">Front</div>
              <div className="text-gray-600 font-medium text-[15px]">
                {frontFieldNames.length > 0 ? frontFieldNames.join(' · ') : <span className="italic text-gray-300">(nothing)</span>}
              </div>
              <div className="w-full border-t border-dashed border-gray-300 my-1" />
              <div className="text-gray-400 text-[13px] uppercase tracking-wide font-semibold">Back</div>
              <div className="text-gray-600 font-medium text-[15px]">
                {backFieldNames.length > 0 ? backFieldNames.join(' · ') : <span className="italic text-gray-300">(nothing)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center">
          <div className="flex gap-3">
            <button onClick={handleFlip} disabled={cardType.isBuiltIn}
              className="px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white text-black hover:border-blue-400 shadow-sm disabled:opacity-50">Flip</button>
          </div>
          <div className="flex-1" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || cardType.isBuiltIn}
              className="min-w-[70px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white text-black hover:border-blue-400 shadow-sm disabled:opacity-50 font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onClose} className="min-w-[70px] px-3 py-1 border border-[#8e8f8f] rounded text-[13.5px] bg-white text-black hover:border-blue-400 shadow-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
