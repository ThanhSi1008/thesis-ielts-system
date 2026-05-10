import { useState, useEffect, useCallback } from 'react';
import { shadowingApi } from '@/services/shadowing.api';

interface UseShadowingProgressOptions {
  lessonId: string | undefined;
  totalSentences: number;
  isInitializing: boolean;
}

interface UseShadowingProgressReturn {
  completedSentences: number[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  markCompleted: (index: number) => void;
  isFinished: boolean;
}

export function useShadowingProgress({ lessonId, totalSentences, isInitializing }: UseShadowingProgressOptions): UseShadowingProgressReturn {
  const [completedSentences, setCompletedSentences] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!lessonId || isInitializing || totalSentences === 0) return;

    const fetchProgress = async () => {
      try {
        const progress = await shadowingApi.getProgress(lessonId);
        if (progress && progress.completedSentences) {
          setCompletedSentences(progress.completedSentences);
          const firstIncomplete = progress.completedSentences.length;
          setCurrentIndex(Math.min(firstIncomplete, totalSentences - 1));
        }
      } catch (err) {
        console.error('Failed to load shadowing progress', err);
      }
    };
    fetchProgress();
  }, [lessonId, isInitializing, totalSentences]);

  const markCompleted = useCallback(
    (index: number) => {
      if (!lessonId) return;
      setCompletedSentences((prev) => {
        if (prev.includes(index)) return prev;
        const next = [...prev, index].sort((a, b) => a - b);
        shadowingApi.upsertProgress({
          lessonId,
          completedSentences: next,
        }).catch((err) => console.error('Failed to save shadowing progress', err));
        return next;
      });
    },
    [lessonId]
  );

  const isFinished = totalSentences > 0 && completedSentences.length >= totalSentences;

  return {
    completedSentences,
    currentIndex,
    setCurrentIndex,
    markCompleted,
    isFinished,
  };
}
