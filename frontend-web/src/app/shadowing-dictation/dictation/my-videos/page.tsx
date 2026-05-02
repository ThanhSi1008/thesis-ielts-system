'use client';

import React, { useState, useEffect } from 'react';
import { dictationApi, DictationVideo } from '@/services/dictation.api';
import { PlayCircle, Clock, Trash2, FolderPlus, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AddDictationModal from './_components/AddDictationModal';

export default function DictationMyVideosPage() {
  const [videos, setVideos] = useState<DictationVideo[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedVideos, fetchedFolders] = await Promise.all([
        dictationApi.getVideos(),
        dictationApi.getFolders(),
      ]);
      setVideos(fetchedVideos);
      setFolders(fetchedFolders);
    } catch (err) {
      console.error('Failed to load user videos data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await dictationApi.deleteVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (e) {
      alert('Failed to delete video');
    }
  };

  const handleImport = async (data: { youtubeUrl: string; title: string; folder?: string }) => {
    const newVideo = await dictationApi.importVideo(data);
    setVideos((prev) => [newVideo, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Dictation Videos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your uploaded dictation practice materials.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed dark:border-gray-700">
          <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No videos yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your first video to start practicing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative group">
                {video.status === 'PROCESSING' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="text-sm font-medium">Processing AI...</span>
                  </div>
                ) : video.imageUrl ? (
                  <img src={video.imageUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-blue-200" />
                  </div>
                )}
                
                {video.status !== 'PROCESSING' && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Link
                      href={`/shadowing-dictation/dictation/${video.id}`}
                      className="bg-primary text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90"
                    >
                      Start Practice
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2" title={video.title}>{video.title}</h3>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {video.duration}</span>
                  <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">{video.folder}</span>
                </div>

                <div className="mt-auto pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddDictationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImport}
        folders={folders}
      />
    </div>
  );
}
