"use client";

import { useState } from "react";
import type { ShadowingFormData } from "../_hooks/useAdminShadowingForm";
import { SentenceEditor, CATEGORIES } from "./SentenceEditor";
import type { SentenceFormData } from "../_hooks/useAdminShadowingForm";

interface ShadowingLessonFormProps {
  formData: ShadowingFormData;
  errors: Partial<Record<keyof ShadowingFormData, string>>;
  isSubmitting: boolean;
  submitLabel: string;
  onSetField: <K extends keyof ShadowingFormData>(field: K, value: ShadowingFormData[K]) => void;
  onAddSentence: () => void;
  onRemoveSentence: (index: number) => void;
  onUpdateSentence: (index: number, updates: Partial<SentenceFormData>) => void;
  onMoveSentence: (from: number, to: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder="Type a tag and press Enter..."
          className="flex-1 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function ShadowingLessonForm({
  formData, errors, isSubmitting, submitLabel,
  onSetField, onAddSentence, onRemoveSentence, onUpdateSentence, onMoveSentence,
  onSubmit, onCancel,
}: ShadowingLessonFormProps) {
  const inputClass = "w-full text-sm px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(); }}
      className="flex flex-col gap-6"
    >
      {/* Section: Basic Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Basic Information</h2>

        {/* Title */}
        <div>
          <FieldLabel label="Title" required />
          <input
            id="lesson-title"
            type="text"
            value={formData.title}
            onChange={e => onSetField("title", e.target.value)}
            placeholder="e.g. Melbourne City Tour"
            className={inputClass}
          />
          <FieldError message={errors.title} />
        </div>

        {/* Category + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Category" required />
            <select
              id="lesson-category"
              value={formData.category}
              onChange={e => onSetField("category", e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError message={errors.category} />
          </div>
          <div>
            <FieldLabel label="Duration" required />
            <input
              id="lesson-duration"
              type="text"
              value={formData.duration}
              onChange={e => onSetField("duration", e.target.value)}
              placeholder="e.g. 5:32"
              className={inputClass}
            />
            <FieldError message={errors.duration} />
          </div>
        </div>

        {/* Folder */}
        <div>
          <FieldLabel label="Folder" />
          <input
            type="text"
            value={formData.folder}
            onChange={e => onSetField("folder", e.target.value)}
            placeholder="All Videos"
            className={inputClass}
          />
        </div>

        {/* Tags */}
        <div>
          <FieldLabel label="Tags" />
          <TagInput tags={formData.tags} onChange={t => onSetField("tags", t)} />
        </div>
      </div>

      {/* Section: Media */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Media</h2>

        <div>
          <FieldLabel label="YouTube Video ID" />
          <input
            id="lesson-youtube-id"
            type="text"
            value={formData.youtubeVideoId}
            onChange={e => {
              // Accept full URLs too — extract ID
              const raw = e.target.value.trim();
              const match = raw.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
              onSetField("youtubeVideoId", match ? match[1] : raw);
            }}
            placeholder="dQw4w9WgXcQ or full YouTube URL"
            className={inputClass}
          />
          {formData.youtubeVideoId && (
            <a
              href={`https://www.youtube.com/watch?v=${formData.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-xs text-primary hover:underline inline-block"
            >
              Preview on YouTube ↗
            </a>
          )}
        </div>

        <div>
          <FieldLabel label="Audio URL" />
          <input
            type="text"
            value={formData.audioUrl}
            onChange={e => onSetField("audioUrl", e.target.value)}
            placeholder="https://... (alternative to YouTube)"
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel label="Thumbnail Image URL" />
          <input
            type="text"
            value={formData.imageUrl}
            onChange={e => onSetField("imageUrl", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          {formData.imageUrl && (
            <img src={formData.imageUrl} alt="thumbnail preview" className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
          )}
        </div>
      </div>

      {/* Section: Sentences */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Sentences
            <span className="ml-2 text-primary font-bold normal-case">({formData.sentences.length})</span>
          </h2>
        </div>
        <SentenceEditor
          sentences={formData.sentences}
          youtubeVideoId={formData.youtubeVideoId}
          onAdd={onAddSentence}
          onRemove={onRemoveSentence}
          onUpdate={onUpdateSentence}
          onMove={onMoveSentence}
        />
      </div>

      {/* Submit bar */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center gap-2"
        >
          {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
