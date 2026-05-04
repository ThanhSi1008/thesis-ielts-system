import { useState, useCallback } from "react";
import { adminShadowingApi } from "@/services/admin.api";
import type { ShadowingVideo } from "@/services/shadowing.api";

export interface SentenceFormData {
  id: number;
  english: string;
  vietnamese: string;
  phonetic: string;
  words: string[];
  audioStart: number;
  audioEnd: number;
}

export interface ShadowingFormData {
  title: string;
  youtubeVideoId: string;
  audioUrl: string;
  imageUrl: string;
  tags: string[];
  folder: string;
  category: string;
  duration: string;
  sentences: SentenceFormData[];
}

const DEFAULT_FORM: ShadowingFormData = {
  title: "",
  youtubeVideoId: "",
  audioUrl: "",
  imageUrl: "",
  tags: [],
  folder: "All Videos",
  category: "Other",
  duration: "0:00",
  sentences: [],
};

function makeSentence(id: number): SentenceFormData {
  return { id, english: "", vietnamese: "", phonetic: "", words: [], audioStart: 0, audioEnd: 0 };
}

export function useAdminShadowingForm(initialData?: ShadowingVideo) {
  const [formData, setFormData] = useState<ShadowingFormData>(() => {
    if (!initialData) return DEFAULT_FORM;
    return {
      title: initialData.title,
      youtubeVideoId: initialData.youtubeVideoId ?? "",
      audioUrl: initialData.audioUrl ?? "",
      imageUrl: initialData.imageUrl ?? "",
      tags: initialData.tags ?? [],
      folder: initialData.folder,
      category: initialData.category,
      duration: initialData.duration,
      sentences: (initialData.sentences as any[]).map((s, i) => ({
        id: s.id ?? i + 1,
        english: s.english ?? "",
        vietnamese: s.vietnamese ?? "",
        phonetic: s.phonetic ?? "",
        words: s.words ?? [],
        audioStart: s.audioStart ?? 0,
        audioEnd: s.audioEnd ?? 0,
      })),
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShadowingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof ShadowingFormData>(field: K, value: ShadowingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const addSentence = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sentences: [...prev.sentences, makeSentence(prev.sentences.length + 1)],
    }));
  }, []);

  const removeSentence = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      sentences: prev.sentences.filter((_, i) => i !== index).map((s, i) => ({ ...s, id: i + 1 })),
    }));
  }, []);

  const updateSentence = useCallback((index: number, updates: Partial<SentenceFormData>) => {
    setFormData(prev => ({
      ...prev,
      sentences: prev.sentences.map((s, i) => i === index ? { ...s, ...updates } : s),
    }));
  }, []);

  const moveSentence = useCallback((from: number, to: number) => {
    setFormData(prev => {
      const arr = [...prev.sentences];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...prev, sentences: arr.map((s, i) => ({ ...s, id: i + 1 })) };
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ShadowingFormData, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const buildPayload = useCallback(() => ({
    title: formData.title.trim(),
    youtubeVideoId: formData.youtubeVideoId.trim() || undefined,
    audioUrl: formData.audioUrl.trim() || undefined,
    imageUrl: formData.imageUrl.trim() || undefined,
    tags: formData.tags,
    folder: formData.folder || "All Videos",
    category: formData.category,
    duration: formData.duration.trim(),
    sentences: formData.sentences.map(s => ({
      id: s.id,
      english: s.english,
      vietnamese: s.vietnamese || undefined,
      phonetic: s.phonetic || undefined,
      words: s.words.length > 0 ? s.words : s.english.split(/\s+/).filter(Boolean),
      audioStart: s.audioStart,
      audioEnd: s.audioEnd,
    })),
  }), [formData]);

  const submitCreate = useCallback(async (): Promise<ShadowingVideo | null> => {
    if (!validate()) return null;
    setIsSubmitting(true);
    try {
      return await adminShadowingApi.create(buildPayload());
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, buildPayload]);

  const submitUpdate = useCallback(async (lessonId: string): Promise<ShadowingVideo | null> => {
    if (!validate()) return null;
    setIsSubmitting(true);
    try {
      return await adminShadowingApi.update(lessonId, buildPayload());
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, buildPayload]);

  return {
    formData, errors, isSubmitting,
    setField, addSentence, removeSentence, updateSentence, moveSentence,
    submitCreate, submitUpdate,
  };
}
