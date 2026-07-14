import api from '@/lib/api';

export interface ShadowingSentence {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  words?: string[];
  audioStart: number;
  audioEnd: number;
}

export interface ShadowingVideo {
  id: string;
  userId: string | null;
  title: string;
  youtubeVideoId: string | null;
  audioUrl?: string;
  imageUrl?: string;
  tags?: string[];
  folder: string;
  category: string;
  duration: string;
  sentences: ShadowingSentence[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShadowingProgressData {
  completedSentences: number[];
}

export const shadowingApi = {
  // Lessons
  getLessons: () => api.get<ShadowingVideo[]>('/shadowing/lessons').then(r => r.data),
  getLessonById: (id: string) => api.get<ShadowingVideo>(`/shadowing/lessons/${id}`).then(r => r.data),

  // Videos (user-uploaded)
  getVideos: () => api.get<ShadowingVideo[]>('/shadowing/videos').then(r => r.data),
  getVideoById: (id: string) => api.get<ShadowingVideo>(`/shadowing/videos/${id}`).then(r => r.data),
  createVideo: (dto: { title: string; youtubeVideoId: string; folder?: string; category?: string; duration: string; sentences: any[] }) =>
    api.post<ShadowingVideo>('/shadowing/videos', dto).then(r => r.data),
  updateVideo: (id: string, dto: Partial<ShadowingVideo>) =>
    api.patch<ShadowingVideo>(`/shadowing/videos/${id}`, dto).then(r => r.data),
  deleteVideo: (id: string) => api.delete(`/shadowing/videos/${id}`).then(r => r.data),
  importVideo: (data: { youtubeUrl: string; title: string; folder?: string }) =>
    api.post<ShadowingVideo>('/shadowing/videos/import', data).then(r => r.data),

  // Folders
  getFolders: () => api.get<string[]>('/shadowing/folders').then(r => r.data),
  createFolder: (name: string) => api.post('/shadowing/folders', { name }).then(r => r.data),
  renameFolder: (name: string, newName: string) =>
    api.patch(`/shadowing/folders/${encodeURIComponent(name)}`, { newName }).then(r => r.data),
  deleteFolder: (name: string) => api.delete(`/shadowing/folders/${encodeURIComponent(name)}`).then(r => r.data),

  // Progress
  getAllProgress: () =>
    api.get<Record<string, number[]>>('/shadowing/progress').then(r => r.data),
  getProgress: (lessonId: string) =>
    api.get<ShadowingProgressData>(`/shadowing/progress/${encodeURIComponent(lessonId)}`).then(r => r.data),
  upsertProgress: (dto: { lessonId: string; completedSentences: number[] }) =>
    api.post('/shadowing/progress', dto).then(r => r.data),
};
