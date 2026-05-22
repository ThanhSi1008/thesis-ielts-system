/**
 * Posts API - Community feature API calls
 * Mirrors the web posts.api.ts but uses the mobile apiClient
 */

import apiClient from './api-client';
import type {
  Post,
  PostListResponse,
  PostListParams,
  Comment,
  PostType,
  LeaderboardEntry,
} from '@/types';

export const postsApi = {
  // ==================== POST CRUD ====================

  createPost: async (payload: {
    type?: PostType;
    title?: string;
    body: string;
    imageUrls?: string[];
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<Post> => {
    return apiClient.post<Post>('/posts', payload);
  },

  listPosts: async (params?: PostListParams): Promise<PostListResponse> => {
    const query = new URLSearchParams();
    if (params?.cursor) query.append('cursor', params.cursor);
    if (params?.type) query.append('type', params.type);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.authorId) query.append('authorId', params.authorId);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.bookmarkedOnly) query.append('bookmarkedOnly', 'true');
    const qs = query.toString();
    return apiClient.get<PostListResponse>(`/posts${qs ? `?${qs}` : ''}`);
  },

  getBookmarks: async (params?: Omit<PostListParams, 'bookmarkedOnly'>): Promise<PostListResponse> => {
    return postsApi.listPosts({ ...params, bookmarkedOnly: true });
  },

  getPost: async (id: string): Promise<Post & { comments: Comment[] }> => {
    return apiClient.get<Post & { comments: Comment[] }>(`/posts/${id}`);
  },

  deletePost: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/posts/${id}`);
  },

  // ==================== INTERACTIONS ====================

  toggleLike: async (id: string): Promise<{ liked: boolean }> => {
    return apiClient.post<{ liked: boolean }>(`/posts/${id}/like`, {});
  },

  toggleBookmark: async (id: string): Promise<{ bookmarked: boolean }> => {
    return apiClient.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`, {});
  },

  // ==================== COMMENTS ====================

  createComment: async (
    postId: string,
    payload: { body: string; parentId?: string },
  ): Promise<Comment> => {
    return apiClient.post<Comment>(`/posts/${postId}/comments`, payload);
  },

  deleteComment: async (commentId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/posts/comments/${commentId}`);
  },

  // ==================== IMAGE UPLOAD ====================

  uploadImage: async (formData: FormData): Promise<{ url: string }> => {
    return apiClient.postForm<{ url: string }>('/posts/images/upload', formData);
  },
};

// ==================== GAMIFICATION / LEADERBOARD ====================

export const gamificationApi = {
  getLeaderboard: async (
    type: 'xp_weekly' | 'streak' = 'xp_weekly',
    limit = 10,
  ): Promise<LeaderboardEntry[]> => {
    return apiClient.get<LeaderboardEntry[]>(
      `/gamification/leaderboard?type=${type}&limit=${limit}`,
    );
  },
};
