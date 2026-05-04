import api from '@/lib/api';
import type { ShadowingVideo } from './shadowing.api';
import type { DictationVideo } from './dictation.api';

// ─── Shadowing Admin ───
export const adminShadowingApi = {
  getAll: () =>
    api.get<ShadowingVideo[]>('/admin/shadowing/lessons').then(r => r.data),

  getById: (id: string) =>
    api.get<ShadowingVideo>(`/admin/shadowing/lessons/${id}`).then(r => r.data),

  create: (dto: {
    title: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration: string;
    sentences: any[];
  }) =>
    api.post<ShadowingVideo>('/admin/shadowing/lessons', dto).then(r => r.data),

  update: (id: string, dto: {
    title?: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration?: string;
    sentences?: any[];
    status?: string;
  }) =>
    api.patch<ShadowingVideo>(`/admin/shadowing/lessons/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/shadowing/lessons/${id}`).then(r => r.data),

  importYoutube: (dto: { youtubeUrl: string; title: string; category?: string }) =>
    api.post<ShadowingVideo>('/admin/shadowing/lessons/import', dto).then(r => r.data),
};

// ─── Dictation Admin ───
export const adminDictationApi = {
  getAll: () =>
    api.get<DictationVideo[]>('/admin/dictation/lessons').then(r => r.data),

  getById: (id: string) =>
    api.get<DictationVideo>(`/admin/dictation/lessons/${id}`).then(r => r.data),

  create: (dto: {
    title: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration: string;
    sentences: any[];
  }) =>
    api.post<DictationVideo>('/admin/dictation/lessons', dto).then(r => r.data),

  update: (id: string, dto: {
    title?: string;
    youtubeVideoId?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    folder?: string;
    category?: string;
    duration?: string;
    sentences?: any[];
    status?: string;
  }) =>
    api.patch<DictationVideo>(`/admin/dictation/lessons/${id}`, dto).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/dictation/lessons/${id}`).then(r => r.data),

  importYoutube: (dto: { youtubeUrl: string; title: string; category?: string }) =>
    api.post<DictationVideo>('/admin/dictation/lessons/import', dto).then(r => r.data),
};

