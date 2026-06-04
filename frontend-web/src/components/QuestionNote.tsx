"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notesApi, type QuestionNote } from "@/services/notes.api";
import { Check, Edit3, Trash2 } from "lucide-react";

interface QuestionNoteProps {
  questionNumber: number;
}

export default function QuestionNoteSection({ questionNumber }: QuestionNoteProps) {
  const params = useParams() as { exerciseId?: string; examId?: string; sessionId?: string };
  const examId = params.exerciseId || params.examId;

  const [userId, setUserId] = useState<string | null>(null);
  const [note, setNote] = useState<QuestionNote | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.id) setUserId(u.id);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!userId || !examId) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      try {
        const notes = await notesApi.getExamNotes(userId, examId);
        const match = notes.find((n) => n.questionNumber === questionNumber);
        if (match) {
          setNote(match);
          setText(match.noteText);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Failed to load notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId, examId, questionNumber]);

  const handleSave = async () => {
    if (!userId || !examId) return;
    setSaving(true);
    try {
      const saved = await notesApi.upsertNote(userId, examId, questionNumber, text.trim());
      setNote(saved);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    setSaving(true);
    try {
      await notesApi.deleteNote(note.id);
      setNote(null);
      setText("");
      setIsEditing(true);
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-2 bg-yellow-50/30 border border-yellow-100 rounded-xl p-3 text-xs text-amber-600 animate-pulse">
        Loading notes...
      </div>
    );
  }

  if (!userId || !examId) {
    return (
      <div className="w-full mt-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
        Please log in to add notes.
      </div>
    );
  }

  return (
    <div className="w-full mt-2 bg-amber-50/40 border border-amber-100 rounded-xl p-4 flex flex-col gap-2 transition-all">
      {note && !isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">Saved Note</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-amber-100 rounded text-amber-600 transition-colors"
                title="Edit note"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors disabled:opacity-50"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed italic bg-white/50 p-2.5 rounded-lg border border-amber-100/50">
            "{note.noteText}"
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-20 p-2.5 text-[13px] border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
            placeholder="Write your study notes here..."
          />
          <div className="flex justify-end gap-2">
            {note && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FFC107] hover:bg-yellow-500 text-gray-900 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
