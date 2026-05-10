'use client';

import React from 'react';

interface Props {
  activeFieldId: string | null;
  fieldStyles: Record<string, any>;
  isUploading: boolean;
  onToggleStyle: (key: string, val: string) => void;
  onSetStyle: (key: string, val: string) => void;
  onUploadClick: (type: 'image' | 'audio') => void;
  isVisible: boolean;
}

function Btn({
  children, title, onClick, active, disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500'
          : active ? 'bg-gray-900 dark:bg-gray-700 text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 flex-shrink-0" />;

export function EditorToolbar({ activeFieldId, fieldStyles, isUploading, onToggleStyle, onSetStyle, onUploadClick, isVisible }: Props) {
  if (!isVisible) return null;

  const s = activeFieldId ? fieldStyles[activeFieldId] : null;
  const active = (key: string, val: string) => s?.[key] === val;

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 rounded-t-xl">
      <Btn title="Bold" active={active('fontWeight', 'bold')} onClick={() => onToggleStyle('fontWeight', 'bold')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
      </Btn>
      <Btn title="Italic" active={active('fontStyle', 'italic')} onClick={() => onToggleStyle('fontStyle', 'italic')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
      </Btn>
      <Btn title="Underline" active={active('textDecoration', 'underline')} onClick={() => onToggleStyle('textDecoration', 'underline')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>
      </Btn>

      <Divider />

      <Btn title="Red Text" active={active('color', '#ef4444')} onClick={() => onToggleStyle('color', '#ef4444')} disabled={isUploading || !activeFieldId}>
        <span className="flex flex-col items-center leading-none mt-0.5">
          <span className="text-[9px] font-black">A</span>
          <span className="w-3 h-0.5 bg-red-500 rounded-sm" />
        </span>
      </Btn>
      <Btn title="Amber Highlight" active={active('color', '#ca8a04')} onClick={() => onToggleStyle('color', '#ca8a04')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </Btn>

      <Divider />

      <Btn title="Align Left" active={active('textAlign', 'left')} onClick={() => onSetStyle('textAlign', 'left')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
      </Btn>
      <Btn title="Align Center" active={active('textAlign', 'center')} onClick={() => onSetStyle('textAlign', 'center')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>
      </Btn>
      <Btn title="Align Right" active={active('textAlign', 'right')} onClick={() => onSetStyle('textAlign', 'right')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>
      </Btn>

      <Divider />

      <Btn title="Insert Image" onClick={() => onUploadClick('image')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
      </Btn>
      <Btn title="Attach Audio" onClick={() => onUploadClick('audio')} disabled={isUploading || !activeFieldId}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13,2 13,9 20,9" /></svg>
      </Btn>
    </div>
  );
}
