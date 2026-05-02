import { useState, useEffect, useCallback } from 'react';
import { dictationApi } from '@/services/dictation.api';

interface UseDictationProgressOptions {
  lessonId: string | undefined;
  totalSentences: number;
  isInitializing: boolean;
}

interface UseDictationProgressReturn {
  completedSentences: number[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  markCompleted: (index: number) => void;
  isFinished: boolean;
  difficulty: string;
  setDifficulty: (diff: string) => void;
}

export function useDictationProgress({ lessonId, totalSentences, isInitializing }: UseDictationProgressOptions): UseDictationProgressReturn {
  const [completedSentences, setCompletedSentences] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('Intermediate');

  useEffect(() => {
    if (!lessonId || isInitializing || totalSentences === 0) return;

    const fetchProgress = async () => {
      try {
        const progress = await dictationApi.getProgress(lessonId);
        if (progress) {
          if (progress.completedSentences) {
            setCompletedSentences(progress.completedSentences);
            const firstIncomplete = progress.completedSentences.length;
            setCurrentIndex(Math.min(firstIncomplete, totalSentences - 1));
          }
          if (progress.difficulty) {
            setDifficulty(progress.difficulty);
          }
        }
      } catch (err) {
        console.error('Failed to load dictation progress', err);
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
        dictationApi.upsertProgress({
          lessonId,
          completedSentences: next,
          difficulty,
        }).catch((err) => console.error('Failed to save dictation progress', err));
        return next;
      });
    },
    [lessonId, difficulty]
  );

  const handleDifficultyChange = (diff: string) => {
    setDifficulty(diff);
    if (!lessonId) return;
    dictationApi.upsertProgress({
      lessonId,
      completedSentences,
      difficulty: diff,
    }).catch((err) => console.error('Failed to save dictation progress', err));
  };

  const isFinished = totalSentences > 0 && completedSentences.length >= totalSentences;

  return {
    completedSentences,
    currentIndex,
    setCurrentIndex,
    markCompleted,
    isFinished,
    difficulty,
    setDifficulty: handleDifficultyChange,
  };
}
