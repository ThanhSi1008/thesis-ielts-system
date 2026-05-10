'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostFeed } from './components/PostFeed';
import { CreatePostModal } from './components/CreatePostModal';
import Leaderboard from './components/Leaderboard';
import { PenSquare, Layers, Lightbulb, Trophy, Image as ImageIcon, Smile, BarChart2, Calendar, MapPin } from 'lucide-react';
import type { PostType, Post } from '@/types';

function CommunityContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'all';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<Post | null>(null);

  let filterType: PostType | 'ALL' | 'LEADERBOARD' = 'ALL';
  if (tab === 'study-tips') filterType = 'STUDY_TIP';
  if (tab === 'achievements') filterType = 'SCORE_ACHIEVEMENT';
  if (tab === 'leaderboard') filterType = 'LEADERBOARD';

  const filterAuthorId = tab === 'my-posts' ? user?.id : undefined;

  return (
    <main className="min-h-full pt-4 px-4">
      <div className="">

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

          {/* Feed Filters */}
          {(!tab || tab === 'all' || tab === 'study-tips' || tab === 'achievements') ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto mb-6">
              {[
                { id: 'all', label: 'All Posts', icon: <Layers size={16} /> },
                { id: 'study-tips', label: 'Study Tips', icon: <Lightbulb size={16} /> },
                { id: 'achievements', label: 'Achievements', icon: <Trophy size={16} /> },
              ].map(filter => {
                const isActive = tab === filter.id || (!tab && filter.id === 'all');
                return (
                  <button
                    key={filter.id}
                    onClick={() => router.push(filter.id === 'all' ? '/community' : `/community?tab=${filter.id}`)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        {/* X.com style inline create post trigger */}
        {isAuthenticated && tab !== 'leaderboard' && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white dark:bg-[#15181c] border-b border-gray-100 dark:border-gray-800 p-4 mb-6 cursor-text transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1a1d21] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 pt-1">
                {/* Fake Input */}
                <div className="w-full text-lg text-gray-500 dark:text-gray-400 mb-3 bg-transparent outline-none pointer-events-none">
                  What's happening?
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex gap-1 text-primary -ml-2">
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><ImageIcon size={18} /></button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors hidden sm:block"><BarChart2 size={18} /></button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Smile size={18} /></button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors hidden sm:block"><Calendar size={18} /></button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors"><MapPin size={18} /></button>
                  </div>

                  <button
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-1.5 px-4 rounded-full text-sm transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {filterType === 'LEADERBOARD' ? (
          <Leaderboard currentUserId={user?.id} />
        ) : (
          <PostFeed
            filterType={filterType}
            filterAuthorId={filterAuthorId}
            currentUserId={user?.id}
            newPost={newPost}
          />
        )}

      </div>

      {/* Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={(post) => {
          setNewPost(post);
          if (tab !== 'all' && tab !== 'study-tips' && tab !== 'achievements') {
            router.push('/community');
          }
        }}
      />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <CommunityContent />
    </Suspense>
  )
}
