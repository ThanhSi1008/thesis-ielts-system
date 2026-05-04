import { useState, useEffect, useCallback } from "react";
import { adminShadowingApi } from "@/services/admin.api";
import type { ShadowingVideo } from "@/services/shadowing.api";

export function useAdminShadowingList() {
  const [lessons, setLessons] = useState<ShadowingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminShadowingApi.getAll();
      setLessons(data);
    } catch {
      setError("Failed to load lessons.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const deleteLesson = useCallback(async (id: string) => {
    try {
      await adminShadowingApi.delete(id);
      setLessons(prev => prev.filter(l => l.id !== id));
    } catch {
      setError("Failed to delete lesson.");
    }
  }, []);

  const importYoutube = useCallback(async (dto: { youtubeUrl: string; title: string; category?: string }) => {
    setIsImporting(true);
    setError(null);
    try {
      const newLesson = await adminShadowingApi.importYoutube(dto);
      setLessons(prev => [newLesson, ...prev]);
      return newLesson;
    } catch {
      setError("Failed to import YouTube video.");
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const refreshLesson = useCallback(async (id: string) => {
    try {
      const updated = await adminShadowingApi.getById(id);
      setLessons(prev => prev.map(l => l.id === id ? updated : l));
    } catch {
      // silently fail refresh
    }
  }, []);

  return { lessons, isLoading, error, deleteLesson, importYoutube, isImporting, refreshLesson, refetch: fetchLessons };
}
