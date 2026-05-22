import { useState, useCallback } from 'react';
import { learningApi } from '@/services/learning.api';
import type { PronunciationCheckResponse } from '@/types';

interface UsePronunciationCheckerReturn {
  result: PronunciationCheckResponse | null;
  isChecking: boolean;
  error: string | null;
  checkPronunciation: (
    audioUri: string,
    userId: string,
    options?: { vocabularyId?: string; targetWord?: string },
  ) => Promise<PronunciationCheckResponse | null>;
  reset: () => void;
}

/**
 * Hook that manages AI pronunciation scoring lifecycle.
 * Single responsibility: upload audio → receive score → expose state.
 */
export const usePronunciationChecker = (): UsePronunciationCheckerReturn => {
  const [result, setResult] = useState<PronunciationCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPronunciation = useCallback(
    async (
      audioUri: string,
      userId: string,
      options: { vocabularyId?: string; targetWord?: string } = {},
    ): Promise<PronunciationCheckResponse | null> => {
      setIsChecking(true);
      setError(null);
      setResult(null);

      try {
        const response = await learningApi.checkPronunciation(audioUri, userId, options);
        setResult(response);
        return response;
      } catch (err: any) {
        const message = err?.message ?? 'Không thể chấm điểm phát âm. Vui lòng thử lại.';
        setError(message);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsChecking(false);
  }, []);

  return { result, isChecking, error, checkPronunciation, reset };
};

export default usePronunciationChecker;
