import { useState, useEffect, useCallback } from "react";
import { adminDictationApi } from "@/services/admin.api";
import type { DictationVideo } from "@/services/dictation.api";

export function useAdminDictationList() {
  const [lessons, setLessons] = useState<DictationVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminDictationApi.getAll();
      setLessons(data);
    } catch {
      setError("Failed to load dictation lessons.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const deleteLesson = useCallback(async (id: string) => {
    try {
      await adminDictationApi.delete(id);
      setLessons(prev => prev.filter(l => l.id !== id));
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
      return newLesson;
    } catch {
      setError("Failed to import YouTube video.");
      throw new Error("Import failed");
    } finally {
      setIsImporting(false);
    }
  }, []);

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
