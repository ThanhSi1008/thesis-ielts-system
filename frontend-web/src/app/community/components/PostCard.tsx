import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2, Lightbulb, Trophy } from 'lucide-react';
import type { Post } from '@/types';
import { timeAgo } from '@/utils/timeAgo';

interface PostCardProps {
  post: Post;
  currentUserId: string | undefined;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onDelete: (postId: string) => void;
  onOpenComments: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onDelete,
  onOpenComments,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    return '??';
  };

  const authorName = post.author.firstName && post.author.lastName 
    ? `${post.author.firstName} ${post.author.lastName}` 
    : 'Anonymous';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={authorName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {getInitials(post.author.firstName, post.author.lastName)}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-gray-100">{authorName}</span>
              {post.type === 'STUDY_TIP' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  <Lightbulb size={12} /> TIP
                </span>
              )}
              {post.type === 'SCORE_ACHIEVEMENT' && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  <Trophy size={12} /> ACHIEVEMENT
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {post.authorId === currentUserId && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-10">
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(post.id);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          {post.title}
        </h3>
      )}
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
        {post.body}
      </p>

      {/* Image Grid */}
      {post.imageUrls.length > 0 && (
        <div className={`mb-4 grid gap-2 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.imageUrls.slice(0, 4).map((url, index) => (
            <div key={index} className="relative aspect-video sm:aspect-square md:aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={url} 
                alt="Post attachment" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {index === 3 && post.imageUrls.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+{post.imageUrls.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Interactions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 transition-colors group ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-gray-400'}`}
        >
          <div className="p-1.5 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
            <Heart size={20} className={post.isLiked ? 'fill-current' : ''} />
          </div>
          <span className="text-sm font-medium">{post.likeCount > 0 ? post.likeCount : ''}</span>
        </button>

        <button 
          onClick={() => onOpenComments(post.id)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 transition-colors group"
        >
          <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-medium">{post.commentCount > 0 ? post.commentCount : ''}</span>
        </button>

        <div className="flex-grow" />

        <button 
          onClick={() => onBookmark(post.id)}
          className={`flex items-center gap-1.5 transition-colors group ${post.isBookmarked ? 'text-primary' : 'text-gray-500 hover:text-primary dark:text-gray-400'}`}
        >
          <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
            <Bookmark size={20} className={post.isBookmarked ? 'fill-current' : ''} />
          </div>
        </button>
      </div>
    </div>
  );
};
