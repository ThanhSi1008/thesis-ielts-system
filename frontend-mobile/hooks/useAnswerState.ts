import { useState, useCallback, useMemo } from 'react';

export function useAnswerState(examType?: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState({ task1: '', task2: '' });
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getAnsweredCount = useCallback((type: string) => {
    const canonicalType = (type || '').toUpperCase();
    if (canonicalType === 'WRITING') {
      return [writingAnswers.task1, writingAnswers.task2].filter((v) => v.trim()).length;
    }
    if (canonicalType === 'SPEAKING') {
      return Object.values(speakingAnswers).filter((v) => v.trim()).length;
    }
    return Object.keys(answers).length;
  }, [answers, writingAnswers, speakingAnswers]);

  const getTotalCount = useCallback((type: string, exam: any) => {
    const canonicalType = (type || '').toUpperCase();
    if (canonicalType === 'WRITING') {
      return 2;
    }
    if (canonicalType === 'SPEAKING') {
      const speakingParts = exam?.questions?.parts || [];
      return speakingParts.reduce(
        (s: number, p: any) => s + (p.questions?.length || (p.cue_card ? 1 : 0)),
        0
      );
    }
    
    // For Listening and Reading, we can count the question numbers in groups
    const parts = exam?.questions?.parts || exam?.questions?.passages || [];
    if (parts.length > 0) {
      let count = 0;
      parts.forEach((part: any) => {
        const groups = part.question_groups || part.groups || part.content || [];
        groups.forEach((g: any) => {
          const allNums = new Set<number>();
          const collectNums = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
              obj.forEach(collectNums);
              return;
            }
            if ('question_number' in obj && obj.question_number != null) {
              allNums.add(Number(obj.question_number));
              return;
            }
            if ('question_numbers' in obj && Array.isArray(obj.question_numbers)) {
              obj.question_numbers.forEach((x: any) => allNums.add(Number(x)));
              return;
            }
            Object.values(obj).forEach(collectNums);
          };
          collectNums(g);
          count += allNums.size;
        });
      });
      if (count > 0) return count;
    }
    
    return undefined;
  }, []);

  const buildSubmitPayload = useCallback((type: string) => {
    const canonicalType = (type || '').toUpperCase();
    if (canonicalType === 'WRITING') {
      return { task1: writingAnswers.task1, task2: writingAnswers.task2 };
    }
    if (canonicalType === 'SPEAKING') {
      return speakingAnswers;
    }
    return answers;
  }, [answers, writingAnswers, speakingAnswers]);

  return {
    answers,
    setAnswers,
    setAnswer,
    writingAnswers,
    setWritingAnswers,
    speakingAnswers,
    setSpeakingAnswers,
    getAnsweredCount,
    getTotalCount,
    buildSubmitPayload,
  };
}
