# Phase 3: Frontend API Client Separation

## Current State

One unified API client at `frontend-web/src/services/shadowing.api.ts` (132 lines):
- Exports `shadowingApi` object with ALL methods for system lessons, user videos, folders, and progress
- All endpoints prefixed with `/shadowing/...`
- `ShadowingProgress` type bundles both `shadowing` and `dictation` data

## Target State

Two independent API clients:
- `frontend-web/src/services/shadowing.api.ts` → talks to `/shadowing/...` endpoints only
- `frontend-web/src/services/dictation.api.ts` → talks to `/dictation/...` endpoints only

---

## Step 3.1: Rewrite `shadowing.api.ts`

```ts
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
  updateVideo: (id: string, dto: { title?: string; folder?: string; category?: string }) =>
    api.patch<ShadowingVideo>(`/shadowing/videos/${id}`, dto).then(r => r.data),
  deleteVideo: (id: string) => api.delete(`/shadowing/videos/${id}`).then(r => r.data),

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
```

**Key changes**:
- `getAllProgress` returns `Record<string, number[]>` (flat, no nesting)
- `upsertProgress` has NO `type` field, NO `dictationDifficulty`
- `getProgress` returns `{ completedSentences: number[] }` (flat)

---

## Step 3.2: Create `dictation.api.ts`

```ts
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
```

**Key differences from `shadowingApi`**:
- `DictationSentence` has NO `vietnamese` or `phonetic` fields
- `upsertProgress` includes `difficulty`, `lessonTitle`, `totalSentences`
- `getAllProgress` returns `Record<string, DictationProgressData>` (includes difficulty per lesson)
