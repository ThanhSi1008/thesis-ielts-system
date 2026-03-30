'use client';

import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { DeckWithCounts, NoteType } from '@/types';
import { NoteTypeChooserModal } from './NoteTypeChooserModal';
import { toast } from '@/components/Toaster';

export function AddCardTab({ isActive }: { isActive: boolean }) {
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [deckId, setDeckId] = useState('');
  const [noteType, setNoteType] = useState<NoteType | null>(null);
  const [isNoteTypeChooserOpen, setIsNoteTypeChooserOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media Tracking
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isDeckChooserOpen, setIsDeckChooserOpen] = useState(false);
  const [deckFilter, setDeckFilter] = useState('');
  const [modalSelectedDeckId, setModalSelectedDeckId] = useState('');
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const openDeckChooser = () => {
    setModalSelectedDeckId(deckId);
    setDeckFilter('');
    setIsDeckChooserOpen(true);
  };

  const handleModalChoose = () => {
    if (modalSelectedDeckId) {
      setDeckId(modalSelectedDeckId);
      setIsDeckChooserOpen(false);
    }
  };

  const handleModalAdd = () => {
    setNewDeckName('');
    setIsCreateDeckOpen(true);
  };

  const handleCreateDeckOk = async () => {
    const name = newDeckName.trim();
    if (!name) return;
    try {
      const newDeck = await vocabLabApi.createDeck(name);
      setDecks(prev => [...prev, { ...newDeck, totalCards: 0, newCount: 0, learningCount: 0, dueCount: 0 }]);
      setModalSelectedDeckId(newDeck.id);
      setDeckId(newDeck.id);
      setIsCreateDeckOpen(false);
      setIsDeckChooserOpen(false);
      toast.success(`Deck "${name}" created!`);
    } catch (error) {
      toast.error('Failed to create deck');
    }
  };

  const filteredDecks = decks.filter(d => d.name.toLowerCase().includes(deckFilter.toLowerCase()));

  // When noteType changes, reset fieldValues with empty strings per field
  const initFieldValues = (nt: NoteType) => {
    const init: Record<string, string> = {};
    nt.fields.forEach(f => { init[f.id] = ''; });
    setFieldValues(init);
  };

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await vocabLabApi.getDecks();
        setDecks(data);
        if (data.length > 0 && !deckId) setDeckId(data[0].id);
      } catch (error) {
        console.error('Failed to fetch decks:', error);
      }
    };
    const fetchNoteTypes = async () => {
      try {
        const types = await vocabLabApi.getNoteTypes();
        const basic = types.find(t => t.isBuiltIn) ?? types[0];
        if (basic && !noteType) { setNoteType(basic); initFieldValues(basic); }
      } catch { }
    };
    if (isActive) { fetchDecks(); fetchNoteTypes(); }
  }, [isActive]);

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tagsList.includes(newTag)) {
        setTagsList([...tagsList, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) { toast.error('Please select or create a deck first.'); return; }
    if (!noteType) { toast.error('Please select a note type.'); return; }

    // For Basic (front/back), derive front and back from fieldValues
    const fields = noteType.fields.sort((a, b) => a.order - b.order);
    const template = noteType.templates[0];
    const frontFieldId = template?.frontFields[0] ?? fields[0]?.id;
    const backFieldId = template?.backFields[0] ?? fields[1]?.id;
    const front = fieldValues[frontFieldId] ?? '';
    const back = fieldValues[backFieldId] ?? '';

    setIsSubmitting(true);
    try {
      await vocabLabApi.createFlashcard({
        deckId,
        front,
        back,
        tags: tagsList.length > 0 ? tagsList : undefined,
        noteTypeId: noteType.id,
        fieldValues,
      });
      toast.success('Card added successfully!');
      if (noteType) initFieldValues(noteType);
    } catch {
      toast.error('Failed to add card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadClick = (type: 'image' | 'audio') => {
    if (!activeFieldId) {
      toast.error('Please click inside a text field first to insert media.');
      return;
    }
    if (type === 'image') imageInputRef.current?.click();
    else audioInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file || !activeFieldId) return;

    try {
      setIsUploading(true);
      toast.info(`Uploading ${type}...`);
      const res = await vocabLabApi.uploadMedia(file);
      toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);

      const html = type === 'image'
        ? `<img src="${res.url}" alt="${file.name}" className="max-w-full rounded-lg my-2 max-h-[300px] object-contain" />`
        : `<audio controls src="${res.url}" className="w-full my-2 outline-none"></audio>`;

      setFieldValues(prev => {
        const current = prev[activeFieldId] || '';
        const newVal = current + (current.endsWith('\n') || current === '' ? '' : '\n') + html + '\n';
        return { ...prev, [activeFieldId]: newVal };
      });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input so same file can trigger change again
    }
  };

  const ToolbarButton = ({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={isUploading}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="max-w-3xl mx-auto mt-2">
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*,video/*" onChange={e => handleFileUpload(e, 'audio')} />
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e as any);
          }
        }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col mb-10"
      >

        {/* Header Bar: Deck & Note Type Selectors */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Add to</span>
            {decks.length === 0 ? (
              <span className="text-[13px] text-red-500 italic">Create a deck first</span>
            ) : (
              <button
                type="button"
                onClick={openDeckChooser}
                className="flex items-center justify-between min-w-[170px] h-9 px-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm text-[13px] font-medium text-gray-800 transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <span className="truncate max-w-[130px] text-left">{decks.find(d => d.id === deckId)?.name || 'Select deck'}</span>
                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
            <button
              type="button"
              onClick={() => setIsNoteTypeChooserOpen(true)}
              className="flex items-center gap-2 min-w-[140px] h-9 px-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm text-[13px] font-medium text-gray-800 transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              {noteType?.name ?? 'Basic'}
            </button>
          </div>
        </div>

        {/* Main Editor Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6 bg-white">

          {/* Minimal Formatting Toolbar */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 w-max bg-gray-50 border border-gray-100 rounded-lg">
            <ToolbarButton title="Bold"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg></ToolbarButton>
            <ToolbarButton title="Italic"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg></ToolbarButton>
            <ToolbarButton title="Underline"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Text Color">
              <span className="flex flex-col items-center leading-none">
                <span className="text-[11px] font-bold">A</span>
                <span className="w-3.5 h-[3px] bg-red-500 rounded-sm -mt-px"></span>
              </span>
            </ToolbarButton>
            <ToolbarButton title="Highlight"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Align Left"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></ToolbarButton>
            <ToolbarButton title="Align Center"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></ToolbarButton>
            <ToolbarButton title="Align Right"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg></ToolbarButton>

            <ToolbarDivider />

            <ToolbarButton title="Insert Image" onClick={() => handleUploadClick('image')}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            </ToolbarButton>
            <ToolbarButton title="Attach Audio" onClick={() => handleUploadClick('audio')}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </ToolbarButton>
          </div>

          {/* Dynamic Fields */}
          <div className="flex flex-col gap-6">
            {noteType && [...noteType.fields].sort((a, b) => a.order - b.order).map((field, idx) => {
              const value = fieldValues[field.id] ?? '';
              const hasMedia = /<(img|audio)\s/i.test(value);

              // Split value into text parts and media parts so we can show both
              const textOnly = value.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '').replace(/\n+/g, '\n').trim();
              const mediaMatches = [...value.matchAll(/<(img|audio)[^>]*>(<\/audio>)?/gi)].map(m => m[0]);

              return (
                <div key={field.id} className="group flex flex-col relative" onClick={() => setActiveFieldId(field.id)}>
                  {idx > 0 && <div className="h-px bg-gray-100 mb-6 absolute top-[-12px] left-0 right-0" />}
                  <label className="text-[12px] font-bold text-gray-400/80 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-primary">
                    {field.name}
                  </label>

                  {/* Text input - always shown */}
                  <textarea
                    value={textOnly || (hasMedia ? '' : value)}
                    rows={1}
                    onFocus={() => setActiveFieldId(field.id)}
                    onChange={e => {
                      const newText = e.target.value;
                      // Reconstruct: new text + existing media tags
                      const mediaHtml = mediaMatches.join('\n');
                      const newVal = [newText, mediaHtml].filter(Boolean).join('\n');
                      setFieldValues(prev => ({ ...prev, [field.id]: newVal }));
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder={hasMedia ? 'Add text (optional)...' : undefined}
                    className="w-full bg-transparent border-none p-0 text-[16px] text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none resize-none overflow-hidden placeholder:font-light"
                    required={idx === 0 && !hasMedia}
                  />

                  {/* Media preview section */}
                  {hasMedia && (
                    <div className="mt-3 flex flex-col gap-3">
                      {mediaMatches.map((tag, mIdx) => {
                        const isAudio = /^<audio/i.test(tag);
                        return (
                          <div key={mIdx} className="relative group/media rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = mediaMatches.filter((_, i) => i !== mIdx);
                                const newVal = [textOnly, ...remaining].filter(Boolean).join('\n');
                                setFieldValues(prev => ({ ...prev, [field.id]: newVal }));
                              }}
                              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover/media:opacity-100"
                              title="Remove"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            {isAudio ? (
                              <div className="p-3">
                                <div
                                  className="w-full [&_audio]:w-full [&_audio]:outline-none [&_audio]:rounded-lg"
                                  dangerouslySetInnerHTML={{ __html: tag }}
                                />
                              </div>
                            ) : (
                              <div
                                className="p-3 flex items-center justify-center [&_img]:max-h-[240px] [&_img]:max-w-full [&_img]:object-contain [&_img]:rounded-lg"
                                dangerouslySetInnerHTML={{ __html: tag }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400/80 uppercase tracking-wider">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              Tags
            </div>
            <div className="flex items-center flex-wrap gap-2 min-h-[32px]">
              {tagsList.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-[13px] text-gray-700 font-medium group transition-colors shadow-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 group-hover:text-red-500 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tagsList.length === 0 ? 'Type a tag and press Enter...' : 'Add another tag...'}
                className="bg-transparent border-none text-[14px] outline-none focus:ring-0 text-gray-800 placeholder-gray-300 min-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Footer Card */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-gray-400 font-medium tracking-wide">
            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded bg-white font-sans text-[11px] shadow-sm">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded bg-white font-sans text-[11px] shadow-sm">Enter</kbd>
            <span className="ml-1">to add quickly</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || decks.length === 0}
            className="px-6 py-2.5 bg-primary text-gray-900 font-bold text-[14px] rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.98] min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                Add Card
              </>
            )}
          </button>
        </div>

      </form>

      {/* Deck Chooser Modal */}
      {isDeckChooserOpen && (
        <div className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Choose Deck</h2>
            </div>

            {/* Body */}
            <div className="px-6 flex flex-col gap-4">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search decks..."
                  value={deckFilter}
                  onChange={e => setDeckFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="border border-gray-100 rounded-xl overflow-y-auto h-[240px] flex flex-col bg-white">
                {filteredDecks.map(d => (
                  <div
                    key={d.id}
                    onClick={() => setModalSelectedDeckId(d.id)}
                    onDoubleClick={() => { setModalSelectedDeckId(d.id); setTimeout(handleModalChoose, 10); }}
                    className={`px-4 py-3 text-[13px] cursor-pointer transition-colors border-l-[3px] ${modalSelectedDeckId === d.id
                      ? 'bg-primary/5 border-l-primary text-gray-900 font-semibold'
                      : 'border-l-transparent text-gray-600 font-medium hover:bg-gray-50'
                      }`}
                  >
                    {d.name}
                  </div>
                ))}
                {filteredDecks.length === 0 && (
                  <div className="px-4 py-8 flex flex-col items-center justify-center text-gray-400">
                    <p className="text-[13px]">No decks found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 mt-4 border-t border-gray-100 bg-gray-50/50 flex flex-row-reverse items-center justify-between">
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsDeckChooserOpen(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleModalChoose} disabled={!modalSelectedDeckId} className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                  Choose
                </button>
              </div>
              <button title="Create Deck" type="button" onClick={handleModalAdd} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      {isCreateDeckOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] flex flex-col overflow-hidden border border-gray-100">
            {/* Title bar */}
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Create Deck</h2>
            </div>

            {/* Body */}
            <div className="px-6 pt-4 pb-2">
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deck Name</label>
              <input
                type="text"
                autoFocus
                value={newDeckName}
                onChange={e => setNewDeckName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateDeckOk();
                  if (e.key === 'Escape') setIsCreateDeckOpen(false);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 mt-6 border-t border-gray-100 bg-gray-50/50 flex flex-row-reverse gap-2">
              <button
                type="button"
                onClick={handleCreateDeckOk}
                disabled={!newDeckName.trim()}
                className="px-5 py-2 text-[13px] font-semibold bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreateDeckOpen(false)}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Type Chooser Modal */}
      {isNoteTypeChooserOpen && (
        <NoteTypeChooserModal
          selectedNoteTypeId={noteType?.id ?? ''}
          onChoose={(nt) => {
            setNoteType(nt);
            initFieldValues(nt);
            setIsNoteTypeChooserOpen(false);
          }}
          onClose={() => setIsNoteTypeChooserOpen(false)}
        />
      )}
    </div>
  );
}
