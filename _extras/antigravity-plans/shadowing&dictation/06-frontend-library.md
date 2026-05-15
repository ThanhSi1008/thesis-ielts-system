# Phase 6 — Frontend: Library & My Videos Refactoring

> **Risk**: LOW — Mostly UI decomposition, no complex logic.  
> **Estimated Effort**: Small–Medium  
> **Dependencies**: Phase 3 (hooks for progress fetching)

---

## 6.1 Current State

### Library Page (`page.tsx`) — 319 lines

Acceptable size but has inline card rendering (~100 lines per card) that should be extracted.

### My Videos Page (`my-videos/page.tsx`) — 868 lines

**Major SRP violation**: Contains folder CRUD, video CRUD, two modals (Create + Edit), search, progress display, folder sidebar — all in one component with 60+ state variables.

---

## 6.2 Library Page Refactoring

### Target Structure

```
frontend-web/src/app/shadowing-dictation/
├── page.tsx                    # ~100 lines (composition)
└── _components/
    └── LessonCard.tsx          # ~80 lines (extracted from inline JSX)
```

### `LessonCard.tsx`

```typescript
interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    youtubeVideoId: string | null;
    duration: string;
    sentences: any[];
  };
  shadowingProgress: number;  // 0-100 percentage
  dictationProgress: number;  // 0-100 percentage
}
```

**Extracts**: Lines 204-296 of the current `page.tsx` — the video card with thumbnail, title, avatar, views, and action buttons.

**ISP applied**: The card receives pre-calculated progress percentages, not the raw `progress` record. The parent page handles the calculation.

### Refactored `page.tsx`

```typescript
// ~100 lines

export default function ShadowingDictationPage() {
  // State: searchQuery, activeCategory, systemLessons, progress, isLoading, bannerCollapsed
  // Effects: loadData, toggleBanner

  const filteredLessons = useMemo(() => { /* filter logic */ }, [...]);

  return (
    <div className="...">
      {/* Sticky search bar */}
      {/* Banner */}
      <div className="grid grid-cols-3 gap-6">
        {filteredLessons.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            shadowingProgress={progress[lesson.id]?.shadowing || 0}
            dictationProgress={progress[lesson.id]?.dictation || 0}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 6.3 My Videos Page Refactoring

### Target Structure

```
frontend-web/src/app/shadowing-dictation/my-videos/
├── page.tsx                    # ~100 lines (composition + state orchestration)
├── _hooks/
│   └── useMyVideos.ts          # ~80 lines (all CRUD logic)
└── _components/
    ├── CreateVideoModal.tsx     # ~120 lines
    ├── EditVideoModal.tsx       # ~80 lines
    ├── FolderSidebar.tsx        # ~100 lines
    └── VideoCard.tsx            # ~80 lines
```

### 6.3.1 `useMyVideos.ts` Hook

Extracts ALL the data-fetching and mutation logic from the page:

```typescript
interface UseMyVideosReturn {
  // Data
  videos: ShadowingVideo[];
  folders: string[];
  progress: Record<string, { shadowing: number[]; dictation: number[] }>;
  isLoading: boolean;

  // Folder CRUD
  addFolder: (name: string) => Promise<void>;
  renameFolder: (oldName: string, newName: string) => Promise<void>;
  deleteFolder: (name: string) => Promise<void>;

  // Video CRUD
  createVideo: (dto: CreateVideoDto) => Promise<void>;
  updateVideo: (id: string, dto: UpdateVideoDto) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  moveToFolder: (id: string, folder: string) => Promise<void>;
}

export function useMyVideos(): UseMyVideosReturn {
  // Extracts lines 66-270 from my-videos/page.tsx
  // All API calls, state management, optimistic updates
}
```

### 6.3.2 `CreateVideoModal.tsx`

```typescript
interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    ytLink: string;
    title: string;
    srtContent: string;
    folder: string;
    category: string;
  }) => Promise<void>;
  folders: string[];
}
```

**Lines**: ~120

Extracts lines 607-744 from `my-videos/page.tsx`. Contains:
- YouTube link input
- Video title input
- SRT file upload
- Folder/Category dropdowns
- Create button with loading state
- Error display

**Key**: All state (ytLink, srtContent, etc.) is **local** to this modal. The parent only receives the final `onSubmit` callback.

### 6.3.3 `EditVideoModal.tsx`

```typescript
interface EditVideoModalProps {
  isOpen: boolean;
  video: ShadowingVideo | null;
  onClose: () => void;
  onSubmit: (id: string, data: { title: string; folder: string; category: string }) => Promise<void>;
  folders: string[];
}
```

**Lines**: ~80

Extracts lines 746-868 from `my-videos/page.tsx`.

### 6.3.4 `FolderSidebar.tsx`

```typescript
interface FolderSidebarProps {
  folders: string[];
  activeFolder: string;
  folderCounts: Record<string, number>;
  onSelectFolder: (name: string) => void;
  onAddFolder: (name: string) => Promise<void>;
  onRenameFolder: (oldName: string, newName: string) => Promise<void>;
  onDeleteFolder: (name: string) => void;
}
```

**Lines**: ~100

Extracts lines 317-435 from `my-videos/page.tsx`. Contains:
- "Upload Videos" button
- Folder list with edit/delete inline controls
- "Add folder" input toggle

### 6.3.5 `VideoCard.tsx`

```typescript
interface VideoCardProps {
  video: ShadowingVideo;
  shadowingProgress: number[];
  dictationProgress: number[];
  folders: string[];
  onEdit: () => void;
  onDelete: () => void;
  onMoveToFolder: (folder: string) => void;
}
```

**Lines**: ~80

Extracts lines 462-588 from `my-videos/page.tsx`. Contains:
- Thumbnail
- Title + three-dot menu
- Progress bars (shadowing + dictation)
- Shadow/Dictate action buttons

### 6.3.6 Refactored `my-videos/page.tsx`

```typescript
// ~100 lines

export default function MyVideosPage() {
  const { videos, folders, progress, isLoading, ...crud } = useMyVideos();
  const [activeFolder, setActiveFolder] = useState('All Videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ShadowingVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  const filteredVideos = useMemo(() => { /* filter logic */ }, [...]);

  return (
    <div className="...">
      {/* Banner */}
      <div className="flex gap-8">
        <FolderSidebar
          folders={folders}
          activeFolder={activeFolder}
          onSelectFolder={setActiveFolder}
          onAddFolder={crud.addFolder}
          onRenameFolder={crud.renameFolder}
          onDeleteFolder={crud.deleteFolder}
          {...folderCounts}
        />
        <div className="flex-1">
          {/* Search bar */}
          <div className="grid grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={() => setEditingVideo(video)}
                onDelete={() => setVideoToDelete(video.id)}
                onMoveToFolder={(f) => crud.moveToFolder(video.id, f)}
                {...progressForVideo}
              />
            ))}
          </div>
        </div>
      </div>

      <CreateVideoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={crud.createVideo}
        folders={folders}
      />
      <EditVideoModal ... />
      <ConfirmModal ... />  {/* Delete confirmation */}
    </div>
  );
}
```

---

## 6.4 Implementation Order

1. Create `_components/LessonCard.tsx` and simplify `page.tsx`
2. Create `my-videos/_hooks/useMyVideos.ts`
3. Create `my-videos/_components/FolderSidebar.tsx`
4. Create `my-videos/_components/VideoCard.tsx`
5. Create `my-videos/_components/CreateVideoModal.tsx`
6. Create `my-videos/_components/EditVideoModal.tsx`
7. **Rewrite `my-videos/page.tsx`** to compose the above
8. Verify all CRUD operations work correctly

---

## Acceptance Criteria

- [ ] Library `page.tsx` reduced to ~100 lines
- [ ] `LessonCard.tsx` created (~80 lines)
- [ ] My Videos `page.tsx` reduced to ~100 lines
- [ ] `useMyVideos` hook created (~80 lines)
- [ ] 4 modal/sidebar components created
- [ ] All CRUD operations preserved:
  - [ ] Create video from YouTube + SRT
  - [ ] Edit video (title, folder, category)
  - [ ] Delete video with confirmation
  - [ ] Create/Rename/Delete folders
  - [ ] Move video between folders
  - [ ] Search and filter by folder
- [ ] Progress bars display correctly
- [ ] Banner collapse/expand works
