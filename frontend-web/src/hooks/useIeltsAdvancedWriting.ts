import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface WritingPrompt {
  id: string;
  taskType: "TASK_1" | "TASK_2";
  subType: string;
  source: string;
  category: string;
  bookNumber: number | null;
  testNumber: number | null;
  title: string;
  prompt: string;
  imageUrl: string | null;
  minimumWords: number;
  suggestedTime: number;
  difficulty: string;
  bestScore?: number | null;
  lastAttempt?: string | null;
  activeSession?: {
    id: string;
    draftEssay: string | null;
    createdAt: string;
  } | null;
}

export interface WritingSession {
  id: string;
  userId: string;
  promptId: string;
  essay: string | null;
  draftEssay: string | null;
  timeTaken: number | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADING" | "GRADED" | "GRADING_FAILED";
  feedback: any;
  bandScore: number | null;
  createdAt: string;
  updatedAt: string;
  prompt?: WritingPrompt;
}

export function useWritingPrompts(filters: { taskType?: string, subType?: string, category?: string, page: number, limit: number }) {
  const [data, setData] = useState<{ data: WritingPrompt[]; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    api.get("/ielts/advanced/writing/prompts", { params: filters })
      .then(res => {
        if (isMounted) {
          setData(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filters.taskType, filters.subType, filters.category, filters.page, filters.limit]);

  return { data, isLoading, isError };
}

export function useWritingPromptDetail(id: string) {
  const [data, setData] = useState<WritingPrompt & { sessions: WritingSession[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    api.get(`/ielts/advanced/writing/prompts/${id}`)
      .then(res => {
        if (isMounted) {
          setData(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { data, isLoading, isError };
}

export function useWritingSession(id: string) {
  const [data, setData] = useState<WritingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/ielts/advanced/writing/sessions/${id}`);
      setData(res.data as WritingSession);
      setIsError(false);
      return res.data as WritingSession;
    } catch (e) {
      setIsError(true);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    
    let interval: any;

    const load = async () => {
      if (!isMounted) return;
      try {
        const session = await fetchSession();
        if (session.status === 'GRADING') {
          interval = setInterval(fetchSession, 3000);
        }
      } catch (e) {
        // Handled in fetchSession
      }
    };
    
    load();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [id]);

  return { data, isLoading, isError, refetch: fetchSession };
}

export function useStartWritingSession() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (promptId: string) => {
    setIsPending(true);
    try {
      const res = await api.post("/ielts/advanced/writing/sessions", { promptId });
      return res.data as WritingSession;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useSaveWritingDraft() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ sessionId, draftEssay }: { sessionId: string; draftEssay: string }) => {
    setIsPending(true);
    try {
      const res = await api.patch(`/ielts/advanced/writing/sessions/${sessionId}/draft`, { draftEssay });
      return res.data;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useSubmitWriting() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ sessionId, essay, timeTaken }: { sessionId: string, essay: string, timeTaken: number }) => {
    setIsPending(true);
    try {
      const res = await api.post(`/ielts/advanced/writing/sessions/${sessionId}/submit`, { essay, timeTaken });
      return res.data;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}
