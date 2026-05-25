import { useState, useEffect, useRef } from 'react';

export interface UseExamAutosaveOptions {
  sessionId: string | null;
  enabled: boolean;
  getPayload: () => any;
  save: (sessionId: string, payload: any) => Promise<any>;
  intervalMs?: number;
}

export const EXAM_AUTOSAVE_MS = 12000; // 12 seconds

export function useExamAutosave({
  sessionId,
  enabled,
  getPayload,
  save,
  intervalMs = EXAM_AUTOSAVE_MS,
}: UseExamAutosaveOptions) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPayloadRef = useRef(getPayload);
  getPayloadRef.current = getPayload;

  const saveRef = useRef(save);
  saveRef.current = save;

  const lastSavedPayloadRef = useRef<string>('');

  useEffect(() => {
    if (!sessionId) return;
    lastSavedPayloadRef.current = '';
    setLastSavedAt(null);
    setError(null);
    setIsSaving(false);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const interval = setInterval(async () => {
      try {
        const payload = getPayloadRef.current();
        const payloadStr = JSON.stringify(payload);
        
        // Skip if nothing changed or is empty
        if (!payloadStr || payloadStr === lastSavedPayloadRef.current) return;

        setIsSaving(true);
        setError(null);
        
        await saveRef.current(sessionId, payload);
        
        lastSavedPayloadRef.current = payloadStr;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastSavedAt(timeString);
      } catch (err: any) {
        if (__DEV__) console.warn('[useExamAutosave] Failed to autosave:', err);
        setError(err?.message ?? 'Failed to autosave');
      } finally {
        setIsSaving(false);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [sessionId, enabled, intervalMs]);

  return { lastSavedAt, isSaving, error };
}
