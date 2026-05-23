import { useState, useEffect, useCallback, useRef } from 'react';
import { dictationApi } from '@/services/features.api';
import { DictationVideo } from '@/types';
import { toast } from '@/components/ui/index';

const POLL_INTERVAL_MS = 5000;

export function useDictationLessons() {
  const [mode] = useState<'shadowing' | 'dictation'>('dictation');
  const [status, setStatus] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);

  const [systemLessons, setSystemLessons] = useState<DictationVideo[]>([]);
  const [userVideos, setUserVideos] = useState<DictationVideo[]>([]);
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
    (videos: DictationVideo[], lessons: DictationVideo[], rawProgress: any) => {
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
        const compCount = p?.completedSentences?.length || 0;
        computed[lesson.id] = {
          shadowing: 0, // dictation progress doesn't map to shadowing
          dictation: Math.round((compCount / total) * 100),
        };
      });
      setProgress(computed);
    },
    [],
  );

  // Background silent polling fetch
  const fetchSilent = useCallback(async () => {
    try {
      const [videos, lessons, rawProgress] = await Promise.all([
        dictationApi.getVideos(),
        dictationApi.getLessons(),
        dictationApi.getAllProgress(),
      ]);

      applyVideosAndLessons(videos, lessons, rawProgress);

      const hasProcessing = videos.some((v: any) => v.status === 'PROCESSING');
      if (!hasProcessing) {
        stopPolling();
      }
    } catch {
      // Silently catch polling errors to avoid interrupting the user experience
    }
  }, [applyVideosAndLessons, stopPolling]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) return;
    pollIntervalRef.current = setInterval(fetchSilent, POLL_INTERVAL_MS);
  }, [fetchSilent]);

  // Full fetch with loading states
  const fetchData = useCallback(async () => {
    try {
      const [videos, lessons, rawProgress] = await Promise.all([
        dictationApi.getVideos(),
        dictationApi.getLessons(),
        dictationApi.getAllProgress(),
      ]);

      applyVideosAndLessons(videos, lessons, rawProgress);

      const hasProcessing = videos.some((v: any) => v.status === 'PROCESSING');
      if (hasProcessing) {
        startPolling();
      } else {
        stopPolling();
      }
    } catch (e) {
      console.error('Failed to fetch dictation data:', e);
      toast.error('Error', 'Failed to load dictation lessons. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applyVideosAndLessons, startPolling, stopPolling]);

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
      await dictationApi.deleteVideo(id);
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
  };
}
