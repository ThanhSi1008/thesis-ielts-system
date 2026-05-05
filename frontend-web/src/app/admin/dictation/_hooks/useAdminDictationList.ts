import { useState, useEffect, useCallback, useRef } from "react";
import { adminDictationApi } from "@/services/admin.api";
import type { DictationVideo } from "@/services/dictation.api";
import { toast } from "@/components/Toaster";

const POLL_INTERVAL_MS = 5000; // poll every 5s while any lesson is PROCESSING

export function useAdminDictationList() {
  const [lessons, setLessons] = useState<DictationVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which IDs were PROCESSING so we can detect the transition
  const processingRef = useRef<Set<string>>(new Set());

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyLessons = useCallback((data: DictationVideo[]) => {
    // Detect any lesson that just became READY
    data.forEach(lesson => {
      if (processingRef.current.has(lesson.id) && lesson.status === "READY") {
        toast.success(
          `"${lesson.title}" is ready — ${(lesson.sentences as any[]).length} sentences transcribed.`,
          6000
        );
        processingRef.current.delete(lesson.id);
      }
    });
    // Track current PROCESSING set
    data.filter(l => l.status === "PROCESSING").forEach(l => processingRef.current.add(l.id));
    setLessons(data);
  }, []);

  // Silent re-fetch (no loading spinner) — used for polling
  const silentFetch = useCallback(async () => {
    try {
      const data = await adminDictationApi.getAll();
      applyLessons(data);
      const hasProcessing = data.some(l => l.status === "PROCESSING");
      if (!hasProcessing) stopPolling();
    } catch {
      // silently fail — don't disrupt the UI during background polls
    }
  }, [applyLessons, stopPolling]);

  const startPolling = useCallback(() => {
    if (pollRef.current !== null) return; // already polling
    pollRef.current = setInterval(silentFetch, POLL_INTERVAL_MS);
  }, [silentFetch]);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminDictationApi.getAll();
      applyLessons(data);
      const hasProcessing = data.some(l => l.status === "PROCESSING");
      if (hasProcessing) startPolling();
      else stopPolling();
    } catch {
      setError("Failed to load dictation lessons.");
    } finally {
      setIsLoading(false);
    }
  }, [applyLessons, startPolling, stopPolling]);

  useEffect(() => {
    fetchLessons();
    return () => stopPolling(); // cleanup on unmount
  }, [fetchLessons, stopPolling]);

  // Watch lessons state — start polling when a new PROCESSING lesson appears
  useEffect(() => {
    const hasProcessing = lessons.some(l => l.status === "PROCESSING");
    if (hasProcessing) startPolling();
  }, [lessons, startPolling]);

  const deleteLesson = useCallback(async (id: string) => {
    try {
      await adminDictationApi.delete(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      processingRef.current.delete(id);
    } catch {
      setError("Failed to delete lesson.");
    }
  }, []);

  const importYoutube = useCallback(async (dto: { youtubeUrl: string; title: string; category?: string }) => {
    setIsImporting(true);
    setError(null);
    try {
      const newLesson = await adminDictationApi.importYoutube(dto);
      setLessons(prev => [newLesson, ...prev]);
      if (newLesson.status === "PROCESSING") {
        processingRef.current.add(newLesson.id);
        startPolling();
        toast.info(
          `Importing "${newLesson.title}" — AI is transcribing…`,
          5000
        );
      }
      return newLesson;
    } catch {
      setError("Failed to import YouTube video.");
      throw new Error("Import failed");
    } finally {
      setIsImporting(false);
    }
  }, [startPolling]);

  const refreshLesson = useCallback(async (id: string) => {
    try {
      const updated = await adminDictationApi.getById(id);
      setLessons(prev => prev.map(l => l.id === id ? updated : l));
    } catch {
      // silently fail
    }
  }, []);

  return { lessons, isLoading, error, deleteLesson, importYoutube, isImporting, refreshLesson, refetch: fetchLessons };
}
