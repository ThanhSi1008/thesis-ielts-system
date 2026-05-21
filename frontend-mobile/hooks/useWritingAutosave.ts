import { useState, useEffect, useRef } from 'react';
import { ieltsAdvancedApi } from '@/services/ielts.api';

export function useWritingAutosave(sessionId: string | null, essay: string) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const essayRef = useRef(essay);
  essayRef.current = essay;
  
  const savedEssayRef = useRef('');

  useEffect(() => {
    if (!sessionId) return;

    // Reset refs on session change
    savedEssayRef.current = essay;
    setLastSavedAt(null);
    setError(null);
    setIsSaving(false);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    // Only set up a timer if the current essay is different from the last saved essay
    if (essay === savedEssayRef.current) return;

    const delayDebounceFn = setTimeout(async () => {
      const currentEssay = essayRef.current;
      if (currentEssay === savedEssayRef.current) return;

      setIsSaving(true);
      setError(null);
      try {
        await ieltsAdvancedApi.saveWritingDraft(sessionId, currentEssay);
        savedEssayRef.current = currentEssay;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedAt(timeString);
      } catch (err: any) {
        console.error('[useWritingAutosave] Failed to autosave:', err);
        setError(err?.message ?? 'Failed to autosave draft');
      } finally {
        setIsSaving(false);
      }
    }, 5000); // 5s debounce

    return () => clearTimeout(delayDebounceFn);
  }, [sessionId, essay]);

  return { lastSavedAt, isSaving, error };
}
