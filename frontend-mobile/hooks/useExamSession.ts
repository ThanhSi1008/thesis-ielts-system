import { useState, useEffect, useCallback } from 'react';
import { ieltsExamsApi } from '@/services';
import { useGradingPoll } from '@/hooks/useGradingPoll';

export interface UseExamSessionOptions {
  examId: string;
  userId?: string;
  onGradingDone: (sessionId: string) => void;
  onGradingError: (message: string) => void;
}

export function useExamSession({
  examId,
  userId,
  onGradingDone,
  onGradingError,
}: UseExamSessionOptions) {
  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAiGrading, setIsAiGrading] = useState(false);

  const loadExam = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const examData = await ieltsExamsApi.getExam(examId);
      setExam(examData);
      
      if (userId) {
        const sess = await ieltsExamsApi.createSession(examId, userId);
        setSession(sess);
      }
    } catch (e) {
      console.error('Failed to load exam / create session:', e);
    } finally {
      setLoading(false);
    }
  }, [examId, userId]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  // Use grading poll for Writing & Speaking exams graded by AI
  useGradingPoll({
    sessionId: session?.id || null,
    enabled: isAiGrading,
    onDone: (sid) => {
      setIsAiGrading(false);
      onGradingDone(sid);
    },
    onError: (msg) => {
      setIsAiGrading(false);
      onGradingError(msg);
    },
  });

  const submitSession = useCallback(async (payload: any, elapsedSeconds: number) => {
    if (!session) return;
    try {
      setSubmitting(true);
      const isAiType = exam?.type === 'WRITING' || exam?.type === 'SPEAKING';
      if (isAiType) {
        setIsAiGrading(true);
      }
      
      await ieltsExamsApi.submitSession(session.id, payload, elapsedSeconds);
      
      return { success: true, isAiType, sessionId: session.id };
    } catch (e) {
      console.error('Failed to submit session:', e);
      setIsAiGrading(false);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [session, exam]);

  return {
    exam,
    session,
    loading,
    submitting,
    isAiGrading,
    setIsAiGrading,
    submitSession,
    refetch: loadExam,
  };
}
