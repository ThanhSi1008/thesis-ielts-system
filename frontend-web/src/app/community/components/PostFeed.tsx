import React, { useState, useEffect, useRef } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import type { Post, PostType } from '@/types';
import { postsApi } from '@/services/posts.api';
import { PostCard } from './PostCard';
import { CommentSection } from './CommentSection';

interface PostFeedProps {
  filterType?: PostType | 'ALL';
  filterTag?: string;
  filterAuthorId?: string;
  currentUserId: string | undefined;
  newPost?: Post | null;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  filterType,
  filterTag,
  filterAuthorId,
  currentUserId,
  newPost,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch initial posts when filters change
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const typeFilter = filterType === 'ALL' ? undefined : filterType;
        const res = await postsApi.listPosts({ type: typeFilter, tag: filterTag, authorId: filterAuthorId });
        setPosts(res.items);
        setNextCursor(res.nextCursor);
      } catch (error) {
        console.error('Failed to load posts', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, [filterType, filterTag, filterAuthorId]);

  // Insert new post at top when created
  useEffect(() => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
    }
  }, [newPost]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, isLoading, isLoadingMore]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const typeFilter = filterType === 'ALL' ? undefined : filterType;
      const res = await postsApi.listPosts({ cursor: nextCursor, type: typeFilter, tag: filterTag, authorId: filterAuthorId });
      setPosts(prev => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.error('Failed to load more posts', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Interactions
  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return { ...p, isLiked, likeCount: p.likeCount + (isLiked ? 1 : -1) };
      }
      return p;
    }));

    try {
      await postsApi.toggleLike(postId);
    } catch (error) {
      // Revert on error
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, isLiked: post.isLiked, likeCount: post.likeCount };
          }
          return p;
        }));
      }
    }
  };

  const handleBookmark = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isBookmarked = !p.isBookmarked;
        return { ...p, isBookmarked, bookmarkCount: p.bookmarkCount + (isBookmarked ? 1 : -1) };
      }
      return p;
    }));

    try {
      await postsApi.toggleBookmark(postId);
    } catch (error) {
      // Revert on error
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, isBookmarked: post.isBookmarked, bookmarkCount: post.bookmarkCount };
          }
          return p;
        }));
      }
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    // Optimistic delete
    setPosts(prev => prev.filter(p => p.id !== postId));
    
    try {
      await postsApi.deletePost(postId);
    } catch (error) {
      console.error('Failed to delete post', error);
      // Ideally refresh the feed here if it fails
    }
  };

  const toggleComments = (postId: string) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // State to hold fully loaded post (with comments) when comment section is open
  const [fullPosts, setFullPosts] = useState<Record<string, Post & { comments: any[] }>>({});

  useEffect(() => {
    // Load full post details (including comments) when section is opened
    Object.keys(openComments).forEach(postId => {
      if (openComments[postId] && !fullPosts[postId]) {
        fetchFullPost(postId);
      }
    });
  }, [openComments]);

  const fetchFullPost = async (postId: string) => {
    try {
      const fullPost = await postsApi.getPost(postId);
      setFullPosts(prev => ({ ...prev, [postId]: fullPost }));
      // Sync comment count just in case
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: fullPost.commentCount } : p));
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Inbox size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {filterType === 'ALL' 
            ? "It's quiet here. Be the first to share something with the community!"
            : "No posts match your current filter. Try selecting a different category."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="relative">
          <PostCard
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onDelete={handleDelete}
            onOpenComments={toggleComments}
          />
          
          {openComments[post.id] && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl p-5 -mt-6 pt-6 relative z-0">
              {fullPosts[post.id] ? (
                <CommentSection
                  postId={post.id}
                  comments={fullPosts[post.id].comments}
                  currentUserId={currentUserId}
                  onCommentAdded={() => fetchFullPost(post.id)}
                />
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-gray-400" size={20} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center">
        {isLoadingMore && <Loader2 className="animate-spin text-primary" size={24} />}
      </div>
    </div>
  );
};
