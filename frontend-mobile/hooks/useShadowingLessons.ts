import { useState, useEffect, useCallback, useRef } from 'react';
import { shadowingApi, dictationApi } from '@/services/features.api';
import { ShadowingVideo, DictationVideo } from '@/types';
import { toast } from '@/components/ui/index';

const POLL_INTERVAL_MS = 5000;

export function useShadowingLessons(initialMode?: 'shadowing' | 'dictation') {
  const [mode, setMode] = useState<'shadowing' | 'dictation'>(initialMode || 'shadowing');

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [status, setStatus] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);

  const [systemLessons, setSystemLessons] = useState<ShadowingVideo[]>([]);
  const [userVideos, setUserVideos] = useState<ShadowingVideo[]>([]);
  const [progress, setProgress] = useState<
    Record<string, { shadowing: number; dictation: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingRef = useRef<Set<string>>(new Set());

  // Stop background polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Process data update and trigger ready toasts
  const applyVideosAndLessons = useCallback(
    (videos: ShadowingVideo[], lessons: ShadowingVideo[], rawProgress: any) => {
      // 1. Detect if any video just finished processing
      videos.forEach((video) => {
        const wasProcessing = processingRef.current.has(video.id);
        const isReady = (video as any).status === 'READY';
        if (wasProcessing && isReady) {
          toast.success(
            'Video Ready! 🎉',
            `"${video.title}" has been transcribed and is ready for practice.`,
          );
          processingRef.current.delete(video.id);
        }
      });

      // 2. Track current processing video IDs
      videos.forEach((video) => {
        if ((video as any).status === 'PROCESSING') {
          processingRef.current.add(video.id);
        } else {
          processingRef.current.delete(video.id);
        }
      });

      setUserVideos(videos);
      setSystemLessons(lessons);

      // 3. Compute progress percentages
      const computed: Record<string, { shadowing: number; dictation: number }> = {};
      [...lessons, ...videos].forEach((lesson) => {
        const p = rawProgress[lesson.id];
        const total = lesson.sentences?.length || 1;
        computed[lesson.id] = {
          shadowing: p?.shadowing ? Math.round((p.shadowing.length / total) * 100) : 0,
          dictation: p?.dictation ? Math.round((p.dictation.length / total) * 100) : 0,
        };
      });
      setProgress(computed);
    },
    [],
  );

  // Background silent polling fetch
  const fetchSilent = useCallback(async () => {
    const api = mode === 'shadowing' ? shadowingApi : dictationApi;
    try {
      const [videos, lessons, rawProgress] = await Promise.all([
        api.getVideos(),
        api.getLessons(),
        api.getAllProgress(),
      ]);

      applyVideosAndLessons(videos as any, lessons as any, rawProgress);

      const hasProcessing = (videos as any[]).some((v: any) => v.status === 'PROCESSING');
      if (!hasProcessing) {
        stopPolling();
      }
    } catch (e) {
      // Silently catch polling errors to avoid interrupting the user experience
    }
  }, [mode, applyVideosAndLessons, stopPolling]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) return;
    pollIntervalRef.current = setInterval(fetchSilent, POLL_INTERVAL_MS);
  }, [fetchSilent]);

  // Full fetch with loading states
  const fetchData = useCallback(async () => {
    const api = mode === 'shadowing' ? shadowingApi : dictationApi;
    try {
      const [videos, lessons, rawProgress] = await Promise.all([
        api.getVideos(),
        api.getLessons(),
        api.getAllProgress(),
      ]);

      applyVideosAndLessons(videos as any, lessons as any, rawProgress);

      const hasProcessing = (videos as any[]).some((v: any) => v.status === 'PROCESSING');
      if (hasProcessing) {
        startPolling();
      } else {
        stopPolling();
      }
    } catch (e) {
      console.error(`Failed to fetch ${mode} data:`, e);
      toast.error('Error', 'Failed to load lessons. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, applyVideosAndLessons, startPolling, stopPolling]);

  useEffect(() => {
    fetchData();
    return () => stopPolling();
  }, [fetchData, stopPolling]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Delete video handler
  const handleDeleteVideo = useCallback((id: string, title: string) => {
    setVideoToDelete({ id, title });
    setDeleteConfirmVisible(true);
  }, []);

  const executeDeleteVideo = useCallback(async () => {
    if (!videoToDelete) return;
    const { id, title } = videoToDelete;
    try {
      await shadowingApi.deleteVideo(id);
      toast.success('Deleted', `"${title}" has been deleted.`);
      setUserVideos((prev) => prev.filter((v) => v.id !== id));
      processingRef.current.delete(id);
    } catch (e) {
      console.error('Failed to delete video:', e);
      toast.error('Error', 'Failed to delete video.');
    } finally {
      setDeleteConfirmVisible(false);
      setVideoToDelete(null);
    }
  }, [videoToDelete]);

  // Folder rename handler
  const handleRenameFolder = useCallback(async (name: string, newName: string) => {
    const api = mode === 'shadowing' ? shadowingApi : dictationApi;
    try {
      await api.renameFolder(name, newName);
      toast.success('Thành công', `Đã đổi tên thư mục thành "${newName}".`);
      setUserVideos((prev) =>
        prev.map((v) => (v.folder === name ? { ...v, folder: newName } : v))
      );
    } catch (e) {
      console.error('Failed to rename folder:', e);
      toast.error('Lỗi', 'Không thể đổi tên thư mục.');
      throw e;
    }
  }, [mode]);

  // Folder delete handler
  const handleDeleteFolder = useCallback(async (name: string) => {
    const api = mode === 'shadowing' ? shadowingApi : dictationApi;
    try {
      await api.deleteFolder(name);
      toast.success('Thành công', `Đã xóa thư mục "${name}".`);
      setUserVideos((prev) => prev.filter((v) => v.folder !== name));
    } catch (e) {
      console.error('Failed to delete folder:', e);
      toast.error('Lỗi', 'Không thể xóa thư mục.');
      throw e;
    }
  }, [mode]);

  // Video update handler
  const handleUpdateVideo = useCallback(async (id: string, dto: { title?: string; folder?: string; category?: string }) => {
    const api = mode === 'shadowing' ? shadowingApi : dictationApi;
    try {
      await api.updateVideo(id, dto);
      toast.success('Thành công', 'Đã cập nhật thông tin video.');
      setUserVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...dto } : v))
      );
    } catch (e) {
      console.error('Failed to update video:', e);
      toast.error('Lỗi', 'Không thể cập nhật video.');
      throw e;
    }
  }, [mode]);

  // Filter built-in system lessons
  const filteredSystem = systemLessons.map((l) => ({ ...l, tags: l.tags || ['English'] })).filter((l) => {
    const p = progress[l.id]?.[mode] || 0;
    let matchStatus = true;
    if (status === 'completed') matchStatus = p === 100;
    if (status === 'in-progress') matchStatus = p > 0 && p < 100;
    if (status === 'not-started') matchStatus = p === 0;

    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filter user custom imported videos
  const filteredUser = userVideos.map((v) => ({ ...v, tags: ['YOUTUBE'] })).filter((l) => {
    const p = progress[l.id]?.[mode] || 0;
    let matchStatus = true;
    if (status === 'completed') matchStatus = p === 100;
    if (status === 'in-progress') matchStatus = p > 0 && p < 100;
    if (status === 'not-started') matchStatus = p === 0;

    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return {
    mode,
    setMode,
    status,
    setStatus,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    showAddModal,
    setShowAddModal,
    filteredSystem,
    filteredUser,
    systemLessons,
    userVideos,
    progress,
    loading,
    refreshing,
    handleRefresh,
    handleDeleteVideo,
    refetch: fetchData,
    deleteConfirmVisible,
    setDeleteConfirmVisible,
    videoToDelete,
    executeDeleteVideo,
    handleRenameFolder,
    handleDeleteFolder,
    handleUpdateVideo,
  };
}
