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

// ─── IELTS Intensive Admin ───
export const adminIeltsIntensiveApi = {
  getAll: (type?: string) =>
    api.get<any[]>('/admin/ielts/intensive', { params: { type } }).then(r => r.data),
  getById: (id: string) =>
    api.get<any>(`/admin/ielts/intensive/${id}`).then(r => r.data),
  create: (dto: any) =>
    api.post<any>('/admin/ielts/intensive', dto).then(r => r.data),
  update: (id: string, dto: any) =>
    api.patch<any>(`/admin/ielts/intensive/${id}`, dto).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/admin/ielts/intensive/${id}`).then(r => r.data),
  publish: (id: string) =>
    api.patch<any>(`/admin/ielts/intensive/${id}/publish`).then(r => r.data),
};

// ─── IELTS Advanced Admin ───
export const adminIeltsAdvancedApi = {
  // Listening Parts
  getListening: () => api.get<any[]>('/admin/ielts/advanced/listening').then(r => r.data),
  getListeningById: (id: string) => api.get<any>(`/admin/ielts/advanced/listening/${id}`).then(r => r.data),
  createListening: (dto: any) => api.post<any>('/admin/ielts/advanced/listening', dto).then(r => r.data),
  updateListening: (id: string, dto: any) => api.patch<any>(`/admin/ielts/advanced/listening/${id}`, dto).then(r => r.data),
  deleteListening: (id: string) => api.delete(`/admin/ielts/advanced/listening/${id}`).then(r => r.data),
  publishListening: (id: string) => api.patch<any>(`/admin/ielts/advanced/listening/${id}/publish`).then(r => r.data),

  // Reading Parts
  getReading: () => api.get<any[]>('/admin/ielts/advanced/reading').then(r => r.data),
  getReadingById: (id: string) => api.get<any>(`/admin/ielts/advanced/reading/${id}`).then(r => r.data),
  createReading: (dto: any) => api.post<any>('/admin/ielts/advanced/reading', dto).then(r => r.data),
  updateReading: (id: string, dto: any) => api.patch<any>(`/admin/ielts/advanced/reading/${id}`, dto).then(r => r.data),
  deleteReading: (id: string) => api.delete(`/admin/ielts/advanced/reading/${id}`).then(r => r.data),
  publishReading: (id: string) => api.patch<any>(`/admin/ielts/advanced/reading/${id}/publish`).then(r => r.data),

  // Writing Prompts
  getWriting: () => api.get<any[]>('/admin/ielts/advanced/writing').then(r => r.data),
  getWritingById: (id: string) => api.get<any>(`/admin/ielts/advanced/writing/${id}`).then(r => r.data),
  createWriting: (dto: any) => api.post<any>('/admin/ielts/advanced/writing', dto).then(r => r.data),
  updateWriting: (id: string, dto: any) => api.patch<any>(`/admin/ielts/advanced/writing/${id}`, dto).then(r => r.data),
  deleteWriting: (id: string) => api.delete(`/admin/ielts/advanced/writing/${id}`).then(r => r.data),
  publishWriting: (id: string) => api.patch<any>(`/admin/ielts/advanced/writing/${id}/publish`).then(r => r.data),

  // Speaking Parts
  getSpeaking: () => api.get<any[]>('/admin/ielts/advanced/speaking').then(r => r.data),
  getSpeakingById: (id: string) => api.get<any>(`/admin/ielts/advanced/speaking/${id}`).then(r => r.data),
  createSpeaking: (dto: any) => api.post<any>('/admin/ielts/advanced/speaking', dto).then(r => r.data),
  updateSpeaking: (id: string, dto: any) => api.patch<any>(`/admin/ielts/advanced/speaking/${id}`, dto).then(r => r.data),
  deleteSpeaking: (id: string) => api.delete(`/admin/ielts/advanced/speaking/${id}`).then(r => r.data),
  publishSpeaking: (id: string) => api.patch<any>(`/admin/ielts/advanced/speaking/${id}/publish`).then(r => r.data),
};

// ─── IELTS Import Admin ───
export const ieltsImportApi = {
  createJob: (dto: {
    targetSystem: string;
    skill: string;
    sourceType: string;
    sourceRef: string;
    provenance: Record<string, any>;
    mediaAssets?: any[];
  }) => api.post<any>('/admin/ielts/import', dto).then(r => r.data),

  getAllJobs: () => api.get<any[]>('/admin/ielts/import').then(r => r.data),
  getJobById: (id: string) => api.get<any>(`/admin/ielts/import/${id}`).then(r => r.data),
  saveDraft: (id: string, dto: { structuredJson: any; provenance?: any; mediaAssets?: any[]; version: number }) =>
    api.patch<any>(`/admin/ielts/import/${id}/draft`, dto).then(r => r.data),
  commitJob: (id: string, dto?: { overwrite?: boolean; isPublished?: boolean }) =>
    api.post<string>(`/admin/ielts/import/${id}/commit`, dto).then(r => r.data),
  discardJob: (id: string) => api.delete(`/admin/ielts/import/${id}`).then(r => r.data),
  retryJob: (id: string) => api.post<any>(`/admin/ielts/import/${id}/retry`).then(r => r.data),
  discardSkill: (id: string) => api.delete(`/admin/ielts/import/${id}/discard-skill`).then(r => r.data),
  abandonGroup: (groupId: string) => api.delete(`/admin/ielts/import/group/${groupId}/abandon`).then(r => r.data),
  commitGroup: (groupId: string, dto?: { isPublished?: boolean }) =>
    api.post<any>(`/admin/ielts/import/group/${groupId}/commit`, dto).then(r => r.data),
};

