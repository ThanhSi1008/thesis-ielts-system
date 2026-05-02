import React, { useState } from 'react';
import { X, Youtube, Folder } from 'lucide-react';

interface AddShadowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { youtubeUrl: string; title: string; folder?: string }) => Promise<void>;
  folders: string[];
}

export default function AddShadowingModal({ isOpen, onClose, onImport, folders }: AddShadowingModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl || !title) return;

    setIsSubmitting(true);
    try {
      await onImport({ youtubeUrl, title, folder: folder || undefined });
      setYoutubeUrl('');
      setTitle('');
      setFolder('');
      onClose();
    } catch (error) {
      console.error('Failed to import video:', error);
      alert('Failed to import video. Please check the URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Shadowing Video</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <div className="relative">
              <Youtube className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daily English Conversation"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder (Optional)
            </label>
            <div className="relative">
              <Folder className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Select or type new folder"
                list="shadowing-folders-list"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />
              <datalist id="shadowing-folders-list">
                {folders.map(f => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            The AI will automatically transcribe the video with timestamps. This may take 1–3 minutes.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-900 bg-primary hover:opacity-90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                  Importing...
                </>
              ) : 'Import Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
