"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

export interface SpeakingPartSummary {
  id: string;
  partNumber: number;
  partType: string;
  topic: string;
  source: string;
  category: string;
  bookNumber: number | null;
  testNumber: number | null;
  title: string;
  questions: { text: string }[];
  bestScore?: number | null;
  lastAttempt?: string | null;
}

export interface SpeakingPartDetail extends SpeakingPartSummary {
  activeSession: { id: string; createdAt: string } | null;
}

export interface SpeakingSession {
  id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADING" | "GRADED" | "GRADING_FAILED";
  bandScore: number | null;
  timeTaken: number | null;
  feedback: { error?: string; [key: string]: unknown } | null;
  part?: {
    id: string;
    title: string;
    partNumber: number;
    partType: string;
    topic: string;
    questions: { text: string }[];
  };
  createdAt: string;
}

export function useSpeakingParts(filters: {
  partNumber?: number;
  category?: string;
  topic?: string;
  page: number;
  limit: number;
}) {
  const [data, setData] = useState<{
    data: SpeakingPartSummary[];
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { partNumber, category, topic, page, limit } = filters;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    api
      .get("/ielts/advanced/speaking/parts", {
        params: { partNumber, category, topic, page, limit },
      })
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [partNumber, category, topic, page, limit]);

  return { data, isLoading, isError };
}

export function useSpeakingPartDetail(id: string) {
  const [data, setData] = useState<SpeakingPartDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    api
      .get(`/ielts/advanced/speaking/parts/${id}`)
      .then((res) => {
        if (!isMounted) return;
        setData(res.data as SpeakingPartDetail);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { data, isLoading, isError };
}

export function useSpeakingSession(id: string) {
  const [data, setData] = useState<SpeakingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await api.get(`/ielts/advanced/speaking/sessions/${id}`);
      setData(res.data as SpeakingSession);
      setIsError(false);
      return res.data as SpeakingSession;
    } catch (e) {
      setIsError(true);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    let interval: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      if (!isMounted) return;
      try {
        const session = await fetchSession();
        if (session.status === "GRADING") {
          interval = setInterval(fetchSession, 3000);
        }
      } catch {
        // handled in fetchSession
      }
    };

    load();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [id, fetchSession]);

  return { data, isLoading, isError, refetch: fetchSession };
}

export function useSpeakingSessionsByPart(partId: string) {
  const [data, setData] = useState<SpeakingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!partId) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    api
      .get(`/ielts/advanced/speaking/parts/${partId}/sessions`)
      .then((res) => {
        if (!isMounted) return;
        setData(res.data as SpeakingSession[]);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [partId]);

  return { data, isLoading, isError };
}

export function useStartSpeakingSession() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (partId: string) => {
    setIsPending(true);
    try {
      const res = await api.post("/ielts/advanced/speaking/sessions", { partId });
      return res.data as SpeakingSession;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useSubmitSpeaking() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({
    sessionId,
    audioAnswers,
    timeTaken,
  }: {
    sessionId: string;
    audioAnswers: Record<string, string>;
    timeTaken: number;
  }) => {
    setIsPending(true);
    try {
      const res = await api.post(`/ielts/advanced/speaking/sessions/${sessionId}/submit`, {
        audioAnswers,
        timeTaken,
      });
      return res.data;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}
