# Phase 2 — Frontend UI

> **Goal:** Build the complete community feed UI with post creation, interactions, and comments.
>
> **Dependencies:** Phase 1 (backend must be running)
>
> **Estimated effort:** ~5-6 hours

---

## Overview

Create a new `/community` route with a feed page, post cards, create post modal, and comment section. Uses cursor-based infinite scroll and optimistic UI for likes/bookmarks.

---

## Step 1: TypeScript Types

**File:** `frontend-web/src/types/index.ts`

Add at the end of the file (after the `SharedDeck` interface, ~line 577):

```typescript
// ==================== COMMUNITY POSTS ====================

export type PostType = 'STUDY_TIP' | 'SCORE_ACHIEVEMENT' | 'GENERAL';

export interface PostAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  title: string | null;
  body: string;
  imageUrls: string[];
  tags: string[];
  metadata: Record<string, any> | null;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isPinned: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  replies?: Comment[];
}

export interface PostListResponse {
  items: Post[];
  nextCursor: string | null;
}

export interface PostListParams {
  cursor?: string;
  limit?: number;
  type?: PostType;
  tag?: string;
  authorId?: string;
}
```

---

## Step 2: API Client

**File:** `frontend-web/src/services/posts.api.ts` (create new file)

```typescript
import api from '@/lib/api';
import type { Post, PostListResponse, PostListParams, Comment } from '@/types';

export const postsApi = {
  // ==================== POST CRUD ====================
  createPost: async (payload: {
    type?: string;
    title?: string;
    body: string;
    imageUrls?: string[];
    tags?: string[];
    metadata?: Record<string, any>;
  }) => {
    const { data } = await api.post<Post>('/posts', payload);
    return data;
  },

  listPosts: async (params?: PostListParams) => {
    const { data } = await api.get<PostListResponse>('/posts', { params });
    return data;
  },

  getPost: async (id: string) => {
    const { data } = await api.get<Post & { comments: Comment[] }>(`/posts/${id}`);
    return data;
  },

  deletePost: async (id: string) => {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  },

  // ==================== INTERACTIONS ====================
  toggleLike: async (id: string) => {
    const { data } = await api.post<{ liked: boolean }>(`/posts/${id}/like`);
    return data;
  },

  toggleBookmark: async (id: string) => {
    const { data } = await api.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`);
    return data;
  },

  // ==================== COMMENTS ====================
  createComment: async (postId: string, payload: { body: string; parentId?: string }) => {
    const { data } = await api.post<Comment>(`/posts/${postId}/comments`, payload);
    return data;
  },

  deleteComment: async (commentId: string) => {
    const { data } = await api.delete(`/posts/comments/${commentId}`);
    return data;
  },

  // ==================== IMAGE UPLOAD ====================
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const { data } = await api.post<{ url: string }>('/posts/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

---

## Step 3: PostCard Component

**File:** `frontend-web/src/app/community/components/PostCard.tsx` (create new file)

This component renders a single post in the feed. Key requirements:

```typescript
// Props (ISP: only pass what's needed)
interface PostCardProps {
  post: Post;                           // Full post data
  currentUserId: string | undefined;    // For showing delete button
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onDelete: (postId: string) => void;
  onOpenComments: (postId: string) => void;
}
```

**Layout structure:**
```
┌──────────────────────────────────────┐
│ [Avatar] Author Name · 2 hours ago   │
│ [PostType Badge]                      │
│                                       │
│ Post Title (if exists)                │
│ Post body text...                     │
│                                       │
│ [Image grid if imageUrls.length > 0] │
│                                       │
│ [Tag pills]                           │
│                                       │
│ ❤️ 12  💬 3  🔖  [···] (delete menu)  │
└──────────────────────────────────────┘
```

**Styling requirements (match existing design system):**
- Card: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5`
- Author avatar: 40x40 rounded-full, fallback to initials circle with `bg-primary`
- Post type badge: small pill next to author name
  - `STUDY_TIP` → `bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400` with `💡`
  - `SCORE_ACHIEVEMENT` → `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400` with `🏅`
  - `GENERAL` → `bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`
- Title: `text-lg font-bold text-gray-900 dark:text-gray-100`
- Body: `text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap`
- Tag pills: `bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs`
- Like button: heart icon, toggles fill + `text-red-500` when liked
- Bookmark button: bookmark icon, toggles fill + `text-primary` when bookmarked
- Interaction buttons: `hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors`
- Time display: use `timeAgo()` helper (e.g., "2 hours ago", "3 days ago")
- Delete: only show three-dot menu if `post.authorId === currentUserId`

**Image grid rules:**
- 1 image: full width, `rounded-xl max-h-[400px] object-cover`
- 2 images: side by side `grid-cols-2 gap-2`
- 3+ images: `grid-cols-2 gap-2`, last cell shows `+N more` overlay if > 4

**Icons:** Use `lucide-react` — `Heart`, `MessageCircle`, `Bookmark`, `MoreHorizontal`, `Trash2`

---

## Step 4: CreatePostModal Component

**File:** `frontend-web/src/app/community/components/CreatePostModal.tsx` (create new file)

Props:
```typescript
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}
```

**Layout:**
```
┌──────────── Modal ─────────────┐
│  Create Post              [X]  │
│ ────────────────────────────── │
│  Type: [GENERAL ▾]            │
│                                │
│  Title (optional)              │
│  [________________________]    │
│                                │
│  What's on your mind?          │
│  [________________________]    │
│  [________________________]    │
│  [________________________]    │
│                                │
│  Tags: [Listening] [Reading].. │
│                                │
│  📎 Upload images (max 4)     │
│  [img1] [img2] [x remove]     │
│                                │
│  [Cancel]  [Post ✨]           │
└────────────────────────────────┘
```

**Key behavior:**
- Modal overlay: `fixed inset-0 bg-black/50 z-50` + centered card
- Post type selector: dropdown or segmented buttons for `GENERAL`, `STUDY_TIP`, `SCORE_ACHIEVEMENT`
- Body textarea: auto-resize, min 3 rows, `MaxLength(10000)`
- Tag selection: clickable pills from `['Listening', 'Reading', 'Writing', 'Speaking', 'Vocabulary', 'Grammar', 'Pronunciation']`
- Image upload: click to select, show previews, max 4 images
  - Call `postsApi.uploadImage(file)` for each file → get Cloudinary URL
  - Show upload spinner per image
  - Store URLs in local state, pass as `imageUrls` when creating post
- Submit: call `postsApi.createPost(...)`, on success call `onPostCreated(newPost)` and close
- Disable submit button while uploading or if body is empty
- Styling: `bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4`

---

## Step 5: CommentSection Component

**File:** `frontend-web/src/app/community/components/CommentSection.tsx` (create new file)

Props:
```typescript
interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId: string | undefined;
  onCommentAdded: () => void;  // Trigger re-fetch of post
}
```

**Layout:**
```
┌──────────────────────────────────────┐
│ 💬 Comments (3)                      │
│ ──────────────────────────────────── │
│ [Avatar] Jane · 1h ago              │
│   Great tip! Thanks for sharing.     │
│   [Reply]                            │
│     ┕ [Avatar] John · 30m ago       │
│       Agreed, very helpful!          │
│ ──────────────────────────────────── │
│ [Avatar] [Type a comment...] [Send]  │
└──────────────────────────────────────┘
```

**Key behavior:**
- Show top-level comments with their replies nested (1 level only)
- Comment input at the bottom: `input` + send button
- Reply: clicking "Reply" sets `parentId` and focuses the input with `@AuthorName` prefix
- Delete own comments: small trash icon, visible on hover
- Call `postsApi.createComment(postId, { body, parentId })` on submit
- Call `postsApi.deleteComment(commentId)` on delete
- Styling matches existing app: `border-t border-gray-200 dark:border-gray-800 pt-4 mt-4`

---

## Step 6: PostFeed Component (Infinite Scroll)

**File:** `frontend-web/src/app/community/components/PostFeed.tsx` (create new file)

This is the main feed container with infinite scroll logic.

Props:
```typescript
interface PostFeedProps {
  filterType?: PostType;
  filterTag?: string;
  filterAuthorId?: string;
}
```

**Key behavior:**
- State: `posts: Post[]`, `nextCursor: string | null`, `loading: boolean`, `loadingMore: boolean`
- Initial fetch: `postsApi.listPosts({ limit: 20, type, tag, authorId })`
- Infinite scroll: use `IntersectionObserver` on a sentinel div at the bottom
  - When visible and `nextCursor !== null`, call `postsApi.listPosts({ cursor: nextCursor, limit: 20 })`
  - Append results to `posts` array, update `nextCursor`
- Optimistic like/bookmark: update local state immediately, then call API
  - On like: toggle `isLiked`, increment/decrement `likeCount` in local state
  - On bookmark: toggle `isBookmarked`, increment/decrement `bookmarkCount`
  - If API fails, revert local state
- When a new post is created (from modal), prepend to `posts` array
- Empty state: centered message with `Inbox` icon — "No posts yet. Be the first to share!"
- Loading state: show `LoadingSpinner` (import from `@/components/LoadingSpinner`)

**IntersectionObserver pattern:**
```typescript
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!sentinelRef.current || !nextCursor) return;
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) loadMore(); },
    { threshold: 0.1 }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [nextCursor]);

// In JSX, at the bottom of the post list:
// <div ref={sentinelRef} className="h-10" />
```

---

## Step 7: Community Page

**File:** `frontend-web/src/app/community/page.tsx` (create new file)

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostFeed } from './components/PostFeed';
import { CreatePostModal } from './components/CreatePostModal';
import { PenSquare, Lightbulb, Trophy, MessageSquare } from 'lucide-react';
import type { PostType } from '@/types';
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Community                                          │
│  Share tips, celebrate achievements, help others.   │
│                                                     │
│  [✏️ Create Post]                                   │
│                                                     │
│  Filter: [All] [💡 Tips] [🏅 Achievements]          │
│                                                     │
│  ┌─── PostCard ───┐                                │
│  │ ...             │                                │
│  └─────────────────┘                                │
│  ┌─── PostCard ───┐                                │
│  │ ...             │                                │
│  └─────────────────┘                                │
│  [Loading more...]                                  │
└─────────────────────────────────────────────────────┘
```

**Key behavior:**
- Page title + subtitle at the top
- "Create Post" button → opens `CreatePostModal`
- Filter chips: `All`, `Study Tips`, `Achievements` — sets `filterType` state
- Renders `<PostFeed filterType={...} />`
- Page styling: `max-w-2xl mx-auto px-4 py-6` (centered feed like Twitter/Reddit)
- Add to `isPlain` and `isHeaderBorderless` checks in Navbar if needed

**Navbar styling:**
- In `Navbar.tsx`, add detection for community page:
  ```typescript
  const isCommunityPage = pathname === '/community' || pathname.startsWith('/community/');
  ```
- Add `isCommunityPage` to `isHeaderBorderless` and `isPlain` if you want the sticky plain header style

---

## Step 8: Add Navigation Link

**File:** `frontend-web/src/components/Navbar.tsx`

### 8.1 — Desktop nav (inside `<nav>` ~line 157-182)

Add after the SHADOWING & DICTATION link:

```tsx
<Link
  href="/community"
  className={navLinkClass(
    pathname === "/community" || pathname.startsWith("/community/")
  )}
>
  COMMUNITY
  <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
</Link>
```

### 8.2 — Mobile menu (~line 484-490)

Add after the SHADOWING & DICTATION mobile link:

```tsx
<Link
  href="/community"
  className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
  onClick={() => setIsMenuOpen(false)}
>
  COMMUNITY
</Link>
```

---

## Step 9: Utility — Time Ago Helper

**File:** `frontend-web/src/utils/timeAgo.ts` (create new file)

```typescript
const INTERVALS: [number, string, string][] = [
  [60, 'second', 'seconds'],
  [3600, 'minute', 'minutes'],
  [86400, 'hour', 'hours'],
  [604800, 'day', 'days'],
  [2592000, 'week', 'weeks'],
  [31536000, 'month', 'months'],
];

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 10) return 'just now';

  for (let i = INTERVALS.length - 1; i >= 0; i--) {
    const [threshold, singular, plural] = INTERVALS[i];
    const prevThreshold = i > 0 ? INTERVALS[i - 1][0] : 1;
    if (seconds >= prevThreshold) {
      const count = Math.floor(seconds / prevThreshold);
      if (i === 0) return `${count} ${count === 1 ? singular : plural} ago`;
      // Check next interval
    }
  }

  // Simpler implementation:
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
```

---

## Step 10: Verify

After implementing all steps:

1. **Navigate to `/community`** — should see empty state "No posts yet"
2. **Create a post** — click "Create Post", fill in body, select type, add tags, submit
   - Post should appear at top of feed instantly
3. **Like a post** — click heart icon, should turn red and count increments
   - Click again — unlikes, count decrements
4. **Bookmark a post** — click bookmark icon, should fill and turn primary color
5. **Add a comment** — open comment section, type text, submit
   - Comment appears, post's comment count increments
6. **Reply to comment** — click Reply, type response
   - Reply appears nested under parent
7. **Delete own post** — click three-dot menu → Delete → post removed
8. **Infinite scroll** — create 25+ posts, scroll down → more posts load automatically
9. **Filter by type** — click "Study Tips" chip → only STUDY_TIP posts shown
10. **Upload image** — in create modal, attach an image → uploads to Cloudinary → shows in post

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/types/index.ts` — add Post, Comment, PostListResponse types |
| **Created** | `frontend-web/src/services/posts.api.ts` — API client |
| **Created** | `frontend-web/src/utils/timeAgo.ts` — time formatting helper |
| **Created** | `frontend-web/src/app/community/page.tsx` — main page |
| **Created** | `frontend-web/src/app/community/components/PostCard.tsx` — single post card |
| **Created** | `frontend-web/src/app/community/components/CreatePostModal.tsx` — create post modal |
| **Created** | `frontend-web/src/app/community/components/CommentSection.tsx` — comments UI |
| **Created** | `frontend-web/src/app/community/components/PostFeed.tsx` — feed with infinite scroll |
| **Modified** | `frontend-web/src/components/Navbar.tsx` — add COMMUNITY nav link (desktop + mobile) |
