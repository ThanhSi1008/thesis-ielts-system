import React, { useState, useEffect } from 'react';
import { Trash2, Reply } from 'lucide-react';
import type { Comment } from '@/types';
import { postsApi } from '@/services/posts.api';
import { timeAgo } from '@/utils/timeAgo';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId: string | undefined;
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  currentUserId,
  onCommentAdded,
}) => {
  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for optimistic updates during delete
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    setIsSubmitting(true);
    try {
      await postsApi.createComment(postId, {
        body: newCommentBody,
        parentId: replyTo?.id,
      });
      setNewCommentBody('');
      setReplyTo(null);
      onCommentAdded(); // Refresh post to get new comments
    } catch (error) {
      console.error('Failed to create comment', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    // Optimistic delete
    setLocalComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
    
    try {
      await postsApi.deleteComment(commentId);
      onCommentAdded(); // Sync with server
    } catch (error) {
      console.error('Failed to delete comment', error);
      // Revert optimistic delete on error (ideally by re-fetching)
      onCommentAdded(); 
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    return '??';
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const authorName = comment.author.firstName && comment.author.lastName 
      ? `${comment.author.firstName} ${comment.author.lastName}` 
      : 'Anonymous';

    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
        {comment.author.avatar ? (
          <img 
            src={comment.author.avatar} 
            alt={authorName} 
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {getInitials(comment.author.firstName, comment.author.lastName)}
          </div>
        )}
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-2.5 w-max max-w-full">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{authorName}</span>
              <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{comment.body}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-semibold text-gray-500">
            {!isReply && (
              <button 
                onClick={() => setReplyTo({ id: comment.id, name: authorName })}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {comment.authorId === currentUserId && (
              <button 
                onClick={() => handleDelete(comment.id)}
                className="hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Render Replies */}
          {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
      
      {/* Existing Comments */}
      <div className="mb-6 space-y-1">
        {localComments.map(comment => renderComment(comment))}
        {localComments.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        {replyTo && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-t-xl border-x border-t border-blue-100 dark:border-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Replying to {replyTo.name}</span>
            <button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="hover:text-blue-800 dark:hover:text-blue-200"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            value={newCommentBody}
            onChange={e => setNewCommentBody(e.target.value)}
            className={`flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-gray-900 dark:text-white ${replyTo ? 'rounded-b-xl rounded-tr-xl' : 'rounded-full'}`}
          />
          <button
            type="submit"
            disabled={!newCommentBody.trim() || isSubmitting}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            {isSubmitting ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
