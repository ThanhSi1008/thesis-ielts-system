"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminDictationList } from "./_hooks/useAdminDictationList";
import type { DictationVideo } from "@/services/dictation.api";

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  if (status === "READY") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Ready
      </span>
    );
  }
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {status}
    </span>
  );
}

// ─── Delete Confirm Dialog ───
function DeleteDialog({
  lesson,
  onConfirm,
  onCancel,
}: {
  lesson: DictationVideo;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 max-w-sm w-full">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Delete Lesson?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently delete <span className="font-semibold text-gray-800 dark:text-gray-200">&ldquo;{lesson.title}&rdquo;</span> and cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── YouTube Import Modal ───
function YoutubeImportModal({
  onImport,
  onClose,
  isImporting,
}: {
  onImport: (dto: { youtubeUrl: string; title: string; category?: string }) => Promise<unknown>;
  onClose: () => void;
  isImporting: boolean;
}) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const CATEGORIES = ["Conversation", "TED Talk", "Movie Clip", "Music", "News", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !title.trim()) return;
    await onImport({ youtubeUrl: youtubeUrl.trim(), title: title.trim(), category });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Import from YouTube</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          The AI will automatically transcribe and build dictation sentences from the video.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">YouTube URL *</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full text-sm px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Lesson Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Daily English Conversation"
              className="w-full text-sm px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center gap-2"
            >
              {isImporting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ───
export default function AdminDictationListPage() {
  const { lessons, isLoading, error, deleteLesson, importYoutube, isImporting, refetch } = useAdminDictationList();
  const [deleteTarget, setDeleteTarget] = useState<DictationVideo | null>(null);
  const [showImport, setShowImport] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteLesson(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dictation Lessons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            System-wide lessons visible to all students ({lessons.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            YouTube Import
          </button>
          <Link
            href="/admin/dictation/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Lesson
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          {error}
          <button onClick={refetch} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No system dictation lessons yet.</p>
          <Link href="/admin/dictation/new" className="mt-3 inline-block text-sm text-primary hover:underline font-semibold">
            Create your first lesson →
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Title</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Duration</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Sentences</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {lessons.map(lesson => (
                <tr key={lesson.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 max-w-[280px] truncate">{lesson.title}</div>
                    {lesson.youtubeVideoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-primary mt-0.5 block"
                      >
                        {lesson.youtubeVideoId}
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{lesson.category}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{lesson.duration}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {(lesson.sentences as any[]).length}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={lesson.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/dictation/${lesson.id}/edit`}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Edit"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(lesson)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Delete"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      {deleteTarget && (
        <DeleteDialog lesson={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {showImport && (
        <YoutubeImportModal
          onImport={importYoutube}
          onClose={() => setShowImport(false)}
          isImporting={isImporting}
        />
      )}
    </div>
  );
}
