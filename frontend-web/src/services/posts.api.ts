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
