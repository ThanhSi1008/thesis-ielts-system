# Phase 5 — Shadowing & Dictation: Folder & Video Management

**Ưu tiên:** 🟡 Trung bình  
**Ước tính:** 2–3 ngày  
**Phụ thuộc:** Không có

---

## Vấn Đề Hiện Tại

Mobile `features.api.ts` (section `shadowingApi` và `dictationApi`) thiếu các phương thức quản lý folder và video mà web đã có:

| Method | Web `shadowing.api.ts` | Web `dictation.api.ts` | Mobile `features.api.ts` |
|---|---|---|---|
| `renameFolder(name, newName)` | ✅ PATCH `/shadowing/folders/:name` | ✅ PATCH `/dictation/folders/:name` | ❌ Thiếu |
| `deleteFolder(name)` | ✅ DELETE `/shadowing/folders/:name` | ✅ DELETE `/dictation/folders/:name` | ❌ Thiếu |
| `updateVideo(id, dto)` | ✅ PATCH `/shadowing/videos/:id` | ✅ PATCH `/dictation/videos/:id` | ❌ Thiếu |

Hệ quả trên UI mobile:
- Người dùng **không thể đổi tên folder** chứa video của mình
- Người dùng **không thể xoá folder** (chỉ xoá được video)
- Người dùng **không thể sửa** title/folder/category của video đã import

So sánh với web: trong `/shadowing-dictation/shadowing/my-videos/` và `/shadowing-dictation/dictation/my-videos/`, có đầy đủ rename/delete folder và edit video.

---

## Mục Tiêu Phase 5

1. Thêm 3 method còn thiếu vào cả `shadowingApi` và `dictationApi` trong `features.api.ts`.
2. Thêm UI quản lý folder (rename, delete) vào `My Videos` screen.
3. Thêm UI chỉnh sửa video (edit title, folder, category) vào `My Videos` screen.

---

## Task Chi Tiết

### Task 5.1 — Thêm API Methods Vào `shadowingApi`

**File:** `frontend-mobile/services/features.api.ts`

Thêm vào `shadowingApi`:

```typescript
// Rename folder (PATCH /shadowing/folders/:name)
renameFolder: (name: string, newName: string) =>
  apiClient.patch<void>(`/shadowing/folders/${encodeURIComponent(name)}`, { newName }),

// Delete folder và tất cả video trong đó
deleteFolder: (name: string) =>
  apiClient.delete<void>(`/shadowing/folders/${encodeURIComponent(name)}`),

// Update video metadata
updateVideo: (id: string, dto: {
  title?: string;
  folder?: string;
  category?: string;
}) => apiClient.patch<ShadowingVideo>(`/shadowing/videos/${id}`, dto),
```

**Subtasks:**
- [ ] Thêm 3 methods trên vào `shadowingApi`
- [ ] Encode folder name trong URL (tránh lỗi với folder có khoảng trắng/tiếng Việt)

---

### Task 5.2 — Thêm API Methods Vào `dictationApi`

**File:** `frontend-mobile/services/features.api.ts`

Thêm vào `dictationApi` (cấu trúc giống shadowing):

```typescript
renameFolder: (name: string, newName: string) =>
  apiClient.patch<void>(`/dictation/folders/${encodeURIComponent(name)}`, { newName }),

deleteFolder: (name: string) =>
  apiClient.delete<void>(`/dictation/folders/${encodeURIComponent(name)}`),

updateVideo: (id: string, dto: {
  title?: string;
  folder?: string;
  category?: string;
}) => apiClient.patch<DictationVideo>(`/dictation/videos/${id}`, dto),
```

**Subtasks:**
- [ ] Thêm 3 methods trên vào `dictationApi`

---

### Task 5.3 — Cập Nhật Hook `useShadowingLessons`

**File:** `frontend-mobile/hooks/useShadowingLessons.ts`

Hook này quản lý state cho `My Videos` screen. Thêm các handlers:

```typescript
// Thêm vào hook return value:
handleRenameFolder: (name: string, newName: string) => Promise<void>;
handleDeleteFolder: (name: string) => Promise<void>;
handleUpdateVideo: (id: string, dto: { title?: string; folder?: string; category?: string }) => Promise<void>;

// State:
folderRenameVisible: boolean;
setFolderRenameVisible: (v: boolean) => void;
editVideoVisible: boolean;
setEditVideoVisible: (v: boolean) => void;
videoToEdit: { id: string; title: string; folder?: string; category?: string } | null;
setVideoToEdit: (v: ...) => void;
```

**Subtasks:**
- [ ] Thêm `handleRenameFolder` (call API → refresh list sau khi success)
- [ ] Thêm `handleDeleteFolder` với confirm dialog (folder xoá sẽ mất toàn bộ video)
- [ ] Thêm `handleUpdateVideo` (call API → update local state)
- [ ] Thêm state vars cần thiết
- [ ] Expose trong hook return object

---

### Task 5.4 — Cập Nhật Hook `useDictationLessons` (Nếu Có)

**File:** `frontend-mobile/hooks/useDictationLessons.ts` (hoặc tích hợp trong `useShadowingLessons`)

Tương tự Task 5.3 cho dictation.

**Subtasks:**
- [ ] Kiểm tra hook hiện tại có `handleDeleteVideo` không (đã có theo code `my-videos`)
- [ ] Thêm `handleRenameFolder`, `handleDeleteFolder`, `handleUpdateVideo` cho dictation

---

### Task 5.5 — Component: `FolderManageSheet`

**File mới:** `frontend-mobile/components/shadowing/FolderManageSheet.tsx`

Bottom sheet hiển thị khi user long-press hoặc tap menu icon trên một folder:

```
FolderManageSheet (Props: folderName, onRename, onDelete, onClose)
├── Handle
├── Title: "Folder: {folderName}"
├── MenuItem: "✏️ Đổi tên folder" → mở RenameInput
├── MenuItem: "🗑 Xoá folder" → mở ConfirmDialog (warning: xoá toàn bộ video)
└── MenuItem: "Đóng"
```

**RenameInput inline:**
```
TextInput pre-filled với folderName hiện tại
[Huỷ] [Lưu]
```

**Subtasks:**
- [ ] Tạo `FolderManageSheet.tsx`
- [ ] Dùng `BottomSheet` organism từ `components/organisms/BottomSheet.tsx`
- [ ] Inline rename input với validation (tên không trống, không trùng với folder khác)
- [ ] `ConfirmDialog` khi delete folder với message cảnh báo rõ

---

### Task 5.6 — Component: `EditVideoSheet`

**File mới:** `frontend-mobile/components/shadowing/EditVideoSheet.tsx`

Bottom sheet cho phép sửa metadata video:

```
EditVideoSheet (Props: video, folders, onSave, onClose)
├── Handle
├── Title: "Chỉnh sửa video"
├── TextInput: Title (pre-filled)
├── FolderPicker (existing component: FolderPicker.tsx)
│   └── Dropdown list các folder hiện có + "Tạo folder mới"
├── CategoryInput: Text input (pre-filled)
├── [Huỷ] [Lưu thay đổi]
└── Loading state khi đang save
```

**Subtasks:**
- [ ] Tạo `EditVideoSheet.tsx`
- [ ] Reuse `FolderPicker` component hiện có (`components/shadowing/FolderPicker.tsx`)
- [ ] Validation: title không trống
- [ ] Optimistic update: cập nhật local state trước, rollback nếu API fail
- [ ] Toast success/error

---

### Task 5.7 — Cập Nhật `My Videos` Screen

**File:** `frontend-mobile/app/practice-tools/my-videos/index.tsx`

Thêm UX trigger cho folder và video management:

**A — Folder Row (hiển thị ở đầu list nếu mode có nhiều folder):**

```
FolderRow (khi có nhiều videos với folder khác nhau)
├── Folder name
├── Video count badge
└── "⋮" menu icon → FolderManageSheet
```

**B — Lesson Card — thêm Edit button:**

```
LessonCard (hiện tại)
├── ... (giữ nguyên)
└── Action Group
    ├── [Edit icon ✏️] → EditVideoSheet  ← THÊM MỚI
    ├── [Delete icon 🗑] (đã có)
    └── [Start/Continue] (đã có)
```

**Subtasks:**
- [ ] Thêm `FolderSection` component để group videos theo folder
- [ ] Thêm menu icon bên cạnh mỗi folder section → mở `FolderManageSheet`
- [ ] Thêm edit button vào mỗi video card (icon bút chì, nhỏ, bên trái delete)
- [ ] Wire edit button → `setVideoToEdit(lesson)` → `setEditVideoVisible(true)`
- [ ] Render `FolderManageSheet` và `EditVideoSheet` ở cuối screen
- [ ] Load folders list `shadowingApi.getFolders()` để dùng trong `EditVideoSheet`

---

### Task 5.8 — Grouping Videos Theo Folder

**Mục tiêu:** Khi có nhiều folder, hiển thị videos theo group folder, mỗi group có header.

**Hiện tại:** `My Videos` hiển thị flat list tất cả user videos.

**Cải thiện:**

```typescript
// Group videos by folder
const videosByFolder = useMemo(() => {
  return tabLessons.reduce((acc, v) => {
    const folder = v.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(v);
    return acc;
  }, {} as Record<string, typeof tabLessons>);
}, [tabLessons]);
```

Hiển thị dạng `SectionList` với folder name làm section header.

**Subtasks:**
- [ ] Chuyển từ `FlatList` sang `SectionList` cho user videos
- [ ] Section header: folder name + video count + menu button
- [ ] Nếu chỉ 1 folder hoặc không có folder → hiển thị flat như hiện tại (no section headers)

---

### Task 5.9 — Cập Nhật `AddVideoModal` (Optional Enhancement)

**File:** `frontend-mobile/components/shadowing/AddVideoModal.tsx`

Khi user thêm video mới, cho phép chọn folder từ danh sách hiện có (thay vì nhập tay):

- Thêm `FolderPicker` dropdown vào form
- Fetch `shadowingApi.getFolders()` khi modal mở

**Subtasks (optional):**
- [ ] Thêm folder picker dropdown vào `AddVideoModal`
- [ ] Prefetch và cache folders

---

## Acceptance Criteria

- [ ] `shadowingApi` và `dictationApi` có đủ 3 method mới: `renameFolder`, `deleteFolder`, `updateVideo`.
- [ ] My Videos screen hiển thị edit button trên mỗi video card.
- [ ] Tap edit → sheet mở với title, folder, category có thể sửa.
- [ ] Sau save → video card cập nhật ngay (optimistic hoặc refetch).
- [ ] Long-press folder section header → FolderManageSheet mở.
- [ ] Rename folder → tên folder thay đổi trên toàn bộ videos trong đó.
- [ ] Delete folder → ConfirmDialog có cảnh báo rõ ràng "sẽ xoá tất cả video trong folder này".
- [ ] Sau delete folder → videos không còn trong list.
- [ ] Dark mode đúng cho tất cả sheets mới.
- [ ] Không có regression với Add Video và Delete Video (đã có).

---

## Files Tạo Mới

```
frontend-mobile/components/shadowing/FolderManageSheet.tsx
frontend-mobile/components/shadowing/EditVideoSheet.tsx
```

## Files Sửa

```
frontend-mobile/services/features.api.ts
  — thêm renameFolder, deleteFolder, updateVideo vào shadowingApi và dictationApi

frontend-mobile/hooks/useShadowingLessons.ts
  — thêm handlers và state cho folder/video management

frontend-mobile/hooks/useDictationLessons.ts (nếu tách hook riêng)
  — tương tự

frontend-mobile/app/practice-tools/my-videos/index.tsx
  — thêm folder grouping, edit button, wire FolderManageSheet + EditVideoSheet
```

---

## Rủi Ro & Lưu Ý

- **Delete folder có video:** Backend cần confirm hành vi — xoá cascade videos hay chỉ xoá folder label? Nếu cascade, cần cảnh báo user rất rõ.
- **Encode folder name:** Folder tên tiếng Việt hoặc có space cần `encodeURIComponent` trong URL.
- **Sync giữa shadowing và dictation:** Một video có thể dùng chung cho cả 2 mode (shadowing và dictation). Khi rename folder trong shadowing mode, folder trong dictation mode có bị ảnh hưởng không? Cần confirm với backend.
- **Optimistic update:** Nếu API fail sau optimistic update → phải rollback state về cũ và hiển thị error toast.
