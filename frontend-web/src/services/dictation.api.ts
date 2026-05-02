import api from '@/lib/api';

export interface DictationSentence {
  id: string;
  english: string;
  words?: string[];
  audioStart: number;
  audioEnd: number;
}

export interface DictationVideo {
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
  sentences: DictationSentence[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DictationProgressData {
  completedSentences: number[];
  difficulty: string;
}

export const dictationApi = {
  // Lessons
  getLessons: () => api.get<DictationVideo[]>('/dictation/lessons').then(r => r.data),
  getLessonById: (id: string) => api.get<DictationVideo>(`/dictation/lessons/${id}`).then(r => r.data),

  // Videos (user-uploaded)
  getVideos: () => api.get<DictationVideo[]>('/dictation/videos').then(r => r.data),
  getVideoById: (id: string) => api.get<DictationVideo>(`/dictation/videos/${id}`).then(r => r.data),
  createVideo: (dto: { title: string; youtubeVideoId: string; folder?: string; category?: string; duration: string; sentences: any[] }) =>
    api.post<DictationVideo>('/dictation/videos', dto).then(r => r.data),
  importVideo: (dto: { title: string; youtubeUrl: string; folder?: string }) =>
    api.post<DictationVideo>('/dictation/videos/import', dto).then(r => r.data),
  updateVideo: (id: string, dto: { title?: string; folder?: string; category?: string }) =>
    api.patch<DictationVideo>(`/dictation/videos/${id}`, dto).then(r => r.data),
  deleteVideo: (id: string) => api.delete(`/dictation/videos/${id}`).then(r => r.data),

  // Folders
  getFolders: () => api.get<string[]>('/dictation/folders').then(r => r.data),
  createFolder: (name: string) => api.post('/dictation/folders', { name }).then(r => r.data),
  renameFolder: (name: string, newName: string) =>
    api.patch(`/dictation/folders/${encodeURIComponent(name)}`, { newName }).then(r => r.data),
  deleteFolder: (name: string) => api.delete(`/dictation/folders/${encodeURIComponent(name)}`).then(r => r.data),

  // Progress
  getAllProgress: () =>
    api.get<Record<string, DictationProgressData>>('/dictation/progress').then(r => r.data),
  getProgress: (lessonId: string) =>
    api.get<DictationProgressData>(`/dictation/progress/${encodeURIComponent(lessonId)}`).then(r => r.data),
  upsertProgress: (dto: {
    lessonId: string;
    completedSentences: number[];
    difficulty?: string;
    lessonTitle?: string;
    totalSentences?: number;
  }) => api.post('/dictation/progress', dto).then(r => r.data),
};
