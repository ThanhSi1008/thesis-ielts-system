import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { Post, PostType } from '@/types';
import { postsApi } from '@/services/posts.api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

const AVAILABLE_TAGS = ['Listening', 'Reading', 'Writing', 'Speaking', 'Vocabulary', 'Grammar', 'Pronunciation', 'TOEIC', 'IELTS'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [type, setType] = useState<PostType>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(e.target.files).slice(0, 4 - imageUrls.length).map(file => postsApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...results.map(r => r.url)]);
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setIsSubmitting(true);
    try {
      const post = await postsApi.createPost({
        type,
        title: title.trim() || undefined,
        body: body.trim(),
        tags,
        imageUrls,
      });
      onPostCreated(post);
      // Reset state
      setType('GENERAL');
      setTitle('');
      setBody('');
      setTags([]);
      setImageUrls([]);
      onClose();
    } catch (error) {
      console.error('Create post failed', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          
          {/* Post Type Selector */}
          <div className="flex gap-2">
            {(['GENERAL', 'STUDY_TIP', 'SCORE_ACHIEVEMENT'] as PostType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  type === t 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
          />

          <textarea
            placeholder="What's on your mind? Share tips, ask questions..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Topics & Tags</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                    tags.includes(tag)
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <label 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                imageUrls.length >= 4 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
              <span className="text-sm font-semibold hidden sm:inline">Add Image</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={imageUrls.length >= 4 || isUploading}
              />
            </label>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!body.trim() || isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Post ✨'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
