import api from '@/lib/api';

export interface ShadowingSentence {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  words?: any[];
  audioStart: number;
  audioEnd: number;
}

export interface ShadowingVideo {
  id: string;
  userId: string;
  title: string;
  youtubeVideoId: string;
  folder: string;
  category: string;
  duration: string;
  sentences: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ShadowingProgress {
  shadowing: {
    completedSentences: number[];
  };
  dictation: {
    completedSentences: number[];
    difficulty: string;
  };
}

export const shadowingApi = {
  // ── Videos ──────────────────────────────────────────

  getVideos: async () => {
    const { data } = await api.get<ShadowingVideo[]>('/shadowing/videos');
    return data;
  },

  getVideoById: async (id: string) => {
    const { data } = await api.get<ShadowingVideo>(`/shadowing/videos/${id}`);
    return data;
  },

  createVideo: async (dto: { 
    title: string; 
    youtubeVideoId: string; 
    folder?: string; 
    category?: string;
    duration: string;
    sentences: any[];
  }) => {
    const { data } = await api.post<ShadowingVideo>('/shadowing/videos', dto);
    return data;
  },

  updateVideo: async (id: string, dto: { title?: string; folder?: string; category?: string }) => {
    const { data } = await api.patch<ShadowingVideo>(`/shadowing/videos/${id}`, dto);
    return data;
  },

  deleteVideo: async (id: string) => {
    const { data } = await api.delete(`/shadowing/videos/${id}`);
    return data;
  },

  // ── Folders ─────────────────────────────────────────

  getFolders: async () => {
    const { data } = await api.get<string[]>('/shadowing/folders');
    return data;
  },

  createFolder: async (name: string) => {
    const { data } = await api.post('/shadowing/folders', { name });
    return data;
  },

  renameFolder: async (name: string, newName: string) => {
    const { data } = await api.patch(`/shadowing/folders/${encodeURIComponent(name)}`, { newName });
    return data;
  },

  deleteFolder: async (name: string) => {
    const { data } = await api.delete(`/shadowing/folders/${encodeURIComponent(name)}`);
    return data;
  },

  // ── Progress ─────────────────────────────────────────

  getAllProgress: async () => {
    const { data } = await api.get<Record<string, { shadowing: number[]; dictation: number[] }>>('/shadowing/progress');
    return data;
  },

  getProgress: async (lessonId: string) => {
    const { data } = await api.get<ShadowingProgress>(`/shadowing/progress/${encodeURIComponent(lessonId)}`);
    return data;
  },

  upsertProgress: async (dto: {
    lessonId: string;
    type: 'shadowing' | 'dictation';
    completedSentences: number[];
    dictationDifficulty?: string;
    lessonTitle?: string;
    totalSentences?: number;
  }) => {
    const { data } = await api.post('/shadowing/progress', dto);
    return data;
  },
};
