"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountSectionProps {
  deleting: boolean;
  onDelete: () => void;
}

const CONFIRM_TEXT = "DELETE";

export default function DeleteAccountSection({ deleting, onDelete }: DeleteAccountSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const isConfirmed = confirmInput === CONFIRM_TEXT;

  const handleDelete = () => {
    if (!isConfirmed) return;
    onDelete();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 md:p-8">
      <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Danger Zone
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete My Account
        </button>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-200 dark:border-red-900/30 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                Are you absolutely sure?
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70">
                This will permanently delete your account, all test history, flashcards, progress, and learning data. Type <strong>{CONFIRM_TEXT}</strong> below to confirm.
              </p>
            </div>
          </div>

          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={`Type "${CONFIRM_TEXT}" to confirm`}
            className="w-full px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800 transition-all"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={!isConfirmed || deleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? "Deleting..." : "Permanently Delete"}
            </button>
            <button
              onClick={() => { setExpanded(false); setConfirmInput(""); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
